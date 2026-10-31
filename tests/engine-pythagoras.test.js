'use strict';

/*
 * Tes fungsi murni seksi 86 shared/engine.js (luas persegi pada sisi
 * segitiga, dugaan teorema Pythagoras): luas persegi pada ruas berpetak
 * & strategi bingkai, persegi luar pada sisi, ringkasan luas tiga
 * persegi, jenis segitiga dari luas, diagnosa miskonsepsi isian luas,
 * serta opsi & kunci soal uji terap.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

/* Segitiga siku-siku 3-4-5: siku-siku di B (titik asal). */
const SIKU = E.segitigaSikuKisi(3, 4);

test('segitigaSikuKisi: kaki mendatar a, kaki tegak b, siku-siku di B', () => {
  assert.deepEqual(plain(SIKU.titik), ['A', 'B', 'C']);
  assert.deepEqual(plain(SIKU.pts), [
    [0, 4],
    [0, 0],
    [3, 0],
  ]);
  assert.equal(E.titikSikuSegitiga(SIKU.pts), 1);
});

test('luasPersegiRuas: dx² + dy² untuk ruas mendatar, tegak, dan miring', () => {
  assert.equal(E.luasPersegiRuas([0, 0], [3, 0]), 9);
  assert.equal(E.luasPersegiRuas([0, 4], [0, 0]), 16);
  assert.equal(E.luasPersegiRuas([3, 0], [0, 4]), 25);
  assert.equal(E.luasPersegiRuas([0, 1], [2, 0]), 5);
});

test('bingkaiPersegiRuas: bingkai (dx+dy)² dikurangi empat segitiga ½·dx·dy', () => {
  const b = E.bingkaiPersegiRuas([3, 0], [0, 4]);
  assert.deepEqual(plain(b), {
    dx: 3,
    dy: 4,
    miring: true,
    sisiBingkai: 7,
    bingkai: 49,
    segitiga: 6,
    banyakSegitiga: 4,
    luas: 25,
  });
  const lurus = E.bingkaiPersegiRuas([0, 0], [3, 0]);
  assert.equal(lurus.miring, false);
  assert.equal(lurus.luas, 9);
  assert.equal(lurus.banyakSegitiga, 0);
});

test('persegiLuarRuas: persegi dibangun menjauhi titik ketiga', () => {
  /* Sisi BC (alas) — titik ketiga A di atas, persegi ke bawah. */
  assert.deepEqual(plain(E.persegiLuarRuas([0, 0], [3, 0], [0, 4])), [
    [0, 0],
    [3, 0],
    [3, -3],
    [0, -3],
  ]);
  /* Sisi miring CA — persegi menjauhi B. */
  const sq = E.persegiLuarRuas([3, 0], [0, 4], [0, 0]);
  assert.deepEqual(plain(sq), [
    [3, 0],
    [0, 4],
    [4, 7],
    [7, 3],
  ]);
});

test('luasPersegiSegitiga: luas tiap sisi, sisi terbesar, La & Lb', () => {
  const r = E.luasPersegiSegitiga(SIKU.pts);
  assert.deepEqual(plain(r.sisi), [16, 9, 25]);
  assert.equal(r.terbesar, 2);
  assert.equal(r.Lc, 25);
  assert.deepEqual(plain([r.La, r.Lb]), [16, 9]);
});

test('jenisSegitigaLuas: siku (=), lancip (>), tumpul (<)', () => {
  assert.deepEqual(plain(E.jenisSegitigaLuas(9, 16, 25)), { jenis: 'siku', tanda: '=' });
  assert.deepEqual(plain(E.jenisSegitigaLuas(13, 13, 16)), { jenis: 'lancip', tanda: '>' });
  assert.deepEqual(plain(E.jenisSegitigaLuas(4, 13, 29)), { jenis: 'tumpul', tanda: '<' });
  /* Urutan argumen bebas: terbesar dianggap Lc. */
  assert.equal(E.jenisSegitigaLuas(25, 9, 16).jenis, 'siku');
  assert.equal(
    E.jenisSegitiga([
      [0, 1],
      [2, 0],
      [3, 2],
    ]).jenis,
    'siku'
  );
  assert.equal(
    E.jenisSegitiga([
      [0, 0],
      [4, 0],
      [2, 3],
    ]).jenis,
    'lancip'
  );
  assert.equal(
    E.jenisSegitiga([
      [0, 0],
      [2, 0],
      [5, 2],
    ]).jenis,
    'tumpul'
  );
});

test('titikSikuSegitiga: -1 bila tak ada sudut siku-siku', () => {
  assert.equal(
    E.titikSikuSegitiga([
      [0, 1],
      [2, 0],
      [3, 2],
    ]),
    1
  );
  assert.equal(
    E.titikSikuSegitiga([
      [0, 0],
      [4, 0],
      [2, 3],
    ]),
    -1
  );
});

test('diagnosaLuasPersegi: ruas lurus — benar, panjang, kali dua, keliling', () => {
  const p = [0, 0];
  const q = [3, 0];
  assert.equal(E.diagnosaLuasPersegi('9', p, q), 'benar');
  assert.equal(E.diagnosaLuasPersegi('3', p, q), 'panjang');
  assert.equal(E.diagnosaLuasPersegi('6', p, q), 'kaliDua');
  assert.equal(E.diagnosaLuasPersegi('12', p, q), 'keliling');
  assert.equal(E.diagnosaLuasPersegi('10', p, q), 'salah');
  assert.equal(E.diagnosaLuasPersegi('', p, q), 'kosong');
  assert.equal(E.diagnosaLuasPersegi('9,5', p, q), 'bukanBilangan');
});

