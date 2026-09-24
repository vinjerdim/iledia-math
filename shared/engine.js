'use strict';

/* ============================================================
   engine.js — Utilitas bersama untuk semua media pembelajaran MPI

   Dimuat sebagai <script> biasa (tanpa module bundler), sebelum
   data.js dan app.js pada setiap modul. Semua fungsi diekspos
   sebagai global, sehingga app.js masing-masing modul dapat
   memanggilnya langsung tanpa perubahan pada kode stage-render.

   Bagian:
    1. Utilitas Teks, Input, Format Angka & Acak
    2. Notifikasi (Toast)
    3. Utilitas Render
    4. Mesin Navigasi Tahap
    5. Tahap Latihan Soal (isian numerik & pilihan ganda)
    6. State Persistence
    7. Komponen Discovery Learning (pilihan acak, petunjuk
       berjenjang, kepala tahap, catatan guru, deret suku
       aritmetika/geometri)
    8. Komponen Discovery Learning lanjutan (langkah isian
       bertahap, pemilahan kategori, grafik perbandingan)
    9. Bilangan bulat: cara baca baku & garis bilangan interaktif
   10. Pecahan: notasi baku, cara baca & model visual
   11. Bilangan bulat: penempatan, perbandingan & pengurutan
   12. Komponen Cooperative Learning
   13. Pertanyaan penuntun bertingkat
   14. Pecahan senilai (menyederhanakan & menyamakan penyebut) dan
       komponen urut-ketuk
   15. Pecahan: membandingkan & mengurutkan (pita pecahan, garis
       bilangan 0–1, papan urutan, kartu & label peran kelompok)
   16. Penerapan kontekstual: pecahan campuran ↔ biasa, isian pecahan
       berdiagnosis, termometer bilangan bulat, papan info hasil karya
   17. Bilangan bulat: operasi penjumlahan & pengurangan (garis
       bilangan berlompatan, simulator operasi, stepper bilangan)
   18. Bilangan bulat: perkalian, pembagian & urutan pengerjaan
       (penjumlahan berulang, tabel aturan tanda, langkah operasi
       campuran)
   19. Bilangan desimal: nilai tempat, cara baca & model visual
       (tabel nilai tempat, model blok, perakit desimal)
   20. Bilangan desimal: membandingkan & mengurutkan (perbandingan
       berbasis nilai tempat, diagnosa miskonsepsi, tabel nilai tempat
       berdampingan, garis bilangan desimal & penempatan)
   21. Deret aritmetika & geometri: suku & jumlah n suku (tabel
       isian deret, grid "kalikan r, geser, kurangkan", tabel uji
       rumus)
   22. Bunga tunggal: barisan & deret aritmetika pada modal (buku
       tabungan, format rupiah/persen, isian angka gaya Indonesia)
   23. Bunga majemuk: barisan & deret geometri pada modal (nilai
       akhir, konversi periode, simulator bunga majemuk)
   24. Perbandingan bunga tunggal & majemuk (saldo berdampingan,
       periode menyalip, tawaran terbaik untuk menabung/meminjam,
       duel tawaran)
   25. Relasi antara dua himpunan (pasangan berurutan, diagram
       panah interaktif, tabel silang & tabel daftar, chip pasangan)
   26. Kekongruenan bangun datar (ukur sisi & sudut, kertas jiplak
       putar/balik, korespondensi titik bersesuaian, kongruen vs
       sebangun, papan ukur, tabel perbandingan)
   27. Eksponen bulat (pecahan eksak, pangkat nol & negatif, tangga
       pangkat, ubin faktor, sifat-sifat eksponen & dugaan keliru,
       diagnosa miskonsepsi, lab uji sifat)
   28. Peluang kejadian majemuk (ruang sampel dadu/koin/kartu,
       predikat kejadian gabungan & irisan, saling lepas & saling
       bebas, diagnosa rumus, simulator percobaan, grid ruang sampel
       bertanda, diagram Venn banyak anggota)
   ============================================================ */

/* ============================================================
   1. UTILITAS TEKS, INPUT & ACAK
   ============================================================ */

/*
 * stripPunctuation: saat true, tanda titik dan koma (pemisah ribuan pada
 * beberapa soal, mis. nominal uang) turut dibuang selain spasi.
 */
function parseInputInt(str, stripPunctuation) {
  if (!str || str.trim() === '') return { value: null, error: 'empty' };
  var pattern = stripPunctuation ? /[\s.,]/g : /\s/g;
  /* Lambang minus tipografis '−' (U+2212) diterima sama seperti '-'. */
  var trimmed = str
    .trim()
    .replace(pattern, '')
    .replace(/\u2212/g, '-');
  /* Tanda '+' di depan (mis. "+8") diterima: +8 dan 8 bernilai sama. */
  if (!/^[-+]?\d+$/.test(trimmed)) return { value: null, error: 'invalid' };
  var v = parseInt(trimmed, 10);
  if (isNaN(v)) return { value: null, error: 'invalid' };
  return { value: v, error: null };
}

/*
 * Melengkapi parseInputInt untuk kolom yang boleh berisi pecahan desimal
 * (mis. suku bunga 1,5%). Koma maupun titik diterima sebagai pemisah
 * desimal, bentuk ".5" tanpa angka depan juga diterima, dan bentuk
 * kembaliannya sama seperti parseInputInt: { value, error }.
 */
function parseInputDecimal(str) {
  if (!str || String(str).trim() === '') return { value: null, error: 'empty' };
  var normalized = String(str).trim().replace(/\s/g, '');
  /* Tolak bila ada lebih dari satu pemisah, mis. "1.2.3" atau "1,2,3". */
  var separators = (normalized.match(/[.,]/g) || []).length;
  if (separators > 1) return { value: null, error: 'invalid' };
  normalized = normalized.replace(',', '.');
  if (!/^-?\d*\.?\d+$/.test(normalized)) return { value: null, error: 'invalid' };
  var v = parseFloat(normalized);
  if (isNaN(v)) return { value: null, error: 'invalid' };
  return { value: v, error: null };
}

/* Membandingkan dua bilangan pecahan dengan toleransi, untuk memeriksa
   jawaban desimal tanpa terjebak galat pembulatan biner. */
function hampirSama(a, b) {
  return Math.abs(a - b) < 0.0001;
}

/*
 * FPB (faktor persekutuan terbesar) dua bilangan dengan algoritma Euclid.
 * Dipakai modul pecahan (fase-d/mpi-1.4, mpi-1.5) untuk memeriksa bentuk
 * paling sederhana, dan modul rasio (fase-d/mpi-2.1) untuk menyederhanakan
 * perbandingan. Nilai dibulatkan dan diambil nilai mutlaknya lebih dulu.
 */
function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b > 0) {
    var t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/*
 * KPK (kelipatan persekutuan terkecil) dua bilangan asli, dan KPK
 * sekumpulan bilangan. Dipakai modul pecahan (fase-d/mpi-1.4) untuk
 * mencari penyebut bersama terkecil.
 */
function kpk(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  if (!a || !b) return 0;
  return (a / gcd(a, b)) * b;
}

function kpkBanyak(arr) {
  return arr.reduce(function (acc, n) {
    return kpk(acc, n);
  }, 1);
}

/*
 * Mengacak urutan isi sebuah array (Fisher-Yates) dan mengembalikan array
 * BARU — array asal tidak pernah disentuh, sehingga aman dipakai langsung
 * pada array milik DATA.
 *
 * Dipakai untuk memenuhi ketentuan "pilihan jawaban selalu diacak". Agar
 * pilihan tidak melompat-lompat setiap kali tahap dirender ulang, panggil
 * sekali saat menyiapkan State (mis. di initExerciseArrays()) lalu simpan
 * hasilnya di State — bukan saat render.
 */
function shuffleArray(arr) {
  var out = arr.slice();
  for (var i = out.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/*
 * Menulis bilangan bulat dengan pemisah ribuan bergaya Indonesia
 * (1234567 -> "1.234.567"). Satu-satunya pemformat untuk semua modul.
 *
 * minusSign opsional, default '-'. Modul bilangan bulat (fase-d/mpi-1.3)
 * memakai lambang minus tipografis '−' (U+2212).
 *
 * Nilai pecahan dibulatkan lebih dulu: seluruh pemanggil di repo ini
 * mengirim bilangan bulat, dan tanpa pembulatan loop pengelompokan di
 * bawah akan merusak pecahan ("1234.5" menjadi "123.4.5").
 */
function formatNumber(n, minusSign) {
  var str = String(Math.round(n));
  var sign = '';
  if (str.charAt(0) === '-') {
    sign = minusSign || '-';
    str = str.slice(1);
  }
  var parts = [];
  while (str.length > 3) {
    parts.unshift(str.slice(str.length - 3));
    str = str.slice(0, str.length - 3);
  }
  if (str) parts.unshift(str);
  return sign + parts.join('.');
}

/* Menulis bilangan desimal dengan koma, gaya Indonesia (1.5 -> "1,5"). */
function formatDesimal(n, maksDesimal) {
  var digits = typeof maksDesimal === 'number' ? maksDesimal : 2;
  var faktor = Math.pow(10, digits);
  return String(Math.round(n * faktor) / faktor).replace('.', ',');
}

/*
 * Menulis rasio (pengali) barisan geometri: bilangan bulat apa adanya,
 * pecahan umum dengan karakter pecahan Unicode (0,5 -> "½"), selebihnya
 * desimal berkoma. Tanda negatif memakai minus tipografis '−'.
 */
function formatRatio(r) {
  var sign = r < 0 ? '−' : '';
  var abs = Math.abs(r);
  if (hampirSama(abs, Math.round(abs))) return sign + formatNumber(abs);
  var pecahan = [
    [1 / 2, '½'],
    [1 / 3, '⅓'],
    [2 / 3, '⅔'],
    [1 / 4, '¼'],
    [3 / 4, '¾'],
    [1 / 5, '⅕'],
    [1 / 8, '⅛'],
  ];
  for (var i = 0; i < pecahan.length; i++) {
    if (hampirSama(abs, pecahan[i][0])) return sign + pecahan[i][1];
  }
  return sign + formatDesimal(abs, 3);
}

/*
 * Membaca isian bilangan rasional: bulat ("3", "−2"), desimal ("0,5",
 * ".25") atau pecahan biasa ("1/2", "−3/4"). Dipakai untuk rasio
 * barisan geometri. Bentuk kembaliannya sama seperti parseInputInt.
 */
function parseInputRational(str) {
  if (!str || String(str).trim() === '') return { value: null, error: 'empty' };
  var normalized = String(str)
    .trim()
    .replace(/\s/g, '')
    .replace(/\u2212/g, '-');
  var frac = normalized.match(/^(-?\d+)\/(\d+)$/);
  if (frac) {
    var den = parseInt(frac[2], 10);
    if (den === 0) return { value: null, error: 'invalid' };
    return { value: parseInt(frac[1], 10) / den, error: null };
  }
  return parseInputDecimal(normalized);
}

function esc(str) {
  var m = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, function (ch) {
    return m[ch];
  });
}

/* ============================================================
   2. NOTIFIKASI (TOAST)
   ============================================================ */

var noticeTimer = null;

function showNotice(msg, elementId) {
  var el = document.getElementById(elementId || 'appNotice');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 3000);
}

/* ============================================================
   3. UTILITAS RENDER
   ============================================================ */

function buildFeedbackBox(type, icon, html) {
  return (
    '<div class="feedback-box feedback-box--' +
    esc(type) +
    '" role="alert">' +
    '<span class="feedback-box__icon" aria-hidden="true">' +
    icon +
    '</span>' +
    '<div class="feedback-box__body">' +
    html +
    '</div>' +
    '</div>'
  );
}

function buildProgressDots(total, current, statuses) {
  var dots = '';
  for (var i = 0; i < total; i++) {
    var cls = 'exercise-progress__dot';
    if (i === current) cls += ' exercise-progress__dot--current';
    else if (statuses && statuses[i] === 'correct') cls += ' exercise-progress__dot--done';
    else if (statuses && statuses[i] === 'incorrect') cls += ' exercise-progress__dot--incorrect';
    dots += '<span class="' + cls + '" title="Soal ' + (i + 1) + '">' + (i + 1) + '</span>';
  }
  return (
    '<div class="exercise-progress" aria-label="Progress soal">' +
    dots +
    '<span class="exercise-label">Soal ' +
    (current + 1) +
    ' dari ' +
    total +
    '</span>' +
    '</div>'
  );
}

/* Build an SVG number line from min to max, with a point at value */
function buildNumberLineSVG(value, min, max) {
  var W = 600;
  var H = 80;
  var padX = 40;
  var axisY = 40;
  var tickH = 10;
  var majorH = 16;

  function xOf(v) {
    return padX + ((v - min) / (max - min)) * (W - 2 * padX);
  }

  var ticks = '';
  var labels = '';
  for (var v = min; v <= max; v++) {
    var x = xOf(v);
    var isMajor = v % 5 === 0;
    var h = isMajor ? majorH : tickH;
    ticks +=
      '<line class="nl-tick' +
      (isMajor ? ' nl-tick--major' : '') +
      '" x1="' +
      x +
      '" y1="' +
      (axisY - h / 2) +
      '" x2="' +
      x +
      '" y2="' +
      (axisY + h / 2) +
      '"/>';
    if (isMajor || v === 0) {
      var lCls = v === 0 ? 'nl-label nl-label--zero' : 'nl-label';
      labels +=
        '<text class="' + lCls + '" x="' + x + '" y="' + (axisY + h / 2 + 4) + '">' + v + '</text>';
    }
  }

  var px = xOf(value);
  var point = '<circle class="nl-point" cx="' + px + '" cy="' + axisY + '" r="8"/>';
  var isNeg = value < 0;
  var ptLabel =
    '<text class="nl-point-label" x="' +
    px +
    '" y="' +
    (axisY - 14) +
    '">' +
    (isNeg ? value : '+' + value === '+0' ? '0' : value) +
    '</text>';

  var arrowL = padX - 10;
  var arrowR = W - padX + 10;
  var arrowHead =
    '<polygon class="nl-arrow" points="' +
    arrowR +
    ',' +
    axisY +
    ' ' +
    (arrowR - 8) +
    ',' +
    (axisY - 4) +
    ' ' +
    (arrowR - 8) +
    ',' +
    (axisY + 4) +
    '"/>' +
    '<polygon class="nl-arrow" points="' +
    arrowL +
    ',' +
    axisY +
    ' ' +
    (arrowL + 8) +
    ',' +
    (axisY - 4) +
    ' ' +
    (arrowL + 8) +
    ',' +
    (axisY + 4) +
    '"/>';

  return (
    '<svg class="numberline-svg" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" xmlns="http://www.w3.org/2000/svg" aria-label="Garis bilangan dari ' +
    min +
    ' hingga ' +
    max +
    '">' +
    '<line class="nl-axis" x1="' +
    (padX - 10) +
    '" y1="' +
    axisY +
    '" x2="' +
    (W - padX + 10) +
    '" y2="' +
    axisY +
    '"/>' +
    ticks +
    labels +
    point +
    ptLabel +
    arrowHead +
    '</svg>'
  );
}

/* ============================================================
   4. MESIN NAVIGASI TAHAP
   ============================================================ */

/*
 * Membuat mesin navigasi tahap yang dipakai bersama oleh setiap modul MPI.
 * opts:
 *   stages          array id tahap, urut (wajib)
 *   stageLabels     array label tahap, sejajar dengan `stages` (wajib)
 *   state           objek State milik modul (wajib, dimutasi langsung)
 *   save            function() — menyimpan State (wajib, mis. saveState)
 *   render          function() — merender tahap aktif (wajib, mis. renderCurrentStage)
 *   notice          function(msg) — menampilkan notifikasi (opsional, default showNotice)
 *   listId          id elemen <ol> daftar navigasi (opsional, default 'stageNavList')
 *   progressFillId  id elemen fill progress bar (opsional, default 'progressFill')
 *   progressLabelId id elemen label progress bar (opsional, default 'progressLabel')
 *
 * Mengembalikan { navigateTo, completeStage, updateStageNav, buildStageNav, updateProgress }.
 */
function createStageMachine(opts) {
  var stages = opts.stages;
  var stageLabels = opts.stageLabels;
  var state = opts.state;
  var save = opts.save;
  var render = opts.render;
  var notice = opts.notice || showNotice;
  var listId = opts.listId || 'stageNavList';
  var progressFillId = opts.progressFillId || 'progressFill';
  var progressLabelId = opts.progressLabelId || 'progressLabel';

  function navigateTo(stageId) {
    var targetIdx = stages.indexOf(stageId);
    var currentIdx = stages.indexOf(state.currentStage);
    if (targetIdx === -1) return;

    if (targetIdx > currentIdx) {
      for (var i = currentIdx; i < targetIdx; i++) {
        if (!state.completedStages[stages[i]]) {
          notice('Selesaikan tahap "' + stageLabels[i] + '" terlebih dahulu.');
          return;
        }
      }
    }

    state.currentStage = stageId;
    save();
    updateStageNav();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeStage(stageId) {
    state.completedStages[stageId] = true;
    save();
    updateStageNav();
    updateProgress();
  }

  function updateStageNav() {
    var items = document.querySelectorAll('.stage-nav__item[data-stage]');
    var currentIdx = stages.indexOf(state.currentStage);
    items.forEach(function (item) {
      var sid = item.dataset.stage;
      var idx = stages.indexOf(sid);
      item.removeAttribute('aria-current');
      item.classList.remove('is-complete');
      item.disabled = false;
      if (sid === state.currentStage) item.setAttribute('aria-current', 'step');
      else if (state.completedStages[sid]) item.classList.add('is-complete');
      if (idx > currentIdx && !state.completedStages[stages[idx - 1]]) item.disabled = true;
    });
  }

  function buildStageNav() {
    var list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = stages
      .map(function (sid, i) {
        return (
          '<li>' +
          '<button type="button" class="stage-nav__item" data-stage="' +
          sid +
          '">' +
          '<span class="stage-nav__num">' +
          (i + 1) +
          '</span>' +
          esc(stageLabels[i]) +
          '</button></li>'
        );
      })
      .join('');
    list.querySelectorAll('.stage-nav__item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigateTo(btn.dataset.stage);
      });
    });
    updateStageNav();
  }

  function updateProgress() {
    var total = stages.length;
    var done = Object.keys(state.completedStages).length;
    var pct = Math.round((done / total) * 100);
    var fill = document.getElementById(progressFillId);
    var label = document.getElementById(progressLabelId);
    if (fill) {
      fill.style.width = pct + '%';
      fill.parentElement.setAttribute('aria-valuenow', pct);
    }
    if (label) label.textContent = done + ' dari ' + total + ' tahap selesai';
  }

  return {
    navigateTo: navigateTo,
    completeStage: completeStage,
    updateStageNav: updateStageNav,
    buildStageNav: buildStageNav,
    updateProgress: updateProgress,
  };
}

/* ============================================================
   5. TAHAP LATIHAN SOAL
   ============================================================ */

/*
 * Membuat satu tahap latihan soal — pola yang berulang di hampir semua
 * modul MPI. Menangani state per-soal, progress dots, kotak umpan balik,
 * alur petunjuk → jawaban, serta tombol Soal Berikutnya / Lanjut. Bagian
 * yang unik per soal (visualisasi/cerita/pertanyaan) datang dari
 * `renderPrompt`.
 *
 * Dua tipe soal didukung dan BOLEH BERCAMPUR dalam satu tahap, karena
 * tipenya dibaca per soal dari `s.type`:
 *   'input'  — ketik sebuah bilangan, lalu periksa (boleh berkali-kali)
 *   'choice' — pilihan ganda sekali-pilih
 *
 * cfg (umum):
 *   soal                   array soal dari DATA (tidak pernah diganti, aman direferensikan)
 *   getExercises()         array state per-soal saat ini (State) — HARUS berupa
 *                          function, karena initExerciseArrays()/loadState()
 *                          mengganti (bukan memutasi) array ini
 *   getIndex, setIndex     accessor indeks soal aktif (mis. field di State)
 *   save                   function() — simpan State
 *   renderPrompt(s)        HTML unik untuk soal (visual/cerita/pertanyaan)
 *   idPrefix               awalan id elemen DOM (mis. 'gb' → gbInput, gbCheckBtn, ...)
 *   sectionLabel, kicker, goal, instruction   teks kepala tahap
 *   nextStageId, completeStageId, nextButtonLabel   tujuan setelah semua soal selesai
 *   defaultType            (opsional) tipe untuk soal tanpa `s.type`, default 'input'
 *   afterRender(container) (opsional) dipanggil setiap selesai render, mis. untuk
 *                          centerNumberLines() pada soal bergaris bilangan
 *   buildHead()            (opsional) mengganti markup kepala tahap seluruhnya —
 *                          dipakai modul yang memakai penanda sendiri (mis. pbl-badge)
 *
 * cfg (khusus soal 'input'):
 *   checkValue(s)          nilai jawaban benar untuk soal s
 *   revealText(s)          HTML isi kotak "jawaban diungkap"
 *   wrapClass, inputRowClass   (opsional) default 'ex-exercise'/'ex-input-row'
 *   inputAriaLabel, inputPlaceholder   (opsional)
 *   inputSuffix(s)         (opsional) HTML tepat di samping kotak isian,
 *                          mis. satuan jawaban
 *   stripPunctuation       (opsional) diteruskan ke parseInputInt
 *   parseInput(val)        (opsional) pengganti parseInputInt, mengembalikan
 *                          { value, error, message? }; `message` (bila ada)
 *                          dipakai sebagai notice isian tidak valid
 *   isCorrect(value, s)    (opsional) pengganti `value === checkValue(s)`,
 *                          mis. hampirSama() untuk jawaban desimal
 *   inputMode              (opsional) nilai atribut inputmode kotak isian,
 *                          mis. 'decimal'
 *   allowNegative          (opsional) true → kotak isian tanpa inputmode numerik
 *                          agar tombol minus tersedia di keyboard ponsel
 *   revealAfterAttempts    (opsional, default 2)
 *   revealButtonStyle      (opsional) 'combined' (default) — satu tombol Petunjuk
 *                          yang berubah menjadi pengungkap jawaban setelah
 *                          `revealAfterAttempts` percobaan; atau 'separate' —
 *                          tombol Petunjuk terpisah dari tombol "Lihat Jawaban"
 *                          yang baru muncul setelah `revealAfterAttempts` percobaan
 *   countAttemptOnInvalid  (opsional, default false) saat true, input kosong/tidak
 *                          valid tetap dihitung sebagai percobaan (dan disimpan)
 *   emptyMessage, invalidMessage   (opsional) pesan notice untuk input kosong/tidak valid
 *   showAttemptErrorWithHint  (opsional, default false) saat true, kotak "jawabanmu
 *                          belum tepat" tetap tampil berdampingan dengan petunjuk
 *
 * Petunjuk berjenjang: soal boleh memakai `s.hints` (array) alih-alih `s.hint`
 * (string tunggal). Tombol Petunjuk lalu membuka satu tingkat per klik dan
 * menampilkan jumlahnya, mis. "💡 Petunjuk (2/3)".
 *
 * cfg (khusus soal 'choice'):
 *   listClass              (opsional) class pembungkus daftar pilihan, default 'choice-list'
 *   letters                (opsional) label huruf pilihan, default ['A','B','C','D','E']
 *   choiceClassStyle       (opsional) 'modifier' (default) memancarkan
 *                          `choice-btn--correct` (kelas per-modul), atau 'state'
 *                          memancarkan `.is-correct` sesuai shared/base.css
 *   buildChoiceFeedback(s, ex)   (opsional) mengganti isi kotak umpan balik pilihan ganda
 *
 * Soal 'choice' wajib punya `.options` (array {id, label}) dan `.correct`
 * (id opsi yang benar).
 *
 * Pengacakan pilihan: bila state per-soal memuat `optionOrder` (array id opsi),
 * opsi dirender menurut urutan itu. Isi sekali saat menyiapkan state agar
 * urutan teracak namun stabil lintas render/reload, mis.
 *
 *   ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (s) {
 *     return {
 *       attempts: 0, hintLevel: 0, correct: false, userInput: '', revealed: false,
 *       chosen: null,
 *       optionOrder: s.options ? shuffleArray(s.options.map(function (o) { return o.id; })) : null,
 *     };
 *   });
 *
 * Mengembalikan { render(container) }.
 */
function createExerciseStage(cfg) {
  var soal = cfg.soal;
  var prefix = cfg.idPrefix;
  var wrapClass = cfg.wrapClass || 'ex-exercise';
  var inputRowClass = cfg.inputRowClass || 'ex-input-row';
  var listClass = cfg.listClass || 'choice-list';
  var letters = cfg.letters || ['A', 'B', 'C', 'D', 'E'];
  var revealAfter = cfg.revealAfterAttempts || 2;
  var revealStyle = cfg.revealButtonStyle || 'combined';
  var stateStyle = cfg.choiceClassStyle === 'state';
  var countAttemptOnInvalid = !!cfg.countAttemptOnInvalid;
  var emptyMessage = cfg.emptyMessage || 'Masukkan bilangan terlebih dahulu.';
  var invalidMessage =
    cfg.invalidMessage || 'Masukkan bilangan bulat yang valid (contoh: −3, 0, 7).';

  function typeOf(s) {
    return s.type || cfg.defaultType || 'input';
  }

  /* `s.hints` (berjenjang) maupun `s.hint` (tunggal) sama-sama diterima. */
  function hintsOf(s) {
    if (Array.isArray(s.hints)) return s.hints;
    return s.hint ? [s.hint] : [];
  }

  /* State lama menyimpan hintShown (boolean); yang baru hintLevel (angka). */
  function hintLevelOf(ex) {
    if (typeof ex.hintLevel === 'number') return ex.hintLevel;
    return ex.hintShown ? 1 : 0;
  }

  function setHintLevel(ex, level) {
    ex.hintLevel = level;
    ex.hintShown = level > 0;
  }

  function isAnswered(s, ex) {
    if (typeOf(s) === 'choice') return ex.chosen !== null && ex.chosen !== undefined;
    return !!(ex.correct || ex.revealed);
  }

  function statusOf(s, ex) {
    if (ex.correct) return 'correct';
    if (typeOf(s) === 'choice') {
      return ex.chosen !== null && ex.chosen !== undefined ? 'incorrect' : null;
    }
    return ex.attempts > 0 ? 'incorrect' : null;
  }

  function buildHead() {
    if (cfg.buildHead) return cfg.buildHead();
    return (
      '<div class="stage-head">' +
      '<span class="stage-head__kicker">' +
      esc(cfg.kicker) +
      '</span>' +
      '<p class="stage-head__goal">Tujuan: ' +
      esc(cfg.goal) +
      '</p>' +
      '</div>'
    );
  }

  function buildInputBody(s, ex) {
    var hints = hintsOf(s);
    var level = hintLevelOf(ex);

    var feedbackHTML = '';
    if (ex.correct) {
      feedbackHTML = buildFeedbackBox('success', '✓', '<strong>Tepat!</strong> ' + s.explanation);
    } else if (ex.revealed) {
      feedbackHTML = buildFeedbackBox('info', '👁', cfg.revealText(s));
    } else {
      var errorHTML =
        ex.attempts > 0
          ? buildFeedbackBox(
              'error',
              '✗',
              'Jawabanmu <strong>' +
                esc(ex.userInput) +
                '</strong> belum tepat. Coba lagi atau lihat petunjuk.'
            )
          : '';
      var hintHTML = hints
        .slice(0, level)
        .map(function (h, i) {
          var label = hints.length > 1 ? 'Petunjuk ' + (i + 1) : 'Petunjuk';
          return buildFeedbackBox('warning', '💡', '<strong>' + label + ':</strong> ' + h);
        })
        .join('');
      /* Default lama: petunjuk menggantikan kotak galat. */
      if (hintHTML && !cfg.showAttemptErrorWithHint) errorHTML = '';
      feedbackHTML = errorHTML + hintHTML;
    }

    var actionHTML = '';
    if (!ex.correct && !ex.revealed) {
      var revealBtnHTML = '';
      if (revealStyle === 'separate' && ex.attempts >= revealAfter) {
        revealBtnHTML =
          '<button type="button" class="btn btn--ghost btn--small" id="' +
          prefix +
          'RevealBtn">Lihat Jawaban</button>';
      }
      var hintLabel =
        hints.length > 1
          ? '💡 Petunjuk (' + Math.min(level + 1, hints.length) + '/' + hints.length + ')'
          : '💡 Petunjuk';
      var hintBtnHTML =
        hints.length > 1 && level >= hints.length
          ? ''
          : '<button type="button" class="btn btn--ghost btn--small" id="' +
            prefix +
            'HintBtn">' +
            hintLabel +
            '</button>';
      actionHTML =
        '<div class="' +
        inputRowClass +
        '">' +
        '<input type="text"' +
        (cfg.inputMode
          ? ' inputmode="' + esc(cfg.inputMode) + '"'
          : cfg.allowNegative
          ? ''
          : ' inputmode="numeric"') +
        ' id="' +
        prefix +
        'Input" class="input-text" placeholder="' +
        esc(cfg.inputPlaceholder || '...') +
        '" aria-label="' +
        esc(cfg.inputAriaLabel || 'Jawaban') +
        '" value="' +
        esc(ex.userInput) +
        '">' +
        (cfg.inputSuffix ? cfg.inputSuffix(s) : '') +
        '<button type="button" class="btn btn--primary" id="' +
        prefix +
        'CheckBtn">Periksa</button>' +
        hintBtnHTML +
        revealBtnHTML +
        '</div>';
    }

    return (
      '<div class="' +
      wrapClass +
      '">' +
      cfg.renderPrompt(s) +
      actionHTML +
      (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '') +
      '</div>'
    );
  }

  /*
   * Urutan tampil pilihan ganda. Bila State per-soal menyimpan `optionOrder`
   * (array id opsi, dibuat sekali dengan shuffleArray saat menyiapkan State),
   * opsi dirender menurut urutan itu sehingga teracak tetapi stabil lintas
   * render dan reload. Tanpa `optionOrder` — atau bila isinya tidak lagi
   * cocok dengan `s.options` — urutan DATA dipakai apa adanya, sehingga modul
   * lama tidak berubah perilakunya.
   */
  function orderedOptions(s, ex) {
    if (!ex || !Array.isArray(ex.optionOrder)) return s.options;
    if (ex.optionOrder.length !== s.options.length) return s.options;
    var byId = {};
    s.options.forEach(function (opt) {
      byId[opt.id] = opt;
    });
    var out = [];
    for (var i = 0; i < ex.optionOrder.length; i++) {
      var opt = byId[ex.optionOrder[i]];
      if (!opt) return s.options;
      out.push(opt);
    }
    return out;
  }

  function buildChoiceBody(s, ex) {
    var answered = ex.chosen !== null && ex.chosen !== undefined;

    var choicesHTML = orderedOptions(s, ex)
      .map(function (opt, i) {
        var cls = 'choice-btn';
        if (answered) {
          if (opt.id === s.correct) cls += stateStyle ? ' is-correct' : ' choice-btn--correct';
          else if (opt.id === ex.chosen)
            cls += stateStyle ? ' is-incorrect' : ' choice-btn--incorrect';
          else if (!stateStyle) cls += ' choice-btn--disabled';
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-opt-id="' +
          esc(opt.id) +
          '"' +
          (answered && stateStyle ? ' disabled' : '') +
          '>' +
          '<span class="' +
          (stateStyle ? 'choice-btn__icon' : 'choice-letter') +
          '">' +
          letters[i] +
          '</span>' +
          opt.label +
          '</button>'
        );
      })
      .join('');

    var feedbackHTML = '';
    if (answered) {
      feedbackHTML = cfg.buildChoiceFeedback
        ? cfg.buildChoiceFeedback(s, ex)
        : ex.correct
        ? buildFeedbackBox('success', '✓', '<strong>Benar!</strong> ' + s.explanation)
        : buildFeedbackBox('error', '✗', '<strong>Belum tepat.</strong> ' + s.explanation);
    }

    return (
      cfg.renderPrompt(s) +
      '<div class="' +
      listClass +
      '" id="' +
      prefix +
      'Choices">' +
      choicesHTML +
      '</div>' +
      (feedbackHTML ? '<div style="margin-top:var(--space-3);">' + feedbackHTML + '</div>' : '')
    );
  }

  function render(container) {
    /* Dibaca ulang setiap render: initExerciseArrays()/loadState() mengganti
       (bukan memutasi) array ini, jadi tidak boleh disimpan di closure. */
    var exArr = cfg.getExercises();
    var idx = cfg.getIndex();
    var s = soal[idx];
    var ex = exArr[idx];
    var isChoice = typeOf(s) === 'choice';

    var allDone =
      exArr.filter(function (e, i) {
        return isAnswered(soal[i], e);
      }).length === soal.length;

    var statuses = exArr.map(function (e, i) {
      return statusOf(soal[i], e);
    });

    var navHTML = '';
    if (isAnswered(s, ex)) {
      if (idx < soal.length - 1) {
        navHTML =
          '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary" id="' +
          prefix +
          'NextBtn">Soal Berikutnya →</button></div>';
      } else if (allDone) {
        navHTML =
          '<div class="btn-group btn-group--end"><button type="button" class="btn btn--primary btn--large" id="' +
          prefix +
          'FinishBtn">' +
          esc(cfg.nextButtonLabel) +
          '</button></div>';
      }
    }

    container.innerHTML =
      '<section aria-label="' +
      esc(cfg.sectionLabel) +
      '">' +
      buildHead() +
      '<div class="panel">' +
      '<p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">' +
      esc(cfg.instruction) +
      '</p>' +
      buildProgressDots(soal.length, idx, statuses) +
      (isChoice ? buildChoiceBody(s, ex) : buildInputBody(s, ex)) +
      '</div>' +
      navHTML +
      '</section>';

    var inp = document.getElementById(prefix + 'Input');
    var checkBtn = document.getElementById(prefix + 'CheckBtn');
    var hintBtn = document.getElementById(prefix + 'HintBtn');
    var revealBtn = document.getElementById(prefix + 'RevealBtn');
    var nextBtn = document.getElementById(prefix + 'NextBtn');
    var finishBtn = document.getElementById(prefix + 'FinishBtn');

    if (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && checkBtn) checkBtn.click();
      });
    }

    if (checkBtn) {
      checkBtn.addEventListener('click', function () {
        if (!inp) return;
        var val = inp.value;
        var parsed = cfg.parseInput
          ? cfg.parseInput(val)
          : parseInputInt(val, cfg.stripPunctuation);
        if (parsed.error) {
          if (countAttemptOnInvalid) {
            ex.userInput = val;
            ex.attempts += 1;
            cfg.save();
          }
          showNotice(parsed.error === 'empty' ? emptyMessage : parsed.message || invalidMessage);
          return;
        }
        ex.userInput = val;
        ex.attempts += 1;
        ex.correct = cfg.isCorrect
          ? cfg.isCorrect(parsed.value, s)
          : parsed.value === cfg.checkValue(s);
        if (ex.correct) ex.checked = true;
        cfg.save();
        render(container);
      });
    }

    if (hintBtn) {
      hintBtn.addEventListener('click', function () {
        var hints = hintsOf(s);
        var level = hintLevelOf(ex);
        if (hints.length > 1) {
          setHintLevel(ex, Math.min(level + 1, hints.length));
        } else if (revealStyle === 'separate' || level === 0 || ex.attempts < revealAfter) {
          setHintLevel(ex, 1);
        } else {
          ex.revealed = true;
        }
        cfg.save();
        render(container);
      });
    }

    if (revealBtn) {
      revealBtn.addEventListener('click', function () {
        ex.revealed = true;
        cfg.save();
        render(container);
      });
    }

    container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (ex.chosen !== null && ex.chosen !== undefined) return;
        var optId = btn.dataset.optId;
        ex.chosen = optId;
        ex.attempts += 1;
        ex.correct = optId === s.correct;
        ex.checked = true;
        cfg.save();
        render(container);
      });
    });

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        cfg.setIndex(idx + 1);
        cfg.save();
        render(container);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', function () {
        completeStage(cfg.completeStageId);
        navigateTo(cfg.nextStageId);
      });
    }

    if (cfg.afterRender) cfg.afterRender(container);
  }

  return { render: render };
}

/*
 * Pembungkus tipis createExerciseStage untuk tahap yang seluruh soalnya
 * berupa isian numerik. Dipertahankan agar pemanggil lama tidak berubah.
 */
function createNumericInputExercise(cfg) {
  return createExerciseStage(Object.assign({}, cfg, { defaultType: 'input' }));
}

/*
 * Pembungkus tipis createExerciseStage untuk tahap yang seluruh soalnya
 * berupa pilihan ganda. Dipertahankan agar pemanggil lama tidak berubah.
 */
function createMultipleChoiceExercise(cfg) {
  return createExerciseStage(Object.assign({}, cfg, { defaultType: 'choice' }));
}

/* ============================================================
   6. STATE PERSISTENCE
   ============================================================ */

/*
 * Membuat penyimpanan localStorage untuk objek State satu modul — pola
 * saveState/loadState/clearState yang identik di setiap modul (simpan
 * JSON, muat balik dengan Object.assign, atau kembalikan ke bentuk awal).
 *
 * "Bentuk awal" diambil dari `state` itu sendiri pada saat createStore()
 * dipanggil (segera setelah `var State = {...}` dideklarasikan, sebelum
 * ada mutasi) — jadi field default State tidak perlu ditulis ulang di
 * tempat lain untuk reset.
 *
 * opts:
 *   key      kunci localStorage (mis. STORAGE_KEY)
 *   state    objek State milik modul (wajib, dimutasi langsung — never
 *            diganti, supaya referensi lain ke `state` tetap valid)
 *
 * Mengembalikan { save(), load(), reset() }. `reset()` hanya mengembalikan
 * field ke nilai awal dan menghapus data localStorage; pemanggil tetap
 * bertanggung jawab memanggil initExerciseArrays() (atau sejenisnya)
 * setelahnya bila diperlukan, sama seperti clearState() sebelumnya.
 */
function createStore(opts) {
  var key = opts.key;
  var state = opts.state;
  var defaults = JSON.parse(JSON.stringify(state));

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return false;
      Object.assign(state, JSON.parse(raw));
      return true;
    } catch (e) {
      return false;
    }
  }

  function reset() {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      /* ignore */
    }
    Object.keys(state).forEach(function (k) {
      delete state[k];
    });
    Object.assign(state, JSON.parse(JSON.stringify(defaults)));
  }

  return { save: save, load: load, reset: reset };
}

/*
 * Memastikan array state per-soal (mis. State.garisBilanganExercises)
 * ada dan panjangnya sesuai jumlah soal — jika belum, (re)buat dari
 * `makeDefault(s)` untuk tiap soal `s` (berguna saat bentuk default
 * bergantung pada field soal itu, mis. `s.type`). Pola berulang di
 * setiap initExerciseArrays() modul.
 *
 *   ensureExerciseArray(State, 'garisBilanganExercises', DATA.garisBilangan.soal, function () {
 *     return { attempts: 0, hintShown: false, correct: false, userInput: '', revealed: false };
 *   });
 */
function ensureExerciseArray(state, key, soal, makeDefault) {
  if (!state[key] || state[key].length !== soal.length) {
    state[key] = soal.map(function (s) {
      return makeDefault(s);
    });
  }
}

/* ============================================================
   7. KOMPONEN DISCOVERY LEARNING
   Blok bangun kecil untuk tahap-tahap penemuan terbimbing:
   pilihan yang diacak sekali lalu disimpan di State, petunjuk
   berjenjang, kepala tahap bertanda sintaks, catatan peran guru,
   dan visual deret suku dengan "busur" selisih.
   ============================================================ */

/* Daftar id dari array opsi {id, ...}. */
function optionIds(options) {
  return options.map(function (o) {
    return o.id;
  });
}

/*
 * Memastikan state[key] berisi urutan acak id opsi yang masih cocok
 * dengan `options`; bila belum ada atau sudah tidak cocok (DATA berubah),
 * urutan baru diacak dengan shuffleArray(). Panggil di initExerciseArrays()
 * — bukan saat render — agar urutan stabil lintas render/reload namun
 * teracak ulang setiap kali progress direset.
 */
function ensureShuffledOrder(state, key, options) {
  var order = state[key];
  var ids = optionIds(options);
  var cocok =
    Array.isArray(order) &&
    order.length === ids.length &&
    ids.every(function (id) {
      return order.indexOf(id) !== -1;
    });
  if (!cocok) state[key] = shuffleArray(ids);
  return state[key];
}

/*
 * Menyusun opsi menurut urutan id tersimpan. Bila urutan tidak ada atau
 * tidak cocok, urutan DATA dipakai apa adanya agar tampilan tetap aman.
 */
function orderByIds(options, order) {
  if (!Array.isArray(order) || order.length !== options.length) return options;
  var byId = {};
  options.forEach(function (o) {
    byId[o.id] = o;
  });
  var out = [];
  for (var i = 0; i < order.length; i++) {
    if (!byId[order[i]]) return options;
    out.push(byId[order[i]]);
  }
  return out;
}

/*
 * Kepala tahap bergaya shared (.stage-head). `syntax` opsional menandai
 * sintaks model pembelajaran, mis. "Discovery Learning · Sintaks 3".
 */
function buildDiscoveryHead(kicker, goal, syntax) {
  return (
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">' +
    esc(kicker) +
    '</span>' +
    (syntax ? '<span class="dl-syntax-chip">' + esc(syntax) + '</span>' : '') +
    '<p class="stage-head__goal">Tujuan: ' +
    esc(goal) +
    '</p>' +
    '</div>'
  );
}

/*
 * Catatan peran guru yang bisa dibuka-tutup (<details>), sehingga media
 * sekaligus menjadi panduan fasilitasi tanpa mengganggu murid.
 */
function buildTeacherNote(text) {
  if (!text) return '';
  return (
    '<details class="teacher-note">' +
    '<summary>👩‍🏫 Peran guru di tahap ini</summary>' +
    '<p>' +
    text +
    '</p>' +
    '</details>'
  );
}

/*
 * Tombol pilihan ganda (.choice-btn + .is-*) dalam urutan `order`.
 *   opts.chosen     id opsi yang sudah dipilih (atau null)
 *   opts.correctId  id opsi benar untuk ditandai hijau; null bila jawaban
 *                   benar belum boleh dibocorkan (masih boleh coba lagi)
 *   opts.grade      true → tandai benar/salah; false → hanya .is-selected
 *                   (untuk dugaan/penilaian diri yang tidak dinilai)
 *   opts.locked     true → matikan semua tombol setelah dijawab
 *   opts.attr       nama atribut data untuk id opsi (default 'data-opt-id')
 *   opts.group      nilai data-group opsional untuk membedakan beberapa
 *                   kelompok pilihan dalam satu tahap
 */
function buildChoiceGroup(options, order, opts) {
  opts = opts || {};
  var letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  var chosen = opts.chosen;
  var answered = chosen !== null && chosen !== undefined && chosen !== '';
  var attr = opts.attr || 'data-opt-id';
  return (
    '<div class="challenge-options"' +
    (opts.group ? ' role="group" data-group="' + esc(opts.group) + '"' : ' role="group"') +
    '>' +
    orderByIds(options, order)
      .map(function (opt, i) {
        var cls = 'choice-btn';
        if (answered) {
          if (opts.grade) {
            if (opts.correctId && opt.id === opts.correctId) cls += ' is-correct';
            else if (opt.id === chosen) cls += ' is-incorrect';
          } else if (opt.id === chosen) {
            cls += ' is-selected';
          }
        }
        return (
          '<button type="button" class="' +
          cls +
          '" ' +
          attr +
          '="' +
          esc(opt.id) +
          '"' +
          (opts.group ? ' data-group="' + esc(opts.group) + '"' : '') +
          (answered && opts.locked ? ' disabled' : '') +
          ' aria-pressed="' +
          (opt.id === chosen ? 'true' : 'false') +
          '">' +
          '<span class="choice-btn__icon">' +
          letters[i] +
          '</span>' +
          '<span>' +
          opt.label +
          '</span>' +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Kotak petunjuk berjenjang: menampilkan `level` petunjuk pertama. */
function buildHintStack(hints, level) {
  if (!hints || !level || level < 1) return '';
  return hints
    .slice(0, level)
    .map(function (h, i) {
      return (
        '<div class="hint-box">' +
        '<span class="hint-box__label">' +
        (hints.length > 1 ? 'Petunjuk ' + (i + 1) : 'Petunjuk') +
        '</span>' +
        h +
        '</div>'
      );
    })
    .join('');
}

/* Tombol pembuka petunjuk berikutnya; '' bila semua petunjuk terbuka. */
function buildHintToggle(id, hints, level) {
  if (!hints || level >= hints.length) return '';
  var label =
    hints.length > 1 ? '💡 Petunjuk (' + (level + 1) + '/' + hints.length + ')' : '💡 Petunjuk';
  return (
    '<button type="button" class="btn btn--ghost btn--small" id="' + id + '">' + label + '</button>'
  );
}

/*
 * Visual deret suku: kotak-kotak suku dengan "busur" selisih di antaranya.
 *   terms          array nilai suku
 *   opts.labels    label di atas tiap kotak (mis. 'Baris 1'); default 'U₁', 'U₂', ...
 *   opts.reveal    banyak suku yang terlihat (sisanya '?'); default semua
 *   opts.showDiff  true → tampilkan nilai busur (selisih/rasio); false → '?'
 *   opts.gap       'diff' (default) → busur berisi selisih (+b, barisan
 *                  aritmetika); 'ratio' → busur berisi pengali (×r, barisan
 *                  geometri), ditulis dengan formatRatio()
 *   opts.format    function(n) → teks nilai suku (default formatNumber dengan '−')
 *   opts.more      true → tambahkan kotak '…' di akhir
 *   opts.tail      {label, value} opsional: kotak suku jauh (mis. U₂₀ = ?)
 */
function buildSequenceTiles(terms, opts) {
  opts = opts || {};
  var reveal = typeof opts.reveal === 'number' ? opts.reveal : terms.length;
  var fmt =
    opts.format ||
    function (n) {
      return formatNumber(n, '−');
    };
  var subs = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  function sub(n) {
    return String(n)
      .split('')
      .map(function (d) {
        return subs[+d];
      })
      .join('');
  }
  var html = '';
  for (var i = 0; i < terms.length; i++) {
    var shown = i < reveal;
    if (i > 0) {
      var diffText = '?';
      if (opts.showDiff && shown) {
        if (opts.gap === 'ratio') {
          diffText = '×' + formatRatio(terms[i] / terms[i - 1]);
        } else {
          var diff = terms[i] - terms[i - 1];
          diffText = (diff >= 0 ? '+' : '−') + fmt(Math.abs(diff));
        }
      }
      html +=
        '<span class="seq-gap' +
        (opts.gap === 'ratio' ? ' seq-gap--ratio' : '') +
        (opts.showDiff && shown ? ' seq-gap--known' : '') +
        '" aria-hidden="true"><span class="seq-gap__val">' +
        diffText +
        '</span></span>';
    }
    var label = opts.labels ? opts.labels[i] : 'U' + sub(i + 1);
    html +=
      '<span class="seq-tile' +
      (shown ? '' : ' seq-tile--hidden') +
      (shown && i === reveal - 1 && opts.highlightLast ? ' seq-tile--new' : '') +
      '">' +
      '<span class="seq-tile__label">' +
      esc(label) +
      '</span>' +
      '<span class="seq-tile__val">' +
      (shown ? fmt(terms[i]) : '?') +
      '</span>' +
      '</span>';
  }
  if (opts.more) {
    html += '<span class="seq-gap seq-gap--dots" aria-hidden="true">…</span>';
  }
  if (opts.tail) {
    html +=
      '<span class="seq-tile seq-tile--tail">' +
      '<span class="seq-tile__label">' +
      esc(opts.tail.label) +
      '</span>' +
      '<span class="seq-tile__val">' +
      esc(opts.tail.value) +
      '</span>' +
      '</span>';
  }
  var aria = terms
    .slice(0, reveal)
    .map(function (t) {
      return fmt(t);
    })
    .join(', ');
  return (
    '<div class="seq-tiles" role="img" aria-label="Barisan: ' +
    esc(aria) +
    (reveal < terms.length || opts.more ? ', …' : '') +
    '">' +
    html +
    '</div>'
  );
}

/* ============================================================
   8. KOMPONEN DISCOVERY LEARNING — LANGKAH ISIAN, PEMILAHAN,
      & GRAFIK PERBANDINGAN
   Dipakai tahap pengolahan data/pembuktian (isian bertahap
   berpetunjuk), tahap pemilahan (setiap pernyataan dipilahkan
   ke salah satu kategori dengan opsi teracak), dan tahap
   membandingkan dua barisan secara visual.
   ============================================================ */

/* Panel shared (.panel) dengan class tambahan opsional. */
function buildDlPanel(inner, cls) {
  return '<div class="panel' + (cls ? ' ' + cls : '') + '">' + inner + '</div>';
}

/* Tombol lanjut rata kanan. */
function buildDlNextButton(id, label, large) {
  return (
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary' +
    (large ? ' btn--large' : '') +
    '" id="' +
    id +
    '">' +
    esc(label) +
    '</button>' +
    '</div>'
  );
}

/* Label opsi {id, label} berdasarkan id; '' bila tidak ada. */
function findOptionLabel(options, id) {
  for (var i = 0; i < options.length; i++) {
    if (options[i].id === id) return options[i].label;
  }
  return '';
}

/* State default satu langkah isian bertahap. */
function makeDlStep() {
  return { input: '', done: false, salah: false, attempts: 0, hintLevel: 0 };
}

/*
 * Kotak isian bilangan.
 *   opts.allowNegative  true → tanpa inputmode numerik agar tombol minus
 *                       tersedia di keyboard ponsel
 *   opts.rational       true → inputmode desimal (koma/garis miring)
 *   opts.desimal        true → inputmode="decimal" (desimal berkoma)
 *   opts.error, opts.disabled, opts.aria, opts.placeholder
 */
function buildDlNumInput(id, value, opts) {
  opts = opts || {};
  var mode = '';
  if (opts.desimal) mode = ' inputmode="decimal"';
  else if (opts.rational) mode = ' inputmode="text"';
  else if (!opts.allowNegative) mode = ' inputmode="numeric"';
  return (
    '<input type="text" class="input-text dl-num-input' +
    (opts.error ? ' has-error' : '') +
    '" id="' +
    id +
    '"' +
    mode +
    ' autocomplete="off" value="' +
    esc(value || '') +
    '" aria-label="' +
    esc(opts.aria || 'Jawaban') +
    '"' +
    (opts.disabled ? ' disabled' : '') +
    ' placeholder="' +
    esc(opts.placeholder || '…') +
    '">'
  );
}

/*
 * Membaca isian bilangan; menampilkan notice dan mengembalikan null bila
 * kosong/tidak valid. `rational` true menerima desimal & pecahan (1/2),
 * selain itu bilangan bulat dengan pemisah ribuan.
 */
function readDlNumber(val, rational) {
  var parsed = rational ? parseInputRational(val) : parseInputInt(val, true);
  if (parsed.error) {
    showNotice(
      parsed.error === 'empty'
        ? 'Isi jawabanmu terlebih dahulu.'
        : rational
        ? 'Tulis jawaban berupa bilangan, pecahan, atau desimal, mis. 3, 1/2, atau 0,5.'
        : 'Tulis jawaban berupa bilangan bulat, mis. 12 atau −40.'
    );
    return null;
  }
  return parsed.value;
}

/*
 * Satu langkah isian bertahap: label, isian, tombol Periksa & Petunjuk,
 * umpan balik salah, dan teks temuan setelah benar.
 *   id    awalan id DOM (mis. 'sn0' → sn0Input, sn0Check, sn0Hint)
 *   st    state langkah (makeDlStep)
 *   step  { label, jawab, hints, temuan|bukti, allowNegative, rational,
 *           desimal }  — desimal true: isian wajib berkoma
 *           (parseInputDesimalKoma), dibandingkan dengan hampirSama()
 *   num   nomor langkah opsional (bulatan kecil di depan label)
 */
function buildDlStep(id, st, step, num) {
  var temuan = step.temuan || step.bukti || '';
  var head =
    '<p class="dl-step__label">' +
    (num ? '<span class="dl-step__num">' + num + '</span>' : '') +
    step.label +
    '</p>';
  if (st.done) {
    return (
      '<div class="dl-step dl-step--done">' +
      head +
      '<p class="dl-step__answer">✓ ' +
      esc(st.input) +
      '</p>' +
      (temuan ? buildFeedbackBox('success', '💡', temuan) : '') +
      '</div>'
    );
  }
  return (
    '<div class="dl-step">' +
    head +
    '<div class="dl-input-row">' +
    buildDlNumInput(id + 'Input', st.input, {
      error: st.salah,
      allowNegative: step.allowNegative,
      rational: step.rational,
      desimal: step.desimal,
    }) +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    'Check">Periksa</button>' +
    buildHintToggle(id + 'Hint', step.hints, st.hintLevel) +
    '</div>' +
    (st.salah
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(
          'error',
          '✗',
          'Jawaban <strong>' + esc(st.input) + '</strong> belum tepat. Periksa lagi perhitunganmu.'
        ) +
        '</div>'
      : '') +
    buildHintStack(step.hints, st.hintLevel) +
    '</div>'
  );
}

/* Memasang event buildDlStep; `save` lalu `rerender` dipanggil setelah perubahan. */
function bindDlStep(id, st, step, save, rerender) {
  var inp = document.getElementById(id + 'Input');
  var btn = document.getElementById(id + 'Check');
  var hint = document.getElementById(id + 'Hint');
  if (inp && btn) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btn.click();
    });
    btn.addEventListener('click', function () {
      var v;
      if (step.desimal) {
        var pd = parseInputDesimalKoma(inp.value);
        if (pd.error) {
          showNotice(pd.message);
          return;
        }
        v = pd.value;
      } else {
        v = readDlNumber(inp.value, step.rational);
      }
      if (v === null) return;
      st.input = inp.value.trim();
      st.attempts += 1;
      st.done = step.rational || step.desimal ? hampirSama(v, step.jawab) : v === step.jawab;
      st.salah = !st.done;
      save();
      rerender();
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, step.hints.length);
      save();
      rerender();
    });
  }
}

/*
 * Aktivitas memilah: setiap butir (mis. barisan atau pernyataan) dipilahkan
 * ke salah satu kategori `options`. Urutan butir dan urutan opsi pada tiap
 * butir DIACAK sekali lalu disimpan di State.
 *
 *   items   [{ id, teks, correct, explanation }]
 *   options [{ id, label }] — kategori
 *
 * ensureSortStates(state, key, orderKey, items, options) menyiapkan
 *   state[key]      { <itemId>: { chosen, correct, optionOrder } }
 *   state[orderKey] urutan acak id butir
 */
function ensureSortStates(state, key, orderKey, items, options) {
  var map = state[key] && typeof state[key] === 'object' ? state[key] : {};
  var next = {};
  items.forEach(function (it) {
    var st = map[it.id];
    if (!st || typeof st !== 'object') {
      st = { chosen: null, correct: false, optionOrder: null };
    }
    ensureShuffledOrder(st, 'optionOrder', options);
    next[it.id] = st;
  });
  state[key] = next;
  ensureShuffledOrder(state, orderKey, items);
}

function sortItemsAllAnswered(items, states) {
  return items.every(function (it) {
    return !!(states[it.id] && states[it.id].chosen);
  });
}

function sortItemsCorrectCount(items, states) {
  return items.filter(function (it) {
    return states[it.id] && states[it.id].correct;
  }).length;
}

/*
 * Merender butir pemilahan. Setiap butir dijawab sekali (terkunci) lalu
 * langsung diberi umpan balik beserta alasannya.
 *   opts.mono  true → teks butir bergaya kode/angka (untuk barisan)
 */
function buildSortItems(items, itemOrder, options, states, opts) {
  opts = opts || {};
  return (
    '<div class="sort-list">' +
    orderByIds(items, itemOrder)
      .map(function (it) {
        var st = states[it.id];
        return (
          '<div class="sort-item">' +
          '<p class="sort-item__text' +
          (opts.mono ? ' sort-item__text--mono' : '') +
          '">' +
          it.teks +
          '</p>' +
          buildChoiceGroup(options, st.optionOrder, {
            chosen: st.chosen,
            correctId: it.correct,
            grade: true,
            locked: true,
            group: it.id,
            attr: 'data-sort-opt',
          }) +
          (st.chosen
            ? '<div style="margin-top:var(--space-2);">' +
              buildFeedbackBox(
                st.correct ? 'success' : 'error',
                st.correct ? '✓' : '✗',
                (st.correct ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') +
                  it.explanation
              ) +
              '</div>'
            : '') +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Memasang event buildSortItems di dalam `root`. */
function bindSortItems(root, items, states, save, rerender) {
  var byId = {};
  items.forEach(function (it) {
    byId[it.id] = it;
  });
  root.querySelectorAll('[data-sort-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var it = byId[btn.dataset.group];
      var st = it && states[it.id];
      if (!st || st.chosen) return;
      st.chosen = btn.dataset.sortOpt;
      st.correct = st.chosen === it.correct;
      save();
      rerender();
    });
  });
}

/*
 * Grafik batang berdampingan untuk membandingkan dua (atau lebih)
 * barisan, mis. aritmetika vs geometri, bunga tunggal vs majemuk.
 *   series      [{ label, values: [..] }] — warna mengikuti urutan (0 biru, 1 oranye)
 *   opts.xLabel     function(i) → label sumbu-x kelompok ke-i (default i + 1)
 *   opts.format     function(v) → teks nilai (default formatNumber)
 *   opts.highlight  indeks kelompok yang disorot (nilai tepatnya sebaiknya
 *                   ditulis di luar grafik agar tidak menumpuk)
 *   opts.caption    teks aksesibel grafik
 */
function buildCompareBarChart(series, opts) {
  opts = opts || {};
  var fmtV =
    opts.format ||
    function (v) {
      return formatNumber(v);
    };
  var xLabel =
    opts.xLabel ||
    function (i) {
      return String(i + 1);
    };
  var W = 640;
  var H = 280;
  var padL = 64;
  var padR = 12;
  var padT = 28;
  var padB = 36;
  var plotW = W - padL - padR;
  var plotH = H - padT - padB;
  var count = series[0].values.length;
  var max = 0;
  series.forEach(function (s) {
    s.values.forEach(function (v) {
      if (v > max) max = v;
    });
  });
  /* Batas atas dibulatkan ke kelipatan 4 × langkah "rapi" (1–10 × 10ᵏ)
     agar label sumbu-y mudah dibaca. */
  if (max <= 0) max = 1;
  var kasar = max / 4;
  var pangkat = Math.pow(10, Math.floor(Math.log10(kasar)));
  var langkah = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
    .map(function (m) {
      return m * pangkat;
    })
    .filter(function (v) {
      return v >= kasar;
    })[0];
  max = langkah * 4;

  function yOf(v) {
    return padT + plotH - (v / max) * plotH;
  }

  var grid = '';
  [0, 0.25, 0.5, 0.75, 1].forEach(function (f) {
    var y = yOf(max * f);
    grid +=
      '<line class="cmp-chart__grid" x1="' +
      padL +
      '" x2="' +
      (W - padR) +
      '" y1="' +
      y +
      '" y2="' +
      y +
      '"/>' +
      '<text class="cmp-chart__ytick" x="' +
      (padL - 8) +
      '" y="' +
      (y + 4) +
      '" text-anchor="end">' +
      esc(fmtV(max * f)) +
      '</text>';
  });

  var groupW = plotW / count;
  var barW = Math.min(28, (groupW * 0.8) / series.length);
  var bars = '';
  for (var i = 0; i < count; i++) {
    var gx = padL + i * groupW + (groupW - barW * series.length) / 2;
    var hl = opts.highlight === i;
    if (hl) {
      bars +=
        '<rect class="cmp-chart__hl" x="' +
        (padL + i * groupW) +
        '" y="' +
        padT +
        '" width="' +
        groupW +
        '" height="' +
        plotH +
        '"/>';
    }
    for (var k = 0; k < series.length; k++) {
      var v = series[k].values[i];
      var x = gx + k * barW;
      var y = yOf(v);
      bars +=
        '<rect class="cmp-chart__bar cmp-chart__bar--' +
        k +
        '" x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        (barW - 2) +
        '" height="' +
        Math.max(0, padT + plotH - y) +
        '"><title>' +
        esc(series[k].label + ', ' + xLabel(i) + ': ' + fmtV(v)) +
        '</title></rect>';
    }
    bars +=
      '<text class="cmp-chart__xtick' +
      (hl ? ' is-hl' : '') +
      '" x="' +
      (padL + i * groupW + groupW / 2) +
      '" y="' +
      (H - padB + 18) +
      '" text-anchor="middle">' +
      esc(xLabel(i)) +
      '</text>';
  }

  var legend =
    '<div class="cmp-chart__legend">' +
    series
      .map(function (s, k) {
        return (
          '<span class="cmp-chart__key"><span class="cmp-chart__swatch cmp-chart__swatch--' +
          k +
          '" aria-hidden="true"></span>' +
          esc(s.label) +
          '</span>'
        );
      })
      .join('') +
    '</div>';

  return (
    '<figure class="cmp-chart">' +
    legend +
    '<svg viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" role="img" aria-label="' +
    esc(opts.caption || 'Grafik perbandingan') +
    '">' +
    grid +
    '<line class="cmp-chart__axis" x1="' +
    padL +
    '" x2="' +
    (W - padR) +
    '" y1="' +
    (padT + plotH) +
    '" y2="' +
    (padT + plotH) +
    '"/>' +
    bars +
    '</svg>' +
    '</figure>'
  );
}

/* ============================================================
   9. BILANGAN BULAT — CARA BACA BAKU & GARIS BILANGAN INTERAKTIF
   Dipakai tahap membaca/menulis bilangan bulat dan menempatkan
   bilangan pada garis bilangan mendatar (klik/ketuk atau
   keyboard). Gaya .nlp-* ada di shared/base.css.
   ============================================================ */

/*
 * Terbilang bahasa Indonesia untuk bilangan cacah 0 … 999.999
 * (12 → "dua belas", 105 → "seratus lima", 1000 → "seribu").
 * Di luar rentang itu, angka ditulis dengan formatNumber().
 */
function terbilang(n) {
  var dasar = [
    'nol',
    'satu',
    'dua',
    'tiga',
    'empat',
    'lima',
    'enam',
    'tujuh',
    'delapan',
    'sembilan',
    'sepuluh',
    'sebelas',
  ];
  function sisa(n, r) {
    return r ? ' ' + t(r) : '';
  }
  function t(n) {
    if (n < 12) return dasar[n];
    if (n < 20) return dasar[n - 10] + ' belas';
    if (n < 100) return dasar[Math.floor(n / 10)] + ' puluh' + sisa(n, n % 10);
    if (n < 200) return 'seratus' + sisa(n, n - 100);
    if (n < 1000) return dasar[Math.floor(n / 100)] + ' ratus' + sisa(n, n % 100);
    if (n < 2000) return 'seribu' + sisa(n, n - 1000);
    return t(Math.floor(n / 1000)) + ' ribu' + sisa(n, n % 1000);
  }
  n = Math.round(Math.abs(n));
  if (n >= 1000000) return formatNumber(n);
  return t(n);
}

/*
 * Cara baca baku bilangan bulat: −12 → "negatif dua belas", 0 → "nol",
 * 7 → "tujuh" (atau "positif tujuh" bila opts.positif true).
 * Kata "minus" sengaja tidak dipakai: dalam notasi baku, "minus" adalah
 * nama operasi pengurangan, sedangkan tanda di depan bilangan dibaca
 * "negatif".
 */
function bacaBilanganBulat(n, opts) {
  opts = opts || {};
  if (n < 0) return 'negatif ' + terbilang(-n);
  if (n === 0) return 'nol';
  return (opts.positif ? 'positif ' : '') + terbilang(n);
}

/* Titik terakhir yang dipilih per garis bilangan, agar fokus keyboard
   bisa dipulihkan setelah tahap dirender ulang. */
var NLP_LAST_PICK = {};
var NLP_LAST_SCROLL = {};

/*
 * Garis bilangan mendatar (SVG) yang bisa diketuk.
 *   id               id elemen <svg> (unik dalam tahap)
 *   opts.min, max    rentang bilangan bulat (default −10 … 10)
 *   opts.labelEvery  label angka setiap kelipatan ini (default 1); ujung
 *                    garis dan 0 selalu berlabel
 *   opts.marks       [{ value, label, tone }] titik yang sudah ditempatkan;
 *                    tone 'neg' | 'pos' | 'zero' | 'ok' | 'bad' | 'target'
 *                    (default mengikuti tanda bilangan)
 *   opts.selected    nilai yang sedang dipilih (cincin sorot) atau null
 *   opts.interactive false → hanya gambar (mis. soal "titik A = ?")
 *   opts.sides       true → pita warna sisi negatif (kiri) & positif (kanan)
 *   opts.aria        label aksesibel garis
 * Setiap bilangan bulat mendapat target sentuh selebar satu satuan
 * (<g role="button" tabindex="0" data-nl-value>). Pasang event dengan
 * bindNumberLinePicker(); panggil centerNumberLines() setelah render agar
 * di layar sempit garis dimulai dengan 0 di tengah.
 */
function buildNumberLinePicker(id, opts) {
  opts = opts || {};
  var min = typeof opts.min === 'number' ? opts.min : -10;
  var max = typeof opts.max === 'number' ? opts.max : 10;
  var every = opts.labelEvery || 1;
  var interactive = opts.interactive !== false;
  var marks = opts.marks || [];
  var unit = 40;
  var padX = 34;
  var H = 116;
  var axisY = 70;
  var W = padX * 2 + (max - min) * unit;
  function xOf(v) {
    return padX + (v - min) * unit;
  }
  function toneOf(v) {
    if (v < 0) return 'neg';
    if (v > 0) return 'pos';
    return 'zero';
  }

  var html = '';

  if (opts.sides && min < 0 && max > 0) {
    html +=
      '<rect class="nlp-side nlp-side--neg" x="' +
      (xOf(min) - 14) +
      '" y="' +
      (axisY - 6) +
      '" width="' +
      (xOf(0) - xOf(min) + 14) +
      '" height="12" rx="6"/>' +
      '<rect class="nlp-side nlp-side--pos" x="' +
      xOf(0) +
      '" y="' +
      (axisY - 6) +
      '" width="' +
      (xOf(max) - xOf(0) + 14) +
      '" height="12" rx="6"/>' +
      '<text class="nlp-side-cap nlp-side-cap--neg" x="' +
      xOf(min) +
      '" y="14">← negatif</text>' +
      '<text class="nlp-side-cap nlp-side-cap--pos" x="' +
      xOf(max) +
      '" y="14">positif →</text>';
  }

  /* Sumbu + panah di kedua ujung (garis bilangan tak berujung). */
  var x0 = xOf(min) - 22;
  var x1 = xOf(max) + 22;
  html +=
    '<line class="nlp-axis" x1="' +
    x0 +
    '" y1="' +
    axisY +
    '" x2="' +
    x1 +
    '" y2="' +
    axisY +
    '"/>' +
    '<polygon class="nlp-arrow" points="' +
    (x0 - 4) +
    ',' +
    axisY +
    ' ' +
    (x0 + 8) +
    ',' +
    (axisY - 6) +
    ' ' +
    (x0 + 8) +
    ',' +
    (axisY + 6) +
    '"/>' +
    '<polygon class="nlp-arrow" points="' +
    (x1 + 4) +
    ',' +
    axisY +
    ' ' +
    (x1 - 8) +
    ',' +
    (axisY - 6) +
    ' ' +
    (x1 - 8) +
    ',' +
    (axisY + 6) +
    '"/>';

  for (var v = min; v <= max; v++) {
    var x = xOf(v);
    var major = v === 0 || v % 5 === 0;
    var berlabel = v === 0 || v === min || v === max || v % every === 0;
    var h = major ? 12 : 8;
    var tick =
      '<line class="nlp-tick' +
      (major ? ' nlp-tick--major' : '') +
      '" x1="' +
      x +
      '" y1="' +
      (axisY - h) +
      '" x2="' +
      x +
      '" y2="' +
      (axisY + h) +
      '"/>' +
      (berlabel
        ? '<text class="nlp-num nlp-num--' +
          toneOf(v) +
          '" x="' +
          x +
          '" y="' +
          (axisY + 34) +
          '">' +
          formatNumber(v, '−') +
          '</text>'
        : '');
    if (interactive) {
      html +=
        '<g class="nlp-hit' +
        (opts.selected === v ? ' is-selected' : '') +
        '" role="button" tabindex="0" data-nl-value="' +
        v +
        '" aria-label="Titik ' +
        (berlabel
          ? formatNumber(v, '−')
          : 'tanpa label, ' + Math.abs(v) + ' satuan di ' + (v < 0 ? 'kiri' : 'kanan') + ' nol') +
        '">' +
        '<rect class="nlp-hit__area" x="' +
        (x - unit / 2) +
        '" y="22" width="' +
        unit +
        '" height="' +
        (H - 22) +
        '"/>' +
        '<circle class="nlp-hit__ring" cx="' +
        x +
        '" cy="' +
        axisY +
        '" r="13"/>' +
        tick +
        '</g>';
    } else {
      html += tick;
    }
  }

  marks.forEach(function (m) {
    if (m.value < min || m.value > max) return;
    var mx = xOf(m.value);
    html +=
      '<g class="nlp-mark nlp-mark--' +
      (m.tone || toneOf(m.value)) +
      '">' +
      '<circle cx="' +
      mx +
      '" cy="' +
      axisY +
      '" r="9"/>' +
      (m.label !== undefined && m.label !== ''
        ? '<text class="nlp-mark__label" x="' +
          mx +
          '" y="' +
          (axisY - 20) +
          '">' +
          esc(m.label) +
          '</text>'
        : '') +
      '</g>';
  });

  return (
    '<div class="nlp-wrap">' +
    '<svg class="nlp' +
    (interactive ? ' nlp--interactive' : '') +
    '" id="' +
    id +
    '" data-zero="' +
    (min <= 0 && max >= 0 ? (xOf(0) / W).toFixed(4) : '') +
    '" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" style="min-width:' +
    Math.round(W * 0.62) +
    'px" ' +
    (interactive ? 'role="group"' : 'role="img"') +
    ' aria-label="' +
    esc(
      opts.aria ||
        'Garis bilangan dari ' + formatNumber(min, '−') + ' sampai ' + formatNumber(max, '−')
    ) +
    '">' +
    html +
    '</svg>' +
    '</div>'
  );
}

/*
 * Memasang event garis bilangan buildNumberLinePicker di dalam `root`.
 * onPick(value) dipanggil saat titik diklik/diketuk atau ditekan
 * Enter/Spasi; panah kiri/kanan memindah fokus antartitik.
 * `parse` opsional mengubah data-nl-value menjadi nilai (default
 * parseInt); garis bilangan desimal memakai string apa adanya.
 */
function bindNumberLinePicker(root, id, onPick, parse) {
  var svg = root.querySelector('#' + id);
  if (!svg) return;
  var wrap = svg.parentNode;
  var hits = Array.prototype.slice.call(svg.querySelectorAll('.nlp-hit'));
  function pick(g) {
    var raw = g.getAttribute('data-nl-value');
    var v = parse ? parse(raw) : parseInt(raw, 10);
    NLP_LAST_PICK[id] = v;
    NLP_LAST_SCROLL[id] = wrap.scrollLeft;
    onPick(v);
  }
  /* Pulihkan posisi gulir setelah render ulang akibat ketukan. */
  if (typeof NLP_LAST_SCROLL[id] === 'number') {
    wrap.scrollLeft = NLP_LAST_SCROLL[id];
    wrap.setAttribute('data-scroll-restored', '1');
    delete NLP_LAST_SCROLL[id];
  }
  hits.forEach(function (g, i) {
    g.addEventListener('click', function () {
      pick(g);
    });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        pick(g);
      } else if (e.key === 'ArrowLeft' && i > 0) {
        e.preventDefault();
        hits[i - 1].focus();
      } else if (e.key === 'ArrowRight' && i < hits.length - 1) {
        e.preventDefault();
        hits[i + 1].focus();
      }
    });
  });
  /* Pulihkan fokus keyboard pada titik yang terakhir dipilih. */
  if (NLP_LAST_PICK[id] !== undefined && document.activeElement === document.body) {
    var prev = svg.querySelector('[data-nl-value="' + NLP_LAST_PICK[id] + '"]');
    if (prev && prev.focus) prev.focus({ preventScroll: true });
    delete NLP_LAST_PICK[id];
  }
}

/*
 * Di layar sempit, garis bilangan bergulir mendatar di dalam wadahnya.
 * Panggil setelah tahap dirender agar setiap garis di `root` dimulai
 * dengan titik 0 di tengah layar (bukan terpotong di ujung kiri).
 */
function centerNumberLines(root) {
  (root || document).querySelectorAll('.nlp-wrap').forEach(function (wrap) {
    var svg = wrap.querySelector('svg[data-zero]');
    if (!svg || wrap.scrollWidth <= wrap.clientWidth) return;
    if (wrap.getAttribute('data-scroll-restored')) return;
    var ratio = parseFloat(svg.getAttribute('data-zero'));
    if (isNaN(ratio)) return;
    wrap.scrollLeft = Math.max(0, ratio * svg.clientWidth - wrap.clientWidth / 2);
  });
}

/* ============================================================
   10. PECAHAN — NOTASI BAKU, CARA BACA & MODEL VISUAL
   Dipakai modul pecahan (fase-d/mpi-1.3, mpi-1.4, mpi-1.5).
   Gaya .frac-block/.frac-inline/.frac-model/.frac-input ada di
   shared/base.css.
   ============================================================ */

function isBulat(v) {
  return typeof v === 'number' && isFinite(v) && Math.floor(v) === v;
}

/*
 * Cara baca baku pecahan: pembilang, kata "per", lalu penyebut.
 *   bacaPecahan(3, 4)     → "tiga per empat"
 *   bacaPecahan(3, 4, 2)  → "dua tiga per empat"  (pecahan campuran:
 *                            bilangan bulat dibaca lebih dulu)
 * Sebutan sehari-hari seperti "setengah" (1/2) dan "seperempat" (1/4)
 * sengaja tidak dipakai di sini karena bukan pola baku yang berlaku
 * untuk semua pecahan.
 */
function bacaPecahan(num, den, whole) {
  var biasa = terbilang(num) + ' per ' + terbilang(den);
  return whole ? terbilang(whole) + ' ' + biasa : biasa;
}

/* Label aksesibel pecahan: cara baca baku bila bilangan bulat. */
function fracAriaLabel(num, den, whole) {
  var w = whole != null && whole !== '' ? whole : null;
  if (isBulat(num) && isBulat(den) && (w === null || isBulat(w))) {
    return bacaPecahan(num, den, w);
  }
  return (w !== null ? w + ' dan ' : '') + num + ' per ' + den;
}

/*
 * Pecahan bersusun (pembilang di atas garis, penyebut di bawah) dengan
 * bilangan bulat opsional di kiri untuk pecahan campuran.
 *   size  '' | 'small' | 'large' | 'hero'
 */
function buildFracBlock(num, den, whole, size) {
  var cls = size ? ' frac-block--' + size : '';
  var wholeHTML =
    whole != null ? '<span class="frac-block__whole">' + esc(String(whole)) + '</span>' : '';
  return (
    '<span class="frac-block' +
    cls +
    '" role="img" aria-label="' +
    esc(fracAriaLabel(num, den, whole)) +
    '">' +
    wholeHTML +
    '<span class="frac-block__frac">' +
    '<span class="frac-block__num">' +
    esc(String(num)) +
    '</span>' +
    '<span class="frac-block__den">' +
    esc(String(den)) +
    '</span>' +
    '</span></span>'
  );
}

/* Pecahan bersusun kecil untuk di dalam kalimat. */
function buildFracInline(num, den, whole) {
  return (
    '<span class="frac-mixed" role="img" aria-label="' +
    esc(fracAriaLabel(num, den, whole)) +
    '">' +
    (whole != null ? '<span class="frac-mixed__whole">' + esc(String(whole)) + '</span>' : '') +
    '<span class="frac-inline" aria-hidden="true">' +
    '<span class="frac-num">' +
    esc(String(num)) +
    '</span>' +
    '<span class="frac-den">' +
    esc(String(den)) +
    '</span>' +
    '</span></span>'
  );
}

/*
 * Model visual pecahan: sejumlah bangun utuh yang dibagi `den` bagian
 * sama besar, dengan (whole × den + num) bagian diarsir. Pecahan
 * campuran tampil sebagai beberapa bangun penuh ditambah satu bangun
 * yang terarsir sebagian.
 *   opts.shape    'bar' (default, pita/cokelat batang) | 'circle' (pizza/martabak)
 *   opts.caption  teks kecil di bawah model (opsional)
 *   opts.aria     label aksesibel (default dibuat otomatis)
 *   opts.small    true → ukuran ringkas
 *   opts.wide     true → pita lebih lebar (untuk membandingkan beberapa
 *                 pita yang ditumpuk; semua pita sama panjang)
 *   opts.group    (pita saja) garis tebal setiap `group` bagian — mis.
 *                 buildFractionModel(6, 8, 0, { group: 2 }) menampilkan 6/8
 *                 yang potongannya digabung berdua-dua menjadi 3/4, atau
 *                 buildFractionModel(9, 12, 0, { group: 3 }) menampilkan 3/4
 *                 yang tiap bagiannya dipotong lagi menjadi 3 (9/12).
 *                 Diabaikan bila `den` tidak habis dibagi `group`.
 */
function buildFractionModel(num, den, whole, opts) {
  opts = opts || {};
  whole = whole || 0;
  den = Math.max(1, Math.round(den));
  var sisa = whole * den + Math.max(0, Math.round(num));
  var banyakBangun = Math.max(1, Math.ceil(sisa / den));
  var group = opts.group && den % opts.group === 0 ? opts.group : 0;
  var shapes = '';

  for (var b = 0; b < banyakBangun; b++) {
    var arsir = Math.min(den, sisa);
    sisa -= arsir;
    if (opts.shape === 'circle') {
      var r = 46;
      var c = 50;
      var parts = '';
      if (den === 1) {
        parts =
          '<circle class="frac-model__part' +
          (arsir ? ' is-on' : '') +
          '" cx="' +
          c +
          '" cy="' +
          c +
          '" r="' +
          r +
          '"/>';
      } else {
        for (var i = 0; i < den; i++) {
          var a0 = ((i / den) * 360 - 90) * (Math.PI / 180);
          var a1 = (((i + 1) / den) * 360 - 90) * (Math.PI / 180);
          var x0 = (c + r * Math.cos(a0)).toFixed(2);
          var y0 = (c + r * Math.sin(a0)).toFixed(2);
          var x1 = (c + r * Math.cos(a1)).toFixed(2);
          var y1 = (c + r * Math.sin(a1)).toFixed(2);
          parts +=
            '<path class="frac-model__part' +
            (i < arsir ? ' is-on' : '') +
            '" d="M' +
            c +
            ' ' +
            c +
            ' L' +
            x0 +
            ' ' +
            y0 +
            ' A' +
            r +
            ' ' +
            r +
            ' 0 ' +
            (1 / den > 0.5 ? 1 : 0) +
            ' 1 ' +
            x1 +
            ' ' +
            y1 +
            ' Z"/>';
        }
      }
      shapes +=
        '<svg class="frac-model__circle" viewBox="0 0 100 100" aria-hidden="true">' +
        parts +
        '</svg>';
    } else {
      var cells = '';
      for (var j = 0; j < den; j++) {
        cells +=
          '<span class="frac-model__cell' +
          (j < arsir ? ' is-on' : '') +
          (group > 1 && (j + 1) % group === 0 && j < den - 1 ? ' is-group-end' : '') +
          '"></span>';
      }
      shapes +=
        '<span class="frac-model__bar" style="grid-template-columns:repeat(' +
        den +
        ',1fr)" aria-hidden="true">' +
        cells +
        '</span>';
    }
  }

  var aria =
    opts.aria ||
    (whole ? whole + ' bangun utuh terarsir penuh dan ' : '') +
      'satu bangun dibagi ' +
      den +
      ' bagian sama besar dengan ' +
      Math.round(num) +
      ' bagian terarsir';

  return (
    '<figure class="frac-model frac-model--' +
    (opts.shape === 'circle' ? 'circle' : 'bar') +
    (opts.small ? ' frac-model--small' : '') +
    (opts.wide ? ' frac-model--wide' : '') +
    '" role="img" aria-label="' +
    esc(aria) +
    '">' +
    '<div class="frac-model__shapes">' +
    shapes +
    '</div>' +
    (opts.caption
      ? '<figcaption class="frac-model__caption">' + opts.caption + '</figcaption>'
      : '') +
    '</figure>'
  );
}

/*
 * Kotak isian pecahan bersusun: bilangan bulat (opsional, di kiri),
 * pembilang di atas garis, penyebut di bawah garis — meniru cara murid
 * menulis pecahan di buku.
 *   id              awalan id DOM → <id>Whole, <id>Num, <id>Den
 *   value           { whole, num, den } berupa string (isian terakhir)
 *   opts.mixed      true → tampilkan kotak bilangan bulat
 *   opts.disabled   true → kunci isian
 *   opts.status     'ok' | 'bad' | '' → warna bingkai
 *   opts.aria       awalan label aksesibel (default 'Jawaban')
 */
function buildFractionInput(id, value, opts) {
  opts = opts || {};
  value = value || {};
  var dis = opts.disabled ? ' disabled' : '';
  var aria = opts.aria || 'Jawaban';
  function box(suffix, val, label, extra) {
    return (
      '<input type="text" inputmode="numeric" autocomplete="off" maxlength="3" class="frac-input__box' +
      (extra || '') +
      '" id="' +
      id +
      suffix +
      '" value="' +
      esc(val || '') +
      '" aria-label="' +
      esc(aria + ': ' + label) +
      '"' +
      dis +
      '/>'
    );
  }
  return (
    '<div class="frac-input' +
    (opts.status ? ' frac-input--' + opts.status : '') +
    '">' +
    (opts.mixed
      ? '<div class="frac-input__whole">' +
        box(
          'Whole',
          value.whole,
          'bilangan bulat (kosongkan bila tidak ada)',
          ' frac-input__box--whole'
        ) +
        '<span class="frac-input__cap">bulat</span>' +
        '</div>'
      : '') +
    '<div class="frac-input__stack">' +
    box('Num', value.num, 'pembilang') +
    '<span class="frac-input__line" aria-hidden="true"></span>' +
    box('Den', value.den, 'penyebut') +
    '</div>' +
    '</div>'
  );
}

/*
 * Membaca kotak isian buildFractionInput di dalam `root`.
 * Mengembalikan { raw, value, error }:
 *   raw    { whole, num, den } string apa adanya (untuk disimpan di State)
 *   value  { whole, num, den } bilangan cacah (whole null bila kosong)
 *   error  null | 'empty' (pembilang/penyebut kosong) | 'invalid' | 'zero-den'
 */
function readFractionInput(root, id) {
  function get(suffix) {
    var el = root.querySelector('#' + id + suffix);
    return el ? el.value.trim() : '';
  }
  var raw = { whole: get('Whole'), num: get('Num'), den: get('Den') };
  if (raw.num === '' || raw.den === '') return { raw: raw, value: null, error: 'empty' };
  var cacah = /^\d+$/;
  if (
    !cacah.test(raw.num) ||
    !cacah.test(raw.den) ||
    (raw.whole !== '' && !cacah.test(raw.whole))
  ) {
    return { raw: raw, value: null, error: 'invalid' };
  }
  var value = {
    whole: raw.whole === '' ? null : parseInt(raw.whole, 10),
    num: parseInt(raw.num, 10),
    den: parseInt(raw.den, 10),
  };
  if (value.den === 0) return { raw: raw, value: value, error: 'zero-den' };
  return { raw: raw, value: value, error: null };
}

/* ============================================================
   11. BILANGAN BULAT — PENEMPATAN, PERBANDINGAN & PENGURUTAN
   Aktivitas menempatkan bilangan satu per satu pada garis
   bilangan, memilih lambang <, >, = , dan menyusun kartu
   bilangan dengan ketukan (tanpa seret, ramah layar sentuh &
   keyboard). Gaya .place-target, .num-chip, .cmp-*, .tap-order*
   ada di shared/base.css.
   ============================================================ */

/* Chip notasi baku bilangan bulat (lambang minus tipografis). */
function buildNumChip(n, big) {
  return (
    '<span class="num-chip' + (big ? ' num-chip--lg' : '') + '">' + formatNumber(n, '−') + '</span>'
  );
}

/*
 * Menyiapkan state penempatan pada state[key]:
 *   { idx: indeks bilangan yang sedang ditempatkan,
 *     salah: titik salah terakhir (atau null),
 *     wrong: { <idx>: banyak ketukan salah } }
 */
function ensureNumberLinePlacementState(state, key) {
  var st = state[key];
  if (!st || typeof st !== 'object' || typeof st.idx !== 'number') {
    state[key] = { idx: 0, salah: null, wrong: {} };
  }
  if (!state[key].wrong || typeof state[key].wrong !== 'object') state[key].wrong = {};
  return state[key];
}

function numberLinePlacementDone(items, st) {
  return st.idx >= items.length;
}

/* Banyak bilangan yang tepat ditempatkan pada ketukan pertama. */
function numberLinePlacementFirstTry(items, st) {
  var n = 0;
  for (var i = 0; i < Math.min(st.idx, items.length); i++) {
    if (!st.wrong[i]) n += 1;
  }
  return n;
}

/* Petunjuk arah dari 0 untuk bilangan v. */
function numberLineDirectionHint(v) {
  var f = formatNumber(v, '−');
  if (v === 0) return '0 adalah titik acuan di tengah garis bilangan.';
  return (
    f +
    ' berada ' +
    Math.abs(v) +
    ' langkah di sebelah ' +
    (v < 0 ? 'kiri' : 'kanan') +
    ' 0. Hitung langkahnya mulai dari 0.'
  );
}

/*
 * Aktivitas menempatkan bilangan satu per satu pada garis bilangan.
 *   pid    id SVG garis bilangan
 *   items  [{ value, teks, mark }] dalam urutan tampil (sudah diacak);
 *          `mark` opsional mengganti label titik (default notasi baku)
 *   st     state dari ensureNumberLinePlacementState
 *   cfg    { min, max, labelEvery, doneText }
 * Pasang event dengan bindNumberLinePlacement().
 */
function buildNumberLinePlacement(pid, items, st, cfg) {
  cfg = cfg || {};
  var fmtV = function (n) {
    return formatNumber(n, '−');
  };
  var done = numberLinePlacementDone(items, st);
  var marks = items.slice(0, Math.min(st.idx, items.length)).map(function (it) {
    return { value: it.value, label: it.mark !== undefined ? it.mark : fmtV(it.value) };
  });
  if (!done && st.salah !== null && st.salah !== undefined) {
    marks.push({ value: st.salah, label: fmtV(st.salah) + '?', tone: 'bad' });
  }

  var head = '';
  var feedback = '';
  if (done) {
    feedback = buildFeedbackBox(
      'success',
      '✓',
      cfg.doneText || '<strong>Semua bilangan sudah menempati titik yang tepat.</strong>'
    );
  } else {
    var target = items[st.idx];
    head =
      '<div class="place-target">' +
      '<span class="place-target__count">Bilangan ' +
      (st.idx + 1) +
      ' dari ' +
      items.length +
      '</span>' +
      '<span>Ketuk letak ' +
      buildNumChip(target.value, true) +
      (target.teks ? ' <span class="dl-caption">(' + esc(target.teks) + ')</span>' : '') +
      '</span>' +
      '</div>';
    if (st.salah !== null && st.salah !== undefined) {
      var nSalah = st.wrong[st.idx] || 0;
      feedback = buildFeedbackBox(
        'warning',
        '💭',
        'Titik yang kamu ketuk adalah <strong>' +
          fmtV(st.salah) +
          '</strong>, bukan ' +
          fmtV(target.value) +
          '. ' +
          (nSalah >= 2
            ? numberLineDirectionHint(target.value)
            : 'Periksa lagi: ' +
              fmtV(target.value) +
              (target.value === 0
                ? ' adalah titik acuan.'
                : ' berada di sebelah kiri atau kanan 0? Berapa langkah dari 0?'))
      );
    }
  }

  return (
    head +
    buildNumberLinePicker(pid, {
      min: cfg.min,
      max: cfg.max,
      labelEvery: cfg.labelEvery,
      marks: marks,
      interactive: !done,
      sides: true,
    }) +
    feedback
  );
}

function bindNumberLinePlacement(root, pid, items, st, save, rerender) {
  bindNumberLinePicker(root, pid, function (v) {
    if (numberLinePlacementDone(items, st)) return;
    var target = items[st.idx].value;
    if (v === target) {
      st.idx += 1;
      st.salah = null;
    } else {
      st.salah = v;
      st.wrong[st.idx] = (st.wrong[st.idx] || 0) + 1;
    }
    save();
    rerender();
  });
}

/*
 * Pilihan lambang perbandingan. Label berupa HTML; urutan tampil
 * diacak lewat ensureShuffledOrder(state, key, COMPARE_SYMBOLS).
 */
var COMPARE_SYMBOLS = [
  { id: 'lt', label: '&lt; <span class="cmp-sym-name">kurang dari</span>' },
  { id: 'gt', label: '&gt; <span class="cmp-sym-name">lebih dari</span>' },
  { id: 'eq', label: '= <span class="cmp-sym-name">sama dengan</span>' },
];

function compareSymbolId(a, b) {
  if (a < b) return 'lt';
  if (a > b) return 'gt';
  return 'eq';
}

function compareSymbolText(id) {
  return { lt: '<', gt: '>', eq: '=' }[id] || '?';
}

/*
 * Kalimat perbandingan besar: [a] ☐ [b]. `symbolId` null → kotak '?'.
 */
function buildCompareSentence(a, b, symbolId) {
  return (
    '<div class="cmp-sentence" aria-label="' +
    esc(
      formatNumber(a, '−') +
        ' ' +
        (symbolId ? compareSymbolText(symbolId) : 'kotak kosong') +
        ' ' +
        formatNumber(b, '−')
    ) +
    '">' +
    buildNumChip(a, true) +
    '<span class="cmp-sentence__sym' +
    (symbolId ? ' is-filled' : '') +
    '">' +
    esc(symbolId ? compareSymbolText(symbolId) : '?') +
    '</span>' +
    buildNumChip(b, true) +
    '</div>'
  );
}

/*
 * Tombol lambang <, >, = (buildChoiceGroup) yang boleh dicoba lagi
 * sampai benar, lalu terkunci.
 *   st  { chosen, wrong }  — `wrong` = banyak pilihan salah
 *   opts.group  nilai data-group pembeda antarsoal
 */
function buildCompareSymbolChoice(a, b, order, st, opts) {
  opts = opts || {};
  var benarId = compareSymbolId(a, b);
  var benar = st.chosen === benarId;
  return (
    '<div class="cmp-symbols">' +
    buildChoiceGroup(COMPARE_SYMBOLS, order, {
      chosen: st.chosen,
      correctId: benar ? benarId : null,
      grade: true,
      locked: benar,
      group: opts.group || 'cmp',
      attr: 'data-cmp-sym',
    }) +
    '</div>'
  );
}

/* Memasang event buildCompareSymbolChoice; `st` dicari lewat getState(group). */
function bindCompareSymbolChoice(root, getPair, getState, save, rerender) {
  root.querySelectorAll('[data-cmp-sym]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.dataset.group;
      var pair = getPair(group);
      var st = getState(group);
      if (!pair || !st) return;
      var benarId = compareSymbolId(pair[0], pair[1]);
      if (st.chosen === benarId) return;
      st.chosen = btn.dataset.cmpSym;
      if (st.chosen !== benarId) st.wrong = (st.wrong || 0) + 1;
      save();
      rerender();
    });
  });
}

/*
 * Menyusun kartu dengan ketukan.
 *   items   [{ id, label }] — label berupa HTML
 *   answer  array id dalam urutan benar
 * ensureTapOrderState(state, key, items, answer) menyiapkan state[key]:
 *   { pool: id kartu yang belum dipakai (teracak, dijamin tidak sama
 *     dengan urutan benar), placed: id kartu di slot, checked, correct,
 *     attempts }
 */
function ensureTapOrderState(state, key, items, answer) {
  var st = state[key];
  var ids = optionIds(items);
  var valid =
    st &&
    typeof st === 'object' &&
    Array.isArray(st.pool) &&
    Array.isArray(st.placed) &&
    st.pool.length + st.placed.length === ids.length &&
    ids.every(function (id) {
      return st.pool.indexOf(id) !== -1 || st.placed.indexOf(id) !== -1;
    });
  if (!valid) {
    var pool = shuffleArray(ids);
    for (var coba = 0; coba < 20 && answer && pool.join('|') === answer.join('|'); coba++) {
      pool = shuffleArray(ids);
    }
    state[key] = { pool: pool, placed: [], checked: false, correct: false, attempts: 0 };
  }
  return state[key];
}

/*
 *   opts.answer      array id urutan benar (wajib)
 *   opts.startLabel  keterangan ujung kiri slot (mis. 'Terkecil')
 *   opts.endLabel    keterangan ujung kanan slot (mis. 'Terbesar')
 *   opts.separator   lambang di antara slot (mis. '<' atau '>')
 *   opts.successText HTML umpan balik setelah benar
 */
function buildTapOrder(id, items, st, opts) {
  opts = opts || {};
  var byId = {};
  items.forEach(function (it) {
    byId[it.id] = it;
  });
  var locked = st.correct;
  var n = items.length;

  var slots = '';
  for (var i = 0; i < n; i++) {
    if (i > 0 && opts.separator) {
      slots += '<span class="tap-order__sep" aria-hidden="true">' + esc(opts.separator) + '</span>';
    }
    var pid = st.placed[i];
    if (pid) {
      var cls = 'tap-order__card tap-order__card--placed';
      if (st.checked) cls += pid === opts.answer[i] ? ' is-correct' : ' is-wrong';
      slots +=
        '<button type="button" class="' +
        cls +
        '" data-tap-back="' +
        i +
        '" data-tap-id="' +
        esc(id) +
        '"' +
        (locked ? ' disabled' : '') +
        ' aria-label="Urutan ' +
        (i + 1) +
        ': ' +
        esc(byId[pid].aria || byId[pid].label.replace(/<[^>]*>/g, '')) +
        (locked ? '' : '. Ketuk untuk mengembalikan') +
        '">' +
        '<span class="tap-order__rank">' +
        (i + 1) +
        '</span>' +
        byId[pid].label +
        '</button>';
    } else {
      slots +=
        '<span class="tap-order__slot" aria-label="Urutan ' +
        (i + 1) +
        ' masih kosong"><span class="tap-order__rank">' +
        (i + 1) +
        '</span></span>';
    }
  }

  var pool = st.pool
    .map(function (pid) {
      return (
        '<button type="button" class="tap-order__card" data-tap-add="' +
        esc(pid) +
        '" data-tap-id="' +
        esc(id) +
        '">' +
        byId[pid].label +
        '</button>'
      );
    })
    .join('');

  var feedback = '';
  if (st.correct) {
    feedback = buildFeedbackBox(
      'success',
      '✓',
      opts.successText || '<strong>Urutannya tepat!</strong>'
    );
  } else if (st.checked) {
    var tepat = st.placed.filter(function (pid, i) {
      return pid === opts.answer[i];
    }).length;
    feedback = buildFeedbackBox(
      'warning',
      '💭',
      '<strong>' +
        tepat +
        ' dari ' +
        n +
        ' kartu sudah di tempat yang tepat.</strong> Kartu bertanda merah belum tepat — lihat lagi letaknya pada garis bilangan, lalu ketuk kartu itu untuk memindahkannya.'
    );
  }

  return (
    '<div class="tap-order" id="' +
    esc(id) +
    '">' +
    (opts.startLabel || opts.endLabel
      ? '<div class="tap-order__ends"><span>⬅ ' +
        esc(opts.startLabel || '') +
        '</span><span>' +
        esc(opts.endLabel || '') +
        ' ➡</span></div>'
      : '') +
    '<div class="tap-order__slots" role="list" aria-label="Urutan yang kamu susun">' +
    slots +
    '</div>' +
    (locked
      ? ''
      : '<p class="tap-order__cap">' +
        (st.pool.length
          ? 'Ketuk kartu di bawah untuk mengisi urutan berikutnya. Ketuk kartu di atas untuk mengembalikannya.'
          : 'Semua kartu sudah terpasang. Periksa urutanmu!') +
        '</p>' +
        '<div class="tap-order__pool" role="group" aria-label="Kartu yang belum diurutkan">' +
        pool +
        '</div>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="' +
        esc(id) +
        'Check"' +
        (st.pool.length ? ' disabled' : '') +
        '>Periksa Urutan</button>' +
        '<button type="button" class="btn btn--ghost btn--small" id="' +
        esc(id) +
        'Clear"' +
        (st.placed.length ? '' : ' disabled') +
        '>Kosongkan</button>' +
        '</div>') +
    feedback +
    '</div>'
  );
}

function tapOrderIsCorrect(st, answer) {
  return st.placed.length === answer.length && st.placed.join('|') === answer.join('|');
}

function bindTapOrder(root, id, st, answer, save, rerender) {
  if (st.correct) return;
  var sel = '[data-tap-id="' + id + '"]';
  root.querySelectorAll(sel + '[data-tap-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pid = btn.dataset.tapAdd;
      var k = st.pool.indexOf(pid);
      if (k === -1) return;
      st.pool.splice(k, 1);
      st.placed.push(pid);
      st.checked = false;
      save();
      rerender();
    });
  });
  root.querySelectorAll(sel + '[data-tap-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.tapBack, 10);
      var pid = st.placed[i];
      if (!pid) return;
      st.placed.splice(i, 1);
      st.pool.push(pid);
      st.checked = false;
      save();
      rerender();
    });
  });
  var check = document.getElementById(id + 'Check');
  if (check) {
    check.addEventListener('click', function () {
      if (st.pool.length) return;
      st.attempts += 1;
      st.checked = true;
      st.correct = tapOrderIsCorrect(st, answer);
      save();
      rerender();
    });
  }
  var clear = document.getElementById(id + 'Clear');
  if (clear) {
    clear.addEventListener('click', function () {
      st.pool = st.pool.concat(st.placed);
      st.placed = [];
      st.checked = false;
      save();
      rerender();
    });
  }
}

/* ============================================================
   12. KOMPONEN COOPERATIVE LEARNING
   Pembagian peran kelompok yang diacak lalu dirotasi setiap
   misi (saling ketergantungan positif & tanggung jawab
   individu), kartu tim, dan predikat penghargaan tim ala STAD.
   Gaya .coop-* ada di shared/base.css.
   ============================================================ */

var COOP_ROLES = [
  {
    id: 'pembaca',
    ikon: '📖',
    nama: 'Pembaca Soal',
    tugas: 'Membacakan soal dengan lantang dan memastikan semua anggota paham yang ditanyakan.',
  },
  {
    id: 'penempat',
    ikon: '👆',
    nama: 'Penempat Garis',
    tugas: 'Mengetuk garis bilangan/kartu setelah tim sepakat — bukan memutuskan sendiri.',
  },
  {
    id: 'pemeriksa',
    ikon: '🔍',
    nama: 'Pemeriksa',
    tugas: 'Bertanya "Semua setuju?" dan mengecek jawaban sebelum tombol Periksa ditekan.',
  },
  {
    id: 'jubir',
    ikon: '🎤',
    nama: 'Juru Bicara',
    tugas: 'Menjelaskan alasan tim dengan kalimat sendiri, di kelompok maupun di depan kelas.',
  },
];

/* Nama anggota yang terisi, dalam urutan acak (penentu peran awal). */
function assignCoopRoles(members) {
  return shuffleArray(
    (members || [])
      .map(function (m) {
        return String(m || '').trim();
      })
      .filter(function (m) {
        return m;
      })
  );
}

/*
 * Pasangan peran → anggota untuk putaran ke-`round`. Setiap putaran
 * peran bergeser satu anggota; bila anggota < banyak peran, seorang
 * anggota memegang lebih dari satu peran.
 */
function coopRoleAssignment(anggota, round, roles) {
  roles = roles || COOP_ROLES;
  var n = anggota.length;
  return roles.map(function (r, i) {
    return { role: r, nama: n ? anggota[(i + (round || 0)) % n] : '—' };
  });
}

/* Bilah ringkas peran pada satu misi. */
function buildCoopRoleBar(anggota, round, opts) {
  opts = opts || {};
  return (
    '<div class="coop-role-bar">' +
    '<span class="coop-role-bar__title">' +
    esc(opts.title || 'Peran pada misi ini') +
    '</span>' +
    '<ul class="coop-role-bar__list">' +
    coopRoleAssignment(anggota, round, opts.roles)
      .map(function (p) {
        return (
          '<li class="coop-role coop-role--' +
          esc(p.role.id) +
          '"><span aria-hidden="true">' +
          p.role.ikon +
          '</span><span class="coop-role__nama">' +
          esc(p.nama) +
          '</span><span class="coop-role__peran">' +
          esc(p.role.nama) +
          '</span></li>'
        );
      })
      .join('') +
    '</ul>' +
    '</div>'
  );
}

/* Kartu tim: nama tim dan peran lengkap beserta tugasnya. */
function buildCoopTeamCard(namaTim, anggota, round, roles) {
  return (
    '<div class="coop-team-card">' +
    '<p class="coop-team-card__nama">👥 ' +
    esc(namaTim || 'Tim tanpa nama') +
    '</p>' +
    '<ul class="coop-team-card__list">' +
    coopRoleAssignment(anggota, round, roles)
      .map(function (p) {
        return (
          '<li><span class="coop-team-card__ikon" aria-hidden="true">' +
          p.role.ikon +
          '</span><div><strong>' +
          esc(p.nama) +
          '</strong> — ' +
          esc(p.role.nama) +
          '<span class="dl-caption">' +
          esc(p.role.tugas) +
          '</span></div></li>'
        );
      })
      .join('') +
    '</ul>' +
    '</div>'
  );
}

/*
 * Predikat penghargaan tim ala STAD dari persentase skor (0–100).
 * Mengembalikan { id, label, ikon, teks }.
 */
function coopAwardLevel(persen) {
  if (persen >= 85) {
    return {
      id: 'super',
      label: 'Tim Super',
      ikon: '🏆',
      teks: 'Luar biasa! Kalian bekerja sama dengan sangat kompak dan teliti.',
    };
  }
  if (persen >= 70) {
    return {
      id: 'hebat',
      label: 'Tim Hebat',
      ikon: '🥈',
      teks: 'Hebat! Kerja sama kalian sudah kuat — sedikit lagi menuju Tim Super.',
    };
  }
  return {
    id: 'baik',
    label: 'Tim Baik',
    ikon: '🥉',
    teks: 'Kerja bagus! Terus saling membantu agar semua anggota makin yakin.',
  };
}

/* ============================================================
   13. PERTANYAAN PENUNTUN BERTINGKAT
   Daftar pertanyaan pilihan yang boleh dicoba lagi sampai benar,
   lalu terkunci; setiap pilihan punya umpan balik sendiri.
   Urutan opsi tiap pertanyaan diambil dari `orders[q.id]`
   (diacak sekali dengan ensureShuffledOrder saat state disiapkan).
     q = { id, tanya|teks, opsi, correct, umpan: { <idOpsi>: html } }
   Gaya .quiz-item--guided ada di shared/base.css.
   ============================================================ */

/* Kotak umpan balik pilihan bertingkat (benar → success, salah → warning). */
function buildGuidedChoiceFeedback(chosen, benar, umpan) {
  if (!chosen) return '';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', umpan[chosen]) +
    '</div>'
  );
}

function buildGuidedQuizList(list, orders, pilih) {
  return list
    .map(function (q, i) {
      var chosen = pilih[q.id] || null;
      var benar = chosen === q.correct;
      return (
        '<div class="quiz-item quiz-item--guided">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        (q.tanya || q.teks) +
        '</p>' +
        buildChoiceGroup(q.opsi, orders[q.id], {
          chosen: chosen,
          correctId: benar ? q.correct : null,
          grade: true,
          locked: benar,
          group: q.id,
          attr: 'data-q-opt',
        }) +
        buildGuidedChoiceFeedback(chosen, benar, q.umpan) +
        '</div>'
      );
    })
    .join('');
}

function bindGuidedQuizList(root, list, pilih, save, rerender) {
  var byId = {};
  list.forEach(function (q) {
    byId[q.id] = q;
  });
  root.querySelectorAll('[data-q-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var q = byId[btn.dataset.group];
      if (!q || pilih[q.id] === q.correct) return;
      pilih[q.id] = btn.dataset.qOpt;
      save();
      rerender();
    });
  });
}

function guidedQuizAllCorrect(list, pilih) {
  return list.every(function (q) {
    return pilih[q.id] === q.correct;
  });
}

/* ============================================================
   14. PECAHAN SENILAI & KOMPONEN URUT-KETUK
   Dipakai modul menyederhanakan & menyamakan penyebut pecahan
   (fase-d/mpi-1.4). Gaya .order-picker ada di shared/base.css.
   ============================================================ */

/* Apakah a/b senilai dengan c/d? Pecahan berupa { num, den }. */
function pecahanSetara(a, b) {
  return a.num * b.den === b.num * a.den;
}

/*
 * Bentuk paling sederhana num/den: pembilang dan penyebut dibagi FPB-nya.
 *   sederhanakanPecahan(6, 8) → { num: 3, den: 4, fpb: 2 }
 */
function sederhanakanPecahan(num, den) {
  var f = gcd(num, den) || 1;
  return { num: num / f, den: den / f, fpb: f };
}

/*
 * Mendiagnosis jawaban "sederhanakan asal":
 *   'tepat'           senilai dengan asal DAN FPB pembilang-penyebutnya 1
 *   'belum-sederhana' senilai, tetapi masih bisa dibagi lagi
 *   'tidak-setara'    nilainya berubah
 * `v` dan `asal` berupa { num, den }.
 */
function diagnosaSederhana(v, asal) {
  if (!v.den || !pecahanSetara(v, asal)) return 'tidak-setara';
  return gcd(v.num, v.den) === 1 ? 'tepat' : 'belum-sederhana';
}

/*
 * Komponen urut-ketuk: murid mengetuk butir satu per satu untuk mengisi
 * urutan (mis. dari paling besar ke paling kecil, atau langkah-langkah
 * rencana penyelidikan). Butir di "kolam" tampil dalam urutan ACAK yang
 * disimpan di State, sehingga stabil lintas render/reload namun teracak
 * ulang setiap Reset.
 *
 *   items         [{ id, label }]   label boleh HTML
 *   correctOrder  [id, ...]         urutan benar
 *
 * ensureOrderPicker(state, key, items) menyiapkan state[key]:
 *   { order, picked, done, correct, attempts, salah }
 */
function ensureOrderPicker(state, key, items) {
  var st = state[key];
  if (!st || typeof st !== 'object' || !Array.isArray(st.picked)) {
    st = { order: null, picked: [], done: false, correct: false, attempts: 0, salah: false };
  }
  var ids = optionIds(items);
  st.picked = st.picked.filter(function (id) {
    return ids.indexOf(id) !== -1;
  });
  ensureShuffledOrder(st, 'order', items);
  state[key] = st;
  return st;
}

/*
 * Merender komponen urut-ketuk.
 *   id                awalan id/atribut DOM
 *   opts.slotLabels   label tiap posisi (mis. ['Paling laris', '', 'Paling sedikit'])
 *   opts.correctOrder urutan benar (untuk menandai posisi setelah diperiksa)
 *   opts.checkLabel   teks tombol periksa (default 'Periksa Urutan')
 */
function buildOrderPicker(id, items, st, opts) {
  opts = opts || {};
  var byId = {};
  items.forEach(function (it) {
    byId[it.id] = it;
  });
  var lengkap = st.picked.length === items.length;
  var slots = '';
  for (var i = 0; i < items.length; i++) {
    var pid = st.picked[i];
    var cls = 'order-picker__slot';
    if (pid && (st.done || st.salah) && opts.correctOrder) {
      cls += opts.correctOrder[i] === pid ? ' is-ok' : ' is-bad';
    }
    var label = opts.slotLabels && opts.slotLabels[i] ? opts.slotLabels[i] : '';
    slots +=
      '<li class="' +
      cls +
      '">' +
      '<span class="order-picker__rank">' +
      (i + 1) +
      '</span>' +
      (pid
        ? '<button type="button" class="order-picker__chip" data-' +
          id +
          '-unpick="' +
          esc(pid) +
          '"' +
          (st.done ? ' disabled' : '') +
          ' aria-label="Keluarkan dari urutan ke-' +
          (i + 1) +
          '">' +
          byId[pid].label +
          '</button>'
        : '<span class="order-picker__empty">' +
          (label ? esc(label) : 'ketuk pilihan di bawah') +
          '</span>') +
      '</li>';
  }
  var pool = orderByIds(items, st.order)
    .filter(function (it) {
      return st.picked.indexOf(it.id) === -1;
    })
    .map(function (it) {
      return (
        '<button type="button" class="order-picker__chip order-picker__chip--pool" data-' +
        id +
        '-pick="' +
        esc(it.id) +
        '">' +
        it.label +
        '</button>'
      );
    })
    .join('');
  return (
    '<div class="order-picker" id="' +
    id +
    '">' +
    '<ol class="order-picker__slots">' +
    slots +
    '</ol>' +
    (st.done
      ? ''
      : '<div class="order-picker__pool" role="group" aria-label="Pilihan yang belum diurutkan">' +
        (pool || '<span class="dl-caption">Semua sudah diurutkan.</span>') +
        '</div>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="' +
        id +
        'Check"' +
        (lengkap ? '' : ' disabled') +
        '>' +
        esc(opts.checkLabel || 'Periksa Urutan') +
        '</button>' +
        (st.picked.length
          ? '<button type="button" class="btn btn--ghost" id="' + id + 'Clear">Ulangi</button>'
          : '') +
        '</div>') +
    '</div>'
  );
}

/*
 * Memasang event buildOrderPicker di dalam `root`. Urutan dianggap benar
 * bila sama persis dengan `correctOrder`; `save` lalu `rerender`
 * dipanggil setelah setiap perubahan.
 */
function bindOrderPicker(root, id, items, st, correctOrder, save, rerender) {
  root.querySelectorAll('[data-' + id + '-pick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.done) return;
      st.picked.push(btn.getAttribute('data-' + id + '-pick'));
      st.salah = false;
      save();
      rerender();
    });
  });
  root.querySelectorAll('[data-' + id + '-unpick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.done) return;
      var pid = btn.getAttribute('data-' + id + '-unpick');
      st.picked = st.picked.filter(function (x) {
        return x !== pid;
      });
      st.salah = false;
      save();
      rerender();
    });
  });
  var clear = root.querySelector('#' + id + 'Clear');
  if (clear) {
    clear.addEventListener('click', function () {
      st.picked = [];
      st.salah = false;
      save();
      rerender();
    });
  }
  var check = root.querySelector('#' + id + 'Check');
  if (check) {
    check.addEventListener('click', function () {
      if (st.picked.length !== items.length) return;
      st.attempts += 1;
      st.correct = st.picked.every(function (x, i) {
        return x === correctOrder[i];
      });
      st.done = st.correct;
      st.salah = !st.correct;
      save();
      rerender();
    });
  }
}

/* ============================================================
   15. PECAHAN — MEMBANDINGKAN & MENGURUTKAN
   Dipakai modul membandingkan & mengurutkan pecahan (fase-d/mpi-1.5).
   Pecahan ditulis sebagai objek { num, den } (boleh berisi field lain
   seperti id/nama). Gaya .frac-strip*, .frac-nl*, .order-board*,
   .role-card* ada di shared/base.css.
   ============================================================ */

/*
 * Membandingkan dua pecahan dengan perkalian silang (bilangan bulat,
 * bebas galat pembulatan): −1 bila a < b, 0 bila a = b, 1 bila a > b.
 */
function compareFractions(a, b) {
  var kiri = a.num * b.den;
  var kanan = b.num * a.den;
  if (kiri < kanan) return -1;
  if (kiri > kanan) return 1;
  return 0;
}

/* Tanda perbandingan dari hasil compareFractions: '<', '=', atau '>'. */
function fracRelationSymbol(cmp) {
  if (cmp < 0) return '<';
  if (cmp > 0) return '>';
  return '=';
}

/* Salinan pecahan yang terurut naik (desc true → turun). */
function sortFractions(fracs, desc) {
  return fracs.slice().sort(function (a, b) {
    return desc ? compareFractions(b, a) : compareFractions(a, b);
  });
}

/*
 * Mengganti token pecahan di dalam teks HTML dengan buildFracInline:
 *   "{3/4}"   → pecahan 3/4 bersusun
 *   "{2 3/4}" → pecahan campuran 2¾
 *   "{a/b}"   → pecahan berhuruf (untuk bentuk umum)
 * Dipakai agar isi DATA tetap ringkas ditulis sebagai teks biasa.
 */
function renderFracText(str) {
  function angka(v) {
    return /^\d+$/.test(v) ? parseInt(v, 10) : v;
  }
  return String(str).replace(/\{(?:(\d+)\s+)?(\w+)\/(\w+)\}/g, function (m, w, n, d) {
    return buildFracInline(angka(n), angka(d), w ? angka(w) : null);
  });
}

/*
 * Pita pecahan bertumpuk pada skala yang sama (seluruh pita panjangnya
 * sama = 1 utuh), untuk membandingkan beberapa pecahan secara visual.
 *   fracs          [{ num, den, nama? }]
 *   opts.common    penyebut bersama (mis. KPK). Bila diisi, tiap pita
 *                  dibagi `common` bagian; batas bagian asal tetap
 *                  ditebalkan sehingga kesetaraan (2/3 = 8/12) terlihat.
 *   opts.half      true → garis putus-putus patokan ½
 *   opts.highlight indeks pita yang disorot (mis. pecahan terbesar)
 *   opts.caption   teks kecil di bawah pita (HTML)
 */
function buildFracStripCompare(fracs, opts) {
  opts = opts || {};
  var rows = fracs
    .map(function (f, k) {
      var den = Math.max(1, Math.round(f.den));
      var n = opts.common && opts.common % den === 0 ? opts.common : den;
      var per = n / den;
      var on = f.num * per;
      var cells = '';
      for (var j = 0; j < n; j++) {
        var edge = per > 1 && (j + 1) % per === 0 && j < n - 1;
        cells +=
          '<span class="frac-strip__cell' +
          (j < on ? ' is-on' : '') +
          (edge ? ' is-edge' : '') +
          '"></span>';
      }
      var label =
        buildFracInline(f.num, f.den) +
        (per > 1 ? ' <span class="frac-strip__eq">= ' + buildFracInline(on, n) + '</span>' : '');
      return (
        '<div class="frac-strip__row frac-strip__row--' +
        (k % 4) +
        (opts.highlight === k ? ' is-hl' : '') +
        '">' +
        '<span class="frac-strip__label">' +
        (f.nama ? '<span class="frac-strip__name">' + esc(f.nama) + '</span>' : '') +
        label +
        '</span>' +
        '<span class="frac-strip__bar" style="grid-template-columns:repeat(' +
        n +
        ',1fr)" aria-hidden="true">' +
        cells +
        '</span>' +
        '</div>'
      );
    })
    .join('');
  var aria = fracs
    .map(function (f) {
      return (f.nama ? f.nama + ' ' : '') + bacaPecahan(f.num, f.den);
    })
    .join(', ');
  return (
    '<figure class="frac-strip' +
    (opts.half ? ' frac-strip--half' : '') +
    '" role="img" aria-label="' +
    esc('Pita pecahan sama panjang: ' + aria) +
    '">' +
    rows +
    (opts.caption
      ? '<figcaption class="frac-strip__caption">' + opts.caption + '</figcaption>'
      : '') +
    '</figure>'
  );
}

/*
 * Garis bilangan 0 … 1 (SVG, tidak interaktif) dengan titik-titik pecahan
 * berlabel. Label yang berdekatan diletakkan selang-seling atas/bawah
 * agar tidak bertumpuk.
 *   fracs        [{ num, den, nama? }]
 *   opts.ticks   penyebut garis bantu (mis. KPK); 0/undefined → tanpa
 *   opts.aria    label aksesibel
 */
function buildFracNumberLine(fracs, opts) {
  opts = opts || {};
  var W = 420;
  var H = 136;
  var padX = 24;
  var axisY = 70;
  function xOf(v) {
    return padX + v * (W - 2 * padX);
  }
  var html =
    '<line class="frac-nl__axis" x1="' +
    xOf(0) +
    '" y1="' +
    axisY +
    '" x2="' +
    xOf(1) +
    '" y2="' +
    axisY +
    '"/>';
  if (opts.ticks && opts.ticks <= 60) {
    for (var t = 1; t < opts.ticks; t++) {
      var tx = xOf(t / opts.ticks);
      html +=
        '<line class="frac-nl__tick" x1="' +
        tx +
        '" y1="' +
        (axisY - 6) +
        '" x2="' +
        tx +
        '" y2="' +
        (axisY + 6) +
        '"/>';
    }
  }
  [0, 1].forEach(function (v) {
    html +=
      '<line class="frac-nl__tick frac-nl__tick--major" x1="' +
      xOf(v) +
      '" y1="' +
      (axisY - 12) +
      '" x2="' +
      xOf(v) +
      '" y2="' +
      (axisY + 12) +
      '"/>' +
      '<text class="frac-nl__end" x="' +
      xOf(v) +
      '" y="' +
      (axisY + 30) +
      '">' +
      v +
      '</text>';
  });
  var urut = sortFractions(fracs);
  var lastX = -Infinity;
  var atas = true;
  urut.forEach(function (f) {
    var x = xOf(f.num / f.den);
    atas = x - lastX < 36 ? !atas : true;
    lastX = x;
    var ly = atas ? axisY - 50 : axisY + 32;
    html +=
      '<g class="frac-nl__mark frac-nl__mark--' +
      (fracs.indexOf(f) % 4) +
      '">' +
      '<line class="frac-nl__stem" x1="' +
      x +
      '" y1="' +
      axisY +
      '" x2="' +
      x +
      '" y2="' +
      (atas ? axisY - 26 : axisY + 12) +
      '"/>' +
      '<circle cx="' +
      x +
      '" cy="' +
      axisY +
      '" r="7"/>' +
      '<text class="frac-nl__num" x="' +
      x +
      '" y="' +
      ly +
      '">' +
      f.num +
      '</text>' +
      '<line class="frac-nl__bar" x1="' +
      (x - 11) +
      '" y1="' +
      (ly + 5) +
      '" x2="' +
      (x + 11) +
      '" y2="' +
      (ly + 5) +
      '"/>' +
      '<text class="frac-nl__num" x="' +
      x +
      '" y="' +
      (ly + 22) +
      '">' +
      f.den +
      '</text>' +
      '</g>';
  });
  return (
    '<div class="frac-nl-wrap"><svg class="frac-nl" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" role="img" aria-label="' +
    esc(
      opts.aria ||
        'Garis bilangan 0 sampai 1 dengan titik ' +
          urut
            .map(function (f) {
              return bacaPecahan(f.num, f.den);
            })
            .join(', ')
    ) +
    '">' +
    html +
    '</svg></div>'
  );
}

/*
 * Aktivitas MENGURUTKAN dengan mengetuk kartu. Kartu diacak SEKALI
 * lalu urutannya disimpan di State, sehingga stabil lintas render/reload
 * namun teracak ulang saat Reset.
 *
 * State satu papan (makeOrderState):
 *   { pool: [id acak], picked: [id terpilih], checked, correct, attempts }
 *
 * ensureOrderState(state, key, items) menyiapkan state[key] untuk
 * items [{ id, ... }]; dibuat ulang bila id-nya tidak lagi cocok.
 */
function makeOrderState(items) {
  return {
    pool: shuffleArray(optionIds(items)),
    picked: [],
    checked: false,
    correct: false,
    attempts: 0,
  };
}

function ensureOrderState(state, key, items) {
  var st = state[key];
  var ids = optionIds(items);
  var cocok =
    st &&
    Array.isArray(st.pool) &&
    Array.isArray(st.picked) &&
    st.pool.length === ids.length &&
    ids.every(function (id) {
      return st.pool.indexOf(id) !== -1;
    });
  if (!cocok) state[key] = makeOrderState(items);
  return state[key];
}

/*
 * Merender papan urutan.
 *   id             awalan id DOM (unik dalam tahap)
 *   items          [{ id, html, aria }] — isi kartu (HTML) & label aksesibel
 *   st             state papan (makeOrderState)
 *   opts.correct   array id urutan benar (untuk menandai tiap posisi)
 *   opts.fromLabel label ujung kiri (mis. 'Terkecil')
 *   opts.toLabel   label ujung kanan (mis. 'Terbesar')
 */
function buildOrderBoard(id, items, st, opts) {
  opts = opts || {};
  var byId = {};
  items.forEach(function (it) {
    byId[it.id] = it;
  });
  var locked = st.checked && st.correct;
  var slots = '';
  for (var i = 0; i < items.length; i++) {
    var pid = st.picked[i];
    var cls = 'order-board__slot';
    if (pid) cls += ' is-filled';
    if (st.checked && pid && opts.correct) {
      cls += opts.correct[i] === pid ? ' is-ok' : ' is-bad';
    }
    slots +=
      '<li class="' +
      cls +
      '">' +
      '<span class="order-board__pos">' +
      (i + 1) +
      '</span>' +
      (pid
        ? '<span class="order-board__val">' + byId[pid].html + '</span>'
        : '<span class="order-board__empty">?</span>') +
      '</li>';
  }
  var pool = st.pool
    .filter(function (pid) {
      return st.picked.indexOf(pid) === -1;
    })
    .map(function (pid) {
      return (
        '<button type="button" class="order-board__card" data-order-pick="' +
        esc(pid) +
        '" data-order-board="' +
        esc(id) +
        '" aria-label="' +
        esc('Pilih ' + (byId[pid].aria || pid)) +
        '"' +
        (st.checked ? ' disabled' : '') +
        '>' +
        byId[pid].html +
        '</button>'
      );
    })
    .join('');
  var full = st.picked.length === items.length;
  var controls = '';
  if (!locked) {
    if (st.checked) {
      controls =
        '<button type="button" class="btn btn--primary" id="' +
        id +
        'Fix">🔁 Perbaiki Urutan</button>';
    } else {
      controls =
        '<button type="button" class="btn btn--primary" id="' +
        id +
        'Check"' +
        (full ? '' : ' disabled') +
        '>Periksa Urutan</button>' +
        '<button type="button" class="btn btn--ghost btn--small" id="' +
        id +
        'Undo"' +
        (st.picked.length ? '' : ' disabled') +
        '>↩ Batal satu</button>' +
        '<button type="button" class="btn btn--ghost btn--small" id="' +
        id +
        'Clear"' +
        (st.picked.length ? '' : ' disabled') +
        '>Ulang</button>';
    }
  }
  return (
    '<div class="order-board' +
    (locked ? ' is-locked' : '') +
    '" id="' +
    id +
    '">' +
    '<div class="order-board__ends" aria-hidden="true"><span>' +
    esc(opts.fromLabel || 'Terkecil') +
    '</span><span>' +
    esc(opts.toLabel || 'Terbesar') +
    ' →</span></div>' +
    '<ol class="order-board__slots" aria-label="' +
    esc('Urutan dari ' + (opts.fromLabel || 'terkecil') + ' ke ' + (opts.toLabel || 'terbesar')) +
    '">' +
    slots +
    '</ol>' +
    (pool
      ? '<p class="order-board__hint">Ketuk kartu sesuai urutan:</p><div class="order-board__pool">' +
        pool +
        '</div>'
      : '') +
    (controls ? '<div class="order-board__controls">' + controls + '</div>' : '') +
    '</div>'
  );
}

/*
 * Memasang event buildOrderBoard di dalam `root`.
 *   opts.correct   array id urutan benar
 *   opts.save, opts.rerender   dipanggil setelah setiap perubahan
 *   opts.onCheck(st)           (opsional) setelah diperiksa
 */
function bindOrderBoard(root, id, st, opts) {
  function done() {
    opts.save();
    opts.rerender();
  }
  root.querySelectorAll('[data-order-board="' + id + '"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (st.checked) return;
      var pid = btn.getAttribute('data-order-pick');
      if (st.picked.indexOf(pid) === -1) st.picked.push(pid);
      done();
    });
  });
  var check = root.querySelector('#' + id + 'Check');
  var undo = root.querySelector('#' + id + 'Undo');
  var clear = root.querySelector('#' + id + 'Clear');
  var fix = root.querySelector('#' + id + 'Fix');
  if (check) {
    check.addEventListener('click', function () {
      if (st.picked.length !== opts.correct.length) return;
      st.attempts += 1;
      st.checked = true;
      st.correct = st.picked.every(function (pid, i) {
        return pid === opts.correct[i];
      });
      if (opts.onCheck) opts.onCheck(st);
      done();
    });
  }
  if (undo) {
    undo.addEventListener('click', function () {
      st.picked.pop();
      done();
    });
  }
  if (clear) {
    clear.addEventListener('click', function () {
      st.picked = [];
      done();
    });
  }
  if (fix) {
    fix.addEventListener('click', function () {
      /* Kartu di posisi yang sudah benar tetap di tempat; sisanya kembali. */
      var keep = [];
      for (var i = 0; i < st.picked.length; i++) {
        if (st.picked[i] !== opts.correct[i]) break;
        keep.push(st.picked[i]);
      }
      st.picked = keep;
      st.checked = false;
      done();
    });
  }
}

/*
 * Kartu peran kerja kelompok (Cooperative Learning): setiap peran punya
 * ikon, nama, tugas, dan kotak isian nama anggota.
 *   roles   [{ id, ikon, nama, tugas }]
 *   values  { <roleId>: 'nama anggota' }
 *   opts.locked  true → tampilkan nama saja (tanpa isian)
 * Kotak isian memakai atribut data-role-id untuk dipasang event-nya.
 */
function buildRoleCards(roles, values, opts) {
  opts = opts || {};
  values = values || {};
  return (
    '<div class="role-cards">' +
    roles
      .map(function (r) {
        var val = values[r.id] || '';
        return (
          '<div class="role-card">' +
          '<span class="role-card__icon" aria-hidden="true">' +
          r.ikon +
          '</span>' +
          '<div class="role-card__body">' +
          '<p class="role-card__name">' +
          esc(r.nama) +
          '</p>' +
          '<p class="role-card__task">' +
          r.tugas +
          '</p>' +
          (opts.locked
            ? '<p class="role-card__who">👤 ' + esc(val || '-') + '</p>'
            : '<input type="text" class="input-text role-card__input" maxlength="24" data-role-id="' +
              esc(r.id) +
              '" value="' +
              esc(val) +
              '" placeholder="Nama anggota" aria-label="' +
              esc('Nama anggota untuk peran ' + r.nama) +
              '">') +
          '</div>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Label kecil peran yang bertugas, mis. "🧮 Penghitung: Rina". */
function buildRoleTag(role, name) {
  if (!role) return '';
  return (
    '<span class="role-tag"><span aria-hidden="true">' +
    role.ikon +
    '</span> ' +
    esc(role.nama) +
    (name ? ': <strong>' + esc(name) + '</strong>' : '') +
    '</span>'
  );
}

/* ============================================================
   16. PENERAPAN KONTEKSTUAL — PECAHAN CAMPURAN, TERMOMETER &
       PAPAN INFO
   Dipakai modul penerapan bilangan bulat & pecahan dalam masalah
   sehari-hari (fase-d/mpi-1.6). Gaya .thermo*, .info-poster* ada
   di shared/base.css.
   ============================================================ */

/* Pecahan campuran → pecahan biasa: 1 3/4 → { num: 7, den: 4 }. */
function mixedToImproper(whole, num, den) {
  return { num: (whole || 0) * den + num, den: den };
}

/* Pecahan biasa → pecahan campuran: 7/4 → { whole: 1, num: 3, den: 4 }. */
function improperToMixed(num, den) {
  return { whole: Math.floor(num / den), num: num % den, den: den };
}

/*
 * Memeriksa isian pecahan (value dari readFractionInput) terhadap
 * jawaban { whole?, num, den } dan mendiagnosis kesalahannya.
 *   bentuk  'tepat'    notasi harus sama persis (menulis dari kata-kata)
 *           'campuran' senilai DAN berbentuk campuran (bulat ≥ 1,
 *                      pembilang < penyebut)
 *           'biasa'    senilai DAN tanpa bilangan bulat
 * Mengembalikan 'ok' | 'tidak-senilai' | 'bukan-campuran' | 'bukan-biasa'
 * | 'terbalik' (pembilang & penyebut tertukar) | 'beda-notasi'
 * (senilai, tetapi bukan notasi yang diminta).
 */
function diagnosaPecahan(v, jawab, bentuk) {
  var a = mixedToImproper(v.whole, v.num, v.den);
  var b = mixedToImproper(jawab.whole, jawab.num, jawab.den);
  if (!pecahanSetara(a, b)) {
    return v.num === jawab.den && v.den === jawab.num ? 'terbalik' : 'tidak-senilai';
  }
  if (bentuk === 'campuran') {
    return v.whole && v.num > 0 && v.num < v.den ? 'ok' : 'bukan-campuran';
  }
  if (bentuk === 'biasa') return v.whole ? 'bukan-biasa' : 'ok';
  var sama = (v.whole || 0) === (jawab.whole || 0) && v.num === jawab.num && v.den === jawab.den;
  return sama ? 'ok' : 'beda-notasi';
}

/*
 * Termometer SVG untuk membaca suhu bilangan bulat (°C).
 *   value        suhu yang ditunjukkan
 *   opts.min, max  rentang skala (default −10 … 10)
 *   opts.step    jarak label skala (default 2)
 *   opts.caption teks di bawah termometer (mis. pukul pencatatan)
 *   opts.small   true → ukuran ringkas untuk deretan termometer
 * Cairan di bawah 0 berwarna biru, di atas 0 berwarna oranye, dan garis
 * 0 ditebalkan sebagai titik acuan.
 */
function buildThermometer(value, opts) {
  opts = opts || {};
  var min = typeof opts.min === 'number' ? opts.min : -10;
  var max = typeof opts.max === 'number' ? opts.max : 10;
  var step = opts.step || 2;
  var top = 12;
  var bottom = 150;
  function yOf(v) {
    return bottom - ((v - min) / (max - min)) * (bottom - top);
  }
  var ticks = '';
  for (var t = min; t <= max; t++) {
    var y = yOf(t).toFixed(1);
    var berlabel = t % step === 0 || t === 0;
    ticks +=
      '<line class="thermo__tick' +
      (t === 0 ? ' thermo__tick--zero' : '') +
      '" x1="' +
      (berlabel ? 40 : 44) +
      '" x2="52" y1="' +
      y +
      '" y2="' +
      y +
      '"/>';
    if (berlabel) {
      ticks +=
        '<text class="thermo__label' +
        (t === 0 ? ' thermo__label--zero' : '') +
        '" x="36" y="' +
        (yOf(t) + 3.5).toFixed(1) +
        '" text-anchor="end">' +
        formatNumber(t, '−') +
        '</text>';
    }
  }
  var v = Math.max(min, Math.min(max, value));
  var yv = yOf(v);
  var tone = value < 0 ? 'cold' : 'warm';
  var baca = bacaBilanganBulat(value) + ' derajat Celsius';
  return (
    '<figure class="thermo' +
    (opts.small ? ' thermo--small' : '') +
    '" role="img" aria-label="' +
    esc('Termometer menunjukkan ' + baca + (opts.caption ? ', ' + opts.caption : '')) +
    '">' +
    '<svg class="thermo__svg" viewBox="0 0 96 184" aria-hidden="true">' +
    '<rect class="thermo__tube" x="52" y="4" width="16" height="152" rx="8"/>' +
    '<circle class="thermo__bulb thermo__bulb--' +
    tone +
    '" cx="60" cy="166" r="14"/>' +
    '<rect class="thermo__fluid thermo__fluid--' +
    tone +
    '" x="56" y="' +
    yv.toFixed(1) +
    '" width="8" height="' +
    (166 - yv).toFixed(1) +
    '"/>' +
    ticks +
    '<line class="thermo__marker" x1="68" x2="80" y1="' +
    yv.toFixed(1) +
    '" y2="' +
    yv.toFixed(1) +
    '"/>' +
    '</svg>' +
    '<figcaption class="thermo__cap">' +
    '<strong class="thermo__value thermo__value--' +
    tone +
    '">' +
    formatNumber(value, '−') +
    ' °C</strong>' +
    (opts.caption ? '<span>' + esc(opts.caption) + '</span>' : '') +
    '</figcaption>' +
    '</figure>'
  );
}

/*
 * Deretan termometer kecil (mis. suhu per jam).
 *   readings  [{ value, caption }]
 *   opts      diteruskan ke buildThermometer (min, max, step)
 */
function buildThermometerRow(readings, opts) {
  opts = opts || {};
  return (
    '<div class="thermo-row">' +
    readings
      .map(function (r) {
        return buildThermometer(r.value, {
          min: opts.min,
          max: opts.max,
          step: opts.step,
          caption: r.caption,
          small: true,
        });
      })
      .join('') +
    '</div>'
  );
}

/*
 * Papan info / poster hasil karya kelompok yang siap dipresentasikan.
 *   opts.judul   judul papan
 *   opts.ikon    emoji di samping judul (opsional)
 *   opts.rows    [{ ikon, label, nilai }] — `nilai` berupa HTML
 *   opts.pesan   pesan penutup kelompok (teks biasa, opsional)
 *   opts.footer  catatan kecil di bagian bawah (teks biasa, opsional)
 */
function buildInfoPoster(opts) {
  opts = opts || {};
  return (
    '<article class="info-poster">' +
    '<header class="info-poster__head">' +
    (opts.ikon
      ? '<span class="info-poster__icon" aria-hidden="true">' + opts.ikon + '</span>'
      : '') +
    '<h3 class="info-poster__title">' +
    esc(opts.judul || '') +
    '</h3>' +
    '</header>' +
    '<dl class="info-poster__rows">' +
    (opts.rows || [])
      .map(function (r) {
        return (
          '<div class="info-poster__row">' +
          '<dt><span aria-hidden="true">' +
          (r.ikon || '•') +
          '</span> ' +
          esc(r.label) +
          '</dt>' +
          '<dd>' +
          r.nilai +
          '</dd>' +
          '</div>'
        );
      })
      .join('') +
    '</dl>' +
    (opts.pesan ? '<p class="info-poster__msg">“' + esc(opts.pesan) + '”</p>' : '') +
    (opts.footer ? '<footer class="info-poster__foot">' + esc(opts.footer) + '</footer>' : '') +
    '</article>'
  );
}

/* ============================================================
   17. BILANGAN BULAT — OPERASI PENJUMLAHAN & PENGURANGAN
   Dipakai modul penjumlahan & pengurangan bilangan bulat
   (fase-d/mpi-2.1): garis bilangan dengan busur lompatan,
   simulator operasi (titik awal, tanda operasi, bilangan kedua),
   dan stepper bilangan bulat ramah sentuh. Gaya .nlj-*, .int-sim*,
   .int-stepper* ada di shared/base.css.
   ============================================================ */

/* Notasi baku bilangan bulat dengan minus tipografis: −3, 12. */
function fmtBulat(n) {
  return formatNumber(n, '−');
}

/*
 * Menuliskan operasi a op b dalam notasi baku; bilangan kedua yang
 * negatif diberi kurung: fmtOperasiBulat(5, '-', -2) → "5 − (−2)".
 *   op  '+', '-', '×' (atau '*'), ':' (atau '/')
 * Pada perkalian dan pembagian, bilangan pertama yang negatif juga
 * diberi kurung agar tanda bilangan dan tanda operasi tidak tertukar:
 * fmtOperasiBulat(-3, '×', -4) → "(−3) × (−4)".
 */
function fmtOperasiBulat(a, op, b) {
  var simbol = { '+': '+', '-': '−', '×': '×', '*': '×', ':': ':', '/': ':' }[op] || '+';
  var kaliBagi = simbol === '×' || simbol === ':';
  return (
    (kaliBagi && a < 0 ? '(' + fmtBulat(a) + ')' : fmtBulat(a)) +
    ' ' +
    simbol +
    ' ' +
    (b < 0 ? '(' + fmtBulat(b) + ')' : fmtBulat(b))
  );
}

/*
 * Menguraikan a op b menjadi satu lompatan pada garis bilangan.
 * Pengurangan diubah menjadi penjumlahan dengan lawan bilangannya
 * (a − b = a + (−b)), sehingga arah lompatan selalu ditentukan oleh
 * tanda `by`: positif → kanan, negatif → kiri.
 * Mengembalikan { start, by, hasil, setara } — `setara` berupa teks
 * penjumlahan setara, mis. "5 + 2" untuk 5 − (−2).
 */
function integerJumps(a, op, b) {
  var by = op === '-' ? -b : b;
  return { start: a, by: by, hasil: a + by, setara: fmtOperasiBulat(a, '+', by) };
}

/* Arah lompatan untuk `by`: 'kanan' | 'kiri' | 'diam'. */
function arahLompatan(by) {
  if (by > 0) return 'kanan';
  if (by < 0) return 'kiri';
  return 'diam';
}

/*
 * Garis bilangan statis (SVG) dengan busur lompatan.
 *   id              id elemen <svg>
 *   opts.min, max   rentang (default −10 … 10)
 *   opts.labelEvery label angka setiap kelipatan ini (default 1)
 *   opts.start      titik awal (default 0)
 *   opts.jumps      [{ by, label }] lompatan berurutan; `label` default
 *                   notasi baku bertanda (+5 / −3)
 *   opts.unitHops   true → setiap lompatan digambar sebagai lompatan
 *                   kecil satu-satuan (membantu murid menghitung langkah)
 *   opts.showEnd    false → titik akhir ditandai "?" (hasil belum dibuka)
 *   opts.startLabel label titik awal (default "mulai")
 *   opts.aria       label aksesibel
 * Busur ke kanan berwarna oranye (positif), ke kiri biru (negatif).
 * Dibungkus .nlp-wrap; atribut data-zero diisi posisi tengah lompatan
 * sehingga centerNumberLines() memusatkan layar sempit pada lompatannya.
 */
function buildNumberLineJumps(id, opts) {
  opts = opts || {};
  var min = typeof opts.min === 'number' ? opts.min : -10;
  var max = typeof opts.max === 'number' ? opts.max : 10;
  var every = opts.labelEvery || 1;
  var start = typeof opts.start === 'number' ? opts.start : 0;
  var jumps = opts.jumps || [];
  var showEnd = opts.showEnd !== false;
  var unit = 40;
  var padX = 34;
  var axisY = 104;
  var H = 150;
  var W = padX * 2 + (max - min) * unit;
  function xOf(v) {
    return padX + (Math.max(min, Math.min(max, v)) - min) * unit;
  }
  function toneOf(v) {
    if (v < 0) return 'neg';
    if (v > 0) return 'pos';
    return 'zero';
  }

  var html =
    '<defs>' +
    ['pos', 'neg']
      .map(function (t) {
        return (
          '<marker id="' +
          id +
          '-mk-' +
          t +
          '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
          '<path class="nlj-head nlj-head--' +
          t +
          '" d="M0,0 L10,5 L0,10 z"/>' +
          '</marker>'
        );
      })
      .join('') +
    '</defs>';

  var x0 = xOf(min) - 22;
  var x1 = xOf(max) + 22;
  html +=
    '<line class="nlp-axis" x1="' +
    x0 +
    '" y1="' +
    axisY +
    '" x2="' +
    x1 +
    '" y2="' +
    axisY +
    '"/>' +
    '<polygon class="nlp-arrow" points="' +
    (x0 - 4) +
    ',' +
    axisY +
    ' ' +
    (x0 + 8) +
    ',' +
    (axisY - 6) +
    ' ' +
    (x0 + 8) +
    ',' +
    (axisY + 6) +
    '"/>' +
    '<polygon class="nlp-arrow" points="' +
    (x1 + 4) +
    ',' +
    axisY +
    ' ' +
    (x1 - 8) +
    ',' +
    (axisY - 6) +
    ' ' +
    (x1 - 8) +
    ',' +
    (axisY + 6) +
    '"/>';

  for (var v = min; v <= max; v++) {
    var x = xOf(v);
    var major = v === 0 || v % 5 === 0;
    var h = major ? 12 : 8;
    html +=
      '<line class="nlp-tick' +
      (major ? ' nlp-tick--major' : '') +
      '" x1="' +
      x +
      '" y1="' +
      (axisY - h) +
      '" x2="' +
      x +
      '" y2="' +
      (axisY + h) +
      '"/>';
    if (v === 0 || v === min || v === max || v % every === 0) {
      html +=
        '<text class="nlp-num nlp-num--' +
        toneOf(v) +
        '" x="' +
        x +
        '" y="' +
        (axisY + 34) +
        '">' +
        fmtBulat(v) +
        '</text>';
    }
  }

  /* Busur lompatan. */
  var pos = start;
  var arcs = '';
  var desc = [];
  jumps.forEach(function (j) {
    var tone = j.by >= 0 ? 'pos' : 'neg';
    var from = pos;
    var to = pos + j.by;
    var xa = xOf(from);
    var xb = xOf(to);
    var label = j.label !== undefined ? j.label : (j.by > 0 ? '+' : '') + fmtBulat(j.by);
    var peak;
    if (opts.unitHops && j.by !== 0) {
      var step = j.by > 0 ? 1 : -1;
      for (var k = 0; k < Math.abs(j.by); k++) {
        var ha = xOf(from + k * step);
        var hb = xOf(from + (k + 1) * step);
        arcs +=
          '<path class="nlj-arc nlj-arc--' +
          tone +
          ' nlj-arc--hop" d="M' +
          ha +
          ',' +
          (axisY - 8) +
          ' Q' +
          (ha + hb) / 2 +
          ',' +
          (axisY - 40) +
          ' ' +
          hb +
          ',' +
          (axisY - 8) +
          '"' +
          (k === Math.abs(j.by) - 1 ? ' marker-end="url(#' + id + '-mk-' + tone + ')"' : '') +
          '/>';
      }
      peak = axisY - 48;
    } else if (j.by !== 0) {
      var tinggi = Math.min(70, 26 + Math.abs(xb - xa) * 0.12);
      arcs +=
        '<path class="nlj-arc nlj-arc--' +
        tone +
        '" d="M' +
        xa +
        ',' +
        (axisY - 8) +
        ' Q' +
        (xa + xb) / 2 +
        ',' +
        (axisY - 8 - tinggi * 2) +
        ' ' +
        xb +
        ',' +
        (axisY - 8) +
        '" marker-end="url(#' +
        id +
        '-mk-' +
        tone +
        ')"/>';
      peak = axisY - 14 - tinggi;
    }
    if (j.by !== 0) {
      arcs +=
        '<text class="nlj-label nlj-label--' +
        tone +
        '" x="' +
        (xa + xb) / 2 +
        '" y="' +
        Math.max(16, peak - 6) +
        '">' +
        esc(label) +
        '</text>';
    }
    desc.push(j.by >= 0 ? 'melompat ' + j.by + ' ke kanan' : 'melompat ' + -j.by + ' ke kiri');
    pos = to;
  });
  html += arcs;

  /* Titik awal (cincin) & titik akhir. */
  html +=
    '<g class="nlj-start"><circle cx="' +
    xOf(start) +
    '" cy="' +
    axisY +
    '" r="9"/>' +
    '<text class="nlj-start__label" x="' +
    xOf(start) +
    '" y="' +
    (axisY + 54) +
    '">' +
    esc(opts.startLabel || 'mulai') +
    '</text></g>';
  if (jumps.length) {
    html +=
      '<g class="nlp-mark nlp-mark--' +
      (showEnd ? toneOf(pos) : 'target') +
      '"><circle cx="' +
      xOf(pos) +
      '" cy="' +
      axisY +
      '" r="9"/>' +
      '<text class="nlj-end__label" x="' +
      xOf(pos) +
      '" y="' +
      (axisY + 54) +
      '">' +
      (showEnd ? 'hasil' : '?') +
      '</text></g>';
  }

  var lo = Math.min(start, pos);
  var hi = Math.max(start, pos);
  var fokus = (xOf((lo + hi) / 2) / W).toFixed(4);
  var aria =
    opts.aria ||
    'Garis bilangan: mulai dari ' +
      fmtBulat(start) +
      (desc.length ? ', ' + desc.join(', ') : '') +
      (jumps.length
        ? showEnd
          ? ', berhenti di ' + fmtBulat(pos)
          : ', hasilnya belum ditampilkan'
        : '');

  return (
    '<div class="nlp-wrap nlj-wrap">' +
    '<svg class="nlp nlj" id="' +
    id +
    '" data-zero="' +
    fokus +
    '" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" style="min-width:' +
    Math.round(W * 0.62) +
    'px" role="img" aria-label="' +
    esc(aria) +
    '">' +
    html +
    '</svg>' +
    '</div>'
  );
}

/*
 * Stepper bilangan bulat ramah sentuh: [−] nilai [+].
 *   id           awalan id (tombol: <id>Dec / <id>Inc)
 *   label        teks label di atas stepper
 *   value        nilai saat ini
 *   opts.min/max batas (default −10 … 10)
 * Pasang event dengan bindIntegerStepper().
 */
function buildIntegerStepper(id, label, value, opts) {
  opts = opts || {};
  var min = typeof opts.min === 'number' ? opts.min : -10;
  var max = typeof opts.max === 'number' ? opts.max : 10;
  return (
    '<div class="int-stepper" role="group" aria-label="' +
    esc(label) +
    '">' +
    '<span class="int-stepper__label">' +
    esc(label) +
    '</span>' +
    '<div class="int-stepper__row">' +
    '<button type="button" class="int-stepper__btn" id="' +
    id +
    'Dec" aria-label="Kurangi 1"' +
    (value <= min ? ' disabled' : '') +
    '>−</button>' +
    '<output class="int-stepper__val int-stepper__val--' +
    (value < 0 ? 'neg' : value > 0 ? 'pos' : 'zero') +
    '" aria-live="polite">' +
    fmtBulat(value) +
    '</output>' +
    '<button type="button" class="int-stepper__btn" id="' +
    id +
    'Inc" aria-label="Tambah 1"' +
    (value >= max ? ' disabled' : '') +
    '>+</button>' +
    '</div>' +
    '</div>'
  );
}

/* onChange(delta) dipanggil dengan −1 atau +1. */
function bindIntegerStepper(root, id, onChange) {
  var dec = root.querySelector('#' + id + 'Dec');
  var inc = root.querySelector('#' + id + 'Inc');
  if (dec)
    dec.addEventListener('click', function () {
      onChange(-1);
    });
  if (inc)
    inc.addEventListener('click', function () {
      onChange(1);
    });
}

/*
 * Simulator operasi bilangan bulat: murid mengatur titik awal (a),
 * tanda operasi (+ / −), dan bilangan kedua (b); media menggambar
 * lompatannya pada garis bilangan beserta hasil dan bentuk setaranya.
 *   id    id elemen pembungkus simulator
 *   sim   { a, op, b } — state simulator (disimpan modul di State)
 *   opts  { min, max, rangeA, rangeB, showResult }
 *         rangeA/rangeB: {min,max} batas stepper (default −8 … 8)
 *         showResult false → titik akhir "?" (murid menebak dulu)
 * Pasang event dengan bindIntegerOpSimulator(); simulator merender
 * ulang dirinya sendiri sehingga tahap tidak perlu dirender ulang.
 */
function buildIntegerOpSimulator(id, sim, opts) {
  opts = opts || {};
  var ra = opts.rangeA || { min: -8, max: 8 };
  var rb = opts.rangeB || { min: -8, max: 8 };
  var r = integerJumps(sim.a, sim.op, sim.b);
  var showResult = opts.showResult !== false;
  return (
    '<div class="int-sim" id="' +
    id +
    '">' +
    '<div class="int-sim__controls">' +
    buildIntegerStepper(id + 'A', 'Titik awal', sim.a, ra) +
    '<div class="int-stepper" role="group" aria-label="Operasi">' +
    '<span class="int-stepper__label">Operasi</span>' +
    '<div class="int-sim__ops">' +
    '<button type="button" class="int-sim__op' +
    (sim.op === '+' ? ' is-active' : '') +
    '" data-sim-op="+" aria-pressed="' +
    (sim.op === '+') +
    '">+</button>' +
    '<button type="button" class="int-sim__op' +
    (sim.op === '-' ? ' is-active' : '') +
    '" data-sim-op="-" aria-pressed="' +
    (sim.op === '-') +
    '">−</button>' +
    '</div>' +
    '</div>' +
    buildIntegerStepper(id + 'B', 'Bilangan kedua', sim.b, rb) +
    '</div>' +
    '<p class="int-sim__expr">' +
    '<span>' +
    esc(fmtOperasiBulat(sim.a, sim.op, sim.b)) +
    '</span>' +
    (sim.op === '-' ? '<span class="int-sim__eq">= ' + esc(r.setara) + '</span>' : '') +
    '<span class="int-sim__eq">= <strong>' +
    (showResult ? fmtBulat(r.hasil) : '?') +
    '</strong></span>' +
    '</p>' +
    buildNumberLineJumps(id + 'Line', {
      min: opts.min,
      max: opts.max,
      start: sim.a,
      jumps: [{ by: r.by }],
      unitHops: true,
      showEnd: showResult,
    }) +
    '<p class="int-sim__note">' +
    (r.by > 0
      ? 'Lompatan <strong>' + r.by + ' langkah ke kanan</strong>.'
      : r.by < 0
      ? 'Lompatan <strong>' + -r.by + ' langkah ke kiri</strong>.'
      : 'Tidak ada lompatan — titiknya diam.') +
    '</p>' +
    '</div>'
  );
}

/*
 * Memasang event simulator. onChange(sim) dipanggil setelah nilai
 * berubah (mis. untuk menyimpan State). Simulator merender ulang
 * dirinya dan memulihkan fokus pada tombol yang sama.
 */
function bindIntegerOpSimulator(root, id, sim, opts, onChange) {
  opts = opts || {};
  var ra = opts.rangeA || { min: -8, max: 8 };
  var rb = opts.rangeB || { min: -8, max: 8 };
  var el = root.querySelector('#' + id);
  if (!el) return;
  function clamp(v, r) {
    return Math.max(r.min, Math.min(r.max, v));
  }
  function refresh(focusSel) {
    var wrap = document.createElement('div');
    wrap.innerHTML = buildIntegerOpSimulator(id, sim, opts);
    var baru = wrap.firstChild;
    el.parentNode.replaceChild(baru, el);
    if (onChange) onChange(sim);
    bindIntegerOpSimulator(root, id, sim, opts, onChange);
    centerNumberLines(baru);
    var f = focusSel && baru.querySelector(focusSel);
    if (f && !f.disabled) f.focus({ preventScroll: true });
  }
  bindIntegerStepper(el, id + 'A', function (d) {
    sim.a = clamp(sim.a + d, ra);
    refresh('#' + id + (d < 0 ? 'ADec' : 'AInc'));
  });
  bindIntegerStepper(el, id + 'B', function (d) {
    sim.b = clamp(sim.b + d, rb);
    refresh('#' + id + (d < 0 ? 'BDec' : 'BInc'));
  });
  el.querySelectorAll('[data-sim-op]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      sim.op = btn.getAttribute('data-sim-op');
      refresh('[data-sim-op="' + sim.op + '"]');
    });
  });
}

/* ============================================================
   18. BILANGAN BULAT — PERKALIAN, PEMBAGIAN & URUTAN PENGERJAAN
   Dipakai modul perkalian & pembagian bilangan bulat
   (fase-d/mpi-2.2): hasil & tanda operasi, perkalian sebagai
   penjumlahan berulang pada garis bilangan, tabel aturan tanda
   (dugaan maupun perbandingan dugaan–data), dan pengerjaan
   operasi campuran langkah demi langkah. Gaya .sign-grid* dan
   .expr-steps* ada di shared/base.css.
   ============================================================ */

/* Hasil a op b untuk op '+', '-', '×'/'*', ':'/'/'. */
function hasilOperasiBulat(a, op, b) {
  if (op === '-') return a - b;
  if (op === '×' || op === '*') return a * b;
  if (op === ':' || op === '/') return a / b;
  return a + b;
}

/* Tanda bilangan: 'positif' | 'negatif' | 'nol'. */
function tandaBilangan(n) {
  if (n > 0) return 'positif';
  if (n < 0) return 'negatif';
  return 'nol';
}

/*
 * Penjumlahan berulang untuk n × b (n ≥ 1): fmtPenjumlahanBerulang(3, -2)
 * → "(−2) + (−2) + (−2)".
 */
function fmtPenjumlahanBerulang(n, b) {
  var suku = b < 0 ? '(' + fmtBulat(b) + ')' : fmtBulat(b);
  var out = [];
  for (var i = 0; i < n; i++) out.push(suku);
  return out.join(' + ');
}

/*
 * Garis bilangan untuk n × b sebagai n lompatan sejauh b dari 0.
 *   opts.min, max   rentang (default −12 … 12)
 *   opts.showEnd    false → titik akhir ditandai "?"
 *   opts.aria       label aksesibel
 */
function buildRepeatedAddJumps(id, n, b, opts) {
  opts = opts || {};
  var jumps = [];
  for (var i = 0; i < n; i++) jumps.push({ by: b });
  return buildNumberLineJumps(id, {
    min: typeof opts.min === 'number' ? opts.min : -12,
    max: typeof opts.max === 'number' ? opts.max : 12,
    start: 0,
    jumps: jumps,
    showEnd: opts.showEnd,
    startLabel: '0',
    aria:
      opts.aria ||
      fmtBulat(n) +
        ' × ' +
        (b < 0 ? '(' + fmtBulat(b) + ')' : fmtBulat(b)) +
        ' sebagai ' +
        n +
        ' lompatan ' +
        fmtBulat(b),
  });
}

/*
 * Tabel aturan tanda. Setiap sel memuat satu pola tanda, mis.
 * { id, label: '(−) × (−)', contoh: '(−3) × (−4)', correct: 'positif' }.
 * State tiap sel { chosen, correct, optionOrder } disiapkan dengan
 * ensureSortStates() sehingga urutan opsi tiap sel DIACAK sekali lalu
 * disimpan.
 *   opts.mode     'pilih'   → murid memilih tanda (dugaan, tidak dinilai,
 *                              boleh diubah); pasang bindSignRuleGrid()
 *                 'banding' → hanya-baca: dugaan murid dibandingkan
 *                              dengan tanda hasil data (✓ cocok / ✗ beda)
 *   opts.options  [{ id, label }] opsi tanda, mis. positif/negatif
 *   opts.dugaanLabel, opts.dataLabel   judul baris pada mode 'banding'
 */
function buildSignRuleGrid(id, cells, states, opts) {
  opts = opts || {};
  var options = opts.options || [];
  var banding = opts.mode === 'banding';
  return (
    '<div class="sign-grid" id="' +
    id +
    '">' +
    cells
      .map(function (c) {
        var st = states[c.id] || {};
        var cls = 'sign-grid__cell';
        var body;
        if (banding) {
          var cocok = st.chosen === c.correct;
          cls += cocok ? ' sign-grid__cell--match' : ' sign-grid__cell--miss';
          body =
            '<dl class="sign-grid__compare">' +
            '<dt>' +
            esc(opts.dugaanLabel || 'Dugaanmu') +
            '</dt><dd>' +
            (st.chosen ? findOptionLabel(options, st.chosen) : '—') +
            '</dd>' +
            '<dt>' +
            esc(opts.dataLabel || 'Hasil data') +
            '</dt><dd class="sign-grid__val sign-grid__val--' +
            esc(c.correct) +
            '">' +
            findOptionLabel(options, c.correct) +
            '</dd>' +
            '</dl>' +
            '<span class="sign-grid__mark">' +
            (cocok ? '✓ Dugaan cocok' : '✗ Dugaan perlu direvisi') +
            '</span>';
        } else {
          body = buildChoiceGroup(options, st.optionOrder, {
            chosen: st.chosen,
            group: c.id,
            attr: 'data-sign-opt',
          });
        }
        return (
          '<div class="' +
          cls +
          '">' +
          '<span class="sign-grid__rule">' +
          esc(c.label) +
          '</span>' +
          (c.contoh ? '<span class="sign-grid__contoh">contoh: ' + esc(c.contoh) + '</span>' : '') +
          body +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Memasang event buildSignRuleGrid mode 'pilih' (pilihan boleh diubah). */
function bindSignRuleGrid(root, id, cells, states, save, rerender) {
  var el = root.querySelector('#' + id);
  if (!el) return;
  var byId = {};
  cells.forEach(function (c) {
    byId[c.id] = c;
  });
  el.querySelectorAll('[data-sign-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var c = byId[btn.dataset.group];
      var st = c && states[c.id];
      if (!st) return;
      st.chosen = btn.dataset.signOpt;
      st.correct = st.chosen === c.correct;
      save();
      rerender();
    });
  });
}

function signGridAllChosen(cells, states) {
  return cells.every(function (c) {
    return !!(states[c.id] && states[c.id].chosen);
  });
}

function signGridMatchCount(cells, states) {
  return cells.filter(function (c) {
    return states[c.id] && states[c.id].chosen === c.correct;
  }).length;
}

/*
 * Menandai bagian ekspresi yang sedang dikerjakan. Teks di antara [[ dan ]]
 * dibungkus <mark>; sisanya di-escape.
 */
function renderExprMarks(str) {
  return esc(str).replace(/\[\[(.+?)\]\]/g, '<mark class="expr-steps__mark">$1</mark>');
}

/*
 * Pengerjaan operasi campuran langkah demi langkah.
 *   soal  { ekspresi, langkah: [{ label, jawab, sesudah, hints }] }
 *         `ekspresi` dan `sesudah` memakai penanda [[…]] untuk bagian yang
 *         dikerjakan pada langkah berikutnya; `sesudah` langkah terakhir
 *         berupa hasil akhir tanpa penanda.
 *   states  array state langkah (makeDlStep), satu per langkah
 * Setiap langkah baru terbuka setelah langkah sebelumnya benar; baris
 * "= …" bertambah seiring langkah yang selesai.
 */
function buildExprSteps(id, soal, states) {
  var html =
    '<div class="expr-steps" id="' +
    id +
    '">' +
    '<p class="expr-steps__line">' +
    renderExprMarks(soal.ekspresi) +
    '</p>';
  for (var i = 0; i < soal.langkah.length; i++) {
    var step = soal.langkah[i];
    var st = states[i];
    var akhir = i === soal.langkah.length - 1;
    if (st.done) {
      html +=
        '<p class="expr-steps__line' +
        (akhir ? ' expr-steps__line--final' : '') +
        '"><span class="expr-steps__eq">=</span> ' +
        renderExprMarks(step.sesudah) +
        '</p>';
      continue;
    }
    html +=
      '<div class="expr-steps__work">' +
      buildDlStep(
        id + 's' + i,
        st,
        {
          label:
            '<span class="expr-steps__stepno">Langkah ' + (i + 1) + '</span> ' + esc(step.label),
          jawab: step.jawab,
          hints: step.hints,
          allowNegative: true,
        },
        null
      ) +
      '</div>';
    break;
  }
  return html + '</div>';
}

/* Memasang event langkah aktif buildExprSteps. */
function bindExprSteps(id, soal, states, save, rerender) {
  for (var i = 0; i < soal.langkah.length; i++) {
    if (states[i].done) continue;
    bindDlStep(
      id + 's' + i,
      states[i],
      { jawab: soal.langkah[i].jawab, hints: soal.langkah[i].hints },
      save,
      rerender
    );
    return;
  }
}

function exprStepsDone(states) {
  return states.every(function (s) {
    return s.done;
  });
}

/* ============================================================
   19. BILANGAN DESIMAL: NILAI TEMPAT, CARA BACA & MODEL VISUAL
   Dipakai fase-d/mpi-3.1. Bilangan desimal selalu diolah sebagai
   STRING berkoma ("3,07"), bukan Number, agar angka 0 pengisi tempat
   dan angka 0 di akhir (0,50) tidak hilang saat dibaca/ditampilkan.
   Gaya .dec-* ada di shared/base.css.
   ============================================================ */

/*
 * Nilai tempat yang dimodelkan: satuan dan tiga tempat di belakang koma.
 *   key     kunci state perakit (buildDecimalBuilder)
 *   nama    nama nilai tempat
 *   baca    nama penyebut saat membaca ("tujuh perseratus")
 *   nilai   nilai satu unit tempat itu dalam desimal & pecahan
 */
var DESIMAL_TEMPAT = [
  { key: 's', nama: 'satuan', baca: '', nilai: '1', pecahan: '1' },
  { key: 'd1', nama: 'persepuluhan', baca: 'persepuluh', nilai: '0,1', pecahan: '1/10' },
  { key: 'd2', nama: 'perseratusan', baca: 'perseratus', nilai: '0,01', pecahan: '1/100' },
  { key: 'd3', nama: 'perseribuan', baca: 'perseribu', nilai: '0,001', pecahan: '1/1000' },
];

/* Nama tempat bagian bulat dari kanan: satuan, puluhan, ratusan. */
var DESIMAL_TEMPAT_BULAT = ['satuan', 'puluhan', 'ratusan'];

/*
 * Memecah string desimal menjadi { bulat, pecahan } (keduanya string
 * angka). Koma maupun titik diterima: "3,07" → { bulat: '3', pecahan:
 * '07' }, "12" → { bulat: '12', pecahan: '' }. null bila tidak valid.
 */
function desimalDigits(str) {
  var m = String(str)
    .trim()
    .replace('.', ',')
    .match(/^(\d+)(?:,(\d+))?$/);
  if (!m) return null;
  return { bulat: m[1], pecahan: m[2] || '' };
}

/*
 * Nama nilai tempat angka ke-`pos` di belakang koma (1 → persepuluhan,
 * 2 → perseratusan, 3 → perseribuan). pos 0 → satuan, −1 → puluhan,
 * −2 → ratusan.
 */
function namaNilaiTempatDesimal(pos) {
  if (pos >= 1 && pos <= 3) return DESIMAL_TEMPAT[pos].nama;
  return DESIMAL_TEMPAT_BULAT[-pos] || '';
}

/*
 * Nama tempat untuk judul kolom sempit: "persepuluhan" → "per&shy;sepuluhan"
 * (sudah di-escape) agar di layar ponsel boleh terpotong menjadi
 * "per-" / "sepuluhan" alih-alih melebarkan tabel.
 */
function namaTempatHtml(nama) {
  return esc(nama).replace(/^per/, 'per&shy;');
}

/*
 * Cara baca "koma": bagian bulat dibaca sebagai bilangan, angka di
 * belakang koma dibaca SATU PER SATU.
 *   "3,07"  → "tiga koma nol tujuh"
 *   "12,48" → "dua belas koma empat delapan"
 */
function bacaDesimalKoma(str) {
  var p = desimalDigits(str);
  if (!p) return '';
  var baca = terbilang(parseInt(p.bulat, 10));
  if (!p.pecahan) return baca;
  return (
    baca +
    ' koma ' +
    p.pecahan
      .split('')
      .map(function (d) {
        return terbilang(+d);
      })
      .join(' ')
  );
}

/*
 * Cara baca "nilai tempat": angka di belakang koma dibaca sebagai satu
 * bilangan, diikuti nama tempat angka PALING KANAN.
 *   "3,07"  → "tiga dan tujuh perseratus"
 *   "0,375" → "tiga ratus tujuh puluh lima perseribu"
 *   "0,50"  → "lima puluh perseratus"
 */
function bacaDesimalNilaiTempat(str) {
  var p = desimalDigits(str);
  if (!p) return '';
  var bulat = parseInt(p.bulat, 10);
  var pembilang = p.pecahan ? parseInt(p.pecahan, 10) : 0;
  if (!p.pecahan || pembilang === 0) return terbilang(bulat);
  var tempat = DESIMAL_TEMPAT[p.pecahan.length];
  var penyebut = tempat ? tempat.baca : 'per' + terbilang(Math.pow(10, p.pecahan.length));
  var frac = terbilang(pembilang) + ' ' + penyebut;
  return bulat === 0 ? frac : terbilang(bulat) + ' dan ' + frac;
}

/*
 * Nilai angka ke-`pos` (1–3) di belakang koma, dalam desimal:
 * nilaiAngkaDesimal('4,72', 1) → "0,7", nilaiAngkaDesimal('0,381', 2)
 * → "0,08". '' bila posisi itu tidak ada.
 */
function nilaiAngkaDesimal(str, pos) {
  var p = desimalDigits(str);
  if (!p || pos < 1 || pos > p.pecahan.length) return '';
  var d = p.pecahan.charAt(pos - 1);
  return '0,' + new Array(pos).join('0') + d;
}

/*
 * Bentuk panjang berdasarkan nilai tempat (angka 0 dilewati):
 *   "3,07"  → "3 + 0,07"
 *   "1,25"  → "1 + 0,2 + 0,05"
 */
function bentukPanjangDesimal(str) {
  var p = desimalDigits(str);
  if (!p) return '';
  var suku = [];
  if (parseInt(p.bulat, 10) > 0 || !p.pecahan) suku.push(String(parseInt(p.bulat, 10)));
  for (var i = 1; i <= p.pecahan.length; i++) {
    if (p.pecahan.charAt(i - 1) !== '0') suku.push(nilaiAngkaDesimal(str, i));
  }
  return suku.length ? suku.join(' + ') : '0';
}

/* State default perakit desimal: satu angka (0–9) per tempat. */
function makeDecimalParts(s, d1, d2, d3) {
  return { s: s || 0, d1: d1 || 0, d2: d2 || 0, d3: d3 || 0 };
}

/* {s,d1,d2,d3} → string desimal tanpa angka 0 di akhir: {2,0,5,0} → "2,05". */
function desimalDariBagian(parts) {
  var pecahan = String(parts.d1) + String(parts.d2) + String(parts.d3);
  pecahan = pecahan.replace(/0+$/, '');
  return String(parts.s) + (pecahan ? ',' + pecahan : '');
}

/* String desimal (satuan ≤ 9, maks. 3 angka di belakang koma) → {s,d1,d2,d3}. */
function bagianDariDesimal(str) {
  var p = desimalDigits(str);
  if (!p) return makeDecimalParts();
  var f = (p.pecahan + '000').slice(0, 3);
  return makeDecimalParts(parseInt(p.bulat, 10) % 10, +f.charAt(0), +f.charAt(1), +f.charAt(2));
}

/*
 * Membaca isian desimal yang DITULIS dengan koma (notasi baku Indonesia).
 * Titik ditolak dengan pesan khusus karena di Indonesia titik adalah
 * pemisah ribuan. Bentuk kembalian { value, error, message }.
 *   "3,07" → 3.07     "12" → 12     ",5" / "3.07" → error
 */
function parseInputDesimalKoma(str) {
  if (!str || String(str).trim() === '') {
    return { value: null, error: 'empty', message: 'Isi jawabanmu terlebih dahulu.' };
  }
  var s = String(str).trim().replace(/\s/g, '');
  if (s.indexOf('.') !== -1) {
    return {
      value: null,
      error: 'titik',
      message: 'Gunakan tanda koma (,) sebagai pemisah desimal, mis. 3,07 — bukan titik.',
    };
  }
  if (!/^\d+(,\d+)?$/.test(s)) {
    return {
      value: null,
      error: 'invalid',
      message: 'Tulis bilangan desimal dengan koma, mis. 0,5 atau 3,07.',
    };
  }
  return { value: parseFloat(s.replace(',', '.')), error: null, message: '' };
}

/*
 * Tabel nilai tempat (.dec-pv) untuk satu bilangan desimal.
 *   str             bilangan berkoma, mis. "3,07"
 *   opts.highlight  posisi yang disorot (−1 puluhan, 0 satuan, 1–3 di
 *                   belakang koma) atau null
 *   opts.showNilai  true → baris tambahan nilai satu unit tiap tempat
 *   opts.caption    judul kecil di atas tabel
 * Tiga kolom di belakang koma selalu tampil; kolom tanpa angka
 * ditandai kosong agar murid melihat "tempat" yang belum terisi.
 */
function buildPlaceValueTable(str, opts) {
  opts = opts || {};
  var p = desimalDigits(str) || { bulat: '0', pecahan: '' };
  var bulat = p.bulat.replace(/^0+(?=\d)/, '');
  var cols = [];
  for (var i = bulat.length - 1; i >= 0; i--) {
    cols.push({ pos: -i, digit: bulat.charAt(bulat.length - 1 - i) });
  }
  cols.push({ koma: true });
  var n = Math.max(3, p.pecahan.length);
  for (var j = 1; j <= n; j++) {
    cols.push({ pos: j, digit: p.pecahan.charAt(j - 1) });
  }
  var nilaiBulat = ['1', '10', '100'];

  function cls(c) {
    var out = 'dec-pv__cell';
    if (c.koma) return out + ' dec-pv__cell--koma';
    out += ' dec-pv__cell--p' + Math.max(0, Math.min(c.pos, 3));
    if (c.pos === opts.highlight) out += ' dec-pv__cell--hl';
    if (c.digit === '') out += ' dec-pv__cell--empty';
    return out;
  }

  var head = cols
    .map(function (c) {
      return (
        '<th scope="col" class="' +
        cls(c) +
        '">' +
        (c.koma
          ? '<span class="sr-only">koma</span>'
          : namaTempatHtml(namaNilaiTempatDesimal(c.pos))) +
        '</th>'
      );
    })
    .join('');
  var row = cols
    .map(function (c) {
      return '<td class="' + cls(c) + '">' + (c.koma ? ',' : esc(c.digit || '')) + '</td>';
    })
    .join('');
  var nilaiRow = opts.showNilai
    ? '<tr class="dec-pv__nilai">' +
      cols
        .map(function (c) {
          if (c.koma) return '<td class="' + cls(c) + '"></td>';
          var t =
            c.pos <= 0
              ? nilaiBulat[-c.pos]
              : DESIMAL_TEMPAT[c.pos]
              ? DESIMAL_TEMPAT[c.pos].pecahan
              : '';
          return '<td class="' + cls(c) + '">' + esc(t) + '</td>';
        })
        .join('') +
      '</tr>'
    : '';

  return (
    '<div class="dec-pv">' +
    (opts.caption ? '<p class="dec-pv__caption">' + esc(opts.caption) + '</p>' : '') +
    '<div class="table-scroll"><table class="dec-pv__table" aria-label="Tabel nilai tempat ' +
    esc(String(str)) +
    '">' +
    '<thead><tr>' +
    head +
    '</tr></thead><tbody><tr>' +
    row +
    '</tr>' +
    nilaiRow +
    '</tbody></table></div></div>'
  );
}

/*
 * Model blok desimal: 1 satuan = persegi 10 × 10, 1 persepuluhan = satu
 * batang (1/10 persegi), 1 perseratusan = satu kotak kecil (1/100),
 * 1 perseribuan = satu irisan tipis (1/10 kotak kecil).
 *   parts        {s, d1, d2, d3} banyak blok tiap tempat (0–9)
 *   opts.compact true → blok lebih kecil (untuk kartu/soal)
 */
function buildDecimalBlockModel(parts, opts) {
  opts = opts || {};
  var aria = DESIMAL_TEMPAT.map(function (t) {
    return parts[t.key] + ' ' + t.nama;
  }).join(', ');
  var groups = DESIMAL_TEMPAT.map(function (t, i) {
    var count = parts[t.key] || 0;
    var pieces = '';
    for (var k = 0; k < count; k++) {
      pieces += '<span class="dec-block__piece dec-block__piece--p' + i + '"></span>';
    }
    return (
      '<div class="dec-block__group dec-block__group--p' +
      i +
      (count ? '' : ' dec-block__group--empty') +
      '">' +
      '<div class="dec-block__pieces">' +
      (pieces || '<span class="dec-block__none">–</span>') +
      '</div>' +
      '<span class="dec-block__label"><strong>' +
      count +
      '</strong> ' +
      esc(t.nama) +
      '</span>' +
      '</div>'
    );
  }).join('');
  return (
    '<div class="dec-block' +
    (opts.compact ? ' dec-block--compact' : '') +
    '" role="img" aria-label="Model blok: ' +
    esc(aria) +
    '">' +
    groups +
    '</div>'
  );
}

/* Legenda ukuran blok: 1 satuan = 10 persepuluhan = 100 perseratusan … */
function buildDecimalBlockLegend() {
  return (
    '<div class="dec-legend" aria-hidden="true">' +
    DESIMAL_TEMPAT.map(function (t, i) {
      return (
        '<span class="dec-legend__item">' +
        '<span class="dec-block__piece dec-block__piece--p' +
        i +
        '"></span>' +
        '<span>1 ' +
        esc(t.nama) +
        ' = ' +
        esc(t.nilai) +
        '</span></span>'
      );
    }).join('') +
    '</div>'
  );
}

/*
 * Perakit bilangan desimal: empat stepper (satuan, persepuluhan,
 * perseratusan, perseribuan; masing-masing 0–9) yang langsung
 * memperbarui tulisan desimal, tabel nilai tempat, model blok, dan
 * dua cara bacanya.
 *   id               id elemen pembungkus
 *   parts            {s, d1, d2, d3} — state perakit (disimpan modul)
 *   opts.showReading false → sembunyikan cara baca (murid menebak dulu)
 *   opts.locked      true → stepper dimatikan
 * Pasang event dengan bindDecimalBuilder(); perakit merender ulang
 * dirinya sendiri sehingga tahap tidak perlu dirender ulang.
 */
function buildDecimalBuilder(id, parts, opts) {
  opts = opts || {};
  var str = desimalDariBagian(parts);
  var steppers = DESIMAL_TEMPAT.map(function (t, i) {
    var html = buildIntegerStepper(id + t.key, t.nama, parts[t.key], { min: 0, max: 9 });
    if (opts.locked) html = html.replace(/<button /g, '<button disabled ');
    return (
      (i === 1 ? '<span class="dec-builder__koma" aria-hidden="true">,</span>' : '') +
      '<div class="dec-builder__step dec-builder__step--p' +
      i +
      '">' +
      html +
      '</div>'
    );
  }).join('');
  return (
    '<div class="dec-builder" id="' +
    id +
    '">' +
    '<div class="dec-builder__controls" role="group" aria-label="Atur banyak blok tiap nilai tempat">' +
    steppers +
    '</div>' +
    '<div class="dec-builder__out">' +
    '<p class="dec-builder__num" aria-live="polite"><span class="sr-only">Bilangan: </span>' +
    esc(str) +
    '</p>' +
    buildDecimalBlockModel(parts) +
    buildPlaceValueTable(str) +
    (opts.showReading === false
      ? ''
      : '<dl class="dec-read">' +
        '<div><dt>Dibaca</dt><dd>' +
        esc(bacaDesimalKoma(str)) +
        '</dd></div>' +
        '<div><dt>Atau (nilai tempat)</dt><dd>' +
        esc(bacaDesimalNilaiTempat(str)) +
        '</dd></div>' +
        '</dl>') +
    '</div>' +
    '</div>'
  );
}

/*
 * onChange(parts) dipanggil setiap nilai stepper berubah (mis. untuk
 * menyimpan State). Fokus keyboard dipulihkan ke tombol yang ditekan.
 */
function bindDecimalBuilder(root, id, parts, opts, onChange) {
  opts = opts || {};
  function refresh(focusId) {
    var el = root.querySelector('#' + id);
    if (!el) return;
    el.outerHTML = buildDecimalBuilder(id, parts, opts);
    bind();
    var f = focusId && root.querySelector('#' + focusId);
    if (f && !f.disabled) f.focus();
  }
  function bind() {
    DESIMAL_TEMPAT.forEach(function (t) {
      bindIntegerStepper(root, id + t.key, function (delta) {
        var v = Math.max(0, Math.min(9, (parts[t.key] || 0) + delta));
        if (v === parts[t.key]) return;
        parts[t.key] = v;
        if (onChange) onChange(parts);
        refresh(id + t.key + (delta > 0 ? 'Inc' : 'Dec'));
      });
    });
  }
  bind();
}

/* ============================================================
   20. BILANGAN DESIMAL: MEMBANDINGKAN & MENGURUTKAN
   Dipakai fase-d/mpi-3.2. Seperti bagian 19, bilangan desimal diolah
   sebagai STRING berkoma agar perbandingan tidak terganggu galat
   pembulatan dan agar penulisan asli (0,50) tetap tampil apa adanya.
   Gaya .dec-cmp* dan .nlp--dec ada di shared/base.css.
   ============================================================ */

/* Bagian bulat tanpa angka 0 di depan: "07" → "7", "0" tetap "0". */
function bulatDesimalNormal(p) {
  return p.bulat.replace(/^0+(?=\d)/, '');
}

/* Menambah angka 0 di kanan sampai panjangnya n (tidak pernah memotong). */
function padKananNol(str, n) {
  while (str.length < n) str += '0';
  return str;
}

/* Banyak angka di belakang koma: "3,07" → 2, "12" → 0. */
function banyakAngkaDesimal(str) {
  var p = desimalDigits(str);
  return p ? p.pecahan.length : 0;
}

/*
 * Menyamakan banyak angka di belakang koma dengan menambah angka 0 di
 * akhir (nilainya tetap): samakanDigitDesimal('0,8', 2) → "0,80".
 */
function samakanDigitDesimal(str, n) {
  var p = desimalDigits(str);
  if (!p) return String(str);
  var pecahan = padKananNol(p.pecahan, n);
  return bulatDesimalNormal(p) + (pecahan ? ',' + pecahan : '');
}

/*
 * Membandingkan dua desimal berdasarkan nilai tempat: −1 (a < b),
 * 0 (a = b), 1 (a > b); null bila salah satunya tidak valid.
 * Bagian bulat dibandingkan lebih dulu, lalu bagian desimal setelah
 * banyak angkanya disamakan.
 */
function bandingkanDesimal(a, b) {
  var p = desimalDigits(a);
  var q = desimalDigits(b);
  if (!p || !q) return null;
  var ba = bulatDesimalNormal(p);
  var bb = bulatDesimalNormal(q);
  if (ba.length !== bb.length) return ba.length > bb.length ? 1 : -1;
  if (ba !== bb) return ba > bb ? 1 : -1;
  var n = Math.max(p.pecahan.length, q.pecahan.length);
  var fa = padKananNol(p.pecahan, n);
  var fb = padKananNol(q.pecahan, n);
  if (fa === fb) return 0;
  return fa > fb ? 1 : -1;
}

/* Id lambang perbandingan ('lt' | 'gt' | 'eq') sesuai COMPARE_SYMBOLS. */
function simbolBandingDesimal(a, b) {
  var c = bandingkanDesimal(a, b);
  if (c === null) return null;
  return c < 0 ? 'lt' : c > 0 ? 'gt' : 'eq';
}

/*
 * Angka pada nilai tempat `pos` (−1 puluhan, 0 satuan, 1 persepuluhan, …)
 * setelah bagian bulat dirata kanan ke panjang `L` dan bagian desimal
 * dirata kiri. Tempat yang tidak ada bernilai '0'.
 */
function angkaPadaTempat(p, pos, L) {
  if (pos <= 0) {
    var bulat = bulatDesimalNormal(p);
    while (bulat.length < L) bulat = '0' + bulat;
    return bulat.charAt(bulat.length - 1 + pos) || '0';
  }
  return p.pecahan.charAt(pos - 1) || '0';
}

/*
 * Posisi nilai tempat PERTAMA dari kiri yang angkanya tidak sama pada
 * semua bilangan di `list` (−1 puluhan, 0 satuan, 1 persepuluhan,
 * 2 perseratusan, …); null bila semua bilangan sama nilainya.
 */
function tempatBedaPertamaDaftar(list) {
  var ps = list.map(desimalDigits);
  if (
    !ps.length ||
    ps.some(function (p) {
      return !p;
    })
  ) {
    return null;
  }
  var L = 0;
  var n = 0;
  ps.forEach(function (p) {
    L = Math.max(L, bulatDesimalNormal(p).length);
    n = Math.max(n, p.pecahan.length);
  });
  for (var pos = 1 - L; pos <= n; pos++) {
    var d0 = angkaPadaTempat(ps[0], pos, L);
    for (var i = 1; i < ps.length; i++) {
      if (angkaPadaTempat(ps[i], pos, L) !== d0) return pos;
    }
  }
  return null;
}

/* tempatBedaPertamaDaftar untuk sepasang bilangan. */
function tempatBedaPertama(a, b) {
  return tempatBedaPertamaDaftar([a, b]);
}

/*
 * Kalimat alasan perbandingan berdasarkan nilai tempat:
 *   ('0,8', '0,75') → "… persepuluhan: 8 > 7, jadi 0,8 > 0,75."
 *   ('0,5', '0,50') → "… 0,50 dan 0,50 … jadi 0,5 = 0,50."
 */
function alasanBandingDesimal(a, b) {
  var sym = compareSymbolText(simbolBandingDesimal(a, b));
  var pos = tempatBedaPertama(a, b);
  if (pos === null) {
    var n = Math.max(banyakAngkaDesimal(a), banyakAngkaDesimal(b));
    return (
      'Samakan banyak angka di belakang koma: ' +
      samakanDigitDesimal(a, n) +
      ' dan ' +
      samakanDigitDesimal(b, n) +
      '. Angka pada setiap nilai tempat sama, jadi ' +
      a +
      ' = ' +
      b +
      '.'
    );
  }
  var p = desimalDigits(a);
  var q = desimalDigits(b);
  var L = Math.max(bulatDesimalNormal(p).length, bulatDesimalNormal(q).length);
  return (
    'Bandingkan mulai dari nilai tempat terbesar (paling kiri). Nilai tempat pertama yang berbeda adalah ' +
    namaNilaiTempatDesimal(pos) +
    ': ' +
    angkaPadaTempat(p, pos, L) +
    ' ' +
    sym +
    ' ' +
    angkaPadaTempat(q, pos, L) +
    ', jadi ' +
    a +
    ' ' +
    sym +
    ' ' +
    b +
    '.'
  );
}

/* Salinan daftar desimal yang terurut naik (desc true → turun). */
function urutkanDesimal(list, desc) {
  return list.slice().sort(function (x, y) {
    return bandingkanDesimal(x, y) * (desc ? -1 : 1);
  });
}

/*
 * Mendiagnosis pilihan lambang yang salah untuk pasangan a ☐ b.
 *   null                    pilihan benar
 *   'nol-akhir'             mengira 0 di akhir mengubah nilai (0,5 vs 0,50)
 *   'abaikan-bulat'         bagian bulat berbeda tetapi terlewat
 *   'bagian-desimal-bulat'  angka di belakang koma dibaca sebagai bilangan
 *                           bulat — "lebih banyak angka lebih besar"
 *                           (0,75 > 0,8 karena 75 > 8)
 *   'lebih-pendek'          "lebih sedikit angka lebih besar" (0,4 > 0,45)
 *   'lain'                  salah dengan pola lain
 */
function diagnosaBandingDesimal(a, b, chosen) {
  var benar = simbolBandingDesimal(a, b);
  if (!benar || chosen === benar) return null;
  if (benar === 'eq') return 'nol-akhir';
  var p = desimalDigits(a);
  var q = desimalDigits(b);
  var ba = parseInt(p.bulat, 10);
  var bb = parseInt(q.bulat, 10);
  if (ba !== bb) return 'abaikan-bulat';
  var na = parseInt(p.pecahan || '0', 10);
  var nb = parseInt(q.pecahan || '0', 10);
  var naif = na < nb ? 'lt' : na > nb ? 'gt' : 'eq';
  if (naif !== benar && chosen === naif) return 'bagian-desimal-bulat';
  var la = p.pecahan.length;
  var lb = q.pecahan.length;
  if ((la < lb && chosen === 'gt') || (lb < la && chosen === 'lt')) return 'lebih-pendek';
  return 'lain';
}

/* Pesan umpan balik (teks biasa, belum di-escape) untuk kode diagnosa. */
function pesanDiagnosaDesimal(kode, a, b) {
  var n = Math.max(banyakAngkaDesimal(a), banyakAngkaDesimal(b));
  var sa = samakanDigitDesimal(a, n);
  var sb = samakanDigitDesimal(b, n);
  var pesan = {
    'nol-akhir':
      'Angka 0 di ujung kanan bagian desimal tidak mengubah nilai. Tulis keduanya dengan banyak angka yang sama: ' +
      sa +
      ' dan ' +
      sb +
      ' — apakah ada angka yang berbeda?',
    'abaikan-bulat':
      'Lihat dulu bagian bulatnya (angka di depan koma). Bagian bulat yang lebih besar menandakan bilangan yang lebih besar, berapa pun angka di belakang koma.',
    'bagian-desimal-bulat':
      'Hati-hati: angka di belakang koma tidak dibaca seperti bilangan bulat, jadi lebih banyak angka belum tentu lebih besar. Samakan dulu banyak angkanya (' +
      sa +
      ' dan ' +
      sb +
      '), lalu bandingkan dari nilai tempat paling kiri.',
    'lebih-pendek':
      'Lebih sedikit angka di belakang koma belum tentu lebih besar. Tulis keduanya dengan banyak angka yang sama (' +
      sa +
      ' dan ' +
      sb +
      '), lalu bandingkan angka pada setiap nilai tempat dari kiri.',
    lain: 'Belum tepat. Bandingkan angka pada setiap nilai tempat mulai dari yang paling kiri sampai kamu menemukan angka yang berbeda.',
  };
  return pesan[kode] || pesan.lain;
}

/*
 * Desimal → bilangan bulat berskala 10^d (titik ke-k pada garis bilangan
 * berjarak 10^−d): skalaDesimal('0,75', 2) → 75, ('3,40', 1) → 34.
 * null bila tidak valid atau punya angka bukan-nol di luar ketelitian d.
 */
function skalaDesimal(str, d) {
  var p = desimalDigits(str);
  if (!p) return null;
  var pecahan = p.pecahan;
  if (pecahan.length > d) {
    if (/[1-9]/.test(pecahan.slice(d))) return null;
    pecahan = pecahan.slice(0, d);
  }
  pecahan = padKananNol(pecahan, d);
  return parseInt(p.bulat, 10) * Math.pow(10, d) + (d ? parseInt(pecahan, 10) : 0);
}

/*
 * Kebalikan skalaDesimal: (34, 1) → "3,4", (70, 2) → "0,7". fixed true
 * mempertahankan d angka di belakang koma: (70, 2, true) → "0,70".
 */
function desimalDariSkala(k, d, fixed) {
  if (!d) return String(k);
  var s = String(Math.abs(k));
  while (s.length < d + 1) s = '0' + s;
  var bulat = s.slice(0, s.length - d);
  var pecahan = s.slice(s.length - d);
  if (!fixed) pecahan = pecahan.replace(/0+$/, '');
  return bulat + (pecahan ? ',' + pecahan : '');
}

/*
 * Petunjuk letak desimal pada garis bilangan berketelitian d:
 *   ('0,75', 2) → "0,75 = 0,7 + 5 perseratusan. Mulai dari titik 0,7, …"
 */
function petunjukLetakDesimal(str, d) {
  var k = skalaDesimal(str, d);
  if (k === null) return '';
  var dasar = Math.floor(k / 10) * 10;
  var langkah = k - dasar;
  var dasarStr = desimalDariSkala(dasar, d);
  if (langkah === 0)
    return str + ' sama dengan ' + dasarStr + '. Cari titik berlabel ' + dasarStr + '.';
  return (
    str +
    ' = ' +
    dasarStr +
    ' + ' +
    langkah +
    ' ' +
    DESIMAL_TEMPAT[d].nama +
    '. Mulai dari titik ' +
    dasarStr +
    ', lalu maju ' +
    langkah +
    ' garis kecil ke kanan.'
  );
}

/*
 * Beberapa bilangan desimal dalam SATU tabel nilai tempat (satu baris per
 * bilangan, kolom sejajar per nilai tempat) untuk dibandingkan kolom demi
 * kolom.
 *   opts.highlight  true → sorot kolom nilai tempat pertama yang berbeda
 *   opts.padZeros   true → tempat desimal yang kosong diisi 0 (tampak
 *                   berbeda) untuk menunjukkan 0,8 = 0,80
 *   opts.minDigits  banyak kolom desimal minimum (default 0)
 *   opts.caption    judul kecil di atas tabel
 */
function buildPlaceValueStack(list, opts) {
  opts = opts || {};
  var rows = list.map(function (s) {
    return { str: s, p: desimalDigits(s) || { bulat: '0', pecahan: '' } };
  });
  var L = 1;
  var n = opts.minDigits || 0;
  rows.forEach(function (r) {
    L = Math.max(L, bulatDesimalNormal(r.p).length);
    n = Math.max(n, r.p.pecahan.length);
  });
  var hl = opts.highlight ? tempatBedaPertamaDaftar(list) : null;
  var posList = [];
  for (var i = 1 - L; i <= n; i++) posList.push(i);

  function cls(pos, extra) {
    var out = 'dec-pv__cell dec-pv__cell--p' + Math.max(0, Math.min(pos, 3));
    if (hl !== null && pos === hl) out += ' dec-pv__cell--hl';
    return out + (extra || '');
  }
  function komaTh() {
    return '<th scope="col" class="dec-pv__cell dec-pv__cell--koma"><span class="sr-only">koma</span></th>';
  }

  var head =
    '<tr><td class="dec-cmp__corner"></td>' +
    posList
      .map(function (pos) {
        return (
          (pos === 1 ? komaTh() : '') +
          '<th scope="col" class="' +
          cls(pos) +
          '">' +
          namaTempatHtml(namaNilaiTempatDesimal(pos)) +
          '</th>'
        );
      })
      .join('') +
    (n === 0 ? komaTh() : '') +
    '</tr>';

  var body = rows
    .map(function (r) {
      var bulat = bulatDesimalNormal(r.p);
      return (
        '<tr class="dec-cmp__row">' +
        '<th scope="row" class="dec-cmp__label">' +
        esc(r.str) +
        '</th>' +
        posList
          .map(function (pos) {
            var koma = pos === 1 ? '<td class="dec-pv__cell dec-pv__cell--koma">,</td>' : '';
            var digit;
            if (pos <= 0) {
              var k = bulat.length - 1 + pos;
              digit = k >= 0 ? bulat.charAt(k) : '';
            } else {
              digit = r.p.pecahan.charAt(pos - 1);
            }
            if (digit !== '') return koma + '<td class="' + cls(pos) + '">' + esc(digit) + '</td>';
            if (pos > 0 && opts.padZeros) {
              return koma + '<td class="' + cls(pos, ' dec-cmp__pad') + '">0</td>';
            }
            return koma + '<td class="' + cls(pos, ' dec-pv__cell--empty') + '"></td>';
          })
          .join('') +
        (n === 0 ? '<td class="dec-pv__cell dec-pv__cell--koma"></td>' : '') +
        '</tr>'
      );
    })
    .join('');

  return (
    '<div class="dec-pv dec-cmp">' +
    (opts.caption ? '<p class="dec-pv__caption">' + esc(opts.caption) + '</p>' : '') +
    '<div class="table-scroll"><table class="dec-pv__table" aria-label="Tabel nilai tempat ' +
    esc(list.slice(0, -1).join(', ') + (list.length > 1 ? ' dan ' : '') + list[list.length - 1]) +
    '"><thead>' +
    head +
    '</thead><tbody>' +
    body +
    '</tbody></table></div></div>'
  );
}

/* buildPlaceValueStack untuk sepasang bilangan a dan b. */
function buildPlaceValueCompare(a, b, opts) {
  return buildPlaceValueStack([a, b], opts);
}

/* Chip bilangan desimal (penulisan asli dipertahankan, mis. "0,50"). */
function buildDecChip(str, big) {
  return '<span class="num-chip' + (big ? ' num-chip--lg' : '') + '">' + esc(str) + '</span>';
}

/* Kalimat perbandingan besar [a] ☐ [b] untuk desimal; symbolId null → '?'. */
function buildCompareSentenceDesimal(a, b, symbolId) {
  return (
    '<div class="cmp-sentence" aria-label="' +
    esc(a + ' ' + (symbolId ? compareSymbolText(symbolId) : 'kotak kosong') + ' ' + b) +
    '">' +
    buildDecChip(a, true) +
    '<span class="cmp-sentence__sym' +
    (symbolId ? ' is-filled' : '') +
    '">' +
    esc(symbolId ? compareSymbolText(symbolId) : '?') +
    '</span>' +
    buildDecChip(b, true) +
    '</div>'
  );
}

/*
 * Garis bilangan desimal (SVG) berjarak 10^−digits antartitik.
 *   id                 id elemen <svg>
 *   opts.min, max      ujung garis (string berkoma atau Number)
 *   opts.digits        1 → langkah 0,1; 2 → langkah 0,01 (default 1)
 *   opts.labelEvery    label setiap kelipatan ini (dalam langkah;
 *                      default 1). Ujung garis selalu berlabel.
 *   opts.fixedLabels   true → label ditulis dengan `digits` angka (0,70)
 *   opts.marks         [{ value, label, tone }] — tone 'ok' | 'bad' |
 *                      'target' | 'pos' (default 'pos')
 *   opts.selected      nilai yang sedang dipilih atau null
 *   opts.zoom          { from, to } — pita sorot ruas yang "diperbesar"
 *   opts.interactive   false → hanya gambar
 *   opts.aria          label aksesibel
 * Titik yang bisa diketuk membawa data-nl-value berupa string desimal
 * tanpa 0 di akhir ("0,7", "0,75"). Pasang event dengan
 * bindDecimalNumberLine().
 */
function buildDecimalNumberLine(id, opts) {
  opts = opts || {};
  var d = opts.digits || 1;
  var kMin = skalaDesimal(String(opts.min !== undefined ? opts.min : 0), d);
  var kMax = skalaDesimal(String(opts.max !== undefined ? opts.max : 1), d);
  var every = opts.labelEvery || 1;
  var interactive = opts.interactive !== false;
  var marks = opts.marks || [];
  var unit = opts.unit || 54;
  var padX = 40;
  var H = 116;
  var axisY = 70;
  var W = padX * 2 + (kMax - kMin) * unit;
  function xOf(k) {
    return padX + (k - kMin) * unit;
  }

  var html = '';
  if (opts.zoom) {
    var z0 = skalaDesimal(String(opts.zoom.from), d);
    var z1 = skalaDesimal(String(opts.zoom.to), d);
    if (z0 !== null && z1 !== null) {
      html +=
        '<rect class="nlp-zoom" x="' +
        (xOf(z0) - 6) +
        '" y="' +
        (axisY - 18) +
        '" width="' +
        (xOf(z1) - xOf(z0) + 12) +
        '" height="36" rx="8"/>';
    }
  }

  var x0 = xOf(kMin) - 24;
  var x1 = xOf(kMax) + 24;
  html +=
    '<line class="nlp-axis" x1="' +
    x0 +
    '" y1="' +
    axisY +
    '" x2="' +
    x1 +
    '" y2="' +
    axisY +
    '"/>' +
    '<polygon class="nlp-arrow" points="' +
    (x1 + 4) +
    ',' +
    axisY +
    ' ' +
    (x1 - 8) +
    ',' +
    (axisY - 6) +
    ' ' +
    (x1 - 8) +
    ',' +
    (axisY + 6) +
    '"/>';

  for (var k = kMin; k <= kMax; k++) {
    var x = xOf(k);
    var major = k % 10 === 0;
    var berlabel = k === kMin || k === kMax || (k - kMin) % every === 0;
    var nilai = desimalDariSkala(k, d);
    var label = desimalDariSkala(k, d, opts.fixedLabels);
    var h = major ? 14 : 8;
    var tick =
      '<line class="nlp-tick' +
      (major ? ' nlp-tick--major' : '') +
      '" x1="' +
      x +
      '" y1="' +
      (axisY - h) +
      '" x2="' +
      x +
      '" y2="' +
      (axisY + h) +
      '"/>' +
      (berlabel
        ? '<text class="nlp-num nlp-num--dec' +
          (major ? ' nlp-num--major' : '') +
          '" x="' +
          x +
          '" y="' +
          (axisY + 34) +
          '">' +
          esc(label) +
          '</text>'
        : '');
    if (interactive) {
      html +=
        '<g class="nlp-hit' +
        (opts.selected !== undefined && opts.selected !== null && opts.selected === nilai
          ? ' is-selected'
          : '') +
        '" role="button" tabindex="0" data-nl-value="' +
        esc(nilai) +
        '" aria-label="Titik ' +
        esc(label) +
        '">' +
        '<rect class="nlp-hit__area" x="' +
        (x - unit / 2) +
        '" y="22" width="' +
        unit +
        '" height="' +
        (H - 22) +
        '"/>' +
        '<circle class="nlp-hit__ring" cx="' +
        x +
        '" cy="' +
        axisY +
        '" r="13"/>' +
        tick +
        '</g>';
    } else {
      html += tick;
    }
  }

  marks.forEach(function (m) {
    var mk = skalaDesimal(String(m.value), d);
    if (mk === null || mk < kMin || mk > kMax) return;
    var mx = xOf(mk);
    html +=
      '<g class="nlp-mark nlp-mark--' +
      (m.tone || 'pos') +
      '">' +
      '<circle cx="' +
      mx +
      '" cy="' +
      axisY +
      '" r="9"/>' +
      (m.label !== undefined && m.label !== ''
        ? '<text class="nlp-mark__label" x="' +
          mx +
          '" y="' +
          (axisY - 20) +
          '">' +
          esc(m.label) +
          '</text>'
        : '') +
      '</g>';
  });

  return (
    '<div class="nlp-wrap">' +
    '<svg class="nlp nlp--dec' +
    (interactive ? ' nlp--interactive' : '') +
    '" id="' +
    id +
    '" data-zero="" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" style="min-width:' +
    Math.round(W * 0.62) +
    'px" ' +
    (interactive ? 'role="group"' : 'role="img"') +
    ' aria-label="' +
    esc(
      opts.aria ||
        'Garis bilangan desimal dari ' +
          desimalDariSkala(kMin, d) +
          ' sampai ' +
          desimalDariSkala(kMax, d) +
          ', setiap langkah ' +
          desimalDariSkala(1, d)
    ) +
    '">' +
    html +
    '</svg>' +
    '</div>'
  );
}

/* onPick(nilai) menerima string desimal titik yang diketuk. */
function bindDecimalNumberLine(root, id, onPick) {
  bindNumberLinePicker(root, id, onPick, function (raw) {
    return raw;
  });
}

/*
 * Aktivitas menempatkan desimal satu per satu pada garis bilangan
 * desimal. State memakai ensureNumberLinePlacementState() (bagian 11).
 *   items  [{ value: '0,75', teks?, mark? }] dalam urutan tampil (acak)
 *   cfg    { min, max, digits, labelEvery, fixedLabels, zoom, doneText }
 * Ketukan salah kedua dst. memunculkan petunjukLetakDesimal().
 */
function buildDecimalPlacement(pid, items, st, cfg) {
  cfg = cfg || {};
  var d = cfg.digits || 1;
  var done = numberLinePlacementDone(items, st);
  var marks = items.slice(0, Math.min(st.idx, items.length)).map(function (it) {
    return { value: it.value, label: it.mark !== undefined ? it.mark : it.value, tone: 'ok' };
  });
  var adaSalah = !done && st.salah !== null && st.salah !== undefined;
  if (adaSalah) marks.push({ value: st.salah, label: st.salah + '?', tone: 'bad' });

  var head = '';
  var feedback = '';
  if (done) {
    feedback = buildFeedbackBox(
      'success',
      '✓',
      cfg.doneText || '<strong>Semua bilangan sudah menempati titik yang tepat.</strong>'
    );
  } else {
    var target = items[st.idx];
    head =
      '<div class="place-target">' +
      '<span class="place-target__count">Bilangan ' +
      (st.idx + 1) +
      ' dari ' +
      items.length +
      '</span>' +
      '<span>Ketuk letak ' +
      buildDecChip(target.value, true) +
      (target.teks ? ' <span class="dl-caption">(' + esc(target.teks) + ')</span>' : '') +
      '</span>' +
      '</div>';
    if (adaSalah) {
      var nSalah = st.wrong[st.idx] || 0;
      feedback = buildFeedbackBox(
        'warning',
        '💭',
        'Titik yang kamu ketuk adalah <strong>' +
          esc(st.salah) +
          '</strong>, bukan ' +
          esc(target.value) +
          '. ' +
          esc(
            nSalah >= 2
              ? petunjukLetakDesimal(target.value, d)
              : 'Periksa lagi: ' +
                  target.value +
                  ' terletak di antara dua label yang mana? Hitung garis kecilnya dari label yang lebih kecil.'
          )
      );
    }
  }

  return (
    head +
    buildDecimalNumberLine(pid, {
      min: cfg.min,
      max: cfg.max,
      digits: d,
      labelEvery: cfg.labelEvery,
      fixedLabels: cfg.fixedLabels,
      zoom: cfg.zoom,
      marks: marks,
      interactive: !done,
    }) +
    feedback
  );
}

function bindDecimalPlacement(root, pid, items, st, save, rerender) {
  bindDecimalNumberLine(root, pid, function (v) {
    if (numberLinePlacementDone(items, st)) return;
    if (bandingkanDesimal(v, items[st.idx].value) === 0) {
      st.idx += 1;
      st.salah = null;
    } else {
      st.salah = v;
      st.wrong[st.idx] = (st.wrong[st.idx] || 0) + 1;
    }
    save();
    rerender();
  });
}

/* ============================================================
   21. DERET ARITMETIKA & GEOMETRI: SUKU & JUMLAH n SUKU
   Rumus suku ke-n dan jumlah n suku pertama kedua jenis deret,
   pengenal jenis deret, serta komponen visual untuk menemukan
   dan menguji rumus Sₙ:
     • tabel isian deret (Uₙ/Sₙ; sebagian kolom diisi murid),
     • grid "kalikan r, geser, kurangkan" (bukti Sₙ geometri),
     • tabel uji rumus (jumlah manual vs hasil rumus).
   Gaya .series-fill*, .shift-*, .series-check* ada di
   shared/base.css.
   ============================================================ */

/* Uₙ = a + (n − 1)b */
function sukuAritmetika(a, b, n) {
  return a + (n - 1) * b;
}

/* Sₙ = n/2 × (2a + (n − 1)b) */
function jumlahAritmetika(a, b, n) {
  return (n * (2 * a + (n - 1) * b)) / 2;
}

/* Uₙ = a·rⁿ⁻¹ */
function sukuGeometri(a, r, n) {
  return a * Math.pow(r, n - 1);
}

/*
 * Sₙ = a(rⁿ − 1)/(r − 1) untuk r ≠ 1, dan Sₙ = n·a untuk r = 1.
 * Hasil yang hampir bulat (galat biner r pecahan, mis. r = ⅓)
 * dibulatkan agar cocok dengan kunci jawaban bilangan bulat.
 */
function jumlahGeometri(a, r, n) {
  if (hampirSama(r, 1)) return n * a;
  var s = (a * (Math.pow(r, n) - 1)) / (r - 1);
  var bulat = Math.round(s);
  return hampirSama(s, bulat) ? bulat : s;
}

/*
 * Daftar n suku pertama. jenis 'aritmetika' → `beda` adalah b,
 * jenis 'geometri' → `beda` adalah rasio r.
 */
function daftarSuku(jenis, a, beda, n) {
  var out = [];
  for (var k = 1; k <= n; k++) {
    out.push(jenis === 'geometri' ? sukuGeometri(a, beda, k) : sukuAritmetika(a, beda, k));
  }
  return out;
}

/* Jumlah berjalan: [U₁, U₂, …] → [S₁, S₂, …]. */
function jumlahBerjalan(terms) {
  var out = [];
  var s = 0;
  for (var i = 0; i < terms.length; i++) {
    s += terms[i];
    out.push(s);
  }
  return out;
}

/*
 * Jenis barisan dari suku-sukunya: 'konstan' (semua suku sama),
 * 'aritmetika' (selisih tetap), 'geometri' (rasio tetap, tanpa suku 0),
 * atau 'bukan'. Minimal dua suku.
 */
function jenisDeret(terms) {
  if (!terms || terms.length < 2) return 'bukan';
  var d = terms[1] - terms[0];
  var aritmetika = true;
  for (var i = 2; i < terms.length; i++) {
    if (!hampirSama(terms[i] - terms[i - 1], d)) aritmetika = false;
  }
  if (aritmetika) return hampirSama(d, 0) ? 'konstan' : 'aritmetika';
  if (
    terms.some(function (t) {
      return hampirSama(t, 0);
    })
  ) {
    return 'bukan';
  }
  var r = terms[1] / terms[0];
  for (var j = 2; j < terms.length; j++) {
    if (!hampirSama(terms[j] / terms[j - 1], r)) return 'bukan';
  }
  return 'geometri';
}

/* Angka → karakter subskrip (12 → '₁₂'), untuk label Uₙ/Sₙ. */
function subskrip(n) {
  var subs = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  return String(n)
    .split('')
    .map(function (d) {
      return subs[+d] || d;
    })
    .join('');
}

/*
 * Tabel isian deret: kolom pertama n = 1, 2, …; kolom lain dari `columns`.
 *   columns  [{ id, label, values: [..], editable, parse }] — kolom editable
 *            diisi murid (jawaban benar = values[i]); lainnya ditampilkan.
 *            `parse` opsional: pembaca isian pengganti, mis. parseInputAngka
 *            agar 'Rp2.120.000' diterima
 *   inputs   { <colId>: ['isian', …] } — isian murid per kolom editable
 *   opts.checked  true → tandai sel terisi dengan ✓/✗
 *   opts.locked   true → isian dinonaktifkan (mis. setelah semua benar)
 *   opts.format   function(v) → teks nilai tetap (default formatNumber)
 *   opts.caption  teks aksesibel tabel
 * Tanpa `parse`, isian dibaca dengan parseInputInt(…, true) sehingga pemisah ribuan
 * (6.200.000) diterima.
 */
function seriesFillCellCorrect(col, inputs, i) {
  var val = inputs && inputs[col.id] ? inputs[col.id][i] : '';
  var parsed = col.parse ? col.parse(String(val || '')) : parseInputInt(String(val || ''), true);
  return !parsed.error && hampirSama(parsed.value, col.values[i]);
}

function seriesFillTableAllCorrect(columns, inputs) {
  return columns.every(function (col) {
    if (!col.editable) return true;
    return col.values.every(function (v, i) {
      return seriesFillCellCorrect(col, inputs, i);
    });
  });
}

function buildSeriesFillTable(id, columns, inputs, opts) {
  opts = opts || {};
  inputs = inputs || {};
  var fmtV =
    opts.format ||
    function (v) {
      return formatNumber(v, '−');
    };
  var rows = columns[0].values.length;
  var head =
    '<tr><th scope="col">n</th>' +
    columns
      .map(function (c) {
        return '<th scope="col">' + c.label + '</th>';
      })
      .join('') +
    '</tr>';
  var body = '';
  for (var i = 0; i < rows; i++) {
    body += '<tr><th scope="row">' + (i + 1) + '</th>';
    columns.forEach(function (c) {
      if (!c.editable) {
        body += '<td class="series-fill__given">' + esc(fmtV(c.values[i])) + '</td>';
        return;
      }
      var val = inputs[c.id] ? inputs[c.id][i] || '' : '';
      var dinilai = opts.checked && String(val).trim() !== '';
      var ok = dinilai && seriesFillCellCorrect(c, inputs, i);
      body +=
        '<td class="series-fill__cell' +
        (dinilai ? (ok ? ' sel--ok' : ' sel--no') : '') +
        '">' +
        '<input type="text" inputmode="numeric" autocomplete="off" class="input-text series-fill__input"' +
        ' data-fill-id="' +
        esc(id) +
        '" data-fill-col="' +
        esc(c.id) +
        '" data-idx="' +
        i +
        '" value="' +
        esc(val) +
        '" aria-label="' +
        esc(c.label.replace(/<[^>]*>/g, '') + ' untuk n = ' + (i + 1)) +
        '"' +
        (opts.locked ? ' disabled' : '') +
        '>' +
        (dinilai
          ? ok
            ? '<span class="series-fill__mark series-fill__mark--ok" aria-label="benar">✓</span>'
            : '<span class="series-fill__mark series-fill__mark--no" aria-label="salah">✗</span>'
          : '') +
        '</td>';
    });
    body += '</tr>';
  }
  return (
    '<div class="series-fill" id="' +
    esc(id) +
    '">' +
    '<table class="series-fill__table"' +
    (opts.caption ? ' aria-label="' + esc(opts.caption) + '"' : '') +
    '>' +
    '<thead>' +
    head +
    '</thead><tbody>' +
    body +
    '</tbody></table></div>'
  );
}

/*
 * Memasang isian buildSeriesFillTable: setiap ketikan disimpan ke
 * inputs[col][i]; Enter memanggil onEnter() (mis. klik tombol Periksa).
 */
function bindSeriesFillTable(root, id, inputs, save, onEnter) {
  root.querySelectorAll('[data-fill-id="' + id + '"]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var col = inp.dataset.fillCol;
      if (!Array.isArray(inputs[col])) inputs[col] = [];
      inputs[col][+inp.dataset.idx] = inp.value;
      save();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && onEnter) onEnter();
    });
  });
}

/*
 * Grid "kalikan r, geser, kurangkan" untuk membuktikan Sₙ geometri.
 * Baris atas Sₙ = U₁ + … + Uₙ (kolom 0..n−1), baris bawah r·Sₙ yang
 * bergeser satu kolom (kolom 1..n). Kolom 1..n−1 berisi pasangan kembar
 * yang diketuk untuk dicoret; setelah semua tercoret tampil hasil
 * r·Sₙ − Sₙ = r·Uₙ − U₁.
 *   terms   suku-suku deret (bilangan)
 *   r       rasio
 *   struck  array boolean sepanjang n − 1 (indeks = kolom − 1)
 *   opts.label   label jumlah, mis. 'S₅' (default 'Sₙ')
 *   opts.format  function(v) → teks nilai (default formatNumber)
 */
function shiftGridAllStruck(struck) {
  return (
    Array.isArray(struck) &&
    struck.every(function (c) {
      return c;
    })
  );
}

function buildShiftSubtractGrid(id, terms, r, struck, opts) {
  opts = opts || {};
  var label = opts.label || 'Sₙ';
  var rLabel = formatRatio(r) + label;
  var fmtV =
    opts.format ||
    function (v) {
      return formatNumber(v, '−');
    };
  var n = terms.length;
  var semua = shiftGridAllStruck(struck);

  function cell(val, col) {
    if (val === null) {
      return '<span class="shift-cell shift-cell--empty" aria-hidden="true"></span>';
    }
    var kembar = col >= 1 && col <= n - 1;
    if (!kembar) {
      return (
        '<span class="shift-cell' +
        (semua ? ' shift-cell--rest' : '') +
        '">' +
        fmtV(val) +
        '</span>'
      );
    }
    var coret = !!struck[col - 1];
    return (
      '<button type="button" class="shift-cell shift-cell--pair' +
      (coret ? ' is-struck' : '') +
      '" data-shift-id="' +
      esc(id) +
      '" data-shift-coret="' +
      (col - 1) +
      '" aria-pressed="' +
      coret +
      '" aria-label="' +
      (coret ? 'Sudah dicoret: ' : 'Coret pasangan ') +
      esc(fmtV(val)) +
      '"' +
      (coret ? ' disabled' : '') +
      '>' +
      fmtV(val) +
      '</button>'
    );
  }

  function row(rowLabel, slots, cls) {
    var html = '<div class="shift-row' + (cls ? ' ' + cls : '') + '">';
    html += '<span class="shift-row__label">' + esc(rowLabel) + '</span>';
    for (var c = 0; c <= n; c++) {
      if (c > 0) {
        var op = slots[c - 1] !== null && slots[c] !== null ? '+' : '';
        html += '<span class="shift-op" aria-hidden="true">' + op + '</span>';
      }
      html += cell(slots[c], c);
    }
    return html + '</div>';
  }

  var atas = terms.concat([null]);
  var bawah = [null].concat(
    terms.map(function (t) {
      return t * r;
    })
  );
  var terakhir = terms[n - 1] * r;

  return (
    '<div class="shift-grid" id="' +
    esc(id) +
    '" role="group" aria-label="' +
    esc('Deret ' + label + ' dan ' + rLabel + ' yang bergeser satu kolom') +
    '">' +
    row(label + ' =', atas) +
    row(rLabel + ' =', bawah, 'shift-row--times') +
    (semua
      ? '<div class="shift-result">' +
        esc(rLabel) +
        ' − ' +
        esc(label) +
        ' = <strong>' +
        fmtV(terakhir) +
        '</strong> − <strong>' +
        fmtV(terms[0]) +
        '</strong></div>'
      : '') +
    '</div>'
  );
}

function bindShiftSubtractGrid(root, id, struck, save, rerender) {
  root.querySelectorAll('[data-shift-id="' + id + '"][data-shift-coret]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      struck[+btn.dataset.shiftCoret] = true;
      save();
      rerender();
    });
  });
}

/*
 * Tabel uji rumus: jumlah suku satu per satu vs hasil rumus.
 *   rows          [{ n, manual, rumus }]
 *   opts.format   function(v) → teks nilai (default formatNumber)
 *   opts.manualLabel, opts.rumusLabel  judul kolom
 *   opts.caption  teks aksesibel tabel
 */
function buildSeriesCheckTable(rows, opts) {
  opts = opts || {};
  var fmtV =
    opts.format ||
    function (v) {
      return formatNumber(v, '−');
    };
  return (
    '<div class="series-check">' +
    '<table class="series-check__table"' +
    (opts.caption ? ' aria-label="' + esc(opts.caption) + '"' : '') +
    '>' +
    '<thead><tr><th scope="col">n</th><th scope="col">' +
    esc(opts.manualLabel || 'Dijumlah satu per satu') +
    '</th><th scope="col">' +
    esc(opts.rumusLabel || 'Hasil rumus') +
    '</th><th scope="col">Cocok?</th></tr></thead><tbody>' +
    rows
      .map(function (r) {
        var ok = hampirSama(r.manual, r.rumus);
        return (
          '<tr><th scope="row">' +
          r.n +
          '</th><td>' +
          esc(fmtV(r.manual)) +
          '</td><td>' +
          esc(fmtV(r.rumus)) +
          '</td><td>' +
          (ok
            ? '<span class="series-check__ok" aria-label="cocok">✓</span>'
            : '<span class="series-check__no" aria-label="tidak cocok">✗</span>') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

/* ============================================================
   22. BUNGA TUNGGAL: BARISAN & DERET ARITMETIKA PADA MODAL
   Bunga tunggal selalu dihitung dari modal awal M₀, sehingga
     • bunga tiap periode tetap: M₀ × i,
     • total bunga n periode (deret aritmetika dengan b = 0):
       Bₙ = M₀ × i × n,
     • saldo M₀, M₁, M₂, … barisan aritmetika dengan a = M₀ dan
       b = M₀ × i, sehingga Mₙ = U₍ₙ₊₁₎ = M₀(1 + n × i).
   Suku bunga i ditulis dalam desimal (6% → 0,06). Juga memuat
   format persen/rupiah, pembaca isian angka gaya Indonesia, dan
   tabel "buku tabungan". Gaya .passbook* ada di shared/base.css.
   ============================================================ */

/* Nilai uang yang hampir bulat (galat biner i desimal) dibulatkan. */
function bulatkanUang(v) {
  var bulat = Math.round(v);
  return hampirSama(v, bulat) ? bulat : v;
}

/* Bₙ = M₀ × i × n */
function bungaTunggal(M0, i, n) {
  return bulatkanUang(M0 * i * n);
}

/* Mₙ = M₀ + Bₙ = M₀(1 + n × i) */
function nilaiAkhirBungaTunggal(M0, i, n) {
  return bulatkanUang(M0 + M0 * i * n);
}

/*
 * Barisan saldo [M₀, M₁, …, Mₙ] (n + 1 suku). Ditulis lewat
 * sukuAritmetika(M₀, M₀·i, k + 1) agar kaitannya dengan barisan
 * aritmetika (a = M₀, b = M₀·i) terlihat jelas.
 */
function saldoBungaTunggal(M0, i, n) {
  var out = [];
  for (var k = 0; k <= n; k++) out.push(bulatkanUang(sukuAritmetika(M0, M0 * i, k + 1)));
  return out;
}

/* 6 → 0,06 */
function persenKeDesimal(p) {
  return p / 100;
}

/* 0,005 → '0,5%' */
function formatPersen(i) {
  return formatDesimal(i * 100, 3) + '%';
}

/* 2120000 → 'Rp2.120.000'; nilai negatif → '−Rp50.000'. */
function formatRupiah(n) {
  return (n < 0 ? '−' : '') + 'Rp' + formatNumber(Math.abs(n));
}

/*
 * Membaca isian angka gaya Indonesia untuk soal uang & persen:
 *   '2.600.000', 'Rp2.600.000', '120 000' → bilangan bulat (titik = ribuan)
 *   '0,5', '1,5%', '1.234,5'              → desimal (koma = desimal)
 *   '0.5'                                  → 0,5 (titik tanpa pola ribuan)
 * Awalan 'Rp' dan akhiran '%' diabaikan. Kembalian { value, error }
 * seperti parseInputInt.
 */
function parseInputAngka(str) {
  if (!str || String(str).trim() === '') return { value: null, error: 'empty' };
  var s = String(str)
    .trim()
    .replace(/^rp\.?/i, '')
    .replace(/%$/, '')
    .replace(/\s/g, '')
    .replace(/−/g, '-');
  if (s === '') return { value: null, error: 'invalid' };
  if (s.indexOf(',') !== -1) {
    if ((s.match(/,/g) || []).length > 1) return { value: null, error: 'invalid' };
    if (!/^-?\d{1,3}(\.\d{3})*,\d+$/.test(s) && !/^-?\d*,\d+$/.test(s)) {
      return { value: null, error: 'invalid' };
    }
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '');
  }
  if (!/^-?\d*\.?\d+$/.test(s)) return { value: null, error: 'invalid' };
  var v = parseFloat(s);
  if (isNaN(v)) return { value: null, error: 'invalid' };
  return { value: v, error: null };
}

/*
 * Tabel "buku tabungan": kolom Periode, Bunga, dan Saldo.
 *   rows  [{ label, bunga, saldo, sorot }] — bunga/saldo berupa angka,
 *         null (ditulis '—'), atau teks (mis. '?' → sel tersembunyi);
 *         { jeda: true } → baris '⋮' penanda periode yang dilewati
 *   opts.judul        judul kartu (teks)
 *   opts.caption      teks aksesibel tabel
 *   opts.format       function(v) → teks nilai (default formatRupiah)
 *   opts.periodeLabel judul kolom periode (default 'Periode')
 */
function buildBukuTabungan(rows, opts) {
  opts = opts || {};
  var fmtV = opts.format || formatRupiah;

  function sel(v) {
    if (v === null || v === undefined) return '<td class="passbook__muted">—</td>';
    if (typeof v !== 'number')
      return '<td><span class="passbook__hidden">' + esc(v) + '</span></td>';
    return '<td>' + esc(fmtV(v)) + '</td>';
  }

  var body = rows
    .map(function (r) {
      if (r.jeda) {
        return '<tr class="passbook__row--gap"><td colspan="3" aria-label="periode berikutnya dilewati">⋮</td></tr>';
      }
      return (
        '<tr' +
        (r.sorot ? ' class="passbook__row--hl"' : '') +
        '><th scope="row">' +
        esc(r.label) +
        '</th>' +
        sel(r.bunga) +
        sel(r.saldo) +
        '</tr>'
      );
    })
    .join('');

  return (
    '<div class="passbook">' +
    (opts.judul
      ? '<div class="passbook__head"><span aria-hidden="true">📒</span> ' +
        esc(opts.judul) +
        '</div>'
      : '') +
    '<div class="passbook__scroll"><table class="passbook__table"' +
    (opts.caption ? ' aria-label="' + esc(opts.caption) + '"' : '') +
    '><thead><tr><th scope="col">' +
    esc(opts.periodeLabel || 'Periode') +
    '</th><th scope="col">Bunga</th><th scope="col">Saldo</th></tr></thead><tbody>' +
    body +
    '</tbody></table></div></div>'
  );
}

/* ============================================================
   23. BUNGA MAJEMUK: BARISAN & DERET GEOMETRI PADA MODAL
   Bunga majemuk dihitung dari saldo periode sebelumnya
   (bunga berbunga), sehingga
     • saldo M₀, M₁, M₂, … barisan geometri dengan a = M₀ dan
       r = 1 + i, sehingga Mₙ = U₍ₙ₊₁₎ = M₀(1 + i)ⁿ,
     • bunga tiap periode M₀i, M₀i(1 + i), … juga barisan geometri,
       dan total bunga = deret geometri = Mₙ − M₀.
   Pemajemukan m kali setahun: i = p% : m dan n = t × m.
   Juga memuat simulator bunga majemuk (tombol −/+ untuk modal,
   suku bunga, dan banyak periode). Gaya .compound-sim* ada di
   shared/base.css.
   ============================================================ */

/* Mₙ = M₀(1 + i)ⁿ */
function nilaiAkhirBungaMajemuk(M0, i, n) {
  return bulatkanUang(M0 * Math.pow(1 + i, n));
}

/* Total bunga n periode = Mₙ − M₀ */
function bungaMajemuk(M0, i, n) {
  return bulatkanUang(M0 * Math.pow(1 + i, n) - M0);
}

/*
 * Barisan saldo [M₀, M₁, …, Mₙ] (n + 1 suku). Ditulis lewat
 * sukuGeometri(M₀, 1 + i, k + 1) agar kaitannya dengan barisan
 * geometri (a = M₀, r = 1 + i) terlihat jelas.
 */
function saldoBungaMajemuk(M0, i, n) {
  var out = [];
  for (var k = 0; k <= n; k++) out.push(bulatkanUang(sukuGeometri(M0, 1 + i, k + 1)));
  return out;
}

/* Bunga periode ke-1 … ke-n: barisan geometri a = M₀·i, r = 1 + i. */
function bungaPeriodeMajemuk(M0, i, n) {
  var out = [];
  for (var k = 1; k <= n; k++) out.push(bulatkanUang(sukuGeometri(M0 * i, 1 + i, k)));
  return out;
}

/*
 * Pemajemukan `kaliSetahun` kali per tahun selama `tahun` tahun:
 * suku bunga per periode i = persenTahun% : kaliSetahun dan
 * banyak periode n = tahun × kaliSetahun.
 */
function konversiPeriode(persenTahun, kaliSetahun, tahun) {
  return { i: persenTahun / 100 / kaliSetahun, n: tahun * kaliSetahun };
}

/* Nilai uang dibulatkan ke rupiah terdekat. */
function bulatkanRupiah(v) {
  return Math.round(v);
}

/*
 * Simulator bunga majemuk.
 *   opts.modal          [M₀ …] pilihan modal awal (rupiah)
 *   opts.persen         [p …]  pilihan suku bunga per periode (persen)
 *   opts.maxN           banyak periode terbesar (default 8)
 *   opts.periode        nama satuan periode (default 'Tahun')
 *   opts.bandingTunggal true → tambah kolom saldo bunga tunggal
 * State (makeCompoundSimState): { mIdx, pIdx, n, ubah } — `ubah`
 * menghitung perubahan yang benar-benar terjadi, sehingga app dapat
 * mensyaratkan murid bereksplorasi sebelum lanjut.
 */
function makeCompoundSimState() {
  return { mIdx: 0, pIdx: 0, n: 1, ubah: 0 };
}

function compoundSimBatas(key, opts) {
  if (key === 'm') return { min: 0, max: opts.modal.length - 1 };
  if (key === 'p') return { min: 0, max: opts.persen.length - 1 };
  return { min: 1, max: opts.maxN || 8 };
}

function compoundSimField(key) {
  return key === 'm' ? 'mIdx' : key === 'p' ? 'pIdx' : 'n';
}

/* Mengubah satu pengatur sebesar `step`; mengembalikan true bila berubah. */
function ubahCompoundSim(st, key, step, opts) {
  var b = compoundSimBatas(key, opts);
  var f = compoundSimField(key);
  var baru = Math.min(b.max, Math.max(b.min, st[f] + step));
  if (baru === st[f]) return false;
  st[f] = baru;
  st.ubah = (st.ubah || 0) + 1;
  return true;
}

function buildCompoundSimulator(id, st, opts) {
  var M0 = opts.modal[st.mIdx];
  var persen = opts.persen[st.pIdx];
  var i = persen / 100;
  var periode = opts.periode || 'Tahun';

  function pengatur(key, label, teks) {
    var b = compoundSimBatas(key, opts);
    var v = st[compoundSimField(key)];
    function tombol(step, simbol, aria) {
      var mentok = step < 0 ? v <= b.min : v >= b.max;
      return (
        '<button type="button" class="compound-sim__btn" data-sim-id="' +
        esc(id) +
        '" data-sim-key="' +
        key +
        '" data-sim-step="' +
        step +
        '" aria-label="' +
        esc(aria) +
        '"' +
        (mentok ? ' disabled' : '') +
        '>' +
        simbol +
        '</button>'
      );
    }
    return (
      '<div class="compound-sim__ctrl">' +
      '<span class="compound-sim__ctrl-label">' +
      esc(label) +
      '</span>' +
      '<div class="compound-sim__stepper">' +
      tombol(-1, '−', 'Kurangi ' + label) +
      '<span class="compound-sim__val">' +
      esc(teks) +
      '</span>' +
      tombol(1, '+', 'Tambah ' + label) +
      '</div>' +
      '</div>'
    );
  }

  var saldo = saldoBungaMajemuk(M0, i, st.n);
  var bunga = bungaPeriodeMajemuk(M0, i, st.n);
  var rows = '';
  for (var k = 0; k <= st.n; k++) {
    rows +=
      '<tr' +
      (k === st.n ? ' class="passbook__row--hl"' : '') +
      '><th scope="row">' +
      esc(periode + ' ' + k) +
      '</th>' +
      (k === 0
        ? '<td class="passbook__muted">—</td>'
        : '<td>' + esc(formatRupiah(bulatkanRupiah(bunga[k - 1]))) + '</td>') +
      '<td>' +
      esc(formatRupiah(bulatkanRupiah(saldo[k]))) +
      '</td>' +
      (k === 0
        ? '<td class="passbook__muted">—</td>'
        : '<td class="compound-sim__ratio">×' + esc(formatRatio(1 + i)) + '</td>') +
      (opts.bandingTunggal
        ? '<td class="compound-sim__tunggal">' +
          esc(formatRupiah(bulatkanRupiah(nilaiAkhirBungaTunggal(M0, i, k)))) +
          '</td>'
        : '') +
      '</tr>';
  }

  return (
    '<div class="compound-sim" id="' +
    esc(id) +
    '">' +
    '<div class="compound-sim__controls">' +
    pengatur('m', 'Modal awal M₀', formatRupiah(M0)) +
    pengatur('p', 'Suku bunga i', formatDesimal(persen, 2) + '%') +
    pengatur('n', 'Banyak periode n', String(st.n)) +
    '</div>' +
    '<div class="passbook compound-sim__book" aria-live="polite">' +
    '<div class="passbook__scroll"><table class="passbook__table" aria-label="' +
    esc('Simulasi bunga majemuk ' + formatDesimal(persen, 2) + '% selama ' + st.n + ' periode') +
    '"><thead><tr><th scope="col">Periode</th><th scope="col">Bunga (majemuk)</th>' +
    '<th scope="col">Saldo Mₙ</th><th scope="col">Mₙ : Mₙ₋₁</th>' +
    (opts.bandingTunggal ? '<th scope="col">Saldo jika bunga tunggal</th>' : '') +
    '</tr></thead><tbody>' +
    rows +
    '</tbody></table></div></div>' +
    '<p class="compound-sim__summary">M' +
    subskrip(st.n) +
    ' = ' +
    esc(formatRupiah(M0)) +
    ' × (1 + ' +
    esc(formatDesimal(i, 4)) +
    ')' +
    '<sup>' +
    st.n +
    '</sup> ≈ <strong>' +
    esc(formatRupiah(bulatkanRupiah(saldo[st.n]))) +
    '</strong></p>' +
    '</div>'
  );
}

/* Memasang tombol −/+ simulator; `save` lalu `rerender` dipanggil setelah berubah. */
function bindCompoundSimulator(root, id, st, opts, save, rerender) {
  root.querySelectorAll('[data-sim-id="' + id + '"][data-sim-key]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ubahCompoundSim(st, btn.dataset.simKey, +btn.dataset.simStep, opts)) {
        save();
        rerender();
      }
    });
  });
}

/* ============================================================
   24. PERBANDINGAN BUNGA TUNGGAL & BUNGA MAJEMUK
   Membandingkan dua tawaran dengan modal awal sama:
     • bunga tunggal  Mₙ = M₀(1 + n × i)  → saldo naik tetap
       (barisan aritmetika),
     • bunga majemuk  Mₙ = M₀(1 + i)ⁿ     → saldo naik makin cepat
       (barisan geometri).
   Suku bunga tunggal yang lebih tinggi bisa unggul di awal, tetapi
   bunga majemuk akhirnya menyalip. Tawaran "terbaik" bergantung pada
   tujuan: menabung → saldo terbesar, meminjam → total bayar terkecil.
   Juga memuat komponen "duel tawaran" (tombol −/+ banyak periode,
   dua kartu saldo berdampingan, penanda unggul, selisih, grafik
   opsional). Gaya .interest-duel* ada di shared/base.css.
   ============================================================ */

/* Saldo kedua jenis bunga pada periode n beserta selisih & yang unggul. */
function bandingTawaran(M0, iTunggal, iMajemuk, n) {
  var t = nilaiAkhirBungaTunggal(M0, iTunggal, n);
  var m = nilaiAkhirBungaMajemuk(M0, iMajemuk, n);
  var sama = hampirSama(t, m);
  return {
    tunggal: t,
    majemuk: m,
    selisih: sama ? 0 : bulatkanUang(Math.abs(m - t)),
    unggul: sama ? 'sama' : m > t ? 'majemuk' : 'tunggal',
  };
}

/* Periode pertama (1..maxN) saat saldo majemuk > saldo tunggal; null bila belum. */
function periodeMenyalip(M0, iTunggal, iMajemuk, maxN) {
  for (var n = 1; n <= maxN; n++) {
    if (bandingTawaran(M0, iTunggal, iMajemuk, n).unggul === 'majemuk') return n;
  }
  return null;
}

/* Saldo akhir (atau total pinjaman) satu tawaran { jenis, M0, i } setelah n periode. */
function nilaiTawaran(t, n) {
  return t.jenis === 'majemuk'
    ? nilaiAkhirBungaMajemuk(t.M0, t.i, n)
    : nilaiAkhirBungaTunggal(t.M0, t.i, n);
}

/*
 * Tawaran terbaik setelah n periode.
 *   list    [{ id, jenis: 'tunggal'|'majemuk', M0, i }]
 *   tujuan  'simpan' → nilai terbesar (menabung/investasi),
 *           'pinjam' → nilai terkecil (total yang harus dibayar)
 * Mengembalikan { id, nilai }.
 */
function tawaranTerbaik(list, n, tujuan) {
  var best = null;
  list.forEach(function (t) {
    var v = nilaiTawaran(t, n);
    var lebihBaik = !best || (tujuan === 'pinjam' ? v < best.nilai : v > best.nilai);
    if (lebihBaik) best = { id: t.id, nilai: v };
  });
  return best;
}

/*
 * Duel tawaran: bunga tunggal vs bunga majemuk dengan modal sama.
 *   opts.M0       modal awal (rupiah)
 *   opts.tunggal  { nama, i } tawaran bunga tunggal (i desimal)
 *   opts.majemuk  { nama, i } tawaran bunga majemuk
 *   opts.maxN     banyak periode terbesar (default 8)
 *   opts.periode  nama satuan periode (default 'Tahun')
 *   opts.grafik   true → sertakan grafik batang saldo periode 1..n
 * State (makeInterestDuelState): { n, ubah, maks } — `ubah` menghitung
 * perubahan yang benar-benar terjadi dan `maks` periode terbesar yang
 * pernah dilihat, sehingga app dapat mensyaratkan eksplorasi.
 */
function makeInterestDuelState() {
  return { n: 1, ubah: 0, maks: 1 };
}

/* Mengubah banyak periode sebesar `step`; mengembalikan true bila berubah. */
function ubahInterestDuel(st, step, opts) {
  var maxN = opts.maxN || 8;
  var baru = Math.min(maxN, Math.max(1, st.n + step));
  if (baru === st.n) return false;
  st.n = baru;
  st.ubah = (st.ubah || 0) + 1;
  st.maks = Math.max(st.maks || 1, baru);
  return true;
}

function buildInterestDuel(id, st, opts) {
  var maxN = opts.maxN || 8;
  var periode = opts.periode || 'Tahun';
  var n = st.n;
  var b = bandingTawaran(opts.M0, opts.tunggal.i, opts.majemuk.i, n);

  function tombol(step, simbol, aria) {
    var mentok = step < 0 ? n <= 1 : n >= maxN;
    return (
      '<button type="button" class="compound-sim__btn" data-duel-id="' +
      esc(id) +
      '" data-duel-step="' +
      step +
      '" aria-label="' +
      esc(aria) +
      '"' +
      (mentok ? ' disabled' : '') +
      '>' +
      simbol +
      '</button>'
    );
  }

  function kartu(jenis, t, saldo, rumus) {
    var menang = b.unggul === jenis;
    return (
      '<div class="interest-duel__card interest-duel__card--' +
      jenis +
      (menang ? ' interest-duel__card--win' : '') +
      '">' +
      '<span class="interest-duel__name">' +
      esc(t.nama) +
      '</span>' +
      '<span class="interest-duel__rule">Bunga ' +
      jenis +
      ' ' +
      esc(formatPersen(t.i)) +
      '</span>' +
      '<span class="interest-duel__formula">' +
      rumus +
      '</span>' +
      '<strong class="interest-duel__saldo">' +
      esc(formatRupiah(saldo)) +
      '</strong>' +
      (menang ? '<span class="interest-duel__badge">🏆 Unggul</span>' : '') +
      '</div>'
    );
  }

  var M0 = formatRupiah(opts.M0);
  var sub = subskrip(n);
  var hasil =
    b.unggul === 'sama'
      ? 'Saldo kedua tawaran sama besar.'
      : '<strong>' +
        esc(b.unggul === 'tunggal' ? opts.tunggal.nama : opts.majemuk.nama) +
        '</strong> unggul ' +
        esc(formatRupiah(b.selisih)) +
        '.';

  var grafik = '';
  if (opts.grafik) {
    var sT = [];
    var sM = [];
    for (var k = 1; k <= n; k++) {
      sT.push(nilaiAkhirBungaTunggal(opts.M0, opts.tunggal.i, k));
      sM.push(nilaiAkhirBungaMajemuk(opts.M0, opts.majemuk.i, k));
    }
    grafik = buildCompareBarChart(
      [
        { label: opts.tunggal.nama + ' (tunggal)', values: sT },
        { label: opts.majemuk.nama + ' (majemuk)', values: sM },
      ],
      {
        format: function (v) {
          return formatDesimal(v / 1000000, 1) + ' jt';
        },
        highlight: n - 1,
        caption: 'Grafik saldo kedua tawaran dari ' + periode.toLowerCase() + ' 1 sampai ' + n,
      }
    );
  }

  return (
    '<div class="interest-duel" id="' +
    esc(id) +
    '">' +
    '<div class="compound-sim__ctrl interest-duel__ctrl">' +
    '<span class="compound-sim__ctrl-label">Banyak periode n (' +
    esc(periode.toLowerCase()) +
    ')</span>' +
    '<div class="compound-sim__stepper">' +
    tombol(-1, '−', 'Kurangi banyak periode') +
    '<span class="compound-sim__val">' +
    esc(periode + ' ' + n) +
    '</span>' +
    tombol(1, '+', 'Tambah banyak periode') +
    '</div>' +
    '</div>' +
    '<div class="interest-duel__arena" aria-live="polite">' +
    kartu(
      'tunggal',
      opts.tunggal,
      b.tunggal,
      'M' +
        sub +
        ' = ' +
        esc(M0) +
        ' × (1 + ' +
        n +
        ' × ' +
        esc(formatDesimal(opts.tunggal.i, 4)) +
        ')'
    ) +
    '<span class="interest-duel__vs" aria-hidden="true">VS</span>' +
    kartu(
      'majemuk',
      opts.majemuk,
      b.majemuk,
      'M' +
        sub +
        ' = ' +
        esc(M0) +
        ' × ' +
        esc(formatRatio(1 + opts.majemuk.i)) +
        '<sup>' +
        n +
        '</sup>'
    ) +
    '<p class="interest-duel__result">' +
    esc(periode) +
    ' ke-' +
    n +
    ': ' +
    hasil +
    '</p>' +
    '</div>' +
    grafik +
    '</div>'
  );
}

/* Memasang tombol −/+ duel tawaran; `save` lalu `rerender` dipanggil setelah berubah. */
function bindInterestDuel(root, id, st, opts, save, rerender) {
  root.querySelectorAll('[data-duel-id="' + id + '"][data-duel-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (ubahInterestDuel(st, +btn.dataset.duelStep, opts)) {
        save();
        rerender();
      }
    });
  });
}

/* ============================================================
   25. RELASI ANTARA DUA HIMPUNAN
   Relasi dari himpunan A ke himpunan B disimpan sebagai array
   pasangan berurutan [[a, b], …] — anggota A selalu di depan.
   Tiga cara penyajian yang setara:
     • diagram panah   buildArrowDiagram / bindArrowDiagram
     • tabel           buildRelationTable (silang A × B, bisa
                       diisi) & buildRelationListTable (dua kolom)
     • pasangan        formatRelasiPasangan, buildPairChips
   Fungsi murni (aturan, normalisasi, diagnosa, logika ketuk) diuji
   di tests/engine-relasi.test.js. Gaya .rel-* ada di shared/base.css.
   ============================================================ */

/* Kunci unik pasangan (a, b); urutan anggota membedakan kunci. */
function kunciPasangan(a, b) {
  return JSON.stringify([String(a), String(b)]);
}

function adaPasangan(pairs, a, b) {
  var k = kunciPasangan(a, b);
  return pairs.some(function (p) {
    return kunciPasangan(p[0], p[1]) === k;
  });
}

/* Semua pasangan (a, b) dari A × B yang memenuhi aturan fn(a, b). */
function relasiDariAturan(A, B, fn) {
  var out = [];
  A.forEach(function (a) {
    B.forEach(function (b) {
      if (fn(a, b)) out.push([a, b]);
    });
  });
  return out;
}

function indeksAnggota(list, x) {
  for (var i = 0; i < list.length; i++) {
    if (String(list[i]) === String(x)) return i;
  }
  return -1;
}

/*
 * Membuang pasangan ganda. Bila A dan B diberikan, pasangan diurutkan
 * menurut posisi anggota di A lalu di B; bila tidak, urutan kemunculan
 * pertama dipertahankan.
 */
function normalisasiRelasi(pairs, A, B) {
  var seen = {};
  var out = [];
  pairs.forEach(function (p) {
    var k = kunciPasangan(p[0], p[1]);
    if (seen[k]) return;
    seen[k] = true;
    out.push([p[0], p[1]]);
  });
  if (A && B) {
    out.sort(function (p, q) {
      return (
        indeksAnggota(A, p[0]) - indeksAnggota(A, q[0]) ||
        indeksAnggota(B, p[1]) - indeksAnggota(B, q[1])
      );
    });
  }
  return out;
}

/* Dua relasi sama bila himpunan pasangannya sama (urutan daftar bebas). */
function relasiSama(p, q) {
  var a = normalisasiRelasi(p);
  var b = normalisasiRelasi(q);
  return (
    a.length === b.length &&
    a.every(function (x) {
      return adaPasangan(b, x[0], x[1]);
    })
  );
}

/* Menambah panah (a, b) bila belum ada, menghapusnya bila sudah ada. */
function togglePasangan(pairs, a, b) {
  if (adaPasangan(pairs, a, b)) {
    var k = kunciPasangan(a, b);
    return pairs.filter(function (p) {
      return kunciPasangan(p[0], p[1]) !== k;
    });
  }
  return pairs.concat([[a, b]]);
}

/*
 * Daerah hasil (range): anggota B yang menerima panah. Diurutkan
 * menurut kodomain B bila diberikan, selain itu urutan kemunculan.
 */
function rangeRelasi(pairs, B) {
  var hasil = normalisasiRelasi(
    pairs.map(function (p) {
      return [p[1], ''];
    })
  ).map(function (p) {
    return p[0];
  });
  if (!B) return hasil;
  return B.filter(function (b) {
    return indeksAnggota(hasil, b) !== -1;
  });
}

/* Anggota A yang tidak punya pasangan (tidak ada panah keluar). */
function anggotaTanpaPasangan(A, pairs) {
  return A.filter(function (a) {
    return banyakPanahDari(pairs, a) === 0;
  });
}

function banyakPanahDari(pairs, a) {
  return normalisasiRelasi(pairs).filter(function (p) {
    return String(p[0]) === String(a);
  }).length;
}

/* [2, 3, 4] → '{2, 3, 4}'; himpunan kosong → '{ }'. */
function formatHimpunan(list) {
  return list.length ? '{' + list.join(', ') + '}' : '{ }';
}

/* ('Nadia', 'Futsal') → '(Nadia, Futsal)' */
function formatPasangan(a, b) {
  return '(' + a + ', ' + b + ')';
}

/* [[2, 4], [3, 6]] → '{(2, 4), (3, 6)}' */
function formatRelasiPasangan(pairs) {
  return formatHimpunan(
    pairs.map(function (p) {
      return formatPasangan(p[0], p[1]);
    })
  );
}

/*
 * Membandingkan jawaban dengan relasi target:
 *   kurang   pasangan target yang belum ada di jawaban
 *   terbalik pasangan jawaban yang urutannya tertukar, mis. (Futsal, Nadia)
 *   lebih    pasangan jawaban lain yang tidak ada di target
 *   tepat    true bila ketiganya kosong
 */
function diagnosaRelasi(target, jawab) {
  var j = normalisasiRelasi(jawab);
  var kurang = normalisasiRelasi(target).filter(function (p) {
    return !adaPasangan(j, p[0], p[1]);
  });
  var terbalik = [];
  var lebih = [];
  j.forEach(function (p) {
    if (adaPasangan(target, p[0], p[1])) return;
    if (adaPasangan(target, p[1], p[0])) terbalik.push(p);
    else lebih.push(p);
  });
  return {
    kurang: kurang,
    terbalik: terbalik,
    lebih: lebih,
    tepat: kurang.length + terbalik.length + lebih.length === 0,
  };
}

/*
 * Logika ketuk perakit diagram panah. st = { pairs, selected }.
 *   side 'a' → memilih (atau membatalkan) anggota A ke-idx
 *   side 'b' → menambah/menghapus panah dari anggota A terpilih
 * Anggota A tetap terpilih setelah menarik panah, agar satu anggota
 * mudah diberi lebih dari satu panah. Mengembalikan 'pilih' | 'batal'
 * | 'tambah' | 'hapus' | 'perluPilih', atau null bila idx tidak sah.
 */
function ketukDiagramPanah(st, A, B, side, idx) {
  var list = side === 'a' ? A : B;
  if (!(idx >= 0 && idx < list.length)) return null;
  if (side === 'a') {
    if (st.selected === idx) {
      st.selected = null;
      return 'batal';
    }
    st.selected = idx;
    return 'pilih';
  }
  if (st.selected === null || st.selected === undefined || !A[st.selected]) {
    return 'perluPilih';
  }
  var a = A[st.selected];
  var ada = adaPasangan(st.pairs, a, B[idx]);
  st.pairs = togglePasangan(st.pairs, a, B[idx]);
  return ada ? 'hapus' : 'tambah';
}

/* Elemen terakhir yang diketuk per diagram/tabel, untuk memulihkan fokus. */
var REL_LAST_FOCUS = {};

function relFokusKembali(root, id, attr) {
  var sel = REL_LAST_FOCUS[id];
  if (!sel) return;
  var el = root.querySelector('[' + attr + '="' + id + '"]' + sel);
  if (el && typeof el.focus === 'function') el.focus();
}

/*
 * Diagram panah (SVG) relasi dari A ke B.
 *   opts.labelA, opts.labelB   nama himpunan di atas elips (default 'A', 'B')
 *   opts.namaRelasi            nama relasi di atas diagram, mis. 'faktor dari'
 *   opts.interactive           true → anggota bisa diketuk/difokus
 *                              (pasang dengan bindArrowDiagram)
 *   opts.selected              indeks anggota A yang sedang dipilih
 *   opts.salah                 pasangan yang panahnya ditandai merah
 *   opts.caption               teks aksesibel diagram
 */
function buildArrowDiagram(id, A, B, pairs, opts) {
  opts = opts || {};
  var W = 360;
  var ROW = 54;
  var TOP = 66;
  var PILL_W = 112;
  var PILL_H = 40;
  var CX_A = 82;
  var CX_B = 278;
  var n = Math.max(A.length, B.length, 1);
  var H = TOP + n * ROW + 18;
  var cy = TOP + (n * ROW) / 2;
  var ry = (n * ROW) / 2 + 12;
  var salah = opts.salah || [];
  var inter = !!opts.interactive;

  function yOf(k, i) {
    return TOP + ((n - k) * ROW) / 2 + ROW * (i + 0.5);
  }

  function node(side, v, i, k, cx) {
    var y = yOf(k, i);
    var selected = side === 'a' && opts.selected === i;
    var label =
      side === 'a'
        ? selected
          ? 'Batalkan pilihan ' + v
          : 'Pilih ' + v
        : 'Tarik atau hapus panah ke ' + v;
    return (
      '<g class="rel-node rel-node--' +
      side +
      (selected ? ' rel-node--selected' : '') +
      '" data-rel-id="' +
      esc(id) +
      '" data-rel-side="' +
      side +
      '" data-rel-idx="' +
      i +
      '"' +
      (inter
        ? ' role="button" tabindex="0" aria-label="' +
          esc(label) +
          '"' +
          (side === 'a' ? ' aria-pressed="' + (selected ? 'true' : 'false') + '"' : '')
        : '') +
      '>' +
      '<rect class="rel-node__pill" x="' +
      (cx - PILL_W / 2) +
      '" y="' +
      (y - PILL_H / 2) +
      '" width="' +
      PILL_W +
      '" height="' +
      PILL_H +
      '" rx="20" />' +
      '<text class="rel-node__text" x="' +
      cx +
      '" y="' +
      (y + 5) +
      '" text-anchor="middle">' +
      esc(v) +
      '</text>' +
      '</g>'
    );
  }

  var arrows = normalisasiRelasi(pairs)
    .map(function (p) {
      var i = indeksAnggota(A, p[0]);
      var j = indeksAnggota(B, p[1]);
      if (i === -1 || j === -1) return '';
      var x1 = CX_A + PILL_W / 2 + 2;
      var y1 = yOf(A.length, i);
      var x2 = CX_B - PILL_W / 2 - 3;
      var y2 = yOf(B.length, j);
      var dx = x2 - x1;
      var dy = y2 - y1;
      var len = Math.sqrt(dx * dx + dy * dy);
      var ux = dx / len;
      var uy = dy / len;
      var bx = x2 - ux * 11;
      var by = y2 - uy * 11;
      var head = [
        [x2, y2],
        [bx - uy * 5.5, by + ux * 5.5],
        [bx + uy * 5.5, by - ux * 5.5],
      ]
        .map(function (pt) {
          return pt[0].toFixed(1) + ',' + pt[1].toFixed(1);
        })
        .join(' ');
      var bad = adaPasangan(salah, p[0], p[1]);
      return (
        '<g>' +
        '<line class="rel-arrow__line' +
        (bad ? ' rel-arrow__line--salah' : '') +
        '" x1="' +
        x1 +
        '" y1="' +
        y1.toFixed(1) +
        '" x2="' +
        bx.toFixed(1) +
        '" y2="' +
        by.toFixed(1) +
        '" />' +
        '<polygon class="rel-arrow__head' +
        (bad ? ' rel-arrow__head--salah' : '') +
        '" points="' +
        head +
        '" />' +
        '</g>'
      );
    })
    .join('');

  var caption =
    opts.caption ||
    'Diagram panah relasi ' +
      (opts.namaRelasi ? '“' + opts.namaRelasi + '” ' : '') +
      'dari himpunan ' +
      (opts.labelA || 'A') +
      ' ke himpunan ' +
      (opts.labelB || 'B') +
      ': ' +
      (pairs.length ? formatRelasiPasangan(normalisasiRelasi(pairs, A, B)) : 'belum ada panah');

  return (
    '<figure class="rel-arrow' +
    (inter ? ' rel-arrow--interactive' : '') +
    '">' +
    '<svg class="rel-arrow__svg" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" ' +
    (inter ? 'role="group"' : 'role="img"') +
    ' aria-label="' +
    esc(caption) +
    '">' +
    (opts.namaRelasi
      ? '<text class="rel-arrow__name" x="' +
        W / 2 +
        '" y="20" text-anchor="middle">' +
        esc(opts.namaRelasi) +
        '</text>'
      : '') +
    '<text class="rel-arrow__set" x="' +
    CX_A +
    '" y="44" text-anchor="middle">' +
    esc(opts.labelA || 'A') +
    '</text>' +
    '<text class="rel-arrow__set" x="' +
    CX_B +
    '" y="44" text-anchor="middle">' +
    esc(opts.labelB || 'B') +
    '</text>' +
    '<ellipse class="rel-arrow__oval rel-arrow__oval--a" cx="' +
    CX_A +
    '" cy="' +
    cy +
    '" rx="76" ry="' +
    ry +
    '" />' +
    '<ellipse class="rel-arrow__oval rel-arrow__oval--b" cx="' +
    CX_B +
    '" cy="' +
    cy +
    '" rx="76" ry="' +
    ry +
    '" />' +
    arrows +
    A.map(function (v, i) {
      return node('a', v, i, A.length, CX_A);
    }).join('') +
    B.map(function (v, i) {
      return node('b', v, i, B.length, CX_B);
    }).join('') +
    '</svg>' +
    '</figure>'
  );
}

/*
 * Memasang ketuk/Enter/Spasi pada diagram panah interaktif.
 * st = { pairs, selected } dimutasi lewat ketukDiagramPanah();
 * onChange(hasil) dipanggil dengan hasil ketukan (lihat di atas).
 */
function bindArrowDiagram(root, id, A, B, st, onChange) {
  root.querySelectorAll('[data-rel-id="' + id + '"][data-rel-side]').forEach(function (el) {
    function ketuk() {
      var side = el.getAttribute('data-rel-side');
      var idx = +el.getAttribute('data-rel-idx');
      var hasil = ketukDiagramPanah(st, A, B, side, idx);
      if (hasil === null) return;
      REL_LAST_FOCUS[id] = '[data-rel-side="' + side + '"][data-rel-idx="' + idx + '"]';
      onChange(hasil);
    }
    el.addEventListener('click', ketuk);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ketuk();
      }
    });
  });
  relFokusKembali(root, id, 'data-rel-id');
}

/*
 * Tabel silang relasi: baris = anggota A, kolom = anggota B, tanda ✓
 * pada sel pasangan yang berelasi.
 *   opts.labelA, opts.labelB   judul sudut tabel
 *   opts.interactive           true → setiap sel berupa tombol ✓
 *                              (pasang dengan bindRelationTable)
 *   opts.salah                 pasangan yang selnya ditandai merah
 *   opts.caption               keterangan tabel (<caption>)
 */
function buildRelationTable(id, A, B, pairs, opts) {
  opts = opts || {};
  var salah = opts.salah || [];
  return (
    '<div class="rel-table-wrap">' +
    '<table class="rel-table' +
    (opts.interactive ? ' rel-table--interactive' : '') +
    '">' +
    (opts.caption ? '<caption>' + esc(opts.caption) + '</caption>' : '') +
    '<thead><tr><td class="rel-table__corner">' +
    esc(opts.labelA || 'A') +
    ' ╲ ' +
    esc(opts.labelB || 'B') +
    '</td>' +
    B.map(function (b) {
      return '<th scope="col">' + esc(b) + '</th>';
    }).join('') +
    '</tr></thead><tbody>' +
    A.map(function (a, i) {
      return (
        '<tr><th scope="row">' +
        esc(a) +
        '</th>' +
        B.map(function (b, j) {
          var on = adaPasangan(pairs, a, b);
          var cls =
            'rel-table__cell' +
            (on ? ' rel-table__cell--on' : '') +
            (adaPasangan(salah, a, b) ? ' rel-table__cell--salah' : '');
          if (!opts.interactive) {
            return (
              '<td class="' +
              cls +
              '">' +
              (on ? '<span aria-label="berelasi">✓</span>' : '<span class="sr-only">tidak</span>') +
              '</td>'
            );
          }
          return (
            '<td class="' +
            cls +
            '"><button type="button" class="rel-table__btn" data-rel-cell="' +
            esc(id) +
            '" data-ai="' +
            i +
            '" data-bj="' +
            j +
            '" aria-pressed="' +
            (on ? 'true' : 'false') +
            '" aria-label="' +
            esc(a + ' dan ' + b) +
            '">' +
            (on ? '✓' : '') +
            '</button></td>'
          );
        }).join('') +
        '</tr>'
      );
    }).join('') +
    '</tbody></table></div>'
  );
}

/* Memasang tombol sel tabel silang: ketuk → togglePasangan pada st.pairs. */
function bindRelationTable(root, id, A, B, st, onChange) {
  root.querySelectorAll('[data-rel-cell="' + id + '"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = +btn.dataset.ai;
      var j = +btn.dataset.bj;
      if (A[i] === undefined || B[j] === undefined) return;
      st.pairs = togglePasangan(st.pairs, A[i], B[j]);
      REL_LAST_FOCUS[id] = '[data-ai="' + i + '"][data-bj="' + j + '"]';
      onChange();
    });
  });
  relFokusKembali(root, id, 'data-rel-cell');
}

/*
 * Tabel dua kolom: anggota A | pasangannya di B (dipisah koma);
 * anggota tanpa pasangan ditulis "—".
 */
function buildRelationListTable(A, pairs, opts) {
  opts = opts || {};
  return (
    '<div class="rel-table-wrap">' +
    '<table class="rel-list">' +
    '<thead><tr><th scope="col">' +
    esc(opts.labelA || 'A') +
    '</th><th scope="col">' +
    esc(opts.labelB || 'B') +
    '</th></tr></thead><tbody>' +
    A.map(function (a) {
      var pas = normalisasiRelasi(pairs)
        .filter(function (p) {
          return String(p[0]) === String(a);
        })
        .map(function (p) {
          return esc(p[1]);
        });
      return (
        '<tr><th scope="row">' +
        esc(a) +
        '</th><td>' +
        (pas.length ? pas.join(', ') : '<span class="rel-list__none">—</span>') +
        '</td></tr>'
      );
    }).join('') +
    '</tbody></table></div>'
  );
}

/*
 * Chip pasangan berurutan yang bisa dipilih (lebih dari satu).
 *   chips     [{ id, a, b }]
 *   order     urutan acak id chip (disimpan di State)
 *   terpilih  array id chip yang dipilih
 *   opts.periksa  true → tandai hasil: benar / salah / terlewat
 *   opts.terlewat false → chip benar yang belum dipilih TIDAK ditandai
 *                 (agar pemeriksaan pertama tidak membocorkan kunci)
 *   opts.benar    array id chip yang seharusnya dipilih
 *   opts.locked   true → chip tidak bisa diubah lagi
 */
function buildPairChips(id, chips, order, terpilih, opts) {
  opts = opts || {};
  var benar = opts.benar || [];
  return (
    '<div class="rel-chips" role="group">' +
    orderByIds(chips, order)
      .map(function (c) {
        var on = terpilih.indexOf(c.id) !== -1;
        var cls = 'rel-chip';
        if (opts.periksa) {
          var harus = benar.indexOf(c.id) !== -1;
          if (on && harus) cls += ' rel-chip--benar';
          else if (on) cls += ' rel-chip--salah';
          else if (harus && opts.terlewat !== false) cls += ' rel-chip--terlewat';
        }
        return (
          '<button type="button" class="' +
          cls +
          '" data-rel-chip="' +
          esc(id) +
          '" data-chip-id="' +
          esc(c.id) +
          '" aria-pressed="' +
          (on ? 'true' : 'false') +
          '"' +
          (opts.locked ? ' disabled' : '') +
          '>' +
          esc(formatPasangan(c.a, c.b)) +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Memasang chip: ketuk menambah/menghapus id dari st.terpilih. */
function bindPairChips(root, id, st, onChange) {
  root.querySelectorAll('[data-rel-chip="' + id + '"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cid = btn.dataset.chipId;
      var k = st.terpilih.indexOf(cid);
      if (k === -1) st.terpilih.push(cid);
      else st.terpilih.splice(k, 1);
      REL_LAST_FOCUS[id] = '[data-chip-id="' + cid + '"]';
      onChange();
    });
  });
  relFokusKembali(root, id, 'data-rel-chip');
}

/* ============================================================
   26. KEKONGRUENAN BANGUN DATAR
   Bangun datar = { id, nama, titik: ['A','B',…], pts: [[x,y],…] }
   dengan koordinat dalam cm (sumbu y ke bawah, seperti layar).
   Titik didaftar berurutan mengelilingi bangun; sisi ke-i adalah
   ruas titik i → titik i+1, sudut ke-i adalah sudut dalam di titik i.
     • ukur        sisiPoligon, sudutPoligon, kelilingPoligon
     • jiplak      transformPoligon, posisiJiplak, jiplakBerimpit,
                   cariPosisiBerimpit, jiplakAksi, perbaruiBerimpit
     • bersesuaian cariKorespondensi, klasifikasiBangun,
                   barisBersesuaian, notasiBersesuaian
     • komponen    buildShapeSVG, buildShapePair, buildTracingBoard,
                   buildMeasureBoard, buildCompareTable
   Fungsi murni diuji di tests/engine-kongruen.test.js.
   Gaya .kgr-* ada di shared/base.css.
   ============================================================ */

var KGR_TOL_SISI = 0.001; /* toleransi relatif perbandingan panjang */
var KGR_TOL_SUDUT = 0.5; /* toleransi derajat perbandingan sudut */
var KGR_SKALA = 26; /* px per cm pada gambar */

function jarakTitik(a, b) {
  return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
}

/* Panjang setiap sisi: sisi ke-i = titik i → titik i+1. */
function sisiPoligon(pts) {
  return pts.map(function (p, i) {
    return jarakTitik(p, pts[(i + 1) % pts.length]);
  });
}

function kelilingPoligon(pts) {
  return sisiPoligon(pts).reduce(function (s, v) {
    return s + v;
  }, 0);
}

/* Luas bertanda (rumus tali sepatu); tandanya menunjukkan arah keliling. */
function luasBertanda(pts) {
  var s = 0;
  pts.forEach(function (p, i) {
    var q = pts[(i + 1) % pts.length];
    s += p[0] * q[1] - q[0] * p[1];
  });
  return s / 2;
}

/* Sudut dalam (derajat) di setiap titik sudut; aman untuk sudut refleks. */
function sudutPoligon(pts) {
  var n = pts.length;
  var orientasi = luasBertanda(pts) >= 0 ? 1 : -1;
  return pts.map(function (v, i) {
    var a = pts[(i - 1 + n) % n];
    var b = pts[(i + 1) % n];
    var u = [a[0] - v[0], a[1] - v[1]];
    var w = [b[0] - v[0], b[1] - v[1]];
    var cos = (u[0] * w[0] + u[1] * w[1]) / (Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1]));
    var deg = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
    /* cross(w, u) searah orientasi keliling → sudut cembung */
    var cross = w[0] * u[1] - w[1] * u[0];
    return cross * orientasi < -1e-12 ? 360 - deg : deg;
  });
}

function pusatPoligon(pts) {
  var sx = 0;
  var sy = 0;
  pts.forEach(function (p) {
    sx += p[0];
    sy += p[1];
  });
  return [sx / pts.length, sy / pts.length];
}

function bulatKgr(v) {
  return Math.round(v * 1e9) / 1e9;
}

/*
 * Transformasi jiplakan terhadap pusat bangun: t.cermin (balik kiri-kanan),
 * lalu t.rotasi (derajat, searah jarum jam di layar), lalu t.geser [dx, dy].
 */
function transformPoligon(pts, t) {
  t = t || {};
  var c = pusatPoligon(pts);
  var rad = ((t.rotasi || 0) * Math.PI) / 180;
  var cos = Math.cos(rad);
  var sin = Math.sin(rad);
  var g = t.geser || [0, 0];
  return pts.map(function (p) {
    var x = t.cermin ? 2 * c[0] - p[0] : p[0];
    var dx = x - c[0];
    var dy = p[1] - c[1];
    return [
      bulatKgr(c[0] + dx * cos - dy * sin + g[0]),
      bulatKgr(c[1] + dx * sin + dy * cos + g[1]),
    ];
  });
}

/* Dua poligon berimpit bila himpunan titik sudutnya sama (urutan bebas). */
function poligonBerimpit(p, q, tol) {
  var t = typeof tol === 'number' ? tol : 0.01;
  if (p.length !== q.length) return false;
  var dipakai = [];
  return p.every(function (a) {
    for (var j = 0; j < q.length; j++) {
      if (!dipakai[j] && jarakTitik(a, q[j]) <= t) {
        dipakai[j] = true;
        return true;
      }
    }
    return false;
  });
}

/*
 * Mencari pemetaan titik sudut p → q sehingga sudut bersesuaian sama
 * besar dan sisi bersesuaian sebanding. Mengembalikan
 *   { map, skala, arah }   map[i] = indeks titik q yang bersesuaian
 *                          dengan titik i pada p; skala = sisi q ÷ sisi p;
 *                          arah = 1 (searah) atau −1 (bayangan cermin)
 * atau null. opts.kongruen → hanya pemetaan dengan skala 1.
 */
function cariKorespondensi(p, q, opts) {
  opts = opts || {};
  var n = p.length;
  if (!n || q.length !== n) return null;
  var sp = sisiPoligon(p);
  var ap = sudutPoligon(p);
  var aq = sudutPoligon(q);
  var arah = luasBertanda(p) * luasBertanda(q) < 0 ? -1 : 1;
  var dirs = [1, -1];
  for (var di = 0; di < 2; di++) {
    for (var k = 0; k < n; k++) {
      var map = [];
      for (var i = 0; i < n; i++) map.push((((k + dirs[di] * i) % n) + n) % n);
      var cocok = map.every(function (j, i2) {
        return Math.abs(ap[i2] - aq[j]) <= KGR_TOL_SUDUT;
      });
      if (!cocok) continue;
      var skala = jarakTitik(q[map[0]], q[map[1 % n]]) / sp[0];
      cocok = map.every(function (j, i2) {
        var r = jarakTitik(q[j], q[map[(i2 + 1) % n]]) / sp[i2];
        return Math.abs(r - skala) <= KGR_TOL_SISI * skala;
      });
      if (!cocok) continue;
      if (opts.kongruen && Math.abs(skala - 1) > KGR_TOL_SISI) continue;
      return { map: map, skala: skala, arah: arah };
    }
  }
  return null;
}

/* 'kongruen' | 'sebangun' (sebangun tetapi tidak kongruen) | 'tidak' */
function klasifikasiBangun(p, q) {
  if (cariKorespondensi(p, q, { kongruen: true })) return 'kongruen';
  if (cariKorespondensi(p, q)) return 'sebangun';
  return 'tidak';
}

/* Posisi jiplakan bangun asal yang ditempel di pusat bangun sasaran. */
function posisiJiplak(asal, target, rotasi, cermin) {
  var c1 = pusatPoligon(asal);
  var c2 = pusatPoligon(target);
  return transformPoligon(asal, {
    rotasi: rotasi,
    cermin: cermin,
    geser: [c2[0] - c1[0], c2[1] - c1[1]],
  });
}

function jiplakBerimpit(asal, target, rotasi, cermin) {
  return poligonBerimpit(posisiJiplak(asal, target, rotasi, cermin), target);
}

/* Putaran (kelipatan `langkah`) & balik yang membuat jiplakan berimpit; null bila mustahil. */
function cariPosisiBerimpit(asal, target, langkah) {
  var step = langkah || 90;
  var cermin = [false, true];
  for (var c = 0; c < 2; c++) {
    for (var r = 0; r < 360; r += step) {
      if (jiplakBerimpit(asal, target, r, cermin[c])) return { rotasi: r, cermin: cermin[c] };
    }
  }
  return null;
}

function makeJiplakState() {
  return { dijiplak: false, target: null, rotasi: 0, cermin: false, berimpit: {} };
}

/* Memastikan state[key] berbentuk state kertas jiplak yang sah. */
function ensureJiplakState(state, key, ids) {
  var st = state[key] && typeof state[key] === 'object' ? state[key] : makeJiplakState();
  var base = makeJiplakState();
  st.dijiplak = !!st.dijiplak;
  st.cermin = !!st.cermin;
  st.rotasi = typeof st.rotasi === 'number' ? ((st.rotasi % 360) + 360) % 360 : 0;
  if (st.target !== 'asal' && (ids || []).indexOf(st.target) === -1) st.target = null;
  if (st.dijiplak && !st.target) st.target = 'asal';
  if (!st.berimpit || typeof st.berimpit !== 'object') st.berimpit = base.berimpit;
  state[key] = st;
  return st;
}

/*
 * Logika tombol kertas jiplak.
 *   'jiplak'  menjiplak bangun asal (jiplakan di atas bangun asal)
 *   'kiri' / 'kanan'  memutar jiplakan sebesar `langkah` derajat
 *   'balik'   membalik jiplakan (cermin)
 *   'tempel'  memindahkan jiplakan ke bangun `target`
 *   'kembali' mengembalikan jiplakan ke bangun asal tanpa putar/balik
 */
function jiplakAksi(st, aksi, langkah, target) {
  var step = langkah || 90;
  if (aksi === 'jiplak') {
    st.dijiplak = true;
    st.target = 'asal';
    return st;
  }
  if (!st.dijiplak) return st;
  if (aksi === 'kiri') st.rotasi = (st.rotasi - step + 360) % 360;
  else if (aksi === 'kanan') st.rotasi = (st.rotasi + step) % 360;
  else if (aksi === 'balik') st.cermin = !st.cermin;
  else if (aksi === 'tempel' && target) st.target = target;
  else if (aksi === 'kembali') {
    st.target = 'asal';
    st.rotasi = 0;
    st.cermin = false;
  }
  return st;
}

/*
 * Memeriksa apakah jiplakan saat ini berimpit dengan bangun sasarannya
 * (`cari` memetakan id → bangun) dan mencatatnya di st.berimpit.
 */
function perbaruiBerimpit(st, asal, cari) {
  var tb = st.target === 'asal' ? asal : cari[st.target];
  if (!st.dijiplak || !tb) return false;
  var b = jiplakBerimpit(asal.pts, tb.pts, st.rotasi, st.cermin);
  if (b && st.target !== 'asal') st.berimpit[st.target] = true;
  return b;
}

function formatPanjang(v) {
  return formatDesimal(v, 1) + ' cm';
}

function formatSudut(v) {
  return Math.round(v) + '°';
}

function namaSisi(titik, i) {
  return titik[i] + titik[(i + 1) % titik.length];
}

function namaSudut(titik, i) {
  return '∠' + titik[i];
}

/* Daftar hal yang bisa diukur: sisi (s0, s1, …) lalu sudut (a0, a1, …). */
function ukurItems(bangun) {
  var sisi = sisiPoligon(bangun.pts);
  var sudut = sudutPoligon(bangun.pts);
  return sisi
    .map(function (v, i) {
      return { id: 's' + i, jenis: 'sisi', idx: i, nama: namaSisi(bangun.titik, i), nilai: v };
    })
    .concat(
      sudut.map(function (v, i) {
        return { id: 'a' + i, jenis: 'sudut', idx: i, nama: namaSudut(bangun.titik, i), nilai: v };
      })
    );
}

function makeUkurState() {
  return { terukur: {}, terakhir: null };
}

function ensureUkurState(state, key) {
  var st = state[key] && typeof state[key] === 'object' ? state[key] : makeUkurState();
  if (!st.terukur || typeof st.terukur !== 'object') st.terukur = {};
  if (typeof st.terakhir !== 'string') st.terakhir = null;
  state[key] = st;
  return st;
}

function ukurItem(st, id) {
  st.terukur[id] = true;
  st.terakhir = id;
  return st;
}

function banyakTerukur(bangun, st) {
  return ukurItems(bangun).filter(function (it) {
    return !!st.terukur[it.id];
  }).length;
}

function ukurSelesai(bangun, st) {
  return banyakTerukur(bangun, st) === bangun.pts.length * 2;
}

/* Baris sisi & sudut bersesuaian p ↔ q menurut pemetaan `map`. */
function barisBersesuaian(p, q, map) {
  var n = p.pts.length;
  var sp = sisiPoligon(p.pts);
  var ap = sudutPoligon(p.pts);
  var aq = sudutPoligon(q.pts);
  var rows = [];
  for (var i = 0; i < n; i++) {
    var j1 = map[i];
    var j2 = map[(i + 1) % n];
    var lq = jarakTitik(q.pts[j1], q.pts[j2]);
    rows.push({
      jenis: 'sisi',
      namaP: namaSisi(p.titik, i),
      nilaiP: sp[i],
      namaQ: q.titik[j1] + q.titik[j2],
      nilaiQ: lq,
      rasio: lq / sp[i],
    });
  }
  for (var k = 0; k < n; k++) {
    rows.push({
      jenis: 'sudut',
      namaP: namaSudut(p.titik, k),
      nilaiP: ap[k],
      namaQ: namaSudut(q.titik, map[k]),
      nilaiQ: aq[map[k]],
      rasio: aq[map[k]] / ap[k],
    });
  }
  return rows;
}

/* Penulisan dengan urutan titik bersesuaian, mis. 'ABCD ≅ LMNK'. */
function notasiBersesuaian(p, q, map, simbol) {
  return (
    p.titik.join('') +
    ' ' +
    simbol +
    ' ' +
    map
      .map(function (j) {
        return q.titik[j];
      })
      .join('')
  );
}

/* ---------- Komponen gambar ---------- */

function kgrNum(v) {
  return String(Math.round(v * 10) / 10);
}

function kgrUnit(v) {
  var len = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / len, v[1] / len];
}

/* Setengah sisi kotak gambar yang memuat semua bangun bila dipusatkan. */
function kgrRadius(list) {
  var r = 0;
  list.forEach(function (b) {
    var c = pusatPoligon(b.pts);
    b.pts.forEach(function (p) {
      r = Math.max(r, jarakTitik(p, c));
    });
  });
  return r;
}

/* Pengali huruf agar nama titik tetap terbaca pada kotak gambar yang diperkecil. */
function kgrBesarHurufKotak(r) {
  return Math.max(1, (2 * r * KGR_SKALA) / 260);
}

function kgrDipilih(list, i) {
  if (list === 'semua') return true;
  return Array.isArray(list) && list.indexOf(i) !== -1;
}

/*
 * Gambar SVG sebuah bangun datar.
 *   opts.skala        px per cm (default 26)
 *   opts.kotak        { cx, cy, r } (cm) → kotak gambar persegi berpusat di
 *                     (cx, cy); default: kotak pembatas bangun + tepi
 *   opts.warna        'a' | 'b' | 'c' | 'd' (warna isian)
 *   opts.tampilSisi   'semua' | [indeks] — tulis panjang sisi
 *   opts.tampilSudut  'semua' | [indeks] — gambar busur & besar sudut
 *   opts.tanyaSisi, opts.tanyaSudut   indeks yang ditulis '?'
 *   opts.labelSisi, opts.labelSudut   { indeks: teks } pengganti label
 *   opts.sorot        id ukur ('s1', 'a2') yang disorot
 *   opts.interaktif   id papan ukur → sisi & sudut bisa diketuk
 *   opts.jiplak       { pts, titik, berimpit } lapisan jiplakan
 *   opts.tanpaTitik   true → tanpa nama titik sudut
 *   opts.besarHuruf   pengali ukuran & jarak nama titik (gambar yang diperkecil)
 *   opts.judul        teks aksesibel
 */
function buildShapeSVG(bangun, opts) {
  opts = opts || {};
  var s = opts.skala || KGR_SKALA;
  var fz = opts.besarHuruf || 1;
  var fzAttr = fz === 1 ? '' : ' style="font-size:' + kgrNum(14 * fz) + 'px"';
  var pts = bangun.pts;
  var n = pts.length;
  var c = pusatPoligon(pts);
  var sisi = sisiPoligon(pts);
  var sudut = sudutPoligon(pts);
  var px = function (p) {
    return [p[0] * s, p[1] * s];
  };
  var P = pts.map(px);
  var C = px(c);
  var vb;
  if (opts.kotak) {
    var r = opts.kotak.r * s;
    vb = [opts.kotak.cx * s - r, opts.kotak.cy * s - r, 2 * r, 2 * r];
  } else {
    var xs = P.map(function (p) {
      return p[0];
    });
    var ys = P.map(function (p) {
      return p[1];
    });
    var pad = 30;
    var x0 = Math.min.apply(null, xs) - pad;
    var y0 = Math.min.apply(null, ys) - pad;
    vb = [x0, y0, Math.max.apply(null, xs) + pad - x0, Math.max.apply(null, ys) + pad - y0];
  }
  var poly = function (arr) {
    return arr
      .map(function (p) {
        return kgrNum(p[0]) + ',' + kgrNum(p[1]);
      })
      .join(' ');
  };

  var out = [];
  out.push(
    '<polygon class="kgr-poly kgr-poly--' + (opts.warna || 'a') + '" points="' + poly(P) + '"/>'
  );

  /* sisi yang disorot */
  if (opts.sorot && opts.sorot.charAt(0) === 's') {
    var si = parseInt(opts.sorot.slice(1), 10);
    if (si >= 0 && si < n) {
      var a1 = P[si];
      var a2 = P[(si + 1) % n];
      out.push(
        '<line class="kgr-sorot" x1="' +
          kgrNum(a1[0]) +
          '" y1="' +
          kgrNum(a1[1]) +
          '" x2="' +
          kgrNum(a2[0]) +
          '" y2="' +
          kgrNum(a2[1]) +
          '"/>'
      );
    }
  }

  /* busur sudut & labelnya */
  P.forEach(function (v, i) {
    var tampil = kgrDipilih(opts.tampilSudut, i);
    var tanya = opts.tanyaSudut === i;
    var custom = opts.labelSudut && opts.labelSudut[i] !== undefined;
    var sorot = opts.sorot === 'a' + i;
    if (!tampil && !tanya && !custom && !sorot) return;
    var u1 = kgrUnit([P[(i - 1 + n) % n][0] - v[0], P[(i - 1 + n) % n][1] - v[1]]);
    var u2 = kgrUnit([P[(i + 1) % n][0] - v[0], P[(i + 1) % n][1] - v[1]]);
    var ra = Math.min(16, 0.3 * Math.min(sisi[i] * s, sisi[(i - 1 + n) % n] * s));
    var cls = 'kgr-arc' + (sorot ? ' kgr-arc--sorot' : '');
    if (Math.abs(sudut[i] - 90) < 0.5) {
      var q1 = [v[0] + u1[0] * ra * 0.8, v[1] + u1[1] * ra * 0.8];
      var q2 = [q1[0] + u2[0] * ra * 0.8, q1[1] + u2[1] * ra * 0.8];
      var q3 = [v[0] + u2[0] * ra * 0.8, v[1] + u2[1] * ra * 0.8];
      out.push('<polyline class="' + cls + '" points="' + poly([q1, q2, q3]) + '"/>');
    } else {
      var b1 = [v[0] + u1[0] * ra, v[1] + u1[1] * ra];
      var b2 = [v[0] + u2[0] * ra, v[1] + u2[1] * ra];
      var sweep = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 1 : 0;
      out.push(
        '<path class="' +
          cls +
          '" d="M' +
          kgrNum(b1[0]) +
          ' ' +
          kgrNum(b1[1]) +
          ' A' +
          kgrNum(ra) +
          ' ' +
          kgrNum(ra) +
          ' 0 0 ' +
          sweep +
          ' ' +
          kgrNum(b2[0]) +
          ' ' +
          kgrNum(b2[1]) +
          '"/>'
      );
    }
    if (tampil || tanya || custom) {
      var bis = kgrUnit([u1[0] + u2[0], u1[1] + u2[1]]);
      var jarak = ra + 14;
      var teks = custom ? opts.labelSudut[i] : tanya ? '?' : formatSudut(sudut[i]);
      out.push(
        '<text class="kgr-label kgr-label--sudut' +
          (tanya ? ' kgr-label--tanya' : '') +
          '" x="' +
          kgrNum(v[0] + bis[0] * jarak) +
          '" y="' +
          kgrNum(v[1] + bis[1] * jarak) +
          '">' +
          esc(teks) +
          '</text>'
      );
    }
  });

  /* label panjang sisi, di luar bangun */
  P.forEach(function (a, i) {
    var tampil = kgrDipilih(opts.tampilSisi, i);
    var tanya = opts.tanyaSisi === i;
    var custom = opts.labelSisi && opts.labelSisi[i] !== undefined;
    if (!tampil && !tanya && !custom) return;
    var b = P[(i + 1) % n];
    var m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    var nrm = kgrUnit([-(b[1] - a[1]), b[0] - a[0]]);
    if (nrm[0] * (m[0] - C[0]) + nrm[1] * (m[1] - C[1]) < 0) nrm = [-nrm[0], -nrm[1]];
    var teks = custom ? opts.labelSisi[i] : tanya ? '?' : formatPanjang(sisi[i]);
    out.push(
      '<text class="kgr-label kgr-label--sisi' +
        (tanya ? ' kgr-label--tanya' : '') +
        '" x="' +
        kgrNum(m[0] + nrm[0] * 13) +
        '" y="' +
        kgrNum(m[1] + nrm[1] * 13) +
        '">' +
        esc(teks) +
        '</text>'
    );
  });

  /* nama titik sudut */
  if (!opts.tanpaTitik && bangun.titik) {
    P.forEach(function (v, i) {
      var u = kgrUnit([v[0] - C[0], v[1] - C[1]]);
      out.push(
        '<text class="kgr-titik"' +
          fzAttr +
          ' x="' +
          kgrNum(v[0] + u[0] * 14 * fz) +
          '" y="' +
          kgrNum(v[1] + u[1] * 14 * fz) +
          '">' +
          esc(bangun.titik[i]) +
          '</text>'
      );
    });
  }

  /* lapisan jiplakan */
  if (opts.jiplak) {
    var J = opts.jiplak.pts.map(px);
    var CJ = px(pusatPoligon(opts.jiplak.pts));
    out.push(
      '<polygon class="kgr-jiplak' +
        (opts.jiplak.berimpit ? ' kgr-jiplak--berimpit' : '') +
        '" points="' +
        poly(J) +
        '"/>'
    );
    if (opts.jiplak.titik) {
      J.forEach(function (v, i) {
        var u = kgrUnit([CJ[0] - v[0], CJ[1] - v[1]]);
        out.push(
          '<text class="kgr-jiplak__titik"' +
            fzAttr +
            ' x="' +
            kgrNum(v[0] + u[0] * 13 * fz) +
            '" y="' +
            kgrNum(v[1] + u[1] * 13 * fz) +
            '">' +
            esc(opts.jiplak.titik[i]) +
            '</text>'
        );
      });
    }
  }

  /* bidang ketuk untuk alat ukur */
  if (opts.interaktif) {
    P.forEach(function (a, i) {
      var b = P[(i + 1) % n];
      out.push(
        '<line class="kgr-hit" data-ukur-svg="' +
          esc(opts.interaktif) +
          '" data-ukur-id="s' +
          i +
          '" x1="' +
          kgrNum(a[0]) +
          '" y1="' +
          kgrNum(a[1]) +
          '" x2="' +
          kgrNum(b[0]) +
          '" y2="' +
          kgrNum(b[1]) +
          '"><title>Ukur sisi ' +
          esc(namaSisi(bangun.titik, i)) +
          '</title></line>'
      );
    });
    P.forEach(function (v, i) {
      var u = kgrUnit([C[0] - v[0], C[1] - v[1]]);
      out.push(
        '<circle class="kgr-hit kgr-hit--sudut" data-ukur-svg="' +
          esc(opts.interaktif) +
          '" data-ukur-id="a' +
          i +
          '" cx="' +
          kgrNum(v[0] + u[0] * 12) +
          '" cy="' +
          kgrNum(v[1] + u[1] * 12) +
          '" r="14"><title>Ukur ' +
          esc(namaSudut(bangun.titik, i)) +
          '</title></circle>'
      );
    });
  }

  var judul = opts.judul || (bangun.titik ? 'Bangun ' + bangun.titik.join('') : 'Bangun datar');
  return (
    '<svg class="kgr-svg" viewBox="' +
    vb.map(kgrNum).join(' ') +
    '" width="' +
    kgrNum(vb[2]) +
    '" role="img" aria-label="' +
    esc(judul) +
    '">' +
    out.join('') +
    '</svg>'
  );
}

/*
 * Dua bangun berdampingan dengan skala yang sama, untuk soal & pemilahan.
 *   opts.p, opts.q  opsi buildShapeSVG untuk masing-masing bangun
 *   opts.skala      px per cm untuk keduanya
 */
function buildShapePair(p, q, opts) {
  opts = opts || {};
  var sk = opts.skala || 20;
  var fig = function (b, o, warna) {
    return (
      '<figure class="kgr-pair__item">' +
      buildShapeSVG(b, Object.assign({ skala: sk, warna: warna }, o || {})) +
      (b.nama ? '<figcaption>' + esc(b.nama) + '</figcaption>' : '') +
      '</figure>'
    );
  };
  return '<div class="kgr-pair">' + fig(p, opts.p, 'a') + fig(q, opts.q, 'b') + '</div>';
}

var KGR_LAST_FOCUS = {};

function kgrFokusKembali(root, id) {
  var sel = KGR_LAST_FOCUS[id];
  if (!sel) return;
  var el = root.querySelector(sel);
  if (el && typeof el.focus === 'function' && !el.disabled) el.focus();
}

/*
 * Papan kertas jiplak: bangun asal + bangun-bangun calon dalam kotak
 * berukuran sama (skala sama), jiplakan transparan yang bisa ditempel,
 * diputar, dan dibalik. `st` dari makeJiplakState()/ensureJiplakState().
 *   opts.langkah   besar satu putaran (default 90)
 *   opts.namaAsal  keterangan kartu bangun asal
 */
function buildTracingBoard(id, asal, calon, st, opts) {
  opts = opts || {};
  var step = opts.langkah || 90;
  var semua = [asal].concat(calon);
  var r = kgrRadius(semua) + 1.3;
  var namaAsal = asal.titik.join('');
  var sasaran = st.target === 'asal' ? asal : null;
  calon.forEach(function (b) {
    if (b.id === st.target) sasaran = b;
  });
  var berimpit =
    st.dijiplak && sasaran ? jiplakBerimpit(asal.pts, sasaran.pts, st.rotasi, st.cermin) : false;
  var btn = function (aksi, label, extra, disabled) {
    return (
      '<button type="button" class="btn btn--ghost btn--small kgr-btn" data-jiplak="' +
      esc(id) +
      '" data-jiplak-aksi="' +
      aksi +
      '"' +
      (extra || '') +
      (disabled ? ' disabled' : '') +
      '>' +
      label +
      '</button>'
    );
  };

  var cell = function (b, cellId, warna, label) {
    var target = st.dijiplak && st.target === cellId;
    var c = pusatPoligon(b.pts);
    var jiplak = target
      ? {
          pts: posisiJiplak(asal.pts, b.pts, st.rotasi, st.cermin),
          titik: asal.titik,
          berimpit: berimpit,
        }
      : null;
    var aksi =
      cellId === 'asal'
        ? st.dijiplak
          ? btn(
              'kembali',
              '↩ Kembalikan ke sini',
              '',
              st.target === 'asal' && !st.rotasi && !st.cermin
            )
          : btn('jiplak', '✏️ Jiplak bangun ini', ' data-utama="1"')
        : btn(
            'tempel',
            target ? '📌 Jiplakan di sini' : '📌 Tempel di sini',
            ' data-jiplak-tempel="' + esc(cellId) + '"',
            !st.dijiplak || target
          );
    return (
      '<figure class="kgr-cell' +
      (target ? ' is-target' : '') +
      (st.berimpit[cellId] ? ' is-berimpit' : '') +
      '">' +
      '<figcaption class="kgr-cell__nama">' +
      esc(label) +
      (st.berimpit[cellId] ? ' <span class="kgr-cell__badge">✓ pernah berimpit</span>' : '') +
      '</figcaption>' +
      buildShapeSVG(b, {
        kotak: { cx: c[0], cy: c[1], r: r },
        warna: warna,
        jiplak: jiplak,
        besarHuruf: kgrBesarHurufKotak(r),
      }) +
      aksi +
      '</figure>'
    );
  };

  var status;
  if (!st.dijiplak) {
    status =
      '✏️ Ketuk <strong>Jiplak</strong> untuk menjiplak bangun ' +
      esc(namaAsal) +
      ' pada kertas transparan.';
  } else if (st.target === 'asal') {
    status =
      '📄 Jiplakan ' + esc(namaAsal) + ' masih di tempat asalnya. Tempelkan pada bangun lain.';
  } else if (berimpit) {
    status =
      '✅ <strong>Berimpit!</strong> Jiplakan menutupi bangun ' +
      esc(sasaran.titik.join('')) +
      ' dengan tepat.';
  } else {
    status =
      '🔄 Belum berimpit dengan bangun ' +
      esc(sasaran ? sasaran.titik.join('') : '') +
      '. Coba putar atau balik jiplakannya.';
  }
  var posisi = 'Putaran: ' + st.rotasi + '° searah jarum jam' + (st.cermin ? ' · dibalik' : '');

  return (
    '<div class="kgr-board" data-kgr-board="' +
    esc(id) +
    '">' +
    '<div class="kgr-board__grid">' +
    cell(asal, 'asal', 'a', opts.namaAsal || 'Bangun ' + namaAsal) +
    calon
      .map(function (b, i) {
        return cell(
          b,
          b.id,
          ['b', 'c', 'd', 'b', 'c'][i % 5],
          b.nama || 'Bangun ' + b.titik.join('')
        );
      })
      .join('') +
    '</div>' +
    '<div class="kgr-controls">' +
    '<div class="kgr-toolbar" role="group" aria-label="Alat kertas jiplak">' +
    btn('kiri', '↺ Putar kiri ' + step + '°', '', !st.dijiplak) +
    btn('kanan', '↻ Putar kanan ' + step + '°', '', !st.dijiplak) +
    btn('balik', '⇋ Balik jiplakan', '', !st.dijiplak) +
    '</div>' +
    '<p class="kgr-status' +
    (berimpit && st.target !== 'asal' ? ' kgr-status--ok' : '') +
    '" aria-live="polite">' +
    status +
    (st.dijiplak ? '<br><span class="kgr-status__pos">' + posisi + '</span>' : '') +
    '</p>' +
    '</div>' +
    '</div>'
  );
}

/* Memasang tombol papan jiplak; onChange(berimpitSekarang) setelah setiap aksi. */
function bindTracingBoard(root, id, asal, calon, st, opts, onChange) {
  opts = opts || {};
  var cari = {};
  calon.forEach(function (b) {
    cari[b.id] = b;
  });
  root.querySelectorAll('[data-jiplak="' + id + '"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var aksi = btn.dataset.jiplakAksi;
      jiplakAksi(st, aksi, opts.langkah || 90, btn.dataset.jiplakTempel);
      var b = perbaruiBerimpit(st, asal, cari);
      KGR_LAST_FOCUS[id] =
        aksi === 'tempel' || aksi === 'jiplak' || aksi === 'kembali'
          ? '[data-jiplak="' + id + '"][data-jiplak-aksi="kanan"]'
          : '[data-jiplak="' + id + '"][data-jiplak-aksi="' + aksi + '"]';
      onChange(b);
    });
  });
  kgrFokusKembali(root, id);
}

/*
 * Papan ukur: penggaris (sisi) & busur (sudut) virtual. Ketuk sisi/sudut
 * pada gambar atau tombolnya untuk membaca ukurannya.
 * `st` dari makeUkurState()/ensureUkurState().
 *   opts.warna, opts.judul, opts.skala
 */
function buildMeasureBoard(id, bangun, st, opts) {
  opts = opts || {};
  var items = ukurItems(bangun);
  var sisiIdx = [];
  var sudutIdx = [];
  items.forEach(function (it) {
    if (!st.terukur[it.id]) return;
    (it.jenis === 'sisi' ? sisiIdx : sudutIdx).push(it.idx);
  });
  var akhir = null;
  items.forEach(function (it) {
    if (it.id === st.terakhir) akhir = it;
  });
  var chip = function (it) {
    var done = !!st.terukur[it.id];
    return (
      '<button type="button" class="kgr-chip' +
      (done ? ' is-done' : '') +
      (it.id === st.terakhir ? ' is-last' : '') +
      '" data-ukur="' +
      esc(id) +
      '" data-ukur-id="' +
      it.id +
      '" aria-label="Ukur ' +
      (it.jenis === 'sisi' ? 'sisi ' : 'sudut ') +
      esc(it.nama) +
      (done
        ? ', ' + esc(it.jenis === 'sisi' ? formatPanjang(it.nilai) : formatSudut(it.nilai))
        : '') +
      '">' +
      esc(it.nama) +
      (done
        ? ' = <strong>' +
          esc(it.jenis === 'sisi' ? formatPanjang(it.nilai) : formatSudut(it.nilai)) +
          '</strong>'
        : '') +
      '</button>'
    );
  };
  var jumlah = banyakTerukur(bangun, st);
  var status = akhir
    ? akhir.jenis === 'sisi'
      ? '📏 Penggaris: panjang <strong>' +
        esc(akhir.nama) +
        ' = ' +
        esc(formatPanjang(akhir.nilai)) +
        '</strong>'
      : '📐 Busur: besar <strong>' +
        esc(akhir.nama) +
        ' = ' +
        esc(formatSudut(akhir.nilai)) +
        '</strong>'
    : '👆 Ketuk sebuah sisi atau sudut untuk mengukurnya.';
  return (
    '<div class="kgr-measure" data-kgr-measure="' +
    esc(id) +
    '">' +
    (opts.judul ? '<h4 class="kgr-measure__judul">' + esc(opts.judul) + '</h4>' : '') +
    '<div class="kgr-measure__gambar">' +
    buildShapeSVG(bangun, {
      skala: opts.skala,
      warna: opts.warna,
      tampilSisi: sisiIdx,
      tampilSudut: sudutIdx,
      sorot: st.terakhir,
      interaktif: id,
    }) +
    '</div>' +
    '<p class="kgr-status" aria-live="polite">' +
    status +
    '</p>' +
    '<div class="kgr-chips" role="group" aria-label="Sisi">' +
    '<span class="kgr-chips__label">📏 Sisi</span>' +
    items
      .filter(function (it) {
        return it.jenis === 'sisi';
      })
      .map(chip)
      .join('') +
    '</div>' +
    '<div class="kgr-chips" role="group" aria-label="Sudut">' +
    '<span class="kgr-chips__label">📐 Sudut</span>' +
    items
      .filter(function (it) {
        return it.jenis === 'sudut';
      })
      .map(chip)
      .join('') +
    '</div>' +
    '<p class="kgr-measure__count">Terukur ' +
    jumlah +
    ' dari ' +
    items.length +
    '</p>' +
    '</div>'
  );
}

function bindMeasureBoard(root, id, st, onChange) {
  var handler = function (el) {
    el.addEventListener('click', function () {
      ukurItem(st, el.dataset.ukurId);
      KGR_LAST_FOCUS[id] = '[data-ukur="' + id + '"][data-ukur-id="' + el.dataset.ukurId + '"]';
      onChange();
    });
  };
  root.querySelectorAll('[data-ukur="' + id + '"]').forEach(handler);
  root.querySelectorAll('[data-ukur-svg="' + id + '"]').forEach(handler);
  kgrFokusKembali(root, id);
}

/*
 * Tabel sisi & sudut bersesuaian p ↔ q.
 *   opts.namaP, opts.namaQ  judul kolom (default nama titik)
 *   opts.rasio              true → kolom perbandingan sisi (q ÷ p)
 */
function buildCompareTable(p, q, map, opts) {
  opts = opts || {};
  var rows = barisBersesuaian(p, q, map);
  var namaP = opts.namaP || p.titik.join('');
  var namaQ = opts.namaQ || q.titik.join('');
  var ket = function (r) {
    var sama = Math.abs(r.nilaiP - r.nilaiQ) <= (r.jenis === 'sisi' ? 0.01 : KGR_TOL_SUDUT);
    if (sama) return '<span class="kgr-ket kgr-ket--sama">= sama</span>';
    if (opts.rasio && r.jenis === 'sisi') {
      return '<span class="kgr-ket kgr-ket--rasio">× ' + esc(formatDesimal(r.rasio, 2)) + '</span>';
    }
    return '<span class="kgr-ket kgr-ket--beda">≠ beda</span>';
  };
  var fmt = function (r, v) {
    return r.jenis === 'sisi' ? formatPanjang(v) : formatSudut(v);
  };
  return (
    '<div class="kgr-table-wrap"><table class="kgr-table">' +
    '<thead><tr><th scope="col">' +
    esc(namaP) +
    '</th><th scope="col">Ukuran</th><th scope="col">' +
    esc(namaQ) +
    '</th><th scope="col">Ukuran</th><th scope="col">Keterangan</th></tr></thead><tbody>' +
    rows
      .map(function (r) {
        return (
          '<tr class="kgr-table__row--' +
          r.jenis +
          '"><th scope="row">' +
          esc(r.namaP) +
          '</th><td>' +
          esc(fmt(r, r.nilaiP)) +
          '</td><td><strong>' +
          esc(r.namaQ) +
          '</strong></td><td>' +
          esc(fmt(r, r.nilaiQ)) +
          '</td><td>' +
          ket(r) +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

/* ============================================================
   27. EKSPONEN BULAT
   Dipakai modul sifat-sifat eksponen bulat (fase-e/mpi-1.1).
   Nilai pangkat dihitung EKSAK sebagai pecahan { num, den }
   agar 2⁻³ = 1/8 dan 3⁻² = 1/9 tidak terjebak galat desimal.
   Isi:
     - superskrip, format bilangan berpangkat & pecahan
     - pecahan eksak (normalisasi, kali, bagi, sama, format)
     - pangkatBulat (positif, nol, negatif; 0⁰ & 0⁻ⁿ → null)
     - pembaca isian pecahan/bulat/desimal eksak
     - tangga pangkat (tiap turun satu anak tangga dibagi a)
     - ubin faktor (perkalian, pembagian dengan coretan, pangkat
       dari pangkat, pangkat dari perkalian)
     - sifat-sifat eksponen + dugaan keliru untuk disangkal
     - diagnosa miskonsepsi nilai pangkat
     - lab uji sifat eksponen (stepper a, m, n, b + catatan uji)
   Gaya .pw-ladder*, .fx-*, .xlab* ada di shared/base.css.
   ============================================================ */

var SUPERSKRIP_MAP = {
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹',
  '-': '⁻',
  '−': '⁻',
  '+': '⁺',
  '(': '⁽',
  ')': '⁾',
  m: 'ᵐ',
  n: 'ⁿ',
  k: 'ᵏ',
  p: 'ᵖ',
};

/* Angka/eksponen → karakter superskrip (−2 → '⁻²', 'm+n' → 'ᵐ⁺ⁿ'). */
function superskrip(n) {
  return String(n)
    .split('')
    .map(function (ch) {
      return SUPERSKRIP_MAP[ch] || ch;
    })
    .join('');
}

/* Pecahan eksak { num, den }: penyebut positif, paling sederhana; null bila den = 0. */
function pecahan(num, den) {
  if (den === 0) return null;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  var f = gcd(num, den) || 1;
  return { num: num / f, den: den / f };
}

function keFraksi(a) {
  return typeof a === 'object' && a !== null ? pecahan(a.num, a.den) : pecahan(a, 1);
}

function kaliPecahan(p, q) {
  if (!p || !q) return null;
  return pecahan(p.num * q.num, p.den * q.den);
}

function bagiPecahan(p, q) {
  if (!p || !q || q.num === 0) return null;
  return pecahan(p.num * q.den, p.den * q.num);
}

function samaPecahan(p, q) {
  if (!p || !q) return false;
  return p.num * q.den === q.num * p.den;
}

function nilaiPecahan(p) {
  return p.num / p.den;
}

/* '16', '1/8', '−1/8', '1.000.000'; null → 'tak terdefinisi'. */
function formatPecahan(p) {
  if (!p) return 'tak terdefinisi';
  var tanda = p.num < 0 ? '−' : '';
  var num = formatNumber(Math.abs(p.num));
  return tanda + (p.den === 1 ? num : num + '/' + formatNumber(p.den));
}

/* Basis ditulis dengan kurung bila negatif atau pecahan: (−3), (2/3). */
function formatBasis(a) {
  if (typeof a === 'string') return a;
  if (typeof a === 'object' && a !== null) return '(' + formatPecahan(a) + ')';
  return a < 0 ? '(−' + Math.abs(a) + ')' : String(a);
}

function formatPangkat(a, n) {
  return formatBasis(a) + superskrip(n);
}

/*
 * Nilai aⁿ untuk eksponen bulat n, sebagai pecahan eksak.
 *   n > 0 → a × a × … (n faktor);  n = 0 → 1;  n < 0 → 1 / a⁻ⁿ.
 * a boleh bulat atau pecahan { num, den }. 0⁰ dan 0⁻ⁿ → null.
 */
function pangkatBulat(a, n) {
  var basis = keFraksi(a);
  if (basis.num === 0 && n <= 0) return null;
  var hasil = pecahan(1, 1);
  for (var i = 0; i < Math.abs(n); i++) hasil = kaliPecahan(hasil, basis);
  return n < 0 ? bagiPecahan(pecahan(1, 1), hasil) : hasil;
}

/*
 * Membaca isian bilangan secara eksak: bulat ('−27', '1.000'),
 * pecahan ('1/8', '−1/9') atau desimal berkoma/bertitik ('0,25').
 * Titik diperlakukan sebagai pemisah ribuan bila diikuti tepat tiga
 * angka dan angka depannya bukan 0 (gaya Indonesia: '1.000'), selain
 * itu sebagai koma desimal ('0.125').
 * Kembalian: { value: {num, den} | null, error: null | 'empty' | 'invalid' }.
 */
function parseInputPecahan(str) {
  if (!str || String(str).trim() === '') return { value: null, error: 'empty' };
  var s = String(str).trim().replace(/\s/g, '').replace(/−/g, '-');
  var m = s.match(/^([-+]?)(\d+)\/(\d+)$/);
  if (m) {
    var den = parseInt(m[3], 10);
    if (den === 0) return { value: null, error: 'invalid' };
    var num = parseInt(m[2], 10) * (m[1] === '-' ? -1 : 1);
    return { value: pecahan(num, den), error: null };
  }
  if (/^[-+]?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  var d = s.replace(',', '.').match(/^([-+]?)(\d*)(?:\.(\d+))?$/);
  if (!d || (d[2] === '' && !d[3])) return { value: null, error: 'invalid' };
  var digitDesimal = d[3] || '';
  var skala = Math.pow(10, digitDesimal.length);
  var pembilang = parseInt((d[2] || '0') + digitDesimal, 10) * (d[1] === '-' ? -1 : 1);
  return { value: pecahan(pembilang, skala), error: null };
}

/* Baris tangga pangkat dari eksponen `dari` turun sampai `sampai`. */
function tanggaPangkat(a, dari, sampai) {
  var out = [];
  for (var n = dari; n >= sampai; n--) out.push({ n: n, nilai: pangkatBulat(a, n) });
  return out;
}

function faktorPangkat(a, n) {
  var out = [];
  for (var i = 0; i < n; i++) out.push(a);
  return out;
}

/* Menulis eksponen di dalam penjumlahan: 3 + (−1). */
function tulisSuku(n) {
  return n < 0 ? '(−' + Math.abs(n) + ')' : String(n);
}

/*
 * Sifat-sifat eksponen. `keliru` true menandai dugaan keliru yang
 * sengaja disediakan agar murid mencari contoh penyangkalnya.
 */
var SIFAT_EKSPONEN = {
  kali: { nama: 'Perkalian', rumus: 'aᵐ × aⁿ = aᵐ⁺ⁿ', keliru: false, pakaiB: false },
  bagi: { nama: 'Pembagian', rumus: 'aᵐ : aⁿ = aᵐ⁻ⁿ', keliru: false, pakaiB: false },
  pangkat: { nama: 'Pangkat dari pangkat', rumus: '(aᵐ)ⁿ = aᵐˣⁿ', keliru: false, pakaiB: false },
  kaliBasis: {
    nama: 'Pangkat dari perkalian',
    rumus: '(a × b)ⁿ = aⁿ × bⁿ',
    keliru: false,
    pakaiB: true,
  },
  bagiBasis: {
    nama: 'Pangkat dari pembagian',
    rumus: '(a : b)ⁿ = aⁿ : bⁿ',
    keliru: false,
    pakaiB: true,
  },
  salahKali: { nama: 'Dugaan A', rumus: 'aᵐ × aⁿ = aᵐˣⁿ ?', keliru: true, pakaiB: false },
  salahNegatif: { nama: 'Dugaan B', rumus: 'a⁻ⁿ = −aⁿ ?', keliru: true, pakaiB: false },
};

/* Apakah sifat memakai eksponen m (sifat basis & dugaan B hanya memakai n). */
function sifatPakaiM(id) {
  return ['kali', 'bagi', 'pangkat', 'salahKali'].indexOf(id) !== -1;
}

/*
 * Menghitung kedua ruas sebuah sifat untuk nilai a, m, n (dan b).
 * Kembalian { kiri, kanan, teksKiri, teksKanan, catatan, terdefinisi, sama }.
 * Ruas yang memuat 0⁰, 0⁻ⁿ atau pembagian dengan 0 → terdefinisi false.
 */
function cekSifatEksponen(id, a, m, n, b) {
  var P = pangkatBulat;
  var F = formatPangkat;
  var kiri, kanan, teksKiri, teksKanan, catatan;
  if (id === 'kali') {
    kiri = kaliPecahan(P(a, m), P(a, n));
    kanan = P(a, m + n);
    teksKiri = F(a, m) + ' × ' + F(a, n);
    teksKanan = F(a, m + n);
    catatan = tulisSuku(m) + ' + ' + tulisSuku(n) + ' = ' + fmtBulat(m + n);
  } else if (id === 'bagi') {
    kiri = bagiPecahan(P(a, m), P(a, n));
    kanan = P(a, m - n);
    teksKiri = F(a, m) + ' : ' + F(a, n);
    teksKanan = F(a, m - n);
    catatan = tulisSuku(m) + ' − ' + tulisSuku(n) + ' = ' + fmtBulat(m - n);
  } else if (id === 'pangkat') {
    kiri = P(a, m) === null ? null : P(P(a, m), n);
    kanan = P(a, m * n);
    teksKiri = '(' + F(a, m) + ')' + superskrip(n);
    teksKanan = F(a, m * n);
    catatan = tulisSuku(m) + ' × ' + tulisSuku(n) + ' = ' + fmtBulat(m * n);
  } else if (id === 'kaliBasis') {
    kiri = P(a * b, n);
    kanan = kaliPecahan(P(a, n), P(b, n));
    teksKiri = '(' + a + ' × ' + b + ')' + superskrip(n);
    teksKanan = F(a, n) + ' × ' + F(b, n);
    catatan = 'setiap faktor dipangkatkan ' + fmtBulat(n);
  } else if (id === 'bagiBasis') {
    kiri = b === 0 ? null : P(pecahan(a, b), n);
    kanan = bagiPecahan(P(a, n), P(b, n));
    teksKiri = '(' + a + ' : ' + b + ')' + superskrip(n);
    teksKanan = F(a, n) + ' : ' + F(b, n);
    catatan = 'pembilang dan penyebut dipangkatkan ' + fmtBulat(n);
  } else if (id === 'salahKali') {
    kiri = kaliPecahan(P(a, m), P(a, n));
    kanan = P(a, m * n);
    teksKiri = F(a, m) + ' × ' + F(a, n);
    teksKanan = F(a, m * n);
    catatan = tulisSuku(m) + ' × ' + tulisSuku(n) + ' = ' + fmtBulat(m * n);
  } else if (id === 'salahNegatif') {
    kiri = P(a, -n);
    var pos = P(a, n);
    kanan = pos === null ? null : pecahan(-pos.num, pos.den);
    teksKiri = F(a, -n);
    teksKanan = '−' + F(a, n);
    catatan = 'bandingkan tanda dan besar kedua ruas';
  } else {
    throw new Error('sifat eksponen tidak dikenal: ' + id);
  }
  var terdefinisi = kiri !== null && kanan !== null;
  return {
    kiri: kiri,
    kanan: kanan,
    teksKiri: teksKiri,
    teksKanan: teksKanan,
    catatan: catatan,
    terdefinisi: terdefinisi,
    sama: terdefinisi && samaPecahan(kiri, kanan),
  };
}

/*
 * Diagnosa jawaban murid untuk nilai aⁿ (jawab berupa pecahan):
 *   'benar' | 'nolJadiNol' (a⁰ = 0) | 'nolJadiBasis' (a⁰ = a) |
 *   'negatifJadiMinus' (a⁻ⁿ = −aⁿ) | 'tandaPecahan' (a⁻ⁿ = −1/aⁿ) |
 *   'kaliEksponen' (aⁿ = a × n) | 'lain'
 */
function diagnosaPangkat(a, n, jawab) {
  var benar = pangkatBulat(a, n);
  if (!jawab) return 'lain';
  if (samaPecahan(jawab, benar)) return 'benar';
  if (n === 0 && jawab.num === 0) return 'nolJadiNol';
  if (n === 0 && samaPecahan(jawab, pecahan(a, 1))) return 'nolJadiBasis';
  if (n < 0) {
    var pos = pangkatBulat(a, -n);
    if (samaPecahan(jawab, pecahan(-pos.num, pos.den))) return 'negatifJadiMinus';
    if (samaPecahan(jawab, pecahan(-benar.num, benar.den))) return 'tandaPecahan';
  }
  if (samaPecahan(jawab, pecahan(a * n, 1))) return 'kaliEksponen';
  return 'lain';
}

/* Pesan umpan balik diagnosa; ditampilkan setelah label bilangan berpangkatnya. */
function pesanDiagnosaPangkat(kode, a, n) {
  var pesan = {
    nolJadiNol:
      'Nilainya bukan 0. Lihat tangga pangkat: setiap turun satu anak tangga nilainya <em>dibagi</em> ' +
      a +
      ', bukan dikurangi sampai habis.',
    nolJadiBasis:
      'Nilainya bukan ' +
      a +
      '. Nilai ' +
      formatPangkat(a, 1) +
      ' = ' +
      a +
      ' masih harus dibagi ' +
      a +
      ' sekali lagi untuk turun ke pangkat 0.',
    negatifJadiMinus:
      'Pangkat negatif <strong>tidak</strong> membuat hasilnya negatif. Teruskan pola membagi dengan ' +
      a +
      ' di bawah pangkat 0.',
    tandaPecahan:
      'Bentuk pecahannya sudah tepat, tetapi tandanya belum. Membagi bilangan positif dengan ' +
      a +
      ' tidak mengubah tandanya.',
    kaliEksponen:
      'Nilainya bukan ' +
      a +
      ' × ' +
      tulisSuku(n) +
      '. Pangkat berarti perkalian <em>berulang</em> (atau pembagian berulang untuk pangkat negatif).',
    lain: 'Belum tepat. Mulailah dari anak tangga di atasnya, lalu bagi dengan ' + a + '.',
  };
  return pesan[kode] || pesan.lain;
}

/* ------------------------------------------------------------
   Tangga pangkat: kolom aⁿ dari eksponen `dari` turun ke `sampai`
   dengan panah "÷ a" di antara anak tangga.
     cfg     { a, dari, sampai, diketahui: [n, …] } — nilai yang
             ditampilkan; eksponen lain diisi murid
     inputs  { '<n>': 'isian' }
     opts.tanya    true → sel yang belum diketahui ditampilkan '?'
                   (tanpa isian; untuk tahap stimulasi)
     opts.checked  true → tandai sel terisi ✓/✗
     opts.locked   true → isian dinonaktifkan
     opts.faktor   true → tampilkan uraian faktor untuk n > 0
     opts.caption  label aksesibel
   ------------------------------------------------------------ */

function powerLadderCellCorrect(a, n, str) {
  var parsed = parseInputPecahan(String(str || ''));
  return !parsed.error && samaPecahan(parsed.value, pangkatBulat(a, n));
}

function powerLadderEditable(cfg) {
  var out = [];
  for (var n = cfg.dari; n >= cfg.sampai; n--) {
    if ((cfg.diketahui || []).indexOf(n) === -1) out.push(n);
  }
  return out;
}

function powerLadderFilled(cfg, inputs) {
  return powerLadderEditable(cfg).every(function (n) {
    return String((inputs || {})[n] || '').trim() !== '';
  });
}

function powerLadderAllCorrect(cfg, inputs) {
  return powerLadderEditable(cfg).every(function (n) {
    return powerLadderCellCorrect(cfg.a, n, (inputs || {})[n]);
  });
}

function buildPowerLadder(id, cfg, inputs, opts) {
  opts = opts || {};
  inputs = inputs || {};
  var a = cfg.a;
  var html = '';
  for (var n = cfg.dari; n >= cfg.sampai; n--) {
    var diketahui = (cfg.diketahui || []).indexOf(n) !== -1;
    var nilai = pangkatBulat(a, n);
    var sel;
    var tanda = '';
    if (diketahui) {
      sel = '<span class="pw-ladder__val">' + esc(formatPecahan(nilai)) + '</span>';
    } else if (opts.tanya) {
      sel = '<span class="pw-ladder__val pw-ladder__val--tanya">?</span>';
    } else {
      var isi = inputs[n] || '';
      var terisi = String(isi).trim() !== '';
      var benar = terisi && powerLadderCellCorrect(a, n, isi);
      if (opts.checked && terisi) {
        tanda =
          '<span class="pw-ladder__mark pw-ladder__mark--' +
          (benar ? 'ok' : 'no') +
          '" aria-label="' +
          (benar ? 'benar' : 'belum tepat') +
          '">' +
          (benar ? '✓' : '✗') +
          '</span>';
      }
      sel =
        '<input type="text" class="input-text pw-ladder__input' +
        (opts.checked && terisi && !benar ? ' has-error' : '') +
        '" id="' +
        id +
        '-in-' +
        n +
        '" data-ladder="' +
        esc(id) +
        '" data-n="' +
        n +
        '" inputmode="text" autocomplete="off" value="' +
        esc(isi) +
        '" aria-label="Nilai ' +
        esc(formatBasis(a)) +
        ' pangkat ' +
        fmtBulat(n) +
        '" placeholder="…"' +
        (opts.locked ? ' disabled' : '') +
        '>';
    }
    if (n < cfg.dari) {
      html +=
        '<li class="pw-ladder__step" aria-hidden="true"><span class="pw-ladder__arrow">↓</span> ÷ ' +
        esc(formatBasis(a)) +
        '</li>';
    }
    var uraian = '';
    if (opts.faktor) {
      uraian =
        '<span class="pw-ladder__faktor">' +
        (n > 0 ? esc(faktorPangkat(formatBasis(a), n).join(' × ')) : '') +
        '</span>';
    }
    html +=
      '<li class="pw-ladder__row' +
      (n === 0 ? ' pw-ladder__row--nol' : n < 0 ? ' pw-ladder__row--neg' : '') +
      '">' +
      '<span class="pw-ladder__pow">' +
      esc(formatPangkat(a, n)) +
      '</span>' +
      '<span class="pw-ladder__eq" aria-hidden="true">=</span>' +
      sel +
      tanda +
      uraian +
      '</li>';
  }
  return (
    '<ol class="pw-ladder" aria-label="' +
    esc(opts.caption || 'Tangga pangkat ' + formatBasis(a)) +
    '">' +
    html +
    '</ol>'
  );
}

/* onEnter dipanggil saat murid menekan Enter di salah satu isian. */
function bindPowerLadder(root, id, inputs, save, onEnter) {
  root.querySelectorAll('[data-ladder="' + id + '"]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      inputs[inp.dataset.n] = inp.value;
      save();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && onEnter) onEnter();
    });
  });
}

/* ------------------------------------------------------------
   Ubin faktor: menguraikan bilangan berpangkat menjadi faktor.
     spec { jenis: 'kali', a, m, n }        aᵐ × aⁿ (dua kelompok)
          { jenis: 'bagi', a, m, n, coret } aᵐ : aⁿ sebagai pecahan;
                                             coret true → pasangan faktor
                                             pembilang–penyebut dicoret
          { jenis: 'pangkat', a, m, n }     (aᵐ)ⁿ = n kelompok isi m
          { jenis: 'kaliBasis', a, b, n }   (a × b)ⁿ = n kelompok (a, b)
   ------------------------------------------------------------ */

function fxTile(teks, cls) {
  return '<span class="fx-tile' + (cls ? ' ' + cls : '') + '">' + esc(teks) + '</span>';
}

function fxGroup(tiles, ton) {
  return '<span class="fx-group fx-group--' + ton + '">' + tiles.join('') + '</span>';
}

function buildFactorTiles(spec, opts) {
  opts = opts || {};
  var a = formatBasis(spec.a);
  var i;
  var isi = '';
  var aria = '';
  if (spec.jenis === 'kali') {
    var g1 = faktorPangkat(a, spec.m).map(function (x) {
      return fxTile(x);
    });
    var g2 = faktorPangkat(a, spec.n).map(function (x) {
      return fxTile(x);
    });
    isi = fxGroup(g1, 'a') + '<span class="fx-op">×</span>' + fxGroup(g2, 'b');
    aria =
      formatPangkat(spec.a, spec.m) +
      ' kali ' +
      formatPangkat(spec.a, spec.n) +
      ': ' +
      (spec.m + spec.n) +
      ' faktor ' +
      a;
  } else if (spec.jenis === 'bagi') {
    var k = spec.coret ? Math.min(spec.m, spec.n) : 0;
    var atas = [];
    var bawah = [];
    for (i = 0; i < spec.m; i++) atas.push(fxTile(a, i < k ? 'fx-tile--coret' : ''));
    for (i = 0; i < spec.n; i++) bawah.push(fxTile(a, i < k ? 'fx-tile--coret' : ''));
    if (spec.coret && spec.m <= spec.n) atas.push('<span class="fx-one">1</span>');
    isi =
      '<span class="fx-frac">' +
      '<span class="fx-frac__row">' +
      fxGroup(atas, 'a') +
      '</span>' +
      '<span class="fx-frac__bar" aria-hidden="true"></span>' +
      '<span class="fx-frac__row">' +
      fxGroup(bawah, 'b') +
      '</span>' +
      '</span>';
    aria =
      formatPangkat(spec.a, spec.m) +
      ' dibagi ' +
      formatPangkat(spec.a, spec.n) +
      (spec.coret ? ': ' + k + ' pasang faktor dicoret' : '');
  } else if (spec.jenis === 'pangkat') {
    var grup = [];
    for (i = 0; i < spec.n; i++) {
      grup.push(
        fxGroup(
          faktorPangkat(a, spec.m).map(function (x) {
            return fxTile(x);
          }),
          i % 2 ? 'b' : 'a'
        )
      );
    }
    isi = grup.join('<span class="fx-op">×</span>');
    aria =
      '(' +
      formatPangkat(spec.a, spec.m) +
      ') pangkat ' +
      spec.n +
      ': ' +
      spec.n +
      ' kelompok berisi ' +
      spec.m +
      ' faktor ' +
      a;
  } else if (spec.jenis === 'kaliBasis') {
    var b = formatBasis(spec.b);
    var pas = [];
    for (i = 0; i < spec.n; i++) pas.push(fxGroup([fxTile(a), fxTile(b, 'fx-tile--b')], 'a'));
    isi = pas.join('<span class="fx-op">×</span>');
    aria = '(' + a + ' × ' + b + ') pangkat ' + spec.n + ': ' + spec.n + ' pasang faktor';
  }
  return (
    '<figure class="fx-tiles" role="img" aria-label="' +
    esc(aria) +
    '">' +
    '<div class="fx-tiles__body">' +
    isi +
    '</div>' +
    (opts.caption ? '<figcaption class="dl-caption">' + opts.caption + '</figcaption>' : '') +
    '</figure>'
  );
}

/* ------------------------------------------------------------
   Lab uji sifat eksponen: murid memilih sifat, mengatur a, m, n
   (dan b) dengan stepper, melihat kedua ruas dihitung, lalu
   mencatat uji. Syarat selesai per sifat:
     { sifat, min, nonPositif, sangkal }
       min         banyak uji tercatat minimal
       nonPositif  harus ada uji dengan eksponen 0 atau negatif
       sangkal     (dugaan keliru) harus ada uji yang TIDAK sama
   ------------------------------------------------------------ */

function makeExponentLabState(sifat) {
  return { sifat: sifat || 'kali', a: 2, m: 3, n: 2, b: 3, log: [] };
}

function labKunci(st) {
  var d = SIFAT_EKSPONEN[st.sifat];
  return [st.sifat, st.a, sifatPakaiM(st.sifat) ? st.m : '', st.n, d && d.pakaiB ? st.b : ''].join(
    '|'
  );
}

function labHasil(st) {
  return cekSifatEksponen(st.sifat, st.a, st.m, st.n, st.b);
}

/* Mencatat uji saat ini: 'ok' | 'duplikat' | 'tidakTerdefinisi'. */
function labCatat(st) {
  var r = labHasil(st);
  if (!r.terdefinisi) return 'tidakTerdefinisi';
  var kunci = labKunci(st);
  var ada = st.log.some(function (u) {
    return u.kunci === kunci;
  });
  if (ada) return 'duplikat';
  var pakaiM = sifatPakaiM(st.sifat);
  st.log.push({
    kunci: kunci,
    sifat: st.sifat,
    teksKiri: r.teksKiri,
    teksKanan: r.teksKanan,
    kiri: formatPecahan(r.kiri),
    kanan: formatPecahan(r.kanan),
    sama: r.sama,
    nonPositif: st.n <= 0 || (pakaiM && st.m <= 0),
  });
  return 'ok';
}

function labRingkasan(st, syarat) {
  return syarat.map(function (s) {
    var uji = st.log.filter(function (u) {
      return u.sifat === s.sifat;
    });
    var nonPositif = uji.some(function (u) {
      return u.nonPositif;
    });
    var sangkal = uji.some(function (u) {
      return !u.sama;
    });
    return {
      sifat: s.sifat,
      jumlah: uji.length,
      min: s.min,
      nonPositif: nonPositif,
      sangkal: sangkal,
      selesai: uji.length >= s.min && (!s.nonPositif || nonPositif) && (!s.sangkal || sangkal),
    };
  });
}

function labSyaratSelesai(st, syarat) {
  return labRingkasan(st, syarat).every(function (r) {
    return r.selesai;
  });
}

/* opts.batasA = [min, max] untuk a & b; opts.batasE untuk m & n. */
function ubahExponentLab(st, key, step, opts) {
  opts = opts || {};
  var batas = key === 'a' || key === 'b' ? opts.batasA || [-5, 5] : opts.batasE || [-4, 4];
  st[key] = Math.max(batas[0], Math.min(batas[1], st[key] + step));
}

/*
 * opts.sifat   daftar id sifat yang bisa dipilih
 * opts.syarat  syarat selesai (untuk daftar periksa)
 * opts.batasA, opts.batasE  batas stepper
 */
function buildExponentLab(id, st, opts) {
  opts = opts || {};
  var batasA = opts.batasA || [-5, 5];
  var batasE = opts.batasE || [-4, 4];
  var d = SIFAT_EKSPONEN[st.sifat];
  var r = labHasil(st);
  var pilihan = (opts.sifat || Object.keys(SIFAT_EKSPONEN))
    .map(function (sid) {
      var s = SIFAT_EKSPONEN[sid];
      return (
        '<button type="button" class="xlab__sifat' +
        (s.keliru ? ' xlab__sifat--dugaan' : '') +
        '" data-xlab-sifat="' +
        esc(sid) +
        '" aria-pressed="' +
        (sid === st.sifat ? 'true' : 'false') +
        '"><span class="xlab__sifat-nama">' +
        esc(s.nama) +
        '</span><span class="xlab__sifat-rumus">' +
        esc(s.rumus) +
        '</span></button>'
      );
    })
    .join('');

  var stepper = function (key, label, batas) {
    return buildIntegerStepper(id + '-' + key, label, st[key], { min: batas[0], max: batas[1] });
  };

  var vonis;
  if (!r.terdefinisi) {
    vonis =
      '<p class="xlab__vonis xlab__vonis--undef">⚠ Tak terdefinisi — ada pembagian dengan 0 (0⁰ atau 0 berpangkat negatif). Pilih a ≠ 0.</p>';
  } else if (r.sama) {
    vonis = '<p class="xlab__vonis xlab__vonis--ok">✓ Kedua ruas SAMA</p>';
  } else {
    vonis =
      '<p class="xlab__vonis xlab__vonis--no">✗ Kedua ruas TIDAK sama — contoh penyangkal!</p>';
  }

  var ringkasan = opts.syarat
    ? '<ul class="xlab__cek">' +
      labRingkasan(st, opts.syarat)
        .map(function (s) {
          var info = SIFAT_EKSPONEN[s.sifat];
          var ket = s.jumlah + '/' + s.min + ' uji';
          var syaratIni = opts.syarat.filter(function (x) {
            return x.sifat === s.sifat;
          })[0];
          if (syaratIni.nonPositif)
            ket += s.nonPositif ? ' · ada eksponen ≤ 0 ✓' : ' · perlu eksponen 0/negatif';
          if (syaratIni.sangkal)
            ket += s.sangkal ? ' · penyangkal ditemukan ✓' : ' · cari penyangkal';
          return (
            '<li class="xlab__cek-item' +
            (s.selesai ? ' xlab__cek-item--done' : '') +
            '"><span aria-hidden="true">' +
            (s.selesai ? '✅' : '⬜') +
            '</span> <strong>' +
            esc(info.nama) +
            '</strong> <span class="xlab__cek-ket">' +
            esc(ket) +
            '</span></li>'
          );
        })
        .join('') +
      '</ul>'
    : '';

  var log = st.log.length
    ? '<div class="xlab__log-wrap"><table class="xlab__log">' +
      '<caption class="sr-only">Catatan uji sifat eksponen</caption>' +
      '<thead><tr><th scope="col">Ruas kiri</th><th scope="col">Ruas kanan</th><th scope="col">Hasil</th></tr></thead><tbody>' +
      st.log
        .map(function (u) {
          return (
            '<tr><td>' +
            esc(u.teksKiri) +
            ' = ' +
            esc(u.kiri) +
            '</td><td>' +
            esc(u.teksKanan) +
            ' = ' +
            esc(u.kanan) +
            '</td><td>' +
            (u.sama
              ? '<span class="xlab__tag xlab__tag--ok">sama</span>'
              : '<span class="xlab__tag xlab__tag--no">beda</span>') +
            '</td></tr>'
          );
        })
        .join('') +
      '</tbody></table></div>'
    : '<p class="dl-caption">Belum ada uji yang dicatat.</p>';

  return (
    '<div class="xlab" id="' +
    id +
    '">' +
    '<div class="xlab__pilih" role="group" aria-label="Pilih sifat yang diuji">' +
    pilihan +
    '</div>' +
    '<div class="xlab__stepper">' +
    stepper('a', 'Basis a', batasA) +
    (sifatPakaiM(st.sifat) ? stepper('m', 'Eksponen m', batasE) : '') +
    stepper('n', 'Eksponen n', batasE) +
    (d.pakaiB ? stepper('b', 'Basis b', batasA) : '') +
    '</div>' +
    '<div class="xlab__hasil" aria-live="polite">' +
    '<div class="xlab__ruas"><span class="xlab__ruas-label">Ruas kiri</span><span class="xlab__ruas-teks">' +
    esc(r.teksKiri) +
    '</span><span class="xlab__ruas-nilai">= ' +
    esc(formatPecahan(r.kiri)) +
    '</span></div>' +
    '<div class="xlab__ruas"><span class="xlab__ruas-label">Ruas kanan</span><span class="xlab__ruas-teks">' +
    esc(r.teksKanan) +
    '</span><span class="xlab__ruas-nilai">= ' +
    esc(formatPecahan(r.kanan)) +
    '</span></div>' +
    '<p class="xlab__catatan">Eksponen: ' +
    esc(r.catatan) +
    '</p>' +
    vonis +
    '</div>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    '-catat">📝 Catat uji ini</button>' +
    '</div>' +
    ringkasan +
    log +
    '</div>'
  );
}

/* onChange(pesan) dipanggil setelah state berubah; pesan opsional untuk notice. */
function bindExponentLab(root, id, st, opts, onChange) {
  opts = opts || {};
  root.querySelectorAll('[data-xlab-sifat]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      st.sifat = btn.dataset.xlabSifat;
      onChange();
    });
  });
  ['a', 'm', 'n', 'b'].forEach(function (key) {
    bindIntegerStepper(root, id + '-' + key, function (delta) {
      ubahExponentLab(st, key, delta, opts);
      onChange();
    });
  });
  var catat = root.querySelector('#' + id + '-catat');
  if (catat) {
    catat.addEventListener('click', function () {
      var hasil = labCatat(st);
      var pesan = {
        ok: 'Uji dicatat.',
        duplikat: 'Uji ini sudah dicatat. Coba nilai a, m, atau n yang lain.',
        tidakTerdefinisi: 'Uji dengan hasil tak terdefinisi tidak dicatat. Pilih a ≠ 0.',
      };
      onChange(pesan[hasil]);
    });
  }
}

/* ============================================================
   28. PELUANG KEJADIAN MAJEMUK
   Dipakai modul peluang kejadian majemuk (fase-f/mpi-15.1).
   Peluang dihitung EKSAK sebagai pecahan { num, den } (seksi 27)
   dengan mencacah ruang sampel, sehingga sifat saling lepas dan
   saling bebas dapat diperiksa langsung dari data:
     saling lepas  ⇔ n(A ∩ B) = 0
     saling bebas  ⇔ P(A ∩ B) = P(A) × P(B)
   Isi:
     - tambah/kurang pecahan
     - ruang sampel: satu/dua dadu, koin, koin + dadu, kartu remi,
       dua kartu dengan/tanpa pengembalian
     - predikat kejadian bernama ('jumlah:7', 'kembar', 'koin:A',
       'dadu:genap', 'nilai:A', 'jenis:hati', 'k1:nilai:A', …),
       digabung dengan '|' (gabungan) dan '&' (irisan)
     - sifat dua kejadian, rumus gabungan & irisan saling bebas
     - diagnosa miskonsepsi rumus peluang
     - simulator percobaan acak (RNG dapat diinjeksi untuk tes)
     - grid ruang sampel bertanda A/B, diagram Venn banyak anggota
   Gaya .prob-* ada di shared/base.css.
   ============================================================ */

function tambahPecahan(p, q) {
  if (!p || !q) return null;
  return pecahan(p.num * q.den + q.num * p.den, p.den * q.den);
}

function kurangPecahan(p, q) {
  if (!p || !q) return null;
  return pecahan(p.num * q.den - q.num * p.den, p.den * q.den);
}

var JENIS_KARTU = [
  { id: 'hati', nama: 'Hati', simbol: '♥', warna: 'merah' },
  { id: 'wajik', nama: 'Wajik', simbol: '♦', warna: 'merah' },
  { id: 'keriting', nama: 'Keriting', simbol: '♣', warna: 'hitam' },
  { id: 'sekop', nama: 'Sekop', simbol: '♠', warna: 'hitam' },
];
var NILAI_KARTU = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
var SISI_KOIN = [
  { id: 'A', nama: 'Angka' },
  { id: 'G', nama: 'Gambar' },
];

/* 52 kartu remi { id, nilai, jenis, warna, simbol }, urut per jenis. */
function dekKartu() {
  var out = [];
  JENIS_KARTU.forEach(function (j) {
    NILAI_KARTU.forEach(function (v) {
      out.push({ id: v + '-' + j.id, nilai: v, jenis: j.id, warna: j.warna, simbol: j.simbol });
    });
  });
  return out;
}

/* n koin sekaligus: { koin1, koin2, … } berisi 'A' (angka) atau 'G' (gambar). */
function ruangSampelKoin(n) {
  var out = [{}];
  for (var i = 1; i <= n; i++) {
    var next = [];
    out.forEach(function (o) {
      SISI_KOIN.forEach(function (s) {
        var baru = Object.assign({}, o);
        baru['koin' + i] = s.id;
        next.push(baru);
      });
    });
    out = next;
  }
  return out;
}

function ruangSampelDuaKartu(kembali) {
  var dek = dekKartu();
  var out = [];
  dek.forEach(function (k1) {
    dek.forEach(function (k2) {
      if (kembali || k1.id !== k2.id) out.push({ k1: k1, k2: k2 });
    });
  });
  return out;
}

var RUANG_SAMPEL_BUAT = {
  satuDadu: function () {
    return [1, 2, 3, 4, 5, 6].map(function (d) {
      return { dadu: d };
    });
  },
  duaDadu: function () {
    var out = [];
    for (var a = 1; a <= 6; a++) for (var b = 1; b <= 6; b++) out.push({ d1: a, d2: b });
    return out;
  },
  satuKoin: function () {
    return SISI_KOIN.map(function (s) {
      return { koin: s.id };
    });
  },
  duaKoin: function () {
    return ruangSampelKoin(2);
  },
  koinDadu: function () {
    var out = [];
    SISI_KOIN.forEach(function (s) {
      for (var d = 1; d <= 6; d++) out.push({ koin: s.id, dadu: d });
    });
    return out;
  },
  kartu: dekKartu,
  duaKartuKembali: function () {
    return ruangSampelDuaKartu(true);
  },
  duaKartuTanpa: function () {
    return ruangSampelDuaKartu(false);
  },
};
var RUANG_SAMPEL_CACHE = {};

/* Ruang sampel bernama (disimpan sekali; jangan dimutasi). */
function ruangSampel(id) {
  if (!RUANG_SAMPEL_BUAT[id]) throw new Error('Ruang sampel tidak dikenal: ' + id);
  if (!RUANG_SAMPEL_CACHE[id]) RUANG_SAMPEL_CACHE[id] = RUANG_SAMPEL_BUAT[id]();
  return RUANG_SAMPEL_CACHE[id];
}

/* Uji bilangan: 'genap', 'ganjil', 'prima', 'min:N', 'maks:N', atau 'N'. */
function ujiAngkaPeluang(spec) {
  if (spec === 'genap')
    return function (v) {
      return v % 2 === 0;
    };
  if (spec === 'ganjil')
    return function (v) {
      return v % 2 === 1;
    };
  if (spec === 'prima')
    return function (v) {
      return v === 2 || v === 3 || v === 5;
    };
  var m = /^(min|maks):(\d+)$/.exec(spec);
  if (m) {
    var batas = parseInt(m[2], 10);
    return m[1] === 'min'
      ? function (v) {
          return v >= batas;
        }
      : function (v) {
          return v <= batas;
        };
  }
  if (/^\d+$/.test(spec)) {
    var n = parseInt(spec, 10);
    return function (v) {
      return v === n;
    };
  }
  return null;
}

/* Predikat satu kejadian dasar (tanpa '|' / '&'). */
function predikatAtom(atom) {
  if (atom === 'kembar')
    return function (o) {
      return o.d1 === o.d2;
    };
  if (atom === 'wajah')
    return function (o) {
      return o.nilai === 'J' || o.nilai === 'Q' || o.nilai === 'K';
    };
  var i = atom.indexOf(':');
  var kunci = i === -1 ? atom : atom.slice(0, i);
  var isi = i === -1 ? '' : atom.slice(i + 1);
  var uji;
  if (kunci === 'k1' || kunci === 'k2') {
    var dalam = predikatAtom(isi);
    return function (o) {
      return dalam(o[kunci]);
    };
  }
  if (kunci === 'jumlah') {
    uji = ujiAngkaPeluang(isi);
    if (uji)
      return function (o) {
        return uji(o.d1 + o.d2);
      };
  }
  if (kunci === 'dadu' || kunci === 'dadu1' || kunci === 'dadu2') {
    var field = kunci === 'dadu' ? 'dadu' : kunci === 'dadu1' ? 'd1' : 'd2';
    uji = ujiAngkaPeluang(isi);
    if (uji)
      return function (o) {
        return uji(o[field]);
      };
  }
  if (/^koin\d?$/.test(kunci) && (isi === 'A' || isi === 'G')) {
    return function (o) {
      return o[kunci] === isi;
    };
  }
  if ((kunci === 'nilai' || kunci === 'jenis' || kunci === 'warna') && isi) {
    return function (o) {
      return o[kunci] === isi;
    };
  }
  throw new Error('Kejadian tidak dikenal: ' + atom);
}

/*
 * Predikat kejadian: 'X|Y' = gabungan (X atau Y), 'X&Y' = irisan
 * (X dan Y); '&' lebih kuat daripada '|'.
 */
function predikatKejadian(id) {
  var atau = String(id)
    .split('|')
    .map(function (bagian) {
      var dan = bagian.split('&').map(predikatAtom);
      return function (o) {
        return dan.every(function (p) {
          return p(o);
        });
      };
    });
  return function (o) {
    return atau.some(function (p) {
      return p(o);
    });
  };
}

function filterKejadian(S, id) {
  return S.filter(predikatKejadian(id));
}

function ruangDari(ruang) {
  return typeof ruang === 'string' ? ruangSampel(ruang) : ruang;
}

/* P(A) = n(A) / n(S), eksak. `ruang` berupa id atau array hasil. */
function peluangKejadian(ruang, id) {
  var S = ruangDari(ruang);
  return pecahan(filterKejadian(S, id).length, S.length);
}

/*
 * Semua besaran dua kejadian A dan B pada satu ruang sampel:
 * { nS, nA, nB, nIrisan, nGabungan, pA, pB, pIrisan, pGabungan,
 *   salingLepas, salingBebas }.
 */
function sifatKejadian(ruang, idA, idB) {
  var S = ruangDari(ruang);
  var pa = predikatKejadian(idA);
  var pb = predikatKejadian(idB);
  var nA = 0;
  var nB = 0;
  var nI = 0;
  S.forEach(function (o) {
    var a = pa(o);
    var b = pb(o);
    if (a) nA++;
    if (b) nB++;
    if (a && b) nI++;
  });
  var nS = S.length;
  var pA = pecahan(nA, nS);
  var pB = pecahan(nB, nS);
  var pI = pecahan(nI, nS);
  return {
    nS: nS,
    nA: nA,
    nB: nB,
    nIrisan: nI,
    nGabungan: nA + nB - nI,
    pA: pA,
    pB: pB,
    pIrisan: pI,
    pGabungan: pecahan(nA + nB - nI, nS),
    salingLepas: nI === 0,
    salingBebas: samaPecahan(pI, kaliPecahan(pA, pB)),
  };
}

/* P(A ∪ B) = P(A) + P(B) − P(A ∩ B); pIrisan boleh kosong (saling lepas). */
function peluangGabungan(pA, pB, pIrisan) {
  return kurangPecahan(tambahPecahan(pA, pB), pIrisan || pecahan(0, 1));
}

/* P(A ∩ B) = P(A) × P(B), khusus kejadian saling bebas. */
function peluangIrisanBebas(pA, pB) {
  return kaliPecahan(pA, pB);
}

/* Besaran bernama dari sifatKejadian sebagai Number (untuk kunci isian). */
function nilaiSifat(s, kunci) {
  switch (kunci) {
    case 'nS':
    case 'nA':
    case 'nB':
    case 'nIrisan':
    case 'nGabungan':
      return s[kunci];
    case 'pA':
    case 'pB':
    case 'pIrisan':
    case 'pGabungan':
      return nilaiPecahan(s[kunci]);
    case 'pA+pB':
      return nilaiPecahan(tambahPecahan(s.pA, s.pB));
    case 'pA*pB':
      return nilaiPecahan(kaliPecahan(s.pA, s.pB));
    default:
      throw new Error('Besaran tidak dikenal: ' + kunci);
  }
}

/*
 * Diagnosa jawaban peluang (pecahan eksak) terhadap besaran `tanya`
 * ('pA', 'pB', 'pGabungan', 'pIrisan') dari sifatKejadian `s`.
 * Kode: 'benar', 'bukanPeluang', 'lupaIrisan', 'dikali', 'hanyaIrisan',
 * 'dijumlah', 'dikaliTakBebas', 'tertukarGabungan', 'lain'.
 */
function diagnosaPeluang(jawab, s, tanya) {
  if (!jawab) return 'lain';
  if (samaPecahan(jawab, s[tanya])) return 'benar';
  if (jawab.num < 0 || jawab.num > jawab.den) return 'bukanPeluang';
  var jumlah = tambahPecahan(s.pA, s.pB);
  var kali = kaliPecahan(s.pA, s.pB);
  if (tanya === 'pGabungan') {
    if (s.nIrisan > 0 && samaPecahan(jawab, jumlah)) return 'lupaIrisan';
    if (samaPecahan(jawab, kali)) return 'dikali';
    if (s.nIrisan > 0 && samaPecahan(jawab, s.pIrisan)) return 'hanyaIrisan';
  }
  if (tanya === 'pIrisan') {
    if (samaPecahan(jawab, jumlah)) return 'dijumlah';
    if (!s.salingBebas && samaPecahan(jawab, kali)) return 'dikaliTakBebas';
    if (samaPecahan(jawab, s.pGabungan)) return 'tertukarGabungan';
  }
  return 'lain';
}

function pesanDiagnosaPeluang(kode) {
  var pesan = {
    bukanPeluang:
      'Peluang selalu bernilai dari 0 sampai 1. Periksa lagi: banyak anggota kejadian tidak mungkin melebihi banyak anggota ruang sampel.',
    lupaIrisan:
      'Kamu menjumlahkan P(A) dan P(B) begitu saja. Ada hasil yang termasuk A <em>dan</em> B sekaligus sehingga terhitung dua kali — kurangi P(A ∩ B).',
    dikali:
      'Kata "atau" menanyakan gabungan A ∪ B, bukan irisan. Mengalikan P(A) × P(B) justru menghitung peluang A <em>dan</em> B (itu pun hanya bila saling bebas).',
    hanyaIrisan:
      'Itu peluang A <em>dan</em> B (irisan). Yang ditanyakan A <em>atau</em> B: semua hasil yang termasuk A, B, atau keduanya.',
    dijumlah:
      'Kata "dan" menanyakan irisan A ∩ B. Menjumlahkan P(A) + P(B) menghitung gabungan, dan hasilnya pasti tidak lebih kecil dari P(A).',
    dikaliTakBebas:
      'P(A) × P(B) hanya berlaku bila A dan B saling bebas. Di sini kejadian pertama mengubah isi ruang sampel untuk kejadian kedua, jadi hitung dari hasil yang benar-benar mungkin.',
    tertukarGabungan:
      'Itu peluang A <em>atau</em> B (gabungan). Yang ditanyakan A <em>dan</em> B: hanya hasil yang memenuhi keduanya sekaligus.',
    lain: 'Belum tepat. Hitung ulang banyak hasil yang memenuhi kejadian itu, lalu bagi dengan banyak anggota ruang sampel.',
  };
  return pesan[kode] || pesan.lain;
}

/* Teks satu hasil percobaan: '(3, 4)', '(A, 5)', 'A♥', 'A♥, 7♠', 'AG', '5', 'A'. */
function formatHasil(o) {
  if (o.k1) return formatHasil(o.k1) + ', ' + formatHasil(o.k2);
  if (o.simbol) return o.nilai + o.simbol;
  if (o.d1 !== undefined) return '(' + o.d1 + ', ' + o.d2 + ')';
  if (o.koin !== undefined && o.dadu !== undefined) return '(' + o.koin + ', ' + o.dadu + ')';
  if (o.dadu !== undefined) return String(o.dadu);
  if (o.koin !== undefined) return o.koin;
  var koin = '';
  for (var i = 1; o['koin' + i] !== undefined; i++) koin += o['koin' + i];
  return koin;
}

/* Kunci unik satu hasil (dipakai grid ruang sampel bertanda). */
function kunciHasil(o) {
  if (o.k1) return o.k1.id + '|' + o.k2.id;
  if (o.id) return o.id;
  if (o.d1 !== undefined) return o.d1 + '-' + o.d2;
  if (o.koin !== undefined && o.dadu !== undefined) return o.koin + '-' + o.dadu;
  return formatHasil(o);
}

/* ---------- Simulator percobaan acak ---------- */

function makeProbSimState() {
  return { n: 0, frek: {}, last: [] };
}

/*
 * Menjalankan `kali` percobaan pada ruang sampel `ruang` (setiap hasil
 * berpeluang sama) dan mencatat frekuensi setiap kejadian di `ids`.
 * `rng` default Math.random; `batas` (default 10000) membatasi total.
 */
function jalankanPercobaan(st, ruang, ids, kali, rng, batas) {
  var S = ruangSampel(ruang);
  var acak = rng || Math.random;
  var maks = batas || 10000;
  var preds = ids.map(predikatKejadian);
  ids.forEach(function (id) {
    if (typeof st.frek[id] !== 'number') st.frek[id] = 0;
  });
  if (!Array.isArray(st.last)) st.last = [];
  var jalan = Math.max(0, Math.min(kali, maks - st.n));
  for (var t = 0; t < jalan; t++) {
    var o = S[Math.floor(acak() * S.length)];
    st.n += 1;
    for (var k = 0; k < ids.length; k++) if (preds[k](o)) st.frek[ids[k]] += 1;
    st.last.push(formatHasil(o));
  }
  if (st.last.length > 12) st.last = st.last.slice(st.last.length - 12);
  return st;
}

function frekuensiRelatif(st, id) {
  return st && st.n ? (st.frek[id] || 0) / st.n : 0;
}

/* ---------- Grid ruang sampel bertanda A / B ---------- */

function makeGridMarkState() {
  return { layer: 'A', A: {}, B: {}, cek: { A: null, B: null } };
}

function toggleGridMark(st, key) {
  var set = st[st.layer];
  if (set[key]) delete set[key];
  else set[key] = true;
  st.cek[st.layer] = null;
}

function gridMarkCount(st, layer) {
  return Object.keys(st[layer] || {}).length;
}

/* { benar, lebih: [kunci salah ditandai], kurang: [kunci terlewat] }. */
function periksaGridMark(st, ruang, kejadianId, layer) {
  var target = {};
  filterKejadian(ruangSampel(ruang), kejadianId).forEach(function (o) {
    target[kunciHasil(o)] = true;
  });
  var tanda = st[layer] || {};
  var lebih = Object.keys(tanda).filter(function (k) {
    return !target[k];
  });
  var kurang = Object.keys(target).filter(function (k) {
    return !tanda[k];
  });
  return { benar: !lebih.length && !kurang.length, lebih: lebih, kurang: kurang };
}

/*
 * Tata letak grid ruang sampel: { rowHead, colHead, rows, cols, cell(r, c) }.
 * Dua dadu 6 × 6, koin + dadu 2 × 6, kartu 4 jenis × 13 nilai.
 */
function gridRuangSampel(ruang) {
  var dadu = [1, 2, 3, 4, 5, 6].map(function (d) {
    return { key: d, label: String(d) };
  });
  if (ruang === 'duaDadu') {
    return {
      rowHead: 'Dadu 1',
      colHead: 'Dadu 2',
      rows: dadu,
      cols: dadu,
      cell: function (r, c) {
        return { d1: r.key, d2: c.key };
      },
    };
  }
  if (ruang === 'koinDadu') {
    return {
      rowHead: 'Koin',
      colHead: 'Dadu',
      rows: SISI_KOIN.map(function (s) {
        return { key: s.id, label: s.id + ' (' + s.nama + ')' };
      }),
      cols: dadu,
      cell: function (r, c) {
        return { koin: r.key, dadu: c.key };
      },
    };
  }
  if (ruang === 'kartu') {
    var byId = {};
    dekKartu().forEach(function (k) {
      byId[k.id] = k;
    });
    return {
      rowHead: 'Jenis',
      colHead: 'Nilai',
      rows: JENIS_KARTU.map(function (j) {
        return { key: j.id, label: j.simbol + ' ' + j.nama };
      }),
      cols: NILAI_KARTU.map(function (v) {
        return { key: v, label: v };
      }),
      cell: function (r, c) {
        return byId[c.key + '-' + r.key];
      },
    };
  }
  throw new Error('Grid tidak tersedia untuk ruang sampel: ' + ruang);
}

/*
 * Grid ruang sampel yang bisa diketuk untuk menandai anggota A atau B.
 *   st            makeGridMarkState()
 *   opts.layers   [{ id: 'A'|'B', label }] — tombol lapis yang boleh ditandai
 *   opts.locked   { A: true } → lapis itu sudah benar, tidak bisa diubah
 *   opts.caption  teks aksesibel grid
 * Sel salah ditandai (.is-extra) atau terlewat (.is-missing) setelah
 * lapis aktif diperiksa (st.cek[layer] berisi hasil periksaGridMark).
 */
function buildOutcomeGrid(id, ruang, st, opts) {
  opts = opts || {};
  var g = gridRuangSampel(ruang);
  var locked = opts.locked || {};
  var layers = opts.layers || [];
  var aktifLocked = !!locked[st.layer];
  var cek = st.cek[st.layer];
  var salah = {};
  if (cek && !cek.benar) {
    cek.lebih.forEach(function (k) {
      salah[k] = 'is-extra';
    });
    cek.kurang.forEach(function (k) {
      salah[k] = 'is-missing';
    });
  }

  var layerBar = layers.length
    ? '<div class="prob-layer" role="group" aria-label="Pilih kejadian yang ditandai">' +
      layers
        .map(function (l) {
          return (
            '<button type="button" class="prob-layer__btn prob-layer__btn--' +
            l.id.toLowerCase() +
            '" data-grid-layer="' +
            esc(l.id) +
            '" aria-pressed="' +
            (st.layer === l.id ? 'true' : 'false') +
            '">' +
            (locked[l.id] ? '✓ ' : '') +
            esc(l.label) +
            ' <span class="prob-layer__count">' +
            gridMarkCount(st, l.id) +
            '</span></button>'
          );
        })
        .join('') +
      '</div>'
    : '';

  var head =
    '<div class="prob-grid__row prob-grid__row--head" aria-hidden="true">' +
    '<span class="prob-grid__corner">' +
    esc(g.rowHead) +
    ' \\ ' +
    esc(g.colHead) +
    '</span>' +
    g.cols
      .map(function (c) {
        return '<span class="prob-grid__colhead">' + esc(c.label) + '</span>';
      })
      .join('') +
    '</div>';

  var rows = g.rows
    .map(function (r) {
      return (
        '<div class="prob-grid__row" role="group" aria-label="' +
        esc(g.rowHead + ' ' + r.label) +
        '">' +
        '<span class="prob-grid__rowhead">' +
        esc(r.label) +
        '</span>' +
        g.cols
          .map(function (c) {
            var o = g.cell(r, c);
            var key = kunciHasil(o);
            var inA = !!st.A[key];
            var inB = !!st.B[key];
            var cls = 'prob-cell';
            if (inA) cls += ' is-a';
            if (inB) cls += ' is-b';
            if (salah[key]) cls += ' ' + salah[key];
            if (o.warna === 'merah') cls += ' prob-cell--merah';
            var aria = formatHasil(o) + (inA ? ', anggota A' : '') + (inB ? ', anggota B' : '');
            return (
              '<button type="button" class="' +
              cls +
              '" data-cell="' +
              esc(key) +
              '" aria-pressed="' +
              (st[st.layer][key] ? 'true' : 'false') +
              '" aria-label="' +
              esc(aria) +
              '"' +
              (aktifLocked ? ' disabled' : '') +
              '>' +
              esc(o.simbol ? o.nilai + o.simbol : formatHasil(o).replace(/[()\s]/g, '')) +
              '</button>'
            );
          })
          .join('') +
        '</div>'
      );
    })
    .join('');

  return (
    '<div class="prob-grid-wrap" id="' +
    id +
    '">' +
    layerBar +
    '<div class="prob-grid prob-grid--' +
    esc(ruang) +
    '" role="group" aria-label="' +
    esc(opts.caption || 'Ruang sampel') +
    '">' +
    head +
    rows +
    '</div>' +
    '<div class="prob-legend" aria-hidden="true">' +
    '<span><i class="prob-swatch prob-swatch--a"></i>A</span>' +
    '<span><i class="prob-swatch prob-swatch--b"></i>B</span>' +
    '<span><i class="prob-swatch prob-swatch--ab"></i>A ∩ B</span>' +
    '</div>' +
    '</div>'
  );
}

function bindOutcomeGrid(root, id, st, opts, onChange) {
  opts = opts || {};
  var wrap = root.querySelector('#' + id);
  if (!wrap) return;
  var locked = opts.locked || {};
  wrap.querySelectorAll('[data-grid-layer]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      st.layer = btn.dataset.gridLayer;
      onChange(null);
    });
  });
  wrap.querySelectorAll('[data-cell]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (locked[st.layer]) return;
      toggleGridMark(st, btn.dataset.cell);
      onChange(btn.dataset.cell);
    });
  });
}

/* Mengembalikan fokus ke sel grid yang baru diketuk setelah render ulang. */
function fokusSelGrid(root, id, key) {
  if (!key) return;
  var wrap = root.querySelector('#' + id);
  if (!wrap) return;
  var cells = wrap.querySelectorAll('[data-cell]');
  for (var i = 0; i < cells.length; i++) {
    if (cells[i].dataset.cell === key) {
      cells[i].focus();
      return;
    }
  }
}

/*
 * Diagram Venn banyak anggota: n(A saja), n(A ∩ B), n(B saja) dan
 * n di luar A ∪ B, dari hasil sifatKejadian `s`.
 */
function buildVennCount(s, opts) {
  opts = opts || {};
  var aSaja = s.nA - s.nIrisan;
  var bSaja = s.nB - s.nIrisan;
  var luar = s.nS - s.nGabungan;
  var lepas = s.nIrisan === 0;
  var cxA = lepas ? 95 : 120;
  var cxB = lepas ? 225 : 200;
  return (
    '<figure class="prob-venn">' +
    '<svg viewBox="0 0 320 180" role="img" aria-label="' +
    esc(
      'Diagram Venn: n(S) = ' +
        s.nS +
        ', A saja ' +
        aSaja +
        ', A ∩ B ' +
        s.nIrisan +
        ', B saja ' +
        bSaja +
        ', di luar keduanya ' +
        luar
    ) +
    '">' +
    '<rect class="prob-venn__s" x="4" y="4" width="312" height="172" rx="8"/>' +
    '<text class="prob-venn__label" x="16" y="26">S (' +
    s.nS +
    ')</text>' +
    '<circle class="prob-venn__a" cx="' +
    cxA +
    '" cy="96" r="62"/>' +
    '<circle class="prob-venn__b" cx="' +
    cxB +
    '" cy="96" r="62"/>' +
    '<text class="prob-venn__label" x="' +
    (cxA - 40) +
    '" y="44">A</text>' +
    '<text class="prob-venn__label" x="' +
    (cxB + 32) +
    '" y="44">B</text>' +
    '<text class="prob-venn__num" x="' +
    (lepas ? cxA : cxA - 30) +
    '" y="102" text-anchor="middle">' +
    aSaja +
    '</text>' +
    (lepas
      ? ''
      : '<text class="prob-venn__num prob-venn__num--ab" x="160" y="102" text-anchor="middle">' +
        s.nIrisan +
        '</text>') +
    '<text class="prob-venn__num" x="' +
    (lepas ? cxB : cxB + 30) +
    '" y="102" text-anchor="middle">' +
    bSaja +
    '</text>' +
    '<text class="prob-venn__num prob-venn__num--luar" x="296" y="166" text-anchor="end">' +
    luar +
    '</text>' +
    '</svg>' +
    (opts.caption ? '<figcaption>' + opts.caption + '</figcaption>' : '') +
    '</figure>'
  );
}

/*
 * Simulator percobaan: tombol "Lakukan k×", hasil terakhir, dan tabel
 * frekuensi & frekuensi relatif tiap kejadian (dengan batang).
 *   opts.ruang     id ruang sampel
 *   opts.kejadian  [{ id, label, teori? }] — teori: pecahan peluang teoretis
 *   opts.tombol    daftar k (default [1, 10, 100])
 *   opts.batas     maksimum total percobaan (default 10000)
 *   opts.teori     true → tampilkan kolom peluang teoretis
 *   opts.judul     judul kecil di atas simulator
 */
function buildProbSimulator(id, st, opts) {
  var tombol = opts.tombol || [1, 10, 100];
  var batas = opts.batas || 10000;
  var penuh = st.n >= batas;
  var baris = opts.kejadian
    .map(function (k) {
      var f = st.frek[k.id] || 0;
      var fr = frekuensiRelatif(st, k.id);
      return (
        '<tr>' +
        '<th scope="row">' +
        k.label +
        '</th>' +
        '<td>' +
        formatNumber(f) +
        '</td>' +
        '<td>' +
        (st.n ? formatNumber(f) + '/' + formatNumber(st.n) + ' ≈ ' + formatDesimal(fr, 3) : '–') +
        '<span class="prob-sim__bar" aria-hidden="true"><span style="width:' +
        Math.round(fr * 100) +
        '%"></span></span>' +
        '</td>' +
        (opts.teori
          ? '<td>' +
            (k.teori
              ? formatPecahan(k.teori) + ' ≈ ' + formatDesimal(nilaiPecahan(k.teori), 3)
              : '–') +
            '</td>'
          : '') +
        '</tr>'
      );
    })
    .join('');
  return (
    '<div class="prob-sim" id="' +
    id +
    '">' +
    (opts.judul ? '<p class="prob-sim__title">' + esc(opts.judul) + '</p>' : '') +
    '<div class="prob-sim__controls">' +
    tombol
      .map(function (k) {
        return (
          '<button type="button" class="btn btn--primary btn--small" data-sim-kali="' +
          k +
          '"' +
          (penuh ? ' disabled' : '') +
          '>Lakukan ' +
          formatNumber(k) +
          '×</button>'
        );
      })
      .join('') +
    '<button type="button" class="btn btn--ghost btn--small" data-sim-reset' +
    (st.n ? '' : ' disabled') +
    '>Ulang dari 0</button>' +
    '</div>' +
    '<p class="prob-sim__n" aria-live="polite">Banyak percobaan: <strong>' +
    formatNumber(st.n) +
    '</strong>' +
    (penuh ? ' (batas tercapai)' : '') +
    '</p>' +
    (st.last && st.last.length
      ? '<div class="prob-sim__last" aria-label="Hasil terakhir">' +
        st.last
          .map(function (h) {
            return '<span class="prob-chip">' + esc(h) + '</span>';
          })
          .join('') +
        '</div>'
      : '') +
    '<div class="prob-sim__table-wrap">' +
    '<table class="prob-sim__table">' +
    '<thead><tr><th scope="col">Kejadian</th><th scope="col">Frekuensi</th><th scope="col">Frekuensi relatif</th>' +
    (opts.teori ? '<th scope="col">Peluang teoretis</th>' : '') +
    '</tr></thead>' +
    '<tbody>' +
    baris +
    '</tbody></table></div>' +
    '</div>'
  );
}

function bindProbSimulator(root, id, st, opts, save, rerender) {
  var wrap = root.querySelector('#' + id);
  if (!wrap) return;
  var ids = opts.kejadian.map(function (k) {
    return k.id;
  });
  wrap.querySelectorAll('[data-sim-kali]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      jalankanPercobaan(
        st,
        opts.ruang,
        ids,
        parseInt(btn.dataset.simKali, 10),
        Math.random,
        opts.batas
      );
      save();
      rerender();
    });
  });
  var reset = wrap.querySelector('[data-sim-reset]');
  if (reset) {
    reset.addEventListener('click', function () {
      st.n = 0;
      st.frek = {};
      st.last = [];
      save();
      rerender();
    });
  }
}
