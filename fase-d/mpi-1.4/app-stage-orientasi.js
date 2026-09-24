'use strict';

/* ============================================================
   app-stage-orientasi.js — Tahap 1: Orientasi masalah (PBL Sintaks 1)
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var Dg = D.dugaan;
  var Pm = D.pemantik;
  var benar = State.pemantikPilih === Pm.correct;

  container.innerHTML =
    '<section aria-label="Orientasi Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="orientasi-hero">' +
        '<span class="orientasi-hero__icon" aria-hidden="true">' +
        D.ikon +
        '</span>' +
        '<div>' +
        '<h2 class="orientasi-hero__title">' +
        esc(D.judul) +
        '</h2>' +
        '<p style="margin:0;">' +
        esc(D.cerita) +
        '</p>' +
        '</div>' +
        '</div>' +
        buildPitaBazar() +
        '<p class="dl-caption">Kotak oranye = potongan yang terjual. Ketiga loyang sama panjang.</p>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🎯 Setelah memecahkan masalah ini, kamu dapat:</h3>' +
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
      '<p class="exercise-label">' +
        esc(Dg.tanya) +
        '</p>' +
        buildChoiceGroup(Dg.opsi, State.dugaanOrder, {
          chosen: State.dugaan,
          attr: 'data-dugaan',
        }) +
        (State.dugaan
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox('info', '📝', esc(Dg.umpan)) +
            '</div>'
          : '')
    ) +
    (State.dugaan
      ? buildDlPanel(
          buildRetryChoice(Pm, State.pemantikOrder, State.pemantikPilih, 'data-pemantik')
        )
      : '') +
    (benar ? buildDlNextButton('orientasiNextBtn', D.nextLabel, true) : '') +
    '</section>';

  var rerender = function () {
    renderOrientasi(container);
  };

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaan = btn.getAttribute('data-dugaan');
      saveState();
      rerender();
    });
  });

  bindRetryChoice(
    container,
    'data-pemantik',
    function () {
      return State.pemantikPilih === Pm.correct;
    },
    function (id) {
      State.pemantikPilih = id;
      saveState();
      rerender();
    }
  );

  bindNext('orientasiNextBtn', 'orientasi', 'organisasi');
}
