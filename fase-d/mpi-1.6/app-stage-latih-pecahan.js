'use strict';

/* ============================================================
   app-stage-latih-pecahan.js — Tahap 6: Latihan pecahan
   (PBL Sintaks 3). Mesin latihan ada di app-core.js > renderLatihan.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function renderLatihPecahan(container) {
  renderLatihan(container, {
    D: DATA.latihPecahan,
    states: function () {
      return State.latihPStates;
    },
    idxKey: 'latihPIdx',
    prefix: 'lp',
    stageId: 'latihPecahan',
    nextStageId: 'karya',
    label: 'Latihan Pecahan',
  });
}
