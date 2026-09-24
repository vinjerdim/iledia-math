'use strict';

/*
 * Tes shared/engine.js seksi 27 (eksponen bulat): superskrip & format
 * bilangan berpangkat, pecahan eksak, nilai pangkat bulat (positif, nol,
 * negatif), pembaca isian pecahan, tangga pangkat, sifat-sifat eksponen
 * (termasuk dugaan keliru), diagnosa miskonsepsi, dan lab uji sifat.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function frac(num, den) {
  return { num: num, den: den };
}

function plain(p) {
  return p === null ? null : { num: p.num, den: p.den };
}

test('superskrip: angka, minus, dan huruf eksponen', () => {
  assert.equal(E.superskrip(3), '³');
  assert.equal(E.superskrip(12), '¹²');
  assert.equal(E.superskrip(0), '⁰');
  assert.equal(E.superskrip(-2), '⁻²');
  assert.equal(E.superskrip('m+n'), 'ᵐ⁺ⁿ');
  assert.equal(E.superskrip('m−n'), 'ᵐ⁻ⁿ');
  assert.equal(E.superskrip('-n'), '⁻ⁿ');
});

test('formatPangkat: basis negatif diberi kurung', () => {
  assert.equal(E.formatPangkat(2, 5), '2⁵');
  assert.equal(E.formatPangkat(-3, 2), '(−3)²');
  assert.equal(E.formatPangkat(10, -2), '10⁻²');
  assert.equal(E.formatPangkat('a', 'n'), 'aⁿ');
  assert.equal(E.formatPangkat(frac(2, 3), 2), '(2/3)²');
});

test('pecahan: dinormalkan (penyebut positif, paling sederhana)', () => {
  assert.deepEqual(plain(E.pecahan(2, 4)), frac(1, 2));
  assert.deepEqual(plain(E.pecahan(3, -6)), frac(-1, 2));
  assert.deepEqual(plain(E.pecahan(0, 5)), frac(0, 1));
  assert.deepEqual(plain(E.pecahan(8, 1)), frac(8, 1));
  assert.equal(E.pecahan(1, 0), null);
});

test('operasi pecahan: kali, bagi, sama, nilai', () => {
  assert.deepEqual(plain(E.kaliPecahan(frac(2, 3), frac(3, 4))), frac(1, 2));
  assert.deepEqual(plain(E.bagiPecahan(frac(1, 2), frac(1, 4))), frac(2, 1));
  assert.equal(E.bagiPecahan(frac(1, 2), frac(0, 1)), null);
  assert.equal(E.samaPecahan(frac(2, 4), frac(1, 2)), true);
  assert.equal(E.samaPecahan(frac(1, 2), frac(-1, 2)), false);
  assert.equal(E.samaPecahan(null, frac(1, 2)), false);
  assert.equal(E.nilaiPecahan(frac(1, 4)), 0.25);
});

test('formatPecahan: bulat, pecahan, minus tipografis, tak terdefinisi', () => {
  assert.equal(E.formatPecahan(frac(16, 1)), '16');
  assert.equal(E.formatPecahan(frac(1, 8)), '1/8');
  assert.equal(E.formatPecahan(frac(-1, 8)), '−1/8');
  assert.equal(E.formatPecahan(frac(-27, 1)), '−27');
  assert.equal(E.formatPecahan(frac(1000000, 1)), '1.000.000');
  assert.equal(E.formatPecahan(null), 'tak terdefinisi');
});

test('pangkatBulat: pangkat positif = perkalian berulang', () => {
  assert.deepEqual(plain(E.pangkatBulat(2, 4)), frac(16, 1));
  assert.deepEqual(plain(E.pangkatBulat(-3, 3)), frac(-27, 1));
  assert.deepEqual(plain(E.pangkatBulat(-3, 2)), frac(9, 1));
  assert.deepEqual(plain(E.pangkatBulat(10, 1)), frac(10, 1));
  assert.deepEqual(plain(E.pangkatBulat(frac(2, 3), 2)), frac(4, 9));
  assert.deepEqual(plain(E.pangkatBulat(0, 3)), frac(0, 1));
});

test('pangkatBulat: a⁰ = 1 dan a⁻ⁿ = 1/aⁿ (a ≠ 0)', () => {
  [2, 3, -5, 10, 7].forEach((a) => {
    assert.deepEqual(plain(E.pangkatBulat(a, 0)), frac(1, 1), a + '⁰');
    for (let n = 1; n <= 4; n++) {
      const pos = E.pangkatBulat(a, n);
      const neg = E.pangkatBulat(a, -n);
      assert.ok(E.samaPecahan(neg, E.bagiPecahan(frac(1, 1), pos)), a + '⁻' + n);
    }
  });
  assert.deepEqual(plain(E.pangkatBulat(2, -3)), frac(1, 8));
  assert.deepEqual(plain(E.pangkatBulat(-2, -3)), frac(-1, 8));
  assert.deepEqual(plain(E.pangkatBulat(frac(2, 3), -2)), frac(9, 4));
});

test('pangkatBulat: 0⁰ dan 0⁻ⁿ tak terdefinisi (null)', () => {
  assert.equal(E.pangkatBulat(0, 0), null);
  assert.equal(E.pangkatBulat(0, -2), null);
});

test('parseInputPecahan: bulat, pecahan, desimal berkoma, minus', () => {
  const v = (s) => plain(E.parseInputPecahan(s).value);
  assert.deepEqual(v('16'), frac(16, 1));
  assert.deepEqual(v('−27'), frac(-27, 1));
  assert.deepEqual(v('+3'), frac(3, 1));
  assert.deepEqual(v('1/8'), frac(1, 8));
  assert.deepEqual(v(' 2 / 4 '), frac(1, 2));
  assert.deepEqual(v('-1/9'), frac(-1, 9));
  assert.deepEqual(v('0,25'), frac(1, 4));
  assert.deepEqual(v('0.125'), frac(1, 8));
  assert.deepEqual(v('1.000'), frac(1000, 1));
  assert.equal(E.parseInputPecahan('').error, 'empty');
  assert.equal(E.parseInputPecahan('abc').error, 'invalid');
  assert.equal(E.parseInputPecahan('1/0').error, 'invalid');
  assert.equal(E.parseInputPecahan('2^3').error, 'invalid');
});

test('tanggaPangkat: tiap turun satu anak tangga dibagi basis', () => {
  const t = E.tanggaPangkat(2, 4, -2);
  assert.deepEqual(
    Array.from(t, (r) => r.n),
    [4, 3, 2, 1, 0, -1, -2]
  );
  assert.deepEqual(
    Array.from(t, (r) => E.formatPecahan(r.nilai)),
    ['16', '8', '4', '2', '1', '1/2', '1/4']
  );
  for (let i = 1; i < t.length; i++) {
    assert.ok(E.samaPecahan(t[i].nilai, E.bagiPecahan(t[i - 1].nilai, frac(2, 1))));
  }
});

test('faktorPangkat: daftar faktor berulang', () => {
  assert.deepEqual(Array.from(E.faktorPangkat(3, 4)), [3, 3, 3, 3]);
  assert.deepEqual(Array.from(E.faktorPangkat(5, 0)), []);
});

test('cekSifatEksponen: sifat benar berlaku untuk semua eksponen bulat', () => {
  const benar = ['kali', 'bagi', 'pangkat', 'kaliBasis', 'bagiBasis'];
  benar.forEach((id) => {
    assert.equal(E.SIFAT_EKSPONEN[id].keliru, false, id);
    for (let a = -4; a <= 4; a++) {
      if (a === 0) continue;
      for (let m = -3; m <= 3; m++) {
        for (let n = -3; n <= 3; n++) {
          const r = E.cekSifatEksponen(id, a, m, n, 3);
          assert.equal(r.terdefinisi, true, id + ' a=' + a + ' m=' + m + ' n=' + n);
          assert.equal(r.sama, true, id + ' a=' + a + ' m=' + m + ' n=' + n);
        }
      }
    }
  });
});

test('cekSifatEksponen: dugaan keliru punya contoh penyangkal', () => {
  ['salahKali', 'salahNegatif'].forEach((id) => {
    assert.equal(E.SIFAT_EKSPONEN[id].keliru, true, id);
  });
  assert.equal(E.cekSifatEksponen('salahKali', 2, 3, 2).sama, false);
  assert.equal(E.cekSifatEksponen('salahKali', 2, 2, 2).sama, true, '2+2 = 2×2 kebetulan sama');
  assert.equal(E.cekSifatEksponen('salahNegatif', 2, 0, 3).sama, false);
});

test('cekSifatEksponen: teks ruas & catatan eksponen', () => {
  const r = E.cekSifatEksponen('kali', 2, 3, -1);
  assert.equal(r.teksKiri, '2³ × 2⁻¹');
  assert.equal(r.teksKanan, '2²');
  assert.equal(r.catatan, '3 + (−1) = 2');
  assert.deepEqual(plain(r.kiri), frac(4, 1));
  const p = E.cekSifatEksponen('pangkat', -2, 2, 3);
  assert.equal(p.teksKiri, '((−2)²)³');
  assert.equal(p.teksKanan, '(−2)⁶');
  const kb = E.cekSifatEksponen('kaliBasis', 2, 0, 3, 5);
  assert.equal(kb.teksKiri, '(2 × 5)³');
  assert.equal(kb.teksKanan, '2³ × 5³');
  assert.deepEqual(plain(kb.kanan), frac(1000, 1));
});

test('cekSifatEksponen: a = 0 dengan eksponen ≤ 0 tak terdefinisi', () => {
  const r = E.cekSifatEksponen('bagi', 0, 2, 2);
  assert.equal(r.terdefinisi, false);
  assert.equal(r.sama, false);
  const b = E.cekSifatEksponen('bagiBasis', 2, 0, 2, 0);
  assert.equal(b.terdefinisi, false);
});

test('diagnosaPangkat: mengenali miskonsepsi umum', () => {
  assert.equal(E.diagnosaPangkat(2, -3, frac(1, 8)), 'benar');
  assert.equal(E.diagnosaPangkat(2, -3, frac(-8, 1)), 'negatifJadiMinus');
  assert.equal(E.diagnosaPangkat(2, -3, frac(-6, 1)), 'kaliEksponen');
  assert.equal(E.diagnosaPangkat(2, -3, frac(-1, 8)), 'tandaPecahan');
  assert.equal(E.diagnosaPangkat(5, 0, frac(0, 1)), 'nolJadiNol');
  assert.equal(E.diagnosaPangkat(5, 0, frac(5, 1)), 'nolJadiBasis');
  assert.equal(E.diagnosaPangkat(3, 2, frac(6, 1)), 'kaliEksponen');
  assert.equal(E.diagnosaPangkat(3, 2, frac(10, 1)), 'lain');
  [
    'negatifJadiMinus',
    'kaliEksponen',
    'tandaPecahan',
    'nolJadiNol',
    'nolJadiBasis',
    'lain',
  ].forEach((k) => assert.ok(E.pesanDiagnosaPangkat(k, 2, -3).length > 10, k));
});

test('powerLadder: sel benar dibaca eksak', () => {
  assert.equal(E.powerLadderCellCorrect(2, -2, '1/4'), true);
  assert.equal(E.powerLadderCellCorrect(2, -2, '0,25'), true);
  assert.equal(E.powerLadderCellCorrect(2, -2, '-4'), false);
  assert.equal(E.powerLadderCellCorrect(3, 0, '1'), true);
  assert.equal(E.powerLadderCellCorrect(3, -2, '0,11'), false);
  const cfg = { a: 2, dari: 2, sampai: -1, diketahui: [2] };
  const inputs = { 1: '2', 0: '1', '-1': '1/2' };
  assert.equal(E.powerLadderFilled(cfg, inputs), true);
  assert.equal(E.powerLadderAllCorrect(cfg, inputs), true);
  assert.equal(E.powerLadderAllCorrect(cfg, { 1: '2', 0: '0', '-1': '1/2' }), false);
  assert.equal(E.powerLadderFilled(cfg, { 1: '2' }), false);
});

test('buildPowerLadder: sel diketahui, isian, dan panah ÷a', () => {
  const html = E.buildPowerLadder('tg', { a: 3, dari: 2, sampai: -1, diketahui: [2] }, {}, {});
  assert.match(html, /3²/);
  assert.match(html, /÷ 3/);
  assert.match(html, /id="tg-in-0"/);
  assert.match(html, /id="tg-in--1"/);
  assert.doesNotMatch(html, /id="tg-in-2"/);
  const tersembunyi = E.buildPowerLadder(
    's',
    { a: 2, dari: 1, sampai: -1, diketahui: [1] },
    {},
    {
      tanya: true,
    }
  );
  assert.doesNotMatch(tersembunyi, /<input/);
  assert.match(tersembunyi, /\?/);
});

test('buildFactorTiles: jumlah ubin & coretan pembagian', () => {
  const kali = E.buildFactorTiles({ jenis: 'kali', a: 2, m: 3, n: 2 });
  assert.equal((kali.match(/class="fx-tile[ "]/g) || []).length, 5);
  const bagi = E.buildFactorTiles({ jenis: 'bagi', a: 3, m: 5, n: 2, coret: true });
  assert.equal((bagi.match(/fx-tile--coret/g) || []).length, 4);
  const habis = E.buildFactorTiles({ jenis: 'bagi', a: 2, m: 2, n: 5, coret: true });
  assert.match(habis, /fx-one/);
  const pangkat = E.buildFactorTiles({ jenis: 'pangkat', a: 2, m: 2, n: 3 });
  assert.equal((pangkat.match(/class="fx-tile[ "]/g) || []).length, 6);
});

test('lab eksponen: catat uji unik & syarat selesai', () => {
  const st = E.makeExponentLabState('kali');
  st.a = 2;
  st.m = 3;
  st.n = 2;
  assert.equal(E.labCatat(st), 'ok');
  assert.equal(E.labCatat(st), 'duplikat');
  st.n = -1;
  assert.equal(E.labCatat(st), 'ok');
  st.a = 0;
  st.n = 0;
  assert.equal(E.labCatat(st), 'tidakTerdefinisi');

  const syarat = [
    { sifat: 'kali', min: 2, nonPositif: true },
    { sifat: 'salahKali', min: 1, sangkal: true },
  ];
  let r = E.labRingkasan(st, syarat);
  assert.equal(r[0].selesai, true);
  assert.equal(r[1].selesai, false);
  assert.equal(E.labSyaratSelesai(st, syarat), false);

  st.sifat = 'salahKali';
  st.a = 2;
  st.m = 2;
  st.n = 2;
  E.labCatat(st);
  r = E.labRingkasan(st, syarat);
  assert.equal(r[1].selesai, false, '2+2 = 2×2 bukan contoh penyangkal');
  st.n = 3;
  E.labCatat(st);
  assert.equal(E.labSyaratSelesai(st, syarat), true);
});

test('lab eksponen: ubah nilai dibatasi', () => {
  const st = E.makeExponentLabState('kali');
  const opts = { batasA: [-5, 5], batasE: [-4, 4] };
  for (let i = 0; i < 20; i++) E.ubahExponentLab(st, 'm', 1, opts);
  assert.equal(st.m, 4);
  for (let i = 0; i < 20; i++) E.ubahExponentLab(st, 'a', -1, opts);
  assert.equal(st.a, -5);
});
