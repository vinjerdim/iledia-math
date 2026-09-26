'use strict';

/*
 * Tes engine seksi 44 — penerapan sifat operasi bilangan berpangkat
 * bulat (perkalian, pembagian, pangkat dari pangkat) & komponen Jigsaw:
 * kartu ahli, eksponen hasil, diagnosa miskonsepsi, langkah sifat
 * (pilih sifat → eksponen → nilai), rantai sifat, pembagian kartu ahli,
 * serta builder HTML-nya.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

/* Objek dari konteks vm berbeda realm; salin ke objek biasa sebelum deepEqual. */
function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function step(op, a, m, n, extra) {
  return Object.assign({ op: op, a: a, m: m, n: n }, extra || {});
}

test('SIFAT_PANGKAT_AHLI: tiga kartu ahli berbentuk peran', () => {
  assert.deepEqual(plain(E.SIFAT_PANGKAT_AHLI.map((s) => s.id)), ['kali', 'bagi', 'pangkat']);
  E.SIFAT_PANGKAT_AHLI.forEach((s) => {
    ['ikon', 'nama', 'ringkas', 'rumus', 'tugas', 'kunci'].forEach((k) =>
      assert.ok(s[k], s.id + '.' + k)
    );
  });
  assert.equal(E.sifatPangkatInfo('bagi').rumus, 'aᵐ : aⁿ = aᵐ⁻ⁿ');
  assert.equal(E.sifatPangkatInfo('basisBeda').id, 'basisBeda');
  assert.equal(E.sifatPangkatInfo('xyz'), null);
});

test('opsiSifatPangkat: empat opsi unik termasuk "basis berbeda"', () => {
  const o = E.opsiSifatPangkat();
  assert.deepEqual(plain(o.map((x) => x.id)), ['kali', 'bagi', 'pangkat', 'basisBeda']);
  o.forEach((x) => assert.ok(x.label));
});

test('eksponenSifat: m + n, m − n, m × n', () => {
  assert.equal(E.eksponenSifat('kali', 3, 4), 7);
  assert.equal(E.eksponenSifat('kali', 5, -2), 3);
  assert.equal(E.eksponenSifat('bagi', 2, 5), -3);
  assert.equal(E.eksponenSifat('pangkat', -2, 3), -6);
  assert.throws(() => E.eksponenSifat('tambah', 1, 2));
});

test('teksSoalSifat & hasilSoalSifat', () => {
  assert.equal(E.teksSoalSifat(step('kali', -2, 3, 4)), '(−2)³ × (−2)⁴');
  assert.equal(E.teksSoalSifat(step('bagi', 4, 2, 5)), '4² : 4⁵');
  assert.equal(E.teksSoalSifat(step('pangkat', 'p', 4, -2)), '(p⁴)⁻²');
  assert.equal(E.teksSoalSifat(step('basisBeda', 2, 3, 2, { b: 3 })), '2³ × 3²');

  let h = E.hasilSoalSifat(step('kali', -2, 3, 4));
  assert.equal(h.k, 7);
  assert.equal(h.teks, '(−2)⁷');
  assert.equal(E.formatPecahan(h.nilai), '−128');

  h = E.hasilSoalSifat(step('bagi', 4, 2, 5));
  assert.equal(h.teks, '4⁻³');
  assert.equal(E.formatPecahan(h.nilai), '1/64');

  h = E.hasilSoalSifat(step('pangkat', 'p', 4, -2));
  assert.equal(h.teks, 'p⁻⁸');
  assert.equal(h.nilai, null);

  h = E.hasilSoalSifat(step('kali', 'y', 6, -6));
  assert.equal(h.k, 0);
  assert.equal(E.formatPecahan(h.nilai), '1', 'y⁰ = 1');

  h = E.hasilSoalSifat(step('basisBeda', 2, 3, 2, { b: 3 }));
  assert.equal(h.k, null);
  assert.equal(E.formatPecahan(h.nilai), '72');
});

