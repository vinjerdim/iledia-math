'use strict';

/*
 * Tes shared/engine.js seksi 10 & 35 (membaca dan menuliskan pecahan
 * dalam konteks sehari-hari): notasi & cara baca baku pecahan biasa,
 * campuran, dan negatif; pengurai isian teks pecahan; pemeriksa cara
 * baca berdiagnosa (terbalik, tanpa "per", "dari", sebutan sehari-hari,
 * tanda negatif); opsi cara baca teracak; diagnosa menulis pecahan
 * (terbalik, bagian tersisa, bagian-per-sisa, lupa bilangan bulat,
 * senilai, tanda); isian bersusun bertanda; langkah isian pecahan; dan
 * pengarsir pecahan interaktif.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function P(num, den, whole, neg) {
  return { num, den, whole: whole || null, neg: !!neg };
}

/* ---------- notasi & cara baca baku ---------- */

test('tulisPecahan: biasa, campuran, negatif', () => {
  assert.equal(E.tulisPecahan(P(3, 4)), '3/4');
  assert.equal(E.tulisPecahan(P(1, 2, 2)), '2 1/2');
  assert.equal(E.tulisPecahan(P(3, 4, 0, true)), '−3/4');
  assert.equal(E.tulisPecahan(P(1, 4, 1, true)), '−1 1/4');
});

test('bacaPecahanKonteks: pembilang "per" penyebut, bulat dibaca lebih dulu, tanda "negatif"', () => {
  assert.equal(E.bacaPecahanKonteks(P(3, 4)), 'tiga per empat');
  assert.equal(E.bacaPecahanKonteks(P(5, 12)), 'lima per dua belas');
  assert.equal(E.bacaPecahanKonteks(P(1, 2, 2)), 'dua satu per dua');
  assert.equal(E.bacaPecahanKonteks(P(1, 2, 0, true)), 'negatif satu per dua');
  assert.equal(E.bacaPecahanKonteks(P(3, 4, 1, true)), 'negatif satu tiga per empat');
});

/* ---------- pengurai isian teks ---------- */

test('parseTeksPecahan: menerima 3/4, 2 1/2, -3/4, −1 1/4, spasi longgar', () => {
  assert.deepEqual(plain(E.parseTeksPecahan('3/4').value), P(3, 4));
  assert.deepEqual(plain(E.parseTeksPecahan(' 2 1/2 ').value), P(1, 2, 2));
  assert.deepEqual(plain(E.parseTeksPecahan('-3/4').value), P(3, 4, 0, true));
  assert.deepEqual(plain(E.parseTeksPecahan('−1 1/4').value), P(1, 4, 1, true));
  assert.deepEqual(plain(E.parseTeksPecahan('3 / 4').value), P(3, 4));
});

test('parseTeksPecahan: galat kosong, format, penyebut nol', () => {
  assert.equal(E.parseTeksPecahan('').error, 'kosong');
  assert.equal(E.parseTeksPecahan('tiga per empat').error, 'format');
  assert.equal(E.parseTeksPecahan('3').error, 'format');
  assert.equal(E.parseTeksPecahan('3:4').error, 'format');
  assert.equal(E.parseTeksPecahan('3/0').error, 'nol-penyebut');
});

/* ---------- pemeriksa cara baca ---------- */

test('cekCaraBacaPecahan: bentuk baku benar, huruf besar & tanda baca diabaikan', () => {
  assert.equal(E.cekCaraBacaPecahan('tiga per empat', P(3, 4)).kode, 'benar');
  assert.equal(E.cekCaraBacaPecahan('  Tiga PER empat. ', P(3, 4)).kode, 'benar');
  assert.equal(E.cekCaraBacaPecahan('positif tiga per empat', P(3, 4)).kode, 'benar');
  assert.equal(E.cekCaraBacaPecahan('dua satu per dua', P(1, 2, 2)).kode, 'benar');
  assert.equal(E.cekCaraBacaPecahan('dua dan satu per dua', P(1, 2, 2)).kode, 'benar');
  assert.equal(E.cekCaraBacaPecahan('negatif tiga per empat', P(3, 4, 0, true)).kode, 'benar');
  assert.ok(E.cekCaraBacaPecahan('tiga per empat', P(3, 4)).benar);
});

