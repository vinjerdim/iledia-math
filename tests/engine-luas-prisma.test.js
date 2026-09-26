'use strict';

/*
 * Tes fungsi murni luas permukaan prisma (shared/engine.js seksi 47):
 * ukuran alas poligon, rincian luas tiap sisi, rumus luas selimut &
 * luas permukaan (dengan/tanpa tutup), tinggi dari luas permukaan,
 * diagnosa miskonsepsi & opsi berpengecoh, pengecoh luas satu sisi,
 * jaring-jaring prisma beralas poligon sembarang (lipat menutup rapat),
 * serta pemeriksaan kartu isian berdiagnosa.
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

const SIKU = [
  [0, 0],
  [8, 0],
  [0, 6],
];
const PERSEGI_PANJANG = [
  [0, 0],
  [8, 0],
  [8, 5],
  [0, 5],
];
const TRAPESIUM = [
  [0, 0],
  [10, 0],
  [7, 4],
  [3, 4],
];
const SAMA_KAKI = [
  [0, 0],
  [10, 0],
  [5, 12],
];

test('ukuranAlasPrisma: sisi, keliling, luas & persegi panjang', () => {
  const s = E.ukuranAlasPrisma(SIKU);
  assert.equal(s.n, 3);
  assert.deepEqual(plain(s.sisi), [8, 10, 6]);
  assert.equal(s.keliling, 24);
  assert.equal(s.luas, 24);
  assert.equal(s.persegiPanjang, false);

  const b = E.ukuranAlasPrisma(PERSEGI_PANJANG);
  assert.equal(b.keliling, 26);
  assert.equal(b.luas, 40);
  assert.equal(b.persegiPanjang, true);

  const t = E.ukuranAlasPrisma(TRAPESIUM);
  assert.deepEqual(plain(t.sisi), [10, 5, 4, 5]);
  assert.equal(t.keliling, 24);
  assert.equal(t.luas, 28);
  assert.equal(t.persegiPanjang, false);

  const k = E.ukuranAlasPrisma(SAMA_KAKI);
  assert.equal(k.keliling, 36);
  assert.equal(k.luas, 60);
});

test('ukuranAlasPrisma: arah keliling tidak memengaruhi luas', () => {
  const balik = SIKU.slice().reverse();
  assert.equal(E.ukuranAlasPrisma(balik).luas, 24);
});

test('rincianSisiPrisma: 2 sisi alas/tutup + n sisi tegak berjumlah LP', () => {
  const r = E.rincianSisiPrisma(SIKU, 12);
  assert.equal(r.length, 5);
  assert.deepEqual(plain(r.map((f) => f.id)), ['alas', 'atas', 't0', 't1', 't2']);
  assert.equal(r[0].luas, 24);
  assert.equal(r[1].luas, 24);
  assert.deepEqual(plain(r.slice(2).map((f) => [f.panjang, f.lebar, f.luas])), [
    [8, 12, 96],
    [10, 12, 120],
    [6, 12, 72],
  ]);
  const total = r.reduce((s, f) => s + f.luas, 0);
  assert.equal(total, 336);
  r.slice(2).forEach((f) => assert.equal(f.jenis, 'tegak'));
});

test('luasSelimutPrisma = K × t; luasPermukaanPrisma = 2 × La + K × t', () => {
  assert.equal(E.luasSelimutPrisma(24, 12), 288);
  assert.equal(E.luasPermukaanPrisma({ luasAlas: 24, kelilingAlas: 24, tinggi: 12 }), 336);
  assert.equal(E.luasPermukaanPrisma({ luasAlas: 40, kelilingAlas: 26, tinggi: 4 }), 184);
  assert.equal(E.luasPermukaanPrisma({ luasAlas: 28, kelilingAlas: 24, tinggi: 10 }), 296);
  assert.equal(E.luasPermukaanPrisma({ luasAlas: 60, kelilingAlas: 36, tinggi: 15 }), 660);
  /* Tanpa tutup (akuarium, kotak terbuka): hanya satu alas. */
  assert.equal(
    E.luasPermukaanPrisma({ luasAlas: 40, kelilingAlas: 26, tinggi: 4, tanpaTutup: true }),
    144
  );
});

