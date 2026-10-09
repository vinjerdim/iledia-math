'use strict';

/*
 * Tes engine.js bagian 70 — perbandingan senilai & berbalik nilai
 * (dipakai fase-d/mpi-3.4, Inquiry Learning): nilai yang hilang,
 * mengenali jenis perbandingan dari tabel, konstanta (hasil bagi /
 * hasil kali), diagnosa miskonsepsi (model tertukar, pola tambah, lupa
 * membagi, hasil bagi terbalik), pemeriksa & opsi soal, serta Lab
 * Proporsi, tabel, grafik, batang, dan persegi berbalik nilai.
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(o) {
  return JSON.parse(JSON.stringify(o));
}

test('nilaiSenilai: y2 = y1 × x2 : x1', () => {
  assert.equal(E.nilaiSenilai(4, 32, 6), 48);
  assert.equal(E.nilaiSenilai(32, 4, 60), 7.5);
  assert.equal(E.nilaiSenilai(5, 70000, 8), 112000);
  assert.equal(E.nilaiSenilai(3, 1, 10), 3.333333333);
});

test('nilaiBerbalik: y2 = x1 × y1 : x2', () => {
  assert.equal(E.nilaiBerbalik(4, 60, 6), 40);
  assert.equal(E.nilaiBerbalik(4, 60, 5), 48);
  assert.equal(E.nilaiBerbalik(60, 4, 30), 8);
  assert.equal(E.nilaiBerbalik(120, 15, 150), 12);
});

test('jenisPerbandinganTabel: senilai, berbalik, atau bukan keduanya', () => {
  const t = (rows) => E.jenisPerbandinganTabel(rows.map(([x, y]) => ({ x, y })));
  assert.equal(
    t([
      [2, 6000],
      [3, 9000],
      [5, 15000],
    ]),
    'senilai'
  );
  assert.equal(
    t([
      [40, 3],
      [60, 2],
      [80, 1.5],
    ]),
    'berbalik'
  );
  /* selisih tetap, jumlah tetap, dan kuadrat bukan keduanya */
  assert.equal(
    t([
      [5, 9],
      [8, 12],
    ]),
    'bukan'
  );
  assert.equal(
    t([
      [5, 15],
      [8, 12],
      [12, 8],
    ]),
    'bukan'
  );
  assert.equal(
    t([
      [1, 1],
      [2, 4],
      [3, 9],
    ]),
    'bukan'
  );
  assert.equal(t([[1, 2]]), 'bukan', 'satu baris belum cukup');
  assert.equal(E.jenisPerbandinganTabel(null), 'bukan');
});

test('konstantaProporsi: hasil bagi untuk senilai, hasil kali untuk berbalik', () => {
  assert.equal(E.konstantaProporsi('senilai', 4, 32), 8);
  assert.equal(E.konstantaProporsi('berbalik', 4, 60), 240);
});

test('jawabSoalProporsi & periksaSoalProporsi: jawaban baku diterima', () => {
  const cases = [
    [{ jenis: 'senilai', x1: 4, y1: 32, x2: 6 }, '48'],
    [{ jenis: 'senilai', x1: 32, y1: 4, x2: 60 }, '7,5'],
    [{ jenis: 'senilai', x1: 5, y1: 70000, x2: 8 }, '112.000'],
    [{ jenis: 'berbalik', x1: 4, y1: 60, x2: 5 }, '48'],
    [{ jenis: 'bagi', x: 3, y: 24 }, '8'],
    [{ jenis: 'kali', x: 6, y: 40 }, '240'],
  ];
  cases.forEach(([cek, jawab]) => {
    const s = { cek };
    assert.equal(E.jawabSoalProporsi(s), jawab, JSON.stringify(cek));
    const r = E.periksaSoalProporsi(jawab, s);
    assert.equal(r.benar, true);
    assert.equal(r.kode, 'benar');
    assert.ok(r.pesan);
  });
  /* tanpa titik ribuan juga terbaca */
  assert.equal(
    E.periksaSoalProporsi('112000', { cek: { jenis: 'senilai', x1: 5, y1: 70000, x2: 8 } }).benar,
    true
  );
});

