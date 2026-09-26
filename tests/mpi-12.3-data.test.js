'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.3/data.js (bentuk akar ⇄ pangkat
 * pecahan & menyederhanakan bentuk akar, Discovery Learning): kunci
 * jawaban dihitung ulang dengan engine seksi 45 (formatAkar,
 * formatPangkatPecahan, sederhanakanAkar, nilaiPangkatPecahan,
 * diagnosaKonversi, diagnosaSederhanaAkar), setiap daftar pilihan punya
 * id & label unik dan cukup opsi untuk diacak, dan setiap opsi
 * pertanyaan penuntun punya umpan balik.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.3/data.js']);
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

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

/* Teks kunci yang diharapkan dari metadata `cek`. */
function teksKunci(cek) {
  if (cek.jenis === 'pangkat') return E.formatPangkatPecahan(cek.r, cek.m || 1, cek.n);
  if (cek.jenis === 'akar') return E.formatAkar(1, cek.q, cek.a, cek.p);
  if (cek.jenis === 'sederhana') {
    const s = E.sederhanakanAkar(cek.r, cek.n);
    return E.formatAkar(s.luar, cek.n, s.dalam);
  }
  if (cek.jenis === 'nilai') {
    const v = E.nilaiPangkatPecahan(cek.a, cek.p, cek.q);
    assert.ok(v.eksak, 'nilai ' + cek.a + '^(' + cek.p + '/' + cek.q + ') harus eksak');
    return E.formatNumber(v.nilai);
  }
  throw new Error('jenis cek tidak dikenal: ' + cek.jenis);
}

function assertSoalPilihan(q, name) {
  assertOptions(q.options, name + '.options', 4);
  assert.ok(ids(q.options).includes(q.correct), name + ': correct ada di opsi');
  assert.ok(q.cek, name + ': punya cek');
  const benar = q.options.find((o) => o.id === q.correct).label;
  assert.equal(benar, teksKunci(q.cek), name + ': label opsi benar = kunci engine');
  q.options
    .filter((o) => o.id !== q.correct)
    .forEach((o) => assert.notEqual(o.label, benar, name + ': pengecoh ' + o.id + ' ≠ kunci'));
}

test('setiap tahap punya kepala Discovery Learning', () => {
  [
    'stimulasi',
    'masalah',
    'akar',
    'pola',
    'sederhana',
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
  });
});

test('stimulasi & masalah: opsi dapat diacak, masalah punya umpan tiap opsi', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  D.stimulasi.opsi.forEach((o) =>
    assert.ok(D.verifikasi.kesimpulanDugaan[o.id], 'kesimpulanDugaan untuk ' + o.id)
  );
  assert.ok(D.verifikasi.kesimpulanDugaan[D.stimulasi.dugaanTepat], 'dugaanTepat ada');
  assertGuided(
    { opsi: D.masalah.opsi, correct: D.masalah.correct, umpan: D.masalah.umpan },
    'masalah'
  );
});

test('stimulasi: kebun 72 m², sisi = √72 = 6√2', () => {
  const s = E.sederhanakanAkar(D.stimulasi.luas, 2);
  assert.equal(D.stimulasi.luas, 72);
  assert.ok(D.stimulasi.papan.includes(E.formatAkar(s.luar, 2, s.dalam)));
  assert.ok(D.stimulasi.papan.includes(E.formatPangkatPecahan(72, 1, 2)));
  assert.ok(D.stimulasi.kalkulator.startsWith('8,48'));
});

test('akar: langkah isian = akar bulat dari luas/volume', () => {
  assert.ok(D.akar.jejakMin.persegi >= 1 && D.akar.jejakMin.kubus >= 1);
  assert.equal(new Set(ids(D.akar.langkah)).size, D.akar.langkah.length);
  D.akar.langkah.forEach((s) => {
    assert.equal(s.jawab, E.akarBulat(s.r, s.n), s.id + ': jawab = akar bulat');
    assert.ok(s.label.includes(E.formatAkar(1, s.n, s.r)), s.id + ': label memuat akar');
    assert.ok(s.hints && s.hints.length, s.id + '.hints');
  });
  assert.ok(D.akar.langkah.some((s) => s.n === 2));
  assert.ok(D.akar.langkah.some((s) => s.n === 3));
  D.akar.detektif.forEach((q) => assertGuided(q, 'akar.' + q.id));
});

test('pola: nilai pangkat pecahan eksak & tabel ringkas', () => {
  assert.equal(new Set(ids(D.pola.langkah)).size, D.pola.langkah.length);
  D.pola.langkah.forEach((s) => {
    const v = E.nilaiPangkatPecahan(s.cek.a, s.cek.p, s.cek.q);
    assert.ok(v.eksak, s.id + ': eksak');
    assert.equal(s.jawab, v.nilai, s.id + ': jawab = nilai');
    assert.ok(s.hints && s.hints.length, s.id + '.hints');
  });
  assert.ok(
    D.pola.langkah.some((s) => s.cek.p > 1),
    'ada pembilang > 1'
  );
  assert.ok(D.pola.tabel.length >= 4);
  D.pola.tanya.forEach((q) => assertGuided(q, 'pola.' + q.id));
});

