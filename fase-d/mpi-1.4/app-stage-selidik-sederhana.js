'use strict';

/* ============================================================
   app-stage-selidik-sederhana.js — Tahap 3: Penyelidikan 1,
   menyederhanakan pecahan (PBL Sintaks 3)
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* Hasil mencoba "gabung tiap k potong" pada pecahan num/den. */
function hasilGabung(num, den, k) {
  if (den % k !== 0) {
    return {
      ok: false,
      group: 0,
      pesan:
        'Loyang ' +
        den +
        ' potong tidak bisa dikelompokkan rata per ' +
        k +
        ' — ada potongan yang tersisa (' +
        den +
        ' tidak habis dibagi ' +
        k +
        ').',
    };
  }
  if (num % k !== 0) {
    return {
      ok: false,
      group: k,
      pesan:
        'Potongan baru memang sama besar, tetapi ada potongan baru yang hanya terarsir sebagian (' +
        num +
        ' tidak habis dibagi ' +
        k +
        '). Pembilangnya tidak bisa ditulis sebagai bilangan bulat.',
    };
  }
  var n2 = num / k;
  var d2 = den / k;
  return {
    ok: true,
    group: k,
    num: n2,
    den: d2,
    sederhana: gcd(n2, d2) === 1,
  };
}

function buildLabSederhana(it, st) {
  var h = st.k ? hasilGabung(it.num, it.den, st.k) : null;
  var visual =
    '<div class="lab-visual">' +
    '<div class="lab-visual__row"><span class="lab-visual__cap">Sebelum</span>' +
    buildFractionModel(it.num, it.den, 0, {
      wide: true,
      group: h ? h.group : 0,
      aria: 'Pita dibagi ' + it.den + ' bagian, ' + it.num + ' terarsir',
    }) +
    buildFracBlock(it.num, it.den, null, 'large') +
    '</div>' +
    (h && h.ok
      ? '<div class="lab-visual__row"><span class="lab-visual__cap">Sesudah</span>' +
        buildFractionModel(h.num, h.den, 0, {
          wide: true,
          aria: 'Pita dibagi ' + h.den + ' bagian, ' + h.num + ' terarsir',
        }) +
        buildFracBlock(h.num, h.den, null, 'large') +
        '</div>'
      : '') +
    '</div>';

  var fb = '';
  if (h && !h.ok) {
    fb = buildFeedbackBox('warning', '✋', h.pesan);
  } else if (h && h.sederhana) {
    fb = buildFeedbackBox(
      'success',
      '🎉',
      '<strong>Paling sederhana!</strong> ' +
        fracChain([
          [it.num, it.den],
          [h.num, h.den],
        ]) +
        '. Pembilang dan penyebut sama-sama dibagi ' +
        st.k +
        ', dan luas bagian terarsir tidak berubah. ' +
        h.num +
        ' dan ' +
        h.den +
        ' tidak bisa lagi dibagi bilangan yang sama (selain 1).'
    );
  } else if (h) {
    fb = buildFeedbackBox(
      'info',
      '🔍',
      '<strong>Senilai!</strong> ' +
        fracChain([
          [it.num, it.den],
          [h.num, h.den],
        ]) +
        ', tetapi potongannya masih bisa digabung lagi. Coba pembagi lain agar langsung paling sederhana.'
    );
  }

  return (
    '<div class="lab-card' +
    (st.found ? ' is-found' : '') +
    '">' +
    '<h4 class="lab-card__title">' +
    esc(it.nama) +
    ': ' +
    buildFracInline(it.num, it.den) +
    (st.found ? ' <span class="lab-card__badge">✓ ditemukan</span>' : '') +
    '</h4>' +
    visual +
    '<p class="exercise-label">Gabung tiap … potong:</p>' +
    '<div class="lab-chips" role="group" aria-label="Pilih banyak potongan yang digabung">' +
    orderByIds(it.kandidat, st.order)
      .map(function (c) {
        var tried = st.tried.indexOf(c.id) !== -1;
        return (
          '<button type="button" class="lab-chip' +
          (String(st.k) === c.id ? ' is-active' : '') +
          (tried ? ' is-tried' : '') +
          '" data-lab="' +
          esc(it.id) +
          '" data-k="' +
          esc(c.id) +
          '" aria-pressed="' +
          (String(st.k) === c.id ? 'true' : 'false') +
          '">' +
          esc(c.label) +
          '</button>'
        );
      })
      .join('') +
    '</div>' +
    (fb ? '<div style="margin-top:var(--space-3);">' + fb + '</div>' : '') +
    '</div>'
  );
}

function renderSelidikSederhana(container) {
  var D = DATA.selidikSederhana;
  var labs = State.labSederhana;
  var labSelesai = D.lab.every(function (it) {
    return labs[it.id].found;
  });
  var langkahSelesai = stepsDone(State.sederhanaSteps);
  var benar = State.sederhanaSimpul === D.simpulan.correct;

  container.innerHTML =
    '<section aria-label="Penyelidikan 1: Menyederhanakan">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Laboratorium "Gabung Potongan"</h3>' +
        '<p>' +
        esc(D.labInstruksi) +
        '</p>' +
        D.lab
          .map(function (it) {
            return buildLabSederhana(it, labs[it.id]);
          })
          .join('')
    ) +
    (labSelesai
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🧩 ' +
            D.langkahJudul +
            '</h3>' +
            buildStepChain('ss', D.langkah, State.sederhanaSteps)
        )
      : '') +
    (labSelesai && langkahSelesai
      ? buildDlPanel(
          buildRetryChoice(
            D.simpulan,
            State.sederhanaSimpulOrder,
            State.sederhanaSimpul,
            'data-ss-simpul'
          ),
          'panel--hero'
        )
      : '') +
    (benar && labSelesai && langkahSelesai
      ? buildDlNextButton('sederhanaNextBtn', D.nextLabel, true)
      : '') +
    '</section>';

  var rerender = function () {
    renderSelidikSederhana(container);
  };

  container.querySelectorAll('[data-lab][data-k]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var it = D.lab.filter(function (x) {
        return x.id === btn.dataset.lab;
      })[0];
      var st = labs[it.id];
      st.k = parseInt(btn.dataset.k, 10);
      if (st.tried.indexOf(btn.dataset.k) === -1) st.tried.push(btn.dataset.k);
      var h = hasilGabung(it.num, it.den, st.k);
      if (h.ok && h.sederhana) st.found = true;
      saveState();
      rerender();
    });
  });

  bindStepChain('ss', D.langkah, State.sederhanaSteps, rerender);

  bindRetryChoice(
    container,
    'data-ss-simpul',
    function () {
      return State.sederhanaSimpul === D.simpulan.correct;
    },
    function (id) {
      State.sederhanaSimpul = id;
      saveState();
      rerender();
    }
  );

  bindNext('sederhanaNextBtn', 'selidikSederhana', 'latihSederhana');
}
