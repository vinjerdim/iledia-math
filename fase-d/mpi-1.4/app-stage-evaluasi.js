'use strict';

/* ============================================================
   app-stage-evaluasi.js — Tahap 8: Menganalisis & mengevaluasi
   proses pemecahan masalah (PBL Sintaks 5)
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function evaluasiSelesai() {
  return (
    sortItemsAllAnswered(DATA.evaluasi.pernyataan, State.evalStates) &&
    State.transferStates.every(function (st) {
      return !!st.chosen;
    })
  );
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var pilahSelesai = sortItemsAllAnswered(D.pernyataan, State.evalStates);

  container.innerHTML =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🕵️ Periksa pendapat teman</h3>' +
        '<p class="exercise-label">' +
        esc(D.pilahInstruksi) +
        '</p>' +
        buildSortItems(D.pernyataan, State.evalOrder, D.pilahOpsi, State.evalStates)
    ) +
    (pilahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🚀 ' +
            esc(D.transferJudul) +
            '</h3>' +
            D.transfer
              .map(function (s, i) {
                var st = State.transferStates[i];
                return (
                  '<div class="transfer-item">' +
                  '<div class="dl-prompt">' +
                  '<p class="dl-prompt__cerita">' +
                  s.cerita +
                  '</p>' +
                  '<p class="dl-prompt__tanya">' +
                  esc(s.tanya) +
                  '</p>' +
                  '</div>' +
                  buildChoiceGroup(s.opsi, st.optionOrder, {
                    chosen: st.chosen,
                    correctId: s.correct,
                    grade: true,
                    locked: true,
                    group: String(i),
                    attr: 'data-tf-opt',
                  }) +
                  (st.chosen
                    ? '<div style="margin-top:var(--space-3);">' +
                      buildFeedbackBox(
                        st.correct ? 'success' : 'error',
                        st.correct ? '✓' : '✗',
                        (st.correct
                          ? '<strong>Benar!</strong> '
                          : '<strong>Belum tepat.</strong> ') + s.explanation
                      ) +
                      '</div>'
                    : '') +
                  '</div>'
                );
              })
              .join('')
        )
      : '') +
    (evaluasiSelesai() ? buildDlNextButton('evaluasiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  var rerender = function () {
    renderEvaluasi(container);
  };
  bindSortItems(container, D.pernyataan, State.evalStates, saveState, rerender);

  container.querySelectorAll('[data-tf-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.group, 10);
      var st = State.transferStates[i];
      if (st.chosen) return;
      st.chosen = btn.dataset.tfOpt;
      st.correct = st.chosen === D.transfer[i].correct;
      saveState();
      rerender();
    });
  });

  bindNext('evaluasiNextBtn', 'evaluasi', 'refleksi');
}
