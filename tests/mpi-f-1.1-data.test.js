'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-1.1/data.js (konsep barisan
 * aritmetika & beda, Inquiry Learning): kunci pemilahan cocok dengan
 * jenisDeret, kunci beda cocok dengan bedaBarisan/bedaDariDuaSuku,
 * barisan data selisih memuat kasus naik/turun/desimal/bukan, setiap
 * daftar pilihan punya id unik dan cukup opsi untuk diacak, setiap opsi
 * pertanyaan penuntun punya umpan balik, manifest cocok, dan app.js
 * mengacak setiap daftar pilihan jawaban murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-1.1/data.js']);
const D = E.DATA;
const tanpaSpasi = (s) => s.replace(/\s+/g, '').replace(/,\)/g, ')');
const APP = tanpaSpasi(fs.readFileSync(path.join(ROOT, 'fase-f/mpi-1.1/app.js'), 'utf8'));

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + ': opsi ' + o.id + ' tanpa label'));
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': kunci tidak ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan balik untuk ' + o.id));
}

test('tahap cocok dengan manifest dan sintaks Inquiry Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-f/mpi-1.1'];
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Inquiry Learning/);
  assert.deepEqual(Array.from(ids(D.tahap)), [
    'orientasi',
    'masalah',
    'hipotesis',
    'dataSelisih',
    'dataLab',
    'uji',
    'simpulan',
    'terapkan',
    'refleksi',
    'selesai',
  ]);
  ['orientasi', 'masalah', 'hipotesis', 'dataSelisih', 'dataLab', 'uji', 'simpulan'].forEach((k) =>
    assert.match(D[k].syntax, /^Inquiry Learning · Sintaks [1-6]$/, k)
  );
});

test('orientasi: barisan port & kuota aritmetika, pengguna bukan', () => {
  const byId = Object.fromEntries(D.orientasi.barisan.map((b) => [b.id, b.terms]));
  assert.equal(E.bedaBarisan(byId.port), 5);
  assert.equal(E.bedaBarisan(byId.kuota), -8);
  assert.equal(E.bedaBarisan(byId.pengguna), null);
  assertOptions(D.orientasi.opsi, 'orientasi.opsi');
});

test('masalah & hipotesis: opsi lengkap, evaluasi untuk setiap strategi', () => {
  assertGuided(D.masalah.pertanyaan, 'masalah.pertanyaan');
  assertOptions(D.hipotesis.strategi, 'hipotesis.strategi');
  D.hipotesis.strategi.forEach((s) =>
    assert.ok(D.hipotesis.evaluasi[s.id], 'evaluasi untuk strategi ' + s.id)
  );
  const byId = Object.fromEntries(D.orientasi.barisan.map((b) => [b.id, b.terms]));
  D.hipotesis.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan ' + q.id);
    const label = q.opsi.find((o) => o.id === q.benar).label;
    assert.equal(label, E.fmtSuku(E.bedaBarisan(byId[q.barisan])), 'kunci dugaan ' + q.id);
  });
});

test('data selisih: memuat barisan naik, turun, desimal, dan bukan aritmetika', () => {
  const beda = D.dataSelisih.barisan.map((b) => E.bedaBarisan(b.terms));
  assert.ok(
    beda.some((b) => b !== null && b > 0 && Number.isInteger(b)),
    'naik'
  );
  assert.ok(
    beda.some((b) => b !== null && b < 0 && Number.isInteger(b)),
    'turun'
  );
  assert.ok(
    beda.some((b) => b !== null && !Number.isInteger(b)),
    'desimal'
  );
  assert.ok(
    beda.some((b) => b === null),
    'bukan aritmetika'
  );
  D.dataSelisih.temuan.forEach((q) => assertGuided(q, 'dataSelisih.temuan ' + q.id));
});

test('lab barisan: nilai awal dalam rentang stepper dan pertanyaan temuan lengkap', () => {
  const L = D.dataLab;
  assert.ok(L.awal.a >= L.rangeA.min && L.awal.a <= L.rangeA.max);
  assert.ok(L.awal.b >= L.rangeB.min && L.awal.b <= L.rangeB.max);
  assert.ok(L.rangeB.min < 0 && L.rangeB.max > 0, 'b negatif, nol, dan positif dapat dicoba');
  L.temuan.forEach((q) => assertGuided(q, 'dataLab.temuan ' + q.id));
});

test('uji: kunci pemilahan cocok dengan jenisDeret', () => {
  const U = D.uji;
  assertOptions(U.opsiPilah, 'opsiPilah', 2);
  assertOptions(U.keputusanOpsi, 'keputusanOpsi', 3);
  assert.ok(U.pilah.length >= 6);
  assert.equal(new Set(ids(U.pilah)).size, U.pilah.length);
  U.pilah.forEach((p) => {
    const jenis = E.jenisDeret(p.terms);
    const harus = jenis === 'aritmetika' || jenis === 'konstan' ? 'aritmetika' : 'bukan';
    assert.equal(p.correct, harus, 'pilah ' + p.id);
    assert.ok(p.explanation, 'penjelasan pilah ' + p.id);
  });
  assert.ok(
    U.pilah.some((p) => E.bedaBarisan(p.terms) === 0),
    'ada barisan konstan'
  );
  assert.ok(
    U.pilah.some((p) => {
      const s = E.selisihBerurutan(p.terms);
      return p.correct === 'bukan' && s.every((d) => d > 0);
    }),
    'ada pengecoh "naik tetapi bukan aritmetika"'
  );
});

