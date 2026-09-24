'use strict';

/*
 * Tes shared/engine.js seksi 28 (peluang kejadian majemuk): operasi
 * pecahan tambahan, ruang sampel (satu/dua dadu, koin, koin + dadu,
 * kartu remi, dua kartu dengan/tanpa pengembalian), predikat kejadian
 * (termasuk gabungan "|" dan irisan "&"), sifat saling lepas & saling
 * bebas, rumus peluang, diagnosa miskonsepsi, simulator percobaan
 * dengan RNG deterministik, serta tanda sel grid ruang sampel.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function frac(num, den) {
  return { num: num, den: den };
}

function plain(p) {
  return p === null ? null : { num: p.num, den: p.den };
}

/* RNG deterministik (LCG) agar hasil simulator bisa diuji. */
function rngTetap(seed) {
  let s = seed >>> 0;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

test('tambahPecahan & kurangPecahan: hasil eksak paling sederhana', () => {
  assert.deepEqual(plain(E.tambahPecahan(frac(1, 6), frac(1, 6))), frac(1, 3));
  assert.deepEqual(plain(E.tambahPecahan(frac(5, 36), frac(1, 6))), frac(11, 36));
  assert.deepEqual(plain(E.kurangPecahan(frac(11, 36), frac(1, 36))), frac(5, 18));
  assert.deepEqual(plain(E.kurangPecahan(frac(1, 4), frac(1, 4))), frac(0, 1));
  assert.equal(E.tambahPecahan(null, frac(1, 2)), null);
});

test('ruang sampel: banyak anggota sesuai percobaan', () => {
  assert.equal(E.ruangSampel('satuDadu').length, 6);
  assert.equal(E.ruangSampel('duaDadu').length, 36);
  assert.equal(E.ruangSampel('satuKoin').length, 2);
  assert.equal(E.ruangSampel('duaKoin').length, 4);
  assert.equal(E.ruangSampelKoin(3).length, 8);
  assert.equal(E.ruangSampel('koinDadu').length, 12);
  assert.equal(E.ruangSampel('kartu').length, 52);
  assert.equal(E.ruangSampel('duaKartuKembali').length, 52 * 52);
  assert.equal(E.ruangSampel('duaKartuTanpa').length, 52 * 51);
  assert.throws(() => E.ruangSampel('tidakAda'));
});

test('dekKartu: 4 jenis × 13 nilai, warna sesuai jenis, id unik', () => {
  const dek = E.dekKartu();
  const idUnik = new Set(dek.map((k) => k.id));
  assert.equal(idUnik.size, 52);
  assert.equal(dek.filter((k) => k.jenis === 'hati').length, 13);
  assert.equal(dek.filter((k) => k.nilai === 'A').length, 4);
  assert.equal(dek.filter((k) => k.warna === 'merah').length, 26);
  dek
    .filter((k) => k.jenis === 'sekop' || k.jenis === 'keriting')
    .forEach((k) => assert.equal(k.warna, 'hitam'));
});

test('predikat kejadian: dua dadu', () => {
  const S = E.ruangSampel('duaDadu');
  assert.equal(E.filterKejadian(S, 'jumlah:7').length, 6);
  assert.equal(E.filterKejadian(S, 'jumlah:8').length, 5);
  assert.equal(E.filterKejadian(S, 'jumlah:min:10').length, 6);
  assert.equal(E.filterKejadian(S, 'kembar').length, 6);
  assert.equal(E.filterKejadian(S, 'dadu1:6').length, 6);
  assert.equal(E.filterKejadian(S, 'dadu2:genap').length, 18);
  assert.equal(E.filterKejadian(S, 'jumlah:8&kembar').length, 1);
  assert.equal(E.filterKejadian(S, 'jumlah:8|kembar').length, 10);
  assert.equal(E.filterKejadian(S, 'jumlah:7|kembar').length, 12);
});

test('predikat kejadian: satu dadu, koin + dadu, kartu, dua kartu', () => {
  assert.equal(E.filterKejadian(E.ruangSampel('satuDadu'), 'dadu:prima').length, 3);
  assert.equal(E.filterKejadian(E.ruangSampel('satuDadu'), 'dadu:genap|dadu:prima').length, 5);
  const KD = E.ruangSampel('koinDadu');
  assert.equal(E.filterKejadian(KD, 'koin:A').length, 6);
  assert.equal(E.filterKejadian(KD, 'koin:A&dadu:genap').length, 3);
  assert.equal(E.filterKejadian(KD, 'dadu:min:5').length, 4);
  const K = E.ruangSampel('kartu');
  assert.equal(E.filterKejadian(K, 'nilai:A').length, 4);
  assert.equal(E.filterKejadian(K, 'jenis:hati').length, 13);
  assert.equal(E.filterKejadian(K, 'wajah').length, 12);
  assert.equal(E.filterKejadian(K, 'warna:merah|nilai:K').length, 28);
  const DK = E.ruangSampel('duaKartuTanpa');
  assert.equal(E.filterKejadian(DK, 'k1:nilai:A&k2:nilai:A').length, 12);
  const DKK = E.ruangSampel('duaKoin');
  assert.equal(E.filterKejadian(DKK, 'koin1:A&koin2:A').length, 1);
  assert.throws(() => E.predikatKejadian('entah:apa'));
});

test('peluangKejadian: nilai eksak n(A)/n(S)', () => {
  assert.deepEqual(plain(E.peluangKejadian('duaDadu', 'jumlah:7')), frac(1, 6));
  assert.deepEqual(plain(E.peluangKejadian('kartu', 'nilai:A|jenis:hati')), frac(4, 13));
  assert.deepEqual(plain(E.peluangKejadian('koinDadu', 'koin:A&dadu:genap')), frac(1, 4));
});

test('sifatKejadian: saling lepas (jumlah 7 & kembar)', () => {
  const s = E.sifatKejadian('duaDadu', 'jumlah:7', 'kembar');
  assert.equal(s.nS, 36);
  assert.equal(s.nA, 6);
  assert.equal(s.nB, 6);
  assert.equal(s.nIrisan, 0);
  assert.equal(s.nGabungan, 12);
  assert.equal(s.salingLepas, true);
  assert.equal(s.salingBebas, false);
  assert.deepEqual(plain(s.pGabungan), frac(1, 3));
  assert.ok(E.samaPecahan(s.pGabungan, E.tambahPecahan(s.pA, s.pB)));
});

test('sifatKejadian: tidak saling lepas (jumlah 8 & kembar) memenuhi rumus gabungan', () => {
  const s = E.sifatKejadian('duaDadu', 'jumlah:8', 'kembar');
  assert.equal(s.nIrisan, 1);
  assert.equal(s.salingLepas, false);
  assert.deepEqual(plain(s.pGabungan), frac(5, 18));
  assert.deepEqual(plain(E.peluangGabungan(s.pA, s.pB, s.pIrisan)), frac(5, 18));
  assert.ok(!E.samaPecahan(s.pGabungan, E.tambahPecahan(s.pA, s.pB)));
});

test('sifatKejadian: saling bebas (koin & dadu; As & Hati)', () => {
  const kd = E.sifatKejadian('koinDadu', 'koin:A', 'dadu:genap');
  assert.equal(kd.salingBebas, true);
  assert.equal(kd.salingLepas, false);
  assert.deepEqual(plain(E.peluangIrisanBebas(kd.pA, kd.pB)), frac(1, 4));
  const kartu = E.sifatKejadian('kartu', 'nilai:A', 'jenis:hati');
  assert.equal(kartu.salingLepas, false);
  assert.equal(kartu.salingBebas, true);
  assert.deepEqual(plain(kartu.pGabungan), frac(4, 13));
});

test('sifatKejadian: dua kartu dengan vs tanpa pengembalian', () => {
  const kembali = E.sifatKejadian('duaKartuKembali', 'k1:nilai:A', 'k2:nilai:A');
  assert.equal(kembali.salingBebas, true);
  assert.deepEqual(plain(kembali.pIrisan), frac(1, 169));
  const tanpa = E.sifatKejadian('duaKartuTanpa', 'k1:nilai:A', 'k2:nilai:A');
  assert.equal(tanpa.salingBebas, false);
  assert.deepEqual(plain(tanpa.pB), frac(1, 13));
  assert.deepEqual(plain(tanpa.pIrisan), frac(1, 221));
});

test('diagnosaPeluang: gabungan', () => {
  const s = E.sifatKejadian('duaDadu', 'jumlah:8', 'kembar');
  assert.equal(E.diagnosaPeluang(frac(5, 18), s, 'pGabungan'), 'benar');
  assert.equal(E.diagnosaPeluang(frac(10, 36), s, 'pGabungan'), 'benar');
  assert.equal(E.diagnosaPeluang(frac(11, 36), s, 'pGabungan'), 'lupaIrisan');
  assert.equal(E.diagnosaPeluang(frac(5, 216), s, 'pGabungan'), 'dikali');
  assert.equal(E.diagnosaPeluang(frac(1, 36), s, 'pGabungan'), 'hanyaIrisan');
  assert.equal(E.diagnosaPeluang(frac(10, 1), s, 'pGabungan'), 'bukanPeluang');
  assert.equal(E.diagnosaPeluang(frac(1, 2), s, 'pGabungan'), 'lain');
});

test('diagnosaPeluang: irisan & peluang tunggal', () => {
  const tanpa = E.sifatKejadian('duaKartuTanpa', 'k1:nilai:A', 'k2:nilai:A');
  assert.equal(E.diagnosaPeluang(frac(1, 221), tanpa, 'pIrisan'), 'benar');
  assert.equal(E.diagnosaPeluang(frac(1, 169), tanpa, 'pIrisan'), 'dikaliTakBebas');
  assert.equal(E.diagnosaPeluang(frac(2, 13), tanpa, 'pIrisan'), 'dijumlah');
  const d = E.sifatKejadian('duaDadu', 'jumlah:7', 'kembar');
  assert.equal(E.diagnosaPeluang(frac(1, 6), d, 'pA'), 'benar');
  assert.equal(E.diagnosaPeluang(frac(6, 1), d, 'pA'), 'bukanPeluang');
  assert.equal(E.diagnosaPeluang(null, d, 'pA'), 'lain');
  [
    'lupaIrisan',
    'dikali',
    'hanyaIrisan',
    'dijumlah',
    'dikaliTakBebas',
    'bukanPeluang',
    'lain',
  ].forEach((k) => assert.ok(E.pesanDiagnosaPeluang(k).length > 10, 'pesan untuk ' + k));
});

test('nilaiSifat: membaca besaran dari hasil sifatKejadian', () => {
  const s = E.sifatKejadian('duaDadu', 'jumlah:8', 'kembar');
  assert.equal(E.nilaiSifat(s, 'nA'), 5);
  assert.equal(E.nilaiSifat(s, 'nGabungan'), 10);
  assert.ok(Math.abs(E.nilaiSifat(s, 'pGabungan') - 10 / 36) < 1e-12);
  assert.ok(Math.abs(E.nilaiSifat(s, 'pA+pB') - 11 / 36) < 1e-12);
  assert.ok(Math.abs(E.nilaiSifat(s, 'pA*pB') - (5 / 36) * (1 / 6)) < 1e-12);
  assert.throws(() => E.nilaiSifat(s, 'entah'));
});

test('formatHasil & kunciHasil: tampilan tiap jenis hasil', () => {
  assert.equal(E.formatHasil({ d1: 3, d2: 4 }), '(3, 4)');
  assert.equal(E.formatHasil({ koin: 'A', dadu: 5 }), '(A, 5)');
  assert.equal(E.formatHasil({ dadu: 2 }), '2');
  const as = E.dekKartu().find((k) => k.nilai === 'A' && k.jenis === 'hati');
  assert.equal(E.formatHasil(as), 'A♥');
  assert.equal(E.formatHasil({ k1: as, k2: as }), 'A♥, A♥');
  assert.equal(E.kunciHasil({ d1: 3, d2: 4 }), '3-4');
  assert.equal(E.kunciHasil(as), as.id);
});

test('simulator: jumlah frekuensi konsisten & deterministik dengan RNG tetap', () => {
  const ids = ['jumlah:7', 'kembar', 'jumlah:7|kembar', 'jumlah:7&kembar'];
  const st = E.makeProbSimState();
  E.jalankanPercobaan(st, 'duaDadu', ids, 500, rngTetap(42));
  assert.equal(st.n, 500);
  assert.equal(st.frek['jumlah:7&kembar'], 0);
  assert.equal(st.frek['jumlah:7|kembar'], st.frek['jumlah:7'] + st.frek.kembar);
  assert.ok(st.last.length > 0 && st.last.length <= 12);
  const fr = E.frekuensiRelatif(st, 'jumlah:7|kembar');
  assert.ok(fr > 0.2 && fr < 0.47, 'frekuensi relatif mendekati 1/3: ' + fr);
  const st2 = E.makeProbSimState();
  E.jalankanPercobaan(st2, 'duaDadu', ids, 500, rngTetap(42));
  assert.deepEqual(JSON.parse(JSON.stringify(st2)), JSON.parse(JSON.stringify(st)));
  assert.equal(E.frekuensiRelatif(E.makeProbSimState(), 'kembar'), 0);
});

test('simulator: batas maksimal percobaan dihormati', () => {
  const st = E.makeProbSimState();
  E.jalankanPercobaan(st, 'satuKoin', ['koin:A'], 50, rngTetap(1), 60);
  E.jalankanPercobaan(st, 'satuKoin', ['koin:A'], 50, rngTetap(2), 60);
  assert.equal(st.n, 60);
});

test('tanda grid: toggle, periksa, dan hitung salah per lapis', () => {
  const st = E.makeGridMarkState();
  assert.equal(st.layer, 'A');
  const S = E.ruangSampel('duaDadu');
  E.filterKejadian(S, 'jumlah:8').forEach((o) => E.toggleGridMark(st, E.kunciHasil(o)));
  E.toggleGridMark(st, '1-1');
  let cek = E.periksaGridMark(st, 'duaDadu', 'jumlah:8', 'A');
  assert.equal(cek.benar, false);
  assert.deepEqual([...cek.lebih], ['1-1']);
  assert.deepEqual([...cek.kurang], []);
  E.toggleGridMark(st, '1-1');
  cek = E.periksaGridMark(st, 'duaDadu', 'jumlah:8', 'A');
  assert.equal(cek.benar, true);
  st.layer = 'B';
  E.toggleGridMark(st, '4-4');
  cek = E.periksaGridMark(st, 'duaDadu', 'kembar', 'B');
  assert.equal(cek.kurang.length, 5);
  assert.equal(E.gridMarkCount(st, 'A'), 5);
});

test('gridRuangSampel: dimensi grid tiap ruang sampel', () => {
  const g = E.gridRuangSampel('duaDadu');
  assert.equal(g.rows.length, 6);
  assert.equal(g.cols.length, 6);
  assert.equal(E.kunciHasil(g.cell(g.rows[2], g.cols[3])), '3-4');
  const kd = E.gridRuangSampel('koinDadu');
  assert.equal(kd.rows.length * kd.cols.length, 12);
  const k = E.gridRuangSampel('kartu');
  assert.equal(k.rows.length * k.cols.length, 52);
});
