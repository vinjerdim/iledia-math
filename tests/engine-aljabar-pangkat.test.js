'use strict';

/*
 * Tes shared/engine.js:
 *   - seksi 27 (lanjutan): sifat pangkat nol & pangkat negatif di lab uji
 *     sifat (nol, negatif) beserta dugaan keliru salahNol;
 *   - seksi 39: bentuk aljabar berpangkat (monomial) — operasi kali, bagi,
 *     pangkat; evaluasi pohon ekspresi; penulisan eksponen positif;
 *     diagnosa miskonsepsi; isian koefisien & eksponen.
 * Kunci selalu dibandingkan dengan evaluasi numerik Math.pow (bebas dari
 * rumus sifat yang sedang diuji).
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

function dekat(a, b) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

/* ---------------- Lab: pangkat nol & negatif ---------------- */

test('SIFAT_EKSPONEN: nol & negatif benar, salahNol keliru', () => {
  assert.equal(E.SIFAT_EKSPONEN.nol.keliru, false);
  assert.equal(E.SIFAT_EKSPONEN.negatif.keliru, false);
  assert.equal(E.SIFAT_EKSPONEN.salahNol.keliru, true);
  ['nol', 'negatif', 'salahNol', 'salahNegatif'].forEach((id) => {
    assert.equal(E.sifatPakaiM(id), false, id + ' hanya memakai n');
    assert.equal(E.SIFAT_EKSPONEN[id].pakaiB, false, id);
  });
});

test('cekSifatEksponen nol: aⁿ : aⁿ dibandingkan dengan a⁰', () => {
  const r = E.cekSifatEksponen('nol', 2, 0, 3);
  assert.equal(r.teksKiri, '2³ : 2³');
  assert.equal(r.teksKanan, '2⁰');
  assert.equal(r.catatan, '3 − 3 = 0');
  assert.deepEqual(plain(r.kiri), frac(1, 1));
  assert.equal(r.sama, true);
  assert.equal(E.cekSifatEksponen('nol', -3, 0, 2).teksKiri, '(−3)² : (−3)²');
});

test('cekSifatEksponen negatif: a¹ : aⁿ⁺¹ dibandingkan dengan a⁻ⁿ', () => {
  const r = E.cekSifatEksponen('negatif', 2, 0, 3);
  assert.equal(r.teksKiri, '2¹ : 2⁴');
  assert.equal(r.teksKanan, '2⁻³');
  assert.equal(r.catatan, '1 − 4 = −3');
  assert.deepEqual(plain(r.kiri), frac(1, 8));
  assert.equal(r.sama, true);
});

test('cekSifatEksponen: nol & negatif selalu sama untuk a ≠ 0', () => {
  ['nol', 'negatif'].forEach((id) => {
    for (let a = -5; a <= 5; a++) {
      if (a === 0) continue;
      for (let n = 1; n <= 5; n++) {
        const r = E.cekSifatEksponen(id, a, 0, n);
        assert.equal(r.terdefinisi, true, id + ' a=' + a + ' n=' + n);
        assert.equal(r.sama, true, id + ' a=' + a + ' n=' + n);
      }
    }
  });
});

test('cekSifatEksponen salahNol: a⁰ = 0 selalu tersangkal untuk a ≠ 0', () => {
  const r = E.cekSifatEksponen('salahNol', 5, 0, 2);
  assert.equal(r.teksKiri, '5² : 5²');
  assert.equal(r.teksKanan, '0');
  assert.deepEqual(plain(r.kanan), frac(0, 1));
  assert.equal(r.sama, false);
  for (let a = -5; a <= 5; a++) {
    if (a === 0) continue;
    assert.equal(E.cekSifatEksponen('salahNol', a, 0, 1).sama, false, 'a=' + a);
  }
});

