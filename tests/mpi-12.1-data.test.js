'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.1/data.js (membaca & menulis
 * bilangan berpangkat, Discovery Learning): kunci jawaban dihitung ulang
 * dengan engine seksi 30 (bacaPangkat, ekspresiPangkat, cekBacaPangkat,
 * cekTulisPangkat), setiap daftar pilihan punya id unik dan cukup opsi
 * untuk diacak, setiap opsi pertanyaan penuntun punya umpan balik, dan
 * teks soal memuat bilangan berpangkat yang ditanyakan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.1/data.js']);
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

function assertLangkah(list, jenis, name) {
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const nm = name + '.' + s.id;
    assert.equal(s.jenis, jenis, nm + '.jenis');
    assert.ok(Number.isInteger(s.a) && Number.isInteger(s.n), nm + ': a, n bulat');
    assert.ok(s.label, nm + '.label');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    const opts = { negLuar: s.negLuar };
    if (jenis === 'baca') {
      assert.ok(
        s.label.includes(E.ekspresiPangkat(s.a, s.n, opts)),
        nm + ': label memuat ' + E.ekspresiPangkat(s.a, s.n, opts)
      );
      assert.equal(E.cekBacaPangkat(E.bacaPangkat(s.a, s.n, opts), s.a, s.n, opts).kode, 'benar');
    } else {
      assert.equal(
        E.cekTulisPangkat({ basis: String(s.a), pangkat: String(s.n) }, s.a, s.n).kode,
        'benar'
      );
    }
  });
}

