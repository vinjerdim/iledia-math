'use strict';

/*
 * Tes shared/engine.js seksi 82 (fungsi linear & non-linear dari pola
 * perubahan nilai): nilai aturan fungsi, laju perubahan Δy/Δx, jenis &
 * arah pola, teks aturan, diagnosa miskonsepsi klasifikasi, tabel
 * perubahan isian (periksa & markup), serta Lab Pola Perubahan (state,
 * aksi, syarat selesai & markup).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

/* Array dari konteks vm punya prototipe berbeda → samakan dulu. */
function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function count(str, sub) {
  return str.split(sub).length - 1;
}

test('nilaiAturanFungsi: linear, kuadrat, eksponen, kebalikan', () => {
  assert.equal(E.nilaiAturanFungsi({ jenis: 'linear', m: 1000, c: 2000 }, 3), 5000);
  assert.equal(E.nilaiAturanFungsi({ jenis: 'linear', m: -3, c: 24 }, 4), 12);
  assert.equal(E.nilaiAturanFungsi({ jenis: 'kuadrat' }, 5), 25);
  assert.equal(E.nilaiAturanFungsi({ jenis: 'kuadrat', a: 22 / 7 }, 7), 154);
  assert.equal(E.nilaiAturanFungsi({ jenis: 'kuadrat', a: 2, c: 1 }, 3), 19);
  assert.equal(E.nilaiAturanFungsi({ jenis: 'eksponen', r: 2 }, 4), 16);
  assert.equal(E.nilaiAturanFungsi({ jenis: 'eksponen', a: 800, r: 0.5 }, 3), 100);
  assert.equal(E.nilaiAturanFungsi({ jenis: 'kebalikan', k: 12 }, 5), 2.4);
  assert.throws(() => E.nilaiAturanFungsi({ jenis: 'aneh' }, 1));
});

test('tabelAturanFungsi: nilai y untuk setiap x', () => {
  assert.deepEqual(
    plain(E.tabelAturanFungsi({ jenis: 'linear', m: 4, c: 5 }, [1, 3, 4, 7])),
    [9, 17, 21, 33]
  );
});

test('lajuPerubahan: Δx, Δy, dan Δy/Δx tiap pasangan berurutan', () => {
  assert.deepEqual(plain(E.lajuPerubahan([1, 3, 4, 7], [9, 17, 21, 33])), [
    { dx: 2, dy: 8, laju: 4 },
    { dx: 1, dy: 4, laju: 4 },
    { dx: 3, dy: 12, laju: 4 },
  ]);
  assert.deepEqual(plain(E.lajuPerubahan([1, 2, 4], [12, 6, 3])), [
    { dx: 1, dy: -6, laju: -6 },
    { dx: 2, dy: -3, laju: -1.5 },
  ]);
});

test('dxSeragam: jarak antar-x sama atau tidak', () => {
  assert.equal(E.dxSeragam([0, 1, 2, 3]), true);
  assert.equal(E.dxSeragam([10, 20, 30]), true);
  assert.equal(E.dxSeragam([1, 3, 4, 7]), false);
});

test('jenisPolaFungsi: linear bila Δy/Δx tetap, termasuk turun, konstan & Δx tak seragam', () => {
  assert.equal(E.jenisPolaFungsi([1, 2, 3, 4], [3000, 4000, 5000, 6000]), 'linear');
  assert.equal(E.jenisPolaFungsi([0, 1, 2], [24, 21, 18]), 'linear');
  assert.equal(E.jenisPolaFungsi([1, 2, 3], [5, 5, 5]), 'linear');
  assert.equal(E.jenisPolaFungsi([1, 3, 4, 7], [9, 17, 21, 33]), 'linear');
  assert.equal(E.jenisPolaFungsi([1, 2, 3, 4], [1, 4, 9, 16]), 'nonlinear');
  assert.equal(E.jenisPolaFungsi([0, 1, 2, 3], [800, 400, 200, 100]), 'nonlinear');
  assert.equal(E.jenisPolaFungsi([1, 2, 3], [1, 3, 2]), 'nonlinear');
});

test('arahPolaFungsi: naik, turun, tetap, campuran', () => {
  assert.equal(E.arahPolaFungsi([1, 2, 3], [1, 4, 9]), 'naik');
  assert.equal(E.arahPolaFungsi([1, 2, 3], [9, 4, 1]), 'turun');
  assert.equal(E.arahPolaFungsi([1, 2, 3], [5, 5, 5]), 'tetap');
  assert.equal(E.arahPolaFungsi([1, 2, 3], [1, 3, 2]), 'campuran');
});