test('diagnosaLuasPersegi: ruas miring — bingkai utuh, kurang dua segitiga, hitung langkah', () => {
  const p = [3, 0];
  const q = [0, 4];
  assert.equal(E.diagnosaLuasPersegi('25', p, q), 'benar');
  assert.equal(E.diagnosaLuasPersegi('49', p, q), 'bingkai');
  assert.equal(E.diagnosaLuasPersegi('37', p, q), 'kurangDua');
  assert.equal(E.diagnosaLuasPersegi('7', p, q), 'jumlahLangkah');
  assert.equal(E.diagnosaLuasPersegi('5', p, q), 'panjang');
  assert.equal(E.diagnosaLuasPersegi('24', p, q), 'salah');
  /* Ruas miring tanpa panjang bulat: tak ada kode 'panjang'. */
  assert.equal(E.diagnosaLuasPersegi('9', [0, 1], [2, 0]), 'bingkai');
  assert.equal(E.diagnosaLuasPersegi('7', [0, 1], [2, 0]), 'kurangDua');
});

test('pesanLuasPersegi: setiap kode punya pesan', () => {
  [
    'benar',
    'panjang',
    'kaliDua',
    'keliling',
    'bingkai',
    'kurangDua',
    'jumlahLangkah',
    'salah',
    'kosong',
    'bukanBilangan',
  ].forEach((k) => {
    const m = E.pesanLuasPersegi(k);
    assert.ok(typeof m === 'string' && m.length > 10, k);
  });
});

function assertOpsi(opsi, name) {
  assert.ok(opsi.length >= 4 && opsi.length <= 6, name + ': 4–6 opsi');
  assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length, name + ': id unik');
  assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, name + ': label unik');
  opsi.forEach((o) => assert.ok(o.umpan && o.umpan.length > 5, name + ': umpan ' + o.id));
  assert.equal(opsi.filter((o) => o.id === 'benar').length, 1, name + ': satu kunci');
}

test('opsiSoalPythagoras & nilaiSoalPythagoras: luas persegi sisi miring', () => {
  const s = { minta: 'luasMiring', La: 36, Lb: 64, satuan: 'm²' };
  const opsi = E.opsiSoalPythagoras(s);
  assertOpsi(opsi, 'luasMiring');
  assert.equal(E.nilaiSoalPythagoras(s), 'benar');
  assert.equal(opsi.find((o) => o.id === 'benar').label, '100 m²');
  assert.ok(
    opsi.some((o) => o.label === '28 m²'),
    'pengecoh selisih'
  );
});

test('opsiSoalPythagoras: luas persegi kaki', () => {
  const opsi = E.opsiSoalPythagoras({ minta: 'luasKaki', Lc: 169, La: 25, satuan: 'cm²' });
  assertOpsi(opsi, 'luasKaki');
  assert.equal(opsi.find((o) => o.id === 'benar').label, '144 cm²');
  assert.ok(
    opsi.some((o) => o.label === '194 cm²'),
    'pengecoh dijumlah'
  );
  assert.ok(
    opsi.some((o) => o.label === '12 cm²'),
    'pengecoh panjang sisi'
  );
});

test('opsiSoalPythagoras: panjang sisi miring dari kaki', () => {
  const opsi = E.opsiSoalPythagoras({ minta: 'sisiMiring', a: 6, b: 8, satuan: 'cm' });
  assertOpsi(opsi, 'sisiMiring');
  assert.equal(opsi.find((o) => o.id === 'benar').label, '10 cm');
  assert.ok(
    opsi.some((o) => o.label === '14 cm'),
    'pengecoh a + b'
  );
  assert.ok(
    opsi.some((o) => o.label === '100 cm'),
    'pengecoh lupa akar'
  );
});

test('opsiSoalPythagoras: jenis segitiga dari luas tiga persegi', () => {
  ['siku', 'lancip', 'tumpul'].forEach((j) => {
    const L = { siku: [9, 16, 25], lancip: [13, 13, 16], tumpul: [4, 13, 29] }[j];
    const s = { minta: 'jenis', La: L[0], Lb: L[1], Lc: L[2] };
    const opsi = E.opsiSoalPythagoras(s);
    assertOpsi(opsi, 'jenis ' + j);
    assert.equal(opsi.find((o) => o.id === 'benar').jenis, j);
  });
});

test('opsiSoalPythagoras: hubungan luas persegi pada segitiga bernama', () => {
  const opsi = E.opsiSoalPythagoras({ minta: 'hubungan', titik: ['K', 'L', 'M'], siku: 'L' });
  assertOpsi(opsi, 'hubungan');
  assert.equal(opsi.find((o) => o.id === 'benar').label, 'KM² = KL² + LM²');
  assert.ok(
    opsi.some((o) => o.label === 'KM = KL + LM'),
    'pengecoh tanpa kuadrat'
  );
});

test('opsiSoalPythagoras: pengecoh tetap unik walau nilainya kebetulan sama', () => {
  /* La = Lb → selisih 0 (dibuang), opsi diisi cadangan. */
  const opsi = E.opsiSoalPythagoras({ minta: 'luasMiring', La: 9, Lb: 9, satuan: 'm²' });
  assertOpsi(opsi, 'luasMiring kembar');
  opsi.forEach((o) => assert.ok(!/^0 /.test(o.label), 'tidak ada opsi 0'));
});
