'use strict';

/*
 * Tes engine.js bagian 38 — membandingkan bilangan bulat, pecahan, dan
 * desimal secara terpadu (lintas bentuk).
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function nilai(str) {
  const v = E.nilaiTerpadu(str);
  return v && [v.num, v.den];
}

test('jenisBilangan: mengenali bulat, pecahan, dan desimal bertanda', () => {
  assert.equal(E.jenisBilangan('-18'), 'bulat');
  assert.equal(E.jenisBilangan('0'), 'bulat');
  assert.equal(E.jenisBilangan('3/4'), 'pecahan');
  assert.equal(E.jenisBilangan('−1 1/4'), 'pecahan');
  assert.equal(E.jenisBilangan('-2,5'), 'desimal');
  assert.equal(E.jenisBilangan('0.75'), 'desimal');
  assert.equal(E.jenisBilangan('abc'), null);
  assert.equal(E.jenisBilangan(''), null);
  assert.equal(E.jenisBilangan('3/0'), null);
});

test('nilaiTerpadu: pecahan eksak paling sederhana dengan penyebut positif', () => {
  assert.deepEqual(nilai('-18'), [-18, 1]);
  assert.deepEqual(nilai('3/4'), [3, 4]);
  assert.deepEqual(nilai('6/8'), [3, 4]);
  assert.deepEqual(nilai('-1 1/4'), [-5, 4]);
  assert.deepEqual(nilai('−3 1/2'), [-7, 2]);
  assert.deepEqual(nilai('0,75'), [3, 4]);
  assert.deepEqual(nilai('-2,5'), [-5, 2]);
  assert.deepEqual(nilai('-1,30'), [-13, 10]);
  assert.deepEqual(nilai('0'), [0, 1]);
  assert.deepEqual(nilai('-0'), [0, 1]);
  assert.equal(E.nilaiTerpadu('x'), null);
});

test('tulisTerpadu: notasi baku dengan minus tipografis', () => {
  assert.equal(E.tulisTerpadu('-18'), '−18');
  assert.equal(E.tulisTerpadu('-1 1/4'), '−1 1/4');
  assert.equal(E.tulisTerpadu('-2,5'), '−2,5');
  assert.equal(E.tulisTerpadu('0,75'), '0,75');
  assert.equal(E.tulisTerpadu('3/4'), '3/4');
});

test('bandingTerpadu & simbolBandingTerpadu: lintas bentuk, eksak', () => {
  assert.equal(E.bandingTerpadu('3/4', '0,8'), -1);
  assert.equal(E.bandingTerpadu('0,75', '3/4'), 0);
  assert.equal(E.bandingTerpadu('4/5', '0,75'), 1);
  assert.equal(E.bandingTerpadu('-1 1/4', '-1,3'), 1);
  assert.equal(E.bandingTerpadu('-3 1/2', '-2,5'), -1);
  assert.equal(E.bandingTerpadu('-4', '-3 1/2'), -1);
  assert.equal(E.bandingTerpadu('-2/3', '-0,75'), 1);
  assert.equal(E.bandingTerpadu('2/5', '0,4'), 0);
  assert.equal(E.bandingTerpadu('-2', '-2,0'), 0);
  assert.equal(E.bandingTerpadu('x', '1'), null);
  assert.equal(E.simbolBandingTerpadu('0,25', '1/2'), 'lt');
  assert.equal(E.simbolBandingTerpadu('4/5', '3/4'), 'gt');
  assert.equal(E.simbolBandingTerpadu('0,75', '3/4'), 'eq');
});

test('urutkanTerpadu & urutanIdTerpadu: naik/turun tanpa mengubah array asal', () => {
  const asal = ['-2', '0,25', '-1 1/4', '1/2', '-1,3'];
  assert.deepEqual(E.urutkanTerpadu(asal), ['-2', '-1,3', '-1 1/4', '0,25', '1/2']);
  assert.deepEqual(E.urutkanTerpadu(asal, 'turun'), ['1/2', '0,25', '-1 1/4', '-1,3', '-2']);
  assert.deepEqual(asal, ['-2', '0,25', '-1 1/4', '1/2', '-1,3']);
  const items = [
    { id: 'a', nilai: '0,7' },
    { id: 'b', nilai: '4/5' },
    { id: 'c', nilai: '-3/4' },
  ];
  assert.deepEqual(E.urutanIdTerpadu(items), ['c', 'a', 'b']);
  assert.deepEqual(E.urutanIdTerpadu(items, 'turun'), ['b', 'a', 'c']);
});

test('keDesimalTerpadu: pecahan berhenti → desimal berkoma; tak berhenti → null', () => {
  assert.equal(E.keDesimalTerpadu('3/4'), '0,75');
  assert.equal(E.keDesimalTerpadu('-3 1/2'), '−3,5');
  assert.equal(E.keDesimalTerpadu('-1 1/4'), '−1,25');
  assert.equal(E.keDesimalTerpadu('7/8'), '0,875');
  assert.equal(E.keDesimalTerpadu('3/20'), '0,15');
  assert.equal(E.keDesimalTerpadu('-18'), '−18');
  assert.equal(E.keDesimalTerpadu('4/2'), '2');
  assert.equal(E.keDesimalTerpadu('2/3'), null);
  assert.equal(E.keDesimalTerpadu('0,50'), '0,5');
});

test('kePecahanTerpadu: desimal → pecahan paling sederhana (campuran bila > 1)', () => {
  assert.equal(E.kePecahanTerpadu('0,75'), '3/4');
  assert.equal(E.kePecahanTerpadu('-2,5'), '−2 1/2');
  assert.equal(E.kePecahanTerpadu('-1,3'), '−1 3/10');
  assert.equal(E.kePecahanTerpadu('0,7'), '7/10');
  assert.equal(E.kePecahanTerpadu('6/8'), '3/4');
  assert.equal(E.kePecahanTerpadu('-4'), '−4');
});

test('penyebutPersepuluhan: langkah "jadikan penyebut 10, 100, 1000"', () => {
  assert.equal(E.penyebutPersepuluhan('3/4'), '75/100');
  assert.equal(E.penyebutPersepuluhan('4/5'), '8/10');
  assert.equal(E.penyebutPersepuluhan('-1 1/4'), '−1 25/100');
  assert.equal(E.penyebutPersepuluhan('7/8'), '875/1000');
  assert.equal(E.penyebutPersepuluhan('2/3'), null);
});

function assertOpsi(opsi, name) {
  assert.ok(opsi.length >= 4, name + ': minimal 4 opsi');
  const ids = opsi.map((o) => o.id);
  const labels = opsi.map((o) => o.label);
  assert.equal(new Set(ids).size, ids.length, name + ': id unik');
  assert.equal(new Set(labels).size, labels.length, name + ': label unik');
  assert.equal(opsi.filter((o) => o.benar).length, 1, name + ': satu benar');
  assert.equal(opsi.find((o) => o.benar).id, 'baku');
  opsi.forEach((o) => assert.ok(o.umpan && o.umpan.length > 15, name + '.' + o.id + ': umpan'));
}

test('opsiBentukSetara: pecahan → desimal dengan pengecoh khas', () => {
  const o = E.opsiBentukSetara('3/4');
  assertOpsi(o, '3/4');
  assert.equal(o.find((x) => x.benar).label, '0,75');
  const labels = o.map((x) => x.label);
  assert.ok(labels.includes('3,4'), 'pengecoh angka dipisah koma');
  assert.ok(labels.includes('0,34'), 'pengecoh 0,pembilang-penyebut');
  o.filter((x) => !x.benar).forEach((x) => assert.notEqual(E.bandingTerpadu(x.label, '3/4'), 0));

  const neg = E.opsiBentukSetara('-3 1/2');
  assertOpsi(neg, '-3 1/2');
  assert.equal(neg.find((x) => x.benar).label, '−3,5');
  assert.ok(
    neg.some((x) => x.label === '3,5'),
    'pengecoh tanda hilang'
  );
  ['4/5', '1/2', '-1 1/4', '7/8'].forEach((s) => assertOpsi(E.opsiBentukSetara(s), s));
});

test('opsiBentukSetara: desimal → pecahan dengan pengecoh khas', () => {
  const o = E.opsiBentukSetara('2,5');
  assertOpsi(o, '2,5');
  assert.equal(o.find((x) => x.benar).label, '2 1/2');
  assert.ok(
    o.some((x) => x.label === '2/5'),
    'pengecoh angka dipisah'
  );
  o.filter((x) => !x.benar).forEach((x) => assert.notEqual(E.bandingTerpadu(x.label, '2,5'), 0));
  ['0,7', '-2,5', '0,25', '-1,3', '0,75'].forEach((s) => {
    const opsi = E.opsiBentukSetara(s);
    assertOpsi(opsi, s);
    assert.equal(E.bandingTerpadu(opsi.find((x) => x.benar).label, s), 0);
    opsi.filter((x) => !x.benar).forEach((x) => assert.notEqual(E.bandingTerpadu(x.label, s), 0));
  });
});

test('diagnosaBandingTerpadu: mengenali miskonsepsi lintas bentuk', () => {
  assert.equal(E.diagnosaBandingTerpadu('-3 1/2', '-2,5', 'lt'), null);
  /* membandingkan angka tanpa tanda */
  assert.equal(E.diagnosaBandingTerpadu('-3 1/2', '-2,5', 'gt'), 'abaikan-negatif');
  assert.equal(E.diagnosaBandingTerpadu('-1 1/4', '-1,3', 'lt'), 'abaikan-negatif');
  /* angka yang tampak dibandingkan langsung (25 vs 1) */
  assert.equal(E.diagnosaBandingTerpadu('0,25', '1/2', 'gt'), 'angka-lepas');
  assert.equal(E.diagnosaBandingTerpadu('4/5', '0,75', 'lt'), 'angka-lepas');
  /* penyebut lebih besar dianggap pecahan lebih besar */
  assert.equal(E.diagnosaBandingTerpadu('1/3', '1/2', 'gt'), 'penyebut-besar');
  /* bentuk berbeda dianggap tidak mungkin sama */
  assert.equal(E.diagnosaBandingTerpadu('0,75', '3/4', 'lt'), 'beda-bentuk');
  assert.equal(E.diagnosaBandingTerpadu('4/5', '3/4', 'eq'), 'lain');
});

