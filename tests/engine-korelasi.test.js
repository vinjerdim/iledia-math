'use strict';

/*
 * Tes seksi 50 shared/engine.js: koefisien korelasi & kesesuaian model
 * linear — tafsir arah & kekuatan r, rincian langkah hitung r (Sxy, Sxx,
 * Syy), diagnosa isian r, pola residu (acak vs lengkung), keputusan
 * kelayakan model linear, pengaruh pencilan, data sintetis ber-r
 * tertentu, dan markup komponen (meteran r, tabel langkah, plot residu,
 * penjelajah r, lab pencilan, panel spreadsheet & kode korelasi).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();
const plain = (v) => JSON.parse(JSON.stringify(v));
const hitung = (html, pola) => (html.match(pola) || []).length;
const titik = (xs, ys) => xs.map((x, i) => ({ id: 'p' + (i + 1), x: x, y: ys[i] }));

/* Data hitung tangan: x̄ = 3, ȳ = 10, Sxy = 16, Sxx = 10, Syy = 40 → r = 0,8. */
const MINI = titik([1, 2, 3, 4, 5], [8, 6, 10, 14, 12]);
/* Hubungan lurus dengan residu acak. */
const LURUS = titik([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [48, 55, 52, 63, 60, 70, 74, 71, 82, 85]);
/* Hubungan kuat tetapi melengkung (residu +, −, −, …, +). */
const LENGKUNG = titik(
  [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5],
  [20, 21, 23, 26, 30, 35, 42, 50, 59, 70]
);
/* Tidak ada hubungan linear. */
const ACAK = titik(
  [3, 7, 12, 18, 21, 26, 30, 35, 41, 47],
  [72, 58, 85, 64, 79, 55, 88, 70, 61, 76]
);
/* Negatif sedang. */
const SEDANG = titik(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [4.4, 4.7, 3.9, 4.5, 4.6, 3.8, 4.3, 3.6, 4.2, 3.7]
);

test('tafsirKorelasi: arah dari tanda r, kekuatan dari |r|', () => {
  const t = (r) => {
    const h = E.tafsirKorelasi(r);
    return [h.arah, h.kekuatan];
  };
  assert.deepEqual(t(1), ['positif', 'sempurna']);
  assert.deepEqual(t(-1), ['negatif', 'sempurna']);
  assert.deepEqual(t(0.97), ['positif', 'kuat']);
  assert.deepEqual(t(0.7), ['positif', 'kuat']);
  assert.deepEqual(t(-0.69), ['negatif', 'sedang']);
  assert.deepEqual(t(0.4), ['positif', 'sedang']);
  assert.deepEqual(t(-0.39), ['negatif', 'lemah']);
  assert.deepEqual(t(0.2), ['positif', 'lemah']);
  assert.deepEqual(t(0.19), ['tidak', 'sangatLemah']);
  assert.deepEqual(t(-0.05), ['tidak', 'sangatLemah']);
  assert.deepEqual(t(0), ['tidak', 'sangatLemah']);
  assert.deepEqual(t(null), ['tidak', 'sangatLemah']);
  assert.equal(E.tafsirKorelasi(0.8).label, 'positif kuat');
  assert.equal(E.tafsirKorelasi(-0.59).label, 'negatif sedang');
  assert.equal(E.tafsirKorelasi(0.04).label, 'hampir tidak ada hubungan linear');
  assert.equal(E.tafsirKorelasi(-1).label, 'negatif sempurna');
  /* Label kekuatan untuk opsi & teks. */
  assert.equal(E.LABEL_KEKUATAN_KORELASI.sangatLemah, 'Sangat lemah / hampir tidak ada');
});

test('rincianKorelasi: langkah hitung r tanpa galat pembulatan biner', () => {
  const R = E.rincianKorelasi(MINI);
  assert.equal(R.n, 5);
  assert.equal(R.xBar, 3);
  assert.equal(R.yBar, 10);
  assert.deepEqual(plain(R.baris.map((b) => [b.dx, b.dy, b.dxdy, b.dx2, b.dy2])), [
    [-2, -2, 4, 4, 4],
    [-1, -4, 4, 1, 16],
    [0, 0, 0, 0, 0],
    [1, 4, 4, 1, 16],
    [2, 2, 4, 4, 4],
  ]);
  assert.equal(R.sxy, 16);
  assert.equal(R.sxx, 10);
  assert.equal(R.syy, 40);
  assert.equal(R.r, 0.8);
  /* Rata-rata desimal tetap rapi. */
  const D = E.rincianKorelasi(titik([0.1, 0.2, 0.3], [1, 2, 3]));
  assert.equal(D.xBar, 0.2);
  assert.equal(D.r, 1);
  /* Sama dengan korelasiPearson seksi 33. */
  const P = E.rincianKorelasi(LURUS);
  assert.ok(
    E.hampirSama(
      P.r,
      E.korelasiPearson(
        LURUS.map((p) => p.x),
        LURUS.map((p) => p.y)
      )
    )
  );
  assert.equal(E.rincianKorelasi([{ x: 1, y: 2 }]), null, 'kurang dari dua titik');
  assert.equal(E.rincianKorelasi(titik([2, 2, 2], [1, 2, 3])), null, 'variansi x nol');
});

test('diagnosaKorelasi: tanda, r², kemiringan, lupa akar, di luar [−1, 1]', () => {
  const R = E.rincianKorelasi(MINI);
  assert.equal(E.diagnosaKorelasi(0.8, R), 'benar');
  assert.equal(E.diagnosaKorelasi(0.80001, R), 'benar');
  assert.equal(E.diagnosaKorelasi(0.8004, R), 'benar', 'dibulatkan 3 desimal');
  assert.equal(E.diagnosaKorelasi(-0.8, R), 'tanda');
  assert.equal(E.diagnosaKorelasi(0.64, R), 'r2');
  assert.equal(E.diagnosaKorelasi(1.6, R), 'kemiringan', 'Sxy : Sxx');
  assert.equal(E.diagnosaKorelasi(0.04, R), 'akar', 'Sxy : (Sxx × Syy) tanpa akar');
  assert.equal(E.diagnosaKorelasi(16, R), 'luarRentang');
  assert.equal(E.diagnosaKorelasi(-2, R), 'luarRentang');
  assert.equal(E.diagnosaKorelasi(0.5, R), 'salah');
  assert.equal(E.diagnosaKorelasi(NaN, R), 'salah');
  ['benar', 'tanda', 'r2', 'kemiringan', 'akar', 'luarRentang', 'salah'].forEach((k) => {
    const pesan = E.pesanDiagnosaKorelasi(k, R);
    assert.equal(typeof pesan, 'string');
    assert.ok(pesan.length > 20, k);
  });
  assert.match(E.pesanDiagnosaKorelasi('benar', R), /0,8/);
  assert.match(E.pesanDiagnosaKorelasi('luarRentang', R), /−1/);
});

test('polaResidu: acak untuk data lurus, lengkung untuk data melengkung', () => {
  const regL = E.regresiLinear(LURUS);
  const a = E.polaResidu(LURUS, regL.m, regL.c);
  assert.equal(a.pola, 'acak');
  assert.ok(a.runs >= 4);
  assert.equal(a.tanda.length, LURUS.length);
  const regK = E.regresiLinear(LENGKUNG);
  const k = E.polaResidu(LENGKUNG, regK.m, regK.c);
  assert.equal(k.pola, 'lengkung');
  assert.equal(k.runs, 3);
  assert.deepEqual(plain(k.tanda), [1, 1, -1, -1, -1, -1, -1, -1, 1, 1]);
  /* Urut berdasarkan x walau masukan tidak urut. */
  const acakUrut = LENGKUNG.slice().reverse();
  assert.equal(E.polaResidu(acakUrut, regK.m, regK.c).pola, 'lengkung');
  /* Terlalu sedikit titik → tidak disimpulkan lengkung. */
  const regM = E.regresiLinear(MINI);
  assert.equal(E.polaResidu(MINI, regM.m, regM.c).pola, 'acak');
});

test('keputusanModelLinear: layak, bukan linear, lemah, tidak ada hubungan', () => {
  const k = (pts) => E.keputusanModelLinear(pts).keputusan;
  assert.equal(k(LURUS), 'layak');
  assert.equal(k(LENGKUNG), 'bukanLinear', 'r tinggi tetapi residu berpola');
  assert.equal(k(SEDANG), 'lemah');
  assert.equal(k(ACAK), 'tidakAda');
  const h = E.keputusanModelLinear(LURUS);
  assert.ok(E.hampirSama(h.r2, h.r * h.r));
  assert.equal(h.m, 4);
  assert.equal(h.c, 44);
  assert.equal(h.arah, 'positif');
  assert.equal(h.kekuatan, 'kuat');
  assert.equal(h.pola, 'acak');
  /* Hubungan lengkung bisa punya r LEBIH TINGGI dari hubungan lurus lain. */
  assert.ok(E.keputusanModelLinear(LENGKUNG).r > 0.95);
  assert.equal(E.keputusanModelLinear([{ x: 1, y: 1 }]), null);
  Object.keys(E.LABEL_KEPUTUSAN_LINEAR).forEach((key) =>
    assert.ok(['layak', 'bukanLinear', 'lemah', 'tidakAda'].includes(key))
  );
});

test('korelasiTanpa: pencilan dapat mengubah r secara drastis', () => {
  const dengan = LURUS.concat([{ id: 'out', x: 9, y: 40 }]);
  const rDengan = E.korelasiTanpa(dengan, []);
  const rTanpa = E.korelasiTanpa(dengan, ['out']);
  assert.ok(rDengan < 0.6, 'dengan pencilan r turun');
  assert.ok(rTanpa > 0.96, 'tanpa pencilan r kembali tinggi');
  assert.ok(E.hampirSama(rTanpa, E.rincianKorelasi(LURUS).r));
  assert.equal(
    E.korelasiTanpa(
      dengan,
      dengan.map((p) => p.id)
    ),
    null
  );
});

test('dataDenganKorelasi: data sintetis dengan r persis, deterministik, di sumbu 0–100', () => {
  [-1, -0.9, -0.4, 0, 0.3, 0.8, 1].forEach((r) => {
    const d = E.dataDenganKorelasi(r, 20);
    assert.equal(d.length, 20);
    const rr = E.korelasiPearson(
      d.map((p) => p.x),
      d.map((p) => p.y)
    );
    assert.ok(Math.abs(rr - r) < 1e-6, 'r = ' + r + ' → ' + rr);
    d.forEach((p) => {
      assert.ok(p.x >= 0 && p.x <= 100 && p.y >= 0 && p.y <= 100, 'titik di sumbu');
    });
  });
  assert.deepEqual(plain(E.dataDenganKorelasi(0.5, 12)), plain(E.dataDenganKorelasi(0.5, 12)));
  /* Nilai di luar [−1, 1] dijepit. */
  const j = E.dataDenganKorelasi(1.5, 10);
  assert.ok(
    E.hampirSama(
      E.korelasiPearson(
        j.map((p) => p.x),
        j.map((p) => p.y)
      ),
      1
    )
  );
});

test('penjelajah r: state, atur r menempel step & terjepit', () => {
  const st = E.makeCorrelationExplorerState(0.5);
  assert.equal(st.r, 0.5);
  assert.equal(st.geser, 0);
  E.korAturR(st, 0.537);
  assert.equal(st.r, 0.55, 'menempel kelipatan 0,05');
  E.korAturR(st, 3);
  assert.equal(st.r, 1);
  E.korAturR(st, -7);
  assert.equal(st.r, -1);
  assert.equal(st.geser, 3);
  const html = E.buildCorrelationExplorer('jr', st, {});
  assert.match(html, /id="jr-r"/);
  assert.match(html, /type="range"/);
  assert.match(html, /data-kor-step/);
  assert.match(html, /aria-live="polite"/);
  assert.equal(hitung(html, /class="aso-dot"/g), 24, 'default 24 titik');
});

test('buildRMeter: skala −1…1, zona, penanda, label tafsir', () => {
  const html = E.buildRMeter(0.8, { label: 'Data A' });
  assert.match(html, /role="img"/);
  assert.match(html, /r = 0,8/);
  assert.match(html, /positif kuat/);
  assert.match(html, /Data A/);
  assert.match(html, /left:90%/, 'r = 0,8 → 90% dari kiri');
  assert.ok(hitung(html, /kor-meter__zona/g) >= 5);
  const tanpa = E.buildRMeter(-0.59, { sembunyikanNilai: true });
  assert.doesNotMatch(tanpa, /−0,59/);
  assert.match(E.buildRMeter(-1, {}), /left:0%/);
});

test('buildCorrelationStepTable: kolom langkah, total opsional', () => {
  const tanpaTotal = E.buildCorrelationStepTable(MINI, {});
  assert.match(tanpaTotal, /x − x̄/);
  assert.match(tanpaTotal, /\(x − x̄\)\(y − ȳ\)/);
  assert.match(tanpaTotal, /\(y − ȳ\)²/);
  assert.equal(hitung(tanpaTotal, /<tr>/g), 1 + MINI.length);
  assert.doesNotMatch(tanpaTotal, /aso-tabel__total/);
  assert.match(tanpaTotal, /−4/);
  const denganTotal = E.buildCorrelationStepTable(MINI, { total: true, caption: 'Langkah r' });
  assert.match(denganTotal, /aso-tabel__total/);
  assert.match(denganTotal, /<strong>16<\/strong>/);
  assert.match(denganTotal, /<strong>40<\/strong>/);
  assert.match(denganTotal, /Langkah r/);
});

test('buildResidualPlot: titik residu bertanda, garis nol, garis hubung opsional', () => {
  const reg = E.regresiLinear(LENGKUNG);
  const html = E.buildResidualPlot(LENGKUNG, reg.m, reg.c, {
    xLabel: 'Waktu muat',
    caption: 'Plot residu C',
    hubung: true,
  });
  assert.match(html, /role="img"/);
  assert.match(html, /Plot residu C/);
  assert.match(html, /kor-nol/);
  assert.match(html, /kor-hubung/);
  assert.equal(hitung(html, /kor-rdot--pos/g), 4);
  assert.equal(hitung(html, /kor-rdot--neg/g), 6);
  assert.match(html, /Residu e/);
  assert.doesNotMatch(E.buildResidualPlot(LENGKUNG, reg.m, reg.c, {}), /kor-hubung/);
});

test('lab pencilan: state, toggle, bacaan r dengan & tanpa titik', () => {
  const pts = LURUS.concat([{ id: 'out', x: 9, y: 40, nama: 'Akun uji' }]);
  const st = E.makeOutlierLabState();
  assert.deepEqual(plain(st.mati), []);
  E.korToggleTitik(st, 'out');
  assert.deepEqual(plain(st.mati), ['out']);
  assert.equal(st.ubah, 1);
  E.korToggleTitik(st, 'out');
  assert.deepEqual(plain(st.mati), []);
  E.korToggleTitik(st, 'out');
  const html = E.buildOutlierLab('lp', pts, st, { xLabel: 'Jam', yLabel: 'Skor' });
  assert.match(html, /id="lp"/);
  assert.equal(hitung(html, /<button[^>]*data-kor-titik=/g), pts.length, 'tombol per titik');
  assert.equal(hitung(html, /<circle[^>]*data-kor-titik=/g), pts.length, 'titik dapat diketuk');
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /kor-dot--mati/);
  assert.match(html, /id="lp-baca"/);
  const baca = E.outlierLabBacaHTML(pts, st);
  assert.match(baca, /Semua data/);
  assert.match(baca, /0,57/);
  assert.match(baca, /0,97/);
});

test('buildCorrelationPanel: =CORREL, =RSQ, kode JS korelasi()', () => {
  const html = E.buildCorrelationPanel(MINI, { rentangX: 'A2:A6', rentangY: 'B2:B6' });
  assert.match(html, /=CORREL\(A2:A6;B2:B6\)/);
  assert.match(html, /=RSQ\(B2:B6;A2:A6\)/);
  assert.match(html, /0,8/);
  assert.match(html, /0,64/);
  assert.match(html, /korelasi\(data\)/);
  assert.match(html, /r: 0\.8/);
  assert.match(
    E.buildCorrelationPanel([{ x: 1, y: 1 }], {}),
    /minimal dua titik/,
    'pesan bila data kurang'
  );
});
