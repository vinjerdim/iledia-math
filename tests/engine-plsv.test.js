'use strict';

/*
 * Tes engine seksi 75 — Kalimat terbuka, persamaan & persamaan linear
 * satu variabel (PLSV): membaca kalimat matematika, ciri & jenisnya,
 * nilai kebenaran, substitusi, penyelesaian PLSV, isian berdiagnosa
 * miskonsepsi, opsi pilihan ganda berpengecoh, neraca SVG, Lab Neraca,
 * dan langkah isian yang memakai pemeriksa seksi 75.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

function arr(x) {
  return JSON.parse(JSON.stringify(x));
}

test('parseKalimatMtk: ruas, relasi, pangkat, dan perkalian bilangan', () => {
  assert.deepEqual(arr(E.parseKalimatMtk('2x + 3 = 11')), {
    kiri: [
      { koef: 2, variabel: 'x', pangkat: 1 },
      { koef: 3, variabel: '', pangkat: 0 },
    ],
    rel: '=',
    kanan: [{ koef: 11, variabel: '', pangkat: 0 }],
  });
  const p = arr(E.parseKalimatMtk('x² − 4 = 5'));
  assert.deepEqual(p.kiri[0], { koef: 1, variabel: 'x', pangkat: 2 });
  assert.equal(p.kiri[1].koef, -4);
  assert.equal(arr(E.parseKalimatMtk('a^2 = 9')).kiri[0].pangkat, 2);
  assert.equal(E.parseKalimatMtk('3 × 4 = 12').kiri[0].koef, 12);
  assert.equal(E.parseKalimatMtk('2 * 6 = 12').kiri[0].teks, '2 × 6');
  assert.equal(E.parseKalimatMtk('−n + 7 > 2').kiri[0].koef, -1);
  assert.equal(E.parseKalimatMtk('y <= 4').rel, '≤');
  assert.equal(E.parseKalimatMtk('y >= 4').rel, '≥');
  assert.equal(E.parseKalimatMtk('p != 4').rel, '≠');
  const b = arr(E.parseKalimatMtk('4x − 1'));
  assert.equal(b.rel, null);
  assert.equal(b.kanan, null);
  /* huruf kapital dibaca huruf kecil */
  assert.equal(E.parseKalimatMtk('3X = 6').kiri[0].variabel, 'x');
  ['', '=', 'x = ', '= 4', '2x + = 5', 'x = 3 = 3', 'x y = 2', '2x3 = 6', '5% = 1'].forEach((s) =>
    assert.equal(E.parseKalimatMtk(s), null, JSON.stringify(s))
  );
});

test('rapikanKalimatMtk: minus tipografis, pangkat, perkalian, relasi', () => {
  assert.equal(E.rapikanKalimatMtk('2x+3=11'), '2x + 3 = 11');
  assert.equal(E.rapikanKalimatMtk('-x+7>2'), '−x + 7 > 2');
  assert.equal(E.rapikanKalimatMtk('x^2-4=5'), 'x² − 4 = 5');
  assert.equal(E.rapikanKalimatMtk('2*6=12'), '2 × 6 = 12');
  assert.equal(E.rapikanKalimatMtk('1y<=4'), 'y ≤ 4');
  assert.equal(E.rapikanKalimatMtk('4x-1'), '4x − 1');
  assert.equal(E.rapikanKalimatMtk('???'), '???');
});

test('ciriKalimatMtk & jenisKalimatMtk: pernyataan → kalimat terbuka → persamaan → PLSV', () => {
  const c = arr(E.ciriKalimatMtk('2a + b = 10'));
  assert.deepEqual(c.variabel, ['a', 'b']);
  assert.equal(c.pangkat, 1);
  assert.equal(c.rel, '=');
  assert.equal(E.ciriKalimatMtk('x² − 4 = 5').pangkat, 2);
  assert.equal(E.ciriKalimatMtk('3 + 4 = 7').pangkat, 0);
  const jenis = {
    '3 + 4 = 7': 'pernyataan',
    '15 − 6 = 8': 'pernyataan',
    '2 × 6 > 10': 'pernyataan',
    'x + 3 > 7': 'kalimatTerbuka',
    'n ≠ 4': 'kalimatTerbuka',
    'x + y = 10': 'persamaan',
    'x² = 9': 'persamaan',
    'x + 1 = x + 2': 'persamaan',
    'x + 3 = 7': 'plsv',
    '2x + 1 = x + 5': 'plsv',
    'm = 6': 'plsv',
    '4x − 1': 'bentuk',
    12: 'bentuk',
  };
  Object.entries(jenis).forEach(([k, v]) => assert.equal(E.jenisKalimatMtk(k), v, k));
  assert.equal(E.jenisKalimatMtk('x ='), null);
});