test('pesanDiagnosaTerpadu & alasanBandingTerpadu', () => {
  ['abaikan-negatif', 'angka-lepas', 'penyebut-besar', 'beda-bentuk', 'lain'].forEach((k) => {
    const p = E.pesanDiagnosaTerpadu(k, '-3 1/2', '-2,5');
    assert.equal(typeof p, 'string');
    assert.ok(p.length > 20, k);
  });
  const a = E.alasanBandingTerpadu('3/4', '0,8');
  assert.match(a, /0,75/);
  assert.match(a, /3\/4 < 0,8/);
  const b = E.alasanBandingTerpadu('-2/3', '-0,75');
  assert.match(b, /penyebut/);
  assert.match(b, /−2\/3 > −0,75/);
  const c = E.alasanBandingTerpadu('-4', '1/2');
  assert.match(c, /negatif/);
});

test('kata perbandingan per tema konteks', () => {
  assert.equal(E.maknaBandingTerpadu('-3 1/2', '-2,5', 'suhu'), 'lebih dingin');
  assert.equal(E.maknaBandingTerpadu('4/5', '3/4', 'volume'), 'lebih banyak');
  assert.equal(E.maknaBandingTerpadu('0,75', '3/4', 'volume'), 'sama banyak');
  assert.equal(E.idMaknaBandingTerpadu('-1 1/4', '-1,3'), 'besar');
  ['suhu', 'volume', 'kas', 'panjang'].forEach((t) => {
    const opsi = E.opsiMaknaBandingTerpadu(t);
    assert.equal(opsi.length, 3);
    assert.equal(new Set(opsi.map((o) => o.label)).size, 3);
  });
});

