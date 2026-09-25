'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Asosiasi Dua Variabel — Tabel Kontingensi &
   Diagram Pencar
   Fase F — SMK Rekayasa Perangkat Lunak, Discovery Learning

   Utilitas & komponen bersama berada di shared/engine.js:
     • mesin tahap, store, latihan soal (createStageMachine,
       createStore, createExerciseStage, ensureExerciseArray);
     • komponen penemuan (ensureShuffledOrder, orderByIds,
       buildDiscoveryHead, buildTeacherNote, buildChoiceGroup,
       buildDlStep, ensureSortStates, buildSortItems,
       buildGuidedQuizList);
     • seksi 33 — asosiasi dua variabel: tabel kontingensi,
       persen baris, kartu turus, plotter & diagram pencar, batang
       tersegmen, lab data kelas.

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Stimulasi            (DL sintaks 1)
    6. Stage: Identifikasi Masalah (DL sintaks 2)
    7. Stage: Data Kategori        (DL sintaks 3)
    8. Stage: Data Numerik         (DL sintaks 3)
    9. Stage: Olah Data            (DL sintaks 4)
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
   1. KONSTANTA
   ============================================================ */

var STAGES = DATA.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = DATA.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-f-11-1-asosiasi-dl-v1';

var SV = DATA.survei;

/* Tabel kontingensi 20 kartu turus (kunci tahap 3). */
var TABEL_KARTU = tabelKontingensi(
  SV.kartu,
  'ekskul',
  'sert',
  SV.ekskul.kategori,
  SV.sertifikasi.kategori
);

/* Tabel lengkap 80 responden. */
var TABEL_SURVEI = tabelDariSel(SV.sel, SV.ekskul.kategori, SV.sertifikasi.kategori);

/* Seluruh 24 titik latihan mengetik vs kecepatan mengetik. */
var TITIK_SURVEI = SV.plot.concat(SV.lainnya);

var OPSI_PLOT = {
  x: SV.sumbuX,
  y: SV.sumbuY,
  xLabel: SV.xLabel,
  yLabel: SV.yLabel,
  satuanX: SV.satuanX,
  satuanY: SV.satuanY,
};

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'stimulasi',
  completedStages: {},

  /* Tahap 1 — stimulasi (dugaan, tidak dinilai) */
  klaimOrders: {},
  klaimPilih: {},
  stimulasiAlasan: '',

  /* Tahap 2 — identifikasi masalah */
  masalahOrders: {},
  masalahPilih: {},
  variabelStates: {},
  variabelOrder: null,
  hipotesisTeks: '',

  /* Tahap 3 — data kategori (turus) */
  turusTanda: {},
  turusIsian: {},
  turusSalah: [],
  turusBenar: false,
  turusAttempts: 0,
  turusHint: 0,

  /* Tahap 4 — data numerik (plotter) */
  plotter: null,

  /* Tahap 5 — olah data */
  persenSteps: [],
  olahMode: 'frekuensi',
  olahOrders: {},
  olahPilih: {},
  olahTren: false,

  /* Tahap 6 — pembuktian */
  pencarStates: {},
  pencarOrder: null,
  tabelStates: {},
  tabelOrder: null,
  pernyataanStates: {},
  pernyataanOrder: null,
  lab: null,
  labCatatan: '',

  /* Tahap 7 — kesimpulan */
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

/* Mengacak opsi setiap pertanyaan { id, opsi } ke map urutan per id. */
function siapkanUrutan(map, list) {
  list.forEach(function (q) {
    ensureShuffledOrder(map, q.id, q.opsi);
  });
}

function pastikanObjek(key) {
  if (!State[key] || typeof State[key] !== 'object' || Array.isArray(State[key])) {
    State[key] = {};
  }
}

/*
 * Menyiapkan seluruh state per-aktivitas DAN seluruh urutan acak
 * pilihan jawaban. Dipanggil sekali saat init (setelah loadState) dan
 * setiap kali progress direset.
 */
