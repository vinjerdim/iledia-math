'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Masalah Kontekstual Rasio & Konversi Satuan
   — Fase D, SMP Kelas VII

   Utilitas bersama berada di shared/engine.js, antara lain:
     • mesin tahap & penyimpanan: createStageMachine, createStore,
       createExerciseStage, ensureExerciseArray;
     • komponen umum: buildDiscoveryHead, buildTeacherNote,
       buildTpPanel, buildChoiceGroup, buildGuidedQuizList,
       buildDlPanel, buildDlNextButton, buildFeedbackBox,
       ensureShuffledOrder, orderByIds;
     • seksi 29: makeCekStep (state langkah isian);
     • seksi 61 (Think-Pair-Share): buildTpsBanner, ensureTpsStates,
       buildTpsQuestion / bindTpsQuestion, tpsTahap, pilihJuruBicara,
       buildTpsShareCard;
     • seksi 67 (rasio): fmtRasio, PESAN_RASIO;
     • seksi 68 (rasio dengan konversi satuan): opsiRasioSatuan,
       periksaSoalRasioSatuan, buildLangkahRasio / bindLangkahRasio,
       ensureLabSatuanState, buildLabSamakanSatuan /
       bindLabSamakanSatuan.

   Alur tahap mengikuti fase Think-Pair-Share; lihat komentar kepala
   pada data.js untuk pemetaannya.

   PENGACAKAN: seluruh pilihan jawaban (dugaan Pikir, pertanyaan tafsir,
   pertanyaan TPS, bank kalimat strategi, opsi uji mandiri, penilaian
   diri & pasangan) DIACAK dengan shuffleArray() melalui
   ensureTpsStates() / ensureShuffledOrder(). Pengacakan dilakukan SEKALI
   saat state disiapkan (initExerciseArrays) lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat saat
   dirender ulang, tetapi teracak ulang untuk setiap murid dan setiap
   Reset. Soal uji mandiri juga dipilih acak dari bank.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Tujuan & Pasangan      (persiapan)
    6. Stage: Pikir                  (Think)
    7. Stage: Berpasangan            (Pair)
    8. Stage: Berbagi                (Share)
    9. Stage: Masalah Kontekstual    (Think → Pair → Share)
   10. Stage: Uji Mandiri
   11. Stage: Refleksi
   12. Stage: Selesai
   13. Router Render
   14. Helper UI (modal reset)
   15. Init
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
var STORAGE_KEY = 'mpi-d-3-2-rasio-satuan-v1';

/* Opsi dugaan tahap Pikir: kunci + pengecoh miskonsepsi dari engine. */
var PIKIR_OPSI = opsiRasioSatuan(DATA.pikir.cek).map(function (o) {
  return { id: o.id, label: esc(o.label), kode: o.kode, umpan: esc(o.umpan) };
});

/* Pertanyaan TPS tahap Berpasangan; opsi dibangkitkan dari cek. */
var PASANG_SOAL = DATA.pasang.soal.map(function (q) {
  var opsi = opsiRasioSatuan(q.cek);
  var umpan = {};
  opsi.forEach(function (o) {
    umpan[o.id] = esc(o.umpan);
  });
  return {
    id: q.id,
    tanya:
      buildKonteksTag(q.konteks) +
      ' ' +
      esc(q.cerita) +
      '<br><strong>' +
      esc(q.tanya) +
      '</strong>',
    opsi: opsi.map(function (o) {
      return { id: o.id, label: esc(o.label) };
    }),
    correct: 'benar',
    umpan: umpan,
    diskusi: esc(q.diskusi),
  };
});

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

  /* Tahap 2 — pikir */
  dugaan: null,
  dugaanKunci: false,
  dugaanOrder: null,
  labSatuan: {},
  pikirSteps: [],
  tafsirOrders: {},
  tafsirPilih: {},
  pikirStrategi: '',

  /* Tahap 3 — berpasangan */
  pasangTps: {},

  /* Tahap 4 — berbagi */
  bankOrder: null,
  simpulanPilihan: {},
  simpulanChecked: false,
  juruBicara: '',
  sudahBerbagi: false,

  /* Tahap 5 — masalah kontekstual */
  masalahTps: {},
  masalahSteps: {},

  /* Tahap 6 — uji mandiri */
  latihanPick: null,
  latihanIdx: 0,
  latihanExercises: [],

  /* Tahap 7 — refleksi */
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

