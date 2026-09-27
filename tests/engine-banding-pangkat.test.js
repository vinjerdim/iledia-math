'use strict';

/*
 * Tes shared/engine.js seksi 51 (membandingkan & mengurutkan bilangan
 * berpangkat bulat): nilai eksak aⁿ, perbandingan lewat pecahan eksak,
 * lambang <, >, =, pengurutan naik/turun, nilai ekstrem, basis bersama,
 * strategi membandingkan (basis sama, pangkat sama, samakan basis,
 * hitung nilai), alasan, diagnosa miskonsepsi, lab timbang pangkat,
 * serta komponen render (kalimat banding, pilihan lambang, kartu).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function P(a, n) {
  return { a: a, n: n };
}

/* ---------- nilai & teks ---------- */

test('teksPangkat memakai superskrip dan kurung untuk basis negatif', () => {
  assert.equal(E.teksPangkat(P(2, 10)), '2¹⁰');
  assert.equal(E.teksPangkat(P(10, -6)), '10⁻⁶');
  assert.equal(E.teksPangkat(P(-2, 3)), '(−2)³');
  assert.equal(E.teksPangkat(P(5, 0)), '5⁰');
});

test('pangkatHTML memakai <sup> dengan tanda minus tipografis', () => {
  assert.equal(E.pangkatHTML(P(2, 10)), '2<sup>10</sup>');
  assert.equal(E.pangkatHTML(P(10, -3)), '10<sup>−3</sup>');
  assert.equal(E.pangkatHTML(P(-3, 4)), '(−3)<sup>4</sup>');
});

test('nilaiBerpangkat eksak untuk pangkat positif, nol, dan negatif', () => {
  assert.deepEqual(plain(E.nilaiBerpangkat(P(2, 10))), { num: 1024, den: 1 });
  assert.deepEqual(plain(E.nilaiBerpangkat(P(7, 0))), { num: 1, den: 1 });
  assert.deepEqual(plain(E.nilaiBerpangkat(P(2, -3))), { num: 1, den: 8 });
  assert.deepEqual(plain(E.nilaiBerpangkat(P(-2, 3))), { num: -8, den: 1 });
  assert.deepEqual(plain(E.nilaiBerpangkat(P(-2, -3))), { num: -1, den: 8 });
});

test('teksNilaiPangkat menulis aⁿ = nilai', () => {
  assert.equal(E.teksNilaiPangkat(P(2, 10)), '2¹⁰ = 1.024');
  assert.equal(E.teksNilaiPangkat(P(10, -3)), '10⁻³ = 1/1.000');
  assert.equal(E.teksNilaiPangkat(P(-2, 3)), '(−2)³ = −8');
});

/* ---------- membandingkan & mengurutkan ---------- */

test('bandingPangkat & simbolBandingPangkat', () => {
  assert.equal(E.bandingPangkat(P(2, 5), P(5, 2)), 1);
  assert.equal(E.bandingPangkat(P(2, 10), P(10, 3)), 1);
  assert.equal(E.bandingPangkat(P(9, 4), P(27, 3)), -1);
  assert.equal(E.bandingPangkat(P(4, 3), P(8, 2)), 0);
  assert.equal(E.bandingPangkat(P(10, -6), P(10, -7)), 1);
  assert.equal(E.bandingPangkat(P(-3, 3), P(-3, 4)), -1);
  assert.equal(E.simbolBandingPangkat(P(2, -3), P(2, -5)), 'gt');
  assert.equal(E.simbolBandingPangkat(P(5, 0), P(3, 0)), 'eq');
  assert.equal(E.simbolBandingPangkat(P(3, 4), P(3, 6)), 'lt');
});

test('bandingPangkat menolak nilai di luar bilangan bulat aman', () => {
  assert.throws(() => E.bandingPangkat(P(10, 17), P(9, 17)));
});

test('kalimatBandingPangkat', () => {
  assert.equal(E.kalimatBandingPangkat(P(2, 10), P(10, 3)), '2¹⁰ > 10³');
  assert.equal(E.kalimatBandingPangkat(P(9, 4), P(27, 3)), '9⁴ < 27³');
  assert.equal(E.kalimatBandingPangkat(P(4, 3), P(8, 2)), '4³ = 8²');
});

