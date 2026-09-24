'use strict';

/* ============================================================
   app-stage-selidik-samakan.js — Tahap 5: Penyelidikan 2,
   menyamakan penyebut (PBL Sintaks 3)
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

var SAMAKAN_KPK = kpkBanyak(
  DATA.selidikSamakan.labPecahan.map(function (f) {
    return f.den;
  })
);

/* Satu baris pita pada lab "potong ulang" untuk pilihan n potong. */
function buildBarisPotongUlang(f, n) {
  var bisa = n && n % f.den === 0;
  var num = bisa ? (f.num * n) / f.den : f.num;
  var den = bisa ? n : f.den;
  return (
    '<div class="pita-row">' +
    '<span class="pita-row__nama">' +
    esc(f.nama) +
    '</span>' +
    buildFractionModel(num, den, 0, {
      wide: true,
      group: bisa ? n / f.den : 0,
      aria: 'Pita dibagi ' + den + ' bagian sama besar, ' + num + ' terarsir',
    }) +
    '<span class="pita-row__frac">' +
    (bisa
      ? fracChain([
          [f.num, f.den],
          [num, den],
        ])
      : buildFracInline(f.num, f.den) + (n ? ' <span class="lab-x">✗</span>' : '')) +
    '</span>' +
    '</div>'
  );
}

function renderSelidikSamakan(container) {
  var D = DATA.selidikSamakan;
  var L = State.labSamakan;
  var n = L.n;
  var gagal = n
    ? D.labPecahan.filter(function (f) {
        return n % f.den !== 0;
      })
    : [];
  var langkahSelesai = stepsDone(State.samakanSteps);
  var benar = State.samakanSimpul === D.simpulan.correct;

  var fb = '';
  if (n && gagal.length) {
    fb = buildFeedbackBox(
      'warning',
      '✋',
      gagal
        .map(function (f) {
          return (
            'Pita ' +
            esc(f.nama) +
            ' (' +
            f.den +
            ' potong) tidak bisa dipotong ulang menjadi ' +
            n +
            ' bagian sama besar, karena ' +
            n +
            ' bukan kelipatan ' +
            f.den +
            '.'
          );
        })
        .join('<br>')
    );
  } else if (n && n === SAMAKAN_KPK) {
    fb = buildFeedbackBox(
      'success',
      '🎉',
      '<strong>Berhasil dengan potongan paling sedikit!</strong> ' +
        n +
        ' adalah kelipatan 4 sekaligus kelipatan 3 yang terkecil, yaitu <strong>KPK(4, 3) = ' +
        n +
        '</strong>. Sekarang potongannya sama besar: 9 potong lawan 8 potong, jadi Melati menjual lebih banyak daripada Anggrek.'
    );
  } else if (n) {
    fb = buildFeedbackBox(
      'info',
      '🔍',
      '<strong>Berhasil!</strong> ' +
        n +
        ' adalah kelipatan 4 dan kelipatan 3, jadi kedua pita bisa dipotong ulang. Apakah ada banyak potongan yang LEBIH SEDIKIT yang juga berhasil?'
    );
  }

  container.innerHTML =
    '<section aria-label="Penyelidikan 2: Menyamakan Penyebut">' +
    buildHead(D) +
    buildDlPanel(
      '<p style="margin:0;">📌 Hasil penyelidikan 1: Melati ' +
        fracChain([
          [6, 8],
          [3, 4],
        ]) +
        ' dan Anggrek ' +
        fracChain([
          [8, 12],
          [2, 3],
        ]) +
        '. Potongannya masih berbeda ukuran, jadi belum bisa dibandingkan langsung.</p>',
      'panel--info'
    ) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Laboratorium "Potong Ulang"</h3>' +
        '<p>' +
        esc(D.labInstruksi) +
        '</p>' +
        '<div class="pita-list">' +
        D.labPecahan
          .map(function (f) {
            return buildBarisPotongUlang(f, n);
          })
          .join('') +
        '</div>' +
        '<p class="exercise-label">Potong ulang kedua pita menjadi …</p>' +
        '<div class="lab-chips" role="group" aria-label="Pilih banyak potongan baru">' +
        orderByIds(D.kandidat, L.order)
          .map(function (c) {
            var aktif = String(n) === c.id;
            return (
              '<button type="button" class="lab-chip' +
              (aktif ? ' is-active' : '') +
              (L.tried.indexOf(c.id) !== -1 ? ' is-tried' : '') +
              '" data-potong="' +
              esc(c.id) +
              '" aria-pressed="' +
              (aktif ? 'true' : 'false') +
              '">' +
              esc(c.label) +
              '</button>'
            );
          })
          .join('') +
        '</div>' +
        (fb ? '<div style="margin-top:var(--space-3);">' + fb + '</div>' : '')
    ) +
    (L.found
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧩 ' +
            D.langkahJudul +
            '</h3>' +
            buildStepChain('sm', D.langkah, State.samakanSteps)
        )
      : '') +
    (L.found && langkahSelesai
      ? buildDlPanel(
          buildRetryChoice(
            D.simpulan,
            State.samakanSimpulOrder,
            State.samakanSimpul,
            'data-sm-simpul'
          ),
          'panel--hero'
        )
      : '') +
    (benar && L.found && langkahSelesai
      ? buildDlNextButton('samakanNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  var rerender = function () {
    renderSelidikSamakan(container);
  };

  container.querySelectorAll('[data-potong]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      L.n = parseInt(btn.dataset.potong, 10);
      if (L.tried.indexOf(btn.dataset.potong) === -1) L.tried.push(btn.dataset.potong);
      if (L.n === SAMAKAN_KPK) L.found = true;
      saveState();
      rerender();
    });
  });

  bindStepChain('sm', D.langkah, State.samakanSteps, rerender);

  bindRetryChoice(
    container,
    'data-sm-simpul',
    function () {
      return State.samakanSimpul === D.simpulan.correct;
    },
    function (id) {
      State.samakanSimpul = id;
      saveState();
      rerender();
    }
  );

  bindNext('samakanNextBtn', 'selidikSamakan', 'latihSamakan');
}