test('periksaSoalProporsi: isian kosong & format tak terbaca', () => {
  const s = { cek: { jenis: 'senilai', x1: 4, y1: 32, x2: 6 } };
  assert.equal(E.periksaSoalProporsi('', s).kode, 'kosong');
  assert.equal(E.periksaSoalProporsi('empat puluh', s).kode, 'format');
  assert.equal(E.periksaSoalProporsi('2 : 3', s).kode, 'format');
});

test('diagnosa nilai yang hilang: model tertukar, pola tambah, lupa membagi', () => {
  const sen = { cek: { jenis: 'senilai', x1: 4, y1: 32, x2: 6 } };
  assert.equal(E.periksaSoalProporsi('21,333333333', sen).kode, 'tertukar');
  const sen2 = { cek: { jenis: 'senilai', x1: 2, y1: 30, x2: 6 } };
  assert.equal(E.periksaSoalProporsi('10', sen2).kode, 'tertukar');
  assert.equal(E.periksaSoalProporsi('34', sen).kode, 'tambah');
  assert.equal(E.periksaSoalProporsi('192', sen).kode, 'lupaBagi');
  assert.equal(E.periksaSoalProporsi('50', sen).kode, 'salah');

  const bal = { cek: { jenis: 'berbalik', x1: 4, y1: 60, x2: 6 } };
  assert.equal(E.periksaSoalProporsi('90', bal).kode, 'tertukar');
  assert.equal(E.periksaSoalProporsi('58', bal).kode, 'tambah');
  assert.equal(E.periksaSoalProporsi('240', bal).kode, 'lupaBagi');
  /* pesan menyebut cara yang tepat sesuai jenisnya */
  assert.match(E.periksaSoalProporsi('90', bal).pesan, /berbalik nilai/);
  assert.match(E.periksaSoalProporsi('10', sen2).pesan, /senilai/);
});

test('diagnosa konstanta: hasil bagi terbalik & operasi tertukar', () => {
  const bagi = { cek: { jenis: 'bagi', x: 3, y: 24 } };
  assert.equal(E.periksaSoalProporsi('0,125', bagi).kode, 'terbalikBagi');
  assert.equal(E.periksaSoalProporsi('72', bagi).kode, 'tertukar');
  const kali = { cek: { jenis: 'kali', x: 6, y: 40 } };
  assert.equal(E.periksaSoalProporsi('46', kali).kode, 'tambah');
  assert.equal(E.periksaSoalProporsi('15', kali).kode, 'salah');
});

test('soal jenis perbandingan: jawaban berupa id jenis', () => {
  const s = {
    cek: {
      jenis: 'jenis',
      baris: [
        { x: 3, y: 12 },
        { x: 4, y: 9 },
      ],
    },
  };
  assert.equal(E.jawabSoalProporsi(s), 'berbalik');
  assert.equal(E.periksaSoalProporsi('berbalik', s).benar, true);
  assert.equal(E.periksaSoalProporsi('senilai', s).benar, false);
});

test('jenisAngkaProporsi & siapkanLangkahProporsi', () => {
  ['senilai', 'berbalik', 'bagi', 'kali'].forEach((j) =>
    assert.equal(E.jenisAngkaProporsi(j), true, j)
  );
  assert.equal(E.jenisAngkaProporsi('jenis'), false);
  const step = E.siapkanLangkahProporsi({
    id: 'a',
    cek: { jenis: 'senilai', x1: 1, y1: 2, x2: 3 },
  });
  assert.equal(step.angka, true);
  assert.equal(step.periksa, E.periksaSoalProporsi);
  /* dipakai oleh periksaLangkahRasio (seksi 68) */
  const st = E.makeCekStep();
  assert.equal(E.periksaLangkahRasio(st, step, '6').benar, true);
  assert.equal(st.done, true);
});

