'use strict';

/*
 * Tes fungsi murni prisma (shared/engine.js seksi 31): nama & notasi
 * prisma, banyak unsur, model 3D (titik, rusuk, sisi beserta jenisnya),
 * proyeksi & visibilitas sisi, diagnosa isian tabel unsur, jaring-jaring
 * sabuk (bentuk 2D, pemeriksaan valid/tidak), dan simulasi melipat
 * jaring-jaring menjadi prisma.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function dekat(a, b, tol) {
  return Math.abs(a - b) <= (tol || 1e-6);
}

function jarak(p, q) {
  let s = 0;
  for (let i = 0; i < p.length; i++) s += (p[i] - q[i]) * (p[i] - q[i]);
  return Math.sqrt(s);
}

test('namaSegiN & namaPrisma memakai nama baku', () => {
  assert.equal(E.namaSegiN(3), 'segitiga');
  assert.equal(E.namaSegiN(4), 'segiempat');
  assert.equal(E.namaSegiN(6), 'segienam');
  assert.equal(E.namaSegiN(8), 'segidelapan');
  assert.equal(E.namaSegiN(12), 'segi-12');
  assert.equal(E.namaPrisma(5), 'prisma segilima');
});

test('labelTitikPrisma & notasiPrisma: alas huruf pertama, atas berikutnya', () => {
  assert.deepEqual(plain(E.labelTitikPrisma(3)), { alas: ['A', 'B', 'C'], atas: ['D', 'E', 'F'] });
  assert.equal(E.notasiPrisma(3), 'ABC.DEF');
  assert.equal(E.notasiPrisma(4), 'ABCD.EFGH');
  assert.equal(E.notasiPrisma(6), 'ABCDEF.GHIJKL');
});

test('unsurPrisma: 2n titik, 3n rusuk, n + 2 sisi', () => {
  [3, 4, 5, 6, 8, 10].forEach((n) => {
    const u = E.unsurPrisma(n);
    assert.equal(u.titik, 2 * n);
    assert.equal(u.rusuk, 3 * n);
    assert.equal(u.rusukAlas + u.rusukAtas + u.rusukTegak, u.rusuk);
    assert.equal(u.rusukTegak, n);
    assert.equal(u.sisi, n + 2);
    assert.equal(u.sisiTegak, n);
    assert.equal(u.sisiAlas + u.sisiAtas + u.sisiTegak, u.sisi);
  });
});

test('modelPrisma: banyak & jenis unsur cocok dengan unsurPrisma', () => {
  [3, 4, 5, 6, 8].forEach((n) => {
    const m = E.modelPrisma(n);
    const u = E.unsurPrisma(n);
    assert.equal(m.titik.length, u.titik);
    assert.equal(m.rusuk.length, u.rusuk);
    assert.equal(m.sisi.length, u.sisi);
    const jenisR = (j) => m.rusuk.filter((r) => r.jenis === j).length;
    assert.equal(jenisR('alas'), n);
    assert.equal(jenisR('atas'), n);
    assert.equal(jenisR('tegak'), n);
    assert.equal(m.sisi.filter((s) => s.jenis === 'tegak').length, n);
    assert.equal(new Set(m.rusuk.map((r) => r.id)).size, m.rusuk.length);
    assert.equal(new Set(m.sisi.map((s) => s.id)).size, m.sisi.length);
    /* Setiap rusuk dibatasi tepat dua sisi, setiap titik tiga sisi. */
    m.rusuk.forEach((r) => assert.equal(r.sisi.length, 2, r.id));
    m.titik.forEach((t) => assert.equal(t.sisi.length, 3, t.id));
  });
});

test('modelPrisma: nama unsur mengikuti notasi ABC.DEF', () => {
  const m = E.modelPrisma(3);
  assert.deepEqual(plain(m.titik.map((t) => t.nama)), ['A', 'B', 'C', 'D', 'E', 'F']);
  const nama = (list, id) => list.find((x) => x.id === id).nama;
  assert.equal(nama(m.sisi, 'alas'), 'ABC');
  assert.equal(nama(m.sisi, 'atas'), 'DEF');
  assert.equal(nama(m.sisi, 't0'), 'ABED');
  assert.equal(nama(m.rusuk, 'c0'), 'AD');
  assert.equal(nama(m.rusuk, 'a2'), 'CA');
  assert.equal(nama(m.rusuk, 'b0'), 'DE');
});