test('urutkanPangkat & urutanIdPangkat (naik/turun) tanpa mengubah masukan', () => {
  const items = [
    { id: 'a', a: 2, n: -2 },
    { id: 'b', a: 3, n: 0 },
    { id: 'c', a: 2, n: 3 },
    { id: 'd', a: 5, n: -1 },
    { id: 'e', a: -2, n: 3 },
  ];
  const salinan = plain(items);
  assert.deepEqual(plain(E.urutanIdPangkat(items, 'naik')), ['e', 'd', 'a', 'b', 'c']);
  assert.deepEqual(plain(E.urutanIdPangkat(items, 'turun')), ['c', 'b', 'a', 'd', 'e']);
  assert.deepEqual(plain(E.urutkanPangkat(items, 'naik').map((x) => x.id)), [
    'e',
    'd',
    'a',
    'b',
    'c',
  ]);
  assert.deepEqual(plain(items), salinan);
});

test('ekstremPangkat: id terbesar/terkecil tunggal, null bila kembar', () => {
  const items = [
    { id: 'a', a: 2, n: 6 },
    { id: 'b', a: 4, n: 2 },
    { id: 'c', a: 3, n: 3 },
  ];
  assert.equal(E.ekstremPangkat(items, 'terbesar'), 'a');
  assert.equal(E.ekstremPangkat(items, 'terkecil'), 'b');
  assert.equal(
    E.ekstremPangkat(
      [
        { id: 'x', a: 2, n: 6 },
        { id: 'y', a: 8, n: 2 },
      ],
      'terbesar'
    ),
    null
  );
});

/* ---------- basis bersama & strategi ---------- */

test('basisBersama mencari basis terkecil yang sama', () => {
  assert.deepEqual(plain(E.basisBersama(4, 8)), { c: 2, i: 2, j: 3 });
  assert.deepEqual(plain(E.basisBersama(9, 27)), { c: 3, i: 2, j: 3 });
  assert.deepEqual(plain(E.basisBersama(2, 16)), { c: 2, i: 1, j: 4 });
  assert.equal(E.basisBersama(3, 5), null);
  assert.equal(E.basisBersama(6, 12), null);
  assert.equal(E.basisBersama(1, 8), null);
});

test('strategiBandingPangkat memilih strategi yang paling cocok', () => {
  assert.equal(E.strategiBandingPangkat(P(2, 8), P(2, 11)), 'basisSama');
  assert.equal(E.strategiBandingPangkat(P(10, -5), P(10, -7)), 'basisSama');
  assert.equal(E.strategiBandingPangkat(P(6, 4), P(5, 4)), 'pangkatSama');
  assert.equal(E.strategiBandingPangkat(P(2, -3), P(5, -3)), 'pangkatSama');
  assert.equal(E.strategiBandingPangkat(P(9, 4), P(27, 3)), 'samakanBasis');
  assert.equal(E.strategiBandingPangkat(P(7, 0), P(3, -2)), 'hitungNilai');
  assert.equal(E.strategiBandingPangkat(P(-3, 3), P(-3, 4)), 'hitungNilai');
  assert.equal(E.strategiBandingPangkat(P(2, 5), P(5, 2)), 'hitungNilai');
  assert.equal(E.strategiBandingPangkat(P(5, 0), P(3, 0)), 'hitungNilai');
});

test('opsiStrategiBandingPangkat: empat strategi ber-id unik, salinan baru', () => {
  const a = E.opsiStrategiBandingPangkat();
  assert.deepEqual(plain(a.map((o) => o.id)), [
    'basisSama',
    'pangkatSama',
    'samakanBasis',
    'hitungNilai',
  ]);
  a.forEach((o) => assert.ok(o.label && o.aturan));
  a[0].label = 'x';
  assert.notEqual(E.opsiStrategiBandingPangkat()[0].label, 'x');
});

test('langkahSamakanBasis menulis basis bersama', () => {
  assert.equal(E.langkahSamakanBasis(P(9, 4), P(27, 3)), '9⁴ = (3²)⁴ = 3⁸ dan 27³ = (3³)³ = 3⁹');
  assert.equal(E.langkahSamakanBasis(P(3, 4), P(5, 2)), null);
});

