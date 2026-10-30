'use strict';

/*
 * Tes fungsi murni seksi 85 shared/engine.js (sisi & sudut bersesuaian,
 * kongruen vs sebangun): titik/sisi/sudut bersesuaian dari pemetaan
 * cariKorespondensi, opsi & diagnosa miskonsepsi pemasangan, opsi
 * notasi, ringkasan & diagnosa klasifikasi, serta soal isian panjang
 * sisi / besar sudut pada bangun sebangun.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

/* Trapesium siku-siku ABCD (sama dengan tests/engine-kongruen.test.js). */
const P = {
  id: 'p',
  titik: ['A', 'B', 'C', 'D'],
  pts: [
    [0, 4],
    [6, 4],
    [3, 0],
    [0, 0],
  ],
};
/* P diputar 90° searah jarum jam, titik didaftar mulai dari bayangan D. */
const Q = {
  id: 'q',
  titik: ['K', 'L', 'M', 'N'],
  pts: [
    [4, 0],
    [0, 0],
    [0, 6],
    [4, 3],
  ],
};
/* P diperbesar 1,5 kali. */
const S = {
  id: 's',
  titik: ['E', 'F', 'G', 'H'],
  pts: [
    [0, 6],
    [9, 6],
    [4.5, 0],
    [0, 0],
  ],
};
/* Trapesium lain dengan luas sama. */
const T = {
  id: 't',
  titik: ['T', 'U', 'V', 'W'],
  pts: [
    [0, 4],
    [6, 4],
    [4.5, 0],
    [1.5, 0],
  ],
};
/* Persegi panjang 2 × 4 dan 3 × 4: semua sudut 90° tetapi tidak sebangun. */
const PP1 = {
  id: 'pp1',
  titik: ['A', 'B', 'C', 'D'],
  pts: [
    [0, 2],
    [4, 2],
    [4, 0],
    [0, 0],
  ],
};
const PP2 = {
  id: 'pp2',
  titik: ['P', 'Q', 'R', 'S'],
  pts: [
    [0, 3],
    [4, 3],
    [4, 0],
    [0, 0],
  ],
};
/* Segitiga siku-siku 3-4-5 dan bayangan cerminnya (bentuk tak simetris). */
const SG = {
  id: 'sg',
  titik: ['P', 'Q', 'R'],
  pts: [
    [0, 3],
    [4, 3],
    [0, 0],
  ],
};
const SGC = {
  id: 'sgc',
  titik: ['X', 'Y', 'Z'],
  pts: [
    [4, 3],
    [0, 3],
    [4, 0],
  ],
};

const MAP_PQ = E.korespondensiBangun(P, Q).map;

test('korespondensiBangun membungkus cariKorespondensi pada pts', () => {
  const k = E.korespondensiBangun(P, Q);
  assert.equal(plain(k.map).length, 4);
  assert.ok(Math.abs(k.skala - 1) < 1e-9);
  const ks = E.korespondensiBangun(P, S);
  assert.ok(Math.abs(ks.skala - 1.5) < 1e-9);
  assert.equal(E.korespondensiBangun(P, T), null);
  assert.equal(E.korespondensiBangun(PP1, PP2), null);
});

test('korespondensiTunggal: bangun tak simetris punya satu pemetaan', () => {
  assert.equal(E.banyakKorespondensi(P, Q), 1);
  assert.equal(E.korespondensiTunggal(P, S), true);
  assert.equal(E.banyakKorespondensi(P, T), 0);
  /* persegi panjang 2 × 4 dan 4 × 8: dua putaran (0° & 180°) + dua cermin */
  const PP3 = {
    id: 'pp3',
    titik: ['K', 'L', 'M', 'N'],
    pts: PP1.pts.map(([x, y]) => [2 * x, 2 * y]),
  };
  assert.equal(E.banyakKorespondensi(PP1, PP3), 4);
  assert.equal(E.korespondensiTunggal(PP1, PP3), false);
});

test('titik, sisi & sudut bersesuaian mengikuti pemetaan', () => {
  /* A(0,4) diputar menjadi L(0,0): sudut siku di A ↔ sudut siku di L. */
  assert.equal(E.titikBersesuaian(P, Q, MAP_PQ, 0), 'L');
  assert.equal(E.titikBersesuaian(P, Q, MAP_PQ, 2), 'N');
  assert.equal(E.sudutBersesuaian(P, Q, MAP_PQ, 1), '∠M');
  assert.equal(E.sisiBersesuaian(P, Q, MAP_PQ, 0), 'LM');
  assert.equal(E.sisiBersesuaian(P, Q, MAP_PQ, 3), 'KL');
  /* indeks sisi di Q: sisi j = titik j → titik j+1 */
  assert.equal(E.indeksSisiBersesuaian(MAP_PQ, 0), 1);
  assert.equal(E.indeksSisiBersesuaian(MAP_PQ, 3), 0);
  /* panjangnya sama karena kongruen */
  const sp = E.sisiPoligon(P.pts);
  const sq = E.sisiPoligon(Q.pts);
  for (let i = 0; i < 4; i++) {
    assert.ok(Math.abs(sp[i] - sq[E.indeksSisiBersesuaian(MAP_PQ, i)]) < 1e-9);
  }
});

