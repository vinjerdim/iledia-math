'use strict';

/*
 * Tes shared/engine.js seksi 63 (perkalian & pembagian pecahan dalam
 * masalah kontekstual): hasil eksak × dan :, kebalikan, kalimat operasi,
 * langkah (ubah ke pecahan biasa → kali kebalikan → kalikan → sederhanakan),
 * diagnosa miskonsepsi (pembagi tidak dibalik, membalik bilangan pertama,
 * penyebut dipertahankan, penyebut ikut dikali bilangan bulat, campuran
 * dikali terpisah, lupa bilangan bulat, salah tanda, operasi terbalik,
 * belum sederhana), opsi berpengecoh, pita kelompok (penjumlahan
 * berulang & "berapa banyak … di dalam …"), model luas, dan langkah isian
 * operasi seksi 62 yang kini juga menerima × dan :.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function R(num, den) {
  return { num, den };
}

/* ---------- nilai ---------- */

test('opKaliBagi: lambang × dan : beserta variannya', () => {
  ['×', '*', 'x', 'kali'].forEach((op) => assert.equal(E.opKaliBagi(op), '×'));
  [':', '÷', '/', 'bagi'].forEach((op) => assert.equal(E.opKaliBagi(op), ':'));
  assert.equal(E.opKaliBagi('+'), null);
  assert.equal(E.opKaliBagi('-'), null);
});

test('kaliBagiPecahan: hasil eksak paling sederhana', () => {
  assert.deepEqual(plain(E.kaliBagiPecahan('2/3', '×', '3/4')), R(1, 2));
  assert.deepEqual(plain(E.kaliBagiPecahan('3', '×', '2/5')), R(6, 5));
  assert.deepEqual(plain(E.kaliBagiPecahan('2 1/2', '×', '1 1/3')), R(10, 3));
  assert.deepEqual(plain(E.kaliBagiPecahan('-1 1/2', '×', '2/3')), R(-1, 1));
  assert.deepEqual(plain(E.kaliBagiPecahan('-2/3', '×', '-3/4')), R(1, 2));
  assert.deepEqual(plain(E.kaliBagiPecahan('3/4', ':', '1/8')), R(6, 1));
  assert.deepEqual(plain(E.kaliBagiPecahan('5/6', ':', '1/3')), R(5, 2));
  assert.deepEqual(plain(E.kaliBagiPecahan('-3/4', ':', '1 1/2')), R(-1, 2));
  assert.deepEqual(plain(E.kaliBagiPecahan('6', ':', '1/2')), R(12, 1));
  assert.deepEqual(plain(E.kaliBagiPecahan('3/4', ':', '3')), R(1, 4));
  assert.deepEqual(plain(E.kaliBagiPecahan('0', '×', '3/4')), R(0, 1));
  assert.throws(() => E.kaliBagiPecahan('3/4', ':', '0'));
  assert.throws(() => E.kaliBagiPecahan('3/4', '+', '1/4'));
});

test('hitungKaliBagiRasional: belum disederhanakan, tanda di pembilang', () => {
  assert.deepEqual(plain(E.hitungKaliBagiRasional('2/3', '×', '3/4')), R(6, 12));
  assert.deepEqual(plain(E.hitungKaliBagiRasional('3/4', ':', '-3/8')), R(-24, 12));
});

test('kebalikanRasional: tukar pembilang & penyebut, tanda tetap', () => {
  assert.deepEqual(plain(E.kebalikanRasional('3/4')), R(4, 3));
  assert.deepEqual(plain(E.kebalikanRasional('-1 1/2')), R(-2, 3));
  assert.deepEqual(plain(E.kebalikanRasional('5')), R(1, 5));
  assert.throws(() => E.kebalikanRasional('0'));
});

test('fmtOperasiKaliBagi: lambang × dan :, suku kedua negatif berkurung', () => {
  assert.equal(E.fmtOperasiKaliBagi('2/3', '×', '3/4'), '2/3 × 3/4');
  assert.equal(E.fmtOperasiKaliBagi('3/4', ':', '1/8'), '3/4 : 1/8');
  assert.equal(E.fmtOperasiKaliBagi('-2/3', '*', '-3/4'), '−2/3 × (−3/4)');
  assert.equal(E.fmtOperasiKaliBagi('2 1/2', '÷', '5'), '2 1/2 : 5');
});

