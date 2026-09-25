'use strict';

/*
 * Tes seksi 33 shared/engine.js: asosiasi dua variabel — tabel
 * kontingensi dari data mentah/frekuensi sel, persen baris & kolom,
 * selisih poin persen, keputusan ada/tidak ada asosiasi kategorikal,
 * pemeriksa isian tabel kontingensi, parser isian persen, korelasi
 * Pearson, garis tren, arah & kekuatan asosiasi numerik, skala sumbu,
 * penempatan titik diagram pencar (termasuk diagnosa sumbu tertukar),
 * lab data kelas, dan markup komponen tabel/batang/pencar/turus.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();
const plain = (v) => JSON.parse(JSON.stringify(v));

const BARIS = [
  { id: 'ya', label: 'Ikut ekskul' },
  { id: 'tidak', label: 'Tidak ikut' },
];
const KOLOM = [
  { id: 'lulus', label: 'Lulus' },
  { id: 'belum', label: 'Belum' },
];

test('tabelKontingensi menghitung frekuensi sel, total baris/kolom dari data mentah', () => {
  const rec = [
    { ekskul: 'ya', sert: 'lulus' },
    { ekskul: 'ya', sert: 'lulus' },
    { ekskul: 'ya', sert: 'belum' },
    { ekskul: 'tidak', sert: 'lulus' },
    { ekskul: 'tidak', sert: 'belum' },
    { ekskul: 'tidak', sert: 'belum' },
    { ekskul: 'tidak', sert: 'belum' },
    { ekskul: 'lain', sert: 'belum' },
  ];
  const t = E.tabelKontingensi(rec, 'ekskul', 'sert', BARIS, KOLOM);
  assert.deepEqual(plain(t.sel), [
    [2, 1],
    [1, 3],
  ]);
  assert.deepEqual(plain(t.totalBaris), [3, 4]);
  assert.deepEqual(plain(t.totalKolom), [3, 4]);
  assert.equal(t.total, 7, 'kategori di luar daftar diabaikan');
  assert.equal(t.baris[0].label, 'Ikut ekskul');
  assert.equal(t.kolom[1].id, 'belum');
});

test('tabelDariSel membentuk tabel yang sama dari frekuensi sel', () => {
  const t = E.tabelDariSel(
    [
      [24, 6],
      [20, 30],
    ],
    BARIS,
    KOLOM
  );
  assert.deepEqual(plain(t.totalBaris), [30, 50]);
  assert.deepEqual(plain(t.totalKolom), [44, 36]);
  assert.equal(t.total, 80);
});

test('persenBaris, persenKolom & selisihPoinPersen', () => {
  const t = E.tabelDariSel(
    [
      [24, 6],
      [20, 30],
    ],
    BARIS,
    KOLOM
  );
  assert.deepEqual(plain(E.persenBaris(t)), [
    [80, 20],
    [40, 60],
  ]);
  const pk = E.persenKolom(t);
  assert.ok(E.hampirSama(pk[0][0], (24 / 44) * 100));
  assert.ok(E.hampirSama(pk[1][1], (30 / 36) * 100));
  assert.equal(E.selisihPoinPersen(t, 0), 40);
  const kosong = E.tabelDariSel(
    [
      [0, 0],
      [3, 1],
    ],
    BARIS,
    KOLOM
  );
  assert.deepEqual(plain(E.persenBaris(kosong)[0]), [0, 0], 'baris kosong tidak menghasilkan NaN');
});

test('asosiasiKategori: memakai persen baris, bukan frekuensi mentah', () => {
  const ada = E.tabelDariSel(
    [
      [24, 6],
      [20, 30],
    ],
    BARIS,
    KOLOM
  );
  assert.equal(E.asosiasiKategori(ada), 'ada');
  /* Frekuensi mentah 30 vs 10 berbeda jauh, tetapi persennya sama 50%. */
  const jebakan = E.tabelDariSel(
    [
      [30, 30],
      [10, 10],
    ],
    BARIS,
    KOLOM
  );
  assert.equal(E.asosiasiKategori(jebakan), 'tidak');
  const tipis = E.tabelDariSel(
    [
      [36, 12],
      [9, 3],
    ],
    BARIS,
    KOLOM
  );
  assert.equal(E.asosiasiKategori(tipis), 'tidak');
  assert.equal(E.asosiasiKategori(tipis, 0), 'tidak', 'selisih 0 tetap tidak ada');
});

