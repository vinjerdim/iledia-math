'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-1.2/data.js (rumus suku ke-n
 * barisan aritmetika, Cooperative Learning NHT): kunci jawaban cocok
 * dengan engine seksi 40 (rumusSuku, fmtRumusSuku, suku1DanBeda,
 * nomorSukuDari), setiap daftar pilihan punya id & label unik dan cukup
 * opsi untuk diacak, setiap opsi pertanyaan penuntun punya umpan balik,
 * manifest cocok, dan app.js mengacak SETIAP daftar pilihan jawaban
 * murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-1.2/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-f/mpi-1.2/app.js'), 'utf8').replace(/\s+/g, '');

function ids(list) {
  return Array.from(list.map((o) => o.id));
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  assert.equal(
    new Set(list.map((o) => o.label)).size,
    list.length,
    name + ': label opsi harus unik'
  );
  list.forEach((o) => assert.ok(o.label, name + ': opsi ' + o.id + ' tanpa label'));
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': kunci tidak ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan balik untuk ' + o.id));
}

function label(list, id) {
  return list.find((o) => o.id === id).label;
}

test('tahap cocok dengan manifest dan sintaks Cooperative Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-f/mpi-1.2'];
  assert.ok(m, 'manifest fase-f/mpi-1.2 ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Cooperative Learning/);
  assert.deepEqual(ids(D.tahap), [
    'tujuan',
    'informasi',
    'tim',
    'misiRumus',
    'misiDuaSuku',
    'misiKonteks',
    'kuis',
    'penghargaan',
    'refleksi',
    'selesai',
  ]);
  ids(D.tahap).forEach((id) => assert.match(APP, new RegExp(id + ':render')));
  const html = fs.readFileSync(path.join(ROOT, 'fase-f/mpi-1.2/index.html'), 'utf8');
  assert.match(html, /0 dari 10 tahap selesai/);
  assert.match(html, /shared\/engine\.js/);
});

test('tujuan: dugaan dapat diacak dan kuncinya konsisten dengan barisan lab', () => {
  const T = D.tujuan;
  assert.equal(E.bedaBarisan(T.barisan), D.informasi.b);
  assert.equal(T.barisan[0], D.informasi.a);
  T.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'tujuan.' + q.id);
    assert.ok(ids(q.opsi).includes(T.kunciDugaan[q.id]), q.id + ': kunci dugaan ada');
  });
  const u25 = E.sukuAritmetika(D.informasi.a, D.informasi.b, 25);
  assert.equal(label(T.dugaan[0].opsi, T.kunciDugaan.u25), u25 + ' PC');
});

test('informasi: penuntun berumpan balik dan kuncinya cocok dengan engine', () => {
  const I = D.informasi;
  I.penuntun.forEach((q) => assertGuided(q, 'penuntun.' + q.id));
  const p1 = I.penuntun.find((q) => q.id === 'p1');
  assert.equal(label(p1.opsi, p1.correct), '24 kali');
  const p3 = I.penuntun.find((q) => q.id === 'p3');
  assert.equal(label(p3.opsi, p3.correct), E.fmtRumusSuku(I.a, I.b));
  assert.ok(I.barisPola >= 3);
  assert.match(I.kode, new RegExp(E.kodeSukuJs(I.b, I.a - I.b).replace(/[*+]/g, '\\$&')));
});

test('tim: batas anggota sesuai NHT dan kesepakatan lengkap', () => {
  assert.equal(D.tim.minAnggota, 3);
  assert.equal(D.tim.maksAnggota, 4);
  assert.ok(D.tim.kesepakatan.length >= 3);
});