test('indeksSisiBersesuaian benar pada bangun bercermin (arah terbalik)', () => {
  const m = E.korespondensiBangun(SG, SGC).map;
  const sp = E.sisiPoligon(SG.pts);
  const sq = E.sisiPoligon(SGC.pts);
  for (let i = 0; i < 3; i++) {
    assert.ok(Math.abs(sp[i] - sq[E.indeksSisiBersesuaian(m, i)]) < 1e-9);
  }
  assert.equal(E.sisiBersesuaian(SG, SGC, m, 0), 'XY');
});

test('opsiSisiBersesuaian & opsiSudutBersesuaian memuat semua sisi/sudut bangun kedua', () => {
  const os = plain(E.opsiSisiBersesuaian(Q));
  assert.deepEqual(
    os.map((o) => o.id),
    ['s0', 's1', 's2', 's3']
  );
  assert.deepEqual(
    os.map((o) => o.label),
    ['KL', 'LM', 'MN', 'NK']
  );
  const oa = plain(E.opsiSudutBersesuaian(Q));
  assert.deepEqual(
    oa.map((o) => o.label),
    ['∠K', '∠L', '∠M', '∠N']
  );
  assert.equal(E.kunciSisiBersesuaian(MAP_PQ, 0), 's1');
  assert.equal(E.kunciSudutBersesuaian(MAP_PQ, 1), 'a2');
  assert.equal(E.kunciTitikBersesuaian(MAP_PQ, 0), 't1');
  assert.deepEqual(
    plain(E.opsiTitikBersesuaian(Q)).map((o) => o.label),
    ['K', 'L', 'M', 'N']
  );
});

test('diagnosaBersesuaian mengenali miskonsepsi urutan huruf, ukuran sama, & tetangga', () => {
  /* Sisi AB (i = 0) ↔ LM (s1). */
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'sisi', 0, 's1'), 'benar');
  /* memilih sisi pada urutan yang sama (KL, s0) */
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'sisi', 0, 's0'), 'urutHuruf');
  /* sisi MN (s2) bertetangga dengan LM */
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'sisi', 0, 's2'), 'tetangga');
  /* sisi NK (s3) berhadapan dengan LM */
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'sisi', 0, 's3'), 'lain');
  /* Sudut A (90°) ↔ ∠L; ∠K juga 90° → ukuranSama, tetapi urutan huruf didahulukan */
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'sudut', 0, 'a1'), 'benar');
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'sudut', 0, 'a0'), 'urutHuruf');
  /* Sudut D (90°, i = 3) ↔ ∠K; ∠L juga 90° */
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'sudut', 3, 'a1'), 'ukuranSama');
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'sudut', 3, 'a2'), 'lain');
  /* titik */
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'titik', 0, 't1'), 'benar');
  assert.equal(E.diagnosaBersesuaian(P, Q, MAP_PQ, 'titik', 0, 't0'), 'urutHuruf');
});

test('pesanBersesuaian memberi pesan untuk setiap kode', () => {
  ['benar', 'urutHuruf', 'ukuranSama', 'tetangga', 'lain'].forEach((kode) => {
    ['titik', 'sisi', 'sudut'].forEach((jenis) => {
      const m = E.pesanBersesuaian(kode, jenis, 'LM');
      assert.equal(typeof m, 'string');
      assert.ok(m.length > 10, kode + '/' + jenis);
    });
  });
  assert.match(E.pesanBersesuaian('benar', 'sisi', 'LM'), /LM/);
});

test('opsiNotasi: kunci notasi bersesuaian + pengecoh unik', () => {
  const o = plain(E.opsiNotasi(P, Q, MAP_PQ, '≅'));
  assert.equal(o.length, 4);
  assert.equal(new Set(o.map((x) => x.id)).size, 4);
  assert.equal(new Set(o.map((x) => x.label)).size, 4);
  assert.equal(o[0].id, 'benar');
  assert.equal(o[0].label, 'ABCD ≅ LMNK');
  assert.ok(o.some((x) => x.label === 'ABCD ≅ KLMN'));
});

