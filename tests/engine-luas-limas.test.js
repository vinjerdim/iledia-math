'use strict';

/*
 * Tes shared/engine.js seksi 57 — luas permukaan limas (fase-d/mpi-22.7):
 * tinggi sisi tegak (Pythagoras), alas beraturan, rincian sisi, rumus
 * LP = La + ½ × K × tₛ (dan tanpa alas), kebalikan tₛ dari LP, diagnosa
 * miskonsepsi & opsi berpengecoh, pengecoh luas segitiga, serta
 * komponen UI (lab bentang limas & susun sisi tegak) yang dirender
 * sebagai string HTML.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function dekat(a, b, msg) {
  assert.ok(Math.abs(a - b) < 1e-6, (msg || '') + ' ' + a + ' ≈ ' + b);
}

/* ---------- Hitung ---------- */

test('tinggiSisiTegakLimas memakai Pythagoras', () => {
  assert.equal(E.tinggiSisiTegakLimas(12, 5), 13);
  assert.equal(E.tinggiSisiTegakLimas(15, 8), 17);
  assert.equal(E.tinggiSisiTegakLimas(4, 3), 5);
  assert.equal(E.tinggiLimasDariSisiTegak(13, 5), 12);
  assert.equal(E.tinggiLimasDariSisiTegak(17, 8), 15);
});

test('alasLimasBeraturan: persegi tepat & keliling n × s', () => {
  const pts = E.alasLimasBeraturan(4, 10);
  assert.equal(pts.length, 4);
  const u = E.ukuranAlasPrisma(pts);
  dekat(u.luas, 100);
  dekat(u.keliling, 40);
  const heks = E.ukuranAlasPrisma(E.alasLimasBeraturan(6, 4));
  dekat(heks.keliling, 24);
  heks.sisi.forEach((s) => dekat(s, 4));
  const tri = E.ukuranAlasPrisma(E.alasLimasBeraturan(3, 6));
  dekat(tri.keliling, 18);
});

test('luasSisiTegakLimas = ½ × K × tₛ', () => {
  assert.equal(E.luasSisiTegakLimas(40, 13), 260);
  assert.equal(E.luasSisiTegakLimas(18, 8), 72);
  assert.equal(E.luasSisiTegakLimas(24, 7), 84);
  assert.equal(E.luasSisiTegakLimas(64, 17), 544);
});

test('luasPermukaanLimas: dengan & tanpa alas', () => {
  assert.equal(E.luasPermukaanLimas({ luasAlas: 100, kelilingAlas: 40, tinggiSisi: 13 }), 360);
  assert.equal(E.luasPermukaanLimas({ luasAlas: 256, kelilingAlas: 64, tinggiSisi: 17 }), 800);
  assert.equal(
    E.luasPermukaanLimas({ luasAlas: 100, kelilingAlas: 40, tinggiSisi: 13, tanpaAlas: true }),
    260
  );
});

test('tinggiSisiDariLuasPermukaan membalik rumus', () => {
  assert.equal(E.tinggiSisiDariLuasPermukaan(360, 100, 40), 13);
  assert.equal(E.tinggiSisiDariLuasPermukaan(800, 256, 64), 17);
});

test('rincianSisiLimas: persegi (tₛ sama) dan persegi panjang (tₛ per rusuk)', () => {
  const r = E.rincianSisiLimas(E.alasLimasBeraturan(4, 10), 13);
  assert.equal(r.length, 5);
  assert.equal(r[0].id, 'alas');
  dekat(r[0].luas, 100);
  r.slice(1).forEach((f, i) => {
    assert.equal(f.id, 't' + i);
    assert.equal(f.jenis, 'tegak');
    assert.equal(f.urut, i + 1);
    dekat(f.alas, 10);
    assert.equal(f.tinggi, 13);
    dekat(f.luas, 65);
  });
  dekat(E.luasPermukaanLimasUmum(r), 360);

  const pp = [
    [0, 0],
    [18, 0],
    [18, 10],
    [0, 10],
  ];
  const r2 = E.rincianSisiLimas(pp, [13, 15, 13, 15]);
  assert.deepEqual([...r2.slice(1).map((f) => f.luas)], [117, 75, 117, 75]);
  dekat(E.luasPermukaanLimasUmum(r2), 180 + 384);
  assert.throws(() => E.rincianSisiLimas(pp, [13, 15]));
});

