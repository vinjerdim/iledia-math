'use strict';

/*
 * Tes shared/engine.js seksi 17 (penjumlahan & pengurangan bilangan
 * bulat): notasi operasi, lompatan garis bilangan, model kalimat
 * matematika dari cerita (naik/turun, selisih), diagnosa miskonsepsi
 * hasil operasi, langkah isian jenis 'hitung' (seksi 29), serta render
 * garis bilangan berlompatan dan simulator operasi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

/* ---------- notasi & lompatan ---------- */

test('fmtBulat & fmtOperasiBulat: minus tipografis, bilangan kedua negatif berkurung', () => {
  assert.equal(E.fmtBulat(-12), '−12');
  assert.equal(E.fmtBulat(1500), '1.500');
  assert.equal(E.fmtOperasiBulat(-4, '+', 7), '−4 + 7');
  assert.equal(E.fmtOperasiBulat(5, '-', -2), '5 − (−2)');
  assert.equal(E.fmtOperasiBulat(-12000, '+', 30000), '−12.000 + 30.000');
});

test('integerJumps: pengurangan = penjumlahan dengan lawan', () => {
  assert.deepEqual(plain(E.integerJumps(-4, '+', 7)), {
    start: -4,
    by: 7,
    hasil: 3,
    setara: '−4 + 7',
  });
  assert.deepEqual(plain(E.integerJumps(5, '-', -2)), {
    start: 5,
    by: 2,
    hasil: 7,
    setara: '5 + 2',
  });
  assert.equal(E.integerJumps(4, '-', 7).setara, '4 + (−7)');
  assert.equal(E.arahLompatan(3), 'kanan');
  assert.equal(E.arahLompatan(-1), 'kiri');
  assert.equal(E.arahLompatan(0), 'diam');
});

/* ---------- model dari cerita ---------- */

test('kalimatPerubahan: naik → tambah, turun → kurang', () => {
  assert.deepEqual(plain(E.kalimatPerubahan(-4, 'naik', 7)), {
    a: -4,
    op: '+',
    b: 7,
    hasil: 3,
    teks: '−4 + 7',
  });
  assert.deepEqual(plain(E.kalimatPerubahan(4, 'turun', 7)), {
    a: 4,
    op: '-',
    b: 7,
    hasil: -3,
    teks: '4 − 7',
  });
  /* besar selalu diambil nilai mutlaknya */
  assert.equal(E.kalimatPerubahan(-12, 'naik', -5).teks, '−12 + 5');
  assert.equal(E.kalimatPerubahan(-12, 'naik', -5).hasil, -7);
});

test('selisihBulat: yang lebih tinggi dikurangi yang lebih rendah', () => {
  assert.deepEqual(plain(E.selisihBulat(8, -5)), {
    a: 8,
    op: '-',
    b: -5,
    hasil: 13,
    teks: '8 − (−5)',
  });
  /* urutan masukan tidak penting: selisih selalu ≥ 0 */
  assert.equal(E.selisihBulat(-5, 8).teks, '8 − (−5)');
  assert.equal(E.selisihBulat(-30, 120).hasil, 150);
  assert.equal(E.selisihBulat(-2, -5).teks, '−2 − (−5)');
  assert.equal(E.selisihBulat(-2, -5).hasil, 3);
});

/* ---------- diagnosa hasil operasi ---------- */

test('diagnosaOperasiBulat: benar menerima −, −, +, dan pemisah ribuan', () => {
  ['3', '+3', ' 3 '].forEach((v) =>
    assert.equal(E.diagnosaOperasiBulat(v, -4, '+', 7).benar, true)
  );
  ['-3', '−3', '–3'].forEach((v) =>
    assert.equal(E.diagnosaOperasiBulat(v, 4, '-', 7).benar, true, v)
  );
  assert.equal(E.diagnosaOperasiBulat('18.000', -12000, '+', 30000).benar, true);
  const r = E.diagnosaOperasiBulat('3', -4, '+', 7);
  assert.equal(r.kode, 'benar');
  assert.match(r.pesan, /−4 \+ 7 = 3/);
});

test('diagnosaOperasiBulat: isian kosong / bukan bilangan memakai pesan parser', () => {
  assert.equal(E.diagnosaOperasiBulat('', 1, '+', 2).kode, 'kosong');
  assert.equal(E.diagnosaOperasiBulat('3-', 1, '+', 2).kode, 'tanda-belakang');
  assert.equal(E.diagnosaOperasiBulat('min 3', 1, '+', 2).kode, 'kata-min');
  assert.equal(E.diagnosaOperasiBulat('abc', 1, '+', 2).kode, 'bukan-bulat');
});

test('diagnosaOperasiBulat: tanda hasil terbalik', () => {
  const r = E.diagnosaOperasiBulat('-3', -4, '+', 7);
  assert.equal(r.benar, false);
  assert.equal(r.kode, 'tanda-hasil');
  assert.equal(E.diagnosaOperasiBulat('7', -12, '+', 5).kode, 'tanda-hasil');
});

