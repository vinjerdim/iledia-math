'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Membandingkan & Mengurutkan Pecahan Berpenyebut Berbeda
   Fase D — SMP Kelas 7

   Utilitas bersama (esc, shuffleArray, showNotice, buildFeedbackBox,
   buildProgressDots, createStageMachine, createStore,
   createExerciseStage, komponen pilihan/pemilahan/langkah isian,
   komponen pecahan, serta komponen membandingkan & mengurutkan
   pecahan: lcm, kpkList, compareFractions, sortFractions,
   renderFracText, buildFracStripCompare, buildFracNumberLine,
   buildOrderBoard/bindOrderBoard, buildRoleCards, buildRoleTag)
   berada di shared/engine.js.

   Alur tahap mengikuti fase Cooperative Learning; lihat komentar
   kepala pada data.js untuk pemetaannya.

   Seluruh pilihan jawaban DIACAK dengan shuffleArray() melalui
   ensureShuffledOrder()/ensureSortStates()/ensureOrderState().
   Pengacakan dilakukan SEKALI saat state disiapkan
   (initExerciseArrays), lalu urutannya disimpan di State — bukan saat
   render. Dengan begitu pilihan tidak melompat-lompat setiap kali
   tahap dirender ulang, tetapi teracak ulang setiap kali Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi        (CL fase 1)
    6. Stage: Sajian Materi    (CL fase 2)
    7. Stage: Bentuk Kelompok  (CL fase 3)
    8. Stage: Bandingkan       (CL fase 4)
    9. Stage: Urutkan          (CL fase 4)
   10. Stage: Kuis Individu    (CL fase 5)
   11. Stage: Penghargaan      (CL fase 6)
   12. Stage: Refleksi
   13. Stage: Selesai
   14. Router Render
   15. Helper UI (modal reset)
   16. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var STAGES = [
  'orientasi',
  'sajian',
  'kelompok',
  'bandingkan',
  'urutkan',
  'kuis',
  'penghargaan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Orientasi',
  'Sajian Materi',
  'Bentuk Kelompok',
  'Bandingkan',
  'Urutkan',
  'Kuis Individu',
  'Penghargaan',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-d-1-5-banding-pecahan-cl-v1';

/* Peran berdasarkan id, untuk label peran yang bertugas. */
var PERAN = {};
DATA.peran.forEach(function (r) {
  PERAN[r.id] = r;
});

/* Soal kuis dengan token pecahan {a/b} sudah diubah menjadi HTML. */
var KUIS_SOAL = DATA.kuis.soal.map(function (s) {
  return Object.assign({}, s, {
    tanya: renderFracText(s.tanya),
    explanation: renderFracText(s.explanation),
    options: s.options.map(function (o) {
      return { id: o.id, label: renderFracText(o.label) };
    }),
  });
});

/* Butir pemilahan refleksi (benar/keliru). */
var REFLEKSI_ITEMS = DATA.refleksi.pernyataan.map(function (p) {
  return {
    id: p.id,
    teks: renderFracText(p.teks),
    correct: p.correct,
    explanation: renderFracText(p.explanation),
  };
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  orientasiOrder: null,
  orientasiPilih: null,

  /* Tahap 2 — sajian */
  sajianIdx: 0,
  sajianOrders: {},
  sajianPilih: {},
  sajianPertama: {},

  /* Tahap 3 — kelompok */
  timNama: '',
  timPeran: {},
  timSepakat: {},

  /* Tahap 4 — bandingkan */
  bandingIdx: 0,
  bandingStates: {},

  /* Tahap 5 — urutkan */
  urutIdx: 0,
  urutStates: {},
  urutHint: {},

  /* Tahap 6 — kuis individu */
  kuisIdx: 0,
  kuisStates: [],

  /* Tahap 7 — penghargaan */
  apresiasiOrder: null,
  apresiasi: null,

  /* Tahap 8 — refleksi */
  refleksiStates: {},
  refleksiOrder: null,
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

function makeBandingState() {
  return {
    steps: [makeDlStep(), makeDlStep(), makeDlStep()],
    tandaOrder: null,
    tanda: null,
    tandaPertama: null,
  };
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.dugaan.opsi);

  /* Tahap 2 */
  ensureObject('sajianOrders');
  ensureObject('sajianPilih');
  ensureObject('sajianPertama');
  DATA.sajian.strategi.forEach(function (s) {
    ensureShuffledOrder(State.sajianOrders, s.id, s.cek.opsi);
  });
  ensureIndex('sajianIdx', DATA.sajian.strategi.length);

  /* Tahap 3 */
  if (typeof State.timNama !== 'string') State.timNama = '';
  ensureObject('timPeran');
  ensureObject('timSepakat');

  /* Tahap 4 */
  ensureObject('bandingStates');
  DATA.bandingkan.soal.forEach(function (q) {
    var st = State.bandingStates[q.id];
    if (!st || !Array.isArray(st.steps) || st.steps.length !== 3) {
      st = State.bandingStates[q.id] = makeBandingState();
    }
    ensureShuffledOrder(st, 'tandaOrder', DATA.bandingkan.tandaOpsi);
  });
  ensureIndex('bandingIdx', DATA.bandingkan.soal.length);

  /* Tahap 5 */
  ensureObject('urutStates');
  ensureObject('urutHint');
  DATA.urutkan.soal.forEach(function (q) {
    ensureOrderState(State.urutStates, q.id, q.items);
  });
  ensureIndex('urutIdx', DATA.urutkan.soal.length);

  /* Tahap 6 */
  ensureExerciseArray(State, 'kuisStates', KUIS_SOAL, function (s) {
    return {
      attempts: 0,
      hintLevel: 0,
      correct: false,
      userInput: '',
      revealed: false,
      chosen: null,
      optionOrder: shuffleArray(optionIds(s.options)),
    };
  });
  ensureIndex('kuisIdx', KUIS_SOAL.length);

  /* Tahap 7 */
  ensureShuffledOrder(State, 'apresiasiOrder', DATA.peran);

  /* Tahap 8 */
  ensureSortStates(State, 'refleksiStates', 'refleksiOrder', REFLEKSI_ITEMS, DATA.refleksi.opsi);
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

/* Teks data dengan token pecahan {a/b}. */
var T = renderFracText;

/* Pecahan bersusun kecil dari objek { num, den }. */
function F(f) {
  return buildFracInline(f.num, f.den);
}

/* Label peran yang bertugas beserta nama anggotanya. */
function roleTag(id) {
  return buildRoleTag(PERAN[id], State.timPeran[id]);
}

/* Label opsi berdasarkan id, dengan token pecahan diubah. */
function opsiLabel(options, id) {
  return T(findOptionLabel(options, id));
}

/* Deret kelipatan n sampai batas: 3, 6, 9, 12. */
function kelipatan(n, sampai) {
  var out = [];
  for (var k = n; k <= sampai; k += n) out.push(k);
  return out.join(', ');
}

/* Daftar kesetaraan pecahan terhadap penyebut K: "{3/4} = {9/12}". */
function daftarSenilai(fracs, K) {
  return fracs
    .map(function (f) {
      return F(f) + ' = ' + buildFracInline((f.num * K) / f.den, K);
    })
    .join(' &nbsp;·&nbsp; ');
}

/* Tombol pilihan kelompok (renderer tahap yang sama) → id opsi. */
function bindChoices(container, group, handler) {
  var sel = group ? '[data-opt-id][data-group="' + group + '"]' : '[data-opt-id]';
  container.querySelectorAll(sel).forEach(function (btn) {
    btn.addEventListener('click', function () {
      handler(btn.dataset.optId);
    });
  });
}

/* Kartu ringkasan angka. */
function kartu(val, label) {
  return (
    '<div class="summary-card"><div class="summary-card__val">' +
    val +
    '</div><div class="summary-card__label">' +
    label +
    '</div></div>'
  );
}

/* Nilai tim (STAD): rata-rata skor LKPD tim dan skor kuis individu. */
function hitungSkor() {
  var bandingPertama = DATA.bandingkan.soal.filter(function (q) {
    var st = State.bandingStates[q.id];
    return st && st.tandaPertama === tandaBenar(q);
  }).length;
  var urutPertama = DATA.urutkan.soal.filter(function (q) {
    var st = State.urutStates[q.id];
    return st && st.correct && st.attempts === 1;
  }).length;
  var kuisBenar = State.kuisStates.filter(function (st) {
    return st.correct;
  }).length;
  var lkpdTotal = DATA.bandingkan.soal.length + DATA.urutkan.soal.length;
  var skorLkpd = Math.round(((bandingPertama + urutPertama) / lkpdTotal) * 100);
  var skorKuis = Math.round((kuisBenar / KUIS_SOAL.length) * 100);
  var nilai = Math.round((skorLkpd + skorKuis) / 2);
  var predikat = DATA.penghargaan.predikat.filter(function (p) {
    return nilai >= p.min;
  })[0];
  return {
    bandingPertama: bandingPertama,
    urutPertama: urutPertama,
    kuisBenar: kuisBenar,
    skorLkpd: skorLkpd,
    skorKuis: skorKuis,
    nilai: nilai,
    predikat: predikat,
  };
}

function namaTim() {
  return State.timNama ? State.timNama : 'Tim kalian';
}

/* ============================================================
   5. STAGE: ORIENTASI (CL fase 1)
   ============================================================ */

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var Q = D.dugaan;
  var chosen = State.orientasiPilih;

  container.innerHTML =
    '<section aria-label="Orientasi">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="cl-hero">' +
        '<span class="cl-hero__icon" aria-hidden="true">' +
        D.ikon +
        '</span>' +
        '<div>' +
        '<h2 class="cl-hero__title">' +
        esc(D.judul) +
        '</h2>' +
        '<p class="cl-hero__story">' +
        T(D.cerita) +
        '</p>' +
        '</div>' +
        '</div>' +
        '<div class="kue-grid">' +
        D.kue
          .map(function (k) {
            return (
              '<div class="kue-card">' +
              buildFractionModel(k.num, k.den, 0, {
                shape: 'circle',
                small: true,
                aria: k.nama + ' menghias ' + bacaPecahan(k.num, k.den) + ' kue',
              }) +
              '<p class="kue-card__name">' +
              esc(k.nama) +
              '</p>' +
              '<p class="kue-card__frac">' +
              buildFracBlock(k.num, k.den, null, 'small') +
              '</p>' +
              '</div>'
            );
          })
          .join('') +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(Q.tanya) +
        '</p>' +
        buildChoiceGroup(
          Q.opsi.map(function (o) {
            return { id: o.id, label: T(o.label) };
          }),
          State.orientasiOrder,
          { chosen: chosen }
        ) +
        (chosen ? buildFeedbackBox('info', '📝', esc(Q.umpan)) : '')
    ) +
    (chosen
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🎯 Setelah belajar hari ini, kamu dapat:</h3>' +
            '<ol class="objectives-list">' +
            D.tujuan
              .map(function (t, i) {
                return (
                  '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(t) + '</li>'
                );
              })
              .join('') +
            '</ol>'
        ) +
        buildDlPanel(
          '<h3 style="margin-top:0;">🤝 Aturan belajar kooperatif</h3>' +
            '<div class="aturan-grid">' +
            D.aturan
              .map(function (a) {
                return (
                  '<div class="aturan-card"><span class="aturan-card__icon" aria-hidden="true">' +
                  a.ikon +
                  '</span><span>' +
                  a.teks +
                  '</span></div>'
                );
              })
              .join('') +
            '</div>',
          'panel--info'
        ) +
        buildDlNextButton('orientasiNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindChoices(container, null, function (id) {
    State.orientasiPilih = id;
    saveState();
    renderOrientasi(container);
  });

  bindNext('orientasiNextBtn', 'orientasi', 'sajian');
}

