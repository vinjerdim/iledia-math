'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-15.1/data.js (peluang kejadian
 * majemuk, Inquiry Learning): setiap kunci jawaban dihitung ulang dari
 * metadata `cek` dengan mencacah ruang sampel di shared/engine.js,
 * kategori rumus pada pemilahan cocok dengan sifat kejadiannya, fakta
 * hipotesis sesuai data, setiap daftar pilihan punya id unik dan cukup
 * opsi untuk diacak, dan setiap opsi pertanyaan penuntun punya umpan balik.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-15.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function dekat(a, b) {
  return Math.abs(a - b) < 1e-9;
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

/* Nilai kunci dari metadata cek. */
function nilaiCek(c) {
  if (c.ruang) return E.nilaiSifat(E.sifatKejadian(c.ruang, c.A, c.B), c.tanya);
  if (c.rumus === 'kali') return c.pA * c.pB;
  if (c.rumus === 'gabungan') return c.pA + c.pB - c.pIrisan;
  throw new Error('cek tidak dikenal');
}

function assertSteps(list, name) {
  assert.ok(list.length > 0, name + ' tidak kosong');
  list.forEach((s, i) => {
    const nm = name + '[' + i + ']';
    assert.ok(s.label, nm + '.label');
    assert.equal(typeof s.jawab, 'number', nm + '.jawab');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    assert.ok(s.temuan, nm + '.temuan');
    assert.ok(s.cek, nm + '.cek');
    assert.ok(dekat(nilaiCek(s.cek), s.jawab), nm + ': jawab cocok dengan cek');
    if (!Number.isInteger(s.jawab)) assert.ok(s.rational, nm + ': jawaban pecahan butuh rational');
  });
}

const TAHAP = [
  'orientasi',
  'masalah',
  'hipotesis',
  'dataDadu',
  'dataKoinKartu',
  'uji',
  'simpulan',
  'terapkan',
  'refleksi',
];

test('setiap tahap punya kepala tahap & catatan guru', () => {
  TAHAP.forEach((k) => {
    ['kicker', 'goal', 'syntax', 'guru', 'nextLabel'].forEach((f) =>
      assert.ok(D[k][f], k + '.' + f)
    );
  });
});

test('sintaks Inquiry Learning 1–6 terpetakan berurutan', () => {
  const urut = ['orientasi', 'masalah', 'hipotesis', 'dataDadu', 'uji', 'simpulan'];
  urut.forEach((k, i) => {
    assert.match(D[k].syntax, /^Inquiry Learning/, k);
    assert.match(D[k].syntax, new RegExp('Sintaks ' + (i + 1) + '$'), k);
  });
  assert.match(D.dataKoinKartu.syntax, /Sintaks 4$/);
});

test('orientasi & masalah: opsi cukup untuk diacak, umpan lengkap', () => {
  assertOptions(D.orientasi.opsi, 'orientasi.opsi', 4);
  D.orientasi.simulator.kejadian.forEach((k) => E.predikatKejadian(k.id));
  assertGuided(D.masalah, 'masalah');
});

test('hipotesis: fakta tiap dugaan sesuai data ruang sampel', () => {
  assertOptions(D.hipotesis.opsiDugaan, 'hipotesis.opsiDugaan', 3);
  assert.equal(new Set(ids(D.hipotesis.dugaan)).size, D.hipotesis.dugaan.length);
  D.hipotesis.dugaan.forEach((h) => {
    const s = E.sifatKejadian(h.cek.ruang, h.cek.A, h.cek.B);
    const berlaku =
      h.cek.rumus === 'jumlah'
        ? E.samaPecahan(s.pGabungan, E.tambahPecahan(s.pA, s.pB))
        : E.samaPecahan(s.pIrisan, E.kaliPecahan(s.pA, s.pB));
    assert.equal(h.fakta, berlaku ? 'ya' : 'tidak', h.id);
    assert.ok(h.bukti, h.id + '.bukti');
  });
  const fakta = new Set(D.hipotesis.dugaan.map((h) => h.fakta));
  assert.equal(fakta.size, 2, 'ada dugaan yang terbukti dan yang tidak');
});

test('data dadu: simulator valid, pertanyaan pengamatan & langkah isian', () => {
  const sim = D.dataDadu.simulator;
  sim.kejadian.forEach((k) => E.predikatKejadian(k.id));
  assert.ok(D.dataDadu.minimal > 0 && D.dataDadu.minimal <= sim.batas);
  D.dataDadu.amati.forEach((q) => assertGuided(q, 'dataDadu.amati.' + q.id));
  D.dataDadu.pasangan.forEach((p) => {
    E.gridRuangSampel(p.ruang);
    p.langkah.forEach((s) => {
      assert.equal(s.cek.ruang, p.ruang, p.id + ': ruang langkah sama');
      assert.equal(s.cek.A, p.A, p.id + ': A langkah sama');
      assert.equal(s.cek.B, p.B, p.id + ': B langkah sama');
    });
    assertSteps(p.langkah, 'dataDadu.' + p.id);
  });
  const [p1, p2] = D.dataDadu.pasangan.map((p) => E.sifatKejadian(p.ruang, p.A, p.B));
  assert.equal(p1.salingLepas, true, 'pasangan 1 saling lepas');
  assert.equal(p2.salingLepas, false, 'pasangan 2 tidak saling lepas');
});

test('data koin & kartu: bagian A saling bebas, B tidak lepas tapi bebas, C bebas vs tidak', () => {
  const { bagianA, bagianB, bagianC } = D.dataKoinKartu;
  [bagianA, bagianB].forEach((b, i) => {
    E.gridRuangSampel(b.ruang);
    b.langkah.forEach((s) => {
      assert.equal(s.cek.ruang, b.ruang);
      assert.equal(s.cek.A, b.A);
      assert.equal(s.cek.B, b.B);
    });
    assertSteps(b.langkah, 'bagian' + 'AB'[i]);
  });
  bagianA.simulator.kejadian.forEach((k) => E.predikatKejadian(k.id));
  const a = E.sifatKejadian(bagianA.ruang, bagianA.A, bagianA.B);
  assert.equal(a.salingBebas, true);
  const b = E.sifatKejadian(bagianB.ruang, bagianB.A, bagianB.B);
  assert.equal(b.salingLepas, false);
  assert.equal(b.salingBebas, true);
  [bagianC.simulatorKembali, bagianC.simulatorTanpa].forEach((sim) => {
    sim.kejadian.forEach((k) => E.predikatKejadian(k.id));
    assert.ok(bagianC.minimal <= sim.batas);
  });
  assertSteps(bagianC.langkah, 'bagianC');
  assertGuided(bagianC.tanya, 'bagianC.tanya');
});

test('uji: pertanyaan penuntun, pemilahan rumus sesuai sifat kejadian, langkah uji', () => {
  D.uji.tanya.forEach((q) => assertGuided(q, 'uji.' + q.id));
  assertOptions(D.uji.opsiPilah, 'uji.opsiPilah', 3);
  assert.equal(new Set(ids(D.uji.pilah)).size, D.uji.pilah.length);
  D.uji.pilah.forEach((it) => {
    assert.ok(ids(D.uji.opsiPilah).includes(it.correct), it.id + ': kategori valid');
    assert.ok(it.explanation, it.id + ': penjelasan');
    const s = E.sifatKejadian(it.cek.ruang, it.cek.A, it.cek.B);
    let harus;
    if (it.cek.tanya === 'pGabungan') harus = s.salingLepas ? 'jumlah' : 'jumlahKurang';
    else {
      assert.equal(s.salingBebas, true, it.id + ': irisan hanya untuk kejadian saling bebas');
      harus = 'kali';
    }
    assert.equal(it.correct, harus, it.id);
  });
  const kategori = new Set(D.uji.pilah.map((it) => it.correct));
  assert.equal(kategori.size, D.uji.opsiPilah.length, 'setiap kategori terpakai');
  assertSteps(D.uji.langkah, 'uji.langkah');
});

test('simpulan: setiap kalimat menunjuk bank, ada pengecoh, id unik', () => {
  const bank = ids(D.simpulan.bank);
  assert.equal(new Set(bank).size, bank.length);
  D.simpulan.kalimat.forEach((k) => assert.ok(bank.includes(k.correct), k.id));
  const benar = new Set(D.simpulan.kalimat.map((k) => k.correct));
  assert.equal(benar.size, D.simpulan.kalimat.length, 'kunci tidak dipakai ganda');
  assert.ok(bank.length > D.simpulan.kalimat.length, 'ada pengecoh');
  assert.equal(D.simpulan.rumus.length, 3);
});

test('terapkan: kunci setiap soal cocok dengan cek; opsi cukup & unik', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 6);
  assert.ok(soal.some((s) => s.type === 'input'));
  assert.ok(soal.some((s) => s.type === 'choice'));
  soal.forEach((s, i) => {
    const nm = 'terapkan[' + i + ']';
    assert.ok(s.cerita && s.pertanyaan, nm + ': teks');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    const kunci = nilaiCek(s.cek);
    assert.ok(kunci >= 0 && kunci <= 1, nm + ': peluang di [0, 1]');
    if (s.type === 'input') {
      assert.ok(dekat(s.jawab, kunci), nm + ': jawab cocok dengan cek');
      assert.ok(s.reveal, nm + '.reveal');
    } else {
      assertOptions(s.options, nm + '.options', 4);
      assert.ok(ids(s.options).includes(s.correct), nm + ': correct ada di options');
      const benar = s.options.find((o) => o.id === s.correct);
      assert.ok(dekat(benar.nilai, kunci), nm + ': nilai opsi benar cocok dengan cek');
      s.options
        .filter((o) => o.id !== s.correct)
        .forEach((o) => assert.ok(!dekat(o.nilai, kunci), nm + ': pengecoh ' + o.id + ' berbeda'));
      assert.ok(s.explanation, nm + '.explanation');
    }
  });
});

test('refleksi: pertanyaan & opsi penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 3);
});
