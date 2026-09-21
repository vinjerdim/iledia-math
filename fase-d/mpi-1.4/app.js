'use strict';

/* ============================================================
   app.js — Titik masuk aplikasi media pembelajaran
   Matematika: Membandingkan dan Mengubah Representasi Bilangan Rasional

   Utilitas bersama (esc, parseInputInt, showNotice, builder render,
   mesin navigasi tahap) berada di shared/engine.js.

   Logika aplikasi dipecah menjadi beberapa berkas, dimuat berurutan
   lewat index.html (lihat shared/pages-manifest.json > extraScripts):
    - app-core.js              Utilitas matematika, konstanta, state,
                               navigasi, render helper
    - app-stage-orientasi.js   Stage: Orientasi
    - app-stage-eksplorasi.js  Stage: Eksplorasi
    - app-stage-konversi.js    Stage: Konversi
    - app-stage-bandingkan.js  Stage: Bandingkan
    - app-stage-urutkan.js     Stage: Urutkan
    - app-stage-tantangan.js   Stage: Tantangan
    - app-stage-refleksi.js    Stage: Refleksi
    - app-stage-selesai.js     Stage: Selesai
    - app.js (berkas ini)      Init
   ============================================================ */

/* ============================================================
   15. INIT
   ============================================================ */

function init() {
  var loaded = loadState();
  if (!loaded) {
    initExerciseArrays();
  } else {
    initExerciseArrays(); /* pastikan array valid meski state sudah dimuat */
  }

  buildStageNav();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  /* Reset button */
  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (confirm('Reset seluruh progress? Semua data latihan akan dihapus.')) {
        clearState();
        buildStageNav();
        updateStageNav();
        updateProgress();
        renderCurrentStage();
        window.scrollTo({ top: 0 });
        showNotice('Progress direset. Mulai dari awal.');
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