/* ============================================================
   6. STAGE: SAJIAN MATERI (CL fase 2)
   ============================================================ */

function strategiSelesai(s) {
  return State.sajianPilih[s.id] === s.cek.correct;
}

function buildStrategiVisual(s) {
  if (s.id === 'kpk') {
    return buildFracStripCompare(s.contoh, {
      common: kpkList(
        s.contoh.map(function (f) {
          return f.den;
        })
      ),
      caption:
        'Setiap pita dibagi lagi menjadi 12 bagian sama besar; garis tebal = batas bagian asal.',
    });
  }
  if (s.id === 'patokan') {
    return buildFracStripCompare(s.contoh, {
      half: true,
      caption: 'Garis putus-putus menandai ½.',
    });
  }
  return buildFracStripCompare(s.contoh, { caption: 'Kedua pita sama panjang (1 utuh).' });
}

function renderSajian(container) {
  var D = DATA.sajian;
  var list = D.strategi;
  var idx = State.sajianIdx;
  var s = list[idx];
  var chosen = State.sajianPilih[s.id];
  var benar = chosen === s.cek.correct;
  var semua = list.every(strategiSelesai);

  var tabs =
    '<div class="strategi-tabs" role="tablist" aria-label="Strategi">' +
    list
      .map(function (x, i) {
        var terbuka = i === 0 || strategiSelesai(list[i - 1]);
        return (
          '<button type="button" role="tab" class="strategi-tab' +
          (i === idx ? ' is-active' : '') +
          (strategiSelesai(x) ? ' is-done' : '') +
          '" data-strategi="' +
          i +
          '" aria-selected="' +
          (i === idx ? 'true' : 'false') +
          '"' +
          (terbuka ? '' : ' disabled') +
          '><span aria-hidden="true">' +
          (strategiSelesai(x) ? '✓' : x.ikon) +
          '</span> Strategi ' +
          (i + 1) +
          '</button>'
        );
      })
      .join('') +
    '</div>';

  var langkah = s.langkah
    ? '<ol class="strategi-langkah">' +
      s.langkah
        .map(function (l) {
          return '<li>' + T(l) + '</li>';
        })
        .join('') +
      '</ol>'
    : '<p class="strategi-simpul">' + T(s.kesimpulan) + '</p>';

  var cekOpsi = s.cek.opsi.map(function (o) {
    return { id: o.id, label: T(o.label) };
  });

  var nav = '';
  if (benar && idx < list.length - 1) {
    nav = buildDlNextButton('sajianStrategiNext', 'Strategi ' + (idx + 2) + ' →');
  }

  var bukti = '';
  if (semua) {
    var dugaan = State.orientasiPilih;
    var tepat = dugaan === DATA.orientasi.dugaan.correct;
    bukti =
      buildDlPanel(
        '<h3 style="margin-top:0;">🎂 ' +
          esc(D.bukti.judul) +
          '</h3>' +
          buildFracStripCompare(DATA.orientasi.kue, {
            common: D.bukti.kpk,
            highlight: 1,
          }) +
          '<p>' +
          T(D.bukti.teks) +
          '</p>' +
          (dugaan
            ? buildFeedbackBox(
                tepat ? 'success' : 'warning',
                tepat ? '🎉' : '💡',
                'Dugaan awalmu: <strong>' +
                  opsiLabel(DATA.orientasi.dugaan.opsi, dugaan) +
                  '</strong>. ' +
                  (tepat
                    ? 'Dugaanmu terbukti benar!'
                    : 'Sekarang kamu tahu cara membuktikannya — penyebut besar tidak berarti pecahan besar.')
              )
            : ''),
        'panel--hero'
      ) + buildDlNextButton('sajianNextBtn', D.nextLabel, true);
  }

  container.innerHTML =
    '<section aria-label="Sajian Materi">' +
    buildHead(D) +
    tabs +
    buildDlPanel(
      '<h2 class="strategi-judul"><span aria-hidden="true">' +
        s.ikon +
        '</span> ' +
        esc(s.judul) +
        '</h2>' +
        '<p>' +
        T(s.inti) +
        '</p>' +
        buildStrategiVisual(s) +
        langkah +
        (s.catatan ? '<div class="hint-box">' + T(s.catatan) + '</div>' : '')
    ) +
    buildDlPanel(
      '<p class="exercise-label">⚡ Cek cepat</p>' +
        '<p class="cek-tanya">' +
        T(s.cek.tanya) +
        '</p>' +
        (s.cek.pita ? buildFracStripCompare(s.cek.pita, { half: true }) : '') +
        buildChoiceGroup(cekOpsi, State.sajianOrders[s.id], {
          chosen: chosen,
          correctId: benar ? s.cek.correct : null,
          grade: true,
          locked: benar,
        }) +
        (chosen
          ? buildFeedbackBox(
              benar ? 'success' : 'warning',
              benar ? '✓' : '💭',
              T(s.cek.umpan[chosen])
            )
          : '')
    ) +
    nav +
    bukti +
    '</section>';

  container.querySelectorAll('[data-strategi]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.sajianIdx = parseInt(btn.dataset.strategi, 10);
      saveState();
      renderSajian(container);
    });
  });

  bindChoices(container, null, function (id) {
    if (State.sajianPilih[s.id] === s.cek.correct) return;
    if (!State.sajianPertama[s.id]) State.sajianPertama[s.id] = id;
    State.sajianPilih[s.id] = id;
    saveState();
    renderSajian(container);
  });

  var stratNext = document.getElementById('sajianStrategiNext');
  if (stratNext) {
    stratNext.addEventListener('click', function () {
      State.sajianIdx = idx + 1;
      saveState();
      renderSajian(container);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  bindNext('sajianNextBtn', 'sajian', 'kelompok');
}

/* ============================================================
   7. STAGE: BENTUK KELOMPOK (CL fase 3)
   ============================================================ */

function renderKelompok(container) {
  var D = DATA.kelompok;

  container.innerHTML =
    '<section aria-label="Bentuk Kelompok">' +
    buildHead(D) +
    buildDlPanel(
      '<label for="timNama" class="exercise-label">👥 ' +
        esc(D.namaLabel) +
        '</label>' +
        '<input type="text" id="timNama" class="input-text tim-nama" maxlength="30" value="' +
        esc(State.timNama) +
        '" placeholder="' +
        esc(D.namaPlaceholder) +
        '">' +
        '<h3 class="kelompok-sub">🎭 Bagi peran — tulis nama anggota</h3>' +
        buildRoleCards(DATA.peran, State.timPeran)
    ) +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.kesepakatanJudul) +
        '</p>' +
        '<div class="sepakat-list">' +
        D.kesepakatan
          .map(function (k, i) {
            return (
              '<label class="sepakat-item"><input type="checkbox" data-sepakat="' +
              i +
              '"' +
              (State.timSepakat[i] ? ' checked' : '') +
              '><span>' +
              esc(k) +
              '</span></label>'
            );
          })
          .join('') +
        '</div>',
      'panel--info'
    ) +
    buildDlNextButton('kelompokNextBtn', D.nextLabel, true) +
    '</section>';

  var nama = document.getElementById('timNama');
  nama.addEventListener('input', function () {
    State.timNama = nama.value.trim();
    saveState();
  });

  container.querySelectorAll('[data-role-id]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      State.timPeran[inp.dataset.roleId] = inp.value.trim();
      saveState();
    });
  });

  container.querySelectorAll('[data-sepakat]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      State.timSepakat[cb.dataset.sepakat] = cb.checked;
      saveState();
    });
  });

  document.getElementById('kelompokNextBtn').addEventListener('click', function () {
    if (!State.timNama) {
      showNotice('Tuliskan dulu nama timmu.');
      nama.focus();
      return;
    }
    var kosong = DATA.peran.filter(function (r) {
      return !State.timPeran[r.id];
    });
    if (kosong.length) {
      showNotice('Isi nama anggota untuk peran ' + kosong[0].nama + '.');
      return;
    }
    var belum = D.kesepakatan.some(function (k, i) {
      return !State.timSepakat[i];
    });
    if (belum) {
      showNotice('Centang semua kesepakatan tim terlebih dahulu.');
      return;
    }
    completeStage('kelompok');
    navigateTo('bandingkan');
  });
}