test('ringkasKlasifikasi: jenis, sudut sama, skala, luas sama', () => {
  const a = plain(E.ringkasKlasifikasi(P, Q));
  assert.equal(a.jenis, 'kongruen');
  assert.equal(a.sudutSama, true);
  assert.ok(Math.abs(a.skala - 1) < 1e-9);
  const b = plain(E.ringkasKlasifikasi(P, S));
  assert.equal(b.jenis, 'sebangun');
  assert.ok(Math.abs(b.skala - 1.5) < 1e-9);
  const c = plain(E.ringkasKlasifikasi(P, T));
  assert.equal(c.jenis, 'tidak');
  assert.equal(c.luasSama, true);
  assert.equal(c.skala, null);
  const d = plain(E.ringkasKlasifikasi(PP1, PP2));
  assert.equal(d.jenis, 'tidak');
  assert.equal(d.sudutSama, true);
});

test('diagnosaKlasifikasi memetakan miskonsepsi kongruen/sebangun', () => {
  assert.equal(E.diagnosaKlasifikasi(P, Q, 'kongruen'), 'benar');
  assert.equal(E.diagnosaKlasifikasi(P, Q, 'sebangun'), 'kongruenKhusus');
  assert.equal(E.diagnosaKlasifikasi(P, Q, 'tidak'), 'tertipuPosisi');
  assert.equal(E.diagnosaKlasifikasi(P, S, 'kongruen'), 'abaikanUkuran');
  assert.equal(E.diagnosaKlasifikasi(P, S, 'tidak'), 'tertipuPosisi');
  assert.equal(E.diagnosaKlasifikasi(P, T, 'kongruen'), 'luasSama');
  assert.equal(E.diagnosaKlasifikasi(P, T, 'sebangun'), 'miripSaja');
  assert.equal(E.diagnosaKlasifikasi(PP1, PP2, 'sebangun'), 'sudutSaja');
  ['benar', 'kongruenKhusus', 'tertipuPosisi', 'abaikanUkuran', 'luasSama', 'miripSaja'].forEach(
    (k) => assert.ok(E.pesanKlasifikasi(k, E.ringkasKlasifikasi(P, S)).length > 10, k)
  );
  assert.match(E.pesanKlasifikasi('benar', E.ringkasKlasifikasi(P, S)), /1,5/);
});

test('OPSI_KLASIFIKASI berisi tiga kategori', () => {
  assert.deepEqual(
    plain(E.OPSI_KLASIFIKASI).map((o) => o.id),
    ['kongruen', 'sebangun', 'tidak']
  );
});

test('soal isian sebangun: nilai & diagnosa', () => {
  const sisi = { minta: 'sisi', a: 4, b: 10, c: 6 };
  assert.equal(E.nilaiSoalSebangun(sisi), 15);
  assert.equal(E.diagnosaSoalSebangun(sisi, 15), 'benar');
  assert.equal(E.diagnosaSoalSebangun(sisi, 2.4), 'skalaDibalik');
  assert.equal(E.diagnosaSoalSebangun(sisi, 12), 'selisih');
  assert.equal(E.diagnosaSoalSebangun(sisi, 6), 'samaAsal');
  assert.equal(E.diagnosaSoalSebangun(sisi, 7), 'salah');

  const sudut = { minta: 'sudut', nilai: 65, k: 2 };
  assert.equal(E.nilaiSoalSebangun(sudut), 65);
  assert.equal(E.diagnosaSoalSebangun(sudut, 65), 'benar');
  assert.equal(E.diagnosaSoalSebangun(sudut, 130), 'sudutDiskala');
  assert.equal(E.diagnosaSoalSebangun(sudut, 115), 'pelurus');
  assert.equal(E.diagnosaSoalSebangun(sudut, 50), 'salah');

  ['skalaDibalik', 'selisih', 'samaAsal', 'salah'].forEach((k) =>
    assert.ok(E.pesanSoalSebangun(sisi, k).length > 10, k)
  );
  ['sudutDiskala', 'pelurus', 'salah'].forEach((k) =>
    assert.ok(E.pesanSoalSebangun(sudut, k).length > 10, k)
  );
});

test('buildSorotBersesuaian menyorot sisi/sudut bersesuaian pada kedua bangun', () => {
  const html = E.buildSorotBersesuaian(P, Q, MAP_PQ, 'sisi', 0);
  assert.match(html, /kgr-pair/);
  assert.equal((html.match(/kgr-sorot/g) || []).length, 2);
  const h2 = E.buildSorotBersesuaian(P, Q, MAP_PQ, 'sudut', 1);
  assert.equal((h2.match(/kgr-arc--sorot/g) || []).length, 2);
});
