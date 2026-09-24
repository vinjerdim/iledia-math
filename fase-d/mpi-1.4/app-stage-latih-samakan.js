'use strict';

/* ============================================================
   app-stage-latih-samakan.js — Tahap 6: Latihan menyamakan penyebut
   (PBL Sintaks 3). Memakai renderLatihan() di app-core.js.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function renderLatihSamakan(container) {
  renderLatihan(container, {
    D: DATA.latihSamakan,
    states: function () {
      return State.latihMStates;
    },
    idxKey: 'latihMIdx',
    prefix: 'lm',
    stageId: 'latihSamakan',
    nextStageId: 'karya',
    label: 'Latihan Menyamakan Penyebut',
  });
}