test('cekSifatEksponen: a = 0 pada nol/negatif/salahNol tak terdefinisi', () => {
  ['nol', 'negatif', 'salahNol'].forEach((id) => {
    const r = E.cekSifatEksponen(id, 0, 0, 2);
    assert.equal(r.terdefinisi, false, id);
    assert.equal(r.alasan, 'nol', id);
  });
});

test('lab: sifat nol/negatif dicatat tanpa stepper m', () => {
  const st = E.makeExponentLabState('nol');
  st.a = 3;
  st.n = 2;
  assert.equal(E.labCatat(st), 'ok');
  st.m = 5;
  assert.equal(E.labCatat(st), 'duplikat', 'm tidak memengaruhi uji');
  st.a = 0;
  assert.equal(E.labCatat(st), 'tidakTerdefinisi');
  const opts = {
    sifat: ['nol', 'negatif', 'salahNol'],
    batasA: [-5, 5],
    batasE: [1, 5],
  };
  st.a = 2;
  const html = E.buildExponentLab('lz', st, opts);
  assert.doesNotMatch(html, /id="lz-m"/);
  assert.match(html, /a⁰ = 1/);
  st.a = 0;
  assert.match(E.buildExponentLab('lz', st, opts), /Tak terdefinisi/);
});

/* ---------------- Monomial ---------------- */

test('monomial: koefisien pecahan eksak, eksponen 0 dibuang', () => {
  const m = E.monomial(6, { x: -2, y: 3, z: 0 });
  assert.deepEqual(plain(m.koef), frac(6, 1));
  assert.deepEqual(Object.assign({}, m.pangkat), { x: -2, y: 3 });
  assert.deepEqual(plain(E.monomial(frac(2, 4), {}).koef), frac(1, 2));
});

test('kali/bagi/pangkat monomial', () => {
  const p = E.monomial(6, { x: -2, y: 3 });
  const q = E.monomial(2, { x: 3, y: -1 });
  const kali = E.kaliMonomial(p, q);
  assert.ok(E.samaMonomial(kali, E.monomial(12, { x: 1, y: 2 })));
  const bagi = E.bagiMonomial(p, q);
  assert.ok(E.samaMonomial(bagi, E.monomial(3, { x: -5, y: 4 })));
  const pgk = E.pangkatMonomial(E.monomial(2, { a: -1, b: 1 }), -2);
  assert.ok(E.samaMonomial(pgk, E.monomial(frac(1, 4), { a: 2, b: -2 })));
  assert.ok(E.samaMonomial(E.pangkatMonomial(p, 0), E.monomial(1, {})));
  assert.equal(E.bagiMonomial(p, E.monomial(0, {})), null);
  assert.equal(E.pangkatMonomial(E.monomial(0, { x: 1 }), -1), null);
  assert.equal(E.samaMonomial(p, q), false);
  assert.equal(E.samaMonomial(p, null), false);
});

test('nilaiMonomial: sesuai evaluasi Math.pow', () => {
  const m = E.monomial(3, { x: -5, y: 4 });
  const v = E.nilaiMonomial(m, { x: 2, y: 3 });
  assert.ok(dekat(E.nilaiPecahan(v), (3 * Math.pow(3, 4)) / Math.pow(2, 5)));
  assert.equal(E.nilaiMonomial(m, { x: 0, y: 1 }), null);
});

/* Evaluasi pohon ekspresi dengan Math.pow langsung (tanpa engine). */
function evalExpr(e, vals) {
  if (e.op === 'kali') return evalExpr(e.a, vals) * evalExpr(e.b, vals);
  if (e.op === 'bagi') return evalExpr(e.a, vals) / evalExpr(e.b, vals);
  if (e.op === 'pangkat') return Math.pow(evalExpr(e.a, vals), e.k);
  const k = typeof e.koef === 'object' ? e.koef.num / e.koef.den : e.koef;
  return Object.keys(e.pangkat || {}).reduce((acc, v) => acc * Math.pow(vals[v], e.pangkat[v]), k);
}

