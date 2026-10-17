'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-13.1/data.js (perkalian & pembagian
 * bilangan berpangkat berbasis sama pada bentuk aljabar, Discovery
 * Learning): setiap tahap punya kepala DL; setiap daftar pilihan cukup
 * opsi untuk diacak dengan id & label unik dan umpan balik tiap opsi;
 * kunci langkah isian dihitung ulang secara numerik dengan Math.pow
 * (bebas dari sifat yang sedang dipelajari); soal uji terap hanya
 * memuat perkalian/pembagian suku berbasis sama dengan eksponen bulat
 * positif dan kuncinya dicek dengan evaluasi numerik.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-13.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
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

/* Nilai numerik suku { koef, pangkat } untuk nilai variabel `vals`. */
function nilaiSuku(s, vals) {
  return Object.keys(s.pangkat).reduce((h, v) => h * Math.pow(vals[v], s.pangkat[v]), s.koef);
}

function nilaiEkspresi(e, vals) {
  if (e.op === 'kali') return nilaiEkspresi(e.a, vals) * nilaiEkspresi(e.b, vals);
  if (e.op === 'bagi') return nilaiEkspresi(e.a, vals) / nilaiEkspresi(e.b, vals);
  return nilaiSuku(e, vals);
}

function daun(e) {
  return e.op ? daun(e.a).concat(daun(e.b)) : [e];
}

function dekat(a, b) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

const NILAI_UJI = [
  { x: 2, y: 3, a: 2, b: 3, p: 2, q: 3, m: 2, n: 3 },
  { x: 3, y: 2, a: 5, b: 2, p: 3, q: 5, m: 3, n: 2 },
];

/* Kunci langkah isian dari metadata cek, dihitung dengan Math.pow. */
function kunciCek(c) {
  if (c.jenis === 'faktor') {
    /* banyak faktor basis pada aᵐ × aⁿ atau aᵐ : aⁿ (m > n). */
    const nilai =
      c.op === 'kali' ? Math.pow(2, c.m) * Math.pow(2, c.n) : Math.pow(2, c.m) / Math.pow(2, c.n);
    return Math.round(Math.log2(nilai));
  }
  if (c.jenis === 'koef') return c.op === 'kali' ? c.a.koef * c.b.koef : c.a.koef / c.b.koef;
  if (c.jenis === 'eksponen') {
    /* eksponen variabel v pada hasil, dibaca dari rasio nilai pada v = 2 dan v = 1. */
    const satu = Object.fromEntries(Object.keys(NILAI_UJI[0]).map((k) => [k, 1]));
    const dua = Object.assign({}, satu, { [c.v]: 2 });
    const e = { op: c.op, a: c.a, b: c.b };
    return Math.round(Math.log2(nilaiEkspresi(e, dua) / nilaiEkspresi(e, satu)));
  }
  throw new Error('jenis cek tak dikenal: ' + c.jenis);
}

function assertLangkah(list, name) {
  assert.ok(Array.isArray(list) && list.length, name + ' tidak kosong');
  list.forEach((s, i) => {
    const nm = name + '[' + i + ']';
    assert.ok(s.label && s.temuan, nm + ': label & temuan');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    assert.ok(s.cek, nm + '.cek');
    assert.equal(s.jawab, kunciCek(s.cek), nm + ': kunci = ' + kunciCek(s.cek));
  });
}

test('setiap tahap punya kepala Discovery Learning', () => {
  [
    'stimulasi',
    'masalah',
    'kumpul',
    'olah',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    ['kicker', 'goal', 'syntax', 'guru'].forEach((f) => assert.ok(D[k][f], k + '.' + f));
  });
  assert.equal(D.stimulasi.tpJudul, 'Tujuan belajar hari ini');
  assert.match(D.stimulasi.tp, /perkalian dan pembagian bilangan berpangkat berbasis sama/);
  assert.match(D.stimulasi.tp, /bentuk aljabar berpangkat/);
});

