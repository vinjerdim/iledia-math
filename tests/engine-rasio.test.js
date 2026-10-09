'use strict';

/*
 * Tes engine.js bagian 67 — rasio & rasio ekuivalen (dipakai
 * fase-d/mpi-3.1, Inquiry Learning).
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

/* Salin objek dari realm vm agar deepEqual membandingkan isi saja. */
function plain(o) {
  return JSON.parse(JSON.stringify(o));
}

test('fmtRasio: "a : b" dengan pemisah ribuan titik', () => {
  assert.equal(E.fmtRasio(2, 3), '2 : 3');
  assert.equal(E.fmtRasio(3, 15000), '3 : 15.000');
});

test('sederhanakanRasio & rasioSederhana memakai FPB', () => {
  assert.deepEqual(plain(E.sederhanakanRasio(12, 18)), { a: 2, b: 3, fpb: 6 });
  assert.deepEqual(plain(E.sederhanakanRasio(5, 7)), { a: 5, b: 7, fpb: 1 });
  assert.deepEqual(plain(E.sederhanakanRasio(15000, 3)), { a: 5000, b: 1, fpb: 3 });
  assert.equal(E.rasioSederhana(2, 3), true);
  assert.equal(E.rasioSederhana(4, 6), false);
});

test('rasioSetara: perkalian silang a × d = b × c', () => {
  assert.equal(E.rasioSetara(2, 3, 4, 6), true);
  assert.equal(E.rasioSetara(8, 12, 10, 15), true);
  assert.equal(E.rasioSetara(2, 3, 3, 4), false);
  assert.equal(E.rasioSetara(2, 3, 3, 2), false);
  assert.equal(E.rasioSetara(2, 0, 4, 0), false, 'suku nol tidak dibandingkan');
});

test('bandingRasaRasio: sama, lebih pekat, atau lebih encer', () => {
  assert.equal(E.bandingRasaRasio(2, 3, 4, 6), 'sama');
  assert.equal(E.bandingRasaRasio(2, 3, 3, 4), 'lebihPekat');
  assert.equal(E.bandingRasaRasio(2, 3, 2, 4), 'lebihEncer');
  assert.ok(Math.abs(E.kepekatanRasio(2, 3) - 0.4) < 1e-9);
});

test('parseIsianRasio: menerima ":", "∶", "/", "banding" & titik ribuan', () => {
  const p = (s) => plain(E.parseIsianRasio(s));
  assert.deepEqual(p('2:3'), { a: 2, b: 3, kode: 'ok' });
  assert.deepEqual(p(' 4 : 6 '), { a: 4, b: 6, kode: 'ok' });
  assert.deepEqual(p('4∶6'), { a: 4, b: 6, kode: 'ok' });
  assert.deepEqual(p('2/3'), { a: 2, b: 3, kode: 'ok' });
  assert.deepEqual(p('2 banding 3'), { a: 2, b: 3, kode: 'ok' });
  assert.deepEqual(p('3 : 15.000'), { a: 3, b: 15000, kode: 'ok' });
  assert.equal(p('').kode, 'kosong');
  assert.equal(p('   ').kode, 'kosong');
  assert.equal(p('23').kode, 'format');
  assert.equal(p('2,5 : 3').kode, 'format');
  assert.equal(p('a : b').kode, 'format');
  assert.equal(p('0 : 3').kode, 'nol');
});

test('kunciRasioSituasi: kunci & pengecoh dari dua besaran dan totalnya', () => {
  const k1 = plain(E.kunciRasioSituasi(4, 6, 'a', 'b'));
  assert.deepEqual(k1.kunci, { a: 4, b: 6 });
  assert.deepEqual(
    k1.pengecoh.map((p) => p.kode),
    ['tertukar', 'keseluruhan']
  );
  assert.deepEqual(k1.pengecoh[1], { a: 4, b: 10, kode: 'keseluruhan' });

  const k2 = plain(E.kunciRasioSituasi(4, 6, 'b', 'total'));
  assert.deepEqual(k2.kunci, { a: 6, b: 10 });
  assert.deepEqual(k2.pengecoh, [
    { a: 10, b: 6, kode: 'tertukar' },
    { a: 6, b: 4, kode: 'bagianBagian' },
  ]);
});

