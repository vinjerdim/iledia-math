'use strict';

/* ============================================================
   app-stage-selidik-pecahan.js — Tahap 5: Penyelidikan pecahan
   (PBL Sintaks 3). Data sisa bekal: kata → notasi, cara baca baku,
   pecahan biasa ↔ campuran, menyamakan penyebut, simpulan.
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

function buildPitaAir(disamakan) {
  var D = DATA.selidikPecahan;
  var fracs = DATA.regu.map(function (r) {
    return { num: r.air.num, den: r.air.den, nama: r.ikon + ' ' + r.nama };
  });
  var hl = -1;
  if (disamakan) {
    var kecil = AIR_URUT[0].id;
    DATA.regu.forEach(function (r, i) {
      if (r.id === kecil) hl = i;
    });
  }
  return buildFracStripCompare(fracs, {
    common: disamakan ? D.kpk : 0,
    highlight: hl,
    caption: disamakan
      ? 'Setiap jeriken kini dibagi ' +
        D.kpk +
        ' bagian sama besar — tinggal membandingkan pembilangnya.'
      : 'Bagian setiap jeriken berbeda ukurannya (perempat, perdelapan, pertiga).',
  });
}

function renderSelidikPecahan(container) {
  var D = DATA.selidikPecahan;
  var tulisOk = stepsDone(State.pecTulis);
  var bacaOk = tulisOk && guidedQuizAllCorrect(D.baca, State.pecBaca);
  var ubahOk = bacaOk && stepsDone(State.pecUbah);
  var samakanOk = ubahOk && stepsDone(State.pecSamakan);
  var simpulOk = samakanOk && State.pecSimpul === D.simpulan.correct;

  var html =
    '<section aria-label="Penyelidikan Pecahan">' +
    buildHead(D) +
    buildDlPanel(
      buildPartHead(D.tulisJudul, D.tulisInstruksi) + buildFracChain('spT', D.tulis, State.pecTulis)
    );

  if (tulisOk) {
    html += buildDlPanel(
      buildPartHead(D.bacaJudul) + buildGuidedQuizList(D.baca, State.pecBacaOrders, State.pecBaca),
      'panel--info'
    );
  }
  if (bacaOk) {
    html += buildDlPanel(
      buildPartHead(D.ubahJudul, D.ubahInstruksi) + buildFracChain('spU', D.ubah, State.pecUbah)
    );
  }
  if (ubahOk) {
    html += buildDlPanel(
      buildPartHead(D.bandingJudul, D.bandingInstruksi) +
        buildPitaAir(samakanOk) +
        buildStepChain('spS', D.samakan, State.pecSamakan)
    );
  }
  if (samakanOk) {
    html += buildDlPanel(
      buildRetryChoice(D.simpulan, State.pecSimpulOrder, State.pecSimpul, 'data-sp-simpul')
    );
  }
  if (simpulOk) html += buildDlNextButton('selidikPecahanNextBtn', D.nextLabel, true);
  html += '</section>';
  container.innerHTML = html;

  var rerender = function () {
    renderSelidikPecahan(container);
  };
  bindFracChain(container, 'spT', D.tulis, State.pecTulis, rerender);
  bindGuidedQuizList(container, D.baca, State.pecBaca, saveState, rerender);
  bindFracChain(container, 'spU', D.ubah, State.pecUbah, rerender);
  bindStepChain('spS', D.samakan, State.pecSamakan, rerender);
  bindRetryChoice(
    container,
    'data-sp-simpul',
    function () {
      return State.pecSimpul === D.simpulan.correct;
    },
    function (id) {
      State.pecSimpul = id;
      saveState();
      rerender();
    }
  );
  bindNext('selidikPecahanNextBtn', 'selidikPecahan', 'latihPecahan');
}
