'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.2/data.js (bilangan berpangkat
 * bulat negatif & nol, Discovery Learning): kunci jawaban dihitung
 * ulang dengan engine seksi 30 (bacaPangkat, ekspresiPangkat,
 * formatPangkat, cekBacaPangkat, cekTulisPangkat, pangkatBulat,
 * formatPecahan, unsurPangkat), setiap daftar pilihan punya id unik
 * dan cukup opsi untuk diacak, setiap opsi pertanyaan penuntun punya
 * umpan balik, dan teks soal memuat bilangan berpangkat yang
 * ditanyakan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.2/data.js']);
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

/* Berbeda dari mpi-12.1: n boleh 0 atau negatif di seluruh modul ini. */
function assertLangkah(list, jenis, name) {
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const nm = name + '.' + s.id;
    assert.equal(s.jenis, jenis, nm + '.jenis');
    assert.ok(Number.isInteger(s.a) && Number.isInteger(s.n), nm + ': a, n bulat');
    assert.notEqual(s.a, 0, nm + ': basis tidak boleh 0');
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

test('tahap: seluruh tahap punya kepala Discovery Learning', () => {
  [
    'stimulasi',
    'masalah',
    'tangga',
    'makna',
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

test('manifest: stageCount sesuai jumlah tahap', () => {
  const man = require('../shared/pages-manifest.json')['fase-d/mpi-12.2'];
  const STAGES = [
    'stimulasi',
    'masalah',
    'tangga',
    'makna',
    'olah',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
    'selesai',
  ];
  assert.equal(man.stageCount, STAGES.length);
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

test('tangga: tiga tangga basis ≠ 0, diteruskan sampai pangkat negatif', () => {
  assert.ok(D.tangga.tangga.length >= 3, 'ada minimal 3 tangga (basis berbeda)');
  const basisSet = new Set();
  D.tangga.tangga.forEach((t) => {
    basisSet.add(t.a);
    assert.notEqual(t.a, 0, t.id + ': basis tidak boleh 0');
    assert.ok(t.dari > t.sampai, t.id + ': dari > sampai');
    assert.ok(t.sampai < 0, t.id + ': diteruskan sampai pangkat negatif');
    assert.ok(t.dari > 0, t.id + ': dimulai dari pangkat positif');
    const editable = E.powerLadderEditable(t);
    assert.ok(editable.length >= 1, t.id + ': ada isian');
    assert.ok(
      editable.some((n) => n === 0),
      t.id + ': pangkat 0 termasuk isian'
    );
    assert.ok(
      editable.some((n) => n < 0),
      t.id + ': pangkat negatif termasuk isian'
    );
    (t.diketahui || []).forEach((n) => assert.ok(n > 0, t.id + ': diketahui bulat positif'));
  });
  assert.equal(basisSet.size, D.tangga.tangga.length, 'setiap tangga basis berbeda');
});

test('makna: langkah tulis/baca valid, anatomi mencakup basis, pangkat & tanda', () => {
  assertLangkah(D.makna.langkah, 'tulis', 'makna.langkah');
  assertLangkah(D.makna.baca, 'baca', 'makna.baca');
  assert.ok(
    D.makna.langkah.some((s) => s.n === 0),
    'ada langkah tulis pangkat 0'
  );
  assert.ok(
    D.makna.langkah.some((s) => s.n < 0),
    'ada langkah tulis pangkat negatif'
  );
  assert.ok(
    D.makna.baca.some((s) => s.n === 0),
    'ada langkah baca pangkat 0'
  );
  assert.ok(
    D.makna.baca.some((s) => s.n < 0),
    'ada langkah baca pangkat negatif'
  );

  const bagian = new Set();
  D.makna.anatomi.forEach((it) => {
    assert.ok(['basis', 'pangkat'].includes(it.target), it.id + '.target');
    assert.notEqual(it.a, 0, it.id + ': basis tidak boleh 0');
    bagian.add(it.target);
  });
  assert.equal(bagian.size, 2, 'anatomi menanyakan basis dan pangkat');
  assert.ok(
    D.makna.anatomi.some((it) => it.negLuar),
    'ada tanda di luar pangkat'
  );
  ['basis', 'pangkat', 'tanda'].forEach((p) => assert.ok(D.makna.umpanAnatomi[p], 'umpan ' + p));

  [D.tabelLarutan, D.tabelBakteri].forEach(() => {});
  assert.ok(
    D.makna.tabelLarutan.some((r) => r.n === 0),
    'tabel larutan memuat pangkat 0'
  );
  assert.ok(
    D.makna.tabelLarutan.some((r) => r.n < 0),
    'tabel larutan memuat pangkat negatif'
  );
  assert.ok(
    D.makna.tabelBakteri.some((r) => r.n === 0),
    'tabel bakteri memuat pangkat 0'
  );
  assert.ok(
    D.makna.tabelBakteri.some((r) => r.n < 0),
    'tabel bakteri memuat pangkat negatif'
  );
});

test('olah: pertanyaan penuntun, anatomi, dan pilah konsisten', () => {
  D.olah.konsep.forEach((q) => assertGuided(q, 'olah.' + q.id));
  const bagian = new Set();
  D.olah.anatomi.forEach((it) => {
    assert.ok(['basis', 'pangkat'].includes(it.target), it.id + '.target');
    assert.notEqual(it.a, 0, it.id + ': basis tidak boleh 0');
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
  assert.ok(
    D.olah.pilah.some((it) => it.n === 0),
    'ada butir pilah pangkat 0'
  );
  assert.ok(
    D.olah.pilah.some((it) => it.n < 0),
    'ada butir pilah pangkat negatif'
  );
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

    if (s.type === 'input') {
      if (c.jenis === 'nilai') {
        const frac = E.pangkatBulat(c.a, c.n);
        const nilai = frac.num / frac.den;
        assert.ok(Math.abs(s.jawab - nilai) < 1e-9, nm + ': jawab = ' + E.formatPecahan(frac));
      } else {
        const opts = { negLuar: c.negLuar };
        const ekspr = E.ekspresiPangkat(c.a, c.n, opts);
        assert.ok((s.cerita + s.pertanyaan).includes(ekspr), nm + ': teks memuat ' + ekspr);
        const u = E.unsurPangkat(c.a, c.n);
        assert.equal(s.jawab, c.jenis === 'basis' ? u.basis : u.pangkat, nm + ': kunci isian');
      }
      return;
    }

    assert.equal(s.type, 'choice', nm + '.type');
    const opts = { negLuar: c.negLuar };
    const ekspr = E.ekspresiPangkat(c.a, c.n, opts);
    assertOptions(s.options, nm + '.options', 4);
    const benar = s.options.find((o) => o.id === s.correct);
    assert.ok(benar, nm + ': correct ada di opsi');
    const lain = s.options.filter((o) => o.id !== s.correct);
    if (c.jenis === 'baca') {
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
  });
  assert.ok(
    S.some((s) => s.type === 'input'),
    'ada soal isian'
  );
  assert.ok(
    S.some((s) => s.cek.n === 0),
    'ada soal berpangkat 0'
  );
  assert.ok(
    S.some((s) => s.cek.n < 0),
    'ada soal berpangkat negatif'
  );
});
