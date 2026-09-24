'use strict';

/* ============================================================
   app-stage-karya.js — Tahap 7: Mengembangkan & menyajikan hasil
   karya (PBL Sintaks 4). Murid menjalankan rencana kelompok pada
   masalah bazar, lalu menyusun laporan untuk wali kelas.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* Langkah isian "…/KPK" untuk tiap kelompok bazar. */
var KARYA_NUM_STEPS = BAZAR.map(function (b) {
  var x = BAZAR_KPK / b.sDen;
  return {
    label:
      b.ikon +
      ' ' +
      esc(b.nama) +
      ': ' +
      buildFracInline(b.sNum, b.sDen) +
      ' = … / ' +
      BAZAR_KPK +
      '   (tuliskan pembilangnya)',
    jawab: b.kNum,
    hints: [
      BAZAR_KPK +
        ' ÷ ' +
        b.sDen +
        ' = ' +
        x +
        ', jadi pembilang ' +
        b.sNum +
        ' juga dikali ' +
        x +
        '.',
    ],
    temuan: fracChain([
      [b.sNum, b.sDen],
      [b.kNum, BAZAR_KPK],
    ]),
  };
});

var KARYA_URUT_ITEMS = BAZAR.map(function (b) {
  return {
    id: b.id,
    label: b.ikon + ' ' + esc(b.nama) + ' — ' + buildFracInline(b.kNum, BAZAR_KPK),
  };
});

function karyaASelesai() {
  return State.karyaA.every(function (st) {
    return st.correct;
  });
}

function karyaBSelesai() {
  return State.karyaKpk.done && stepsDone(State.karyaNum);
}

function buildKaryaA() {
  return BAZAR.map(function (b, i) {
    var st = State.karyaA[i];
    return (
      '<div class="karya-row">' +
      '<span class="karya-row__nama">' +
      b.ikon +
      ' ' +
      esc(b.nama) +
      '</span>' +
      '<span class="latih-pair">' +
      buildFracBlock(b.num, b.den, null, 'large') +
      '<span class="latih-eq" aria-hidden="true">=</span>' +
      buildFractionInput('kaIn' + i, st.raw, {
        disabled: st.correct,
        status: st.correct ? 'ok' : st.pesan ? 'bad' : '',
        aria: 'Bentuk paling sederhana bagian ' + b.nama,
      }) +
      '</span>' +
      (st.correct
        ? '<span class="karya-row__ok">✓</span>'
        : '<button type="button" class="btn btn--primary btn--small" data-ka="' +
          i +
          '">Periksa</button>') +
      (st.pesan && !st.correct
        ? '<div class="karya-row__fb">' +
          buildFeedbackBox(
            'warning',
            '💭',
            st.pesan +
              (st.attempts >= 2
                ? ' <em>Petunjuk: FPB(' + b.num + ', ' + b.den + ') = ' + b.fpb + '.</em>'
                : '')
          ) +
          '</div>'
        : '') +
      '</div>'
    );
  }).join('');
}

function buildKaryaB() {
  var D = DATA.karya;
  var html = buildDlStep('kk', State.karyaKpk, D.kpkStep, 1);
  if (State.karyaKpk.done) {
    for (var i = 0; i < KARYA_NUM_STEPS.length; i++) {
      html += buildDlStep('kn' + i, State.karyaNum[i], KARYA_NUM_STEPS[i], i + 2);
      if (!State.karyaNum[i].done) break;
    }
  }
  return html;
}

function buildLaporan() {
  var D = DATA.karya;
  var urut = DATA.karya.urutBenar.map(function (id) {
    return BAZAR.filter(function (b) {
      return b.id === id;
    })[0];
  });
  var dugaan = State.dugaan;
  var dugaanLabel = findOptionLabel(DATA.orientasi.dugaan.opsi, dugaan);
  var dugaanTepat = dugaan === urut[0].id;
  return (
    '<div class="laporan">' +
    '<p class="laporan__kepada">Kepada Bu Ratna, wali kelas 7</p>' +
    '<p>Tim peneliti telah menyelidiki bagian loyang yang terjual di bazar:</p>' +
    '<ul class="laporan__list">' +
    BAZAR.map(function (b) {
      return (
        '<li>' +
        b.ikon +
        ' <strong>' +
        esc(b.nama) +
        '</strong>: ' +
        fracChain([
          [b.num, b.den],
          [b.sNum, b.sDen],
          [b.kNum, BAZAR_KPK],
        ]) +
        ' loyang</li>'
      );
    }).join('') +
    '</ul>' +
    '<p>Setelah penyebutnya disamakan menjadi ' +
    BAZAR_KPK +
    ', urutan dari yang paling laris adalah <strong>' +
    urut
      .map(function (b) {
        return esc(b.nama);
      })
      .join(', ') +
    '</strong>. Jadi, kelompok paling laris adalah <strong>' +
    urut[0].ikon +
    ' ' +
    esc(urut[0].nama) +
    '</strong>.</p>' +
    '<p class="laporan__dugaan">Dugaan awalku: ' +
    (dugaanLabel || '—') +
    (dugaanTepat ? ' — <strong>terbukti!</strong>' : ' — <strong>ternyata berbeda.</strong>') +
    '</p>' +
    '</div>' +
    '<label for="karyaPesan" class="dl-refleksi-q">' +
    esc(D.pesanLabel) +
    '</label>' +
    '<textarea id="karyaPesan" class="input-textarea" placeholder="' +
    esc(D.pesanPlaceholder) +
    '">' +
    esc(State.karyaPesan) +
    '</textarea>'
  );
}

