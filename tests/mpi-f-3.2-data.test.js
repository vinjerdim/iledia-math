'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-3.2/data.js (bunga majemuk dengan
 * barisan & deret geometri, Inquiry Learning): kunci jawaban harus
 * cocok dengan fungsi bunga majemuk di shared/engine.js, setiap daftar
 * pilihan punya id unik dan cukup opsi untuk diacak, setiap opsi
 * pertanyaan penuntun punya umpan balik, dan app.js benar-benar
 * mengacak setiap daftar pilihan jawaban murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-3.2/data.js']);
const D = E.DATA;
const K = D.kasus;
const I = E.persenKeDesimal(K.persenTahun);
/* Tanpa spasi agar pemeriksaan tidak bergantung pada pemenggalan baris Prettier. */
const tanpaSpasi = (s) => s.replace(/\s+/g, '').replace(/,\)/g, ')');
const APP = tanpaSpasi(fs.readFileSync(path.join(ROOT, 'fase-f/mpi-3.2/app.js'), 'utf8'));

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 3);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertGuidedList(list, name) {
  list.forEach((q) => assertGuided(q, name + '.' + q.id));
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertSort(items, options, name) {
  assertOptions(options, name + '.opsi', 2);
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(ids(options).includes(it.correct), name + '.' + it.id + ': kategori valid');
    assert.ok(it.explanation, name + '.' + it.id + ': ada penjelasan');
  });
}

/* Nilai yang diharapkan dari metadata `cek` sebuah langkah isian. */
function nilaiCek(c) {
  if (c.jenis === 'akhir') return E.nilaiAkhirBungaMajemuk(c.M0, c.i, c.n);
  if (c.jenis === 'bunga') return E.bungaMajemuk(c.M0, c.i, c.n);
  if (c.jenis === 'bungaKe') return E.bungaPeriodeMajemuk(c.M0, c.i, c.n)[c.n - 1];
  if (c.jenis === 'rasio') return 1 + c.i;
  if (c.jenis === 'persenPeriode') return c.persenTahun / c.kali;
  if (c.jenis === 'nPeriode') return c.tahun * c.kali;
  if (c.jenis === 'selisih') {
    return E.nilaiAkhirBungaMajemuk(c.M0, c.i, c.n) - E.nilaiAkhirBungaTunggal(c.M0, c.i, c.n);
  }
  throw new Error('jenis cek tidak dikenal: ' + c.jenis);
}

function assertSteps(list, name) {
  list.forEach((s, i) => {
    const nm = name + '[' + i + ']';
    assert.ok(s.label, nm + '.label');
    assert.equal(typeof s.jawab, 'number', nm + '.jawab');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    assert.ok(s.cek, nm + '.cek (metadata kunci)');
    assert.ok(E.hampirSama(s.jawab, nilaiCek(s.cek)), nm + ': jawab = rumus');
    /* Isian bulat dibandingkan persis, jadi kuncinya harus bilangan bulat. */
    if (!s.rational) assert.ok(Number.isInteger(s.jawab), nm + ': jawab bulat');
  });
}

const TAHAP = [
  'orientasi',
  'masalah',
  'hipotesis',
  'dataSaldo',
  'dataPola',
  'uji',
  'periode',
  'simpulan',
  'terapkan',
  'refleksi',
];

test('setiap tahap punya kepala tahap, sintaks Inquiry & catatan guru', () => {
  TAHAP.forEach((k) => {
    assert.ok(D[k], 'DATA.' + k);
    ['kicker', 'syntax', 'goal', 'guru', 'nextLabel'].forEach((f) =>
      assert.ok(D[k][f], 'DATA.' + k + '.' + f)
    );
  });
  ['orientasi', 'masalah', 'hipotesis', 'dataSaldo', 'uji', 'simpulan'].forEach((k) =>
    assert.match(D[k].syntax, /Inquiry Learning/, k)
  );
});

