'use strict';

/* ============================================================
   app-stage-latih-sederhana.js — Tahap 4: Latihan menyederhanakan
   (PBL Sintaks 3). Memakai renderLatihan() di app-core.js.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function renderLatihSederhana(container) {
  renderLatihan(container, {
    D: DATA.latihSederhana,
    states: function () {
      return State.latihSStates;
    },
    idxKey: 'latihSIdx',
    prefix: 'ls',
    stageId: 'latihSederhana',
    nextStageId: 'selidikSamakan',
    label: 'Latihan Menyederhanakan',
  });
}