test('diagnosaRasio: benar, tertukar, keseluruhan, belum sederhana, tambah sama', () => {
  const k = E.kunciRasioSituasi(4, 6, 'a', 'b');
  const d = (s, opts) => E.diagnosaRasio(s, k.kunci, Object.assign({ pengecoh: k.pengecoh }, opts));
  assert.equal(d('4 : 6').kode, 'benar');
  assert.equal(d('2 : 3').kode, 'benar', 'rasio ekuivalen diterima');
  assert.equal(d('2 : 3').benar, true);
  assert.equal(d('6 : 4').kode, 'tertukar');
  assert.equal(d('3 : 2').kode, 'tertukar');
  assert.equal(d('4 : 10').kode, 'keseluruhan');
  assert.equal(d('5 : 7').kode, 'tambahSama');
  assert.equal(d('1 : 5').kode, 'salah');
  assert.equal(d('').kode, 'kosong');
  assert.equal(d('empat').kode, 'format');
  assert.equal(d('4 : 6', { sederhana: true }).kode, 'belumSederhana');
  assert.equal(d('2 : 3', { sederhana: true }).kode, 'benar');
  ['benar', 'tertukar', 'keseluruhan', 'tambahSama', 'salah', 'kosong', 'format'].forEach((kode) =>
    assert.ok(E.PESAN_RASIO[kode], 'pesan ' + kode)
  );
  assert.ok(E.PESAN_RASIO.belumSederhana && E.PESAN_RASIO.bagianBagian && E.PESAN_RASIO.nol);
});

test('nilaiRasioHilang & diagnosaRasioHilang: suku yang hilang dari rasio ekuivalen', () => {
  assert.equal(E.nilaiRasioHilang(2, 3, 6, 'kanan'), 9, '2 : 3 = 6 : ?');
  assert.equal(E.nilaiRasioHilang(2, 3, 12, 'kiri'), 8, '2 : 3 = ? : 12');
  const d = (s) => E.diagnosaRasioHilang(s, 2, 3, 6, 'kanan');
  assert.equal(d('9').kode, 'benar');
  assert.equal(d('9').benar, true);
  assert.equal(d('7').kode, 'tambahSama', '3 + (6 − 2)');
  assert.equal(d('4').kode, 'tertukar', '6 × 2 : 3');
  assert.equal(d('10').kode, 'salah');
  assert.equal(d('').kode, 'kosong');
  assert.equal(d('x').kode, 'format');
  assert.equal(E.diagnosaRasioHilang('11', 2, 3, 12, 'kiri').kode, 'tambahSama', '2 + (12 − 3)');
});

test('periksaSoalRasio & jawabSoalRasio: semua jenis soal isian', () => {
  const situasi = { cek: { jenis: 'situasi', a: 3, b: 2, P: 'b', Q: 'a' } };
  assert.equal(E.jawabSoalRasio(situasi), '2 : 3');
  assert.equal(E.periksaSoalRasio('2 : 3', situasi).benar, true);
  assert.equal(E.periksaSoalRasio('3 : 2', situasi).kode, 'tertukar');

  const hilang = { cek: { jenis: 'hilang', a: 3, b: 5, x: 15, posisi: 'kiri' } };
  assert.equal(E.jawabSoalRasio(hilang), '9');
  assert.equal(E.periksaSoalRasio('9', hilang).benar, true);
  assert.equal(E.periksaSoalRasio('13', hilang).kode, 'tambahSama');

  const sederhana = { cek: { jenis: 'sederhana', a: 18, b: 24 } };
  assert.equal(E.jawabSoalRasio(sederhana), '3 : 4');
  assert.equal(E.periksaSoalRasio('3 : 4', sederhana).benar, true);
  assert.equal(E.periksaSoalRasio('9 : 12', sederhana).kode, 'belumSederhana');
  assert.equal(E.periksaSoalRasio('4 : 3', sederhana).kode, 'tertukar');

  assert.throws(() => E.jawabSoalRasio({ cek: { jenis: 'aneh' } }));
});