test('cekIsianKontingensi menandai sel & total yang salah atau kosong', () => {
  const t = E.tabelDariSel(
    [
      [6, 2],
      [5, 7],
    ],
    BARIS,
    KOLOM
  );
  const isianBenar = {
    'sel-0-0': '6',
    'sel-0-1': '2',
    'sel-1-0': '5',
    'sel-1-1': '7',
    'tb-0': '8',
    'tb-1': '12',
    'tk-0': '11',
    'tk-1': '9',
    total: '20',
  };
  const ok = E.cekIsianKontingensi(t, isianBenar, { total: true });
  assert.equal(ok.lengkap, true);
  assert.equal(ok.benar, true);
  assert.deepEqual(plain(ok.salah), []);

  const hasil = E.cekIsianKontingensi(t, Object.assign({}, isianBenar, { 'sel-1-0': '7' }), {
    total: true,
  });
  assert.equal(hasil.benar, false);
  assert.deepEqual(plain(hasil.salah), ['sel-1-0']);

  const tanpaTotal = E.cekIsianKontingensi(t, { 'sel-0-0': '6', 'sel-0-1': '2' });
  assert.equal(tanpaTotal.lengkap, false);
  assert.deepEqual(plain(tanpaTotal.kosong), ['sel-1-0', 'sel-1-1']);
  assert.deepEqual(plain(E.kunciIsianKontingensi(t, false)), [
    'sel-0-0',
    'sel-0-1',
    'sel-1-0',
    'sel-1-1',
  ]);
});

test('parseInputPersen menerima 80, 80%, 37,5 dan 37.5', () => {
  assert.equal(E.parseInputPersen('80').value, 80);
  assert.equal(E.parseInputPersen(' 80 % ').value, 80);
  assert.equal(E.parseInputPersen('37,5').value, 37.5);
  assert.equal(E.parseInputPersen('37.5%').value, 37.5);
  assert.equal(E.parseInputPersen('').error, 'empty');
  assert.equal(E.parseInputPersen('delapan').error, 'invalid');
  assert.ok(E.parseInputPersen('abc').message);
});

test('formatPersenAso membulatkan & memakai koma desimal', () => {
  assert.equal(E.formatPersenAso(80), '80%');
  assert.equal(E.formatPersenAso(41.6666), '41,7%');
  assert.equal(E.formatPersenAso(37.5), '37,5%');
  assert.equal(E.formatPersenAso(12.345, 2), '12,35%');
});

