'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Perkalian & Pembagian Bilangan Bulat dalam Masalah
   Kontekstual — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildDlPanel,
       buildDlNextButton, buildFeedbackBox, ensureShuffledOrder,
       ensureSortStates, orderByIds;
     • seksi 18 (perkalian & pembagian): buildRepeatedAddJumps,
       fmtPenjumlahanBerulang, buildSignRuleGrid / bindSignRuleGrid,
       buildExprSteps / bindExprSteps, diagnosaKaliBagiBulat;
     • seksi 29: makeCekStep / buildCekStep / bindCekStep — langkah
       isian berpemeriksa; jenis 'hitung' dengan op × atau : memakai
       diagnosaKaliBagiBulat;
     • seksi 61 (Think-Pair-Share): buildTpsBanner, ensureTpsStates,
       buildTpsQuestion / bindTpsQuestion, tpsSemuaSelesai,
       pilihJuruBicara, buildTpsShareCard.

   Alur tahap mengikuti fase Think-Pair-Share; lihat komentar kepala
   pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (pertanyaan TPS, tabel aturan
   tanda, bank kesimpulan, opsi uji mandiri, penilaian diri & pasangan)
   DIACAK dengan shuffleArray() melalui ensureTpsStates() /
   ensureShuffledOrder() / ensureSortStates(). Pengacakan dilakukan
   SEKALI saat state disiapkan (initExerciseArrays) lalu urutannya
   disimpan di State — bukan saat render — sehingga pilihan tidak
   melompat saat dirender ulang, tetapi teracak ulang untuk setiap murid
   dan setiap Reset. Soal uji mandiri juga dipilih acak dari bank.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Tujuan & Pasangan      (persiapan)
    6. Stage: Pikir — Perkalian      (Think)
    7. Stage: Berpasangan — Pola     (Pair)
    8. Stage: Pembagian              (Think → Pair)
    9. Stage: Berbagi                (Share)
   10. Stage: Masalah Kontekstual    (Think → Pair → Share)
   11. Stage: Operasi Campuran       (Pair)
   12. Stage: Uji Mandiri
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Router Render
   16. Helper UI (modal reset)
   17. Init
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
var STORAGE_KEY = 'mpi-d-2-2-kali-bagi-bulat-v1';

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'tujuan',
  completedStages: {},

  /* Tahap 1 — tujuan & pasangan */
  namaSaya: '',
  namaPasangan: '',
  apersepsiSteps: [],

  /* Tahap 2 — pikir: perkalian */
  pikirSteps: [],
  tandaKali: {},
  tandaKaliOrder: null,
  pikirAlasan: '',

  /* Tahap 3 — berpasangan: pola */
  polaSteps: [],
  pasangTps: {},

  /* Tahap 4 — pembagian */
  bagiSteps: [],
  tandaBagi: {},
  tandaBagiOrder: null,
  tandaBagiCek: false,
  bagiTps: {},

  /* Tahap 5 — berbagi */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,
  juruBicara: '',
  sudahBerbagi: false,

  /* Tahap 6 — masalah kontekstual */
  masalahTps: {},
  masalahSteps: [],

  /* Tahap 7 — operasi campuran */
  campuranSteps: {},
  campuranTps: {},

  /* Tahap 8 — uji mandiri */
  latihanPick: null,
  latihanIdx: 0,
  latihanExercises: [],

  /* Tahap 9 — refleksi */
  refleksiAnswers: {},
  refleksiDiri: null,
  refleksiDiriOrder: null,
  refleksiPasangan: null,
  refleksiPasanganOrder: null,
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

/* Pertanyaan TPS pemodelan pada tahap masalah kontekstual. */
function masalahModelList() {
  return DATA.masalah.soal.map(function (s) {
    return s.model;
  });
}

/* Baris tabel pola yang harus dilengkapi murid. */
function polaIsian() {
  return DATA.pasang.polaBaris.filter(function (r) {
    return !r.tampil;
  });
}

/* Langkah isian operasi campuran: satu array state per soal. */
function ensureCampuranSteps() {
  var map = ensureMap('campuranSteps');
  DATA.campuran.soal.forEach(function (s) {
    ensureExerciseArray(map, s.id, s.langkah, makeDlStep);
  });
}

/*
 * Soal uji mandiri yang sedang dipakai. Array ini DIISI ULANG di tempat
 * (bukan diganti) karena createExerciseStage menyimpan referensinya.
 */
var LATIHAN_SOAL = [];

/* Memilih soal acak dari bank sesuai komposisi, lalu mengacak urutannya. */
function pilihSoalLatihan() {
  var L = DATA.latihan;
  var ids = [];
  Object.keys(L.komposisi).forEach(function (k) {
    var kelompok = L.soal.filter(function (s) {
      return s.type === k;
    });
    shuffleArray(kelompok)
      .slice(0, L.komposisi[k])
      .forEach(function (s) {
        ids.push(s.id);
      });
  });
  return shuffleArray(ids);
}

