'use strict';

/*
 * Tes seksi 12 (tambahan Numbered Heads Together) dan seksi 40
 * shared/engine.js: rumus suku ke-n barisan aritmetika — bentuk
 * sederhana Uₙ = bn + (a − b), format rumus, a & b dari dua suku,
 * nomor suku dari nilainya, diagnosa isian rumus, opsi pengecoh
 * rumus/kode JavaScript, dan tabel pola suku.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

/* ---------- Numbered Heads Together ---------- */

test('assignNhtNumbers memberi nomor 1..n pada anggota terisi (urutan acak)', () => {
  const hasil = Array.from(E.assignNhtNumbers(['Ani', ' ', 'Budi', 'Citra', '']));
  assert.equal(hasil.length, 3);
  assert.deepEqual(
    hasil.map((h) => h.nomor),
    [1, 2, 3]
  );
  assert.deepEqual(hasil.map((h) => h.nama).sort(), ['Ani', 'Budi', 'Citra']);
  assert.deepEqual(Array.from(E.assignNhtNumbers([])), []);
});

test('panggilNomorNht: selalu dalam rentang dan tidak mengulang nomor terakhir', () => {
  for (let i = 0; i < 200; i++) {
    const n = E.panggilNomorNht(4, 2);
    assert.ok(n >= 1 && n <= 4);
    assert.notEqual(n, 2);
  }
  assert.equal(E.panggilNomorNht(1, 1), 1);
  assert.equal(E.panggilNomorNht(0, null), null);
  /* rnd deterministik: 0 → nomor pertama yang tersedia */
  assert.equal(
    E.panggilNomorNht(3, 1, () => 0),
    2
  );
  assert.equal(
    E.panggilNomorNht(3, null, () => 0.99),
    3
  );
});

test('panggilNomorNht mengenai semua nomor dalam banyak percobaan', () => {
  const kena = new Set();
  for (let i = 0; i < 300; i++) kena.add(E.panggilNomorNht(4, null));
  assert.deepEqual([...kena].sort(), [1, 2, 3, 4]);
});

test('nhtAnggotaBernomor & nhtCallSelesai', () => {
  const anggota = [
    { nomor: 1, nama: 'Ani' },
    { nomor: 2, nama: 'Budi' },
  ];
  assert.equal(E.nhtAnggotaBernomor(anggota, 2).nama, 'Budi');
  assert.equal(E.nhtAnggotaBernomor(anggota, 5), null);
  assert.equal(E.nhtCallSelesai({ nomor: 1, dijelaskan: true }), true);
  assert.equal(E.nhtCallSelesai({ nomor: 1, dijelaskan: false }), false);
  assert.equal(E.nhtCallSelesai({ nomor: null, dijelaskan: true }), false);
  assert.equal(E.nhtCallSelesai(null), false);
});

/* ---------- Rumus suku ke-n ---------- */

test('rumusSuku: Uₙ = a + (n − 1)b = bn + (a − b)', () => {
  assert.deepEqual({ ...E.rumusSuku(8, 4) }, { koef: 4, konst: 4 });
  assert.deepEqual({ ...E.rumusSuku(60, -7) }, { koef: -7, konst: 67 });
  assert.deepEqual({ ...E.rumusSuku(-9, 4) }, { koef: 4, konst: -13 });
  assert.deepEqual({ ...E.rumusSuku(2.5, 0.75) }, { koef: 0.75, konst: 1.75 });
  assert.deepEqual({ ...E.rumusSuku(5, 5) }, { koef: 5, konst: 0 });
});

test('nilaiRumus cocok dengan sukuAritmetika', () => {
  [
    [8, 4],
    [60, -7],
    [2.5, 0.75],
    [48, -2.5],
  ].forEach(([a, b]) => {
    const r = E.rumusSuku(a, b);
    for (let n = 1; n <= 30; n++) {
      assert.ok(E.hampirSama(E.nilaiRumus(r.koef, r.konst, n), E.sukuAritmetika(a, b, n)));
    }
  });
  assert.equal(E.nilaiRumus(0.75, 1.75, 3), 4);
});