function initExerciseArrays() {
  [
    'klaimOrders',
    'klaimPilih',
    'masalahOrders',
    'masalahPilih',
    'turusTanda',
    'turusIsian',
    'olahOrders',
    'olahPilih',
    'simpulanPilihan',
    'refleksiAnswers',
  ].forEach(pastikanObjek);
  if (!Array.isArray(State.turusSalah)) State.turusSalah = [];

  /* Tahap 1 — setiap klaim punya urutan opsi dugaan sendiri */
  DATA.stimulasi.klaim.forEach(function (k) {
    ensureShuffledOrder(State.klaimOrders, k.id, k.opsi);
  });

  /* Tahap 2 */
  siapkanUrutan(State.masalahOrders, [DATA.masalah.pertanyaan]);
  ensureSortStates(
    State,
    'variabelStates',
    'variabelOrder',
    DATA.masalah.variabel,
    DATA.masalah.opsiJenis
  );

  /* Tahap 4 */
  if (!State.plotter || typeof State.plotter.placed !== 'object' || !State.plotter.placed) {
    State.plotter = makePlotterState();
  }

  /* Tahap 5 */
  ensureExerciseArray(State, 'persenSteps', DATA.olah.langkahPersen, makeDlStep);
  siapkanUrutan(State.olahOrders, DATA.olah.tanyaKategori.concat(DATA.olah.tanyaNumerik));

  /* Tahap 6 */
  ensureSortStates(State, 'pencarStates', 'pencarOrder', DATA.verifikasi.pencar, OPSI_ARAH);
  ensureSortStates(
    State,
    'tabelStates',
    'tabelOrder',
    DATA.verifikasi.tabel,
    DATA.verifikasi.opsiTabel
  );
  ensureSortStates(
    State,
    'pernyataanStates',
    'pernyataanOrder',
    DATA.verifikasi.pernyataan,
    DATA.verifikasi.opsiPernyataan
  );
  if (!State.lab || !Array.isArray(State.lab.numerik) || !Array.isArray(State.lab.kategori)) {
    State.lab = makeLabDataKelas();
  }

  /* Tahap 7 */
  ensureShuffledOrder(State, 'bankOrder', DATA.generalisasi.bank);

  /* Tahap 8 — uji terap (dirender createExerciseStage) */
  ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (s) {
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
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
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

function lanjut(dari, ke) {
  completeStage(dari);
  navigateTo(ke);
}

/* ============================================================
   4. UTILITAS RENDER
   ============================================================ */

/* Kepala tahap + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

var panel = buildDlPanel;
var nextButton = buildDlNextButton;

function textarea(id, value, placeholder, attr) {
  return (
    '<textarea id="' +
    id +
    '" class="input-textarea" ' +
    (attr || '') +
    ' placeholder="' +
    esc(placeholder) +
    '">' +
    esc(value || '') +
    '</textarea>'
  );
}

function bindTextarea(root, id, onInput) {
  var ta = root.querySelector('#' + id);
  if (ta) {
    ta.addEventListener('input', function () {
      onInput(ta.value);
      saveState();
    });
  }
}

/* Tombol lanjut yang dipasang hanya bila ada di DOM. */
function bindNext(id, fn) {
  var btn = document.getElementById(id);
  if (btn) btn.addEventListener('click', fn);
}

/* Diagram pencar 24 siswa survei. */
function pencarSurvei(opts) {
  return buildScatterPlot(
    TITIK_SURVEI,
    Object.assign(
      {
        x: SV.sumbuX,
        y: SV.sumbuY,
        xLabel: SV.xLabel,
        yLabel: SV.yLabel,
        caption:
          'Diagram pencar 24 siswa: lama latihan mengetik (jam per minggu) terhadap kecepatan mengetik (kata per menit)',
      },
      opts || {}
    )
  );
}

/* Tabel lengkap 80 responden. */
function tabelSurveiHTML(mode) {
  return buildContingencyTable(TABEL_SURVEI, {
    mode: mode,
    judulBaris: DATA.koleksiKategori.judulBaris,
    judulKolom: DATA.koleksiKategori.judulKolom,
    caption:
      DATA.survei.judul + (mode === 'persen' ? ' — persen baris' : ' — frekuensi (80 siswa)'),
  });
}

/* ============================================================
   5. STAGE: STIMULASI  (Discovery Learning — sintaks 1)
   ============================================================ */

function lembarMentah() {
  var D = DATA.stimulasi;
  return (
    '<div class="aso-tabel-wrap"><table class="aso-tabel aso-lembar">' +
    '<caption class="aso-tabel__caption">Cuplikan lembar survei (8 dari 80 baris)</caption>' +
    '<thead><tr>' +
    D.kolomLembar
      .map(function (k) {
        return '<th scope="col">' + esc(k) + '</th>';
      })
      .join('') +
    '</tr></thead><tbody>' +
    D.lembar
      .map(function (r) {
        return (
          '<tr><th scope="row">' +
          esc(r[0]) +
          '</th>' +
          r
            .slice(1)
            .map(function (v) {
              return '<td>' + esc(v) + '</td>';
            })
            .join('') +
          '</tr>'
        );
      })
      .join('') +
    '<tr><td colspan="' +
    D.kolomLembar.length +
    '" class="aso-lembar__more">… 72 baris lainnya</td></tr>' +
    '</tbody></table></div>'
  );
}

function renderStimulasi(container) {
  var D = DATA.stimulasi;

  container.innerHTML =
    '<section aria-label="Stimulasi">' +
    buildHead(D) +
    panel(
      '<h2 class="aso-judul">' +
        esc(D.judul) +
        '</h2>' +
        '<p>' +
        esc(D.cerita) +
        '</p>' +
        '<div class="aso-mading">' +
        D.klaim
          .map(function (k) {
            return (
              '<blockquote class="aso-klaim"><span class="aso-klaim__ikon" aria-hidden="true">' +
              k.ikon +
              '</span><p>' +
              esc(k.teks) +
              '</p></blockquote>'
            );
          })
          .join('') +
        '</div>' +
        lembarMentah(),
      'panel--hero'
    ) +
    panel(
      D.klaim
        .map(function (k, i) {
          return (
            '<p class="exercise-label' +
            (i ? ' aso-label-atas' : '') +
            '">' +
            k.ikon +
            ' ' +
            esc(k.tanya) +
            '</p>' +
            buildChoiceGroup(k.opsi, State.klaimOrders[k.id], {
              chosen: State.klaimPilih[k.id] || null,
              group: k.id,
              attr: 'data-klaim',
            })
          );
        })
        .join('') +
        '<label for="stimulasiAlasan" class="dl-refleksi-q aso-label-atas">' +
        esc(D.alasanLabel) +
        '</label>' +
        textarea('stimulasiAlasan', State.stimulasiAlasan, D.alasanPlaceholder) +
        '<p class="dl-caption">' +
        esc(D.catatan) +
        '</p>'
    ) +
    nextButton('stimulasiNextBtn', D.nextLabel, true) +
    '</section>';

  container.querySelectorAll('[data-klaim]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.klaimPilih[btn.dataset.group] = btn.dataset.klaim;
      saveState();
      renderStimulasi(container);
    });
  });
  bindTextarea(container, 'stimulasiAlasan', function (v) {
    State.stimulasiAlasan = v;
  });
  bindNext('stimulasiNextBtn', function () {
    var belum = D.klaim.some(function (k) {
      return !State.klaimPilih[k.id];
    });
    if (belum) {
      showNotice('Pilih dugaanmu untuk kedua klaim.');
      return;
    }
    if (State.stimulasiAlasan.trim().length < 5) {
      showNotice('Tulis alasan dugaanmu terlebih dahulu.');
      return;
    }
    lanjut('stimulasi', 'masalah');
  });
}

