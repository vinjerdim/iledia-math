'use strict';

/*
 * Tes shared/engine.js seksi 15 & 36 (membandingkan dan mengurutkan
 * pecahan dalam konteks sehari-hari): perbandingan perkalian silang,
 * nilai pecahan bertanda/campuran, lambang <, >, =, pengurutan naik/
 * turun, strategi membandingkan (penyebut sama, pembilang sama, patokan,
 * samakan penyebut, tanda), diagnosa miskonsepsi, kata perbandingan per
 * tema, rentang garis bilangan, serta komponen render (pita pecahan,
 * garis bilangan pecahan, kalimat banding, pilihan lambang, papan urutan).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

/* ---------- seksi 15: dasar ---------- */

test('compareFractions: perkalian silang tanpa galat pembulatan', () => {
  assert.equal(E.compareFractions({ num: 1, den: 3 }, { num: 1, den: 2 }), -1);
  assert.equal(E.compareFractions({ num: 2, den: 4 }, { num: 1, den: 2 }), 0);
  assert.equal(E.compareFractions({ num: 5, den: 6 }, { num: 3, den: 4 }), 1);
  assert.equal(E.fracRelationSymbol(-1), '<');
  assert.equal(E.fracRelationSymbol(0), '=');
  assert.equal(E.fracRelationSymbol(1), '>');
});

test('sortFractions: naik & turun tanpa mengubah array asal', () => {
  const asal = [
    { num: 3, den: 4 },
    { num: 1, den: 2 },
    { num: 2, den: 3 },
  ];
  const naik = E.sortFractions(asal).map((f) => f.num + '/' + f.den);
  assert.deepEqual(plain(naik), ['1/2', '2/3', '3/4']);
  const turun = E.sortFractions(asal, true).map((f) => f.num + '/' + f.den);
  assert.deepEqual(plain(turun), ['3/4', '2/3', '1/2']);
  assert.equal(asal[0].num, 3);
});

test('buildFracStripCompare: pita sama panjang, penyebut bersama & label aksesibel', () => {
  const html = E.buildFracStripCompare(
    [
      { num: 2, den: 3, nama: 'Sari' },
      { num: 3, den: 4, nama: 'Rafi' },
    ],
    { common: 12, half: true }
  );
  assert.match(html, /frac-strip--half/);
  assert.match(html, /repeat\(12,1fr\)/);
  assert.match(html, /Sari dua per tiga/);
  /* 2/3 = 8/12 → 8 sel terarsir pada baris pertama */
  const baris1 = html.split('frac-strip__row--1')[0];
  assert.equal((baris1.match(/frac-strip__cell is-on/g) || []).length, 8);
});

test('makeOrderState/ensureOrderState: kolam berisi semua id, dibuat ulang bila tidak cocok', () => {
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const state = {};
  const st = E.ensureOrderState(state, 'papan', items);
  assert.deepEqual(plain(st.pool).sort(), ['a', 'b', 'c']);
  assert.deepEqual(plain(st.picked), []);
  st.picked.push('b');
  assert.equal(E.ensureOrderState(state, 'papan', items), st, 'state lama dipakai bila cocok');
  const baru = E.ensureOrderState(state, 'papan', [{ id: 'x' }, { id: 'y' }]);
  assert.deepEqual(plain(baru.pool).sort(), ['x', 'y']);
});

test('buildOrderBoard: kartu kolam & slot, tanda benar/salah setelah diperiksa', () => {
  const items = [
    { id: 'a', html: 'A', aria: 'a' },
    { id: 'b', html: 'B', aria: 'b' },
  ];
  const st = { pool: ['b', 'a'], picked: [], checked: false, correct: false, attempts: 0 };
  let html = E.buildOrderBoard('pp', items, st, { correct: ['a', 'b'] });
  assert.equal((html.match(/data-order-pick=/g) || []).length, 2);
  assert.match(html, /id="ppCheck" disabled/);
  st.picked = ['b', 'a'];
  st.checked = true;
  html = E.buildOrderBoard('pp', items, st, { correct: ['a', 'b'] });
  assert.equal((html.match(/is-bad/g) || []).length, 2);
  assert.match(html, /ppFix/);
});

/* ---------- seksi 36: nilai & perbandingan ---------- */

test('pecahanDari: teks → objek pecahan; teks tidak sah memunculkan galat', () => {
  assert.deepEqual(plain(E.pecahanDari('3/4')), { num: 3, den: 4, whole: null, neg: false });
  assert.deepEqual(plain(E.pecahanDari('−1 1/2')), { num: 1, den: 2, whole: 1, neg: true });
  const obj = { num: 1, den: 3, whole: null, neg: false };
  assert.equal(E.pecahanDari(obj), obj, 'objek dikembalikan apa adanya');
  assert.throws(() => E.pecahanDari('tiga per empat'));
  assert.throws(() => E.pecahanDari('1/0'));
});