test('fmtBentukLinear: tanda, koefisien 1/−1, konstanta 0, desimal berkoma', () => {
  assert.equal(E.fmtBentukLinear(4, 4), '4n + 4');
  assert.equal(E.fmtBentukLinear(-7, 67), '−7n + 67');
  assert.equal(E.fmtBentukLinear(4, -13), '4n − 13');
  assert.equal(E.fmtBentukLinear(1, 7), 'n + 7');
  assert.equal(E.fmtBentukLinear(-1, 0), '−n');
  assert.equal(E.fmtBentukLinear(5, 0), '5n');
  assert.equal(E.fmtBentukLinear(0, 9), '9');
  assert.equal(E.fmtBentukLinear(0, 0), '0');
  assert.equal(E.fmtBentukLinear(0.75, 1.75), '0,75n + 1,75');
  assert.equal(E.fmtBentukLinear(-2.5, 50.5), '−2,5n + 50,5');
});

test('fmtRumusSuku & fmtRumusUmum', () => {
  assert.equal(E.fmtRumusSuku(8, 4), 'Uₙ = 4n + 4');
  assert.equal(E.fmtRumusSuku(60, -7), 'Uₙ = −7n + 67');
  assert.equal(E.fmtRumusUmum(8, 4), 'Uₙ = 8 + (n − 1) × 4');
  assert.equal(E.fmtRumusUmum(60, -7), 'Uₙ = 60 + (n − 1) × (−7)');
  assert.equal(E.fmtRumusUmum(-9, 0.5), 'Uₙ = −9 + (n − 1) × 0,5');
});

test('suku1DanBeda: a dan b dari dua suku tak berurutan', () => {
  assert.deepEqual({ ...E.suku1DanBeda(3, 14, 8, 39) }, { a: 4, b: 5 });
  assert.deepEqual({ ...E.suku1DanBeda(6, 31, 2, 47) }, { a: 51, b: -4 });
  assert.deepEqual({ ...E.suku1DanBeda(4, 5, 10, 8) }, { a: 3.5, b: 0.5 });
  assert.equal(E.suku1DanBeda(2, 5, 2, 5), null);
});

test('nomorSukuDari: n = (x − a)/b + 1, null bila bukan bilangan asli', () => {
  assert.equal(E.nomorSukuDari(3, 4, 83), 21);
  assert.equal(E.nomorSukuDari(100, -6, 46), 10);
  assert.equal(E.nomorSukuDari(3.5, 0.5, 13), 20);
  assert.equal(E.nomorSukuDari(3, 4, 84), null);
  assert.equal(E.nomorSukuDari(10, 5, 5), null);
  assert.equal(E.nomorSukuDari(7, 0, 7), null);
  assert.equal(E.nomorSukuDari(7, 3, 7), 1);
});

test('periksaRumusSuku mendiagnosis miskonsepsi rumus', () => {
  assert.equal(E.periksaRumusSuku(8, 4, 4, 4), 'benar');
  assert.equal(E.periksaRumusSuku(2.5, 0.75, 0.75, 1.75), 'benar');
  /* Uₙ = a + nb → koefisien benar, konstanta = a */
  assert.equal(E.periksaRumusSuku(8, 4, 4, 8), 'lupaKurangiB');
  /* a dan b tertukar: Uₙ = b + (n − 1)a = an + (b − a) */
  assert.equal(E.periksaRumusSuku(7, 5, 7, -2), 'tukarAB');
  /* Uₙ = a + (n + 1)b → konstanta a + b */
  assert.equal(E.periksaRumusSuku(8, 4, 4, 12), 'tambahB');
  assert.equal(E.periksaRumusSuku(60, -7, 7, 53), 'tandaBeda');
  assert.equal(E.periksaRumusSuku(8, 4, 3, 4), 'bedaSalah');
  assert.equal(E.periksaRumusSuku(8, 4, 4, 5), 'konstSalah');
});

test('pesanRumusSuku memberi umpan balik untuk setiap kode', () => {
  ['benar', 'lupaKurangiB', 'tukarAB', 'tambahB', 'tandaBeda', 'bedaSalah', 'konstSalah'].forEach(
    (k) => {
      const pesan = E.pesanRumusSuku(k, 8, 4);
      assert.ok(typeof pesan === 'string' && pesan.length > 10, k);
    }
  );
  assert.match(E.pesanRumusSuku('benar', 8, 4), /4n \+ 4/);
  assert.match(E.pesanRumusSuku('lupaKurangiB', 8, 4), /n − 1/);
});

