'use strict';

/*
 * Tes shared/engine.js seksi 29 (bilangan bulat dalam konteks
 * sehari-hari): terbilang hingga miliar, cara baca baku, parser notasi
 * isian murid, diagnosa miskonsepsi menulis (tanda di belakang, lupa
 * tanda, "min", nol bertanda), pemeriksa cara baca (termasuk "minus"
 * yang tidak baku), penentu tanda dari kata kunci konteks, skala
 * konteks, serta langkah isian berpemeriksa.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function count(str, sub) {
  return str.split(sub).length - 1;
}

/* ---------- terbilangBesar & bacaBulat ---------- */

test('terbilangBesar: sama dengan terbilang di bawah sejuta', () => {
  [0, 7, 11, 12, 19, 40, 105, 999, 1000, 1250, 25000, 999999].forEach((n) =>
    assert.equal(E.terbilangBesar(n), E.terbilang(n))
  );
});

test('terbilangBesar: juta dan miliar', () => {
  assert.equal(E.terbilangBesar(1000000), 'satu juta');
  assert.equal(E.terbilangBesar(2500000), 'dua juta lima ratus ribu');
  assert.equal(E.terbilangBesar(1001000), 'satu juta seribu');
  assert.equal(E.terbilangBesar(15000250), 'lima belas juta dua ratus lima puluh');
  assert.equal(E.terbilangBesar(3000000000), 'tiga miliar');
  assert.equal(E.terbilangBesar(-4000000), 'empat juta');
});

test('bacaBulat: negatif, nol, positif (opsional kata positif)', () => {
  assert.equal(E.bacaBulat(-15), 'negatif lima belas');
  assert.equal(E.bacaBulat(0), 'nol');
  assert.equal(E.bacaBulat(0, { positif: true }), 'nol');
  assert.equal(E.bacaBulat(8), 'delapan');
  assert.equal(E.bacaBulat(8, { positif: true }), 'positif delapan');
  assert.equal(E.bacaBulat(-2500000), 'negatif dua juta lima ratus ribu');
});

test('tulisBulat: notasi baku dengan minus tipografis & pemisah ribuan', () => {
  assert.equal(E.tulisBulat(-1250), '−1.250');
  assert.equal(E.tulisBulat(0), '0');
  assert.equal(E.tulisBulat(75), '75');
  assert.equal(E.tulisBulat(75, { plus: true }), '+75');
  assert.equal(E.tulisBulat(0, { plus: true }), '0');
});

/* ---------- parseBilanganBulat ---------- */

test('parseBilanganBulat: menerima -, −, –, +, spasi, dan titik ribuan yang benar', () => {
  const cases = [
    ['-5', -5],
    ['−5', -5],
    ['–5', -5],
    ['+5', 5],
    ['5', 5],
    [' - 12 ', -12],
    ['0', 0],
    ['1.250', 1250],
    ['-25.000', -25000],
    ['−1.000.000', -1000000],
    ['1250', 1250],
  ];
  cases.forEach(([str, v]) => {
    const p = E.parseBilanganBulat(str);
    assert.equal(p.ok, true, str);
    assert.equal(p.value, v, str);
    assert.equal(p.kode, null, str);
  });
});

test('parseBilanganBulat: mengenali bentuk tidak baku dengan kode', () => {
  const cases = [
    ['', 'kosong'],
    ['   ', 'kosong'],
    [null, 'kosong'],
    ['5-', 'tanda-belakang'],
    ['5 −', 'tanda-belakang'],
    ['min 5', 'kata-min'],
    ['minus 5', 'kata-min'],
    ['(5)', 'kurung'],
    ['2,5', 'bukan-bulat'],
    ['1.25', 'bukan-bulat'],
    ['abc', 'bukan-bulat'],
    ['--5', 'bukan-bulat'],
  ];
  cases.forEach(([str, kode]) => {
    const p = E.parseBilanganBulat(str);
    assert.equal(p.ok, false, String(str));
    assert.equal(p.kode, kode, String(str));
    assert.equal(p.value, null, String(str));
    assert.ok(p.pesan && p.pesan.length > 10, String(str) + ': pesan');
  });
});

