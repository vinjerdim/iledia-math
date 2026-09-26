'use strict';

/*
 * Tes seksi 42 shared/engine.js: jumlah n suku pertama deret aritmetika —
 * rumus dari suku pertama & suku terakhir, penulisan deret, pasangan
 * Gauss, n minimal agar jumlah mencapai target, diagnosa miskonsepsi
 * rumus Sₙ, opsi pilihan ganda berpengecoh, serta komponen tabel
 * pasangan Gauss, tangga batang (SVG), dan lab jumlah berjalan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

test('jumlahAritmetikaUjung sama dengan jumlahAritmetika', () => {
  assert.equal(E.jumlahAritmetikaUjung(15, 160, 30), 2625);
  assert.equal(E.jumlahAritmetikaUjung(1, 100, 100), 5050);
  [
    [15, 5],
    [3, 2],
    [40, -3],
    [-7, 4],
  ].forEach(([a, b]) => {
    for (let n = 1; n <= 12; n++) {
      const un = E.sukuAritmetika(a, b, n);
      assert.equal(E.jumlahAritmetikaUjung(a, un, n), E.jumlahAritmetika(a, b, n));
    }
  });
});

test('fmtAngkaDeret: bulat bergaya Indonesia, desimal berkoma, minus tipografis', () => {
  assert.equal(E.fmtAngkaDeret(2625), '2.625');
  assert.equal(E.fmtAngkaDeret(-8), '−8');
  assert.equal(E.fmtAngkaDeret(2.5), '2,5');
  assert.equal(E.fmtAngkaDeret(-0.5), '−0,5');
});

test('tulisDeret: semua suku bila pendek, disingkat dengan … bila panjang', () => {
  assert.equal(E.tulisDeret(15, 5, 4), '15 + 20 + 25 + 30');
  assert.equal(E.tulisDeret(15, 5, 30), '15 + 20 + 25 + … + 160');
  assert.equal(E.tulisDeret(15, 5, 7, 7), '15 + 20 + 25 + 30 + 35 + 40 + 45');
  assert.equal(E.tulisDeret(7, -3, 4), '7 + 4 + 1 + (−2)');
  assert.equal(E.tulisDeret(1, 1, 100), '1 + 2 + 3 + … + 100');
});

test('pasanganGauss: suku maju dipasangkan dengan suku mundur, jumlahnya tetap', () => {
  const p = E.pasanganGauss([15, 20, 25, 30, 35, 40]);
  assert.equal(p.length, 6);
  assert.deepEqual(
    { kiri: p[0].kiri, kanan: p[0].kanan, jumlah: p[0].jumlah },
    { kiri: 15, kanan: 40, jumlah: 55 }
  );
  assert.ok(p.every((x) => x.jumlah === 55));
  /* banyak suku ganjil: suku tengah berpasangan dengan dirinya sendiri */
  const q = E.pasanganGauss([2, 5, 8, 11, 14]);
  assert.equal(q[2].kiri, 8);
  assert.equal(q[2].kanan, 8);
  assert.ok(q.every((x) => x.jumlah === 16));
  assert.equal(E.pasanganGauss([]).length, 0);
});

test('nMinimalJumlahMencapai', () => {
  assert.equal(E.nMinimalJumlahMencapai(15, 5, 1000), 18);
  assert.equal(E.jumlahAritmetika(15, 5, 17) < 1000, true);
  assert.equal(E.nMinimalJumlahMencapai(15, 5, 15), 1);
  assert.equal(E.nMinimalJumlahMencapai(10, 0, 95), 10);
  /* deret turun yang tidak pernah mencapai target */
  assert.equal(E.nMinimalJumlahMencapai(10, -2, 1000), null);
  assert.equal(E.nMinimalJumlahMencapai(1, 0, 5000, 100), null);
});

test('diagnosaJumlahDeret mengenali miskonsepsi rumus Sₙ', () => {
  /* a = 15, b = 5, n = 30: U₃₀ = 160, S₃₀ = 2.625 */
  assert.equal(E.diagnosaJumlahDeret(15, 5, 30, 2625), null);
  assert.equal(E.diagnosaJumlahDeret(15, 5, 30, 160), 'suku-bukan-jumlah');
  assert.equal(E.diagnosaJumlahDeret(15, 5, 30, 4800), 'n-kali-un');
  assert.equal(E.diagnosaJumlahDeret(15, 5, 30, 5250), 'lupa-bagi-dua');
  assert.equal(E.diagnosaJumlahDeret(15, 5, 30, 2700), 'n-bukan-n-kurang-1');
  assert.equal(E.diagnosaJumlahDeret(15, 5, 30, 2465), 'kurang-satu-suku');
  assert.equal(E.diagnosaJumlahDeret(15, 5, 30, 1234), 'lain');
  assert.equal(E.diagnosaJumlahDeret(15, 5, 30, NaN), 'lain');
});