test('diagnosaOperasiBulat: pengurangan dikerjakan sebagai penjumlahan', () => {
  /* 5 − (−3) dijawab 2 (= 5 + (−3)) */
  const r = E.diagnosaOperasiBulat('2', 5, '-', -3);
  assert.equal(r.kode, 'kurang-salah');
  assert.match(r.pesan, /5 \+ 3/);
  /* 8 − (−5) dijawab 3 */
  assert.equal(E.diagnosaOperasiBulat('3', 8, '-', -5).kode, 'kurang-salah');
});

test('diagnosaOperasiBulat: penjumlahan bilangan negatif dibuat ke arah yang salah', () => {
  /* 5 + (−8) dijawab 13 (melompat ke kanan) */
  const r = E.diagnosaOperasiBulat('13', 5, '+', -8);
  assert.equal(r.kode, 'arah-terbalik');
  assert.match(r.pesan, /kiri/);
  /* −3 + 6 dijawab −9 */
  assert.equal(E.diagnosaOperasiBulat('-9', -3, '+', 6).kode, 'arah-terbalik');
});

test('diagnosaOperasiBulat: tanda negatif diabaikan', () => {
  /* −6 − 4 dijawab 2 (6 − 4) */
  const r = E.diagnosaOperasiBulat('2', -6, '-', 4);
  assert.equal(r.kode, 'abaikan-negatif');
  /* −3 + (−5) dijawab 8 → tanda hasil terbalik lebih dulu terdeteksi */
  assert.equal(E.diagnosaOperasiBulat('8', -3, '+', -5).kode, 'tanda-hasil');
});

test('diagnosaOperasiBulat: jawaban lain → saran garis bilangan', () => {
  const r = E.diagnosaOperasiBulat('100', -4, '+', 7);
  assert.equal(r.kode, 'lain');
  assert.match(r.pesan, /garis bilangan/);
});

/* ---------- langkah isian jenis 'hitung' (seksi 29) ---------- */

test("periksaCekStep jenis 'hitung' memakai diagnosaOperasiBulat", () => {
  const step = { jenis: 'hitung', a: 5, op: '-', b: -3, jawab: 8 };
  const st = E.makeCekStep();
  E.periksaCekStep(st, step, '');
  assert.equal(st.attempts, 0, 'isian kosong tidak dihitung');
  E.periksaCekStep(st, step, '2');
  assert.equal(st.done, false);
  assert.equal(st.kode, 'kurang-salah');
  assert.equal(st.attempts, 1);
  E.periksaCekStep(st, step, '8');
  assert.equal(st.done, true);
  assert.equal(st.attempts, 2);
});

test("buildCekStep jenis 'hitung': isian bilangan & jawaban selesai bernotasi baku", () => {
  const step = { jenis: 'hitung', a: 4, op: '-', b: 7, jawab: -3, label: '4 − 7 = …' };
  const st = E.makeCekStep();
  const html = E.buildCekStep('h0', st, step, 1);
  assert.match(html, /dl-num-input/);
  assert.doesNotMatch(html, /bbk-baca-input/);
  st.done = true;
  assert.match(E.buildCekStep('h0', st, step, 1), /✓ −3/);
});

/* ---------- render ---------- */

test('buildNumberLineJumps: busur kiri untuk lompatan negatif & label aksesibel', () => {
  const html = E.buildNumberLineJumps('nl', { min: -10, max: 10, start: 5, jumps: [{ by: -8 }] });
  assert.match(html, /nlj-arc--neg/);
  assert.match(
    html,
    /aria-label="Garis bilangan: mulai dari 5, melompat 8 ke kiri, berhenti di −3"/
  );
  /* label "mulai"/"hasil" di bawah sumbu harus muat di dalam viewBox */
  const tinggi = Number(/viewBox="0 0 \d+ (\d+)"/.exec(html)[1]);
  const labelY = Math.max(
    ...[...html.matchAll(/class="nlj-(?:start|end)__label" x="[\d.]+" y="([\d.]+)"/g)].map((m) =>
      Number(m[1])
    )
  );
  assert.ok(labelY + 6 <= tinggi, 'label bawah tidak terpotong');
  const tutup = E.buildNumberLineJumps('nl', { start: 1, jumps: [{ by: 2 }], showEnd: false });
  assert.match(tutup, /hasilnya belum ditampilkan/);
});

test('buildIntegerOpSimulator: kalimat, bentuk setara pengurangan, dan hasil', () => {
  const html = E.buildIntegerOpSimulator('sim', { a: -2, op: '-', b: -5 }, { min: -12, max: 12 });
  assert.match(html, /−2 − \(−5\)/);
  assert.match(html, /= −2 \+ 5/);
  assert.match(html, /<strong>3<\/strong>/);
  assert.match(html, /5 langkah ke kanan/);
  const tutup = E.buildIntegerOpSimulator('sim', { a: 1, op: '+', b: 1 }, { showResult: false });
  assert.match(tutup, /<strong>\?<\/strong>/);
});
