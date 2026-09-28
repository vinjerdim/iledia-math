'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.6/data.js (unsur-unsur &
 * jaring-jaring limas, Discovery Learning): setiap tahap punya kepala
 * DL, setiap daftar pilihan punya id & label unik dan cukup opsi untuk
 * diacak, setiap opsi pertanyaan penuntun punya umpan balik, dan kunci
 * jawaban dihitung ulang dengan engine seksi 56 (unsurLimas, cekJaringLimas).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.6/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  assert.equal(
    new Set(list.map((o) => o.label || o.teks)).size,
    list.length,
    name + ': label opsi harus unik'
  );
}

function assertGuided(list, name) {
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
  list.forEach((q) => {
    const nm = name + '.' + q.id;
    assert.ok(q.tanya, nm + '.tanya');
    assertOptions(q.opsi, nm + '.opsi', 4);
    assert.ok(ids(q.opsi).includes(q.correct), nm + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], nm + ': umpan untuk ' + o.id));
  });
}

test('setiap tahap punya kepala Discovery Learning', () => {
  [
    'stimulasi',
    'masalah',
    'amati',
    'bongkar',
    'olah',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k].kicker, k + '.kicker');
    assert.ok(D[k].goal, k + '.goal');
    assert.ok(D[k].syntax, k + '.syntax');
    assert.ok(D[k].guru, k + '.guru');
    assert.ok(D[k].nextLabel, k + '.nextLabel');
  });
});

test('stimulasi: benda berbentuk limas, opsi dugaan punya tanggapan di simpulan', () => {
  assert.ok(D.stimulasi.benda.length >= 3);
  D.stimulasi.benda.forEach((b) => {
    assert.ok(Number.isInteger(b.n) && b.n >= 3, b.id + '.n');
    assert.ok(b.tinggi > 0, b.id + '.tinggi');
  });
  assert.ok(D.stimulasi.opsi.some((o) => o.id === D.stimulasi.dugaanTepat));
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  D.stimulasi.opsi.forEach((o) =>
    assert.ok(D.generalisasi.tanggapanDugaan[o.id], 'tanggapanDugaan untuk ' + o.id)
  );
});

test('masalah: opsi teracak-able dengan umpan tiap opsi', () => {
  assertGuided(
    [
      {
        id: 'masalah',
        tanya: D.masalah.pertanyaan,
        opsi: D.masalah.opsi,
        correct: D.masalah.correct,
        umpan: D.masalah.umpan,
      },
    ],
    'masalah'
  );
});

/* Setiap spec jaring limas di data harus punya tinggi segitiga > apotema alas. */
function assertSpecLimas(spec, nm) {
  assert.ok(Number.isInteger(spec.n) && spec.n >= 3, nm + '.n');
  assert.ok(['bunga', 'kipas'].includes(spec.susun), nm + '.susun');
  assert.ok(spec.t > E.apotemaAlas(spec.n, spec.s || 1), nm + ': t > apotema alas');
}

test('amati & bongkar: pertanyaan penuntun lengkap', () => {
  assert.deepEqual([...D.amati.tabelRows], [3, 4, 5, 6]);
  assertGuided(D.amati.tanya, 'amati.tanya');
  assertGuided(D.bongkar.tanyaLipat, 'bongkar.tanyaLipat');
  assertGuided(D.bongkar.tanyaRakit, 'bongkar.tanyaRakit');
});

test('bongkar: jaring-jaring kemasan valid, memakai dua susunan, cocok dengan b1/b3', () => {
  const susun = new Set();
  Object.keys(D.bongkar.lipat).forEach((k) => {
    const spec = D.bongkar.lipat[k];
    assertSpecLimas(spec, 'lipat.' + k);
    assert.equal(spec.n, Number(k));
    assert.equal(E.cekJaringLimas(spec).valid, true, 'kemasan ' + k + ' valid');
    assert.ok(D.bongkar.namaKemasan[k], 'nama kemasan ' + k);
    susun.add(spec.susun);
  });
  assert.equal(susun.size, 2, 'bunga & kipas sama-sama tampil');
  const b1 = D.bongkar.tanyaLipat.find((q) => q.id === 'b1');
  const kep = E.jaringLimas(D.bongkar.lipat[4]).pieces;
  assert.equal(b1.correct, '1p4s');
  assert.equal(kep.filter((p) => p.jenis === 'tegak').length, 4);
  assert.equal(kep.filter((p) => p.jenis === 'alas').length, 1);
  const b3 = D.bongkar.tanyaLipat.find((q) => q.id === 'b3');
  assert.equal(Number(b3.correct), E.unsurLimas(6).sisiTegak);
});

test('bongkar: perakit punya cukup jaring valid untuk target', () => {
  const R = D.bongkar.rakit;
  assert.ok(R.t > E.apotemaAlas(R.n, R.s));
  assert.ok(R.minSegitiga < R.n && R.maxSegitiga > R.n, 'stepper bisa kurang & lebih');
  assert.ok(D.bongkar.targetRakit >= 2 && D.bongkar.targetRakit <= R.n);
  let valid = 0;
  for (let j = 0; j < R.n; j++) {
    if (E.cekJaringLimas({ n: R.n, susun: 'kipas', segitiga: R.n, alasPada: [j] }).valid) valid++;
  }
  assert.ok(valid >= D.bongkar.targetRakit);
});