test('rumus sama dengan menjumlahkan luas semua sisi untuk berbagai alas', () => {
  [
    [SIKU, 12],
    [PERSEGI_PANJANG, 4],
    [TRAPESIUM, 10],
    [SAMA_KAKI, 15],
  ].forEach(([pts, t]) => {
    const u = E.ukuranAlasPrisma(pts);
    const jumlah = E.rincianSisiPrisma(pts, t).reduce((s, f) => s + f.luas, 0);
    const rumus = E.luasPermukaanPrisma({ luasAlas: u.luas, kelilingAlas: u.keliling, tinggi: t });
    assert.ok(dekat(jumlah, rumus));
  });
});

test('tinggiDariLuasPermukaan membalik rumus luas permukaan', () => {
  assert.equal(E.tinggiDariLuasPermukaan(336, 24, 24), 12);
  assert.equal(E.tinggiDariLuasPermukaan(660, 60, 36), 15);
});

test('kandidatLuasPermukaan: nilai benar & pengecoh miskonsepsi', () => {
  const k = plain(E.kandidatLuasPermukaan({ luasAlas: 24, kelilingAlas: 24, tinggi: 12 }));
  assert.equal(k.benar, 336);
  assert.equal(k['satu-alas'], 312);
  assert.equal(k['tanpa-alas'], 288);
  assert.equal(k.volume, 288);
  assert.equal(k['jumlah-ukuran'], 84);
});

test('diagnosaLuasPermukaan mengenali miskonsepsi umum', () => {
  const o = { luasAlas: 40, kelilingAlas: 26, tinggi: 4 };
  assert.equal(E.diagnosaLuasPermukaan(o, 184).kode, 'benar');
  assert.equal(E.diagnosaLuasPermukaan(o, 144).kode, 'satu-alas');
  assert.equal(E.diagnosaLuasPermukaan(o, 104).kode, 'tanpa-alas');
  assert.equal(E.diagnosaLuasPermukaan(o, 160).kode, 'volume');
  assert.equal(E.diagnosaLuasPermukaan(o, 110).kode, 'jumlah-ukuran');
  assert.equal(E.diagnosaLuasPermukaan(o, 999).kode, 'salah-hitung');
  Object.values(plain(E.LPP_PESAN)).forEach((p) => assert.ok(p.length > 10));
  /* Tanpa tutup: 2 alas justru keliru. */
  const buka = { luasAlas: 40, kelilingAlas: 26, tinggi: 4, tanpaTutup: true };
  assert.equal(E.diagnosaLuasPermukaan(buka, 144).kode, 'benar');
  assert.equal(E.diagnosaLuasPermukaan(buka, 184).kode, 'dua-alas');
});

test('opsiLuasPermukaan: benar pertama, nilai unik, minimal 4 opsi', () => {
  [
    { luasAlas: 24, kelilingAlas: 24, tinggi: 12 },
    { luasAlas: 40, kelilingAlas: 26, tinggi: 4 },
    { luasAlas: 60, kelilingAlas: 36, tinggi: 15 },
    { luasAlas: 40, kelilingAlas: 26, tinggi: 4, tanpaTutup: true },
  ].forEach((o) => {
    const op = plain(E.opsiLuasPermukaan(o, 'cm²'));
    assert.ok(op.length >= 4);
    assert.equal(op[0].id, 'benar');
    assert.equal(op[0].nilai, E.luasPermukaanPrisma(o));
    assert.equal(new Set(op.map((x) => x.nilai)).size, op.length);
    assert.equal(new Set(op.map((x) => x.id)).size, op.length);
    op.forEach((x) => assert.match(x.label, /cm²$/));
  });
});

