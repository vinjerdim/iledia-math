'use strict';

/*
 * Tes fungsi murni shared/engine.js seksi 91 — bidang koordinat
 * Kartesius & ide awal transformasi: kuadran, penulisan & diagnosa
 * koordinat, panjang ruas sejajar sumbu, sifat & jenis segi empat dari
 * koordinat, titik keempat jajargenjang, transformasi dasar (geser,
 * cermin, putar, perbesar), perbandingan bangun asal–bayangan, state
 * lab, serta kunci & opsi berpengecoh soal uji terap.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function arr(v) {
  return JSON.parse(JSON.stringify(v));
}

test('kuadranTitik: empat kuadran, sumbu, dan titik asal', () => {
  assert.equal(E.kuadranTitik([3, 2]), 'I');
  assert.equal(E.kuadranTitik([-3, 2]), 'II');
  assert.equal(E.kuadranTitik([-3, -2]), 'III');
  assert.equal(E.kuadranTitik([3, -2]), 'IV');
  assert.equal(E.kuadranTitik([0, 4]), 'sumbuY');
  assert.equal(E.kuadranTitik([-5, 0]), 'sumbuX');
  assert.equal(E.kuadranTitik([0, 0]), 'O');
  assert.ok(E.KTS_KUADRAN_LABEL.II.includes('II'));
});

test('formatKoordinat memakai minus tipografis', () => {
  assert.equal(E.formatKoordinat([3, -2]), '(3, −2)');
  assert.equal(E.formatKoordinat([-4, 0]), '(−4, 0)');
  assert.equal(E.formatKoordinat([0, 0]), '(0, 0)');
});

test('diagnosaKoordinat mengenali miskonsepsi umum', () => {
  assert.equal(E.diagnosaKoordinat([3, -2], [3, -2]), 'tepat');
  assert.equal(E.diagnosaKoordinat([3, -2], [-2, 3]), 'tertukar');
  assert.equal(E.diagnosaKoordinat([3, -2], [-3, -2]), 'tandaX');
  assert.equal(E.diagnosaKoordinat([3, -2], [3, 2]), 'tandaY');
  assert.equal(E.diagnosaKoordinat([3, -2], [-3, 2]), 'tandaXY');
  assert.equal(E.diagnosaKoordinat([3, -2], [3, 5]), 'xSaja');
  assert.equal(E.diagnosaKoordinat([3, -2], [1, -2]), 'ySaja');
  assert.equal(E.diagnosaKoordinat([3, -2], [5, 5]), 'lain');
  assert.equal(E.diagnosaKoordinat([3, -2], null), 'kosong');
  ['tertukar', 'tandaX', 'tandaY', 'tandaXY', 'xSaja', 'ySaja', 'lain', 'kosong'].forEach((d) =>
    assert.ok(E.pesanKoordinat(d, [3, -2]).length > 15, d)
  );
});

test('panjangRuasSumbu: hanya ruas mendatar/tegak, melewati sumbu', () => {
  assert.equal(E.panjangRuasSumbu([-2, 3], [4, 3]), 6);
  assert.equal(E.panjangRuasSumbu([1, -4], [1, 2]), 6);
  assert.equal(E.panjangRuasSumbu([1, 1], [3, 4]), null);
});

test('sifat & jenis segi empat dari koordinat', () => {
  const pp = [
    [-3, -1],
    [3, -1],
    [3, 2],
    [-3, 2],
  ];
  const s = E.sifatSegiEmpat(pp);
  assert.deepEqual(arr(s.sejajar), [true, true]);
  assert.deepEqual(arr(s.siku), [true, true, true, true]);
  assert.equal(s.sisiSama, false);
  assert.equal(E.jenisSegiEmpat(pp), 'persegiPanjang');
  assert.equal(
    E.jenisSegiEmpat([
      [0, 0],
      [2, 0],
      [2, 2],
      [0, 2],
    ]),
    'persegi'
  );
  assert.equal(
    E.jenisSegiEmpat([
      [-3, -1],
      [1, -1],
      [3, 2],
      [-1, 2],
    ]),
    'jajargenjang'
  );
  assert.equal(
    E.jenisSegiEmpat([
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ]),
    'persegi'
  );
  assert.equal(
    E.jenisSegiEmpat([
      [0, -3],
      [2, 0],
      [0, 3],
      [-2, 0],
    ]),
    'belahKetupat'
  );
  assert.equal(
    E.jenisSegiEmpat([
      [-3, 0],
      [3, 0],
      [1, 3],
      [-1, 3],
    ]),
    'trapesium'
  );
  assert.equal(
    E.jenisSegiEmpat([
      [0, -3],
      [2, 1],
      [0, 3],
      [-2, 1],
    ]),
    'layangLayang'
  );
  assert.equal(
    E.jenisSegiEmpat([
      [0, 0],
      [4, 0],
      [5, 3],
      [1, 5],
    ]),
    'segiEmpat'
  );
  Object.keys(E.KTS_JENIS_LABEL).forEach((k) => assert.ok(E.KTS_JENIS_LABEL[k]));
});

test('titikKeempatJajargenjang: D = A + C − B', () => {
  assert.deepEqual(arr(E.titikKeempatJajargenjang([-3, -1], [3, -1], [3, 2])), [-3, 2]);
  assert.deepEqual(arr(E.titikKeempatJajargenjang([-3, -1], [1, -1], [3, 2])), [-1, 2]);
});

test('transformasiTitik: geser, cermin, putar, perbesar (tanpa −0)', () => {
  const p = [2, 1];
  assert.deepEqual(arr(E.transformasiTitik(p, { jenis: 'geser', dx: 3, dy: -2 })), [5, -1]);
  assert.deepEqual(arr(E.transformasiTitik(p, { jenis: 'cermin', sumbu: 'x' })), [2, -1]);
  assert.deepEqual(arr(E.transformasiTitik(p, { jenis: 'cermin', sumbu: 'y' })), [-2, 1]);
  assert.deepEqual(arr(E.transformasiTitik(p, { jenis: 'putar', sudut: 90 })), [-1, 2]);
  assert.deepEqual(arr(E.transformasiTitik(p, { jenis: 'putar', sudut: 180 })), [-2, -1]);
  assert.deepEqual(arr(E.transformasiTitik(p, { jenis: 'putar', sudut: 270 })), [1, -2]);
  assert.deepEqual(arr(E.transformasiTitik(p, { jenis: 'perbesar', k: 2 })), [4, 2]);
  const nol = E.transformasiTitik([0, 3], { jenis: 'cermin', sumbu: 'y' });
  assert.ok(Object.is(nol[0], 0), '−0 dinormalkan');
  assert.deepEqual(
    arr(
      E.transformasiBangun(
        [
          [1, 1],
          [3, 1],
        ],
        { jenis: 'geser', dx: 1, dy: 1 }
      )
    ),
    [
      [2, 2],
      [4, 2],
    ]
  );
});

test('labelTransformasi menuliskan gerak dengan kata sehari-hari', () => {
  assert.match(E.labelTransformasi({ jenis: 'geser', dx: 3, dy: -2 }), /3 ke kanan.*2 ke bawah/);
  assert.match(E.labelTransformasi({ jenis: 'geser', dx: -1, dy: 0 }), /1 ke kiri/);
  assert.match(E.labelTransformasi({ jenis: 'cermin', sumbu: 'x' }), /sumbu-x/);
  assert.match(E.labelTransformasi({ jenis: 'putar', sudut: 90 }), /90°.*berlawanan/);
  assert.match(E.labelTransformasi({ jenis: 'perbesar', k: 2 }), /2 kali/);
  assert.equal(E.KTS_GERAK.length, 4);
  assert.deepEqual(arr(E.KTS_GERAK.map((g) => g.istilah)), [
    'translasi',
    'refleksi',
    'rotasi',
    'dilatasi',
  ]);
});

test('bandingTransformasi: ukuran, bentuk, posisi, dan arah hadap', () => {
  const tri = [
    [1, 1],
    [3, 1],
    [1, 3],
  ];
  const cek = (t) => E.bandingTransformasi(tri, E.transformasiBangun(tri, t));
  const g = cek({ jenis: 'geser', dx: 3, dy: 2 });
  assert.equal(g.ukuranTetap, true);
  assert.equal(g.bentukTetap, true);
  assert.equal(g.posisiBerubah, true);
  assert.equal(g.arahTetap, true);
  const c = cek({ jenis: 'cermin', sumbu: 'y' });
  assert.equal(c.ukuranTetap, true);
  assert.equal(c.arahTetap, false, 'cermin membalik arah hadap');
  const r = cek({ jenis: 'putar', sudut: 90 });
  assert.equal(r.ukuranTetap, true);
  assert.equal(r.arahTetap, true);
  const d = cek({ jenis: 'perbesar', k: 2 });
  assert.equal(d.ukuranTetap, false);
  assert.equal(d.bentukTetap, true);
  const regang = E.bandingTransformasi(tri, [
    [2, 1],
    [6, 1],
    [2, 3],
  ]);
  assert.equal(regang.bentukTetap, false);
});

test('ktsBulatkanTitik: membulatkan ke titik kisi terdekat dan membatasi', () => {
  assert.deepEqual(arr(E.ktsBulatkanTitik(2.4, -1.6, 6)), [2, -2]);
  assert.deepEqual(arr(E.ktsBulatkanTitik(9, -9, 6)), [6, -6]);
  assert.ok(Object.is(E.ktsBulatkanTitik(-0.2, 0.3, 6)[0], 0));
});

test('Lab Titik: periksa berdiagnosa lalu maju ke tugas berikutnya', () => {
  const tugas = [
    { id: 't1', p: [3, 2] },
    { id: 't2', p: [-2, -1] },
  ];
  const st = E.ensureLabTitikKts(null, tugas);
  assert.equal(st.idx, 0);
  assert.equal(E.periksaLabTitikKts(st, tugas), 'kosong');
  st.kursor = [2, 3];
  assert.equal(E.periksaLabTitikKts(st, tugas), 'tertukar');
  assert.equal(st.hasil.t1.attempts, 1);
  st.kursor = [3, 2];
  assert.equal(E.periksaLabTitikKts(st, tugas), 'tepat');
  assert.equal(st.hasil.t1.done, true);
  assert.equal(st.hasil.t1.firstTry, false);
  assert.equal(st.idx, 1);
  assert.equal(st.kursor, null);
  assert.equal(E.labTitikSelesai(st, tugas), false);
  st.kursor = [-2, -1];
  E.periksaLabTitikKts(st, tugas);
  assert.equal(st.hasil.t2.firstTry, true);
  assert.equal(E.labTitikSelesai(st, tugas), true);
  /* State rusak/kedaluwarsa dibangun ulang. */
  const st2 = E.ensureLabTitikKts({ idx: 9, hasil: 'x' }, tugas);
  assert.equal(st2.idx, 0);
});