test('langkahKaliBagiPecahan: biasa → kebalikan → kali → sederhana', () => {
  const L = plain(E.langkahKaliBagiPecahan('2 1/2', ':', '3/4'));
  assert.deepEqual(
    L.langkah.map((x) => x.id),
    ['biasa', 'balik', 'kali', 'sederhana']
  );
  assert.equal(L.langkah[0].teks, '2 1/2 : 3/4 = 5/2 : 3/4');
  assert.equal(L.langkah[1].teks, '5/2 : 3/4 = 5/2 × 4/3');
  assert.equal(L.langkah[2].teks, '5/2 × 4/3 = (5 × 4)/(2 × 3) = 20/6');
  assert.equal(L.langkah[3].teks, '20/6 = 10/3 = 3 1/3');
  assert.deepEqual(L.hasil, R(10, 3));

  const K = plain(E.langkahKaliBagiPecahan('1/2', '×', '3/5'));
  assert.deepEqual(
    K.langkah.map((x) => x.id),
    ['kali']
  );
  assert.equal(K.langkah[0].teks, '1/2 × 3/5 = (1 × 3)/(2 × 5) = 3/10');

  const N = plain(E.langkahKaliBagiPecahan('-3/4', '×', '2/3'));
  assert.equal(N.langkah[0].teks, '−3/4 × 2/3 = (−3 × 2)/(4 × 3) = −6/12');
  assert.equal(N.langkah[1].teks, '−6/12 = −1/2');

  const B = plain(E.langkahKaliBagiPecahan('4', '×', '3/8'));
  assert.deepEqual(
    B.langkah.map((x) => x.id),
    ['biasa', 'kali', 'sederhana']
  );
  assert.equal(B.langkah[0].teks, '4 × 3/8 = 4/1 × 3/8');
  assert.equal(B.langkah[2].teks, '12/8 = 3/2 = 1 1/2');
});

/* ---------- diagnosa ---------- */

function kode(jawab, a, op, b) {
  return E.diagnosaKaliBagiPecahan(jawab, a, op, b).kode;
}

test('diagnosaKaliBagiPecahan: benar dalam bentuk biasa, campuran, bulat, negatif', () => {
  assert.equal(kode('1/2', '2/3', '×', '3/4'), 'benar');
  assert.equal(kode('6', '3/4', ':', '1/8'), 'benar');
  assert.equal(kode('2 1/2', '5/6', ':', '1/3'), 'benar');
  assert.equal(kode('5/2', '5/6', ':', '1/3'), 'benar');
  assert.equal(kode('−1/2', '-3/4', ':', '1 1/2'), 'benar');
  assert.equal(kode('-1', '-1 1/2', '×', '2/3'), 'benar');
  const r = E.diagnosaKaliBagiPecahan('5/2', '5/6', ':', '1/3');
  assert.equal(r.benar, true);
  assert.match(r.pesan, /5\/6 : 1\/3 = 2 1\/2/);
  assert.match(r.pesan, /2 1\/2/);
});

test('diagnosaKaliBagiPecahan: belum sederhana', () => {
  assert.equal(kode('6/12', '2/3', '×', '3/4'), 'belum-sederhana');
  assert.equal(kode('15/6', '5/6', ':', '1/3'), 'belum-sederhana');
});

test('diagnosaKaliBagiPecahan: pembagi tidak dibalik & bilangan pertama dibalik', () => {
  assert.equal(kode('3/32', '3/4', ':', '1/8'), 'tidak-dibalik');
  assert.equal(kode('1/6', '3/4', ':', '1/8'), 'balik-pertama');
});

test('diagnosaKaliBagiPecahan: penyebut dipertahankan setelah disamakan', () => {
  /* 1/2 × 1/3 → 3/6 × 2/6 → 6/6 */
  assert.equal(kode('1', '1/2', '×', '1/3'), 'penyebut-tetap');
  /* 2/5 × 3/5 → 6/5 */
  assert.equal(kode('6/5', '2/5', '×', '3/5'), 'penyebut-tetap');
});

test('diagnosaKaliBagiPecahan: bilangan bulat ikut mengalikan penyebut', () => {
  assert.equal(kode('6/15', '3', '×', '2/5'), 'kali-penyebut-juga');
  assert.equal(kode('2/5', '3', '×', '2/5'), 'kali-penyebut-juga');
});

test('diagnosaKaliBagiPecahan: campuran dikali terpisah & lupa bilangan bulat', () => {
  /* 2 1/2 × 1 1/2 → 2 × 1 + 1/2 × 1/2 = 2 1/4 */
  assert.equal(kode('2 1/4', '2 1/2', '×', '1 1/2'), 'campuran-terpisah');
  /* 2 1/2 × 3/4 → 1/2 × 3/4 = 3/8 */
  assert.equal(kode('3/8', '2 1/2', '×', '3/4'), 'lupa-bulat');
});

