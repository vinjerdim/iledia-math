'use strict';

/*
 * Tes shared/engine.js seksi 45 (bentuk akar & pangkat pecahan):
 * faktorisasi prima, akar bulat, penyederhanaan bentuk akar, konversi
 * bentuk akar ⇄ pangkat pecahan, nilai pangkat pecahan, format teks,
 * pengubah teks → HTML, diagnosa miskonsepsi, ubin faktor kembar,
 * konverter akar–pangkat, lab persegi & kubus, dan langkah isian akar.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(o) {
  return JSON.parse(JSON.stringify(o));
}

test('faktorPrima: urut naik, 1 → []', () => {
  assert.deepEqual(plain(E.faktorPrima(72)), [2, 2, 2, 3, 3]);
  assert.deepEqual(plain(E.faktorPrima(54)), [2, 3, 3, 3]);
  assert.deepEqual(plain(E.faktorPrima(13)), [13]);
  assert.deepEqual(plain(E.faktorPrima(1)), []);
});

test('akarBulat: akar ke-n bulat atau null', () => {
  assert.equal(E.akarBulat(49, 2), 7);
  assert.equal(E.akarBulat(64, 3), 4);
  assert.equal(E.akarBulat(64, 6), 2);
  assert.equal(E.akarBulat(27000, 3), 30);
  assert.equal(E.akarBulat(0, 2), 0);
  assert.equal(E.akarBulat(1, 5), 1);
  assert.equal(E.akarBulat(72, 2), null);
  assert.equal(E.akarBulat(16, 3), null);
});

test('sederhanakanAkar: faktor pangkat-n terbesar keluar dari akar', () => {
  assert.deepEqual(plain(E.sederhanakanAkar(72, 2)), { luar: 6, dalam: 2 });
  assert.deepEqual(plain(E.sederhanakanAkar(48, 2)), { luar: 4, dalam: 3 });
  assert.deepEqual(plain(E.sederhanakanAkar(50, 2)), { luar: 5, dalam: 2 });
  assert.deepEqual(plain(E.sederhanakanAkar(54, 3)), { luar: 3, dalam: 2 });
  assert.deepEqual(plain(E.sederhanakanAkar(16, 3)), { luar: 2, dalam: 2 });
  assert.deepEqual(plain(E.sederhanakanAkar(49, 2)), { luar: 7, dalam: 1 });
  assert.deepEqual(plain(E.sederhanakanAkar(30, 2)), { luar: 1, dalam: 30 });
});

test('faktorPangkatTerbesar & akarSederhana', () => {
  assert.equal(E.faktorPangkatTerbesar(72, 2), 36);
  assert.equal(E.faktorPangkatTerbesar(54, 3), 27);
  assert.equal(E.faktorPangkatTerbesar(30, 2), 1);
  assert.equal(E.akarSederhana(30, 2), true);
  assert.equal(E.akarSederhana(18, 2), false);
  assert.equal(E.akarSederhana(18, 3), true);
  assert.equal(E.akarSederhana(24, 3), false);
});

test('akarKePangkat & pangkatKeAkar: pangkat di dalam jadi pembilang, indeks jadi penyebut', () => {
  assert.deepEqual(plain(E.akarKePangkat(3, 5, 2)), { a: 5, p: 2, q: 3 });
  assert.deepEqual(plain(E.akarKePangkat(2, 72)), { a: 72, p: 1, q: 2 });
  assert.deepEqual(plain(E.pangkatKeAkar(7, 3, 4)), { n: 4, r: 7, m: 3 });
});

test('pecahanSetaraEksponen: 4/6 setara 2/3', () => {
  assert.equal(E.eksponenSetara(4, 6, 2, 3), true);
  assert.equal(E.eksponenSetara(3, 2, 2, 3), false);
});

test('nilaiPangkatPecahan: eksak bila akar bulat, selain itu hampiran', () => {
  assert.deepEqual(plain(E.nilaiPangkatPecahan(64, 2, 3)), { eksak: true, nilai: 16 });
  assert.deepEqual(plain(E.nilaiPangkatPecahan(64, 3, 2)), { eksak: true, nilai: 512 });
  assert.deepEqual(plain(E.nilaiPangkatPecahan(27, 2, 3)), { eksak: true, nilai: 9 });
  assert.deepEqual(plain(E.nilaiPangkatPecahan(16, 3, 4)), { eksak: true, nilai: 8 });
  const h = E.nilaiPangkatPecahan(2, 1, 2);
  assert.equal(h.eksak, false);
  assert.ok(Math.abs(h.nilai - Math.SQRT2) < 1e-9);
  /* ⁴√(9²) = 3 walau ⁴√9 tidak bulat */
  assert.deepEqual(plain(E.nilaiPangkatPecahan(9, 2, 4)), { eksak: true, nilai: 3 });
});