test('opsiSoalProporsi: kunci lebih dulu, pengecoh unik berumpan diagnosa', () => {
  const soal = [
    { cek: { jenis: 'senilai', x1: 4, y1: 32, x2: 6 }, satuan: 'porsi' },
    { cek: { jenis: 'berbalik', x1: 4, y1: 60, x2: 6 }, satuan: 'menit' },
    { cek: { jenis: 'berbalik', x1: 60, y1: 4, x2: 30 }, satuan: 'relawan' },
    { cek: { jenis: 'senilai', x1: 2, y1: 3, x2: 4 }, satuan: 'gelas' },
    { cek: { jenis: 'berbalik', x1: 120, y1: 15, x2: 150 }, satuan: 'hari' },
  ];
  soal.forEach((s) => {
    const opsi = plain(E.opsiSoalProporsi(s));
    assert.ok(opsi.length >= 4, 'minimal 4 opsi');
    assert.equal(opsi[0].id, 'baku');
    assert.equal(opsi[0].label, E.jawabSoalProporsi(s) + ' ' + s.satuan);
    assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length, 'id unik');
    assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, 'label unik');
    opsi.forEach((o) => assert.ok(o.umpan, o.id + ': umpan'));
  });
  const ids = plain(E.opsiSoalProporsi(soal[1])).map((o) => o.id);
  ['tertukar', 'tambah', 'lupaBagi'].forEach((k) => assert.ok(ids.includes(k), k));
});

test('opsiSoalProporsi: soal jenis memiliki tepat satu kunci', () => {
  ['senilai', 'berbalik', 'bukan'].forEach((jenis) => {
    const baris = {
      senilai: [
        { x: 1, y: 3 },
        { x: 2, y: 6 },
      ],
      berbalik: [
        { x: 1, y: 6 },
        { x: 2, y: 3 },
      ],
      bukan: [
        { x: 1, y: 3 },
        { x: 2, y: 4 },
      ],
    }[jenis];
    const opsi = plain(E.opsiSoalProporsi({ cek: { jenis: 'jenis', baris } }));
    assert.equal(opsi.length, 4);
    assert.equal(opsi[0].id, 'baku');
    assert.match(opsi[0].label, new RegExp(E.namaJenisProporsi(jenis), 'i'));
    assert.equal(new Set(opsi.map((o) => o.label)).size, 4);
    opsi.forEach((o) => assert.ok(o.umpan));
  });
});

test('Lab Proporsi: state, stepper menurut pilihan, dan baris dicoba', () => {
  const cfg = {
    jenis: 'berbalik',
    k: 240,
    pilihan: [1, 2, 3, 4, 5, 6, 8],
    awal: 4,
    minCoba: 4,
    labelX: 'Banyak relawan',
    satX: 'relawan',
    satY: 'menit',
    namaX: 'Relawan',
    namaY: 'Waktu (menit)',
  };
  const st = {};
  E.ensureLabProporsi(st, cfg);
  assert.equal(st.x, 4);
  assert.deepEqual(plain(st.dicoba), [4]);
  assert.equal(E.nilaiLabProporsi(cfg, 4), 60);
  assert.equal(E.ubahLabProporsi(st, cfg, 1), true);
  assert.equal(st.x, 5);
  E.ubahLabProporsi(st, cfg, 1);
  assert.equal(st.x, 6);
  E.ubahLabProporsi(st, cfg, 1);
  assert.equal(st.x, 8, 'melompat ke pilihan berikutnya');
  assert.equal(E.ubahLabProporsi(st, cfg, 1), false, 'sudah di ujung');
  assert.equal(E.labProporsiCukup(st, cfg), true);
  const baris = plain(E.barisLabProporsi(st, cfg));
  assert.deepEqual(
    baris.map((b) => b.x),
    [4, 5, 6, 8]
  );
  assert.deepEqual(
    baris.map((b) => b.y),
    [60, 48, 40, 30]
  );
  /* state rusak / pilihan berubah → disetel ulang */
  const rusak = { x: 7, dicoba: 'x' };
  E.ensureLabProporsi(rusak, cfg);
  assert.equal(rusak.x, 4);
  assert.deepEqual(plain(rusak.dicoba), [4]);

  const sen = Object.assign({}, cfg, { jenis: 'senilai', k: 8 });
  assert.equal(E.nilaiLabProporsi(sen, 3), 24);
});

