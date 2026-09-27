'use strict';

/*
 * Tes shared/engine.js seksi 53 (notasi ilmiah): bilangan ditulis
 * { m, e } = m × 10ᵉ dengan mantisa berupa STRING berkoma sehingga
 * seluruh konversi & perbandingan EKSAK (tanpa galat float). Diuji:
 * normalisasi, bentuk baku, konversi bentuk panjang ⇄ notasi ilmiah,
 * teks & cara baca, perbandingan, pengurutan, nilai ekstrem, selisih
 * orde, strategi, diagnosa miskonsepsi, opsi pilihan berdiagnosa, lab
 * geser koma, pita orde, serta komponen render.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function X(m, e) {
  return { m: m, e: e };
}

function labels(list) {
  return list.map((o) => o.label);
}

/* ---------- pembentukan & bentuk baku ---------- */

test('ilmiah menormalkan mantisa ke string berkoma', () => {
  assert.deepEqual(plain(E.ilmiah(4.5, -5)), X('4,5', -5));
  assert.deepEqual(plain(E.ilmiah('4.5', 3)), X('4,5', 3));
  assert.deepEqual(plain(E.ilmiah('12,70', 6)), X('12,70', 6));
  assert.deepEqual(plain(E.ilmiah(3, 8)), X('3', 8));
});

test('isBakuIlmiah: 1 ≤ mantisa < 10', () => {
  assert.equal(E.isBakuIlmiah(X('4,5', -5)), true);
  assert.equal(E.isBakuIlmiah(X('1', 9)), true);
  assert.equal(E.isBakuIlmiah(X('9,99', -2)), true);
  assert.equal(E.isBakuIlmiah(X('12,7', 6)), false);
  assert.equal(E.isBakuIlmiah(X('0,12', -6)), false);
  assert.equal(E.isBakuIlmiah(X('10', 4)), false);
  assert.equal(E.isBakuIlmiah(X('45', -6)), false);
  assert.equal(E.isBakuIlmiah(X('0,8', 3)), false);
});

test('bakukanIlmiah menggeser koma dan menyesuaikan pangkat', () => {
  assert.deepEqual(plain(E.bakukanIlmiah(X('12,7', 6))), X('1,27', 7));
  assert.deepEqual(plain(E.bakukanIlmiah(X('0,12', -6))), X('1,2', -7));
  assert.deepEqual(plain(E.bakukanIlmiah(X('250', 3))), X('2,5', 5));
  assert.deepEqual(plain(E.bakukanIlmiah(X('228', 9))), X('2,28', 11));
  assert.deepEqual(plain(E.bakukanIlmiah(X('45', -6))), X('4,5', -5));
  assert.deepEqual(plain(E.bakukanIlmiah(X('4,50', 2))), X('4,5', 2));
  assert.deepEqual(plain(E.bakukanIlmiah(X('3', 8))), X('3', 8));
  assert.deepEqual(plain(E.bakukanIlmiah(X('0,0735', 24))), X('7,35', 22));
});

/* ---------- konversi bentuk panjang ⇄ notasi ilmiah ---------- */

test('desimalKeIlmiah: bentuk panjang → notasi ilmiah baku', () => {
  assert.deepEqual(plain(E.desimalKeIlmiah('300.000.000')), X('3', 8));
  assert.deepEqual(plain(E.desimalKeIlmiah('384.000.000')), X('3,84', 8));
  assert.deepEqual(plain(E.desimalKeIlmiah('0,000008')), X('8', -6));
  assert.deepEqual(plain(E.desimalKeIlmiah('0,00052')), X('5,2', -4));
  assert.deepEqual(plain(E.desimalKeIlmiah('1.905.000')), X('1,905', 6));
  assert.deepEqual(plain(E.desimalKeIlmiah('7')), X('7', 0));
  assert.deepEqual(plain(E.desimalKeIlmiah('45,6')), X('4,56', 1));
});

test('ilmiahKeDesimal: notasi ilmiah → bentuk panjang berpemisah ribuan', () => {
  assert.equal(E.ilmiahKeDesimal(X('3', 8)), '300.000.000');
  assert.equal(E.ilmiahKeDesimal(X('3,84', 8)), '384.000.000');
  assert.equal(E.ilmiahKeDesimal(X('8', -6)), '0,000008');
  assert.equal(E.ilmiahKeDesimal(X('1,2', -7)), '0,00000012');
  assert.equal(E.ilmiahKeDesimal(X('12,7', 6)), '12.700.000');
  assert.equal(E.ilmiahKeDesimal(X('5,97', 24)), '5.970.000.000.000.000.000.000.000');
  assert.equal(E.ilmiahKeDesimal(X('4,56', 1)), '45,6');
  assert.equal(E.ilmiahKeDesimal(X('7', 0)), '7');
  /* bolak-balik tetap sama */
  ['0,000002', '1.905.000', '0,0001', '280.000.000'].forEach((s) => {
    assert.equal(E.ilmiahKeDesimal(E.desimalKeIlmiah(s)), s);
  });
});

