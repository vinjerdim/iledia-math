'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.4/data.js (membaca & menuliskan
 * bentuk akar serta mengaitkannya dengan pangkat pecahan, Discovery
 * Learning): kunci jawaban dihitung ulang dengan engine seksi 45
 * (formatAkar, formatPangkatPecahan, bacaAkar, bacaPangkatPecahan,
 * nilaiPangkatPecahan, diagnosaKonversi), setiap daftar pilihan punya
 * id & label unik dan cukup opsi untuk diacak, setiap opsi pertanyaan
 * penuntun punya umpan balik, dan tahap sesuai stageCount manifest.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.4/data.js']);
const D = E.DATA;

const TAHAP = [
  'stimulasi',
  'masalah',
  'unsur',
  'baca',
  'pola',
  'olah',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];

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

/* Teks kunci yang diharapkan dari metadata `cek`. */
function teksKunci(cek) {
  if (cek.jenis === 'pangkat') return E.formatPangkatPecahan(cek.r, cek.m || 1, cek.n);
  if (cek.jenis === 'akar') return E.formatAkar(1, cek.q, cek.a, cek.p);
  if (cek.jenis === 'tulis') return E.formatAkar(1, cek.n, cek.r, cek.m || 1);
  if (cek.jenis === 'baca') return E.bacaAkar(1, cek.n, cek.r, cek.m || 1);
  if (cek.jenis === 'bacaPangkat') return E.bacaPangkatPecahan(cek.a, cek.p, cek.q);
  if (cek.jenis === 'nilai') {
    const v = E.nilaiPangkatPecahan(cek.a, cek.p, cek.q);
    assert.ok(v.eksak, 'nilai ' + cek.a + '^(' + cek.p + '/' + cek.q + ') harus eksak');
    return E.formatNumber(v.nilai);
  }
  throw new Error('jenis cek tidak dikenal: ' + cek.jenis);
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
  if (q.cek) {
    const benar = q.opsi.find((o) => o.id === q.correct).label;
    assert.ok(benar.startsWith(teksKunci(q.cek)), name + ': opsi benar = kunci engine');
  }
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

/* Target papan tulis/konverter berada dalam rentang stepper engine. */
function assertTargetKonverter(t, name) {
  const R = E.ROOT_CONVERTER_RENTANG;
  ['a', 'm', 'n'].forEach((k) =>
    assert.ok(t[k] >= R[k].min && t[k] <= R[k].max, name + ': ' + k + ' dalam rentang')
  );
}

test('tahap: 11 tahap, sesuai stageCount manifest & tujuan belajar', () => {
  const man = require('../shared/pages-manifest.json')['fase-d/mpi-12.4'];
  assert.equal(man.stageCount, TAHAP.length);
  TAHAP.forEach((k) => assert.ok(D[k], 'DATA.' + k));
  assert.match(D.stimulasi.tp, /Membaca dan menuliskan bentuk akar/);
  assert.match(D.stimulasi.tp, /pangkat pecahan/);
});

test('setiap tahap punya kepala Discovery Learning', () => {
  TAHAP.filter((k) => k !== 'selesai').forEach((k) => {
    assert.ok(D[k].kicker, k + '.kicker');
    assert.ok(D[k].goal, k + '.goal');
    assert.ok(D[k].syntax, k + '.syntax');
    assert.ok(D[k].guru, k + '.guru');
  });
  ['stimulasi', 'masalah', 'unsur', 'baca', 'pola', 'olah', 'verifikasi', 'generalisasi'].forEach(
    (k, i) => {
      const sintaks = [1, 2, 3, 3, 3, 4, 5, 6][i];
      assert.match(D[k].syntax, new RegExp('Sintaks ' + sintaks), k + ': sintaks ' + sintaks);
    }
  );
});

test('stimulasi & masalah: opsi dapat diacak, dugaan punya kesimpulan', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  assertOptions(D.stimulasi.opsiBaca, 'stimulasi.opsiBaca', 4);
  D.stimulasi.opsi.forEach((o) =>
    assert.ok(D.verifikasi.kesimpulanDugaan[o.id], 'kesimpulanDugaan untuk ' + o.id)
  );
  assert.ok(ids(D.stimulasi.opsi).includes(D.stimulasi.dugaanTepat));
  const baku = D.stimulasi.opsiBaca.find((o) => o.id === D.stimulasi.dugaanBacaTepat);
  assert.equal(baku.label, E.bacaAkar(1, 3, 125));
  assert.ok(D.stimulasi.papan.some((b) => b.includes(E.formatPangkatPecahan(125, 1, 3))));
  assert.ok(D.stimulasi.papan.some((b) => b.includes('∛125')));
  assert.ok(D.stimulasi.kriteria.length >= 3);
  assertGuided(
    { opsi: D.masalah.opsi, correct: D.masalah.correct, umpan: D.masalah.umpan },
    'masalah'
  );
});