test('korelasiPearson & garisTren sesuai hitungan manual', () => {
  assert.ok(E.hampirSama(E.korelasiPearson([1, 2, 3, 4], [2, 4, 6, 8]), 1));
  assert.ok(E.hampirSama(E.korelasiPearson([1, 2, 3, 4], [8, 6, 4, 2]), -1));
  /* x = 1..5, y = 2,4,5,4,5 → r = 6 / √(10·6) ≈ 0,7746 */
  assert.ok(Math.abs(E.korelasiPearson([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]) - 0.7746) < 1e-4);
  assert.equal(E.korelasiPearson([1, 1, 1], [2, 3, 4]), null, 'variansi nol → null');
  assert.equal(E.korelasiPearson([1], [2]), null);
  const g = E.garisTren([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
  assert.ok(E.hampirSama(g.m, 0.6));
  assert.ok(E.hampirSama(g.c, 2.2));
  assert.equal(E.garisTren([2, 2], [1, 5]), null);
});

test('arahAsosiasi & kekuatanAsosiasi dari r', () => {
  assert.equal(E.arahAsosiasi(0.92), 'positif');
  assert.equal(E.arahAsosiasi(-0.55), 'negatif');
  assert.equal(E.arahAsosiasi(0.1), 'tidak');
  assert.equal(E.arahAsosiasi(-0.29), 'tidak');
  assert.equal(E.arahAsosiasi(null), 'tidak');
  assert.equal(E.kekuatanAsosiasi(-0.85), 'kuat');
  assert.equal(E.kekuatanAsosiasi(0.5), 'sedang');
  assert.equal(E.kekuatanAsosiasi(0.2), 'lemah');
  assert.equal(E.kekuatanAsosiasi(null), 'lemah');
});

test('asosiasiTitik: arah dari titik {x, y}', () => {
  const naik = [
    { x: 1, y: 10 },
    { x: 2, y: 14 },
    { x: 3, y: 15 },
    { x: 4, y: 21 },
  ];
  assert.equal(E.asosiasiTitik(naik).arah, 'positif');
  assert.equal(E.asosiasiTitik(naik).kekuatan, 'kuat');
  assert.ok(E.asosiasiTitik(naik).r > 0.9);
});

test('sumbuPencar memberi batas & langkah tick yang rapi', () => {
  const s = E.sumbuPencar([3, 18, 42], {});
  assert.equal(s.min, 0);
  assert.ok(s.max >= 42);
  assert.equal((s.max - s.min) % s.step, 0);
  const t = E.sumbuPencar([], { min: 0, max: 10, step: 2 });
  assert.deepEqual([t.min, t.max, t.step], [0, 10, 2]);
  assert.deepEqual(plain(E.tickSumbu({ min: 0, max: 10, step: 5 })), [0, 5, 10]);
});

test('snapKeSumbu membulatkan ke langkah terdekat dalam batas', () => {
  const ax = { min: 0, max: 10, step: 1 };
  assert.equal(E.snapKeSumbu(3.4, ax), 3);
  assert.equal(E.snapKeSumbu(3.6, ax), 4);
  assert.equal(E.snapKeSumbu(-2, ax), 0);
  assert.equal(E.snapKeSumbu(12, ax), 10);
  assert.equal(E.snapKeSumbu(47, { min: 0, max: 70, step: 5 }), 45);
});

test('plotter pencar: benar, sumbu tertukar, salah, dan selesai', () => {
  const target = [
    { id: 'a', x: 2, y: 30 },
    { id: 'b', x: 5, y: 45 },
  ];
  const st = E.makePlotterState();
  assert.equal(E.plotterAktif(target, st).id, 'a');
  assert.equal(E.diagnosaTitik(target[0], 30, 2), 'tertukar');
  assert.equal(E.diagnosaTitik(target[0], 2, 35), 'salah');
  assert.equal(E.diagnosaTitik({ id: 'c', x: 3, y: 3 }, 3, 3), 'benar');

  assert.equal(E.plotterCoba(target, st, 3, 30), 'salah');
  assert.deepEqual(plain(st.salah), { x: 3, y: 30, kode: 'salah' });
  assert.equal(st.attempts, 1);
  assert.equal(E.plotterCoba(target, st, 2, 30), 'benar');
  assert.equal(st.salah, null);
  assert.deepEqual(plain(st.placed), { a: { x: 2, y: 30 } });
  assert.equal(E.plotterAktif(target, st).id, 'b');
  assert.equal(E.plotterSelesai(target, st), false);
  E.plotterCoba(target, st, 5, 45);
  assert.equal(E.plotterSelesai(target, st), true);
  assert.equal(E.plotterAktif(target, st), null);
  assert.equal(E.plotterCoba(target, st, 1, 1), 'selesai');
  assert.ok(E.pesanDiagnosaTitik('tertukar', target[0], { xLabel: 'Jam', yLabel: 'Kpm' }));
});

test('lab data kelas: titik numerik & tabel kategori dari baris isian', () => {
  const st = E.makeLabDataKelas();
  assert.equal(st.mode, 'numerik');
  st.numerik = [
    { x: '150', y: '149' },
    { x: '160,5', y: '161' },
    { x: '', y: '170' },
    { x: 'abc', y: '1' },
  ];
  assert.deepEqual(plain(E.labTitikNumerik(st)), [
    { x: 150, y: 149 },
    { x: 160.5, y: 161 },
  ]);
  st.kategori = [
    { a: 'ya', b: 'ya' },
    { a: 'ya', b: 'tidak' },
    { a: 'tidak', b: 'tidak' },
    { a: '', b: 'ya' },
  ];
  const t = E.labTabelKategori(
    st,
    [
      { id: 'ya', label: 'Ya' },
      { id: 'tidak', label: 'Tidak' },
    ],
    [
      { id: 'ya', label: 'Ya' },
      { id: 'tidak', label: 'Tidak' },
    ]
  );
  assert.deepEqual(plain(t.sel), [
    [1, 1],
    [0, 1],
  ]);
  assert.equal(t.total, 3);
  E.labTambahBaris(st);
  assert.equal(st.kategori.length, 4, 'mode numerik → baris numerik yang bertambah');
  assert.equal(st.numerik.length, 5);
  E.labHapusBaris(st, 0);
  assert.equal(st.numerik.length, 4);
});

test('buildContingencyTable: frekuensi atau persen baris, total, dan caption', () => {
  const t = E.tabelDariSel(
    [
      [24, 6],
      [20, 30],
    ],
    BARIS,
    KOLOM
  );
  const f = E.buildContingencyTable(t, { caption: 'Survei', judulBaris: 'Ekskul' });
  assert.match(f, /<table/);
  assert.match(f, /<caption[^>]*>Survei<\/caption>/);
  assert.match(f, />24</);
  assert.match(f, />80</);
  assert.match(f, /scope="col"/);
  const p = E.buildContingencyTable(t, { mode: 'persen' });
  assert.match(p, /80%/);
  assert.match(p, /40%/);
  assert.match(p, /100%/);
});

test('buildContingencyInput: kotak isian ber-label, ditandai bila salah', () => {
  const t = E.tabelDariSel(
    [
      [6, 2],
      [5, 7],
    ],
    BARIS,
    KOLOM
  );
  const html = E.buildContingencyInput('tk', t, { 'sel-0-0': '6' }, { salah: ['sel-0-1'] });
  assert.match(html, /id="tk-sel-0-0"/);
  assert.match(html, /value="6"/);
  assert.match(html, /aria-label="Ikut ekskul dan Lulus"/);
  assert.match(html, /id="tk-sel-0-1"[^>]*has-error|has-error[^>]*id="tk-sel-0-1"/);
  assert.doesNotMatch(html, /id="tk-total"/, 'tanpa total bila tidak diminta');
  assert.match(E.buildContingencyInput('tk', t, {}, { total: true }), /id="tk-total"/);
});

test('buildSegmentedBar: satu batang 100% per baris dengan lebar sesuai persen', () => {
  const t = E.tabelDariSel(
    [
      [24, 6],
      [20, 30],
    ],
    BARIS,
    KOLOM
  );
  const html = E.buildSegmentedBar(t);
  assert.match(html, /width:80%/);
  assert.match(html, /width:40%/);
  assert.match(html, /Ikut ekskul/);
  assert.match(html, /role="img"/);
});

test('buildScatterPlot: satu lingkaran per titik, garis tren opsional, aria', () => {
  const pts = [
    { x: 1, y: 25 },
    { x: 2, y: 30 },
    { x: 4, y: 40 },
  ];
  const svg = E.buildScatterPlot(pts, {
    xLabel: 'Jam latihan',
    yLabel: 'Kecepatan',
    caption: 'Diagram pencar',
  });
  assert.match(svg, /<svg/);
  assert.equal((svg.match(/class="aso-dot"/g) || []).length, 3);
  assert.match(svg, /aria-label="Diagram pencar"/);
  assert.doesNotMatch(svg, /aso-trend/);
  assert.match(E.buildScatterPlot(pts, { trend: true }), /aso-trend/);
});

test('buildScatterPlotter: grid fokus keyboard, titik tertempel & target aktif', () => {
  const target = [
    { id: 'a', x: 2, y: 30, label: 'Ani' },
    { id: 'b', x: 5, y: 45, label: 'Budi' },
  ];
  const st = E.makePlotterState();
  E.plotterCoba(target, st, 2, 30);
  const html = E.buildScatterPlotter('pl', target, st, {
    x: { min: 0, max: 10, step: 1 },
    y: { min: 0, max: 70, step: 5 },
    xLabel: 'Jam',
    yLabel: 'Kpm',
  });
  assert.match(html, /id="pl-svg"[^>]*tabindex="0"|tabindex="0"[^>]*id="pl-svg"/);
  assert.match(html, /Budi/);
  assert.equal((html.match(/class="aso-dot"/g) || []).length, 1);
});

test('buildTallyCards: kartu tombol ber-aria-pressed sesuai tanda', () => {
  const rec = [
    { id: 'r1', nama: 'Ani', ekskul: 'ya', sert: 'lulus' },
    { id: 'r2', nama: 'Budi', ekskul: 'tidak', sert: 'belum' },
  ];
  const html = E.buildTallyCards(
    'ty',
    rec,
    { r2: true },
    {
      fields: [
        { key: 'ekskul', label: 'Ekskul', kategori: BARIS },
        { key: 'sert', label: 'Sertifikasi', kategori: KOLOM },
      ],
    }
  );
  assert.equal((html.match(/data-tally=/g) || []).length, 2);
  assert.match(html, /data-tally="r2"[^>]*aria-pressed="true"/);
  assert.match(html, /data-tally="r1"[^>]*aria-pressed="false"/);
  assert.match(html, /Tidak ikut/);
});

test('buildSortItems opts.visual menaruh blok visual di luar <p> teks butir', () => {
  const items = [{ id: 'a', teks: 'Tabel A', correct: 'ada', explanation: '-' }];
  const opsi = [
    { id: 'ada', label: 'Ada' },
    { id: 'tidak', label: 'Tidak' },
  ];
  const states = { a: { chosen: null, correct: false, optionOrder: ['ada', 'tidak'] } };
  const html = E.buildSortItems(items, ['a'], opsi, states, {
    visual: () => '<div class="viz"></div>',
  });
  assert.match(html, /Tabel A<\/p><div class="sort-item__visual"><div class="viz"><\/div><\/div>/);
  assert.doesNotMatch(E.buildSortItems(items, ['a'], opsi, states), /sort-item__visual/);
});
