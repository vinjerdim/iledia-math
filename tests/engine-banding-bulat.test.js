'use strict';

/*
 * Tes shared/engine.js seksi 11, 12 & 34 (membandingkan dan mengurutkan
 * bilangan bulat dalam konteks sehari-hari): lambang perbandingan,
 * susun kartu dengan ketukan, rotasi peran & predikat tim Cooperative
 * Learning, pengurutan naik/turun, makna perbandingan per konteks
 * (lebih dingin, lebih dalam, …), diagnosa miskonsepsi perbandingan,
 * dan rentang garis bilangan yang memuat semua bilangan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

/* ---------- seksi 11: lambang & susun kartu ---------- */

test('compareSymbolId & compareSymbolText', () => {
  assert.equal(E.compareSymbolId(-8, -3), 'lt');
  assert.equal(E.compareSymbolId(0, -1), 'gt');
  assert.equal(E.compareSymbolId(-4, -4), 'eq');
  assert.equal(E.compareSymbolText('lt'), '<');
  assert.equal(E.compareSymbolText('gt'), '>');
  assert.equal(E.compareSymbolText('eq'), '=');
  assert.equal(E.compareSymbolText('x'), '?');
});

test('ensureTapOrderState: pool teracak tidak pernah sama dengan jawaban', () => {
  const items = ['a', 'b', 'c'].map((id) => ({ id, label: id }));
  const answer = ['a', 'b', 'c'];
  for (let i = 0; i < 40; i++) {
    const state = {};
    const st = E.ensureTapOrderState(state, 'k', items, answer);
    assert.equal(st.pool.length, 3);
    assert.notEqual(st.pool.join('|'), answer.join('|'));
    assert.deepEqual(plain(st.placed), []);
  }
});

test('ensureTapOrderState: state tersimpan yang valid dipertahankan', () => {
  const items = ['a', 'b', 'c'].map((id) => ({ id, label: id }));
  const state = { k: { pool: ['c'], placed: ['a', 'b'], checked: false, correct: false } };
  const st = E.ensureTapOrderState(state, 'k', items, ['a', 'b', 'c']);
  assert.deepEqual(plain(st.placed), ['a', 'b']);
  state.k = { pool: ['x'], placed: [] };
  assert.equal(E.ensureTapOrderState(state, 'k', items, ['a', 'b', 'c']).pool.length, 3);
});

test('tapOrderIsCorrect hanya bila semua kartu terpasang berurutan', () => {
  assert.equal(E.tapOrderIsCorrect({ placed: ['a', 'b', 'c'] }, ['a', 'b', 'c']), true);
  assert.equal(E.tapOrderIsCorrect({ placed: ['a', 'c', 'b'] }, ['a', 'b', 'c']), false);
  assert.equal(E.tapOrderIsCorrect({ placed: ['a', 'b'] }, ['a', 'b', 'c']), false);
});

/* ---------- seksi 12: Cooperative Learning ---------- */

test('assignCoopRoles membuang nama kosong dan mempertahankan semua anggota', () => {
  const out = E.assignCoopRoles([' Ani ', '', 'Budi', '  ', 'Cici']);
  assert.deepEqual(plain(out).sort(), ['Ani', 'Budi', 'Cici']);
});

test('coopRoleAssignment merotasi peran setiap putaran', () => {
  const anggota = ['Ani', 'Budi', 'Cici', 'Dodi'];
  const r0 = plain(E.coopRoleAssignment(anggota, 0).map((p) => p.nama));
  const r1 = plain(E.coopRoleAssignment(anggota, 1).map((p) => p.nama));
  assert.deepEqual(r0, ['Ani', 'Budi', 'Cici', 'Dodi']);
  assert.deepEqual(r1, ['Budi', 'Cici', 'Dodi', 'Ani']);
  /* tiga anggota, empat peran → seorang memegang dua peran */
  const r3 = plain(E.coopRoleAssignment(['A', 'B', 'C'], 0).map((p) => p.nama));
  assert.deepEqual(r3, ['A', 'B', 'C', 'A']);
  assert.equal(E.coopRoleAssignment([], 0)[0].nama, '—');
});

test('coopAwardLevel: batas Tim Super 85, Tim Hebat 70', () => {
  assert.equal(E.coopAwardLevel(100).id, 'super');
  assert.equal(E.coopAwardLevel(85).id, 'super');
  assert.equal(E.coopAwardLevel(84).id, 'hebat');
  assert.equal(E.coopAwardLevel(70).id, 'hebat');
  assert.equal(E.coopAwardLevel(69).id, 'baik');
  assert.equal(E.coopAwardLevel(0).id, 'baik');
});

/* ---------- seksi 34: urutkan ---------- */

test('urutkanBulat: naik & turun tanpa mengubah array asal', () => {
  const asal = [3, -8, 0, -2, 5];
  assert.deepEqual(plain(E.urutkanBulat(asal, 'naik')), [-8, -2, 0, 3, 5]);
  assert.deepEqual(plain(E.urutkanBulat(asal, 'turun')), [5, 3, 0, -2, -8]);
  assert.deepEqual(plain(E.urutkanBulat(asal)), [-8, -2, 0, 3, 5]);
  assert.deepEqual(asal, [3, -8, 0, -2, 5]);
});