test('pecahanBiasaBertanda: pecahan campuran & negatif menjadi pecahan biasa bertanda', () => {
  assert.deepEqual(plain(E.pecahanBiasaBertanda('3/4')), { num: 3, den: 4 });
  assert.deepEqual(plain(E.pecahanBiasaBertanda('2 1/3')), { num: 7, den: 3 });
  assert.deepEqual(plain(E.pecahanBiasaBertanda('-1 1/2')), { num: -3, den: 2 });
  assert.deepEqual(plain(E.pecahanBiasaBertanda({ num: 5, den: 8 })), { num: 5, den: 8 });
});

test('bandingPecahan & simbolBandingPecahan: biasa, senilai, campuran, negatif', () => {
  assert.equal(E.bandingPecahan('3/8', '2/5'), -1);
  assert.equal(E.bandingPecahan('2/4', '1/2'), 0);
  assert.equal(E.bandingPecahan('1 1/4', '5/6'), 1);
  assert.equal(E.bandingPecahan('-3/4', '-1/2'), -1);
  assert.equal(E.bandingPecahan('-1/4', '1/8'), -1);
  assert.equal(E.simbolBandingPecahan('3/8', '2/5'), 'lt');
  assert.equal(E.simbolBandingPecahan('4/6', '2/3'), 'eq');
  assert.equal(E.simbolBandingPecahan('-1/3', '-2/3'), 'gt');
});

test('urutkanPecahan & urutanIdPecahan: naik (default) dan turun', () => {
  const naik = E.urutkanPecahan(['3/4', '-1/2', '1 1/3', '2/5']).map(E.tulisPecahan);
  assert.deepEqual(plain(naik), ['−1/2', '2/5', '3/4', '1 1/3']);
  const items = [
    { id: 'a', p: '2/3' },
    { id: 'b', p: '1/2' },
    { id: 'c', p: '-3/4' },
    { id: 'd', p: '1 1/5' },
  ];
  assert.deepEqual(plain(E.urutanIdPecahan(items)), ['c', 'b', 'a', 'd']);
  assert.deepEqual(plain(E.urutanIdPecahan(items, 'turun')), ['d', 'a', 'b', 'c']);
});

/* ---------- strategi ---------- */

test('STRATEGI_BANDING_PECAHAN: empat strategi ahli lengkap untuk kartu peran', () => {
  const ids = E.STRATEGI_BANDING_PECAHAN.map((s) => s.id);
  assert.deepEqual(plain(ids), ['penyebutSama', 'pembilangSama', 'patokan', 'samakanPenyebut']);
  E.STRATEGI_BANDING_PECAHAN.forEach((s) => {
    assert.ok(s.ikon && s.nama && s.tugas && s.kunci, s.id + ': ikon, nama, tugas, kunci');
  });
  assert.equal(E.strategiBandingInfo('patokan').id, 'patokan');
  assert.equal(E.strategiBandingInfo('tanda').id, 'tanda');
});

test('strategiBerlaku: strategi yang bisa dipakai, terurut dari yang paling cepat', () => {
  assert.deepEqual(plain(E.strategiBerlaku('3/8', '5/8')), [
    'penyebutSama',
    'patokan',
    'samakanPenyebut',
  ]);
  assert.deepEqual(plain(E.strategiBerlaku('5/9', '7/9')), ['penyebutSama', 'samakanPenyebut']);
  assert.deepEqual(plain(E.strategiBerlaku('2/5', '2/7')), ['pembilangSama', 'samakanPenyebut']);
  assert.deepEqual(plain(E.strategiBerlaku('2/5', '4/7')), ['patokan', 'samakanPenyebut']);
  assert.deepEqual(plain(E.strategiBerlaku('1/2', '3/5')), ['patokan', 'samakanPenyebut']);
  assert.deepEqual(plain(E.strategiBerlaku('3/4', '5/6')), ['samakanPenyebut']);
  assert.deepEqual(plain(E.strategiBerlaku('1 1/4', '5/6')), ['patokan', 'samakanPenyebut']);
  /* dua pecahan negatif: strategi berlaku pada besarannya */
  assert.deepEqual(plain(E.strategiBerlaku('-3/4', '-2/3')), ['samakanPenyebut']);
  assert.deepEqual(plain(E.strategiBerlaku('-1/5', '-2/5')), ['penyebutSama', 'samakanPenyebut']);
  /* tanda berbeda */
  assert.deepEqual(plain(E.strategiBerlaku('-1/4', '1/8')), ['tanda', 'samakanPenyebut']);
  assert.equal(E.strategiBandingPecahan('2/5', '2/7'), 'pembilangSama');
  assert.equal(E.strategiBandingPecahan('3/4', '5/6'), 'samakanPenyebut');
});