/* ---------- teks & bacaan ---------- */

test('teksIlmiah memakai tanda × dan pangkat superskrip', () => {
  assert.equal(E.teksIlmiah(X('4,5', -5)), '4,5 × 10⁻⁵');
  assert.equal(E.teksIlmiah(X('3', 8)), '3 × 10⁸');
  assert.equal(E.teksIlmiah(X('1,5', 11)), '1,5 × 10¹¹');
  assert.equal(E.teksIlmiah(X('9,11', -31)), '9,11 × 10⁻³¹');
});

test('bacaIlmiah: "... kali sepuluh pangkat ..." dengan kata negatif', () => {
  assert.equal(E.bacaIlmiah(X('4,5', -5)), 'empat koma lima kali sepuluh pangkat negatif lima');
  assert.equal(E.bacaIlmiah(X('3', 8)), 'tiga kali sepuluh pangkat delapan');
  assert.equal(
    E.bacaIlmiah(X('9,11', -31)),
    'sembilan koma satu satu kali sepuluh pangkat negatif tiga puluh satu'
  );
  assert.equal(E.bacaIlmiah(X('1,5', 11)), 'satu koma lima kali sepuluh pangkat sebelas');
});

/* ---------- perbandingan & urutan ---------- */

test('bandingIlmiah eksak, termasuk pangkat negatif & bentuk tidak baku', () => {
  assert.equal(E.bandingIlmiah(X('9,11', -31), X('1,67', -27)), -1);
  assert.equal(E.bandingIlmiah(X('1,5', 11), X('3,84', 8)), 1);
  assert.equal(E.bandingIlmiah(X('2,8', 8), X('3,4', 8)), -1);
  assert.equal(E.bandingIlmiah(X('228', 9), X('1,5', 11)), 1);
  assert.equal(E.bandingIlmiah(X('0,12', -6), X('1,2', -7)), 0);
  assert.equal(E.bandingIlmiah(X('8', -6), E.desimalKeIlmiah('0,000008')), 0);
  assert.equal(E.bandingIlmiah(X('1,2', -7), X('2', -9)), 1);
  /* item {x} juga diterima */
  assert.equal(E.bandingIlmiah({ x: X('1', 2) }, { x: X('99', 0) }), 1);
});

test('simbolBandingIlmiah & kalimatBandingIlmiah', () => {
  assert.equal(E.simbolBandingIlmiah(X('9,11', -31), X('1,67', -27)), 'lt');
  assert.equal(E.simbolBandingIlmiah(X('228', 9), X('1,5', 11)), 'gt');
  assert.equal(E.simbolBandingIlmiah(X('0,12', -6), X('1,2', -7)), 'eq');
  assert.equal(
    E.kalimatBandingIlmiah(X('9,11', -31), X('1,67', -27)),
    '9,11 × 10⁻³¹ < 1,67 × 10⁻²⁷'
  );
});

test('urutanIdIlmiah & ekstremIlmiah', () => {
  const items = [
    { id: 'rambut', x: X('8', -5) },
    { id: 'virus', x: X('0,12', -6) },
    { id: 'darah', x: X('8', -6) },
    { id: 'bakteri', x: X('2', -6) },
    { id: 'dna', x: X('2', -9) },
  ];
  assert.deepEqual(plain(E.urutanIdIlmiah(items)), ['dna', 'virus', 'bakteri', 'darah', 'rambut']);
  assert.deepEqual(plain(E.urutanIdIlmiah(items, 'turun')), [
    'rambut',
    'darah',
    'bakteri',
    'virus',
    'dna',
  ]);
  assert.equal(E.ekstremIlmiah(items, 'terkecil'), 'dna');
  assert.equal(E.ekstremIlmiah(items, 'terbesar'), 'rambut');
});

test('selisihOrdeIlmiah membandingkan pangkat setelah dibakukan', () => {
  assert.equal(E.selisihOrdeIlmiah(X('1,5', 11), X('12,7', 6)), 4);
  assert.equal(E.selisihOrdeIlmiah(X('1,67', -27), X('9,11', -31)), 4);
  assert.equal(E.selisihOrdeIlmiah(X('3', 8), X('3', 8)), 0);
});