test('olah: konsep pola cocok dengan unsurLimas', () => {
  assertGuided(D.olah.konsep, 'olah.konsep');
  const rumus = { 'n+1': (n) => n + 1, '2n': (n) => 2 * n };
  const kolom = { o1: 'titik', o2: 'rusuk', o3: 'sisi' };
  Object.keys(kolom).forEach((qid) => {
    const q = D.olah.konsep.find((x) => x.id === qid);
    [3, 4, 5, 6, 8].forEach((n) =>
      assert.equal(rumus[q.correct](n), E.unsurLimas(n)[kolom[qid]], qid + ' n=' + n)
    );
  });
  D.olah.prediksiRows.forEach((n) => assert.ok(!D.amati.tabelRows.includes(n), 'prediksi baru'));
});

test('olah.pilah: kunci dapat/tidak dilipat sesuai cekJaringLimas, alasan beragam', () => {
  assertOptions(D.olah.opsiKlas, 'olah.opsiKlas', 2);
  assert.equal(new Set(ids(D.olah.pilah)).size, D.olah.pilah.length);
  const alasan = new Set();
  D.olah.pilah.forEach((it) => {
    assertSpecLimas(it.spec, it.id);
    const r = E.cekJaringLimas(it.spec);
    alasan.add(r.alasan);
    assert.equal(it.correct, r.valid ? 'bisa' : 'tidak', it.id);
    assert.ok(it.explanation, it.id + '.explanation');
    assert.ok(it.nama, it.id + '.nama');
  });
  const bisa = D.olah.pilah.filter((it) => it.correct === 'bisa').length;
  assert.ok(bisa >= 2 && D.olah.pilah.length - bisa >= 2);
  assert.ok(alasan.size >= 4, 'minimal tiga macam alasan tidak valid');
});

test('verifikasi: langkah, jaring baru, dan soal miskonsepsi', () => {
  const u = E.unsurLimas(D.verifikasi.n);
  assert.ok(!D.amati.tabelRows.includes(D.verifikasi.n));
  D.verifikasi.langkah.forEach((s) => {
    assert.ok(u[s.id] > 0, s.id + ' adalah unsur yang dikenal');
    assert.ok(s.hints && s.hints.length, s.id + '.hints');
  });
  assertOptions(D.verifikasi.opsiPrediksi, 'verifikasi.opsiPrediksi', 2);
  D.verifikasi.jaring.forEach((j) => assertSpecLimas(j.spec, j.id));
  const hasil = D.verifikasi.jaring.map((j) => E.cekJaringLimas(j.spec).valid);
  assert.ok(hasil.includes(true) && hasil.includes(false), 'satu valid satu tidak');
  D.verifikasi.soal.forEach((q) => {
    assertOptions(q.options, 'verifikasi.' + q.id, 4);
    assert.ok(ids(q.options).includes(q.correct), q.id + ': correct ada di opsi');
    assert.ok(q.teks && q.explanation, q.id);
  });
});

test('generalisasi: setiap kalimat punya potongan benar di bank, bank teracak-able', () => {
  assertOptions(D.generalisasi.bank, 'generalisasi.bank', D.generalisasi.kalimat.length + 2);
  const bankIds = ids(D.generalisasi.bank);
  const dipakai = new Set();
  D.generalisasi.kalimat.forEach((k) => {
    assert.ok(bankIds.includes(k.correct), k.id);
    assert.ok(!dipakai.has(k.correct), k.id + ': potongan tidak dipakai dua kali');
    dipakai.add(k.correct);
  });
});

test('terapkan: kunci isian dihitung ulang dengan unsurLimas, opsi pilihan valid', () => {
  assert.equal(new Set(ids(D.terapkan.soal)).size, D.terapkan.soal.length);
  D.terapkan.soal.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id);
    assert.ok(s.hints && s.hints.length, s.id + '.hints');
    if (s.type === 'input') {
      assert.equal(s.jawab, E.unsurLimas(s.cek.n)[s.cek.jenis], s.id + ': kunci');
    } else {
      assertOptions(s.options, 'terapkan.' + s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada di opsi');
    }
  });
  const t4 = D.terapkan.soal.find((s) => s.id === 't4');
  assert.equal(E.unsurLimas(t4.cek.n).sisi, t4.cek.nilai);
  assert.equal(E.namaLimas(t4.cek.n), 'limas ' + t4.correct);
  const t6 = D.terapkan.soal.find((s) => s.id === 't6');
  t6.options.forEach((o) => {
    assertSpecLimas(o.jaring, 't6.' + o.id);
    assert.equal(E.cekJaringLimas(o.jaring).valid, o.id === t6.correct, 't6.' + o.id);
  });
  const t7 = D.terapkan.soal.find((s) => s.id === 't7');
  assert.equal(E.unsurLimas(t7.cek.n).rusuk, t7.cek.rusuk);
  const t8 = D.terapkan.soal.find((s) => s.id === 't8');
  const m = E.modelLimas(4);
  const tegak = m.rusuk.filter((r) => r.jenis === 'tegak').map((r) => r.nama);
  t8.options.forEach((o) => assert.equal(tegak.includes(o.id), o.id === t8.correct, 't8.' + o.id));
});

test('refleksi: pertanyaan & opsi penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 3);
});
