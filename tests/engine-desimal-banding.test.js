'use strict';

/*
 * Tes engine.js bagian 20 — membandingkan & mengurutkan bilangan desimal.
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

test('bandingkanDesimal: membandingkan berbasis nilai tempat, bukan panjang angka', () => {
  assert.equal(E.bandingkanDesimal('0,8', '0,75'), 1);
  assert.equal(E.bandingkanDesimal('0,75', '0,8'), -1);
  assert.equal(E.bandingkanDesimal('3,7', '3,68'), 1);
  assert.equal(E.bandingkanDesimal('2,09', '2,1'), -1);
  assert.equal(E.bandingkanDesimal('12,45', '12,5'), -1);
  assert.equal(E.bandingkanDesimal('0,4', '0,45'), -1);
  assert.equal(E.bandingkanDesimal('10,1', '9,99'), 1);
  assert.equal(E.bandingkanDesimal('1', '0,999'), 1);
});

test('bandingkanDesimal: angka 0 di akhir tidak mengubah nilai', () => {
  assert.equal(E.bandingkanDesimal('0,5', '0,50'), 0);
  assert.equal(E.bandingkanDesimal('0,500', '0,5'), 0);
  assert.equal(E.bandingkanDesimal('3', '3,0'), 0);
  assert.equal(E.bandingkanDesimal('07,2', '7,20'), 0);
});

test('bandingkanDesimal: menerima titik, menolak masukan tidak valid', () => {
  assert.equal(E.bandingkanDesimal('0.8', '0,75'), 1);
  assert.equal(E.bandingkanDesimal('abc', '0,75'), null);
  assert.equal(E.bandingkanDesimal('', '1'), null);
});

test('simbolBandingDesimal: id lambang cocok dengan COMPARE_SYMBOLS', () => {
  assert.equal(E.simbolBandingDesimal('0,8', '0,75'), 'gt');
  assert.equal(E.simbolBandingDesimal('2,09', '2,1'), 'lt');
  assert.equal(E.simbolBandingDesimal('0,5', '0,50'), 'eq');
  const ids = E.COMPARE_SYMBOLS.map((s) => s.id);
  ['gt', 'lt', 'eq'].forEach((id) => assert.ok(ids.includes(id)));
});

test('banyakAngkaDesimal & samakanDigitDesimal', () => {
  assert.equal(E.banyakAngkaDesimal('3,07'), 2);
  assert.equal(E.banyakAngkaDesimal('12'), 0);
  assert.equal(E.samakanDigitDesimal('0,8', 2), '0,80');
  assert.equal(E.samakanDigitDesimal('3', 2), '3,00');
  assert.equal(E.samakanDigitDesimal('0,75', 2), '0,75');
  /* tidak pernah memotong angka */
  assert.equal(E.samakanDigitDesimal('0,375', 2), '0,375');
});

test('tempatBedaPertama: posisi nilai tempat pertama (dari kiri) yang berbeda', () => {
  assert.equal(E.tempatBedaPertama('0,8', '0,75'), 1);
  assert.equal(E.tempatBedaPertama('3,7', '3,68'), 1);
  assert.equal(E.tempatBedaPertama('2,09', '2,1'), 1);
  assert.equal(E.tempatBedaPertama('4,52', '4,58'), 2);
  assert.equal(E.tempatBedaPertama('0,125', '0,12'), 3);
  assert.equal(E.tempatBedaPertama('3,1', '2,99'), 0);
  assert.equal(E.tempatBedaPertama('12,5', '9,9'), -1);
  assert.equal(E.tempatBedaPertama('0,5', '0,50'), null);
});

test('alasanBandingDesimal: menyebut nilai tempat, angka, dan kesimpulan', () => {
  const a = E.alasanBandingDesimal('0,8', '0,75');
  assert.match(a, /persepuluhan/);
  assert.match(a, /8 > 7/);
  assert.match(a, /0,8 > 0,75/);

  const b = E.alasanBandingDesimal('4,52', '4,58');
  assert.match(b, /perseratusan/);
  assert.match(b, /2 < 8/);
  assert.match(b, /4,52 < 4,58/);

  const c = E.alasanBandingDesimal('0,5', '0,50');
  assert.match(c, /0,50/);
  assert.match(c, /0,5 = 0,50/);

  const d = E.alasanBandingDesimal('3,1', '2,99');
  assert.match(d, /satuan/);
  assert.match(d, /3 > 2/);
});