test('cekCaraBacaPecahan: sebutan sehari-hari diterima dengan catatan bentuk baku', () => {
  ['setengah', 'seperdua'].forEach((t) => {
    const r = E.cekCaraBacaPecahan(t, P(1, 2));
    assert.equal(r.kode, 'sehari', t);
    assert.ok(r.benar);
    assert.match(r.pesan, /satu per dua/);
  });
  assert.equal(E.cekCaraBacaPecahan('seperempat', P(1, 4)).kode, 'sehari');
  assert.equal(E.cekCaraBacaPecahan('tiga perempat', P(3, 4)).kode, 'sehari');
  assert.equal(E.cekCaraBacaPecahan('dua setengah', P(1, 2, 2)).kode, 'sehari');
  assert.equal(E.cekCaraBacaPecahan('negatif setengah', P(1, 2, 0, true)).kode, 'sehari');
});

test('cekCaraBacaPecahan: diagnosa miskonsepsi membaca', () => {
  const k = (t, p) => E.cekCaraBacaPecahan(t, p).kode;
  assert.equal(k('', P(3, 4)), 'kosong');
  assert.equal(k('empat per tiga', P(3, 4)), 'terbalik');
  assert.equal(k('tiga empat', P(3, 4)), 'tanpa-per');
  assert.equal(k('tiga dari empat', P(3, 4)), 'penghubung');
  assert.equal(k('tiga bagi empat', P(3, 4)), 'penghubung');
  assert.equal(k('satu per dua', P(1, 2, 2)), 'lupa-bulat');
  assert.equal(k('satu per dua dua', P(1, 2, 2)), 'urutan-campuran');
  assert.equal(k('dua per lima', P(3, 4)), 'angka-salah');
  /* tanda */
  assert.equal(k('minus tiga per empat', P(3, 4, 0, true)), 'minus');
  assert.equal(k('min tiga per empat', P(3, 4, 0, true)), 'minus');
  assert.equal(k('tiga per empat negatif', P(3, 4, 0, true)), 'urutan-terbalik');
  assert.equal(k('tiga per empat', P(3, 4, 0, true)), 'lupa-negatif');
  assert.equal(k('positif tiga per empat', P(3, 4, 0, true)), 'tanda-terbalik');
  assert.equal(k('negatif tiga per empat', P(3, 4)), 'tanda-terbalik');
  assert.equal(k('plus tiga per empat', P(3, 4)), 'plus');
  /* salah bentuk tetap didiagnosa walau tandanya benar */
  assert.equal(k('negatif empat per tiga', P(3, 4, 0, true)), 'terbalik');
});

test('cekCaraBacaPecahan: setiap kode salah punya pesan', () => {
  const salah = [
    ['', P(3, 4)],
    ['empat per tiga', P(3, 4)],
    ['tiga empat', P(3, 4)],
    ['tiga dari empat', P(3, 4)],
    ['satu per dua', P(1, 2, 2)],
    ['satu per dua dua', P(1, 2, 2)],
    ['dua per lima', P(3, 4)],
    ['minus tiga per empat', P(3, 4, 0, true)],
    ['tiga per empat negatif', P(3, 4, 0, true)],
    ['tiga per empat', P(3, 4, 0, true)],
    ['negatif tiga per empat', P(3, 4)],
    ['plus tiga per empat', P(3, 4)],
  ];
  salah.forEach(([t, p]) => {
    const r = E.cekCaraBacaPecahan(t, p);
    assert.equal(r.benar, false, t);
    assert.ok(r.pesan && r.pesan.length > 10, 'pesan untuk ' + r.kode);
  });
});

/* ---------- opsi cara baca ---------- */