test('samakanPenyebutPecahan: KPK penyebut dan pecahan senilainya', () => {
  const r = plain(E.samakanPenyebutPecahan('3/4', '5/6'));
  assert.deepEqual(r, { kpk: 12, a: { num: 9, den: 12 }, b: { num: 10, den: 12 } });
  const n = plain(E.samakanPenyebutPecahan('-2/3', '-3/4'));
  assert.deepEqual(n, { kpk: 12, a: { num: -8, den: 12 }, b: { num: -9, den: 12 } });
});

test('penjelasanStrategi: menyebut alasan sesuai strategi & lambang yang benar', () => {
  assert.match(E.penjelasanStrategi('penyebutSama', '3/8', '5/8'), /pembilang/i);
  assert.match(E.penjelasanStrategi('pembilangSama', '2/5', '2/7'), /penyebut/i);
  assert.match(E.penjelasanStrategi('patokan', '2/5', '4/7'), /1\/2/);
  assert.match(E.penjelasanStrategi('samakanPenyebut', '3/4', '5/6'), /12/);
  assert.match(E.penjelasanStrategi('tanda', '-1/4', '1/8'), /negatif/i);
  ['penyebutSama', 'samakanPenyebut'].forEach((id) => {
    assert.match(E.penjelasanStrategi(id, '3/8', '5/8'), /&lt;/);
  });
});

/* ---------- diagnosa ---------- */

test('diagnosaBandingPecahan: benar & miskonsepsi khas', () => {
  assert.equal(E.diagnosaBandingPecahan('3/8', '2/5', 'lt'), 'benar');
  /* 1/3 > 1/2 karena 3 > 2 */
  assert.equal(E.diagnosaBandingPecahan('1/3', '1/2', 'gt'), 'penyebutBesar');
  /* 2/5 = 2/7 karena pembilangnya sama */
  assert.equal(E.diagnosaBandingPecahan('2/5', '2/7', 'eq'), 'bandingPembilang');
  /* 3/8 > 2/5 karena 3 > 2 dan 8 > 5 */
  assert.equal(E.diagnosaBandingPecahan('3/8', '2/5', 'gt'), 'bandingAngka');
  /* 3/4 = 5/6 karena sama-sama kurang satu bagian */
  assert.equal(E.diagnosaBandingPecahan('3/4', '5/6', 'eq'), 'selisihSisa');
  /* 1 1/4 < 3/4 karena 1/4 < 3/4 */
  assert.equal(E.diagnosaBandingPecahan('1 1/4', '3/4', 'lt'), 'abaikanBulat');
  /* −3/4 > −1/2 karena 3/4 > 1/2 */
  assert.equal(E.diagnosaBandingPecahan('-3/4', '-1/2', 'gt'), 'abaikanTanda');
  assert.equal(E.diagnosaBandingPecahan('-1/4', '1/8', 'gt'), 'abaikanTanda');
  assert.equal(E.diagnosaBandingPecahan('3/4', '5/6', 'gt'), 'terbalik');
});

test('pesanBandingPecahan: umpan balik memuat lambang benar & inti miskonsepsi', () => {
  const benar = E.pesanBandingPecahan('benar', '3/8', '2/5');
  assert.match(benar, /Tepat/);
  assert.match(benar, /&lt;/);
  assert.match(E.pesanBandingPecahan('penyebutBesar', '1/3', '1/2'), /penyebut/i);
  assert.match(E.pesanBandingPecahan('abaikanTanda', '-3/4', '-1/2'), /negatif/i);
  assert.match(E.pesanBandingPecahan('selisihSisa', '3/4', '5/6'), /bagian/i);
  assert.match(E.pesanBandingPecahan('abaikanBulat', '1 1/4', '3/4'), /bulat/i);
  ['bandingPembilang', 'bandingAngka', 'terbalik'].forEach((d) => {
    assert.ok(E.pesanBandingPecahan(d, '3/8', '2/5').length > 20, d);
  });
});

/* ---------- makna konteks ---------- */