test('pesanDiagnosaJumlahDeret memberi pesan untuk setiap kode', () => {
  [
    'suku-bukan-jumlah',
    'n-kali-un',
    'lupa-bagi-dua',
    'n-bukan-n-kurang-1',
    'kurang-satu-suku',
    'lain',
  ].forEach((k) => {
    const m = E.pesanDiagnosaJumlahDeret(k, 15, 5, 30);
    assert.equal(typeof m, 'string');
    assert.ok(m.length > 20, k);
  });
  assert.match(E.pesanDiagnosaJumlahDeret('lupa-bagi-dua', 15, 5, 30), /2/);
  assert.match(E.pesanDiagnosaJumlahDeret('suku-bukan-jumlah', 15, 5, 30), /U₃₀/);
  assert.equal(E.pesanDiagnosaJumlahDeret(null, 15, 5, 30), '');
});

test('opsiJumlahDeret: kunci + pengecoh miskonsepsi, id & nilai unik', () => {
  const o = E.opsiJumlahDeret(15, 5, 30);
  assert.ok(o.length >= 4);
  assert.equal(o[0].id, 'benar');
  assert.equal(o[0].nilai, 2625);
  assert.equal(o[0].label, '2.625');
  assert.equal(new Set(o.map((x) => x.id)).size, o.length);
  assert.equal(new Set(o.map((x) => x.nilai)).size, o.length);
  o.slice(1).forEach((x) => assert.equal(E.diagnosaJumlahDeret(15, 5, 30, x.nilai), x.id));
  /* nilai kembar (mis. n = 1) dibuang, satuan ditambahkan */
  const kecil = E.opsiJumlahDeret(4, 3, 2, { satuan: 'XP' });
  assert.equal(new Set(kecil.map((x) => x.nilai)).size, kecil.length);
  assert.match(kecil[0].label, / XP$/);
});

test('gaussPairAllTapped', () => {
  assert.equal(E.gaussPairAllTapped([true, true, true], 3), true);
  assert.equal(E.gaussPairAllTapped([true, false, true], 3), false);
  assert.equal(E.gaussPairAllTapped([true, true], 3), false);
  assert.equal(E.gaussPairAllTapped(null, 3), false);
});

test('buildGaussPairTable: baris maju & mundur, tombol pasangan, hasil setelah semua diketuk', () => {
  const terms = [15, 20, 25, 30, 35, 40];
  const html = E.buildGaussPairTable('gp', terms, [false, false, false, false, false, false], {
    label: 'S₆',
  });
  assert.equal((html.match(/data-gauss-col=/g) || []).length, 6);
  assert.match(html, /S₆ =/);
  assert.match(html, /role="group"/);
  assert.doesNotMatch(html, /gauss-result/);
  /* satu kolom sudah diketuk: jumlah pasangannya tampil */
  const satu = E.buildGaussPairTable('gp', terms, [true, false, false, false, false, false], {
    label: 'S₆',
  });
  assert.match(satu, />55</);
  assert.equal((satu.match(/data-gauss-col=/g) || []).length, 5);
  const done = E.buildGaussPairTable('gp', terms, [true, true, true, true, true, true], {
    label: 'S₆',
  });
  assert.match(done, /gauss-result/);
  assert.match(done, /2S₆/);
  assert.match(done, /6 × 55/);
});

test('buildStaircaseSeriesSVG: satu batang per suku; salinan terbalik membentuk persegi panjang', () => {
  const terms = [15, 20, 25, 30];
  const svg = E.buildStaircaseSeriesSVG(terms, { caption: 'Tangga XP' });
  assert.match(svg, /<svg[^>]*viewBox=/);
  assert.match(svg, /role="img"/);
  assert.match(svg, /Tangga XP/);
  assert.equal((svg.match(/class="stair-bar"/g) || []).length, 4);
  assert.doesNotMatch(svg, /stair-bar--flip/);
  const flip = E.buildStaircaseSeriesSVG(terms, { flipped: true });
  assert.equal((flip.match(/class="stair-bar stair-bar--flip"/g) || []).length, 4);
  assert.match(flip, /stair-rect/);
  assert.match(flip, /4 × 45/);
});

