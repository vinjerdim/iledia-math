'use strict';

/*
 * Tes engine seksi 81 — perkalian & pembagian bentuk aljabar berpangkat
 * berbasis sama: rincian koefisien & eksponen per variabel, langkah
 * penyelesaian tertulis, diagnosa miskonsepsi khas kali/bagi, opsi
 * berpengecoh, serta ubin faktor bentuk aljabar (buildMonoFactorTiles).
 * Kunci selalu dibandingkan dengan evaluasi numerik Math.pow (bebas dari
 * sifat yang sedang diuji).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function suku(koef, pangkat) {
  return { koef: koef, pangkat: pangkat };
}

function nilaiSuku(s, vals) {
  return Object.keys(s.pangkat).reduce(
    (h, v) => h * Math.pow(vals[v], s.pangkat[v]),
    typeof s.koef === 'number' ? s.koef : s.koef.num / s.koef.den
  );
}

/* Objek dari konteks vm berbeda realm; salin ke objek biasa sebelum deepEqual. */
function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function dekat(a, b) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

const A = suku(3, { x: 2, y: 1 });
const B = suku(4, { x: 5, y: 3 });
const P = suku(12, { a: 7, b: 4 });
const Q = suku(4, { a: 3, b: 1 });

/* ---------------- rincian ---------------- */

test('rincianKaliBagiMonomial: kali menjumlahkan eksponen per variabel', () => {
  const r = E.rincianKaliBagiMonomial('kali', A, B);
  assert.equal(r.jenis, 'kali');
  assert.equal(E.formatPecahan(r.koef.hasil), '12');
  assert.deepEqual(plain(r.vars.map((x) => [x.v, x.m, x.n, x.k])), [
    ['x', 2, 5, 7],
    ['y', 1, 3, 4],
  ]);
  assert.equal(E.formatMonomial(r.hasil), '12x⁷y⁴');
  const vals = { x: 2, y: 3 };
  assert.ok(
    dekat(E.nilaiPecahan(E.nilaiMonomial(r.hasil, vals)), nilaiSuku(A, vals) * nilaiSuku(B, vals))
  );
});

test('rincianKaliBagiMonomial: bagi mengurangkan eksponen; eksponen 0 hilang dari hasil', () => {
  const r = E.rincianKaliBagiMonomial('bagi', P, Q);
  assert.equal(E.formatPecahan(r.koef.hasil), '3');
  assert.deepEqual(plain(r.vars.map((x) => [x.v, x.k])), [
    ['a', 4],
    ['b', 3],
  ]);
  const r0 = E.rincianKaliBagiMonomial('bagi', suku(6, { m: 4, n: 2 }), suku(2, { m: 1, n: 2 }));
  assert.deepEqual(plain(r0.vars.map((x) => x.k)), [3, 0]);
  assert.equal(E.formatMonomial(r0.hasil), '3m³');
});

test('rincianKaliBagiMonomial: variabel yang hanya ada di satu suku tetap tercatat', () => {
  const r = E.rincianKaliBagiMonomial('kali', suku(2, { x: 3 }), suku(5, { y: 2 }));
  assert.deepEqual(plain(r.vars.map((x) => [x.v, x.m, x.n, x.k])), [
    ['x', 3, 0, 3],
    ['y', 0, 2, 2],
  ]);
});

/* ---------------- langkah tertulis ---------------- */

test('langkahKaliBagiMonomial: koefisien, tiap variabel, lalu hasil', () => {
  const l = E.langkahKaliBagiMonomial('kali', A, B);
  assert.deepEqual(Array.from(l), [
    'Koefisien: 3 × 4 = 12',
    'Variabel x: x² × x⁵ = x²⁺⁵ = x⁷',
    'Variabel y: y × y³ = y¹⁺³ = y⁴',
    'Hasil: 12x⁷y⁴',
  ]);
  const b = E.langkahKaliBagiMonomial('bagi', suku(6, { m: 4, n: 2 }), suku(2, { m: 1, n: 2 }));
  assert.deepEqual(Array.from(b), [
    'Koefisien: 6 : 2 = 3',
    'Variabel m: m⁴ : m = m⁴⁻¹ = m³',
    'Variabel n: n² : n² = n²⁻² = n⁰ = 1',
    'Hasil: 3m³',
  ]);
});

test('langkahKaliBagiMonomial: variabel tunggal tidak dioperasikan', () => {
  const l = E.langkahKaliBagiMonomial('kali', suku(2, { x: 3 }), suku(5, { y: 2 }));
  assert.equal(l[1], 'Variabel x: x³ (hanya ada di satu suku)');
});

/* ---------------- diagnosa ---------------- */

function mono(koef, pangkat) {
  return E.monomial(koef, pangkat);
}

test('diagnosaKaliBagiMonomial: benar & miskonsepsi khas perkalian', () => {
  const D = (j) => E.diagnosaKaliBagiMonomial('kali', A, B, j);
  assert.equal(D(mono(12, { x: 7, y: 4 })), 'benar');
  assert.equal(D(mono(12, { x: 10, y: 3 })), 'eksponenDikali');
  assert.equal(D(mono(7, { x: 7, y: 4 })), 'koefDijumlah');
  assert.equal(D(mono(12, { x: 7, y: 3 })), 'eksponen');
  assert.equal(D(null), 'lain');
});