function latihanPickValid() {
  var pick = State.latihanPick;
  if (!Array.isArray(pick) || pick.length !== DATA.latihan.banyak) return false;
  var ada = optionIds(DATA.latihan.soal);
  return pick.every(function (id, i) {
    return ada.indexOf(id) !== -1 && pick.indexOf(id) === i;
  });
}

function isiLatihanSoal() {
  var byId = {};
  DATA.latihan.soal.forEach(function (s) {
    byId[s.id] = s;
  });
  LATIHAN_SOAL.length = 0;
  State.latihanPick.forEach(function (id) {
    LATIHAN_SOAL.push(byId[id]);
  });
}

/*
 * Menyiapkan seluruh state per-langkah DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureExerciseArray(State, 'apersepsiSteps', [DATA.tujuan.apersepsi], makeCekStep);

  /* Tahap 2 */
  ensureExerciseArray(State, 'pikirSteps', DATA.pikir.hitung, makeCekStep);
  ensureSortStates(State, 'tandaKali', 'tandaKaliOrder', DATA.pikir.tandaSel, DATA.tanda);

  /* Tahap 3 */
  ensureExerciseArray(State, 'polaSteps', polaIsian(), makeCekStep);
  ensureTpsStates(State, 'pasangTps', DATA.pasang.tpsSoal);

  /* Tahap 4 */
  ensureExerciseArray(State, 'bagiSteps', DATA.bagi.hitung, makeCekStep);
  ensureSortStates(State, 'tandaBagi', 'tandaBagiOrder', DATA.bagi.tandaSel, DATA.tanda);
  ensureTpsStates(State, 'bagiTps', DATA.bagi.tpsSoal);

  /* Tahap 5 */
  ensureShuffledOrder(State, 'bankOrder', DATA.berbagi.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 6 */
  ensureTpsStates(State, 'masalahTps', masalahModelList());
  ensureExerciseArray(State, 'masalahSteps', DATA.masalah.soal, makeCekStep);

  /* Tahap 7 */
  ensureCampuranSteps();
  ensureTpsStates(State, 'campuranTps', DATA.campuran.tpsSoal);

  /* Tahap 8 — soal dipilih acak dari bank; opsi tiap soal diacak */
  if (!latihanPickValid()) {
    State.latihanPick = pilihSoalLatihan();
    State.latihanExercises = [];
    State.latihanIdx = 0;
  }
  isiLatihanSoal();
  ensureExerciseArray(State, 'latihanExercises', LATIHAN_SOAL, function (s) {
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
  if (State.latihanIdx >= LATIHAN_SOAL.length || State.latihanIdx < 0) {
    State.latihanIdx = 0;
  }

  /* Tahap 9 */
  ensureMap('refleksiAnswers');
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
  ensureShuffledOrder(State, 'refleksiPasanganOrder', DATA.refleksi.pasanganOpsi);
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

/* Kepala tahap + catatan peran guru + bilah fase TPS (bila ada). */
function buildHead(D) {
  return (
    buildDiscoveryHead(D.kicker, D.goal, D.syntax) +
    buildTeacherNote(D.guru) +
    (D.tps ? buildTpsBanner(D.tps, { pesan: D.pesan }) : '')
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

function buildTemuanPanel(items) {
  return buildDlPanel(
    '<h3 style="margin-top:0;">💡 Temuan kalian</h3>' +
      '<ul class="kb-temuan">' +
      items
        .map(function (t) {
          return '<li>' + t + '</li>';
        })
        .join('') +
      '</ul>',
    'panel--hero'
  );
}

/* Label konteks: ikon + nama (Suhu, Kedalaman, Keuangan, Skor). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="kb-konteks kb-konteks--' +
    konteks +
    '"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(K.nama) +
    '</span>'
  );
}

/* Kartu cerita pembuka { ikon, judul, teks }. */
function buildCerita(c) {
  return (
    '<div class="kb-cerita">' +
    '<span class="kb-cerita__ikon" aria-hidden="true">' +
    c.ikon +
    '</span>' +
    '<div><p class="kb-cerita__judul">' +
    esc(c.judul) +
    '</p><p class="kb-cerita__teks">' +
    esc(c.teks) +
    '</p></div>' +
    '</div>'
  );
}

/* Langkah isian hasil operasi untuk data { a, op, b, jawab, label, hints }. */
function hitungStep(item) {
  return {
    jenis: 'hitung',
    a: item.a,
    op: item.op,
    b: item.b,
    jawab: item.jawab,
    label: esc(item.label),
    hints: item.hints,
    placeholder: 'mis. −6',
  };
}

function semuaCekSelesai(steps) {
  return steps.every(function (s) {
    return s.done;
  });
}

/* Daftar langkah isian berpemeriksa; idPrefix + indeks menjadi id DOM. */
function buildHitungList(idPrefix, items, steps, stepOf) {
  return items
    .map(function (it, i) {
      return buildCekStep(idPrefix + i, steps[i], stepOf(it), i + 1);
    })
    .join('');
}

function bindHitungList(idPrefix, items, steps, stepOf, rerender) {
  items.forEach(function (it, i) {
    bindCekStep(idPrefix + i, steps[i], stepOf(it), saveState, rerender);
  });
}

/* Opsi nama untuk pertanyaan TPS. */
function namaOpts(num) {
  return { namaSaya: State.namaSaya, namaPasangan: State.namaPasangan, num: num };
}

/* Daftar pertanyaan TPS; setiap pertanyaan baru terbuka setelah yang
   sebelumnya disepakati dengan tepat. */
function buildTpsList(list, states) {
  var html = '';
  for (var i = 0; i < list.length; i++) {
    var q = list[i];
    html += buildTpsQuestion('tq-' + q.id, q, states[q.id], namaOpts(i + 1));
    if (tpsTahap(q, states[q.id]) !== 'selesai') break;
  }
  return html;
}

function bindTpsList(root, list, states, rerender) {
  list.forEach(function (q) {
    bindTpsQuestion(root, 'tq-' + q.id, q, states[q.id], saveState, rerender);
  });
}

/* Sel tabel aturan tanda + contoh kalimatnya, mis. "(−3) × (−2)". */
function selDenganContoh(cells, op) {
  return cells.map(function (c) {
    return Object.assign({}, c, { contoh: fmtOperasiBulat(c.a, op, c.b) });
  });
}

/* Memilih juru bicara acak; bila sudah ada, pilih anggota LAIN. */
function acakJuruBicara() {
  var anggota = [State.namaSaya, State.namaPasangan];
  var lain = anggota.filter(function (n) {
    return String(n || '').trim() && String(n).trim() !== State.juruBicara;
  });
  State.juruBicara = pilihJuruBicara(lain.length ? lain : anggota);
}

/* Pusatkan garis bilangan di layar sempit. */
function afterRender(container) {
  centerNumberLines(container);
}

/* ============================================================
   5. STAGE: TUJUAN & PASANGAN  (persiapan)
   ============================================================ */

function apersepsiStep() {
  var A = DATA.tujuan.apersepsi;
  return {
    jenis: 'tulis',
    jawab: A.jawab,
    label: esc(A.label),
    hints: A.hints,
    temuan: A.temuan,
    placeholder: 'mis. −6',
  };
}

function renderTujuan(container) {
  var D = DATA.tujuan;
  var rerender = function () {
    renderTujuan(container);
  };

  container.innerHTML =
    '<section aria-label="Tujuan & Pasangan">' +
    buildHead(D) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔁 Pemanasan</h3>' +
        buildCekStep('ap0', State.apersepsiSteps[0], apersepsiStep(), null)
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👥 Pasangan belajarku</h3>' +
        '<div class="kb-nama">' +
        '<div class="field-group">' +
        '<label for="namaSaya">' +
        esc(D.namaSayaLabel) +
        '</label>' +
        '<input type="text" class="input-text" id="namaSaya" autocomplete="off" maxlength="40" value="' +
        esc(State.namaSaya) +
        '">' +
        '</div>' +
        '<div class="field-group">' +
        '<label for="namaPasangan">' +
        esc(D.namaPasanganLabel) +
        '</label>' +
        '<input type="text" class="input-text" id="namaPasangan" autocomplete="off" maxlength="60" value="' +
        esc(State.namaPasangan) +
        '">' +
        '</div>' +
        '</div>' +
        '<h4 class="kb-subjudul">Aturan main Think-Pair-Share</h4>' +
        '<ol class="objectives-list">' +
        D.aturan
          .map(function (a, i) {
            return (
              '<li><span class="objectives-list__num">' +
              (i + 1) +
              '</span><span>' +
              a +
              '</span></li>'
            );
          })
          .join('') +
        '</ol>'
    ) +
    buildDlNextButton('tujuanNextBtn', D.nextLabel, true) +
    '</section>';

  bindCekStep('ap0', State.apersepsiSteps[0], apersepsiStep(), saveState, rerender);

  ['namaSaya', 'namaPasangan'].forEach(function (key) {
    var inp = document.getElementById(key);
    inp.addEventListener('input', function () {
      State[key] = inp.value;
      saveState();
    });
  });

  document.getElementById('tujuanNextBtn').addEventListener('click', function () {
    if (!State.apersepsiSteps[0].done) {
      showNotice('Selesaikan dulu soal pemanasan.');
      return;
    }
    if (!State.namaSaya.trim() || !State.namaPasangan.trim()) {
      showNotice('Tulis namamu dan nama pasanganmu terlebih dahulu.');
      return;
    }
    if (!State.juruBicara) acakJuruBicara();
    completeStage('tujuan');
    navigateTo('pikir');
  });
}

/* ============================================================
   6. STAGE: PIKIR — PERKALIAN  (Think)
   Murid bekerja SENDIRI: perkalian sebagai penjumlahan berulang
   (isian berdiagnosa) dan tebakan tanda yang tidak dinilai. Setelah
   tahap ini selesai, tebakan dikunci (ditampilkan dalam mode banding).
   ============================================================ */

function renderPikir(container) {
  var D = DATA.pikir;
  var g = D.garis;
  var hitungSelesai = semuaCekSelesai(State.pikirSteps);
  var terkunci = !!State.completedStages.pikir;
  var sel = selDenganContoh(D.tandaSel, '×');
  var rerender = function () {
    renderPikir(container);
  };

  container.innerHTML =
    '<section aria-label="Pikir: Perkalian">' +
    buildHead(D) +
    buildDlPanel(
      buildCerita(D.cerita) +
        '<p class="dl-caption">' +
        esc(fmtOperasiBulat(g.n, '×', g.b)) +
        ' = ' +
        esc(fmtPenjumlahanBerulang(g.n, g.b)) +
        '</p>' +
        buildRepeatedAddJumps('pkGaris', g.n, g.b, {
          min: g.min,
          max: g.max,
          showEnd: State.pikirSteps[0].done,
        }),
      'panel--hero'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">✏️ Hitung sendiri</h3>' +
        buildHitungList('pk', D.hitung, State.pikirSteps, hitungStep)
    ) +
    (hitungSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.tandaJudul) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(
              terkunci ? 'Tebakanmu sudah dikunci dan dibandingkan dengan data.' : D.tandaInstruksi
            ) +
            '</p>' +
            buildSignRuleGrid('pkTanda', sel, State.tandaKali, {
              options: DATA.tanda,
              mode: terkunci ? 'banding' : 'pilih',
              dugaanLabel: DATA.pasang.bandingDugaan,
              dataLabel: DATA.pasang.bandingData,
            }) +
            '<div class="field-group" style="margin-top:var(--space-4);">' +
            '<label for="pikirAlasan">' +
            esc(D.alasanLabel) +
            '</label>' +
            '<textarea id="pikirAlasan" class="input-textarea" placeholder="' +
            esc(D.alasanPlaceholder) +
            '">' +
            esc(State.pikirAlasan) +
            '</textarea>' +
            '</div>'
        ) + buildDlNextButton('pikirNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindHitungList('pk', D.hitung, State.pikirSteps, hitungStep, rerender);
  if (!terkunci) bindSignRuleGrid(container, 'pkTanda', sel, State.tandaKali, saveState, rerender);

  var ta = document.getElementById('pikirAlasan');
  if (ta) {
    ta.addEventListener('input', function () {
      State.pikirAlasan = ta.value;
      saveState();
    });
  }

  var next = document.getElementById('pikirNextBtn');
  if (next) {
    next.addEventListener('click', function () {
      if (!signGridAllChosen(sel, State.tandaKali)) {
        showNotice('Tebak tanda untuk keempat baris terlebih dahulu.');
        return;
      }
      if (!State.pikirAlasan.trim()) {
        showNotice('Tulis alasan tebakanmu, walau hanya satu kalimat.');
        return;
      }
      completeStage('pikir');
      navigateTo('pasang');
    });
  }
  afterRender(container);
}

/* ============================================================
   7. STAGE: BERPASANGAN — POLA PERKALIAN  (Pair)
   Tabel pola diisi berdua → pertanyaan TPS → tebakan tanda dari fase
   Pikir dibandingkan dengan data.
   ============================================================ */

function polaStep(r) {
  return {
    jenis: 'hitung',
    a: r.a,
    op: '×',
    b: r.b,
    jawab: r.jawab,
    label: esc(fmtOperasiBulat(r.a, '×', r.b)) + ' = …',
    hints: DATA.pasang.polaHints,
    placeholder: 'mis. 2',
  };
}

function buildTabelPola() {
  var isian = polaIsian();
  return (
    '<div class="table-scroll">' +
    '<table class="data-table kb-pola-table">' +
    '<thead><tr><th scope="col">Perkalian</th><th scope="col">Hasil</th></tr></thead>' +
    '<tbody>' +
    DATA.pasang.polaBaris
      .map(function (r) {
        var k = isian.indexOf(r);
        var terisi = r.tampil || State.polaSteps[k].done;
        return (
          '<tr class="' +
          (r.tampil ? '' : 'kb-pola-table__baru') +
          '"><td class="kb-num">' +
          esc(fmtOperasiBulat(r.a, '×', r.b)) +
          '</td><td class="kb-num">' +
          (terisi ? esc(fmtBulat(r.jawab)) : '?') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table>' +
    '</div>'
  );
}

function renderPasang(container) {
  var D = DATA.pasang;
  var isian = polaIsian();
  var polaSelesai = semuaCekSelesai(State.polaSteps);
  var tpsSelesai = polaSelesai && tpsSemuaSelesai(D.tpsSoal, State.pasangTps);
  var sel = selDenganContoh(DATA.pikir.tandaSel, '×');
  var cocok = signGridMatchCount(sel, State.tandaKali);
  var rerender = function () {
    renderPasang(container);
  };

  container.innerHTML =
    '<section aria-label="Berpasangan: Pola Perkalian">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.polaJudul) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.polaInstruksi) +
        '</p>' +
        '<div class="kb-pola">' +
        buildTabelPola() +
        '<div class="kb-pola__isian">' +
        buildHitungList('pl', isian, State.polaSteps, polaStep) +
        '</div>' +
        '</div>'
    ) +
    (polaSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.tpsJudul) +
            '</h3>' +
            buildTpsList(D.tpsSoal, State.pasangTps)
        )
      : '') +
    (tpsSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.bandingJudul) +
            '</h3>' +
            buildSignRuleGrid('psTanda', sel, State.tandaKali, {
              options: DATA.tanda,
              mode: 'banding',
              dugaanLabel: D.bandingDugaan,
              dataLabel: D.bandingData,
            }) +
            '<p class="dl-caption" style="margin-top:var(--space-3);">' +
            cocok +
            ' dari ' +
            sel.length +
            ' tebakanmu cocok. Tebakan yang meleset bukan kesalahan — justru itulah yang baru saja kalian temukan bersama!</p>'
        ) +
        buildTemuanPanel(D.temuan) +
        buildDlNextButton('pasangNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindHitungList('pl', isian, State.polaSteps, polaStep, rerender);
  if (polaSelesai) bindTpsList(container, D.tpsSoal, State.pasangTps, rerender);
  bindNext('pasangNextBtn', 'pasang', 'bagi');
}

/* ============================================================
   8. STAGE: PEMBAGIAN  (Think → Pair)
   A. isian individu (pembagian sebagai kebalikan perkalian);
   B. tabel tanda pembagian disepakati berdua lalu diperiksa;
   C. pertanyaan TPS (alasan tanda, nol, pembagian oleh nol).
   ============================================================ */

function renderBagi(container) {
  var D = DATA.bagi;
  var sel = selDenganContoh(D.tandaSel, ':');
  var hitungSelesai = semuaCekSelesai(State.bagiSteps);
  var tabelBenar = State.tandaBagiCek && signGridMatchCount(sel, State.tandaBagi) === sel.length;
  var tpsSelesai = tabelBenar && tpsSemuaSelesai(D.tpsSoal, State.bagiTps);
  var rerender = function () {
    renderBagi(container);
  };

  var tabelHTML = '';
  if (hitungSelesai) {
    var tombol;
    if (!State.tandaBagiCek) {
      tombol =
        '<button type="button" class="btn btn--primary" id="bagiCekBtn"' +
        (signGridAllChosen(sel, State.tandaBagi) ? '' : ' disabled') +
        '>' +
        esc(D.tandaCekLabel) +
        '</button>';
    } else if (!tabelBenar) {
      tombol =
        '<button type="button" class="btn btn--ghost" id="bagiUbahBtn">Perbaiki pilihan</button>';
    } else {
      tombol = '';
    }
    tabelHTML = buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.tandaJudul) +
        '</h3>' +
        '<p class="dl-caption">' +
        esc(D.tandaInstruksi) +
        '</p>' +
        buildSignRuleGrid('bgTanda', sel, State.tandaBagi, {
          options: DATA.tanda,
          mode: State.tandaBagiCek ? 'banding' : 'pilih',
          dugaanLabel: 'Pilihan kalian',
          dataLabel: 'Hasil isian A',
        }) +
        (State.tandaBagiCek && !tabelBenar
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'warning',
              '💭',
              'Ada baris yang belum cocok. Lihat lagi hasil isian A untuk baris itu, lalu perbaiki pilihan kalian.'
            ) +
            '</div>'
          : '') +
        (tombol ? '<div class="btn-group btn-group--end">' + tombol + '</div>' : '')
    );
  }

  container.innerHTML =
    '<section aria-label="Pembagian">' +
    buildHead(D) +
    buildDlPanel(buildCerita(D.cerita), 'panel--hero') +
    buildDlPanel(
      '<h3 style="margin-top:0;">' +
        esc(D.hitungJudul) +
        '</h3>' +
        buildHitungList('bg', D.hitung, State.bagiSteps, hitungStep)
    ) +
    tabelHTML +
    (tabelBenar
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.tpsJudul) +
            '</h3>' +
            buildTpsList(D.tpsSoal, State.bagiTps)
        )
      : '') +
    (tpsSelesai ? buildTemuanPanel(D.temuan) + buildDlNextButton('bagiNextBtn', D.nextLabel) : '') +
    '</section>';

  bindHitungList('bg', D.hitung, State.bagiSteps, hitungStep, rerender);
  if (hitungSelesai && !State.tandaBagiCek) {
    bindSignRuleGrid(container, 'bgTanda', sel, State.tandaBagi, saveState, rerender);
  }

  var cek = document.getElementById('bagiCekBtn');
  if (cek) {
    cek.addEventListener('click', function () {
      State.tandaBagiCek = true;
      saveState();
      rerender();
    });
  }
  var ubah = document.getElementById('bagiUbahBtn');
  if (ubah) {
    ubah.addEventListener('click', function () {
      State.tandaBagiCek = false;
      saveState();
      rerender();
    });
  }
  if (tabelBenar) bindTpsList(container, D.tpsSoal, State.bagiTps, rerender);
  bindNext('bagiNextBtn', 'bagi', 'berbagi');
}