test('parseBilanganBulat: -0 dan +0 bernilai 0 tetapi ditandai bertanda', () => {
  const p = E.parseBilanganBulat('-0');
  assert.equal(p.ok, true);
  assert.equal(p.value, 0);
  assert.equal(p.bertanda, true);
  assert.equal(E.parseBilanganBulat('0').bertanda, false);
});

/* ---------- diagnosaTulisBulat ---------- */

test('diagnosaTulisBulat: jawaban benar', () => {
  ['-4', '−4', ' -4 '].forEach((s) => {
    const d = E.diagnosaTulisBulat(s, -4);
    assert.equal(d.benar, true, s);
    assert.equal(d.kode, 'benar', s);
  });
  assert.equal(E.diagnosaTulisBulat('7', 7).benar, true);
  assert.equal(E.diagnosaTulisBulat('+7', 7).benar, true);
  assert.equal(E.diagnosaTulisBulat('0', 0).benar, true);
  assert.equal(E.diagnosaTulisBulat('-1.250', -1250).benar, true);
});

test('diagnosaTulisBulat: miskonsepsi yang umum', () => {
  const cases = [
    ['4', -4, 'lupa-tanda'],
    ['-7', 7, 'tanda-terbalik'],
    ['4-', -4, 'tanda-belakang'],
    ['min 4', -4, 'kata-min'],
    ['(4)', -4, 'kurung'],
    ['-0', 0, 'nol-bertanda'],
    ['+0', 0, 'nol-bertanda'],
    ['-5', -4, 'besar-salah'],
    ['12', -4, 'besar-salah'],
    ['', -4, 'kosong'],
    ['x', -4, 'bukan-bulat'],
  ];
  cases.forEach(([s, target, kode]) => {
    const d = E.diagnosaTulisBulat(s, target);
    assert.equal(d.benar, false, s + ' → ' + target);
    assert.equal(d.kode, kode, s + ' → ' + target);
    assert.ok(d.pesan.length > 10, s + ': pesan');
  });
});

/* ---------- cekCaraBaca ---------- */

test('normalisasiBacaan: huruf kecil, tanda baca & spasi berlebih dibuang', () => {
  assert.equal(E.normalisasiBacaan('  Negatif   LIMA, belas. '), 'negatif lima belas');
  assert.equal(E.normalisasiBacaan('"negatif-tiga"'), 'negatif tiga');
  assert.equal(E.normalisasiBacaan('se ratus'), 'seratus');
  assert.equal(E.normalisasiBacaan('se ribu dua ratus'), 'seribu dua ratus');
});

test('cekCaraBaca: bacaan baku diterima', () => {
  assert.equal(E.cekCaraBaca('negatif lima belas', -15).benar, true);
  assert.equal(E.cekCaraBaca('Negatif Lima Belas', -15).benar, true);
  assert.equal(E.cekCaraBaca('negatif seribu dua ratus lima puluh', -1250).benar, true);
  assert.equal(E.cekCaraBaca('delapan', 8).benar, true);
  assert.equal(E.cekCaraBaca('positif delapan', 8).benar, true);
  assert.equal(E.cekCaraBaca('nol', 0).benar, true);
  assert.equal(E.cekCaraBaca('negatif lima belas', -15).kode, 'benar');
});

test('cekCaraBaca: miskonsepsi membaca', () => {
  const cases = [
    ['minus lima belas', -15, 'minus'],
    ['min lima belas', -15, 'minus'],
    ['lima belas negatif', -15, 'urutan-terbalik'],
    ['lima belas', -15, 'lupa-negatif'],
    ['positif lima belas', -15, 'tanda-terbalik'],
    ['negatif delapan', 8, 'tanda-terbalik'],
    ['plus delapan', 8, 'plus'],
    ['negatif nol', 0, 'nol-bertanda'],
    ['positif nol', 0, 'nol-bertanda'],
    ['negatif satu lima', -15, 'angka-salah'],
    ['negatif lima puluh satu', -15, 'angka-salah'],
    ['', -15, 'kosong'],
  ];
  cases.forEach(([teks, n, kode]) => {
    const c = E.cekCaraBaca(teks, n);
    assert.equal(c.benar, false, teks);
    assert.equal(c.kode, kode, teks);
    assert.ok(c.pesan.length > 10, teks + ': pesan');
  });
});