/* Mengacak urutan opsi untuk setiap pertanyaan { id, opsi } dalam daftar. */
function ensureListOrders(key, list) {
  var map = ensureMap(key);
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, q.opsi);
  });
}

/* Pertanyaan TPS pemilihan strategi pada tahap masalah kontekstual. */
function masalahModelList() {
  return DATA.masalah.soal.map(function (s) {
    return s.model;
  });
}

/* Langkah isian masalah: satu array state per masalah. */
function ensureMasalahSteps() {
  var map = ensureMap('masalahSteps');
  DATA.masalah.soal.forEach(function (s) {
    ensureExerciseArray(map, s.id, s.langkah, makeCekStep);
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
  ensureShuffledOrder(State, 'dugaanOrder', PIKIR_OPSI);
  ensureLabSatuanState(ensureMap('labSatuan'), DATA.pikir.lab);
  ensureExerciseArray(State, 'pikirSteps', DATA.pikir.langkah, makeCekStep);
  ensureListOrders('tafsirOrders', DATA.pikir.tafsir);
  ensureMap('tafsirPilih');

  /* Tahap 3 */
  ensureTpsStates(State, 'pasangTps', PASANG_SOAL);

  /* Tahap 4 */
  ensureShuffledOrder(State, 'bankOrder', DATA.berbagi.bank);
  ensureMap('simpulanPilihan');

  /* Tahap 5 */
  ensureTpsStates(State, 'masalahTps', masalahModelList());
  ensureMasalahSteps();

  /* Tahap 6 — soal dipilih acak dari bank; opsi tiap soal diacak */
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

  /* Tahap 7 */
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

/* Label konteks: ikon + nama (Perlengkapan, Dapur Kemah, …). */
function buildKonteksTag(konteks) {
  var K = DATA.konteks[konteks];
  return (
    '<span class="rs-konteks rs-konteks--' +
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
    '<div class="rs-cerita">' +
    '<span class="rs-cerita__ikon" aria-hidden="true">' +
    c.ikon +
    '</span>' +
    '<div><p class="rs-cerita__judul">' +
    esc(c.judul) +
    '</p><p class="rs-cerita__teks">' +
    esc(c.teks) +
    '</p></div>' +
    '</div>'
  );
}

/* Kartu bantuan fakta konversi satuan (bisa dibuka-tutup). */
function buildFaktaKonversi(terbuka) {
  return (
    '<details class="rs-fakta"' +
    (terbuka ? ' open' : '') +
    '>' +
    '<summary>📐 Kartu fakta konversi satuan</summary>' +
    '<dl class="rs-fakta__list">' +
    DATA.fakta
      .map(function (f) {
        return '<div><dt>' + esc(f.besaran) + '</dt><dd>' + esc(f.teks) + '</dd></div>';
      })
      .join('') +
    '</dl>' +
    '</details>'
  );
}

/* Indeks langkah pertama yang belum selesai (= panjang daftar bila semua selesai). */
function langkahAktif(steps) {
  for (var i = 0; i < steps.length; i++) if (!steps[i].done) return i;
  return steps.length;
}

/* Langkah isian bertahap: hanya langkah yang sudah terbuka yang dirender. */
function buildLangkahList(idPrefix, list, steps) {
  var aktif = langkahAktif(steps);
  return list
    .slice(0, Math.min(aktif + 1, list.length))
    .map(function (step, i) {
      return buildLangkahRasio(idPrefix + i, steps[i], step, i + 1);
    })
    .join('');
}

function bindLangkahList(idPrefix, list, steps, rerender) {
  var aktif = langkahAktif(steps);
  if (aktif < list.length) {
    bindLangkahRasio(idPrefix + aktif, steps[aktif], list[aktif], saveState, rerender);
  }
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

/* Memilih juru bicara acak; bila sudah ada, pilih anggota LAIN. */
function acakJuruBicara() {
  var anggota = [State.namaSaya, State.namaPasangan];
  var lain = anggota.filter(function (n) {
    return String(n || '').trim() && String(n).trim() !== State.juruBicara;
  });
  State.juruBicara = pilihJuruBicara(lain.length ? lain : anggota);
}

function bindTextarea(id, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    saveState();
  });
}

/* ============================================================
   5. STAGE: TUJUAN & PASANGAN  (persiapan)
   ============================================================ */

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
        buildLangkahRasio('ap0', State.apersepsiSteps[0], D.apersepsi, null)
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👥 Pasangan belajarku</h3>' +
        '<div class="rs-nama">' +
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
        '<h4 class="rs-subjudul">Aturan main Think-Pair-Share</h4>' +
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

  bindLangkahRasio('ap0', State.apersepsiSteps[0], D.apersepsi, saveState, rerender);

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
   6. STAGE: PIKIR — SAMAKAN SATUANNYA  (Think)
   Murid bekerja SENDIRI: dugaan (tidak dinilai, dikunci) → Lab Samakan
   Satuan (mencoba semua pilihan satuan) → langkah isian berdiagnosa →
   dugaan dibandingkan dengan hasil → tafsir → strategi tertulis.
   ============================================================ */

function labSemuaDicoba() {
  var st = State.labSatuan;
  return DATA.pikir.lab.pilihan.every(function (s) {
    return st.dicoba.indexOf(s) !== -1;
  });
}

function buildBandingDugaan() {
  var o = PIKIR_OPSI.filter(function (x) {
    return x.id === State.dugaan;
  })[0];
  if (!o) return '';
  var tepat = o.id === 'benar';
  return buildFeedbackBox(
    tepat ? 'success' : 'info',
    tepat ? '🎯' : '🔍',
    '<strong>Dugaanmu tadi: ' +
      o.label +
      '.</strong> ' +
      (tepat
        ? 'Dugaanmu sudah tepat — sekarang kamu punya buktinya.'
        : 'Bandingkan dengan hasil langkahmu. ' + o.umpan)
  );
}

function renderPikir(container) {
  var D = DATA.pikir;
  var lab = State.labSatuan;
  var terkunci = State.dugaanKunci;
  var labOk = terkunci && labSemuaDicoba();
  var langkahOk = labOk && langkahAktif(State.pikirSteps) >= D.langkah.length;
  var tafsirOk = langkahOk && guidedQuizAllCorrect(D.tafsir, State.tafsirPilih);
  var rerender = function () {
    renderPikir(container);
  };

  var dugaanHTML =
    '<p class="exercise-label">' +
    esc(D.dugaanLabel) +
    '</p>' +
    buildChoiceGroup(PIKIR_OPSI, State.dugaanOrder, {
      chosen: State.dugaan,
      locked: terkunci,
      attr: 'data-dugaan',
    }) +
    (terkunci
      ? '<p class="tps-q__kunci">🔒 Dugaanmu sudah dikunci.</p>'
      : '<div class="btn-group btn-group--end">' +
        '<button type="button" class="btn btn--primary btn--small" id="dugaanKunciBtn"' +
        (State.dugaan ? '' : ' disabled') +
        '>🔒 Kunci dugaanku</button>' +
        '</div>');

  var labHTML = terkunci
    ? buildDlPanel(
        '<h3 style="margin-top:0;">' +
          esc(D.labJudul) +
          '</h3>' +
          '<p class="dl-caption">' +
          esc(D.labInstruksi) +
          '</p>' +
          buildLabSamakanSatuan('labPikir', lab, D.lab) +
          buildFaktaKonversi(false)
      )
    : '';

  var langkahHTML = labOk
    ? buildDlPanel(
        '<h3 style="margin-top:0;">✏️ Hitung sendiri</h3>' +
          '<div class="dl-steps">' +
          buildLangkahList('pk', D.langkah, State.pikirSteps) +
          '</div>' +
          (langkahOk ? buildBandingDugaan() : '')
      )
    : terkunci
    ? buildFeedbackBox('info', '🔎', 'Coba kedua tombol satuan di Lab untuk membuka langkah isian.')
    : '';

  var tafsirHTML = langkahOk
    ? buildDlPanel(
        '<h3 style="margin-top:0;">💡 Apa artinya?</h3>' +
          buildGuidedQuizList(D.tafsir, State.tafsirOrders, State.tafsirPilih)
      )
    : '';

  var strategiHTML = tafsirOk
    ? buildDlPanel(
        '<div class="field-group" style="margin:0;">' +
          '<label for="pikirStrategi">' +
          esc(D.strategiLabel) +
          '</label>' +
          '<textarea id="pikirStrategi" class="input-textarea" placeholder="' +
          esc(D.strategiPlaceholder) +
          '">' +
          esc(State.pikirStrategi) +
          '</textarea>' +
          '</div>'
      ) + buildDlNextButton('pikirNextBtn', D.nextLabel)
    : '';

  container.innerHTML =
    '<section aria-label="Pikir: Samakan Satuannya">' +
    buildHead(D) +
    buildDlPanel(
      buildCerita(D.cerita) +
        '<p class="rs-tanya"><strong>' +
        esc(D.tanya) +
        '</strong></p>' +
        dugaanHTML,
      'panel--hero'
    ) +
    labHTML +
    langkahHTML +
    tafsirHTML +
    strategiHTML +
    '</section>';

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.dugaanKunci) return;
      State.dugaan = btn.dataset.dugaan;
      saveState();
      rerender();
    });
  });
  var kunci = document.getElementById('dugaanKunciBtn');
  if (kunci) {
    kunci.addEventListener('click', function () {
      if (!State.dugaan) return;
      State.dugaanKunci = true;
      saveState();
      rerender();
    });
  }

  bindLabSamakanSatuan(container, 'labPikir', lab, D.lab, function () {
    saveState();
    rerender();
  });
  if (labOk) bindLangkahList('pk', D.langkah, State.pikirSteps, rerender);
  if (langkahOk) bindGuidedQuizList(container, D.tafsir, State.tafsirPilih, saveState, rerender);
  bindTextarea('pikirStrategi', 'pikirStrategi');

  var next = document.getElementById('pikirNextBtn');
  if (next) {
    next.addEventListener('click', function () {
      if (!State.pikirStrategi.trim()) {
        showNotice('Tulis strategimu, walau hanya satu kalimat.');
        return;
      }
      completeStage('pikir');
      navigateTo('pasang');
    });
  }
}

