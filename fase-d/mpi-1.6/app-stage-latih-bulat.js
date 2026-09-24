'use strict';

/* ============================================================
   app-stage-latih-bulat.js — Tahap 4: Latihan bilangan bulat
   (PBL Sintaks 3). Mesin latihan ada di app-core.js > renderLatihan.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function renderLatihBulat(container) {
  renderLatihan(container, {
    D: DATA.latihBulat,
    states: function () {
      return State.latihBStates;
    },
    idxKey: 'latihBIdx',
    prefix: 'lb',
    stageId: 'latihBulat',
    nextStageId: 'selidikPecahan',
    label: 'Latihan Bilangan Bulat',
  });
}
