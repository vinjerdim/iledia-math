'use strict';

/* ============================================================
   app-stage-orientasi.js — Tahap 1: Orientasi masalah (PBL Sintaks 1)
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* Catatan tulisan tangan Kak Dimas: data ditulis dengan KATA-KATA. */
function buildCatatanPembina() {
  var suhu = DATA.suhu
    .map(function (s) {
      return '<li>Pukul ' + esc(s.jam) + ' — suhu ' + esc(s.kata) + '.</li>';
    })
    .join('');
  var bekal = DATA.regu
    .map(function (r) {
      return (
        '<li>' +
        r.ikon +
        ' Regu ' +
        esc(r.nama) +
        ': sisa air ' +
        esc(r.airKata) +
        ' jeriken, beras ' +
        esc(r.berasKata) +
        ' kilogram.</li>'
      );
    })
    .join('');
  return (
    '<div class="catatan-card">' +
    '<p class="catatan-card__title">' +
    esc(DATA.orientasi.catatanJudul) +
    '</p>' +
    '<p class="catatan-card__sub">🌡️ Suhu malam</p>' +
    '<ul class="catatan-card__list">' +
    suhu +
    '</ul>' +
    '<p class="catatan-card__sub">🎒 Sisa bekal</p>' +
    '<ul class="catatan-card__list">' +
    bekal +
    '</ul>' +
    '</div>'
  );
}

/* Tiga jeriken sama besar (pita) tanpa angka — murid hanya bisa menduga. */
function buildJerikenPita() {
  return (
    '<div class="jeriken-list">' +
    DATA.regu
      .map(function (r) {
        return (
          '<div class="jeriken-row">' +
          '<span class="jeriken-row__nama">' +
          r.ikon +
          ' ' +
          esc(r.nama) +
          '</span>' +
          buildFractionModel(r.air.num, r.air.den, 0, {
            wide: true,
            aria: 'Jeriken Regu ' + r.nama + ' terisi sebagian',
          }) +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    '<p class="dl-caption">Kotak berwarna = air yang tersisa. Ketiga jeriken sama besar. Sulit dipastikan hanya dengan melihat, bukan?</p>'
  );
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var Pm = D.pemantik;
  var benar = State.pemantikPilih === Pm.correct;
  var semuaDugaan = D.dugaan.every(function (q) {
    return !!State.dugaan[q.id];
  });

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
        '<div class="orientasi-grid">' +
        buildCatatanPembina() +
        '<div>' +
        '<p class="catatan-card__sub">💧 Jeriken air ketiga regu</p>' +
        buildJerikenPita() +
        '</div>' +
        '</div>',
      'panel--hero'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">📋 Tugas dari Kak Dimas</h3>' +
        '<ol class="objectives-list">' +
        D.tugas
          .map(function (t, i) {
            return (
              '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(t) + '</li>'
            );
          })
          .join('') +
        '</ol>' +
        '<h3>🎯 Setelah memecahkan masalah ini, kamu dapat:</h3>' +
        '<ul class="tujuan-list">' +
        D.tujuan
          .map(function (t) {
            return '<li>' + esc(t) + '</li>';
          })
          .join('') +
        '</ul>',
      'panel--info'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Dugaan awal</h3>' +
        D.dugaan
          .map(function (q) {
            return (
              '<div class="dugaan-item">' +
              '<p class="exercise-label">' +
              esc(q.tanya) +
              '</p>' +
              buildChoiceGroup(q.opsi, State.dugaanOrders[q.id], {
                chosen: State.dugaan[q.id] || null,
                group: q.id,
                attr: 'data-dugaan',
              }) +
              '</div>'
            );
          })
          .join('') +
        (semuaDugaan ? spacer(buildFeedbackBox('info', '📝', esc(D.dugaanUmpan))) : '')
    ) +
    (semuaDugaan
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
      State.dugaan[btn.dataset.group] = btn.getAttribute('data-dugaan');
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