test('hasilSoalSifat cocok dengan definisi (dihitung dari perkalian berulang)', () => {
  const kasus = [
    ['kali', 3, 5, -2],
    ['bagi', 7, 9, 4],
    ['bagi', 2, 3, 5],
    ['pangkat', 10, -2, 3],
    ['pangkat', -3, 3, 2],
  ];
  kasus.forEach(([op, a, m, n]) => {
    const cek = E.cekSifatEksponen(op, a, m, n);
    assert.ok(cek.sama, op + ' sifat berlaku');
    assert.ok(E.samaPecahan(E.hasilSoalSifat(step(op, a, m, n)).nilai, cek.kiri));
  });
});

test('diagnosaEksponenSifat: miskonsepsi khas', () => {
  assert.equal(E.diagnosaEksponenSifat('kali', 3, 4, 7), 'benar');
  assert.equal(E.diagnosaEksponenSifat('kali', 3, 4, 12), 'kali');
  assert.equal(E.diagnosaEksponenSifat('kali', 3, 4, -7), 'tanda');
  assert.equal(E.diagnosaEksponenSifat('bagi', 6, 2, 3), 'bagi');
  assert.equal(E.diagnosaEksponenSifat('bagi', 6, 2, 8), 'jumlah');
  assert.equal(E.diagnosaEksponenSifat('bagi', 2, 5, 3), 'tanda');
  assert.equal(E.diagnosaEksponenSifat('pangkat', 2, 3, 5), 'jumlah');
  assert.equal(E.diagnosaEksponenSifat('pangkat', 2, 3, 8), 'pangkatBertingkat');
  assert.equal(E.diagnosaEksponenSifat('pangkat', 2, 3, 100), 'lain');
});

test('pesanEksponenSifat: menyebut sifat yang benar dan perhitungannya', () => {
  const s = step('kali', 2, 3, 4);
  const p = E.pesanEksponenSifat('kali', s, 12);
  assert.match(p, /dijumlahkan/);
  assert.match(p, /3 \+ 4/);
  assert.match(E.pesanEksponenSifat('jumlah', step('bagi', 2, 6, 2), 8), /dikurangkan/);
  assert.match(E.pesanEksponenSifat('jumlah', step('pangkat', 2, 2, 3), 5), /dikalikan/);
  assert.match(E.pesanEksponenSifat('tanda', step('bagi', 2, 2, 5), 3), /2 − 5/);
  assert.ok(E.pesanEksponenSifat('lain', step('kali', 2, 3, 4), 9));
});

test('langkah sifat: pilih sifat, eksponen, lalu nilai', () => {
  const s = step('bagi', 4, 2, 5, { nilai: true });
  const st = E.makeSifatStepState();
  assert.equal(E.sifatStepSelesai(s, st), false);

  assert.equal(E.periksaSifatPilihan(s, st, 'kali'), false);
  assert.equal(st.sifatSalah, 1);
  assert.equal(st.sifat, 'kali');
  assert.equal(E.periksaSifatPilihan(s, st, 'bagi'), true);
  assert.equal(st.sifat, 'bagi');
  assert.equal(st.sifatSalah, 1);
  assert.equal(E.periksaSifatPilihan(s, st, 'kali'), true, 'terkunci setelah benar');
  assert.equal(st.sifat, 'bagi');

  assert.deepEqual(plain(E.periksaSifatEksponen(s, st, '')), { ok: false, error: 'empty' });
  assert.equal(st.kAttempts, 0);
  assert.deepEqual(plain(E.periksaSifatEksponen(s, st, 'dua')), { ok: false, error: 'invalid' });
  assert.deepEqual(plain(E.periksaSifatEksponen(s, st, '3')), { ok: false, error: null });
  assert.equal(st.kKode, 'tanda');
  assert.equal(st.kAttempts, 1);
  assert.deepEqual(plain(E.periksaSifatEksponen(s, st, '−3')), { ok: true, error: null });
  assert.equal(st.kDone, true);
  assert.equal(E.sifatStepSelesai(s, st), false, 'nilai belum');

  assert.equal(E.periksaSifatNilai(s, st, '1/32').ok, false);
  assert.equal(st.nSalah, true);
  assert.equal(E.periksaSifatNilai(s, st, '1/64').ok, true);
  assert.equal(E.sifatStepSelesai(s, st), true);

  assert.deepEqual(plain(E.sifatStepSkor(s, st)), { benar: 0, maks: 3 });
});