test('makna banding pecahan per tema, termasuk kedalaman di bawah permukaan', () => {
  assert.equal(E.idMaknaBandingPecahan('1/3', '1/2'), 'kecil');
  assert.equal(E.idMaknaBandingPecahan('2/4', '1/2'), 'sama');
  assert.equal(E.maknaBandingPecahan('3/4', '2/3', 'banyak'), 'lebih banyak');
  assert.equal(E.maknaBandingPecahan('1/3', '1/2', 'panjang'), 'lebih pendek');
  assert.equal(E.maknaBandingPecahan('5/6', '3/4', 'jarak'), 'lebih jauh');
  assert.equal(E.maknaBandingPecahan('1/4', '1/3', 'waktu'), 'lebih singkat');
  assert.equal(E.maknaBandingPecahan('-3/4', '-1/2', 'tinggi'), 'lebih dalam');
  assert.equal(E.maknaBandingPecahan('1/2', '-1/4', 'tinggi'), 'lebih tinggi');
  const opsi = E.opsiMaknaBandingPecahan('berat', '1/2', '3/4');
  assert.deepEqual(plain(opsi.map((o) => o.id)), ['kecil', 'besar', 'sama']);
  assert.equal(opsi[0].label, 'lebih ringan');
  Object.keys(E.KATA_BANDING_PECAHAN).forEach((tema) => {
    const K = E.KATA_BANDING_PECAHAN[tema];
    assert.ok(K.ikon && K.kecil && K.besar && K.sama && K.terkecil && K.terbesar, tema);
  });
});

/* ---------- garis bilangan ---------- */

test('garisPecahanRentang: selalu memuat 0 dan ujung bilangan bulat', () => {
  assert.deepEqual(plain(E.garisPecahanRentang(['1/4', '3/4'])), { min: 0, max: 1 });
  assert.deepEqual(plain(E.garisPecahanRentang(['-3/4', '-1/2'])), { min: -1, max: 0 });
  assert.deepEqual(plain(E.garisPecahanRentang(['-1 1/2', '1/2', '1 1/4'])), {
    min: -2,
    max: 2,
  });
  assert.deepEqual(plain(E.garisPecahanRentang(['1', '2/2'].slice(1))), { min: 0, max: 1 });
});

test('buildFracNumberLine: kompatibel 0–1 dan mendukung rentang negatif/campuran', () => {
  const biasa = E.buildFracNumberLine([{ num: 1, den: 2 }]);
  assert.match(biasa, />0<\/text>/);
  assert.match(biasa, />1<\/text>/);
  assert.match(biasa, /satu per dua/);
  const luas = E.buildFracNumberLine([E.pecahanDari('-3/4'), E.pecahanDari('1 1/2')], {
    min: -1,
    max: 2,
    ticks: 4,
  });
  assert.match(luas, />−1<\/text>/);
  assert.match(luas, />2<\/text>/);
  assert.match(luas, /negatif tiga per empat/);
  assert.match(luas, /frac-nl__pre/, 'tanda/bilangan bulat digambar di depan pecahan');
});

/* ---------- komponen lambang ---------- */

test('buildKalimatBandingPecahan: kotak ? sebelum dijawab, lambang setelahnya', () => {
  const kosong = E.buildKalimatBandingPecahan('3/8', '2/5', null);
  assert.match(kosong, /cmp-sentence__sym">\?/);
  assert.match(kosong, /tiga per delapan kotak kosong dua per lima/);
  const isi = E.buildKalimatBandingPecahan('3/8', '2/5', 'lt');
  assert.match(isi, /is-filled">&lt;/);
});

test('buildPilihSimbolPecahan: urutan mengikuti state acak, terkunci setelah benar', () => {
  const order = ['eq', 'gt', 'lt'];
  const st = { chosen: null, wrong: 0 };
  let html = E.buildPilihSimbolPecahan('3/8', '2/5', order, st, { group: 's1' });
  const urut = [...html.matchAll(/data-frac-sym="(\w+)"/g)].map((m) => m[1]);
  assert.deepEqual(urut, order);
  assert.doesNotMatch(html, /disabled/);
  st.chosen = 'lt';
  html = E.buildPilihSimbolPecahan('3/8', '2/5', order, st, { group: 's1' });
  assert.match(html, /is-correct/);
  assert.match(html, /disabled/);
});

test('engine: tidak ada deklarasi function/var global yang ganda', () => {
  const src = require('node:fs').readFileSync(
    require('node:path').join(__dirname, '..', 'shared', 'engine.js'),
    'utf8'
  );
  const names = [...src.matchAll(/^(?:function|var) ([A-Za-z0-9_$]+)/gm)].map((m) => m[1]);
  const ganda = names.filter((n, i) => names.indexOf(n) !== i);
  assert.deepEqual(ganda, [], 'nama ganda menimpa definisi lain: ' + ganda.join(', '));
});