test('tinggiSisiLimasPersegiPanjang: tₛ tiap rusuk dari tinggi limas', () => {
  /* Alas 18 × 10, tinggi 12: rusuk 18 berjarak 5 dari pusat → 13, rusuk 10 berjarak 9 → 15. */
  assert.deepEqual([...E.tinggiSisiLimasPersegiPanjang(18, 10, 12)], [13, 15, 13, 15]);
});

/* ---------- Diagnosa ---------- */

const O = { luasAlas: 256, kelilingAlas: 64, tinggiSisi: 17, tinggiLimas: 15, sisiAlas: 16 };

test('diagnosaLuasPermukaanLimas mengenali setiap miskonsepsi', () => {
  const kasus = {
    800: 'benar',
    1344: 'lupa-setengah',
    544: 'tanpa-alas',
    1056: 'dua-alas',
    736: 'tinggi-limas',
    1280: 'volume',
    392: 'satu-sisi',
    999: 'salah-hitung',
  };
  Object.entries(kasus).forEach(([v, kode]) => {
    const d = E.diagnosaLuasPermukaanLimas(O, Number(v));
    assert.equal(d.kode, kode, 'nilai ' + v);
    assert.equal(typeof d.pesan, 'string');
    assert.ok(d.pesan.length > 10);
  });
});

test('diagnosa tanpa alas: memakai alas & lupa ½', () => {
  const o = { luasAlas: 100, kelilingAlas: 40, tinggiSisi: 13, tanpaAlas: true };
  assert.equal(E.diagnosaLuasPermukaanLimas(o, 260).kode, 'benar');
  assert.equal(E.diagnosaLuasPermukaanLimas(o, 360).kode, 'pakai-alas');
  assert.equal(E.diagnosaLuasPermukaanLimas(o, 520).kode, 'lupa-setengah');
});

test('diagnosa tanpa data tinggi limas/sisi alas tidak memunculkan kode itu', () => {
  const o = { luasAlas: 100, kelilingAlas: 40, tinggiSisi: 13 };
  const k = E.kandidatLuasPermukaanLimas(o);
  assert.ok(!('tinggi-limas' in k));
  assert.ok(!('volume' in k));
  assert.ok(!('satu-sisi' in k));
});

test('opsiLuasPermukaanLimas: ≥ 4 opsi unik, positif, memuat jawaban benar', () => {
  [
    O,
    { luasAlas: 100, kelilingAlas: 40, tinggiSisi: 13 },
    { luasAlas: 100, kelilingAlas: 40, tinggiSisi: 13, tanpaAlas: true },
    { luasAlas: 36, kelilingAlas: 24, tinggiSisi: 5 },
  ].forEach((o) => {
    const opsi = E.opsiLuasPermukaanLimas(o, 'cm²');
    assert.ok(opsi.length >= 4);
    assert.equal(new Set(opsi.map((x) => x.id)).size, opsi.length);
    assert.equal(new Set(opsi.map((x) => x.nilai)).size, opsi.length);
    opsi.forEach((x) => assert.ok(x.nilai > 0));
    const benar = opsi.find((x) => x.id === 'benar');
    assert.equal(benar.nilai, E.luasPermukaanLimas(o));
    assert.match(benar.label, /cm²$/);
  });
});

test('pengecohLuasSegitiga: lupa ½ dan menjumlahkan, tanpa nilai benar', () => {
  const p = E.pengecohLuasSegitiga({ alas: 10, tinggi: 13, luas: 65 });
  const nilai = p.map((x) => x.nilai);
  assert.ok(nilai.includes(130));
  assert.ok(nilai.includes(23));
  assert.ok(!nilai.includes(65));
  p.forEach((x) => assert.ok(x.pesan.length > 10));
});

/* ---------- Susun sisi tegak ---------- */