test('unsur: langkah isian = akar bulat, anatomi lengkap, pertanyaan penuntun', () => {
  const U = D.unsur;
  assert.ok(U.jejakMin.persegi >= 1 && U.jejakMin.kubus >= 1);
  assert.equal(new Set(ids(U.langkah)).size, U.langkah.length);
  U.langkah.forEach((s) => {
    assert.equal(s.jawab, E.akarBulat(s.r, s.n), s.id + ': jawab = akar bulat');
    assert.ok(s.label.includes(E.formatAkar(1, s.n, s.r)), s.id + ': label memuat akar');
    assert.ok(s.hints && s.hints.length, s.id + '.hints');
  });
  assert.ok(U.langkah.some((s) => s.n === 2));
  assert.ok(U.langkah.some((s) => s.n === 3));
  /* model anatomi memuat semua bagian yang ditanyakan */
  const c = U.anatomiContoh;
  assert.ok(c.n !== 2 && c.m > 1, 'contoh menampilkan indeks & pangkat radikan');
  assert.deepEqual([...U.anatomiBagian].sort(), ['indeks', 'pangkat', 'radikan', 'tanda']);
  U.anatomiBagian.forEach((b) => assert.ok(E.ANATOMI_AKAR[b], 'ANATOMI_AKAR.' + b));
  assert.ok(U.instruksiAnatomi.includes(E.formatAkar(1, c.n, c.r, c.m)));
  U.tanya.forEach((q) => assertGuided(q, 'unsur.' + q.id));
});

test('baca: pilihan bacaan dari engine, target tulis sesuai bacaan', () => {
  const B = D.baca;
  B.bacaan.forEach((q) => {
    assertGuided(q, 'baca.' + q.id);
    assert.ok(q.cek, q.id + '.cek');
    assert.ok(q.tanya.includes(E.formatAkar(1, q.cek.n, q.cek.r, q.cek.m)), q.id + ': notasi');
  });
  assert.ok(B.bacaan.some((q) => q.cek.n === 2));
  assert.ok(B.bacaan.some((q) => q.cek.m > 1));
  assertTargetKonverter(B.tulisAwal, 'baca.tulisAwal');
  assert.equal(new Set(ids(B.tulis)).size, B.tulis.length);
  B.tulis.forEach((t) => {
    assertTargetKonverter(t.target, t.id);
    assert.equal(t.teks, E.bacaAkar(1, t.target.n, t.target.a, t.target.m), t.id + ': bacaan');
    assert.ok(t.temuan.includes(E.formatAkar(1, t.target.n, t.target.a, t.target.m)), t.id);
    assert.equal(E.konverterCocok(B.tulisAwal, t.target), false, t.id + ': tidak langsung cocok');
  });
});

test('pola: detektif, nilai pangkat pecahan eksak & tabel ringkas', () => {
  const P = D.pola;
  P.detektif.forEach((q) => assertGuided(q, 'pola.' + q.id));
  assert.equal(new Set(ids(P.langkah)).size, P.langkah.length);
  P.langkah.forEach((s) => {
    const v = E.nilaiPangkatPecahan(s.cek.a, s.cek.p, s.cek.q);
    assert.ok(v.eksak, s.id + ': eksak');
    assert.equal(s.jawab, v.nilai, s.id + ': jawab = nilai');
    assert.ok(s.hints && s.hints.length, s.id + '.hints');
  });
  assert.ok(
    P.langkah.some((s) => s.cek.p > 1),
    'ada pembilang > 1'
  );
  assert.ok(P.tabel.length >= 4);
  P.tanya.forEach((q) => assertGuided(q, 'pola.' + q.id));
  assert.ok(P.tanya.some((q) => q.cek && q.cek.jenis === 'bacaPangkat'));
});