test('operasiRasio & terapkanAksiPencampur: kali, bagi, tambah, kembali', () => {
  assert.deepEqual(plain(E.operasiRasio(2, 3, 'kali2')), { a: 4, b: 6, ok: true });
  assert.deepEqual(plain(E.operasiRasio(2, 3, 'tambah1')), { a: 3, b: 4, ok: true });
  assert.deepEqual(plain(E.operasiRasio(4, 6, 'bagi2')), { a: 2, b: 3, ok: true });
  assert.equal(E.operasiRasio(2, 3, 'bagi2').ok, false, 'tidak habis dibagi');
  assert.throws(() => E.operasiRasio(2, 3, 'pangkat2'));

  const st = {};
  E.ensurePencampurState(st, 2, 3);
  assert.deepEqual(plain(st), { awal: { a: 2, b: 3 }, a: 2, b: 3, riwayat: [] });
  assert.equal(E.terapkanAksiPencampur(st, 'kali3'), true);
  assert.equal(E.terapkanAksiPencampur(st, 'bagi2'), false);
  assert.equal(E.terapkanAksiPencampur(st, 'tambah1'), true);
  assert.deepEqual(plain(st.riwayat), [
    { a: 6, b: 9, aksi: 'kali3' },
    { a: 7, b: 10, aksi: 'tambah1' },
  ]);
  E.terapkanAksiPencampur(st, 'awal');
  assert.deepEqual([st.a, st.b], [2, 3]);
  assert.equal(st.riwayat.length, 3);
  assert.deepEqual(plain(E.jenisAksiDicoba(st)).sort(), ['awal', 'kali', 'tambah']);

  /* state rusak dipulihkan */
  const rusak = { a: 'x', riwayat: 5 };
  E.ensurePencampurState(rusak, 2, 3);
  assert.deepEqual([rusak.a, rusak.b, rusak.riwayat.length], [2, 3, 0]);
});

test('warnaCampuran: makin pekat makin gelap, nilai rgb valid', () => {
  const rgb = (s) => s.match(/\d+/g).map(Number);
  const encer = rgb(E.warnaCampuran(1, 5));
  const pekat = rgb(E.warnaCampuran(5, 1));
  assert.equal(encer.length, 3);
  encer.concat(pekat).forEach((v) => assert.ok(v >= 0 && v <= 255));
  const terang = (c) => c[0] + c[1] + c[2];
  assert.ok(terang(pekat) < terang(encer));
  assert.equal(E.warnaCampuran(2, 3), E.warnaCampuran(4, 6), 'rasio ekuivalen → warna sama');
});

test('tampilan: gelas, ikon, pita, tabel, cek setara & pencampur', () => {
  const gelas = E.buildGelasCampuran(2, 3, { namaA: 'sirup', namaB: 'air', satuan: 'takar' });
  assert.match(gelas, /<svg/);
  assert.match(gelas, /role="img"/);
  assert.match(gelas, /2 takar sirup : 3 takar air/);

  const ikon = E.buildIkonRasio([
    { ikon: '🧑', n: 4, nama: 'murid laki-laki' },
    { ikon: '👧', n: 6, nama: 'murid perempuan' },
  ]);
  assert.match(ikon, /aria-label="4 murid laki-laki dan 6 murid perempuan"/);
  assert.equal((ikon.match(/ikon-rasio__item/g) || []).length, 10);

  const pita = E.buildPitaRasio(4, 6, { namaA: 'sirup', namaB: 'air', grup: 2 });
  assert.equal((pita.match(/pita-rasio__sel/g) || []).length, 10);
  assert.equal((pita.match(/pita-rasio__grup"/g) || []).length, 4, '2 grup tiap baris');

  const tabel = E.buildTabelRasio(
    [
      { a: 2, b: 3 },
      { a: 3, b: 4 },
    ],
    { namaA: 'Sirup', namaB: 'Air', acuan: { a: 2, b: 3 } }
  );
  assert.match(tabel, /<table/);
  assert.match(tabel, /Ekuivalen dengan 2 : 3\?/);
  assert.match(tabel, /✓/);
  assert.match(tabel, /✗/);

  const cek = E.buildCekSetara(8, 12, 10, 15);
  assert.match(cek, /2 : 3/);
  assert.match(cek, /8 × 15 = 120/);
  assert.match(cek, /12 × 10 = 120/);
  assert.match(cek, /ekuivalen/);
  assert.match(E.buildCekSetara(1, 3, 2, 4), /tidak ekuivalen/);

  const st = {};
  E.ensurePencampurState(st, 2, 3);
  E.terapkanAksiPencampur(st, 'kali2');
  const lab = E.buildPencampurRasio('lab', st, {
    namaA: 'sirup',
    namaB: 'air',
    satuan: 'takar',
    aksi: [
      { id: 'kali2', label: '× 2' },
      { id: 'bagi2', label: ': 2' },
      { id: 'tambah1', label: '+ 1' },
    ],
  });
  assert.match(lab, /data-pencampur="lab"/);
  assert.match(lab, /data-aksi="kali2"/);
  assert.match(lab, /data-aksi="awal"/);
  assert.match(lab, /Rasanya sama/);
  assert.equal(typeof E.bindPencampurRasio, 'function');
});