test('pengecohLuasSisi: keliling persegi panjang & lupa ½ pada segitiga', () => {
  const r = E.rincianSisiPrisma(SIKU, 12);
  const tegak = plain(E.pengecohLuasSisi(r[2]));
  assert.ok(tegak.some((p) => p.nilai === 40 && /keliling/i.test(p.pesan)));
  const alas = plain(E.pengecohLuasSisi(r[0], { alasPersegiPanjang: false }));
  assert.ok(alas.some((p) => p.nilai === 48 && /½/.test(p.pesan)));
  const kotak = E.rincianSisiPrisma(PERSEGI_PANJANG, 4);
  const alasKotak = plain(E.pengecohLuasSisi(kotak[0], { alasPersegiPanjang: true }));
  assert.ok(!alasKotak.some((p) => p.nilai === 80));
  /* Pengecoh tidak pernah sama dengan jawaban benar. */
  r.forEach((f) =>
    E.pengecohLuasSisi(f, { alasPersegiPanjang: false }).forEach((p) =>
      assert.notEqual(p.nilai, f.luas)
    )
  );
});

function titikTutupCocok(pts3, sabuk) {
  return pts3.every((q) =>
    sabuk.some((s) => Math.hypot(q[0] - s[0], q[1] - s[1], q[2] - s[2]) < 1e-6)
  );
}

test('jaringPrismaUmum: sabuk selebar keliling, dua tutup kongruen alas', () => {
  [
    [SIKU, 12],
    [PERSEGI_PANJANG, 4],
    [TRAPESIUM, 10],
    [SAMA_KAKI, 15],
  ].forEach(([pts, t]) => {
    const j = E.jaringPrismaUmum(pts, t);
    const u = E.ukuranAlasPrisma(pts);
    assert.equal(j.spec.n, pts.length);
    assert.equal(j.spec.h, t);
    const tegak = j.pieces.filter((p) => p.jenis === 'tegak');
    assert.equal(tegak.length, pts.length);
    const lebar = tegak.reduce((s, p) => s + (p.pts2[1][0] - p.pts2[0][0]), 0);
    assert.ok(dekat(lebar, u.keliling));
    ['alas', 'atas'].forEach((jenis) => {
      const tutup = j.pieces.filter((p) => p.jenis === jenis);
      assert.equal(tutup.length, 1);
      assert.ok(dekat(Math.abs(E.luasBertanda(tutup[0].pts2)), u.luas));
    });
    /* Tutup atas di atas sabuk (y < 0), alas di bawah (y > t). */
    const atas = j.pieces.find((p) => p.jenis === 'atas');
    const alas = j.pieces.find((p) => p.jenis === 'alas');
    assert.ok(atas.pts2.every((q) => q[1] <= 1e-9));
    assert.ok(alas.pts2.every((q) => q[1] >= t - 1e-9));
  });
});

test('jaringPrismaUmum: dilipat penuh menutup rapat menjadi prisma', () => {
  [
    [SIKU, 12],
    [PERSEGI_PANJANG, 4],
    [TRAPESIUM, 10],
    [SAMA_KAKI, 15],
  ].forEach(([pts, t]) => {
    const j = E.jaringPrismaUmum(pts, t, { tutupPada: 1 });
    const lipat = E.lipatJaring(j, 1);
    const sabuk = [];
    lipat.filter((p) => p.jenis === 'tegak').forEach((p) => p.pts3.forEach((q) => sabuk.push(q)));
    /* Tepi kanan persegi panjang terakhir bertemu tepi kiri yang pertama. */
    const pertama = lipat.find((p) => p.id === 't0').pts3;
    const terakhir = lipat.find((p) => p.id === 't' + (pts.length - 1)).pts3;
    assert.ok(Math.hypot(...[0, 1, 2].map((d) => pertama[0][d] - terakhir[1][d])) < 1e-6);
    lipat
      .filter((p) => p.jenis !== 'tegak')
      .forEach((p) => assert.ok(titikTutupCocok(p.pts3, sabuk), 'tutup ' + p.id + ' menutup'));
  });
});