test('opsiCaraBacaPecahan: 4 opsi unik, tepat satu benar (id "baku")', () => {
  [P(3, 4), P(5, 8), P(1, 2, 2), P(1, 2, 0, true), P(3, 4, 1, true)].forEach((p) => {
    const o = E.opsiCaraBacaPecahan(p);
    assert.equal(o.length, 4);
    assert.equal(new Set(o.map((x) => x.id)).size, 4);
    assert.equal(new Set(o.map((x) => x.label)).size, 4, 'label unik');
    const benar = o.filter((x) => x.benar);
    assert.equal(benar.length, 1);
    assert.equal(benar[0].id, 'baku');
    assert.equal(benar[0].label, E.bacaPecahanKonteks(p));
    o.forEach((x) => assert.ok(x.umpan));
    /* setiap pengecoh memang didiagnosa salah oleh pemeriksa */
    o.filter((x) => !x.benar).forEach((x) =>
      assert.equal(E.cekCaraBacaPecahan(x.label, p).benar, false, x.label)
    );
  });
});

test('opsiCaraBacaPecahan: pengecoh khas per bentuk', () => {
  const ids = (p) => E.opsiCaraBacaPecahan(p).map((x) => x.id);
  assert.ok(ids(P(3, 4)).includes('penghubung'));
  assert.ok(ids(P(1, 2, 2)).includes('urutan-campuran'));
  assert.ok(ids(P(1, 2, 0, true)).includes('minus'));
});

/* ---------- diagnosa menulis ---------- */

test('diagnosaTulisPecahan: notasi tepat', () => {
  assert.equal(E.diagnosaTulisPecahan(P(3, 8), P(3, 8)).kode, 'benar');
  assert.ok(E.diagnosaTulisPecahan(P(3, 8), P(3, 8)).benar);
  assert.equal(E.diagnosaTulisPecahan(P(1, 2, 2), P(1, 2, 2)).kode, 'benar');
  assert.equal(E.diagnosaTulisPecahan(P(3, 4, 0, true), P(3, 4, 0, true)).kode, 'benar');
  /* bulat 0 sama dengan tanpa bulat */
  assert.equal(E.diagnosaTulisPecahan({ num: 3, den: 8, whole: 0 }, P(3, 8)).kode, 'benar');
});

test('diagnosaTulisPecahan: miskonsepsi menulis', () => {
  const k = (v, p) => E.diagnosaTulisPecahan(v, p).kode;
  assert.equal(k(P(8, 3), P(3, 8)), 'terbalik');
  assert.equal(k(P(5, 8), P(3, 8)), 'komplemen');
  assert.equal(k(P(3, 5), P(3, 8)), 'bagian-per-sisa');
  assert.equal(k(P(1, 2), P(1, 2, 2)), 'lupa-bulat');
  assert.equal(k(P(5, 2), P(1, 2, 2)), 'senilai');
  assert.equal(k(P(1, 2), P(4, 8)), 'senilai');
  assert.equal(k(P(3, 4), P(3, 4, 0, true)), 'lupa-negatif');
  assert.equal(k(P(3, 4, 0, true), P(3, 4)), 'tanda-lebih');
  assert.equal(k(P(3, 0), P(3, 4)), 'nol-penyebut');
  assert.equal(k(P(2, 7), P(3, 8)), 'salah');
});

test('diagnosaTulisPecahan: setiap kode salah punya pesan', () => {
  [
    [P(8, 3), P(3, 8)],
    [P(5, 8), P(3, 8)],
    [P(3, 5), P(3, 8)],
    [P(1, 2), P(1, 2, 2)],
    [P(1, 2), P(4, 8)],
    [P(3, 4), P(3, 4, 0, true)],
    [P(3, 4, 0, true), P(3, 4)],
    [P(3, 0), P(3, 4)],
    [P(2, 7), P(3, 8)],
  ].forEach(([v, p]) => {
    const r = E.diagnosaTulisPecahan(v, p);
    assert.equal(r.benar, false);
    assert.ok(r.pesan && r.pesan.length > 10, 'pesan untuk ' + r.kode);
  });
});

