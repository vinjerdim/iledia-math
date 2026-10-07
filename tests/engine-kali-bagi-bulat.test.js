'use strict';

/*
 * Tes shared/engine.js seksi 18 (perkalian & pembagian bilangan bulat):
 * hasil & tanda operasi, penjumlahan berulang, garis bilangan lompatan
 * berulang, tabel aturan tanda (mode pilih & banding), langkah operasi
 * campuran, diagnosa miskonsepsi hasil kali/bagi (diagnosaKaliBagiBulat),
 * serta langkah isian jenis 'hitung' (seksi 29) untuk × dan :.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function count(str, sub) {
  return str.split(sub).length - 1;
}

/* ---------- hasil, tanda & notasi ---------- */

test('hasilOperasiBulat: × dan : beserta alias * dan /', () => {
  assert.equal(E.hasilOperasiBulat(3, '×', -2), -6);
  assert.equal(E.hasilOperasiBulat(-3, '*', -2), 6);
  assert.equal(E.hasilOperasiBulat(-12, ':', 3), -4);
  assert.equal(E.hasilOperasiBulat(-20, '/', -4), 5);
  assert.equal(E.hasilOperasiBulat(0, ':', -7), 0);
});

test('tandaBilangan: positif, negatif, nol', () => {
  assert.equal(E.tandaBilangan(4), 'positif');
  assert.equal(E.tandaBilangan(-4), 'negatif');
  assert.equal(E.tandaBilangan(0), 'nol');
});

test('fmtOperasiBulat: kurung pada bilangan negatif di perkalian & pembagian', () => {
  assert.equal(E.fmtOperasiBulat(-3, '×', -4), '(−3) × (−4)');
  assert.equal(E.fmtOperasiBulat(3, '×', -4), '3 × (−4)');
  assert.equal(E.fmtOperasiBulat(-12, ':', 3), '(−12) : 3');
  assert.equal(E.fmtOperasiBulat(-48000, ':', 4), '(−48.000) : 4');
});

test('fmtPenjumlahanBerulang: suku negatif berkurung', () => {
  assert.equal(E.fmtPenjumlahanBerulang(3, -2), '(−2) + (−2) + (−2)');
  assert.equal(E.fmtPenjumlahanBerulang(2, 5), '5 + 5');
  assert.equal(E.fmtPenjumlahanBerulang(1, -7), '(−7)');
});

test('buildRepeatedAddJumps: n busur lompatan dari 0', () => {
  const html = E.buildRepeatedAddJumps('rj', 3, -2, { min: -8, max: 2 });
  assert.match(html, /id="rj"/);
  assert.match(html, /3 × \(−2\)/);
  assert.match(html, /3 lompatan/);
});

/* ---------- tabel aturan tanda ---------- */

const CELLS = [
  { id: 'pp', label: '(+) × (+)', contoh: '3 × 4', correct: 'positif' },
  { id: 'nn', label: '(−) × (−)', contoh: '(−3) × (−4)', correct: 'positif' },
];
const OPTS = [
  { id: 'positif', label: 'Positif' },
  { id: 'negatif', label: 'Negatif' },
];

test('buildSignRuleGrid mode pilih: opsi mengikuti urutan acak tersimpan', () => {
  const states = {
    pp: { chosen: null, correct: false, optionOrder: ['negatif', 'positif'] },
    nn: { chosen: 'negatif', correct: false, optionOrder: ['positif', 'negatif'] },
  };
  const html = E.buildSignRuleGrid('sg', CELLS, states, { options: OPTS, mode: 'pilih' });
  assert.equal(count(html, 'data-sign-opt='), 4);
  const pp = html.slice(html.indexOf('(+) × (+)'), html.indexOf('(−) × (−)'));
  assert.ok(pp.indexOf('Negatif') < pp.indexOf('Positif'), 'urutan opsi pp mengikuti state');
  assert.match(html, /contoh: \(−3\) × \(−4\)/);
});

test('buildSignRuleGrid mode banding: tanda cocok/beda dari dugaan', () => {
  const states = { pp: { chosen: 'positif' }, nn: { chosen: 'negatif' } };
  const html = E.buildSignRuleGrid('sg', CELLS, states, { options: OPTS, mode: 'banding' });
  assert.equal(count(html, 'sign-grid__cell--match'), 1);
  assert.equal(count(html, 'sign-grid__cell--miss'), 1);
  assert.equal(E.signGridAllChosen(CELLS, states), true);
  assert.equal(E.signGridMatchCount(CELLS, states), 1);
  assert.equal(E.signGridAllChosen(CELLS, { pp: { chosen: 'positif' } }), false);
});

/* ---------- operasi campuran ---------- */

const SOAL = {
  ekspresi: '[[7 × 4]] + 5 × (−2)',
  langkah: [
    { label: 'Hitung 7 × 4', jawab: 28, sesudah: '28 + [[5 × (−2)]]', hints: ['a'] },
    { label: 'Hitung 5 × (−2)', jawab: -10, sesudah: '[[28 + (−10)]]', hints: ['b'] },
    { label: 'Hitung 28 + (−10)', jawab: 18, sesudah: '18', hints: ['c'] },
  ],
};