/* ============================================================
   8. STAGE: BANDINGKAN (CL fase 4)
   Setiap soal: KPK → pembilang senilai kedua pecahan → tanda.
   ============================================================ */

function tandaBenar(q) {
  return fracRelationSymbol(compareFractions(q.a, q.b));
}

function langkahBanding(q) {
  var K = lcm(q.a.den, q.b.den);
  var besar = Math.max(q.a.den, q.b.den);
  var kecil = Math.min(q.a.den, q.b.den);
  function senilai(f, peran) {
    var kali = K / f.den;
    return {
      label:
        roleTag(peran) +
        '<br>Ubah ' +
        F(f) +
        ' menjadi per ' +
        K +
        ': ' +
        F(f) +
        ' = ' +
        buildFracInline('?', K) +
        '. Berapa pembilangnya?',
      jawab: f.num * kali,
      hints: [
        'Penyebut ' +
          f.den +
          ' dikali berapa agar menjadi ' +
          K +
          '? (' +
          K +
          ' : ' +
          f.den +
          ' = ' +
          kali +
          ')',
        'Pembilang juga dikali ' + kali + ': ' + f.num + ' × ' + kali + ' = …',
      ],
      temuan: T(F(f) + ' = ' + buildFracInline(f.num * kali, K)),
    };
  }
  return [
    {
      label:
        roleTag('penghitung') +
        '<br>Berapa KPK (penyebut bersama terkecil) dari ' +
        q.a.den +
        ' dan ' +
        q.b.den +
        '?',
      jawab: K,
      hints: [
        'Kelipatan ' +
          besar +
          ': ' +
          kelipatan(besar, K * 1) +
          ', … Mana yang juga habis dibagi ' +
          kecil +
          '?',
        'Kelipatan ' +
          kecil +
          ': ' +
          kelipatan(kecil, K) +
          '. Bilangan pertama yang muncul di kedua daftar adalah KPK.',
      ],
      temuan: 'KPK dari ' + q.a.den + ' dan ' + q.b.den + ' adalah <strong>' + K + '</strong>.',
    },
    senilai(q.a, 'penghitung'),
    senilai(q.b, 'pemeriksa'),
  ];
}