test('urutkanDesimal: naik & turun, tanpa mengubah array asal', () => {
  const asal = ['12,5', '12,45', '12,08', '12,405'];
  assert.deepEqual(E.urutkanDesimal(asal), ['12,08', '12,405', '12,45', '12,5']);
  assert.deepEqual(E.urutkanDesimal(asal, true), ['12,5', '12,45', '12,405', '12,08']);
  assert.deepEqual(asal, ['12,5', '12,45', '12,08', '12,405']);
});

test('diagnosaBandingDesimal: mengenali miskonsepsi umum', () => {
  /* benar → null */
  assert.equal(E.diagnosaBandingDesimal('0,8', '0,75', 'gt'), null);
  /* "lebih banyak angka = lebih besar" (bagian desimal dibaca bilangan bulat) */
  assert.equal(E.diagnosaBandingDesimal('0,8', '0,75', 'lt'), 'bagian-desimal-bulat');
  assert.equal(E.diagnosaBandingDesimal('3,7', '3,68', 'lt'), 'bagian-desimal-bulat');
  /* "lebih sedikit angka = lebih besar" */
  assert.equal(E.diagnosaBandingDesimal('0,4', '0,45', 'gt'), 'lebih-pendek');
  /* angka 0 di akhir dianggap mengubah nilai */
  assert.equal(E.diagnosaBandingDesimal('0,5', '0,50', 'lt'), 'nol-akhir');
  /* bagian bulat diabaikan */
  assert.equal(E.diagnosaBandingDesimal('3,1', '2,99', 'lt'), 'abaikan-bulat');
  /* salah lainnya */
  assert.equal(E.diagnosaBandingDesimal('4,52', '4,58', 'eq'), 'lain');
});

test('pesanDiagnosaDesimal: pesan untuk setiap kode diagnosa', () => {
  ['bagian-desimal-bulat', 'lebih-pendek', 'nol-akhir', 'abaikan-bulat', 'lain'].forEach((k) => {
    const p = E.pesanDiagnosaDesimal(k, '0,8', '0,75');
    assert.equal(typeof p, 'string');
    assert.ok(p.length > 20, k);
  });
});

test('skalaDesimal & desimalDariSkala: konversi untuk titik garis bilangan', () => {
  assert.equal(E.skalaDesimal('0,75', 2), 75);
  assert.equal(E.skalaDesimal('3,4', 1), 34);
  assert.equal(E.skalaDesimal('3,40', 1), 34);
  assert.equal(E.skalaDesimal('3', 2), 300);
  assert.equal(E.skalaDesimal('0,75', 1), null);
  assert.equal(E.desimalDariSkala(34, 1), '3,4');
  assert.equal(E.desimalDariSkala(30, 1), '3');
  assert.equal(E.desimalDariSkala(70, 2), '0,7');
  assert.equal(E.desimalDariSkala(70, 2, true), '0,70');
  assert.equal(E.desimalDariSkala(5, 2), '0,05');
});

test('petunjukLetakDesimal: titik awal & banyak langkah kecil', () => {
  const p = E.petunjukLetakDesimal('0,75', 2);
  assert.match(p, /0,7/);
  assert.match(p, /5/);
  const q = E.petunjukLetakDesimal('3,4', 1);
  assert.match(q, /3/);
  assert.match(q, /4/);
});

