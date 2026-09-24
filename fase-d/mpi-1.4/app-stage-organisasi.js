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
      '<h3 style="margin-top:0;">1. Pilah informasi</h3>' +
        '<p class="exercise-label">' +
        esc(D.pilahInstruksi) +
        '</p>' +
        buildSortItems(D.pilah, State.pilahOrder, D.pilahOpsi, State.pilahStates) +
        (pilahSelesai
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              '📊',
              'Kamu memilah <strong>' +
                pilahBenar +
                ' dari ' +
                D.pilah.length +
                '</strong> informasi dengan tepat. Baca alasan pada butir yang belum tepat.'
            ) +
            '</div>'
          : '')
    ) +
    (pilahSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">2. Susun rencana penyelidikan</h3>' +
            '<p class="exercise-label">' +
            esc(D.rencanaInstruksi) +
            '</p>' +
            buildOrderPicker('rencana', D.rencana, R, { correctOrder: D.rencanaBenar }) +
            (R.salah
              ? '<div style="margin-top:var(--space-3);">' +
                buildFeedbackBox('warning', '💭', esc(D.rencanaSalah)) +
                '</div>'
              : '') +
            (R.done
              ? '<div style="margin-top:var(--space-3);">' +
                buildFeedbackBox('success', '✓', esc(D.rencanaBenarTeks)) +
                '</div>'
              : '')
        )
      : '') +
    (R.done ? buildDlNextButton('organisasiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  var rerender = function () {
    renderOrganisasi(container);
  };
  bindSortItems(container, D.pilah, State.pilahStates, saveState, rerender);
  bindOrderPicker(container, 'rencana', D.rencana, R, D.rencanaBenar, saveState, rerender);
  bindNext('organisasiNextBtn', 'organisasi', 'selidikSederhana');
}
