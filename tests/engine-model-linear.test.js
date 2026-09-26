'use strict';

/*
 * Tes seksi 41 shared/engine.js: model linear terbaik — prediksi,
 * garis melalui dua titik, residu, jumlah residu & jumlah kuadrat residu
 * (JKR), regresi kuadrat terkecil, perbandingan model, interpolasi vs
 * ekstrapolasi, format persamaan, diagnosa isian residu, parser data
 * tempel dari spreadsheet, state Lab Garis, dan markup komponen (plot
 * garis & residu, Lab Garis, tabel residu, tabel banding model, panel
 * regresi, lab regresi data sendiri).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();
const plain = (v) => JSON.parse(JSON.stringify(v));
const hitung = (html, pola) => (html.match(pola) || []).length;

/* Data kecil yang mudah dihitung tangan: garis terbaik ŷ = 1,6x + 2. */
const KECIL = [
  { x: 1, y: 3 },
  { x: 2, y: 7 },
  { x: 3, y: 5 },
  { x: 4, y: 9 },
];

test('prediksiLinear & garisDuaTitik', () => {
  assert.equal(E.prediksiLinear(2.5, 4, 16), 44);
  assert.equal(E.prediksiLinear(-1.5, 10, 4), 4);
  assert.deepEqual(plain(E.garisDuaTitik({ x: 2, y: 12 }, { x: 18, y: 48 })), { m: 2.25, c: 7.5 });
  assert.deepEqual(plain(E.garisDuaTitik({ x: 0, y: 5 }, { x: 2, y: 1 })), { m: -2, c: 5 });
  assert.equal(E.garisDuaTitik({ x: 3, y: 1 }, { x: 3, y: 9 }), null, 'garis tegak tidak punya m');
});

test('residuTitik: ŷ dan e = y − ŷ tanpa galat pembulatan biner', () => {
  const r = E.residuTitik(KECIL, 2, 0);
  assert.deepEqual(plain(r.map((t) => [t.yTopi, t.e])), [
    [2, 1],
    [4, 3],
    [6, -1],
    [8, 1],
  ]);
  const des = E.residuTitik([{ x: 3, y: 1 }], 0.1, 0.2);
  assert.equal(des[0].yTopi, 0.5, '0,1 × 3 + 0,2 = 0,5 persis');
  assert.equal(des[0].e, 0.5);
});

test('jumlah residu nol tidak menjamin garis terbaik; JKR yang menentukan', () => {
  /* Garis datar di rata-rata y: Σe = 0 tetapi JKR besar. */
  assert.equal(E.jumlahResidu(KECIL, 0, 6), 0);
  assert.equal(E.jumlahKuadratResidu(KECIL, 0, 6), 20);
  /* ŷ = 2x: Σe ≠ 0 tetapi JKR lebih kecil. */
  assert.equal(E.jumlahResidu(KECIL, 2, 0), 4);
  assert.equal(E.jumlahKuadratResidu(KECIL, 2, 0), 12);
});

test('regresiLinear: kuadrat terkecil, r, r², dan JKR minimum', () => {
  const reg = E.regresiLinear(KECIL);
  assert.equal(reg.m, 1.6);
  assert.equal(reg.c, 2);
  assert.equal(reg.n, 4);
  assert.ok(E.hampirSama(reg.jkr, 7.2));
  assert.ok(E.hampirSama(reg.r2, reg.r * reg.r));
  assert.ok(E.hampirSama(reg.r, 0.8));
  /* Tidak ada garis lain di sekitar yang JKR-nya lebih kecil. */
  [
    [1.5, 2],
    [1.7, 2],
    [1.6, 1.9],
    [1.6, 2.1],
    [2, 0],
    [0, 6],
  ].forEach(([m, c]) => assert.ok(E.jumlahKuadratResidu(KECIL, m, c) > reg.jkr, m + ',' + c));
  /* Garis regresi selalu melalui (x̄, ȳ) dan Σe = 0. */
  assert.ok(E.hampirSama(E.prediksiLinear(reg.m, reg.c, 2.5), 6));
  assert.ok(E.hampirSama(E.jumlahResidu(KECIL, reg.m, reg.c), 0));
  assert.equal(E.regresiLinear([{ x: 1, y: 2 }]), null, 'kurang dari dua titik');
  assert.equal(
    E.regresiLinear([
      { x: 2, y: 1 },
      { x: 2, y: 5 },
    ]),
    null,
    'semua x sama'
  );
});