function renderKarya(container) {
  var D = DATA.karya;
  var aDone = karyaASelesai();
  var bDone = aDone && karyaBSelesai();
  var U = State.karyaUrut;
  var cDone = bDone && U.done;

  container.innerHTML =
    '<section aria-label="Menyelesaikan dan Menyajikan Hasil">' +
    buildHead(D) +
    buildDlPanel(buildPitaBazar({ notasi: true }), 'panel--hero') +
    buildDlPanel('<h3 style="margin-top:0;">' + esc(D.langkahA) + '</h3>' + buildKaryaA()) +
    (aDone
      ? buildDlPanel('<h3 style="margin-top:0;">' + esc(D.langkahB) + '</h3>' + buildKaryaB())
      : '') +
    (bDone
      ? buildDlPanel(
          '<h3 style="margin-top:0;">' +
            esc(D.langkahC) +
            '</h3>' +
            '<p class="dl-caption">Semua loyang kini dipotong ' +
            BAZAR_KPK +
            ' bagian sama besar (garis tebal = potongan asli yang sudah disederhanakan).</p>' +
            buildPitaBazar({ kpk: true }) +
            buildOrderPicker('karyaurut', KARYA_URUT_ITEMS, U, {
              correctOrder: D.urutBenar,
              slotLabels: D.slotLabels,
            }) +
            (U.salah
              ? '<div style="margin-top:var(--space-3);">' +
                buildFeedbackBox('warning', '💭', esc(D.urutSalah)) +
                '</div>'
              : '')
        )
      : '') +
    (cDone
      ? buildDlPanel(
          '<h3 style="margin-top:0;">📝 ' + esc(D.langkahD) + '</h3>' + buildLaporan(),
          'panel--info'
        ) +
        '<div class="btn-group btn-group--spread">' +
        '<span class="dl-caption" style="align-self:center;">🎤 Sajikan laporan ini di depan kelas.</span>' +
        '<button type="button" class="btn btn--primary btn--large" id="karyaNextBtn">' +
        esc(D.nextLabel) +
        '</button>' +
        '</div>'
      : '') +
    '</section>';

  var rerender = function () {
    renderKarya(container);
  };

  function cekA(i) {
    var b = BAZAR[i];
    var st = State.karyaA[i];
    var h = readFractionInput(container, 'kaIn' + i);
    st.raw = h.raw;
    if (h.error) {
      saveState();
      showNotice(pesanInputPecahan(h.error));
      return;
    }
    var d = pesanSederhana(h.value, { num: b.num, den: b.den });
    st.attempts++;
    st.correct = d.ok;
    st.pesan = d.pesan;
    saveState();
    rerender();
  }

  container.querySelectorAll('[data-ka]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      cekA(parseInt(btn.dataset.ka, 10));
    });
  });
  BAZAR.forEach(function (b, i) {
    ['Num', 'Den'].forEach(function (suf) {
      var inp = document.getElementById('kaIn' + i + suf);
      if (inp && !inp.disabled) {
        inp.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') cekA(i);
        });
      }
    });
  });

  bindDlStep('kk', State.karyaKpk, D.kpkStep, saveState, rerender);
  KARYA_NUM_STEPS.forEach(function (step, i) {
    bindDlStep('kn' + i, State.karyaNum[i], step, saveState, rerender);
  });

  bindOrderPicker(container, 'karyaurut', KARYA_URUT_ITEMS, U, D.urutBenar, saveState, rerender);

  var pesan = document.getElementById('karyaPesan');
  if (pesan) {
    pesan.addEventListener('input', function () {
      State.karyaPesan = pesan.value;
      saveState();
    });
  }

  bindNext('karyaNextBtn', 'karya', 'evaluasi', function () {
    if (State.karyaPesan.trim().length < D.pesanMin) {
      showNotice('Tulis dulu pesan untuk Kelompok Kenanga (minimal satu kalimat).');
      return false;
    }
    return true;
  });
}