test('stimulasi: dugaan 3x² × 2x³ — opsi acak-able, satu kunci sesuai hitungan', () => {
  const S = D.stimulasi;
  assertOptions(S.opsi, 'stimulasi.opsi');
  const kunci = E.formatMonomial(
    E.hitungEkspresiMonomial({ op: 'kali', a: S.soal.a, b: S.soal.b })
  );
  const benar = S.opsi.filter((o) => o.label === kunci);
  assert.equal(benar.length, 1, 'tepat satu opsi = ' + kunci);
  assert.equal(benar[0].id, D.verifikasi.dugaanBenar);
});

test('masalah: pertanyaan inti dengan umpan tiap opsi', () => {
  assertGuided(D.masalah, 'masalah');
});

test('kumpul: ubin faktor, tabel pola, dan pilah konsisten', () => {
  const K = D.kumpul;
  assertLangkah(K.ubin, 'kumpul.ubin');
  K.ubin.forEach((s) => {
    assert.equal(s.visual.jenis, s.cek.op);
    assert.equal(s.visual.m, s.cek.m);
    assert.equal(s.visual.n, s.cek.n);
    if (s.cek.op === 'bagi') assert.ok(s.cek.m > s.cek.n, 'pembagian m > n');
  });
  assert.deepEqual(Array.from(K.pola.map((p) => p.operasi)), ['kali', 'bagi']);
  K.pola.forEach((p) => {
    assert.ok(p.baris.length >= 4, p.id + ': minimal 4 baris');
    p.baris.forEach((b) => {
      const k = E.polaEksponenKunci(p.operasi, b.a, b.m, b.n);
      assert.ok(dekat(k.nilai, Math.pow(b.a, k.k)), p.id + ': nilai = a^k');
      assert.ok(k.nilai <= 1000, p.id + ': nilai cukup kecil untuk dihitung murid');
      if (p.operasi === 'bagi') assert.ok(b.m > b.n, 'pembagian m > n');
      const kamus = K.kamus.find((t) => t.a === b.a);
      assert.ok(kamus && k.k <= kamus.sampai, 'kamus memuat ' + b.a + '^' + k.k);
      assert.ok(b.m <= kamus.sampai && b.n <= kamus.sampai, 'kamus memuat faktor');
    });
    assert.ok(p.temuan && p.hints.length, p.id + ': temuan & hints');
  });
  assertOptions(K.opsiPilah, 'kumpul.opsiPilah', 2);
  assert.equal(new Set(K.pilah.map((p) => p.correct)).size, 2, 'kedua kategori terpakai');
  K.pilah.forEach((p) => assert.ok(ids(K.opsiPilah).includes(p.correct) && p.explanation));
});

test('olah: pertanyaan penuntun & langkah koefisien/eksponen', () => {
  const O = D.olah;
  assert.ok(O.pertanyaan.length >= 3);
  O.pertanyaan.forEach((q) => assertGuided(q, 'olah.' + q.id));
  assertLangkah(O.langkah, 'olah.langkah');
  O.langkah.forEach((s) => {
    if (s.visualMono) {
      assert.equal(s.visualMono.jenis, s.cek.op);
      assert.deepEqual(s.visualMono.a, s.cek.a);
      assert.deepEqual(s.visualMono.b, s.cek.b);
    }
  });
  assert.ok(O.rumus.length >= 2);
});

test('verifikasi: lab sifat, uji dugaan, dan pilah miskonsepsi', () => {
  const V = D.verifikasi;
  V.lab.sifat.forEach((s) => assert.ok(E.SIFAT_EKSPONEN[s], 'sifat ' + s));
  V.lab.syarat.forEach((s) => assert.ok(V.lab.sifat.includes(s.sifat)));
  assert.ok(
    V.lab.syarat.some((s) => s.sangkal),
    'ada dugaan untuk disangkal'
  );
  assertLangkah(V.uji, 'verifikasi.uji');
  V.uji.forEach((s) => {
    assert.deepEqual(s.cek.a, D.stimulasi.soal.a);
    assert.deepEqual(s.cek.b, D.stimulasi.soal.b);
  });
  assertOptions(V.opsiPilah, 'verifikasi.opsiPilah', 2);
  assert.equal(new Set(V.pilah.map((p) => p.correct)).size, 2);
  V.pilah.forEach((p) => {
    assert.ok(p.explanation, p.id + '.explanation');
    if (!p.cek) return;
    /* klaim dibandingkan dengan nilai numerik kedua ruas. */
    const benar = NILAI_UJI.every((vals) =>
      dekat(
        nilaiEkspresi({ op: p.cek.op, a: p.cek.a, b: p.cek.b }, vals),
        nilaiSuku(p.cek.klaim, vals)
      )
    );
    assert.equal(p.correct, benar ? 'benar' : 'salah', p.id + ': kunci pilah');
  });
  assert.ok(V.pilah.filter((p) => p.cek).length >= 4, 'minimal 4 butir dicek numerik');
});

