'use strict';

/* ============================================================
   app.js — Titik masuk aplikasi media pembelajaran
   Matematika: Menyederhanakan & Menyamakan Penyebut Pecahan
   Fase D — SMP Kelas 7 · Model: Problem-Based Learning

   Utilitas bersama (esc, shuffleArray, showNotice, createStageMachine,
   createStore, pilihan/pemilahan acak, langkah isian bertahap,
   komponen pecahan, gcd/kpk, sederhanakanPecahan, diagnosaSederhana,
   komponen urut-ketuk) berada di shared/engine.js.

   Logika aplikasi dipecah menjadi beberapa berkas, dimuat berurutan
   lewat index.html (lihat shared/pages-manifest.json > extraScripts):
    - app-core.js                     Konstanta, state, pengacakan,
                                      navigasi, helper & tahap latihan
    - app-stage-orientasi.js          Tahap 1  (PBL Sintaks 1)
    - app-stage-organisasi.js         Tahap 2  (PBL Sintaks 2)
    - app-stage-selidik-sederhana.js  Tahap 3  (PBL Sintaks 3)
    - app-stage-latih-sederhana.js    Tahap 4  (PBL Sintaks 3)
    - app-stage-selidik-samakan.js    Tahap 5  (PBL Sintaks 3)
    - app-stage-latih-samakan.js      Tahap 6  (PBL Sintaks 3)
    - app-stage-karya.js              Tahap 7  (PBL Sintaks 4)
    - app-stage-evaluasi.js           Tahap 8  (PBL Sintaks 5)
    - app-stage-refleksi.js           Tahap 9
    - app-stage-selesai.js            Tahap 10
    - app.js (berkas ini)             Router render, modal reset, init
   ============================================================ */

/* ============================================================
   ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  organisasi: renderOrganisasi,
  selidikSederhana: renderSelidikSederhana,
  latihSederhana: renderLatihSederhana,
  selidikSamakan: renderSelidikSamakan,
  latihSamakan: renderLatihSamakan,
  karya: renderKarya,
  evaluasi: renderEvaluasi,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.orientasi;
  fn(container);
}

/* ============================================================
   MODAL RESET
   ============================================================ */

function showResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'flex';
}

function hideResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'none';
}

/* ============================================================
   INIT
   ============================================================ */

function init() {
  buildStageNav();
  loadState();
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'orientasi';
  initExerciseArrays();
  saveState();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) resetBtn.addEventListener('click', showResetModal);

  var cancelBtn = document.getElementById('resetCancelBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', hideResetModal);

  var confirmBtn = document.getElementById('resetConfirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      hideResetModal();
      clearState();
      saveState();
      updateStageNav();
      updateProgress();
      navigateTo('orientasi');
    });
  }

  var modal = document.getElementById('resetModal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) hideResetModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideResetModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
