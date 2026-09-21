'use strict';

/* ============================================================
   app-stage-refleksi.js — Stage: Refleksi
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var soal = DATA.refleksi.soal;

  /* Summary stats */
  var konversiCorrect = State.konversiExercises.filter(function (e) {
    return e.correct;
  }).length;
  var bandingkanCorrect = State.bandingkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var tantanganCorrect = State.tantanganExercises.filter(function (e) {
    return e.correct;
  }).length;
  var urutkanDone = State.urutkanDone;

  var questionHTML = soal
    .map(function (q, i) {
      var saved = State.refleksiAnswers[q.id] || '';
      return (
        '<div class="panel panel--compact refleksi-item">' +
        '<span class="refleksi-item__num">Pertanyaan ' +
        (i + 1) +
        ' dari ' +
        soal.length +
        '</span>' +
        '<label for="r-' +
        q.id +
        '" style="font-size:0.95rem;font-weight:600;display:block;margin-bottom:var(--space-3);">' +
        q.question +
        '</label>' +
        '<textarea id="r-' +
        q.id +
        '" class="input-textarea" placeholder="' +
        esc(q.placeholder) +
        '" ' +
        'data-rid="' +
        q.id +
        '">' +
        esc(saved) +
        '</textarea>' +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 7 — REFLEKSI</span>' +
    '<p class="stage-head__goal">Tujuan: Merangkum pemahamanmu dan mengevaluasi strategi belajar yang efektif.</p>' +
    '</div>' +
    '<div class="panel panel--info" style="margin-bottom:var(--space-4);">' +
    '<h3>Ringkasan Latihanmu</h3>' +
    '<div class="summary-grid">' +
    '<div class="summary-card">' +
    '<div class="summary-card__val">' +
    konversiCorrect +
    '/' +
    DATA.konversi.soal.length +
    '</div>' +
    '<div class="summary-card__label">Konversi benar</div>' +
    '</div>' +
    '<div class="summary-card">' +
    '<div class="summary-card__val">' +
    bandingkanCorrect +
    '/' +
    DATA.bandingkan.soal.length +
    '</div>' +
    '<div class="summary-card__label">Perbandingan benar</div>' +
    '</div>' +
    '<div class="summary-card">' +
    '<div class="summary-card__val">' +
    tantanganCorrect +
    '/' +
    DATA.tantangan.soal.length +
    '</div>' +
    '<div class="summary-card__label">Tantangan benar</div>' +
    '</div>' +
    '<div class="summary-card">' +
    '<div class="summary-card__val" style="font-size:1.5rem;">' +
    (urutkanDone ? '✓' : '–') +
    '</div>' +
    '<div class="summary-card__label">Pengurutan selesai</div>' +
    '</div>' +
    '</div>' +
    '<p style="font-size:0.82rem;color:var(--color-primary-strong);margin:var(--space-2) 0 0;">' +
    esc(DATA.refleksi.note) +
    '</p>' +
    '</div>' +
    '<div class="refleksi-list">' +
    questionHTML +
    '</div>' +
    '<div class="btn-group btn-group--spread">' +
    '<span style="font-size:0.82rem;color:var(--color-ink-muted);align-self:center;">Jawaban tidak dikirim ke server.</span>' +
    '<button type="button" class="btn btn--primary" id="saveRefleksiBtn">Simpan & Selesai →</button>' +
    '</div>' +
    '</section>';

  /* Auto-save refleksi saat mengetik */
  container.querySelectorAll('textarea[data-rid]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      State.refleksiAnswers[ta.dataset.rid] = ta.value;
      saveState();
    });
  });

  document.getElementById('saveRefleksiBtn').addEventListener('click', function () {
    /* Kumpulkan semua jawaban */
    container.querySelectorAll('textarea[data-rid]').forEach(function (ta) {
      State.refleksiAnswers[ta.dataset.rid] = ta.value;
    });
    State.refleksiSaved = true;
    saveState();
    completeStage('refleksi');
    navigateTo('selesai');
  });
}