const EKSPRESI = [
  {
    op: 'bagi',
    a: { koef: 6, pangkat: { x: -2, y: 3 } },
    b: { koef: 2, pangkat: { x: 3, y: -1 } },
  },
  { op: 'pangkat', a: { koef: 2, pangkat: { a: -1, b: 1 } }, k: -2 },
  {
    op: 'kali',
    a: { koef: 3, pangkat: { x: 0 } },
    b: { op: 'pangkat', a: { koef: 1, pangkat: { y: 2 } }, k: -1 },
  },
  {
    op: 'bagi',
    a: { op: 'pangkat', a: { koef: 1, pangkat: { p: -2, q: 1 } }, k: 3 },
    b: { koef: -1, pangkat: { p: -4 } },
  },
];

test('hitungEkspresiMonomial: cocok dengan evaluasi numerik', () => {
  const titik = [
    { x: 2, y: 3, a: 5, b: 2, p: 3, q: -2 },
    { x: -3, y: 2, a: -2, b: 7, p: 2, q: 5 },
  ];
  EKSPRESI.forEach((e, i) => {
    const m = E.hitungEkspresiMonomial(e);
    titik.forEach((vals) => {
      assert.ok(
        dekat(E.nilaiPecahan(E.nilaiMonomial(m, vals)), evalExpr(e, vals)),
        'ekspresi ' + i
      );
    });
  });
});

test('formatMonomial: bentuk mentah', () => {
  assert.equal(E.formatMonomial(E.monomial(6, { x: -2, y: 3 })), '6x⁻²y³');
  assert.equal(E.formatMonomial(E.monomial(1, { b: 1, a: 2 })), 'a²b');
  assert.equal(E.formatMonomial(E.monomial(-1, { x: 1 })), '−x');
  assert.equal(E.formatMonomial(E.monomial(1, {})), '1');
  assert.equal(E.formatMonomial(E.monomial(-4, {})), '−4');
  assert.equal(E.formatMonomial(E.monomial(frac(1, 4), { a: 2 })), '(1/4)a²');
});

test('bentukPositifMonomial & formatMonomial positif', () => {
  const m = E.monomial(3, { x: -5, y: 4 });
  const b = E.bentukPositifMonomial(m);
  assert.deepEqual({ atas: b.atas, bawah: b.bawah }, { atas: '3y⁴', bawah: 'x⁵' });
  assert.equal(E.formatMonomial(m, { positif: true }), '3y⁴/x⁵');
  assert.equal(
    E.formatMonomial(E.monomial(frac(1, 4), { a: 2, b: -2 }), { positif: true }),
    'a²/(4b²)'
  );
  assert.equal(E.formatMonomial(E.monomial(-1, { p: -2 }), { positif: true }), '−1/p²');
  assert.equal(E.formatMonomial(E.monomial(frac(3, 2), { y: -2 }), { positif: true }), '3/(2y²)');
  assert.equal(E.formatMonomial(E.monomial(5, { y: 2 }), { positif: true }), '5y²');
  assert.equal(E.formatMonomial(E.monomial(frac(-1, 8), {}), { positif: true }), '−1/8');
});

test('formatEkspresiMonomial & buildEkspresiMonomial', () => {
  assert.equal(E.formatEkspresiMonomial(EKSPRESI[0]), '(6x⁻²y³) : (2x³y⁻¹)');
  assert.equal(E.formatEkspresiMonomial(EKSPRESI[1]), '(2a⁻¹b)⁻²');
  assert.equal(E.formatEkspresiMonomial(EKSPRESI[2]), '3x⁰ × (y²)⁻¹');
  assert.equal(E.formatEkspresiMonomial(EKSPRESI[3]), '(p⁻²q)³ : (−p⁻⁴)');
  const html = E.buildEkspresiMonomial(EKSPRESI[0]);
  assert.match(html, /mono-frac/);
  assert.match(html, /6x⁻²y³/);
  assert.match(html, /aria-label="\(6x⁻²y³\) : \(2x³y⁻¹\)"/);
  assert.doesNotMatch(E.buildEkspresiMonomial(EKSPRESI[1]), /mono-frac__bar/);
  const pos = E.buildMonomialPositif(E.monomial(3, { x: -5, y: 4 }));
  assert.match(pos, /mono-frac__bar/);
  assert.match(pos, /3y⁴/);
  assert.doesNotMatch(E.buildMonomialPositif(E.monomial(5, { y: 2 })), /mono-frac__bar/);
});