test('diagnosaKaliBagiPecahan: salah tanda & operasi terbalik', () => {
  assert.equal(kode('1/2', '-3/4', ':', '1 1/2'), 'salah-tanda');
  assert.equal(kode('8/9', '2/3', '×', '3/4'), 'operasi-terbalik');
});

test('diagnosaKaliBagiPecahan: galat isian, salah umum, semua kode berpesan', () => {
  assert.equal(kode('', '2/3', '×', '3/4'), 'kosong');
  assert.equal(kode('0,5', '2/3', '×', '3/4'), 'format');
  assert.equal(kode('1/0', '2/3', '×', '3/4'), 'nol-penyebut');
  assert.equal(kode('7/9', '2/3', '×', '3/4'), 'salah');
  Object.keys(E.PESAN_KALI_BAGI_PECAHAN).forEach((k) => {
    assert.ok(E.PESAN_KALI_BAGI_PECAHAN[k].length > 10, 'pesan ' + k);
  });
  E.URUTAN_MISKONSEPSI_KALI_BAGI.forEach((k) => {
    assert.ok(E.PESAN_KALI_BAGI_PECAHAN[k], 'pesan miskonsepsi ' + k);
    assert.ok(E.UMPAN_OPSI_KALI_BAGI[k], 'umpan opsi ' + k);
  });
});

/* ---------- opsi berpengecoh ---------- */

test('opsiKaliBagiPecahan: empat opsi, benar pertama, nilai & label unik', () => {
  [
    ['2/3', '×', '3/4'],
    ['3', '×', '2/5'],
    ['3/4', ':', '1/8'],
    ['5/6', ':', '1/3'],
    ['2 1/2', '×', '1 1/2'],
    ['-3/4', ':', '1 1/2'],
    ['4', '×', '3/8'],
    ['6', ':', '1/2'],
  ].forEach(([a, op, b]) => {
    const o = plain(E.opsiKaliBagiPecahan(a, op, b));
    const nama = a + op + b;
    assert.equal(o.length, 4, nama);
    assert.equal(o[0].id, 'benar');
    assert.equal(o[0].benar, true);
    assert.equal(o[0].label, E.teksRasional(E.kaliBagiPecahan(a, op, b)));
    assert.equal(o.filter((x) => x.benar).length, 1, nama);
    assert.equal(new Set(o.map((x) => x.id)).size, 4, nama + ' id unik');
    assert.equal(new Set(o.map((x) => x.label)).size, 4, nama + ' label unik');
    const nilai = o.map((x) => {
      const v = E.sederhanakanRasional(E.parseIsianRasional(x.label).value);
      return v.num + '/' + v.den;
    });
    assert.equal(new Set(nilai).size, 4, nama + ' nilai unik');
    o.forEach((x) => assert.ok(x.umpan, nama + ' umpan ' + x.id));
  });
});

test('opsiKaliBagiPecahan: pengecoh dari miskonsepsi yang khas', () => {
  const bagi = plain(E.opsiKaliBagiPecahan('3/4', ':', '1/8')).map((x) => x.id);
  assert.ok(bagi.includes('tidak-dibalik'));
  assert.ok(bagi.includes('balik-pertama'));
  const bulat = plain(E.opsiKaliBagiPecahan('3', '×', '2/5'));
  const kpj = bulat.filter((x) => x.id === 'kali-penyebut-juga')[0];
  assert.ok(kpj, 'kali-penyebut-juga ada');
  assert.equal(kpj.label, '6/15');
});

/* ---------- pita kelompok & model luas ---------- */

test('hitungPitaKelompok: banyak kelompok utuh & sisa sebagai bagian kelompok', () => {
  assert.deepEqual(plain(E.hitungPitaKelompok('3/4', '1/8')), {
    utuh: 6,
    sisa: R(0, 1),
    hasil: R(6, 1),
    potong: 8,
  });
  assert.deepEqual(plain(E.hitungPitaKelompok('5/6', '1/3')), {
    utuh: 2,
    sisa: R(1, 2),
    hasil: R(5, 2),
    potong: 6,
  });
  assert.equal(E.hitungPitaKelompok('6/5', '2/5').utuh, 3);
  assert.throws(() => E.hitungPitaKelompok('-1/2', '1/4'));
  assert.throws(() => E.hitungPitaKelompok('1/2', '0'));
});