test('skalaTerpadu & petunjukLetakTerpadu untuk garis bilangan berlangkah 1/n', () => {
  assert.equal(E.skalaTerpadu('-3/4', 4), -3);
  assert.equal(E.skalaTerpadu('-1,5', 4), -6);
  assert.equal(E.skalaTerpadu('1 1/4', 4), 5);
  assert.equal(E.skalaTerpadu('-2', 4), -8);
  assert.equal(E.skalaTerpadu('0,3', 4), null);
  assert.equal(E.teksSkalaTerpadu(-6, 4), '−1 2/4');
  assert.match(E.petunjukLetakTerpadu('-3/4', 4), /kiri/);
  assert.match(E.petunjukLetakTerpadu('1 1/4', 4), /kanan/);
});

test('buildBilanganChip, kalimat & garis bilangan terpadu', () => {
  assert.match(E.buildBilanganChip('-3/4'), /frac-inline/);
  assert.match(E.buildBilanganChip('-3/4'), /−/);
  assert.match(E.buildBilanganChip('-2,5'), />−2,5</);
  const k = E.buildKalimatBandingTerpadu('3/4', '0,8', 'lt');
  assert.match(k, /cmp-sentence/);
  assert.match(k, /&lt;/);
  const g = E.buildGarisTerpadu('gt', { min: -2, max: 2, langkah: 4 });
  assert.equal((g.match(/data-nl-value=/g) || []).length, 17);
  assert.match(g, />−2</);
  const statis = E.buildGarisTerpadu('gt', {
    min: -1,
    max: 1,
    langkah: 2,
    interactive: false,
    marks: [{ k: -1, label: 'A' }],
  });
  assert.doesNotMatch(statis, /data-nl-value=/);
  assert.match(statis, /nlp-mark/);
});