test('buildLabProporsi: stepper, status, tabel, grafik ber-aria', () => {
  const cfg = {
    jenis: 'senilai',
    k: 8,
    pilihan: [1, 2, 3, 4],
    awal: 1,
    minCoba: 3,
    labelX: 'Beras',
    satX: 'kg',
    satY: 'porsi',
    namaX: 'Beras (kg)',
    namaY: 'Porsi',
  };
  const st = {};
  E.ensureLabProporsi(st, cfg);
  let html = E.buildLabProporsi('lab', st, cfg);
  assert.match(html, /id="labDec"[^>]*disabled/);
  assert.match(html, /id="labInc"/);
  assert.match(html, /1 kg/);
  assert.match(html, /8 porsi/);
  assert.match(html, /<table/);
  assert.match(html, /<svg[^>]*role="img"/);
  E.ubahLabProporsi(st, cfg, 1);
  html = E.buildLabProporsi('lab', st, cfg);
  assert.match(html, /16 porsi/);
  assert.match(html, /Percobaan 2 dari minimal 3/);

  const bal = Object.assign({}, cfg, { jenis: 'berbalik', k: 12 });
  E.ensureLabProporsi(st, bal);
  assert.match(E.buildLabProporsi('lab', st, bal), /persegi-berbalik/);
});

test('buildTabelProporsi: kolom hasil bagi & hasil kali', () => {
  const html = E.buildTabelProporsi(
    [
      { x: 2, y: 6 },
      { x: 3, y: 9 },
    ],
    { namaX: 'x', namaY: 'y', caption: 'Data' }
  );
  assert.match(html, /<caption>Data<\/caption>/);
  assert.match(html, /y : x/);
  assert.match(html, /x × y/);
  assert.match(html, />3</);
  assert.match(html, />12</);
  assert.match(html, />27</);
  /* hasil bagi tak tepat dibulatkan 2 desimal dengan tanda ≈ */
  assert.match(E.buildTabelProporsi([{ x: 6, y: 40 }]), />≈ 6,67</);
  assert.equal(E.fmtBuktiProporsi(2.5), '2,5');
  /* bukti: false → kolom hasil bagi & hasil kali disembunyikan */
  const polos = E.buildTabelProporsi([{ x: 2, y: 6 }], { bukti: false });
  assert.doesNotMatch(polos, /y : x|x × y/);
  assert.match(polos, />6</);
});

test('buildGrafikProporsi & buildPersegiBerbalik: SVG dengan label', () => {
  const g = E.buildGrafikProporsi(
    [
      { x: 1, y: 8 },
      { x: 2, y: 16 },
    ],
    { namaX: 'Beras (kg)', namaY: 'Porsi', aktif: 2, maksX: 4, maksY: 32 }
  );
  assert.match(g, /<svg[^>]*aria-label="[^"]*Beras \(kg\)/);
  assert.match(g, /grafik-proporsi__titik is-aktif/);
  assert.match(g, /<polyline/);
  const p = E.buildPersegiBerbalik(4, 60, { satX: 'relawan', satY: 'menit', maksX: 8, maksY: 240 });
  assert.match(p, /persegi-berbalik/);
  assert.match(p, /4 × 60 = 240/);
  const b = E.buildBatangProporsi(3, 24, {
    satX: 'kg',
    satY: 'porsi',
    maksX: 8,
    maksY: 64,
    namaX: 'Beras',
    namaY: 'Porsi',
  });
  assert.match(b, /batang-proporsi/);
  assert.match(b, /3 kg/);
  assert.match(b, /24 porsi/);
});