test('sederhana: ubin faktor memuat kelompok & isian belum sederhana', () => {
  assert.equal(new Set(ids(D.sederhana.ubin)).size, D.sederhana.ubin.length);
  D.sederhana.ubin.forEach((u) => {
    assert.equal(E.akarSederhana(u.r, u.n), false, u.id + ': bisa disederhanakan');
    assert.ok(E.faktorPrima(u.r).length <= 8, u.id + ': ubin tidak terlalu banyak');
    assert.ok(u.hints && u.hints.length, u.id + '.hints');
  });
  assert.ok(
    D.sederhana.ubin.some((u) => u.n === 3),
    'ada akar pangkat tiga'
  );
  D.sederhana.tanya.forEach((q) => assertGuided(q, 'sederhana.' + q.id));
});

test('olah: konsep, misi konverter, dan pilah benar menurut engine', () => {
  D.olah.konsep.forEach((q) => assertGuided(q, 'olah.' + q.id));
  assert.equal(new Set(ids(D.olah.misi)).size, D.olah.misi.length);
  D.olah.misi.forEach((m) => {
    const t = m.target;
    assert.ok(t.a >= 2 && t.a <= 30 && t.m >= 1 && t.m <= 6 && t.n >= 2 && t.n <= 6, m.id);
    assert.ok(
      m.teks.includes(E.formatAkar(1, t.n, t.a, t.m)) ||
        m.teks.includes(E.formatPangkatPecahan(t.a, t.m, t.n)),
      m.id + ': teks memuat target'
    );
  });
  assertOptions(D.olah.opsiPilah, 'olah.opsiPilah', 2);
  assert.equal(new Set(ids(D.olah.pilah)).size, D.olah.pilah.length);
  D.olah.pilah.forEach((it) => {
    const c = it.cek;
    let tepat;
    let teks;
    if (c.jenis === 'konversi') {
      tepat = E.diagnosaKonversi(E.akarKePangkat(c.n, c.r, c.m), c.pangkat) === 'benar';
      teks =
        E.formatAkar(1, c.n, c.r, c.m) +
        ' = ' +
        E.formatPangkatPecahan(c.pangkat.a, c.pangkat.p, c.pangkat.q);
    } else if (c.jenis === 'sederhana') {
      tepat = E.diagnosaSederhanaAkar(c.r, c.n, { luar: c.luar, dalam: c.dalam }) === 'benar';
      teks = E.formatAkar(1, c.n, c.r) + ' = ' + E.formatAkar(c.luar, c.n, c.dalam);
    } else {
      throw new Error(it.id + ': jenis cek tidak dikenal');
    }
    assert.equal(it.correct, tepat ? 'tepat' : 'keliru', it.id + ': kunci pilah');
    assert.equal(it.teks, teks, it.id + ': teks sesuai cek');
    assert.ok(it.explanation, it.id + '.explanation');
  });
  const kunci = new Set(D.olah.pilah.map((it) => it.correct));
  assert.equal(kunci.size, 2, 'pilah memuat tepat & keliru');
});

test('verifikasi: soal pilihan dengan kunci engine & pengecoh unik', () => {
  assert.equal(new Set(ids(D.verifikasi.soal)).size, D.verifikasi.soal.length);
  D.verifikasi.soal.forEach((q) => {
    assertSoalPilihan(q, 'verifikasi.' + q.id);
    assert.ok(q.explanation, q.id + '.explanation');
  });
  const jenis = new Set(D.verifikasi.soal.map((q) => q.cek.jenis));
  ['pangkat', 'akar', 'sederhana'].forEach((j) => assert.ok(jenis.has(j), 'ada soal ' + j));
});

test('generalisasi: kalimat menunjuk bank, setiap potongan benar dipakai sekali', () => {
  const bank = ids(D.generalisasi.bank);
  assert.equal(new Set(bank).size, bank.length);
  const dipakai = D.generalisasi.kalimat.map((g) => g.correct);
  assert.equal(new Set(dipakai).size, dipakai.length);
  dipakai.forEach((c) => assert.ok(bank.includes(c), 'bank memuat ' + c));
  assert.ok(bank.length > dipakai.length, 'ada pengecoh');
});

test('terapkan: 8 soal, kunci isian & pilihan dihitung ulang', () => {
  assert.equal(D.terapkan.soal.length, 8);
  assert.equal(new Set(ids(D.terapkan.soal)).size, 8);
  D.terapkan.soal.forEach((q) => {
    assert.ok(q.konteks && q.cerita && q.pertanyaan && q.explanation, q.id + ': teks lengkap');
    if (q.type === 'input') {
      assert.ok(q.cek, q.id + '.cek');
      if (q.cek.jenis === 'nilai') {
        const v = E.nilaiPangkatPecahan(q.cek.a, q.cek.p, q.cek.q);
        assert.ok(v.eksak);
        assert.equal(q.jawab, v.nilai, q.id + ': jawab');
      } else if (q.cek.jenis === 'hampiran') {
        const s = E.sederhanakanAkar(q.cek.r, 2);
        assert.ok(Math.abs(q.jawab - s.luar * q.cek.akarDalam) < 1e-9, q.id + ': hampiran');
      } else {
        throw new Error(q.id + ': jenis cek isian tidak dikenal');
      }
    } else {
      assertSoalPilihan(q, 'terapkan.' + q.id);
    }
  });
  assert.ok(D.terapkan.soal.some((q) => q.type === 'input'));
  assert.ok(D.terapkan.soal.some((q) => q.type !== 'input'));
});

test('refleksi: opsi penilaian diri & pertanyaan', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assert.ok(D.selesai.capaian.length >= 3);
});
