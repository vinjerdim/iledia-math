'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-3.1/data.js (bunga tunggal dengan
 * barisan & deret aritmetika, Discovery Learning): kunci jawaban harus
 * cocok dengan fungsi bunga di shared/engine.js, setiap daftar pilihan
 * punya id unik dan cukup opsi untuk diacak, dan setiap opsi
 * pertanyaan penuntun punya umpan balik.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-3.1/data.js']);
const D = E.DATA;
const K = D.kasus;
const I = E.persenKeDesimal(K.persenTahun);

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
  if (c.jenis === 'bunga') return E.bungaTunggal(c.M0, c.i, c.n);
  if (c.jenis === 'akhir') return E.nilaiAkhirBungaTunggal(c.M0, c.i, c.n);
  if (c.jenis === 'beda') return c.M0 * c.i;
  if (c.jenis === 'persenBulan') return c.persenTahun / 12;
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
  });
}

test('setiap tahap punya kepala tahap & catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'koleksi',
    'olahBunga',
    'olahModal',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k], 'DATA.' + k);
    ['kicker', 'syntax', 'goal', 'guru', 'nextLabel'].forEach((f) =>
      assert.ok(D[k][f], 'DATA.' + k + '.' + f)
    );
  });
});

test('kasus: saldo Raka adalah barisan aritmetika dan target laptop tercapai tepat', () => {
  const saldo = E.saldoBungaTunggal(K.M0, I, 10);
  assert.equal(E.jenisDeret(saldo), 'aritmetika');
  assert.equal(E.nilaiAkhirBungaTunggal(K.M0, I, K.tahunTarget), K.targetLaptop);
});

test('stimulasi: dugaan acak memuat jawaban rumus & pengecoh bunga majemuk', () => {
  const S = D.stimulasi;
  assertOptions(S.opsi, 'stimulasi.opsi', 4);
  const benar = S.opsi.find((o) => o.id === D.verifikasi.dugaanBenar);
  assert.ok(benar, 'dugaanBenar ada di opsi stimulasi');
  assert.equal(benar.nilai, E.nilaiAkhirBungaTunggal(K.M0, I, S.tahunDitanya));
  const majemuk = Math.round(K.M0 * Math.pow(1 + I, S.tahunDitanya));
  assert.ok(
    S.opsi.some((o) => o.nilai === majemuk),
    'ada pengecoh bunga majemuk'
  );
  assert.ok(S.tampilTahun >= 2 && S.tampilTahun < S.tahunDitanya);
});

test('masalah: pertanyaan inti', () => {
  assertGuided(D.masalah, 'masalah');
});

test('koleksi: kolom tabel sesuai rumus & pilah pernyataan', () => {
  const C = D.koleksi;
  assert.ok(C.tabelN >= 4);
  assert.ok(C.hintsTabel.length >= 2);
  assertSort(C.pilah, C.opsiPilah, 'koleksi.pilah');
});

test('olahBunga: langkah & pertanyaan penuntun', () => {
  const B = D.olahBunga;
  assertSteps(B.langkah, 'olahBunga.langkah');
  assertGuidedList(B.pertanyaan, 'olahBunga.pertanyaan');
});

test('olahModal: langkah & pertanyaan penuntun', () => {
  const M = D.olahModal;
  assert.ok(M.tampilN >= 3);
  assertSteps(M.langkah, 'olahModal.langkah');
  assertGuidedList(M.pertanyaan, 'olahModal.pertanyaan');
});

test('verifikasi: tiga grup uji dengan kunci sesuai rumus', () => {
  const V = D.verifikasi;
  assertSteps(V.uji, 'verifikasi.uji');
  ['A', 'B', 'C'].forEach((g) =>
    assert.ok(
      V.uji.some((u) => u.grup === g),
      'grup ' + g
    )
  );
  /* grup B membuktikan dugaan stimulasi */
  const akhirB = V.uji.filter((u) => u.grup === 'B').pop();
  const benar = D.stimulasi.opsi.find((o) => o.id === V.dugaanBenar);
  assert.equal(akhirB.jawab, benar.nilai);
});

test('generalisasi: bank kalimat dengan pengecoh', () => {
  const G = D.generalisasi;
  const bankIds = ids(G.bank);
  assert.equal(new Set(bankIds).size, bankIds.length);
  assert.ok(G.bank.length > G.kalimat.length, 'ada potongan pengecoh');
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  G.kalimat.forEach((k) => assert.ok(bankIds.includes(k.correct), k.id));
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: kunci jawaban sesuai metadata bunga', () => {
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
      if (b.cari === 'akhir') {
        assert.equal(kunci, E.nilaiAkhirBungaTunggal(b.M0, b.i, b.n), nama);
      } else if (b.cari === 'i') {
        assert.ok(E.hampirSama(kunci, ((b.saldo[1] - b.saldo[0]) / b.saldo[0]) * 100), nama);
        assert.equal(E.jenisDeret(b.saldo), 'aritmetika', nama + ': saldo aritmetika');
      }
      return;
    }
    assert.equal(typeof s.jawab, 'number', nama);
    assert.ok(s.reveal, nama + ': reveal');
    const f = b.dari === 'akhir' ? E.nilaiAkhirBungaTunggal : E.bungaTunggal;
    if (b.cari === 'bunga') assert.equal(s.jawab, E.bungaTunggal(b.M0, b.i, b.n), nama);
    else if (b.cari === 'akhir') {
      assert.equal(s.jawab, E.nilaiAkhirBungaTunggal(b.M0, b.i, b.n), nama);
    } else if (b.cari === 'n') assert.equal(f(b.M0, b.i, s.jawab), b.target, nama);
    else if (b.cari === 'i') {
      assert.equal(f(b.M0, E.persenKeDesimal(s.jawab), b.n), b.target, nama);
    } else if (b.cari === 'M0') assert.equal(f(s.jawab, b.i, b.n), b.target, nama);
    else assert.fail(nama + ': cari tidak dikenal');
  });
  ['bunga', 'akhir', 'n', 'i', 'M0'].forEach((c) => assert.ok(dicari.has(c), 'ada soal cari ' + c));
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'refleksi.diriOpsi', 3);
  assert.ok(D.selesai.capaian.length >= 3);
});