test('buildPenempatanTerpadu: target, salah, selesai', () => {
  const items = [{ nilai: '-3/4' }, { nilai: '0,25' }];
  const cfg = { min: -1, max: 1, langkah: 4 };
  const awal = E.buildPenempatanTerpadu('pl', items, { idx: 0, salah: null, wrong: {} }, cfg);
  assert.match(awal, /Bilangan 1 dari 2/);
  const salah = E.buildPenempatanTerpadu('pl', items, { idx: 0, salah: 3, wrong: { 0: 1 } }, cfg);
  assert.match(salah, /feedback-box/);
  const done = E.buildPenempatanTerpadu(
    'pl',
    items,
    { idx: 2, salah: null, wrong: {} },
    Object.assign({ doneText: 'SELESAI' }, cfg)
  );
  assert.match(done, /SELESAI/);
  assert.doesNotMatch(done, /data-nl-value=/);
});

test('periksaIsianTerpadu: menilai isian dengan bentuk yang diminta', () => {
  assert.equal(E.periksaIsianTerpadu('0,875', '7/8', 'desimal').benar, true);
  assert.equal(E.periksaIsianTerpadu('0.875', '7/8', 'desimal').benar, true);
  assert.equal(E.periksaIsianTerpadu('-2,25', '-2 1/4', 'desimal').benar, true);
  const tanda = E.periksaIsianTerpadu('2,25', '-2 1/4', 'desimal');
  assert.equal(tanda.benar, false);
  assert.match(tanda.pesan, /tanda|negatif/);
  const bentuk = E.periksaIsianTerpadu('7/8', '7/8', 'desimal');
  assert.equal(bentuk.benar, false);
  assert.match(bentuk.pesan, /desimal/);
  assert.equal(E.periksaIsianTerpadu('abc', '7/8', 'desimal').benar, false);
  assert.equal(E.periksaIsianTerpadu('', '7/8').benar, false);
  assert.equal(E.periksaIsianTerpadu('3/4', '0,75', 'pecahan').benar, true);
  assert.equal(E.periksaIsianTerpadu('0,75', '0,75').benar, true);
});