/* ============================================================
   9. STAGE: BERBAGI  (Share)
   Kesimpulan dari bank kalimat acak → rangkuman → juru bicara acak
   berbagi ke kelas.
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.berbagi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function renderBerbagi(container) {
  var D = DATA.berbagi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
  var diperiksa = State.simpulanChecked;
  var rerender = function () {
    renderBerbagi(container);
  };

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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali tabel pola dan tabel tanda kalian.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Berbagi">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulan kalian lengkap dan tepat.</strong> Sekarang saatnya berbagi ke kelas!'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Rangkuman Aturan Tanda</h3>' +
            '<ul class="kb-rangkuman">' +
            D.rangkuman
              .map(function (r) {
                return '<li>' + esc(r) + '</li>';
              })
              .join('') +
            '</ul>',
          'panel--hero'
        ) +
        buildTpsShareCard('bgShare', {
          juruBicara: State.juruBicara,
          pemantik: D.pemantik.map(esc),
          sudah: State.sudahBerbagi,
        }) +
        (State.sudahBerbagi ? buildDlNextButton('berbagiNextBtn', D.nextLabel, true) : '')
      : '') +
    '</section>';

  container.querySelectorAll('[data-simp]').forEach(function (s) {
    s.addEventListener('change', function () {
      State.simpulanPilihan[s.dataset.simp] = s.value;
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

  var acak = document.getElementById('bgShareAcak');
  if (acak) {
    acak.addEventListener('click', function () {
      acakJuruBicara();
      saveState();
      rerender();
    });
  }
  var sudah = document.getElementById('bgShareSudah');
  if (sudah) {
    sudah.addEventListener('click', function () {
      State.sudahBerbagi = true;
      saveState();
      rerender();
    });
  }
  bindNext('berbagiNextBtn', 'berbagi', 'masalah');
}

/* ============================================================
   10. STAGE: MASALAH KONTEKSTUAL  (Think → Pair → Share)
   Setiap masalah: pilih kalimat matematika lewat TPS → hitung
   (isian berdiagnosa) → tafsiran. Masalah berikutnya terbuka setelah
   masalah sebelumnya selesai.
   ============================================================ */

