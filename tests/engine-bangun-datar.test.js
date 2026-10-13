'use strict';

/*
 * Tes engine seksi 73 — Keliling & luas bangun datar (segitiga, persegi,
 * persegi panjang, jajargenjang, trapesium, belah ketupat,
 * layang-layang): titik sudut & panjang sisi, keliling, luas (dicocokkan
 * dengan rumus shoelace), soal keliling/luas/ukuran/rumus, isian
 * berdiagnosa miskonsepsi, opsi berpengecoh, gambar SVG, gambar
 * potong-susun, dan Lab Bangun (mode petak & potong).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

const JENIS = [
  'segitiga',
  'persegi',
  'persegiPanjang',
  'jajargenjang',
  'trapesium',
  'belahKetupat',
  'layangLayang',
];

const CONTOH = {
  segitiga: { a: 8, t: 3, g: 4 },
  persegi: { s: 6 },
  persegiPanjang: { p: 9, l: 4 },
  jajargenjang: { a: 6, t: 4, g: 3 },
  trapesium: { a: 12, b: 6, t: 4, g: 3 },
  belahKetupat: { d1: 6, d2: 8 },
  layangLayang: { d1: 16, d2: 21, y: 6 },
};

function shoelace(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
}

function soal(jenis, ukuran, minta, extra) {
  return { cek: Object.assign({ jenis, ukuran, minta }, extra || {}), satuan: 'cm' };
}

test('BANGUN_DATAR: tujuh bangun dengan nama, ukuran, dan rumus', () => {
  assert.deepEqual(Object.keys(E.BANGUN_DATAR).sort(), JENIS.slice().sort());
  JENIS.forEach((j) => {
    const B = E.BANGUN_DATAR[j];
    assert.ok(B.nama && B.rumusKeliling, j + ': nama & rumus keliling');
    assert.ok(E.RUMUS_LUAS[B.rumusLuas], j + ': rumus luas dikenal');
    assert.ok(Array.isArray(B.ukuran) && B.ukuran.length >= 1, j + ': ukuran');
    B.ukuran.forEach((k) => assert.ok(B.namaUkuran[k], j + '.' + k + ': nama ukuran'));
  });
  assert.equal(E.BANGUN_DATAR.belahKetupat.rumusLuas, E.BANGUN_DATAR.layangLayang.rumusLuas);
});

test('titikBangun & sisiBangun: titik sudut dan panjang sisi', () => {
  assert.deepEqual(Array.from(E.sisiBangun('persegiPanjang', { p: 9, l: 4 })), [9, 4, 9, 4]);
  assert.deepEqual(Array.from(E.sisiBangun('segitiga', CONTOH.segitiga)), [8, 5, 5]);
  assert.deepEqual(Array.from(E.sisiBangun('jajargenjang', CONTOH.jajargenjang)), [6, 5, 6, 5]);
  assert.deepEqual(Array.from(E.sisiBangun('trapesium', CONTOH.trapesium)), [12, 5, 6, 5]);
  assert.deepEqual(Array.from(E.sisiBangun('belahKetupat', CONTOH.belahKetupat)), [5, 5, 5, 5]);
  assert.deepEqual(Array.from(E.sisiBangun('layangLayang', CONTOH.layangLayang)), [17, 10, 10, 17]);
  assert.equal(E.titikBangun('persegi', { s: 0 }), null);
});

test('kelilingBangun & luasBangun: nilai baku dan cocok dengan rumus shoelace', () => {
  const harap = {
    segitiga: [18, 12],
    persegi: [24, 36],
    persegiPanjang: [26, 36],
    jajargenjang: [22, 24],
    trapesium: [28, 36],
    belahKetupat: [20, 24],
    layangLayang: [54, 168],
  };
  JENIS.forEach((j) => {
    const u = CONTOH[j];
    assert.equal(E.kelilingBangun(j, u), harap[j][0], j + ': keliling');
    assert.equal(E.luasBangun(j, u), harap[j][1], j + ': luas');
    assert.ok(Math.abs(shoelace(E.titikBangun(j, u)) - E.luasBangun(j, u)) < 1e-9, j);
  });
  /* rumus luas cocok dengan shoelace untuk banyak ukuran */
  for (let a = 2; a <= 9; a++) {
    for (let t = 1; t <= 6; t++) {
      [
        ['segitiga', { a, t, g: 1 }],
        ['jajargenjang', { a, t, g: 2 }],
        ['trapesium', { a, b: Math.max(1, a - 2), t, g: 1 }],
        ['belahKetupat', { d1: a, d2: t + 1 }],
        ['layangLayang', { d1: a, d2: t + 2, y: 1 }],
      ].forEach(([j, u]) => {
        assert.ok(Math.abs(shoelace(E.titikBangun(j, u)) - E.luasBangun(j, u)) < 1e-9, j);
      });
    }
  }
  assert.ok(Number.isNaN(E.luasBangun('persegi', { s: -2 })));
  assert.ok(Number.isNaN(E.kelilingBangun('tidakAda', { s: 2 })));
  assert.equal(E.kelilingBangun('jajargenjang', { a: 4, t: 2, g: 1 }), 12.47);
});