test('buildPlaceValueCompare: dua baris sejajar & kolom beda pertama disorot', () => {
  const html = E.buildPlaceValueCompare('0,8', '0,75', { highlight: true });
  assert.match(html, /dec-cmp/);
  assert.equal((html.match(/<tr class="dec-cmp__row/g) || []).length, 2);
  /* judul kolom boleh terpotong di layar sempit: per&shy;sepuluhan */
  assert.match(html, /per&shy;sepuluhan/);
  /* kolom persepuluhan kedua baris disorot */
  assert.equal((html.match(/dec-pv__cell--hl/g) || []).length, 3);
  /* tanpa padZeros, tempat perseratusan 0,8 kosong */
  assert.match(html, /dec-pv__cell--empty/);
  const pad = E.buildPlaceValueCompare('0,8', '0,75', { padZeros: true });
  assert.match(pad, /dec-cmp__pad/);
  assert.match(pad, /aria-label="[^"]*0,8[^"]*0,75/);
});

test('buildCompareSentenceDesimal: menjaga penulisan asli (0,50 tidak menjadi 0,5)', () => {
  const html = E.buildCompareSentenceDesimal('0,5', '0,50', 'eq');
  assert.match(html, />0,50</);
  assert.match(html, /=/);
  const kosong = E.buildCompareSentenceDesimal('0,8', '0,75', null);
  assert.match(kosong, /\?/);
});

test('buildDecimalNumberLine: titik setiap langkah dengan label berkoma', () => {
  const html = E.buildDecimalNumberLine('nl', { min: '0,7', max: '0,8', digits: 2 });
  assert.equal((html.match(/data-nl-value=/g) || []).length, 11);
  assert.match(html, /data-nl-value="0,75"/);
  assert.match(html, />0,7</);
  assert.match(html, />0,8</);
  const fixed = E.buildDecimalNumberLine('nl', {
    min: '0,7',
    max: '0,8',
    digits: 2,
    fixedLabels: true,
    marks: [{ value: '0,75', label: 'A' }],
  });
  assert.match(fixed, />0,70</);
  assert.match(fixed, /nlp-mark/);
  const statis = E.buildDecimalNumberLine('nl', {
    min: '0',
    max: '1',
    digits: 1,
    interactive: false,
  });
  assert.doesNotMatch(statis, /data-nl-value=/);
  assert.match(statis, /role="img"/);
});

test('buildDecimalPlacement: menampilkan target lalu garis selesai', () => {
  const items = [{ value: '0,75' }, { value: '0,8' }];
  const st = { idx: 0, salah: null, wrong: {} };
  const html = E.buildDecimalPlacement('pl', items, st, { min: '0,7', max: '0,8', digits: 2 });
  assert.match(html, /Bilangan 1 dari 2/);
  assert.match(html, /0,75/);
  const salah = E.buildDecimalPlacement(
    'pl',
    items,
    { idx: 0, salah: '0,78', wrong: { 0: 2 } },
    { min: '0,7', max: '0,8', digits: 2 }
  );
  assert.match(salah, /0,78/);
  assert.match(salah, /feedback-box/);
  const done = E.buildDecimalPlacement(
    'pl',
    items,
    { idx: 2, salah: null, wrong: {} },
    { min: '0,7', max: '0,8', digits: 2, doneText: 'SELESAI' }
  );
  assert.match(done, /SELESAI/);
  assert.doesNotMatch(done, /data-nl-value=/);
});

test('tempatBedaPertamaDaftar: tempat pertama yang angkanya tidak semua sama', () => {
  assert.equal(E.tempatBedaPertamaDaftar(['12,5', '12,45', '12,08', '12,405']), 1);
  assert.equal(E.tempatBedaPertamaDaftar(['2,3', '2,33', '2,303']), 2);
  assert.equal(E.tempatBedaPertamaDaftar(['0,5', '0,50', '0,500']), null);
});

test('buildPlaceValueStack: satu baris per bilangan dalam tabel yang sama', () => {
  const html = E.buildPlaceValueStack(['12,5', '12,45', '12,08', '12,405'], { highlight: true });
  assert.equal((html.match(/<tr class="dec-cmp__row/g) || []).length, 4);
  assert.match(html, /puluhan/);
  assert.match(html, /per&shy;seribuan/);
  /* judul + 4 sel pada kolom persepuluhan */
  assert.equal((html.match(/dec-pv__cell--hl/g) || []).length, 5);
});