test('kodeSukuJs: minus ASCII, titik desimal, koefisien 1', () => {
  assert.equal(E.kodeSukuJs(4, 4), 'return 4 * n + 4;');
  assert.equal(E.kodeSukuJs(-7, 67), 'return -7 * n + 67;');
  assert.equal(E.kodeSukuJs(4, -13), 'return 4 * n - 13;');
  assert.equal(E.kodeSukuJs(1, 7), 'return n + 7;');
  assert.equal(E.kodeSukuJs(0.75, 1.75), 'return 0.75 * n + 1.75;');
  assert.equal(E.kodeSukuJs(5, 0), 'return 5 * n;');
});

test('opsiRumusSuku & opsiKodeSuku: 4 opsi unik, tepat satu benar', () => {
  [
    [7, 5],
    [60, -7],
    [-9, 4],
    [2.5, 0.75],
    [8, 4],
  ].forEach(([a, b]) => {
    [E.opsiRumusSuku(a, b), E.opsiKodeSuku(a, b)].forEach((opsi) => {
      assert.equal(opsi.length, 4);
      assert.equal(new Set(opsi.map((o) => o.id)).size, 4);
      assert.equal(new Set(opsi.map((o) => o.label)).size, 4, a + ',' + b);
      assert.ok(opsi.some((o) => o.id === 'benar'));
    });
    assert.equal(E.opsiRumusSuku(a, b).find((o) => o.id === 'benar').label, E.fmtRumusSuku(a, b));
    const r = E.rumusSuku(a, b);
    assert.equal(
      E.opsiKodeSuku(a, b).find((o) => o.id === 'benar').label,
      E.kodeSukuJs(r.koef, r.konst)
    );
  });
});

test('opsiSukuPertama: U₁ benar + pengecoh U₂, beda, dan a − b', () => {
  const opsi = E.opsiSukuPertama([7, 12, 17, 22]);
  assert.equal(opsi.length, 4);
  assert.equal(opsi.find((o) => o.id === 'u1').label, '7');
  assert.deepEqual(Array.from(opsi.map((o) => o.label)).sort(), ['12', '2', '5', '7']);
  const des = E.opsiSukuPertama([2.5, 3.25, 4]);
  assert.equal(new Set(des.map((o) => o.label)).size, 4);
});

test('cocokNMinus1 menerima variasi penulisan (n − 1)', () => {
  ['n-1', 'n − 1', '(n-1)', ' ( n - 1 ) ', 'N-1', '-1+n'].forEach((s) =>
    assert.equal(E.cocokNMinus1(s), true, s)
  );
  ['n', 'n+1', '1-n', 'n-2', '', 'n--1'].forEach((s) => assert.equal(E.cocokNMinus1(s), false, s));
});

test('tabel pola suku: jawaban baris ke-k adalah k − 1, baris n adalah (n − 1)', () => {
  const st = E.makeTabelPolaState(4);
  assert.equal(st.inputs.length, 5);
  assert.equal(E.tabelPolaSelesai(st), false);
  st.inputs = ['0', '1', '3', '3', 'n - 1'];
  E.periksaTabelPola(st);
  assert.deepEqual(Array.from(st.status), [true, true, false, true, true]);
  assert.equal(E.tabelPolaSelesai(st), false);
  st.inputs[2] = '2';
  E.periksaTabelPola(st);
  assert.equal(E.tabelPolaSelesai(st), true);
  assert.equal(st.attempts, 2);
});

test('buildTabelPolaSuku & buildRumusSukuInput merender isian yang dapat diakses', () => {
  const st = E.makeTabelPolaState(3);
  const html = E.buildTabelPolaSuku('tp', 8, 4, st);
  assert.match(html, /<table/);
  assert.match(html, /aria-label="Banyak beda pada U₃"/);
  assert.match(html, /Uₙ/);
  const rs = E.makeRumusState();
  const inp = E.buildRumusSukuInput('rs', rs);
  assert.match(inp, /id="rsKoef"/);
  assert.match(inp, /id="rsKonst"/);
  assert.match(inp, /aria-label="Koefisien n"/);
  rs.done = true;
  rs.koef = '4';
  rs.konst = '4';
  assert.match(E.buildRumusSukuInput('rs', rs, { a: 8, b: 4 }), /4n \+ 4/);
});