/* ---------- tanda dari kata kunci konteks ---------- */

test('tandaKataKunci: kata kunci arah negatif', () => {
  [
    '3 derajat di bawah nol',
    '8 meter di bawah permukaan laut',
    'rugi Rp5.000',
    'punya utang Rp2.000',
    'menarik tabungan Rp10.000',
    'turun 4 lantai',
    'mundur 3 langkah',
    'kehilangan 10 poin',
    'lantai basement 2',
  ].forEach((f) => assert.equal(E.tandaKataKunci(f), 'neg', f));
});

test('tandaKataKunci: kata kunci arah positif', () => {
  [
    '6 derajat di atas nol',
    '2.000 meter di atas permukaan laut',
    'untung Rp5.000',
    'menyetor tabungan Rp10.000',
    'menyimpan uang Rp1.000',
    'naik 4 lantai',
    'maju 3 langkah',
    'mendapat 10 poin',
  ].forEach((f) => assert.equal(E.tandaKataKunci(f), 'pos', f));
});

test('tandaKataKunci: titik acuan bernilai nol, frasa tanpa kata kunci null', () => {
  [
    'tepat di permukaan laut',
    'berada di lantai dasar',
    'suhu tepat nol derajat',
    'impas, tidak untung dan tidak rugi',
  ].forEach((f) => assert.equal(E.tandaKataKunci(f), 'nol', f));
  assert.equal(E.tandaKataKunci('sebuah apel merah'), null);
});

test('nilaiKonteks: besar diberi tanda sesuai kata kunci', () => {
  assert.equal(E.nilaiKonteks(3, '3 derajat di bawah nol'), -3);
  assert.equal(E.nilaiKonteks(2000, 'di atas permukaan laut'), 2000);
  assert.equal(E.nilaiKonteks(0, 'lantai dasar'), 0);
  assert.equal(E.nilaiKonteks(5, 'tepat di permukaan laut'), 0);
  assert.equal(E.nilaiKonteks(5, 'sebuah apel'), null);
});

test('KONTEKS_BULAT: setiap tema punya acuan, satuan, ikon, dan kata kunci', () => {
  const K = E.KONTEKS_BULAT;
  ['suhu', 'gedung', 'laut', 'uang', 'skor'].forEach((t) => {
    assert.ok(K[t], t);
    assert.ok(K[t].acuan && K[t].ikon && K[t].nama, t + ': acuan/ikon/nama');
    assert.ok(K[t].positif && K[t].negatif, t + ': kata arah');
    assert.equal(E.tandaKataKunci(K[t].negatif), 'neg', t + ': frasa negatif terbaca');
    assert.equal(E.tandaKataKunci(K[t].positif), 'pos', t + ': frasa positif terbaca');
  });
});

/* ---------- buildSkalaKonteks ---------- */

test('buildSkalaKonteks: baris sesuai rentang & langkah, titik pada nilai', () => {
  const html = E.buildSkalaKonteks({ tema: 'suhu', nilai: -4, min: -6, max: 6 });
  assert.equal(count(html, 'class="bbk-skala__row '), 13);
  assert.equal(count(html, 'is-titik'), 1);
  assert.ok(html.includes('bbk-skala--suhu'));
  assert.ok(html.includes('role="img"'));
  assert.ok(html.includes('4 langkah di bawah'), 'aria menyebut jarak');
  assert.ok(!html.includes('−4'), 'nilai belum ditampilkan sebelum dijawab');
});