test('periksaTeksPecahan: isian teks → diagnosa', () => {
  assert.equal(E.periksaTeksPecahan('3/8', P(3, 8)).kode, 'benar');
  assert.equal(E.periksaTeksPecahan('8/3', P(3, 8)).kode, 'terbalik');
  assert.equal(E.periksaTeksPecahan('-3/4', P(3, 4, 0, true)).kode, 'benar');
  assert.equal(E.periksaTeksPecahan('tiga', P(3, 8)).kode, 'format');
  assert.equal(E.periksaTeksPecahan('3/0', P(3, 8)).kode, 'nol-penyebut');
  assert.equal(E.periksaTeksPecahan('', P(3, 8)).kode, 'kosong');
  assert.ok(E.periksaTeksPecahan('tiga', P(3, 8)).pesan);
});

/* ---------- isian bersusun bertanda (seksi 10) ---------- */

function fakeRoot(values) {
  return {
    querySelector(sel) {
      const id = sel.replace(/^#/, '');
      return Object.prototype.hasOwnProperty.call(values, id) ? { value: values[id] } : null;
    },
  };
}

test('buildFractionInput: opsi signed menambah pilihan tanda; tanpa opsi tetap seperti semula', () => {
  const polos = E.buildFractionInput('f', {});
  assert.doesNotMatch(polos, /fSign/);
  const bertanda = E.buildFractionInput('f', { sign: '-' }, { signed: true });
  assert.match(bertanda, /id="fSign"/);
  assert.match(bertanda, /<option value="-" selected/);
});

test('readFractionInput: membaca tanda negatif', () => {
  const r = E.readFractionInput(fakeRoot({ fSign: '-', fNum: '3', fDen: '4' }), 'f');
  assert.equal(r.error, null);
  assert.equal(r.value.neg, true);
  assert.equal(r.raw.sign, '-');
  const r2 = E.readFractionInput(fakeRoot({ fNum: '1', fDen: '2', fWhole: '2' }), 'f');
  assert.equal(r2.value.neg, false);
  assert.equal(r2.value.whole, 2);
});

/* ---------- langkah isian pecahan ---------- */

test('periksaPecahanStep: tulis (isian bersusun) & baca (teks)', () => {
  const st = E.makePecahanStep();
  const stepTulis = { jenis: 'tulis', jawab: P(3, 8) };
  let r = E.periksaPecahanStep(st, stepTulis, {
    raw: { num: '5', den: '8' },
    value: P(5, 8),
    error: null,
  });
  assert.equal(r.kode, 'komplemen');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  r = E.periksaPecahanStep(st, stepTulis, {
    raw: { num: '', den: '' },
    value: null,
    error: 'empty',
  });
  assert.equal(r.kode, 'kosong');
  assert.equal(st.attempts, 1, 'isian kosong bukan percobaan');
  r = E.periksaPecahanStep(st, stepTulis, {
    raw: { num: '3', den: '8' },
    value: P(3, 8),
    error: null,
  });
  assert.equal(st.done, true);
  assert.equal(st.attempts, 2);

  const sb = E.makePecahanStep();
  E.periksaPecahanStep(sb, { jenis: 'baca', jawab: P(3, 8) }, 'tiga per delapan');
  assert.equal(sb.done, true);
  assert.equal(sb.input, 'tiga per delapan');
});

test('buildPecahanStep: menampilkan isian, umpan balik, dan jawaban saat selesai', () => {
  const st = E.makePecahanStep();
  const step = { jenis: 'tulis', jawab: P(3, 8), label: 'Tulis', hints: ['h1'] };
  assert.match(E.buildPecahanStep('ps', st, step, 1), /id="psFracNum"/);
  st.done = true;
  assert.match(E.buildPecahanStep('ps', st, step, 1), /tiga per delapan/);
  const sb = E.makePecahanStep();
  assert.match(
    E.buildPecahanStep('pb', sb, { jenis: 'baca', jawab: P(3, 8), label: 'Baca' }),
    /id="pbInput"/
  );
});

/* ---------- pengarsir pecahan ---------- */

test('pengarsir: state, ubah banyak bagian, arsir, nilai', () => {
  const state = {};
  const st = E.ensureFracShaderState(state, 'sh', 1);
  assert.equal(st.den, 1);
  assert.equal(st.on.length, 1);
  E.fracShaderSetDen(st, 8);
  assert.equal(st.den, 8);
  assert.equal(st.on.length, 8);
  E.fracShaderSetDen(st, 99);
  assert.equal(st.den, E.FRAC_SHADER_MAX);
  E.fracShaderSetDen(st, 0);
  assert.equal(st.den, 1);
  E.fracShaderSetDen(st, 8);
  [0, 3, 5].forEach((i) => E.fracShaderToggle(st, i));
  assert.deepEqual(plain(E.fracShaderValue(st)), { num: 3, den: 8 });
  E.fracShaderToggle(st, 3);
  assert.deepEqual(plain(E.fracShaderValue(st)), { num: 2, den: 8 });
  /* state lama yang rusak dipulihkan */
  state.sh = { den: 4, on: [true] };
  assert.equal(E.ensureFracShaderState(state, 'sh', 1).on.length, 4);
});

test('cekFracShader: benar, penyebut salah, bagian tersisa, pembilang salah', () => {
  const st = (den, n) => ({ den, on: Array.from({ length: den }, (_, i) => i < n) });
  assert.equal(E.cekFracShader(st(8, 3), P(3, 8)).kode, 'benar');
  assert.equal(E.cekFracShader(st(6, 3), P(3, 8)).kode, 'penyebut');
  assert.equal(E.cekFracShader(st(8, 5), P(3, 8)).kode, 'komplemen');
  assert.equal(E.cekFracShader(st(8, 2), P(3, 8)).kode, 'pembilang');
  ['penyebut', 'komplemen', 'pembilang'].forEach((k, i) => {
    const r = E.cekFracShader([st(6, 3), st(8, 5), st(8, 2)][i], P(3, 8));
    assert.equal(r.benar, false);
    assert.ok(r.pesan, k);
  });
});

test('buildFracShader: tombol bagian dapat diketuk & label aksesibel', () => {
  const st = { den: 4, on: [true, false, false, false] };
  const html = E.buildFracShader('sh', st, {});
  assert.equal((html.match(/data-shader-cell=/g) || []).length, 4);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /id="shMinus"/);
  assert.match(html, /id="shPlus"/);
});

