'use strict';

/*
 * Tes engine.js seksi 64 — operasi hitung bilangan desimal & konversi
 * pecahan ↔ desimal (dipakai fase-d/mpi-2.5). Semua hitungan harus
 * EKSAK (tanpa galat float), misalnya 0,1 + 0,2 = 0,3.
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function labels(list) {
  return Array.from(list, (o) => o.label);
}

test('opDesimal: menormalkan lambang operasi', () => {
  assert.equal(E.opDesimal('+'), '+');
  ['-', '−', '–'].forEach((o) => assert.equal(E.opDesimal(o), '−'));
  ['×', 'x', '*'].forEach((o) => assert.equal(E.opDesimal(o), '×'));
  [':', '÷', '/'].forEach((o) => assert.equal(E.opDesimal(o), ':'));
  assert.equal(E.opDesimal('?'), null);
});

test('hasilOperasiDesimal: hasil eksak berkoma tanpa galat float', () => {
  const h = E.hasilOperasiDesimal;
  assert.equal(h('0,1', '+', '0,2'), '0,3');
  assert.equal(h('1,25', '+', '0,8'), '2,05');
  assert.equal(h('2', '−', '0,75'), '1,25');
  assert.equal(h('5', '−', '1,35'), '3,65');
  assert.equal(h('0,3', '×', '0,4'), '0,12');
  assert.equal(h('1,5', '×', '4'), '6');
  assert.equal(h('2,5', '×', '1,2'), '3');
  assert.equal(h('1,5', ':', '0,3'), '5');
  assert.equal(h('0,15', ':', '0,03'), '5');
  assert.equal(h('7,2', ':', '4'), '1,8');
  assert.equal(h('1', ':', '8'), '0,125');
  assert.equal(h('0,5', '−', '0,8'), '−0,3');
  /* titik desimal & minus biasa juga diterima sebagai masukan */
  assert.equal(h('0.1', '+', '0.2'), '0,3');
  /* pembagian tak berhenti → bentuk berulang */
  assert.equal(h('1', ':', '3'), '0,333…');
  assert.throws(() => h('1', ':', '0'));
});

test('fmtOperasiDesimal: kalimat matematika baku', () => {
  assert.equal(E.fmtOperasiDesimal('1,25', '+', '0,8'), '1,25 + 0,8');
  assert.equal(E.fmtOperasiDesimal('2', '-', '0,75'), '2 − 0,75');
  assert.equal(E.fmtOperasiDesimal('0,3', '*', '0,4'), '0,3 × 0,4');
  assert.equal(E.fmtOperasiDesimal('1,5', ':', '-0,3'), '1,5 : (−0,3)');
});

test('langkahTambahKurangDesimal: menyamakan banyak angka di belakang koma', () => {
  const l = E.langkahTambahKurangDesimal('1,25', '+', '0,8');
  assert.equal(l.a, '1,25');
  assert.equal(l.b, '0,80');
  assert.equal(l.angka, 2);
  assert.equal(l.hasil, '2,05');
  const k = E.langkahTambahKurangDesimal('2', '−', '0,75');
  assert.equal(k.a, '2,00');
  assert.equal(k.b, '0,75');
  assert.equal(k.hasil, '1,25');
});

test('langkahKaliDesimal: kalikan tanpa koma, letak koma = jumlah angka desimal', () => {
  const l = E.langkahKaliDesimal('0,3', '0,4');
  assert.equal(l.bulatA, 3);
  assert.equal(l.bulatB, 4);
  assert.equal(l.hasilBulat, 12);
  assert.equal(l.angkaA, 1);
  assert.equal(l.angkaB, 1);
  assert.equal(l.angka, 2);
  assert.equal(l.hasil, '0,12');
  const m = E.langkahKaliDesimal('1,25', '0,4');
  assert.equal(m.hasilBulat, 500);
  assert.equal(m.angka, 3);
  assert.equal(m.hasil, '0,5');
});

test('langkahBagiDesimal: geser koma pembagi & yang dibagi bersama', () => {
  const l = E.langkahBagiDesimal('1,5', '0,3');
  assert.equal(l.faktor, 10);
  assert.equal(l.a, '15');
  assert.equal(l.b, '3');
  assert.equal(l.hasil, '5');
  const m = E.langkahBagiDesimal('0,15', '0,03');
  assert.equal(m.faktor, 100);
  assert.equal(m.a, '15');
  assert.equal(m.b, '3');
  const n = E.langkahBagiDesimal('7,2', '4');
  assert.equal(n.faktor, 1);
  assert.equal(n.hasil, '1,8');
});