/* ============================================================
   7. STAGE: BERPASANGAN  (Pair)
   Empat pertanyaan TPS rasio bersatuan berbeda; opsi pengecoh dari
   miskonsepsi (opsiRasioSatuan), urutannya diacak & disimpan.
   ============================================================ */

function renderPasang(container) {
  var D = DATA.pasang;
  var semua = tpsSemuaSelesai(PASANG_SOAL, State.pasangTps);
  var rerender = function () {
    renderPasang(container);
  };

  container.innerHTML =
    '<section aria-label="Berpasangan">' +
    buildHead(D) +
    buildFaktaKonversi(true) +
    buildDlPanel(buildTpsList(PASANG_SOAL, State.pasangTps)) +
    (semua
      ? buildFeedbackBox(
          'success',
          '🤝',
          '<strong>Keempat rasio sudah kalian sepakati.</strong> Pola apa yang selalu kalian lakukan lebih dulu?'
        ) + buildDlNextButton('pasangNextBtn', D.nextLabel)
      : '') +
    '</section>';

  bindTpsList(container, PASANG_SOAL, State.pasangTps, rerender);
  bindNext('pasangNextBtn', 'pasang', 'berbagi');
}

/* ============================================================
   8. STAGE: BERBAGI  (Share)
   ============================================================ */