test('renderExprMarks: menandai [[…]] dan meng-escape sisanya', () => {
  assert.equal(
    E.renderExprMarks('[[2 × 3]] < 7'),
    '<mark class="expr-steps__mark">2 × 3</mark> &lt; 7'
  );
});

test('buildExprSteps: hanya langkah aktif yang berisian, baris selesai bertambah', () => {
  const st = SOAL.langkah.map(() => E.makeDlStep());
  let html = E.buildExprSteps('ex', SOAL, st);
  assert.equal(count(html, 'class="input-text'), 1);
  assert.match(html, /Langkah 1/);
  st[0].done = true;
  st[0].input = '28';
  html = E.buildExprSteps('ex', SOAL, st);
  assert.match(html, /Langkah 2/);
  assert.equal(count(html, 'expr-steps__eq'), 1);
  st[1].done = true;
  st[2].done = true;
  html = E.buildExprSteps('ex', SOAL, st);
  assert.match(html, /expr-steps__line--final/);
  assert.equal(E.exprStepsDone(st), true);
});

/* ---------- diagnosaKaliBagiBulat ---------- */

test('diagnosaKaliBagiBulat: benar menerima −, -, + dan pemisah ribuan', () => {
  assert.equal(E.diagnosaKaliBagiBulat('−6', 3, '×', -2).benar, true);
  assert.equal(E.diagnosaKaliBagiBulat('-6', 3, '×', -2).kode, 'benar');
  assert.equal(E.diagnosaKaliBagiBulat('+6', -3, '×', -2).benar, true);
  assert.equal(E.diagnosaKaliBagiBulat('−12.000', -48000, ':', 4).benar, true);
  assert.match(E.diagnosaKaliBagiBulat('5', -20, ':', -4).pesan, /\(−20\) : \(−4\) = 5/);
});

test('diagnosaKaliBagiBulat: isian tidak sah memakai kode parser', () => {
  assert.equal(E.diagnosaKaliBagiBulat('', 3, '×', -2).kode, 'kosong');
  assert.equal(E.diagnosaKaliBagiBulat('6-', 3, '×', -2).kode, 'tanda-belakang');
  assert.equal(E.diagnosaKaliBagiBulat('min 6', 3, '×', -2).kode, 'kata-min');
  assert.equal(E.diagnosaKaliBagiBulat('abc', 3, '×', -2).kode, 'bukan-bulat');
});

test('diagnosaKaliBagiBulat: tanda hasil terbalik menyebut aturan tanda', () => {
  const r = E.diagnosaKaliBagiBulat('-6', -3, '×', -2);
  assert.equal(r.kode, 'tanda-hasil');
  assert.match(r.pesan, /tandanya sama/);
  const s = E.diagnosaKaliBagiBulat('4', -12, ':', 3);
  assert.equal(s.kode, 'tanda-hasil');
  assert.match(s.pesan, /tandanya berbeda/);
});

test('diagnosaKaliBagiBulat: operasi tertukar', () => {
  assert.equal(E.diagnosaKaliBagiBulat('1', 3, '×', -2).kode, 'jadi-jumlah');
  assert.equal(E.diagnosaKaliBagiBulat('−36', -12, ':', 3).kode, 'jadi-kali');
  assert.equal(E.diagnosaKaliBagiBulat('−15', -12, ':', 3).kode, 'jadi-kurang');
});

test('diagnosaKaliBagiBulat: jawaban lain memberi arahan sesuai operasi', () => {
  const kali = E.diagnosaKaliBagiBulat('5', 4, '×', -3);
  assert.equal(kali.kode, 'lain');
  assert.match(kali.pesan, /aturan tanda/);
  assert.match(kali.pesan, /4 × \(−3\)/);
  const bagi = E.diagnosaKaliBagiBulat('−5', -12, ':', 3);
  assert.equal(bagi.kode, 'lain');
  assert.match(bagi.pesan, /3 × … = −12/);
});

test('diagnosaKaliBagiBulat: hasil nol tidak didiagnosis sebagai tanda terbalik', () => {
  assert.equal(E.diagnosaKaliBagiBulat('0', 0, '×', -5).benar, true);
  assert.notEqual(E.diagnosaKaliBagiBulat('5', 0, '×', -5).kode, 'tanda-hasil');
});

/* ---------- langkah isian 'hitung' untuk × dan : ---------- */

test('periksaCekStep hitung: × dan : memakai diagnosaKaliBagiBulat', () => {
  const st = E.makeCekStep();
  const step = { jenis: 'hitung', a: -3, op: '×', b: -2, jawab: 6, label: 'x', hints: [] };
  let r = E.periksaCekStep(st, step, '-6');
  assert.equal(r.kode, 'tanda-hasil');
  assert.equal(st.done, false);
  assert.equal(st.attempts, 1);
  r = E.periksaCekStep(st, step, '6');
  assert.equal(st.done, true);
  const st2 = E.makeCekStep();
  E.periksaCekStep(st2, { jenis: 'hitung', a: -12, op: ':', b: 3, jawab: -4 }, '−4');
  assert.equal(st2.done, true);
  /* + dan − tetap memakai diagnosaOperasiBulat (seksi 17). */
  const st3 = E.makeCekStep();
  const r3 = E.periksaCekStep(st3, { jenis: 'hitung', a: 5, op: '-', b: -2, jawab: 7 }, '3');
  assert.equal(r3.kode, 'kurang-salah');
});
