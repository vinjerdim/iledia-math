'use strict';

/* ============================================================
   app-stage-selesai.js — Stage: Selesai
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   13. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var konversiCorrect = State.konversiExercises.filter(function (e) {
    return e.correct;
  }).length;
  var bandingkanCorrect = State.bandingkanExercises.filter(function (e) {
    return e.correct;
  }).length;
  var tantanganCorrect = State.tantanganExercises.filter(function (e) {
    return e.correct;
  }).length;
  var explored = countExplored();

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🎓</span>' +
    '<h2>Latihan Selesai!</h2>' +
    '<p style="font-size:1.05rem;color:var(--color-ink-muted);max-width:480px;margin:0 auto var(--space-5);">' +
    'Kamu telah menyelesaikan seluruh tahap eksplorasi bilangan rasional.' +
    '</p>' +
    '<div class="summary-grid" style="max-width:640px;margin:0 auto var(--space-5);">' +
    '<div class="summary-card"><div class="summary-card__val">' +
    explored +
    '/8</div><div class="summary-card__label">Pecahan dieksplorasi</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    konversiCorrect +
    '/8</div><div class="summary-card__label">Konversi benar</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    bandingkanCorrect +
    '/6</div><div class="summary-card__label">Perbandingan benar</div></div>' +
    '<div class="summary-card"><div class="summary-card__val">' +
    tantanganCorrect +
    '/4</div><div class="summary-card__label">Tantangan benar</div></div>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info" style="text-align:left;max-width:560px;margin:0 auto var(--space-5);">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Angka di atas adalah indikator latihan digital, bukan nilai akhir. ' +
    'Observasi diskusi kelompok, kemampuan menjelaskan strategi, dan kualitas penyelesaian LKPD tetap menjadi tanggung jawab guru.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewFromDoneBtn">Tinjau Ulang</button>' +
    '</div></div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewFromDoneBtn').addEventListener('click', function () {
    navigateTo('eksplorasi');
  });
}