test('urutanIdBulat: id item urut menurut nilai', () => {
  const items = [
    { id: 'p', value: 2 },
    { id: 'q', value: -5 },
    { id: 'r', value: 0 },
  ];
  assert.deepEqual(plain(E.urutanIdBulat(items, 'naik')), ['q', 'r', 'p']);
  assert.deepEqual(plain(E.urutanIdBulat(items, 'turun')), ['p', 'r', 'q']);
});

/* ---------- seksi 34: makna perbandingan dalam konteks ---------- */

test('KATA_BANDING tersedia untuk setiap tema KONTEKS_BULAT', () => {
  Object.keys(E.KONTEKS_BULAT).forEach((tema) => {
    const K = E.KATA_BANDING[tema];
    assert.ok(K, 'kata banding untuk ' + tema);
    ['kecil', 'besar', 'sama', 'terkecil', 'terbesar'].forEach((k) =>
      assert.ok(K[k], tema + '.' + k)
    );
  });
});

test('idMaknaBanding: kecil / besar / sama', () => {
  assert.equal(E.idMaknaBanding(-8, -3), 'kecil');
  assert.equal(E.idMaknaBanding(2, -3), 'besar');
  assert.equal(E.idMaknaBanding(0, 0), 'sama');
});

test('maknaBanding memakai kata sesuai konteks', () => {
  assert.equal(E.maknaBanding(-8, -3, 'suhu'), 'lebih dingin');
  assert.equal(E.maknaBanding(30, 18, 'suhu'), 'lebih hangat');
  assert.equal(E.maknaBanding(-50, -200, 'laut'), 'lebih dangkal');
  assert.equal(E.maknaBanding(100, 3000, 'laut'), 'lebih rendah');
  assert.equal(E.maknaBanding(-200, -50, 'laut'), 'lebih dalam');
  assert.equal(E.maknaBanding(-2, 3, 'gedung'), 'lebih bawah');
  assert.equal(E.maknaBanding(-5000, 2000, 'uang'), 'lebih sedikit');
  assert.equal(E.maknaBanding(10, -5, 'skor'), 'lebih tinggi');
  assert.equal(E.maknaBanding(4, 4, 'suhu'), E.KATA_BANDING.suhu.sama);
});

test('opsiMaknaBanding: tiga opsi berid unik untuk diacak', () => {
  const opsi = E.opsiMaknaBanding('laut');
  assert.deepEqual(plain(opsi.map((o) => o.id)), ['kecil', 'besar', 'sama']);
  assert.equal(opsi[0].label, 'lebih rendah');
  assert.equal(opsi[1].label, 'lebih tinggi');
  /* di bawah permukaan laut: kata dalam/dangkal */
  const bawah = E.opsiMaknaBanding('laut', -200, -50);
  assert.equal(bawah[0].label, 'lebih dalam');
  assert.equal(bawah[1].label, 'lebih dangkal');
});

/* ---------- seksi 34: diagnosa miskonsepsi ---------- */

test('diagnosaBanding: benar', () => {
  assert.equal(E.diagnosaBanding(-8, -3, 'lt'), 'benar');
  assert.equal(E.diagnosaBanding(0, -1, 'gt'), 'benar');
  assert.equal(E.diagnosaBanding(-4, -4, 'eq'), 'benar');
});

test('diagnosaBanding: mengabaikan tanda negatif (−8 > −3 karena 8 > 3)', () => {
  assert.equal(E.diagnosaBanding(-8, -3, 'gt'), 'abaikanTanda');
  assert.equal(E.diagnosaBanding(-1, 5, 'eq'), 'terbalik');
  assert.equal(E.diagnosaBanding(-5, 5, 'eq'), 'abaikanTanda');
  assert.equal(E.diagnosaBanding(-6, 2, 'gt'), 'abaikanTanda');
  assert.equal(E.diagnosaBanding(-2, -7, 'lt'), 'abaikanTanda');
});

test('diagnosaBanding: menganggap nol paling kecil', () => {
  assert.equal(E.diagnosaBanding(0, -4, 'lt'), 'nolTerkecil');
  assert.equal(E.diagnosaBanding(-4, 0, 'gt'), 'nolTerkecil');
});

test('diagnosaBanding: arah lambang terbalik', () => {
  assert.equal(E.diagnosaBanding(2, 7, 'gt'), 'terbalik');
  assert.equal(E.diagnosaBanding(-2, 5, 'gt'), 'terbalik');
  assert.equal(E.diagnosaBanding(-8, -3, 'eq'), 'terbalik');
});

test('pesanBanding: pesan per diagnosa menyebut kedua bilangan', () => {
  ['benar', 'abaikanTanda', 'nolTerkecil', 'terbalik'].forEach((d) => {
    const p = E.pesanBanding(d, -8, -3);
    assert.ok(p.length > 20, d);
    assert.ok(p.indexOf('−8') !== -1 && p.indexOf('−3') !== -1, d + ' menyebut bilangan');
  });
});

/* ---------- seksi 34: rentang garis bilangan ---------- */

test('rentangGaris memuat semua bilangan dengan tepi', () => {
  assert.deepEqual(plain(E.rentangGaris([-8, -3, 2])), { min: -10, max: 4 });
  assert.deepEqual(plain(E.rentangGaris([1, 5], 1)), { min: -1, max: 6 });
  const r = E.rentangGaris([-3, 3]);
  assert.ok(r.min <= -3 && r.max >= 3 && r.min < 0 && r.max > 0);
});
