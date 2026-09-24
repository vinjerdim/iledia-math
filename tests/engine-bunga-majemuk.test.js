'use strict';

/*
 * Tes shared/engine.js seksi 23 (bunga majemuk): nilai akhir modal
 * M₀(1 + i)ⁿ, total bunga, barisan saldo & bunga per periode sebagai
 * barisan geometri, konversi periode pemajemukan, pembulatan rupiah,
 * dan simulator bunga majemuk.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

test('nilaiAkhirBungaMajemuk: M₀(1 + i)ⁿ', () => {
  assert.equal(E.nilaiAkhirBungaMajemuk(10000000, 0.1, 0), 10000000);
  assert.equal(E.nilaiAkhirBungaMajemuk(10000000, 0.1, 1), 11000000);
  assert.equal(E.nilaiAkhirBungaMajemuk(10000000, 0.1, 3), 13310000);
  assert.equal(E.nilaiAkhirBungaMajemuk(10000000, 0.1, 5), 16105100);
  assert.equal(E.nilaiAkhirBungaMajemuk(5000000, 0.08, 2), 5832000);
  assert.equal(E.nilaiAkhirBungaMajemuk(2000000, 0.05, 3), 2315250);
  assert.ok(E.hampirSama(E.nilaiAkhirBungaMajemuk(10000000, 0.1, 10), 25937424.601));
});

test('bungaMajemuk: Mₙ − M₀', () => {
  assert.equal(E.bungaMajemuk(10000000, 0.1, 1), 1000000);
  assert.equal(E.bungaMajemuk(10000000, 0.1, 4), 4641000);
  assert.equal(E.bungaMajemuk(5000000, 0.08, 2), 832000);
  assert.equal(E.bungaMajemuk(10000000, 0.1, 0), 0);
});

test('saldoBungaMajemuk: barisan geometri a = M₀, r = 1 + i', () => {
  const saldo = Array.from(E.saldoBungaMajemuk(10000000, 0.1, 4));
  assert.deepEqual(saldo, [10000000, 11000000, 12100000, 13310000, 14641000]);
  assert.equal(E.jenisDeret(saldo), 'geometri');
  saldo.forEach((m, k) => {
    assert.ok(E.hampirSama(m, E.sukuGeometri(10000000, 1.1, k + 1)));
    assert.equal(m, E.nilaiAkhirBungaMajemuk(10000000, 0.1, k));
  });
});

test('bungaPeriodeMajemuk: bunga tiap periode = barisan geometri a = M₀·i, r = 1 + i', () => {
  const bunga = Array.from(E.bungaPeriodeMajemuk(10000000, 0.1, 4));
  assert.deepEqual(bunga, [1000000, 1100000, 1210000, 1331000]);
  assert.equal(E.jenisDeret(bunga), 'geometri');
  /* Jumlah bunga per periode = deret geometri = total bunga. */
  assert.equal(E.jumlahGeometri(1000000, 1.1, 4), E.bungaMajemuk(10000000, 0.1, 4));
});

test('konversiPeriode: suku bunga per periode & banyak periode', () => {
  const semester = E.konversiPeriode(12, 2, 3);
  assert.ok(E.hampirSama(semester.i, 0.06));
  assert.equal(semester.n, 6);
  const triwulan = E.konversiPeriode(8, 4, 2);
  assert.ok(E.hampirSama(triwulan.i, 0.02));
  assert.equal(triwulan.n, 8);
  const bulan = E.konversiPeriode(12, 12, 1);
  assert.ok(E.hampirSama(bulan.i, 0.01));
  assert.equal(bulan.n, 12);
  const tahun = E.konversiPeriode(10, 1, 5);
  assert.ok(E.hampirSama(tahun.i, 0.1));
  assert.equal(tahun.n, 5);
});

test('bulatkanRupiah: dibulatkan ke rupiah terdekat', () => {
  assert.equal(E.bulatkanRupiah(5049907.84), 5049908);
  assert.equal(E.bulatkanRupiah(21435888.1), 21435888);
  assert.equal(E.bulatkanRupiah(1000000), 1000000);
});

test('simulator: state awal dari opsi & nilai terbatas pada rentang', () => {
  const opts = { modal: [1000000, 10000000], persen: [5, 10], maxN: 6 };
  const st = E.makeCompoundSimState(opts);
  assert.deepEqual(
    { m: st.mIdx, p: st.pIdx, n: st.n, ubah: st.ubah },
    { m: 0, p: 0, n: 1, ubah: 0 }
  );
  E.ubahCompoundSim(st, 'n', +1, opts);
  E.ubahCompoundSim(st, 'n', +1, opts);
  assert.equal(st.n, 3);
  assert.equal(st.ubah, 2);
  for (let k = 0; k < 10; k++) E.ubahCompoundSim(st, 'n', +1, opts);
  assert.equal(st.n, 6, 'n tidak melebihi maxN');
  E.ubahCompoundSim(st, 'p', -1, opts);
  assert.equal(st.pIdx, 0, 'indeks persen tidak di bawah 0');
  E.ubahCompoundSim(st, 'm', +1, opts);
  assert.equal(st.mIdx, 1);
  const ukuran = st.ubah;
  E.ubahCompoundSim(st, 'm', +1, opts);
  assert.equal(st.ubah, ukuran, 'tombol yang mentok tidak menambah hitungan ubah');
});

test('buildCompoundSimulator: tabel saldo, bunga, rasio & pembanding bunga tunggal', () => {
  const opts = { modal: [10000000], persen: [10], maxN: 6, bandingTunggal: true };
  const st = E.makeCompoundSimState(opts);
  st.n = 3;
  const html = E.buildCompoundSimulator('sim', st, opts);
  assert.match(html, /Rp13\.310\.000/);
  assert.match(html, /Rp1\.210\.000/, 'bunga tahun ke-3 dari saldo sebelumnya');
  assert.match(html, /×1,1/, 'rasio saldo berurutan');
  assert.match(html, /Rp13\.000\.000/, 'kolom pembanding bunga tunggal');
  assert.match(html, /data-sim-id="sim"/);
  assert.match(html, /data-sim-key="n"/);
  assert.match(html, /aria-live="polite"/);
  /* Tombol mentok dinonaktifkan. */
  assert.match(html, /data-sim-key="m" data-sim-step="-1"[^>]*disabled/);
});