test('Lab Bangun: titik keempat diperiksa terhadap kunci', () => {
  const b = {
    id: 'b1',
    pts: [
      [-3, -1],
      [3, -1],
      [3, 2],
      [-3, 2],
    ],
  };
  const st = E.ensureTitikKeempatKts(null);
  assert.equal(E.periksaTitikKeempatKts(st, b), 'kosong');
  st.kursor = [2, -3];
  assert.equal(E.periksaTitikKeempatKts(st, b), 'tertukar');
  assert.equal(st.done, false);
  st.kursor = [-3, 2];
  assert.equal(E.periksaTitikKeempatKts(st, b), 'tepat');
  assert.equal(st.done, true);
});

test('Lab Gerak: catatan unik dan lengkap bila keempat jenis gerak dicoba', () => {
  const cfg = {
    bangun: [
      {
        id: 'bendera',
        pts: [
          [1, 1],
          [3, 1],
          [1, 3],
        ],
      },
    ],
    preset: [
      { id: 'g1', t: { jenis: 'geser', dx: 3, dy: 2 } },
      { id: 'c1', t: { jenis: 'cermin', sumbu: 'y' } },
      { id: 'p1', t: { jenis: 'putar', sudut: 90 } },
      { id: 'd1', t: { jenis: 'perbesar', k: 2 } },
    ],
  };
  const st = E.ensureLabGerakKts(null, cfg);
  assert.equal(st.bangun, 'bendera');
  assert.equal(E.labGerakLengkap(st, cfg), false);
  E.terapkanLabGerakKts(st, cfg, 'g1');
  E.terapkanLabGerakKts(st, cfg, 'g1');
  assert.equal(st.log.length, 1, 'kombinasi sama tidak dicatat dua kali');
  ['c1', 'p1'].forEach((id) => E.terapkanLabGerakKts(st, cfg, id));
  assert.equal(E.labGerakLengkap(st, cfg), false);
  E.terapkanLabGerakKts(st, cfg, 'd1');
  assert.equal(E.labGerakLengkap(st, cfg), true);
  assert.equal(E.terapkanLabGerakKts(st, cfg, 'tidakAda'), false);
  const rusak = E.ensureLabGerakKts({ bangun: 'x', log: [{ bangun: 'x', preset: 'g1' }] }, cfg);
  assert.equal(rusak.bangun, 'bendera');
  assert.equal(rusak.log.length, 0);
});