test('nilai kebenaran & substitusi', () => {
  assert.equal(E.kebenaranKalimatMtk('3 + 4 = 7'), 'benar');
  assert.equal(E.kebenaranKalimatMtk('15 − 6 = 8'), 'salah');
  assert.equal(E.kebenaranKalimatMtk('2 × 6 > 10'), 'benar');
  assert.equal(E.kebenaranKalimatMtk('x + 3 = 7'), 'terbuka');
  assert.equal(E.kebenaranKalimatMtk('4x − 1'), null);
  assert.equal(E.nilaiKalimatMtk('x + 3 = 7', 4), true);
  assert.equal(E.nilaiKalimatMtk('x + 3 = 7', 5), false);
  assert.equal(E.nilaiKalimatMtk('2x + 1 = x + 5', 4), true);
  assert.equal(E.nilaiKalimatMtk('x² = 9', -3), true);
  assert.equal(E.nilaiKalimatMtk('a + b = 10', { a: 3, b: 7 }), true);
  assert.equal(E.nilaiKalimatMtk('y ≤ 4', 4), true);
  assert.equal(E.nilaiKalimatMtk('y < 4', 4), false);
  assert.equal(E.nilaiKalimatMtk('y ≠ 4', 4), false);
  assert.equal(E.nilaiKalimatMtk('4x − 1', 2), null);
  const r = arr(E.ruasKalimatMtk('2x + 1 = x + 5', 3));
  assert.deepEqual(r, { kiri: 7, kanan: 8 });
});

test('penyelesaianPlsv: ax + b = cx + d', () => {
  assert.equal(E.penyelesaianPlsv('x + 3 = 7'), 4);
  assert.equal(E.penyelesaianPlsv('2x + 1 = 9'), 4);
  assert.equal(E.penyelesaianPlsv('3x = x + 6'), 3);
  assert.equal(E.penyelesaianPlsv('5 = n − 2'), 7);
  assert.equal(E.penyelesaianPlsv('−x + 2 = 5'), -3);
  assert.equal(E.penyelesaianPlsv('x + y = 10'), null);
  assert.equal(E.penyelesaianPlsv('x² = 9'), null);
  assert.equal(E.penyelesaianPlsv('x + 3 > 7'), null);
});

test('nilaiSoalKalimat & jawabSoalKalimat', () => {
  assert.equal(E.nilaiSoalKalimat({ kalimat: 'x + y = 4', minta: 'jenis' }), 'persamaan');
  assert.equal(E.nilaiSoalKalimat({ kalimat: '9 − 5 = 3', minta: 'kebenaran' }), 'salah');
  assert.equal(E.nilaiSoalKalimat({ kalimat: '2p − 3 = 7', minta: 'penyelesaian' }), 5);
  assert.equal(E.nilaiSoalKalimat({ kalimat: '2p-3=7', minta: 'kalimat' }), '2p − 3 = 7');
  assert.equal(E.jawabSoalKalimat({ cek: { kalimat: 'x + 5 = 2', minta: 'penyelesaian' } }), '−3');
  assert.equal(E.jawabSoalKalimat({ cek: { kalimat: '3k = 12', minta: 'kalimat' } }), '3k = 12');
  assert.equal(
    E.labelJawabKalimat({ cek: { kalimat: 'x = 2', minta: 'jenis' } }),
    E.OPSI_JENIS_KALIMAT.find((o) => o.id === 'plsv').label
  );
});

function cek(c, isian) {
  return E.periksaSoalKalimat(isian, { cek: c });
}