test('teksAturanFungsi: notasi aturan rapi dengan minus tipografis', () => {
  assert.equal(E.teksAturanFungsi({ jenis: 'linear', m: 2, c: 1 }), 'y = 2x + 1');
  assert.equal(E.teksAturanFungsi({ jenis: 'linear', m: -3, c: 0 }), 'y = −3x');
  assert.equal(E.teksAturanFungsi({ jenis: 'linear', m: 1, c: -5 }), 'y = x − 5');
  assert.equal(E.teksAturanFungsi({ jenis: 'linear', m: -1, c: 2 }), 'y = −x + 2');
  assert.equal(E.teksAturanFungsi({ jenis: 'linear', m: 0, c: 4 }), 'y = 4');
  assert.equal(E.teksAturanFungsi({ jenis: 'linear', m: 0, c: 0 }), 'y = 0');
  assert.equal(E.teksAturanFungsi({ jenis: 'kuadrat' }), 'y = x²');
  assert.equal(E.teksAturanFungsi({ jenis: 'eksponen', r: 2 }), 'y = 2ˣ');
  assert.equal(E.teksAturanFungsi({ jenis: 'kebalikan', k: 12 }), 'y = 12/x');
});

test('diagnosaJenisFungsi: kode miskonsepsi klasifikasi', () => {
  const kuadrat = [
    [1, 2, 3, 4],
    [1, 4, 9, 16],
  ];
  const luruh = [
    [0, 1, 2],
    [800, 400, 200],
  ];
  const zigzag = [
    [1, 2, 3],
    [1, 3, 2],
  ];
  const lilin = [
    [0, 1, 2],
    [24, 21, 18],
  ];
  const tetap = [
    [1, 2, 3],
    [5, 5, 5],
  ];
  const lompat = [
    [1, 3, 4, 7],
    [9, 17, 21, 33],
  ];
  const parkir = [
    [1, 2, 3],
    [3000, 4000, 5000],
  ];
  assert.equal(E.diagnosaJenisFungsi(...kuadrat, 'nonlinear'), 'benar');
  assert.equal(E.diagnosaJenisFungsi(...lilin, 'linear'), 'benar');
  assert.equal(E.diagnosaJenisFungsi(...kuadrat, 'linear'), 'naikDikiraLinear');
  assert.equal(E.diagnosaJenisFungsi(...luruh, 'linear'), 'turunDikiraLinear');
  assert.equal(E.diagnosaJenisFungsi(...zigzag, 'linear'), 'salahLinear');
  assert.equal(E.diagnosaJenisFungsi(...lompat, 'nonlinear'), 'abaikanDx');
  assert.equal(E.diagnosaJenisFungsi(...lilin, 'nonlinear'), 'turunDikiraNonlinear');
  assert.equal(E.diagnosaJenisFungsi(...tetap, 'nonlinear'), 'tetapDikiraNonlinear');
  assert.equal(E.diagnosaJenisFungsi(...parkir, 'nonlinear'), 'salahNonlinear');
});

test('pesanDiagnosaJenisFungsi: setiap kode punya pesan', () => {
  [
    'benar',
    'naikDikiraLinear',
    'turunDikiraLinear',
    'salahLinear',
    'abaikanDx',
    'turunDikiraNonlinear',
    'tetapDikiraNonlinear',
    'salahNonlinear',
  ].forEach((k) => {
    const p = E.pesanDiagnosaJenisFungsi(k);
    assert.ok(typeof p === 'string' && p.length > 20, k);
  });
  assert.match(E.pesanDiagnosaJenisFungsi('abaikanDx'), /Δy\/Δx/);
});

const CFG = {
  xs: [1, 2, 3, 4],
  ys: [3000, 4000, 5000, 6000],
  kosong: [2, 3],
  labelX: 'Lama parkir (jam)',
  labelY: 'Biaya (Rp)',
};

test('makeTabelPerubahanState & ensureTabelPerubahanState', () => {
  const holder = {};
  const st = E.ensureTabelPerubahanState(holder, 'parkir');
  assert.deepEqual(plain(st), plain(E.makeTabelPerubahanState()));
  holder.rusak = { y: 'x', attempts: 2 };
  const st2 = E.ensureTabelPerubahanState(holder, 'rusak');
  assert.deepEqual(plain(st2.y), {});
  assert.equal(st2.attempts, 2);
  assert.equal(st2.tepat, false);
});

test('periksaTabelPerubahan: kosong, salah y, salah Δy (terbalik), tepat', () => {
  const st = E.makeTabelPerubahanState();
  let h = E.periksaTabelPerubahan(CFG, st);
  assert.equal(h.lengkap, false);
  assert.equal(h.tepat, false);

  st.y = { 2: '5.000', 3: '7000' };
  st.dy = { 0: '1000', 1: '-1000', 2: '1.000' };
  h = E.periksaTabelPerubahan(CFG, st);
  assert.equal(h.lengkap, true);
  assert.equal(h.tepat, false);
  assert.deepEqual(plain(h.salahY), [3]);
  assert.deepEqual(plain(h.salahDy), [{ i: 1, kode: 'terbalik' }]);

  st.y[3] = '6000';
  st.dy[1] = '1000';
  h = E.periksaTabelPerubahan(CFG, st);
  assert.equal(h.tepat, true);
  assert.deepEqual(plain(h.salahY), []);
  assert.deepEqual(plain(h.salahDy), []);
});

test('periksaTabelPerubahan: isian tak terbaca dianggap belum lengkap', () => {
  const st = E.makeTabelPerubahanState();
  st.y = { 2: '5000', 3: 'enam ribu' };
  st.dy = { 0: '1000', 1: '1000', 2: '1000' };
  const h = E.periksaTabelPerubahan(CFG, st);
  assert.equal(h.lengkap, false);
});