test('bandingkanModel & modelTerbaik mengurutkan menurut JKR', () => {
  const models = [
    { id: 'datar', label: 'Datar', m: 0, c: 6 },
    { id: 'dua', label: 'ŷ = 2x', m: 2, c: 0 },
    { id: 'reg', label: 'Regresi', m: 1.6, c: 2 },
  ];
  const b = E.bandingkanModel(KECIL, models);
  assert.deepEqual(Array.from(b.map((x) => x.id)), ['reg', 'dua', 'datar']);
  assert.equal(b[2].jumlah, 0);
  assert.equal(b[2].jkr, 20);
  assert.equal(b[0].label, 'Regresi');
  assert.equal(E.modelTerbaik(KECIL, models), 'reg');
  assert.equal(models[0].id, 'datar', 'array asal tidak diubah');
});

test('jenisPrediksi: interpolasi di dalam rentang x data, ekstrapolasi di luar', () => {
  assert.equal(E.jenisPrediksi(2.5, KECIL), 'interpolasi');
  assert.equal(E.jenisPrediksi(1, KECIL), 'interpolasi', 'batas termasuk');
  assert.equal(E.jenisPrediksi(4, KECIL), 'interpolasi');
  assert.equal(E.jenisPrediksi(10, KECIL), 'ekstrapolasi');
  assert.equal(E.jenisPrediksi(0, KECIL), 'ekstrapolasi');
});

test('fmtAngkaReg & fmtPersamaanRegresi bergaya Indonesia', () => {
  assert.equal(E.fmtAngkaReg(2.5), '2,5');
  assert.equal(E.fmtAngkaReg(-1.25), '−1,25');
  assert.equal(E.fmtAngkaReg(0.96663, 3), '0,967');
  assert.equal(E.fmtAngkaReg(-0.0001), '0', 'tanpa −0');
  assert.equal(E.fmtPersamaanRegresi(2.5, 4), 'ŷ = 2,5x + 4');
  assert.equal(E.fmtPersamaanRegresi(3, -1), 'ŷ = 3x − 1');
  assert.equal(E.fmtPersamaanRegresi(0, 27.5), 'ŷ = 27,5');
  assert.equal(E.fmtPersamaanRegresi(-1.2, 5), 'ŷ = −1,2x + 5');
  assert.equal(E.fmtPersamaanRegresi(1, 0), 'ŷ = x');
  assert.equal(E.fmtPersamaanRegresi(-1, 2), 'ŷ = −x + 2');
  assert.equal(E.fmtPersamaanRegresi(2.4999999, 4.0000001), 'ŷ = 2,5x + 4');
  assert.equal(E.fmtPersamaanRegresi(0.8, 12, { x: 'n', y: 't' }), 't = 0,8n + 12');
});

test('diagnosaResidu mengenali tanda terbalik dan isian ŷ', () => {
  assert.equal(E.diagnosaResidu(7, 12, 5), 'benar');
  assert.equal(E.diagnosaResidu(-7, 12, 5), 'tanda');
  assert.equal(E.diagnosaResidu(5, 12, 5), 'yTopi');
  assert.equal(E.diagnosaResidu(3, 12, 5), 'salah');
  assert.equal(E.diagnosaResidu(0, 29, 29), 'benar');
  assert.equal(E.diagnosaResidu(null, 29, 29), 'salah');
  ['tanda', 'yTopi', 'salah', 'benar'].forEach((k) => {
    const p = E.pesanDiagnosaResidu(k, 12, 5);
    assert.ok(typeof p === 'string' && p.length > 10, k);
  });
  assert.match(E.pesanDiagnosaResidu('tanda', 12, 5), /y − ŷ/);
});

test('parsePasanganData membaca data tempel dari spreadsheet', () => {
  const r = E.parsePasanganData('SP\tJam\n2\t12\n4;11\n  5 14,5 \n\n7.5\t20\nabc\n8\t27\t9');
  assert.deepEqual(plain(r.titik), [
    { x: 2, y: 12 },
    { x: 4, y: 11 },
    { x: 5, y: 14.5 },
    { x: 7.5, y: 20 },
  ]);
  assert.deepEqual(plain(r.salah), [1, 7, 8], 'nomor baris yang diabaikan');
  assert.deepEqual(plain(E.parsePasanganData('').titik), []);
  assert.deepEqual(plain(E.parsePasanganData('−2 −3,5').titik), [{ x: -2, y: -3.5 }]);
});