test('kasus: saldo Nadia barisan geometri dengan nilai bulat untuk tabel', () => {
  const saldo = E.saldoBungaMajemuk(K.M0, I, D.dataSaldo.tabelN);
  assert.equal(E.jenisDeret(saldo), 'geometri');
  saldo.forEach((m) => assert.ok(Number.isInteger(m), 'saldo tabel bulat: ' + m));
});

test('orientasi: dugaan acak memuat jawaban rumus & pengecoh bunga tunggal', () => {
  const O = D.orientasi;
  assertOptions(O.opsi, 'orientasi.opsi', 4);
  const benar = O.opsi.find((o) => o.id === D.uji.dugaanBenar);
  assert.ok(benar, 'dugaanBenar ada di opsi orientasi');
  assert.equal(benar.nilai, E.nilaiAkhirBungaMajemuk(K.M0, I, O.tahunDitanya));
  assert.ok(
    O.opsi.some((o) => o.nilai === E.nilaiAkhirBungaTunggal(K.M0, I, O.tahunDitanya)),
    'ada pengecoh bunga tunggal'
  );
  assert.ok(O.tampilTahun >= 2 && O.tampilTahun < O.tahunDitanya);
  assertOptions(O.opsiUntung, 'orientasi.opsiUntung', 3);
  assert.ok(ids(O.opsiUntung).includes(D.uji.untungBenar));
});

test('masalah: rumusan masalah penyelidikan', () => {
  assertGuided(D.masalah, 'masalah');
});

test('hipotesis: pilihan dugaan pola memuat pola yang benar', () => {
  const H = D.hipotesis;
  assertOptions(H.opsi, 'hipotesis.opsi', 3);
  assert.ok(ids(H.opsi).includes(D.uji.hipotesisBenar));
  assert.ok(H.hipotesisLabel);
});

test('dataSaldo: tabel, simulator & pilah pernyataan', () => {
  const C = D.dataSaldo;
  assert.ok(C.tabelN >= 4);
  assert.ok(C.hintsTabel.length >= 2);
  assert.ok(C.sim.modal.length >= 2 && C.sim.persen.length >= 2 && C.sim.maxN >= 5);
  assert.ok(C.minUbah >= 2);
  assertSort(C.pilah, C.opsiPilah, 'dataSaldo.pilah');
});

test('dataPola: langkah & pertanyaan penuntun', () => {
  const P = D.dataPola;
  assert.ok(P.tampilN >= 4);
  assertSteps(P.langkah, 'dataPola.langkah');
  assertGuidedList(P.pertanyaan, 'dataPola.pertanyaan');
});

test('uji: tiga grup uji dengan kunci sesuai rumus & dugaan terbukti', () => {
  const U = D.uji;
  assertSteps(U.langkah, 'uji.langkah');
  ['A', 'B'].forEach((g) =>
    assert.ok(
      U.langkah.some((u) => u.grup === g),
      'grup ' + g
    )
  );
  const akhirA = U.langkah.filter((u) => u.grup === 'A').pop();
  const benar = D.orientasi.opsi.find((o) => o.id === U.dugaanBenar);
  assert.equal(akhirA.jawab, benar.nilai, 'grup A membuktikan dugaan orientasi');
  assert.ok(U.bandingN >= 5);
  assertSort(U.pilah, U.opsiPilah, 'uji.pilah');
});

test('periode: langkah konversi & pertanyaan penuntun', () => {
  assertSteps(D.periode.langkah, 'periode.langkah');
  assertGuidedList(D.periode.pertanyaan, 'periode.pertanyaan');
});

test('simpulan: bank kalimat dengan pengecoh', () => {
  const G = D.simpulan;
  const bankIds = ids(G.bank);
  assert.equal(new Set(bankIds).size, bankIds.length);
  assert.ok(G.bank.length > G.kalimat.length, 'ada potongan pengecoh');
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  G.kalimat.forEach((k) => assert.ok(bankIds.includes(k.correct), k.id));
  assert.ok(G.rangkuman.length >= 3);
});