test('periksaSoalKalimat: penyelesaian — tanda, ruas kanan, operasi terbalik, belum dibagi', () => {
  const c = { kalimat: 'x + 3 = 7', minta: 'penyelesaian' };
  assert.equal(cek(c, '4').benar, true);
  assert.equal(cek(c, 'x = 4').benar, true);
  assert.equal(cek(c, 'X=4').benar, true);
  assert.equal(cek(c, '−4').kode, 'tandaHilang');
  assert.equal(cek(c, '7').kode, 'ruasKanan');
  assert.equal(cek(c, '10').kode, 'operasiTerbalik');
  assert.equal(cek(c, '6').kode, 'bukanPenyelesaian');
  /* setiap jawaban salah disertai cek substitusi */
  assert.match(cek(c, '6').pesan, /x = 6.*9.*7/);
  assert.equal(cek(c, '').kode, 'kosong');
  assert.equal(cek(c, 'empat').kode, 'format');
  assert.equal(cek(c, 'y = 4').kode, 'hurufLain');
  const d = { kalimat: '2x + 1 = 9', minta: 'penyelesaian' };
  assert.equal(cek(d, '4').benar, true);
  assert.equal(cek(d, '8').kode, 'belumBagi');
  assert.equal(cek(d, '5').kode, 'operasiTerbalik');
  const e = { kalimat: '3x = x + 6', minta: 'penyelesaian' };
  assert.equal(cek(e, '3').benar, true);
  assert.equal(cek(e, '2').kode, 'bukanPenyelesaian');
  for (const k of ['tandaHilang', 'ruasKanan', 'operasiTerbalik', 'belumBagi', 'hurufLain']) {
    assert.ok(E.PESAN_KALIMAT[k], k + ': ada pesan');
  }
});

test('periksaSoalKalimat: menulis kalimat — tanda =, pertidaksamaan, langsung jawab, tanda', () => {
  const c = { kalimat: '2x + 3 = 11', minta: 'kalimat' };
  assert.equal(cek(c, '2x + 3 = 11').benar, true);
  assert.equal(cek(c, '3 + 2x = 11').benar, true);
  assert.equal(cek(c, '11 = 2x + 3').benar, true);
  assert.equal(cek(c, '2x+3').kode, 'tanpaSamaDengan');
  assert.equal(cek(c, '2x + 3 > 11').kode, 'pertidaksamaan');
  assert.equal(cek(c, 'x = 4').kode, 'langsungJawab');
  assert.equal(cek(c, '2x − 3 = 11').kode, 'tandaHilang');
  assert.equal(cek(c, '3x + 2 = 11').kode, 'tukarKoefKonst');
  assert.equal(cek(c, '2y + 3 = 11').kode, 'hurufLain');
  assert.equal(cek(c, '2x + 3 = 12').kode, 'salah');
  assert.equal(cek(c, '2x + = 11').kode, 'format');
  assert.equal(cek(c, '').kode, 'kosong');
});

test('periksaSoalKalimat: jenis & kebenaran — diagnosa miskonsepsi', () => {
  const j = (kal, pilih) => cek({ kalimat: kal, minta: 'jenis' }, pilih).kode;
  assert.equal(j('15 − 6 = 8', 'pernyataan'), 'benar');
  assert.equal(j('15 − 6 = 8', 'kalimatTerbuka'), 'tanpaVariabel');
  assert.equal(j('x + 3 = 7', 'pernyataan'), 'adaVariabel');
  assert.equal(j('4x − 1', 'plsv'), 'tanpaRelasi');
  assert.equal(j('x + 3 = 7', 'bentuk'), 'adaRelasi');
  assert.equal(j('x + 3 > 7', 'plsv'), 'bukanSamaDengan');
  assert.equal(j('x + y = 10', 'plsv'), 'duaVariabel');
  assert.equal(j('x² = 9', 'plsv'), 'pangkatDua');
  assert.equal(j('x + 3 = 7', 'persamaan'), 'sudahPlsv');
  assert.equal(j('x + y = 10', 'kalimatTerbuka'), 'adaSamaDengan');
  assert.equal(j('x + y = 10', ''), 'kosong');
  const k = (kal, pilih) => cek({ kalimat: kal, minta: 'kebenaran' }, pilih).kode;
  assert.equal(k('x + 3 = 7', 'terbuka'), 'benar');
  assert.equal(k('x + 3 = 7', 'benar'), 'terbukaDinilai');
  assert.equal(k('15 − 6 = 8', 'terbuka'), 'tanpaVariabel');
  assert.equal(k('15 − 6 = 8', 'benar'), 'hitungUlang');
  assert.match(cek({ kalimat: '15 − 6 = 8', minta: 'kebenaran' }, 'benar').pesan, /9.*8/);
});