test('langkah sifat: skor percobaan pertama & mode tanpa pilih sifat', () => {
  const s = step('kali', 5, 4, 3);
  const st = E.makeSifatStepState();
  E.periksaSifatEksponen(s, st, '7', { pilihSifat: false });
  assert.equal(st.kDone, true);
  assert.equal(E.sifatStepSelesai(s, st, { pilihSifat: false }), true);
  assert.deepEqual(plain(E.sifatStepSkor(s, st, { pilihSifat: false })), { benar: 1, maks: 1 });

  const st2 = E.makeSifatStepState();
  assert.deepEqual(
    plain(E.periksaSifatEksponen(s, st2, '7')),
    { ok: false, error: 'sifat' },
    'eksponen baru boleh diisi setelah sifat tepat'
  );
});

test('langkah sifat basis berbeda: tanpa eksponen, langsung nilai', () => {
  const s = step('basisBeda', 2, 3, 2, { b: 3, nilai: true });
  const st = E.makeSifatStepState();
  assert.equal(E.periksaSifatPilihan(s, st, 'kali'), false);
  assert.equal(E.periksaSifatPilihan(s, st, 'basisBeda'), true);
  assert.equal(st.kDone, true);
  assert.equal(E.periksaSifatNilai(s, st, '72').ok, true);
  assert.equal(E.sifatStepSelesai(s, st), true);
  assert.deepEqual(plain(E.sifatStepSkor(s, st)), { benar: 1, maks: 2 });
});

test('rantai sifat: teks, langkah, dan hasil', () => {
  const r = {
    a: 2,
    awal: 3,
    langkah: [
      { op: 'pangkat', n: 2 },
      { op: 'kali', n: 4 },
      { op: 'bagi', n: 5 },
    ],
    nilai: true,
  };
  assert.equal(E.teksRantai(r), '(2³)² × 2⁴ : 2⁵');
  const L = E.langkahRantai(r);
  assert.deepEqual(plain(L.map((s) => [s.op, s.m, s.n, !!s.nilai])), [
    ['pangkat', 3, 2, false],
    ['kali', 6, 4, false],
    ['bagi', 10, 5, true],
  ]);
  const h = E.hasilRantai(r);
  assert.equal(h.k, 5);
  assert.equal(h.teks, '2⁵');
  assert.equal(E.formatPecahan(h.nilai), '32');

  const r2 = {
    a: 5,
    awal: 4,
    langkah: [
      { op: 'kali', n: -2 },
      { op: 'pangkat', n: 3 },
    ],
  };
  assert.equal(E.teksRantai(r2), '(5⁴ × 5⁻²)³');
  assert.equal(E.hasilRantai(r2).k, 6);
});

test('rantaiSelesai & langkahRantaiAktif', () => {
  const r = {
    a: 3,
    awal: 2,
    langkah: [
      { op: 'pangkat', n: 4 },
      { op: 'bagi', n: 5 },
    ],
  };
  const L = E.langkahRantai(r);
  const states = L.map(() => E.makeSifatStepState());
  assert.equal(E.langkahRantaiAktif(L, states), 0);
  E.periksaSifatPilihan(L[0], states[0], 'pangkat');
  E.periksaSifatEksponen(L[0], states[0], '8');
  assert.equal(E.langkahRantaiAktif(L, states), 1);
  assert.equal(E.rantaiSelesai(L, states), false);
  E.periksaSifatPilihan(L[1], states[1], 'bagi');
  E.periksaSifatEksponen(L[1], states[1], '3');
  assert.equal(E.rantaiSelesai(L, states), true);
  assert.equal(E.langkahRantaiAktif(L, states), L.length);
});

