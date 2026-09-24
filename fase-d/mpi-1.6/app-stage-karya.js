'use strict';

/* ============================================================
   app-stage-karya.js — Tahap 7: Mengembangkan & menyajikan hasil
   karya (PBL Sintaks 4). Murid mengurutkan suhu dan sisa bekal,
   memutuskan regu yang dibantu, lalu menyusun Papan Info Kemah.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function suhuChainHTML() {
  return SUHU_URUT.map(function (s) {
    return formatNumber(s.value, '−');
  }).join(' &lt; ');
}

function fracChainHTML(list, getF) {
  return list
    .map(function (r) {
      var f = getF(r);
      return buildFracInline(f.num, f.den, f.whole || null);
    })
    .join(' &lt; ');
}

function buildPosterKemah() {
  var K = DATA.karya;
  var bawahNol = SUHU_URUT.filter(function (s) {
    return s.value < 0;
  })
    .map(function (s) {
      return s.jam;
    })
    .sort()
    .join(', ');
  var airMin = AIR_URUT[0];
  var berasMin = BERAS_URUT[0];
  var berasMinImp = berasImproper(berasMin);
  var berasMinMix = improperToMixed(berasMinImp.num, berasMinImp.den);
  return buildInfoPoster({
    judul: K.posterJudul,
    ikon: '⛺',
    rows: [
      {
        ikon: '🥶',
        label: 'Suhu terdingin',
        nilai:
          '<strong>' +
          formatNumber(SUHU_TERDINGIN.value, '−') +
          ' °C</strong> pukul ' +
          esc(SUHU_TERDINGIN.jam) +
          '<br><span class="dl-caption">dibaca "' +
          esc(bacaBilanganBulat(SUHU_TERDINGIN.value)) +
          ' derajat Celsius"</span>',
      },
      { ikon: '🧥', label: 'Wajib jaket tebal (di bawah 0 °C)', nilai: 'Pukul ' + esc(bawahNol) },
      { ikon: '🌡️', label: 'Urutan suhu (°C)', nilai: suhuChainHTML() },
      {
        ikon: '💧',
        label: 'Urutan sisa air (jeriken)',
        nilai: fracChainHTML(AIR_URUT, function (r) {
          return r.air;
        }),
      },
      {
        ikon: '🍚',
        label: 'Urutan sisa beras (kg)',
        nilai: fracChainHTML(BERAS_URUT, function (r) {
          return r.beras;
        }),
      },
      {
        ikon: '🚰',
        label: 'Air tambahan untuk',
        nilai:
          airMin.ikon +
          ' Regu ' +
          esc(airMin.nama) +
          ' (' +
          buildFracInline(airMin.air.num, airMin.air.den) +
          ' jeriken)',
      },
      {
        ikon: '🛍️',
        label: 'Beras tambahan untuk',
        nilai:
          berasMin.ikon +
          ' Regu ' +
          esc(berasMin.nama) +
          ' (' +
          buildFracInline(berasMinImp.num, berasMinImp.den) +
          ' = ' +
          buildFracInline(berasMinMix.num, berasMinMix.den, berasMinMix.whole) +
          ' kg)',
      },
    ],
    pesan: State.karyaPesan.trim(),
    footer: K.posterFooter,
  });
}

function renderKarya(container) {
  var K = DATA.karya;
  var suhuOk = State.karyaSuhu.correct;
  var nolOk = suhuOk && State.karyaNol === K.suhuDiBawahNol.correct;
  var airOk = nolOk && State.karyaAir.correct;
  var berasOk = airOk && State.karyaBeras.correct;
  var keputusanOk = berasOk && State.karyaKeputusan === K.keputusan.correct;

  var html =
    '<section aria-label="Karya Papan Info Kemah">' +
    buildHead(K) +
    buildDlPanel(
      buildPartHead(K.suhuJudul) +
        buildTapOrder('kySuhu', KARTU_SUHU, State.karyaSuhu, {
          answer: idsOf(SUHU_URUT),
          startLabel: 'Paling dingin',
          endLabel: 'Paling hangat',
          separator: '<',
          successText: '<strong>Urutannya tepat!</strong> ' + suhuChainHTML(),
        }) +
        (suhuOk
          ? '<hr class="karya-sep">' +
            buildRetryChoice(K.suhuDiBawahNol, State.karyaNolOrder, State.karyaNol, 'data-ky-nol')
          : '')
    );
  if (nolOk) {
    html += buildDlPanel(
      buildPartHead(K.airJudul) +
        buildTapOrder('kyAir', KARTU_AIR, State.karyaAir, {
          answer: idsOf(AIR_URUT),
          startLabel: 'Paling sedikit',
          endLabel: 'Paling banyak',
          separator: '<',
          successText:
            '<strong>Urutannya tepat!</strong> ' +
            fracChainHTML(AIR_URUT, function (r) {
              return r.air;
            }),
        })
    );
  }
  if (airOk) {
    html += buildDlPanel(
      buildPartHead(K.berasJudul) +
        '<p class="dl-caption">' +
        K.berasPetunjuk +
        '</p>' +
        buildTapOrder('kyBeras', KARTU_BERAS, State.karyaBeras, {
          answer: idsOf(BERAS_URUT),
          startLabel: 'Paling sedikit',
          endLabel: 'Paling banyak',
          separator: '<',
          successText:
            '<strong>Urutannya tepat!</strong> ' +
            fracChainHTML(BERAS_URUT, function (r) {
              return berasImproper(r);
            }),
        })
    );
  }
  if (berasOk) {
    html += buildDlPanel(
      buildRetryChoice(
        K.keputusan,
        State.karyaKeputusanOrder,
        State.karyaKeputusan,
        'data-ky-keputusan'
      )
    );
  }
  if (keputusanOk) {
    html +=
      buildDlPanel(
        '<label for="kyPesan" class="dl-refleksi-q">' +
          esc(K.pesanLabel) +
          '</label>' +
          '<textarea id="kyPesan" class="input-textarea" maxlength="200" placeholder="' +
          esc(K.pesanPlaceholder) +
          '">' +
          esc(State.karyaPesan) +
          '</textarea>' +
          '<div class="btn-group"><button type="button" class="btn btn--ghost btn--small" id="kyPesanBtn">Perbarui Papan Info</button></div>'
      ) +
      '<div id="kyPoster">' +
      buildPosterKemah() +
      '</div>' +
      buildDlNextButton('karyaNextBtn', K.nextLabel, true);
  }
  html += '</section>';
  container.innerHTML = html;

  var rerender = function () {
    renderKarya(container);
  };
  bindTapOrder(container, 'kySuhu', State.karyaSuhu, idsOf(SUHU_URUT), saveState, rerender);
  bindTapOrder(container, 'kyAir', State.karyaAir, idsOf(AIR_URUT), saveState, rerender);
  bindTapOrder(container, 'kyBeras', State.karyaBeras, idsOf(BERAS_URUT), saveState, rerender);
  bindRetryChoice(
    container,
    'data-ky-nol',
    function () {
      return State.karyaNol === K.suhuDiBawahNol.correct;
    },
    function (id) {
      State.karyaNol = id;
      saveState();
      rerender();
    }
  );
  bindRetryChoice(
    container,
    'data-ky-keputusan',
    function () {
      return State.karyaKeputusan === K.keputusan.correct;
    },
    function (id) {
      State.karyaKeputusan = id;
      saveState();
      rerender();
    }
  );

  var pesan = document.getElementById('kyPesan');
  if (pesan) {
    pesan.addEventListener('input', function () {
      State.karyaPesan = pesan.value;
      saveState();
    });
  }
  var pesanBtn = document.getElementById('kyPesanBtn');
  if (pesanBtn) {
    pesanBtn.addEventListener('click', function () {
      var poster = document.getElementById('kyPoster');
      if (poster) poster.innerHTML = buildPosterKemah();
      showNotice('Papan Info Kemah diperbarui.');
    });
  }
  bindNext('karyaNextBtn', 'karya', 'evaluasi');
}