test('kelompokKalimatMtk: skema kebenaran, persamaan, dan plsv', () => {
  assert.equal(E.kelompokKalimatMtk('3 + 4 = 7', 'kebenaran'), 'benar');
  assert.equal(E.kelompokKalimatMtk('a − 2 = 5', 'kebenaran'), 'terbuka');
  assert.equal(E.kelompokKalimatMtk('x + 1 = 4', 'persamaan'), 'persamaan');
  assert.equal(E.kelompokKalimatMtk('x + y = 4', 'persamaan'), 'persamaan');
  assert.equal(E.kelompokKalimatMtk('x + 1 < 4', 'persamaan'), 'kalimatTerbuka');
  assert.equal(E.kelompokKalimatMtk('3x + 1', 'persamaan'), 'bentuk');
  assert.equal(E.kelompokKalimatMtk('6 = 6', 'persamaan'), 'pernyataan');
  assert.equal(E.kelompokKalimatMtk('x + 1 = 4', 'plsv'), 'plsv');
  assert.equal(E.kelompokKalimatMtk('a + b = 4', 'plsv'), 'duaVariabel');
  assert.equal(E.kelompokKalimatMtk('a² = 4', 'plsv'), 'pangkatDua');
  assert.equal(E.kelompokKalimatMtk('a > 4', 'plsv'), 'bukanPersamaan');
  assert.equal(E.kelompokKalimatMtk('a > 4', 'jenis'), 'kalimatTerbuka');
});

test('opsiSoalKalimat: kunci + pengecoh berdiagnosa, label unik', () => {
  const cases = [
    [{ kalimat: 'x + 3 = 7', minta: 'penyelesaian' }, 4],
    [{ kalimat: '2x + 1 = 9', minta: 'penyelesaian' }, 4],
    [{ kalimat: '3x = x + 6', minta: 'penyelesaian' }, 4],
    [{ kalimat: '2x + 3 = 11', minta: 'kalimat' }, 4],
    [{ kalimat: 'n − 5 = 12', minta: 'kalimat' }, 4],
    [{ kalimat: '4k = 20', minta: 'kalimat' }, 4],
    [{ kalimat: 'x + y = 10', minta: 'jenis' }, 5],
    [{ kalimat: '15 − 6 = 8', minta: 'jenis' }, 5],
    [{ kalimat: '15 − 6 = 8', minta: 'kebenaran' }, 3],
  ];
  cases.forEach(([c, min]) => {
    const o = arr(E.opsiSoalKalimat({ cek: c }));
    const n = JSON.stringify(c);
    assert.ok(o.length >= min, n + ': minimal ' + min + ' opsi');
    assert.equal(o[0].id, 'baku', n);
    assert.equal(new Set(o.map((x) => x.label)).size, o.length, n + ': label unik');
    assert.equal(new Set(o.map((x) => x.id)).size, o.length, n + ': id unik');
    o.forEach((x) => assert.ok(x.umpan, n + ': umpan ' + x.id));
    assert.equal(o[0].label, E.labelJawabKalimat({ cek: c }), n + ': label kunci');
  });
  const p = arr(E.opsiSoalKalimat({ cek: cases[0][0] }));
  assert.ok(p.some((x) => x.id === 'ruasKanan' && x.label === '7'));
  assert.ok(p.some((x) => x.id === 'operasiTerbalik' && x.label === '10'));
  const k = arr(E.opsiSoalKalimat({ cek: cases[3][0] }));
  assert.ok(k.some((x) => x.id === 'langsungJawab' && x.label === 'x = 4'));
  assert.ok(k.some((x) => x.id === 'tanpaSamaDengan' && x.label === '2x + 3'));
});