test('setiap tahap punya kepala Discovery Learning', () => {
  [
    'stimulasi',
    'masalah',
    'lipat',
    'pola',
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

test('stimulasi & masalah: opsi acak-able, masalah punya umpan tiap opsi', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  D.stimulasi.opsi.forEach((o) =>
    assert.ok(D.verifikasi.kesimpulanDugaan[o.id], 'kesimpulanDugaan untuk ' + o.id)
  );
  assertGuided(
    { opsi: D.masalah.opsi, correct: D.masalah.correct, umpan: D.masalah.umpan },
    'masalah'
  );
});

test('stimulasi: catatan Bima memuat tepat 10 faktor 2', () => {
  const faktor = D.stimulasi.catatanBima.split('=')[0].trim().split(' × ');
  assert.equal(faktor.length, 10);
  assert.ok(faktor.every((f) => f === '2'));
  assert.match(D.stimulasi.catatanBima, /1\.024/);
});

test('lipat: langkah tulis cocok dengan perkalian berulang di labelnya', () => {
  assertLangkah(D.lipat.langkah, 'tulis', 'lipat.langkah');
  D.lipat.langkah.forEach((s) => {
    assert.ok(
      s.label.includes(E.tulisPerkalianBerulang(s.a, s.n, { maks: 99 })),
      s.id + ': label memuat ' + E.tulisPerkalianBerulang(s.a, s.n, { maks: 99 })
    );
  });
  assert.ok(D.lipat.minLipat <= D.lipat.maxLipat);
  D.lipat.tanya.forEach((q) => assertGuided(q, 'lipat.' + q.id));
});

test('pola: tangga menjangkau pangkat nol & negatif, langkah baca valid', () => {
  D.pola.tangga.forEach((t) => {
    assert.ok(t.dari > 0 && t.sampai < 0, t.id + ': melewati pangkat 0');
    assert.ok(E.powerLadderEditable(t).length >= 3, t.id + ': ada isian');
    assert.ok(E.powerLadderEditable(t).includes(0), t.id + ': pangkat 0 diisi murid');
  });
  assertLangkah(D.pola.baca, 'baca', 'pola.baca');
  assert.ok(
    D.pola.baca.some((s) => s.n === 0),
    'ada pangkat nol'
  );
  assert.ok(
    D.pola.baca.some((s) => s.n < 0),
    'ada pangkat negatif'
  );
});

test('olah: pertanyaan penuntun, anatomi, dan pilah konsisten', () => {
  D.olah.konsep.forEach((q) => assertGuided(q, 'olah.' + q.id));
  const bagian = new Set();
  D.olah.anatomi.forEach((it) => {
    assert.ok(['basis', 'pangkat'].includes(it.target), it.id + '.target');
    bagian.add(it.target);
  });
  assert.equal(bagian.size, 2, 'anatomi menanyakan basis dan pangkat');
  assert.ok(
    D.olah.anatomi.some((it) => it.negLuar),
    'ada tanda di luar pangkat'
  );
  ['basis', 'pangkat', 'tanda'].forEach((p) => assert.ok(D.olah.umpanAnatomi[p], 'umpan ' + p));

  assertOptions(D.olah.opsiPilah, 'olah.opsiPilah', 2);
  const kategori = new Set();
  D.olah.pilah.forEach((it) => {
    const benar = E.cekBacaPangkat(it.bacaan, it.a, it.n, { negLuar: it.negLuar }).benar;
    assert.equal(it.correct, benar ? 'tepat' : 'keliru', it.id + ': kunci pilah');
    assert.ok(it.explanation, it.id + '.explanation');
    kategori.add(it.correct);
  });
  assert.equal(kategori.size, 2, 'kedua kategori terpakai');
});

test('verifikasi: uji tulis, uji baca, dan miskonsepsi', () => {
  assertLangkah(D.verifikasi.tulis, 'tulis', 'verifikasi.tulis');
  D.verifikasi.tulis.forEach((s) =>
    assert.ok(s.label.includes(E.bacaPangkat(s.a, s.n)), s.id + ': label = bacaan baku')
  );
  assertLangkah(D.verifikasi.baca, 'baca', 'verifikasi.baca');
  D.verifikasi.soal.forEach((q) => {
    assertOptions(q.options, 'verifikasi.' + q.id, 4);
    assert.ok(ids(q.options).includes(q.correct), q.id + ': correct ada di opsi');
    assert.ok(q.explanation, q.id + '.explanation');
  });
});

test('generalisasi: kunci ada di bank, bank punya pengecoh', () => {
  const G = D.generalisasi;
  assertOptions(G.bank, 'generalisasi.bank', G.kalimat.length + 2);
  const kunci = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(kunci).size, kunci.length, 'setiap potongan dipakai sekali');
  kunci.forEach((c) => assert.ok(ids(G.bank).includes(c), 'kunci ' + c + ' ada di bank'));
});

test('terapkan: kunci dihitung ulang dari metadata cek', () => {
  const S = D.terapkan.soal;
  assert.equal(new Set(ids(S)).size, S.length, 'id soal unik');
  S.forEach((s) => {
    const c = s.cek;
    const nm = 'terapkan.' + s.id;
    assert.ok(c, nm + '.cek');
    assert.ok(s.explanation && s.pertanyaan && s.konteks, nm + ': teks lengkap');
    const opts = { negLuar: c.negLuar };
    const ekspr = E.ekspresiPangkat(c.a, c.n, opts);
    if (s.type === 'choice') {
      assertOptions(s.options, nm + '.options', 4);
      const benar = s.options.find((o) => o.id === s.correct);
      assert.ok(benar, nm + ': correct ada di opsi');
      const lain = s.options.filter((o) => o.id !== s.correct);
      if (c.jenis === 'baca') {
        assert.ok((s.cerita + s.pertanyaan).includes(E.formatPangkat(c.a, c.n)), nm + ': memuat');
        assert.equal(benar.label, E.bacaPangkat(c.a, c.n, opts), nm + ': bacaan baku');
        lain.forEach((o) =>
          assert.notEqual(E.cekBacaPangkat(o.label, c.a, c.n, opts).kode, 'benar', nm + '/' + o.id)
        );
      } else if (c.jenis === 'tulis') {
        assert.ok(benar.label.includes(ekspr), nm + ': opsi benar memuat ' + ekspr);
        lain.forEach((o) => assert.notEqual(o.label, ekspr, nm + '/' + o.id + ' bukan kunci'));
      } else {
        assert.fail(nm + ': jenis cek pilihan tidak dikenal ' + c.jenis);
      }
    } else {
      assert.equal(s.type, 'input', nm + '.type');
      assert.ok((s.cerita + s.pertanyaan).includes(ekspr), nm + ': teks memuat ' + ekspr);
      const u = E.unsurPangkat(c.a, c.n);
      assert.equal(s.jawab, c.jenis === 'basis' ? u.basis : u.pangkat, nm + ': kunci isian');
    }
  });
  assert.ok(
    S.some((s) => s.type === 'input'),
    'ada soal isian'
  );
  assert.ok(
    S.some((s) => s.cek.n < 0),
    'ada pangkat negatif'
  );
  assert.ok(
    S.some((s) => s.cek.n === 0),
    'ada pangkat nol'
  );
});

test('refleksi: pertanyaan & opsi penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 3);
});