test('misi 1: barisan aritmetika bervariasi dan semua opsi turunannya unik', () => {
  const sifat = new Set();
  let negatif = false;
  let desimal = false;
  D.misiRumus.soal.forEach((s) => {
    const b = E.bedaBarisan(s.terms);
    assert.ok(b !== null && b !== 0, s.id + ' barisan aritmetika tak konstan');
    sifat.add(E.sifatBarisanAritmetika(b));
    if (s.terms.some((t) => t < 0)) negatif = true;
    if (s.terms.some((t) => !Number.isInteger(t))) desimal = true;
    assertOptions(E.opsiSukuPertama(s.terms), s.id + '.suku1');
    assertOptions(E.opsiKodeSuku(s.terms[0], b), s.id + '.kode');
    assertOptions(E.opsiRumusSuku(s.terms[0], b), s.id + '.rumus');
  });
  assert.deepEqual([...sifat].sort(), ['naik', 'turun']);
  assert.ok(negatif, 'ada barisan memuat bilangan negatif');
  assert.ok(desimal, 'ada barisan desimal');
  assert.match(D.misiRumus.nhtTugas, /−7n \+ 67/);
  assert.equal(E.fmtRumusSuku(60, -7), 'Uₙ = −7n + 67');
});

test('misi 2: a, b, dan nomor suku target konsisten', () => {
  D.misiDuaSuku.soal.forEach((s) => {
    assert.ok(s.m < s.n && s.m > 1, s.id + ': dua suku tak berurutan, bukan U₁');
    const ab = E.suku1DanBeda(s.m, s.um, s.n, s.un);
    assert.ok(ab, s.id);
    assert.ok(Number.isFinite(ab.a) && ab.b !== 0, s.id);
    assert.equal(E.sukuAritmetika(ab.a, ab.b, s.m), s.um);
    assert.equal(E.sukuAritmetika(ab.a, ab.b, s.n), s.un);
    const n = E.nomorSukuDari(ab.a, ab.b, s.target);
    assert.ok(n !== null, s.id + ': target harus suku ke-n bilangan asli');
  });
  const d1 = E.suku1DanBeda(3, 14, 8, 39);
  assert.equal(E.fmtRumusSuku(d1.a, d1.b), 'Uₙ = 5n − 1');
  assert.equal(E.nomorSukuDari(d1.a, d1.b, 99), 20);
});

test('misi 3: kunci pasangan a–b, jawaban, dan makna cocok', () => {
  const jenis = new Set();
  D.misiKonteks.soal.forEach((s) => {
    jenis.add(s.jenis);
    assertOptions(s.abOpsi, s.id + '.abOpsi');
    assertOptions(s.maknaOpsi, s.id + '.maknaOpsi');
    assert.equal(
      label(s.abOpsi, s.abBenar),
      'a = ' + E.fmtSuku(s.a) + ', b = ' + E.fmtSuku(s.b),
      s.id
    );
    assert.ok(ids(s.maknaOpsi).includes(s.maknaBenar), s.id);
    if (s.jenis === 'nomor') {
      assert.equal(E.nomorSukuDari(s.a, s.b, s.target), s.jawab, s.id);
    } else {
      assert.ok(E.hampirSama(E.sukuAritmetika(s.a, s.b, s.n), s.jawab), s.id);
    }
    const angka = E.fmtSuku(s.jawab);
    assert.ok(label(s.maknaOpsi, s.maknaBenar).includes(angka), s.id + ': makna memuat jawaban');
  });
  assert.deepEqual([...jenis].sort(), ['nomor', 'suku']);
  assert.ok(
    D.misiKonteks.soal.some((s) => s.b < 0),
    'ada konteks berkurang'
  );
});

