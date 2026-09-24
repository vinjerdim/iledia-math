'use strict';

/* ============================================================
   app-stage-selidik-bulat.js — Tahap 3: Penyelidikan bilangan bulat
   (PBL Sintaks 3). Data suhu malam: kata → notasi, cara baca baku,
   garis bilangan, lambang perbandingan, simpulan.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function garisItems() {
  return orderByIds(DATA.suhu, State.garisOrder).map(function (s) {
    return { value: s.value, teks: 'pukul ' + s.jam };
  });
}

function bandingBenar(p) {
  var st = State.bandingStates[p.id];
  return !!st && st.chosen === compareSymbolId(p.a, p.b);
}

function buildBandingList(list) {
  return list
    .map(function (p, i) {
      var st = State.bandingStates[p.id];
      var ok = bandingBenar(p);
      var fb = '';
      if (ok) {
        fb = buildFeedbackBox(
          'success',
          '✓',
          formatNumber(p.a, '−') +
            ' ' +
            esc(compareSymbolText(st.chosen)) +
            ' ' +
            formatNumber(p.b, '−') +
            ' — ' +
            (p.a < p.b ? formatNumber(p.a, '−') : formatNumber(p.b, '−')) +
            ' °C lebih dingin karena letaknya lebih ke kiri.'
        );
      } else if (st.chosen) {
        fb = buildFeedbackBox(
          'warning',
          '💭',
          'Belum tepat. Cari kedua bilangan pada garis bilangan di atas: mana yang letaknya lebih ke kiri?'
        );
      }
      return (
        '<div class="quiz-item quiz-item--guided">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(p.konteks) +
        '</p>' +
        buildCompareSentence(p.a, p.b, ok ? st.chosen : null) +
        buildCompareSymbolChoice(p.a, p.b, State.bandingOrders[p.id], st, { group: p.id }) +
        spacer(fb) +
        '</div>'
      );
    })
    .join('');
}

function renderSelidikBulat(container) {
  var D = DATA.selidikBulat;
  var tulisOk = stepsDone(State.bulatTulis);
  var bacaOk = tulisOk && guidedQuizAllCorrect(D.baca, State.bulatBaca);
  var items = garisItems();
  var garisOk = bacaOk && numberLinePlacementDone(items, State.garisPlace);
  var bandingOk = garisOk && D.banding.every(bandingBenar);
  var simpulOk = bandingOk && State.bulatSimpul === D.simpulan.correct;

  var html =
    '<section aria-label="Penyelidikan Bilangan Bulat">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.tulisJudul, D.tulisInstruksi) +
        buildStepChain('sbT', D.tulis, State.bulatTulis)
    );

  if (tulisOk) {
    html += buildDlPanel(
      '<p class="exercise-label">Beginilah suhu malam itu pada termometer:</p>' +
        buildThermometerRow(
          DATA.suhu.map(function (s) {
            return { value: s.value, caption: 'pukul ' + s.jam };
          }),
          { min: -6, max: 8, step: 2 }
        ) +
        buildPartHead(D.bacaJudul) +
        buildGuidedQuizList(D.baca, State.bulatBacaOrders, State.bulatBaca),
      'panel--info'
    );
  }
  if (bacaOk) {
    html += buildDlPanel(
      buildPartHead(D.garisJudul, D.garisInstruksi) +
        buildNumberLinePlacement('sbGaris', items, State.garisPlace, {
          min: D.garis.min,
          max: D.garis.max,
          labelEvery: D.garis.labelEvery,
          doneText:
            '<strong>Semua suhu sudah di tempatnya!</strong> Perhatikan: suhu negatif ada di kiri 0, suhu positif di kanan 0.',
        })
    );
  }
  if (garisOk) {
    html += buildDlPanel(
      buildPartHead(D.bandingJudul, D.bandingInstruksi) + buildBandingList(D.banding)
    );
  }
  if (bandingOk) {
    html += buildDlPanel(
      buildRetryChoice(D.simpulan, State.bulatSimpulOrder, State.bulatSimpul, 'data-sb-simpul')
    );
  }
  if (simpulOk) html += buildDlNextButton('selidikBulatNextBtn', D.nextLabel, true);
  html += '</section>';
  container.innerHTML = html;

  var rerender = function () {
    renderSelidikBulat(container);
  };
  bindStepChain('sbT', D.tulis, State.bulatTulis, rerender);
  bindGuidedQuizList(container, D.baca, State.bulatBaca, saveState, rerender);
  if (bacaOk) {
    bindNumberLinePlacement(container, 'sbGaris', items, State.garisPlace, saveState, rerender);
    centerNumberLines(container);
  }
  var byId = {};
  D.banding.forEach(function (p) {
    byId[p.id] = p;
  });
  bindCompareSymbolChoice(
    container,
    function (g) {
      return byId[g] ? [byId[g].a, byId[g].b] : null;
    },
    function (g) {
      return State.bandingStates[g];
    },
    saveState,
    rerender
  );
  bindRetryChoice(
    container,
    'data-sb-simpul',
    function () {
      return State.bulatSimpul === D.simpulan.correct;
    },
    function (id) {
      State.bulatSimpul = id;
      saveState();
      rerender();
    }
  );
  bindNext('selidikBulatNextBtn', 'selidikBulat', 'latihBulat');
}