test('buildKalimatWarna: variabel, relasi, bilangan ditandai & aman', () => {
  const h = E.buildKalimatWarna('2x + 3 = 11');
  assert.match(h, /kalimat-var[^>]*>x</);
  assert.match(h, /kalimat-rel[^>]*>=</);
  assert.match(h, /kalimat-bil[^>]*>11</);
  assert.match(E.buildKalimatWarna('x^2-1'), /x<\/span><sup>2<\/sup>|x²/);
  assert.match(E.buildKalimatWarna('-x'), /−/);
  assert.doesNotMatch(E.buildKalimatWarna('<b>'), /<b>/);
});

test('neraca: kalimat dari model, berat ruas, SVG miring/seimbang', () => {
  assert.equal(E.kalimatDariNeraca({ x: 2, lepas: 1 }, { lepas: 9 }), '2x + 1 = 9');
  assert.equal(E.kalimatDariNeraca({ x: 3 }, { x: 1, lepas: 6 }), '3x = x + 6');
  assert.equal(E.beratRuasNeraca({ x: 2, lepas: 1 }, 4), 9);
  assert.equal(E.arahNeraca({ x: 2, lepas: 1 }, { lepas: 9 }, 4), 'seimbang');
  assert.equal(E.arahNeraca({ x: 2, lepas: 1 }, { lepas: 9 }, 5), 'kiriBerat');
  assert.equal(E.arahNeraca({ x: 2, lepas: 1 }, { lepas: 9 }, 1), 'kananBerat');
  const s = E.buildNeraca({ x: 2, lepas: 1 }, { lepas: 9 }, 4);
  assert.match(s, /^<svg[^>]+role="img"/);
  assert.match(s, /aria-label="[^"]*seimbang/);
  assert.equal((s.match(/class="neraca-kotak"/g) || []).length, 2);
  assert.equal((s.match(/class="neraca-beban"/g) || []).length, 10);
  assert.match(
    E.buildNeraca({ x: 2, lepas: 1 }, { lepas: 9 }, 5),
    /aria-label="[^"]*kiri lebih berat/
  );
  assert.match(E.buildNeraca({ x: 1 }, { lepas: 3 }, null), /aria-label="[^"]*seimbang/);
});

const CFG = {
  huruf: 'x',
  batas: 8,
  situasi: [
    {
      id: 'a',
      judul: 'Teh',
      cerita: 'Kotak teh dan 2 anak timbangan seimbang dengan 5.',
      kiri: { x: 1, lepas: 2 },
      kanan: { lepas: 5 },
    },
    {
      id: 'b',
      judul: 'Gula',
      cerita: 'Dua kantong gula.',
      kiri: { x: 2, lepas: 1 },
      kanan: { lepas: 9 },
    },
  ],
};