/* ---------- strategi & penjelasan ---------- */

test('strategiBandingIlmiah: bakukan / pangkatBeda / pangkatSama', () => {
  assert.equal(E.strategiBandingIlmiah(X('228', 9), X('1,5', 11)), 'bakukan');
  assert.equal(E.strategiBandingIlmiah(X('9,11', -31), X('1,67', -27)), 'pangkatBeda');
  assert.equal(E.strategiBandingIlmiah(X('2,8', 8), X('3,4', 8)), 'pangkatSama');
  assert.equal(E.STRATEGI_BANDING_ILMIAH.length, 3);
  E.STRATEGI_BANDING_ILMIAH.forEach((s) => {
    assert.ok(s.id && s.nama && s.ikon);
  });
});

test('penjelasanBandingIlmiah menyebut langkah yang dipakai', () => {
  assert.match(E.penjelasanBandingIlmiah(X('228', 9), X('1,5', 11)), /2,28 × 10¹¹/);
  assert.match(E.penjelasanBandingIlmiah(X('9,11', -31), X('1,67', -27)), /−31 < −27/);
  assert.match(E.penjelasanBandingIlmiah(X('2,8', 8), X('3,4', 8)), /2,8 < 3,4/);
});

/* ---------- diagnosa miskonsepsi ---------- */

test('diagnosaSimbolIlmiah mengenali miskonsepsi utama', () => {
  /* hanya melihat mantisa: 9,11 > 1,67 */
  assert.equal(E.diagnosaSimbolIlmiah(X('9,11', -31), X('1,67', -27), 'gt'), 'mantisaSaja');
  /* pangkat negatif dibaca sebagai bilangan positif: 9 > 6 */
  assert.equal(E.diagnosaSimbolIlmiah(X('2', -9), X('8', -6), 'gt'), 'pangkatNegatif');
  /* bila mantisa & pangkat negatif sama-sama cocok, mantisa didahulukan */
  assert.equal(E.diagnosaSimbolIlmiah(X('2', -9), X('1,2', -7), 'gt'), 'mantisaSaja');
  /* lupa membakukan: 10⁹ < 10¹¹ */
  assert.equal(E.diagnosaSimbolIlmiah(X('228', 9), X('1,5', 11), 'lt'), 'belumBaku');
  /* nilainya berbeda, tetapi dipilih sama */
  assert.equal(E.diagnosaSimbolIlmiah(X('3', 8), X('3', 9), 'eq'), 'samaBentuk');
  assert.equal(E.diagnosaSimbolIlmiah(X('3', 8), X('3', 9), 'lt'), null);
  assert.equal(E.diagnosaSimbolIlmiah(X('3,84', 8), X('1,5', 11), 'gt'), 'mantisaSaja');
});

test('pesanBandingIlmiah memberi pesan untuk setiap kode', () => {
  ['mantisaSaja', 'pangkatNegatif', 'belumBaku', 'samaBentuk', 'terbalik'].forEach((k) => {
    const t = E.pesanBandingIlmiah(k, X('228', 9), X('1,5', 11));
    assert.ok(typeof t === 'string' && t.length > 20, k);
  });
  assert.match(E.pesanBandingIlmiah('benar', X('3', 8), X('3', 9)), /^Tepat!/);
});

/* ---------- opsi berdiagnosa ---------- */

function assertOpsi(list, benarId) {
  assert.ok(list.length >= 3, 'minimal 3 opsi');
  assert.equal(new Set(list.map((o) => o.id)).size, list.length, 'id unik');
  assert.equal(new Set(labels(list)).size, list.length, 'label unik');
  assert.ok(
    list.some((o) => o.id === benarId),
    'opsi benar ada'
  );
  list.forEach((o) => assert.ok(o.umpan && o.umpan.length > 10, o.id + ': umpan'));
}

test('opsiTulisIlmiah: bentuk panjang → notasi ilmiah (berdiagnosa)', () => {
  const a = E.opsiTulisIlmiah('0,000008');
  assertOpsi(a, 'baku');
  assert.equal(a[0].id, 'baku');
  assert.equal(a[0].label, '8 × 10⁻⁶');
  assert.ok(labels(a).includes('8 × 10⁶'), 'arah geser terbalik');
  assert.ok(labels(a).includes('8 × 10⁻⁵'), 'menghitung nol');
  const b = E.opsiTulisIlmiah('384.000.000');
  assertOpsi(b, 'baku');
  assert.equal(b[0].label, '3,84 × 10⁸');
  assert.ok(labels(b).includes('384 × 10⁶'), 'belum baku');
  assert.ok(labels(b).includes('3,84 × 10⁶'), 'menghitung nol');
  const c = E.opsiTulisIlmiah('300.000.000');
  assertOpsi(c, 'baku');
});