test('lengkapiUkuranBangun: geser & letak diagonal diisi dan dibatasi', () => {
  assert.equal(E.lengkapiUkuranBangun('jajargenjang', { a: 5, t: 3 }).g, 2);
  assert.equal(E.lengkapiUkuranBangun('jajargenjang', { a: 1, t: 3, g: 4 }).g, 1);
  assert.equal(E.lengkapiUkuranBangun('segitiga', { a: 7, t: 3 }).g, 3);
  assert.equal(E.lengkapiUkuranBangun('trapesium', { a: 8, b: 4, t: 3 }).g, 2);
  assert.equal(E.lengkapiUkuranBangun('trapesium', { a: 3, b: 5, t: 3 }).g, 0);
  assert.equal(E.lengkapiUkuranBangun('layangLayang', { d1: 6, d2: 9 }).y, 3);
  assert.equal(E.lengkapiUkuranBangun('layangLayang', { d1: 6, d2: 4, y: 9 }).y, 3);
  assert.deepEqual(Object.assign({}, E.lengkapiUkuranBangun('persegiPanjang', { p: 3, l: 2 })), {
    p: 3,
    l: 2,
  });
});

test('nilaiSoalBangun, diketahuiSoalBangun & jawabSoalBangun', () => {
  assert.equal(E.nilaiSoalBangun(soal('segitiga', CONTOH.segitiga, 'luas').cek), 12);
  assert.equal(
    E.nilaiSoalBangun({
      jenis: 'trapesium',
      ukuran: CONTOH.trapesium,
      minta: 'ukuran',
      cari: 't',
      dari: 'luas',
    }),
    4
  );
  assert.equal(
    E.diketahuiSoalBangun({
      jenis: 'trapesium',
      ukuran: CONTOH.trapesium,
      minta: 'ukuran',
      cari: 't',
      dari: 'luas',
    }),
    36
  );
  assert.equal(E.jawabSoalBangun(soal('segitiga', { a: 7, t: 5, g: 2 }, 'luas')), '17,5');
  assert.equal(E.jawabSoalBangun(soal('persegi', { s: 40 }, 'luas')), '1.600');
  assert.equal(
    E.jawabSoalBangun({ cek: { jenis: 'layangLayang', minta: 'rumus' } }),
    'setengahDiagonal'
  );
});