test('formatAkar: simbol akar, indeks, koefisien, pangkat di dalam', () => {
  assert.equal(E.formatAkar(1, 2, 2), '√2');
  assert.equal(E.formatAkar(6, 2, 2), '6√2');
  assert.equal(E.formatAkar(3, 3, 2), '3∛2');
  assert.equal(E.formatAkar(1, 4, 81), '∜81');
  assert.equal(E.formatAkar(1, 5, 2, 3), '⁵√(2³)');
  assert.equal(E.formatAkar(1, 3, 5, 2), '∛(5²)');
  assert.equal(E.formatAkar(7, 2, 1), '7');
});

test('formatPangkatPecahan: a^(p/q), q = 1 → pangkat biasa', () => {
  assert.equal(E.formatPangkatPecahan(5, 2, 3), '5^(2/3)');
  assert.equal(E.formatPangkatPecahan(72, 1, 2), '72^(1/2)');
  assert.equal(E.formatPangkatPecahan(7, 2, 1), '7²');
});

test('bacaAkar: kata-kata untuk label aria', () => {
  assert.equal(E.bacaAkar(1, 2, 2), 'akar kuadrat dari 2');
  assert.equal(E.bacaAkar(6, 2, 2), '6 akar kuadrat dari 2');
  assert.equal(E.bacaAkar(1, 3, 8), 'akar pangkat tiga dari 8');
  assert.equal(E.bacaAkar(1, 5, 2, 3), 'akar pangkat 5 dari 2 pangkat 3');
});

test('tulisAkarHTML: pangkat pecahan & tanda akar dirender', () => {
  const pp = E.tulisAkarHTML('5^(2/3)');
  assert.match(pp, /class="akar-pp"/);
  assert.match(pp, /<sup class="akar-pp__eks"[^>]*>2⁄3<\/sup>/);

  const a = E.tulisAkarHTML('6√2');
  assert.match(a, /class="akar"/);
  assert.match(a, /class="akar__isi">2</);
  assert.ok(a.startsWith('6'));

  const k = E.tulisAkarHTML('∛(5²)');
  assert.match(k, /class="akar__indeks"[^>]*>3</);
  assert.match(k, /class="akar__isi">5²</);

  const n = E.tulisAkarHTML('ⁿ√(aᵐ) = a^(m/n)');
  assert.match(n, /class="akar__indeks"[^>]*>n</);
  assert.match(n, /m⁄n/);

  const s = E.tulisAkarHTML('√(36 × 2)');
  assert.match(s, /class="akar__isi">36 × 2</);
  assert.match(E.tulisAkarHTML('3^(2−5)'), /<sup class="akar-pp__eks">2−5<\/sup>/);
  assert.equal(E.tulisAkarHTML('tanpa notasi'), 'tanpa notasi');
  assert.equal(E.tulisAkarHTML('<b>'), '&lt;b&gt;');
});