test('modelPrisma: rusuk tegak sama panjang = tinggi, alas & atas kongruen', () => {
  const m = E.modelPrisma(5, { r: 1, tinggi: 2 });
  const pos = (i) => m.titik[i].pos;
  m.rusuk
    .filter((r) => r.jenis === 'tegak')
    .forEach((r) => assert.ok(dekat(jarak(pos(r.a), pos(r.b)), 2)));
  const alas = m.rusuk.filter((r) => r.jenis === 'alas').map((r) => jarak(pos(r.a), pos(r.b)));
  const atas = m.rusuk.filter((r) => r.jenis === 'atas').map((r) => jarak(pos(r.a), pos(r.b)));
  alas.forEach((l, i) => assert.ok(dekat(l, atas[i])));
});

test('modelPrisma rebah: sumbu prisma mendatar (tenda/cokelat batang)', () => {
  const m = E.modelPrisma(3, { sumbu: 'rebah', tinggi: 3 });
  m.rusuk
    .filter((r) => r.jenis === 'tegak')
    .forEach((r) => {
      const a = m.titik[r.a].pos;
      const b = m.titik[r.b].pos;
      assert.ok(dekat(a[2], b[2]), 'rusuk tegak mendatar');
    });
});

test('proyeksiPrisma & sisiTerlihatPrisma: dari atas, sisi atas terlihat, alas tidak', () => {
  const m = E.modelPrisma(4);
  const vis = E.sisiTerlihatPrisma(m, { azimut: 0, elevasi: 60 });
  assert.equal(vis.atas, true);
  assert.equal(vis.alas, false);
  const visBawah = E.sisiTerlihatPrisma(m, { azimut: 0, elevasi: -60 });
  assert.equal(visBawah.alas, true);
  assert.equal(visBawah.atas, false);
  /* Sisi tegak: sebagian terlihat, sebagian tersembunyi. */
  const tegak = m.sisi.filter((s) => s.jenis === 'tegak').map((s) => vis[s.id]);
  assert.ok(tegak.some((v) => v));
  assert.ok(tegak.some((v) => !v));
  const p = E.proyeksiPrisma([0, 0, 1], { azimut: 0, elevasi: 0 });
  assert.ok(dekat(p.x, 0));
  assert.ok(dekat(p.y, -1), 'sumbu z ke atas layar');
});

test('rusukTerlihatPrisma: rusuk tersembunyi bila kedua sisinya tersembunyi', () => {
  const m = E.modelPrisma(4);
  const view = { azimut: 20, elevasi: 30 };
  const vs = E.sisiTerlihatPrisma(m, view);
  const vr = E.rusukTerlihatPrisma(m, view);
  m.rusuk.forEach((r) => {
    assert.equal(vr[r.id], vs[r.sisi[0]] || vs[r.sisi[1]], r.id);
  });
  assert.ok(
    Object.values(vr).some((v) => !v),
    'ada rusuk putus-putus'
  );
});

test('diagnosaUnsur: benar dan miskonsepsi umum', () => {
  assert.equal(E.diagnosaUnsur(3, 'titik', 6).kode, 'benar');
  assert.equal(E.diagnosaUnsur(3, 'titik', 3).kode, 'titik-satu-alas');
  assert.equal(E.diagnosaUnsur(4, 'rusuk', 12).kode, 'benar');
  assert.equal(E.diagnosaUnsur(4, 'rusuk', 8).kode, 'rusuk-lupa-tegak');
  assert.equal(E.diagnosaUnsur(4, 'rusuk', 4).kode, 'rusuk-satu-alas');
  assert.equal(E.diagnosaUnsur(5, 'sisi', 7).kode, 'benar');
  assert.equal(E.diagnosaUnsur(5, 'sisi', 5).kode, 'sisi-lupa-alas');
  assert.equal(E.diagnosaUnsur(5, 'sisi', 6).kode, 'sisi-lupa-satu');
  assert.equal(E.diagnosaUnsur(5, 'sisi', 11).kode, 'salah');
  ['titik-satu-alas', 'rusuk-lupa-tegak', 'sisi-lupa-alas'].forEach((k) =>
    assert.ok(E.PSM_PESAN_UNSUR[k], 'pesan ' + k)
  );
});

test('jaringPrisma: n persegi panjang + dua segi-n dengan panjang sisi sama', () => {
  const j = E.jaringPrisma({ n: 3, atas: [1], alas: [1], s: 2, h: 3 });
  const tegak = j.pieces.filter((p) => p.jenis === 'tegak');
  const tutup = j.pieces.filter((p) => p.jenis !== 'tegak');
  assert.equal(tegak.length, 3);
  assert.equal(tutup.length, 2);
  tegak.forEach((p) => assert.equal(p.pts2.length, 4));
  tutup.forEach((p) => {
    assert.equal(p.pts2.length, 3);
    for (let i = 0; i < 3; i++) {
      assert.ok(dekat(jarak(p.pts2[i], p.pts2[(i + 1) % 3]), 2));
    }
  });
  /* Segi-n atas di atas sabuk (y < 0), alas di bawah (y > h). */
  const atas = tutup.find((p) => p.jenis === 'atas');
  const alas = tutup.find((p) => p.jenis === 'alas');
  assert.ok(atas.pts2.every((q) => q[1] <= 1e-9));
  assert.ok(alas.pts2.every((q) => q[1] >= 3 - 1e-9));
  /* Tepat satu kepingan akar tanpa induk. */
  assert.equal(j.pieces.filter((p) => !p.parent).length, 1);
});

