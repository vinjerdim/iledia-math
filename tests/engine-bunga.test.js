'use strict';

/*
 * Tes shared/engine.js seksi 22 (bunga tunggal): bunga & nilai akhir
 * modal, barisan saldo sebagai barisan aritmetika, konversi & format
 * persen/rupiah, pembaca isian angka gaya Indonesia, dan tabel buku
 * tabungan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

test('bungaTunggal: M₀ × i × n', () => {
  assert.equal(E.bungaTunggal(2000000, 0.06, 1), 120000);
  assert.equal(E.bungaTunggal(2000000, 0.06, 3), 360000);
  assert.equal(E.bungaTunggal(2000000, 0.005, 18), 180000);
  assert.equal(E.bungaTunggal(3000000, 0.01, 10), 300000);
  assert.equal(E.bungaTunggal(1500000, 0.015, 6), 135000);
  assert.equal(E.bungaTunggal(2000000, 0.06, 0), 0);
});

test('nilaiAkhirBungaTunggal: M₀(1 + n·i)', () => {
  assert.equal(E.nilaiAkhirBungaTunggal(2000000, 0.06, 5), 2600000);
  assert.equal(E.nilaiAkhirBungaTunggal(2000000, 0.06, 10), 3200000);
  assert.equal(E.nilaiAkhirBungaTunggal(5000000, 0.04, 3), 5600000);
  assert.equal(E.nilaiAkhirBungaTunggal(4000000, 0.07, 3), 4840000);
  assert.equal(E.nilaiAkhirBungaTunggal(2000000, 0.06, 0), 2000000);
});

test('saldoBungaTunggal: barisan aritmetika a = M₀, b = M₀·i', () => {
  const saldo = E.saldoBungaTunggal(2000000, 0.06, 5);
  assert.deepEqual(Array.from(saldo), [2000000, 2120000, 2240000, 2360000, 2480000, 2600000]);
  assert.equal(E.jenisDeret(saldo), 'aritmetika');
  saldo.forEach((m, k) => {
    assert.equal(m, E.sukuAritmetika(2000000, 120000, k + 1));
    assert.equal(m, E.nilaiAkhirBungaTunggal(2000000, 0.06, k));
  });
});

test('persenKeDesimal & formatPersen', () => {
  assert.ok(E.hampirSama(E.persenKeDesimal(6), 0.06));
  assert.ok(E.hampirSama(E.persenKeDesimal(0.5), 0.005));
  assert.equal(E.formatPersen(0.06), '6%');
  assert.equal(E.formatPersen(0.005), '0,5%');
  assert.equal(E.formatPersen(0.015), '1,5%');
});

test('formatRupiah', () => {
  assert.equal(E.formatRupiah(2120000), 'Rp2.120.000');
  assert.equal(E.formatRupiah(0), 'Rp0');
  assert.equal(E.formatRupiah(-50000), '−Rp50.000');
});

test('parseInputAngka: ribuan bertitik, desimal berkoma, Rp & %', () => {
  const nilai = (s) => E.parseInputAngka(s).value;
  assert.equal(nilai('2.600.000'), 2600000);
  assert.equal(nilai('Rp2.600.000'), 2600000);
  assert.equal(nilai('rp 120.000'), 120000);
  assert.equal(nilai('2600000'), 2600000);
  assert.equal(nilai('0,5'), 0.5);
  assert.equal(nilai('0.5'), 0.5);
  assert.equal(nilai('1,5%'), 1.5);
  assert.equal(nilai('7 %'), 7);
  assert.equal(nilai('1.234,5'), 1234.5);
  assert.equal(E.parseInputAngka('').error, 'empty');
  assert.equal(E.parseInputAngka('dua').error, 'invalid');
  assert.equal(E.parseInputAngka('1,2,3').error, 'invalid');
});

test('buildBukuTabungan: baris nilai, sel tersembunyi, dan baris jeda', () => {
  const html = E.buildBukuTabungan(
    [
      { label: 'Tahun 0', bunga: null, saldo: 2000000 },
      { label: 'Tahun 1', bunga: 120000, saldo: 2120000 },
      { jeda: true },
      { label: 'Tahun 10', bunga: 120000, saldo: '?' },
    ],
    { judul: 'Buku Tabungan Raka', caption: 'Buku tabungan' }
  );
  assert.match(html, /Buku Tabungan Raka/);
  assert.match(html, /Rp2\.120\.000/);
  assert.match(html, /passbook__row--gap/);
  assert.match(html, /passbook__hidden">\?</);
  assert.match(html, /aria-label="Buku tabungan"/);
  assert.match(html, /—/, 'bunga null ditulis —');
});

test('tabel isian deret: kolom dengan parse parseInputAngka menerima awalan Rp', () => {
  const kolom = (parse) => [{ id: 'saldo', values: [2120000, 2240000], editable: true, parse }];
  const inputs = { saldo: ['Rp2.120.000', '2.240.000'] };
  assert.equal(E.seriesFillTableAllCorrect(kolom(E.parseInputAngka), inputs), true);
  assert.equal(E.seriesFillTableAllCorrect(kolom(undefined), inputs), false, 'default tetap ketat');
});