/* Nilai kunci dari metadata `bunga` soal uji terap. */
function kunciTerap(b, jawab) {
  const i = b.persenTahun !== undefined ? E.konversiPeriode(b.persenTahun, b.kali, b.tahun).i : b.i;
  const n = b.persenTahun !== undefined ? E.konversiPeriode(b.persenTahun, b.kali, b.tahun).n : b.n;
  if (b.cari === 'akhir') return E.bulatkanRupiah(E.nilaiAkhirBungaMajemuk(b.M0, i, n));
  if (b.cari === 'bunga') return E.bulatkanRupiah(E.bungaMajemuk(b.M0, i, n));
  if (b.cari === 'selisih') {
    return E.nilaiAkhirBungaMajemuk(b.M0, i, n) - E.nilaiAkhirBungaTunggal(b.M0, i, n);
  }
  if (b.cari === 'M0') return E.nilaiAkhirBungaMajemuk(jawab, i, n) === b.target ? jawab : NaN;
  if (b.cari === 'n') return E.nilaiAkhirBungaMajemuk(b.M0, i, jawab) === b.target ? jawab : NaN;
  if (b.cari === 'i') {
    assert.equal(E.jenisDeret(b.saldo), 'geometri', 'saldo geometri');
    return ((b.saldo[1] - b.saldo[0]) / b.saldo[0]) * 100;
  }
  throw new Error('cari tidak dikenal: ' + b.cari);
}

test('terapkan: kunci jawaban sesuai metadata bunga majemuk', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 6);
  const dicari = new Set();
  soal.forEach((s, idx) => {
    const nama = 'terapkan.soal[' + idx + ']';
    const b = s.bunga;
    assert.ok(b, nama + ': metadata bunga');
    dicari.add(b.cari);
    assert.ok(Array.isArray(s.hints) && s.hints.length, nama + ': hints');
    if (s.type === 'choice') {
      assertOptions(s.options, nama, 4);
      assert.ok(ids(s.options).includes(s.correct), nama + ': correct ada di opsi');
      assert.ok(s.explanation, nama + ': penjelasan');
      const kunci = s.options.find((o) => o.id === s.correct).nilai;
      assert.ok(E.hampirSama(kunci, kunciTerap(b, kunci)), nama);
      return;
    }
    assert.equal(typeof s.jawab, 'number', nama);
    assert.ok(s.reveal, nama + ': reveal');
    assert.ok(E.hampirSama(s.jawab, kunciTerap(b, s.jawab)), nama);
  });
  ['akhir', 'bunga', 'M0', 'n', 'selisih', 'i'].forEach((c) =>
    assert.ok(dicari.has(c), 'ada soal cari ' + c)
  );
  assert.ok(
    soal.some((s) => s.bunga.kali > 1),
    'ada soal pemajemukan lebih dari sekali setahun'
  );
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'refleksi.diriOpsi', 3);
  assert.ok(D.selesai.capaian.length >= 3);
});

test('app.js mengacak setiap daftar pilihan jawaban murid', () => {
  [
    "ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi)",
    "ensureShuffledOrder(State, 'untungOrder', DATA.orientasi.opsiUntung)",
    "ensureShuffledOrder(State, 'masalahOrder', DATA.masalah.opsi)",
    "ensureShuffledOrder(State, 'hipotesisOrder', DATA.hipotesis.opsi)",
    "ensureSortStates(State, 'pilahStates', 'pilahOrder'",
    'ensureShuffledOrder(State.polaOrders, q.id, q.opsi)',
    "ensureSortStates(State, 'ujiPilahStates', 'ujiPilahOrder'",
    'ensureShuffledOrder(State.periodeOrders, q.id, q.opsi)',
    "ensureShuffledOrder(State, 'bankOrder', DATA.simpulan.bank)",
    'shuffleArray(optionIds(s.options))',
    "ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi)",
  ].forEach((frag) => assert.ok(APP.includes(tanpaSpasi(frag)), 'app.js mengacak: ' + frag));
});
