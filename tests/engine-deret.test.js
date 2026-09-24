'use strict';

/*
 * Tes seksi 21 shared/engine.js: suku & jumlah n suku deret aritmetika
 * dan geometri, pengenal jenis deret, serta komponen tabel isian deret,
 * grid "kalikan r, geser, kurangkan", dan tabel uji rumus.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

test('sukuAritmetika & jumlahAritmetika', () => {
  assert.equal(E.sukuAritmetika(3, 2, 1), 3);
  assert.equal(E.sukuAritmetika(3, 2, 30), 61);
  assert.equal(E.jumlahAritmetika(3, 2, 30), 960);
  assert.equal(E.jumlahAritmetika(2000000, 250000, 6), 15750000);
  assert.equal(E.jumlahAritmetika(5, -2, 4), 8);
});

test('sukuGeometri & jumlahGeometri (r > 1)', () => {
  assert.equal(E.sukuGeometri(200000, 2, 1), 200000);
  assert.equal(E.sukuGeometri(200000, 2, 5), 3200000);
  assert.equal(E.jumlahGeometri(200000, 2, 5), 6200000);
  assert.equal(E.jumlahGeometri(200000, 2, 8), 51000000);
  assert.equal(E.jumlahGeometri(50, 3, 6), 18200);
});

test('jumlahGeometri: r pecahan, r = 1, r negatif', () => {
  assert.equal(E.jumlahGeometri(64, 0.5, 6), 126);
  assert.equal(E.jumlahGeometri(1024, 0.5, 5), 1984);
  assert.equal(E.jumlahGeometri(81, 1 / 3, 5), 121);
  assert.equal(E.jumlahGeometri(7, 1, 10), 70);
  assert.equal(E.jumlahGeometri(3, -2, 4), 3 - 6 + 12 - 24);
});

test('jumlah rumus sama dengan menjumlahkan suku satu per satu', () => {
  [
    [200000, 2],
    [64, 0.5],
    [5, 3],
    [2, -3],
  ].forEach(([a, r]) => {
    for (let n = 1; n <= 10; n++) {
      const manual = E.daftarSuku('geometri', a, r, n).reduce((s, v) => s + v, 0);
      assert.ok(E.hampirSama(E.jumlahGeometri(a, r, n), manual), `a=${a} r=${r} n=${n}`);
    }
  });
});

test('daftarSuku & jumlahBerjalan', () => {
  assert.deepEqual(Array.from(E.daftarSuku('aritmetika', 3, 2, 5)), [3, 5, 7, 9, 11]);
  assert.deepEqual(Array.from(E.daftarSuku('geometri', 200, 2, 5)), [200, 400, 800, 1600, 3200]);
  assert.deepEqual(Array.from(E.jumlahBerjalan([200, 400, 800, 1600])), [200, 600, 1400, 3000]);
  assert.deepEqual(Array.from(E.jumlahBerjalan([])), []);
});

test('jenisDeret mengenali pola', () => {
  assert.equal(E.jenisDeret([3, 5, 7, 9]), 'aritmetika');
  assert.equal(E.jenisDeret([200, 400, 800]), 'geometri');
  assert.equal(E.jenisDeret([64, 32, 16, 8]), 'geometri');
  assert.equal(E.jenisDeret([4, 4, 4]), 'konstan');
  assert.equal(E.jenisDeret([1, 2, 4, 7]), 'bukan');
  assert.equal(E.jenisDeret([0, 0, 1]), 'bukan');
  assert.equal(E.jenisDeret([5]), 'bukan');
});

test('subskrip: angka menjadi karakter subskrip', () => {
  assert.equal(E.subskrip(5), '₅');
  assert.equal(E.subskrip(12), '₁₂');
});

test('seriesFillTableAllCorrect & seriesFillCellCorrect', () => {
  const cols = [
    { id: 'u', label: 'Uₙ', values: [2, 4, 8] },
    { id: 's', label: 'Sₙ', values: [2, 6, 14], editable: true },
  ];
  assert.equal(E.seriesFillCellCorrect(cols[1], { s: ['2', '6', '14'] }, 2), true);
  assert.equal(E.seriesFillCellCorrect(cols[1], { s: ['2', '6', '15'] }, 2), false);
  assert.equal(E.seriesFillCellCorrect(cols[1], { s: ['2', '6', 'x'] }, 2), false);
  assert.equal(E.seriesFillTableAllCorrect(cols, { s: ['2', '6', '14'] }), true);
  assert.equal(E.seriesFillTableAllCorrect(cols, { s: ['2', '', '14'] }), false);
  const big = [{ id: 'x', label: 'X', values: [6200000], editable: true }];
  assert.equal(E.seriesFillTableAllCorrect(big, { x: ['6.200.000'] }), true);
});

test('buildSeriesFillTable: nilai tetap tampil, sel isian jadi input, tanda setelah diperiksa', () => {
  const cols = [
    { id: 'u', label: 'Uₙ', values: [2, 4] },
    { id: 's', label: 'Sₙ', values: [2, 6], editable: true },
  ];
  const html = E.buildSeriesFillTable('tb', cols, { s: ['2', '7'] }, { checked: true });
  assert.match(html, /<table/);
  assert.equal((html.match(/data-fill-col="s"/g) || []).length, 2);
  assert.match(html, /sel--ok/);
  assert.match(html, /sel--no/);
  assert.match(html, />4</);
});

test('shiftGridAllStruck & buildShiftSubtractGrid', () => {
  assert.equal(E.shiftGridAllStruck([true, true]), true);
  assert.equal(E.shiftGridAllStruck([true, false]), false);
  const terms = [200, 400, 800, 1600, 3200];
  const html = E.buildShiftSubtractGrid('sg', terms, 2, [false, false, false, false], {
    label: 'S₅',
  });
  /* n − 1 = 4 pasangan kembar, masing-masing tampil di dua baris */
  assert.equal((html.match(/data-shift-coret=/g) || []).length, 8);
  assert.equal(new Set(html.match(/data-shift-coret="\d"/g)).size, 4);
  assert.match(html, /2S₅ =/);
  assert.doesNotMatch(html, /shift-result/);
  const done = E.buildShiftSubtractGrid('sg', terms, 2, [true, true, true, true], {
    label: 'S₅',
  });
  assert.match(done, /shift-result/);
  assert.match(done, /6\.400/);
});

test('buildSeriesCheckTable menandai cocok/tidak', () => {
  const html = E.buildSeriesCheckTable([
    { n: 1, manual: 5, rumus: 5 },
    { n: 2, manual: 7, rumus: 8 },
  ]);
  assert.equal((html.match(/series-check__ok/g) || []).length, 1);
  assert.equal((html.match(/series-check__no/g) || []).length, 1);
});