test('jigsawKartuAhli: kartu dibagi berurutan, sisa anggota menjadi pendamping', () => {
  const K = E.SIFAT_PANGKAT_AHLI;
  let p = E.jigsawKartuAhli(['Ani', 'Budi', 'Cici'], K);
  assert.deepEqual(plain(p.map((x) => [x.kartu.id, x.nama])), [
    ['kali', ['Ani']],
    ['bagi', ['Budi']],
    ['pangkat', ['Cici']],
  ]);
  p = E.jigsawKartuAhli(['Ani', 'Budi', 'Cici', 'Dodi'], K);
  assert.deepEqual(plain(p[0].nama), ['Ani', 'Dodi']);
  p = E.jigsawKartuAhli(['Ani', 'Budi'], K);
  assert.deepEqual(plain(p.map((x) => x.nama)), [['Ani'], ['Budi'], ['Ani']]);
  assert.deepEqual(plain(E.jigsawKartuAhli([], K)[0].nama), []);
  assert.equal(E.namaPemegangKartu(['Ani', 'Budi', 'Cici', 'Dodi'], K, 'kali'), 'Ani & Dodi');
  assert.equal(E.namaPemegangKartu([], K, 'kali'), '');
});

test('coopTeamSetupSiap: kartu sudah dibagi & semua kesepakatan dicentang', () => {
  const cfg = { minAnggota: 2, maksAnggota: 4, kesepakatan: [{ id: 'a' }, { id: 'b' }] };
  const st = E.makeCoopTeamSetupState(cfg);
  assert.equal(st.input.length, 4);
  assert.equal(E.coopTeamSetupSiap(st, cfg), false);
  st.anggota = ['Ani', 'Budi'];
  st.sepakat = { a: true };
  assert.equal(E.coopTeamSetupSiap(st, cfg), false);
  st.sepakat.b = true;
  assert.equal(E.coopTeamSetupSiap(st, cfg), true);
});

test('builder HTML: langkah sifat, tab jigsaw, kartu tim, form tim', () => {
  const s = step('kali', 2, 3, 4, { nilai: true });
  const st = E.makeSifatStepState();
  st.sifatOrder = ['pangkat', 'basisBeda', 'kali', 'bagi'];
  let html = E.buildSifatStep('ss1', s, st, { pemimpin: () => 'Ani' });
  assert.match(html, /2³ × 2⁴/);
  assert.ok(html.indexOf('data-sifat-opt="pangkat"') < html.indexOf('data-sifat-opt="kali"'));
  assert.doesNotMatch(html, /ss1K/, 'isian eksponen belum muncul');

  E.periksaSifatPilihan(s, st, 'kali');
  html = E.buildSifatStep('ss1', s, st, { pemimpin: () => 'Ani' });
  assert.match(html, /id="ss1K"/);
  assert.match(html, /Ani/);

  E.periksaSifatEksponen(s, st, '12');
  html = E.buildSifatStep('ss1', s, st);
  assert.match(html, /dijumlahkan/);

  E.periksaSifatEksponen(s, st, '7');
  html = E.buildSifatStep('ss1', s, st);
  assert.match(html, /2⁷/);
  assert.match(html, /id="ss1N"/);

  const tabs = E.buildJigsawTabs('jt', E.SIFAT_PANGKAT_AHLI, 'bagi', {
    selesai: (id) => id === 'kali',
    pemegang: () => 'Ani',
  });
  assert.match(tabs, /data-jigsaw-tab="bagi"[^>]*aria-pressed="true"/);
  assert.match(tabs, /is-done/);

  const kartu = E.buildJigsawTeamCard('Tim Roket', ['Ani', 'Budi'], E.SIFAT_PANGKAT_AHLI);
  assert.match(kartu, /Tim Roket/);
  assert.match(kartu, /Ahli Pangkat dari Pangkat/);

  const cfg = {
    minAnggota: 2,
    maksAnggota: 3,
    kesepakatan: [{ id: 'a', teks: 'Saling <menghargai>' }],
  };
  const form = E.buildCoopTeamSetup('ts', E.makeCoopTeamSetupState(cfg), cfg);
  assert.match(form, /id="tsNama"/);
  assert.match(form, /Saling &lt;menghargai&gt;/);
  assert.equal((form.match(/data-ts-anggota=/g) || []).length, 3);
});
