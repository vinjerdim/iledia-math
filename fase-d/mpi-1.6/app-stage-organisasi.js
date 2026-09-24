'use strict';

/* ============================================================
   app-stage-organisasi.js — Tahap 2: Mengorganisasi belajar (PBL Sintaks 2)
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function renderOrganisasi(container) {
  var D = DATA.organisasi;
  var pilahSelesai = sortItemsAllAnswered(D.pilah, State.pilahStates);
  var pilahBenar = sortItemsCorrectCount(D.pilah, State.pilahStates);
  var R = State.rencana;

  container.innerHTML =
    '<section aria-label="Mengorganisasi Belajar">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👥 Bagi peran dalam kelompokmu</h3>' +
        '<div class="peran-grid">' +
        D.peran
          .map(function (p) {
            return (
              '<div class="peran-card"><span class="peran-card__icon" aria-hidden="true">' +
              p.ikon +
              '</span><div><strong>' +
              esc(p.nama) +
              '</strong><br><span class="dl-caption">' +
              esc(p.tugas) +
              '</span></div></div>'
            );
          })
          .join('') +
        '</div>',
      'panel--info'
    ) +
    buildDlPanel(
      buildPartHead('1. Pilah informasi', D.pilahInstruksi) +
        buildSortItems(D.pilah, State.pilahOrder, D.pilahOpsi, State.pilahStates) +
        (pilahSelesai
          ? spacer(
              buildFeedbackBox(
                'info',
                '📊',
                'Kamu memilah <strong>' +
                  pilahBenar +
                  ' dari ' +
                  D.pilah.length +
                  '</strong> informasi dengan tepat. Baca alasan pada butir yang belum tepat.'
              )
            )
          : '')
    ) +
    (pilahSelesai
      ? buildDlPanel(
          buildPartHead('2. Susun rencana penyelidikan', D.rencanaInstruksi) +
            buildOrderPicker('rencana', D.rencana, R, { correctOrder: D.rencanaBenar }) +
            (R.salah ? spacer(buildFeedbackBox('warning', '💭', esc(D.rencanaSalah))) : '') +
            (R.done ? spacer(buildFeedbackBox('success', '✓', esc(D.rencanaBenarTeks))) : '')
        )
      : '') +
    (R.done ? buildDlNextButton('organisasiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  var rerender = function () {
    renderOrganisasi(container);
  };
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindOrderPicker(container, 'rencana', D.rencana, R, D.rencanaBenar, saveState, rerender);
  bindNext('organisasiNextBtn', 'organisasi', 'selidikBulat');
}