test('periksaLpKartu: benar, pengecoh berdiagnosa, dan salah umum', () => {
  const kartu = {
    id: 'k1',
    fields: [
      { id: 'a', jawab: 24, pengecoh: [{ nilai: 48, pesan: 'Lupa ½.' }] },
      { id: 'b', jawab: 96 },
      { id: 'c', jawab: 12, diberikan: true },
    ],
  };
  const st = E.ensureLpIsianState({}, 'x', [kartu]).k1;
  const r = E.periksaLpKartu(kartu, st, { a: '48', b: '96' });
  assert.equal(r.error, null);
  assert.equal(st.hasil.a.kode, 'pengecoh');
  assert.equal(st.hasil.a.pesan, 'Lupa ½.');
  assert.equal(st.hasil.b.kode, 'benar');
  assert.equal(E.lpKartuBenar(kartu, st), false);
  E.periksaLpKartu(kartu, st, { a: '24', b: '96' });
  assert.equal(E.lpKartuBenar(kartu, st), true);
  /* Isian kosong/tidak valid ditolak tanpa mengubah hasil. */
  const st2 = E.ensureLpIsianState({}, 'y', [kartu]).k1;
  assert.equal(E.periksaLpKartu(kartu, st2, { a: '', b: '96' }).error, 'empty');
  assert.equal(E.periksaLpKartu(kartu, st2, { a: 'abc', b: '96' }).error, 'invalid');
  /* Desimal berkoma diterima. */
  const k2 = { id: 'k2', fields: [{ id: 'a', jawab: 7.5 }] };
  const st3 = E.ensureLpIsianState({}, 'z', [k2]).k2;
  E.periksaLpKartu(k2, st3, { a: '7,5' });
  assert.equal(st3.hasil.a.kode, 'benar');
});

test('ensureLpLabState: prisma valid, t dalam 0..1, catatan sisi & lipat', () => {
  const opts = { prisma: [{ id: 'p1' }, { id: 'p2' }] };
  const s = {};
  const st = E.ensureLpLabState(s, 'lab', opts);
  assert.equal(st.p, 'p1');
  assert.equal(st.t, 0);
  assert.deepEqual(plain(st.dilihat), { p1: [], p2: [] });
  assert.deepEqual(plain(st.dilipat), {});
  s.lab.p = 'zzz';
  s.lab.t = 5;
  E.ensureLpLabState(s, 'lab', opts);
  assert.equal(s.lab.p, 'p1');
  assert.equal(s.lab.t, 0);
});

test('buildLpNetSVG: kepingan dapat diketuk & berlabel ukuran', () => {
  const j = E.jaringPrismaUmum(SIKU, 12);
  const svg = E.buildLpNetSVG(j, { pilih: true, sorot: 't1', aria: 'Jaring' });
  assert.equal((svg.match(/data-lpp-sisi=/g) || []).length, 5);
  assert.match(svg, /is-sorot/);
  assert.match(svg, /10 cm/);
  assert.match(svg, /12 cm/);
  assert.match(svg, /role="img"|aria-label="Jaring"/);
});

test('buildLpSabuk: rapat menampilkan keliling alas sebagai panjang sabuk', () => {
  const p = { id: 'p1', nama: 'Kotak', alas: SIKU, t: 12 };
  const html = E.buildLpSabuk('sb', p, { rapat: true });
  assert.match(html, /8 \+ 10 \+ 6 = 24 cm/);
  const lepas = E.buildLpSabuk('sb', p, { rapat: false });
  assert.doesNotMatch(lepas, /= 24 cm/);
});