function renderBandingkan(container) {
  var D = DATA.bandingkan;
  var soal = D.soal;
  var idx = State.bandingIdx;
  var q = soal[idx];
  var st = State.bandingStates[q.id];
  var steps = langkahBanding(q);
  var K = steps[0].jawab;
  var benarTanda = tandaBenar(q);
  var tandaOk = st.tanda === benarTanda;
  var langkahSelesai = st.steps.every(function (x) {
    return x.done;
  });

  var statuses = soal.map(function (x) {
    var s2 = State.bandingStates[x.id];
    if (s2.tanda === tandaBenar(x))
      return s2.tandaPertama === tandaBenar(x) ? 'correct' : 'incorrect';
    return null;
  });

  var stepsHTML = '';
  for (var i = 0; i < steps.length; i++) {
    if (i > 0 && !st.steps[i - 1].done) break;
    stepsHTML += buildDlStep('bd' + i, st.steps[i], steps[i], i + 1);
  }

  var tandaHTML = '';
  if (langkahSelesai) {
    var na = (q.a.num * K) / q.a.den;
    var nb = (q.b.num * K) / q.b.den;
    tandaHTML =
      '<div class="dl-step' +
      (tandaOk ? ' dl-step--done' : '') +
      '">' +
      '<p class="dl-step__label"><span class="dl-step__num">4</span>' +
      roleTag('pemeriksa') +
      '<br>Bandingkan ' +
      buildFracInline(na, K) +
      ' dan ' +
      buildFracInline(nb, K) +
      '. Tanda yang tepat untuk ' +
      F(q.a) +
      ' … ' +
      F(q.b) +
      ' adalah …</p>' +
      buildChoiceGroup(D.tandaOpsi, st.tandaOrder, {
        chosen: st.tanda,
        correctId: tandaOk ? benarTanda : null,
        grade: true,
        locked: tandaOk,
      }) +
      (st.tanda && !tandaOk
        ? buildFeedbackBox(
            'warning',
            '💭',
            'Belum tepat. Penyebutnya sudah sama (' +
              K +
              '), jadi cukup bandingkan pembilangnya: ' +
              na +
              ' dan ' +
              nb +
              '.'
          )
        : '') +
      '</div>';
  }

  var hasilHTML = '';
  if (tandaOk) {
    var simbol = benarTanda === '<' ? '&lt;' : benarTanda === '>' ? '&gt;' : '=';
    hasilHTML = buildDlPanel(
      buildFeedbackBox(
        'success',
        '✓',
        '<strong>' +
          F(q.a) +
          ' ' +
          simbol +
          ' ' +
          F(q.b) +
          '</strong>' +
          (benarTanda === '='
            ? ' — ' + esc(q.a.nama) + ' dan ' + esc(q.b.nama) + ' sama banyak.'
            : ' — ' + esc(benarTanda === '>' ? q.a.nama : q.b.nama) + ' lebih banyak.') +
          ' 📣 Pelapor, jelaskan alasannya kepada tim!'
      ) +
        buildFracStripCompare([q.a, q.b], {
          common: K <= 36 ? K : null,
          half: true,
          highlight: benarTanda === '>' ? 0 : benarTanda === '<' ? 1 : null,
        }),
      'panel--info'
    );
  }

  var nav = '';
  if (tandaOk) {
    nav =
      idx < soal.length - 1
        ? buildDlNextButton('bandingNextSoal', 'Soal Berikutnya →')
        : buildDlNextButton('bandingNextBtn', D.nextLabel, true);
  }

  container.innerHTML =
    '<section aria-label="Bandingkan Pecahan">' +
    buildHead(D) +
    '<p class="tim-bar">👥 <strong>' +
    esc(namaTim()) +
    '</strong> · Kerjakan bersama, isi di buku juga!</p>' +
    buildDlPanel(
      buildProgressDots(soal.length, idx, statuses) +
        '<p class="banding-konteks">' +
        roleTag('pembaca') +
        '<br>' +
        T(q.konteks) +
        '</p>' +
        '<div class="banding-duel" aria-label="' +
        esc(
          'Bandingkan ' + bacaPecahan(q.a.num, q.a.den) + ' dan ' + bacaPecahan(q.b.num, q.b.den)
        ) +
        '">' +
        '<div class="banding-duel__item">' +
        buildFracBlock(q.a.num, q.a.den, null, 'large') +
        '<span class="banding-duel__name">' +
        esc(q.a.nama) +
        '</span></div>' +
        '<span class="banding-duel__sign' +
        (tandaOk ? ' is-ok' : '') +
        '">' +
        (tandaOk ? esc(benarTanda) : '?') +
        '</span>' +
        '<div class="banding-duel__item">' +
        buildFracBlock(q.b.num, q.b.den, null, 'large') +
        '<span class="banding-duel__name">' +
        esc(q.b.nama) +
        '</span></div>' +
        '</div>' +
        stepsHTML +
        tandaHTML
    ) +
    hasilHTML +
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost btn--small" id="bandingPrev">← Soal sebelumnya</button>'
      : '<span></span>') +
    '</div>' +
    nav +
    '</section>';

  function rerender() {
    renderBandingkan(container);
  }

  for (var j = 0; j < steps.length; j++) {
    bindDlStep('bd' + j, st.steps[j], steps[j], saveState, rerender);
  }

  bindChoices(container, null, function (id) {
    if (st.tanda === benarTanda) return;
    if (!st.tandaPertama) st.tandaPertama = id;
    st.tanda = id;
    saveState();
    rerender();
  });

  var prev = document.getElementById('bandingPrev');
  if (prev) {
    prev.addEventListener('click', function () {
      State.bandingIdx = idx - 1;
      saveState();
      rerender();
    });
  }
  var nextSoal = document.getElementById('bandingNextSoal');
  if (nextSoal) {
    nextSoal.addEventListener('click', function () {
      State.bandingIdx = idx + 1;
      saveState();
      rerender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var finish = document.getElementById('bandingNextBtn');
  if (finish) {
    finish.addEventListener('click', function () {
      var belum = soal.filter(function (x) {
        return State.bandingStates[x.id].tanda !== tandaBenar(x);
      });
      if (belum.length) {
        showNotice('Masih ada soal yang belum selesai.');
        return;
      }
      completeStage('bandingkan');
      navigateTo('urutkan');
    });
  }

  /* Fokus ke isian langkah yang sedang dikerjakan. */
  var aktif = container.querySelector('.dl-step:not(.dl-step--done) .dl-num-input');
  if (aktif && document.activeElement === document.body) aktif.focus({ preventScroll: true });
}

/* ============================================================
   9. STAGE: URUTKAN (CL fase 4)
   ============================================================ */

function urutanBenar(q) {
  return sortFractions(q.items, q.arah === 'turun').map(function (it) {
    return it.id;
  });
}

function urutSelesai(q) {
  var st = State.urutStates[q.id];
  return !!(st && st.checked && st.correct);
}

function renderUrutkan(container) {
  var D = DATA.urutkan;
  var soal = D.soal;
  var idx = State.urutIdx;
  var q = soal[idx];
  var st = State.urutStates[q.id];
  var benar = urutanBenar(q);
  var selesai = urutSelesai(q);
  var hintLevel = State.urutHint[q.id] || 0;
  var turun = q.arah === 'turun';

  var items = q.items.map(function (it) {
    return {
      id: it.id,
      html:
        '<span class="urut-card__name">' +
        esc(it.nama) +
        '</span>' +
        buildFracInline(it.num, it.den),
      aria: it.nama + ', ' + bacaPecahan(it.num, it.den) + ' ' + it.satuan,
    };
  });

  var statuses = soal.map(function (x) {
    var s2 = State.urutStates[x.id];
    if (!urutSelesai(x)) return s2.checked ? 'incorrect' : null;
    return s2.attempts === 1 ? 'correct' : 'incorrect';
  });

  var feedback = '';
  if (st.checked && !st.correct) {
    feedback = buildFeedbackBox(
      'error',
      '✗',
      'Ada kartu yang belum di tempatnya (ditandai merah). Tekan <strong>Perbaiki Urutan</strong>; kartu yang sudah benar tetap di tempat. 🔍 Pemeriksa, cek dengan menyamakan penyebut!'
    );
  }

  var pembahasan = '';
  if (selesai) {
    var K = kpkList(
      q.items.map(function (it) {
        return it.den;
      })
    );
    var urut = benar.map(function (id) {
      return q.items.filter(function (it) {
        return it.id === id;
      })[0];
    });
    pembahasan = buildDlPanel(
      buildFeedbackBox(
        'success',
        '🎉',
        '<strong>Urutan tepat' +
          (st.attempts === 1 ? ' pada percobaan pertama!' : '!') +
          '</strong> ' +
          urut
            .map(function (it) {
              return F(it);
            })
            .join(turun ? ' &gt; ' : ' &lt; ')
      ) +
        '<p class="pembahasan-senilai"><strong>Dengan KPK ' +
        K +
        ':</strong> ' +
        daftarSenilai(q.items, K) +
        '</p>' +
        buildFracNumberLine(q.items, { ticks: K }),
      'panel--info'
    );
  }

  var nav = '';
  if (selesai) {
    nav =
      idx < soal.length - 1
        ? buildDlNextButton('urutNextSoal', 'Soal Berikutnya →')
        : buildDlNextButton('urutNextBtn', D.nextLabel, true);
  }

  container.innerHTML =
    '<section aria-label="Urutkan Pecahan">' +
    buildHead(D) +
    '<p class="tim-bar">👥 <strong>' +
    esc(namaTim()) +
    '</strong> · Diskusikan dulu, baru ketuk kartu!</p>' +
    buildDlPanel(
      buildProgressDots(soal.length, idx, statuses) +
        '<h2 class="urut-judul"><span aria-hidden="true">' +
        q.ikon +
        '</span> ' +
        esc(q.judul) +
        '</h2>' +
        '<p>' +
        roleTag('pembaca') +
        '<br>' +
        q.konteks +
        '</p>' +
        '<p class="urut-arah">' +
        (turun ? '⬇️ Urutan TURUN: terbesar → terkecil' : '⬆️ Urutan NAIK: terkecil → terbesar') +
        '</p>' +
        buildOrderBoard('urutBoard', items, st, {
          correct: benar,
          fromLabel: turun ? 'Terbanyak' : 'Terkecil',
          toLabel: turun ? 'Paling sedikit' : 'Terbesar',
        }) +
        feedback +
        (selesai
          ? ''
          : buildHintStack(q.hints.map(T), hintLevel) +
            '<div style="margin-top:var(--space-2);">' +
            buildHintToggle('urutHintBtn', q.hints, hintLevel) +
            '</div>')
    ) +
    pembahasan +
    '<div class="btn-group btn-group--spread">' +
    (idx > 0
      ? '<button type="button" class="btn btn--ghost btn--small" id="urutPrev">← Soal sebelumnya</button>'
      : '<span></span>') +
    '</div>' +
    nav +
    '</section>';

  function rerender() {
    renderUrutkan(container);
  }

  bindOrderBoard(container, 'urutBoard', st, {
    correct: benar,
    save: saveState,
    rerender: rerender,
  });

  var hintBtn = document.getElementById('urutHintBtn');
  if (hintBtn) {
    hintBtn.addEventListener('click', function () {
      State.urutHint[q.id] = Math.min(hintLevel + 1, q.hints.length);
      saveState();
      rerender();
    });
  }

  var prev = document.getElementById('urutPrev');
  if (prev) {
    prev.addEventListener('click', function () {
      State.urutIdx = idx - 1;
      saveState();
      rerender();
    });
  }
  var nextSoal = document.getElementById('urutNextSoal');
  if (nextSoal) {
    nextSoal.addEventListener('click', function () {
      State.urutIdx = idx + 1;
      saveState();
      rerender();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  var finish = document.getElementById('urutNextBtn');
  if (finish) {
    finish.addEventListener('click', function () {
      if (!soal.every(urutSelesai)) {
        showNotice('Masih ada soal yang belum selesai.');
        return;
      }
      completeStage('urutkan');
      navigateTo('kuis');
    });
  }
}

/* ============================================================
   10. STAGE: KUIS INDIVIDU (CL fase 5)
   ============================================================ */

var KuisStage = createExerciseStage({
  soal: KUIS_SOAL,
  defaultType: 'choice',
  getExercises: function () {
    return State.kuisStates;
  },
  getIndex: function () {
    return State.kuisIdx;
  },
  setIndex: function (i) {
    State.kuisIdx = i;
  },
  save: saveState,
  idPrefix: 'kuis',
  sectionLabel: 'Kuis Individu',
  instruction: DATA.kuis.instruction,
  buildHead: function () {
    return buildHead(DATA.kuis);
  },
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  renderPrompt: function (s) {
    return '<p class="kuis-tanya">' + s.tanya + '</p>';
  },
  nextStageId: 'penghargaan',
  completeStageId: 'kuis',
  nextButtonLabel: DATA.kuis.nextLabel,
});

function renderKuis(container) {
  KuisStage.render(container);
}

/* ============================================================
   11. STAGE: PENGHARGAAN (CL fase 6)
   ============================================================ */

function renderPenghargaan(container) {
  var D = DATA.penghargaan;
  var sk = hitungSkor();
  var p = sk.predikat;
  var anggota = DATA.peran.map(function (r) {
    return {
      id: r.id,
      label:
        r.ikon +
        ' ' +
        esc(State.timPeran[r.id] || r.nama) +
        ' <small>(' +
        esc(r.nama) +
        ')</small>',
    };
  });

  container.innerHTML =
    '<section aria-label="Penghargaan Tim">' +
    buildHead(D) +
    '<div class="reward-card">' +
    '<span class="reward-card__icon" aria-hidden="true">' +
    p.ikon +
    '</span>' +
    '<p class="reward-card__team">' +
    esc(namaTim()) +
    '</p>' +
    '<h2 class="reward-card__title">' +
    esc(p.nama) +
    '</h2>' +
    '<p class="reward-card__text">' +
    esc(p.teks) +
    '</p>' +
    '<div class="reward-meter" role="img" aria-label="Nilai tim ' +
    sk.nilai +
    ' dari 100">' +
    '<span class="reward-meter__fill" style="width:' +
    sk.nilai +
    '%"></span>' +
    '</div>' +
    '<p class="reward-card__score">Nilai tim: <strong>' +
    sk.nilai +
    '</strong> / 100</p>' +
    '</div>' +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartu(
          sk.bandingPertama + '/' + DATA.bandingkan.soal.length,
          'Bandingkan: tanda tepat pada pilihan pertama'
        ) +
        kartu(
          sk.urutPertama + '/' + DATA.urutkan.soal.length,
          'Urutkan: tepat pada percobaan pertama'
        ) +
        kartu(sk.kuisBenar + '/' + KUIS_SOAL.length, 'Kuis individu benar') +
        '</div>' +
        '<p class="dl-caption">Nilai tim = rata-rata skor LKPD tim (' +
        sk.skorLkpd +
        ') dan skor kuis individu (' +
        sk.skorKuis +
        '). Predikat: 🏆 Tim Super ≥ 85 · 🥇 Tim Hebat ≥ 70 · 🌟 Tim Baik.</p>'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🎭 Anggota tim</h3>' +
        buildRoleCards(DATA.peran, State.timPeran, { locked: true }) +
        '<p class="exercise-label">' +
        esc(D.apresiasiLabel) +
        '</p>' +
        buildChoiceGroup(anggota, State.apresiasiOrder, { chosen: State.apresiasi }) +
        (State.apresiasi ? buildFeedbackBox('success', '💐', esc(D.apresiasiUmpan)) : '')
    ) +
    buildDlNextButton('penghargaanNextBtn', D.nextLabel, true) +
    '</section>';

  bindChoices(container, null, function (id) {
    State.apresiasi = id;
    saveState();
    renderPenghargaan(container);
  });

  document.getElementById('penghargaanNextBtn').addEventListener('click', function () {
    if (!State.apresiasi) {
      showNotice('Pilih dulu anggota yang ingin kamu apresiasi.');
      return;
    }
    completeStage('penghargaan');
    navigateTo('refleksi');
  });
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;

  container.innerHTML =
    '<section aria-label="Refleksi">' +
    buildHead(D) +
    buildDlPanel(
      '<p class="exercise-label">✅ Benar atau keliru? Pilih untuk setiap pernyataan.</p>' +
        buildSortItems(REFLEKSI_ITEMS, State.refleksiOrder, D.opsi, State.refleksiStates)
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
        buildChoiceGroup(D.diriOpsi, State.refleksiDiriOrder, {
          chosen: State.refleksiDiri,
          group: 'diri',
        })
    ) +
    '<div class="btn-group btn-group--spread">' +
    '<span class="dl-caption" style="align-self:center;">Jawaban tersimpan di perangkatmu saja, tidak dikirim ke mana pun.</span>' +
    '<button type="button" class="btn btn--primary" id="refleksiNextBtn">' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  function rerender() {
    renderRefleksi(container);
  }

  bindSortItems(container, REFLEKSI_ITEMS, State.refleksiStates, saveState, rerender);

  container.querySelectorAll('textarea[data-rid]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      State.refleksiAnswers[ta.dataset.rid] = ta.value;
      saveState();
    });
  });

  bindChoices(container, 'diri', function (id) {
    State.refleksiDiri = id;
    saveState();
    rerender();
  });

  document.getElementById('refleksiNextBtn').addEventListener('click', function () {
    if (!sortItemsAllAnswered(REFLEKSI_ITEMS, State.refleksiStates)) {
      showNotice('Jawab dulu semua pernyataan benar/keliru.');
      return;
    }
    if (!State.refleksiDiri) {
      showNotice('Pilih dulu seberapa yakin kamu sekarang.');
      return;
    }
    completeStage('refleksi');
    navigateTo('selesai');
  });
}

/* ============================================================
   13. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var D = DATA.selesai;
  var sk = hitungSkor();

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">' +
    sk.predikat.ikon +
    '</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    '<p class="done-card__lead">' +
    esc(namaTim()) +
    ' meraih predikat <strong>' +
    esc(sk.predikat.nama) +
    '</strong>. ' +
    esc(D.teks) +
    '</p>' +
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Samakan penyebut</span>' +
    T('{2/3} = {8/12} &lt; {9/12} = {3/4}') +
    '</div>' +
    '<div class="formula-card"><span class="formula-card__label">Kali silang</span>' +
    T('{a/b} &lt; {c/d} bila a × d &lt; c × b') +
    '</div>' +
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
    'Nilai tim adalah indikator latihan digital, bukan nilai akhir. Kumpulkan catatan LKPD di buku tiap tim dan minta Pelapor mempresentasikan satu soal urutan untuk memastikan setiap anggota dapat menjelaskan strateginya.' +
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
   14. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  sajian: renderSajian,
  kelompok: renderKelompok,
  bandingkan: renderBandingkan,
  urutkan: renderUrutkan,
  kuis: renderKuis,
  penghargaan: renderPenghargaan,
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
   15. HELPER UI — MODAL RESET
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
   16. INIT
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
