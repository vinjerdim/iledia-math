'use strict';

/*
 * Tes konsistensi konten fase-e/mpi-1.2/data.js (pangkat nol & pangkat
 * negatif serta penyederhanaan bentuk aljabar berpangkat, Discovery
 * Learning): kunci setiap langkah isian dihitung ulang secara numerik
 * dari metadata `cek` dengan Math.pow (bebas dari sifat yang dipelajari),
 * tangga pangkat dan konsol stimulasi konsisten dengan nilai pangkat,
 * kunci soal uji terap diverifikasi dengan evaluasi numerik pohon
 * ekspresi, tepat satu opsi bentuk positif yang benar, setiap daftar
 * pilihan punya id unik dan cukup opsi untuk diacak, lab dapat
 * diselesaikan dalam batas stepper, dan app.js mengacak setiap daftar
 * pilihan jawaban.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-e/mpi-1.2/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-e/mpi-1.2/app.js'), 'utf8');

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + '.' + o.id + ': ada label'));
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertSort(items, options, name) {
  assertOptions(options, name + '.opsi', 2);
  assert.ok(items.length >= 4, name + ': minimal 4 butir');
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(ids(options).includes(it.correct), name + '.' + it.id + ': kategori valid');
    assert.ok(it.explanation, name + '.' + it.id + ': ada penjelasan');
  });
  const kategori = new Set(items.map((it) => it.correct));
  assert.equal(kategori.size, options.length, name + ': setiap kategori terpakai');
}

function dekat(a, b) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

function angka(a) {
  return typeof a === 'object' ? a.num / a.den : a;
}

/* Nilai aⁿ untuk eksponen bulat dengan Math.pow langsung. */
function pow(a, n) {
  return Math.pow(angka(a), n);
}

function nilaiCek(c) {
  if (c.jenis === 'nilai') return pow(c.a, c.n);
  if (c.jenis === 'nilaiBagi') {
    assert.ok(c.m >= 1 && c.n >= 1, 'nilaiBagi hanya memakai pangkat positif');
    return pow(c.a, c.m) / pow(c.a, c.n);
  }
  if (c.jenis === 'eksponenBagi') return c.m - c.n;
  if (c.jenis === 'kebalikan') return 1 / pow(c.a, c.n);
  throw new Error('jenis cek tidak dikenal: ' + c.jenis);
}

function assertSteps(list, name) {
  assert.ok(list.length >= 1, name + ' tidak kosong');
  list.forEach((s, i) => {
    const nm = name + '[' + i + ']';
    assert.ok(s.label, nm + '.label');
    assert.equal(typeof s.jawab, 'number', nm + '.jawab');
    if (!s.rational) assert.ok(Number.isInteger(s.jawab), nm + ': jawaban bulat');
    if (s.jawab < 0) assert.ok(s.allowNegative, nm + ': jawaban negatif perlu allowNegative');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    assert.ok(s.temuan, nm + '.temuan');
    assert.ok(s.cek, nm + '.cek (metadata kunci)');
    assert.ok(dekat(s.jawab, nilaiCek(s.cek)), nm + ': jawab cocok dengan cek');
  });
}

/* Evaluasi pohon ekspresi dengan Math.pow langsung. */
function evalExpr(e, vals) {
  if (e.op === 'kali') return evalExpr(e.a, vals) * evalExpr(e.b, vals);
  if (e.op === 'bagi') return evalExpr(e.a, vals) / evalExpr(e.b, vals);
  if (e.op === 'pangkat') return Math.pow(evalExpr(e.a, vals), e.k);
  return Object.keys(e.pangkat).reduce(
    (acc, v) => acc * Math.pow(vals[v], e.pangkat[v]),
    angka(e.koef)
  );
}

function evalMono(koef, pangkat, vals) {
  return Object.keys(pangkat).reduce((acc, v) => acc * Math.pow(vals[v], pangkat[v]), angka(koef));
}

const TITIK = [{ 2: 3 }, { 0: -2, 1: 5 }, { 0: 7, 1: -3 }];