test('buildTabelPerubahan: baris x, Δx, y, Δy; isian hanya pada sel kosong', () => {
  const st = E.makeTabelPerubahanState();
  const html = E.buildTabelPerubahan('tp', CFG, st);
  assert.match(html, /Lama parkir \(jam\)/);
  assert.match(html, /Biaya \(Rp\)/);
  assert.equal(count(html, 'data-tp-y='), 2);
  assert.equal(count(html, 'data-tp-dy='), 3);
  assert.match(html, /id="tp-y-2"/);
  assert.match(html, /id="tp-dy-0"/);
  assert.match(html, /3\.000/);
  assert.doesNotMatch(html, /Δy\/Δx/);
});

test('buildTabelPerubahan selesai: tanpa isian, menampilkan laju Δy/Δx', () => {
  const st = E.makeTabelPerubahanState();
  st.tepat = true;
  const html = E.buildTabelPerubahan('tp', CFG, st);
  assert.equal(count(html, 'data-tp-y='), 0);
  assert.equal(count(html, 'data-tp-dy='), 0);
  assert.match(html, /Δy\/Δx/);
  assert.match(html, /6\.000/);
  assert.match(html, /1\.000/);
});

test('buildTabelPerubahan diperiksa: sel salah ditandai has-error', () => {
  const st = E.makeTabelPerubahanState();
  st.y = { 2: '5000', 3: '7000' };
  st.dy = { 0: '1000', 1: '1000', 2: '1000' };
  st.checked = true;
  const html = E.buildTabelPerubahan('tp', CFG, st);
  assert.equal(count(html, 'has-error'), 1);
});

test('buildTabelPerubahan statis: opts.statis menampilkan tabel lengkap tanpa isian', () => {
  const html = E.buildTabelPerubahan('ts', CFG, null, { statis: true, laju: false });
  assert.equal(count(html, '<input'), 0);
  assert.doesNotMatch(html, /Δy\/Δx/);
  assert.match(html, /5\.000/);
});

test('Lab Pola: state awal, aturan, x lompat, aksi & syarat selesai', () => {
  const st = E.makeLabPolaState();
  assert.equal(st.jenis, 'linear');
  assert.deepEqual(plain(E.xsLabPola(st)), [1, 2, 3, 4, 5]);
  assert.deepEqual(plain(E.aturanLabPola(st)), { jenis: 'linear', m: st.m, c: st.c });
  assert.equal(E.labPolaSelesai(st), false);

  E.ubahLabPola(st, 'm', 1);
  assert.equal(st.m, 3);
  for (let i = 0; i < 10; i++) E.ubahLabPola(st, 'm', 1);
  assert.equal(st.m, 3, 'm dibatasi');
  for (let i = 0; i < 20; i++) E.ubahLabPola(st, 'c', -1);
  assert.equal(st.c, -5, 'c dibatasi');

  E.ubahLabPola(st, 'lompat');
  assert.equal(st.lompat, true);
  assert.equal(st.lompatDicoba, true);
  assert.deepEqual(plain(E.xsLabPola(st)), [1, 2, 4, 5, 8]);

  ['kuadrat', 'eksponen', 'kebalikan'].forEach((j) => E.ubahLabPola(st, 'jenis', j));
  assert.equal(st.jenis, 'kebalikan');
  assert.deepEqual(plain(E.aturanLabPola(st)), { jenis: 'kebalikan', k: 12 });
  assert.equal(E.labPolaSelesai(st), true);

  E.ubahLabPola(st, 'jenis', 'tidakAda');
  assert.equal(st.jenis, 'kebalikan', 'jenis tak dikenal diabaikan');
});

test('labPolaSelesai butuh minimal dua nilai m dicoba', () => {
  const st = E.makeLabPolaState();
  ['kuadrat', 'eksponen', 'kebalikan'].forEach((j) => E.ubahLabPola(st, 'jenis', j));
  E.ubahLabPola(st, 'lompat');
  assert.equal(E.labPolaSelesai(st), false);
  E.ubahLabPola(st, 'jenis', 'linear');
  E.ubahLabPola(st, 'm', -1);
  assert.equal(E.labPolaSelesai(st), true);
});

test('buildLabPolaPerubahan: tombol aturan, pengatur m & c, tabel, grafik, temuan', () => {
  const st = E.makeLabPolaState();
  let html = E.buildLabPolaPerubahan('lab', st);
  assert.equal(count(html, 'data-lab-jenis='), 4);
  assert.match(html, /data-lab-ubah="m"/);
  assert.match(html, /data-lab-ubah="c"/);
  assert.match(html, /data-lab-lompat/);
  assert.match(html, /y = 2x \+ 1/);
  assert.match(html, /<svg/);
  assert.match(html, /tetap/);

  E.ubahLabPola(st, 'jenis', 'kuadrat');
  html = E.buildLabPolaPerubahan('lab', st);
  assert.doesNotMatch(html, /data-lab-ubah="m"/);
  assert.match(html, /berubah-ubah/);
});