test('opsiBakukanIlmiah: tidak baku → baku (berdiagnosa)', () => {
  const a = E.opsiBakukanIlmiah(X('12,7', 6));
  assertOpsi(a, 'baku');
  assert.equal(a[0].label, '1,27 × 10⁷');
  assert.ok(labels(a).includes('1,27 × 10⁵'), 'pangkat berubah ke arah salah');
  assert.ok(labels(a).includes('1,27 × 10⁶'), 'pangkat tidak disesuaikan');
  const b = E.opsiBakukanIlmiah(X('0,12', -6));
  assertOpsi(b, 'baku');
  assert.equal(b[0].label, '1,2 × 10⁻⁷');
  assert.ok(labels(b).includes('1,2 × 10⁻⁵'));
});

test('opsiPanjangIlmiah: notasi ilmiah → bentuk panjang (berdiagnosa)', () => {
  const a = E.opsiPanjangIlmiah(X('3', 8));
  assertOpsi(a, 'baku');
  assert.equal(a[0].label, '300.000.000');
  assert.ok(labels(a).includes('0,00000003'), 'arah terbalik');
  const b = E.opsiPanjangIlmiah(X('1,2', -7));
  assertOpsi(b, 'baku');
  assert.equal(b[0].label, '0,00000012');
});

test('opsiBacaIlmiah: cara baca berdiagnosa', () => {
  const a = E.opsiBacaIlmiah(X('4,5', -5));
  assertOpsi(a, 'baku');
  assert.equal(a[0].label, 'empat koma lima kali sepuluh pangkat negatif lima');
  assert.ok(labels(a).includes('empat koma lima kali sepuluh pangkat lima'), 'tanda hilang');
  assert.ok(labels(a).includes('empat koma lima pangkat negatif lima'), 'tanpa sepuluh');
  const b = E.opsiBacaIlmiah(X('3', 8));
  assertOpsi(b, 'baku');
  assert.ok(labels(b).includes('tiga kali sepuluh pangkat negatif delapan'));
});

test('opsiMaknaBandingIlmiah & idMaknaBandingIlmiah', () => {
  const o = E.opsiMaknaBandingIlmiah('berat');
  assert.deepEqual(plain(o.map((x) => x.id)), ['kecil', 'besar', 'sama']);
  assert.equal(o[1].label, 'lebih berat');
  assert.equal(E.idMaknaBandingIlmiah(X('9,11', -31), X('1,67', -27)), 'kecil');
  assert.equal(E.idMaknaBandingIlmiah(X('0,12', -6), X('1,2', -7)), 'sama');
  assert.equal(E.maknaBandingIlmiah(X('1,5', 11), X('3,84', 8), 'jarak'), 'lebih jauh');
});

/* ---------- lab geser koma ---------- */

test('lab geser koma: mantisa & pangkat mengikuti banyak geseran', () => {
  const x = X('3', 8);
  assert.deepEqual(plain(E.bentukGeserKoma(x, 0)), X('300.000.000', 0));
  assert.deepEqual(plain(E.bentukGeserKoma(x, 8)), X('3', 8));
  assert.deepEqual(plain(E.bentukGeserKoma(x, 6)), X('300', 6));
  const y = X('8', -6);
  assert.deepEqual(plain(E.bentukGeserKoma(y, 0)), X('0,000008', 0));
  assert.deepEqual(plain(E.bentukGeserKoma(y, -6)), X('8', -6));
  assert.deepEqual(plain(E.batasGeserKoma(x)), { min: -2, max: 10 });
  assert.deepEqual(plain(E.batasGeserKoma(y)), { min: -8, max: 2 });
});

test('lab geser koma: state, geser, dan catatan bentuk baku', () => {
  const items = [
    { id: 'c', x: X('3', 8) },
    { id: 'd', x: X('8', -6) },
  ];
  const st = E.makeLabGeserKomaState(items);
  assert.equal(st.aktif, 'c');
  assert.deepEqual(plain(st.geser), { c: 0, d: 0 });
  assert.deepEqual(plain(st.baku), []);
  E.geserLabGeserKoma(st, items, 1);
  assert.equal(st.geser.c, 1);
  for (let i = 0; i < 7; i++) E.geserLabGeserKoma(st, items, 1);
  assert.deepEqual(plain(st.baku), ['c']);
  /* batas geser */
  for (let i = 0; i < 10; i++) E.geserLabGeserKoma(st, items, 1);
  assert.equal(st.geser.c, 10);
  st.aktif = 'd';
  for (let i = 0; i < 6; i++) E.geserLabGeserKoma(st, items, -1);
  assert.deepEqual(plain(st.baku), ['c', 'd']);
  assert.equal(E.labGeserKomaSelesai(st, items), true);
});

