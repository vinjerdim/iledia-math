'use strict';

/*
 * Tes seksi 32 shared/engine.js: selisih & beda barisan aritmetika —
 * format suku, selisih berurutan, beda (null bila bukan aritmetika),
 * sifat naik/turun/konstan, beda dari dua suku tak berurutan, pembaca
 * isian selisih, diagnosa miskonsepsi, pelacak selisih, dan lab barisan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

test('fmtSuku: minus tipografis, pemisah ribuan, dan desimal berkoma', () => {
  assert.equal(E.fmtSuku(8080), '8.080');
  assert.equal(E.fmtSuku(-8), '−8');
  assert.equal(E.fmtSuku(0.5), '0,5');
  assert.equal(E.fmtSuku(-0.3), '−0,3');
  assert.equal(E.fmtSuku(2.9000000000000004), '2,9');
  assert.equal(E.fmtSuku(0), '0');
});

test('selisihBerurutan menghitung U(k+1) − U(k) tanpa galat biner', () => {
  assert.deepEqual(Array.from(E.selisihBerurutan([8080, 8085, 8090, 8095])), [5, 5, 5]);
  assert.deepEqual(Array.from(E.selisihBerurutan([120, 112, 104])), [-8, -8]);
  assert.deepEqual(Array.from(E.selisihBerurutan([3.2, 2.9, 2.6, 2.3])), [-0.3, -0.3, -0.3]);
  assert.deepEqual(Array.from(E.selisihBerurutan([50, 100, 200, 400])), [50, 100, 200]);
  assert.deepEqual(Array.from(E.selisihBerurutan([7])), []);
});

test('bedaBarisan: beda untuk barisan aritmetika, null bila bukan', () => {
  assert.equal(E.bedaBarisan([7, 11, 15, 19]), 4);
  assert.equal(E.bedaBarisan([45, 38, 31, 24]), -7);
  assert.equal(E.bedaBarisan([9, 9, 9, 9]), 0);
  assert.equal(E.bedaBarisan([1.5, 2, 2.5, 3]), 0.5);
  assert.equal(E.bedaBarisan([3.2, 2.9, 2.6, 2.3]), -0.3);
  assert.equal(E.bedaBarisan([2, 4, 8, 16]), null);
  assert.equal(E.bedaBarisan([10, 12, 15, 19]), null);
  assert.equal(E.bedaBarisan([5]), null);
});

test('sifatBarisanAritmetika mengikuti tanda beda', () => {
  assert.equal(E.sifatBarisanAritmetika(3), 'naik');
  assert.equal(E.sifatBarisanAritmetika(-0.5), 'turun');
  assert.equal(E.sifatBarisanAritmetika(0), 'konstan');
});

test('bedaDariDuaSuku: (Uₙ − Uₘ)/(n − m)', () => {
  assert.equal(E.bedaDariDuaSuku(2, 14, 5, 26), 4);
  assert.equal(E.bedaDariDuaSuku(5, 26, 2, 14), 4);
  assert.equal(E.bedaDariDuaSuku(1, 40, 4, 25), -5);
  assert.ok(Number.isNaN(E.bedaDariDuaSuku(3, 10, 3, 10)));
});

test('parseSelisih menerima tanda +, −, -, dan desimal koma/titik', () => {
  assert.equal(E.parseSelisih('5').value, 5);
  assert.equal(E.parseSelisih('+5').value, 5);
  assert.equal(E.parseSelisih(' −8 ').value, -8);
  assert.equal(E.parseSelisih('-0,3').value, -0.3);
  assert.equal(E.parseSelisih('0.5').value, 0.5);
  assert.equal(E.parseSelisih('').error, 'empty');
  assert.equal(E.parseSelisih('lima').error, 'invalid');
  assert.equal(E.parseSelisih('1.000').error, 'invalid');
});

test('diagnosaSelisih mengenali miskonsepsi umum', () => {
  assert.equal(E.diagnosaSelisih(120, 112, -8), 'benar');
  assert.equal(E.diagnosaSelisih(120, 112, 8), 'terbalik');
  assert.equal(E.diagnosaSelisih(8080, 8085, 16165), 'jumlah');
  assert.equal(E.diagnosaSelisih(8080, 8085, 8085), 'suku');
  assert.equal(E.diagnosaSelisih(8080, 8085, 3), 'salah');
  assert.equal(E.diagnosaSelisih(3.2, 2.9, -0.3), 'benar');
  assert.equal(E.diagnosaSelisih(9, 9, 0), 'benar');
});

test('pesanSelisih memberi umpan balik khas setiap kode', () => {
  ['terbalik', 'jumlah', 'suku', 'salah'].forEach((k) => {
    const p = E.pesanSelisih(k, 120, 112);
    assert.ok(typeof p === 'string' && p.length > 20, k);
  });
  assert.match(E.pesanSelisih('terbalik', 120, 112), /112 − 120/);
});

test('pelacak selisih: state, render, dan status selesai', () => {
  const terms = [120, 112, 104, 96];
  const st = E.makeSelisihState(terms);
  assert.equal(st.inputs.length, 3);
  assert.equal(E.selisihTrackerSelesai(st), false);

  const html = E.buildSelisihTracker('t1', terms, st, { satuan: 'GB' });
  assert.equal((html.match(/class="seq-tile[ "]/g) || []).length, 4);
  assert.equal((html.match(/id="t1In\d"/g) || []).length, 3);
  assert.match(html, /id="t1Check"/);

  st.inputs = ['8', '-8', '−8'];
  E.periksaSelisihTracker(terms, st);
  assert.deepEqual(Array.from(st.status), ['terbalik', 'benar', 'benar']);
  assert.equal(E.selisihTrackerSelesai(st), false);
  const html2 = E.buildSelisihTracker('t1', terms, st, {});
  assert.equal((html2.match(/id="t1In\d"/g) || []).length, 1);
  assert.match(html2, /feedback-box--error/);

  st.inputs[0] = '−8';
  E.periksaSelisihTracker(terms, st);
  assert.equal(E.selisihTrackerSelesai(st), true);
  assert.doesNotMatch(E.buildSelisihTracker('t1', terms, st, {}), /id="t1Check"/);
});

test('ensureSelisihState memperbaiki state rusak/berbeda panjang', () => {
  const S = { x: { inputs: ['1'], status: [null] } };
  E.ensureSelisihState(S, 'x', [1, 2, 3, 4]);
  assert.equal(S.x.inputs.length, 3);
  const keep = S.x;
  E.ensureSelisihState(S, 'x', [1, 2, 3, 4]);
  assert.equal(S.x, keep);
});

test('lab barisan: daftar suku, kategori yang dicoba, dan render', () => {
  const lab = E.makeLabBarisan(4, 3);
  assert.deepEqual(Array.from(E.sukuLabBarisan(lab, 5)), [4, 7, 10, 13, 16]);
  E.catatLabBarisan(lab);
  assert.equal(lab.dicoba.naik, true);
  assert.equal(E.labBarisanLengkap(lab), false);
  lab.b = -2;
  E.catatLabBarisan(lab);
  lab.b = 0;
  E.catatLabBarisan(lab);
  assert.equal(E.labBarisanLengkap(lab), true);

  const html = E.buildLabBarisan('lab', lab, { n: 6 });
  assert.match(html, /id="labA(Dec|Inc)"/);
  assert.match(html, /id="labB(Dec|Inc)"/);
  assert.equal((html.match(/class="seq-tile[ "]/g) || []).length, 6);
  assert.match(html, /<svg/);
});

test('buildLompatanSVG menggambar satu busur per pasangan suku', () => {
  const svg = E.buildLompatanSVG([4, 7, 10, 13]);
  assert.equal((svg.match(/class="bar-arc bar-arc--/g) || []).length, 3);
  assert.match(svg, /\+3/);
  const turun = E.buildLompatanSVG([10, 8, 6]);
  assert.match(turun, /bar-arc--turun/);
  assert.match(turun, /−2/);
  const konstan = E.buildLompatanSVG([5, 5, 5]);
  assert.match(konstan, /bar-arc--konstan/);
});