test('state Lab Garis: atur nilai menempel ke langkah & rekor JKR terkecil', () => {
  const st = E.makeLineFitState({ m: 1, c: 0 });
  assert.equal(st.tampil, 'residu');
  assert.equal(st.rekor, null);
  const rng = { min: 0, max: 4, step: 0.1 };
  E.lfAtur(st, 'm', 2.04, rng);
  assert.equal(st.m, 2);
  E.lfAtur(st, 'm', 9, rng);
  assert.equal(st.m, 4, 'dibatasi max');
  E.lfAtur(st, 'm', 0.30000000000000004, rng);
  assert.equal(st.m, 0.3);
  E.lfAtur(st, 'm', 2, rng);
  const j1 = E.lfCatatRekor(st, KECIL);
  assert.equal(j1, 12);
  assert.deepEqual(plain(st.rekor), { m: 2, c: 0, jkr: 12 });
  E.lfAtur(st, 'c', 6, { min: -10, max: 10, step: 0.5 });
  E.lfAtur(st, 'm', 0, rng);
  E.lfCatatRekor(st, KECIL);
  assert.equal(st.rekor.jkr, 12, 'rekor hanya turun');
  assert.equal(st.geser, 2);
});

test('buildLineFitPlot: garis, segmen residu, persegi kuadrat, legenda', () => {
  const html = E.buildLineFitPlot(KECIL, {
    garis: { m: 2, c: 0 },
    tampil: 'residu',
    caption: 'Data kecil',
    xLabel: 'x',
    yLabel: 'y',
  });
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Data kecil"/);
  assert.equal(hitung(html, /class="aso-dot/g), 4);
  assert.equal(hitung(html, /class="lf-residu /g), 4, 'semua e ≠ 0');
  assert.equal(hitung(html, /lf-residu--neg/g), 1);
  assert.equal(hitung(html, /class="lf-garis lf-garis--utama"/g), 1);
  const nol = E.buildLineFitPlot(KECIL, { garis: { m: 0, c: 3 }, tampil: 'residu' });
  assert.equal(hitung(nol, /class="lf-residu /g), 3, 'titik tepat di garis tanpa segmen');
  const kuadrat = E.buildLineFitPlot(KECIL, { garis: { m: 2, c: 0 }, tampil: 'kuadrat' });
  assert.equal(hitung(kuadrat, /<rect class="lf-kuadrat/g), 4);
  const polos = E.buildLineFitPlot(KECIL, { garis: { m: 2, c: 0 }, tampil: 'tidak' });
  assert.equal(hitung(polos, /lf-residu|lf-kuadrat/g), 0);
  const lain = E.buildLineFitPlot(KECIL, {
    garisLain: [
      { m: 0, c: 6, label: 'Garis datar' },
      { m: 2, c: 0, label: 'Garis dua' },
    ],
  });
  assert.equal(hitung(lain, /class="lf-garis lf-garis--\d"/g), 2);
  assert.match(lain, /class="lf-legend"/);
  assert.match(lain, /Garis datar/);
  /* Garis di luar area grafik tidak digambar. */
  const luar = E.buildLineFitPlot(KECIL, { garis: { m: 0, c: 500 }, tampil: 'tidak' });
  assert.equal(hitung(luar, /lf-garis--utama/g), 0);
});

test('buildLineFitLab: slider berlabel, tombol langkah, pilihan tampilan, bacaan JKR', () => {
  const st = E.makeLineFitState({ m: 2, c: 0 });
  st.rekor = { m: 2, c: 0, jkr: 12 };
  const html = E.buildLineFitLab('lab', KECIL, st, {
    rentangM: { min: 0, max: 4, step: 0.1 },
    rentangC: { min: -10, max: 10, step: 0.5 },
    x: { min: 0, max: 5, step: 1 },
    y: { min: 0, max: 10, step: 2 },
  });
  assert.match(html, /id="lab-m"[^>]*type="range"|type="range"[^>]*id="lab-m"/);
  assert.match(html, /<label for="lab-m"/);
  assert.match(html, /<label for="lab-c"/);
  assert.equal(hitung(html, /data-lf-step=/g), 4);
  assert.equal(hitung(html, /type="radio"/g), 3);
  assert.match(html, /id="lab-plot"/);
  assert.match(html, /id="lab-baca"[^>]*aria-live="polite"/);
  assert.match(html, /ŷ = 2x/);
  assert.match(html, /12/);
  const baca = E.lfBacaHTML(KECIL, st, {});
  assert.match(baca, /Jumlah residu/);
  assert.match(baca, /JKR/);
  assert.match(baca, /Rekor/);
});

test('buildResidualTable & buildModelCompareTable', () => {
  const tbl = E.buildResidualTable(
    KECIL.map((p, i) => Object.assign({ nama: 'P' + (i + 1) }, p)),
    0,
    6,
    { caption: 'Garis datar' }
  );
  assert.match(tbl, /<caption/);
  assert.equal(hitung(tbl, /<tr/g), 1 + 4 + 1, 'kepala + 4 baris + total');
  assert.match(tbl, /P3/);
  assert.match(tbl, /−3/);
  assert.match(tbl, />20</, 'JKR di baris total');
  const tanpaKuadrat = E.buildResidualTable(KECIL, 0, 6, { kuadrat: false, total: false });
  assert.equal(hitung(tanpaKuadrat, /e²/g), 0);
  assert.equal(hitung(tanpaKuadrat, /<tr/g), 5);

  const models = [
    { id: 'datar', label: 'Datar', m: 0, c: 6 },
    { id: 'reg', label: 'Regresi', m: 1.6, c: 2 },
  ];
  const cmp = E.buildModelCompareTable(KECIL, models, { sorotTerbaik: true });
  assert.equal(hitung(cmp, /lf-terbaik/g), 1);
  assert.match(cmp, /ŷ = 1,6x \+ 2/);
  assert.match(cmp, /7,2/);
  const polos = E.buildModelCompareTable(KECIL, models, {});
  assert.equal(hitung(polos, /lf-terbaik/g), 0);
});

test('buildRegressionPanel: rumus spreadsheet & kode JS sesuai hasil regresi', () => {
  const html = E.buildRegressionPanel(KECIL, { rentangX: 'A2:A5', rentangY: 'B2:B5' });
  assert.match(html, /=SLOPE\(B2:B5;A2:A5\)/);
  assert.match(html, /=INTERCEPT\(B2:B5;A2:A5\)/);
  assert.match(html, /=RSQ\(B2:B5;A2:A5\)/);
  assert.match(html, /=SUMPRODUCT\(\(B2:B5-\(1,6\*A2:A5\+2\)\)\^2\)/, 'JKR memakai nilai m & c');
  assert.match(
    E.buildRegressionPanel(
      [
        { x: 0, y: -1 },
        { x: 1, y: 1 },
      ],
      {}
    ),
    /\(2\*A2:A11-1\)/,
    'c negatif memakai minus ASCII'
  );
  assert.match(html, /1,6/);
  assert.match(html, /regresiLinear\(/);
  assert.match(html, /m: 1\.6/, 'kode JS memakai titik desimal');
  assert.match(html, /ŷ = 1,6x \+ 2/);
  assert.match(E.buildRegressionPanel([{ x: 1, y: 1 }], {}), /minimal dua/i);
});

test('lab regresi data sendiri: hasil untuk data valid & pesan untuk data kurang', () => {
  const st = E.makeRegressionLabState('1 3\n2 7\n3 5\n4 9');
  const html = E.buildRegressionLab('rl', st, { xLabel: 'x', yLabel: 'y' });
  assert.match(html, /<label for="rl-teks"/);
  assert.match(html, /id="rl-hitung"/);
  const hasil = E.regressionLabHasilHTML(st, { xLabel: 'x', yLabel: 'y' });
  assert.match(hasil, /ŷ = 1,6x \+ 2/);
  assert.match(hasil, /aso-plot/);
  const kurang = E.regressionLabHasilHTML(E.makeRegressionLabState('1 3\nx'), {});
  assert.match(kurang, /minimal dua/i);
  assert.match(kurang, /baris 2/i);
});