test('buildLabGeserKoma merender tombol geser, bentuk, dan status', () => {
  const items = [{ id: 'c', nama: 'Kecepatan cahaya', satuan: 'm/s', x: X('3', 8) }];
  const st = E.makeLabGeserKomaState(items);
  const html = E.buildLabGeserKoma('lab', items, st);
  assert.match(html, /data-gk-langkah="1"/);
  assert.match(html, /data-gk-langkah="-1"/);
  assert.match(html, /300\.000\.000 × 10⁰/);
  assert.match(html, /belum baku/i);
  st.geser.c = 8;
  const html2 = E.buildLabGeserKoma('lab', items, st);
  assert.match(html2, /3 × 10⁸/);
  assert.match(html2, /baku/);
});

/* ---------- pita orde ---------- */

test('pita orde: penempatan benar bila anak tangga = pangkat baku', () => {
  const items = [
    { id: 'virus', nama: 'Virus', x: X('0,12', -6) },
    { id: 'dna', nama: 'DNA', x: X('2', -9) },
  ];
  const s = { pita: null };
  const st = E.ensurePitaOrdeState(s, 'pita', items);
  assert.equal(st, s.pita);
  assert.deepEqual(plain(s.pita), { pilih: null, taruh: {}, salah: {}, pesan: null });
  assert.equal(E.pangkatBakuIlmiah(items[0].x), -7);
  assert.equal(E.taruhPitaOrde(s.pita, items, 'virus', -6), false);
  assert.equal(s.pita.salah.virus, 1);
  assert.equal(E.taruhPitaOrde(s.pita, items, 'virus', -7), true);
  assert.equal(s.pita.taruh.virus, -7);
  assert.equal(E.pitaOrdeSelesai(s.pita, items), false);
  E.taruhPitaOrde(s.pita, items, 'dna', -9);
  assert.equal(E.pitaOrdeSelesai(s.pita, items), true);
});

test('buildPitaOrde merender anak tangga 10ⁿ dan kartu', () => {
  const items = [{ id: 'dna', nama: 'DNA', x: X('2', -9) }];
  const s = {};
  E.ensurePitaOrdeState(s, 'pita', items);
  const html = E.buildPitaOrde('pita', items, [-10, -9, -8], s.pita);
  assert.match(html, /10⁻⁹/);
  assert.equal((html.match(/data-po-rung=/g) || []).length, 3);
  assert.match(html, /data-po-item="dna"/);
});

/* ---------- komponen render ---------- */

test('ilmiahHTML & buildKalimatBandingIlmiah', () => {
  const h = E.ilmiahHTML(X('4,5', -5));
  assert.match(h, /aria-label="empat koma lima kali sepuluh pangkat negatif lima"/);
  assert.match(h, /4,5 × 10⁻⁵/);
  const k = E.buildKalimatBandingIlmiah(X('3', 8), X('3', 9), 'lt');
  assert.match(k, /cmp-sentence/);
  assert.match(k, /&lt;/);
  assert.match(E.buildKalimatBandingIlmiah(X('3', 8), X('3', 9), null), /kotak kosong/);
});

test('buildPilihSimbolIlmiah & catatPilihSimbolIlmiah', () => {
  const p = X('9,11', -31);
  const q = X('1,67', -27);
  const st = { chosen: null, wrong: 0 };
  E.catatPilihSimbolIlmiah(st, p, q, 'gt');
  assert.equal(st.wrong, 1);
  assert.equal(st.diag, 'mantisaSaja');
  let html = E.buildPilihSimbolIlmiah(p, q, ['lt', 'gt', 'eq'], st, { group: 'g1' });
  assert.match(html, /data-ilm-sym="lt"/);
  assert.match(html, /feedback-box--warning/);
  E.catatPilihSimbolIlmiah(st, p, q, 'lt');
  assert.equal(st.diag, null);
  html = E.buildPilihSimbolIlmiah(p, q, ['lt', 'gt', 'eq'], st, { group: 'g1' });
  assert.match(html, /feedback-box--success/);
  /* setelah benar tidak berubah lagi */
  E.catatPilihSimbolIlmiah(st, p, q, 'gt');
  assert.equal(st.chosen, 'lt');
});