test('susunSisiTegakLimas: jalur berselang membentuk sisi sejajar berjumlah K', () => {
  [3, 4, 6].forEach((n) => {
    const s = 4;
    const ts = 7;
    const z = E.susunSisiTegakLimas(n, s, ts);
    assert.equal(z.bawah + z.atas, n * s);
    assert.equal(z.bawah, Math.ceil(n / 2) * s);
    assert.equal(z.atas, Math.floor(n / 2) * s);
    assert.equal(z.bentuk, n % 2 === 0 ? 'jajargenjang' : 'trapesium');
    dekat(z.luas, E.luasSisiTegakLimas(n * s, ts));
    /* Pada u = 1 setiap segitiga tepat di jalurnya (alas di y = 0 atau y = ts). */
    const akhir = E.posisiSusunLimas(n, s, ts, 1);
    assert.equal(akhir.length, n);
    akhir.forEach((tri, j) => {
      const ys = [...tri].map((q) => Math.round(q[1] * 1e6) / 1e6).sort((a, b) => a - b);
      if (j % 2 === 0) assert.deepEqual(ys, [0, ts, ts]);
      else assert.deepEqual(ys, [0, 0, ts]);
    });
    /* Pada setiap u, setiap segitiga tetap kongruen (luas ½ × s × ts). */
    [0, 0.3, 0.5, 0.8].forEach((u) => {
      E.posisiSusunLimas(n, s, ts, u).forEach((tri) => {
        /* Koordinat dibulatkan 6 desimal, jadi toleransinya longgar. */
        const L = Math.abs(E.luasBertanda(tri));
        assert.ok(Math.abs(L - (s * ts) / 2) < 1e-4, 'n=' + n + ' u=' + u + ': ' + L);
      });
    });
  });
});

/* ---------- UI ---------- */

const LIMAS = [
  { id: 'a', nama: 'Lampion A', n: 4, s: 10, ts: 13, infoAlas: 'persegi 10 cm' },
  { id: 'b', nama: 'Lampion B', n: 3, s: 6, ts: 8, infoAlas: 'segitiga sama sisi 6 cm' },
];

test('lab bentang limas: state, HTML ber-aria, dan syarat selesai', () => {
  const S = {};
  const st = E.ensureLplLabState(S, 'lab', { limas: LIMAS });
  assert.equal(st.p, 'a');
  assert.equal(st.t, 0);
  const html = E.buildLplNetLab('labX', st, { limas: LIMAS });
  assert.match(html, /id="labX"/);
  assert.equal((html.match(/data-lpl-sisi="/g) || []).length, 5);
  assert.match(html, /aria-label="Seberapa jauh/);
  assert.match(html, /data-lpl-p="b"/);
  assert.equal(E.lplLabSelesai(st, LIMAS[0]), false);
  st.dilipat.a = true;
  st.dilihat.a = ['alas', 't0', 't1', 't2', 't3'];
  assert.equal(E.lplLabSelesai(st, LIMAS[0]), true);
  st.sorot = 't1';
  const info = E.buildLplNetLab('labX', st, { limas: LIMAS });
  assert.match(info, /tinggi segitiga 13 cm/);
  st.t = 0.5;
  assert.match(E.buildLplNetLab('labX', st, { limas: LIMAS }), /psm-fold-svg/);
});

test('susun sisi tegak: state & HTML ber-aria', () => {
  const S = {};
  const st = E.ensureSusunLimasState(S, 'sz', ['a']);
  assert.deepEqual({ ...st.a }, { t: 0, pernah: false });
  const html = E.buildLplSusun('szA', LIMAS[0], st.a);
  assert.match(html, /role="img"/);
  assert.match(html, /data-lpl-susun-t/);
  assert.equal((html.match(/class="lpl-segitiga/g) || []).length, 4);
  st.a.t = 1;
  const jadi = E.buildLplSusun('szA', LIMAS[0], st.a);
  assert.match(jadi, /jajargenjang/);
  assert.match(jadi, /20 cm/);
});

test('jaring limas persegi panjang: 5 keping, tₛ per rusuk, gambar berlabel', () => {
  const b = { id: 'pp', nama: 'Tenda', p: 18, l: 10, t: 12 };
  const j = E.lplJaring(b);
  assert.equal(j.pieces.length, 5);
  const tegak = j.pieces.filter((q) => q.jenis === 'tegak');
  const tinggi = [...tegak].map((q) => {
    const m = [(q.pts2[0][0] + q.pts2[1][0]) / 2, (q.pts2[0][1] + q.pts2[1][1]) / 2];
    return Math.round(Math.hypot(q.pts2[2][0] - m[0], q.pts2[2][1] - m[1]) * 1e6) / 1e6;
  });
  assert.deepEqual(tinggi, [13, 15, 13, 15]);
  /* Puncak setiap segitiga di luar alas. */
  tegak.forEach((q) => {
    const x = q.pts2[2][0];
    const y = q.pts2[2][1];
    assert.ok(x < 0 || x > 18 || y < 0 || y > 10);
  });
  const svg = E.buildLplNetSVG(b, { lebar: 200 });
  assert.match(svg, /role="img"/);
  assert.match(svg, /tₛ = 13 cm/);
  assert.match(svg, /tₛ = 15 cm/);
});
