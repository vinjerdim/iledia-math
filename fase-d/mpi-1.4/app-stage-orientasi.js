'use strict';

/* ============================================================
   app-stage-orientasi.js — Stage: Orientasi
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   6. STAGE: ORIENTASI
   ============================================================ */

function renderOrientasi(container) {
  container.innerHTML =
    '<section aria-label="Orientasi">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 1 — MEMAHAMI</span>' +
    '<p class="stage-head__goal">Tujuan: Mengenal media pembelajaran dan memahami konteks pembelajaran hari ini.</p>' +
    '</div>' +
    '<div class="panel panel--hero">' +
    '<h2>' +
    esc(DATA.meta.title) +
    '</h2>' +
    '<p style="font-size:1.05rem;"><strong>Tujuan Pembelajaran:</strong><br>' +
    esc(DATA.meta.goal) +
    '</p>' +
    '<div class="panel panel--info" style="margin-bottom:0;">' +
    '<h3 style="margin-bottom:var(--space-2);">Dalam media ini kamu akan:</h3>' +
    '<ol class="objectives-list">' +
    '<li><span class="objectives-list__num">1</span>Menjelajahi hubungan visual antara pecahan dan desimal menggunakan model area.</li>' +
    '<li><span class="objectives-list__num">2</span>Berlatih mengubah pecahan menjadi desimal dengan panduan langkah demi langkah.</li>' +
    '<li><span class="objectives-list__num">3</span>Membandingkan bilangan rasional dalam representasi campuran (pecahan dan desimal).</li>' +
    '<li><span class="objectives-list__num">4</span>Mengurutkan produk makanan kemasan berdasarkan kandungan gula.</li>' +
    '<li><span class="objectives-list__num">5</span>Menyelesaikan tantangan kontekstual dengan resep, nutrisi, dan promo belanja.</li>' +
    '<li><span class="objectives-list__num">6</span>Merefleksikan strategi dan pemahamanmu.</li>' +
    '</ol></div></div>' +
    '<div class="panel panel--compact">' +
    '<h3>Konteks: Pecahan dan Desimal dalam Kehidupan Sehari-hari</h3>' +
    '<p>Kamu sering menjumpai representasi seperti <strong>"diskon ½ harga"</strong> dan <strong>"diskon 0,5"</strong> — keduanya menyatakan hal yang sama. ' +
    'Di dapur, resep sering menggunakan pecahan: <em>"¾ cangkir tepung"</em>. Di label kemasan, nutrisi ditulis dalam desimal: <em>"0,45 gram gula"</em>.</p>' +
    '<p>Memahami hubungan antara kedua representasi ini penting agar kamu bisa membandingkan dan membuat keputusan yang tepat.</p>' +
    '</div>' +
    '<div class="panel panel--compact">' +
    '<h3>Cara menggunakan media ini</h3>' +
    '<div class="hero-steps">' +
    '<div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan setiap tahap dari kiri ke kanan mengikuti navigasi di atas.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">2</span>Setiap aktivitas punya tombol <strong>Periksa</strong>, <strong>Petunjuk</strong>, dan <strong>Coba Lagi</strong>.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">3</span>Feedback menjelaskan alasan — bukan hanya "benar/salah". Baca dengan teliti.</div>' +
    '<div class="hero-steps__item"><span class="hero-steps__num">4</span>Progress tersimpan otomatis. Kamu bisa melanjutkan di lain waktu.</div>' +
    '</div></div>' +
    '<div class="panel panel--compact panel--warning">' +
    '<p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">' +
    '<strong>Catatan:</strong> Hasil latihan dalam media ini adalah panduan belajar, bukan nilai akhir. ' +
    'Diskusi kelompok, presentasi, dan penilaian oleh guru tetap menjadi bagian utama asesmen.' +
    '</p></div>' +
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Eksplorasi →</button>' +
    '</div></section>';

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('eksplorasi');
  });
}
