'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-23.1/data.js (Unsur & jaring-jaring
 * tabung, kerucut, dan bola — Discovery Learning): setiap kunci hitungan
 * dihitung engine seksi 89 (nilaiSoalTKB, periksaSoalTKB, opsiSoalTKB,
 * cekJaringTKB), opsi pilihan cukup & unik agar dapat diacak, tahap
 * mengikuti sintaks Discovery Learning dan sama dengan manifest halaman,
 * serta app.js selalu merender pilihan dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-23.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-23.1', 'app.js'), 'utf8');
const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
);

const STAGES = [
  'stimulasi',
  'masalah',
  'amati',
  'bentang',
  'bola',
  'olahLuas',
  'tuang',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function assertOptions(list, name, min) {
  const m = min || 3;
  assert.ok(list && list.length >= m, name + ' minimal ' + m + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  const labels = Array.from(list, (o) => o.label || o.teks);
  labels.forEach((l, i) => assert.ok(l, name + '.' + list[i].id + ': label'));
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus berbeda');
}

function assertGuided(list, name, min) {
  assert.ok(list.length >= (min || 1), name + ': cukup pertanyaan');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya, q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Kunci bilangan rapi (≤ 2 desimal) dan jawaban baku diterima pemeriksa. */
function assertCek(c, name) {
  assert.ok(E.TKB_JENIS.includes(c.jenis), name + ': jenis');
  const v = E.nilaiSoalTKB(c);
  assert.ok(v > 0 && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, name + ': kunci rapi ' + v);
  const s = { cek: c };
  assert.equal(E.periksaSoalTKB(E.jawabSoalTKB(s), s).benar, true, name + ': jawaban baku');
  return v;
}

function assertLangkah(list, name) {
  assert.ok(list.length >= 2, name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.ok(s.label && s.label.includes('…'), n + ': label berisi titik isian');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, n + ': petunjuk');
    assertCek(s.cek, n);
  });
}

test('tahap mengikuti sintaks Discovery Learning & manifest', () => {
  STAGES.filter((s) => s !== 'selesai').forEach((s) => {
    assert.ok(D[s], 'DATA.' + s);
    assertHead(D[s], s);
  });
  assert.ok(D.selesai.judul && D.selesai.capaian.length >= 4);
  const sintaks = {
    stimulasi: 1,
    masalah: 2,
    amati: 3,
    bentang: 3,
    bola: 3,
    olahLuas: 4,
    tuang: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.keys(sintaks).forEach((s) =>
    assert.ok(D[s].syntax.includes('Sintaks ' + sintaks[s]), s + ': sintaks ' + sintaks[s])
  );
  const m = MANIFEST['fase-d/mpi-23.1'];
  assert.ok(m, 'manifest');
  assert.equal(m.stageCount, STAGES.length);
  assert.ok(m.h1.includes('Tabung') && m.h1.includes('Kerucut') && m.h1.includes('Bola'));
  assert.ok(m.description.includes('Discovery Learning'));
  const stagesApp = /var STAGES = \[([^\]]+)\]/.exec(APP)[1].match(/'([^']+)'/g);
  assert.deepEqual(
    stagesApp.map((s) => s.slice(1, -1)),
    STAGES
  );
});

test('stimulasi: TP, kriteria, benda tiga jenis, dugaan berpilihan', () => {
  const S = D.stimulasi;
  assert.ok(S.tp.includes('tabung, kerucut, dan bola'));
  assert.ok(S.kriteria.length >= 3);
  assert.equal(new Set(ids(S.benda)).size, S.benda.length);
  E.TKB_JENIS.forEach((j) =>
    assert.ok(S.benda.filter((b) => b.jenis === j).length >= 2, 'benda ' + j)
  );
  S.dugaan.forEach((q) => assertOptions(q.opsi, 'dugaan.' + q.id, 4));
  const T = D.generalisasi.tanggapanDugaan;
  S.dugaan.forEach((q) => {
    assert.ok(T[q.id] && T[q.id].lain, 'tanggapan ' + q.id);
    assert.ok(
      ids(q.opsi).some((id) => T[q.id][id]),
      'tanggapan benar ' + q.id
    );
  });
});

test('masalah: opsi, kunci, umpan', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
});

test('amati: tabel memuat ketiga bangun & pertanyaan penuntun', () => {
  assert.deepEqual(Array.from(D.amati.tabelRows), Array.from(E.TKB_JENIS));
  assertGuided(D.amati.tanya, 'amati.tanya', 3);
});

test('bentang: ukuran lab, pertanyaan, langkah sesuai engine', () => {
  const B = D.bentang;
  assert.ok(B.lab.tabung.r > 0 && B.lab.tabung.t > 0);
  assert.ok(B.lab.kerucut.r > 0 && B.lab.kerucut.t > 0);
  assertGuided(B.tanya, 'bentang.tanya', 3);
  assertLangkah(B.langkah, 'bentang.langkah');
  assert.equal(E.nilaiSoalTKB(B.langkah[0].cek), 44);
  assert.equal(E.nilaiSoalTKB(B.langkah[3].cek), 216);
});