test('olah: konsep, misi konverter, dan pilah benar menurut engine', () => {
  const O = D.olah;
  O.konsep.forEach((q) => assertGuided(q, 'olah.' + q.id));
  assertTargetKonverter(O.konverterAwal, 'olah.konverterAwal');
  assert.equal(new Set(ids(O.misi)).size, O.misi.length);
  O.misi.forEach((m) => {
    const t = m.target;
    assertTargetKonverter(t, m.id);
    assert.ok(
      m.teks.includes(E.formatAkar(1, t.n, t.a, t.m)) ||
        m.teks.includes(E.formatPangkatPecahan(t.a, t.m, t.n)),
      m.id + ': teks memuat target'
    );
  });
  assertOptions(O.opsiPilah, 'olah.opsiPilah', 2);
  assert.equal(new Set(ids(O.pilah)).size, O.pilah.length);
  O.pilah.forEach((it) => {
    const c = it.cek;
    let tepat;
    let teks;
    if (c.jenis === 'konversi') {
      tepat = E.diagnosaKonversi(E.akarKePangkat(c.n, c.r, c.m), c.pangkat) === 'benar';
      teks =
        E.formatAkar(1, c.n, c.r, c.m) +
        ' = ' +
        E.formatPangkatPecahan(c.pangkat.a, c.pangkat.p, c.pangkat.q);
    } else if (c.jenis === 'baca') {
      tepat = c.bacaan === E.bacaAkar(1, c.n, c.r, c.m);
      teks = E.formatAkar(1, c.n, c.r, c.m) + ' dibaca “' + c.bacaan + '”';
    } else if (c.jenis === 'bacaPangkat') {
      tepat = c.bacaan === E.bacaPangkatPecahan(c.a, c.p, c.q);
      teks = E.formatPangkatPecahan(c.a, c.p, c.q) + ' dibaca “' + c.bacaan + '”';
    } else if (c.jenis === 'tulis') {
      tepat = c.tulisan === E.formatAkar(1, c.n, c.r, c.m);
      teks = '“' + E.bacaAkar(1, c.n, c.r, c.m) + '” ditulis ' + c.tulisan;
    } else {
      throw new Error(it.id + ': jenis cek tidak dikenal');
    }
    assert.equal(it.correct, tepat ? 'tepat' : 'keliru', it.id + ': kunci pilah');
    assert.equal(it.teks, teks, it.id + ': teks sesuai cek');
    assert.ok(it.explanation, it.id + '.explanation');
  });
  assert.equal(new Set(O.pilah.map((it) => it.correct)).size, 2, 'pilah memuat tepat & keliru');
});

test('verifikasi: soal pilihan dengan kunci engine & pengecoh unik', () => {
  const V = D.verifikasi;
  assert.equal(new Set(ids(V.soal)).size, V.soal.length);
  V.soal.forEach((q) => {
    assertSoalPilihan(q, 'verifikasi.' + q.id);
    assert.ok(q.explanation, q.id + '.explanation');
  });
  const jenis = new Set(V.soal.map((q) => q.cek.jenis));
  ['baca', 'tulis', 'pangkat', 'akar', 'bacaPangkat'].forEach((j) =>
    assert.ok(jenis.has(j), 'ada soal ' + j)
  );
  assert.ok(V.kesimpulanBaca.benar && V.kesimpulanBaca.salah);
});

test('generalisasi: kalimat menunjuk bank, setiap potongan benar dipakai sekali', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  assert.equal(new Set(G.bank.map((b) => b.teks)).size, bank.length);
  const dipakai = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(dipakai).size, dipakai.length);
  dipakai.forEach((c) => assert.ok(bank.includes(c), 'bank memuat ' + c));
  assert.ok(bank.length > dipakai.length, 'ada pengecoh');
  /* contoh bacaan pada kalimat 2 sesuai engine */
  const c2 = G.bank.find((b) => b.id === 'c2').teks;
  assert.equal(c2, '“' + E.bacaAkar(1, 5, 3, 4) + '”');
});

test('terapkan: 8 soal, kunci isian & pilihan dihitung ulang', () => {
  const S = D.terapkan.soal;
  assert.equal(S.length, 8);
  assert.equal(new Set(ids(S)).size, 8);
  S.forEach((q) => {
    assert.ok(q.konteks && q.cerita && q.pertanyaan && q.explanation, q.id + ': teks lengkap');
    assert.ok(q.hints && q.hints.length, q.id + '.hints');
    if (q.type === 'input') {
      assert.ok(q.cek, q.id + '.cek');
      const v = E.nilaiPangkatPecahan(q.cek.a, q.cek.p, q.cek.q);
      if (q.cek.jenis === 'nilai') {
        assert.ok(v.eksak);
        assert.equal(q.jawab, v.nilai, q.id + ': jawab');
      } else if (q.cek.jenis === 'hampiran') {
        assert.ok(!v.eksak, q.id + ': memang tidak eksak');
        assert.ok(Math.abs(q.jawab - v.nilai) <= q.toleransi, q.id + ': hampiran');
        assert.ok(q.toleransi < 0.01, q.id + ': toleransi dua desimal');
      } else {
        throw new Error(q.id + ': jenis cek isian tidak dikenal');
      }
    } else {
      assertSoalPilihan(q, 'terapkan.' + q.id);
    }
  });
  assert.ok(S.some((q) => q.type === 'input'));
  assert.ok(S.some((q) => q.type !== 'input'));
});

test('refleksi & selesai: opsi penilaian diri, pertanyaan, capaian', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assert.ok(D.selesai.capaian.length >= 3);
  assert.equal(D.selesai.trio.length, 3);
});
