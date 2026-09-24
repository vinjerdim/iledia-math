'use strict';

/* ============================================================
   app-stage-selesai.js — Tahap 10: Selesai
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function renderSelesai(container) {
  var D = DATA.selesai;
  var benar =
    countCorrect(State.latihSStates) +
    countCorrect(State.latihMStates) +
    sortItemsCorrectCount(DATA.evaluasi.pernyataan, State.evalStates) +
    countCorrect(State.transferStates);
  var total =
    DATA.latihSederhana.soal.length +
    DATA.latihSamakan.soal.length +
    DATA.evaluasi.pernyataan.length +
    DATA.evaluasi.transfer.length;
  var bintang = benar >= total * 0.9 ? 3 : benar >= total * 0.6 ? 2 : 1;

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
    '<div class="formula-card"><span class="formula-card__label">Sederhanakan: bagi dengan FPB</span>' +
    fracChain([
      [6, 8],
      [3, 4],
    ]) +
    ' <span class="dl-caption">(÷ 2)</span></div>' +
    '<div class="formula-card"><span class="formula-card__label">Samakan penyebut: kali ke KPK</span>' +
    fracChain([
      [3, 4],
      [18, 24],
    ]) +
    ' <span class="dl-caption">(× 6)</span></div>' +
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
    'Nilai presentasi laporan kelompok (tahap Karya) dan penjelasan lisan murid tentang mengapa penyebut perlu disamakan sebelum membandingkan.' +
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