test('makePartialSumLabState & partialSumLabInfo', () => {
  const st = E.makePartialSumLabState(1);
  assert.deepEqual({ n: st.n, geser: st.geser }, { n: 1, geser: 0 });
  const cfg = { a: 15, b: 5, target: 1000, maks: 30 };
  const i17 = E.partialSumLabInfo({ n: 17 }, cfg);
  assert.equal(i17.un, 95);
  assert.equal(i17.sn, 935);
  assert.equal(i17.tercapai, false);
  const i18 = E.partialSumLabInfo({ n: 18 }, cfg);
  assert.equal(i18.sn, 1035);
  assert.equal(i18.tercapai, true);
  /* n di luar rentang dijepit ke 1..maks */
  assert.equal(E.partialSumLabInfo({ n: 99 }, cfg).n, 30);
  assert.equal(E.partialSumLabInfo({ n: 0 }, cfg).n, 1);
});

test('buildPartialSumLab: slider, tombol ±, nilai Uₙ & Sₙ, status target', () => {
  const cfg = { a: 15, b: 5, target: 1000, maks: 30, satuan: 'XP' };
  const html = E.buildPartialSumLab('lab', { n: 17, geser: 3 }, cfg);
  assert.match(html, /type="range"/);
  assert.match(html, /min="1"/);
  assert.match(html, /max="30"/);
  assert.match(html, /value="17"/);
  assert.match(html, /id="lab-kurang"/);
  assert.match(html, /id="lab-tambah"/);
  assert.match(html, /935/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /psum-status--belum/);
  const ok = E.buildPartialSumLab('lab', { n: 20, geser: 3 }, cfg);
  assert.match(ok, /psum-status--capai/);
});

test('opsiJumlahDeret: opts.maks membatasi opsi; pengecoh paling bermakna didahulukan', () => {
  const o = E.opsiJumlahDeret(15, 5, 30, { maks: 4 });
  assert.equal(o.length, 4);
  assert.deepEqual(Array.from(o.map((x) => x.id)), [
    'benar',
    'lupa-bagi-dua',
    'n-kali-un',
    'n-bukan-n-kurang-1',
  ]);
});

test('nilaiPolaJumlahDeret: nilai setiap cara (null = rumus benar)', () => {
  assert.equal(E.nilaiPolaJumlahDeret(null, 15, 5, 30), 2625);
  assert.equal(E.nilaiPolaJumlahDeret('n-kali-un', 15, 5, 30), 4800);
  assert.equal(E.nilaiPolaJumlahDeret('lupa-bagi-dua', 15, 5, 30), 5250);
  assert.equal(E.nilaiPolaJumlahDeret('n-bukan-n-kurang-1', 15, 5, 30), 2700);
  assert.equal(E.nilaiPolaJumlahDeret('tidak-ada', 15, 5, 30), null);
});

test('langkah isian Sₙ berdiagnosa: state awal, tampilan diagnosa & selesai', () => {
  const st = E.makeJumlahDeretStep();
  assert.deepEqual(
    {
      input: st.input,
      done: st.done,
      kode: st.kode,
      attempts: st.attempts,
      hintLevel: st.hintLevel,
    },
    { input: '', done: false, kode: null, attempts: 0, hintLevel: 0 }
  );
  const step = {
    label: 'S₃₀ = …',
    a: 15,
    b: 5,
    n: 30,
    hints: ['Pakai Sₙ = n/2 (a + Uₙ).', '15 × 175.'],
    temuan: 'S₃₀ = 2.625 XP.',
  };
  const kosong = E.buildJumlahDeretStep('sj', st, step);
  assert.match(kosong, /id="sjInput"/);
  assert.match(kosong, /id="sjCheck"/);
  assert.match(kosong, /id="sjHint"/);
  assert.doesNotMatch(kosong, /feedback-box--warning/);
  const salah = E.buildJumlahDeretStep(
    'sj',
    { input: '5.250', done: false, kode: 'lupa-bagi-dua', attempts: 1, hintLevel: 0 },
    step
  );
  assert.match(salah, /feedback-box--warning/);
  assert.match(salah, /bagi 2/);
  const selesai = E.buildJumlahDeretStep(
    'sj',
    { input: '2.625', done: true, kode: null, attempts: 2, hintLevel: 0 },
    step
  );
  assert.match(selesai, /dl-step--done/);
  assert.match(selesai, /2\.625 XP/);
  /* periksaJumlahDeretStep memperbarui state dari teks isian */
  const s2 = E.makeJumlahDeretStep();
  assert.equal(E.periksaJumlahDeretStep(s2, step, '4.800'), true);
  assert.equal(s2.kode, 'n-kali-un');
  assert.equal(s2.done, false);
  assert.equal(E.periksaJumlahDeretStep(s2, step, '2.625'), true);
  assert.equal(s2.done, true);
  assert.equal(s2.kode, null);
  assert.equal(s2.attempts, 2);
  assert.equal(E.periksaJumlahDeretStep(s2, step, 'abc'), false);
  assert.equal(s2.attempts, 2);
});
