'use strict';

/* ============================================================
   app-stage-evaluasi.js — Tahap 8: Menganalisis & mengevaluasi proses
   (PBL Sintaks 5). Menilai pendapat teman, masalah baru, dan menguji
   dugaan awal dari tahap Orientasi.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function buildUjiDugaan() {
  var D = DATA.orientasi.dugaan;
  var fakta = {
    dSuhu: {
      id: SUHU_TERDINGIN.id,
      teks:
        'Pukul ' +
        esc(SUHU_TERDINGIN.jam) +
        ' (' +
        formatNumber(SUHU_TERDINGIN.value, '−') +
        ' °C)',
    },
    dAir: {
      id: AIR_URUT[0].id,
      teks:
        'Regu ' +
        esc(AIR_URUT[0].nama) +
        ' (' +
        buildFracInline(AIR_URUT[0].air.num, AIR_URUT[0].air.den) +
        ' jeriken)',
    },
  };
  return D.map(function (q) {
    var pilih = State.dugaan[q.id];
    var f = fakta[q.id];
    var cocok = pilih === f.id;
    return (
      '<div class="dugaan-uji">' +
      '<p class="exercise-label">' +
      esc(q.tanya) +
      '</p>' +
      '<p style="margin:0;">Dugaanmu: <strong>' +
      (pilih ? findOptionLabel(q.opsi, pilih) : '—') +
      '</strong><br>Hasil penyelidikan: <strong>' +
      f.teks +
      '</strong></p>' +
      spacer(
        buildFeedbackBox(
          cocok ? 'success' : 'info',
          cocok ? '🎯' : '🔄',
          cocok
            ? 'Dugaanmu terbukti! Kini kamu juga punya alasan matematisnya.'
            : 'Dugaanmu berubah setelah penyelidikan — itu tanda belajar. Apa yang membuatmu berubah pikiran?'
        )
      ) +
      '</div>'
    );
  }).join('');
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var pilahSelesai = sortItemsAllAnswered(D.pernyataan, State.evalStates);
  var transferSelesai = State.transferStates.every(function (st) {
    return st.chosen;
  });

  var html =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead('1. Tepat atau keliru?', D.pilahInstruksi) +
        buildSortItems(D.pernyataan, State.evalOrder, D.pilahOpsi, State.evalStates)
    );
  if (pilahSelesai) {
    html += buildDlPanel(
      buildPartHead('2. ' + D.transferJudul) +
        D.transfer
          .map(function (s, i) {
            var st = State.transferStates[i];
            return (
              '<div class="quiz-item quiz-item--guided">' +
              '<p class="exercise-label"><span class="dl-step__num">' +
              (i + 1) +
              '</span>' +
              s.tanya +
              '</p>' +
              buildChoiceGroup(s.opsi, st.optionOrder, {
                chosen: st.chosen,
                correctId: s.correct,
                grade: true,
                locked: true,
                group: s.id,
                attr: 'data-tr-opt',
              }) +
              (st.chosen
                ? spacer(
                    buildFeedbackBox(
                      st.correct ? 'success' : 'error',
                      st.correct ? '✓' : '✗',
                      (st.correct ? '<strong>Benar!</strong> ' : '<strong>Belum tepat.</strong> ') +
                        s.penjelasan
                    )
                  )
                : '') +
              '</div>'
            );
          })
          .join('')
    );
  }
  if (pilahSelesai && transferSelesai) {
    html +=
      buildDlPanel(buildPartHead('3. ' + D.dugaanJudul) + buildUjiDugaan(), 'panel--info') +
      buildDlNextButton('evaluasiNextBtn', D.nextLabel, true);
  }
  html += '</section>';
  container.innerHTML = html;

  var rerender = function () {
    renderEvaluasi(container);
  };
  bindSortItems(container, D.pernyataan, State.evalStates, saveState, rerender);
  container.querySelectorAll('[data-tr-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = -1;
      D.transfer.forEach(function (s, k) {
        if (s.id === btn.dataset.group) i = k;
      });
      var st = State.transferStates[i];
      if (!st || st.chosen) return;
      st.chosen = btn.dataset.trOpt;
      st.correct = st.chosen === D.transfer[i].correct;
      saveState();
      rerender();
    });
  });
  bindNext('evaluasiNextBtn', 'evaluasi', 'refleksi');
}