test('kuis: bank ≥ 10 soal, komposisi valid, dan setiap kunci cocok dengan engine', () => {
  const K = D.kuis;
  assert.ok(K.soal.length >= 10);
  assert.equal(new Set(ids(K.soal)).size, K.soal.length);
  const total = Object.values(K.komposisi).reduce((x, y) => x + y, 0);
  assert.equal(total, K.banyak);
  Object.keys(K.komposisi).forEach((j) => {
    assert.ok(K.soal.filter((s) => s.jenis === j).length >= K.komposisi[j], 'bank jenis ' + j);
  });
  K.soal.forEach((s) => {
    assertOptions(s.options, 'kuis.' + s.id);
    assert.ok(ids(s.options).includes(s.correct), s.id);
    assert.equal(s.type, 'choice');
    let a = s.a;
    let b = s.b;
    if (s.m) {
      const ab = E.suku1DanBeda(s.m, s.um, s.mn, s.umn);
      a = ab.a;
      b = ab.b;
    }
    const kunci = label(s.options, s.correct);
    if (s.jenis === 'rumus') assert.equal(kunci, E.fmtRumusSuku(a, b), s.id);
    if (s.jenis === 'suku') assert.equal(kunci, E.fmtSuku(E.sukuAritmetika(a, b, s.n)), s.id);
    if (s.jenis === 'nomor')
      assert.equal(kunci, 'Suku ke-' + E.nomorSukuDari(a, b, s.target), s.id);
    if (s.jenis === 'konteks') {
      assert.ok(kunci.includes(E.fmtSuku(E.sukuAritmetika(a, b, s.n))), s.id);
    }
  });
});

test('refleksi: penilaian diri dapat diacak', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.refleksi.pertanyaan.length >= 3);
});

/* Argumen ke-`i` sebuah panggilan (sadar kurung) dari teks tanpa spasi. */
function argsOf(src, fnName) {
  const out = [];
  let from = 0;
  for (;;) {
    const at = src.indexOf(fnName + '(', from);
    if (at === -1) break;
    let i = at + fnName.length + 1;
    let depth = 0;
    let cur = '';
    const args = [];
    for (; i < src.length; i++) {
      const c = src[i];
      if (c === '(' || c === '[' || c === '{') depth++;
      if (c === ')' || c === ']' || c === '}') {
        if (depth === 0) break;
        depth--;
      }
      if (c === ',' && depth === 0) {
        args.push(cur);
        cur = '';
      } else cur += c;
    }
    args.push(cur);
    out.push(args);
    from = at + 1;
  }
  return out;
}

test('app.js mengacak setiap daftar pilihan jawaban murid', () => {
  [
    "ensureListOrders('dugaanOrders',DATA.tujuan.dugaan)",
    "ensureListOrders('penuntunOrders',DATA.informasi.penuntun)",
    "ensureShuffledOrder(st,'suku1Order',opsiSukuPertama(s.terms))",
    "ensureShuffledOrder(st,'kodeOrder',opsiKodeSuku(",
    "ensureShuffledOrder(st,'abOrder',s.abOpsi)",
    "ensureShuffledOrder(st,'maknaOrder',s.maknaOpsi)",
    'optionOrder:shuffleArray(optionIds(s.options))',
    'State.kuisPick=pilihSoalKuis()',
    "ensureShuffledOrder(State,'refleksiDiriOrder',DATA.refleksi.diriOpsi)",
    'State.timAnggota=assignNhtNumbers(State.timInput)',
    "bindNhtCall(container,'nhtRumus'",
    "bindNhtCall(container,'nhtDua'",
    "bindNhtCall(container,'nhtKonteks'",
  ].forEach((s) => assert.ok(APP.includes(s), 'app.js memuat ' + s));

  /* Setiap grup pilihan dirender dengan urutan tersimpan (bukan null). */
  const panggilan = argsOf(APP, 'buildChoiceGroup').filter((a) => a.length >= 2);
  const tryGroups = argsOf(APP, 'buildTryGroup').filter((a) => a.length >= 6);
  assert.ok(panggilan.length >= 3 && tryGroups.length >= 5);
  panggilan
    .concat(tryGroups)
    .filter((a) => a[0] !== 'options') /* definisi buildTryGroup sendiri */
    .forEach((a) => assert.match(a[1], /Order/, 'urutan acak untuk ' + a[0]));
  argsOf(APP, 'buildGuidedQuizList').forEach((a) =>
    assert.match(a[1], /Orders/, 'penuntun memakai urutan acak')
  );
});