test('buildPitaKelompok: sel terarsir per kelompok, sisa, label aksesibel', () => {
  const h = E.buildPitaKelompok('5/6', '1/3', { label: 'Tepung' });
  assert.match(h, /class="pita-klp"/);
  assert.match(h, /role="img"/);
  assert.match(h, /aria-label="[^"]*5\/6[^"]*1\/3/);
  assert.equal((h.match(/pita-klp__cell/g) || []).length, 6);
  assert.equal((h.match(/is-g0/g) || []).length, 2);
  assert.equal((h.match(/is-g1/g) || []).length, 2);
  assert.equal((h.match(/is-sisa/g) || []).length, 1);
  assert.match(h, /Tepung/);
  /* penjumlahan berulang 3 × 2/5 → 6/5: dua utuh, 3 kelompok */
  const k = E.buildPitaKelompok('6/5', '2/5');
  assert.equal((k.match(/pita-klp__unit"/g) || []).length, 2);
  assert.equal((k.match(/is-awal/g) || []).length, 3);
});

test('buildLuasPecahan: grid penyebut × penyebut, irisan = hasil kali', () => {
  const h = E.buildLuasPecahan('2/3', '3/4');
  assert.match(h, /class="luas-pk"/);
  assert.equal((h.match(/luas-pk__cell/g) || []).length, 12);
  assert.equal((h.match(/is-ab/g) || []).length, 6);
  assert.match(h, /aria-label="[^"]*2\/3[^"]*3\/4/);
  const b = E.buildLuasPecahan('2/3', '3/4', { tahap: 'b' });
  assert.equal((b.match(/is-ab/g) || []).length, 0);
  assert.equal((b.match(/is-b"/g) || []).length, 9);
  assert.throws(() => E.buildLuasPecahan('3/2', '1/2'));
});

/* ---------- langkah isian operasi (seksi 62) kini menerima × dan : ---------- */

test('periksaIsianOperasi & buildIsianOperasi: soal × dan : didiagnosa seksi 63', () => {
  const soal = { a: '3/4', op: ':', b: '1/8', label: 'Banyak kantong', satuan: 'kantong' };
  const st = E.makeIsianOperasi();
  let r = E.periksaIsianOperasi(st, soal, '3/32');
  assert.equal(r.kode, 'tidak-dibalik');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  let h = E.buildIsianOperasi('t1', st, soal, 1);
  assert.match(h, /3\/4 : 1\/8/);
  assert.match(h, /kebalikan/);
  r = E.periksaIsianOperasi(st, soal, '6');
  assert.equal(r.benar, true);
  h = E.buildIsianOperasi('t1', st, soal, 1);
  assert.match(h, /3\/4 : 1\/8 = <strong>6<\/strong>/);
  /* soal ± tetap memakai diagnosa seksi 62 */
  const tambah = { a: '1/2', op: '+', b: '1/3', label: 'Jumlah' };
  const s2 = E.makeIsianOperasi();
  assert.equal(E.periksaIsianOperasi(s2, tambah, '2/5').kode, 'penyebut-dijumlah');
});

test('operasiRasional / fmtOperasiRasional: satu pintu untuk + − × :', () => {
  assert.deepEqual(plain(E.operasiRasional('1/2', '+', '1/3')), R(5, 6));
  assert.deepEqual(plain(E.operasiRasional('1/2', '×', '1/3')), R(1, 6));
  assert.deepEqual(plain(E.operasiRasional('1/2', ':', '1/3')), R(3, 2));
  assert.equal(E.fmtOperasiRasional('1/2', '-', '-1/3'), '1/2 − (−1/3)');
  assert.equal(E.fmtOperasiRasional('1/2', ':', '1/3'), '1/2 : 1/3');
});

test('jenisOperasiKaliBagi: jenis operasi untuk memilih strategi ahli', () => {
  assert.deepEqual(plain(E.jenisOperasiKaliBagi('3', '×', '2/5')), ['kaliBulat']);
  assert.deepEqual(plain(E.jenisOperasiKaliBagi('2/3', '×', '4')), ['kaliBulat']);
  assert.deepEqual(plain(E.jenisOperasiKaliBagi('2/3', '×', '3/4')), ['kaliPecahan']);
  assert.deepEqual(plain(E.jenisOperasiKaliBagi('3/4', ':', '3')), ['bagi']);
  assert.deepEqual(plain(E.jenisOperasiKaliBagi('2 1/4', '×', '2/3')), [
    'kaliPecahan',
    'campuranTanda',
  ]);
  assert.deepEqual(plain(E.jenisOperasiKaliBagi('-3/4', ':', '1 1/2')), ['bagi', 'campuranTanda']);
  assert.deepEqual(plain(E.jenisOperasiKaliBagi('-2', '×', '3/5')), ['kaliBulat', 'campuranTanda']);
});