/* ---------- opsi notasi ---------- */

test('opsiNotasiPecahan: 4 notasi unik, tepat satu benar, pengecoh didiagnosa salah', () => {
  [P(3, 4), P(1, 2), P(5, 8), P(1, 2, 2), P(2, 5, 0, true), P(1, 2, 1, true)].forEach((p) => {
    const o = E.opsiNotasiPecahan(p);
    assert.equal(o.length, 4);
    assert.equal(new Set(o.map((x) => x.id)).size, 4);
    assert.equal(new Set(o.map((x) => x.label)).size, 4, 'label unik ' + E.tulisPecahan(p));
    const benar = o.filter((x) => x.benar);
    assert.equal(benar.length, 1);
    assert.equal(benar[0].id, 'baku');
    assert.equal(benar[0].label, E.tulisPecahan(p));
    o.forEach((x) => assert.ok(x.umpan));
    o.filter((x) => !x.benar).forEach((x) => {
      const r = E.periksaTeksPecahan(x.label, p);
      assert.equal(r.benar, false, x.label);
    });
  });
});

test('opsiNotasiPecahan: pengecoh khas per bentuk', () => {
  const ids = (p) => E.opsiNotasiPecahan(p).map((x) => x.id);
  assert.ok(ids(P(3, 8)).includes('komplemen'));
  assert.ok(ids(P(1, 2)).includes('tanpa-garis'));
  assert.ok(ids(P(1, 2, 2)).includes('lupa-bulat'));
  assert.ok(ids(P(2, 5, 0, true)).includes('tanpa-tanda'));
});