test('diagnosaKonversi: benar, setara, terbalik, basis', () => {
  const kunci = { a: 5, p: 2, q: 3 };
  assert.equal(E.diagnosaKonversi(kunci, { a: 5, p: 2, q: 3 }), 'benar');
  assert.equal(E.diagnosaKonversi(kunci, { a: 5, p: 4, q: 6 }), 'benar');
  assert.equal(E.diagnosaKonversi(kunci, { a: 5, p: 3, q: 2 }), 'terbalik');
  assert.equal(E.diagnosaKonversi(kunci, { a: 2, p: 5, q: 3 }), 'basis');
  assert.equal(E.diagnosaKonversi(kunci, { a: 5, p: 1, q: 3 }), 'lain');
  assert.ok(E.pesanDiagnosaKonversi('terbalik').length > 10);
});

test('diagnosaSederhanaAkar: miskonsepsi khas menyederhanakan', () => {
  assert.equal(E.diagnosaSederhanaAkar(72, 2, { luar: 6, dalam: 2 }), 'benar');
  assert.equal(E.diagnosaSederhanaAkar(72, 2, { luar: 2, dalam: 18 }), 'belumSederhana');
  assert.equal(E.diagnosaSederhanaAkar(72, 2, { luar: 36, dalam: 2 }), 'lupaAkar');
  assert.equal(E.diagnosaSederhanaAkar(72, 2, { luar: 2, dalam: 6 }), 'tertukar');
  assert.equal(E.diagnosaSederhanaAkar(72, 2, { luar: 8, dalam: 9 }), 'lupaAkar');
  assert.equal(E.diagnosaSederhanaAkar(72, 2, { luar: 5, dalam: 3 }), 'tidakSetara');
  assert.equal(E.diagnosaSederhanaAkar(54, 3, { luar: 3, dalam: 2 }), 'benar');
  assert.equal(E.diagnosaSederhanaAkar(54, 3, { luar: 27, dalam: 2 }), 'lupaAkar');
  assert.equal(E.diagnosaSederhanaAkar(49, 2, { luar: 7, dalam: 1 }), 'benar');
  ['belumSederhana', 'lupaAkar', 'tertukar', 'tidakSetara'].forEach((k) => {
    const pesan = E.pesanDiagnosaSederhanaAkar(k, 72, 2);
    assert.ok(pesan.length > 10, k);
    assert.ok(!pesan.includes('6√2'), k + ' tidak membocorkan jawaban');
  });
});

test('ubin faktor kembar: kelompokkan n faktor sama keluar dari akar', () => {
  const st = E.makeTwinTileState(72, 2);
  assert.equal(st.urutan.length, 5);
  assert.deepEqual(plain(st.urutan.slice().sort()), [0, 1, 2, 3, 4]);
  const f = E.faktorPrima(72); /* [2,2,2,3,3] */

  assert.equal(E.ketukUbin(st, 72, 2, 0), 'pilih');
  assert.equal(E.ketukUbin(st, 72, 2, 0), 'batal');
  assert.equal(E.ketukUbin(st, 72, 2, 0), 'pilih');
  assert.equal(E.ketukUbin(st, 72, 2, 3), 'beda');
  assert.deepEqual(plain(st.pilih), [0]);
  assert.equal(E.ketukUbin(st, 72, 2, 1), 'kelompok');
  assert.deepEqual(plain(st.kelompok), [[0, 1]]);
  assert.equal(E.twinTileSelesai(st, 72, 2), false);
  assert.equal(E.ketukUbin(st, 72, 2, 3), 'pilih');
  assert.equal(E.ketukUbin(st, 72, 2, 4), 'kelompok');
  assert.equal(E.twinTileSelesai(st, 72, 2), true);
  assert.deepEqual(plain(E.twinTileHasil(st, 72, 2)), { luar: 6, dalam: 2 });
  assert.equal(E.ketukUbin(st, 72, 2, 0), 'terkunci');
  assert.equal(f.length, 5);

  const html = E.buildTwinFactorTiles('tt', 72, 2, st);
  assert.match(html, /akar-tiles/);
  assert.match(html, /data-tile-id="tt"/);
});

