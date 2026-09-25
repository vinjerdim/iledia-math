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
       diagnosa miskonsepsi, lab uji sifat, tabel pangkat, tabel
       eksplorasi pola eksponen bulat positif)
   28. Peluang kejadian majemuk (ruang sampel dadu/koin/kartu,
       predikat kejadian gabungan & irisan, saling lepas & saling
       bebas, diagnosa rumus, simulator percobaan, grid ruang sampel
       bertanda, diagram Venn banyak anggota)
   29. Bilangan bulat dalam konteks sehari-hari (terbilang hingga
       miliar, cara baca & notasi baku, parser isian, diagnosa
       miskonsepsi menulis & membaca, tanda dari kata kunci konteks,
       opsi cara baca teracak, skala konteks, langkah isian
       berpemeriksa)
   30. Bilangan berpangkat: membaca & menulis
   31. Prisma: unsur & jaring-jaring (model 3D, proyeksi & visibilitas,
       penjelajah titik/rusuk/sisi, tabel unsur berdiagnosa, jaring
       sabuk, simulasi lipat beranimasi, perakit jaring)
   32. Barisan aritmetika: selisih & beda (selisih berurutan, beda,
       diagnosa miskonsepsi selisih, pelacak selisih, lab barisan
       dengan garis bilangan lompatan)
   33. Asosiasi dua variabel (tabel kontingensi, persen baris,
       keputusan asosiasi kategorikal, korelasi & garis tren, arah &
       kekuatan asosiasi, diagram pencar, plotter titik berdiagnosa,
       kartu turus, batang tersegmen 100%, lab data kelas)
   34. Bilangan bulat: membandingkan & mengurutkan dalam konteks
       (urut naik/turun, kata perbandingan per tema, diagnosa
       miskonsepsi lambang, rentang garis bilangan)
   35. Pecahan dalam konteks sehari-hari: membaca & menuliskan
       (notasi & cara baca baku biasa/campuran/negatif, pemeriksa
       cara baca & tulis berdiagnosa, opsi cara baca teracak, langkah
       isian pecahan, pengarsir pecahan interaktif)
   36. Pecahan: membandingkan & mengurutkan dalam konteks (nilai
       pecahan bertanda/campuran, strategi ahli penyebut sama/pembilang
       sama/patokan/samakan penyebut, diagnosa miskonsepsi lambang,
       kata perbandingan per tema, kalimat & tombol lambang pecahan)
   37. Bilangan desimal dalam konteks sehari-hari: membaca, menuliskan
       & membandingkan (pemeriksa cara baca & tulis berdiagnosa, opsi
       cara baca & notasi teracak, langkah isian desimal, kata
       perbandingan per tema, tombol lambang desimal berdiagnosa)
   38. Bilangan terpadu: membandingkan bulat, pecahan & desimal
       (nilai eksak lintas bentuk, ubah bentuk pecahan ↔ desimal,
       opsi bentuk setara berdiagnosa, diagnosa lambang lintas bentuk,
       kata perbandingan per tema, isian berbentuk, tabel bentuk setara,
       garis bilangan berlangkah 1/n & penempatan)
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
 *   inputErrorHTML(s, ex)  (opsional) HTML pengganti pesan "jawabanmu belum tepat",
 *                          mis. diagnosa miskonsepsi dari jawaban ex.userInput
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
              cfg.inputErrorHTML
                ? cfg.inputErrorHTML(s, ex)
                : 'Jawabanmu <strong>' +
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
 *   opts.mono    true → teks butir bergaya kode/angka (untuk barisan)
 *   opts.visual  function(it) → HTML blok (tabel/diagram) di bawah teks
 *                butir; dipisah dari <p> teks agar markup blok tetap valid
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
          (opts.visual ? '<div class="sort-item__visual">' + opts.visual(it) + '</div>' : '') +
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
 *   opts.signed     true → pilihan tanda (kosong/−) di kiri, id <id>Sign,
 *                   untuk pecahan negatif; value.sign '' | '-'
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
  var neg = value.sign === '-';
  return (
    '<div class="frac-input' +
    (opts.status ? ' frac-input--' + opts.status : '') +
    '">' +
    (opts.signed
      ? '<select class="frac-input__sign" id="' +
        id +
        'Sign" aria-label="' +
        esc(aria + ': tanda bilangan') +
        '"' +
        dis +
        '><option value=""' +
        (neg ? '' : ' selected') +
        '>+</option><option value="-"' +
        (neg ? ' selected' : '') +
        '>−</option></select>'
      : '') +
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
 *   raw    { sign, whole, num, den } string apa adanya (untuk disimpan di State)
 *   value  { whole, num, den, neg } bilangan cacah (whole null bila kosong;
 *          neg true bila pilihan tanda opts.signed bernilai −)
 *   error  null | 'empty' (pembilang/penyebut kosong) | 'invalid' | 'zero-den'
 */
function readFractionInput(root, id) {
  function get(suffix) {
    var el = root.querySelector('#' + id + suffix);
    return el ? el.value.trim() : '';
  }
  var raw = { sign: get('Sign'), whole: get('Whole'), num: get('Num'), den: get('Den') };
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
    neg: raw.sign === '-',
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
   Dipakai modul membandingkan & mengurutkan pecahan (fase-d/mpi-1.4,
   bersama seksi 36).
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
 * Garis bilangan pecahan (SVG, tidak interaktif) dengan titik-titik
 * pecahan berlabel. Default 0 … 1; label yang berdekatan diletakkan
 * selang-seling atas/bawah agar tidak bertumpuk.
 *   fracs        [{ num, den, whole?, neg?, nama? }] — pecahan campuran &
 *                negatif didukung (tanda/bilangan bulat digambar di
 *                depan pecahan, kelas .frac-nl__pre)
 *   opts.min     ujung kiri (bilangan bulat, default 0)
 *   opts.max     ujung kanan (bilangan bulat, default 1)
 *   opts.ticks   banyak bagian per satuan (mis. KPK); 0/undefined → tanpa
 *   opts.aria    label aksesibel
 */
function buildFracNumberLine(fracs, opts) {
  opts = opts || {};
  var min = typeof opts.min === 'number' ? opts.min : 0;
  var max = typeof opts.max === 'number' && opts.max > min ? opts.max : min + 1;
  var W = 420;
  var H = 136;
  var padX = 24;
  var axisY = 70;
  function xOf(v) {
    return padX + ((v - min) / (max - min)) * (W - 2 * padX);
  }
  function nilai(f) {
    var v = pecahanBiasaBertanda(f);
    return v.num / v.den;
  }
  var html =
    '<line class="frac-nl__axis" x1="' +
    xOf(min) +
    '" y1="' +
    axisY +
    '" x2="' +
    xOf(max) +
    '" y2="' +
    axisY +
    '"/>';
  var totalTicks = opts.ticks ? opts.ticks * (max - min) : 0;
  if (totalTicks && totalTicks <= 60) {
    for (var t = 1; t < totalTicks; t++) {
      if (t % opts.ticks === 0) continue;
      var tx = xOf(min + t / opts.ticks);
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
  for (var v = min; v <= max; v++) {
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
      formatNumber(v, '−') +
      '</text>';
  }
  var urut = fracs.slice().sort(function (a, b) {
    return bandingPecahan(a, b);
  });
  var lastX = -Infinity;
  var atas = true;
  urut.forEach(function (f) {
    var x = xOf(nilai(f));
    var pre = (f.neg ? '−' : '') + (f.whole ? f.whole : '');
    /* Label berawalan tanda/bilangan bulat lebih lebar → jarak aman lebih besar. */
    atas = x - lastX < (pre ? 48 : 36) ? !atas : true;
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
      (pre
        ? '<text class="frac-nl__num frac-nl__pre" x="' +
          (x - 14) +
          '" y="' +
          (ly + 14) +
          '">' +
          pre +
          '</text>'
        : '') +
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
        'Garis bilangan ' +
          formatNumber(min, '−') +
          ' sampai ' +
          formatNumber(max, '−') +
          ' dengan titik ' +
          urut
            .map(function (f) {
              return bacaPecahanKonteks(f);
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
     - lab uji sifat eksponen (stepper a, m, n, b + catatan uji;
       mode eksponen positif, nama sifat kustom)
     - tabel pangkat aⁿ (n naik) sebagai kamus nilai
     - tabel eksplorasi pola perkalian, pembagian, dan pangkat dari
       pangkat (nilai → aᵏ) dengan diagnosa eksponen keliru
   Gaya .pw-ladder*, .pw-table*, .pola-tbl*, .fx-*, .xlab* ada di
   shared/base.css.
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
  nol: { nama: 'Pangkat nol', rumus: 'aⁿ : aⁿ = a⁰ = 1', keliru: false, pakaiB: false },
  negatif: {
    nama: 'Pangkat negatif',
    rumus: 'a¹ : aⁿ⁺¹ = a⁻ⁿ = 1/aⁿ',
    keliru: false,
    pakaiB: false,
  },
  salahKali: { nama: 'Dugaan A', rumus: 'aᵐ × aⁿ = aᵐˣⁿ ?', keliru: true, pakaiB: false },
  salahNegatif: { nama: 'Dugaan B', rumus: 'a⁻ⁿ = −aⁿ ?', keliru: true, pakaiB: false },
  salahBagi: {
    nama: 'Dugaan pembagian',
    rumus: 'aᵐ : aⁿ = a^(m : n) ?',
    keliru: true,
    pakaiB: false,
  },
  salahPangkat: {
    nama: 'Dugaan pangkat',
    rumus: '(aᵐ)ⁿ = aᵐ⁺ⁿ ?',
    keliru: true,
    pakaiB: false,
  },
  salahNol: { nama: 'Dugaan pangkat nol', rumus: 'a⁰ = 0 ?', keliru: true, pakaiB: false },
};

/* Apakah sifat memakai eksponen m (sifat basis & dugaan B hanya memakai n). */
function sifatPakaiM(id) {
  return ['kali', 'bagi', 'pangkat', 'salahKali', 'salahBagi', 'salahPangkat'].indexOf(id) !== -1;
}

/*
 * Menghitung kedua ruas sebuah sifat untuk nilai a, m, n (dan b).
 * Kembalian { kiri, kanan, teksKiri, teksKanan, catatan, terdefinisi, sama, alasan }.
 * Ruas yang memuat 0⁰, 0⁻ⁿ atau pembagian dengan 0 → terdefinisi false,
 * alasan 'nol'. Dugaan salahBagi dengan m : n bukan bilangan bulat →
 * terdefinisi false, alasan 'bukanBulat'. Selain itu alasan null.
 */
function cekSifatEksponen(id, a, m, n, b) {
  var P = pangkatBulat;
  var F = formatPangkat;
  var kiri, kanan, teksKiri, teksKanan, catatan;
  var alasan = null;
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
  } else if (id === 'nol' || id === 'salahNol') {
    /* aⁿ : aⁿ dihitung dari pangkat positif; sifat pembagian memberi a⁰. */
    kiri = bagiPecahan(P(a, n), P(a, n));
    kanan = id === 'nol' ? P(a, 0) : pecahan(0, 1);
    if (kiri === null) kanan = null;
    teksKiri = F(a, n) + ' : ' + F(a, n);
    teksKanan = id === 'nol' ? F(a, 0) : '0';
    catatan = tulisSuku(n) + ' − ' + tulisSuku(n) + ' = 0';
  } else if (id === 'negatif') {
    /* a¹ : aⁿ⁺¹ dihitung dari pangkat positif; sifat pembagian memberi a⁻ⁿ. */
    kiri = bagiPecahan(P(a, 1), P(a, n + 1));
    kanan = P(a, -n);
    teksKiri = F(a, 1) + ' : ' + F(a, n + 1);
    teksKanan = F(a, -n);
    catatan = '1 − ' + tulisSuku(n + 1) + ' = ' + fmtBulat(-n);
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
  } else if (id === 'salahBagi') {
    kiri = bagiPecahan(P(a, m), P(a, n));
    var bulat = n !== 0 && m % n === 0;
    kanan = bulat ? P(a, m / n) : null;
    teksKiri = F(a, m) + ' : ' + F(a, n);
    teksKanan = bulat
      ? F(a, m / n)
      : formatBasis(a) + '^(' + fmtBulat(m) + ' : ' + fmtBulat(n) + ')';
    catatan = bulat
      ? tulisSuku(m) + ' : ' + tulisSuku(n) + ' = ' + fmtBulat(m / n)
      : tulisSuku(m) + ' : ' + tulisSuku(n) + ' bukan bilangan bulat';
    if (!bulat && n !== 0) alasan = 'bukanBulat';
  } else if (id === 'salahPangkat') {
    kiri = P(a, m) === null ? null : P(P(a, m), n);
    kanan = P(a, m + n);
    teksKiri = '(' + F(a, m) + ')' + superskrip(n);
    teksKanan = F(a, m + n);
    catatan = tulisSuku(m) + ' + ' + tulisSuku(n) + ' = ' + fmtBulat(m + n);
  } else {
    throw new Error('sifat eksponen tidak dikenal: ' + id);
  }
  var terdefinisi = kiri !== null && kanan !== null && alasan === null;
  if (!terdefinisi && alasan === null) alasan = 'nol';
  return {
    kiri: kiri,
    kanan: kanan,
    teksKiri: teksKiri,
    teksKanan: teksKanan,
    catatan: catatan,
    terdefinisi: terdefinisi,
    sama: terdefinisi && samaPecahan(kiri, kanan),
    alasan: alasan,
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
   mencatat uji. opts.positif true membatasi lab pada eksponen bulat
   positif: pembagian aᵐ : aⁿ hanya dicatat bila m > n.
   Syarat selesai per sifat:
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

function labHasil(st, opts) {
  var r = cekSifatEksponen(st.sifat, st.a, st.m, st.n, st.b);
  var bagi = st.sifat === 'bagi' || st.sifat === 'salahBagi';
  if (opts && opts.positif && bagi && st.m <= st.n) {
    r.terdefinisi = false;
    r.sama = false;
    r.alasan = 'diLuarCakupan';
  }
  return r;
}

/*
 * Mencatat uji saat ini: 'ok' | 'duplikat' | 'tidakTerdefinisi' |
 * 'bukanBulat' | 'diLuarCakupan'.
 */
function labCatat(st, opts) {
  var r = labHasil(st, opts);
  if (!r.terdefinisi) {
    if (r.alasan === 'bukanBulat' || r.alasan === 'diLuarCakupan') return r.alasan;
    return 'tidakTerdefinisi';
  }
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
 * opts.nama    { <idSifat>: 'nama tampilan' } pengganti nama bawaan
 * opts.positif true → mode eksponen bulat positif (lihat labHasil)
 */
function namaSifatLab(sid, opts) {
  return (opts.nama && opts.nama[sid]) || SIFAT_EKSPONEN[sid].nama;
}

var VONIS_LAB_TAK = {
  nol: '⚠ Tak terdefinisi — ada pembagian dengan 0 (0⁰ atau 0 berpangkat negatif). Pilih a ≠ 0.',
  bukanBulat: '⚠ m : n bukan bilangan bulat — pilih m kelipatan n agar dugaan ini bisa diuji.',
  diLuarCakupan:
    '⚠ Di luar cakupan — untuk eksponen bulat positif, pembagian aᵐ : aⁿ memerlukan m &gt; n.',
};

function buildExponentLab(id, st, opts) {
  opts = opts || {};
  var batasA = opts.batasA || [-5, 5];
  var batasE = opts.batasE || [-4, 4];
  var d = SIFAT_EKSPONEN[st.sifat];
  var r = labHasil(st, opts);
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
        esc(namaSifatLab(sid, opts)) +
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
      '<p class="xlab__vonis xlab__vonis--undef">' +
      (VONIS_LAB_TAK[r.alasan] || VONIS_LAB_TAK.nol) +
      '</p>';
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
            esc(namaSifatLab(s.sifat, opts)) +
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
      var hasil = labCatat(st, opts);
      var pesan = {
        ok: 'Uji dicatat.',
        duplikat: 'Uji ini sudah dicatat. Coba nilai a, m, atau n yang lain.',
        tidakTerdefinisi: 'Uji dengan hasil tak terdefinisi tidak dicatat. Pilih a ≠ 0.',
        bukanBulat: 'm : n bukan bilangan bulat. Pilih m kelipatan n, mis. m = 6 dan n = 2.',
        diLuarCakupan: 'Untuk eksponen bulat positif, pilih m lebih besar daripada n.',
      };
      onChange(pesan[hasil]);
    });
  }
}

/* ------------------------------------------------------------
   Tabel pangkat: kisi aⁿ untuk n = `dari` NAIK sampai `sampai`
   (mis. 2¹ … 2¹²) sebagai "kamus" nilai untuk eksplorasi pola.
     cfg     { a, dari, sampai, diketahui: [n, …] }
     inputs  { '<n>': 'isian' }
     opts.tanya      true → sel yang belum diketahui ditampilkan '?'
     opts.checked    true → tandai sel terisi ✓/✗
     opts.locked     true → isian dinonaktifkan
     opts.highlight  [n, …] → sel disorot (mis. nilai yang sedang dicari)
     opts.compact    true → sel lebih kecil (kamus rujukan)
     opts.caption    label aksesibel
   Isian dibaca eksak oleh parseInputPecahan ('1.024' = 1024).
   ------------------------------------------------------------ */

function powerTableEditable(cfg) {
  var out = [];
  for (var n = cfg.dari; n <= cfg.sampai; n++) {
    if ((cfg.diketahui || []).indexOf(n) === -1) out.push(n);
  }
  return out;
}

function powerTableFilled(cfg, inputs) {
  return powerTableEditable(cfg).every(function (n) {
    return String((inputs || {})[n] || '').trim() !== '';
  });
}

function powerTableAllCorrect(cfg, inputs) {
  return powerTableEditable(cfg).every(function (n) {
    return powerLadderCellCorrect(cfg.a, n, (inputs || {})[n]);
  });
}

function buildPowerTable(id, cfg, inputs, opts) {
  opts = opts || {};
  inputs = inputs || {};
  var a = cfg.a;
  var sorot = opts.highlight || [];
  var html = '';
  for (var n = cfg.dari; n <= cfg.sampai; n++) {
    var diketahui = (cfg.diketahui || []).indexOf(n) !== -1;
    var sel;
    var tanda = '';
    if (diketahui) {
      sel = '<span class="pw-table__val">' + esc(formatPecahan(pangkatBulat(a, n))) + '</span>';
    } else if (opts.tanya) {
      sel = '<span class="pw-table__val pw-table__val--tanya">?</span>';
    } else {
      var isi = inputs[n] || '';
      var terisi = String(isi).trim() !== '';
      var benar = terisi && powerLadderCellCorrect(a, n, isi);
      if (opts.checked && terisi) {
        tanda =
          '<span class="pw-table__mark pw-table__mark--' +
          (benar ? 'ok' : 'no') +
          '" aria-label="' +
          (benar ? 'benar' : 'belum tepat') +
          '">' +
          (benar ? '✓' : '✗') +
          '</span>';
      }
      sel =
        '<input type="text" class="input-text pw-table__input' +
        (opts.checked && terisi && !benar ? ' has-error' : '') +
        '" id="' +
        id +
        '-in-' +
        n +
        '" data-ptable="' +
        esc(id) +
        '" data-n="' +
        n +
        '" inputmode="numeric" autocomplete="off" value="' +
        esc(isi) +
        '" aria-label="Nilai ' +
        esc(formatBasis(a)) +
        ' pangkat ' +
        fmtBulat(n) +
        '" placeholder="…"' +
        (opts.locked ? ' disabled' : '') +
        '>';
    }
    html +=
      '<li class="pw-table__cell' +
      (sorot.indexOf(n) !== -1 ? ' pw-table__cell--hl' : '') +
      '">' +
      '<span class="pw-table__pow">' +
      esc(formatPangkat(a, n)) +
      '</span>' +
      sel +
      tanda +
      '</li>';
  }
  return (
    '<ol class="pw-table' +
    (opts.compact ? ' pw-table--compact' : '') +
    '" aria-label="' +
    esc(opts.caption || 'Tabel pangkat ' + formatBasis(a)) +
    '">' +
    html +
    '</ol>'
  );
}

/* onEnter dipanggil saat murid menekan Enter di salah satu isian. */
function bindPowerTable(root, id, inputs, save, onEnter) {
  root.querySelectorAll('[data-ptable="' + id + '"]').forEach(function (inp) {
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
   Tabel eksplorasi pola eksponen (bilangan berpangkat bulat
   positif). Setiap baris satu bentuk aᵐ × aⁿ, aᵐ : aⁿ (m > n), atau
   (aᵐ)ⁿ; murid menghitung NILAI-nya (dibantu tabel pangkat) lalu
   menuliskannya sebagai satu bilangan berpangkat aᵏ. Setelah semua
   benar, kolom m, n, k dapat ditampilkan agar polanya terlihat.
     cfg     { operasi: 'kali' | 'bagi' | 'pangkat', baris: [{ a, m, n }] }
     inputs  { '<i>': { nilai: 'isian', k: 'isian' } }
     opts.checked   true → tandai baris terisi ✓/✗
     opts.locked    true → tampilkan jawaban tanpa isian
     opts.tampilMN  true → tambah kolom m, n, k
     opts.caption   judul tabel (aksesibel)
   ------------------------------------------------------------ */

var OPERASI_POLA = {
  kali: { nama: 'Perkalian', kolomM: 'm', kolomN: 'n' },
  bagi: { nama: 'Pembagian', kolomM: 'm', kolomN: 'n' },
  pangkat: { nama: 'Pangkat dari pangkat', kolomM: 'm', kolomN: 'n' },
};

function teksPolaEksponen(op, a, m, n) {
  if (op === 'kali') return formatPangkat(a, m) + ' × ' + formatPangkat(a, n);
  if (op === 'bagi') return formatPangkat(a, m) + ' : ' + formatPangkat(a, n);
  if (op === 'pangkat') return '(' + formatPangkat(a, m) + ')' + superskrip(n);
  throw new Error('operasi pola tidak dikenal: ' + op);
}

/*
 * Kunci satu baris: nilai dihitung dari DEFINISI (perkalian berulang
 * lewat pangkatBulat), bukan dari rumus sifat; k = eksponen hasil.
 */
function polaEksponenKunci(op, a, m, n) {
  var teks = teksPolaEksponen(op, a, m, n);
  var nilai;
  var k;
  if (op === 'kali') {
    nilai = kaliPecahan(pangkatBulat(a, m), pangkatBulat(a, n));
    k = m + n;
  } else if (op === 'bagi') {
    nilai = bagiPecahan(pangkatBulat(a, m), pangkatBulat(a, n));
    k = m - n;
  } else {
    nilai = pangkatBulat(pangkatBulat(a, m), n);
    k = m * n;
  }
  return { teks: teks, nilai: nilaiPecahan(nilai), k: k };
}

/* Kode diagnosa eksponen hasil: 'benar' | 'jumlah' | 'selisih' | 'kali' | 'bagi' | 'pangkatBertingkat' | 'lain'. */
function diagnosaPolaEksponen(op, m, n, k) {
  var benar = op === 'kali' ? m + n : op === 'bagi' ? m - n : m * n;
  if (k === benar) return 'benar';
  if (k === m + n) return 'jumlah';
  if (k === m - n || k === n - m) return 'selisih';
  if (k === m * n) return 'kali';
  if (n !== 0 && k === m / n) return 'bagi';
  if (op === 'pangkat' && k === Math.pow(m, n)) return 'pangkatBertingkat';
  return 'lain';
}

/* Pesan diagnosa: membandingkan nilai aᵏ tebakan murid dengan nilai sebenarnya. */
function pesanDiagnosaPolaEksponen(kode, op, a, m, n, k) {
  var kunci = polaEksponenKunci(op, a, m, n);
  var tebak = Math.pow(a, k);
  var nilaiTebak = tebak > 1e15 ? 'bilangan yang sangat besar' : formatNumber(tebak);
  var alasan = {
    jumlah: 'Menjumlahkan eksponen belum cocok untuk operasi ini.',
    selisih: 'Mengurangkan eksponen belum cocok untuk operasi ini.',
    kali: 'Mengalikan eksponen belum cocok untuk operasi ini.',
    bagi: 'Membagi eksponen belum cocok untuk operasi ini.',
    pangkatBertingkat: 'Memangkatkan eksponen dengan eksponen membuat hasilnya terlalu besar.',
    lain: 'Cari nilai hasilnya di tabel pangkat, lalu baca eksponennya.',
  };
  return (
    'Cek di tabel pangkat: ' +
    formatPangkat(a, k) +
    ' = ' +
    nilaiTebak +
    ', padahal ' +
    kunci.teks +
    ' = ' +
    formatNumber(kunci.nilai) +
    '. ' +
    (alasan[kode] || alasan.lain)
  );
}

function bacaEksponenPola(str) {
  var s = String(str || '').trim();
  return /^\d+$/.test(s) ? parseInt(s, 10) : null;
}

function isianPola(inputs, i) {
  var isi = (inputs || {})[i];
  return isi && typeof isi === 'object' ? isi : {};
}

/* { terisi, nilaiBenar, kBenar, benar } untuk baris ke-i. */
function polaBarisStatus(cfg, i, inputs) {
  var b = cfg.baris[i];
  var kunci = polaEksponenKunci(cfg.operasi, b.a, b.m, b.n);
  var isi = isianPola(inputs, i);
  var terisi = String(isi.nilai || '').trim() !== '' && String(isi.k || '').trim() !== '';
  var p = parseInputPecahan(String(isi.nilai || ''));
  var nilaiBenar = !p.error && p.value.den === 1 && p.value.num === kunci.nilai;
  var kBenar = bacaEksponenPola(isi.k) === kunci.k;
  return { terisi: terisi, nilaiBenar: nilaiBenar, kBenar: kBenar, benar: nilaiBenar && kBenar };
}

function polaSemuaTerisi(cfg, inputs) {
  return cfg.baris.every(function (b, i) {
    return polaBarisStatus(cfg, i, inputs).terisi;
  });
}

function polaSemuaBenar(cfg, inputs) {
  return cfg.baris.every(function (b, i) {
    return polaBarisStatus(cfg, i, inputs).benar;
  });
}

/* Diagnosa baris yang belum tepat: { kode, pesan } atau null bila benar/kosong. */
function diagnosaPolaBaris(cfg, i, inputs) {
  var st = polaBarisStatus(cfg, i, inputs);
  if (!st.terisi || st.benar) return null;
  var b = cfg.baris[i];
  var teks = teksPolaEksponen(cfg.operasi, b.a, b.m, b.n);
  if (!st.nilaiBenar) {
    var bantu =
      cfg.operasi === 'pangkat'
        ? 'Hitung dulu ' +
          formatPangkat(b.a, b.m) +
          ', lalu kalikan dengan dirinya sendiri ' +
          b.n +
          ' kali.'
        : 'Baca nilai ' +
          formatPangkat(b.a, b.m) +
          ' dan ' +
          formatPangkat(b.a, b.n) +
          ' dari tabel pangkat, lalu ' +
          (cfg.operasi === 'kali' ? 'kalikan' : 'bagi') +
          '.';
    return { kode: 'nilai', pesan: 'Nilai ' + teks + ' belum tepat. ' + bantu };
  }
  var k = bacaEksponenPola(isianPola(inputs, i).k);
  if (k === null) {
    return { kode: 'format', pesan: 'Tulis eksponen k sebagai bilangan bulat positif, mis. 5.' };
  }
  var kode = diagnosaPolaEksponen(cfg.operasi, b.m, b.n, k);
  return { kode: kode, pesan: pesanDiagnosaPolaEksponen(kode, cfg.operasi, b.a, b.m, b.n, k) };
}

function buildPolaEksponen(id, cfg, inputs, opts) {
  opts = opts || {};
  var kepala =
    '<tr><th scope="col">Bentuk</th><th scope="col">Nilai</th><th scope="col">Sebagai aᵏ</th>' +
    (opts.tampilMN
      ? '<th scope="col" class="pola-tbl__mn">m</th><th scope="col" class="pola-tbl__mn">n</th><th scope="col" class="pola-tbl__mn pola-tbl__mn--k">k</th>'
      : '') +
    '</tr>';
  var badan = cfg.baris
    .map(function (b, i) {
      var kunci = polaEksponenKunci(cfg.operasi, b.a, b.m, b.n);
      var isi = isianPola(inputs, i);
      var st = polaBarisStatus(cfg, i, inputs);
      var basis = esc(formatBasis(b.a));
      var nilaiSel;
      var kSel;
      var tanda = '';
      if (opts.locked) {
        nilaiSel = '<span class="pola-tbl__val">' + esc(formatNumber(kunci.nilai)) + '</span>';
        kSel =
          '<span class="pola-tbl__pow">' +
          basis +
          '<sup class="pola-tbl__sup">' +
          kunci.k +
          '</sup></span>';
      } else {
        var adaN = String(isi.nilai || '').trim() !== '';
        var adaK = String(isi.k || '').trim() !== '';
        var salahN = opts.checked && adaN && !st.nilaiBenar;
        var salahK = opts.checked && adaK && !st.kBenar;
        nilaiSel =
          '<input type="text" class="input-text pola-tbl__input' +
          (salahN ? ' has-error' : '') +
          '" id="' +
          id +
          '-n-' +
          i +
          '" data-pola="' +
          esc(id) +
          '" data-i="' +
          i +
          '" data-f="nilai" inputmode="numeric" autocomplete="off" value="' +
          esc(isi.nilai || '') +
          '" aria-label="Nilai ' +
          esc(kunci.teks) +
          '" placeholder="…">';
        kSel =
          '<span class="pola-tbl__pow">' +
          basis +
          '<input type="text" class="input-text pola-tbl__input pola-tbl__input--k' +
          (salahK ? ' has-error' : '') +
          '" id="' +
          id +
          '-k-' +
          i +
          '" data-pola="' +
          esc(id) +
          '" data-i="' +
          i +
          '" data-f="k" inputmode="numeric" autocomplete="off" value="' +
          esc(isi.k || '') +
          '" aria-label="Eksponen k untuk ' +
          esc(kunci.teks) +
          ' = ' +
          basis +
          ' pangkat k" placeholder="k"></span>';
        if (opts.checked && (adaN || adaK)) {
          tanda =
            '<span class="pola-tbl__mark pola-tbl__mark--' +
            (st.benar ? 'ok' : 'no') +
            '" aria-label="' +
            (st.benar ? 'benar' : 'belum tepat') +
            '">' +
            (st.benar ? '✓' : '✗') +
            '</span>';
        }
      }
      return (
        '<tr' +
        (opts.checked && st.benar ? ' class="pola-tbl__row--ok"' : '') +
        '>' +
        '<th scope="row" class="pola-tbl__bentuk">' +
        esc(kunci.teks) +
        '</th>' +
        '<td>' +
        nilaiSel +
        '</td>' +
        '<td>' +
        kSel +
        tanda +
        '</td>' +
        (opts.tampilMN
          ? '<td class="pola-tbl__mn">' +
            b.m +
            '</td><td class="pola-tbl__mn">' +
            b.n +
            '</td><td class="pola-tbl__mn pola-tbl__mn--k">' +
            kunci.k +
            '</td>'
          : '') +
        '</tr>'
      );
    })
    .join('');
  return (
    '<div class="pola-tbl-wrap">' +
    '<table class="pola-tbl">' +
    '<caption class="' +
    (opts.caption ? 'pola-tbl__caption' : 'sr-only') +
    '">' +
    esc(opts.caption || 'Tabel pola ' + OPERASI_POLA[cfg.operasi].nama.toLowerCase()) +
    '</caption>' +
    '<thead>' +
    kepala +
    '</thead><tbody>' +
    badan +
    '</tbody></table></div>'
  );
}

/* onEnter dipanggil saat murid menekan Enter di salah satu isian. */
function bindPolaEksponen(root, id, inputs, save, onEnter) {
  root.querySelectorAll('[data-pola="' + id + '"]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var i = inp.dataset.i;
      if (!inputs[i] || typeof inputs[i] !== 'object') inputs[i] = {};
      inputs[i][inp.dataset.f] = inp.value;
      save();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && onEnter) onEnter();
    });
  });
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

/* ============================================================
   29. BILANGAN BULAT DALAM KONTEKS SEHARI-HARI
   Membaca & menuliskan bilangan bulat positif, negatif, dan nol
   yang muncul dalam konteks nyata (suhu, lantai gedung, ketinggian
   & kedalaman, uang, skor). Seksi 9 (terbilang, bacaBilanganBulat)
   tetap dipakai modul lain apa adanya; seksi ini menambah:
     • terbilangBesar / bacaBulat / tulisBulat — hingga miliar;
     • parseBilanganBulat / diagnosaTulisBulat — memeriksa isian
       notasi murid beserta miskonsepsinya (tanda di belakang,
       lupa tanda, "min", nol bertanda, …);
     • normalisasiBacaan / cekCaraBaca — memeriksa cara baca yang
       diketik murid ("minus" dikenali sebagai tidak baku);
     • KONTEKS_BULAT / tandaKataKunci / nilaiKonteks — menentukan
       tanda bilangan dari kata kunci konteks;
     • opsiCaraBaca — pilihan cara baca (benar + pengecoh khas);
     • buildSkalaKonteks — skala tegak bertema dengan titik;
     • makeCekStep / periksaCekStep / buildCekStep / bindCekStep —
       langkah isian dengan umpan balik diagnosa.
   Gaya .bbk-* ada di shared/base.css.
   ============================================================ */

/*
 * Terbilang bilangan cacah hingga ratusan miliar. Di bawah sejuta sama
 * persis dengan terbilang() seksi 9 (tanda diabaikan).
 */
function terbilangBesar(n) {
  n = Math.round(Math.abs(n));
  if (n < 1000000) return terbilang(n);
  var skala = [
    { nilai: 1000000000, nama: 'miliar' },
    { nilai: 1000000, nama: 'juta' },
  ];
  var bagian = [];
  var sisa = n;
  skala.forEach(function (sk) {
    var q = Math.floor(sisa / sk.nilai);
    if (q > 0) {
      bagian.push(terbilang(q) + ' ' + sk.nama);
      sisa -= q * sk.nilai;
    }
  });
  if (sisa > 0) bagian.push(terbilang(sisa));
  return bagian.join(' ');
}

/*
 * Cara baca baku bilangan bulat (hingga miliar): −15 → "negatif lima
 * belas", 0 → "nol", 8 → "delapan" (atau "positif delapan" bila
 * opts.positif). "Minus" tidak dipakai — itu nama operasi pengurangan.
 */
function bacaBulat(n, opts) {
  opts = opts || {};
  if (n < 0) return 'negatif ' + terbilangBesar(n);
  if (n === 0) return 'nol';
  return (opts.positif ? 'positif ' : '') + terbilangBesar(n);
}

/* Notasi baku: minus tipografis (−) dan titik ribuan; opts.plus → "+75". */
function tulisBulat(n, opts) {
  opts = opts || {};
  return (opts.plus && n > 0 ? '+' : '') + formatNumber(n, '−');
}

var PESAN_TULIS_BULAT = {
  kosong: 'Tuliskan bilangannya terlebih dahulu.',
  'tanda-belakang':
    'Tanda negatif ditulis <strong>di depan</strong> angka, bukan di belakangnya. Contoh: −5, bukan 5−.',
  'kata-min':
    'Tuliskan dengan lambang, bukan kata. Kata "min/minus" juga bukan cara baku; ketik tanda - di depan angka.',
  kurung: 'Tanda kurung bukan tanda bilangan negatif. Ketik tanda - di depan angka.',
  'bukan-bulat':
    'Tulis sebuah bilangan bulat saja, mis. −12, 0, atau 1.250 (titik hanya untuk pemisah ribuan).',
};

/*
 * Membaca isian notasi bilangan bulat murid.
 *   Diterima: '-', '−', '–' sebagai tanda negatif; '+' di depan; spasi;
 *   titik pemisah ribuan yang kelompoknya tepat tiga angka (1.250).
 * Mengembalikan { ok, value, kode, pesan, bertanda } — kode null bila ok,
 * selain itu 'kosong' | 'tanda-belakang' | 'kata-min' | 'kurung' |
 * 'bukan-bulat'. `bertanda` true bila ada tanda eksplisit (untuk
 * mendeteksi "−0" / "+0").
 */
function parseBilanganBulat(str) {
  function gagal(kode) {
    return { ok: false, value: null, kode: kode, pesan: PESAN_TULIS_BULAT[kode], bertanda: false };
  }
  if (str === null || str === undefined || String(str).trim() === '') return gagal('kosong');
  var s = String(str).trim().toLowerCase().replace(/[−–—]/g, '-');
  if (/^(min|minus)\b/.test(s)) return gagal('kata-min');
  s = s.replace(/\s+/g, '');
  if (/^\(\d[\d.]*\)$/.test(s)) return gagal('kurung');
  if (/^\+?\d[\d.]*-$/.test(s)) return gagal('tanda-belakang');
  var m = /^([-+]?)(\d{1,3}(?:\.\d{3})+|\d+)$/.exec(s);
  if (!m) return gagal('bukan-bulat');
  var v = parseInt(m[2].replace(/\./g, ''), 10);
  if (m[1] === '-') v = -v;
  if (v === 0) v = 0; /* buang −0 */
  return { ok: true, value: v, kode: null, pesan: '', bertanda: m[1] !== '' };
}

/*
 * Mendiagnosa isian notasi murid terhadap bilangan target.
 * Mengembalikan { benar, kode, pesan }; kode:
 *   'benar' | kode parseBilanganBulat | 'lupa-tanda' (4 untuk −4) |
 *   'tanda-terbalik' (−7 untuk 7) | 'nol-bertanda' (−0/+0) |
 *   'besar-salah' (angkanya berbeda).
 */
function diagnosaTulisBulat(str, target) {
  var p = parseBilanganBulat(str);
  if (!p.ok) return { benar: false, kode: p.kode, pesan: p.pesan };
  var v = p.value;
  if (target === 0 && v === 0 && p.bertanda) {
    return {
      benar: false,
      kode: 'nol-bertanda',
      pesan:
        '0 bukan bilangan positif dan bukan bilangan negatif, jadi ditulis <strong>0</strong> saja tanpa tanda.',
    };
  }
  if (v === target) {
    return { benar: true, kode: 'benar', pesan: 'Tepat! Ditulis ' + tulisBulat(target) + '.' };
  }
  if (target < 0 && v === -target) {
    return {
      benar: false,
      kode: 'lupa-tanda',
      pesan:
        'Angkanya sudah tepat, tetapi keadaan ini berada di sisi <strong>negatif</strong> dari titik acuan. Tanda apa yang perlu ditulis di depan angka?',
    };
  }
  if (target > 0 && v === -target) {
    return {
      benar: false,
      kode: 'tanda-terbalik',
      pesan:
        'Angkanya sudah tepat, tetapi keadaan ini berada di sisi <strong>positif</strong> dari titik acuan, jadi tidak diberi tanda negatif.',
    };
  }
  return {
    benar: false,
    kode: 'besar-salah',
    pesan: 'Angkanya belum tepat. Hitung lagi seberapa jauh keadaan itu dari titik acuan (nol).',
  };
}

/* Huruf kecil, tanda baca → spasi, spasi dirapikan, "se ratus" → "seratus". */
function normalisasiBacaan(teks) {
  return String(teks || '')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\bse (puluh|belas|ratus|ribu)\b/g, 'se$1');
}

var PESAN_BACA_BULAT = {
  kosong: 'Ketik cara membaca bilangan itu terlebih dahulu.',
  minus:
    'Nilainya benar, tetapi "minus" adalah nama operasi pengurangan (mis. 9 − 4). Tanda di depan bilangan dibaca <strong>negatif</strong>.',
  'urutan-terbalik':
    'Urutannya terbalik. Tanda ditulis di depan angka, jadi kata "negatif" juga dibaca <strong>lebih dulu</strong>.',
  'lupa-negatif': 'Bilangan ini bertanda negatif. Jangan lupa membaca tandanya: "negatif …".',
  'tanda-terbalik': 'Perhatikan tandanya lagi: apakah bilangan ini positif atau negatif?',
  plus: 'Bilangan positif dibaca angkanya saja, atau dengan kata <strong>positif</strong> — bukan "plus".',
  'nol-bertanda': '0 bukan positif dan bukan negatif, jadi cukup dibaca <strong>nol</strong>.',
  'angka-salah':
    'Tandanya sudah tepat, tetapi cara membaca angkanya belum tepat. Baca sebagai satu bilangan utuh, mis. 15 → "lima belas".',
};

/*
 * Memeriksa cara baca yang diketik murid untuk bilangan n.
 * Mengembalikan { benar, kode, pesan }; kode 'benar' | 'kosong' |
 * 'minus' | 'urutan-terbalik' | 'lupa-negatif' | 'tanda-terbalik' |
 * 'plus' | 'nol-bertanda' | 'angka-salah'.
 */
function cekCaraBaca(teks, n) {
  function hasil(kode) {
    if (kode === 'benar') {
      return { benar: true, kode: kode, pesan: 'Tepat! Dibaca "' + bacaBulat(n) + '".' };
    }
    return { benar: false, kode: kode, pesan: PESAN_BACA_BULAT[kode] };
  }
  var t = normalisasiBacaan(teks);
  if (!t) return hasil('kosong');
  var inti = n === 0 ? 'nol' : terbilangBesar(n);

  var tanda = '';
  var sisa = t;
  var m = /^(negatif|minus|min|positif|plus) (.+)$/.exec(t);
  if (m) {
    tanda = m[1] === 'min' ? 'minus' : m[1];
    sisa = m[2];
  }
  var tandaBelakang = false;
  if (!tanda && / negatif$/.test(sisa)) {
    tandaBelakang = true;
    sisa = sisa.replace(/ negatif$/, '');
  }

  if (n === 0) {
    if (sisa !== 'nol') return hasil('angka-salah');
    return tanda || tandaBelakang ? hasil('nol-bertanda') : hasil('benar');
  }
  var angkaCocok = sisa === inti;
  if (n < 0) {
    if (tanda === 'positif' || tanda === 'plus') return hasil('tanda-terbalik');
    if (!angkaCocok) return hasil('angka-salah');
    if (tanda === 'negatif') return hasil('benar');
    if (tanda === 'minus') return hasil('minus');
    if (tandaBelakang) return hasil('urutan-terbalik');
    return hasil('lupa-negatif');
  }
  if (tanda === 'negatif' || tanda === 'minus' || tandaBelakang) return hasil('tanda-terbalik');
  if (!angkaCocok) return hasil('angka-salah');
  if (tanda === 'plus') return hasil('plus');
  return hasil('benar');
}

/*
 * Tema konteks sehari-hari: titik acuan (nilai 0), satuan, ikon, dan
 * contoh frasa arah positif/negatif. Dipakai skala konteks & data modul.
 */
var KONTEKS_BULAT = {
  suhu: {
    nama: 'Suhu',
    ikon: '🌡️',
    acuan: '0 °C',
    satuan: '°C',
    positif: 'di atas nol derajat',
    negatif: 'di bawah nol derajat',
  },
  gedung: {
    nama: 'Lantai gedung',
    ikon: '🛗',
    acuan: 'Lantai dasar',
    satuan: '',
    positif: 'lantai di atas lantai dasar',
    negatif: 'lantai di bawah lantai dasar (basement)',
  },
  laut: {
    nama: 'Ketinggian & kedalaman',
    ikon: '🌊',
    acuan: 'Permukaan laut',
    satuan: 'm',
    positif: 'di atas permukaan laut',
    negatif: 'di bawah permukaan laut',
  },
  uang: {
    nama: 'Uang',
    ikon: '💰',
    acuan: 'Impas (Rp0)',
    satuan: 'rupiah',
    positif: 'untung atau menyetor tabungan',
    negatif: 'rugi atau punya utang',
  },
  skor: {
    nama: 'Skor permainan',
    ikon: '🏆',
    acuan: 'Skor awal 0',
    satuan: 'poin',
    positif: 'mendapat poin',
    negatif: 'kehilangan poin',
  },
};

/* Kata kunci arah; dicocokkan per kata utuh pada frasa berhuruf kecil. */
var KATA_KUNCI_BULAT = {
  nolKuat: ['tepat', 'impas', 'tidak naik', 'tidak turun'],
  neg: [
    'di bawah',
    'bawah',
    'turun',
    'rugi',
    'merugi',
    'utang',
    'hutang',
    'berutang',
    'tarik',
    'menarik',
    'ditarik',
    'mundur',
    'kehilangan',
    'hilang',
    'berkurang',
    'dikurangi',
    'basement',
    'pengeluaran',
    'defisit',
    'terlambat',
  ],
  pos: [
    'di atas',
    'atas',
    'naik',
    'untung',
    'laba',
    'setor',
    'menyetor',
    'simpan',
    'menyimpan',
    'maju',
    'mendapat',
    'memperoleh',
    'bertambah',
    'ditambah',
    'pemasukan',
    'surplus',
  ],
  nol: ['lantai dasar', 'permukaan laut', 'nol derajat', 'titik acuan', 'skor awal'],
};

function adaKataKunci_(frasa, daftar) {
  return daftar.some(function (k) {
    return new RegExp('(^|[^a-z])' + k.replace(/ /g, '\\s+') + '($|[^a-z])').test(frasa);
  });
}

/*
 * Menentukan tanda bilangan dari kata kunci pada frasa konteks:
 * 'neg' | 'pos' | 'nol' | null (tidak ada/ambigu). Kata "tepat"/"impas"
 * menandai titik acuan lebih dulu, lalu kata arah, lalu nama acuan
 * ("lantai dasar", "permukaan laut").
 */
function tandaKataKunci(frasa) {
  var f = String(frasa || '').toLowerCase();
  if (adaKataKunci_(f, KATA_KUNCI_BULAT.nolKuat)) return 'nol';
  var neg = adaKataKunci_(f, KATA_KUNCI_BULAT.neg);
  var pos = adaKataKunci_(f, KATA_KUNCI_BULAT.pos);
  if (neg && !pos) return 'neg';
  if (pos && !neg) return 'pos';
  if (neg && pos) return null;
  return adaKataKunci_(f, KATA_KUNCI_BULAT.nol) ? 'nol' : null;
}

/* Bilangan bulat dari besar (jarak dari acuan) + frasa konteks; null bila tak terbaca. */
function nilaiKonteks(besar, frasa) {
  var t = tandaKataKunci(frasa);
  if (t === 'nol') return 0;
  if (t === 'neg') return -Math.abs(besar);
  if (t === 'pos') return Math.abs(besar);
  return null;
}

/*
 * Pilihan cara baca untuk bilangan n: satu bacaan baku + tiga pengecoh
 * yang mewakili miskonsepsi khas. Urutan DATA tetap; acak dengan
 * ensureShuffledOrder() saat state disiapkan.
 * Mengembalikan [{ id, label, benar, umpan }], id unik.
 */
function opsiCaraBaca(n) {
  var inti = n === 0 ? 'nol' : terbilangBesar(n);
  var baku = bacaBulat(n);
  var benarUmpan = 'Tepat! ' + tulisBulat(n) + ' dibaca "' + baku + '".';
  var opsi;
  if (n < 0) {
    opsi = [
      { id: 'baku', label: 'negatif ' + inti, benar: true, umpan: benarUmpan },
      { id: 'minus', label: 'minus ' + inti, benar: false, umpan: PESAN_BACA_BULAT.minus },
      {
        id: 'terbalik',
        label: inti + ' negatif',
        benar: false,
        umpan: PESAN_BACA_BULAT['urutan-terbalik'],
      },
      { id: 'lupa', label: inti, benar: false, umpan: PESAN_BACA_BULAT['lupa-negatif'] },
    ];
  } else if (n > 0) {
    opsi = [
      { id: 'baku', label: inti, benar: true, umpan: benarUmpan },
      {
        id: 'negatif',
        label: 'negatif ' + inti,
        benar: false,
        umpan: 'Bilangan ini tidak bertanda negatif, jadi tidak dibaca "negatif".',
      },
      { id: 'plus', label: 'plus ' + inti, benar: false, umpan: PESAN_BACA_BULAT.plus },
      {
        id: 'terbalik',
        label: inti + ' positif',
        benar: false,
        umpan: 'Kata tanda dibaca di depan angka, bukan di belakang.',
      },
    ];
  } else {
    opsi = [
      { id: 'baku', label: 'nol', benar: true, umpan: benarUmpan },
      {
        id: 'negatif',
        label: 'negatif nol',
        benar: false,
        umpan: PESAN_BACA_BULAT['nol-bertanda'],
      },
      {
        id: 'positif',
        label: 'positif nol',
        benar: false,
        umpan: PESAN_BACA_BULAT['nol-bertanda'],
      },
      {
        id: 'kosong',
        label: 'tidak ada bilangannya',
        benar: false,
        umpan: 'Keadaan tepat di titik acuan tetap punya bilangan, yaitu 0 (nol).',
      },
    ];
  }
  return opsi;
}

/*
 * Skala tegak bertema (termometer, gedung, laut, uang, skor) dengan satu
 * titik penanda. Secara default hanya 0 yang berlabel sehingga murid
 * menghitung sendiri jarak titik dari acuan.
 *   opts.tema        kunci KONTEKS_BULAT (default 'suhu')
 *   opts.nilai       letak titik (kelipatan langkah)
 *   opts.min, max    rentang (default −6 … 6)
 *   opts.langkah     nilai satu garis skala (default 1)
 *   opts.labelSetiap label angka setiap k garis (0/undefined → hanya 0)
 *   opts.tampilNilai true → tulis bilangan di samping titik
 *   opts.satuan      satuan di samping bilangan (default dari tema)
 *   opts.ikon        ikon titik (default dari tema)
 *   opts.judul       teks kepala skala (default nama tema)
 */
function buildSkalaKonteks(opts) {
  opts = opts || {};
  var tema = KONTEKS_BULAT[opts.tema] ? opts.tema : 'suhu';
  var K = KONTEKS_BULAT[tema];
  var min = typeof opts.min === 'number' ? opts.min : -6;
  var max = typeof opts.max === 'number' ? opts.max : 6;
  var langkah = opts.langkah || 1;
  var labelSetiap = opts.labelSetiap || 0;
  var satuan = opts.satuan !== undefined ? opts.satuan : K.satuan;
  var ikon = opts.ikon || K.ikon;
  var nilai = opts.nilai;
  function denganSatuan(v) {
    return tulisBulat(v) + (satuan && satuan !== 'rupiah' ? ' ' + satuan : '');
  }

  var rows = '';
  for (var v = max; v >= min; v -= langkah) {
    var cls = 'bbk-skala__row';
    if (v === 0) cls += ' bbk-skala__row--nol';
    else if (v > 0) cls += ' bbk-skala__row--pos';
    else cls += ' bbk-skala__row--neg';
    var titik = v === nilai;
    var idx = Math.round(v / langkah);
    var label = '';
    if (v === 0) label = '0';
    else if (labelSetiap && idx % labelSetiap === 0) label = tulisBulat(v);
    rows +=
      '<div class="' +
      cls +
      (titik ? ' is-titik' : '') +
      '">' +
      '<span class="bbk-skala__num">' +
      label +
      '</span>' +
      '<span class="bbk-skala__tick"></span>' +
      (v === 0 ? '<span class="bbk-skala__acuan">' + esc(K.acuan) + '</span>' : '') +
      (titik
        ? '<span class="bbk-skala__marker"><span aria-hidden="true">' +
          ikon +
          '</span>' +
          (opts.tampilNilai ? '<strong>' + esc(denganSatuan(v)) + '</strong>' : '') +
          '</span>'
        : '') +
      '</div>';
  }

  var jarak = Math.round(Math.abs(nilai) / langkah);
  var posisi =
    nilai === 0
      ? 'tepat di ' + K.acuan.toLowerCase()
      : jarak + ' langkah di ' + (nilai < 0 ? 'bawah' : 'atas') + ' ' + K.acuan.toLowerCase();
  var skalaInfo =
    langkah !== 1
      ? '1 langkah = ' + formatNumber(langkah) + (satuan && satuan !== 'rupiah' ? ' ' + satuan : '')
      : '';
  if (satuan === 'rupiah' && langkah !== 1) skalaInfo = '1 langkah = Rp' + formatNumber(langkah);

  return (
    '<div class="bbk-skala bbk-skala--' +
    tema +
    '" role="img" aria-label="' +
    esc(
      'Skala ' +
        (opts.judul || K.nama) +
        ': titik berada ' +
        posisi +
        (skalaInfo ? ', ' + skalaInfo : '')
    ) +
    '">' +
    '<span class="bbk-skala__cap"><span aria-hidden="true">' +
    K.ikon +
    '</span> ' +
    esc(opts.judul || K.nama) +
    '</span>' +
    (skalaInfo ? '<span class="bbk-skala__info">' + esc(skalaInfo) + '</span>' : '') +
    '<div class="bbk-skala__rows">' +
    rows +
    '</div>' +
    '</div>'
  );
}

/* State default langkah isian berpemeriksa. */
function makeCekStep() {
  return { input: '', done: false, kode: null, pesan: '', attempts: 0, hintLevel: 0 };
}

/*
 * Memeriksa isian langkah dan menyimpan hasilnya ke st.
 *   step.jenis 'tulis' → diagnosaTulisBulat(input, step.jawab)
 *   step.jenis 'baca'  → cekCaraBaca(input, step.jawab)
 * Isian kosong tidak dihitung sebagai percobaan.
 */
function periksaCekStep(st, step, input) {
  var r =
    step.jenis === 'baca' ? cekCaraBaca(input, step.jawab) : diagnosaTulisBulat(input, step.jawab);
  st.input = String(input || '').trim();
  st.kode = r.kode;
  st.pesan = r.pesan;
  if (r.kode === 'kosong') return r;
  st.attempts += 1;
  st.done = r.benar;
  return r;
}

/*
 * Satu langkah isian berpemeriksa (notasi atau cara baca) dengan umpan
 * balik diagnosa miskonsepsi.
 *   id    awalan id DOM (→ idInput, idCheck, idHint)
 *   step  { jenis: 'tulis'|'baca', jawab, label, hints, temuan,
 *           satuan, placeholder }
 *   num   nomor langkah opsional
 */
function buildCekStep(id, st, step, num) {
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
      esc(step.jenis === 'baca' ? '"' + bacaBulat(step.jawab) + '"' : tulisBulat(step.jawab)) +
      (step.satuan ? ' ' + esc(step.satuan) : '') +
      '</p>' +
      (step.temuan ? buildFeedbackBox('success', '💡', step.temuan) : '') +
      '</div>'
    );
  }
  var salah = st.attempts > 0 && st.kode && st.kode !== 'benar' && st.kode !== 'kosong';
  var baca = step.jenis === 'baca';
  return (
    '<div class="dl-step">' +
    head +
    '<div class="dl-input-row">' +
    '<input type="text" class="input-text ' +
    (baca ? 'bbk-baca-input' : 'dl-num-input') +
    (salah ? ' has-error' : '') +
    '" id="' +
    id +
    'Input"' +
    (baca ? ' inputmode="text" autocapitalize="off" spellcheck="false"' : '') +
    ' autocomplete="off" value="' +
    esc(st.input || '') +
    '" aria-label="' +
    esc(baca ? 'Cara membaca bilangan' : 'Tulisan bilangan') +
    '" placeholder="' +
    esc(step.placeholder || (baca ? 'ketik cara bacanya…' : 'mis. −5')) +
    '">' +
    (step.satuan && !baca ? '<span class="bbk-satuan">' + esc(step.satuan) + '</span>' : '') +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    'Check">Periksa</button>' +
    buildHintToggle(id + 'Hint', step.hints, st.hintLevel) +
    '</div>' +
    (salah
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox('error', '✗', '<strong>' + esc(st.input) + '</strong> — ' + st.pesan) +
        '</div>'
      : '') +
    buildHintStack(step.hints, st.hintLevel) +
    '</div>'
  );
}

/* Memasang event buildCekStep; `save` lalu `rerender` dipanggil setelah perubahan. */
function bindCekStep(id, st, step, save, rerender) {
  var inp = document.getElementById(id + 'Input');
  var btn = document.getElementById(id + 'Check');
  var hint = document.getElementById(id + 'Hint');
  if (inp && btn) {
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btn.click();
    });
    btn.addEventListener('click', function () {
      var r = periksaCekStep(st, step, inp.value);
      if (r.kode === 'kosong') {
        showNotice(r.pesan);
        return;
      }
      save();
      rerender();
      if (!st.done) {
        var again = document.getElementById(id + 'Input');
        if (again) again.focus();
      }
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, (step.hints || []).length);
      save();
      rerender();
    });
  }
}

/* ============================================================
   30. BILANGAN BERPANGKAT — MEMBACA & MENULIS
   Dipakai modul membaca & menulis bilangan berpangkat bulat
   positif, negatif, dan nol beserta unsurnya (fase-d/mpi-12.1).
   Memakai ulang seksi 27 (superskrip, formatBasis, formatPangkat,
   pangkatBulat, faktorPangkat, parseInputPecahan, samaPecahan),
   seksi 9 (terbilang, bacaBilanganBulat) dan seksi 29
   (normalisasiBacaan). Isi:
     • bacaPangkat / ekspresiPangkat / unsurPangkat — cara baca
       baku, notasi, serta basis & pangkat; `negLuar` menandai tanda
       negatif DI LUAR pangkat (−3⁴, basisnya 3) yang berbeda dari
       basis negatif berkurung ((−3)⁴, basisnya −3);
     • tulisPerkalianBerulang — 2³ → "2 × 2 × 2", 2⁻³ → "1 : (2 × 2 × 2)";
     • angkaDariKata / parseBacaPangkat / cekBacaPangkat — memeriksa
       cara baca yang diketik murid + diagnosa miskonsepsi ("minus",
       "kali", basis–pangkat tertukar, tanda, kurung);
     • cekTulisPangkat / pratinjauTulisPangkat — memeriksa isian
       "penulis pangkat" (kotak basis + kotak pangkat);
     • buildPowerWriter, buildPowerAnatomy, buildFoldSimulator (+ bind*)
       — komponen UI; gaya .pwr-* ada di shared/base.css.
   ============================================================ */

function tandaNegatif(p) {
  return p.num < 0;
}

function absPecahan(p) {
  return pecahan(Math.abs(p.num), p.den);
}

/* Cara baca bilangan bulat atau pecahan: −3 → "negatif tiga", 2/3 → "dua per tiga". */
function bacaBasisPangkat(a) {
  if (typeof a === 'object' && a !== null) {
    var p = keFraksi(a);
    var teks = terbilang(Math.abs(p.num)) + (p.den === 1 ? '' : ' per ' + terbilang(p.den));
    return (p.num < 0 ? 'negatif ' : '') + teks;
  }
  return bacaBilanganBulat(a);
}

/*
 * Cara baca baku aⁿ: "dua pangkat tiga", "lima pangkat negatif dua",
 * "negatif tiga pangkat empat" ((−3)⁴). opts.negLuar → −aⁿ dibaca
 * "negatif dari a pangkat n".
 */
function bacaPangkat(a, n, opts) {
  opts = opts || {};
  return (
    (opts.negLuar ? 'negatif dari ' : '') + bacaBasisPangkat(a) + ' pangkat ' + bacaBilanganBulat(n)
  );
}

/* Notasi baku: (−3)⁴, 5⁻², atau −3⁴ bila opts.negLuar. */
function ekspresiPangkat(a, n, opts) {
  opts = opts || {};
  return (opts.negLuar ? '−' : '') + formatPangkat(a, n);
}

/* Unsur-unsur bilangan berpangkat. Tanda di luar pangkat bukan bagian basis. */
function unsurPangkat(a, n, opts) {
  opts = opts || {};
  return {
    basis: a,
    pangkat: n,
    teksBasis: formatBasis(a),
    teksPangkat: fmtBulat(n),
    banyakFaktor: n > 0 ? n : 0,
    negLuar: !!opts.negLuar,
  };
}

/*
 * Bentuk perkalian berulang: n > 0 → "a × a × …", n = 0 → "1",
 * n < 0 → "1 : (a × a …)". Lebih dari opts.maks faktor (default 12)
 * disingkat "a × a × … × a (n faktor)".
 */
function tulisPerkalianBerulang(a, n, opts) {
  opts = opts || {};
  var maks = opts.maks || 12;
  var b = formatBasis(a);
  var k = Math.abs(n);
  if (k === 0) return '1';
  var kali =
    k > maks
      ? b + ' × ' + b + ' × … × ' + b + ' (' + k + ' faktor)'
      : faktorPangkat(b, k).join(' × ');
  if (n > 0) return kali;
  return k === 1 ? '1 : ' + b : '1 : (' + kali + ')';
}

var KATA_ANGKA_CACHE = null;

/* Kata bilangan cacah 0 … 1.000 → bilangan ("enam belas" → 16); null bila tak dikenal. */
function angkaDariKata(teks) {
  if (!KATA_ANGKA_CACHE) {
    KATA_ANGKA_CACHE = {};
    for (var i = 0; i <= 1000; i++) KATA_ANGKA_CACHE[terbilang(i)] = i;
  }
  var t = normalisasiBacaan(teks);
  return Object.prototype.hasOwnProperty.call(KATA_ANGKA_CACHE, t) ? KATA_ANGKA_CACHE[t] : null;
}

/*
 * Mengurai bacaan "[negatif dari] [negatif] BASIS pangkat [negatif] PANGKAT"
 * (juga "BASIS kuadrat" dan basis "X per Y").
 * Kembalian { negLuar, basisNeg, basis: {num, den} (tanpa tanda), pangkat } atau null.
 */
function parseBacaPangkat(teks) {
  var t = normalisasiBacaan(teks).replace(/ kuadrat$/, ' pangkat dua');
  var bagian = t.split(' pangkat ');
  if (bagian.length !== 2 || !bagian[0] || !bagian[1]) return null;
  var kiri = bagian[0];
  var kanan = bagian[1];
  var negLuar = false;
  var basisNeg = false;
  if (/^negatif dari /.test(kiri)) {
    negLuar = true;
    kiri = kiri.replace(/^negatif dari /, '');
  }
  if (/^negatif /.test(kiri)) {
    basisNeg = true;
    kiri = kiri.replace(/^negatif /, '');
  }
  var basis;
  var per = kiri.split(' per ');
  if (per.length === 2) {
    var num = angkaDariKata(per[0]);
    var den = angkaDariKata(per[1]);
    if (num === null || !den) return null;
    basis = { num: num, den: den };
  } else if (per.length === 1) {
    var v = angkaDariKata(kiri);
    if (v === null) return null;
    basis = { num: v, den: 1 };
  } else {
    return null;
  }
  var pangkatNeg = /^negatif /.test(kanan);
  var p = angkaDariKata(kanan.replace(/^negatif /, ''));
  if (p === null) return null;
  return {
    negLuar: negLuar,
    basisNeg: basisNeg,
    basis: basis,
    pangkat: pangkatNeg ? -p : p,
  };
}

var PESAN_BACA_PANGKAT = {
  kosong: 'Ketik cara membacanya terlebih dahulu.',
  angka:
    'Tuliskan cara bacanya dengan <strong>kata-kata</strong>, bukan angka. Contoh: 4² dibaca "empat pangkat dua".',
  minus:
    'Hampir tepat! Tanda negatif dibaca <strong>negatif</strong>, bukan "minus". "Minus" adalah nama operasi pengurangan.',
  kali: 'Bilangan berpangkat tidak dibaca "kali". Angka kecil di kanan atas dibaca dengan kata <strong>pangkat</strong>.',
  tanpaPangkat:
    'Ada kata yang hilang. Di antara basis dan angka kecil di kanan atas ada kata <strong>pangkat</strong>.',
  tertukar:
    'Basis dan pangkatnya tertukar. Baca dulu <strong>basis</strong> (angka besar), lalu kata "pangkat", lalu <strong>pangkat</strong> (angka kecil di kanan atas).',
  tandaBasis:
    'Perhatikan tanda basisnya. Apakah basisnya bilangan negatif (ditulis di dalam kurung) atau positif?',
  tandaPangkat:
    'Perhatikan tanda pangkatnya. Pangkat negatif dibaca "pangkat <strong>negatif</strong> …", pangkat positif dibaca tanpa kata negatif.',
  kurung:
    'Perhatikan kurungnya. (−3)⁴ basisnya −3, dibaca "negatif tiga pangkat empat"; −3⁴ basisnya 3, dibaca "negatif <strong>dari</strong> tiga pangkat empat".',
  lain: 'Belum tepat. Tentukan basis (angka besar) dan pangkat (angka kecil di kanan atas), lalu baca: "[basis] pangkat [pangkat]".',
};

/*
 * Memeriksa cara baca aⁿ (atau −aⁿ bila opts.negLuar) yang diketik murid.
 * Kembalian { benar, kode, pesan }; kode 'benar' | 'kosong' | 'angka' |
 * 'minus' | 'kali' | 'tanpaPangkat' | 'tertukar' | 'tandaBasis' |
 * 'tandaPangkat' | 'kurung' | 'lain'.
 */
function cekBacaPangkat(teks, a, n, opts) {
  opts = opts || {};
  function hasil(kode) {
    if (kode === 'benar') {
      return {
        benar: true,
        kode: kode,
        pesan:
          'Tepat! ' +
          esc(ekspresiPangkat(a, n, opts)) +
          ' dibaca "' +
          esc(bacaPangkat(a, n, opts)) +
          '".',
      };
    }
    return { benar: false, kode: kode, pesan: PESAN_BACA_PANGKAT[kode] };
  }
  var mentah = String(teks || '').trim();
  if (!mentah) return hasil('kosong');
  if (/\d/.test(mentah)) return hasil('angka');
  var t = normalisasiBacaan(mentah);
  var pakaiMinus = /\bmin(us)?\b/.test(t);
  t = t.replace(/\bmin(us)?\b/g, 'negatif');
  if (!/\b(pangkat|kuadrat)\b/.test(t)) {
    return hasil(/\b(kali|dikali|dikalikan)\b/.test(t) ? 'kali' : 'tanpaPangkat');
  }
  var p = parseBacaPangkat(t);
  if (!p) return hasil('lain');
  var target = keFraksi(a);
  var tNeg = tandaNegatif(target);
  var tLuar = !!opts.negLuar;
  var basisSama = samaPecahan(p.basis, absPecahan(target));
  if (basisSama && p.pangkat === n && p.basisNeg === tNeg && p.negLuar === tLuar) {
    return hasil(pakaiMinus ? 'minus' : 'benar');
  }
  if (
    target.den === 1 &&
    p.basis.den === 1 &&
    p.basis.num === Math.abs(n) &&
    Math.abs(p.pangkat) === Math.abs(target.num)
  ) {
    return hasil('tertukar');
  }
  if (basisSama && p.pangkat === n) {
    return hasil((p.negLuar || p.basisNeg) && (tLuar || tNeg) ? 'kurung' : 'tandaBasis');
  }
  if (
    basisSama &&
    p.basisNeg === tNeg &&
    p.negLuar === tLuar &&
    Math.abs(p.pangkat) === Math.abs(n)
  ) {
    return hasil('tandaPangkat');
  }
  return hasil('lain');
}

/* Basis dari isian: "(−3)", "-3", "2/3" → pecahan eksak; null bila tidak valid. */
function bacaIsianBasis(str) {
  var s = String(str || '')
    .replace(/\s/g, '')
    .replace(/^\((.*)\)$/, '$1');
  var r = parseInputPecahan(s);
  return r.error ? { value: null, error: r.error } : r;
}

function bacaIsianPangkat(str) {
  return parseInputInt(String(str || ''));
}

var PESAN_TULIS_PANGKAT = {
  kosong: 'Isi kotak basis dan kotak pangkat terlebih dahulu.',
  invalid: 'Tuliskan basis dan pangkat dengan angka, mis. basis 5 dan pangkat −2.',
  nilai:
    'Itu nilai hasilnya. Yang diminta adalah <strong>bentuk pangkatnya</strong>: tulis basis dan pangkatnya.',
  tertukar:
    'Basis dan pangkatnya tertukar. Basis ditulis besar di bawah; pangkat ditulis kecil di kanan atas.',
  tandaBasis: 'Periksa tanda basisnya: apakah basisnya bilangan negatif atau positif?',
  tandaPangkat:
    'Periksa tanda pangkatnya: pangkat negatif ditulis dengan tanda − di kotak pangkat.',
  pangkatSalah:
    'Basisnya sudah tepat. Periksa lagi pangkatnya: berapa kali basis dikalikan, atau pangkat berapa yang disebut?',
  basisSalah:
    'Pangkatnya sudah tepat. Periksa lagi basisnya: bilangan apa yang dikalikan berulang?',
  lain: 'Belum tepat. Tentukan dulu basisnya (bilangan yang dikalikan) dan pangkatnya.',
};

/*
 * Memeriksa isian penulis pangkat { basis, pangkat } (string) terhadap aⁿ.
 * Kembalian { benar, kode, pesan }; kode 'benar' | 'kosong' | 'invalid' |
 * 'nilai' | 'tertukar' | 'tandaBasis' | 'tandaPangkat' | 'pangkatSalah' |
 * 'basisSalah' | 'lain'.
 */
function cekTulisPangkat(isian, a, n) {
  function hasil(kode) {
    if (kode === 'benar') {
      return {
        benar: true,
        kode: kode,
        pesan:
          'Tepat! Ditulis ' +
          esc(formatPangkat(a, n)) +
          ' dan dibaca "' +
          esc(bacaPangkat(a, n)) +
          '".',
      };
    }
    return { benar: false, kode: kode, pesan: PESAN_TULIS_PANGKAT[kode] };
  }
  isian = isian || {};
  var b = bacaIsianBasis(isian.basis);
  var p = bacaIsianPangkat(isian.pangkat);
  if (b.error === 'empty' || p.error === 'empty') return hasil('kosong');
  if (b.error || p.error) return hasil('invalid');
  var target = keFraksi(a);
  var basis = b.value;
  var pangkat = p.value;
  if (samaPecahan(basis, target) && pangkat === n) return hasil('benar');
  if (pangkat === 1 && n !== 1 && samaPecahan(basis, pangkatBulat(a, n))) return hasil('nilai');
  if (target.den === 1 && basis.den === 1 && basis.num === n && pangkat === target.num) {
    return hasil('tertukar');
  }
  var besarSama = samaPecahan(absPecahan(basis), absPecahan(target));
  if (besarSama && !samaPecahan(basis, target) && pangkat === n) return hasil('tandaBasis');
  if (samaPecahan(basis, target) && pangkat === -n) return hasil('tandaPangkat');
  if (samaPecahan(basis, target)) return hasil('pangkatSalah');
  if (pangkat === n) return hasil('basisSalah');
  return hasil('lain');
}

/* Notasi dari isian penulis pangkat; '' bila salah satu kotak kosong/tidak valid. */
function pratinjauTulisPangkat(isian) {
  isian = isian || {};
  var b = bacaIsianBasis(isian.basis);
  var p = bacaIsianPangkat(isian.pangkat);
  if (b.error || p.error) return '';
  var basis = b.value.den === 1 ? b.value.num : b.value;
  return formatPangkat(basis, p.value);
}

/* Banyak lapisan kertas setelah k kali dilipat dua. */
function lapisanKertas(k) {
  return Math.pow(2, k);
}

/* ------------------------------------------------------------
   Penulis pangkat: kotak basis (besar) + kotak pangkat (kecil,
   terangkat di kanan atas) dengan pratinjau notasi.
     st           { basis: '', pangkat: '' }
     opts.locked  true → isian dinonaktifkan
     opts.status  'ok' | 'bad' — bingkai hijau/merah
   ------------------------------------------------------------ */

function teksPratinjauPangkat(st) {
  var notasi = pratinjauTulisPangkat(st);
  return notasi ? 'Tertulis: ' + notasi : 'Tertulis: …';
}

function buildPowerWriter(id, st, opts) {
  opts = opts || {};
  st = st || {};
  function kotak(part, label) {
    return (
      '<span class="pwr-writer__slot pwr-writer__slot--' +
      part +
      '">' +
      '<input type="text" class="pwr-writer__input pwr-writer__input--' +
      part +
      '" id="' +
      esc(id) +
      '-' +
      part +
      '" data-pwr="' +
      esc(id) +
      '" data-part="' +
      part +
      '" inputmode="text" autocomplete="off" spellcheck="false" aria-label="' +
      label +
      '" placeholder="' +
      label.toLowerCase() +
      '" value="' +
      esc(st[part] || '') +
      '"' +
      (opts.locked ? ' disabled' : '') +
      '>' +
      '</span>'
    );
  }
  return (
    '<div class="pwr-writer' +
    (opts.status ? ' is-' + opts.status : '') +
    '" id="' +
    esc(id) +
    '">' +
    '<div class="pwr-writer__expr">' +
    kotak('basis', 'Basis') +
    kotak('pangkat', 'Pangkat') +
    '</div>' +
    '<p class="pwr-writer__preview" id="' +
    esc(id) +
    '-preview" aria-live="polite">' +
    esc(teksPratinjauPangkat(st)) +
    '</p>' +
    '</div>'
  );
}

/* Memasang event penulis pangkat; pratinjau diperbarui tanpa render ulang. */
function bindPowerWriter(root, id, st, save, onEnter) {
  var preview = root.querySelector('#' + id + '-preview');
  root.querySelectorAll('[data-pwr="' + id + '"]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      st[inp.dataset.part] = inp.value;
      if (preview) preview.textContent = teksPratinjauPangkat(st);
      save();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && onEnter) onEnter();
    });
  });
}

/* ------------------------------------------------------------
   Anatomi bilangan berpangkat: basis besar + pangkat kecil di
   kanan atas (+ tanda di luar pangkat bila opts.negLuar).
     opts.label  true → chip keterangan "basis" dan "pangkat"
     opts.pick   { chosen, correct } → setiap bagian menjadi tombol
                 yang bisa diketuk; `correct` diisi hanya setelah
                 bagian benar dipilih (terkunci) atau untuk menandai
                 pilihan salah
   ------------------------------------------------------------ */

function buildPowerAnatomy(id, a, n, opts) {
  opts = opts || {};
  var pick = opts.pick || null;
  var parts = [];
  if (opts.negLuar) parts.push({ part: 'tanda', teks: '−', aria: 'Tanda − di depan' });
  parts.push({ part: 'basis', teks: formatBasis(a), aria: 'Angka besar ' + formatBasis(a) });
  parts.push({
    part: 'pangkat',
    teks: fmtBulat(n),
    aria: 'Angka kecil ' + fmtBulat(n) + ' di kanan atas',
  });
  var terkunci = !!(pick && pick.chosen && pick.chosen === pick.correct);
  var expr = parts
    .map(function (p) {
      var cls = 'pwr-anatomy__part pwr-anatomy__' + p.part;
      if (!pick) return '<span class="' + cls + '">' + esc(p.teks) + '</span>';
      if (pick.chosen === p.part && pick.correct) {
        cls += p.part === pick.correct ? ' is-correct' : ' is-incorrect';
      }
      return (
        '<button type="button" class="' +
        cls +
        '" data-anatomy="' +
        esc(id) +
        '" data-part="' +
        p.part +
        '" aria-pressed="' +
        (pick.chosen === p.part ? 'true' : 'false') +
        '" aria-label="' +
        esc(p.aria) +
        '"' +
        (terkunci ? ' disabled' : '') +
        '>' +
        esc(p.teks) +
        '</button>'
      );
    })
    .join('');
  var legend = opts.label
    ? '<div class="pwr-anatomy__legend">' +
      '<span class="pwr-chip pwr-chip--basis">basis: ' +
      esc(formatBasis(a).replace(/^\((.*)\)$/, '$1')) +
      '</span>' +
      '<span class="pwr-chip pwr-chip--pangkat">pangkat: ' +
      esc(fmtBulat(n)) +
      '</span>' +
      '</div>'
    : '';
  return (
    '<div class="pwr-anatomy" id="' +
    esc(id) +
    '">' +
    '<span class="pwr-anatomy__expr" aria-label="' +
    esc(ekspresiPangkat(a, n, opts)) +
    '">' +
    expr +
    '</span>' +
    legend +
    '</div>'
  );
}

/* onPick(part) dipanggil saat sebuah bagian diketuk. */
function bindPowerAnatomy(root, id, onPick) {
  root.querySelectorAll('[data-anatomy="' + id + '"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      onPick(btn.dataset.part);
    });
  });
}

/* ------------------------------------------------------------
   Simulator kertas lipat: selembar kertas dilipat dua berulang.
   Garis lipatan pada kertas terbuka membagi kertas menjadi 2ᵏ
   bagian = banyak lapisan kertas yang terlipat.
     k              banyak lipatan saat ini
     opts.max       lipatan terbanyak (default 6)
     opts.tercapai  lipatan terbanyak yang pernah dicapai; baris
                    tabel catatan 0 … tercapai ditampilkan
   ------------------------------------------------------------ */

function buildFoldSimulator(id, k, opts) {
  opts = opts || {};
  var max = opts.max || 6;
  var tercapai = Math.max(k, opts.tercapai || 0);
  var W = 240;
  var H = 150;
  var kol = Math.pow(2, Math.ceil(k / 2));
  var bar = Math.pow(2, Math.floor(k / 2));
  var cw = W / kol;
  var ch = H / bar;
  var garis = '';
  for (var i = 1; i < kol; i++) {
    garis +=
      '<line class="pwr-fold__crease" x1="' +
      i * cw +
      '" y1="0" x2="' +
      i * cw +
      '" y2="' +
      H +
      '"/>';
  }
  for (var j = 1; j < bar; j++) {
    garis +=
      '<line class="pwr-fold__crease" x1="0" y1="' +
      j * ch +
      '" x2="' +
      W +
      '" y2="' +
      j * ch +
      '"/>';
  }
  var lapis = lapisanKertas(k);
  var svg =
    '<svg class="pwr-fold__svg" viewBox="-4 -4 ' +
    (W + 8) +
    ' ' +
    (H + 8) +
    '" role="img" aria-label="Kertas yang dibuka kembali terbagi menjadi ' +
    lapis +
    ' bagian oleh garis lipatan">' +
    '<rect class="pwr-fold__sheet" x="0" y="0" width="' +
    W +
    '" height="' +
    H +
    '"/>' +
    garis +
    '<rect class="pwr-fold__piece" x="0" y="0" width="' +
    cw +
    '" height="' +
    ch +
    '"/>' +
    '</svg>';
  var readout =
    k === 0
      ? 'Belum dilipat · Banyak lapisan: <strong>1</strong>'
      : 'Lipatan: <strong>' +
        k +
        '</strong> · Banyak lapisan: <strong>' +
        esc(tulisPerkalianBerulang(2, k)) +
        ' = ' +
        formatNumber(lapis) +
        '</strong>';
  var rows = '';
  for (var r = 0; r <= tercapai; r++) {
    rows +=
      '<tr' +
      (r === k ? ' class="is-current"' : '') +
      '><td>' +
      r +
      '</td><td>' +
      (r === 0 ? '— (belum dilipat)' : esc(tulisPerkalianBerulang(2, r))) +
      '</td><td>' +
      formatNumber(lapisanKertas(r)) +
      '</td></tr>';
  }
  return (
    '<div class="pwr-fold" id="' +
    esc(id) +
    '">' +
    '<div class="pwr-fold__stage">' +
    svg +
    '<p class="pwr-fold__readout" aria-live="polite">' +
    readout +
    '</p>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" data-fold="lipat" data-fold-id="' +
    esc(id) +
    '"' +
    (k >= max ? ' disabled' : '') +
    '>📄 Lipat dua</button>' +
    '<button type="button" class="btn btn--ghost" data-fold="buka" data-fold-id="' +
    esc(id) +
    '"' +
    (k <= 0 ? ' disabled' : '') +
    '>↩ Buka satu lipatan</button>' +
    '</div>' +
    '</div>' +
    '<div class="table-scroll"><table class="data-table pwr-fold__table">' +
    '<caption>Catatan percobaan</caption>' +
    '<thead><tr><th scope="col">Banyak lipatan</th><th scope="col">Perkalian berulang</th><th scope="col">Banyak lapisan</th></tr></thead>' +
    '<tbody>' +
    rows +
    '</tbody></table></div>' +
    '</div>'
  );
}

/* onChange(delta) dipanggil dengan +1 (lipat) atau −1 (buka). */
function bindFoldSimulator(root, id, onChange) {
  root.querySelectorAll('[data-fold-id="' + id + '"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      onChange(btn.dataset.fold === 'lipat' ? 1 : -1);
    });
  });
}

/* ------------------------------------------------------------
   Langkah isian bilangan berpangkat berpemeriksa:
     step.jenis 'tulis' → penulis pangkat (basis + pangkat),
                          diperiksa cekTulisPangkat
     step.jenis 'baca'  → cara baca diketik, diperiksa cekBacaPangkat
     step { jenis, a, n, negLuar, label, hints, temuan, placeholder }
   State: makePangkatStep(). Isian kosong/tidak valid tidak dihitung
   sebagai percobaan.
   ------------------------------------------------------------ */

function makePangkatStep() {
  return {
    isian: { basis: '', pangkat: '' },
    input: '',
    done: false,
    kode: null,
    pesan: '',
    attempts: 0,
    hintLevel: 0,
  };
}

function periksaPangkatStep(st, step, input) {
  var r;
  if (step.jenis === 'baca') {
    r = cekBacaPangkat(input, step.a, step.n, { negLuar: step.negLuar });
    st.input = String(input || '').trim();
  } else {
    input = input || {};
    r = cekTulisPangkat(input, step.a, step.n);
    st.isian = { basis: String(input.basis || ''), pangkat: String(input.pangkat || '') };
  }
  st.kode = r.kode;
  st.pesan = r.pesan;
  if (r.kode === 'kosong' || r.kode === 'invalid') return r;
  st.attempts += 1;
  st.done = r.benar;
  return r;
}

function buildPangkatStep(id, st, step, num) {
  var opts = { negLuar: step.negLuar };
  var head =
    '<p class="dl-step__label">' +
    (num ? '<span class="dl-step__num">' + num + '</span>' : '') +
    step.label +
    '</p>';
  if (st.done) {
    return (
      '<div class="dl-step dl-step--done">' +
      head +
      '<p class="dl-step__answer">✓ <span class="pwr-answer">' +
      esc(ekspresiPangkat(step.a, step.n, opts)) +
      '</span> — dibaca "' +
      esc(bacaPangkat(step.a, step.n, opts)) +
      '"</p>' +
      (step.temuan ? buildFeedbackBox('success', '💡', step.temuan) : '') +
      '</div>'
    );
  }
  var salah = st.attempts > 0 && st.kode && st.kode !== 'benar';
  var baca = step.jenis === 'baca';
  var isian = baca
    ? '<input type="text" class="input-text bbk-baca-input' +
      (salah ? ' has-error' : '') +
      '" id="' +
      id +
      'Input" inputmode="text" autocapitalize="off" spellcheck="false" autocomplete="off" value="' +
      esc(st.input || '') +
      '" aria-label="Cara membaca bilangan berpangkat" placeholder="' +
      esc(step.placeholder || 'ketik cara bacanya…') +
      '">'
    : buildPowerWriter(id + 'W', st.isian, { status: salah ? 'bad' : null });
  var tertulis = baca ? esc(st.input) : esc(pratinjauTulisPangkat(st.isian) || '…');
  return (
    '<div class="dl-step">' +
    head +
    '<div class="dl-input-row pwr-step-row">' +
    isian +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    'Check">Periksa</button>' +
    buildHintToggle(id + 'Hint', step.hints, st.hintLevel) +
    '</div>' +
    (salah
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox('error', '✗', '<strong>' + tertulis + '</strong> — ' + st.pesan) +
        '</div>'
      : '') +
    buildHintStack(step.hints, st.hintLevel) +
    '</div>'
  );
}

/* Memasang event buildPangkatStep; `save` lalu `rerender` dipanggil setelah pemeriksaan. */
function bindPangkatStep(id, st, step, save, rerender) {
  var btn = document.getElementById(id + 'Check');
  var hint = document.getElementById(id + 'Hint');
  var inp = document.getElementById(id + 'Input');
  if (btn) {
    if (step.jenis === 'baca' && inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') btn.click();
      });
    } else {
      bindPowerWriter(document, id + 'W', st.isian, save, function () {
        btn.click();
      });
    }
    btn.addEventListener('click', function () {
      var r = periksaPangkatStep(st, step, step.jenis === 'baca' && inp ? inp.value : st.isian);
      if (r.kode === 'kosong' || r.kode === 'invalid') {
        showNotice(r.pesan);
        return;
      }
      save();
      rerender();
      if (!st.done) {
        var again =
          document.getElementById(id + 'Input') || document.getElementById(id + 'W-basis');
        if (again) again.focus();
      }
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, (step.hints || []).length);
      save();
      rerender();
    });
  }
}

/* ============================================================
   31. PRISMA — UNSUR & JARING-JARING
   Dipakai modul unsur-unsur & jaring-jaring prisma (fase-d/mpi-22.1).

   Model 3D prisma tegak segi-n beraturan:
     titik  [{ id, nama, pos: [x, y, z], sisi: [idSisi ×3] }]
            indeks 0..n−1 titik alas (A, B, C, …), n..2n−1 titik atas
     rusuk  [{ id, jenis: 'alas'|'atas'|'tegak', a, b, nama, sisi: [×2] }]
            id 'a<i>' rusuk alas, 'b<i>' rusuk atas, 'c<i>' rusuk tegak
     sisi   [{ id, jenis: 'alas'|'atas'|'tegak', idx: [...], nama }]
            id 'alas', 'atas', 't<i>' (sisi tegak ke-i)
   Sumbu z ke atas. Proyeksi ortografis: diputar `azimut` derajat
   mengelilingi sumbu z, lalu dilihat dari ketinggian `elevasi` derajat.

   Jaring-jaring "sabuk": rangkaian `sabuk` persegi panjang (lebar s,
   tinggi h) berjajar mendatar; segi-n tutup ditempel pada tepi atas
   persegi panjang ke-i (spec.atas) dan segi-n alas pada tepi bawahnya
   (spec.alas). Kepingan membentuk pohon engsel yang bisa dilipat:
   antarpersegi panjang sebesar sudut luar 360°/n, persegi panjang–segi-n
   sebesar 90°. Koordinat jaring: x ke kanan, y ke bawah, z = 0; lipatan
   selalu ke arah +z.

   Komponen UI: penjelajah prisma (putar, tandai titik/rusuk/sisi),
   tabel isian unsur berdiagnosa, gambar jaring datar, tampilan lipat
   beranimasi, dan perakit jaring (tempel alas & tutup lalu uji lipat).
   Gaya .psm-* ada di shared/base.css.
   ============================================================ */

var PSM_NAMA_SEGI = {
  3: 'segitiga',
  4: 'segiempat',
  5: 'segilima',
  6: 'segienam',
  7: 'segitujuh',
  8: 'segidelapan',
  9: 'segisembilan',
  10: 'segisepuluh',
};

function namaSegiN(n) {
  return PSM_NAMA_SEGI[n] || 'segi-' + n;
}

function namaPrisma(n) {
  return 'prisma ' + namaSegiN(n);
}

/* Label titik sudut: alas A, B, C, … lalu atas melanjutkan abjad (n ≤ 13). */
function labelTitikPrisma(n) {
  var huruf = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return {
    alas: huruf.slice(0, n).split(''),
    atas: huruf.slice(n, 2 * n).split(''),
  };
}

function notasiPrisma(n) {
  var L = labelTitikPrisma(n);
  return L.alas.join('') + '.' + L.atas.join('');
}

function unsurPrisma(n) {
  return {
    titik: 2 * n,
    rusukAlas: n,
    rusukAtas: n,
    rusukTegak: n,
    rusuk: 3 * n,
    sisiAlas: 1,
    sisiAtas: 1,
    sisiTegak: n,
    sisi: n + 2,
  };
}

/*
 * opts.r        jari-jari lingkaran luar alas (default 1)
 * opts.tinggi   tinggi prisma (default 1,5)
 * opts.sumbu    'tegak' (default) atau 'rebah' — prisma berbaring pada
 *               sisi tegaknya, sumbu mendatar (tenda, cokelat batang)
 * opts.sudutAwal  sudut titik A pada lingkaran alas (radian)
 */
function modelPrisma(n, opts) {
  opts = opts || {};
  var r = opts.r || 1;
  var h = opts.tinggi || 1.5;
  var rebah = opts.sumbu === 'rebah';
  /* Rebah: titik puncak di atas (n ganjil) atau sisi datar di bawah (n genap). */
  var awal =
    typeof opts.sudutAwal === 'number'
      ? opts.sudutAwal
      : rebah
      ? -Math.PI / 2 + (n % 2 ? 0 : Math.PI / n)
      : -Math.PI / 2 - Math.PI / n;
  var L = labelTitikPrisma(n);
  var titik = [];
  [0, h].forEach(function (z, lapis) {
    for (var i = 0; i < n; i++) {
      var a = awal + (2 * Math.PI * i) / n;
      var u = r * Math.cos(a);
      var v = r * Math.sin(a);
      var pos = rebah ? [u, z - h / 2, -v] : [u, v, z];
      var idx = lapis * n + i;
      var prev = (i - 1 + n) % n;
      titik.push({
        id: 'p' + idx,
        nama: lapis ? L.atas[i] : L.alas[i],
        pos: pos,
        sisi: [lapis ? 'atas' : 'alas', 't' + prev, 't' + i],
      });
    }
  });
  function nm(list) {
    return list
      .map(function (k) {
        return titik[k].nama;
      })
      .join('');
  }
  var rusuk = [];
  var sisi = [];
  var alasIdx = [];
  var atasIdx = [];
  for (var i = 0; i < n; i++) {
    var j = (i + 1) % n;
    alasIdx.push(i);
    atasIdx.push(n + i);
    rusuk.push({ id: 'a' + i, jenis: 'alas', a: i, b: j, sisi: ['alas', 't' + i] });
    rusuk.push({ id: 'b' + i, jenis: 'atas', a: n + i, b: n + j, sisi: ['atas', 't' + i] });
    rusuk.push({
      id: 'c' + i,
      jenis: 'tegak',
      a: i,
      b: n + i,
      sisi: ['t' + ((i - 1 + n) % n), 't' + i],
    });
  }
  rusuk.forEach(function (e) {
    e.nama = nm([e.a, e.b]);
  });
  sisi.push({ id: 'alas', jenis: 'alas', idx: alasIdx, nama: nm(alasIdx) });
  sisi.push({ id: 'atas', jenis: 'atas', idx: atasIdx, nama: nm(atasIdx) });
  for (var k = 0; k < n; k++) {
    var q = (k + 1) % n;
    var idx = [k, q, n + q, n + k];
    sisi.push({ id: 't' + k, jenis: 'tegak', idx: idx, nama: nm(idx) });
  }
  var pusat = [0, 0, 0];
  titik.forEach(function (t) {
    for (var d = 0; d < 3; d++) pusat[d] += t.pos[d] / titik.length;
  });
  return { n: n, titik: titik, rusuk: rusuk, sisi: sisi, pusat: pusat, tinggi: h };
}

function psmSub(p, q) {
  return [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
}

function psmCross(p, q) {
  return [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
}

function psmDot(p, q) {
  return p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
}

function psmPusat(pts) {
  var c = [0, 0, 0];
  pts.forEach(function (p) {
    for (var d = 0; d < 3; d++) c[d] += p[d] / pts.length;
  });
  return c;
}

/* Proyeksi ortografis: { x, y (ke bawah layar), d (kedalaman ke arah pengamat) }. */
function proyeksiPrisma(p, view) {
  var az = ((view.azimut || 0) * Math.PI) / 180;
  var el = ((view.elevasi || 0) * Math.PI) / 180;
  var x1 = p[0] * Math.cos(az) - p[1] * Math.sin(az);
  var y1 = p[0] * Math.sin(az) + p[1] * Math.cos(az);
  var z = p[2];
  return {
    x: x1,
    y: -(y1 * Math.sin(el) + z * Math.cos(el)),
    d: -y1 * Math.cos(el) + z * Math.sin(el),
  };
}

/* Arah dari benda ke pengamat, dalam koordinat model. */
function psmArahPengamat(view) {
  var az = ((view.azimut || 0) * Math.PI) / 180;
  var el = ((view.elevasi || 0) * Math.PI) / 180;
  /* v' = (0, −cos el, sin el) diputar balik sebesar −az. */
  var vy = -Math.cos(el);
  return [vy * Math.sin(az), vy * Math.cos(az), Math.sin(el)];
}

function psmNormalLuar(pts, pusatBenda) {
  var nrm = psmCross(psmSub(pts[1], pts[0]), psmSub(pts[2], pts[0]));
  if (psmDot(nrm, psmSub(psmPusat(pts), pusatBenda)) < 0) nrm = [-nrm[0], -nrm[1], -nrm[2]];
  return nrm;
}

function sisiTerlihatPrisma(model, view) {
  var v = psmArahPengamat(view);
  var out = {};
  model.sisi.forEach(function (s) {
    var pts = s.idx.map(function (k) {
      return model.titik[k].pos;
    });
    out[s.id] = psmDot(psmNormalLuar(pts, model.pusat), v) > 1e-9;
  });
  return out;
}

function rusukTerlihatPrisma(model, view) {
  var vs = sisiTerlihatPrisma(model, view);
  var out = {};
  model.rusuk.forEach(function (e) {
    out[e.id] = !!(vs[e.sisi[0]] || vs[e.sisi[1]]);
  });
  return out;
}

function titikTerlihatPrisma(model, view) {
  var vs = sisiTerlihatPrisma(model, view);
  var out = {};
  model.titik.forEach(function (t) {
    out[t.id] = t.sisi.some(function (id) {
      return vs[id];
    });
  });
  return out;
}

/* ---------- Diagnosa isian tabel unsur ---------- */

var PSM_PESAN_UNSUR = {
  benar: 'Tepat!',
  'titik-satu-alas':
    'Sepertinya kamu baru menghitung titik sudut pada satu alas. Jangan lupa titik sudut pada sisi atasnya juga.',
  'rusuk-lupa-tegak':
    'Kamu sudah menghitung rusuk alas dan rusuk atas. Masih ada rusuk tegak yang menghubungkan keduanya.',
  'rusuk-satu-alas': 'Itu baru rusuk pada satu alas. Hitung juga rusuk atas dan rusuk tegak.',
  'sisi-lupa-alas': 'Itu baru sisi tegaknya. Sisi alas dan sisi atas juga termasuk sisi prisma.',
  'sisi-lupa-satu': 'Hampir! Masih ada satu sisi yang terlewat: sisi alas atau sisi atas.',
  salah: 'Belum tepat. Tandai unsurnya satu per satu pada model, lalu hitung lagi.',
};

function diagnosaUnsur(n, jenis, nilai) {
  var u = unsurPrisma(n);
  var kode = 'salah';
  if (jenis === 'titik') {
    if (nilai === u.titik) kode = 'benar';
    else if (nilai === n) kode = 'titik-satu-alas';
  } else if (jenis === 'rusuk') {
    if (nilai === u.rusuk) kode = 'benar';
    else if (nilai === 2 * n) kode = 'rusuk-lupa-tegak';
    else if (nilai === n) kode = 'rusuk-satu-alas';
  } else if (jenis === 'sisi') {
    if (nilai === u.sisi) kode = 'benar';
    else if (nilai === n) kode = 'sisi-lupa-alas';
    else if (nilai === n + 1) kode = 'sisi-lupa-satu';
  }
  return { kode: kode, pesan: PSM_PESAN_UNSUR[kode] };
}

/* ---------- Jaring-jaring sabuk ---------- */

function psmIndeksUnik(list, m) {
  var out = [];
  (list || []).forEach(function (i) {
    if (Number.isInteger(i) && i >= 0 && i < m && out.indexOf(i) === -1) out.push(i);
  });
  return out;
}

/* Segi-n beraturan bersisi s pada tepi p0→p1; arah = −1 ke atas (y < 0), +1 ke bawah. */
function psmSegiPadaTepi(p0, s, n, arah) {
  var ext = (2 * Math.PI) / n;
  var pts = [[p0[0], p0[1]]];
  for (var k = 0; k < n - 1; k++) {
    var a = arah * k * ext;
    var last = pts[pts.length - 1];
    pts.push([last[0] + s * Math.cos(a), last[1] + s * Math.sin(a)]);
  }
  return pts;
}

/*
 * spec = { n, sabuk (banyak persegi panjang, default n), atas: [i…],
 *          alas: [i…], s (default 1), h (default 1,5) }
 * Mengembalikan { spec, pieces: [{ id, jenis, pts2, parent, hinge, sudut }] }.
 */
function jaringPrisma(spec) {
  var n = spec.n;
  var m = spec.sabuk || n;
  var s = spec.s || 1;
  var h = spec.h || 1.5;
  var atas = psmIndeksUnik(spec.atas, m);
  var alas = psmIndeksUnik(spec.alas, m);
  var root = Math.floor((m - 1) / 2);
  var pieces = [];
  for (var i = 0; i < m; i++) {
    var x0 = i * s;
    var x1 = (i + 1) * s;
    var pc = {
      id: 't' + i,
      jenis: 'tegak',
      pts2: [
        [x0, 0],
        [x1, 0],
        [x1, h],
        [x0, h],
      ],
      parent: null,
      hinge: null,
      sudut: 0,
    };
    if (i < root) {
      pc.parent = 't' + (i + 1);
      pc.hinge = [
        [x1, 0],
        [x1, h],
      ];
      pc.sudut = (2 * Math.PI) / n;
    } else if (i > root) {
      pc.parent = 't' + (i - 1);
      pc.hinge = [
        [x0, 0],
        [x0, h],
      ];
      pc.sudut = (2 * Math.PI) / n;
    }
    pieces.push(pc);
  }
  var ganda = atas.length > 1;
  atas.forEach(function (i) {
    pieces.push({
      id: ganda ? 'atas' + i : 'atas',
      jenis: 'atas',
      pts2: psmSegiPadaTepi([i * s, 0], s, n, -1),
      parent: 't' + i,
      hinge: [
        [i * s, 0],
        [(i + 1) * s, 0],
      ],
      sudut: Math.PI / 2,
    });
  });
  var gandaAlas = alas.length > 1;
  alas.forEach(function (i) {
    pieces.push({
      id: gandaAlas ? 'alas' + i : 'alas',
      jenis: 'alas',
      pts2: psmSegiPadaTepi([i * s, h], s, n, 1),
      parent: 't' + i,
      hinge: [
        [i * s, h],
        [(i + 1) * s, h],
      ],
      sudut: Math.PI / 2,
    });
  });
  return { spec: { n: n, sabuk: m, atas: atas, alas: alas, s: s, h: h }, pieces: pieces };
}

var PSM_PESAN_JARING = {
  valid:
    'Bisa! Rangkaian persegi panjang menutup menjadi sisi tegak, dan kedua segi-n menutup bagian atas serta bawah.',
  'alas-sepihak':
    'Tidak bisa. Kedua segi-n berada di sisi yang sama, jadi saat dilipat keduanya menumpuk di satu ujung, sedangkan ujung lainnya tetap terbuka.',
  'alas-kurang': 'Tidak bisa. Prisma butuh dua segi-n (alas dan tutup), tetapi segi-n-nya kurang.',
  'alas-lebih': 'Tidak bisa. Segi-n-nya terlalu banyak, jadi ada sisi yang menumpuk saat dilipat.',
  'sabuk-kurang':
    'Tidak bisa. Persegi panjangnya kurang, jadi sisi tegak tidak bisa menutup dan tersisa celah.',
  'sabuk-lebih':
    'Tidak bisa. Persegi panjangnya terlalu banyak, jadi saat dilipat ada sisi tegak yang menumpuk.',
};

function cekJaring(spec) {
  var n = spec.n;
  var m = spec.sabuk || n;
  var atas = psmIndeksUnik(spec.atas, m);
  var alas = psmIndeksUnik(spec.alas, m);
  var alasan = 'valid';
  if (m < n) alasan = 'sabuk-kurang';
  else if (m > n) alasan = 'sabuk-lebih';
  else if (atas.length + alas.length < 2) alasan = 'alas-kurang';
  else if (atas.length + alas.length > 2) alasan = 'alas-lebih';
  else if (atas.length !== 1) alasan = 'alas-sepihak';
  return { valid: alasan === 'valid', alasan: alasan, pesan: PSM_PESAN_JARING[alasan] };
}

/* Matriks rotasi Rodrigues untuk sumbu satuan d dan sudut th. */
function psmRotasi(d, th) {
  var c = Math.cos(th);
  var s = Math.sin(th);
  var t = 1 - c;
  var x = d[0];
  var y = d[1];
  var z = d[2];
  return [
    [t * x * x + c, t * x * y - s * z, t * x * z + s * y],
    [t * x * y + s * z, t * y * y + c, t * y * z - s * x],
    [t * x * z - s * y, t * y * z + s * x, t * z * z + c],
  ];
}

/* Transformasi afine { R, T }: p ↦ R·p + T. */
function psmTerapkan(M, p) {
  var R = M.R;
  return [
    R[0][0] * p[0] + R[0][1] * p[1] + R[0][2] * p[2] + M.T[0],
    R[1][0] * p[0] + R[1][1] * p[1] + R[1][2] * p[2] + M.T[1],
    R[2][0] * p[0] + R[2][1] * p[1] + R[2][2] * p[2] + M.T[2],
  ];
}

function psmKomposisi(A, B) {
  /* (A ∘ B)(p) = A(B(p)) */
  var R = [];
  for (var i = 0; i < 3; i++) {
    R.push([]);
    for (var j = 0; j < 3; j++) {
      R[i].push(A.R[i][0] * B.R[0][j] + A.R[i][1] * B.R[1][j] + A.R[i][2] * B.R[2][j]);
    }
  }
  return { R: R, T: psmTerapkan(A, B.T) };
}

/* Posisi 3D setiap kepingan pada fraksi lipat t (0 = datar, 1 = terlipat penuh). */
function lipatJaring(jaring, t) {
  var byId = {};
  jaring.pieces.forEach(function (p) {
    byId[p.id] = p;
  });
  var memo = {};
  var I = {
    R: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    T: [0, 0, 0],
  };
  function transf(p) {
    if (memo[p.id]) return memo[p.id];
    if (!p.parent) {
      memo[p.id] = I;
      return I;
    }
    var a = [p.hinge[0][0], p.hinge[0][1], 0];
    var b = [p.hinge[1][0], p.hinge[1][1], 0];
    var d = psmSub(b, a);
    var len = Math.sqrt(psmDot(d, d));
    d = [d[0] / len, d[1] / len, 0];
    var c = psmPusat(
      p.pts2.map(function (q) {
        return [q[0], q[1], 0];
      })
    );
    var w = psmSub(c, a);
    var arah = d[0] * w[1] - d[1] * w[0] > 0 ? 1 : -1;
    var R = psmRotasi(d, arah * t * p.sudut);
    var Ra = psmTerapkan({ R: R, T: [0, 0, 0] }, a);
    var M = { R: R, T: psmSub(a, Ra) };
    memo[p.id] = psmKomposisi(transf(byId[p.parent]), M);
    return memo[p.id];
  }
  return jaring.pieces.map(function (p) {
    var M = transf(p);
    return {
      id: p.id,
      jenis: p.jenis,
      pts3: p.pts2.map(function (q) {
        return psmTerapkan(M, [q[0], q[1], 0]);
      }),
    };
  });
}

/* ---------- UI: gambar prisma ---------- */

var PSM_JENIS_LABEL = {
  alas: 'alas',
  atas: 'atas',
  tegak: 'tegak',
};

function psmLabelUnsur(kind, obj) {
  if (kind === 'titik') return 'Titik sudut ' + obj.nama;
  if (kind === 'rusuk') return 'Rusuk ' + obj.nama + ' (rusuk ' + PSM_JENIS_LABEL[obj.jenis] + ')';
  return 'Sisi ' + obj.nama + ' (sisi ' + PSM_JENIS_LABEL[obj.jenis] + ')';
}

function psmFmt(v) {
  return String(Math.round(v * 10) / 10);
}

function psmPoints(list) {
  return list
    .map(function (p) {
      return psmFmt(p.x) + ',' + psmFmt(p.y);
    })
    .join(' ');
}

/*
 * Gambar SVG prisma dari `model` (modelPrisma) pada sudut pandang `view`.
 *   opts.skala     piksel per satuan (default 70)
 *   opts.mode      'titik' | 'rusuk' | 'sisi' | null — unsur yang bisa diketuk
 *   opts.terpilih  { titik: {id: true}, rusuk: {...}, sisi: {...} } disorot
 *   opts.label     true (default) → tulis nama titik sudut
 *   opts.aria      teks aksesibel gambar
 *   opts.kelas     class tambahan pada <svg>
 */
function buildPrismSVG(model, view, opts) {
  opts = opts || {};
  var sk = opts.skala || 70;
  var mode = opts.mode || null;
  var pilih = opts.terpilih || {};
  var pilihT = pilih.titik || {};
  var pilihR = pilih.rusuk || {};
  var pilihS = pilih.sisi || {};
  var o = model.pusat;
  var R = 0;
  var P = model.titik.map(function (t) {
    var rel = psmSub(t.pos, o);
    R = Math.max(R, Math.sqrt(psmDot(rel, rel)));
    var q = proyeksiPrisma(rel, view);
    return { x: q.x * sk, y: q.y * sk, d: q.d };
  });
  var pad = opts.label === false ? 8 : 24;
  var half = R * sk + pad;
  var vs = sisiTerlihatPrisma(model, view);
  var vr = rusukTerlihatPrisma(model, view);
  var vt = titikTerlihatPrisma(model, view);

  function hitAttr(kind, obj) {
    return (
      ' data-psm-kind="' +
      kind +
      '" data-psm-id="' +
      obj.id +
      '" tabindex="0" role="button" aria-pressed="' +
      (pilih[kind] && pilih[kind][obj.id] ? 'true' : 'false') +
      '" aria-label="' +
      esc(psmLabelUnsur(kind, obj)) +
      '"'
    );
  }

  var faces = model.sisi
    .map(function (s) {
      var pts = s.idx.map(function (k) {
        return P[k];
      });
      var d =
        pts.reduce(function (a, p) {
          return a + p.d;
        }, 0) / pts.length;
      return { s: s, pts: pts, d: d };
    })
    .sort(function (a, b) {
      return a.d - b.d;
    });

  var sisiHTML = faces
    .map(function (f) {
      var s = f.s;
      var depan = vs[s.id];
      var cls =
        'psm-face psm-face--' +
        s.jenis +
        (depan ? ' is-front' : ' is-back') +
        (pilihS[s.id] ? ' is-sorot' : '');
      var hit = mode === 'sisi' && depan;
      return (
        '<polygon class="' +
        cls +
        (hit ? ' psm-hit-face' : '') +
        '" points="' +
        psmPoints(f.pts) +
        '"' +
        (hit ? hitAttr('sisi', s) : '') +
        '/>'
      );
    })
    .join('');

  function garis(e, cls, extra) {
    var a = P[e.a];
    var b = P[e.b];
    return (
      '<line class="' +
      cls +
      '" x1="' +
      psmFmt(a.x) +
      '" y1="' +
      psmFmt(a.y) +
      '" x2="' +
      psmFmt(b.x) +
      '" y2="' +
      psmFmt(b.y) +
      '"' +
      (extra || '') +
      '/>'
    );
  }

  var urutRusuk = model.rusuk.slice().sort(function (a, b) {
    return (vr[a.id] ? 1 : 0) - (vr[b.id] ? 1 : 0);
  });
  var rusukHTML = urutRusuk
    .map(function (e) {
      return garis(
        e,
        'psm-edge psm-edge--' +
          e.jenis +
          (vr[e.id] ? '' : ' is-hidden') +
          (pilihR[e.id] ? ' is-sorot' : '')
      );
    })
    .join('');
  var rusukHit =
    mode === 'rusuk'
      ? urutRusuk
          .map(function (e) {
            return garis(e, 'psm-hit psm-hit--rusuk', hitAttr('rusuk', e));
          })
          .join('')
      : '';

  var cx = 0;
  var cy = 0;
  P.forEach(function (p) {
    cx += p.x / P.length;
    cy += p.y / P.length;
  });
  var titikHTML = model.titik
    .map(function (t, i) {
      var p = P[i];
      var sor = pilihT[t.id];
      var html =
        '<circle class="psm-vertex' +
        (vt[t.id] ? '' : ' is-hidden') +
        (sor ? ' is-sorot' : '') +
        '" cx="' +
        psmFmt(p.x) +
        '" cy="' +
        psmFmt(p.y) +
        '" r="' +
        (sor ? 6 : 3.5) +
        '"/>';
      if (opts.label !== false) {
        var dx = p.x - cx;
        var dy = p.y - cy;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        html +=
          '<text class="psm-label' +
          (vt[t.id] ? '' : ' is-hidden') +
          '" x="' +
          psmFmt(p.x + (dx / len) * 14) +
          '" y="' +
          psmFmt(p.y + (dy / len) * 14) +
          '">' +
          esc(t.nama) +
          '</text>';
      }
      return html;
    })
    .join('');
  var titikHit =
    mode === 'titik'
      ? model.titik
          .map(function (t, i) {
            return (
              '<circle class="psm-hit psm-hit--titik" cx="' +
              psmFmt(P[i].x) +
              '" cy="' +
              psmFmt(P[i].y) +
              '" r="13"' +
              hitAttr('titik', t) +
              '/>'
            );
          })
          .join('')
      : '';

  return (
    '<svg class="psm-svg' +
    (opts.kelas ? ' ' + opts.kelas : '') +
    (mode ? ' psm-svg--' + mode : '') +
    '" viewBox="' +
    psmFmt(-half) +
    ' ' +
    psmFmt(-half) +
    ' ' +
    psmFmt(2 * half) +
    ' ' +
    psmFmt(2 * half) +
    '" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="' +
    esc(opts.aria || namaPrisma(model.n) + ' ' + notasiPrisma(model.n)) +
    '">' +
    sisiHTML +
    rusukHTML +
    rusukHit +
    titikHTML +
    titikHit +
    '</svg>'
  );
}

/* ---------- UI: penjelajah prisma ---------- */

var PSM_MODES = [
  { id: 'titik', label: 'Titik sudut', ikon: '●' },
  { id: 'rusuk', label: 'Rusuk', ikon: '╱' },
  { id: 'sisi', label: 'Sisi', ikon: '▰' },
];

/*
 * State penjelajah: { n, azimut, elevasi, mode, terpilih: {titik, rusuk,
 * sisi}, info: {kind, id} | null, dicoba: {<n>: true} }.
 *   opts.pilihanN  daftar n yang boleh dipilih (default [3, 4, 5, 6])
 *   opts.n         n awal (default pilihanN[0])
 */
function ensureJelajahState(state, key, opts) {
  opts = opts || {};
  var pil = opts.pilihanN || [3, 4, 5, 6];
  var st = state[key] && typeof state[key] === 'object' ? state[key] : {};
  if (pil.indexOf(st.n) === -1) st.n = opts.n || pil[0];
  if (typeof st.azimut !== 'number') st.azimut = -25;
  if (typeof st.elevasi !== 'number') st.elevasi = 25;
  if (
    !PSM_MODES.some(function (m) {
      return m.id === st.mode;
    })
  )
    st.mode = 'titik';
  if (!st.terpilih || typeof st.terpilih !== 'object') st.terpilih = {};
  PSM_MODES.forEach(function (m) {
    if (!st.terpilih[m.id] || typeof st.terpilih[m.id] !== 'object') st.terpilih[m.id] = {};
  });
  if (!st.dicoba || typeof st.dicoba !== 'object') st.dicoba = {};
  st.dicoba[st.n] = true;
  if (st.info && typeof st.info !== 'object') st.info = null;
  state[key] = st;
  return st;
}

function banyakTerpilih(st, mode) {
  return Object.keys((st.terpilih && st.terpilih[mode]) || {}).length;
}

function psmModelJelajah(st, opts) {
  return modelPrisma(st.n, { r: 1, tinggi: (opts && opts.tinggi) || 1.5 });
}

function psmInfoJelajah(model, st) {
  if (!st.info) return 'Ketuk sebuah unsur pada gambar untuk menandainya dan melihat namanya.';
  var list =
    st.info.kind === 'titik' ? model.titik : st.info.kind === 'rusuk' ? model.rusuk : model.sisi;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === st.info.id) {
      return (
        psmLabelUnsur(st.info.kind, list[i]) +
        (st.terpilih[st.info.kind][st.info.id] ? ' — ditandai' : ' — tanda dihapus')
      );
    }
  }
  return '';
}

function psmStageJelajah(id, st, opts) {
  var model = psmModelJelajah(st, opts);
  return buildPrismSVG(model, st, {
    mode: st.mode,
    terpilih: st.terpilih,
    skala: 80,
    aria: namaPrisma(st.n) + ' ' + notasiPrisma(st.n) + '. ' + (opts.ariaTambahan || ''),
  });
}

function psmCounterJelajah(st) {
  return PSM_MODES.map(function (m) {
    return (
      '<span class="psm-count' +
      (st.mode === m.id ? ' is-active' : '') +
      '"><span aria-hidden="true">' +
      m.ikon +
      '</span> ' +
      m.label +
      ' ditandai: <strong>' +
      banyakTerpilih(st, m.id) +
      '</strong></span>'
    );
  }).join('');
}

function buildPrismExplorer(id, st, opts) {
  opts = opts || {};
  var pil = opts.pilihanN || [3, 4, 5, 6];
  var model = psmModelJelajah(st, opts);
  var pilihN =
    pil.length > 1
      ? '<div class="psm-toolbar" role="group" aria-label="Pilih prisma">' +
        pil
          .map(function (n) {
            return (
              '<button type="button" class="psm-tool-btn' +
              (st.n === n ? ' is-active' : '') +
              '" data-psm-n="' +
              n +
              '" aria-pressed="' +
              (st.n === n ? 'true' : 'false') +
              '">' +
              esc(namaPrisma(n).replace('prisma ', 'Prisma ')) +
              '</button>'
            );
          })
          .join('') +
        '</div>'
      : '';
  return (
    '<div class="psm-explorer" id="' +
    id +
    '">' +
    pilihN +
    '<div class="psm-toolbar" role="group" aria-label="Unsur yang ditandai">' +
    PSM_MODES.map(function (m) {
      return (
        '<button type="button" class="psm-tool-btn psm-tool-btn--mode' +
        (st.mode === m.id ? ' is-active' : '') +
        '" data-psm-mode="' +
        m.id +
        '" aria-pressed="' +
        (st.mode === m.id ? 'true' : 'false') +
        '"><span aria-hidden="true">' +
        m.ikon +
        '</span> Tandai ' +
        m.label.toLowerCase() +
        '</button>'
      );
    }).join('') +
    '</div>' +
    '<p class="psm-explorer__nama"><strong>' +
    esc(namaPrisma(st.n).replace('prisma ', 'Prisma ')) +
    '</strong> ' +
    esc(notasiPrisma(st.n)) +
    '</p>' +
    '<div class="psm-stage" data-psm-stage>' +
    psmStageJelajah(id, st, opts) +
    '</div>' +
    '<div class="psm-rotate">' +
    '<label class="psm-range"><span>↻ Putar</span><input type="range" min="-180" max="180" step="5" value="' +
    st.azimut +
    '" data-psm-range="azimut" aria-label="Putar prisma"></label>' +
    '<label class="psm-range"><span>⤢ Miringkan</span><input type="range" min="-60" max="80" step="5" value="' +
    st.elevasi +
    '" data-psm-range="elevasi" aria-label="Miringkan prisma"></label>' +
    '</div>' +
    '<p class="psm-info" data-psm-info aria-live="polite">' +
    esc(psmInfoJelajah(model, st)) +
    '</p>' +
    '<div class="psm-counter" data-psm-counter>' +
    psmCounterJelajah(st) +
    '</div>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--ghost btn--small" data-psm-clear>Hapus tanda ' +
    esc(
      PSM_MODES.filter(function (m) {
        return m.id === st.mode;
      })[0].label.toLowerCase()
    ) +
    '</button>' +
    '</div>' +
    '</div>'
  );
}

/*
 * Memasang event penjelajah. `onChange(jenis)` dipanggil setiap state
 * berubah ('putar' saat slider digeser — gambar diperbarui di tempat
 * tanpa merender ulang tahap; 'n' | 'mode' | 'tandai' | 'hapus').
 */
function bindPrismExplorer(root, id, st, opts, onChange) {
  opts = opts || {};
  var el = root.querySelector('#' + id);
  if (!el) return;

  function perbaruiGambar() {
    var model = psmModelJelajah(st, opts);
    el.querySelector('[data-psm-stage]').innerHTML = psmStageJelajah(id, st, opts);
    el.querySelector('[data-psm-info]').textContent = psmInfoJelajah(model, st);
    el.querySelector('[data-psm-counter]').innerHTML = psmCounterJelajah(st);
    pasangHit();
  }

  function renderUlang(fokusSel) {
    var baru = buildPrismExplorer(id, st, opts);
    var wadah = document.createElement('div');
    wadah.innerHTML = baru;
    el.replaceWith(wadah.firstChild);
    bindPrismExplorer(root, id, st, opts, onChange);
    if (fokusSel) {
      var f = root.querySelector('#' + id + ' ' + fokusSel);
      if (f) f.focus();
    }
  }

  function toggle(kind, uid) {
    var map = st.terpilih[kind];
    if (map[uid]) delete map[uid];
    else map[uid] = true;
    st.info = { kind: kind, id: uid };
    perbaruiGambar();
    var f = el.querySelector('[data-psm-kind="' + kind + '"][data-psm-id="' + uid + '"]');
    if (f) f.focus();
    if (onChange) onChange('tandai');
  }

  function pasangHit() {
    el.querySelectorAll('[data-psm-kind]').forEach(function (h) {
      h.addEventListener('click', function () {
        toggle(h.getAttribute('data-psm-kind'), h.getAttribute('data-psm-id'));
      });
      h.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle(h.getAttribute('data-psm-kind'), h.getAttribute('data-psm-id'));
        }
      });
    });
  }
  pasangHit();

  el.querySelectorAll('[data-psm-n]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = parseInt(b.getAttribute('data-psm-n'), 10);
      if (n === st.n) return;
      st.n = n;
      st.dicoba[n] = true;
      st.info = null;
      PSM_MODES.forEach(function (m) {
        st.terpilih[m.id] = {};
      });
      renderUlang('[data-psm-n="' + n + '"]');
      if (onChange) onChange('n');
    });
  });

  el.querySelectorAll('[data-psm-mode]').forEach(function (b) {
    b.addEventListener('click', function () {
      st.mode = b.getAttribute('data-psm-mode');
      st.info = null;
      renderUlang('[data-psm-mode="' + st.mode + '"]');
      if (onChange) onChange('mode');
    });
  });

  el.querySelectorAll('[data-psm-range]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      st[inp.getAttribute('data-psm-range')] = parseInt(inp.value, 10);
      perbaruiGambar();
    });
    inp.addEventListener('change', function () {
      if (onChange) onChange('putar');
    });
  });

  var clear = el.querySelector('[data-psm-clear]');
  if (clear) {
    clear.addEventListener('click', function () {
      st.terpilih[st.mode] = {};
      st.info = null;
      perbaruiGambar();
      if (onChange) onChange('hapus');
    });
  }
}

/* ---------- UI: tabel isian unsur ---------- */

var PSM_KOLOM_UNSUR = [
  { id: 'titik', label: 'Titik sudut' },
  { id: 'rusuk', label: 'Rusuk' },
  { id: 'sisi', label: 'Sisi' },
];

/* st = { isian: {<n>: {titik, rusuk, sisi}}, hasil: {<n>: {<kolom>: kode}}, dicek } */
function ensureUnsurTableState(state, key, rows) {
  var st = state[key] && typeof state[key] === 'object' ? state[key] : {};
  if (!st.isian || typeof st.isian !== 'object') st.isian = {};
  if (!st.hasil || typeof st.hasil !== 'object') st.hasil = {};
  rows.forEach(function (n) {
    if (!st.isian[n] || typeof st.isian[n] !== 'object') st.isian[n] = {};
    if (!st.hasil[n] || typeof st.hasil[n] !== 'object') st.hasil[n] = {};
    PSM_KOLOM_UNSUR.forEach(function (k) {
      if (typeof st.isian[n][k.id] !== 'string') st.isian[n][k.id] = '';
    });
  });
  st.dicek = !!st.dicek;
  state[key] = st;
  return st;
}

function tabelUnsurBenar(st, rows) {
  return rows.every(function (n) {
    return PSM_KOLOM_UNSUR.every(function (k) {
      return st.hasil[n] && st.hasil[n][k.id] === 'benar';
    });
  });
}

/*
 *   opts.judulBaris  function(n) → label baris (default "Prisma segi-n")
 *   opts.caption     keterangan tabel
 */
function buildUnsurTable(id, rows, st, opts) {
  opts = opts || {};
  var semua = tabelUnsurBenar(st, rows);
  var pesan = [];
  var body = rows
    .map(function (n) {
      return (
        '<tr><th scope="row">' +
        esc(opts.judulBaris ? opts.judulBaris(n) : namaPrisma(n).replace('prisma ', 'Prisma ')) +
        '</th>' +
        PSM_KOLOM_UNSUR.map(function (k) {
          var kode = st.hasil[n] ? st.hasil[n][k.id] : null;
          var benar = kode === 'benar';
          if (kode && !benar) {
            var p = PSM_PESAN_UNSUR[kode];
            var baris = namaPrisma(n) + ' — ' + k.label.toLowerCase() + ': ' + p;
            if (pesan.indexOf(baris) === -1) pesan.push(baris);
          }
          return (
            '<td>' +
            '<input type="text" inputmode="numeric" autocomplete="off" class="input-text psm-cell' +
            (benar ? ' is-correct' : kode ? ' has-error' : '') +
            '" data-psm-cell="' +
            n +
            '-' +
            k.id +
            '" id="' +
            id +
            '-' +
            n +
            '-' +
            k.id +
            '" value="' +
            esc(st.isian[n][k.id]) +
            '" aria-label="' +
            esc('Banyak ' + k.label.toLowerCase() + ' ' + namaPrisma(n)) +
            '"' +
            (benar ? ' disabled' : '') +
            '>' +
            '</td>'
          );
        }).join('') +
        '</tr>'
      );
    })
    .join('');
  return (
    '<div class="psm-table-wrap" id="' +
    id +
    '">' +
    '<table class="psm-table">' +
    (opts.caption ? '<caption>' + esc(opts.caption) + '</caption>' : '') +
    '<thead><tr><th scope="col">Prisma</th>' +
    PSM_KOLOM_UNSUR.map(function (k) {
      return '<th scope="col">' + esc(k.label) + '</th>';
    }).join('') +
    '</tr></thead><tbody>' +
    body +
    '</tbody></table>' +
    '</div>' +
    (semua
      ? buildFeedbackBox('success', '✓', '<strong>Semua isian tepat.</strong>')
      : '<div class="btn-group" style="margin-top:var(--space-3);"><button type="button" class="btn btn--primary" id="' +
        id +
        'Check">Periksa Tabel</button></div>' +
        (pesan.length
          ? buildFeedbackBox(
              'error',
              '✗',
              '<ul class="psm-diagnosa">' +
                pesan
                  .map(function (p) {
                    return '<li>' + esc(p) + '</li>';
                  })
                  .join('') +
                '</ul>'
            )
          : ''))
  );
}

function bindUnsurTable(root, id, rows, st, save, rerender) {
  root.querySelectorAll('#' + id + ' [data-psm-cell]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      var parts = inp.getAttribute('data-psm-cell').split('-');
      st.isian[parts[0]][parts[1]] = inp.value;
      save();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var b = document.getElementById(id + 'Check');
        if (b) b.click();
      }
    });
  });
  var btn = document.getElementById(id + 'Check');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var kosong = false;
    var invalid = false;
    rows.forEach(function (n) {
      PSM_KOLOM_UNSUR.forEach(function (k) {
        var r = parseInputInt(st.isian[n][k.id]);
        if (r.error === 'empty') kosong = true;
        else if (r.error) invalid = true;
      });
    });
    if (kosong) {
      showNotice('Lengkapi semua kotak pada tabel lebih dulu.');
      return;
    }
    if (invalid) {
      showNotice('Isi setiap kotak dengan bilangan bulat, mis. 6.');
      return;
    }
    rows.forEach(function (n) {
      PSM_KOLOM_UNSUR.forEach(function (k) {
        st.hasil[n][k.id] = diagnosaUnsur(n, k.id, parseInputInt(st.isian[n][k.id]).value).kode;
      });
    });
    st.dicek = true;
    save();
    rerender();
  });
}

/* ---------- UI: jaring datar & tampilan lipat ---------- */

function psmBatas(list) {
  var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  list.forEach(function (p) {
    b.x0 = Math.min(b.x0, p[0]);
    b.y0 = Math.min(b.y0, p[1]);
    b.x1 = Math.max(b.x1, p[0]);
    b.y1 = Math.max(b.y1, p[1]);
  });
  return b;
}

function psmPoly2(pts, sk) {
  return pts
    .map(function (q) {
      return psmFmt(q[0] * sk) + ',' + psmFmt(q[1] * sk);
    })
    .join(' ');
}

/*
 * Gambar jaring-jaring datar.
 *   opts.skala  piksel per satuan (default 40)
 *   opts.aria   teks aksesibel
 *   opts.slot   { n } → tampilkan slot kosong untuk menempel segi-n
 *               (perakit jaring); slot yang terisi digambar sebagai kepingan
 */
function buildNetSVG(jaring, opts) {
  opts = opts || {};
  var sk = opts.skala || 40;
  var spec = jaring.spec;
  var semua = [];
  jaring.pieces.forEach(function (p) {
    semua = semua.concat(p.pts2);
  });
  var slotHTML = '';
  if (opts.slot) {
    var hantu = [];
    for (var i = 0; i < spec.sabuk; i++) {
      if (spec.atas.indexOf(i) === -1) {
        hantu.push({
          sisi: 'atas',
          i: i,
          pts: psmSegiPadaTepi([i * spec.s, 0], spec.s, spec.n, -1),
        });
      }
      if (spec.alas.indexOf(i) === -1) {
        hantu.push({
          sisi: 'alas',
          i: i,
          pts: psmSegiPadaTepi([i * spec.s, spec.h], spec.s, spec.n, 1),
        });
      }
    }
    for (var s = 0; s < spec.sabuk; s++) {
      semua = semua.concat(psmSegiPadaTepi([s * spec.s, 0], spec.s, spec.n, -1));
      semua = semua.concat(psmSegiPadaTepi([s * spec.s, spec.h], spec.s, spec.n, 1));
    }
    slotHTML = hantu
      .map(function (g) {
        var c = psmPusat(
          g.pts.map(function (q) {
            return [q[0], q[1], 0];
          })
        );
        return (
          '<g class="psm-slot" data-psm-slot="' +
          g.sisi +
          '-' +
          g.i +
          '" tabindex="0" role="button" aria-label="' +
          esc(
            'Tempel segi-n pada tepi ' +
              (g.sisi === 'atas' ? 'atas' : 'bawah') +
              ' persegi panjang ke-' +
              (g.i + 1)
          ) +
          '"><polygon points="' +
          psmPoly2(g.pts, sk) +
          '"/><text x="' +
          psmFmt(c[0] * sk) +
          '" y="' +
          psmFmt(c[1] * sk) +
          '">+</text></g>'
        );
      })
      .join('');
  }
  var b = psmBatas(semua);
  var pad = 6;
  var byId = {};
  jaring.pieces.forEach(function (p) {
    byId[p.id] = p;
  });
  var kepingHTML = jaring.pieces
    .map(function (p) {
      var cls = 'psm-net-piece psm-face--' + p.jenis;
      var attr = '';
      if (opts.slot && p.jenis !== 'tegak') {
        var idx = p.parent ? parseInt(p.parent.slice(1), 10) : 0;
        attr =
          ' data-psm-slot="' +
          p.jenis +
          '-' +
          idx +
          '" tabindex="0" role="button" aria-label="' +
          esc(
            'Lepas segi-n dari tepi ' +
              (p.jenis === 'atas' ? 'atas' : 'bawah') +
              ' persegi panjang ke-' +
              (idx + 1)
          ) +
          '"';
        cls += ' psm-net-piece--lepas';
      }
      return '<polygon class="' + cls + '" points="' + psmPoly2(p.pts2, sk) + '"' + attr + '/>';
    })
    .join('');
  var lipatan = jaring.pieces
    .filter(function (p) {
      return p.hinge;
    })
    .map(function (p) {
      return (
        '<line class="psm-lipatan" x1="' +
        psmFmt(p.hinge[0][0] * sk) +
        '" y1="' +
        psmFmt(p.hinge[0][1] * sk) +
        '" x2="' +
        psmFmt(p.hinge[1][0] * sk) +
        '" y2="' +
        psmFmt(p.hinge[1][1] * sk) +
        '"/>'
      );
    })
    .join('');
  return (
    '<svg class="psm-net' +
    (opts.kelas ? ' ' + opts.kelas : '') +
    '" viewBox="' +
    psmFmt(b.x0 * sk - pad) +
    ' ' +
    psmFmt(b.y0 * sk - pad) +
    ' ' +
    psmFmt((b.x1 - b.x0) * sk + 2 * pad) +
    ' ' +
    psmFmt((b.y1 - b.y0) * sk + 2 * pad) +
    '" xmlns="http://www.w3.org/2000/svg" role="' +
    (opts.slot ? 'group' : 'img') +
    '" aria-label="' +
    esc(opts.aria || 'Jaring-jaring ' + namaPrisma(spec.n)) +
    '">' +
    slotHTML +
    kepingHTML +
    lipatan +
    '</svg>'
  );
}

/* Koordinat jaring (x kanan, y bawah, z lipatan) → koordinat tampilan (z ke atas). */
function psmKeDunia(q, h) {
  return [q[0], q[2], h - q[1]];
}

var PSM_VIEW_LIPAT = { azimut: -35, elevasi: 35 };

/* Gambar SVG jaring-jaring pada fraksi lipat t, dengan kotak tampilan tetap. */
function buildFoldSVG(jaring, t, opts) {
  opts = opts || {};
  var view = opts.view || PSM_VIEW_LIPAT;
  var sk = opts.skala || 44;
  var h = jaring.spec.h;
  var proyek = function (q) {
    var p = proyeksiPrisma(psmKeDunia(q, h), view);
    return { x: p.x * sk, y: p.y * sk, d: p.d };
  };
  /* Kotak tampilan dihitung dari beberapa sampel t agar tidak "melompat". */
  var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  [0, 0.25, 0.5, 0.75, 1].forEach(function (ts) {
    lipatJaring(jaring, ts).forEach(function (p) {
      p.pts3.forEach(function (q) {
        var r = proyek(q);
        b.x0 = Math.min(b.x0, r.x);
        b.y0 = Math.min(b.y0, r.y);
        b.x1 = Math.max(b.x1, r.x);
        b.y1 = Math.max(b.y1, r.y);
      });
    });
  });
  var pad = 8;
  var polys = lipatJaring(jaring, t)
    .map(function (p) {
      var pts = p.pts3.map(proyek);
      var d =
        pts.reduce(function (a, r) {
          return a + r.d;
        }, 0) / pts.length;
      return { p: p, pts: pts, d: d };
    })
    .sort(function (a, b2) {
      return a.d - b2.d;
    });
  return (
    '<svg class="psm-fold-svg" viewBox="' +
    psmFmt(b.x0 - pad) +
    ' ' +
    psmFmt(b.y0 - pad) +
    ' ' +
    psmFmt(b.x1 - b.x0 + 2 * pad) +
    ' ' +
    psmFmt(b.y1 - b.y0 + 2 * pad) +
    '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
    esc(
      (opts.aria || 'Jaring-jaring ' + namaPrisma(jaring.spec.n)) +
        ', terlipat ' +
        Math.round(t * 100) +
        '%'
    ) +
    '">' +
    polys
      .map(function (f) {
        return (
          '<polygon class="psm-fold-piece psm-face--' +
          f.p.jenis +
          '" points="' +
          psmPoints(f.pts) +
          '"/>'
        );
      })
      .join('') +
    '</svg>'
  );
}

function psmReduceMotion() {
  try {
    return !!(
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  } catch (e) {
    return false;
  }
}

/* Pegangan requestAnimationFrame per komponen (tidak disimpan di State). */
var PSM_ANIM = {};

function psmHentikanAnimasi(key) {
  if (PSM_ANIM[key]) {
    cancelAnimationFrame(PSM_ANIM[key]);
    delete PSM_ANIM[key];
  }
}

/*
 * Menganimasikan st.t menuju `target` (0 atau 1) dengan memanggil
 * draw(t) di setiap bingkai; done() setelah selesai. Menghormati
 * prefers-reduced-motion (langsung melompat ke target).
 */
function psmAnimasiLipat(key, st, target, draw, done) {
  psmHentikanAnimasi(key);
  var awal = typeof st.t === 'number' ? st.t : 0;
  if (psmReduceMotion() || typeof requestAnimationFrame === 'undefined') {
    st.t = target;
    draw(target);
    if (done) done();
    return;
  }
  var durasi = 1400 * Math.abs(target - awal) || 1;
  var mulai = null;
  function langkah(now) {
    if (mulai === null) mulai = now;
    var f = Math.min(1, (now - mulai) / durasi);
    var e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    st.t = awal + (target - awal) * e;
    draw(st.t);
    if (f < 1) PSM_ANIM[key] = requestAnimationFrame(langkah);
    else {
      delete PSM_ANIM[key];
      st.t = target;
      if (done) done();
    }
  }
  PSM_ANIM[key] = requestAnimationFrame(langkah);
}

/* ---------- UI: pelipat jaring ---------- */

/*
 * st = { n, t }.
 *   opts.specs  { <n>: spec } jaring untuk setiap pilihan n
 *   opts.judul  function(n) → nama benda (opsional)
 */
function ensureLipatState(state, key, opts) {
  var ns = Object.keys(opts.specs).map(Number);
  var st = state[key] && typeof state[key] === 'object' ? state[key] : {};
  if (ns.indexOf(st.n) === -1) st.n = ns[0];
  if (typeof st.t !== 'number' || st.t < 0 || st.t > 1) st.t = 0;
  if (!st.dilipat || typeof st.dilipat !== 'object') st.dilipat = {};
  state[key] = st;
  return st;
}

function psmLipatInner(st, opts) {
  var jaring = jaringPrisma(opts.specs[st.n]);
  return buildFoldSVG(jaring, st.t, { aria: opts.judul ? opts.judul(st.n) : null });
}

function buildNetFolder(id, st, opts) {
  var ns = Object.keys(opts.specs).map(Number);
  return (
    '<div class="psm-folder" id="' +
    id +
    '">' +
    (ns.length > 1
      ? '<div class="psm-toolbar" role="group" aria-label="Pilih kemasan">' +
        ns
          .map(function (n) {
            return (
              '<button type="button" class="psm-tool-btn' +
              (st.n === n ? ' is-active' : '') +
              '" data-psm-fn="' +
              n +
              '" aria-pressed="' +
              (st.n === n ? 'true' : 'false') +
              '">' +
              esc(opts.judul ? opts.judul(n) : namaPrisma(n)) +
              '</button>'
            );
          })
          .join('') +
        '</div>'
      : '') +
    '<div class="psm-stage psm-stage--fold" data-psm-fold>' +
    psmLipatInner(st, opts) +
    '</div>' +
    '<label class="psm-range psm-range--wide"><span>Lipat</span><input type="range" min="0" max="100" step="1" value="' +
    Math.round(st.t * 100) +
    '" data-psm-t aria-label="Seberapa jauh jaring-jaring dilipat (persen)"></label>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary btn--small" data-psm-play="1">▶ Lipat</button>' +
    '<button type="button" class="btn btn--ghost btn--small" data-psm-play="0">◀ Buka</button>' +
    '</div>' +
    '</div>'
  );
}

/* onChange('lipat'|'n') dipanggil setelah animasi/slider selesai. */
function bindNetFolder(root, id, st, opts, onChange) {
  var el = root.querySelector('#' + id);
  if (!el) return;
  var stage = el.querySelector('[data-psm-fold]');
  var range = el.querySelector('[data-psm-t]');
  function draw(t) {
    stage.innerHTML = buildFoldSVG(jaringPrisma(opts.specs[st.n]), t, {
      aria: opts.judul ? opts.judul(st.n) : null,
    });
    if (range) range.value = Math.round(t * 100);
  }
  function catat() {
    if (st.t >= 0.999) st.dilipat[st.n] = true;
    if (onChange) onChange('lipat');
  }
  if (range) {
    range.addEventListener('input', function () {
      st.t = parseInt(range.value, 10) / 100;
      draw(st.t);
    });
    range.addEventListener('change', catat);
  }
  el.querySelectorAll('[data-psm-play]').forEach(function (b) {
    b.addEventListener('click', function () {
      psmAnimasiLipat(id, st, b.getAttribute('data-psm-play') === '1' ? 1 : 0, draw, catat);
    });
  });
  el.querySelectorAll('[data-psm-fn]').forEach(function (b) {
    b.addEventListener('click', function () {
      var n = parseInt(b.getAttribute('data-psm-fn'), 10);
      if (n === st.n) return;
      psmHentikanAnimasi(id);
      st.n = n;
      st.t = 0;
      var wadah = document.createElement('div');
      wadah.innerHTML = buildNetFolder(id, st, opts);
      el.replaceWith(wadah.firstChild);
      bindNetFolder(root, id, st, opts, onChange);
      var f = root.querySelector('#' + id + ' [data-psm-fn="' + n + '"]');
      if (f) f.focus();
      if (onChange) onChange('n');
    });
  });
}

/* ---------- UI: perakit jaring ---------- */

/* st = { atas: [i], alas: [i], hasil: null | {valid, alasan}, t, ditemukan: [kunci] } */
function ensureRakitState(state, key, n) {
  var st = state[key] && typeof state[key] === 'object' ? state[key] : {};
  st.atas = psmIndeksUnik(st.atas, n);
  st.alas = psmIndeksUnik(st.alas, n);
  if (!st.hasil || typeof st.hasil !== 'object') st.hasil = null;
  if (typeof st.t !== 'number') st.t = 0;
  if (!Array.isArray(st.ditemukan)) st.ditemukan = [];
  if (typeof st.gagal !== 'number') st.gagal = 0;
  state[key] = st;
  return st;
}

function kunciJaring(spec) {
  return 'atas' + spec.atas.join('.') + '-alas' + spec.alas.join('.');
}

function psmSpecRakit(n, st, opts) {
  return { n: n, atas: st.atas, alas: st.alas, s: opts.s || 1, h: opts.h || 1.5 };
}

/*
 *   opts.n  segi-n alas prisma
 *   opts.s, opts.h  ukuran persegi panjang
 */
function buildNetBuilder(id, st, opts) {
  var n = opts.n;
  var spec = psmSpecRakit(n, st, opts);
  var jaring = jaringPrisma(spec);
  var hasil = st.hasil;
  return (
    '<div class="psm-builder" id="' +
    id +
    '">' +
    '<div class="psm-builder__grid">' +
    '<figure class="psm-builder__pane">' +
    '<figcaption>Jaring-jaring rakitanmu</figcaption>' +
    '<div class="psm-stage psm-stage--net">' +
    buildNetSVG(jaring, { slot: true, skala: 44, aria: 'Papan perakit jaring-jaring' }) +
    '</div>' +
    '</figure>' +
    '<figure class="psm-builder__pane">' +
    '<figcaption>Hasil lipatan</figcaption>' +
    '<div class="psm-stage psm-stage--fold" data-psm-fold>' +
    (hasil
      ? buildFoldSVG(jaring, st.t, { aria: 'Hasil melipat jaring-jaring rakitan' })
      : '<p class="psm-placeholder">Tempel dua segi-n, lalu tekan <strong>Lipat &amp; Uji</strong>.</p>') +
    '</div>' +
    '</figure>' +
    '</div>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" data-psm-uji>📦 Lipat &amp; Uji</button>' +
    '<button type="button" class="btn btn--ghost btn--small" data-psm-kosong>Kosongkan</button>' +
    '</div>' +
    (hasil
      ? '<div data-psm-hasil>' +
        buildFeedbackBox(
          hasil.valid ? 'success' : 'warning',
          hasil.valid ? '✓' : '💭',
          esc(PSM_PESAN_JARING[hasil.alasan])
        ) +
        '</div>'
      : '') +
    '<p class="psm-info">Jaring-jaring berbeda yang berhasil kamu temukan: <strong>' +
    st.ditemukan.length +
    '</strong></p>' +
    '</div>'
  );
}

/* onChange('tempel'|'uji'|'kosong') dipanggil setelah state berubah. */
function bindNetBuilder(root, id, st, opts, onChange) {
  var el = root.querySelector('#' + id);
  if (!el) return;
  function renderUlang(fokusSel) {
    psmHentikanAnimasi(id);
    var wadah = document.createElement('div');
    wadah.innerHTML = buildNetBuilder(id, st, opts);
    el.replaceWith(wadah.firstChild);
    bindNetBuilder(root, id, st, opts, onChange);
    if (fokusSel) {
      var f = root.querySelector('#' + id + ' ' + fokusSel);
      if (f) f.focus();
    }
  }
  function tempel(slot) {
    var parts = slot.split('-');
    var list = st[parts[0]];
    var i = parseInt(parts[1], 10);
    var pos = list.indexOf(i);
    if (pos === -1) list.push(i);
    else list.splice(pos, 1);
    list.sort(function (a, b) {
      return a - b;
    });
    st.hasil = null;
    st.t = 0;
    renderUlang('[data-psm-slot="' + slot + '"]');
    if (onChange) onChange('tempel');
  }
  el.querySelectorAll('[data-psm-slot]').forEach(function (g) {
    g.addEventListener('click', function () {
      tempel(g.getAttribute('data-psm-slot'));
    });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tempel(g.getAttribute('data-psm-slot'));
      }
    });
  });
  var uji = el.querySelector('[data-psm-uji]');
  uji.addEventListener('click', function () {
    var spec = psmSpecRakit(opts.n, st, opts);
    if (spec.atas.length + spec.alas.length === 0) {
      showNotice('Tempel segi-n pada tepi persegi panjang lebih dulu.');
      return;
    }
    var r = cekJaring(spec);
    st.hasil = { valid: r.valid, alasan: r.alasan };
    if (r.valid) {
      var k = kunciJaring(spec);
      if (st.ditemukan.indexOf(k) === -1) st.ditemukan.push(k);
    } else {
      st.gagal += 1;
    }
    st.t = 0;
    renderUlang('[data-psm-uji]');
    var baru = root.querySelector('#' + id);
    var stage = baru.querySelector('[data-psm-fold]');
    var jaring = jaringPrisma(spec);
    psmAnimasiLipat(
      id,
      st,
      1,
      function (t) {
        stage.innerHTML = buildFoldSVG(jaring, t, { aria: 'Hasil melipat jaring-jaring rakitan' });
      },
      function () {
        if (onChange) onChange('uji');
      }
    );
  });
  el.querySelector('[data-psm-kosong]').addEventListener('click', function () {
    st.atas = [];
    st.alas = [];
    st.hasil = null;
    st.t = 0;
    renderUlang('[data-psm-kosong]');
    if (onChange) onChange('kosong');
  });
}

/* ============================================================
   32. BARISAN ARITMETIKA: SELISIH & BEDA
   Mengidentifikasi barisan aritmetika dan menentukan bedanya
   (fase-f/mpi-1.1, Inquiry Learning). Dibangun di atas seksi 21
   (jenisDeret, sukuAritmetika, subskrip) dan seksi 7–8
   (buildSequenceTiles, buildDlNumInput):
     • fmtSuku — suku bulat/desimal gaya Indonesia (−8; 0,5);
     • selisihBerurutan / bedaBarisan / sifatBarisanAritmetika /
       bedaDariDuaSuku — perhitungan murni;
     • parseSelisih / diagnosaSelisih / pesanSelisih — memeriksa
       isian selisih murid beserta miskonsepsinya (pengurangan
       terbalik, menjumlahkan, menyalin suku);
     • pelacak selisih — kartu suku dengan isian selisih di setiap
       "jembatan" antara dua suku berurutan;
     • lab barisan — murid mengatur a dan b dengan stepper lalu
       mengamati barisan & lompatannya pada garis bilangan.
   Gaya .bar-* ada di shared/base.css.
   ============================================================ */

/* Membulatkan galat biner (2.9000000000000004 → 2.9). */
function bulatkanSuku(n) {
  return Math.round(n * 1e6) / 1e6;
}

/* Suku barisan: bulat dengan pemisah ribuan, desimal berkoma, minus '−'. */
function fmtSuku(n) {
  var v = bulatkanSuku(n);
  if (v === 0) return '0';
  if (Number.isInteger(v)) return formatNumber(v, '−');
  return (v < 0 ? '−' : '') + formatDesimal(Math.abs(v), 4);
}

/* [U₁, U₂, …] → [U₂ − U₁, U₃ − U₂, …]. */
function selisihBerurutan(terms) {
  var out = [];
  for (var i = 1; i < terms.length; i++) out.push(bulatkanSuku(terms[i] - terms[i - 1]));
  return out;
}

/* Beda b bila barisan aritmetika (termasuk konstan, b = 0); null bila bukan. */
function bedaBarisan(terms) {
  if (!terms || terms.length < 2) return null;
  var jenis = jenisDeret(terms);
  if (jenis !== 'aritmetika' && jenis !== 'konstan') return null;
  return bulatkanSuku(terms[1] - terms[0]);
}

function sifatBarisanAritmetika(b) {
  if (hampirSama(b, 0)) return 'konstan';
  return b > 0 ? 'naik' : 'turun';
}

/* Beda dari dua suku tak berurutan: b = (Uₙ − Uₘ)/(n − m); NaN bila m = n. */
function bedaDariDuaSuku(m, um, n, un) {
  if (m === n) return NaN;
  return bulatkanSuku((un - um) / (n - m));
}

/*
 * Membaca isian selisih: bilangan bulat/desimal bertanda. Tanda '+',
 * '-', '−' dan koma/titik desimal diterima; pemisah ribuan ("1.000")
 * ditolak agar tidak rancu dengan desimal.
 */
function parseSelisih(str) {
  if (str === null || str === undefined || String(str).trim() === '') {
    return { value: null, error: 'empty' };
  }
  var s = String(str).trim().replace(/\s/g, '').replace(/−/g, '-').replace(',', '.');
  if (!/^[+-]?\d+(\.\d+)?$/.test(s) || /^[+-]?\d+\.\d{3}$/.test(s)) {
    return { value: null, error: 'invalid' };
  }
  return { value: parseFloat(s), error: null };
}

/*
 * Diagnosa isian selisih pasangan (u1, u2):
 *   'benar'     jawaban = u2 − u1
 *   'terbalik'  jawaban = u1 − u2 (suku sebelum dikurangi suku sesudah)
 *   'jumlah'    jawaban = u1 + u2
 *   'suku'      jawaban menyalin salah satu suku
 *   'salah'     lainnya
 */
function diagnosaSelisih(u1, u2, jawaban) {
  var d = u2 - u1;
  if (hampirSama(jawaban, d)) return 'benar';
  if (!hampirSama(d, 0) && hampirSama(jawaban, -d)) return 'terbalik';
  if (hampirSama(jawaban, u1 + u2)) return 'jumlah';
  if (hampirSama(jawaban, u1) || hampirSama(jawaban, u2)) return 'suku';
  return 'salah';
}

/* Umpan balik (HTML) untuk kode diagnosaSelisih. */
function pesanSelisih(kode, u1, u2) {
  var a = fmtSuku(u1);
  var b = fmtSuku(u2);
  switch (kode) {
    case 'benar':
      return 'Tepat: ' + b + ' − ' + a + ' = ' + fmtSuku(u2 - u1) + '.';
    case 'terbalik':
      return (
        'Urutan pengurangannya terbalik. Selisih selalu <strong>suku sesudah dikurangi suku sebelum</strong>: ' +
        b +
        ' − ' +
        a +
        '. Perhatikan tandanya — barisan yang turun menghasilkan selisih negatif.'
      );
    case 'jumlah':
      return (
        'Kamu menjumlahkan kedua suku. Selisih diperoleh dengan <strong>mengurangkan</strong>: ' +
        b +
        ' − ' +
        a +
        '.'
      );
    case 'suku':
      return (
        'Itu nilai suku, bukan selisihnya. Hitung berapa perubahan dari ' + a + ' ke ' + b + '.'
      );
    default:
      return 'Belum tepat. Hitung ' + b + ' − ' + a + ' dengan teliti.';
  }
}

/* ---------- Pelacak selisih ---------- */

function makeSelisihState(terms) {
  var n = Math.max(terms.length - 1, 0);
  var inputs = [];
  var status = [];
  for (var i = 0; i < n; i++) {
    inputs.push('');
    status.push(null);
  }
  return { inputs: inputs, status: status, attempts: 0 };
}

/* Menyiapkan state[key] untuk barisan `terms`; state lama yang cocok dipertahankan. */
function ensureSelisihState(state, key, terms) {
  var st = state[key];
  var n = Math.max(terms.length - 1, 0);
  var cocok =
    st &&
    typeof st === 'object' &&
    Array.isArray(st.inputs) &&
    Array.isArray(st.status) &&
    st.inputs.length === n &&
    st.status.length === n;
  if (!cocok) state[key] = makeSelisihState(terms);
  return state[key];
}

function selisihTrackerSelesai(st) {
  return (
    st.status.length > 0 &&
    st.status.every(function (s) {
      return s === 'benar';
    })
  );
}

/*
 * Memeriksa setiap isian yang terisi dan belum benar. Mengembalikan
 * { kosong, tidakValid } — banyaknya isian kosong & tidak valid.
 */
function periksaSelisihTracker(terms, st) {
  var kosong = 0;
  var tidakValid = 0;
  st.inputs.forEach(function (val, i) {
    if (st.status[i] === 'benar') return;
    var p = parseSelisih(val);
    if (p.error === 'empty') {
      kosong += 1;
      st.status[i] = null;
      return;
    }
    if (p.error) {
      tidakValid += 1;
      st.status[i] = 'salah';
      return;
    }
    st.status[i] = diagnosaSelisih(terms[i], terms[i + 1], p.value);
  });
  st.attempts += 1;
  return { kosong: kosong, tidakValid: tidakValid };
}

/*
 * Kartu suku dengan "jembatan" selisih di antara setiap dua suku
 * berurutan. Jembatan yang belum benar berisi kotak isian; yang benar
 * menampilkan selisihnya (hijau).
 *   id     awalan id DOM (isian: <id>In0, <id>In1, …; tombol: <id>Check)
 *   terms  suku-suku barisan
 *   st     state (makeSelisihState)
 *   opts.labels  label kartu (default U₁, U₂, …)
 *   opts.satuan  satuan untuk teks aria
 */
function buildSelisihTracker(id, terms, st, opts) {
  opts = opts || {};
  var html = '';
  terms.forEach(function (t, i) {
    if (i > 0) {
      var k = i - 1;
      var status = st.status[k];
      var labelAria =
        'Selisih ' +
        (opts.labels ? opts.labels[i] : 'U' + subskrip(i + 1)) +
        ' dikurangi ' +
        (opts.labels ? opts.labels[k] : 'U' + subskrip(k + 1));
      html +=
        '<span class="bar-bridge' +
        (status === 'benar' ? ' bar-bridge--ok' : status ? ' bar-bridge--salah' : '') +
        '">' +
        '<span class="bar-bridge__arc" aria-hidden="true"></span>' +
        (status === 'benar'
          ? '<span class="bar-bridge__val">' +
            (terms[i] - terms[k] > 0 ? '+' : '') +
            fmtSuku(terms[i] - terms[k]) +
            '</span>'
          : buildDlNumInput(id + 'In' + k, st.inputs[k], {
              error: !!status,
              allowNegative: true,
              aria: labelAria,
              placeholder: '?',
            })) +
        '</span>';
    }
    html +=
      '<span class="seq-tile bar-tile">' +
      '<span class="seq-tile__label">' +
      esc(opts.labels ? opts.labels[i] : 'U' + subskrip(i + 1)) +
      '</span>' +
      '<span class="seq-tile__val">' +
      fmtSuku(t) +
      '</span>' +
      '</span>';
  });

  var selesai = selisihTrackerSelesai(st);
  var umpan = '';
  st.status.forEach(function (s, k) {
    if (s && s !== 'benar') {
      umpan += buildFeedbackBox(
        'error',
        '✗',
        '<strong>Jembatan ' + (k + 1) + ':</strong> ' + pesanSelisih(s, terms[k], terms[k + 1])
      );
    }
  });
  if (selesai) {
    umpan = buildFeedbackBox(
      'success',
      '✓',
      'Selisih yang kamu temukan: <strong>' +
        selisihBerurutan(terms)
          .map(function (d) {
            return (d > 0 ? '+' : '') + fmtSuku(d);
          })
          .join(', ') +
        '</strong>' +
        (opts.satuan ? ' ' + esc(opts.satuan) : '') +
        '.'
    );
  }

  return (
    '<div class="bar-tracker" id="' +
    id +
    '">' +
    '<div class="bar-tracker__row" role="group" aria-label="Suku dan selisih barisan">' +
    html +
    '</div>' +
    (selesai
      ? ''
      : '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="' +
        id +
        'Check">Periksa Selisih</button>' +
        '</div>') +
    (umpan ? '<div class="bar-tracker__umpan">' + umpan + '</div>' : '') +
    '</div>'
  );
}

/* Memasang event pelacak selisih; `save` lalu `rerender` setelah Periksa. */
function bindSelisihTracker(root, id, terms, st, save, rerender) {
  var btn = root.querySelector('#' + id + 'Check');
  st.inputs.forEach(function (_, k) {
    var inp = root.querySelector('#' + id + 'In' + k);
    if (!inp) return;
    inp.addEventListener('input', function () {
      st.inputs[k] = inp.value;
      save();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && btn) btn.click();
    });
  });
  if (!btn) return;
  btn.addEventListener('click', function () {
    var hasil = periksaSelisihTracker(terms, st);
    save();
    rerender();
    if (hasil.tidakValid) showNotice('Tulis selisih berupa bilangan, mis. 5, −8, atau −0,3.');
    else if (hasil.kosong) showNotice('Masih ada jembatan yang belum diisi.');
  });
}

/* ---------- Lab barisan ---------- */

function makeLabBarisan(a, b) {
  return { a: a, b: b, dicoba: { naik: false, turun: false, konstan: false } };
}

function sukuLabBarisan(lab, n) {
  var out = [];
  for (var k = 1; k <= n; k++) out.push(sukuAritmetika(lab.a, lab.b, k));
  return out;
}

/* Menandai kategori beda (naik/turun/konstan) yang sudah dicoba murid. */
function catatLabBarisan(lab) {
  if (!lab.dicoba || typeof lab.dicoba !== 'object') {
    lab.dicoba = { naik: false, turun: false, konstan: false };
  }
  lab.dicoba[sifatBarisanAritmetika(lab.b)] = true;
}

function labBarisanLengkap(lab) {
  return !!(lab.dicoba && lab.dicoba.naik && lab.dicoba.turun && lab.dicoba.konstan);
}

/*
 * Garis bilangan dengan busur lompatan dari setiap suku ke suku
 * berikutnya; label busur menunjukkan selisihnya (+3, −2, +0).
 */
function buildLompatanSVG(terms, opts) {
  opts = opts || {};
  var W = 640;
  var H = 150;
  var padX = 36;
  var axisY = 108;
  var lo = Math.min.apply(null, terms);
  var hi = Math.max.apply(null, terms);
  if (hi - lo < 4) {
    var tengah = (hi + lo) / 2;
    lo = tengah - 2;
    hi = tengah + 2;
  }
  function xOf(v) {
    return padX + ((v - lo) / (hi - lo)) * (W - 2 * padX);
  }
  var out =
    '<line class="bar-axis" x1="' +
    (padX - 18) +
    '" y1="' +
    axisY +
    '" x2="' +
    (W - padX + 18) +
    '" y2="' +
    axisY +
    '"/>';

  for (var i = 0; i < terms.length - 1; i++) {
    var d = bulatkanSuku(terms[i + 1] - terms[i]);
    var sifat = sifatBarisanAritmetika(d);
    var label = (d >= 0 ? '+' : '') + fmtSuku(d);
    var x1 = xOf(terms[i]);
    var x2 = xOf(terms[i + 1]);
    if (sifat === 'konstan') {
      var r = 12 + i * 7;
      out +=
        '<circle class="bar-arc bar-arc--konstan" cx="' +
        x1 +
        '" cy="' +
        (axisY - r) +
        '" r="' +
        r +
        '"/>';
      if (i === 0) {
        out +=
          '<text class="bar-arc__label" x="' +
          x1 +
          '" y="' +
          (axisY - 2 * r - 30) +
          '">' +
          label +
          '</text>';
      }
    } else {
      var mid = (x1 + x2) / 2;
      var tinggi = Math.min(70, 26 + Math.abs(x2 - x1) * 0.35);
      out +=
        '<path class="bar-arc bar-arc--' +
        sifat +
        '" d="M' +
        x1 +
        ' ' +
        axisY +
        ' Q' +
        mid +
        ' ' +
        (axisY - tinggi * 2) +
        ' ' +
        x2 +
        ' ' +
        axisY +
        '"/>' +
        '<text class="bar-arc__label" x="' +
        mid +
        '" y="' +
        (axisY - tinggi - 6) +
        '">' +
        label +
        '</text>';
    }
  }
  terms.forEach(function (t, k) {
    var x = xOf(t);
    out +=
      '<circle class="bar-dot" cx="' +
      x +
      '" cy="' +
      axisY +
      '" r="6"/>' +
      (k === 0 || !hampirSama(t, terms[k - 1])
        ? '<text class="bar-dot__label" x="' +
          x +
          '" y="' +
          (axisY + 24) +
          '">' +
          fmtSuku(t) +
          '</text>'
        : '');
  });
  return (
    '<svg class="bar-lompatan" viewBox="0 0 ' +
    W +
    ' ' +
    H +
    '" role="img" aria-label="' +
    esc(opts.aria || 'Lompatan suku-suku barisan pada garis bilangan') +
    '">' +
    out +
    '</svg>'
  );
}

/*
 * Lab barisan: stepper suku pertama (a) dan beda (b), kartu suku dengan
 * selisihnya, garis bilangan lompatan, serta penanda kategori beda yang
 * sudah dicoba.
 *   id    id elemen pembungkus (stepper: <id>A…, <id>B…)
 *   lab   state (makeLabBarisan)
 *   opts  { n (default 6), rangeA {min,max} (default −10…20),
 *           rangeB {min,max} (default −6…6) }
 * Pasang event dengan bindLabBarisan(); lab merender ulang dirinya.
 */
function buildLabBarisan(id, lab, opts) {
  opts = opts || {};
  var n = opts.n || 6;
  var ra = opts.rangeA || { min: -10, max: 20 };
  var rb = opts.rangeB || { min: -6, max: 6 };
  var terms = sukuLabBarisan(lab, n);
  var sifat = sifatBarisanAritmetika(lab.b);
  var namaSifat = { naik: 'NAIK', turun: 'TURUN', konstan: 'KONSTAN (tetap)' };
  var chip = function (k, teks) {
    var sudah = lab.dicoba && lab.dicoba[k];
    return (
      '<li class="bar-chip' +
      (sudah ? ' bar-chip--done' : '') +
      '">' +
      (sudah ? '✓ ' : '○ ') +
      teks +
      '</li>'
    );
  };
  return (
    '<div class="bar-lab" id="' +
    id +
    '">' +
    '<div class="bar-lab__controls">' +
    buildIntegerStepper(id + 'A', 'Suku pertama (a)', lab.a, ra) +
    buildIntegerStepper(id + 'B', 'Beda (b)', lab.b, rb) +
    '</div>' +
    buildSequenceTiles(terms, { showDiff: true, more: true, format: fmtSuku }) +
    buildLompatanSVG(terms) +
    '<p class="bar-lab__sifat bar-lab__sifat--' +
    sifat +
    '" aria-live="polite">Barisan ini <strong>' +
    namaSifat[sifat] +
    '</strong>: setiap langkah berubah ' +
    (lab.b >= 0 ? '+' : '') +
    fmtSuku(lab.b) +
    '.</p>' +
    '<ul class="bar-chips" aria-label="Jenis beda yang sudah dicoba">' +
    chip('naik', 'b positif') +
    chip('turun', 'b negatif') +
    chip('konstan', 'b = 0') +
    '</ul>' +
    '</div>'
  );
}

/* onChange(lab) dipanggil setelah setiap perubahan a/b. */
function bindLabBarisan(root, id, lab, save, onChange, opts) {
  opts = opts || {};
  var ra = opts.rangeA || { min: -10, max: 20 };
  var rb = opts.rangeB || { min: -6, max: 6 };
  function pasang(scope) {
    bindIntegerStepper(scope, id + 'A', function (delta) {
      lab.a = Math.max(ra.min, Math.min(ra.max, lab.a + delta));
      ubah(id + 'A' + (delta < 0 ? 'Dec' : 'Inc'));
    });
    bindIntegerStepper(scope, id + 'B', function (delta) {
      lab.b = Math.max(rb.min, Math.min(rb.max, lab.b + delta));
      ubah(id + 'B' + (delta < 0 ? 'Dec' : 'Inc'));
    });
  }
  function ubah(fokusId) {
    catatLabBarisan(lab);
    save();
    var el = root.querySelector('#' + id);
    if (el) {
      el.outerHTML = buildLabBarisan(id, lab, opts);
      pasang(root);
      var f = root.querySelector('#' + fokusId);
      if (f && !f.disabled) f.focus();
    }
    if (onChange) onChange(lab);
  }
  pasang(root);
}

/* ============================================================
   33. ASOSIASI DUA VARIABEL — TABEL KONTINGENSI & DIAGRAM PENCAR
   Variabel kategorikal: tabel kontingensi dari data mentah atau
   frekuensi sel, persen baris/kolom, selisih poin persen, keputusan
   ada/tidak ada asosiasi, pemeriksa isian tabel. Variabel numerik:
   korelasi Pearson (hanya untuk kunci/tes, tidak ditampilkan ke
   murid), garis tren, arah & kekuatan asosiasi, sumbu rapi, plotter
   titik diagram pencar berdiagnosa sumbu tertukar. Lab data kelas
   untuk mengolah data nyata yang dikumpulkan murid sendiri.

   Bentuk tabel:
     { baris: [{id,label}], kolom: [{id,label}], sel: [[n]],
       totalBaris: [n], totalKolom: [n], total: n }
   Kunci isian tabel: 'sel-i-j', 'tb-i' (total baris), 'tk-j'
   (total kolom), 'total'.
   Gaya .aso-* ada di shared/base.css.
   ============================================================ */

/* Tabel kontingensi dari frekuensi sel (array baris × kolom). */
function tabelDariSel(sel, baris, kolom) {
  var sl = sel.map(function (r) {
    return r.slice();
  });
  var totalBaris = sl.map(function (r) {
    return r.reduce(function (a, b) {
      return a + b;
    }, 0);
  });
  var totalKolom = kolom.map(function (k, j) {
    return sl.reduce(function (a, r) {
      return a + r[j];
    }, 0);
  });
  return {
    baris: baris,
    kolom: kolom,
    sel: sl,
    totalBaris: totalBaris,
    totalKolom: totalKolom,
    total: totalBaris.reduce(function (a, b) {
      return a + b;
    }, 0),
  };
}

/*
 * Tabel kontingensi dari data mentah: setiap record dihitung pada sel
 * (record[kBaris], record[kKolom]). Kategori di luar daftar diabaikan.
 */
function tabelKontingensi(records, kBaris, kKolom, baris, kolom) {
  var ib = optionIds(baris);
  var ik = optionIds(kolom);
  var sel = baris.map(function () {
    return kolom.map(function () {
      return 0;
    });
  });
  records.forEach(function (r) {
    var i = ib.indexOf(r[kBaris]);
    var j = ik.indexOf(r[kKolom]);
    if (i !== -1 && j !== -1) sel[i][j] += 1;
  });
  return tabelDariSel(sel, baris, kolom);
}

/* Persen baris: sel ÷ total barisnya × 100 (baris kosong → 0). */
function persenBaris(t) {
  return t.sel.map(function (r, i) {
    return r.map(function (n) {
      return t.totalBaris[i] ? (n * 100) / t.totalBaris[i] : 0;
    });
  });
}

/* Persen kolom: sel ÷ total kolomnya × 100 (kolom kosong → 0). */
function persenKolom(t) {
  return t.sel.map(function (r) {
    return r.map(function (n, j) {
      return t.totalKolom[j] ? (n * 100) / t.totalKolom[j] : 0;
    });
  });
}

/* Selisih persen baris pertama dan kedua pada kolom j (poin persen). */
function selisihPoinPersen(t, j) {
  var p = persenBaris(t);
  return p[0][j] - p[1][j];
}

/*
 * 'ada' bila persen baris dua kategori mana pun berbeda sedikitnya
 * `ambang` poin persen (default 10) pada suatu kolom; selain itu 'tidak'.
 * Keputusan memakai PERSEN BARIS agar kelompok yang tidak sama besar
 * tetap adil dibandingkan.
 */
function asosiasiKategori(t, ambang) {
  var batas = typeof ambang === 'number' ? ambang : 10;
  var p = persenBaris(t);
  var maks = 0;
  for (var j = 0; j < t.kolom.length; j++) {
    for (var a = 0; a < p.length; a++) {
      for (var b = a + 1; b < p.length; b++) {
        maks = Math.max(maks, Math.abs(p[a][j] - p[b][j]));
      }
    }
  }
  return maks > 0.0001 && maks >= batas ? 'ada' : 'tidak';
}

/* Daftar kunci isian tabel (sel dulu, lalu total bila `denganTotal`). */
function kunciIsianKontingensi(t, denganTotal) {
  var out = [];
  t.sel.forEach(function (r, i) {
    r.forEach(function (n, j) {
      out.push('sel-' + i + '-' + j);
    });
  });
  if (denganTotal) {
    t.totalBaris.forEach(function (n, i) {
      out.push('tb-' + i);
    });
    t.totalKolom.forEach(function (n, j) {
      out.push('tk-' + j);
    });
    out.push('total');
  }
  return out;
}

function nilaiKunciKontingensi(t, key) {
  if (key === 'total') return t.total;
  var p = key.split('-');
  if (p[0] === 'sel') return t.sel[+p[1]][+p[2]];
  if (p[0] === 'tb') return t.totalBaris[+p[1]];
  return t.totalKolom[+p[1]];
}

/*
 * Memeriksa isian tabel kontingensi { kunci: teks }.
 *   opts.total  true → total baris/kolom/keseluruhan ikut diperiksa
 * Mengembalikan { lengkap, benar, salah: [kunci], kosong: [kunci] }.
 */
function cekIsianKontingensi(t, isian, opts) {
  opts = opts || {};
  var salah = [];
  var kosong = [];
  kunciIsianKontingensi(t, !!opts.total).forEach(function (k) {
    var v = isian && isian[k] !== undefined ? String(isian[k]).trim() : '';
    if (v === '') {
      kosong.push(k);
      return;
    }
    var p = parseInputInt(v, true);
    if (p.error || p.value !== nilaiKunciKontingensi(t, k)) salah.push(k);
  });
  return {
    lengkap: kosong.length === 0,
    benar: kosong.length === 0 && salah.length === 0,
    salah: salah,
    kosong: kosong,
  };
}

/* Membaca isian persen: "80", "80%", "37,5", "37.5 %". */
function parseInputPersen(str) {
  if (str === null || str === undefined || String(str).trim() === '') {
    return { value: null, error: 'empty', message: 'Isi jawabanmu terlebih dahulu.' };
  }
  var p = parseInputDecimal(String(str).replace(/%/g, '').replace(/−/g, '-'));
  if (p.error) {
    return {
      value: null,
      error: 'invalid',
      message: 'Tulis jawaban berupa bilangan persen, mis. 80 atau 37,5.',
    };
  }
  return { value: p.value, error: null };
}

/* Persen berkoma dengan paling banyak `d` angka desimal (default 1). */
function formatPersenAso(v, d) {
  return formatDesimal(v, typeof d === 'number' ? d : 1) + '%';
}

function rerata_(arr) {
  return (
    arr.reduce(function (a, b) {
      return a + b;
    }, 0) / arr.length
  );
}

/* Koefisien korelasi Pearson; null bila < 2 titik atau variansi nol. */
function korelasiPearson(xs, ys) {
  if (!xs || xs.length < 2 || xs.length !== ys.length) return null;
  var mx = rerata_(xs);
  var my = rerata_(ys);
  var sxy = 0;
  var sxx = 0;
  var syy = 0;
  for (var i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) * (xs[i] - mx);
    syy += (ys[i] - my) * (ys[i] - my);
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

/* Garis tren kuadrat terkecil y = m·x + c; null bila semua x sama. */
function garisTren(xs, ys) {
  if (!xs || xs.length < 2) return null;
  var mx = rerata_(xs);
  var my = rerata_(ys);
  var sxy = 0;
  var sxx = 0;
  for (var i = 0; i < xs.length; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) * (xs[i] - mx);
  }
  if (sxx === 0) return null;
  var m = sxy / sxx;
  return { m: m, c: my - m * mx };
}

/* Arah asosiasi dari r: |r| < 0,3 dianggap tidak ada asosiasi linear. */
function arahAsosiasi(r) {
  if (r === null || r === undefined || Math.abs(r) < 0.3) return 'tidak';
  return r > 0 ? 'positif' : 'negatif';
}

/* Kekuatan asosiasi: |r| ≥ 0,7 kuat, ≥ 0,4 sedang, selebihnya lemah. */
function kekuatanAsosiasi(r) {
  if (r === null || r === undefined) return 'lemah';
  var a = Math.abs(r);
  if (a >= 0.7) return 'kuat';
  if (a >= 0.4) return 'sedang';
  return 'lemah';
}

/* Ringkasan asosiasi dari titik [{x, y}]: { r, arah, kekuatan }. */
function asosiasiTitik(points) {
  var r = korelasiPearson(
    points.map(function (p) {
      return p.x;
    }),
    points.map(function (p) {
      return p.y;
    })
  );
  return { r: r, arah: arahAsosiasi(r), kekuatan: kekuatanAsosiasi(r) };
}

/* Langkah tick "rapi" (1, 2, 5 × 10ⁿ) untuk rentang tertentu. */
function langkahRapi_(rentang, banyak) {
  var kasar = rentang / (banyak || 5);
  if (kasar <= 0) return 1;
  var pangkat = Math.pow(10, Math.floor(Math.log10(kasar)));
  var f = kasar / pangkat;
  var rapi = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return rapi * pangkat;
}

/*
 * Sumbu diagram pencar { min, max, step } dari nilai data. opts.min,
 * opts.max, opts.step (bila ada) dipakai apa adanya.
 */
function sumbuPencar(values, opts) {
  opts = opts || {};
  if (
    typeof opts.min === 'number' &&
    typeof opts.max === 'number' &&
    typeof opts.step === 'number'
  ) {
    return { min: opts.min, max: opts.max, step: opts.step };
  }
  var lo = values.length ? Math.min.apply(null, values) : 0;
  var hi = values.length ? Math.max.apply(null, values) : 10;
  if (lo >= 0 && lo <= (hi - lo) * 0.5) lo = 0;
  if (hi === lo) hi = lo + 1;
  var step = opts.step || langkahRapi_(hi - lo, 5);
  var min = typeof opts.min === 'number' ? opts.min : Math.floor(lo / step) * step;
  var max = typeof opts.max === 'number' ? opts.max : Math.ceil(hi / step) * step;
  if (max === min) max = min + step;
  return { min: min, max: max, step: step };
}

/* Nilai tick dari min sampai max dengan langkah step. */
function tickSumbu(ax) {
  var out = [];
  var n = Math.round((ax.max - ax.min) / ax.step);
  for (var i = 0; i <= n; i++) out.push(Math.round((ax.min + i * ax.step) * 1e6) / 1e6);
  return out;
}

/* Membulatkan nilai ke kelipatan step terdekat di dalam [min, max]. */
function snapKeSumbu(v, ax) {
  var k = Math.round((v - ax.min) / ax.step);
  var s = Math.round((ax.min + k * ax.step) * 1e6) / 1e6;
  return Math.max(ax.min, Math.min(ax.max, s));
}

/* ---------- Plotter titik diagram pencar ---------- */

function makePlotterState() {
  return { placed: {}, salah: null, attempts: 0, cursor: null };
}

/* Target pertama yang belum ditempatkan; null bila semua sudah. */
function plotterAktif(target, st) {
  for (var i = 0; i < target.length; i++) {
    if (!st.placed[target[i].id]) return target[i];
  }
  return null;
}

function plotterSelesai(target, st) {
  return plotterAktif(target, st) === null;
}

/* 'benar' | 'tertukar' (x dan y tertukar) | 'salah'. */
function diagnosaTitik(t, x, y) {
  if (hampirSama(x, t.x) && hampirSama(y, t.y)) return 'benar';
  if (hampirSama(x, t.y) && hampirSama(y, t.x)) return 'tertukar';
  return 'salah';
}

/*
 * Mencoba menempatkan titik (x, y) untuk target aktif. Titik benar
 * disimpan di st.placed; yang keliru dicatat di st.salah.
 */
function plotterCoba(target, st, x, y) {
  var t = plotterAktif(target, st);
  if (!t) return 'selesai';
  st.attempts += 1;
  var kode = diagnosaTitik(t, x, y);
  if (kode === 'benar') {
    st.placed[t.id] = { x: t.x, y: t.y };
    st.salah = null;
  } else {
    st.salah = { x: x, y: y, kode: kode };
  }
  return kode;
}

/* Umpan balik titik keliru; x, y opsional untuk menyebut sumbu yang meleset. */
function pesanDiagnosaTitik(kode, t, opts, x, y) {
  opts = opts || {};
  var xl = opts.xLabel || 'sumbu mendatar';
  var yl = opts.yLabel || 'sumbu tegak';
  if (kode === 'tertukar') {
    return (
      'Nilai x dan y tertukar. <strong>' +
      esc(xl) +
      '</strong> dibaca pada sumbu mendatar, <strong>' +
      esc(yl) +
      '</strong> pada sumbu tegak.'
    );
  }
  if (typeof x === 'number' && typeof y === 'number') {
    var xOk = hampirSama(x, t.x);
    var yOk = hampirSama(y, t.y);
    if (xOk && !yOk) {
      return (
        'Posisi mendatarnya sudah tepat. Periksa lagi ketinggian titik pada sumbu tegak (' +
        esc(yl) +
        ').'
      );
    }
    if (!xOk && yOk) {
      return 'Ketinggiannya sudah tepat. Periksa lagi posisi mendatar titik (' + esc(xl) + ').';
    }
  }
  return (
    'Titik belum tepat. Cari nilai ' +
    esc(xl) +
    ' pada sumbu mendatar, lalu naik sampai nilai ' +
    esc(yl) +
    '.'
  );
}

/* ---------- Lab data kelas ---------- */

function makeLabDataKelas() {
  return {
    mode: 'numerik',
    numerik: [
      { x: '', y: '' },
      { x: '', y: '' },
      { x: '', y: '' },
    ],
    kategori: [
      { a: '', b: '' },
      { a: '', b: '' },
      { a: '', b: '' },
    ],
    tren: false,
    catatan: '',
  };
}

/* Titik valid (kedua kolom berisi bilangan) dari isian lab numerik. */
function labTitikNumerik(st) {
  var out = [];
  (st.numerik || []).forEach(function (r) {
    var px = parseInputDecimal(r.x);
    var py = parseInputDecimal(r.y);
    if (!px.error && !py.error) out.push({ x: px.value, y: py.value });
  });
  return out;
}

/* Tabel kontingensi dari isian lab kategori (kolom a × kolom b). */
function labTabelKategori(st, baris, kolom) {
  return tabelKontingensi(st.kategori || [], 'a', 'b', baris, kolom);
}

function labTambahBaris(st) {
  if (st.mode === 'kategori') st.kategori.push({ a: '', b: '' });
  else st.numerik.push({ x: '', y: '' });
}

function labHapusBaris(st, i) {
  var list = st.mode === 'kategori' ? st.kategori : st.numerik;
  if (i >= 0 && i < list.length) list.splice(i, 1);
}

/* ---------- Komponen tampilan ---------- */

/*
 * Tabel kontingensi.
 *   opts.mode        'frekuensi' (default) | 'persen' (persen baris)
 *   opts.judulBaris  judul kolom kategori baris (sudut kiri atas)
 *   opts.judulKolom  judul di atas kategori kolom
 *   opts.caption     keterangan tabel
 *   opts.sorotKolom  indeks kolom yang disorot
 *   opts.tanpaTotal  true → tanpa baris/kolom total
 */
function buildContingencyTable(t, opts) {
  opts = opts || {};
  var persen = opts.mode === 'persen';
  var pb = persen ? persenBaris(t) : null;
  var total = !opts.tanpaTotal;
  function sorot(j) {
    return opts.sorotKolom === j ? ' aso-sorot' : '';
  }
  var head =
    (opts.judulKolom
      ? '<tr><td class="aso-tabel__sudut"></td><th scope="colgroup" colspan="' +
        (t.kolom.length + (total ? 1 : 0)) +
        '" class="aso-tabel__grup">' +
        esc(opts.judulKolom) +
        '</th></tr>'
      : '') +
    '<tr><th scope="col" class="aso-tabel__sudut">' +
    esc(opts.judulBaris || '') +
    '</th>' +
    t.kolom
      .map(function (k, j) {
        return '<th scope="col" class="' + sorot(j).trim() + '">' + esc(k.label) + '</th>';
      })
      .join('') +
    (total ? '<th scope="col" class="aso-tabel__total">Total</th>' : '') +
    '</tr>';
  var body = t.baris
    .map(function (b, i) {
      return (
        '<tr><th scope="row">' +
        esc(b.label) +
        '</th>' +
        t.sel[i]
          .map(function (n, j) {
            return (
              '<td class="aso-num' +
              sorot(j) +
              '">' +
              (persen ? formatPersenAso(pb[i][j]) : formatNumber(n)) +
              (persen ? '<span class="aso-tabel__n">(' + n + ')</span>' : '') +
              '</td>'
            );
          })
          .join('') +
        (total
          ? '<td class="aso-num aso-tabel__total">' +
            (persen ? '100%' : formatNumber(t.totalBaris[i])) +
            (persen ? '<span class="aso-tabel__n">(' + t.totalBaris[i] + ')</span>' : '') +
            '</td>'
          : '') +
        '</tr>'
      );
    })
    .join('');
  var foot =
    total && !persen
      ? '<tr class="aso-tabel__total"><th scope="row">Total</th>' +
        t.totalKolom
          .map(function (n, j) {
            return '<td class="aso-num' + sorot(j) + '">' + formatNumber(n) + '</td>';
          })
          .join('') +
        '<td class="aso-num">' +
        formatNumber(t.total) +
        '</td></tr>'
      : '';
  return (
    '<div class="aso-tabel-wrap"><table class="aso-tabel">' +
    (opts.caption
      ? '<caption class="aso-tabel__caption">' + esc(opts.caption) + '</caption>'
      : '') +
    '<thead>' +
    head +
    '</thead><tbody>' +
    body +
    foot +
    '</tbody></table></div>'
  );
}

/*
 * Tabel kontingensi berisi kotak isian (id DOM: `${id}-${kunci}`).
 *   opts.total    true → total baris/kolom/keseluruhan ikut diisi
 *   opts.salah    daftar kunci yang ditandai salah
 *   opts.terkunci true → semua kotak dinonaktifkan
 *   opts.judulBaris, opts.judulKolom, opts.caption seperti buildContingencyTable
 */
function buildContingencyInput(id, t, isian, opts) {
  opts = opts || {};
  isian = isian || {};
  var salah = opts.salah || [];
  function kotak(key, aria) {
    return (
      '<input type="text" inputmode="numeric" autocomplete="off" class="input-text aso-input' +
      (salah.indexOf(key) !== -1 ? ' has-error' : '') +
      '" id="' +
      id +
      '-' +
      key +
      '" data-aso-key="' +
      key +
      '" value="' +
      esc(isian[key] || '') +
      '" aria-label="' +
      esc(aria) +
      '"' +
      (opts.terkunci ? ' disabled' : '') +
      '>'
    );
  }
  var total = !!opts.total;
  var head =
    (opts.judulKolom
      ? '<tr><td class="aso-tabel__sudut"></td><th scope="colgroup" colspan="' +
        (t.kolom.length + (total ? 1 : 0)) +
        '" class="aso-tabel__grup">' +
        esc(opts.judulKolom) +
        '</th></tr>'
      : '') +
    '<tr><th scope="col" class="aso-tabel__sudut">' +
    esc(opts.judulBaris || '') +
    '</th>' +
    t.kolom
      .map(function (k) {
        return '<th scope="col">' + esc(k.label) + '</th>';
      })
      .join('') +
    (total ? '<th scope="col" class="aso-tabel__total">Total</th>' : '') +
    '</tr>';
  var body = t.baris
    .map(function (b, i) {
      return (
        '<tr><th scope="row">' +
        esc(b.label) +
        '</th>' +
        t.kolom
          .map(function (k, j) {
            return '<td>' + kotak('sel-' + i + '-' + j, b.label + ' dan ' + k.label) + '</td>';
          })
          .join('') +
        (total
          ? '<td class="aso-tabel__total">' + kotak('tb-' + i, 'Total ' + b.label) + '</td>'
          : '') +
        '</tr>'
      );
    })
    .join('');
  var foot = total
    ? '<tr class="aso-tabel__total"><th scope="row">Total</th>' +
      t.kolom
        .map(function (k, j) {
          return '<td>' + kotak('tk-' + j, 'Total ' + k.label) + '</td>';
        })
        .join('') +
      '<td>' +
      kotak('total', 'Total keseluruhan') +
      '</td></tr>'
    : '';
  return (
    '<div class="aso-tabel-wrap"><table class="aso-tabel aso-tabel--isian">' +
    (opts.caption
      ? '<caption class="aso-tabel__caption">' + esc(opts.caption) + '</caption>'
      : '') +
    '<thead>' +
    head +
    '</thead><tbody>' +
    body +
    foot +
    '</tbody></table></div>'
  );
}

/* Menyimpan isian tabel ke objek `isian` setiap diketik (tanpa render ulang). */
function bindContingencyInput(root, id, isian, save, onEnter) {
  root.querySelectorAll('[id^="' + id + '-"][data-aso-key]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      isian[inp.dataset.asoKey] = inp.value;
      save();
    });
    if (onEnter) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') onEnter();
      });
    }
  });
}

/*
 * Batang tersegmen 100% per kategori baris (persen baris), untuk
 * membandingkan komposisi kelompok yang tidak sama besar.
 *   opts.caption  teks aksesibel tambahan
 */
function buildSegmentedBar(t, opts) {
  opts = opts || {};
  var pb = persenBaris(t);
  var aria =
    (opts.caption ? opts.caption + '. ' : '') +
    t.baris
      .map(function (b, i) {
        return (
          b.label +
          ': ' +
          t.kolom
            .map(function (k, j) {
              return k.label + ' ' + formatPersenAso(pb[i][j]);
            })
            .join(', ')
        );
      })
      .join('; ');
  return (
    '<div class="aso-segbar" role="img" aria-label="' +
    esc(aria) +
    '">' +
    t.baris
      .map(function (b, i) {
        return (
          '<div class="aso-segbar__row">' +
          '<span class="aso-segbar__label">' +
          esc(b.label) +
          ' <span class="aso-segbar__n">(n = ' +
          t.totalBaris[i] +
          ')</span></span>' +
          '<div class="aso-segbar__bar">' +
          t.kolom
            .map(function (k, j) {
              var w = Math.round(pb[i][j] * 10) / 10;
              return (
                '<span class="aso-seg aso-seg--' +
                (j % 4) +
                '" style="width:' +
                w +
                '%">' +
                (w >= 14 ? formatPersenAso(pb[i][j], 0) : '') +
                '</span>'
              );
            })
            .join('') +
          '</div></div>'
        );
      })
      .join('') +
    '<div class="aso-segbar__legend" aria-hidden="true">' +
    t.kolom
      .map(function (k, j) {
        return '<span><i class="aso-seg aso-seg--' + (j % 4) + '"></i>' + esc(k.label) + '</span>';
      })
      .join('') +
    '</div></div>'
  );
}

/* Geometri bersama diagram pencar (viewBox tetap, diskalakan CSS). */
var ASO_PLOT = { W: 560, H: 380, L: 64, R: 18, T: 18, B: 58 };

function asoSkala_(ax, ay) {
  var g = ASO_PLOT;
  return {
    x: function (v) {
      return g.L + ((v - ax.min) / (ax.max - ax.min)) * (g.W - g.L - g.R);
    },
    y: function (v) {
      return g.H - g.B - ((v - ay.min) / (ay.max - ay.min)) * (g.H - g.T - g.B);
    },
  };
}

function asoAngka_(v) {
  return Number.isInteger(v) ? formatNumber(v, '−') : formatDesimal(v, 2);
}

/* Sumbu, grid, tick, dan label sumbu (tanpa titik). */
function asoKerangka_(ax, ay, s, opts) {
  var g = ASO_PLOT;
  var out = '';
  tickSumbu(ax).forEach(function (v) {
    var x = s.x(v);
    out +=
      '<line class="aso-grid" x1="' +
      x +
      '" y1="' +
      g.T +
      '" x2="' +
      x +
      '" y2="' +
      (g.H - g.B) +
      '"/>' +
      '<text class="aso-tick aso-tick--x" x="' +
      x +
      '" y="' +
      (g.H - g.B + 18) +
      '">' +
      asoAngka_(v) +
      '</text>';
  });
  tickSumbu(ay).forEach(function (v) {
    var y = s.y(v);
    out +=
      '<line class="aso-grid" x1="' +
      g.L +
      '" y1="' +
      y +
      '" x2="' +
      (g.W - g.R) +
      '" y2="' +
      y +
      '"/>' +
      '<text class="aso-tick aso-tick--y" x="' +
      (g.L - 8) +
      '" y="' +
      (y + 4) +
      '">' +
      asoAngka_(v) +
      '</text>';
  });
  out +=
    '<line class="aso-axis" x1="' +
    g.L +
    '" y1="' +
    (g.H - g.B) +
    '" x2="' +
    (g.W - g.R) +
    '" y2="' +
    (g.H - g.B) +
    '"/>' +
    '<line class="aso-axis" x1="' +
    g.L +
    '" y1="' +
    g.T +
    '" x2="' +
    g.L +
    '" y2="' +
    (g.H - g.B) +
    '"/>';
  if (opts.xLabel) {
    out +=
      '<text class="aso-axis-label" x="' +
      (g.L + (g.W - g.L - g.R) / 2) +
      '" y="' +
      (g.H - 12) +
      '">' +
      esc(opts.xLabel) +
      '</text>';
  }
  if (opts.yLabel) {
    var cy = g.T + (g.H - g.T - g.B) / 2;
    out +=
      '<text class="aso-axis-label" x="16" y="' +
      cy +
      '" transform="rotate(-90 16 ' +
      cy +
      ')">' +
      esc(opts.yLabel) +
      '</text>';
  }
  return out;
}

function asoSumbuDari_(points, opts) {
  return {
    x: sumbuPencar(
      points.map(function (p) {
        return p.x;
      }),
      opts.x || {}
    ),
    y: sumbuPencar(
      points.map(function (p) {
        return p.y;
      }),
      opts.y || {}
    ),
  };
}

function asoGarisTren_(points, ax, ay, s) {
  var g = garisTren(
    points.map(function (p) {
      return p.x;
    }),
    points.map(function (p) {
      return p.y;
    })
  );
  if (!g) return '';
  /* Potong garis pada batas y agar tidak keluar dari area grafik. */
  var x1 = ax.min;
  var x2 = ax.max;
  function klip(x) {
    var y = g.m * x + g.c;
    if (y < ay.min && g.m !== 0) return (ay.min - g.c) / g.m;
    if (y > ay.max && g.m !== 0) return (ay.max - g.c) / g.m;
    return x;
  }
  x1 = Math.max(ax.min, Math.min(ax.max, klip(x1)));
  x2 = Math.max(ax.min, Math.min(ax.max, klip(x2)));
  return (
    '<line class="aso-trend" x1="' +
    s.x(x1) +
    '" y1="' +
    s.y(g.m * x1 + g.c) +
    '" x2="' +
    s.x(x2) +
    '" y2="' +
    s.y(g.m * x2 + g.c) +
    '"/>'
  );
}

/*
 * Diagram pencar (SVG).
 *   points        [{x, y, id?}]
 *   opts.x, opts.y   { min, max, step } opsional (default dari data)
 *   opts.xLabel, opts.yLabel   label sumbu
 *   opts.trend    true → garis tren kuadrat terkecil
 *   opts.sorot    daftar id titik yang disorot
 *   opts.caption  label aksesibel (role="img")
 *   opts.kecil    true → versi ringkas (untuk kartu pemilahan/soal)
 */
function buildScatterPlot(points, opts) {
  opts = opts || {};
  var ax = asoSumbuDari_(points, opts);
  var s = asoSkala_(ax.x, ax.y);
  var sorot = opts.sorot || [];
  var dots = points
    .map(function (p) {
      var cls = p.id && sorot.indexOf(p.id) !== -1 ? 'aso-dot aso-dot--sorot' : 'aso-dot';
      return '<circle class="' + cls + '" cx="' + s.x(p.x) + '" cy="' + s.y(p.y) + '" r="6"/>';
    })
    .join('');
  return (
    '<svg class="aso-plot' +
    (opts.kecil ? ' aso-plot--kecil' : '') +
    '" viewBox="0 0 ' +
    ASO_PLOT.W +
    ' ' +
    ASO_PLOT.H +
    '" role="img" aria-label="' +
    esc(opts.caption || 'Diagram pencar') +
    '">' +
    asoKerangka_(ax.x, ax.y, s, opts) +
    (opts.trend ? asoGarisTren_(points, ax.x, ax.y, s) : '') +
    dots +
    '</svg>'
  );
}

/*
 * Plotter titik: murid menempatkan titik target satu per satu dengan
 * klik/ketuk pada grid, atau keyboard (panah menggeser kursor, Enter
 * menempatkan). Titik menempel ke kelipatan step sumbu.
 *   target   [{id, x, y, label}]
 *   st       makePlotterState()
 *   opts.x, opts.y (wajib) sumbu; opts.xLabel, opts.yLabel; opts.satuanX, opts.satuanY
 */
function buildScatterPlotter(id, target, st, opts) {
  var ax = opts.x;
  var ay = opts.y;
  var s = asoSkala_(ax, ay);
  var aktif = plotterAktif(target, st);
  var cur = st.cursor || { x: ax.min, y: ay.min };
  var dots = target
    .filter(function (t) {
      return st.placed[t.id];
    })
    .map(function (t) {
      return '<circle class="aso-dot" cx="' + s.x(t.x) + '" cy="' + s.y(t.y) + '" r="6"/>';
    })
    .join('');
  var salah = st.salah
    ? '<g class="aso-dot--salah"><line x1="' +
      (s.x(st.salah.x) - 7) +
      '" y1="' +
      (s.y(st.salah.y) - 7) +
      '" x2="' +
      (s.x(st.salah.x) + 7) +
      '" y2="' +
      (s.y(st.salah.y) + 7) +
      '"/><line x1="' +
      (s.x(st.salah.x) - 7) +
      '" y1="' +
      (s.y(st.salah.y) + 7) +
      '" x2="' +
      (s.x(st.salah.x) + 7) +
      '" y2="' +
      (s.y(st.salah.y) - 7) +
      '"/></g>'
    : '';
  var cursor = aktif
    ? '<g class="aso-cursor" id="' +
      id +
      '-cursor" transform="translate(' +
      s.x(cur.x) +
      ' ' +
      s.y(cur.y) +
      ')">' +
      '<circle r="9"/><line x1="-14" y1="0" x2="14" y2="0"/><line x1="0" y1="-14" x2="0" y2="14"/></g>'
    : '';
  var fmtT = function (t) {
    return (
      esc(t.label) +
      ': ' +
      asoAngka_(t.x) +
      (opts.satuanX ? ' ' + esc(opts.satuanX) : '') +
      ', ' +
      asoAngka_(t.y) +
      (opts.satuanY ? ' ' + esc(opts.satuanY) : '')
    );
  };
  return (
    '<div class="aso-plotter" id="' +
    id +
    '">' +
    '<ol class="aso-plotter__list">' +
    target
      .map(function (t) {
        var cls = st.placed[t.id] ? 'is-done' : aktif && t.id === aktif.id ? 'is-active' : '';
        return (
          '<li class="' +
          cls +
          '">' +
          (st.placed[t.id] ? '✓ ' : aktif && t.id === aktif.id ? '▶ ' : '') +
          fmtT(t) +
          '</li>'
        );
      })
      .join('') +
    '</ol>' +
    '<div class="aso-plotter__stage">' +
    '<svg class="aso-plot aso-plot--input" id="' +
    id +
    '-svg" tabindex="0" viewBox="0 0 ' +
    ASO_PLOT.W +
    ' ' +
    ASO_PLOT.H +
    '" role="application" aria-roledescription="grid diagram pencar" aria-describedby="' +
    id +
    '-help" aria-label="' +
    esc(
      aktif
        ? 'Tempatkan titik ' +
            aktif.label +
            '. Kursor di x ' +
            asoAngka_(cur.x) +
            ', y ' +
            asoAngka_(cur.y)
        : 'Semua titik sudah ditempatkan'
    ) +
    '">' +
    asoKerangka_(ax, ay, s, opts) +
    dots +
    salah +
    cursor +
    '</svg>' +
    '<p class="dl-caption" id="' +
    id +
    '-help">' +
    (aktif
      ? 'Ketuk posisi titik pada grid. Dengan keyboard: fokus ke grafik, geser kursor dengan tombol panah, lalu tekan Enter.'
      : 'Semua titik sudah ditempatkan.') +
    '</p>' +
    '<p class="aso-plotter__pos" id="' +
    id +
    '-pos" aria-live="polite">' +
    (aktif ? 'Kursor: (' + asoAngka_(cur.x) + ', ' + asoAngka_(cur.y) + ')' : '') +
    '</p>' +
    '</div></div>'
  );
}

/*
 * Memasang interaksi plotter. onTry(kode) dipanggil setelah setiap
 * percobaan penempatan (st sudah diperbarui), biasanya untuk save +
 * render ulang.
 */
function bindScatterPlotter(root, id, target, st, opts, onTry) {
  var svg = root.querySelector('#' + id + '-svg');
  if (!svg || !plotterAktif(target, st)) return;
  var ax = opts.x;
  var ay = opts.y;
  var s = asoSkala_(ax, ay);
  var g = ASO_PLOT;
  if (!st.cursor) st.cursor = { x: ax.min, y: ay.min };

  function tampilkanKursor() {
    var c = root.querySelector('#' + id + '-cursor');
    if (c)
      c.setAttribute('transform', 'translate(' + s.x(st.cursor.x) + ' ' + s.y(st.cursor.y) + ')');
    var pos = root.querySelector('#' + id + '-pos');
    if (pos)
      pos.textContent = 'Kursor: (' + asoAngka_(st.cursor.x) + ', ' + asoAngka_(st.cursor.y) + ')';
  }
  function dariPointer(e) {
    var r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    var vx = ((e.clientX - r.left) / r.width) * g.W;
    var vy = ((e.clientY - r.top) / r.height) * g.H;
    var x = ax.min + ((vx - g.L) / (g.W - g.L - g.R)) * (ax.max - ax.min);
    var y = ay.min + ((g.H - g.B - vy) / (g.H - g.T - g.B)) * (ay.max - ay.min);
    return { x: snapKeSumbu(x, ax), y: snapKeSumbu(y, ay) };
  }
  function coba() {
    var kode = plotterCoba(target, st, st.cursor.x, st.cursor.y);
    if (onTry) onTry(kode);
  }
  svg.addEventListener('pointermove', function (e) {
    var p = dariPointer(e);
    if (!p) return;
    st.cursor = p;
    tampilkanKursor();
  });
  svg.addEventListener('click', function (e) {
    var p = dariPointer(e);
    if (!p) return;
    st.cursor = p;
    coba();
  });
  svg.addEventListener('keydown', function (e) {
    var dx = 0;
    var dy = 0;
    if (e.key === 'ArrowRight') dx = 1;
    else if (e.key === 'ArrowLeft') dx = -1;
    else if (e.key === 'ArrowUp') dy = 1;
    else if (e.key === 'ArrowDown') dy = -1;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      coba();
      return;
    } else return;
    e.preventDefault();
    st.cursor = {
      x: snapKeSumbu(st.cursor.x + dx * ax.step, ax),
      y: snapKeSumbu(st.cursor.y + dy * ay.step, ay),
    };
    tampilkanKursor();
  });
}

/*
 * Kartu data untuk menghitung turus: setiap kartu satu record, ketuk
 * untuk menandai "sudah dihitung".
 *   records      [{id, nama, <key>: idKategori}]
 *   ditandai     { idRecord: true }
 *   opts.fields  [{ key, label, kategori: [{id, label}] }]
 */
function buildTallyCards(id, records, ditandai, opts) {
  var fields = opts.fields || [];
  return (
    '<div class="aso-tally" id="' +
    id +
    '">' +
    records
      .map(function (r) {
        var on = !!ditandai[r.id];
        return (
          '<button type="button" class="aso-tally__card' +
          (on ? ' is-marked' : '') +
          '" data-tally="' +
          esc(r.id) +
          '" aria-pressed="' +
          (on ? 'true' : 'false') +
          '">' +
          '<span class="aso-tally__nama">' +
          (on ? '✓ ' : '') +
          esc(r.nama) +
          '</span>' +
          fields
            .map(function (f, k) {
              return (
                '<span class="aso-chip aso-chip--' +
                k +
                '"><span class="sr-only">' +
                esc(f.label) +
                ': </span>' +
                esc(findOptionLabel(f.kategori, r[f.key])) +
                '</span>'
              );
            })
            .join('') +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}

function bindTallyCards(root, id, ditandai, save, rerender) {
  root.querySelectorAll('#' + id + ' [data-tally]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var rid = btn.dataset.tally;
      if (ditandai[rid]) delete ditandai[rid];
      else ditandai[rid] = true;
      save();
      rerender(rid);
    });
  });
}

/* Hasil lab data kelas: diagram pencar (numerik) atau tabel + batang (kategori). */
function labHasilHTML(st, opts) {
  var hasil;
  if (st.mode !== 'kategori') {
    var on = opts.numerik;
    var pts = labTitikNumerik(st);
    hasil =
      pts.length >= 3
        ? '<label class="aso-lab__toggle"><input type="checkbox" data-lab-tren' +
          (st.tren ? ' checked' : '') +
          '> Tampilkan garis tren</label>' +
          buildScatterPlot(pts, {
            xLabel: on.xLabel,
            yLabel: on.yLabel,
            trend: st.tren,
            caption: 'Diagram pencar data kelas: ' + pts.length + ' titik',
          })
        : '<p class="dl-caption">Isi minimal 3 pasangan data untuk melihat diagram pencar.</p>';
  } else {
    var ok = opts.kategori;
    var t = labTabelKategori(st, ok.a.kategori, ok.b.kategori);
    hasil =
      t.total >= 2
        ? buildContingencyTable(t, {
            judulBaris: ok.a.label,
            judulKolom: ok.b.label,
            caption: 'Frekuensi data kelas',
          }) +
          buildContingencyTable(t, {
            mode: 'persen',
            judulBaris: ok.a.label,
            judulKolom: ok.b.label,
            caption: 'Persen baris data kelas',
          }) +
          buildSegmentedBar(t, { caption: 'Persen baris data kelas' })
        : '<p class="dl-caption">Isi minimal 2 baris lengkap untuk melihat tabel kontingensi.</p>';
  }
  return hasil;
}

/*
 * Lab data kelas: murid memasukkan data nyata kelasnya sendiri (numerik
 * berpasangan atau dua kategori) dan langsung melihat diagram pencar
 * atau tabel kontingensi + batang tersegmen. Tidak dinilai.
 *   st   makeLabDataKelas()
 *   opts.numerik  { xLabel, yLabel }
 *   opts.kategori { a: {label, kategori}, b: {label, kategori} }
 */
function buildClassDataLab(id, st, opts) {
  var num = st.mode !== 'kategori';
  var tabs =
    '<div class="aso-lab__tabs" role="group" aria-label="Jenis data">' +
    '<button type="button" class="aso-lab__tab' +
    (num ? ' is-active' : '') +
    '" data-lab-mode="numerik" aria-pressed="' +
    num +
    '">Dua variabel numerik</button>' +
    '<button type="button" class="aso-lab__tab' +
    (!num ? ' is-active' : '') +
    '" data-lab-mode="kategori" aria-pressed="' +
    !num +
    '">Dua variabel kategorikal</button>' +
    '</div>';
  var rows;
  if (num) {
    var on = opts.numerik;
    rows =
      '<table class="aso-lab__table"><thead><tr><th scope="col">No</th><th scope="col">' +
      esc(on.xLabel) +
      '</th><th scope="col">' +
      esc(on.yLabel) +
      '</th><th scope="col"><span class="sr-only">Hapus</span></th></tr></thead><tbody>' +
      st.numerik
        .map(function (r, i) {
          return (
            '<tr><td>' +
            (i + 1) +
            '</td>' +
            '<td><input type="text" inputmode="decimal" class="input-text aso-input" data-lab-row="' +
            i +
            '" data-lab-col="x" value="' +
            esc(r.x) +
            '" aria-label="' +
            esc(on.xLabel) +
            ' baris ' +
            (i + 1) +
            '"></td>' +
            '<td><input type="text" inputmode="decimal" class="input-text aso-input" data-lab-row="' +
            i +
            '" data-lab-col="y" value="' +
            esc(r.y) +
            '" aria-label="' +
            esc(on.yLabel) +
            ' baris ' +
            (i + 1) +
            '"></td>' +
            '<td><button type="button" class="btn btn--ghost btn--small" data-lab-del="' +
            i +
            '" aria-label="Hapus baris ' +
            (i + 1) +
            '">✕</button></td></tr>'
          );
        })
        .join('') +
      '</tbody></table>';
  } else {
    var ok = opts.kategori;
    function pilih(i, col, v) {
      var kat = ok[col].kategori;
      return (
        '<select class="input-select aso-lab__select" data-lab-row="' +
        i +
        '" data-lab-col="' +
        col +
        '" aria-label="' +
        esc(ok[col].label) +
        ' baris ' +
        (i + 1) +
        '">' +
        '<option value="">—</option>' +
        kat
          .map(function (k) {
            return (
              '<option value="' +
              esc(k.id) +
              '"' +
              (v === k.id ? ' selected' : '') +
              '>' +
              esc(k.label) +
              '</option>'
            );
          })
          .join('') +
        '</select>'
      );
    }
    rows =
      '<table class="aso-lab__table"><thead><tr><th scope="col">No</th><th scope="col">' +
      esc(ok.a.label) +
      '</th><th scope="col">' +
      esc(ok.b.label) +
      '</th><th scope="col"><span class="sr-only">Hapus</span></th></tr></thead><tbody>' +
      st.kategori
        .map(function (r, i) {
          return (
            '<tr><td>' +
            (i + 1) +
            '</td><td>' +
            pilih(i, 'a', r.a) +
            '</td><td>' +
            pilih(i, 'b', r.b) +
            '</td>' +
            '<td><button type="button" class="btn btn--ghost btn--small" data-lab-del="' +
            i +
            '" aria-label="Hapus baris ' +
            (i + 1) +
            '">✕</button></td></tr>'
          );
        })
        .join('') +
      '</tbody></table>';
  }
  return (
    '<div class="aso-lab" id="' +
    id +
    '">' +
    tabs +
    '<div class="aso-lab__grid"><div class="aso-lab__input">' +
    '<div class="aso-tabel-wrap">' +
    rows +
    '</div>' +
    '<button type="button" class="btn btn--ghost btn--small" data-lab-add>+ Tambah baris</button>' +
    '</div><div class="aso-lab__hasil" aria-live="polite">' +
    labHasilHTML(st, opts) +
    '</div></div></div>'
  );
}

/*
 * Memasang interaksi lab. Isian disimpan setiap diketik dan hanya panel
 * hasil yang dihitung ulang (fokus isian tidak hilang); tambah/hapus
 * baris dan ganti mode merender ulang lab lewat `rerender`.
 */
function bindClassDataLab(root, id, st, opts, save, rerender) {
  var el = root.querySelector('#' + id);
  if (!el) return;
  var hasil = el.querySelector('.aso-lab__hasil');
  function segarkanHasil() {
    if (!hasil) return;
    hasil.innerHTML = labHasilHTML(st, opts);
    pasangTren();
  }
  function pasangTren() {
    var tren = el.querySelector('[data-lab-tren]');
    if (tren) {
      tren.addEventListener('change', function () {
        st.tren = tren.checked;
        save();
        segarkanHasil();
        var t = el.querySelector('[data-lab-tren]');
        if (t) t.focus();
      });
    }
  }
  el.querySelectorAll('[data-lab-mode]').forEach(function (b) {
    b.addEventListener('click', function () {
      st.mode = b.dataset.labMode;
      save();
      rerender();
    });
  });
  el.querySelectorAll('[data-lab-row]').forEach(function (inp) {
    var list = st.mode === 'kategori' ? st.kategori : st.numerik;
    var row = list[+inp.dataset.labRow];
    function ubah() {
      if (row[inp.dataset.labCol] === inp.value) return;
      row[inp.dataset.labCol] = inp.value;
      save();
      segarkanHasil();
    }
    inp.addEventListener('input', ubah);
    inp.addEventListener('change', ubah);
  });
  el.querySelectorAll('[data-lab-del]').forEach(function (b) {
    b.addEventListener('click', function () {
      labHapusBaris(st, +b.dataset.labDel);
      save();
      rerender();
    });
  });
  var add = el.querySelector('[data-lab-add]');
  if (add) {
    add.addEventListener('click', function () {
      labTambahBaris(st);
      save();
      rerender();
    });
  }
  pasangTren();
}

/* ============================================================
   34. BILANGAN BULAT: MEMBANDINGKAN & MENGURUTKAN DALAM KONTEKS
   Pengurutan naik/turun, kata perbandingan per tema konteks
   (lebih dingin, lebih dalam, lebih bawah, …) berdasar
   KONTEKS_BULAT seksi 29, diagnosa miskonsepsi saat memilih
   lambang <, >, = (mengabaikan tanda negatif, menganggap nol
   paling kecil), serta rentang garis bilangan yang memuat
   semua bilangan pada satu soal.
   ============================================================ */

/* Salinan terurut; arah 'naik' (default, terkecil dulu) atau 'turun'. */
function urutkanBulat(arr, arah) {
  var out = arr.slice().sort(function (a, b) {
    return a - b;
  });
  return arah === 'turun' ? out.reverse() : out;
}

/* Id item { id, value } dalam urutan nilai naik/turun. */
function urutanIdBulat(items, arah) {
  var out = items.slice().sort(function (a, b) {
    return a.value - b.value;
  });
  if (arah === 'turun') out.reverse();
  return out.map(function (it) {
    return it.id;
  });
}

/*
 * Kata perbandingan per tema KONTEKS_BULAT. `kecil` menjelaskan bilangan
 * yang lebih kecil (di kiri pada garis bilangan), `besar` yang lebih
 * besar. Tema laut memakai `bawah` bila kedua bilangan berada di atau di
 * bawah permukaan laut (kedalaman: lebih dalam / lebih dangkal).
 */
var KATA_BANDING = {
  suhu: {
    kecil: 'lebih dingin',
    besar: 'lebih hangat',
    sama: 'sama suhunya',
    terkecil: 'paling dingin',
    terbesar: 'paling hangat',
  },
  gedung: {
    kecil: 'lebih bawah',
    besar: 'lebih atas',
    sama: 'di lantai yang sama',
    terkecil: 'paling bawah',
    terbesar: 'paling atas',
  },
  laut: {
    kecil: 'lebih rendah',
    besar: 'lebih tinggi',
    sama: 'sama tingginya',
    terkecil: 'paling rendah',
    terbesar: 'paling tinggi',
    bawah: {
      kecil: 'lebih dalam',
      besar: 'lebih dangkal',
      sama: 'sama dalamnya',
      terkecil: 'paling dalam',
      terbesar: 'paling dangkal',
    },
  },
  uang: {
    kecil: 'lebih sedikit',
    besar: 'lebih banyak',
    sama: 'sama banyaknya',
    terkecil: 'paling sedikit',
    terbesar: 'paling banyak',
  },
  skor: {
    kecil: 'lebih rendah',
    besar: 'lebih tinggi',
    sama: 'sama besarnya',
    terkecil: 'paling rendah',
    terbesar: 'paling tinggi',
  },
};

/* 'kecil' bila a < b, 'besar' bila a > b, 'sama' bila a = b. */
function idMaknaBanding(a, b) {
  if (a < b) return 'kecil';
  if (a > b) return 'besar';
  return 'sama';
}

/* Kamus kata untuk pasangan (a, b) pada tema tertentu. */
function kataBandingUntuk(tema, a, b) {
  var K = KATA_BANDING[tema] || KATA_BANDING.skor;
  if (K.bawah && typeof a === 'number' && typeof b === 'number' && a <= 0 && b <= 0) {
    return K.bawah;
  }
  return K;
}

/* Frasa makna a terhadap b, mis. maknaBanding(−8, −3, 'suhu') → 'lebih dingin'. */
function maknaBanding(a, b, tema) {
  return kataBandingUntuk(tema, a, b)[idMaknaBanding(a, b)];
}

/* Opsi { id, label } kecil/besar/sama untuk diacak (ensureShuffledOrder). */
function opsiMaknaBanding(tema, a, b) {
  var K = kataBandingUntuk(tema, a, b);
  return [
    { id: 'kecil', label: K.kecil },
    { id: 'besar', label: K.besar },
    { id: 'sama', label: K.sama },
  ];
}

/*
 * Diagnosa lambang pilihan murid untuk kalimat a ☐ b:
 *   'benar'        lambang tepat
 *   'nolTerkecil'  menganggap 0 lebih kecil daripada bilangan negatif
 *   'abaikanTanda' jawaban cocok dengan membandingkan angkanya saja
 *                  (−8 > −3 karena 8 > 3)
 *   'terbalik'     kesalahan arah lainnya
 */
function diagnosaBanding(a, b, symbolId) {
  if (symbolId === compareSymbolId(a, b)) return 'benar';
  if ((a === 0 && b < 0 && symbolId === 'lt') || (b === 0 && a < 0 && symbolId === 'gt')) {
    return 'nolTerkecil';
  }
  if ((a < 0 || b < 0) && symbolId === compareSymbolId(Math.abs(a), Math.abs(b))) {
    return 'abaikanTanda';
  }
  return 'terbalik';
}

/* Umpan balik HTML untuk hasil diagnosaBanding. */
function pesanBanding(diag, a, b) {
  var fa = '<strong>' + formatNumber(a, '−') + '</strong>';
  var fb = '<strong>' + formatNumber(b, '−') + '</strong>';
  var benar = compareSymbolText(compareSymbolId(a, b));
  var letak =
    a === b
      ? fa + ' dan ' + fb + ' menempati titik yang sama'
      : fa + ' berada di sebelah ' + (a < b ? 'kiri' : 'kanan') + ' ' + fb;
  if (diag === 'benar') {
    return (
      'Tepat! ' +
      fa +
      ' ' +
      esc(benar) +
      ' ' +
      fb +
      ' karena pada garis bilangan ' +
      letak +
      '. Makin ke kanan, makin besar.'
    );
  }
  if (diag === 'nolTerkecil') {
    return (
      'Nol bukan bilangan terkecil. Bandingkan ' +
      fa +
      ' dan ' +
      fb +
      ': bilangan negatif berada di sebelah kiri 0, jadi lebih kecil daripada 0.'
    );
  }
  if (diag === 'abaikanTanda') {
    return (
      'Sepertinya kamu hanya membandingkan angkanya tanpa tanda negatif. Pada garis bilangan, ' +
      letak +
      '. Untuk bilangan negatif, angka yang tampak lebih besar justru letaknya lebih ke kiri — lebih kecil.'
    );
  }
  return (
    'Belum tepat. Cari letak ' +
    fa +
    ' dan ' +
    fb +
    ' pada garis bilangan: yang berada di sebelah kiri adalah bilangan yang lebih kecil.'
  );
}

/*
 * Rentang garis bilangan { min, max } yang memuat semua `values` dengan
 * tepi `pad` (default 2) dan selalu memuat 0 di bagian dalam garis.
 */
function rentangGaris(values, pad) {
  var p = typeof pad === 'number' ? pad : 2;
  var lo = Math.min.apply(null, values);
  var hi = Math.max.apply(null, values);
  return { min: Math.min(lo - p, -p), max: Math.max(hi + p, p) };
}

/* ============================================================
   35. PECAHAN DALAM KONTEKS SEHARI-HARI — MEMBACA & MENULISKAN
   Dipakai modul membaca & menuliskan bilangan rasional (pecahan)
   dalam kehidupan sehari-hari (fase-d/mpi-1.3). Memakai ulang seksi
   10 (bacaPecahan, buildFracBlock, buildFractionInput,
   readFractionInput), seksi 16 (mixedToImproper), seksi 14
   (pecahanSetara), dan seksi 29 (normalisasiBacaan).

   Pecahan ditulis sebagai objek { num, den, whole, neg }:
     num/den  pembilang & penyebut (bilangan cacah, den > 0)
     whole    bilangan bulat pecahan campuran (null/0 bila tidak ada)
     neg      true untuk pecahan negatif
   Isinya:
     • tulisPecahan / bacaPecahanKonteks — notasi & cara baca baku
       ("negatif dua satu per empat");
     • parseTeksPecahan / periksaTeksPecahan — isian teks "3/4",
       "2 1/2", "-3/4";
     • cekCaraBacaPecahan — memeriksa cara baca yang diketik murid
       beserta miskonsepsinya (terbalik, tanpa "per", "dari", lupa
       bilangan bulat, "minus", …); sebutan sehari-hari (setengah,
       seperempat, tiga perempat) diterima dengan catatan bentuk baku;
     • opsiCaraBacaPecahan / opsiNotasiPecahan — pilihan cara baca &
       notasi (benar + pengecoh khas);
     • diagnosaTulisPecahan — memeriksa notasi yang ditulis murid
       (terbalik, menulis bagian tersisa, bagian-per-sisa, lupa
       bilangan bulat, senilai tetapi bukan yang diminta, tanda);
     • makePecahanStep / periksaPecahanStep / buildPecahanStep /
       bindPecahanStep — langkah isian (bersusun atau teks) dengan
       umpan balik diagnosa;
     • buildPecahanTampil — pecahan bersusun bertanda untuk tampilan;
     • pengarsir pecahan (buildFracShader & kawan-kawan) — murid
       memilih banyak bagian sama besar lalu mengetuk bagian yang
       diarsir.
   Gaya .frac-shader*, .frac-signed*, .frac-input__sign ada di
   shared/base.css.
   ============================================================ */

/* Notasi baku: { num: 1, den: 4, whole: 1, neg: true } → "−1 1/4". */
function tulisPecahan(p) {
  return (p.neg ? '−' : '') + (p.whole ? p.whole + ' ' : '') + p.num + '/' + p.den;
}

/* Cara baca baku tanpa tanda: "dua satu per empat". */
function bacaBesaranPecahan(p) {
  return bacaPecahan(p.num, p.den, p.whole || null);
}

/* Cara baca baku lengkap: tanda − dibaca "negatif" lebih dulu. */
function bacaPecahanKonteks(p) {
  return (p.neg ? 'negatif ' : '') + bacaBesaranPecahan(p);
}

/*
 * Mengurai isian teks pecahan: "3/4", "2 1/2", "-3/4", "−1 1/4"
 * (spasi di sekitar "/" diabaikan). Mengembalikan { value, error }:
 *   error null | 'kosong' | 'format' | 'nol-penyebut'
 */
function parseTeksPecahan(str) {
  var s = String(str == null ? '' : str).trim();
  if (!s) return { value: null, error: 'kosong' };
  s = s
    .replace(/[−–]/g, '-')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ');
  var m = /^([+-])? ?(?:(\d{1,4}) )?(\d{1,4})\/(\d{1,4})$/.exec(s);
  if (!m) return { value: null, error: 'format' };
  var value = {
    num: parseInt(m[3], 10),
    den: parseInt(m[4], 10),
    whole: m[2] ? parseInt(m[2], 10) : null,
    neg: m[1] === '-',
  };
  return { value: value, error: value.den === 0 ? 'nol-penyebut' : null };
}

var PESAN_BACA_PECAHAN = {
  kosong: 'Ketik cara membaca pecahan itu terlebih dahulu.',
  terbalik:
    'Urutannya terbalik. Yang dibaca lebih dulu adalah <strong>pembilang</strong> (angka di atas), baru kemudian "per" dan <strong>penyebut</strong> (angka di bawah).',
  'tanpa-per':
    'Ada kata yang hilang. Di antara pembilang dan penyebut, garis pecahan dibaca <strong>"per"</strong>.',
  penghubung:
    'Maknanya mendekati, tetapi cara baca baku garis pecahan adalah kata <strong>"per"</strong> — bukan "dari", "bagi", atau "banding".',
  'lupa-bulat':
    'Ini pecahan campuran. Bilangan bulatnya ikut dibaca, dan dibaca <strong>lebih dulu</strong> sebelum pecahannya.',
  'urutan-campuran':
    'Pada pecahan campuran, bilangan bulat ditulis di kiri, jadi dibaca <strong>lebih dulu</strong>, baru pecahannya.',
  'angka-salah':
    'Angkanya belum tepat. Baca pembilang (atas) dan penyebut (bawah) masing-masing sebagai satu bilangan utuh.',
  minus:
    'Bentuknya benar, tetapi "minus" adalah nama operasi pengurangan. Tanda − di depan bilangan dibaca <strong>negatif</strong>.',
  'urutan-terbalik':
    'Tanda − ditulis di depan, jadi kata "negatif" juga dibaca <strong>lebih dulu</strong>.',
  'lupa-negatif': 'Pecahan ini bertanda negatif. Jangan lupa membaca tandanya: "negatif …".',
  'tanda-terbalik': 'Perhatikan tandanya lagi: apakah pecahan ini positif atau negatif?',
  plus: 'Pecahan positif dibaca angkanya saja, atau dengan kata <strong>positif</strong> — bukan "plus".',
};

/* Peta bentuk bacaan (tanpa tanda) → kode, untuk pecahan p. */
function bentukBacaPecahan(p) {
  var W = p.whole ? terbilang(p.whole) : '';
  var n = terbilang(p.num);
  var d = terbilang(p.den);
  var peta = {};
  function add(teks, kode) {
    if (!Object.prototype.hasOwnProperty.call(peta, teks)) peta[teks] = kode;
  }
  function pre(x) {
    return W ? W + ' ' + x : x;
  }
  var baku = n + ' per ' + d;
  add(pre(baku), 'benar');
  if (W) add(W + ' dan ' + baku, 'benar');
  var sehari = [];
  if (p.num === 1) sehari.push('seper' + d);
  if (p.num === 1 && p.den === 2) sehari.push('setengah');
  sehari.push(n + ' per' + d);
  sehari.forEach(function (f) {
    add(pre(f), 'sehari');
    if (W) add(W + ' dan ' + f, 'sehari');
  });
  if (p.num !== p.den) add(pre(d + ' per ' + n), 'terbalik');
  add(pre(n + ' ' + d), 'tanpa-per');
  ['dari', 'bagi', 'banding', 'dibagi'].forEach(function (k) {
    add(pre(n + ' ' + k + ' ' + d), 'penghubung');
  });
  if (W) {
    add(baku, 'lupa-bulat');
    add(baku + ' ' + W, 'urutan-campuran');
  }
  return peta;
}

/*
 * Memeriksa cara baca yang diketik murid untuk pecahan p.
 * Mengembalikan { benar, kode, pesan }; kode 'benar' | 'sehari' (benar,
 * sebutan sehari-hari) | 'kosong' | 'terbalik' | 'tanpa-per' |
 * 'penghubung' | 'lupa-bulat' | 'urutan-campuran' | 'angka-salah' |
 * 'minus' | 'urutan-terbalik' | 'lupa-negatif' | 'tanda-terbalik' | 'plus'.
 */
function cekCaraBacaPecahan(teks, p) {
  var baku = bacaPecahanKonteks(p);
  function hasil(kode) {
    if (kode === 'benar') {
      return { benar: true, kode: kode, pesan: 'Tepat! Dibaca "' + baku + '".' };
    }
    if (kode === 'sehari') {
      return {
        benar: true,
        kode: kode,
        pesan:
          'Benar, itu sebutan sehari-hari. Cara baca bakunya: "<strong>' +
          esc(baku) +
          '</strong>".',
      };
    }
    return { benar: false, kode: kode, pesan: PESAN_BACA_PECAHAN[kode] };
  }
  var t = normalisasiBacaan(teks).replace(/\bse per /g, 'seper');
  if (!t) return hasil('kosong');

  var tanda = '';
  var sisa = t;
  var m = /^(negatif|minus|min|positif|plus) (.+)$/.exec(t);
  if (m) {
    tanda = m[1] === 'min' ? 'minus' : m[1];
    sisa = m[2];
  }
  var tandaBelakang = false;
  if (!tanda && / negatif$/.test(sisa)) {
    tandaBelakang = true;
    sisa = sisa.replace(/ negatif$/, '');
  }

  var peta = bentukBacaPecahan(p);
  var kode = Object.prototype.hasOwnProperty.call(peta, sisa) ? peta[sisa] : 'angka-salah';
  var bentukOk = kode === 'benar' || kode === 'sehari';

  if (p.neg) {
    if (tanda === 'positif' || tanda === 'plus') return hasil('tanda-terbalik');
    if (!bentukOk) return hasil(kode);
    if (tanda === 'negatif') return hasil(kode);
    if (tanda === 'minus') return hasil('minus');
    if (tandaBelakang) return hasil('urutan-terbalik');
    return hasil('lupa-negatif');
  }
  if (tanda === 'negatif' || tanda === 'minus' || tandaBelakang) return hasil('tanda-terbalik');
  if (!bentukOk) return hasil(kode);
  if (tanda === 'plus') return hasil('plus');
  return hasil(kode);
}

/*
 * Pilihan cara baca untuk pecahan p: satu benar (id 'baku') dan tiga
 * pengecoh khas — terbalik, tanpa "per", serta "minus" (pecahan
 * negatif) / bulat di belakang (pecahan campuran) / "dari" (lainnya).
 * Urutan wajar; app.js mengacaknya (ensureShuffledOrder).
 * Setiap opsi: { id, label, benar, umpan }.
 */
function opsiCaraBacaPecahan(p) {
  var W = p.whole ? terbilang(p.whole) : '';
  var n = terbilang(p.num);
  var d = terbilang(p.den);
  var tanda = p.neg ? 'negatif ' : '';
  function pre(x) {
    return W ? W + ' ' + x : x;
  }
  var baku = bacaPecahanKonteks(p);
  var opsi = [
    {
      id: 'baku',
      label: baku,
      benar: true,
      umpan: 'Tepat! ' + tulisPecahan(p) + ' dibaca "' + baku + '".',
    },
    {
      id: 'terbalik',
      label: tanda + pre(d + ' per ' + n),
      benar: false,
      umpan: PESAN_BACA_PECAHAN.terbalik,
    },
    {
      id: 'tanpa-per',
      label: tanda + pre(n + ' ' + d),
      benar: false,
      umpan: PESAN_BACA_PECAHAN['tanpa-per'],
    },
  ];
  if (p.neg) {
    opsi.push({
      id: 'minus',
      label: 'minus ' + bacaBesaranPecahan(p),
      benar: false,
      umpan: PESAN_BACA_PECAHAN.minus,
    });
  } else if (W) {
    opsi.push({
      id: 'urutan-campuran',
      label: n + ' per ' + d + ' ' + W,
      benar: false,
      umpan: PESAN_BACA_PECAHAN['urutan-campuran'],
    });
  } else {
    opsi.push({
      id: 'penghubung',
      label: n + ' dari ' + d,
      benar: false,
      umpan: PESAN_BACA_PECAHAN.penghubung,
    });
  }
  return opsi;
}

var PESAN_TULIS_PECAHAN = {
  kosong: 'Isi pembilang dan penyebutnya terlebih dahulu.',
  format: 'Tulis pecahan dengan garis miring, misalnya 3/4 atau 2 1/2.',
  'nol-penyebut':
    'Penyebut tidak boleh 0. Penyebut menunjukkan menjadi berapa bagian sama besar satu benda utuh dibagi.',
  terbalik:
    'Letaknya tertukar. <strong>Pembilang</strong> (atas) = banyak bagian yang diambil/diarsir; <strong>penyebut</strong> (bawah) = banyak seluruh bagian sama besar.',
  komplemen:
    'Kamu menulis bagian yang <strong>tersisa</strong> (tidak diambil/tidak diarsir). Baca lagi: bagian mana yang ditanyakan?',
  'bagian-per-sisa':
    'Penyebut bukan banyak bagian yang tersisa, melainkan banyak <strong>seluruh</strong> bagian sama besar.',
  'lupa-bulat':
    'Masih ada benda yang utuh. Tuliskan banyak benda utuh sebagai <strong>bilangan bulat</strong> di sebelah kiri pecahan.',
  senilai:
    'Nilainya sama, tetapi tuliskan sesuai yang diamati: pembilang = banyak bagian yang diambil, penyebut = banyak seluruh bagian (dan benda utuh sebagai bilangan bulat).',
  'lupa-negatif':
    'Angkanya tepat, tetapi keadaan ini berada di bawah titik acuan (nol). Beri tanda <strong>−</strong> di depan pecahan.',
  'tanda-lebih':
    'Angkanya tepat, tetapi keadaan ini tidak berada di bawah titik acuan, jadi tidak perlu tanda −.',
  salah:
    'Belum tepat. Hitung lagi: ada berapa bagian sama besar seluruhnya (penyebut), dan berapa bagian yang diambil (pembilang)?',
};

/*
 * Pilihan notasi untuk pecahan p (mis. dari dikte): satu benar (id
 * 'baku') dan tiga pengecoh khas —
 *   semua bentuk      'terbalik'   pembilang & penyebut tertukar
 *   pecahan negatif   'tanpa-tanda', 'tanda-belakang' (3/4−)
 *   pecahan campuran  'lupa-bulat', 'digabung' (1 3/4 → 13/4)
 *   pecahan biasa     'komplemen' (bagian tersisa) atau 'tanpa-garis'
 *                     (34), serta 'koma' (3,4)
 * Urutan wajar; app.js mengacaknya. Setiap opsi: { id, label, benar, umpan }.
 */
function opsiNotasiPecahan(p) {
  var tanda = p.neg ? '−' : '';
  var W = p.whole || 0;
  function tulis(num, den, whole) {
    return tanda + (whole ? whole + ' ' : '') + num + '/' + den;
  }
  var opsi = [
    {
      id: 'baku',
      label: tulisPecahan(p),
      benar: true,
      umpan: 'Tepat! "' + bacaPecahanKonteks(p) + '" ditulis ' + tulisPecahan(p) + '.',
    },
    {
      id: 'terbalik',
      label: tulis(p.den, p.num, W),
      benar: false,
      umpan: PESAN_TULIS_PECAHAN.terbalik,
    },
  ];
  function tambah(id, label, umpan) {
    opsi.push({ id: id, label: label, benar: false, umpan: umpan });
  }
  if (p.neg) {
    tambah(
      'tanpa-tanda',
      tulisPecahan({ num: p.num, den: p.den, whole: W, neg: false }),
      'Kata "negatif" ditulis sebagai tanda − di depan pecahan. Tanpa tanda, pecahan ini menjadi positif.'
    );
    tambah(
      'tanda-belakang',
      tulisPecahan({ num: p.num, den: p.den, whole: W, neg: false }) + '−',
      'Tanda − ditulis di <strong>depan</strong> pecahan, bukan di belakang.'
    );
  } else if (W) {
    tambah('lupa-bulat', p.num + '/' + p.den, PESAN_TULIS_PECAHAN['lupa-bulat']);
    if (p.den === 10) {
      tambah(
        'bulat-kanan',
        p.num + '/' + p.den + ' ' + W,
        'Bilangan bulat pecahan campuran ditulis di <strong>kiri</strong> pecahan.'
      );
    } else {
      tambah(
        'digabung',
        '' + W + p.num + '/' + p.den,
        'Bilangan bulat dan pembilang tidak digabung menjadi satu bilangan. Beri jarak: bilangan bulat di kiri, lalu pecahannya.'
      );
    }
  } else {
    var sisa = p.den - p.num;
    if (sisa > 0 && sisa !== p.num) {
      tambah('komplemen', sisa + '/' + p.den, PESAN_TULIS_PECAHAN.komplemen);
    } else {
      tambah(
        'tanpa-garis',
        '' + p.num + p.den,
        'Tanpa garis pecahan, tulisan itu terbaca sebagai bilangan bulat. Pembilang dan penyebut dipisah garis pecahan.'
      );
    }
    tambah(
      'koma',
      p.num + ',' + p.den,
      'Tanda koma dipakai untuk bilangan desimal. Pecahan ditulis dengan <strong>garis pecahan</strong>: pembilang di atas, penyebut di bawah.'
    );
  }
  return opsi;
}

/*
 * Memeriksa notasi pecahan yang ditulis murid (v, mis. dari
 * readFractionInput atau parseTeksPecahan) terhadap jawaban p.
 * Notasi harus sama persis dengan yang diamati (bukan sekadar senilai).
 * Mengembalikan { benar, kode, pesan }; kode 'benar' | 'nol-penyebut' |
 * 'lupa-negatif' | 'tanda-lebih' | 'terbalik' | 'lupa-bulat' |
 * 'komplemen' | 'bagian-per-sisa' | 'senilai' | 'salah'.
 */
function diagnosaTulisPecahan(v, p) {
  function hasil(kode) {
    if (kode === 'benar') {
      return {
        benar: true,
        kode: kode,
        pesan: 'Tepat! Ditulis ' + tulisPecahan(p) + ', dibaca "' + bacaPecahanKonteks(p) + '".',
      };
    }
    return { benar: false, kode: kode, pesan: PESAN_TULIS_PECAHAN[kode] };
  }
  var vw = v.whole || 0;
  var pw = p.whole || 0;
  var vNeg = !!v.neg;
  var pNeg = !!p.neg;
  if (v.den === 0) return hasil('nol-penyebut');
  if (vw === pw && v.num === p.num && v.den === p.den) {
    if (vNeg === pNeg) return hasil('benar');
    return hasil(pNeg ? 'lupa-negatif' : 'tanda-lebih');
  }
  if (vw === pw && v.num === p.den && v.den === p.num) return hasil('terbalik');
  if (pw && !vw && v.num === p.num && v.den === p.den) return hasil('lupa-bulat');
  if (!pw && !vw) {
    var sisa = p.den - p.num;
    if (v.den === p.den && v.num === sisa && sisa !== p.num) return hasil('komplemen');
    if (v.num === p.num && sisa > 0 && v.den === sisa) return hasil('bagian-per-sisa');
  }
  if (
    vNeg === pNeg &&
    pecahanSetara(mixedToImproper(vw, v.num, v.den), mixedToImproper(pw, p.num, p.den))
  ) {
    return hasil('senilai');
  }
  return hasil('salah');
}

/* Isian teks → parseTeksPecahan → diagnosaTulisPecahan. */
function periksaTeksPecahan(str, p) {
  var r = parseTeksPecahan(str);
  if (r.error) return { benar: false, kode: r.error, pesan: PESAN_TULIS_PECAHAN[r.error] };
  return diagnosaTulisPecahan(r.value, p);
}

/*
 * Pecahan bersusun bertanda untuk tampilan (tanda − di kiri), dengan
 * label aksesibel cara baca baku.
 */
function buildPecahanTampil(p, size) {
  return (
    '<span class="frac-signed" role="img" aria-label="' +
    esc(bacaPecahanKonteks(p)) +
    '"><span aria-hidden="true" class="frac-signed__inner">' +
    (p.neg ? '<span class="frac-signed__sign">−</span>' : '') +
    buildFracBlock(p.num, p.den, p.whole || null, size) +
    '</span></span>'
  );
}

/* State default langkah isian pecahan. */
function makePecahanStep() {
  return {
    input: '',
    raw: null,
    done: false,
    kode: null,
    pesan: '',
    attempts: 0,
    hintLevel: 0,
  };
}

/* Teks isian bersusun untuk umpan balik: { sign, whole, num, den } → "−1 3/4". */
function teksRawPecahan(raw) {
  if (!raw) return '';
  return (
    (raw.sign === '-' ? '−' : '') +
    (raw.whole ? raw.whole + ' ' : '') +
    (raw.num || '?') +
    '/' +
    (raw.den || '?')
  );
}

/*
 * Memeriksa isian langkah dan menyimpan hasilnya ke st.
 *   step.jenis 'baca'  → input berupa teks, cekCaraBacaPecahan
 *   step.jenis 'tulis' → input berupa hasil readFractionInput,
 *                        diagnosaTulisPecahan
 * Isian kosong tidak dihitung sebagai percobaan.
 */
function periksaPecahanStep(st, step, input) {
  var r;
  if (step.jenis === 'baca') {
    st.input = String(input || '').trim();
    r = cekCaraBacaPecahan(input, step.jawab);
  } else {
    st.raw = input.raw;
    st.input = teksRawPecahan(input.raw);
    if (input.error === 'empty') {
      r = { benar: false, kode: 'kosong', pesan: PESAN_TULIS_PECAHAN.kosong };
    } else if (input.error === 'invalid') {
      r = {
        benar: false,
        kode: 'format',
        pesan: 'Isi setiap kotak hanya dengan angka (bilangan cacah).',
      };
    } else {
      r = diagnosaTulisPecahan(input.value, step.jawab);
    }
  }
  st.kode = r.kode;
  st.pesan = r.pesan;
  if (r.kode === 'kosong') return r;
  st.attempts += 1;
  st.done = r.benar;
  return r;
}

/*
 * Satu langkah isian pecahan dengan umpan balik diagnosa.
 *   id    awalan id DOM (→ idFrac…, idInput, idCheck, idHint)
 *   step  { jenis: 'tulis'|'baca', jawab, label, hints, temuan,
 *           mixed, signed, satuan, placeholder }
 *   num   nomor langkah opsional
 */
function buildPecahanStep(id, st, step, num) {
  var head =
    '<p class="dl-step__label">' +
    (num ? '<span class="dl-step__num">' + num + '</span>' : '') +
    step.label +
    '</p>';
  var baca = step.jenis === 'baca';
  if (st.done) {
    return (
      '<div class="dl-step dl-step--done">' +
      head +
      '<p class="dl-step__answer">✓ ' +
      (baca
        ? '"' + esc(bacaPecahanKonteks(step.jawab)) + '"'
        : buildPecahanTampil(step.jawab, 'small')) +
      (step.satuan && !baca ? ' ' + esc(step.satuan) : '') +
      '</p>' +
      (baca && st.kode === 'sehari' ? buildFeedbackBox('info', 'ℹ️', st.pesan) : '') +
      (step.temuan ? buildFeedbackBox('success', '💡', step.temuan) : '') +
      '</div>'
    );
  }
  var salah = st.attempts > 0 && st.kode && st.kode !== 'benar' && st.kode !== 'kosong';
  var field = baca
    ? '<input type="text" class="input-text bbk-baca-input' +
      (salah ? ' has-error' : '') +
      '" id="' +
      id +
      'Input" inputmode="text" autocapitalize="off" spellcheck="false" autocomplete="off" value="' +
      esc(st.input || '') +
      '" aria-label="Cara membaca pecahan" placeholder="' +
      esc(step.placeholder || 'ketik cara bacanya…') +
      '">'
    : buildFractionInput(id + 'Frac', st.raw || {}, {
        mixed: step.mixed,
        signed: step.signed,
        status: salah ? 'bad' : '',
        aria: 'Pecahan',
      }) + (step.satuan ? '<span class="bbk-satuan">' + esc(step.satuan) + '</span>' : '');
  return (
    '<div class="dl-step">' +
    head +
    '<div class="dl-input-row pecahan-step__row">' +
    field +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    'Check">Periksa</button>' +
    buildHintToggle(id + 'Hint', step.hints, st.hintLevel) +
    '</div>' +
    (salah
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(
          'error',
          '✗',
          '<strong>' + esc(st.input || '') + '</strong> — ' + st.pesan
        ) +
        '</div>'
      : '') +
    buildHintStack(step.hints, st.hintLevel) +
    '</div>'
  );
}

/* Memasang event buildPecahanStep; `save` lalu `rerender` dipanggil setelah perubahan. */
function bindPecahanStep(id, st, step, save, rerender) {
  var btn = document.getElementById(id + 'Check');
  var hint = document.getElementById(id + 'Hint');
  var baca = step.jenis === 'baca';
  if (btn) {
    var fokus = function () {
      var el = document.getElementById(baca ? id + 'Input' : id + 'FracNum');
      if (el) el.focus();
    };
    btn.addEventListener('click', function () {
      var input = baca
        ? (document.getElementById(id + 'Input') || {}).value
        : readFractionInput(document, id + 'Frac');
      var r = periksaPecahanStep(st, step, input);
      if (r.kode === 'kosong') {
        showNotice(r.pesan);
        return;
      }
      save();
      rerender();
      if (!st.done) fokus();
    });
    var fields = baca
      ? [document.getElementById(id + 'Input')]
      : ['Sign', 'Whole', 'Num', 'Den'].map(function (s) {
          return document.getElementById(id + 'Frac' + s);
        });
    fields.forEach(function (el) {
      if (!el) return;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') btn.click();
      });
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, (step.hints || []).length);
      save();
      rerender();
    });
  }
}

/* ---------- Pengarsir pecahan ---------- */

var FRAC_SHADER_MAX = 12;

function batasBagianShader(den) {
  var d = Math.round(Number(den) || 1);
  return Math.min(FRAC_SHADER_MAX, Math.max(1, d));
}

function bagianKosong(den) {
  var on = [];
  for (var i = 0; i < den; i++) on.push(false);
  return on;
}

/*
 * Memastikan state[key] berupa { den, on: [bool × den] } yang sah. State
 * rusak dipulihkan: banyak bagian lama dipertahankan bila masih bulat,
 * arsiran dikosongkan.
 */
function ensureFracShaderState(state, key, denAwal) {
  var st = state[key];
  var sah =
    st &&
    typeof st === 'object' &&
    isBulat(st.den) &&
    st.den >= 1 &&
    st.den <= FRAC_SHADER_MAX &&
    Array.isArray(st.on) &&
    st.on.length === st.den;
  if (!sah) {
    var denLama = st && typeof st === 'object' && isBulat(st.den) ? st.den : null;
    var d = batasBagianShader(denLama || denAwal);
    state[key] = { den: d, on: bagianKosong(d) };
  }
  return state[key];
}

/* Mengubah banyak bagian sama besar (1 … FRAC_SHADER_MAX); arsiran dikosongkan. */
function fracShaderSetDen(st, den) {
  st.den = batasBagianShader(den);
  st.on = bagianKosong(st.den);
}

function fracShaderToggle(st, i) {
  if (i >= 0 && i < st.den) st.on[i] = !st.on[i];
}

/* { num: banyak bagian terarsir, den: banyak seluruh bagian }. */
function fracShaderValue(st) {
  return {
    num: st.on.filter(function (x) {
      return x;
    }).length,
    den: st.den,
  };
}

var PESAN_SHADER = {
  penyebut:
    'Periksa dulu banyak bagiannya. Penyebut menunjukkan benda dibagi menjadi berapa bagian sama besar.',
  komplemen:
    'Kamu mengarsir bagian yang tersisa. Pembilang menunjukkan banyak bagian yang <strong>diarsir</strong>.',
  pembilang:
    'Banyak bagiannya sudah tepat. Sekarang cocokkan banyak bagian yang diarsir dengan pembilangnya.',
};

/* Memeriksa arsiran terhadap pecahan biasa p: { benar, kode, pesan }. */
function cekFracShader(st, p) {
  var v = fracShaderValue(st);
  var kode;
  if (v.den !== p.den) kode = 'penyebut';
  else if (v.num === p.num) kode = 'benar';
  else if (v.num === p.den - p.num) kode = 'komplemen';
  else kode = 'pembilang';
  if (kode === 'benar') {
    return {
      benar: true,
      kode: kode,
      pesan:
        'Tepat! ' +
        v.num +
        ' dari ' +
        v.den +
        ' bagian sama besar diarsir: ' +
        tulisPecahan(p) +
        '.',
    };
  }
  return { benar: false, kode: kode, pesan: PESAN_SHADER[kode] };
}

/*
 * Pengarsir pecahan: pita yang bisa diatur banyak bagian sama besarnya
 * (tombol − / +) dan setiap bagiannya bisa diketuk untuk diarsir.
 *   opts.label   label aksesibel grup (default 'Pengarsir pecahan')
 *   opts.locked  true → tidak bisa diubah (setelah benar)
 */
function buildFracShader(id, st, opts) {
  opts = opts || {};
  var dis = opts.locked ? ' disabled' : '';
  var v = fracShaderValue(st);
  var cells = '';
  for (var i = 0; i < st.den; i++) {
    cells +=
      '<button type="button" class="frac-shader__cell' +
      (st.on[i] ? ' is-on' : '') +
      '" data-shader-cell="' +
      i +
      '" aria-pressed="' +
      (st.on[i] ? 'true' : 'false') +
      '" aria-label="Bagian ' +
      (i + 1) +
      ' dari ' +
      st.den +
      '"' +
      dis +
      '></button>';
  }
  return (
    '<div class="frac-shader" id="' +
    id +
    '" role="group" aria-label="' +
    esc(opts.label || 'Pengarsir pecahan') +
    '">' +
    '<div class="frac-shader__ctrl">' +
    '<button type="button" class="btn btn--ghost btn--small frac-shader__step" id="' +
    id +
    'Minus" aria-label="Kurangi banyak bagian"' +
    (opts.locked || st.den <= 1 ? ' disabled' : '') +
    '>−</button>' +
    '<span class="frac-shader__den" aria-live="polite">Dibagi <strong>' +
    st.den +
    '</strong> bagian sama besar</span>' +
    '<button type="button" class="btn btn--ghost btn--small frac-shader__step" id="' +
    id +
    'Plus" aria-label="Tambah banyak bagian"' +
    (opts.locked || st.den >= FRAC_SHADER_MAX ? ' disabled' : '') +
    '>+</button>' +
    '</div>' +
    '<div class="frac-shader__bar" style="grid-template-columns:repeat(' +
    st.den +
    ',1fr)">' +
    cells +
    '</div>' +
    '<p class="frac-shader__readout">Diarsir: <strong>' +
    v.num +
    '</strong> dari <strong>' +
    v.den +
    '</strong> bagian</p>' +
    '</div>'
  );
}

/* Memasang event buildFracShader; `save` lalu `rerender` dipanggil setelah perubahan. */
function bindFracShader(root, id, st, save, rerender) {
  var wrap = root.querySelector('#' + id);
  if (!wrap) return;
  function ubah(fn) {
    fn();
    save();
    rerender();
  }
  var minus = root.querySelector('#' + id + 'Minus');
  var plus = root.querySelector('#' + id + 'Plus');
  if (minus) {
    minus.addEventListener('click', function () {
      ubah(function () {
        fracShaderSetDen(st, st.den - 1);
      });
      var again = document.getElementById(id + 'Minus');
      if (again && !again.disabled) again.focus();
    });
  }
  if (plus) {
    plus.addEventListener('click', function () {
      ubah(function () {
        fracShaderSetDen(st, st.den + 1);
      });
      var again = document.getElementById(id + 'Plus');
      if (again && !again.disabled) again.focus();
    });
  }
  wrap.querySelectorAll('[data-shader-cell]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.shaderCell, 10);
      ubah(function () {
        fracShaderToggle(st, i);
      });
      var again = document.querySelector('#' + id + ' [data-shader-cell="' + i + '"]');
      if (again) again.focus();
    });
  });
}

/* ============================================================
   36. PECAHAN: MEMBANDINGKAN & MENGURUTKAN DALAM KONTEKS
   Dipakai modul membandingkan & mengurutkan bilangan rasional
   (pecahan) dalam kehidupan sehari-hari (fase-d/mpi-1.4). Memakai
   ulang seksi 11 (COMPARE_SYMBOLS, compareSymbolId/Text), seksi 15
   (compareFractions, buildFracNumberLine), seksi 35 (parseTeksPecahan,
   tulisPecahan, bacaPecahanKonteks, buildPecahanTampil), serta kpk.

   Pecahan boleh ditulis sebagai teks ("3/4", "−1 1/2") atau objek
   { num, den, whole, neg } seperti seksi 35. Isinya:
     • pecahanDari / pecahanBiasaBertanda — teks → objek → pecahan biasa
       bertanda { num, den };
     • bandingPecahan, simbolBandingPecahan, urutkanPecahan,
       urutanIdPecahan — perbandingan eksak (perkalian silang) dan
       pengurutan naik/turun;
     • STRATEGI_BANDING_PECAHAN — empat strategi "ahli" (penyebut sama,
       pembilang sama, patokan ½/1, samakan penyebut) yang juga
       berbentuk peran { id, ikon, nama, tugas } untuk
       coopRoleAssignment (Jigsaw); strategiBerlaku /
       strategiBandingPecahan / penjelasanStrategi;
     • diagnosaBandingPecahan / pesanBandingPecahan — miskonsepsi khas
       (penyebut besar = besar, pembilang sama = sama, membandingkan
       angka terpisah, "sama-sama kurang satu bagian", mengabaikan
       bilangan bulat, mengabaikan tanda negatif);
     • KATA_BANDING_PECAHAN — kata perbandingan per tema konteks;
     • garisPecahanRentang — ujung garis bilangan untuk sekumpulan
       pecahan;
     • buildKalimatBandingPecahan, buildPilihSimbolPecahan,
       bindPilihSimbolPecahan — kalimat [a] ☐ [b] dan tombol lambang
       <, >, = (urutan acak dari State) untuk pecahan.
   Gaya .cmp-sentence--frac & .strategi-* ada di shared/base.css.
   ============================================================ */

/* Teks atau objek → objek pecahan { num, den, whole, neg }. */
function pecahanDari(x) {
  if (x && typeof x === 'object') return x;
  var r = parseTeksPecahan(x);
  if (r.error) throw new Error('Pecahan tidak sah: ' + x);
  return r.value;
}

/* Pecahan biasa bertanda: "−1 1/2" → { num: −3, den: 2 }. */
function pecahanBiasaBertanda(x) {
  var p = pecahanDari(x);
  var n = (p.whole || 0) * p.den + p.num;
  return { num: p.neg ? -n : n, den: p.den };
}

/* −1 bila a < b, 0 bila a = b, 1 bila a > b (eksak). */
function bandingPecahan(a, b) {
  return compareFractions(pecahanBiasaBertanda(a), pecahanBiasaBertanda(b));
}

/* 'lt' | 'eq' | 'gt' — selaras dengan compareSymbolId seksi 11. */
function simbolBandingPecahan(a, b) {
  var c = bandingPecahan(a, b);
  return c < 0 ? 'lt' : c > 0 ? 'gt' : 'eq';
}

/* Salinan terurut berupa objek pecahan; arah 'naik' (default) atau 'turun'. */
function urutkanPecahan(list, arah) {
  var out = list.map(pecahanDari).sort(bandingPecahan);
  return arah === 'turun' ? out.reverse() : out;
}

/* Id item { id, p } dalam urutan nilai naik/turun. */
function urutanIdPecahan(items, arah) {
  var out = items.slice().sort(function (x, y) {
    return bandingPecahan(x.p, y.p);
  });
  if (arah === 'turun') out.reverse();
  return out.map(function (it) {
    return it.id;
  });
}

/* Teks pecahan tebal untuk umpan balik. */
function teksPecahanTebal(x) {
  return '<strong>' + esc(tulisPecahan(pecahanDari(x))) + '</strong>';
}

/* Kalimat "a ☐ b" tebal dengan lambang yang benar. */
function kalimatBandingPecahan(a, b) {
  return (
    teksPecahanTebal(a) +
    ' <strong>' +
    esc(compareSymbolText(simbolBandingPecahan(a, b))) +
    '</strong> ' +
    teksPecahanTebal(b)
  );
}

/*
 * Strategi membandingkan pecahan. Setiap strategi juga berbentuk peran
 * { id, ikon, nama, tugas } sehingga bisa dibagikan sebagai kartu ahli
 * (coopRoleAssignment(anggota, ronde, STRATEGI_BANDING_PECAHAN)).
 */
var STRATEGI_BANDING_PECAHAN = [
  {
    id: 'penyebutSama',
    ikon: '🟰',
    nama: 'Ahli Penyebut Sama',
    ringkas: 'Penyebut sama → bandingkan pembilangnya',
    tugas: 'Mengajarkan cara membandingkan pecahan yang penyebutnya sama.',
    kunci:
      'Jika penyebutnya sama, ukuran tiap bagian sama. Pecahan dengan pembilang lebih besar bernilai lebih besar.',
  },
  {
    id: 'pembilangSama',
    ikon: '✂️',
    nama: 'Ahli Pembilang Sama',
    ringkas: 'Pembilang sama → penyebut lebih kecil, bagian lebih besar',
    tugas: 'Mengajarkan cara membandingkan pecahan yang pembilangnya sama.',
    kunci:
      'Jika pembilangnya sama, banyak bagiannya sama. Penyebut lebih kecil berarti tiap bagian lebih besar, jadi pecahannya lebih besar.',
  },
  {
    id: 'patokan',
    ikon: '🎯',
    nama: 'Ahli Patokan',
    ringkas: 'Bandingkan dengan patokan 1/2 atau 1',
    tugas: 'Mengajarkan cara membandingkan pecahan dengan patokan 1/2 dan 1.',
    kunci:
      'Bandingkan setiap pecahan dengan patokan 1/2 atau 1. Pecahan yang berada di bawah patokan lebih kecil daripada pecahan di atas patokan.',
  },
  {
    id: 'samakanPenyebut',
    ikon: '🔁',
    nama: 'Ahli Samakan Penyebut',
    ringkas: 'Samakan penyebut dengan KPK, lalu bandingkan pembilangnya',
    tugas: 'Mengajarkan cara menyamakan penyebut dengan KPK sebelum membandingkan.',
    kunci:
      'Ubah kedua pecahan menjadi pecahan senilai berpenyebut KPK, lalu bandingkan pembilangnya. Cara ini selalu berhasil.',
  },
];

var STRATEGI_TANDA = {
  id: 'tanda',
  ikon: '➖',
  nama: 'Cek Tanda',
  ringkas: 'Negatif selalu lebih kecil daripada positif',
  tugas: 'Memeriksa tanda pecahan lebih dulu.',
  kunci: 'Pecahan negatif berada di kiri 0, jadi selalu lebih kecil daripada pecahan positif.',
};

function strategiBandingInfo(id) {
  if (id === 'tanda') return STRATEGI_TANDA;
  for (var i = 0; i < STRATEGI_BANDING_PECAHAN.length; i++) {
    if (STRATEGI_BANDING_PECAHAN[i].id === id) return STRATEGI_BANDING_PECAHAN[i];
  }
  return null;
}

/* Opsi { id, label } strategi ahli untuk diacak (ensureShuffledOrder). */
function opsiStrategiBanding() {
  return STRATEGI_BANDING_PECAHAN.map(function (s) {
    return {
      id: s.id,
      label:
        '<span aria-hidden="true">' +
        s.ikon +
        '</span> <strong>' +
        esc(s.nama) +
        '</strong> — ' +
        esc(s.ringkas),
    };
  });
}

/* Besaran (nilai mutlak) pecahan biasa. */
function besaranPecahan(v) {
  return { num: Math.abs(v.num), den: v.den };
}

/*
 * Patokan kelipatan ½ di antara dua besaran x ≠ y, atau null.
 * Mengembalikan h dengan patokan = h/2.
 */
function patokanSetengah(x, y) {
  if (compareFractions(x, y) === 0) return null;
  var lo = compareFractions(x, y) < 0 ? x : y;
  var hi = lo === x ? y : x;
  var h = Math.floor((2 * hi.num) / hi.den);
  return h >= Math.ceil((2 * lo.num) / lo.den) ? h : null;
}

/* Teks patokan h/2: 1/2, 1, 1 1/2, 2, … */
function teksPatokan(h) {
  if (h % 2 === 0) return String(h / 2);
  return (h > 1 ? (h - 1) / 2 + ' ' : '') + '1/2';
}

/*
 * Strategi yang dapat dipakai untuk membandingkan a dan b, terurut dari
 * yang paling cepat. 'samakanPenyebut' selalu berlaku. Penyebut/pembilang
 * sama hanya dilihat pada pecahan biasa (bukan campuran) sebagaimana
 * tertulis; dua pecahan negatif dinilai dari besarannya.
 */
function strategiBerlaku(a, b) {
  var pa = pecahanDari(a);
  var pb = pecahanDari(b);
  var va = pecahanBiasaBertanda(pa);
  var vb = pecahanBiasaBertanda(pb);
  if (va.num < 0 !== vb.num < 0) return ['tanda', 'samakanPenyebut'];
  var out = [];
  var biasa = !pa.whole && !pb.whole;
  if (biasa && pa.den === pb.den) out.push('penyebutSama');
  else if (biasa && pa.num === pb.num) out.push('pembilangSama');
  if (patokanSetengah(besaranPecahan(va), besaranPecahan(vb)) !== null) out.push('patokan');
  out.push('samakanPenyebut');
  return out;
}

function strategiBandingPecahan(a, b) {
  return strategiBerlaku(a, b)[0];
}

/* Penyebut disamakan dengan KPK: { kpk, a: {num, den}, b: {num, den} }. */
function samakanPenyebutPecahan(a, b) {
  var va = pecahanBiasaBertanda(a);
  var vb = pecahanBiasaBertanda(b);
  var k = kpk(va.den, vb.den);
  return {
    kpk: k,
    a: { num: (va.num * k) / va.den, den: k },
    b: { num: (vb.num * k) / vb.den, den: k },
  };
}

/* Penjelasan HTML cara strategi `id` memutuskan perbandingan a dan b. */
function penjelasanStrategi(id, a, b) {
  var pa = pecahanDari(a);
  var pb = pecahanDari(b);
  var va = pecahanBiasaBertanda(pa);
  var vb = pecahanBiasaBertanda(pb);
  var negatif = va.num < 0 && vb.num < 0;
  var catatanNeg = negatif
    ? ' Karena keduanya negatif, yang besarannya lebih besar justru letaknya lebih kiri — lebih kecil.'
    : '';
  var jadi = ' Jadi ' + kalimatBandingPecahan(a, b) + '.';
  if (id === 'tanda') {
    return (
      'Satu pecahan negatif dan satu tidak. Pecahan negatif berada di kiri 0, jadi selalu lebih kecil.' +
      jadi
    );
  }
  if (id === 'penyebutSama') {
    return (
      'Penyebutnya sama (' +
      pa.den +
      '), jadi ukuran tiap bagian sama. Cukup bandingkan pembilangnya: ' +
      pa.num +
      ' dan ' +
      pb.num +
      '.' +
      catatanNeg +
      jadi
    );
  }
  if (id === 'pembilangSama') {
    return (
      'Pembilangnya sama (' +
      pa.num +
      ' bagian). Penyebut lebih kecil berarti satu utuh dibagi lebih sedikit, sehingga tiap bagian lebih besar.' +
      catatanNeg +
      jadi
    );
  }
  if (id === 'patokan') {
    var x = besaranPecahan(va);
    var y = besaranPecahan(vb);
    var h = patokanSetengah(x, y);
    if (h === null) return penjelasanStrategi('samakanPenyebut', a, b);
    var m = { num: h, den: 2 };
    var rel = function (v) {
      return { '-1': 'kurang dari', 0: 'sama dengan', 1: 'lebih dari' }[compareFractions(v, m)];
    };
    return (
      'Pakai patokan <strong>' +
      teksPatokan(h) +
      '</strong>: ' +
      (negatif ? 'besaran ' : '') +
      teksPecahanTebal(pa.neg ? Object.assign({}, pa, { neg: false }) : pa) +
      ' ' +
      rel(x) +
      ' ' +
      teksPatokan(h) +
      ', sedangkan ' +
      teksPecahanTebal(pb.neg ? Object.assign({}, pb, { neg: false }) : pb) +
      ' ' +
      rel(y) +
      ' ' +
      teksPatokan(h) +
      '.' +
      catatanNeg +
      jadi
    );
  }
  var s = samakanPenyebutPecahan(a, b);
  return (
    'KPK dari ' +
    va.den +
    ' dan ' +
    vb.den +
    ' adalah ' +
    s.kpk +
    '. ' +
    teksPecahanTebal(a) +
    ' = ' +
    esc(formatNumber(s.a.num, '−')) +
    '/' +
    s.kpk +
    ' dan ' +
    teksPecahanTebal(b) +
    ' = ' +
    esc(formatNumber(s.b.num, '−')) +
    '/' +
    s.kpk +
    '. Bandingkan pembilangnya: ' +
    esc(formatNumber(s.a.num, '−')) +
    ' dan ' +
    esc(formatNumber(s.b.num, '−')) +
    '.' +
    jadi
  );
}

/*
 * Diagnosa lambang pilihan murid untuk kalimat a ☐ b:
 *   'benar'            lambang tepat
 *   'abaikanTanda'     cocok dengan membandingkan besarannya saja
 *                      (−3/4 > −1/2 karena 3/4 > 1/2)
 *   'selisihSisa'      memilih = karena "sama-sama kurang k bagian"
 *                      (3/4 = 5/6)
 *   'abaikanBulat'     cocok dengan membandingkan bagian pecahannya saja
 *                      (1 1/4 < 3/4 karena 1/4 < 3/4)
 *   'bandingAngka'     cocok dengan membandingkan pembilang DAN penyebut
 *                      sebagai bilangan bulat (3/8 > 2/5 karena 3 > 2, 8 > 5)
 *   'penyebutBesar'    menganggap penyebut lebih besar = pecahan lebih
 *                      besar (1/3 > 1/2 karena 3 > 2)
 *   'bandingPembilang' memilih = karena pembilangnya sama (2/5 = 2/7)
 *   'terbalik'         kesalahan arah lainnya
 */
function diagnosaBandingPecahan(a, b, symbolId) {
  if (symbolId === simbolBandingPecahan(a, b)) return 'benar';
  var pa = pecahanDari(a);
  var pb = pecahanDari(b);
  var va = pecahanBiasaBertanda(pa);
  var vb = pecahanBiasaBertanda(pb);
  if (va.num < 0 || vb.num < 0) {
    var abs = compareFractions(besaranPecahan(va), besaranPecahan(vb));
    return symbolId === (abs < 0 ? 'lt' : abs > 0 ? 'gt' : 'eq') ? 'abaikanTanda' : 'terbalik';
  }
  var biasa = !pa.whole && !pb.whole;
  if (
    symbolId === 'eq' &&
    biasa &&
    pa.num < pa.den &&
    pb.num < pb.den &&
    pa.den - pa.num === pb.den - pb.num
  ) {
    return 'selisihSisa';
  }
  if (!biasa) {
    var bag = compareFractions(pa, pb);
    if (symbolId === (bag < 0 ? 'lt' : bag > 0 ? 'gt' : 'eq')) return 'abaikanBulat';
    return 'terbalik';
  }
  if (pa.den !== pb.den) {
    var symDen = compareSymbolId(pa.den, pb.den);
    var symNum = compareSymbolId(pa.num, pb.num);
    if (symbolId === symDen && symbolId === symNum) return 'bandingAngka';
    if (symbolId === symDen) return 'penyebutBesar';
    if (symbolId === symNum) return 'bandingPembilang';
  }
  return 'terbalik';
}

/* Umpan balik HTML untuk hasil diagnosaBandingPecahan. */
function pesanBandingPecahan(diag, a, b) {
  var pa = pecahanDari(a);
  var pb = pecahanDari(b);
  if (diag === 'benar') {
    return '<strong>Tepat!</strong> ' + penjelasanStrategi(strategiBandingPecahan(a, b), a, b);
  }
  if (diag === 'abaikanTanda') {
    return 'Perhatikan tanda negatifnya! Kamu seperti membandingkan besarannya saja. Pada garis bilangan, pecahan negatif yang besarannya lebih besar letaknya <strong>lebih kiri</strong>, jadi nilainya lebih kecil. Coba lagi.';
  }
  if (diag === 'selisihSisa') {
    return (
      'Keduanya memang sama-sama kurang ' +
      (pa.den - pa.num) +
      ' bagian dari 1 utuh, tetapi <strong>ukuran bagiannya berbeda</strong>: 1/' +
      pa.den +
      ' dan 1/' +
      pb.den +
      ' tidak sama besar. Bagian yang kurang lebih kecil berarti pecahannya lebih dekat ke 1. Coba lagi.'
    );
  }
  if (diag === 'abaikanBulat') {
    return 'Jangan lupakan <strong>bilangan bulat</strong> pada pecahan campuran! Bandingkan bilangan bulatnya lebih dulu; bagian pecahannya baru dilihat bila bilangan bulatnya sama. Coba lagi.';
  }
  if (diag === 'bandingAngka') {
    return 'Sepertinya kamu membandingkan pembilang dengan pembilang dan penyebut dengan penyebut seperti bilangan bulat biasa. Pecahan adalah <strong>satu bilangan</strong>: samakan penyebutnya atau pakai patokan 1/2. Coba lagi.';
  }
  if (diag === 'penyebutBesar') {
    return 'Hati-hati: penyebut lebih besar berarti satu utuh dibagi menjadi <strong>lebih banyak</strong> bagian, sehingga tiap bagian justru <strong>lebih kecil</strong>. Coba lagi.';
  }
  if (diag === 'bandingPembilang') {
    return (
      'Pembilangnya sama (' +
      pa.num +
      ' bagian), tetapi ukuran bagiannya berbeda karena penyebutnya berbeda (' +
      pa.den +
      ' dan ' +
      pb.den +
      '). Mana yang bagiannya lebih besar? Coba lagi.'
    );
  }
  return (
    'Belum tepat. Pilih strategi yang cocok — samakan penyebut dengan KPK selalu berhasil — lalu periksa lagi ' +
    teksPecahanTebal(pa) +
    ' dan ' +
    teksPecahanTebal(pb) +
    '.'
  );
}

/*
 * Kata perbandingan per tema konteks pecahan. `kecil` menjelaskan
 * pecahan yang lebih kecil. Tema tinggi memakai `bawah` bila kedua
 * pecahan berada di atau di bawah permukaan (lebih dalam/dangkal).
 */
var KATA_BANDING_PECAHAN = {
  banyak: {
    ikon: '🥣',
    kecil: 'lebih sedikit',
    besar: 'lebih banyak',
    sama: 'sama banyaknya',
    terkecil: 'paling sedikit',
    terbesar: 'paling banyak',
  },
  panjang: {
    ikon: '🎀',
    kecil: 'lebih pendek',
    besar: 'lebih panjang',
    sama: 'sama panjangnya',
    terkecil: 'paling pendek',
    terbesar: 'paling panjang',
  },
  jarak: {
    ikon: '🚶',
    kecil: 'lebih dekat',
    besar: 'lebih jauh',
    sama: 'sama jauhnya',
    terkecil: 'paling dekat',
    terbesar: 'paling jauh',
  },
  waktu: {
    ikon: '⏱️',
    kecil: 'lebih singkat',
    besar: 'lebih lama',
    sama: 'sama lamanya',
    terkecil: 'paling singkat',
    terbesar: 'paling lama',
  },
  berat: {
    ikon: '⚖️',
    kecil: 'lebih ringan',
    besar: 'lebih berat',
    sama: 'sama beratnya',
    terkecil: 'paling ringan',
    terbesar: 'paling berat',
  },
  tinggi: {
    ikon: '🌊',
    kecil: 'lebih rendah',
    besar: 'lebih tinggi',
    sama: 'sama tingginya',
    terkecil: 'paling rendah',
    terbesar: 'paling tinggi',
    bawah: {
      ikon: '🌊',
      kecil: 'lebih dalam',
      besar: 'lebih dangkal',
      sama: 'sama dalamnya',
      terkecil: 'paling dalam',
      terbesar: 'paling dangkal',
    },
  },
};

/* 'kecil' bila a < b, 'besar' bila a > b, 'sama' bila a = b. */
function idMaknaBandingPecahan(a, b) {
  var c = bandingPecahan(a, b);
  return c < 0 ? 'kecil' : c > 0 ? 'besar' : 'sama';
}

/* Kamus kata untuk pasangan (a, b) pada tema tertentu. */
function kataBandingPecahanUntuk(tema, a, b) {
  var K = KATA_BANDING_PECAHAN[tema] || KATA_BANDING_PECAHAN.banyak;
  if (K.bawah && pecahanBiasaBertanda(a).num <= 0 && pecahanBiasaBertanda(b).num <= 0)
    return K.bawah;
  return K;
}

/* Frasa makna a terhadap b, mis. ('3/4', '2/3', 'banyak') → 'lebih banyak'. */
function maknaBandingPecahan(a, b, tema) {
  return kataBandingPecahanUntuk(tema, a, b)[idMaknaBandingPecahan(a, b)];
}

/* Opsi { id, label } kecil/besar/sama untuk diacak (ensureShuffledOrder). */
function opsiMaknaBandingPecahan(tema, a, b) {
  var K = kataBandingPecahanUntuk(tema, a, b);
  return [
    { id: 'kecil', label: K.kecil },
    { id: 'besar', label: K.besar },
    { id: 'sama', label: K.sama },
  ];
}

/* Ujung garis bilangan { min, max } (bilangan bulat, memuat 0) untuk sekumpulan pecahan. */
function garisPecahanRentang(list) {
  var lo = 0;
  var hi = 0;
  list.forEach(function (x) {
    var v = pecahanBiasaBertanda(x);
    lo = Math.min(lo, Math.floor(v.num / v.den));
    hi = Math.max(hi, Math.ceil(v.num / v.den));
  });
  if (hi === lo) hi = lo + 1;
  return { min: lo, max: hi };
}

var KATA_SIMBOL = { lt: 'kurang dari', gt: 'lebih dari', eq: 'sama dengan' };

/* Kalimat perbandingan besar: [a] ☐ [b] untuk pecahan. `symbolId` null → '?'. */
function buildKalimatBandingPecahan(a, b, symbolId) {
  var pa = pecahanDari(a);
  var pb = pecahanDari(b);
  return (
    '<div class="cmp-sentence cmp-sentence--frac" aria-label="' +
    esc(
      bacaPecahanKonteks(pa) +
        ' ' +
        (symbolId ? KATA_SIMBOL[symbolId] : 'kotak kosong') +
        ' ' +
        bacaPecahanKonteks(pb)
    ) +
    '">' +
    '<span class="cmp-sentence__frac">' +
    buildPecahanTampil(pa, 'large') +
    '</span>' +
    '<span class="cmp-sentence__sym' +
    (symbolId ? ' is-filled' : '') +
    '">' +
    esc(symbolId ? compareSymbolText(symbolId) : '?') +
    '</span>' +
    '<span class="cmp-sentence__frac">' +
    buildPecahanTampil(pb, 'large') +
    '</span>' +
    '</div>'
  );
}

/*
 * Tombol lambang <, >, = untuk pecahan yang boleh dicoba lagi sampai
 * benar, lalu terkunci. `order` = urutan acak id COMPARE_SYMBOLS dari State.
 *   st  { chosen, wrong }
 *   opts.group  nilai data-group pembeda antarsoal
 */
function buildPilihSimbolPecahan(a, b, order, st, opts) {
  opts = opts || {};
  var benarId = simbolBandingPecahan(a, b);
  var benar = st.chosen === benarId;
  return (
    '<div class="cmp-symbols">' +
    buildChoiceGroup(COMPARE_SYMBOLS, order, {
      chosen: st.chosen,
      correctId: benar ? benarId : null,
      grade: true,
      locked: benar,
      group: opts.group || 'frac-cmp',
      attr: 'data-frac-sym',
    }) +
    '</div>'
  );
}

/* Memasang event buildPilihSimbolPecahan; pasangan & state dicari lewat group. */
function bindPilihSimbolPecahan(root, getPair, getState, save, rerender) {
  root.querySelectorAll('[data-frac-sym]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.dataset.group;
      var pair = getPair(group);
      var st = getState(group);
      if (!pair || !st) return;
      var benarId = simbolBandingPecahan(pair[0], pair[1]);
      if (st.chosen === benarId) return;
      st.chosen = btn.dataset.fracSym;
      if (st.chosen !== benarId) st.wrong = (st.wrong || 0) + 1;
      save();
      rerender();
    });
  });
}

/* ============================================================
   37. BILANGAN DESIMAL DALAM KONTEKS SEHARI-HARI — MEMBACA,
       MENULISKAN & MEMBANDINGKAN
   Dipakai fase-d/mpi-1.5. Memakai ulang seksi 19 (desimalDigits,
   bacaDesimalKoma, bacaDesimalNilaiTempat, DESIMAL_TEMPAT), seksi 20
   (bandingkanDesimal, simbolBandingDesimal, alasanBandingDesimal,
   diagnosaBandingDesimal, pesanDiagnosaDesimal, buildDecChip), seksi 29
   (normalisasiBacaan) dan seksi 36 (KATA_BANDING_PECAHAN).
   Bilangan desimal tetap diolah sebagai STRING berkoma ("3,07").
   Isinya:
     • cekCaraBacaDesimal — memeriksa cara baca yang diketik murid:
       cara baca "koma" ("tiga koma nol tujuh") dan cara baca nilai
       tempat ("tiga dan tujuh perseratus") sama-sama diterima;
       miskonsepsi dikenali (angka di belakang koma dibaca sebagai
       bilangan bulat, angka 0 terlewat, "titik", koma dilewati, nama
       nilai tempat salah, bagian bulat 0 tidak dibaca);
     • opsiCaraBacaDesimal / opsiNotasiDesimal — pilihan cara baca &
       notasi (satu benar + tiga pengecoh khas), diacak oleh app.js;
     • diagnosaTulisDesimal — memeriksa notasi yang ditulis murid
       (titik, 0 pengisi tempat hilang/berlebih, koma bergeser, tanpa
       koma); notasi senilai (3,070 untuk 3,07) diterima;
     • makeDesimalStep / periksaDesimalStep / buildDesimalStep /
       bindDesimalStep — langkah isian teks (tulis atau baca) dengan
       umpan balik diagnosa;
     • kata perbandingan per tema (lebih cepat, lebih jauh, lebih
       dingin, …) dan tombol lambang <, >, = berdiagnosa.
   ============================================================ */

var PESAN_BACA_DESIMAL = {
  kosong: 'Ketik cara membaca bilangan desimal itu terlebih dahulu.',
  'koma-bulat':
    'Angka di belakang koma tidak dibaca sebagai satu bilangan bulat. Setelah kata <strong>koma</strong>, baca angkanya <strong>satu per satu</strong>, misalnya 12,45 → "dua belas koma empat lima".',
  'nol-hilang':
    'Ada angka 0 yang terlewat. Angka 0 di belakang koma menjaga nilai tempat angka sesudahnya, jadi tetap dibaca: "koma <strong>nol</strong> …".',
  titik:
    'Di Indonesia, pemisah desimal adalah tanda <strong>koma</strong>, jadi dibaca "koma" — bukan "titik".',
  'lupa-bulat':
    'Bagian bulat (angka di depan koma) ikut dibaca lebih dulu, walaupun nilainya 0: "<strong>nol</strong> koma …".',
  'tanpa-koma':
    'Tanda koma tidak boleh dilewati. Tanpa koma, bilangan itu terbaca jauh lebih besar. Baca bagian bulat, lalu kata "koma", lalu angka di belakang koma satu per satu.',
  'tempat-salah':
    'Nama nilai tempatnya belum tepat. Lihat angka <strong>paling kanan</strong>: 1 angka di belakang koma → persepuluh, 2 angka → perseratus, 3 angka → perseribu.',
  'angka-salah':
    'Angkanya belum tepat. Baca bagian bulat sebagai satu bilangan, lalu kata "koma", lalu setiap angka di belakang koma satu per satu.',
};

var PESAN_TULIS_DESIMAL = {
  kosong: 'Isi jawabanmu terlebih dahulu.',
  format: 'Tulis bilangan desimal dengan angka dan satu tanda koma, misalnya 0,5 atau 3,07.',
  titik:
    'Gunakan tanda <strong>koma</strong> (,) sebagai pemisah desimal, misalnya 3,07. Di Indonesia, titik dipakai sebagai pemisah ribuan.',
  'nol-hilang':
    'Ada angka 0 pengisi tempat yang hilang. Perhatikan nama nilai tempatnya: "perseratus" berarti ada <strong>dua</strong> angka di belakang koma, "perseribu" berarti <strong>tiga</strong>. Isi tempat yang kosong dengan 0.',
  'nol-lebih':
    'Ada angka 0 yang berlebih di belakang koma sehingga angkanya bergeser ke nilai tempat yang lebih kecil. Hitung lagi banyak angka di belakang koma.',
  'tempat-bergeser':
    'Angka-angkanya sudah tepat, tetapi letak komanya bergeser. Bagian bulat ditulis di depan koma, lalu angka persepuluhan, perseratusan, … di belakangnya.',
  'tanpa-koma':
    'Tanda koma belum ditulis. Tanpa koma, bilangan itu menjadi bilangan bulat yang jauh lebih besar.',
  salah:
    'Belum tepat. Tulis bagian bulat, tanda koma, lalu angka di belakang koma sesuai nilai tempatnya.',
};

/* "07" → "nol tujuh": setiap angka dibaca satu per satu. */
function bacaAngkaSatuSatu(digits) {
  return String(digits)
    .split('')
    .map(function (d) {
      return terbilang(+d);
    })
    .join(' ');
}

/*
 * Cara baca nilai tempat dengan nama tempat ke-k (1–3), dipakai untuk
 * pengecoh: ({3, "07"}, 1) → "tiga dan tujuh persepuluh".
 */
function bacaNilaiTempatDi(p, k) {
  var bulat = parseInt(p.bulat, 10);
  var frac = terbilang(parseInt(p.pecahan, 10)) + ' ' + DESIMAL_TEMPAT[k].baca;
  return bulat === 0 ? frac : terbilang(bulat) + ' dan ' + frac;
}

/*
 * Pengecoh cara baca untuk desimal `str`, urut prioritas:
 * 'koma-bulat' / 'nol-hilang', 'tempat-salah', 'tanpa-koma', 'titik',
 * 'lupa-bulat'. [] bila tidak ada angka di belakang koma.
 */
function pengecohBacaDesimal(str) {
  var p = desimalDigits(str);
  if (!p || !p.pecahan) return [];
  var W = terbilang(parseInt(p.bulat, 10));
  var n = p.pecahan.length;
  var angka = parseInt(p.pecahan, 10);
  var list = [];
  if (n >= 2 && angka > 0) {
    list.push({
      id: /^0/.test(p.pecahan) ? 'nol-hilang' : 'koma-bulat',
      label: W + ' koma ' + terbilang(angka),
    });
  }
  if (angka > 0)
    list.push({ id: 'tempat-salah', label: bacaNilaiTempatDi(p, n < 3 ? n + 1 : n - 1) });
  var gabung = parseInt(p.bulat + p.pecahan, 10);
  if (gabung < 1000000) list.push({ id: 'tanpa-koma', label: terbilang(gabung) });
  list.push({ id: 'titik', label: W + ' titik ' + bacaAngkaSatuSatu(p.pecahan) });
  list.push({ id: 'lupa-bulat', label: 'koma ' + bacaAngkaSatuSatu(p.pecahan) });
  return list;
}

/* Peta bentuk bacaan (sudah dinormalisasi) → kode, untuk desimal `str`. */
function bentukBacaDesimal(str) {
  var p = desimalDigits(str);
  var peta = {};
  function add(teks, kode) {
    if (teks && !Object.prototype.hasOwnProperty.call(peta, teks)) peta[teks] = kode;
  }
  add(bacaDesimalKoma(str), 'benar');
  var nilai = bacaDesimalNilaiTempat(str);
  add(nilai, 'nilai-tempat');
  add(nilai.replace(' dan ', ' '), 'nilai-tempat');
  pengecohBacaDesimal(str).forEach(function (o) {
    add(o.label, o.id);
  });
  if (p && p.pecahan && parseInt(p.pecahan, 10) > 0) {
    for (var k = 1; k <= 3; k++) {
      if (k !== p.pecahan.length) add(bacaNilaiTempatDi(p, k), 'tempat-salah');
    }
  }
  return peta;
}

/*
 * Memeriksa cara baca yang diketik murid untuk desimal `str`.
 * Mengembalikan { benar, kode, pesan }; kode 'benar' | 'nilai-tempat'
 * (benar, cara baca nilai tempat) | 'kosong' | 'koma-bulat' |
 * 'nol-hilang' | 'titik' | 'lupa-bulat' | 'tanpa-koma' |
 * 'tempat-salah' | 'angka-salah'.
 */
function cekCaraBacaDesimal(teks, str) {
  var baku = bacaDesimalKoma(str);
  var t = normalisasiBacaan(teks).replace(/\bper (sepuluh|seratus|seribu)\b/g, 'per$1');
  if (!t) return { benar: false, kode: 'kosong', pesan: PESAN_BACA_DESIMAL.kosong };
  var peta = bentukBacaDesimal(str);
  var kode = Object.prototype.hasOwnProperty.call(peta, t) ? peta[t] : 'angka-salah';
  if (kode === 'benar') {
    return {
      benar: true,
      kode: kode,
      pesan: 'Tepat! ' + esc(str) + ' dibaca "' + esc(baku) + '".',
    };
  }
  if (kode === 'nilai-tempat') {
    return {
      benar: true,
      kode: kode,
      pesan:
        'Benar, itu cara baca berdasarkan nilai tempat. Cara baca lain yang juga tepat: "<strong>' +
        esc(baku) +
        '</strong>".',
    };
  }
  return { benar: false, kode: kode, pesan: PESAN_BACA_DESIMAL[kode] };
}

/*
 * Pilihan cara baca untuk desimal `str`: satu benar (id 'baku', cara
 * baca koma) dan tiga pengecoh pertama dari pengecohBacaDesimal() yang
 * labelnya unik. Urutan wajar; app.js mengacaknya (ensureShuffledOrder).
 * Setiap opsi: { id, label, benar, umpan }.
 */
function opsiCaraBacaDesimal(str) {
  var baku = bacaDesimalKoma(str);
  var nilai = bacaDesimalNilaiTempat(str);
  var opsi = [
    {
      id: 'baku',
      label: baku,
      benar: true,
      umpan: 'Tepat! ' + esc(str) + ' dibaca "' + esc(baku) + '" atau "' + esc(nilai) + '".',
    },
  ];
  var dipakai = {};
  dipakai[baku] = true;
  dipakai[nilai] = true;
  pengecohBacaDesimal(str).forEach(function (o) {
    if (opsi.length >= 4 || dipakai[o.label]) return;
    dipakai[o.label] = true;
    opsi.push({ id: o.id, label: o.label, benar: false, umpan: PESAN_BACA_DESIMAL[o.id] });
  });
  return opsi;
}

function tanpaNolKanan(s) {
  return s.replace(/0+$/, '');
}

/*
 * Memeriksa notasi desimal yang ditulis murid terhadap `str`. Notasi
 * senilai (3,070 untuk 3,07) diterima. Mengembalikan { benar, kode,
 * pesan }; kode 'benar' | 'kosong' | 'format' | 'titik' | 'nol-hilang' |
 * 'nol-lebih' | 'tempat-bergeser' | 'tanpa-koma' | 'salah'.
 */
function diagnosaTulisDesimal(isian, str) {
  function hasil(kode) {
    if (kode === 'benar') {
      return {
        benar: true,
        kode: kode,
        pesan: 'Tepat! Ditulis ' + esc(str) + ', dibaca "' + esc(bacaDesimalKoma(str)) + '".',
      };
    }
    return { benar: false, kode: kode, pesan: PESAN_TULIS_DESIMAL[kode] };
  }
  var target = desimalDigits(str);
  var s = String(isian == null ? '' : isian).replace(/\s/g, '');
  if (!s) return hasil('kosong');
  if (s.indexOf('.') !== -1) return hasil('titik');
  var p = /^\d+(,\d+)?$/.test(s) ? desimalDigits(s) : null;
  if (!p) return hasil('format');
  if (bandingkanDesimal(s, str) === 0) return hasil('benar');
  var bulatSama = bulatDesimalNormal(p) === bulatDesimalNormal(target);
  var fp = tanpaNolKanan(p.pecahan);
  var fq = tanpaNolKanan(target.pecahan);
  if (bulatSama && /^0/.test(fq) && fp === fq.replace(/^0+/, '')) return hasil('nol-hilang');
  if (bulatSama && fq && fp === '0' + fq) return hasil('nol-lebih');
  var dp = tanpaNolKanan((p.bulat + p.pecahan).replace(/^0+/, ''));
  var dq = tanpaNolKanan((target.bulat + target.pecahan).replace(/^0+/, ''));
  if (dp && dp === dq) return hasil(p.pecahan ? 'tempat-bergeser' : 'tanpa-koma');
  return hasil('salah');
}

/*
 * Pilihan notasi untuk desimal `str` (mis. dari dikte): satu benar (id
 * 'baku') dan tiga pengecoh pertama yang unik dari: 'nol-hilang'
 * (3,07 → 3,7), 'nol-lebih' (3,007), 'geser' (30,7), 'titik' (3.07),
 * 'tanpa-koma' (307). Urutan wajar; app.js mengacaknya.
 * Setiap opsi: { id, label, benar, umpan }.
 */
function opsiNotasiDesimal(str) {
  var p = desimalDigits(str);
  var bulat = bulatDesimalNormal(p);
  var f = p.pecahan;
  var kandidat = [];
  if (/^0+[1-9]/.test(f))
    kandidat.push({ id: 'nol-hilang', label: bulat + ',' + f.replace(/^0+/, '') });
  if (f) kandidat.push({ id: 'nol-lebih', label: bulat + ',0' + f });
  if (f) {
    var depan = (bulat + f.charAt(0)).replace(/^0+(?=\d)/, '');
    var sisa = f.slice(1);
    kandidat.push({ id: 'geser', label: sisa ? depan + ',' + sisa : depan });
    kandidat.push({ id: 'titik', label: bulat + '.' + f });
  }
  kandidat.push({ id: 'tanpa-koma', label: String(parseInt(bulat + f, 10)) });
  var opsi = [
    {
      id: 'baku',
      label: str,
      benar: true,
      umpan: 'Tepat! "' + esc(bacaDesimalKoma(str)) + '" ditulis ' + esc(str) + '.',
    },
  ];
  var dipakai = {};
  dipakai[str] = true;
  kandidat.forEach(function (o) {
    if (opsi.length >= 4 || dipakai[o.label]) return;
    dipakai[o.label] = true;
    opsi.push({
      id: o.id,
      label: o.label,
      benar: false,
      umpan: PESAN_TULIS_DESIMAL[o.id === 'geser' ? 'tempat-bergeser' : o.id],
    });
  });
  return opsi;
}

/* State default langkah isian desimal. */
function makeDesimalStep() {
  return { input: '', done: false, kode: null, pesan: '', attempts: 0, hintLevel: 0 };
}

/*
 * Memeriksa isian langkah dan menyimpan hasilnya ke st.
 *   step.jenis 'baca'  → cekCaraBacaDesimal
 *   step.jenis 'tulis' → diagnosaTulisDesimal
 * Isian kosong tidak dihitung sebagai percobaan.
 */
function periksaDesimalStep(st, step, input) {
  st.input = String(input == null ? '' : input).trim();
  var r =
    step.jenis === 'baca'
      ? cekCaraBacaDesimal(st.input, step.jawab)
      : diagnosaTulisDesimal(st.input, step.jawab);
  st.kode = r.kode;
  st.pesan = r.pesan;
  if (r.kode === 'kosong') return r;
  st.attempts += 1;
  st.done = r.benar;
  return r;
}

/*
 * Satu langkah isian desimal dengan umpan balik diagnosa.
 *   id    awalan id DOM (→ idInput, idCheck, idHint)
 *   step  { jenis: 'tulis'|'baca', jawab, label, hints, temuan,
 *           satuan, placeholder }
 *   num   nomor langkah opsional
 */
function buildDesimalStep(id, st, step, num) {
  var head =
    '<p class="dl-step__label">' +
    (num ? '<span class="dl-step__num">' + num + '</span>' : '') +
    step.label +
    '</p>';
  var baca = step.jenis === 'baca';
  if (st.done) {
    return (
      '<div class="dl-step dl-step--done">' +
      head +
      '<p class="dl-step__answer">✓ ' +
      (baca ? '"' + esc(bacaDesimalKoma(step.jawab)) + '"' : buildDecChip(step.jawab)) +
      (step.satuan && !baca ? ' ' + esc(step.satuan) : '') +
      '</p>' +
      (baca && st.kode === 'nilai-tempat' ? buildFeedbackBox('info', 'ℹ️', st.pesan) : '') +
      (step.temuan ? buildFeedbackBox('success', '💡', step.temuan) : '') +
      '</div>'
    );
  }
  var salah = st.attempts > 0 && st.kode && st.kode !== 'benar' && st.kode !== 'kosong';
  return (
    '<div class="dl-step">' +
    head +
    '<div class="dl-input-row dec-step__row">' +
    '<input type="text" class="input-text ' +
    (baca ? 'bbk-baca-input' : 'dec-step__input') +
    (salah ? ' has-error' : '') +
    '" id="' +
    id +
    'Input" inputmode="' +
    (baca ? 'text' : 'decimal') +
    '" autocapitalize="off" spellcheck="false" autocomplete="off" value="' +
    esc(st.input || '') +
    '" aria-label="' +
    (baca ? 'Cara membaca bilangan desimal' : 'Bilangan desimal') +
    '" placeholder="' +
    esc(step.placeholder || (baca ? 'ketik cara bacanya…' : 'mis. 3,07')) +
    '">' +
    (step.satuan && !baca ? '<span class="bbk-satuan">' + esc(step.satuan) + '</span>' : '') +
    '<button type="button" class="btn btn--primary" id="' +
    id +
    'Check">Periksa</button>' +
    buildHintToggle(id + 'Hint', step.hints, st.hintLevel) +
    '</div>' +
    (salah
      ? '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox('error', '✗', '<strong>' + esc(st.input) + '</strong> — ' + st.pesan) +
        '</div>'
      : '') +
    buildHintStack(step.hints, st.hintLevel) +
    '</div>'
  );
}

/* Memasang event buildDesimalStep; `save` lalu `rerender` dipanggil setelah perubahan. */
function bindDesimalStep(id, st, step, save, rerender) {
  var btn = document.getElementById(id + 'Check');
  var inp = document.getElementById(id + 'Input');
  var hint = document.getElementById(id + 'Hint');
  if (btn && inp) {
    btn.addEventListener('click', function () {
      var r = periksaDesimalStep(st, step, inp.value);
      if (r.kode === 'kosong') {
        showNotice(r.pesan);
        return;
      }
      save();
      rerender();
      if (!st.done) {
        var el = document.getElementById(id + 'Input');
        if (el) el.focus();
      }
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') btn.click();
    });
  }
  if (hint) {
    hint.addEventListener('click', function () {
      st.hintLevel = Math.min(st.hintLevel + 1, (step.hints || []).length);
      save();
      rerender();
    });
  }
}

/*
 * Kata perbandingan per tema konteks desimal. Tema yang tidak ada di
 * sini memakai KATA_BANDING_PECAHAN (banyak, panjang, jarak, waktu,
 * berat, tinggi). `kecil` menjelaskan bilangan yang lebih kecil.
 */
var KATA_BANDING_DESIMAL = {
  suhu: {
    ikon: '🌡️',
    kecil: 'lebih dingin',
    besar: 'lebih panas',
    sama: 'sama suhunya',
    terkecil: 'paling dingin',
    terbesar: 'paling panas',
  },
  lari: {
    ikon: '🏃',
    kecil: 'lebih cepat',
    besar: 'lebih lambat',
    sama: 'sama cepatnya',
    terkecil: 'paling cepat',
    terbesar: 'paling lambat',
  },
};

function kataBandingDesimal(tema) {
  return KATA_BANDING_DESIMAL[tema] || KATA_BANDING_PECAHAN[tema] || KATA_BANDING_PECAHAN.banyak;
}

/* 'kecil' bila a < b, 'besar' bila a > b, 'sama' bila a = b. */
function idMaknaBandingDesimal(a, b) {
  var c = bandingkanDesimal(a, b);
  return c < 0 ? 'kecil' : c > 0 ? 'besar' : 'sama';
}

/* Frasa makna a terhadap b, mis. ('3,7', '3,68', 'jarak') → 'lebih jauh'. */
function maknaBandingDesimal(a, b, tema) {
  return kataBandingDesimal(tema)[idMaknaBandingDesimal(a, b)];
}

/* Opsi { id, label } kecil/besar/sama untuk diacak (ensureShuffledOrder). */
function opsiMaknaBandingDesimal(tema) {
  var K = kataBandingDesimal(tema);
  return [
    { id: 'kecil', label: K.kecil },
    { id: 'besar', label: K.besar },
    { id: 'sama', label: K.sama },
  ];
}

/*
 * Tombol lambang <, >, = untuk sepasang desimal yang boleh dicoba lagi
 * sampai benar, lalu terkunci. Pilihan salah memunculkan pesan diagnosa
 * miskonsepsi (seksi 20); pilihan benar memunculkan alasan berdasarkan
 * nilai tempat. `order` = urutan acak id COMPARE_SYMBOLS dari State.
 *   st          { chosen, wrong }
 *   opts.group  nilai data-group pembeda antarsoal
 */
function buildPilihSimbolDesimal(a, b, order, st, opts) {
  opts = opts || {};
  var benarId = simbolBandingDesimal(a, b);
  var benar = st.chosen === benarId;
  var salah = !!st.chosen && !benar;
  return (
    '<div class="cmp-symbols">' +
    buildChoiceGroup(COMPARE_SYMBOLS, order, {
      chosen: st.chosen,
      correctId: benar ? benarId : null,
      grade: true,
      locked: benar,
      group: opts.group || 'dec-cmp',
      attr: 'data-dec-sym',
    }) +
    '</div>' +
    (benar
      ? buildFeedbackBox('success', '✓', esc(alasanBandingDesimal(a, b)))
      : salah
      ? buildFeedbackBox(
          'warning',
          '💭',
          esc(pesanDiagnosaDesimal(diagnosaBandingDesimal(a, b, st.chosen), a, b))
        )
      : '')
  );
}

/* Memasang event buildPilihSimbolDesimal; pasangan & state dicari lewat group. */
function bindPilihSimbolDesimal(root, getPair, getState, save, rerender) {
  root.querySelectorAll('[data-dec-sym]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.dataset.group;
      var pair = getPair(group);
      var st = getState(group);
      if (!pair || !st) return;
      var benarId = simbolBandingDesimal(pair[0], pair[1]);
      if (st.chosen === benarId) return;
      st.chosen = btn.dataset.decSym;
      if (st.chosen !== benarId) st.wrong = (st.wrong || 0) + 1;
      save();
      rerender();
    });
  });
}

/* ============================================================
   38. BILANGAN TERPADU — MEMBANDINGKAN BULAT, PECAHAN & DESIMAL
   Dipakai modul fase-d/mpi-1.6 (membandingkan bilangan bulat,
   pecahan, dan desimal secara terpadu dalam masalah kontekstual).
   Bilangan ditulis sebagai STRING dalam bentuk aslinya — bulat
   ("-18"), pecahan ("3/4", "-1 1/4"), atau desimal berkoma ("-2,5").
   Tanda − tipografis, "-", dan titik desimal juga diterima.
   Isinya:
     • jenisBilangan / nilaiTerpadu / tulisTerpadu — bentuk, nilai
       eksak { num, den } (paling sederhana), dan notasi baku;
     • bandingTerpadu / simbolBandingTerpadu / urutkanTerpadu /
       urutanIdTerpadu — perbandingan eksak lintas bentuk;
     • keDesimalTerpadu / kePecahanTerpadu / penyebutPersepuluhan —
       mengubah bentuk (pecahan berpenyebut 10, 100, 1000 …);
     • opsiBentukSetara — pilihan bentuk setara (benar + pengecoh
       khas: angka dipisah koma, tanda hilang, penyebut salah, …);
     • diagnosaBandingTerpadu / pesanDiagnosaTerpadu /
       alasanBandingTerpadu — miskonsepsi saat memilih lambang dan
       alasan baku;
     • KATA_BANDING_TERPADU — kata perbandingan per tema konteks;
     • periksaIsianTerpadu — memeriksa isian bilangan dalam bentuk
       yang diminta;
     • buildBilanganChip, buildKalimatBandingTerpadu,
       buildPilihSimbolTerpadu, buildTabelBentukTerpadu — tampilan;
     • buildGarisTerpadu / buildPenempatanTerpadu — garis bilangan
       berlangkah 1/n untuk menempatkan bilangan campuran bentuk.
   Gaya .num-chip--frac & .bentuk-tabel ada di shared/base.css.
   ============================================================ */

/* Menormalkan tanda minus & spasi. */
function normalTerpadu(str) {
  return String(str == null ? '' : str)
    .trim()
    .replace(/[−–]/g, '-')
    .replace(/\s+/g, ' ');
}

/* Mengurai string → { jenis, num, den } (belum disederhanakan) atau null. */
function uraiTerpadu(str) {
  var s = normalTerpadu(str);
  if (!s) return null;
  var m = /^([+-])?(\d+)$/.exec(s);
  if (m) {
    return { jenis: 'bulat', num: (m[1] === '-' ? -1 : 1) * parseInt(m[2], 10), den: 1 };
  }
  m = /^([+-])?(\d+)[.,](\d+)$/.exec(s);
  if (m) {
    var den = Math.pow(10, m[3].length);
    var n = parseInt(m[2], 10) * den + parseInt(m[3], 10);
    return { jenis: 'desimal', num: m[1] === '-' ? -n : n, den: den, digits: m };
  }
  var r = parseTeksPecahan(s);
  if (r.error) return null;
  var b = pecahanBiasaBertanda(r.value);
  return { jenis: 'pecahan', num: b.num, den: b.den, p: r.value };
}

/* 'bulat' | 'pecahan' | 'desimal' | null. */
function jenisBilangan(str) {
  var u = uraiTerpadu(str);
  return u ? u.jenis : null;
}

/* Nilai eksak paling sederhana { num, den } (den > 0) atau null. */
function nilaiTerpadu(str) {
  var u = uraiTerpadu(str);
  if (!u) return null;
  if (u.num === 0) return { num: 0, den: 1 };
  var g = gcd(u.num, u.den);
  return { num: u.num / g, den: u.den / g };
}

/* Notasi baku bentuk aslinya dengan minus tipografis. */
function tulisTerpadu(str) {
  var u = uraiTerpadu(str);
  if (!u) return String(str);
  if (u.jenis === 'bulat') return formatNumber(u.num, '−');
  if (u.jenis === 'pecahan') {
    var p = u.p;
    return tulisPecahan({ num: p.num, den: p.den, whole: p.whole, neg: p.neg && u.num !== 0 });
  }
  var d = u.digits;
  return (d[1] === '-' && u.num !== 0 ? '−' : '') + parseInt(d[2], 10) + ',' + d[3];
}

/* −1 bila a < b, 0 bila sama, 1 bila a > b; null bila tidak valid. */
function bandingTerpadu(a, b) {
  var x = nilaiTerpadu(a);
  var y = nilaiTerpadu(b);
  if (!x || !y) return null;
  return compareFractions(x, y);
}

/* 'lt' | 'eq' | 'gt' — selaras dengan COMPARE_SYMBOLS. */
function simbolBandingTerpadu(a, b) {
  var c = bandingTerpadu(a, b);
  if (c === null) return null;
  return c < 0 ? 'lt' : c > 0 ? 'gt' : 'eq';
}

/* Salinan terurut; arah 'naik' (default) atau 'turun'. */
function urutkanTerpadu(list, arah) {
  var out = list.slice().sort(bandingTerpadu);
  return arah === 'turun' ? out.reverse() : out;
}

/* Id item { id, nilai } dalam urutan nilai naik/turun. */
function urutanIdTerpadu(items, arah) {
  var out = items.slice().sort(function (x, y) {
    return bandingTerpadu(x.nilai, y.nilai);
  });
  if (arah === 'turun') out.reverse();
  return out.map(function (it) {
    return it.id;
  });
}

/* Banyak angka di belakang koma agar penyebut den menjadi 10^k; null bila tidak bisa. */
function pangkatSepuluhUntuk(den) {
  var a = 0;
  var b = 0;
  while (den % 2 === 0) {
    den /= 2;
    a += 1;
  }
  while (den % 5 === 0) {
    den /= 5;
    b += 1;
  }
  return den === 1 ? Math.max(a, b) : null;
}

/* Teks desimal berkoma dari nilai { num, den } yang penyebutnya membagi 10^k. */
function teksDesimalNilai(v, k) {
  var sign = v.num < 0 ? '−' : '';
  var skala = Math.pow(10, k);
  var n = (Math.abs(v.num) * skala) / v.den;
  var bulat = Math.floor(n / skala);
  if (!k) return sign + bulat;
  var sisa = String(n - bulat * skala);
  while (sisa.length < k) sisa = '0' + sisa;
  sisa = sisa.replace(/0+$/, '');
  return sign + bulat + (sisa ? ',' + sisa : '');
}

/* Bentuk desimal (berhenti) atau null bila desimalnya berulang. */
function keDesimalTerpadu(str) {
  var v = nilaiTerpadu(str);
  if (!v) return null;
  var k = pangkatSepuluhUntuk(v.den);
  if (k === null) return null;
  return teksDesimalNilai(v, k);
}

/* Teks pecahan paling sederhana dari nilai { num, den } (campuran bila |nilai| > 1). */
function teksPecahanNilai(v) {
  var sign = v.num < 0 ? '−' : '';
  var n = Math.abs(v.num);
  if (v.den === 1) return sign + n;
  var w = Math.floor(n / v.den);
  var r = n - w * v.den;
  return sign + (w ? w + ' ' : '') + r + '/' + v.den;
}

/* Bentuk pecahan paling sederhana: "−2,5" → "−2 1/2", "0,75" → "3/4". */
function kePecahanTerpadu(str) {
  var v = nilaiTerpadu(str);
  return v ? teksPecahanNilai(v) : null;
}

/*
 * Langkah antara pecahan → desimal: penyebut dijadikan 10, 100, 1000 …
 * "3/4" → "75/100", "−1 1/4" → "−1 25/100". null bila tidak bisa.
 */
function penyebutPersepuluhan(str) {
  var v = nilaiTerpadu(str);
  if (!v) return null;
  var k = pangkatSepuluhUntuk(v.den);
  if (k === null) return null;
  var d = Math.pow(10, Math.max(k, 1));
  var n = Math.abs(v.num);
  var w = Math.floor(n / v.den);
  var r = n - w * v.den;
  return (v.num < 0 ? '−' : '') + (w ? w + ' ' : '') + (r * d) / v.den + '/' + d;
}

var UMPAN_BENTUK = {
  baku: function (s, hasil) {
    return (
      'Tepat! ' +
      tulisTerpadu(s) +
      ' = ' +
      hasil +
      (jenisBilangan(s) === 'pecahan' && penyebutPersepuluhan(s)
        ? ' (karena ' + tulisTerpadu(s) + ' = ' + penyebutPersepuluhan(s) + ').'
        : '. Nilainya sama, hanya bentuknya berbeda.')
    );
  },
  tanda: function (s) {
    return (
      'Angkanya sudah benar, tetapi tandanya hilang. ' +
      tulisTerpadu(s) +
      ' bilangan negatif, jadi bentuk setaranya juga harus bertanda −.'
    );
  },
  'angka-koma': function () {
    return 'Garis pecahan bukan tanda koma. Pecahan berarti pembilang DIBAGI penyebut — jadikan penyebutnya 10, 100, atau 1000 lebih dulu.';
  },
  'nol-koma': function () {
    return 'Pembilang dan penyebut tidak boleh ditulis berjajar di belakang koma. Ubah dulu penyebutnya menjadi 10, 100, atau 1000.';
  },
  penyebut: function () {
    return 'Angka di belakang koma bukan penyebutnya. Cari pecahan senilai yang penyebutnya 10, 100, atau 1000.';
  },
  pembilang: function () {
    return 'Pembilang saja belum cukup; penyebutnya menentukan nilai tempat. Samakan dulu penyebutnya menjadi 10, 100, atau 1000.';
  },
  'angka-pisah': function () {
    return 'Tanda koma bukan garis pecahan. Angka di belakang koma menunjukkan persepuluhan, perseratusan, dst. — itulah penyebutnya.';
  },
  'penyebut-salah': function (s) {
    var u = uraiTerpadu(s);
    var k = u && u.digits ? u.digits[3].length : 1;
    return (
      'Penyebutnya belum tepat. ' +
      tulisTerpadu(s) +
      ' punya ' +
      k +
      ' angka di belakang koma, jadi penyebutnya ' +
      Math.pow(10, k) +
      ', bukan yang lain.'
    );
  },
  terbalik: function () {
    return 'Pecahannya terbalik: pembilang dan penyebut tertukar sehingga nilainya berubah jauh.';
  },
  'penyebut-bulat': function () {
    return 'Bagian bulat dan bagian desimal tertukar tempat. Bagian desimal menunjukkan persepuluhan/perseratusan dari satu utuh.';
  },
  'koma-geser': function () {
    return 'Letak komanya bergeser. Bilangan bulat tidak berubah nilainya bila ditulis dengan ,0 di belakangnya.';
  },
};

/*
 * Pilihan bentuk setara (urutan wajar; acak di app):
 *   pecahan → desimal, desimal → pecahan, bulat → desimal ",0".
 * Setiap opsi { id, label, benar, umpan } — id 'baku' untuk yang benar.
 */
function opsiBentukSetara(str) {
  var u = uraiTerpadu(str);
  if (!u) return [];
  var v = nilaiTerpadu(str);
  var neg = v.num < 0;
  var sg = neg ? '−' : '';
  var benar;
  var calon = [];
  if (u.jenis === 'pecahan') {
    benar = keDesimalTerpadu(str);
    var p = u.p;
    var w = p.whole || 0;
    if (neg) calon.push(['tanda', benar.replace('−', '')]);
    calon.push(['angka-koma', sg + (w ? w + ',' + p.num + p.den : p.num + ',' + p.den)]);
    calon.push(['nol-koma', sg + w + ',' + p.num + p.den]);
    calon.push(['penyebut', sg + w + ',' + p.den]);
    calon.push(['pembilang', sg + w + ',' + p.num]);
  } else if (u.jenis === 'desimal') {
    benar = kePecahanTerpadu(str);
    var bulat = String(parseInt(u.digits[2], 10));
    var pec = u.digits[3];
    var kk = pec.length;
    var D = Math.abs(u.num);
    if (neg) calon.push(['tanda', benar.replace('−', '')]);
    if (bulat !== '0') calon.push(['angka-pisah', sg + bulat + '/' + parseInt(pec, 10)]);
    else if (pec.length >= 2) calon.push(['angka-pisah', sg + pec.charAt(0) + '/' + pec.slice(1)]);
    else calon.push(['angka-pisah', sg + '1/' + pec]);
    calon.push(['penyebut-salah', sg + D + '/' + (kk === 1 ? 100 : 10)]);
    calon.push(['terbalik', sg + Math.abs(v.den) + '/' + Math.abs(v.num)]);
    calon.push([
      'penyebut-salah',
      sg + (bulat !== '0' ? bulat + ' ' : '') + parseInt(pec, 10) + '/' + Math.pow(10, kk + 1),
    ]);
  } else {
    var n = Math.abs(v.num);
    benar = sg + n + ',0';
    if (neg) calon.push(['tanda', n + ',0']);
    calon.push(['koma-geser', sg + '0,' + n]);
    calon.push(['terbalik', sg + '1/' + n]);
    calon.push(['koma-geser', sg + n + '0,0']);
  }
  var opsi = [{ id: 'baku', label: benar, benar: true, umpan: UMPAN_BENTUK.baku(str, benar) }];
  var sudah = {};
  sudah[benar] = true;
  calon.forEach(function (c) {
    if (opsi.length >= 4) return;
    var label = c[1];
    if (sudah[label] || !nilaiTerpadu(label)) return;
    if (bandingTerpadu(label, str) === 0) return;
    sudah[label] = true;
    opsi.push({
      id: c[0] + '-' + opsi.length,
      label: label,
      benar: false,
      umpan: UMPAN_BENTUK[c[0]](str),
    });
  });
  return opsi;
}

/* "Angka yang tampak" (tanpa memikirkan nilai tempat) untuk diagnosa. */
function angkaTampakTerpadu(str) {
  var u = uraiTerpadu(str);
  if (!u) return null;
  if (u.jenis === 'pecahan') return u.p.whole ? null : u.p.num;
  if (u.jenis === 'desimal')
    return parseInt(u.digits[2], 10) === 0 ? parseInt(u.digits[3], 10) : null;
  return null;
}

/*
 * Diagnosa lambang yang dipilih murid untuk a ☐ b:
 *   null               benar
 *   'abaikan-negatif'  membandingkan angkanya saja tanpa memikirkan tanda −
 *   'beda-bentuk'      nilainya sama tetapi dianggap berbeda karena bentuknya lain
 *   'penyebut-besar'   penyebut lebih besar dianggap pecahan lebih besar
 *   'angka-lepas'      angka yang tampak dibandingkan langsung (25 vs 1)
 *   'lain'
 */
function diagnosaBandingTerpadu(a, b, symbolId) {
  var benar = simbolBandingTerpadu(a, b);
  if (benar === null || symbolId === benar) return null;
  var x = nilaiTerpadu(a);
  var y = nilaiTerpadu(b);
  if (x.num < 0 || y.num < 0) {
    var c = compareFractions(
      { num: Math.abs(x.num), den: x.den },
      { num: Math.abs(y.num), den: y.den }
    );
    var mutlak = c < 0 ? 'lt' : c > 0 ? 'gt' : 'eq';
    if (symbolId === mutlak) return 'abaikan-negatif';
  }
  if (benar === 'eq' && jenisBilangan(a) !== jenisBilangan(b)) return 'beda-bentuk';
  if (jenisBilangan(a) === 'pecahan' && jenisBilangan(b) === 'pecahan') {
    var pa = uraiTerpadu(a).p;
    var pb = uraiTerpadu(b).p;
    if (pa.den !== pb.den && symbolId === compareSymbolId(pa.den, pb.den)) return 'penyebut-besar';
  }
  if (jenisBilangan(a) !== jenisBilangan(b)) {
    var ta = angkaTampakTerpadu(a);
    var tb = angkaTampakTerpadu(b);
    if (ta !== null && tb !== null && symbolId === compareSymbolId(ta, tb)) return 'angka-lepas';
  }
  return 'lain';
}

function pesanDiagnosaTerpadu(kode, a, b) {
  var A = tulisTerpadu(a);
  var B = tulisTerpadu(b);
  switch (kode) {
    case 'abaikan-negatif':
      return (
        'Kamu membandingkan angkanya saja tanpa tanda. Untuk bilangan negatif, yang angkanya lebih besar justru letaknya lebih jauh di kiri 0 — jadi lebih KECIL. Bayangkan ' +
        A +
        ' dan ' +
        B +
        ' pada garis bilangan.'
      );
    case 'beda-bentuk':
      return (
        'Bentuknya memang berbeda, tetapi coba ubah ke bentuk yang sama. Apakah ' +
        A +
        ' dan ' +
        B +
        ' ternyata bernilai sama?'
      );
    case 'penyebut-besar':
      return 'Penyebut yang lebih besar berarti satu utuh dipotong lebih banyak, sehingga tiap potongnya lebih KECIL. Samakan penyebutnya dulu, lalu bandingkan.';
    case 'angka-lepas':
      return (
        'Angka yang tampak tidak bisa dibandingkan langsung karena ' +
        A +
        ' dan ' +
        B +
        ' bentuknya berbeda. Ubah dulu keduanya ke bentuk yang sama (misalnya desimal), baru bandingkan.'
      );
    default:
      return 'Belum tepat. Ubah kedua bilangan ke bentuk yang sama, lalu bayangkan letaknya pada garis bilangan: yang lebih kanan lebih besar.';
  }
}

/* Kalimat alasan baku "a ☐ b" (teks biasa, tanpa HTML). */
function alasanBandingTerpadu(a, b) {
  var A = tulisTerpadu(a);
  var B = tulisTerpadu(b);
  var sym = compareSymbolText(simbolBandingTerpadu(a, b));
  var simpul = ', jadi ' + A + ' ' + sym + ' ' + B + '.';
  var x = nilaiTerpadu(a);
  var y = nilaiTerpadu(b);
  if ((x.num < 0 && y.num >= 0) || (y.num < 0 && x.num >= 0)) {
    var negS = x.num < 0 ? A : B;
    var posS = x.num < 0 ? B : A;
    return (
      negS +
      ' bilangan negatif (di kiri 0), sedangkan ' +
      posS +
      (nilaiTerpadu(posS).num === 0 ? ' adalah nol' : ' positif') +
      '. Bilangan negatif selalu lebih kecil' +
      simpul
    );
  }
  var catatanNeg =
    x.num < 0 && y.num < 0 ? ' Pada bilangan negatif, yang lebih dekat ke 0 lebih besar.' : '';
  var da = keDesimalTerpadu(a);
  var db = keDesimalTerpadu(b);
  if (da !== null && db !== null) {
    var ubah = [];
    if (jenisBilangan(a) === 'pecahan') ubah.push(A + ' = ' + da);
    if (jenisBilangan(b) === 'pecahan') ubah.push(B + ' = ' + db);
    return (
      (ubah.length ? 'Ubah ke bentuk desimal: ' + ubah.join(' dan ') + '. ' : '') +
      'Bandingkan ' +
      da +
      ' dengan ' +
      db +
      ': ' +
      da +
      ' ' +
      sym +
      ' ' +
      db +
      '.' +
      catatanNeg +
      simpul.replace(/^, j/, ' J')
    );
  }
  var L = kpk(x.den, y.den);
  var fa = (x.num < 0 ? '−' : '') + (Math.abs(x.num) * L) / x.den + '/' + L;
  var fb = (y.num < 0 ? '−' : '') + (Math.abs(y.num) * L) / y.den + '/' + L;
  return (
    'Salah satunya tidak bisa menjadi desimal berhenti, jadi samakan penyebutnya: ' +
    A +
    ' = ' +
    fa +
    ' dan ' +
    B +
    ' = ' +
    fb +
    '. Karena ' +
    fa +
    ' ' +
    sym +
    ' ' +
    fb +
    '.' +
    catatanNeg +
    simpul.replace(/^, j/, ' J')
  );
}

/* Kata perbandingan per tema: kecil = bilangan yang lebih kecil. */
var KATA_BANDING_TERPADU = {
  suhu: { kecil: 'lebih dingin', besar: 'lebih hangat', sama: 'sama suhunya' },
  volume: { kecil: 'lebih sedikit', besar: 'lebih banyak', sama: 'sama banyak' },
  kas: { kecil: 'lebih buruk hasilnya', besar: 'lebih baik hasilnya', sama: 'sama hasilnya' },
  panjang: { kecil: 'lebih pendek', besar: 'lebih panjang', sama: 'sama panjang' },
  tinggi: { kecil: 'lebih rendah', besar: 'lebih tinggi', sama: 'sama tinggi' },
  berat: { kecil: 'lebih ringan', besar: 'lebih berat', sama: 'sama berat' },
};

function kataBandingTerpadu(tema) {
  return KATA_BANDING_TERPADU[tema] || KATA_BANDING_TERPADU.tinggi;
}

/* 'kecil' | 'besar' | 'sama' untuk a dibanding b. */
function idMaknaBandingTerpadu(a, b) {
  var c = bandingTerpadu(a, b);
  return c < 0 ? 'kecil' : c > 0 ? 'besar' : 'sama';
}

function maknaBandingTerpadu(a, b, tema) {
  return kataBandingTerpadu(tema)[idMaknaBandingTerpadu(a, b)];
}

/* Opsi makna perbandingan (urutan wajar; acak di app). */
function opsiMaknaBandingTerpadu(tema) {
  var K = kataBandingTerpadu(tema);
  return [
    { id: 'kecil', label: esc(K.kecil) },
    { id: 'besar', label: esc(K.besar) },
    { id: 'sama', label: esc(K.sama) },
  ];
}

/*
 * Memeriksa isian bilangan: nilai harus sama dengan `jawab`; `bentuk`
 * opsional ('desimal' | 'pecahan') mewajibkan bentuk tertentu.
 * Mengembalikan { benar, pesan } (pesan berupa HTML aman).
 */
function periksaIsianTerpadu(input, jawab, bentuk) {
  var s = normalTerpadu(input);
  if (!s) return { benar: false, pesan: 'Isi jawabanmu terlebih dahulu.' };
  var j = jenisBilangan(s);
  if (!j) {
    return {
      benar: false,
      pesan: 'Tulis bilangannya dengan benar, misalnya −2,25 (desimal pakai koma) atau 3/4.',
    };
  }
  var target = nilaiTerpadu(jawab);
  var v = nilaiTerpadu(s);
  var sama = compareFractions(v, target) === 0;
  var bentukOk = !bentuk || j === bentuk || (j === 'bulat' && target.den === 1);
  if (sama && bentukOk) return { benar: true, pesan: 'Tepat!' };
  if (sama) {
    return {
      benar: false,
      pesan:
        'Nilainya sudah sama, tetapi soal meminta bentuk <strong>' +
        esc(bentuk) +
        '</strong>' +
        (bentuk === 'desimal' ? ' (pakai tanda koma).' : ' (pakai garis pecahan, mis. 3/4).'),
    };
  }
  if (target.num !== 0 && compareFractions(v, { num: -target.num, den: target.den }) === 0) {
    return {
      benar: false,
      pesan:
        'Angkanya sudah benar, tetapi periksa <strong>tanda</strong>-nya: bilangan ini negatif atau positif?',
    };
  }
  var langkah = penyebutPersepuluhan(jawab);
  return {
    benar: false,
    pesan:
      'Belum tepat.' +
      (langkah && jenisBilangan(jawab) === 'pecahan'
        ? ' Coba jadikan penyebutnya 10, 100, atau 1000 lebih dulu.'
        : ' Periksa lagi nilai tempatnya.'),
  };
}

/* Chip bilangan: pecahan bersusun, desimal/bulat dengan minus tipografis. */
function buildBilanganChip(str, big) {
  var u = uraiTerpadu(str);
  var cls = 'num-chip' + (big ? ' num-chip--lg' : '');
  if (u && u.jenis === 'pecahan') {
    return (
      '<span class="' +
      cls +
      ' num-chip--frac">' +
      (u.num < 0 ? '<span class="num-chip__sign">−</span>' : '') +
      buildFracInline(u.p.num, u.p.den, u.p.whole || null) +
      '</span>'
    );
  }
  return '<span class="' + cls + '">' + esc(tulisTerpadu(str)) + '</span>';
}

/* Kalimat perbandingan besar [a] ☐ [b]; symbolId null → '?'. */
function buildKalimatBandingTerpadu(a, b, symbolId) {
  return (
    '<div class="cmp-sentence" aria-label="' +
    esc(
      tulisTerpadu(a) +
        ' ' +
        (symbolId ? compareSymbolText(symbolId) : 'kotak kosong') +
        ' ' +
        tulisTerpadu(b)
    ) +
    '">' +
    buildBilanganChip(a, true) +
    '<span class="cmp-sentence__sym' +
    (symbolId ? ' is-filled' : '') +
    '">' +
    esc(symbolId ? compareSymbolText(symbolId) : '?') +
    '</span>' +
    buildBilanganChip(b, true) +
    '</div>'
  );
}

/* Tombol lambang <, >, = (urutan dari State) dengan umpan balik berdiagnosa. */
function buildPilihSimbolTerpadu(a, b, order, st, opts) {
  opts = opts || {};
  var benarId = simbolBandingTerpadu(a, b);
  var benar = st.chosen === benarId;
  var salah = !!st.chosen && !benar;
  return (
    '<div class="cmp-symbols">' +
    buildChoiceGroup(COMPARE_SYMBOLS, order, {
      chosen: st.chosen,
      correctId: benar ? benarId : null,
      grade: true,
      locked: benar,
      group: opts.group || 'ter-cmp',
      attr: 'data-ter-sym',
    }) +
    '</div>' +
    (benar
      ? buildFeedbackBox('success', '✓', esc(alasanBandingTerpadu(a, b)))
      : salah
      ? buildFeedbackBox(
          'warning',
          '💭',
          esc(pesanDiagnosaTerpadu(diagnosaBandingTerpadu(a, b, st.chosen), a, b))
        )
      : '')
  );
}

function bindPilihSimbolTerpadu(root, getPair, getState, save, rerender) {
  root.querySelectorAll('[data-ter-sym]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.dataset.group;
      var pair = getPair(group);
      var st = getState(group);
      if (!pair || !st) return;
      var benarId = simbolBandingTerpadu(pair[0], pair[1]);
      if (st.chosen === benarId) return;
      st.chosen = btn.dataset.terSym;
      if (st.chosen !== benarId) st.wrong = (st.wrong || 0) + 1;
      save();
      rerender();
    });
  });
}

/*
 * Tabel bentuk setara: satu baris per bilangan dengan kolom bentuk
 * asli, pecahan paling sederhana, dan desimal ("≈ berulang" bila tidak
 * berhenti). rows [{ label, nilai }]; opts.caption opsional.
 */
function buildTabelBentukTerpadu(rows, opts) {
  opts = opts || {};
  return (
    '<div class="table-scroll"><table class="data-table bentuk-tabel">' +
    (opts.caption ? '<caption>' + esc(opts.caption) + '</caption>' : '') +
    '<thead><tr><th scope="col">Data</th><th scope="col">Tertulis</th><th scope="col">Pecahan</th><th scope="col">Desimal</th></tr></thead><tbody>' +
    rows
      .map(function (r) {
        var d = keDesimalTerpadu(r.nilai);
        return (
          '<tr><th scope="row">' +
          esc(r.label) +
          '</th><td>' +
          buildBilanganChip(r.nilai) +
          '</td><td>' +
          buildBilanganChip(kePecahanTerpadu(r.nilai)) +
          '</td><td>' +
          (d !== null ? buildBilanganChip(d) : '<span class="dl-caption">berulang</span>') +
          '</td></tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

/* Posisi bilangan pada garis berlangkah 1/n (bilangan bulat k) atau null. */
function skalaTerpadu(str, n) {
  var v = nilaiTerpadu(str);
  if (!v) return null;
  var k = (v.num * n) / v.den;
  return k === Math.round(k) ? k : null;
}

/* k langkah 1/n → teks pecahan apa adanya: (−6, 4) → "−1 2/4". */
function teksSkalaTerpadu(k, n) {
  var sign = k < 0 ? '−' : '';
  var a = Math.abs(k);
  var w = Math.floor(a / n);
  var r = a - w * n;
  if (!r) return sign + w;
  return sign + (w ? w + ' ' : '') + r + '/' + n;
}

function petunjukLetakTerpadu(str, n) {
  var k = skalaTerpadu(str, n);
  var S = tulisTerpadu(str);
  if (k === null) return S + ' tidak tepat berada pada titik garis ini.';
  if (k === 0) return '0 adalah titik acuan di tengah garis.';
  return (
    S +
    ' = ' +
    teksSkalaTerpadu(k, n) +
    ', yaitu ' +
    Math.abs(k) +
    ' langkah kecil (tiap langkah 1/' +
    n +
    ') di sebelah ' +
    (k < 0 ? 'kiri' : 'kanan') +
    ' 0. Hitung langkahnya mulai dari 0.'
  );
}

/*
 * Garis bilangan (SVG) dari min sampai max (bulat) berlangkah 1/langkah.
 *   opts.marks        [{ k, label, tone }] — k posisi dalam langkah
 *   opts.interactive  false → hanya gambar
 * Titik yang bisa diketuk membawa data-nl-value = k (bilangan bulat).
 * Pasang event dengan bindNumberLinePicker(root, id, onPick).
 */
function buildGarisTerpadu(id, opts) {
  opts = opts || {};
  var n = opts.langkah || 4;
  var kMin = (opts.min !== undefined ? opts.min : -2) * n;
  var kMax = (opts.max !== undefined ? opts.max : 2) * n;
  var interactive = opts.interactive !== false;
  var unit = opts.unit || 46;
  var padX = 36;
  var H = 116;
  var axisY = 70;
  var W = padX * 2 + (kMax - kMin) * unit;
  function xOf(k) {
    return padX + (k - kMin) * unit;
  }
  var x0 = xOf(kMin) - 22;
  var x1 = xOf(kMax) + 22;
  var html =
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
    '"/>';
  for (var k = kMin; k <= kMax; k++) {
    var x = xOf(k);
    var major = k % n === 0;
    var h = major ? 14 : 8;
    var label = teksSkalaTerpadu(k, n);
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
      (major
        ? '<text class="nlp-num nlp-num--major" x="' +
          x +
          '" y="' +
          (axisY + 34) +
          '">' +
          esc(label) +
          '</text>'
        : '');
    if (interactive) {
      html +=
        '<g class="nlp-hit" role="button" tabindex="0" data-nl-value="' +
        k +
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
        '" r="12"/>' +
        tick +
        '</g>';
    } else {
      html += tick;
    }
  }
  (opts.marks || []).forEach(function (m) {
    if (m.k === null || m.k === undefined || m.k < kMin || m.k > kMax) return;
    var mx = xOf(m.k);
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
    '" data-zero="' +
    xOf(0) +
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
        'Garis bilangan dari ' +
          teksSkalaTerpadu(kMin, n) +
          ' sampai ' +
          teksSkalaTerpadu(kMax, n) +
          ', setiap langkah kecil 1/' +
          n
    ) +
    '">' +
    html +
    '</svg>' +
    '</div>'
  );
}

/*
 * Menempatkan bilangan campuran bentuk satu per satu pada garis
 * berlangkah 1/langkah. State: ensureNumberLinePlacementState() (seksi 11)
 * dengan `salah` berupa posisi k.
 *   items  [{ nilai, teks? }] dalam urutan tampil (sudah diacak)
 *   cfg    { min, max, langkah, doneText }
 */
function buildPenempatanTerpadu(pid, items, st, cfg) {
  cfg = cfg || {};
  var n = cfg.langkah || 4;
  var done = numberLinePlacementDone(items, st);
  var marks = items.slice(0, Math.min(st.idx, items.length)).map(function (it) {
    return { k: skalaTerpadu(it.nilai, n), label: tulisTerpadu(it.nilai), tone: 'ok' };
  });
  var adaSalah = !done && st.salah !== null && st.salah !== undefined;
  if (adaSalah) marks.push({ k: st.salah, label: '?', tone: 'bad' });
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
      buildBilanganChip(target.nilai, true) +
      (target.teks ? ' <span class="dl-caption">(' + esc(target.teks) + ')</span>' : '') +
      '</span>' +
      '</div>';
    if (adaSalah) {
      var nSalah = st.wrong[st.idx] || 0;
      feedback = buildFeedbackBox(
        'warning',
        '💭',
        esc(
          'Titik yang kamu ketuk adalah ' +
            teksSkalaTerpadu(st.salah, n) +
            ', bukan ' +
            tulisTerpadu(target.nilai) +
            '. ' +
            (nSalah >= 2
              ? petunjukLetakTerpadu(target.nilai, n)
              : 'Apakah ' +
                tulisTerpadu(target.nilai) +
                ' di kiri atau kanan 0? Terletak di antara dua bilangan bulat yang mana?')
        )
      );
    }
  }
  return (
    head +
    buildGarisTerpadu(pid, {
      min: cfg.min,
      max: cfg.max,
      langkah: n,
      marks: marks,
      interactive: !done,
    }) +
    feedback
  );
}

function bindPenempatanTerpadu(root, pid, items, st, langkah, save, rerender) {
  bindNumberLinePicker(root, pid, function (k) {
    if (numberLinePlacementDone(items, st)) return;
    if (k === skalaTerpadu(items[st.idx].nilai, langkah)) {
      st.idx += 1;
      st.salah = null;
    } else {
      st.salah = k;
      st.wrong[st.idx] = (st.wrong[st.idx] || 0) + 1;
    }
    save();
    rerender();
  });
}

/* ============================================================
   39. BENTUK ALJABAR BERPANGKAT (MONOMIAL)
   Monomial { koef: {num, den}, pangkat: { <var>: n } } dengan eksponen
   bulat (boleh nol/negatif) untuk latihan menyederhanakan bentuk
   aljabar berpangkat: operasi kali, bagi, pangkat; pohon ekspresi;
   penulisan dengan eksponen positif; diagnosa miskonsepsi; isian
   koefisien & eksponen. Memakai pecahan eksak dari seksi 27. Gaya
   .mono-* ada di shared/base.css.

   Pohon ekspresi:
     daun      { koef, pangkat }          koef bulat atau {num, den};
                                          eksponen 0 tetap ditampilkan
     { op: 'kali', a, b }   a × b
     { op: 'bagi', a, b }   a : b (ditampilkan sebagai pecahan)
     { op: 'pangkat', a, k } (a)ᵏ
   ============================================================ */

function monomial(koef, pangkat) {
  var p = {};
  Object.keys(pangkat || {}).forEach(function (v) {
    if (pangkat[v] !== 0) p[v] = pangkat[v];
  });
  return { koef: keFraksi(koef), pangkat: p };
}

function gabungPangkatMonomial(p, q, tanda) {
  var out = {};
  Object.keys(p.pangkat).forEach(function (v) {
    out[v] = p.pangkat[v];
  });
  Object.keys(q.pangkat).forEach(function (v) {
    out[v] = (out[v] || 0) + tanda * q.pangkat[v];
  });
  return out;
}

function kaliMonomial(p, q) {
  if (!p || !q) return null;
  return monomial(kaliPecahan(p.koef, q.koef), gabungPangkatMonomial(p, q, 1));
}

/* null bila pembagi berkoefisien 0. */
function bagiMonomial(p, q) {
  if (!p || !q || q.koef.num === 0) return null;
  return monomial(bagiPecahan(p.koef, q.koef), gabungPangkatMonomial(p, q, -1));
}

/* null bila koefisien 0 dipangkatkan 0 atau negatif. */
function pangkatMonomial(p, k) {
  if (!p) return null;
  var koef = pangkatBulat(p.koef, k);
  if (koef === null) return null;
  var out = {};
  Object.keys(p.pangkat).forEach(function (v) {
    out[v] = p.pangkat[v] * k;
  });
  return monomial(koef, out);
}

function samaMonomial(p, q) {
  if (!p || !q || !samaPecahan(p.koef, q.koef)) return false;
  var vars = Object.keys(p.pangkat).concat(Object.keys(q.pangkat));
  return vars.every(function (v) {
    return (p.pangkat[v] || 0) === (q.pangkat[v] || 0);
  });
}

/* Nilai monomial untuk nilai variabel `vals` (bulat); null bila tak terdefinisi. */
function nilaiMonomial(m, vals) {
  var hasil = m.koef;
  var vars = Object.keys(m.pangkat);
  for (var i = 0; i < vars.length; i++) {
    hasil = kaliPecahan(hasil, pangkatBulat(vals[vars[i]], m.pangkat[vars[i]]));
    if (hasil === null) return null;
  }
  return hasil;
}

function hitungEkspresiMonomial(e) {
  if (e.op === 'kali')
    return kaliMonomial(hitungEkspresiMonomial(e.a), hitungEkspresiMonomial(e.b));
  if (e.op === 'bagi')
    return bagiMonomial(hitungEkspresiMonomial(e.a), hitungEkspresiMonomial(e.b));
  if (e.op === 'pangkat') return pangkatMonomial(hitungEkspresiMonomial(e.a), e.k);
  return monomial(e.koef, e.pangkat);
}

/* Bagian variabel: 'x⁻²y³'; eksponen 1 tidak ditulis; urut abjad. */
function tulisVariabel(pangkat, keepZero) {
  return Object.keys(pangkat || {})
    .sort()
    .filter(function (v) {
      return keepZero || pangkat[v] !== 0;
    })
    .map(function (v) {
      return v + (pangkat[v] === 1 ? '' : superskrip(fmtBulat(pangkat[v])));
    })
    .join('');
}

/* Koefisien di depan variabel: 1 → '', −1 → '−', 1/4 → '(1/4)'. */
function tulisKoefisien(koef, adaVar) {
  if (!adaVar) return formatPecahan(koef);
  if (koef.den !== 1) return '(' + formatPecahan(koef) + ')';
  if (koef.num === 1) return '';
  if (koef.num === -1) return '−';
  return formatPecahan(koef);
}

function formatSuku(koef, pangkat, keepZero) {
  var vars = tulisVariabel(pangkat, keepZero);
  return tulisKoefisien(keFraksi(koef), vars !== '') + vars;
}

/*
 * Bentuk dengan eksponen positif: { atas, bawah }. Tanda ikut pembilang;
 * eksponen negatif (dan penyebut koefisien) pindah ke penyebut.
 * bawah '' bila penyebutnya 1.
 */
function bentukPositifMonomial(m) {
  var atasVar = {};
  var bawahVar = {};
  Object.keys(m.pangkat).forEach(function (v) {
    if (m.pangkat[v] > 0) atasVar[v] = m.pangkat[v];
    else bawahVar[v] = -m.pangkat[v];
  });
  var tanda = m.koef.num < 0 ? '−' : '';
  var num = Math.abs(m.koef.num);
  var av = tulisVariabel(atasVar);
  var bv = tulisVariabel(bawahVar);
  var atas = tanda + (av ? (num === 1 ? '' : formatNumber(num)) + av : formatNumber(num));
  var bawah = m.koef.den === 1 ? bv : formatNumber(m.koef.den) + bv;
  return {
    atas: atas,
    bawah: bawah,
    faktorBawah: (m.koef.den === 1 ? 0 : 1) + Object.keys(bawahVar).length,
  };
}

/* opts.positif true → '3y⁴/x⁵', 'a²/(4b²)'; selain itu bentuk mentah '6x⁻²y³'. */
function formatMonomial(m, opts) {
  if (!(opts && opts.positif)) return formatSuku(m.koef, m.pangkat);
  var b = bentukPositifMonomial(m);
  if (!b.bawah) return b.atas;
  return b.atas + '/' + (b.faktorBawah > 1 ? '(' + b.bawah + ')' : b.bawah);
}

function formatEkspresiMonomial(e) {
  function anak(x, induk, kanan) {
    var t = formatEkspresiMonomial(x);
    if (x.op === 'pangkat') return t;
    if (induk === 'bagi') return '(' + t + ')';
    if (x.op === 'bagi') return '(' + t + ')';
    if (!x.op && kanan && keFraksi(x.koef).num < 0) return '(' + t + ')';
    return t;
  }
  if (e.op === 'kali') return anak(e.a, 'kali') + ' × ' + anak(e.b, 'kali', true);
  if (e.op === 'bagi') return anak(e.a, 'bagi') + ' : ' + anak(e.b, 'bagi', true);
  if (e.op === 'pangkat') {
    return '(' + formatEkspresiMonomial(e.a) + ')' + superskrip(fmtBulat(e.k));
  }
  return formatSuku(e.koef, e.pangkat, true);
}

function buildMonoFrac(atas, bawah) {
  return (
    '<span class="mono-frac" aria-hidden="true">' +
    '<span class="mono-frac__atas">' +
    esc(atas) +
    '</span>' +
    '<span class="mono-frac__bar"></span>' +
    '<span class="mono-frac__bawah">' +
    esc(bawah) +
    '</span>' +
    '</span>'
  );
}

/* Ekspresi soal; pembagian di tingkat teratas ditampilkan sebagai pecahan bersusun. */
function buildEkspresiMonomial(e) {
  var teks = formatEkspresiMonomial(e);
  var isi =
    e.op === 'bagi'
      ? buildMonoFrac(formatEkspresiMonomial(e.a), formatEkspresiMonomial(e.b))
      : '<span aria-hidden="true">' + esc(teks) + '</span>';
  return '<span class="mono-expr" role="math" aria-label="' + esc(teks) + '">' + isi + '</span>';
}

/* Monomial dengan eksponen positif; berpenyebut → pecahan bersusun. */
function buildMonomialPositif(m) {
  var b = bentukPositifMonomial(m);
  var teks = formatMonomial(m, { positif: true });
  var isi = b.bawah
    ? buildMonoFrac(b.atas, b.bawah)
    : '<span aria-hidden="true">' + esc(b.atas) + '</span>';
  return '<span class="mono-expr" role="math" aria-label="' + esc(teks) + '">' + isi + '</span>';
}

/*
 * Diagnosa jawaban monomial terhadap kunci:
 *   'benar'
 *   eksponen semua benar, koefisien salah:
 *     'negatifJadiMinus' (koef = −1/kunci, mis. 2⁻² ditulis −4)
 *     'koefisienTerbalik' (koef = 1/kunci)
 *     'tandaKoefisien'   (koef = −kunci)
 *     'koefisien'
 *   koefisien benar, eksponen salah:
 *     'tandaEksponen' (ada eksponen yang tandanya terbalik)
 *     'eksponen'
 *   'lain'
 */
function diagnosaMonomial(kunci, jawab) {
  if (!jawab) return 'lain';
  if (samaMonomial(kunci, jawab)) return 'benar';
  var k = kunci.koef;
  var j = jawab.koef;
  var pangkatSama = samaMonomial(monomial(1, kunci.pangkat), monomial(1, jawab.pangkat));
  if (pangkatSama) {
    if (k.num !== 0) {
      if (samaPecahan(j, pecahan(-k.den, k.num))) return 'negatifJadiMinus';
      if (samaPecahan(j, pecahan(k.den, k.num))) return 'koefisienTerbalik';
    }
    if (samaPecahan(j, pecahan(-k.num, k.den))) return 'tandaKoefisien';
    return 'koefisien';
  }
  if (samaPecahan(j, k)) {
    var vars = Object.keys(kunci.pangkat).concat(Object.keys(jawab.pangkat));
    var terbalik = vars.some(function (v) {
      var a = kunci.pangkat[v] || 0;
      return a !== 0 && (jawab.pangkat[v] || 0) === -a;
    });
    return terbalik ? 'tandaEksponen' : 'eksponen';
  }
  return 'lain';
}

function pesanDiagnosaMonomial(kode) {
  var pesan = {
    negatifJadiMinus:
      'Eksponennya sudah tepat, tetapi koefisiennya belum. Pangkat negatif pada bilangan berarti <strong>kebalikan</strong>, bukan bilangan negatif: 2⁻² = 1/4, bukan −4.',
    koefisienTerbalik:
      'Eksponen variabel sudah tepat. Periksa koefisiennya: kamu menuliskan kebalikannya. Hitung ulang koefisien dengan sifat pangkat yang sama seperti variabelnya.',
    tandaKoefisien:
      'Hampir tepat — hanya tanda koefisiennya yang terbalik. Ingat: pangkat negatif tidak mengubah tanda bilangan.',
    koefisien:
      'Eksponen variabel sudah tepat. Koefisien belum: kalikan/bagi koefisien sebagai bilangan biasa, dan pangkatkan koefisien juga bila seluruh suku dipangkatkan.',
    tandaEksponen:
      'Ada eksponen yang tandanya terbalik. Saat membagi, eksponen penyebut <em>dikurangkan</em>: aᵐ : aⁿ = aᵐ⁻ⁿ, dan pengurangan bilangan negatif menjadi penjumlahan.',
    eksponen:
      'Koefisiennya tepat, tetapi ada eksponen yang belum. Kumpulkan eksponen tiap variabel: dijumlah saat dikali, dikurangi saat dibagi, dikali saat dipangkatkan.',
    lain: 'Belum tepat. Kerjakan per bagian: koefisien dulu, lalu eksponen setiap variabel satu per satu.',
  };
  return pesan[kode] || pesan.lain;
}

/*
 * Membaca isian { koef, <var>: eksponen } → { value: monomial|null,
 * error: null|'empty'|'invalid' }. Koefisien 0 tidak valid.
 */
function bacaMonomialInput(vars, inputs) {
  inputs = inputs || {};
  var k = parseInputPecahan(String(inputs.koef || ''));
  if (k.error) return { value: null, error: k.error };
  if (k.value.num === 0) return { value: null, error: 'invalid' };
  var pangkat = {};
  for (var i = 0; i < vars.length; i++) {
    var s = String(inputs[vars[i]] || '')
      .trim()
      .replace(/−/g, '-');
    if (s === '') return { value: null, error: 'empty' };
    if (!/^[-+]?\d+$/.test(s)) return { value: null, error: 'invalid' };
    pangkat[vars[i]] = parseInt(s, 10);
  }
  return { value: monomial(k.value, pangkat), error: null };
}

/*
 * Isian monomial: koefisien lalu setiap variabel dengan kotak eksponen
 * kecil di posisi superskrip.
 *   opts.locked  isian dinonaktifkan
 *   opts.error   tandai isian salah
 */
function buildMonomialInput(id, vars, inputs, opts) {
  opts = opts || {};
  inputs = inputs || {};
  function kotak(key, cls, aria) {
    return (
      '<input type="text" class="input-text ' +
      cls +
      (opts.error ? ' has-error' : '') +
      '" id="' +
      id +
      '-' +
      key +
      '" data-mono="' +
      esc(id) +
      '" data-key="' +
      esc(key) +
      '" inputmode="text" autocomplete="off" value="' +
      esc(inputs[key] || '') +
      '" aria-label="' +
      esc(aria) +
      '" placeholder="…"' +
      (opts.locked ? ' disabled' : '') +
      '>'
    );
  }
  return (
    '<div class="mono-input" role="group" aria-label="Isian bentuk sederhana">' +
    kotak('koef', 'mono-input__koef', 'Koefisien') +
    vars
      .map(function (v) {
        return (
          '<span class="mono-input__var"><span class="mono-input__huruf">' +
          esc(v) +
          '</span>' +
          kotak(v, 'mono-input__exp', 'Eksponen ' + v) +
          '</span>'
        );
      })
      .join('') +
    '</div>'
  );
}

function bindMonomialInput(root, id, inputs, save, onEnter) {
  root.querySelectorAll('[data-mono="' + id + '"]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      inputs[inp.dataset.key] = inp.value;
      save();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && onEnter) onEnter();
    });
  });
}