/* ============================================================
   6. STAGE: IDENTIFIKASI MASALAH  (Discovery Learning — sintaks 2)
   ============================================================ */

function renderMasalah(container) {
  var D = DATA.masalah;
  var list = [D.pertanyaan];
  var rumusanBenar = guidedQuizAllCorrect(list, State.masalahPilih);
  var pilahSelesai = rumusanBenar && sortItemsAllAnswered(D.variabel, State.variabelStates);

  container.innerHTML =
    '<section aria-label="Identifikasi Masalah">' +
    buildHead(D) +
    panel('<p style="margin:0;">' + esc(D.pengantar) + '</p>', 'panel--info') +
    panel(buildGuidedQuizList(list, State.masalahOrders, State.masalahPilih)) +
    (rumusanBenar
      ? panel(
          '<h3 style="margin-top:0;">' +
            esc(D.pilahInstruksi) +
            '</h3>' +
            buildSortItems(D.variabel, State.variabelOrder, D.opsiJenis, State.variabelStates)
        )
      : '') +
    (pilahSelesai
      ? panel(
          '<label for="hipotesisTeks" class="dl-refleksi-q">' +
            esc(D.hipotesisLabel) +
            '</label>' +
            textarea('hipotesisTeks', State.hipotesisTeks, D.hipotesisPlaceholder)
        ) + nextButton('masalahNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  function ulang() {
    renderMasalah(container);
  }

  bindGuidedQuizList(container, list, State.masalahPilih, saveState, ulang);
  bindSortItems(container, D.variabel, State.variabelStates, saveState, ulang);
  bindTextarea(container, 'hipotesisTeks', function (v) {
    State.hipotesisTeks = v;
  });
  bindNext('masalahNextBtn', function () {
    if (State.hipotesisTeks.trim().length < D.minPanjang) {
      showNotice('Tulis hipotesismu dengan lebih lengkap.');
      return;
    }
    lanjut('masalah', 'koleksiKategori');
  });
}

/* ============================================================
   7. STAGE: DATA KATEGORI  (Discovery Learning — sintaks 3)
   Kartu turus + isian tabel kontingensi 2 × 2 dengan total.
   ============================================================ */

function banyakDitandai() {
  return SV.kartu.filter(function (k) {
    return State.turusTanda[k.id];
  }).length;
}

function pesanTurusSalah() {
  var s = State.turusSalah;
  var selSalah = s.filter(function (k) {
    return k.indexOf('sel-') === 0;
  }).length;
  if (selSalah === 0) {
    return 'Isi keempat sel sudah tepat, tetapi masih ada <strong>total</strong> yang keliru. Jumlahkan lagi setiap baris dan kolom.';
  }
  return (
    'Ada <strong>' +
    selSalah +
    ' sel</strong> yang belum tepat (ditandai merah). Hitung ulang kartu untuk pasangan kategori itu — ketuk kartu agar tidak terhitung dua kali.'
  );
}

function renderKoleksiKategori(container, fokusKartu) {
  var D = DATA.koleksiKategori;
  var benar = State.turusBenar;

  container.innerHTML =
    '<section aria-label="Pengumpulan Data Kategorikal">' +
    buildHead(D) +
    panel(
      '<p style="margin-top:0;">' +
        esc(D.pengantar) +
        '</p>' +
        '<p class="aso-turus-count" aria-live="polite"><strong>' +
        banyakDitandai() +
        '</strong> dari ' +
        SV.kartu.length +
        ' kartu sudah ditandai</p>' +
        buildTallyCards('turus', SV.kartu, State.turusTanda, {
          fields: [SV.ekskul, SV.sertifikasi],
        })
    ) +
    panel(
      '<p class="exercise-label" style="margin-top:0;">' +
        esc(D.tabelInstruksi) +
        '</p>' +
        buildContingencyInput('tk', TABEL_KARTU, State.turusIsian, {
          total: true,
          salah: benar ? [] : State.turusSalah,
          terkunci: benar,
          judulBaris: D.judulBaris,
          judulKolom: D.judulKolom,
        }) +
        (benar
          ? buildFeedbackBox('success', '✓', D.temuan)
          : '<div class="dl-input-row">' +
            '<button type="button" class="btn btn--primary" id="turusCheckBtn">Periksa Tabel</button>' +
            buildHintToggle('turusHintBtn', D.hints, State.turusHint) +
            '</div>' +
            (State.turusSalah.length && State.turusAttempts
              ? '<div style="margin-top:var(--space-3);">' +
                buildFeedbackBox('error', '✗', pesanTurusSalah()) +
                '</div>'
              : '') +
            buildHintStack(D.hints, State.turusHint))
    ) +
    (benar
      ? panel(
          '<h3 style="margin-top:0;">' +
            esc(D.lengkapJudul) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.lengkapCatatan) +
            '</p>' +
            tabelSurveiHTML('frekuensi')
        ) + nextButton('kategoriNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  function ulang(rid) {
    renderKoleksiKategori(container, rid);
  }

  bindTallyCards(container, 'turus', State.turusTanda, saveState, ulang);
  if (fokusKartu) {
    var kartu = container.querySelector('[data-tally="' + fokusKartu + '"]');
    if (kartu) kartu.focus();
  }
  bindContingencyInput(container, 'tk', State.turusIsian, saveState, function () {
    var b = document.getElementById('turusCheckBtn');
    if (b) b.click();
  });
  bindNext('turusCheckBtn', function () {
    var cek = cekIsianKontingensi(TABEL_KARTU, State.turusIsian, { total: true });
    if (!cek.lengkap) {
      showNotice('Lengkapi semua kotak tabel, termasuk totalnya.');
      return;
    }
    State.turusAttempts += 1;
    State.turusSalah = cek.salah;
    State.turusBenar = cek.benar;
    saveState();
    ulang();
  });
  bindNext('turusHintBtn', function () {
    State.turusHint = Math.min(State.turusHint + 1, D.hints.length);
    saveState();
    ulang();
  });
  bindNext('kategoriNextBtn', function () {
    lanjut('koleksiKategori', 'koleksiNumerik');
  });
}

/* ============================================================
   8. STAGE: DATA NUMERIK  (Discovery Learning — sintaks 3)
   Plotter diagram pencar 8 titik, lalu diagram lengkap 24 siswa.
   ============================================================ */

function renderKoleksiNumerik(container, fokusGrafik) {
  var D = DATA.koleksiNumerik;
  var st = State.plotter;
  var selesai = plotterSelesai(SV.plot, st);
  var aktif = plotterAktif(SV.plot, st);

  container.innerHTML =
    '<section aria-label="Pengumpulan Data Numerik">' +
    buildHead(D) +
    panel(
      '<p style="margin-top:0;">' +
        esc(D.pengantar) +
        '</p>' +
        buildScatterPlotter('plot', SV.plot, st, OPSI_PLOT) +
        (st.salah && aktif
          ? buildFeedbackBox(
              'error',
              '✗',
              '<strong>' +
                esc(aktif.label) +
                ':</strong> ' +
                pesanDiagnosaTitik(st.salah.kode, aktif, OPSI_PLOT, st.salah.x, st.salah.y)
            )
          : '') +
        (selesai ? buildFeedbackBox('success', '✓', D.temuan) : '')
    ) +
    (selesai
      ? panel(
          '<h3 style="margin-top:0;">' +
            esc(D.lengkapJudul) +
            '</h3>' +
            '<p class="dl-caption">' +
            esc(D.lengkapCatatan) +
            '</p>' +
            pencarSurvei({ sorot: optionIds(SV.plot) })
        ) + nextButton('numerikNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  bindScatterPlotter(container, 'plot', SV.plot, st, OPSI_PLOT, function () {
    var dariGrafik = document.activeElement && document.activeElement.id === 'plot-svg';
    saveState();
    renderKoleksiNumerik(container, dariGrafik);
  });
  if (fokusGrafik) {
    var svg = container.querySelector('#plot-svg');
    if (svg) svg.focus();
    else {
      var lanjutBtn = document.getElementById('numerikNextBtn');
      if (lanjutBtn) lanjutBtn.focus();
    }
  }
  bindNext('numerikNextBtn', function () {
    lanjut('koleksiNumerik', 'olah');
  });
}

/* ============================================================
   9. STAGE: OLAH DATA  (Discovery Learning — sintaks 4)
   ============================================================ */

function persenSelesai() {
  return State.persenSteps.every(function (s) {
    return s.done;
  });
}

function renderOlah(container) {
  var D = DATA.olah;
  var bagianA = persenSelesai();
  var kategoriBenar = bagianA && guidedQuizAllCorrect(D.tanyaKategori, State.olahPilih);
  var numerikBenar = kategoriBenar && guidedQuizAllCorrect(D.tanyaNumerik, State.olahPilih);
  var persen = State.olahMode === 'persen';

  var langkah = D.langkahPersen
    .map(function (step, i) {
      return buildDlStep('persen' + i, State.persenSteps[i], step, i + 1);
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Pengolahan Data">' +
    buildHead(D) +
    panel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulA) +
        '</h3>' +
        '<p>' +
        esc(D.pengantarA) +
        '</p>' +
        tabelSurveiHTML('frekuensi') +
        langkah
    ) +
    (bagianA
      ? panel(
          '<div class="aso-lab__tabs" role="group" aria-label="Tampilan tabel">' +
            '<button type="button" class="aso-lab__tab' +
            (!persen ? ' is-active' : '') +
            '" data-olah-mode="frekuensi" aria-pressed="' +
            !persen +
            '">' +
            esc(D.modeFrekuensi) +
            '</button>' +
            '<button type="button" class="aso-lab__tab' +
            (persen ? ' is-active' : '') +
            '" data-olah-mode="persen" aria-pressed="' +
            persen +
            '">' +
            esc(D.modePersen) +
            '</button>' +
            '</div>' +
            buildContingencyTable(TABEL_SURVEI, {
              mode: State.olahMode,
              judulBaris: DATA.koleksiKategori.judulBaris,
              judulKolom: DATA.koleksiKategori.judulKolom,
              sorotKolom: 0,
            }) +
            buildSegmentedBar(TABEL_SURVEI, {
              caption: 'Persen baris status sertifikasi menurut keikutsertaan ekskul coding',
            }) +
            buildGuidedQuizList(D.tanyaKategori, State.olahOrders, State.olahPilih)
        )
      : '') +
    (kategoriBenar
      ? panel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulB) +
            '</h3>' +
            '<p>' +
            esc(D.pengantarB) +
            '</p>' +
            '<label class="aso-lab__toggle"><input type="checkbox" id="olahTren"' +
            (State.olahTren ? ' checked' : '') +
            '> ' +
            esc(D.trenLabel) +
            '</label>' +
            pencarSurvei({ trend: State.olahTren }) +
            buildGuidedQuizList(D.tanyaNumerik, State.olahOrders, State.olahPilih)
        )
      : '') +
    (numerikBenar ? nextButton('olahNextBtn', D.nextLabel, true) : '') +
    '</section>';

  function ulang() {
    renderOlah(container);
  }

  D.langkahPersen.forEach(function (step, i) {
    bindDlStep('persen' + i, State.persenSteps[i], step, saveState, ulang);
  });
  container.querySelectorAll('[data-olah-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.olahMode = btn.dataset.olahMode;
      saveState();
      ulang();
      var f = container.querySelector('[data-olah-mode="' + State.olahMode + '"]');
      if (f) f.focus();
    });
  });
  var tren = container.querySelector('#olahTren');
  if (tren) {
    tren.addEventListener('change', function () {
      State.olahTren = tren.checked;
      saveState();
      ulang();
      var t = container.querySelector('#olahTren');
      if (t) t.focus();
    });
  }
  bindGuidedQuizList(
    container,
    D.tanyaKategori.concat(D.tanyaNumerik),
    State.olahPilih,
    saveState,
    ulang
  );
  bindNext('olahNextBtn', function () {
    lanjut('olah', 'verifikasi');
  });
}