test('bola: konfigurasi kulit jeruk menghasilkan tepat 4 lingkaran', () => {
  const cfg = D.bola.lab;
  assert.equal(cfg.kepingan / cfg.perLingkaran, 4);
  assert.ok(cfg.slot > 4, 'lingkaran jiplakan lebih dari 4 agar jawaban tidak terbaca');
  assertGuided(D.bola.tanya, 'bola.tanya', 3);
});

test('olahLuas: konsep, pemilahan sesuai cekJaringTKB, langkah', () => {
  const O = D.olahLuas;
  assertGuided(O.konsep, 'olahLuas.konsep', 4);
  assertOptions(O.opsiKlas, 'opsiKlas', 2);
  assert.equal(new Set(ids(O.pilah)).size, O.pilah.length);
  assert.ok(O.pilah.length >= 6);
  O.pilah.forEach((p) => {
    const r = E.cekJaringTKB(p.spec);
    assert.equal(p.correct, r.valid ? 'bisa' : 'tidak', p.id + ': kunci sesuai engine');
  });
  assert.ok(O.pilah.some((p) => p.correct === 'bisa'));
  assert.ok(O.pilah.some((p) => p.correct === 'tidak'));
  assertLangkah(O.langkah, 'olahLuas.langkah');
  assert.equal(E.nilaiSoalTKB(O.langkah[0].cek), 836);
});

test('tuang: pertanyaan & langkah volume', () => {
  assertGuided(D.tuang.tanya, 'tuang.tanya', 4);
  assertLangkah(D.tuang.langkah, 'tuang.langkah');
  assert.equal(E.nilaiSoalTKB(D.tuang.langkah[0].cek), 3080);
});

test('verifikasi: langkah, rancangan jaring, miskonsepsi', () => {
  const V = D.verifikasi;
  assertLangkah(V.langkah, 'verifikasi.langkah');
  assertOptions(V.opsiPrediksi, 'opsiPrediksi', 2);
  const hasil = V.jaring.map((j) => E.cekJaringTKB(j.spec).valid);
  assert.ok(hasil.includes(true) && hasil.includes(false), 'satu bisa, satu tidak');
  V.soal.forEach((q) => {
    assertOptions(q.options, 'verifikasi.' + q.id, 4);
    assert.ok(ids(q.options).includes(q.correct));
    assert.ok(q.explanation);
  });
});

test('generalisasi: kalimat memakai bank, ada pengecoh', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  G.kalimat.forEach((k) => assert.ok(bank.includes(k.correct), k.id));
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  assert.ok(bank.length >= G.kalimat.length + 2, 'ada potongan pengecoh');
  assert.ok(G.rangkuman.length >= 4);
});

test('terapkan: bank soal cukup untuk komposisi, kunci & opsi valid', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  const total = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, T.banyak);
  Object.keys(T.komposisi).forEach((k) =>
    assert.ok(
      T.soal.filter((s) => s.type === k).length > T.komposisi[k],
      k + ': bank lebih banyak dari yang diambil'
    )
  );
  T.soal.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.type === 'input') {
      assertCek(s.cek, s.id);
      assert.ok(s.hints && s.hints.length, s.id + ': petunjuk');
      const kunci = E.jawabSoalTKB(s);
      assert.ok(s.explanation.includes(kunci), s.id + ': pembahasan memuat ' + kunci);
    } else if (s.cek) {
      assertCek(s.cek, s.id);
      const o = E.opsiSoalTKB(s);
      assertOptions(o, s.id, 4);
      assert.equal(o.filter((x) => x.id === 'baku').length, 1);
      assert.ok(s.explanation.includes(E.jawabSoalTKB(s)), s.id + ': pembahasan memuat kunci');
    } else {
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct));
    }
  });
});

test('refleksi: pertanyaan & opsi penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
});

test('app.js: pilihan selalu diacak sekali & disimpan di State', () => {
  ['ensureShuffledOrder', 'ensureSortStates', 'shuffleArray', 'opsiSoalTKB'].forEach((f) =>
    assert.ok(APP.includes(f + '('), 'app memakai ' + f)
  );
  assert.ok(/optionOrder:\s*\S*shuffleArray\(/.test(APP), 'optionOrder diacak');
  assert.ok(APP.includes("STORAGE_KEY = 'mpi-23-1-tkb-v1'"));
  /* buildChoiceGroup selalu diberi urutan tersimpan (argumen kedua bukan null) */
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*([^,)]+)/g) || [];
  assert.ok(panggilan.length >= 3);
  panggilan.forEach((p) => assert.ok(!/,\s*null\s*$/.test(p), 'urutan acak: ' + p));
});