test('uji: kunci beda cocok dengan bedaBarisan', () => {
  D.uji.beda.forEach((b) => {
    assert.equal(b.jawab, E.bedaBarisan(b.terms), 'beda ' + b.id);
    assert.ok(b.hints.length >= 1);
    if (!Number.isInteger(b.jawab)) assert.equal(b.desimal, true, b.id + ' harus isian desimal');
    if (b.jawab < 0) assert.equal(b.allowNegative, true, b.id + ' harus menerima negatif');
  });
  assertOptions(D.uji.opsiPernyataan, 'opsiPernyataan', 2);
  D.uji.pernyataan.forEach((p) => {
    assert.ok(ids(D.uji.opsiPernyataan).includes(p.correct));
    assert.ok(p.explanation);
  });
  assert.equal(E.bedaBarisan([20, 17, 14, 11]), -3, 'pernyataan p1');
});

test('simpulan: kunci ada di bank, unik, dan ada pengecoh', () => {
  const S = D.simpulan;
  assertOptions(S.bank, 'simpulan.bank', 6);
  const kunci = S.kalimat.map((k) => k.correct);
  assert.equal(new Set(kunci).size, kunci.length);
  kunci.forEach((k) => assert.ok(ids(S.bank).includes(k), 'kunci ' + k));
  assert.ok(S.bank.length > S.kalimat.length, 'harus ada pengecoh');
});

test('uji terap: kunci jawaban dihitung ulang dari metadata cek', () => {
  D.terapkan.soal.forEach((s, i) => {
    const c = s.cek;
    assert.ok(c, 'soal ' + i + ' butuh cek');
    if (s.type === 'choice') {
      assertOptions(s.options, 'terapkan[' + i + ']');
      assert.ok(ids(s.options).includes(s.correct));
      if (c.beda !== undefined) assert.equal(E.bedaBarisan(c.terms), c.beda);
      if (c.pilihan) {
        Object.keys(c.pilihan).forEach((id) => {
          const aritmetika = E.bedaBarisan(c.pilihan[id]) !== null;
          assert.equal(!aritmetika, id === s.correct, 'pilihan ' + id);
        });
      }
      if (c.a !== undefined) {
        assert.deepEqual(
          Array.from(E.daftarSuku('aritmetika', c.a, c.b, c.n)),
          Array.from(c.terms)
        );
        const benar = s.options.find((o) => o.id === s.correct).label;
        assert.equal(benar, c.terms.map((t) => E.fmtSuku(t)).join(', '));
      }
    } else {
      assert.ok(Number.isInteger(s.jawab), 'isian harus bilangan bulat');
      const hitung = c.terms ? E.bedaBarisan(c.terms) : E.bedaDariDuaSuku(c.m, c.um, c.n, c.un);
      assert.equal(s.jawab, hitung, 'soal ' + i);
      assert.ok(s.reveal && s.explanation);
    }
  });
});

test('refleksi: opsi penilaian diri cukup untuk diacak', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
});

test('app.js mengacak setiap daftar pilihan jawaban murid', () => {
  [
    "ensureShuffledOrder(State,'orientasiOrder',DATA.orientasi.opsi)",
    'siapkanUrutan(State.masalahOrders,[DATA.masalah.pertanyaan])',
    "ensureShuffledOrder(State,'strategiOrder',DATA.hipotesis.strategi)",
    'siapkanUrutan(State.dugaanOrders,DATA.hipotesis.dugaan)',
    'siapkanUrutan(State.temuanSelisihOrders,DATA.dataSelisih.temuan)',
    'siapkanUrutan(State.temuanLabOrders,DATA.dataLab.temuan)',
    "ensureShuffledOrder(State,'keputusanOrder',DATA.uji.keputusanOpsi)",
    "ensureSortStates(State,'pilahStates','pilahOrder',DATA.uji.pilah,DATA.uji.opsiPilah)",
    "ensureSortStates(State,'pernyataanStates','pernyataanOrder',DATA.uji.pernyataan,DATA.uji.opsiPernyataan)",
    "ensureShuffledOrder(State,'bankOrder',DATA.simpulan.bank)",
    'optionOrder:s.options?shuffleArray(optionIds(s.options)):null',
    "ensureShuffledOrder(State,'refleksiDiriOrder',DATA.refleksi.diriOpsi)",
  ].forEach((pola) => assert.ok(APP.includes(pola), 'app.js harus memuat ' + pola));
  assert.match(
    APP,
    /functionsiapkanUrutan\(map,list\)\{list\.forEach\(function\(q\)\{ensureShuffledOrder\(map,q\.id,q\.opsi\)/
  );
});