/* ============================================================
   10. STAGE: PEMBUKTIAN  (Discovery Learning — sintaks 5)
   ============================================================ */

function buildBandingKlaim() {
  var V = DATA.verifikasi;
  return (
    '<div class="aso-banding">' +
    DATA.stimulasi.klaim
      .map(function (k) {
        var pilih = State.klaimPilih[k.id];
        var cocok = pilih === V.kunciKlaim[k.id];
        return (
          '<div class="aso-banding__row aso-banding__row--' +
          (cocok ? 'cocok' : 'beda') +
          '">' +
          '<p class="aso-banding__label">' +
          k.ikon +
          ' ' +
          esc(k.teks) +
          '</p>' +
          '<p><span>Dugaanmu:</span> ' +
          esc(findOptionLabel(k.opsi, pilih) || '—') +
          '</p>' +
          '<p><span>' +
          (cocok ? '✓ Sesuai data' : '✗ Data berkata lain') +
          ':</span> ' +
          esc(V.dataKlaim[k.id]) +
          '</p>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    (State.hipotesisTeks
      ? '<p class="aso-kutip"><strong>Hipotesismu:</strong> “' + esc(State.hipotesisTeks) + '”</p>'
      : '')
  );
}

function visualPencar(p) {
  return buildScatterPlot(p.titik, {
    xLabel: p.xLabel,
    yLabel: p.yLabel,
    kecil: true,
    caption: 'Diagram pencar ' + p.judul,
  });
}

function visualTabel(t) {
  return buildContingencyTable(tabelDariSel(t.sel, t.baris, t.kolom), {
    judulBaris: t.judulBaris,
    judulKolom: t.judulKolom,
  });
}

function itemJudul(list) {
  return list.map(function (it) {
    return {
      id: it.id,
      teks: '<strong>' + esc(it.judul) + '</strong>',
      correct: it.correct,
      explanation: it.explanation,
      src: it,
    };
  });
}

var PENCAR_ITEMS = itemJudul(DATA.verifikasi.pencar);
var TABEL_ITEMS = itemJudul(DATA.verifikasi.tabel);

function renderVerifikasi(container) {
  var D = DATA.verifikasi;
  var pencarSelesai = sortItemsAllAnswered(D.pencar, State.pencarStates);
  var tabelSelesai = pencarSelesai && sortItemsAllAnswered(D.tabel, State.tabelStates);
  var pernyataanSelesai =
    tabelSelesai && sortItemsAllAnswered(D.pernyataan, State.pernyataanStates);

  container.innerHTML =
    '<section aria-label="Pembuktian">' +
    buildHead(D) +
    panel('<h3 style="margin-top:0;">' + esc(D.judulA) + '</h3>' + buildBandingKlaim()) +
    panel(
      '<h3 style="margin-top:0;">' +
        esc(D.judulB) +
        '</h3>' +
        buildSortItems(PENCAR_ITEMS, State.pencarOrder, OPSI_ARAH, State.pencarStates, {
          visual: function (it) {
            return visualPencar(it.src);
          },
        })
    ) +
    (pencarSelesai
      ? panel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulC) +
            '</h3>' +
            buildSortItems(TABEL_ITEMS, State.tabelOrder, D.opsiTabel, State.tabelStates, {
              visual: function (it) {
                return visualTabel(it.src);
              },
            })
        )
      : '') +
    (tabelSelesai
      ? panel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulD) +
            '</h3>' +
            buildSortItems(
              D.pernyataan,
              State.pernyataanOrder,
              D.opsiPernyataan,
              State.pernyataanStates
            )
        )
      : '') +
    (pernyataanSelesai
      ? panel(
          '<h3 style="margin-top:0;">' +
            esc(D.judulE) +
            '</h3>' +
            '<p>' +
            esc(D.pengantarE) +
            '</p>' +
            '<p class="dl-caption">' +
            esc(D.labOpsional) +
            '</p>' +
            buildClassDataLab('lab', State.lab, {
              numerik: D.labNumerik,
              kategori: D.labKategori,
            }) +
            '<label for="labCatatan" class="dl-refleksi-q aso-label-atas">' +
            esc(D.labCatatanLabel) +
            '</label>' +
            textarea('labCatatan', State.labCatatan, D.labCatatanPlaceholder)
        ) +
        '<div class="btn-group btn-group--spread">' +
        '<span class="dl-caption" style="align-self:center;">Diagram pencar benar: ' +
        sortItemsCorrectCount(D.pencar, State.pencarStates) +
        '/' +
        D.pencar.length +
        ' · tabel benar: ' +
        sortItemsCorrectCount(D.tabel, State.tabelStates) +
        '/' +
        D.tabel.length +
        ' · pernyataan benar: ' +
        sortItemsCorrectCount(D.pernyataan, State.pernyataanStates) +
        '/' +
        D.pernyataan.length +
        '</span>' +
        '<button type="button" class="btn btn--primary btn--large" id="verifikasiNextBtn">' +
        esc(D.nextLabel) +
        '</button></div>'
      : '') +
    '</section>';

  function ulang() {
    var y = window.scrollY;
    renderVerifikasi(container);
    window.scrollTo(0, y);
  }

  bindSortItems(container, D.pencar, State.pencarStates, saveState, ulang);
  bindSortItems(container, D.tabel, State.tabelStates, saveState, ulang);
  bindSortItems(container, D.pernyataan, State.pernyataanStates, saveState, ulang);
  bindClassDataLab(
    container,
    'lab',
    State.lab,
    { numerik: D.labNumerik, kategori: D.labKategori },
    saveState,
    ulang
  );
  bindTextarea(container, 'labCatatan', function (v) {
    State.labCatatan = v;
  });
  bindNext('verifikasiNextBtn', function () {
    lanjut('verifikasi', 'generalisasi');
  });
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
          ? '<p class="dl-simpulan-item__note">Belum tepat — ingat kembali data yang kamu olah, lalu pilih potongan lain.</p>'
          : '') +
        '</div>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Menarik Kesimpulan">' +
    buildHead(D) +
    panel('<p style="margin:0;">' + esc(D.instruksi) + '</p>', 'panel--info') +
    panel(
      kalimatHTML +
        (benarSemua
          ? buildFeedbackBox(
              'success',
              '✓',
              '<strong>Kesimpulanmu lengkap dan tepat.</strong> Inilah cara mengidentifikasi asosiasi yang kamu temukan sendiri.'
            )
          : '<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">' +
            '<button type="button" class="btn btn--primary" id="simpulanCheckBtn">Periksa Kesimpulan</button>' +
            '</div>')
    ) +
    (benarSemua
      ? panel(
          '<h3 style="margin-top:0;">Rangkuman Asosiasi Dua Variabel</h3>' +
            '<div class="formula-duo">' +
            '<div class="formula-card"><span class="formula-card__label">Kategorikal × kategorikal</span>Tabel kontingensi → persen baris</div>' +
            '<div class="formula-card"><span class="formula-card__label">Numerik × numerik</span>Diagram pencar → arah &amp; kerapatan</div>' +
            '</div>' +
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
        ) + nextButton('simpulanNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  container.querySelectorAll('[data-simp]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      State.simpulanPilihan[sel.dataset.simp] = sel.value;
      saveState();
    });
  });

  bindNext('simpulanCheckBtn', function () {
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
    else if (!simpulanSemuaBenar()) {
      showNotice('Masih ada yang belum tepat. Periksa tanda merahnya.');
    }
    renderGeneralisasi(container);
  });

  bindNext('simpulanNextBtn', function () {
    lanjut('generalisasi', 'terapkan');
  });
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js): campuran soal 'input'
   (persen, boleh desimal berkoma) dan 'choice'; urutan opsi dari
   ex.optionOrder yang diacak di initExerciseArrays().
   ============================================================ */

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
  defaultType: 'input',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  inputRowClass: 'dl-input-row',
  inputAriaLabel: 'Jawabanmu',
  inputPlaceholder: 'Jawabanmu',
  inputMode: 'decimal',
  revealButtonStyle: 'separate',
  parseInput: parseInputPersen,
  isCorrect: function (v, s) {
    return hampirSama(v, s.jawab);
  },
  invalidMessage: 'Tulis jawaban berupa bilangan persen, mis. 80 atau 37,5.',
  inputSuffix: function (s) {
    return s.satuan ? '<span class="aso-satuan">' + esc(s.satuan) + '</span>' : '';
  },
  checkValue: function (s) {
    return s.jawab;
  },
  revealText: function (s) {
    return s.reveal;
  },
  renderPrompt: function (s) {
    var visual = '';
    if (s.tabel) {
      visual = buildContingencyTable(tabelDariSel(s.tabel.sel, s.tabel.baris, s.tabel.kolom), {
        judulBaris: s.tabel.judulBaris,
        judulKolom: s.tabel.judulKolom,
      });
    } else if (s.pencar) {
      visual = buildScatterPlot(s.pencar.titik, {
        xLabel: s.pencar.xLabel,
        yLabel: s.pencar.yLabel,
        kecil: true,
        caption: 'Diagram pencar ' + s.pencar.xLabel + ' terhadap ' + s.pencar.yLabel,
      });
    }
    return (
      '<div class="dl-prompt">' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      visual +
      '<p class="dl-prompt__tanya">' +
      s.pertanyaan +
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
  var V = DATA.verifikasi;
  var benarPilah =
    sortItemsCorrectCount(V.pencar, State.pencarStates) +
    sortItemsCorrectCount(V.tabel, State.tabelStates);
  var benarTerap = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var titikSekali = SV.plot.length / Math.max(SV.plot.length, State.plotter.attempts || 0);

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
    panel(
      '<div class="summary-grid">' +
        kartu(State.turusAttempts || '—', 'Kali memeriksa tabel kontingensi sampai tepat') +
        kartu(Math.round(titikSekali * 100) + '%', 'Ketepatan memplot titik') +
        kartu(
          benarPilah + '/' + (V.pencar.length + V.tabel.length),
          'Diagram & tabel dipilah tepat'
        ) +
        kartu(benarTerap + '/' + DATA.terapkan.soal.length, 'Uji terap benar') +
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
          textarea(
            'ref-' + q.id,
            State.refleksiAnswers[q.id],
            q.placeholder,
            'data-rid="' + q.id + '"'
          ) +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    panel(
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

  bindNext('refleksiSaveBtn', function () {
    if (!State.refleksiDiri) {
      showNotice('Pilih dulu seberapa yakin kamu sekarang.');
      return;
    }
    lanjut('refleksi', 'selesai');
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
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Kategorikal × kategorikal</span>Tabel kontingensi → persen baris</div>' +
    '<div class="formula-card"><span class="formula-card__label">Numerik × numerik</span>Diagram pencar → arah &amp; kerapatan</div>' +
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
    buildFeedbackBox('info', '🔭', '<strong>Rasa ingin tahu:</strong> ' + esc(D.berikutnya)) +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Kualitas hipotesis, penafsiran data kelas, dan penjelasan murid tentang asosiasi vs sebab-akibat tetap menjadi bahan penilaian utama.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  bindNext('reviewBtn', function () {
    navigateTo('stimulasi');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  koleksiKategori: renderKoleksiKategori,
  koleksiNumerik: renderKoleksiNumerik,
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