test('periksaSoalBangun: benar, desimal berkoma, dan isian tak terbaca', () => {
  const s = soal('segitiga', { a: 7, t: 5, g: 2 }, 'luas');
  assert.equal(E.periksaSoalBangun('17,5', s).benar, true);
  assert.equal(E.periksaSoalBangun(' 17,5 ', s).kode, 'benar');
  assert.equal(E.periksaSoalBangun('', s).kode, 'kosong');
  assert.equal(E.periksaSoalBangun('17.5', s).kode, 'format');
  assert.equal(E.periksaSoalBangun('tujuh', s).kode, 'format');
  assert.equal(E.periksaSoalBangun('999', s).kode, 'salah');
  const r = { cek: { jenis: 'jajargenjang', minta: 'rumus' } };
  assert.equal(E.periksaSoalBangun('alasTinggi', r).benar, true);
  assert.equal(E.periksaSoalBangun('setengahAlasTinggi', r).kode, 'salahRumus');
});

test('periksaSoalBangun: miskonsepsi luas dikenali', () => {
  const kode = (j, u, isian) => E.periksaSoalBangun(isian, soal(j, u, 'luas')).kode;
  assert.equal(kode('persegiPanjang', { p: 9, l: 4 }, '26'), 'tertukarKeliling');
  assert.equal(kode('persegiPanjang', { p: 9, l: 4 }, '13'), 'tambahBukanKali');
  assert.equal(kode('persegi', { s: 6 }, '12'), 'kaliDua');
  assert.equal(kode('segitiga', CONTOH.segitiga, '24'), 'lupaSetengah');
  assert.equal(kode('segitiga', CONTOH.segitiga, '20'), 'sisiMiring');
  assert.equal(kode('jajargenjang', CONTOH.jajargenjang, '30'), 'sisiMiring');
  assert.equal(kode('jajargenjang', CONTOH.jajargenjang, '12'), 'tambahSetengah');
  assert.equal(kode('trapesium', CONTOH.trapesium, '72'), 'lupaSetengah');
  assert.equal(kode('trapesium', CONTOH.trapesium, '48'), 'satuSisiSejajar');
  assert.equal(kode('belahKetupat', CONTOH.belahKetupat, '48'), 'lupaSetengah');
  assert.equal(kode('belahKetupat', CONTOH.belahKetupat, '25'), 'sisiKaliSisi');
  assert.equal(kode('layangLayang', CONTOH.layangLayang, '336'), 'lupaSetengah');
  assert.equal(kode('layangLayang', CONTOH.layangLayang, '170'), 'sisiKaliSisi');
});

test('periksaSoalBangun: miskonsepsi keliling & ukuran dikenali', () => {
  const kode = (j, u, isian) => E.periksaSoalBangun(isian, soal(j, u, 'keliling')).kode;
  assert.equal(kode('persegiPanjang', { p: 9, l: 4 }, '36'), 'tertukarLuas');
  assert.equal(kode('persegiPanjang', { p: 9, l: 4 }, '13'), 'kelilingSetengah');
  assert.equal(kode('persegi', { s: 6 }, '12'), 'kelilingSetengah');
  assert.equal(kode('jajargenjang', CONTOH.jajargenjang, '20'), 'tinggiBukanSisi');
  assert.equal(kode('trapesium', CONTOH.trapesium, '26'), 'tinggiBukanSisi');
  assert.equal(kode('belahKetupat', CONTOH.belahKetupat, '28'), 'diagonalBukanSisi');
  assert.equal(kode('layangLayang', CONTOH.layangLayang, '27'), 'kelilingSetengah');

  const uk = (j, u, cari, dari, isian) =>
    E.periksaSoalBangun(isian, soal(j, u, 'ukuran', { cari, dari })).kode;
  assert.equal(uk('persegiPanjang', { p: 8, l: 6 }, 'l', 'luas', '6'), 'benar');
  assert.equal(uk('persegiPanjang', { p: 8, l: 6 }, 'l', 'luas', '40'), 'kurangBukanBagi');
  assert.equal(uk('segitiga', { a: 8, t: 6, g: 4 }, 't', 'luas', '3'), 'lupaKaliDua');
  assert.equal(uk('persegi', { s: 7 }, 's', 'luas', '24,5'), 'bagiDuaBukanAkar');
  assert.equal(uk('persegiPanjang', { p: 9, l: 6 }, 'l', 'keliling', '12'), 'lupaBagiDua');
  assert.equal(uk('persegi', { s: 7 }, 's', 'keliling', '14'), 'bagiDuaBukanEmpat');
});

