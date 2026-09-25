'use strict';

/*
 * Tes shared/engine.js seksi 30 (membaca & menulis bilangan berpangkat):
 * cara baca baku, penulisan ekspresi, unsur basis & pangkat, perkalian
 * berulang, pembaca kata bilangan, pemeriksa cara baca yang diketik murid
 * beserta diagnosa miskonsepsinya, pemeriksa isian "penulis pangkat",
 * banyak lapisan kertas lipat, dan markup komponen UI-nya.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function frac(num, den) {
  return { num: num, den: den };
}

test('bacaPangkat: basis & pangkat positif', () => {
  assert.equal(E.bacaPangkat(2, 3), 'dua pangkat tiga');
  assert.equal(E.bacaPangkat(10, 16), 'sepuluh pangkat enam belas');
  assert.equal(E.bacaPangkat(0, 5), 'nol pangkat lima');
  assert.equal(E.bacaPangkat(125, 2), 'seratus dua puluh lima pangkat dua');
});

test('bacaPangkat: pangkat nol & negatif', () => {
  assert.equal(E.bacaPangkat(7, 0), 'tujuh pangkat nol');
  assert.equal(E.bacaPangkat(5, -2), 'lima pangkat negatif dua');
  assert.equal(E.bacaPangkat(10, -7), 'sepuluh pangkat negatif tujuh');
});

test('bacaPangkat: basis negatif vs tanda negatif di luar pangkat', () => {
  assert.equal(E.bacaPangkat(-3, 4), 'negatif tiga pangkat empat');
  assert.equal(E.bacaPangkat(3, 4, { negLuar: true }), 'negatif dari tiga pangkat empat');
  assert.equal(E.bacaPangkat(-2, -3), 'negatif dua pangkat negatif tiga');
});

test('bacaPangkat: basis pecahan', () => {
  assert.equal(E.bacaPangkat(frac(2, 3), 3), 'dua per tiga pangkat tiga');
  assert.equal(E.bacaPangkat(frac(-1, 2), 2), 'negatif satu per dua pangkat dua');
});

test('ekspresiPangkat: kurung basis negatif, tanda luar tanpa kurung', () => {
  assert.equal(E.ekspresiPangkat(2, 3), '2³');
  assert.equal(E.ekspresiPangkat(-3, 4), '(−3)⁴');
  assert.equal(E.ekspresiPangkat(3, 4, { negLuar: true }), '−3⁴');
  assert.equal(E.ekspresiPangkat(5, -2), '5⁻²');
  assert.equal(E.ekspresiPangkat(frac(2, 3), 3), '(2/3)³');
});

test('unsurPangkat: basis, pangkat, dan banyak faktor', () => {
  const u = E.unsurPangkat(-3, 4);
  assert.equal(u.basis, -3);
  assert.equal(u.pangkat, 4);
  assert.equal(u.teksBasis, '(−3)');
  assert.equal(u.teksPangkat, '4');
  assert.equal(u.banyakFaktor, 4);
  assert.equal(u.negLuar, false);

  const luar = E.unsurPangkat(3, 4, { negLuar: true });
  assert.equal(luar.basis, 3, 'tanda di luar pangkat bukan bagian basis');
  assert.equal(luar.negLuar, true);

  const neg = E.unsurPangkat(5, -2);
  assert.equal(neg.teksPangkat, '−2');
  assert.equal(neg.banyakFaktor, 0);
});

test('tulisPerkalianBerulang: positif, nol, negatif, dan disingkat', () => {
  assert.equal(E.tulisPerkalianBerulang(2, 3), '2 × 2 × 2');
  assert.equal(E.tulisPerkalianBerulang(-3, 2), '(−3) × (−3)');
  assert.equal(E.tulisPerkalianBerulang(7, 1), '7');
  assert.equal(E.tulisPerkalianBerulang(7, 0), '1');
  assert.equal(E.tulisPerkalianBerulang(2, -1), '1 : 2');
  assert.equal(E.tulisPerkalianBerulang(2, -3), '1 : (2 × 2 × 2)');
  assert.equal(E.tulisPerkalianBerulang(10, 16), '10 × 10 × … × 10 (16 faktor)');
  assert.equal(E.tulisPerkalianBerulang(2, 5, { maks: 4 }), '2 × 2 × … × 2 (5 faktor)');
});

test('angkaDariKata: kata bilangan → bilangan cacah', () => {
  assert.equal(E.angkaDariKata('nol'), 0);
  assert.equal(E.angkaDariKata('tiga'), 3);
  assert.equal(E.angkaDariKata('sebelas'), 11);
  assert.equal(E.angkaDariKata('enam belas'), 16);
  assert.equal(E.angkaDariKata('seratus dua puluh lima'), 125);
  assert.equal(E.angkaDariKata('seribu'), 1000);
  assert.equal(E.angkaDariKata('se ratus'), 100);
  assert.equal(E.angkaDariKata('tiga dua'), null);
  assert.equal(E.angkaDariKata(''), null);
});

test('parseBacaPangkat: struktur bacaan', () => {
  const p = E.parseBacaPangkat('Negatif tiga pangkat empat');
  assert.deepEqual(
    { negLuar: p.negLuar, basisNeg: p.basisNeg, pangkat: p.pangkat },
    { negLuar: false, basisNeg: true, pangkat: 4 }
  );
  assert.equal(p.basis.num, 3);
  assert.equal(p.basis.den, 1);
  assert.equal(E.parseBacaPangkat('negatif dari tiga pangkat empat').negLuar, true);
  assert.equal(E.parseBacaPangkat('lima pangkat negatif dua').pangkat, -2);
  assert.equal(E.parseBacaPangkat('lima kuadrat').pangkat, 2);
  const f = E.parseBacaPangkat('dua per tiga pangkat tiga');
  assert.equal(f.basis.num, 2);
  assert.equal(f.basis.den, 3);
  assert.equal(E.parseBacaPangkat('dua kali tiga'), null);
  assert.equal(E.parseBacaPangkat('dua pangkat tiga pangkat dua'), null);
});

test('cekBacaPangkat: jawaban baku diterima (huruf besar, tanda baca, kuadrat)', () => {
  assert.equal(E.cekBacaPangkat('dua pangkat tiga', 2, 3).kode, 'benar');
  assert.equal(E.cekBacaPangkat('  Dua  Pangkat Tiga. ', 2, 3).kode, 'benar');
  assert.equal(E.cekBacaPangkat('lima kuadrat', 5, 2).kode, 'benar');
  assert.equal(E.cekBacaPangkat('lima pangkat negatif dua', 5, -2).kode, 'benar');
  assert.equal(E.cekBacaPangkat('tujuh pangkat nol', 7, 0).kode, 'benar');
  assert.equal(E.cekBacaPangkat('negatif tiga pangkat empat', -3, 4).kode, 'benar');
  assert.equal(
    E.cekBacaPangkat('negatif dari tiga pangkat empat', 3, 4, { negLuar: true }).kode,
    'benar'
  );
  const r = E.cekBacaPangkat('dua pangkat tiga', 2, 3);
  assert.equal(r.benar, true);
  assert.match(r.pesan, /dua pangkat tiga/);
});

test('cekBacaPangkat: diagnosa miskonsepsi', () => {
  assert.equal(E.cekBacaPangkat('', 2, 3).kode, 'kosong');
  assert.equal(E.cekBacaPangkat('2 pangkat 3', 2, 3).kode, 'angka');
  assert.equal(E.cekBacaPangkat('lima pangkat minus dua', 5, -2).kode, 'minus');
  assert.equal(E.cekBacaPangkat('lima pangkat min dua', 5, -2).kode, 'minus');
  assert.equal(E.cekBacaPangkat('dua kali tiga', 2, 3).kode, 'kali');
  assert.equal(E.cekBacaPangkat('dua tiga', 2, 3).kode, 'tanpaPangkat');
  assert.equal(E.cekBacaPangkat('tiga pangkat dua', 2, 3).kode, 'tertukar');
  assert.equal(E.cekBacaPangkat('lima pangkat dua', 5, -2).kode, 'tandaPangkat');
  assert.equal(E.cekBacaPangkat('tiga pangkat empat', -3, 4).kode, 'tandaBasis');
  assert.equal(
    E.cekBacaPangkat('negatif tiga pangkat empat', 3, 4, { negLuar: true }).kode,
    'kurung'
  );
  assert.equal(E.cekBacaPangkat('negatif dari tiga pangkat empat', -3, 4).kode, 'kurung');
  assert.equal(E.cekBacaPangkat('empat pangkat lima', 2, 3).kode, 'lain');
  const r = E.cekBacaPangkat('tiga pangkat dua', 2, 3);
  assert.equal(r.benar, false);
  assert.ok(r.pesan.length > 10, 'pesan diagnosa terisi');
});

test('cekTulisPangkat: isian basis & pangkat', () => {
  const ok = E.cekTulisPangkat({ basis: '2', pangkat: '3' }, 2, 3);
  assert.equal(ok.kode, 'benar');
  assert.equal(ok.benar, true);
  assert.equal(E.cekTulisPangkat({ basis: '(−3)', pangkat: '4' }, -3, 4).kode, 'benar');
  assert.equal(E.cekTulisPangkat({ basis: '-3', pangkat: '4' }, -3, 4).kode, 'benar');
  assert.equal(E.cekTulisPangkat({ basis: '5', pangkat: '−2' }, 5, -2).kode, 'benar');
  assert.equal(E.cekTulisPangkat({ basis: '2/3', pangkat: '3' }, frac(2, 3), 3).kode, 'benar');
  assert.equal(E.cekTulisPangkat({ basis: '', pangkat: '3' }, 2, 3).kode, 'kosong');
  assert.equal(E.cekTulisPangkat({ basis: 'dua', pangkat: '3' }, 2, 3).kode, 'invalid');
  assert.equal(E.cekTulisPangkat({ basis: '3', pangkat: '2' }, 2, 3).kode, 'tertukar');
  assert.equal(E.cekTulisPangkat({ basis: '3', pangkat: '4' }, -3, 4).kode, 'tandaBasis');
  assert.equal(E.cekTulisPangkat({ basis: '5', pangkat: '2' }, 5, -2).kode, 'tandaPangkat');
  assert.equal(E.cekTulisPangkat({ basis: '2', pangkat: '5' }, 2, 3).kode, 'pangkatSalah');
  assert.equal(E.cekTulisPangkat({ basis: '4', pangkat: '3' }, 2, 3).kode, 'basisSalah');
  assert.equal(E.cekTulisPangkat({ basis: '8', pangkat: '1' }, 2, 3).kode, 'nilai');
});

test('lapisanKertas: setiap lipatan menggandakan lapisan', () => {
  assert.equal(E.lapisanKertas(0), 1);
  assert.equal(E.lapisanKertas(1), 2);
  assert.equal(E.lapisanKertas(5), 32);
  assert.equal(E.lapisanKertas(10), 1024);
});

test('buildPowerWriter: dua kotak isian berlabel + pratinjau', () => {
  const html = E.buildPowerWriter('pw1', { basis: '5', pangkat: '−2' }, {});
  assert.match(html, /data-part="basis"/);
  assert.match(html, /data-part="pangkat"/);
  assert.match(html, /aria-label="Basis"/);
  assert.match(html, /aria-label="Pangkat"/);
  assert.match(html, /5⁻²/, 'pratinjau memakai notasi superskrip');
  const kosong = E.buildPowerWriter('pw2', { basis: '', pangkat: '' }, { locked: true });
  assert.match(kosong, /disabled/);
});

test('pratinjauTulisPangkat: notasi dari isian atau string kosong', () => {
  assert.equal(E.pratinjauTulisPangkat({ basis: '-3', pangkat: '2' }), '(−3)²');
  assert.equal(E.pratinjauTulisPangkat({ basis: '10', pangkat: '0' }), '10⁰');
  assert.equal(E.pratinjauTulisPangkat({ basis: '', pangkat: '2' }), '');
  assert.equal(E.pratinjauTulisPangkat({ basis: 'x', pangkat: '2' }), '');
});

test('buildPowerAnatomy: bagian basis/pangkat dan mode ketuk', () => {
  const lbl = E.buildPowerAnatomy('an', -3, 4, { label: true });
  assert.match(lbl, /pwr-anatomy__basis/);
  assert.match(lbl, /pwr-anatomy__pangkat/);
  assert.match(lbl, /basis/);
  const pick = E.buildPowerAnatomy('an2', 3, 4, { negLuar: true, pick: { chosen: null } });
  assert.match(pick, /data-part="tanda"/);
  assert.match(pick, /data-part="basis"/);
  assert.match(pick, /data-part="pangkat"/);
  assert.match(pick, /<button/);
  const done = E.buildPowerAnatomy('an3', 2, 5, {
    pick: { chosen: 'pangkat', correct: 'pangkat' },
  });
  assert.match(done, /is-correct/);
});

test('buildFoldSimulator: tombol lipat/buka dan tabel catatan', () => {
  const html = E.buildFoldSimulator('fs', 3, { max: 6, tercapai: 3 });
  assert.match(html, /data-fold="lipat"/);
  assert.match(html, /data-fold="buka"/);
  assert.match(html, /2 × 2 × 2/);
  assert.match(html, /<svg/);
  assert.match(html, />8</, 'banyak lapisan 3 lipatan');
  const awal = E.buildFoldSimulator('fs', 0, { max: 6, tercapai: 0 });
  assert.match(awal, /data-fold="buka"[^>]*disabled/);
});

test('periksaPangkatStep: langkah tulis & baca, isian kosong tidak dihitung', () => {
  const tulis = { jenis: 'tulis', a: 5, n: -2, label: 'Tulis' };
  const st = E.makePangkatStep();
  assert.deepEqual(
    { basis: st.isian.basis, pangkat: st.isian.pangkat, done: st.done, attempts: st.attempts },
    { basis: '', pangkat: '', done: false, attempts: 0 }
  );
  assert.equal(E.periksaPangkatStep(st, tulis, { basis: '', pangkat: '' }).kode, 'kosong');
  assert.equal(st.attempts, 0);
  assert.equal(E.periksaPangkatStep(st, tulis, { basis: 'x', pangkat: '2' }).kode, 'invalid');
  assert.equal(st.attempts, 0);
  assert.equal(E.periksaPangkatStep(st, tulis, { basis: '5', pangkat: '2' }).kode, 'tandaPangkat');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  assert.equal(E.periksaPangkatStep(st, tulis, { basis: '5', pangkat: '-2' }).kode, 'benar');
  assert.equal(st.done, true);
  assert.equal(st.attempts, 2);

  const baca = { jenis: 'baca', a: 3, n: 4, negLuar: true, label: 'Baca' };
  const sb = E.makePangkatStep();
  assert.equal(E.periksaPangkatStep(sb, baca, 'negatif tiga pangkat empat').kode, 'kurung');
  assert.equal(E.periksaPangkatStep(sb, baca, 'negatif dari tiga pangkat empat').kode, 'benar');
  assert.equal(sb.input, 'negatif dari tiga pangkat empat');
  assert.equal(sb.done, true);
});

test('buildPangkatStep: isian, umpan balik, dan tampilan selesai', () => {
  const tulis = { jenis: 'tulis', a: 2, n: 3, label: 'Tulis 2 × 2 × 2', hints: ['h1', 'h2'] };
  const st = E.makePangkatStep();
  const awal = E.buildPangkatStep('lt1', st, tulis, 1);
  assert.match(awal, /data-pwr="lt1W"/);
  assert.match(awal, /id="lt1Check"/);
  assert.match(awal, /id="lt1Hint"/);
  E.periksaPangkatStep(st, tulis, { basis: '3', pangkat: '2' });
  assert.match(E.buildPangkatStep('lt1', st, tulis, 1), /tertukar/i);
  E.periksaPangkatStep(st, tulis, { basis: '2', pangkat: '3' });
  const selesai = E.buildPangkatStep('lt1', st, tulis, 1);
  assert.match(selesai, /dl-step--done/);
  assert.match(selesai, /2³/);
  assert.match(selesai, /dua pangkat tiga/);

  const baca = { jenis: 'baca', a: 10, n: -2, label: 'Baca 10⁻²' };
  const sb = E.makePangkatStep();
  assert.match(E.buildPangkatStep('pb', sb, baca), /id="pbInput"/);
  E.periksaPangkatStep(sb, baca, 'sepuluh pangkat negatif dua');
  assert.match(E.buildPangkatStep('pb', sb, baca), /sepuluh pangkat negatif dua/);
});