test('alasanBandingPangkat menjelaskan sesuai strategi', () => {
  assert.match(E.alasanBandingPangkat(P(2, 8), P(2, 11)), /Basis sama.*2⁸ < 2¹¹/);
  assert.match(E.alasanBandingPangkat(P(6, 4), P(5, 4)), /Pangkat sama.*6⁴ > 5⁴/);
  assert.match(E.alasanBandingPangkat(P(2, -3), P(5, -3)), /negatif.*lebih KECIL.*2⁻³ > 5⁻³/);
  assert.match(E.alasanBandingPangkat(P(9, 4), P(27, 3)), /3⁸.*3⁹.*9⁴ < 27³/);
  assert.match(E.alasanBandingPangkat(P(7, 0), P(3, -2)), /7⁰ = 1.*3⁻² = 1\/9.*7⁰ > 3⁻²/);
});

/* ---------- diagnosa miskonsepsi ---------- */

test('diagnosaBandingPangkat mengenali miskonsepsi umum', () => {
  const d = E.diagnosaBandingPangkat;
  assert.equal(d(P(2, 5), P(5, 2), 'gt'), 'benar');
  assert.equal(d(P(2, 5), P(5, 2), 'lt'), 'bandingBasisSaja');
  assert.equal(d(P(2, 5), P(5, 2), 'eq'), 'kaliEksponen');
  assert.equal(d(P(2, 10), P(10, 3), 'lt'), 'bandingBasisSaja');
  assert.equal(d(P(9, 4), P(27, 3), 'gt'), 'bandingPangkatSaja');
  assert.equal(d(P(2, -3), P(2, -5), 'lt'), 'abaikanTandaPangkat');
  assert.equal(d(P(7, 0), P(3, -2), 'lt'), 'nolJadiNol');
  assert.equal(d(P(2, -3), P(1, 1), 'lt'), 'benar');
  assert.equal(d(P(2, -2), P(-3, 1), 'lt'), 'negatifDianggapNegatif');
  assert.equal(d(P(-2, 3), P(-2, 2), 'gt'), 'abaikanTandaBasis');
  assert.equal(d(P(3, 4), P(3, 6), 'eq'), 'lain');
});

test('pesanBandingPangkat memberi penjelasan untuk setiap kode', () => {
  [
    ['bandingBasisSaja', P(2, 5), P(5, 2)],
    ['bandingPangkatSaja', P(9, 4), P(27, 3)],
    ['kaliEksponen', P(2, 5), P(5, 2)],
    ['abaikanTandaPangkat', P(2, -3), P(2, -5)],
    ['nolJadiNol', P(7, 0), P(3, -2)],
    ['negatifDianggapNegatif', P(2, -2), P(-3, 1)],
    ['abaikanTandaBasis', P(-2, 3), P(-2, 2)],
    ['lain', P(3, 4), P(3, 6)],
  ].forEach(([kode, p, q]) => {
    const teks = E.pesanBandingPangkat(kode, p, q);
    assert.equal(typeof teks, 'string');
    assert.ok(teks.length > 20, kode);
  });
  assert.match(E.pesanBandingPangkat('nolJadiNol', P(7, 0), P(3, -2)), /7⁰ = 1/);
  assert.match(E.pesanBandingPangkat('negatifDianggapNegatif', P(2, -2), P(-3, 1)), /2⁻² = 1\/4/);
});

/* ---------- lab timbang pangkat ---------- */

test('lab timbang: state awal, ubah dalam batas, basis 0 dilewati', () => {
  const st = E.makeLabBandingPangkatState();
  assert.deepEqual(plain(st.p), { a: 2, n: 3 });
  assert.deepEqual(plain(st.q), { a: 3, n: 2 });
  E.ubahLabBandingPangkat(st, 'p', 'a', -1);
  assert.equal(st.p.a, 1);
  E.ubahLabBandingPangkat(st, 'p', 'a', -1);
  assert.equal(st.p.a, -1, 'basis 0 dilewati');
  st.q.n = E.LAB_BANDING_PANGKAT_BATAS.nMaks;
  E.ubahLabBandingPangkat(st, 'q', 'n', 1);
  assert.equal(st.q.n, E.LAB_BANDING_PANGKAT_BATAS.nMaks, 'tidak melewati batas');
});