test('diagnosaOperasiDesimal: jawaban benar diterima dalam berbagai tulisan', () => {
  const d = (x, a, op, b) => E.diagnosaOperasiDesimal(x, a, op, b);
  assert.equal(d('2,05', '1,25', '+', '0,8').kode, 'benar');
  assert.equal(d(' 2,050 ', '1,25', '+', '0,8').kode, 'benar');
  assert.equal(d('0,12', '0,3', '×', '0,4').kode, 'benar');
  assert.equal(d('5', '1,5', ':', '0,3').kode, 'benar');
  assert.equal(d('5,0', '1,5', ':', '0,3').kode, 'benar');
  assert.equal(d('−0,3', '0,5', '−', '0,8').kode, 'benar');
  assert.equal(d('-0,3', '0,5', '−', '0,8').benar, true);
});

test('diagnosaOperasiDesimal: mendiagnosis miskonsepsi', () => {
  const k = (x, a, op, b) => E.diagnosaOperasiDesimal(x, a, op, b).kode;
  assert.equal(k('', '1,25', '+', '0,8'), 'kosong');
  assert.equal(k('abc', '1,25', '+', '0,8'), 'format');
  assert.equal(k('2.05', '1,25', '+', '0,8'), 'titik');
  /* rata kanan: 1,25 + 0,8 → 125 + 8 = 133 → 1,33 */
  assert.equal(k('1,33', '1,25', '+', '0,8'), 'rata-kanan');
  /* 0,3 × 0,4 = 1,2 (koma hanya satu tempat) */
  assert.equal(k('1,2', '0,3', '×', '0,4'), 'koma-geser');
  /* 1,5 : 0,3 = 0,5 (koma pembagi tidak digeser bersama) */
  assert.equal(k('0,5', '1,5', ':', '0,3'), 'koma-geser');
  /* operasi tertukar: 1,25 − 0,8 = 0,45 */
  assert.equal(k('0,45', '1,25', '+', '0,8'), 'operasi-terbalik');
  /* nilai benar tetapi ditulis sebagai pecahan */
  assert.equal(k('41/20', '1,25', '+', '0,8'), 'bentuk');
  assert.equal(k('3', '1,25', '+', '0,8'), 'salah');
  ['format', 'titik', 'rata-kanan', 'koma-geser', 'operasi-terbalik', 'bentuk', 'salah'].forEach(
    (c) => assert.ok(E.PESAN_OPERASI_DESIMAL[c].length > 20, c)
  );
  assert.match(E.diagnosaOperasiDesimal('1,2', '0,3', '×', '0,4').pesan, /belakang koma/);
});

test('opsiOperasiDesimal: satu benar + tiga pengecoh unik', () => {
  [
    ['1,25', '+', '0,8'],
    ['2', '−', '0,75'],
    ['0,3', '×', '0,4'],
    ['1,5', ':', '0,3'],
    ['2,5', '×', '4'],
    ['7,2', ':', '4'],
    ['12,5', '−', '4,75'],
  ].forEach(([a, op, b]) => {
    const name = a + op + b;
    const opsi = E.opsiOperasiDesimal(a, op, b);
    assert.equal(opsi.length, 4, name);
    assert.equal(new Set(opsi.map((o) => o.id)).size, 4, name + ': id unik');
    assert.equal(new Set(labels(opsi)).size, 4, name + ': label unik');
    const benar = opsi.filter((o) => o.benar);
    assert.equal(benar.length, 1, name);
    assert.equal(benar[0].id, 'baku');
    assert.equal(benar[0].label, E.hasilOperasiDesimal(a, op, b), name);
    opsi.forEach((o) => assert.ok(o.umpan, name + '.' + o.id + ': umpan'));
    opsi
      .filter((o) => !o.benar)
      .forEach((o) =>
        assert.notEqual(E.diagnosaOperasiDesimal(o.label, a, op, b).kode, 'benar', name)
      );
  });
});