test('buildSkalaKonteks: langkah besar, label acuan, dan tampilkan nilai', () => {
  const html = E.buildSkalaKonteks({
    tema: 'laut',
    nilai: -150,
    min: -250,
    max: 100,
    langkah: 50,
    tampilNilai: true,
    satuan: 'm',
  });
  assert.equal(count(html, 'class="bbk-skala__row '), 8);
  assert.ok(html.includes('−150 m'));
  assert.ok(html.includes(E.KONTEKS_BULAT.laut.acuan));
  assert.ok(html.includes('1 langkah = 50'));
});

test('buildSkalaKonteks: nilai nol & label setiap kelipatan', () => {
  const html = E.buildSkalaKonteks({ tema: 'gedung', nilai: 0, min: -3, max: 3, labelSetiap: 1 });
  assert.ok(html.includes('tepat di'));
  assert.ok(html.includes('>−3<') && html.includes('>3<'));
});

/* ---------- langkah isian berpemeriksa ---------- */

test('makeCekStep & periksaCekStep: menyimpan hasil pemeriksa', () => {
  const st = plain(E.makeCekStep());
  assert.deepEqual(st, {
    input: '',
    done: false,
    kode: null,
    pesan: '',
    attempts: 0,
    hintLevel: 0,
  });
  const step = { jenis: 'tulis', jawab: -4 };
  E.periksaCekStep(st, step, '4');
  assert.equal(st.done, false);
  assert.equal(st.kode, 'lupa-tanda');
  assert.equal(st.attempts, 1);
  E.periksaCekStep(st, step, '−4');
  assert.equal(st.done, true);
  assert.equal(st.attempts, 2);

  const baca = plain(E.makeCekStep());
  E.periksaCekStep(baca, { jenis: 'baca', jawab: -12 }, 'minus dua belas');
  assert.equal(baca.done, false);
  assert.equal(baca.kode, 'minus');
  E.periksaCekStep(baca, { jenis: 'baca', jawab: -12 }, 'negatif dua belas');
  assert.equal(baca.done, true);
});

test('buildCekStep: isian, tombol, pesan diagnosa, dan status selesai', () => {
  const step = { jenis: 'tulis', jawab: -4, label: 'Tulis suhunya', hints: ['Di bawah nol.'] };
  const st = plain(E.makeCekStep());
  let html = E.buildCekStep('c0', st, step, 1);
  assert.ok(html.includes('id="c0Input"') && html.includes('id="c0Check"'));
  assert.ok(html.includes('id="c0Hint"'));
  E.periksaCekStep(st, step, '4-');
  html = E.buildCekStep('c0', st, step, 1);
  assert.ok(html.includes(st.pesan));
  assert.ok(html.includes('has-error'));
  E.periksaCekStep(st, step, '-4');
  html = E.buildCekStep('c0', st, step, 1);
  assert.ok(html.includes('dl-step--done'));
  assert.ok(!html.includes('id="c0Input"'));
});

/* ---------- opsiCaraBaca ---------- */

test('opsiCaraBaca: satu bacaan baku + tiga pengecoh unik untuk −, 0, +', () => {
  [-1250, -7, 0, 12].forEach((n) => {
    const opsi = plain(E.opsiCaraBaca(n));
    assert.equal(opsi.length, 4, String(n));
    assert.equal(new Set(opsi.map((o) => o.id)).size, 4, n + ': id unik');
    assert.equal(new Set(opsi.map((o) => o.label)).size, 4, n + ': label unik');
    const benar = opsi.filter((o) => o.benar);
    assert.equal(benar.length, 1, n + ': tepat satu benar');
    assert.equal(benar[0].label, E.bacaBulat(n));
    opsi.forEach((o) => {
      assert.ok(o.umpan.length > 10, n + '.' + o.id + ': umpan');
      assert.equal(E.cekCaraBaca(o.label, n).benar, o.benar, n + ': ' + o.label);
    });
  });
  assert.ok(E.opsiCaraBaca(-7).some((o) => o.label === 'minus tujuh'));
});