function titikUntuk(vars) {
  return TITIK.map((t) => {
    const out = {};
    vars.forEach((v, i) => {
      out[v] = t[i] !== undefined ? t[i] : 2 + i;
    });
    return out;
  });
}

const STAGE_KEYS = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olah',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
];

test('setiap tahap punya kepala tahap & catatan guru', () => {
  STAGE_KEYS.forEach((k) => {
    assert.ok(D[k], k + ' ada');
    assert.ok(D[k].kicker, k + '.kicker');
    assert.ok(D[k].goal, k + '.goal');
    assert.ok(D[k].syntax, k + '.syntax');
    assert.ok(D[k].guru, k + '.guru');
    assert.ok(D[k].nextLabel, k + '.nextLabel');
  });
  assert.ok(D.selesai && D.selesai.judul && D.selesai.capaian.length >= 3);
});

test('sintaks Discovery Learning 1–6 terpetakan berurutan', () => {
  const urut = ['stimulasi', 'masalah', 'koleksi', 'olah', 'verifikasi', 'generalisasi'];
  urut.forEach((k, i) => assert.match(D[k].syntax, new RegExp('Sintaks ' + (i + 1) + '$'), k));
});

test('app.js: urutan tahap sesuai data dan 9 tahap', () => {
  const m = APP.match(/var STAGES = \[([\s\S]*?)\];/);
  assert.ok(m, 'STAGES ada');
  const stages = m[1].match(/'([a-zA-Z]+)'/g).map((s) => s.replace(/'/g, ''));
  assert.deepEqual(stages, STAGE_KEYS.concat(['selesai']));
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-e/mpi-1.2'].stageCount, stages.length);
});

test('stimulasi: konsol sesuai nilai pangkat, dugaan acak, dugaan benar ada', () => {
  const S = D.stimulasi;
  S.konsol.forEach((k) => {
    assert.equal(k.kode, k.a + ' ** ' + k.n, 'kode konsol');
    assert.ok(dekat(Number(k.hasil), pow(k.a, k.n)), k.kode);
  });
  assert.ok(S.konsol.some((k) => k.n === 0) && S.konsol.some((k) => k.n < 0));
  const t = S.tangga;
  assert.ok(t.dari > 0 && t.sampai < 0, 'tangga melewati 0');
  assert.ok(E.powerLadderEditable(t).length >= 1, 'ada anak tangga "?"');
  assertOptions(S.opsi, 'stimulasi.opsi', 4);
  assert.ok(ids(S.opsi).includes(D.verifikasi.dugaanBenar));
});

test('masalah: pertanyaan inti', () => {
  const M = D.masalah;
  assertGuided({ opsi: M.opsi, correct: M.correct, umpan: M.umpan }, 'masalah');
});

test('koleksi: tangga pangkat turun melewati 0 ke negatif, kunci terbaca benar', () => {
  const T = D.koleksi.tangga;
  assert.ok(T.length >= 3);
  assert.equal(new Set(ids(T)).size, T.length);
  T.forEach((t) => {
    assert.ok(t.dari >= 2 && t.sampai <= -2, t.id + ': dari positif ke negatif');
    assert.ok(
      t.diketahui.every((n) => n > 1),
      t.id + ': hanya pangkat positif yang diberikan'
    );
    const editable = Array.from(E.powerLadderEditable(t));
    assert.ok(editable.includes(0) && editable.includes(-1), t.id + ': murid mengisi a⁰ dan a⁻¹');
    const kunci = {};
    editable.forEach((n) => {
      const v = pow(t.a, n);
      kunci[n] = n >= 0 ? String(v) : '1/' + Math.pow(t.a, -n);
    });
    assert.equal(E.powerLadderAllCorrect(t, kunci), true, t.id);
  });
  assert.ok(D.koleksi.hintsTangga.length >= 2);
});

test('koleksi: jalur pembagian (m = n dan m < n) & pilah', () => {
  const L = D.koleksi.langkah;
  assertSteps(L, 'koleksi.langkah');
  const bagi = L.filter((s) => s.cek.jenis === 'eksponenBagi');
  assert.ok(
    bagi.some((s) => s.cek.m === s.cek.n),
    'ada kasus m = n'
  );
  assert.ok(
    bagi.some((s) => s.cek.m < s.cek.n),
    'ada kasus m < n'
  );
  assertSort(D.koleksi.pilah, D.koleksi.opsiPilah, 'koleksi.pilah');
});

test('olah: pertanyaan penuntun, langkah basis baru, rumus', () => {
  const O = D.olah;
  assert.ok(O.pertanyaan.length >= 3);
  assert.equal(new Set(ids(O.pertanyaan)).size, O.pertanyaan.length);
  O.pertanyaan.forEach((q) => {
    assert.ok(q.tanya, q.id + '.tanya');
    assertGuided(q, 'olah.' + q.id);
  });
  assertSteps(O.langkah, 'olah.langkah');
  const basisData = new Set(D.koleksi.tangga.map((t) => t.a));
  O.langkah
    .filter((s) => s.cek.jenis === 'nilai')
    .forEach((s, i) => assert.ok(!basisData.has(s.cek.a), 'olah.langkah[' + i + ']: basis baru'));
  assert.ok(O.langkah.some((s) => s.cek.n === 0));
  assert.ok(
    O.langkah.some((s) => angka(s.cek.a) < 0),
    'ada basis negatif'
  );
  assert.deepEqual(
    Array.from(O.rumus, (r) => r.teks),
    ['a⁰ = 1, a ≠ 0', 'a⁻ⁿ = 1/aⁿ, a ≠ 0', '1/a⁻ⁿ = aⁿ, a ≠ 0']
  );
});

test('verifikasi: lab dapat diselesaikan dalam batas stepper', () => {
  const L = D.verifikasi.lab;
  L.sifat.forEach((s) => assert.ok(E.SIFAT_EKSPONEN[s], 'sifat ' + s + ' dikenal'));
  ['nol', 'negatif'].forEach((s) => assert.ok(L.sifat.includes(s), s));
  L.sifat.forEach((s) => {
    if (E.SIFAT_EKSPONEN[s].keliru) assert.ok(L.nama[s], s + ': nama dugaan teman');
  });
  L.syarat.forEach((sy) => {
    assert.ok(L.sifat.includes(sy.sifat), sy.sifat + ' dapat dipilih');
    const st = E.makeExponentLabState(sy.sifat);
    let tercatat = 0;
    let sangkal = false;
    for (let a = L.batasA[0]; a <= L.batasA[1]; a++) {
      for (let n = L.batasE[0]; n <= L.batasE[1]; n++) {
        Object.assign(st, { a: a, n: n });
        if (E.labCatat(st) === 'ok') {
          tercatat++;
          if (!st.log[st.log.length - 1].sama) sangkal = true;
        }
      }
    }
    assert.ok(tercatat >= sy.min, sy.sifat + ': cukup uji');
    if (sy.sangkal) assert.ok(sangkal, sy.sifat + ': ada contoh penyangkal');
    else assert.ok(!sangkal, sy.sifat + ': sifat benar tidak pernah tersangkal');
  });
  assert.ok(L.batasA[0] < 0 && L.batasA[1] > 0, 'a = 0 dan basis negatif dapat dicoba');
});

test('verifikasi: kalkulator berdiagnosa, dugaan awal, pilah miskonsepsi', () => {
  const V = D.verifikasi;
  assert.ok(V.kalkulator.length >= 4);
  assert.equal(new Set(ids(V.kalkulator)).size, V.kalkulator.length);
  assert.ok(V.kalkulator.some((k) => k.n === 0) && V.kalkulator.some((k) => k.n < 0));
  V.kalkulator.forEach((k) => {
    assert.ok(k.a !== 0, k.id + ': a ≠ 0');
    const benar = E.pangkatBulat(k.a, k.n);
    assert.ok(dekat(E.nilaiPecahan(benar), pow(k.a, k.n)), k.id);
    assert.equal(E.diagnosaPangkat(k.a, k.n, benar), 'benar', k.id);
  });
  assertSort(V.pilah, V.opsiPilah, 'verifikasi.pilah');
});

test('generalisasi: bank kalimat dengan pengecoh', () => {
  const G = D.generalisasi;
  assert.equal(new Set(ids(G.bank)).size, G.bank.length, 'id bank unik');
  assert.equal(new Set(ids(G.kalimat)).size, G.kalimat.length, 'id kalimat unik');
  const correct = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(correct).size, correct.length, 'setiap potongan dipakai sekali');
  correct.forEach((c) => assert.ok(ids(G.bank).includes(c), c + ' ada di bank'));
  assert.ok(G.bank.length >= G.kalimat.length + 3, 'minimal 3 pengecoh');
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: kunci bentuk aljabar terverifikasi numerik & tepat satu opsi benar', () => {
  const T = D.terapkan.soal;
  assert.ok(T.length >= 5);
  assert.equal(new Set(ids(T)).size, T.length);
  let adaNol = false;
  let adaPangkatNeg = false;
  T.forEach((s) => {
    const nm = 'terapkan.' + s.id;
    assert.ok(s.hints && s.hints.length >= 2, nm + '.hints');
    assert.ok(s.explanation, nm + '.explanation');
    const kunci = E.hitungEkspresiMonomial(s.ekspresi);
    assert.ok(kunci, nm + ': kunci terdefinisi');
    Object.keys(kunci.pangkat).forEach((v) => assert.ok(s.vars.includes(v), nm + ': var ' + v));
    titikUntuk(s.vars).forEach((vals) => {
      assert.ok(
        dekat(E.nilaiPecahan(E.nilaiMonomial(kunci, vals)), evalExpr(s.ekspresi, vals)),
        nm + ': kunci cocok dengan evaluasi numerik'
      );
    });
    assert.ok(
      Object.values(kunci.pangkat).some((n) => n < 0) ||
        kunci.koef.den !== 1 ||
        E.formatEkspresiMonomial(s.ekspresi).includes('⁰'),
      nm + ': memakai pangkat nol/negatif'
    );
    if (E.formatEkspresiMonomial(s.ekspresi).includes('⁰')) adaNol = true;
    if (s.ekspresi.op === 'pangkat' && s.ekspresi.k < 0) adaPangkatNeg = true;

    assertOptions(s.opsi, nm + '.opsi', 4);
    assert.ok(ids(s.opsi).includes(s.correct), nm + ': correct ada di opsi');
    assert.equal(new Set(s.opsi.map((o) => o.label)).size, s.opsi.length, nm + ': label opsi unik');
    const cocok = s.opsi.filter((o) =>
      titikUntuk(s.vars).every((vals) =>
        dekat(evalMono(o.koef, o.pangkat, vals), evalExpr(s.ekspresi, vals))
      )
    );
    assert.equal(cocok.length, 1, nm + ': tepat satu opsi cocok');
    assert.equal(cocok[0].id, s.correct, nm + ': opsi cocok = correct');
    s.opsi.forEach((o) => {
      assert.doesNotMatch(o.label, /⁻/, nm + '.' + o.id + ': bentuk eksponen positif');
      assert.equal(o.label, E.formatMonomial(E.monomial(o.koef, o.pangkat), { positif: true }));
    });
  });
  assert.ok(adaNol, 'ada soal dengan pangkat nol');
  assert.ok(adaPangkatNeg, 'ada soal memangkatkan dengan eksponen negatif');
});

test('refleksi: pertanyaan & penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
});

test('app.js: setiap daftar pilihan jawaban diacak', () => {
  [
    /ensureShuffledOrder\(State, 'stimulasiOrder', DATA\.stimulasi\.opsi\)/,
    /ensureShuffledOrder\(State, 'masalahOrder', DATA\.masalah\.opsi\)/,
    /ensureSortStates\([\s\S]*?DATA\.koleksi\.pilah/,
    /DATA\.olah\.pertanyaan\.forEach[\s\S]*?ensureShuffledOrder/,
    /ensureSortStates\([\s\S]*?DATA\.verifikasi\.pilah/,
    /ensureShuffledOrder\(State, 'bankOrder', DATA\.generalisasi\.bank\)/,
    /optionOrder: shuffleArray\(optionIds\(s\.opsi\)\)/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
  ].forEach((re) => assert.match(APP, re));
});