test('pecahanKeDesimal: berhenti & berulang', () => {
  const a = E.pecahanKeDesimal('3/4');
  assert.equal(a.teks, '0,75');
  assert.equal(a.berulang, false);
  assert.equal(a.persepuluhan, '75/100');
  const b = E.pecahanKeDesimal('1/3');
  assert.equal(b.berulang, true);
  assert.equal(b.periode, '3');
  assert.equal(b.teks, '0,333…');
  assert.equal(b.persepuluhan, null);
  const c = E.pecahanKeDesimal('2/11');
  assert.equal(c.periode, '18');
  assert.equal(c.teks, '0,1818…');
  const d = E.pecahanKeDesimal('1/6');
  assert.equal(d.depan, '1');
  assert.equal(d.periode, '6');
  assert.equal(d.teks, '0,1666…');
  assert.equal(E.pecahanKeDesimal('1 1/2').teks, '1,5');
  assert.equal(E.pecahanKeDesimal('3/8').teks, '0,375');
  assert.equal(E.pecahanKeDesimal('2/5').persepuluhan, '4/10');
  assert.equal(E.pecahanKeDesimal('-1/4').teks, '−0,25');
});

test('desimalKePecahan: penyebut 10ⁿ lalu disederhanakan', () => {
  const a = E.desimalKePecahan('0,75');
  assert.equal(a.awal, '75/100');
  assert.equal(a.fpb, 25);
  assert.equal(a.sederhana, '3/4');
  const b = E.desimalKePecahan('0,4');
  assert.equal(b.awal, '4/10');
  assert.equal(b.sederhana, '2/5');
  const c = E.desimalKePecahan('1,25');
  assert.equal(c.awal, '125/100');
  assert.equal(c.sederhana, '1 1/4');
  const d = E.desimalKePecahan('0,125');
  assert.equal(d.awal, '125/1000');
  assert.equal(d.sederhana, '1/8');
  assert.equal(E.desimalKePecahan('0,7').sederhana, '7/10');
});

test('diagnosaKonversiPD: pecahan → desimal', () => {
  const k = (x, s) => E.diagnosaKonversiPD(x, s, 'keDesimal').kode;
  assert.equal(k('0,75', '3/4'), 'benar');
  assert.equal(k('0,750', '3/4'), 'benar');
  assert.equal(k('', '3/4'), 'kosong');
  assert.equal(k('3,4', '3/4'), 'pembilang-koma');
  assert.equal(k('0,34', '3/4'), 'pembilang-koma');
  assert.equal(k('7,5', '3/4'), 'koma-geser');
  assert.equal(k('3/4', '3/4'), 'bentuk');
  assert.equal(k('0,8', '3/4'), 'salah');
  /* desimal berulang: pembulatan atau tanda … diterima */
  assert.equal(k('0,333…', '1/3'), 'benar');
  assert.equal(k('0,333...', '1/3'), 'benar');
  assert.equal(k('0,33', '1/3'), 'benar');
  assert.equal(k('0,3', '1/3'), 'kurang-teliti');
  ['pembilang-koma', 'koma-geser', 'bentuk', 'salah', 'kurang-teliti'].forEach((c) =>
    assert.ok(E.PESAN_KONVERSI_PD[c].length > 20, c)
  );
});

test('diagnosaKonversiPD: desimal → pecahan paling sederhana', () => {
  const k = (x, s) => E.diagnosaKonversiPD(x, s, 'kePecahan').kode;
  assert.equal(k('3/4', '0,75'), 'benar');
  assert.equal(k('1 1/4', '1,25'), 'benar');
  assert.equal(k('5/4', '1,25'), 'benar');
  assert.equal(k('75/100', '0,75'), 'belum-sederhana');
  assert.equal(k('75/10', '0,75'), 'penyebut-salah');
  assert.equal(k('0,75', '0,75'), 'bentuk');
  assert.equal(k('2/3', '0,75'), 'salah');
  assert.ok(E.PESAN_KONVERSI_PD['belum-sederhana'].length > 20);
  assert.ok(E.PESAN_KONVERSI_PD['penyebut-salah'].length > 20);
});

test('opsiKonversiPD: satu benar + tiga pengecoh unik', () => {
  [
    ['3/4', 'keDesimal'],
    ['2/5', 'keDesimal'],
    ['1/8', 'keDesimal'],
    ['1 1/2', 'keDesimal'],
    ['1/3', 'keDesimal'],
    ['0,75', 'kePecahan'],
    ['0,4', 'kePecahan'],
    ['1,25', 'kePecahan'],
    ['0,125', 'kePecahan'],
  ].forEach(([s, arah]) => {
    const opsi = E.opsiKonversiPD(s, arah);
    assert.equal(opsi.length, 4, s);
    assert.equal(new Set(opsi.map((o) => o.id)).size, 4, s + ': id unik');
    assert.equal(new Set(labels(opsi)).size, 4, s + ': label unik');
    const benar = opsi.filter((o) => o.benar);
    assert.equal(benar.length, 1, s);
    assert.equal(benar[0].id, 'baku');
    assert.equal(E.diagnosaKonversiPD(benar[0].label, s, arah).kode, 'benar', s);
    opsi
      .filter((o) => !o.benar)
      .forEach((o) =>
        assert.notEqual(E.diagnosaKonversiPD(o.label, s, arah).kode, 'benar', s + ' ' + o.label)
      );
  });
});

