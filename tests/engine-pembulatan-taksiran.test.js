'use strict';

/*
 * Tes engine.js bagian 65 — pembulatan & penaksiran untuk menilai
 * kewajaran jawaban (dipakai fase-d/mpi-2.6, Inquiry Learning).
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function labels(list) {
  return Array.from(list, (o) => o.label);
}

test('fmtBilanganBesar: pemisah ribuan titik, koma desimal, minus tipografis', () => {
  assert.equal(E.fmtBilanganBesar('22000'), '22.000');
  assert.equal(E.fmtBilanganBesar('-1234,5'), '−1.234,5');
  assert.equal(E.fmtBilanganBesar('4,0'), '4,0');
  assert.equal(E.fmtBilanganBesar('0,05'), '0,05');
  assert.equal(E.fmtBilanganBesar('150'), '150');
});

test('nilaiIsianBulat: membaca isian murid termasuk titik ribuan & "Rp"', () => {
  const v = (s) => E.nilaiIsianBulat(s);
  assert.deepEqual({ ...v('13.000').nilai }, { num: 13000, den: 1 });
  assert.deepEqual({ ...v('Rp 22.000').nilai }, { num: 22000, den: 1 });
  assert.deepEqual({ ...v('2,5').nilai }, { num: 5, den: 2 });
  assert.deepEqual({ ...v('−0,05').nilai }, { num: -1, den: 20 });
  assert.equal(v('').kode, 'kosong');
  assert.equal(v('2.5').kode, 'titik');
  assert.equal(v('abc').kode, 'format');
});

test('kTempat & namaTempatBulat: nama tempat ↔ pangkat sepuluh', () => {
  assert.equal(E.kTempat('ribuan'), -3);
  assert.equal(E.kTempat('satuan'), 0);
  assert.equal(E.kTempat('perseratusan'), 2);
  assert.equal(E.kTempat(1), 1);
  assert.equal(E.namaTempatBulat(-1), 'puluhan');
  assert.equal(E.namaTempatBulat(1), 'persepuluhan');
  assert.equal(E.namaTempatBulat(-4), 'puluh ribuan');
});

test('bulatkanKeTempat: aturan ≥ 5 naik, banyak angka desimal tetap', () => {
  const b = E.bulatkanKeTempat;
  assert.equal(b('2,449', 'persepuluhan'), '2,4');
  assert.equal(b('2,47', 'persepuluhan'), '2,5');
  assert.equal(b('3,45', 'persepuluhan'), '3,5');
  assert.equal(b('3,96', 'persepuluhan'), '4,0');
  assert.equal(b('9,95', 'persepuluhan'), '10,0');
  assert.equal(b('0,0456', 'perseratusan'), '0,05');
  assert.equal(b('12900', 'ribuan'), '13000');
  assert.equal(b('487', 'ratusan'), '500');
  assert.equal(b('449', 'ratusan'), '400');
  assert.equal(b('1250', 'ratusan'), '1300');
  assert.equal(b('-2,35', 'persepuluhan'), '−2,4');
  assert.equal(b('-38', 'puluhan'), '−40');
  assert.equal(b('7,5', 'satuan'), '8');
  assert.equal(b('3/4', 'persepuluhan'), '0,8');
});

test('tempatAngkaPertama & bulatkanAngkaPertama: nilai tempat terbesar', () => {
  assert.equal(E.tempatAngkaPertama('487'), -2);
  assert.equal(E.tempatAngkaPertama('12900'), -4);
  assert.equal(E.tempatAngkaPertama('9,6'), 0);
  assert.equal(E.tempatAngkaPertama('0,0456'), 2);
  assert.equal(E.bulatkanAngkaPertama('12900'), '10000');
  assert.equal(E.bulatkanAngkaPertama('9,6'), '10');
  assert.equal(E.bulatkanAngkaPertama('0,0456'), '0,05');
  assert.equal(E.bulatkanAngkaPertama('-38'), '−40');
  assert.equal(E.bulatkanAngkaPertama('48,7'), '50');
});

test('diagnosaPembulatan: benar & setiap miskonsepsi', () => {
  const kode = (i, s, t) => E.diagnosaPembulatan(i, s, t).kode;
  assert.equal(kode('2,5', '2,47', 'persepuluhan'), 'benar');
  assert.equal(kode('4', '3,96', 'persepuluhan'), 'benar');
  assert.equal(kode('13.000', '12900', 'ribuan'), 'benar');
  assert.equal(kode('2,5', '2,449', 'persepuluhan'), 'berantai');
  assert.equal(kode('2,4', '2,47', 'persepuluhan'), 'potong');
  assert.equal(kode('3,4', '3,45', 'persepuluhan'), 'lima-ke-bawah');
  assert.equal(kode('2,5', '2,41', 'persepuluhan'), 'selalu-naik');
  assert.equal(kode('2', '2,47', 'persepuluhan'), 'tempat-salah');
  assert.equal(kode('13', '12900', 'ribuan'), 'tanpa-nol');
  assert.equal(kode('2.5', '2,47', 'persepuluhan'), 'titik');
  assert.equal(kode('', '2,47', 'persepuluhan'), 'kosong');
  assert.equal(kode('abc', '2,47', 'persepuluhan'), 'format');
  assert.equal(kode('7', '2,47', 'persepuluhan'), 'salah');
  const r = E.diagnosaPembulatan('2,4', '2,47', 'persepuluhan');
  assert.equal(r.benar, false);
  assert.match(r.pesan, /7/);
  [
    'berantai',
    'potong',
    'lima-ke-bawah',
    'selalu-naik',
    'tempat-salah',
    'tanpa-nol',
    'titik',
    'kosong',
    'format',
    'salah',
  ].forEach((k) => assert.ok(E.PESAN_PEMBULATAN[k].length > 20, k));
});

test('opsiPembulatan: satu benar + pengecoh unik dengan kode', () => {
  [
    ['2,47', 'persepuluhan'],
    ['2,449', 'persepuluhan'],
    ['12900', 'ribuan'],
    ['3,96', 'persepuluhan'],
    ['487', 'ratusan'],
    ['0,0456', 'perseratusan'],
  ].forEach(([s, t]) => {
    const opsi = E.opsiPembulatan(s, t);
    assert.equal(opsi.length, 4, s);
    assert.equal(new Set(Array.from(opsi, (o) => o.id)).size, 4, s + ': id unik');
    assert.equal(new Set(labels(opsi)).size, 4, s + ': label unik');
    const benar = opsi.filter((o) => o.benar);
    assert.equal(benar.length, 1, s);
    assert.equal(benar[0].label, E.fmtBilanganBesar(E.bulatkanKeTempat(s, t)));
    opsi
      .filter((o) => !o.benar)
      .forEach((o) => assert.ok(E.PESAN_PEMBULATAN[o.kode], s + ': kode ' + o.kode));
  });
});

test('taksirOperasi: strategi tempat, angka pertama & bilangan kompatibel', () => {
  const t1 = E.taksirOperasi('48,7', '×', '3,2', 'angkaPertama');
  assert.equal(t1.a, '50');
  assert.equal(t1.b, '3');
  assert.equal(t1.hasil, '150');
  const t2 = E.taksirOperasi('2437', ':', '8', 'kompatibel');
  assert.deepEqual([t2.a, t2.b, t2.hasil], ['2400', '8', '300']);
  const t3 = E.taksirOperasi('47,8', ':', '6,2', 'kompatibel');
  assert.deepEqual([t3.a, t3.b, t3.hasil], ['48', '6', '8']);
  const t4 = E.taksirOperasi('12900', '+', '8750', 'ribuan');
  assert.deepEqual([t4.a, t4.b, t4.hasil], ['13000', '9000', '22000']);
  const t5 = E.taksirOperasi('3,96', '−', '1,2', 'satuan');
  assert.deepEqual([t5.a, t5.b, t5.hasil], ['4', '1', '3']);
  const t6 = E.taksirOperasi('-18,6', '+', '7,3', 'satuan');
  assert.equal(t6.hasil, '−12');
  assert.equal(t1.teks, '50 × 3 = 150');
});

test('arahTaksiran & persenGalat', () => {
  assert.equal(E.arahTaksiran('48,7', '×', '3,2', 'angkaPertama'), 'kurang');
  assert.equal(E.arahTaksiran('12900', '+', '8750', 'ribuan'), 'lebih');
  assert.equal(E.arahTaksiran('40', '×', '3', 'angkaPertama'), 'sama');
  assert.equal(E.persenGalat('150', '155,84'), 3.7);
  assert.equal(E.persenGalat('22000', '21650'), 1.6);
});

test('nilaiKewajaran: tepat, wajar, koma bergeser, operasi tertukar, tanda, jauh', () => {
  const k = (j, a, op, b) => E.nilaiKewajaran(j, a, op, b);
  assert.equal(k('155,84', '48,7', '×', '3,2').kode, 'tepat');
  assert.equal(k('155,84', '48,7', '×', '3,2').wajar, true);
  assert.equal(k('152,3', '48,7', '×', '3,2').kode, 'wajar');
  assert.equal(k('152,3', '48,7', '×', '3,2').wajar, true);
  assert.equal(k('1558,4', '48,7', '×', '3,2').kode, 'koma-geser');
  assert.equal(k('15,584', '48,7', '×', '3,2').kode, 'koma-geser');
  assert.equal(k('51,9', '48,7', '×', '3,2').kode, 'operasi-tertukar');
  assert.equal(k('−155,84', '48,7', '×', '3,2').kode, 'tanda');
  assert.equal(k('900', '48,7', '×', '3,2').kode, 'jauh');
  assert.equal(k('900', '48,7', '×', '3,2').wajar, false);
  assert.equal(k('304,625', '2437', ':', '8').kode, 'tepat');
  assert.equal(k('3046,25', '2437', ':', '8').kode, 'koma-geser');
  assert.equal(k('1558,4', '48,7', '×', '3,2').taksiran, '150');
  ['tepat', 'wajar', 'koma-geser', 'operasi-tertukar', 'tanda', 'jauh'].forEach((c) =>
    assert.ok(E.PESAN_KEWAJARAN[c].length > 20, c)
  );
});

test('diagnosaTaksiran: hasil taksiran vs hasil eksak & miskonsepsi', () => {
  const d = (i) => E.diagnosaTaksiran(i, '48,7', '×', '3,2', 'angkaPertama').kode;
  assert.equal(d('150'), 'benar');
  assert.equal(d('155,84'), 'eksak');
  assert.equal(d('1500'), 'koma-geser');
  assert.equal(d('53'), 'operasi-tertukar');
  assert.equal(d('160'), 'dekat');
  assert.equal(d('400'), 'salah');
  assert.equal(d(''), 'kosong');
  assert.equal(
    E.diagnosaTaksiran('22.000', '12900', '+', '8750', 'ribuan').kode,
    'benar',
    'titik ribuan diterima'
  );
  ['eksak', 'koma-geser', 'operasi-tertukar', 'dekat', 'salah', 'kosong'].forEach((c) =>
    assert.ok(E.PESAN_TAKSIRAN[c].length > 20, c)
  );
});

test('opsiTaksiran: satu taksiran benar + pengecoh unik', () => {
  [
    ['48,7', '×', '3,2'],
    ['12900', '+', '8750'],
    ['2437', ':', '8'],
    ['61,5', '−', '18,9'],
    ['0,48', '×', '205'],
  ].forEach(([a, op, b]) => {
    const opsi = E.opsiTaksiran(a, op, b);
    assert.equal(opsi.length, 4, a + op + b);
    assert.equal(new Set(labels(opsi)).size, 4, a + op + b + ': label unik');
    assert.equal(new Set(Array.from(opsi, (o) => o.id)).size, 4);
    const benar = opsi.filter((o) => o.benar);
    assert.equal(benar.length, 1);
    const strat = op === ':' ? 'kompatibel' : 'angkaPertama';
    assert.equal(benar[0].label, E.fmtBilanganBesar(E.taksirOperasi(a, op, b, strat).hasil));
  });
});

test('langkah isian jenis bulat & taksir memakai diagnosa seksi 65', () => {
  const st = E.makeDesimalStep();
  const r1 = E.periksaOpDesimalStep(
    st,
    { jenis: 'bulat', soal: '2,47', tempat: 'persepuluhan' },
    '2,4'
  );
  assert.equal(r1.kode, 'potong');
  assert.equal(st.attempts, 1);
  const r2 = E.periksaOpDesimalStep(
    st,
    { jenis: 'bulat', soal: '2,47', tempat: 'persepuluhan' },
    '2,5'
  );
  assert.equal(r2.benar, true);
  assert.equal(st.done, true);
  const st2 = E.makeDesimalStep();
  const step = { jenis: 'taksir', a: '48,7', op: '×', b: '3,2', strategi: 'angkaPertama' };
  assert.equal(E.periksaOpDesimalStep(st2, step, '155,84').kode, 'eksak');
  assert.equal(E.periksaOpDesimalStep(st2, step, '150').benar, true);
  assert.equal(E.jawabOpDesimalStep(step), '150');
  assert.equal(E.jawabOpDesimalStep({ jenis: 'bulat', soal: '12900', tempat: 'ribuan' }), '13000');
});

test('tampilan: garis pembulatan, meter kewajaran, tabel taksiran', () => {
  const g = E.buildGarisPembulatan('2,47', 'persepuluhan', { tampilHasil: true });
  assert.match(g, /<svg/);
  assert.match(g, /2,4/);
  assert.match(g, /2,5/);
  assert.match(g, /2,45/);
  assert.match(g, /bulat-garis/);
  const g2 = E.buildGarisPembulatan('12900', 'ribuan');
  assert.match(g2, /12\.000/);
  assert.match(g2, /13\.000/);
  assert.doesNotMatch(g2, /bulat-garis__hasil/);
  const m = E.buildMeterKewajaran('150', '1558,4');
  assert.match(m, /wajar-meter/);
  assert.match(m, /1\.558,4/);
  assert.match(m, /wajar-meter--tidak/);
  assert.match(E.buildMeterKewajaran('150', '152,3'), /wajar-meter--ya/);
  const t = E.buildTabelTaksiran([
    { a: '48,7', op: '×', b: '3,2', strategi: 'angkaPertama' },
    { a: '12900', op: '+', b: '8750', strategi: 'ribuan' },
  ]);
  assert.match(t, /data-table/);
  assert.match(t, /155,84/);
  assert.match(t, /21\.650/);
  assert.match(t, /lebih/);
  assert.match(t, /kurang/);
});