test('diagnosaKaliBagiMonomial: miskonsepsi khas pembagian', () => {
  const D = (j) =>
    E.diagnosaKaliBagiMonomial('bagi', suku(12, { a: 6, b: 4 }), suku(4, { a: 2, b: 1 }), j);
  assert.equal(D(mono(3, { a: 4, b: 3 })), 'benar');
  assert.equal(D(mono(3, { a: 3, b: 4 })), 'eksponenDibagi');
  assert.equal(D(mono(3, { a: 8, b: 5 })), 'eksponenDijumlah');
  assert.equal(D(mono(8, { a: 4, b: 3 })), 'koefDikurang');
  assert.equal(D(mono(48, { a: 4, b: 3 })), 'koefDikali');
});

test('diagnosaKaliBagiMonomial: pola pengecoh yang kebetulan sama dengan kunci tidak dipakai', () => {
  /* x² × x² : 2 + 2 = 2 × 2 → eksponen benar, koefisien salah. */
  const k = E.diagnosaKaliBagiMonomial(
    'kali',
    suku(2, { x: 2 }),
    suku(2, { x: 2 }),
    mono(5, { x: 4 })
  );
  assert.equal(k, 'koefisien');
});

test('pesanDiagnosaKaliBagi: pesan khas & jatuh ke pesan monomial', () => {
  [
    'eksponenDikali',
    'eksponenDibagi',
    'eksponenDijumlah',
    'koefDijumlah',
    'koefDikurang',
    'koefDikali',
  ].forEach((k) => assert.ok(E.pesanDiagnosaKaliBagi(k).length > 20, k));
  assert.equal(E.pesanDiagnosaKaliBagi('eksponen'), E.pesanDiagnosaMonomial('eksponen'));
});

/* ---------------- opsi berpengecoh ---------------- */

test('opsiKaliBagiMonomial: empat opsi unik, tepat satu kunci', () => {
  [
    ['kali', A, B],
    ['bagi', P, Q],
    ['kali', suku(2, { x: 2 }), suku(2, { x: 2 })],
    ['bagi', suku(20, { a: 6, b: 4 }), suku(5, { a: 2, b: 1 })],
  ].forEach(([j, a, b]) => {
    const o = E.opsiKaliBagiMonomial(j, a, b);
    assert.equal(o.opsi.length, 4);
    assert.equal(new Set(o.opsi.map((x) => x.id)).size, 4);
    assert.equal(new Set(o.opsi.map((x) => x.label)).size, 4);
    const kunci = E.rincianKaliBagiMonomial(j, a, b).hasil;
    const cocok = o.opsi.filter((x) => E.samaMonomial(x.monomial, kunci));
    assert.equal(cocok.length, 1);
    assert.equal(cocok[0].id, o.correct);
    assert.equal(cocok[0].label, E.formatMonomial(kunci, { positif: true }));
  });
});

/* ---------------- ubin faktor aljabar ---------------- */

function hitung(html, re) {
  return (html.match(re) || []).length;
}

test('buildMonoFactorTiles kali: ubin koefisien & variabel, dapat dikelompokkan', () => {
  const html = E.buildMonoFactorTiles({ jenis: 'kali', a: A, b: B });
  assert.match(html, /role="img"/);
  assert.equal(hitung(html, /fx-tile--koef/g), 2);
  assert.equal(hitung(html, />x<\/span>/g), 7);
  assert.equal(hitung(html, />y<\/span>/g), 4);
  assert.match(html, /aria-label="3x²y kali 4x⁵y³/);

  const g = E.buildMonoFactorTiles(
    { jenis: 'kali', a: A, b: B, kelompok: true },
    { caption: 'Cek' }
  );
  assert.equal(hitung(g, /fx-group--gabung/g), 3, 'koefisien, x, y');
  assert.match(g, /7 faktor x/);
  assert.match(g, /<figcaption class="dl-caption">Cek<\/figcaption>/);
});

test('buildMonoFactorTiles bagi: pecahan dengan coretan pasangan per variabel', () => {
  const html = E.buildMonoFactorTiles({ jenis: 'bagi', a: P, b: Q, coret: true });
  assert.match(html, /fx-frac/);
  assert.equal(hitung(html, /fx-tile--coret/g), 2 * (3 + 1));
  assert.match(html, /3 pasang faktor a dicoret/);
  const tanpa = E.buildMonoFactorTiles({ jenis: 'bagi', a: P, b: Q });
  assert.equal(hitung(tanpa, /fx-tile--coret/g), 0);
});

test('buildMonoFactorTiles bagi: baris yang habis dicoret menampilkan 1', () => {
  const html = E.buildMonoFactorTiles({
    jenis: 'bagi',
    a: suku(1, { x: 2 }),
    b: suku(1, { x: 2 }),
    coret: true,
  });
  assert.equal(hitung(html, /fx-one/g), 2);
});