test('generalisasi: kunci ada di bank, bank punya pengecoh', () => {
  const G = D.generalisasi;
  assertOptions(G.bank, 'generalisasi.bank', G.kalimat.length + 2);
  const kunci = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(kunci).size, kunci.length, 'setiap potongan dipakai sekali');
  kunci.forEach((c) => assert.ok(ids(G.bank).includes(c), 'kunci ' + c + ' ada di bank'));
});

test('terapkan: soal berbasis sama, eksponen positif, kunci = evaluasi numerik', () => {
  const S = D.terapkan.soal;
  assert.ok(S.length >= 6);
  assert.equal(new Set(ids(S)).size, S.length, 'id soal unik');
  assert.ok(S.some((s) => s.tipe === 'pilih') && S.some((s) => s.tipe === 'isian'));
  assert.ok(
    S.some((s) => s.cerita),
    'ada soal kontekstual'
  );
  S.forEach((s) => {
    const nm = 'terapkan.' + s.id;
    assert.ok(['isian', 'pilih'].includes(s.tipe), nm + '.tipe');
    assert.ok(['kali', 'bagi'].includes(s.ekspresi.op), nm + ': kali/bagi');
    assert.ok(s.hints.length, nm + '.hints');
    const leaves = daun(s.ekspresi);
    const varsSoal = new Set(leaves.flatMap((l) => Object.keys(l.pangkat)));
    assert.deepEqual(
      [...varsSoal].sort(),
      Array.from(s.vars).sort(),
      nm + ': vars = variabel soal'
    );
    leaves.forEach((l) => {
      assert.ok(Number.isInteger(l.koef) && l.koef > 0, nm + ': koefisien bulat positif');
      Object.values(l.pangkat).forEach((n) =>
        assert.ok(Number.isInteger(n) && n > 0, nm + ': eksponen positif')
      );
    });
    /* basis sama: setiap variabel pembagi juga ada di yang dibagi. */
    const kunci = E.hitungEkspresiMonomial(s.ekspresi);
    assert.ok(
      E.samaPecahan(kunci.koef, E.pecahan(kunci.koef.num, 1)),
      nm + ': koefisien hasil bulat'
    );
    Object.values(kunci.pangkat).forEach((n) => assert.ok(n > 0, nm + ': eksponen hasil positif'));
    NILAI_UJI.forEach((vals) =>
      assert.ok(
        dekat(E.nilaiPecahan(E.nilaiMonomial(kunci, vals)), nilaiEkspresi(s.ekspresi, vals)),
        nm + ': kunci cocok dengan evaluasi numerik'
      )
    );
    if (s.tipe === 'pilih') {
      assert.ok(!s.ekspresi.a.op && !s.ekspresi.b.op, nm + ': opsi dari satu operasi');
      const o = E.opsiKaliBagiMonomial(s.ekspresi.op, s.ekspresi.a, s.ekspresi.b);
      assert.equal(o.opsi.length, 4, nm + ': empat opsi');
    }
    if (s.ekspresi.a.op || s.ekspresi.b.op) {
      assert.ok(Array.isArray(s.pembahasan) && s.pembahasan.length >= 2, nm + ': pembahasan');
    }
  });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.selesai.judul && D.selesai.capaian.length >= 3);
});