function masalahStep(s) {
  return {
    jenis: 'hitung',
    a: s.a,
    op: s.op,
    b: s.b,
    jawab: s.jawab,
    label: 'Hitung: ' + esc(fmtOperasiBulat(s.a, s.op, s.b)) + ' = …',
    hints: s.hints,
    temuan: s.temuan,
    satuan: s.satuan,
    placeholder: 'mis. −6',
  };
}

function masalahSelesai(s, i) {
  return (
    tpsTahap(s.model, State.masalahTps[s.model.id]) === 'selesai' && State.masalahSteps[i].done
  );
}

function renderMasalah(container) {
  var D = DATA.masalah;
  var rerender = function () {
    renderMasalah(container);
  };
  var terbuka = [];
  for (var i = 0; i < D.soal.length; i++) {
    terbuka.push(i);
    if (!masalahSelesai(D.soal[i], i)) break;
  }
  var semua = D.soal.every(masalahSelesai);

  var kartu = terbuka
    .map(function (i) {
      var s = D.soal[i];
      var modelOk = tpsTahap(s.model, State.masalahTps[s.model.id]) === 'selesai';
      return (
        '<article class="kb-masalah' +
        (masalahSelesai(s, i) ? ' is-done' : '') +
        '">' +
        '<header class="kb-masalah__head"><span class="kb-masalah__no">Masalah ' +
        (i + 1) +
        '</span>' +
        buildKonteksTag(s.konteks) +
        '</header>' +
        '<p class="kb-masalah__cerita">' +
        esc(s.cerita) +
        '</p>' +
        '<p class="kb-masalah__tanya"><strong>' +
        esc(s.pertanyaan) +
        '</strong></p>' +
        buildTpsQuestion('tq-' + s.model.id, s.model, State.masalahTps[s.model.id], namaOpts()) +
        (modelOk ? buildCekStep('ms' + i, State.masalahSteps[i], masalahStep(s), null) : '') +
        '</article>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Masalah Kontekstual">' +
    buildHead(D) +
    '<p class="kb-progres">' +
    D.soal.filter(masalahSelesai).length +
    ' dari ' +
    D.soal.length +
    ' masalah selesai</p>' +
    kartu +
    (semua
      ? buildDlPanel(
          buildFeedbackBox(
            'info',
            '📢',
            '<strong>' +
              esc(State.juruBicara || 'Juru bicara') +
              '</strong>, pilih satu masalah dan jelaskan ke kelas: kalimat matematikanya, hasilnya, dan <em>arti tanda hasil itu</em> dalam cerita.'
          )
        ) + buildDlNextButton('masalahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  terbuka.forEach(function (i) {
    var s = D.soal[i];
    bindTpsQuestion(
      container,
      'tq-' + s.model.id,
      s.model,
      State.masalahTps[s.model.id],
      saveState,
      rerender
    );
    bindCekStep('ms' + i, State.masalahSteps[i], masalahStep(s), saveState, rerender);
  });
  bindNext('masalahNextBtn', 'masalah', 'campuran');
}

/* ============================================================
   11. STAGE: OPERASI CAMPURAN  (Pair)
   ============================================================ */

function renderCampuran(container) {
  var D = DATA.campuran;
  var rerender = function () {
    renderCampuran(container);
  };
  var terbuka = [];
  for (var i = 0; i < D.soal.length; i++) {
    terbuka.push(i);
    if (!exprStepsDone(State.campuranSteps[D.soal[i].id])) break;
  }
  var soalSelesai = D.soal.every(function (s) {
    return exprStepsDone(State.campuranSteps[s.id]);
  });
  var tpsSelesai = soalSelesai && tpsSemuaSelesai(D.tpsSoal, State.campuranTps);

  container.innerHTML =
    '<section aria-label="Operasi Campuran">' +
    buildHead(D) +
    terbuka
      .map(function (i) {
        var s = D.soal[i];
        var done = exprStepsDone(State.campuranSteps[s.id]);
        return (
          '<article class="kb-masalah' +
          (done ? ' is-done' : '') +
          '">' +
          '<header class="kb-masalah__head"><span class="kb-masalah__no">' +
          esc(s.judul) +
          '</span>' +
          buildKonteksTag(s.konteks) +
          '</header>' +
          '<p class="kb-masalah__cerita">' +
          esc(s.cerita) +
          '</p>' +
          buildExprSteps('cp' + i, s, State.campuranSteps[s.id]) +
          (done
            ? '<div style="margin-top:var(--space-3);">' +
              buildFeedbackBox('success', '✓', esc(s.tafsir)) +
              '</div>'
            : '') +
          '</article>'
        );
      })
      .join('') +
    (soalSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.tpsJudul) +
            '</h3>' +
            buildTpsList(D.tpsSoal, State.campuranTps)
        )
      : '') +
    (tpsSelesai ? buildDlNextButton('campuranNextBtn', D.nextLabel) : '') +
    '</section>';

  terbuka.forEach(function (i) {
    var s = D.soal[i];
    bindExprSteps('cp' + i, s, State.campuranSteps[s.id], saveState, rerender);
  });
  if (soalSelesai) bindTpsList(container, D.tpsSoal, State.campuranTps, rerender);
  bindNext('campuranNextBtn', 'campuran', 'latihan');
}

/* ============================================================
   12. STAGE: UJI MANDIRI
   createExerciseStage (shared/engine.js) dengan soal LATIHAN_SOAL yang
   dipilih acak. Isian diperiksa diagnosaKaliBagiBulat sehingga pesan
   salahnya berupa diagnosa miskonsepsi.
   ============================================================ */

function periksaIsianLatihan(value, s) {
  return diagnosaKaliBagiBulat(value, s.a, s.op, s.b);
}

var LatihanStage = createExerciseStage({
  soal: LATIHAN_SOAL,
  getExercises: function () {
    return State.latihanExercises;
  },
  getIndex: function () {
    return State.latihanIdx;
  },
  setIndex: function (i) {
    State.latihanIdx = i;
  },
  save: saveState,
  idPrefix: 'lt',
  sectionLabel: 'Uji Mandiri',
  kicker: DATA.latihan.kicker,
  goal: DATA.latihan.goal,
  instruction: DATA.latihan.instruksi,
  buildHead: function () {
    return buildHead(DATA.latihan);
  },
  nextStageId: 'refleksi',
  completeStageId: 'latihan',
  nextButtonLabel: DATA.latihan.nextLabel,
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'mis. −6',
  allowNegative: true,
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  /* Teks mentah diteruskan; pemeriksaan & diagnosa ada di isCorrect. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaIsianLatihan(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' + esc(ex.userInput) + '</strong> — ' + periksaIsianLatihan(ex.userInput, s).pesan
    );
  },
  revealText: function (s) {
    return esc(s.reveal) + ' ' + esc(s.explanation);
  },
  renderPrompt: function (s) {
    return (
      '<div class="dl-prompt">' +
      '<span class="bbk-soal-tag">' +
      buildKonteksTag(s.konteks) +
      (s.type === 'choice' ? ' · Pilihan ganda' : ' · ✏️ Isian') +
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

function renderLatihan(container) {
  LatihanStage.render(container);
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

/* Seluruh pasangan (pertanyaan TPS, state) untuk rekap. */
function semuaTps() {
  var out = [];
  [
    [DATA.pasang.tpsSoal, State.pasangTps],
    [DATA.bagi.tpsSoal, State.bagiTps],
    [masalahModelList(), State.masalahTps],
    [DATA.campuran.tpsSoal, State.campuranTps],
  ].forEach(function (p) {
    p[0].forEach(function (q) {
      out.push({ q: q, st: p[1][q.id] });
    });
  });
  return out;
}

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var individu = State.pikirSteps.concat(State.bagiSteps);
  var sekali = individu.filter(function (s) {
    return s.done && s.attempts === 1;
  }).length;
  var tps = semuaTps();
  var pikirTepat = tps.filter(function (t) {
    return t.st.pilih === t.q.correct;
  }).length;
  var sepakatSekali = tps.filter(function (t) {
    return t.st.sepakat === t.q.correct && t.st.cobaSepakat === 1;
  }).length;
  var benarLatihan = State.latihanExercises.filter(function (e) {
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

  function pilihan(label, opsi, order, chosen, attr) {
    return (
      '<p class="exercise-label">' +
      esc(label) +
      '</p>' +
      buildChoiceGroup(opsi, order, { chosen: chosen, attr: attr })
    );
  }

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartu(sekali + '/' + individu.length, 'Isian Pikir tepat pada percobaan pertama') +
        kartu(pikirTepat + '/' + tps.length, 'Jawaban sendiri sudah tepat sebelum diskusi') +
        kartu(sepakatSekali + '/' + tps.length, 'Kesepakatan tepat pada percobaan pertama') +
        kartu(benarLatihan + '/' + LATIHAN_SOAL.length, 'Uji mandiri benar') +
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
      pilihan(D.diriLabel, D.diriOpsi, State.refleksiDiriOrder, State.refleksiDiri, 'data-diri') +
        '<div style="margin-top:var(--space-5);"></div>' +
        pilihan(
          D.pasanganLabel,
          D.pasanganOpsi,
          State.refleksiPasanganOrder,
          State.refleksiPasangan,
          'data-pasangan'
        )
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

  container.querySelectorAll('[data-diri]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.refleksiDiri = btn.dataset.diri;
      saveState();
      renderRefleksi(container);
    });
  });
  container.querySelectorAll('[data-pasangan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.refleksiPasangan = btn.dataset.pasangan;
      saveState();
      renderRefleksi(container);
    });
  });

  document.getElementById('refleksiSaveBtn').addEventListener('click', function () {
    if (!State.refleksiDiri || !State.refleksiPasangan) {
      showNotice('Pilih dulu penilaian dirimu dan penilaian kerja pasanganmu.');
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
  var nama = [State.namaSaya, State.namaPasangan]
    .map(function (n) {
      return String(n || '').trim();
    })
    .filter(function (n) {
      return n;
    })
    .join(' & ');

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🏆</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    (nama ? '<p class="kb-pasangan-nama">' + esc(nama) + '</p>' : '') +
    '<p class="done-card__lead">' +
    esc(D.teks) +
    '</p>' +
    '<div class="kb-aturan">' +
    D.aturan
      .map(function (a) {
        return (
          '<div class="formula-card"><strong class="kb-aturan__teks">' +
          esc(a.teks) +
          '</strong><span>' +
          esc(a.ket) +
          '</span></div>'
        );
      })
      .join('') +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kalian capai</h3>' +
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
    'Penjelasan juru bicara di fase Berbagi dan refleksi tertulis murid menjadi bahan penilaian utama kemampuan menjelaskan aturan tanda.' +
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
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  tujuan: renderTujuan,
  pikir: renderPikir,
  pasang: renderPasang,
  bagi: renderBagi,
  berbagi: renderBerbagi,
  masalah: renderMasalah,
  campuran: renderCampuran,
  latihan: renderLatihan,
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