test('ubin faktor kembar ∛: butuh tiga faktor sama', () => {
  const st = E.makeTwinTileState(54, 3); /* [2,3,3,3] */
  assert.equal(E.ketukUbin(st, 54, 3, 1), 'pilih');
  assert.equal(E.ketukUbin(st, 54, 3, 2), 'pilih');
  assert.equal(E.ketukUbin(st, 54, 3, 3), 'kelompok');
  assert.equal(E.twinTileSelesai(st, 54, 3), true);
  assert.deepEqual(plain(E.twinTileHasil(st, 54, 3)), { luar: 3, dalam: 2 });
});

test('ensureTwinTileState: state rusak diganti, state sah dipertahankan', () => {
  const st = E.makeTwinTileState(48, 2);
  assert.equal(E.ensureTwinTileState(st, 48, 2), st);
  const baru = E.ensureTwinTileState({ urutan: [0, 1] }, 48, 2);
  assert.equal(baru.urutan.length, 5);
  assert.equal(E.ensureTwinTileState(null, 48, 2).urutan.length, 5);
});

test('konverter akar–pangkat: batas stepper & kecocokan target', () => {
  const st = E.makeRootConverterState({ a: 8, m: 1, n: 3 });
  E.ubahRootConverter(st, 'n', 1);
  assert.equal(st.n, 4);
  E.ubahRootConverter(st, 'n', -10);
  assert.equal(st.n, 2);
  E.ubahRootConverter(st, 'm', -5);
  assert.equal(st.m, 1);
  st.a = 5;
  st.m = 2;
  st.n = 3;
  assert.equal(E.konverterCocok(st, { a: 5, m: 2, n: 3 }), true);
  assert.equal(E.konverterCocok(st, { a: 5, m: 3, n: 2 }), false);
  const html = E.buildRootConverter('kv', st);
  assert.match(html, /data-kv-id="kv"/);
  assert.match(html, /akar-kv/);
  assert.match(html, /akar-kv__m">2</);
  assert.match(html, /akar-kv__n">3</);
});

test('lab persegi & kubus: sisi/rusuk dan jejak nilai', () => {
  const st = E.makeRootShapeLabState();
  assert.equal(st.mode, 'persegi');
  E.ubahRootShapeLab(st, 'nilai', 49);
  assert.equal(st.nilai, 49);
  assert.deepEqual(plain(E.rootShapeLabInfo(st)), { indeks: 2, akar: 7, bulat: true });
  E.ubahRootShapeLab(st, 'mode', 'kubus');
  E.ubahRootShapeLab(st, 'nilai', 64);
  assert.deepEqual(plain(E.rootShapeLabInfo(st)), { indeks: 3, akar: 4, bulat: true });
  E.ubahRootShapeLab(st, 'nilai', 10);
  assert.equal(E.rootShapeLabInfo(st).bulat, false);
  assert.equal(E.rootShapeLabJejak(st, 'persegi'), 1);
  assert.equal(E.rootShapeLabJejak(st, 'kubus'), 2);
  const html = E.buildRootShapeLab('lab', st);
  assert.match(html, /<svg/);
  assert.match(html, /data-lab-id="lab"/);
});

test('langkah isian akar: periksa dengan diagnosa', () => {
  const step = { r: 72, n: 2 };
  const st = E.makeAkarStep();
  assert.equal(E.periksaAkarStep(step, st, { luar: '', dalam: '2' }), 'kosong');
  assert.equal(E.periksaAkarStep(step, st, { luar: '2', dalam: '18' }), 'belumSederhana');
  assert.equal(st.done, false);
  assert.equal(st.attempts, 1);
  assert.equal(E.periksaAkarStep(step, st, { luar: '6', dalam: '2' }), 'benar');
  assert.equal(st.done, true);
  const html = E.buildAkarStep('as', step, st, { label: 'Sederhanakan √72' });
  assert.match(html, /akar-step--done/);
  const st2 = E.makeAkarStep();
  assert.match(E.buildAkarStep('as2', step, st2, { label: 'x' }), /id="as2Luar"/);
});