test('Lab Neraca: tulis kalimat, uji nilai, catat salah/benar, terkunci saat seimbang', () => {
  const st = {};
  E.ensureLabNeraca(st, CFG);
  assert.equal(st.aktif, 'a');
  assert.equal(st.x, 0);
  assert.equal(E.labNeracaLengkap(st, CFG), false);
  /* uji sebelum menulis kalimat ditolak */
  assert.equal(E.ujiLabNeraca(st, CFG).kode, 'belumKalimat');
  assert.equal(E.ubahLabNeraca(st, CFG, 1), false, 'stepper terkunci sebelum kalimat ditulis');
  assert.equal(E.tulisKalimatLabNeraca(st, CFG, 'x + 2').kode, 'tanpaSamaDengan');
  assert.equal(st.catat.a.attempts, 1);
  assert.equal(E.tulisKalimatLabNeraca(st, CFG, '').kode, 'kosong');
  assert.equal(st.catat.a.attempts, 1);
  assert.equal(E.tulisKalimatLabNeraca(st, CFG, '2 + x = 5').benar, true);
  assert.equal(st.catat.a.kalimat, 'x + 2 = 5');
  /* uji nilai */
  E.ubahLabNeraca(st, CFG, 1);
  E.ubahLabNeraca(st, CFG, 1);
  const r1 = E.ujiLabNeraca(st, CFG);
  assert.equal(r1.kode, 'kananBerat');
  assert.match(r1.pesan, /SALAH/);
  E.ubahLabNeraca(st, CFG, 1);
  E.ubahLabNeraca(st, CFG, 1);
  assert.equal(E.ujiLabNeraca(st, CFG).kode, 'kiriBerat');
  E.ubahLabNeraca(st, CFG, -1);
  const r3 = E.ujiLabNeraca(st, CFG);
  assert.equal(r3.kode, 'seimbang');
  assert.equal(r3.benar, true);
  assert.deepEqual(arr(st.catat.a.uji), [
    { x: 2, benar: false },
    { x: 4, benar: false },
    { x: 3, benar: true },
  ]);
  assert.equal(st.catat.a.seimbang, true);
  /* setelah seimbang, nilai terkunci */
  assert.equal(E.ubahLabNeraca(st, CFG, 1), false);
  assert.equal(st.x, 3);
  /* uji nilai yang sama tidak dicatat dua kali */
  E.pilihSituasiLabNeraca(st, CFG, 'b');
  assert.equal(st.aktif, 'b');
  assert.equal(st.x, 0);
  E.tulisKalimatLabNeraca(st, CFG, '2x + 1 = 9');
  E.ujiLabNeraca(st, CFG);
  E.ujiLabNeraca(st, CFG);
  assert.equal(st.catat.b.uji.length, 1);
  for (let i = 0; i < 20; i++) E.ubahLabNeraca(st, CFG, 1);
  assert.equal(st.x, 8);
  for (let i = 0; i < 20; i++) E.ubahLabNeraca(st, CFG, -1);
  assert.equal(st.x, 0);
  for (let i = 0; i < 4; i++) E.ubahLabNeraca(st, CFG, 1);
  E.ujiLabNeraca(st, CFG);
  assert.equal(E.labNeracaLengkap(st, CFG), true);
  /* kembali ke situasi selesai → nilai = penyelesaian */
  E.pilihSituasiLabNeraca(st, CFG, 'a');
  assert.equal(st.x, 3);
  /* state rusak → disetel ulang */
  const rusak = { aktif: 'zz', x: 'a', catat: null };
  E.ensureLabNeraca(rusak, CFG);
  assert.equal(rusak.aktif, 'a');
  assert.equal(rusak.x, 0);
  assert.deepEqual(Object.keys(rusak.catat).sort(), ['a', 'b']);
});

test('buildLabNeraca: tab situasi, isian kalimat, stepper, tabel pengamatan', () => {
  const st = {};
  E.ensureLabNeraca(st, CFG);
  const h = E.buildLabNeraca('ln', st, CFG);
  assert.match(h, /data-situasi="a"/);
  assert.match(h, /id="lnKalimatInput"/);
  assert.match(h, /<svg/);
  assert.match(h, /<table/);
  assert.doesNotMatch(h, /id="lnUji"/);
  E.tulisKalimatLabNeraca(st, CFG, 'x + 2 = 5');
  const h2 = E.buildLabNeraca('ln', st, CFG);
  assert.match(h2, /id="lnUji"/);
  assert.match(h2, /id="lnNilaiDec"/);
  assert.doesNotMatch(h2, /id="lnKalimatInput"/);
  const t = E.buildTabelLabNeraca(st, CFG);
  assert.match(t, /x \+ 2 = 5|kalimat-var/);
});

test('langkah isian memakai pemeriksa seksi 75', () => {
  const step = { label: 'Nilai x?', cek: { kalimat: 'x + 3 = 7', minta: 'penyelesaian' } };
  const st = E.makeCekStep();
  assert.equal(E.periksaLangkahUnsur(st, step, '', E.periksaSoalKalimat).kode, 'kosong');
  assert.equal(st.attempts, 0);
  assert.equal(E.periksaLangkahUnsur(st, step, '7', E.periksaSoalKalimat).kode, 'ruasKanan');
  assert.equal(st.attempts, 1);
  assert.equal(E.periksaLangkahUnsur(st, step, 'x = 4', E.periksaSoalKalimat).benar, true);
  assert.match(E.buildLangkahUnsur('lk', st, step, 1, E.tampilIsianKalimat), /✓ x = 4/);
  /* bawaan seksi 74 tetap berjalan tanpa argumen tambahan */
  const s74 = { label: 'Koef?', cek: { bentuk: '−3x + 4', minta: 'koefisien', variabel: 'x' } };
  const st74 = E.makeCekStep();
  assert.equal(E.periksaLangkahUnsur(st74, s74, '3').kode, 'tandaHilang');
});