test('lab timbang: mencatat strategi yang sudah dicoba', () => {
  const st = E.makeLabBandingPangkatState();
  E.catatLabBandingPangkat(st);
  assert.deepEqual(plain(st.strategi), ['hitungNilai']);
  st.p = P(2, 4);
  st.q = P(2, 6);
  E.catatLabBandingPangkat(st);
  E.catatLabBandingPangkat(st);
  assert.deepEqual(plain(st.strategi), ['hitungNilai', 'basisSama']);
});

test('buildLabBandingPangkat menampilkan nilai, lambang, dan strategi', () => {
  const st = E.makeLabBandingPangkatState();
  st.p = P(9, 4);
  st.q = P(27, 3);
  const html = E.buildLabBandingPangkat('lab', st);
  assert.match(html, /9<sup>4<\/sup>/);
  assert.match(html, /6\.561/);
  assert.match(html, /19\.683/);
  assert.match(html, /&lt;/);
  assert.match(html, /Samakan basis/);
  assert.match(html, /data-lab-sisi="p" data-lab-kunci="a" data-lab-langkah="-1"/);
});

/* ---------- render ---------- */

test('buildKalimatBandingPangkat menampilkan kotak ? atau lambang terisi', () => {
  const kosong = E.buildKalimatBandingPangkat(P(2, 10), P(10, 3), null);
  assert.match(kosong, /2<sup>10<\/sup>/);
  assert.match(kosong, />\?</);
  const isi = E.buildKalimatBandingPangkat(P(2, 10), P(10, 3), 'gt');
  assert.match(isi, /is-filled/);
  assert.match(isi, /&gt;/);
  assert.match(isi, /aria-label="2¹⁰ &gt; 10³"/);
});

test('pilih lambang pangkat: terkunci setelah benar, diagnosa saat salah', () => {
  const st = { chosen: 'lt', wrong: 1, diag: 'bandingBasisSaja' };
  const salah = E.buildPilihSimbolPangkat(P(2, 5), P(5, 2), ['eq', 'lt', 'gt'], st, {
    group: 's1',
  });
  assert.match(salah, /data-pkt-sym="lt"/);
  assert.match(salah, /is-incorrect/);
  assert.match(salah, /hanya membandingkan basis/i);
  const idx = ['eq', 'lt', 'gt'].map((id) => salah.indexOf('data-pkt-sym="' + id + '"'));
  assert.ok(idx[0] < idx[1] && idx[1] < idx[2], 'urutan tombol mengikuti state acak');
  const benar = E.buildPilihSimbolPangkat(
    P(2, 5),
    P(5, 2),
    ['eq', 'lt', 'gt'],
    { chosen: 'gt', wrong: 1, diag: null },
    { group: 's1' }
  );
  assert.match(benar, /is-correct/);
  assert.match(benar, /disabled/);
});

test('catatPilihSimbolPangkat memperbarui state dan menghitung salah', () => {
  const st = { chosen: null, wrong: 0, diag: null };
  E.catatPilihSimbolPangkat(st, P(9, 4), P(27, 3), 'gt');
  assert.deepEqual(plain(st), { chosen: 'gt', wrong: 1, diag: 'bandingPangkatSaja' });
  E.catatPilihSimbolPangkat(st, P(9, 4), P(27, 3), 'lt');
  assert.deepEqual(plain(st), { chosen: 'lt', wrong: 1, diag: null });
  E.catatPilihSimbolPangkat(st, P(9, 4), P(27, 3), 'eq');
  assert.equal(st.chosen, 'lt', 'terkunci setelah benar');
});

test('buildTapOrder memakai opts.wrongText bila diberikan', () => {
  const items = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ];
  const st = { pool: [], placed: ['b', 'a'], checked: true, correct: false, attempts: 1 };
  const html = E.buildTapOrder('t', items, st, {
    answer: ['a', 'b'],
    wrongText: 'Hitung nilainya.',
  });
  assert.match(html, /Hitung nilainya\./);
  assert.doesNotMatch(html, /garis bilangan/);
});