test('opsiSoalBangun: kunci + pengecoh berdiagnosa, label unik, minimal 4 opsi', () => {
  const daftar = [];
  JENIS.forEach((j) => {
    daftar.push(soal(j, CONTOH[j], 'luas'), soal(j, CONTOH[j], 'keliling'));
    daftar.push({ cek: { jenis: j, minta: 'rumus' } });
  });
  daftar.push(soal('persegiPanjang', { p: 8, l: 6 }, 'ukuran', { cari: 'l', dari: 'luas' }));
  daftar.forEach((s) => {
    const opsi = E.opsiSoalBangun(s);
    const nama = s.cek.jenis + '.' + s.cek.minta;
    assert.ok(opsi.length >= 4, nama + ': minimal 4 opsi');
    assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, nama + ': label unik');
    assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length, nama + ': id unik');
    assert.equal(opsi[0].id, 'baku');
    opsi.forEach((o) => assert.ok(o.umpan, nama + '.' + o.id + ': umpan'));
  });
  const luas = E.opsiSoalBangun(soal('segitiga', CONTOH.segitiga, 'luas'));
  assert.equal(luas[0].label, '12 cm²');
  assert.ok(luas.some((o) => o.id === 'lupaSetengah' && o.label === '24 cm²'));
  assert.ok(
    luas.some((o) => o.id === 'satuan' && o.label === '12 cm'),
    'pengecoh satuan'
  );
  const kel = E.opsiSoalBangun(soal('persegi', { s: 6 }, 'keliling'));
  assert.equal(kel[0].label, '24 cm');
  assert.ok(kel.some((o) => o.label === '24 cm²'));
  const rumus = E.opsiSoalBangun({ cek: { jenis: 'trapesium', minta: 'rumus' } });
  assert.equal(rumus[0].label, E.RUMUS_LUAS.setengahJumlahSejajar.label);
});

test('siapkanLangkahBangun: langkah isian angka dengan pemeriksa bangun datar', () => {
  const step = E.siapkanLangkahBangun({
    id: 'x',
    cek: { jenis: 'persegi', ukuran: { s: 5 }, minta: 'luas' },
  });
  assert.equal(step.angka, true);
  assert.equal(step.periksa, E.periksaSoalBangun);
  assert.equal(step.periksa('25', { cek: step.cek }).benar, true);
});