function simpulanSemuaBenar() {
  return DATA.berbagi.kalimat.every(function (g) {
    return State.simpulanPilihan[g.id] === g.correct;
  });
}

function buildKalimatList(D, bank, benarSemua) {
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali langkah di Lab Samakan Satuan.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');
}

function renderBerbagi(container) {
  var D = DATA.berbagi;
  var bank = orderByIds(D.bank, State.bankOrder);
  var benarSemua = simpulanSemuaBenar();
  var rerender = function () {
    renderBerbagi(container);
  };

  container.innerHTML =
    '<section aria-label="Berbagi">' +
    buildHead(D) +
    buildDlPanel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    buildDlPanel(
      buildKalimatList(D, bank, benarSemua) +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Strategi kalian lengkap dan tepat.</strong> Sekarang saatnya berbagi ke kelas!'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Strategi</button>' +
            '</div>')
    ) +
    (benarSemua
      ? buildDlPanel(
          '<h3 style="margin-top:0;">Langkah Menyelesaikan Rasio Bersatuan</h3>' +
            '<ul class="rs-rangkuman">' +
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
   9. STAGE: MASALAH KONTEKSTUAL  (Think → Pair → Share)
   Setiap masalah: pilih strategi lewat TPS → langkah isian berdiagnosa
   (konversi, rasio, membagi, suku hilang). Masalah berikutnya terbuka
   setelah masalah sebelumnya selesai.
   ============================================================ */

function masalahSelesai(s) {
  return (
    tpsTahap(s.model, State.masalahTps[s.model.id]) === 'selesai' &&
    langkahAktif(State.masalahSteps[s.id]) >= s.langkah.length
  );
}

function renderMasalah(container) {
  var D = DATA.masalah;
  var rerender = function () {
    renderMasalah(container);
  };
  var terbuka = [];
  for (var i = 0; i < D.soal.length; i++) {
    terbuka.push(D.soal[i]);
    if (!masalahSelesai(D.soal[i])) break;
  }
  var semua = D.soal.every(masalahSelesai);

  var kartu = terbuka
    .map(function (s, i) {
      var modelOk = tpsTahap(s.model, State.masalahTps[s.model.id]) === 'selesai';
      return (
        '<article class="rs-masalah' +
        (masalahSelesai(s) ? ' is-done' : '') +
        '">' +
        '<header class="rs-masalah__head"><span class="rs-masalah__no">Masalah ' +
        (i + 1) +
        '</span>' +
        buildKonteksTag(s.konteks) +
        '</header>' +
        '<p class="rs-masalah__cerita">' +
        esc(s.cerita) +
        '</p>' +
        '<p class="rs-masalah__tanya"><strong>' +
        esc(s.pertanyaan) +
        '</strong></p>' +
        buildTpsQuestion('tq-' + s.model.id, s.model, State.masalahTps[s.model.id], namaOpts()) +
        (modelOk
          ? '<div class="dl-steps rs-masalah__langkah">' +
            buildLangkahList('ms' + s.id + '-', s.langkah, State.masalahSteps[s.id]) +
            '</div>'
          : '') +
        '</article>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Masalah Kontekstual">' +
    buildHead(D) +
    buildFaktaKonversi(false) +
    '<p class="rs-progres">' +
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
              '</strong>, pilih satu masalah dan jelaskan ke kelas: satuan apa yang kalian samakan, bagaimana rasionya disederhanakan atau dipakai, dan <em>apa arti jawabannya</em> dalam persiapan kemah.'
          )
        ) + buildDlNextButton('masalahNextBtn', D.nextLabel)
      : '') +
    '</section>';

  terbuka.forEach(function (s) {
    bindTpsQuestion(
      container,
      'tq-' + s.model.id,
      s.model,
      State.masalahTps[s.model.id],
      saveState,
      rerender
    );
    if (tpsTahap(s.model, State.masalahTps[s.model.id]) === 'selesai') {
      bindLangkahList('ms' + s.id + '-', s.langkah, State.masalahSteps[s.id], rerender);
    }
  });
  bindNext('masalahNextBtn', 'masalah', 'latihan');
}

/* ============================================================
   10. STAGE: UJI MANDIRI
   createExerciseStage (shared/engine.js) dengan soal LATIHAN_SOAL yang
   dipilih acak. Isian diperiksa periksaSoalRasioSatuan sehingga pesan
   salahnya berupa diagnosa miskonsepsi.
   ============================================================ */

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
  inputPlaceholder: 'mis. 4 : 1 atau 1.200',
  inputMode: 'text',
  revealButtonStyle: 'separate',
  showAttemptErrorWithHint: true,
  emptyMessage: 'Isi jawabanmu terlebih dahulu.',
  inputSuffix: function (s) {
    return s.satuan ? '<span class="bbk-satuan">' + esc(s.satuan) + '</span>' : '';
  },
  /* Teks mentah diteruskan; isian yang tak terbaca ditolak tanpa dihitung. */
  parseInput: function (val) {
    if (!val || !String(val).trim()) return { value: null, error: 'empty' };
    var d = periksaSoalRasioSatuan(val, LATIHAN_SOAL[State.latihanIdx]);
    if (d.kode === 'format' || d.kode === 'nol') {
      return { value: null, error: 'invalid', message: d.pesan };
    }
    return { value: String(val), error: null };
  },
  isCorrect: function (value, s) {
    return periksaSoalRasioSatuan(value, s).benar;
  },
  inputErrorHTML: function (s, ex) {
    return (
      '<strong>' +
      esc(ex.userInput) +
      '</strong> — ' +
      esc(periksaSoalRasioSatuan(ex.userInput, s).pesan)
    );
  },
  revealText: function (s) {
    return (
      'Jawaban: <strong>' +
      esc(s.jawab + (s.satuan ? ' ' + s.satuan : '')) +
      '</strong>. ' +
      esc(s.explanation)
    );
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
   11. STAGE: REFLEKSI
   ============================================================ */

/* Seluruh pasangan (pertanyaan TPS, state) untuk rekap. */
function semuaTps() {
  var out = [];
  [
    [PASANG_SOAL, State.pasangTps],
    [masalahModelList(), State.masalahTps],
  ].forEach(function (p) {
    p[0].forEach(function (q) {
      out.push({ q: q, st: p[1][q.id] });
    });
  });
  return out;
}

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var individu = State.pikirSteps;
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
        kartu(sekali + '/' + individu.length, 'Langkah Pikir tepat pada percobaan pertama') +
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
   12. STAGE: SELESAI
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
    '<span class="done-card__icon">🏕️</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    (nama ? '<p class="rs-pasangan-nama">' + esc(nama) + '</p>' : '') +
    '<p class="done-card__lead">' +
    esc(D.teks) +
    '</p>' +
    '<div class="rs-aturan">' +
    D.aturan
      .map(function (a) {
        return (
          '<div class="formula-card"><strong class="rs-aturan__teks">' +
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
    'Penjelasan juru bicara di fase Berbagi dan refleksi tertulis murid menjadi bahan penilaian utama kemampuan menyelesaikan masalah rasio dengan konversi satuan.' +
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
   13. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  tujuan: renderTujuan,
  pikir: renderPikir,
  pasang: renderPasang,
  berbagi: renderBerbagi,
  masalah: renderMasalah,
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
   14. HELPER UI — MODAL RESET
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
   15. INIT
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