test('diagnosaMonomial: mengenali miskonsepsi', () => {
  const kunci = E.monomial(frac(1, 4), { a: 2, b: -2 });
  const d = (k, p) => E.diagnosaMonomial(kunci, E.monomial(k, p));
  assert.equal(d(frac(1, 4), { a: 2, b: -2 }), 'benar');
  assert.equal(d(-4, { a: 2, b: -2 }), 'negatifJadiMinus');
  assert.equal(d(4, { a: 2, b: -2 }), 'koefisienTerbalik');
  assert.equal(d(frac(-1, 4), { a: 2, b: -2 }), 'tandaKoefisien');
  assert.equal(d(2, { a: 2, b: -2 }), 'koefisien');
  assert.equal(d(frac(1, 4), { a: 2, b: 2 }), 'tandaEksponen');
  assert.equal(d(frac(1, 4), { a: 1, b: -2 }), 'eksponen');
  assert.equal(d(3, { a: 1 }), 'lain');
  assert.equal(E.diagnosaMonomial(kunci, null), 'lain');
  [
    'negatifJadiMinus',
    'koefisienTerbalik',
    'tandaKoefisien',
    'koefisien',
    'tandaEksponen',
    'eksponen',
    'lain',
  ].forEach((k) => assert.ok(E.pesanDiagnosaMonomial(k).length > 20, k));
});

test('bacaMonomialInput: koefisien pecahan & eksponen bulat bertanda', () => {
  const vars = ['x', 'y'];
  const r = E.bacaMonomialInput(vars, { koef: '3', x: '−5', y: '4' });
  assert.equal(r.error, null);
  assert.ok(E.samaMonomial(r.value, E.monomial(3, { x: -5, y: 4 })));
  const f = E.bacaMonomialInput(['a', 'b'], { koef: '1/4', a: '2', b: '-2' });
  assert.ok(E.samaMonomial(f.value, E.monomial(frac(1, 4), { a: 2, b: -2 })));
  assert.ok(
    E.samaMonomial(
      E.bacaMonomialInput(vars, { koef: '0,5', x: '0', y: '+1' }).value,
      E.monomial(frac(1, 2), { y: 1 })
    )
  );
  assert.equal(E.bacaMonomialInput(vars, { koef: '3', x: '', y: '1' }).error, 'empty');
  assert.equal(E.bacaMonomialInput(vars, { koef: '3', x: '1,5', y: '1' }).error, 'invalid');
  assert.equal(E.bacaMonomialInput(vars, { koef: 'abc', x: '1', y: '1' }).error, 'invalid');
  assert.equal(E.bacaMonomialInput(vars, { koef: '0', x: '1', y: '1' }).error, 'invalid');
});

test('buildMonomialInput: isian koefisien & eksponen tiap variabel', () => {
  const html = E.buildMonomialInput('mi', ['x', 'y'], { koef: '3', x: '-5' }, {});
  assert.equal((html.match(/<input/g) || []).length, 3);
  assert.match(html, /data-mono="mi"/);
  assert.match(html, /data-key="koef"/);
  assert.match(html, /data-key="y"/);
  assert.match(html, /value="-5"/);
  assert.match(html, /aria-label="Eksponen x"/);
  assert.match(E.buildMonomialInput('mi', ['x'], {}, { locked: true }), /disabled/);
  assert.match(E.buildMonomialInput('mi', ['x'], {}, { error: true }), /has-error/);
});