test('periksaOpDesimalStep: memakai diagnosa sesuai jenis langkah', () => {
  const st = E.makeDesimalStep();
  const hitung = { jenis: 'hitung', a: '0,3', op: '×', b: '0,4' };
  assert.equal(E.periksaOpDesimalStep(st, hitung, '').kode, 'kosong');
  assert.equal(st.attempts, 0);
  assert.equal(E.periksaOpDesimalStep(st, hitung, '1,2').kode, 'koma-geser');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  E.periksaOpDesimalStep(st, hitung, '0,12');
  assert.equal(st.done, true);

  const st2 = E.makeDesimalStep();
  E.periksaOpDesimalStep(st2, { jenis: 'keDesimal', soal: '3/4' }, '0,75');
  assert.equal(st2.done, true);
  const st3 = E.makeDesimalStep();
  E.periksaOpDesimalStep(st3, { jenis: 'kePecahan', soal: '0,4' }, '4/10');
  assert.equal(st3.kode, 'belum-sederhana');
  const st4 = E.makeDesimalStep();
  E.periksaOpDesimalStep(st4, { jenis: 'nilai', jawab: '15' }, '15');
  assert.equal(st4.done, true);
  const st5 = E.makeDesimalStep();
  E.periksaOpDesimalStep(st5, { jenis: 'nilai', jawab: '0,12' }, '12');
  assert.equal(st5.done, false);
  assert.equal(st5.kode, 'salah');
});

test('buildPetakSeratus & buildPetakLuas: banyak petak terarsir tepat', () => {
  const html = E.buildPetakSeratus(75);
  assert.equal((html.match(/petak100__sel/g) || []).length, 100);
  assert.equal((html.match(/petak100__sel is-on/g) || []).length, 75);
  assert.match(html, /role="img"/);
  const luas = E.buildPetakLuas('0,3', '0,4');
  assert.equal((luas.match(/is-both/g) || []).length, 12);
  assert.match(luas, /0,12/);
});

test('buildBersusunDesimal: koma sejajar & opsi rata kanan', () => {
  const html = E.buildBersusunDesimal('1,25', '+', '0,8', { hasil: true });
  assert.match(html, /bersusun-dec/);
  assert.match(html, /aria-label="[^"]*2,05/);
  /* Rata koma: 0,8 ditulis dengan nol pengisi 0,80 */
  assert.match(html, /bersusun-dec__nol/);
  const kanan = E.buildBersusunDesimal('1,25', '+', '0,8', { rataKanan: true });
  assert.match(kanan, /bersusun-dec--rata-kanan/);
  /* Tanpa opts.tandai tampilan netral: tidak membocorkan benar/keliru. */
  assert.doesNotMatch(kanan, /bersusun-dec--salah|bersusun-dec--benar|keliru/);
  assert.doesNotMatch(html, /bersusun-dec--benar/);
  const salah = E.buildBersusunDesimal('1,25', '+', '0,8', { rataKanan: true, tandai: true });
  assert.match(salah, /bersusun-dec--salah/);
  const benar = E.buildBersusunDesimal('1,25', '+', '0,8', { tandai: true });
  assert.match(benar, /bersusun-dec--benar/);
});

test('buildGelasTakar: banyak gelas = total : takaran', () => {
  const html = E.buildGelasTakar('1,5', '0,3');
  assert.equal((html.match(/gelas-takar__isi/g) || []).length, 5);
  assert.match(html, /1,5/);
  assert.match(html, /0,3/);
});

test('buildGelasTakar: alat bertahap menandai gelas yang sudah dituang', () => {
  const html = E.buildGelasTakar('1,5', '0,3', { tuang: 2 });
  assert.equal((html.match(/is-dituang/g) || []).length, 2);
  assert.match(html, /sisa di botol 0,9 L/);
  const lewat = E.buildGelasTakar('1,5', '0,3', { tuang: 9 });
  assert.equal((lewat.match(/is-dituang/g) || []).length, 5);
});