test('buildBangunSVG: poligon, petak satuan, ruas keliling, dan label ukuran', () => {
  const svg = E.buildBangunSVG(
    'persegiPanjang',
    { p: 5, l: 3 },
    {
      petak: true,
      ruas: true,
      label: { sisi: true },
      satuan: 'm',
    }
  );
  assert.match(svg, /^<svg class="bangun-svg/);
  assert.match(svg, /role="img"/);
  assert.equal((svg.match(/class="bangun-bidang"/g) || []).length, 1);
  assert.equal((svg.match(/class="bangun-ruas"/g) || []).length, 2 * (5 - 1) + 2 * (3 - 1));
  assert.match(svg, /clipPath/);
  assert.match(svg, />5 m</);
  assert.match(svg, />3 m</);

  const jj = E.buildBangunSVG('jajargenjang', CONTOH.jajargenjang, {
    label: { sisi: [0], tinggi: true },
  });
  assert.match(jj, /class="bangun-tinggi"/);
  assert.match(jj, />t = 4</);
  const bk = E.buildBangunSVG('belahKetupat', CONTOH.belahKetupat, { label: { diagonal: true } });
  assert.equal((bk.match(/class="bangun-diagonal"/g) || []).length, 2);
  assert.match(bk, />d₁ = 6</);
  const simbol = E.buildBangunSVG('trapesium', CONTOH.trapesium, {
    simbol: true,
    label: { sisi: [0, 2], tinggi: true },
  });
  assert.match(simbol, />a</);
  assert.match(simbol, />b</);
  assert.match(simbol, />t</);
  assert.equal(E.buildBangunSVG('persegi', { s: 0 }), '');
});

test('buildPotongSusunSVG: tiga fase potong-susun untuk setiap bangun turunan', () => {
  ['jajargenjang', 'segitiga', 'trapesium', 'belahKetupat', 'layangLayang'].forEach((j) => {
    const f0 = E.buildPotongSusunSVG(j, CONTOH[j], 0);
    const f1 = E.buildPotongSusunSVG(j, CONTOH[j], 1);
    const f2 = E.buildPotongSusunSVG(j, CONTOH[j], 2);
    [f0, f1, f2].forEach((s) => assert.match(s, /^<svg class="bangun-svg/));
    assert.notEqual(f0, f1, j + ': fase 1 berbeda');
    assert.notEqual(f1, f2, j + ': fase 2 berbeda');
    /* ukuran kanvas tetap agar gambar tidak melompat */
    const vb = (s) => s.match(/viewBox="([^"]+)"/)[1];
    assert.equal(vb(f0), vb(f2), j + ': viewBox tetap');
    assert.match(f2, /bangun-hasil/, j + ': garis bangun hasil');
  });
  assert.match(E.buildPotongSusunSVG('jajargenjang', CONTOH.jajargenjang, 1), /bangun-potong/);
  assert.match(E.buildPotongSusunSVG('segitiga', CONTOH.segitiga, 1), /bangun-salinan/);
  assert.match(E.buildPotongSusunSVG('belahKetupat', CONTOH.belahKetupat, 2), /bangun-luar/);
  assert.equal(E.buildPotongSusunSVG('persegi', { s: 3 }, 1), '');
});

const CFG_PETAK = {
  mode: 'petak',
  jenisList: ['persegiPanjang', 'persegi'],
  ukuran: {
    persegiPanjang: { p: { min: 1, max: 10, awal: 4 }, l: { min: 1, max: 8, awal: 2 } },
    persegi: { s: { min: 1, max: 8, awal: 3 } },
  },
  minta: ['keliling', 'luas'],
  minCatat: 2,
};

const CFG_POTONG = {
  mode: 'potong',
  jenisList: ['jajargenjang', 'segitiga'],
  ukuran: {
    jajargenjang: { a: { min: 2, max: 9, awal: 5 }, t: { min: 1, max: 6, awal: 3 } },
    segitiga: { a: { min: 2, max: 9, awal: 6 }, t: { min: 1, max: 6, awal: 4 } },
  },
  minta: ['luas'],
  minCatat: 2,
};

test('Lab Bangun (petak): ukuran, catatan berdiagnosa, dan syarat lengkap', () => {
  const st = E.ensureLabBangun({}, CFG_PETAK);
  assert.equal(st.jenis, 'persegiPanjang');
  assert.deepEqual(Object.assign({}, E.ukuranLabBangun(st)), { p: 4, l: 2 });
  assert.equal(E.ubahUkuranLabBangun(st, CFG_PETAK, 'l', -1), true);
  assert.equal(E.ubahUkuranLabBangun(st, CFG_PETAK, 'l', -1), false, 'batas bawah');
  E.ubahUkuranLabBangun(st, CFG_PETAK, 'l', 1);
  E.ubahUkuranLabBangun(st, CFG_PETAK, 'l', 1);

  assert.equal(E.periksaLabBangun(st, CFG_PETAK).status, 'kosong');
  st.isian.keliling = '12';
  st.isian.luas = '14';
  assert.equal(E.periksaLabBangun(st, CFG_PETAK).status, 'salah');
  assert.equal(st.hasil.keliling.kode, 'tertukarLuas');
  assert.equal(st.hasil.luas.kode, 'tertukarKeliling');
  st.isian.keliling = '14';
  st.isian.luas = '12';
  assert.equal(E.periksaLabBangun(st, CFG_PETAK).status, 'catat');
  assert.equal(st.catat.persegiPanjang.length, 1);
  assert.deepEqual(Object.assign({}, st.catat.persegiPanjang[0].nilai), { keliling: 14, luas: 12 });
  assert.equal(st.isian.luas, '', 'isian dikosongkan setelah dicatat');
  st.isian.keliling = '14';
  st.isian.luas = '12';
  assert.equal(
    E.periksaLabBangun(st, CFG_PETAK).status,
    'sudah',
    'ukuran sama tidak dicatat dua kali'
  );
  assert.equal(E.labBangunLengkap(st, CFG_PETAK), false);

  /* state rusak/konfigurasi berubah → disetel ulang */
  const lama = E.ensureLabBangun({ kunci: 'lain', jenis: 'x' }, CFG_PETAK);
  assert.equal(lama.jenis, 'persegiPanjang');
  assert.equal(E.pilihJenisLabBangun(st, CFG_PETAK, 'persegi'), true);
  assert.equal(E.pilihJenisLabBangun(st, CFG_PETAK, 'trapesium'), false);
  assert.deepEqual(Object.assign({}, E.ukuranLabBangun(st)), { s: 3 });
});

test('Lab Bangun (potong): isian hanya di fase akhir & diagnosa lupa setengah', () => {
  const st = E.ensureLabBangun({}, CFG_POTONG);
  assert.equal(st.fase, 0);
  st.isian.luas = '15';
  assert.equal(E.periksaLabBangun(st, CFG_POTONG).status, 'fase');
  assert.equal(E.ubahFaseLabBangun(st, CFG_POTONG, 1), true);
  assert.equal(E.ubahFaseLabBangun(st, CFG_POTONG, 1), true);
  assert.equal(E.ubahFaseLabBangun(st, CFG_POTONG, 1), false, 'fase maksimal 2');
  assert.equal(E.periksaLabBangun(st, CFG_POTONG).status, 'catat');
  E.pilihJenisLabBangun(st, CFG_POTONG, 'segitiga');
  assert.equal(st.fase, 0, 'ganti bangun → fase kembali 0');
  E.ubahFaseLabBangun(st, CFG_POTONG, 1);
  E.ubahFaseLabBangun(st, CFG_POTONG, 1);
  st.isian.luas = '24';
  assert.equal(E.periksaLabBangun(st, CFG_POTONG).status, 'salah');
  assert.equal(st.hasil.luas.kode, 'lupaSetengah');
  /* mengubah ukuran mengembalikan fase ke 0 */
  E.ubahUkuranLabBangun(st, CFG_POTONG, 'a', 1);
  assert.equal(st.fase, 0);
});

test('buildLabBangun: tab, stepper ukuran, gambar, isian, dan tabel catatan', () => {
  const st = E.ensureLabBangun({}, CFG_PETAK);
  let html = E.buildLabBangun('lb', st, CFG_PETAK);
  assert.match(html, /data-bangun-jenis="persegiPanjang"/);
  assert.match(html, /data-bangun-jenis="persegi"/);
  assert.match(html, /id="lbUpDec"/);
  assert.match(html, /id="lbUlInc"/);
  assert.match(html, /id="lbPetak"/);
  assert.match(html, /id="lbRuas"/);
  assert.match(html, /id="lbInkeliling"/);
  assert.match(html, /id="lbInluas"/);
  assert.match(html, /id="lbCheck"/);
  assert.match(html, /bangun-svg/);

  const pt = E.ensureLabBangun({}, CFG_POTONG);
  html = E.buildLabBangun('lp', pt, CFG_POTONG);
  assert.match(html, /id="lpFaseInc"/);
  assert.ok(!/id="lpInluas"/.test(html), 'isian belum muncul di fase 0');
  pt.fase = 2;
  html = E.buildLabBangun('lp', pt, CFG_POTONG);
  assert.match(html, /id="lpInluas"/);
  assert.match(html, /persegi panjang/i);
});