test('cekJaring: valid hanya bila sabuk n keping dan alas-atas berseberangan', () => {
  assert.equal(E.cekJaring({ n: 3, atas: [0], alas: [2] }).valid, true);
  assert.equal(E.cekJaring({ n: 6, atas: [2], alas: [2] }).valid, true);
  assert.equal(E.cekJaring({ n: 3, atas: [0, 2], alas: [] }).alasan, 'alas-sepihak');
  assert.equal(E.cekJaring({ n: 3, atas: [], alas: [0, 1] }).alasan, 'alas-sepihak');
  assert.equal(E.cekJaring({ n: 3, atas: [0], alas: [] }).alasan, 'alas-kurang');
  assert.equal(E.cekJaring({ n: 3, atas: [0, 1], alas: [2] }).alasan, 'alas-lebih');
  assert.equal(E.cekJaring({ n: 4, sabuk: 3, atas: [1], alas: [1] }).alasan, 'sabuk-kurang');
  assert.equal(E.cekJaring({ n: 5, sabuk: 6, atas: [2], alas: [2] }).alasan, 'sabuk-lebih');
  ['valid', 'alas-sepihak', 'alas-kurang', 'alas-lebih', 'sabuk-kurang', 'sabuk-lebih'].forEach(
    (k) => assert.ok(E.PSM_PESAN_JARING[k], 'pesan ' + k)
  );
});

test('lipatJaring t = 0: datar; t = 1: jaring valid tertutup menjadi prisma', () => {
  [3, 4, 6].forEach((n) => {
    const spec = { n: n, atas: [0], alas: [n - 1], s: 1, h: 2 };
    const j = E.jaringPrisma(spec);
    const datar = E.lipatJaring(j, 0);
    datar.forEach((p) => p.pts3.forEach((q) => assert.ok(dekat(q[2], 0))));

    const jadi = E.lipatJaring(j, 1);
    const titik = [];
    jadi.forEach((p) =>
      p.pts3.forEach((q) => {
        if (!titik.some((t) => jarak(t, q) < 1e-6)) titik.push(q);
      })
    );
    assert.equal(titik.length, 2 * n, 'prisma segi-' + n + ' punya 2n titik sudut');
    /* Tutup atas dan alas sejajar & terpisah sejauh tinggi prisma. */
    const cy = (p) => p.pts3.reduce((a, q) => a + q[1], 0) / p.pts3.length;
    const atas = jadi.find((p) => p.jenis === 'atas');
    const alas = jadi.find((p) => p.jenis === 'alas');
    assert.ok(atas.pts3.every((q) => dekat(q[1], 0)));
    assert.ok(alas.pts3.every((q) => dekat(q[1], 2)));
    assert.ok(dekat(cy(alas) - cy(atas), 2));
  });
});

test('lipatJaring: kedua segi-n sepihak menumpuk, sabuk kurang menyisakan celah', () => {
  const sepihak = E.lipatJaring(E.jaringPrisma({ n: 3, atas: [0, 2], alas: [] }), 1);
  const tutup = sepihak.filter((p) => p.jenis === 'atas');
  assert.equal(tutup.length, 2);
  const pusat = (p) => [0, 1, 2].map((k) => p.pts3.reduce((a, q) => a + q[k], 0) / p.pts3.length);
  assert.ok(jarak(pusat(tutup[0]), pusat(tutup[1])) < 1e-6, 'dua tutup berimpit');

  const kurang = E.lipatJaring(E.jaringPrisma({ n: 4, sabuk: 3, atas: [], alas: [] }), 1);
  const ujung = [];
  kurang.forEach((p) =>
    p.pts3.forEach((q) => {
      if (dekat(q[1], 0)) ujung.push(q);
    })
  );
  /* Tepi bebas kiri dan kanan sabuk tidak bertemu. */
  const tepi = ujung.filter((q) => ujung.filter((r) => jarak(q, r) < 1e-6).length === 1);
  assert.equal(tepi.length, 2);
  assert.ok(jarak(tepi[0], tepi[1]) > 0.5);
});