function cekOpsi(s) {
  const opsi = E.opsiSoalKts(s);
  assert.ok(opsi.length >= 4 && opsi.length <= 6, s.minta + ': 4–6 opsi');
  assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length, 'id unik');
  assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, 'label unik');
  assert.equal(opsi.filter((o) => o.id === 'benar').length, 1);
  assert.equal(opsi.find((o) => o.id === 'benar').label, E.jawabSoalKts(s));
  opsi.forEach((o) => assert.ok(o.umpan && o.umpan.length > 10, s.minta + ': umpan ' + o.id));
  return opsi;
}

test('soal uji terap: kunci dihitung engine dan opsi berpengecoh unik', () => {
  assert.equal(E.jawabSoalKts({ minta: 'koordinat', p: [-4, 3] }), '(−4, 3)');
  const ok = cekOpsi({ minta: 'koordinat', p: [-4, 3] });
  assert.ok(
    ok.some((o) => o.label === '(3, −4)'),
    'pengecoh tertukar'
  );

  assert.equal(E.jawabSoalKts({ minta: 'kuadran', p: [-2, -5] }), E.KTS_KUADRAN_LABEL.III);
  cekOpsi({ minta: 'kuadran', p: [-2, -5] });
  cekOpsi({ minta: 'kuadran', p: [0, -5] });

  const tk = {
    minta: 'titikKeempat',
    pts: [
      [-3, -1],
      [1, -1],
      [3, 2],
    ],
  };
  assert.equal(E.jawabSoalKts(tk), '(−1, 2)');
  cekOpsi(tk);

  assert.equal(E.jawabSoalKts({ minta: 'panjang', p: [-2, 3], q: [4, 3] }), '6 satuan');
  cekOpsi({ minta: 'panjang', p: [-2, 3], q: [4, 3] });
  cekOpsi({ minta: 'panjang', p: [1, 1], q: [1, 4] });

  const jb = {
    minta: 'jenisBangun',
    pts: [
      [-3, 0],
      [3, 0],
      [1, 3],
      [-1, 3],
    ],
  };
  assert.equal(E.jawabSoalKts(jb), E.KTS_JENIS_LABEL.trapesium);
  cekOpsi(jb);

  assert.match(E.jawabSoalKts({ minta: 'gerak', gerak: 'cermin' }), /refleksi/);
  cekOpsi({ minta: 'gerak', gerak: 'cermin' });

  const bys = [
    { jenis: 'geser', dx: 3, dy: -2 },
    { jenis: 'cermin', sumbu: 'x' },
    { jenis: 'cermin', sumbu: 'y' },
    { jenis: 'putar', sudut: 90 },
    { jenis: 'putar', sudut: 180 },
    { jenis: 'perbesar', k: 2 },
  ];
  bys.forEach((t) => {
    const s = { minta: 'bayangan', p: [2, 1], t };
    assert.equal(E.jawabSoalKts(s), E.formatKoordinat(E.transformasiTitik([2, 1], t)));
    cekOpsi(s);
  });
});
