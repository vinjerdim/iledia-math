'use strict';

/* ============================================================
   app-stage-selesai.js — Tahap 10: Selesai
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function renderSelesai(container) {
  var D = DATA.selesai;
  var benar =
    countCorrect(State.latihBStates) +
    countCorrect(State.latihPStates) +
    sortItemsCorrectCount(DATA.evaluasi.pernyataan, State.evalStates) +
    countCorrect(State.transferStates);
  var total =
    DATA.latihBulat.soal.length +
    DATA.latihPecahan.soal.length +
    DATA.evaluasi.pernyataan.length +
    DATA.evaluasi.transfer.length;
  var bintang = 1;
  if (benar >= total * 0.9) bintang = 3;
  else if (benar >= total * 0.6) bintang = 2;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🏆</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    '<p class="done-card__lead">' +
    esc(D.teks) +
    '</p>' +
    '<p class="bintang" aria-label="' +
    bintang +
    ' dari 3 bintang">' +
    '<span aria-hidden="true">' +
    '⭐'.repeat(bintang) +
    '<span class="bintang__off">' +
    '⭐'.repeat(3 - bintang) +
    '</span></span></p>' +
    '<div class="formula-duo">' +
    '<div class="formula-card"><span class="formula-card__label">Bilangan bulat: makin ke kiri makin kecil</span>' +
    '−4 &lt; −2 &lt; 0 &lt; 1 &lt; 6' +
    '</div>' +
    '<div class="formula-card"><span class="formula-card__label">Pecahan: samakan penyebut, bandingkan pembilang</span>' +
    buildFracInline(5, 8) +
    ' = ' +
    buildFracInline(15, 24) +
    ' &lt; ' +
    buildFracInline(16, 24) +
    ' = ' +
    buildFracInline(2, 3) +
    '</div>' +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    '<ol class="objectives-list">' +
    D.capaian
      .map(function (c, i) {
        return '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(c) + '</li>';
      })
      .join('') +
    '</ol>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Nilai presentasi Papan Info Kemah (tahap Karya): ketepatan cara baca, notasi, urutan, dan alasan keputusan kelompok.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('orientasi');
  });
}
