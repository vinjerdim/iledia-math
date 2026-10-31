'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-19.1/data.js (hubungan luas persegi
 * pada sisi segitiga siku-siku, Inquiry Learning): setiap tahap punya
 * kepala IL; setiap daftar pilihan cukup opsi untuk diacak dengan id &
 * label unik serta umpan balik tiap opsi; luas baris tabel tambahan
 * dihitung ulang dengan strategi bingkai; jenis segitiga pembanding dan
 * kunci relasinya dihitung ulang dengan fungsi seksi 86 shared/engine.js;
 * bank soal uji terap cukup untuk diambil acak sesuai komposisi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-19.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.ok(list.length <= 6, name + ' maksimal 6 opsi (huruf A–F)');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  assert.equal(
    new Set(list.map((o) => o.label || o.teks)).size,
    list.length,
    name + ': label opsi harus unik'
  );
}

function assertGuided(q, name, min) {
  assertOptions(q.opsi, name + '.opsi', min || 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertDugaan(q, name) {
  assertOptions(q.opsi, name + '.opsi', 3);
  assert.ok(ids(q.opsi).includes(q.baku), name + ': baku ada di opsi');
  assert.ok(q.pembahasan && q.pembahasan.length > 20, name + ': pembahasan');
}

test('tahap mengikuti sintaks Inquiry Learning dan sesuai manifest', () => {
  assert.deepEqual(
    [...ids(D.tahap)],
    [
      'orientasi',
      'masalah',
      'hipotesis',
      'dataHitung',
      'dataTabel',
      'dataBanding',
      'uji',
      'simpulan',
      'terapkan',
      'refleksi',
      'selesai',
    ]
  );
  const manifest = require('../shared/pages-manifest.json')['fase-d/mpi-19.1'];
  assert.ok(manifest, 'manifest fase-d/mpi-19.1 harus ada');
  assert.equal(manifest.stageCount, D.tahap.length);
  assert.match(manifest.description, /Inquiry Learning/);
});

test('setiap tahap IL punya kicker, syntax, goal, dan catatan guru', () => {
  const sintaks = {
    orientasi: 1,
    masalah: 2,
    hipotesis: 3,
    dataHitung: 4,
    dataTabel: 4,
    dataBanding: 4,
    uji: 5,
    simpulan: 6,
  };
  Object.keys(sintaks).forEach((k) => {
    const T = D[k];
    assert.ok(T.kicker && T.goal && T.guru, k + ': kicker, goal, guru');
    assert.equal(T.syntax, 'Inquiry Learning · Sintaks ' + sintaks[k], k + ': syntax');
    assert.ok(T.nextLabel, k + ': nextLabel');
  });
  ['terapkan', 'refleksi'].forEach((k) => {
    assert.ok(D[k].kicker && D[k].goal && D[k].guru && D[k].syntax, k);
  });
});

test('orientasi & hipotesis: dugaan tidak dinilai tetapi punya baku & pembahasan', () => {
  D.orientasi.dugaan.forEach((q) => assertDugaan(q, q.id));
  D.hipotesis.dugaan.forEach((q) => assertDugaan(q, q.id));
  /* Dugaan banyak ubin cocok dengan luas persegi sisi miring segitiga kaki orientasi. */
  const seg = E.segitigaSikuKisi(D.orientasi.kaki[0], D.orientasi.kaki[1]);
  const Lc = E.luasPersegiSegitiga(seg.pts).Lc;
  const ubin = D.orientasi.dugaan.find((q) => q.id === 'dUbin');
  assert.equal(ubin.opsi.find((o) => o.id === ubin.baku).label, Lc + ' ubin');
});

test('masalah: opsi acak berumpan dan kunci ada', () => {
  assertGuided(
    { opsi: D.masalah.opsi, correct: D.masalah.correct, umpan: D.masalah.umpan },
    'masalah'
  );
});

test('Lab Kotak Persegi: rentang kaki & awal valid, cukup kombinasi untuk minCatat', () => {
  const L = D.dataHitung.lab;
  assert.ok(L.min >= 1 && L.max <= 6 && L.min < L.max);
  L.awal.forEach((v) => assert.ok(v >= L.min && v <= L.max));
  const n = L.max - L.min + 1;
  assert.ok((n * (n + 1)) / 2 >= L.minCatat, 'kombinasi pasangan kaki cukup');
  assert.ok(D.dataHitung.petunjuk.length >= 2);
});

test('Tabel Data: baris tambahan siku-siku, Lc = bingkai − 4 segitiga pojok', () => {
  D.dataTabel.tambahan.forEach((r) => {
    const bk = E.bingkaiPersegiRuas([r.a, 0], [0, r.b]);
    assert.equal(bk.bingkai - bk.banyakSegitiga * bk.segitiga, r.Lc, r.id + ': Lc bingkai');
    assert.equal(r.a * r.a + r.b * r.b, r.Lc, r.id + ': La + Lb = Lc');
    assert.match(r.catatan, new RegExp(String(bk.bingkai)), r.id + ': catatan memuat bingkai');
  });
  D.dataTabel.temuan.forEach((q) => assertGuided(q, q.id));
});

test('Pembanding: jenis segitiga dihitung ulang dan kunci relasi cocok', () => {
  const RELASI = { siku: 'sama', lancip: 'lebih', tumpul: 'kurang' };
  assertOptions(D.dataBanding.opsiRelasi, 'opsiRelasi', 3);
  const jenis = new Set();
  D.dataBanding.segitiga.forEach((g) => {
    assert.equal(g.pts.length, 3);
    assert.equal(g.titik.length, 3);
    g.pts.forEach((p) => p.forEach((v) => assert.ok(Number.isInteger(v) && v >= 0 && v <= 6)));
    const j = E.jenisSegitiga(g.pts).jenis;
    jenis.add(j);
    assert.equal(g.correct, RELASI[j], g.id + ': kunci relasi');
    assertGuided({ opsi: D.dataBanding.opsiRelasi, correct: g.correct, umpan: g.umpan }, g.id, 3);
    const siku = E.titikSikuSegitiga(g.pts);
    assert.equal(siku !== -1, j === 'siku', g.id + ': siku-siku ⇔ ada sudut 90°');
  });
  assert.deepEqual([...jenis].sort(), ['lancip', 'siku', 'tumpul']);
  /* Ada segitiga siku-siku yang semua sisinya miring (bukan tegak/mendatar). */
  const miring = D.dataBanding.segitiga.find((g) => g.correct === 'sama');
  [0, 1, 2].forEach((i) =>
    assert.ok(E.bingkaiPersegiRuas(miring.pts[i], miring.pts[(i + 1) % 3]).miring)
  );
  D.dataBanding.temuan.forEach((q) => assertGuided(q, q.id));
});

test('uji: pernyataan benar/salah berimbang dengan penjelasan', () => {
  const P = D.uji.pernyataan;
  assert.ok(P.length >= 6);
  assert.equal(new Set(ids(P)).size, P.length);
  const benar = P.filter((v) => v.correct === 'benar').length;
  assert.ok(benar >= 2 && P.length - benar >= 2, 'campuran benar & salah');
  P.forEach((v) => assert.ok(v.explanation && v.teks));
});

test('simpulan: setiap kalimat berkunci unik di bank, ada pengecoh', () => {
  const S = D.simpulan;
  const bank = ids(S.bank);
  assert.equal(new Set(bank).size, bank.length);
  const kunci = S.kalimat.map((k) => k.correct);
  assert.equal(new Set(kunci).size, kunci.length);
  kunci.forEach((k) => assert.ok(bank.includes(k)));
  assert.ok(bank.length - kunci.length >= 3, 'minimal tiga pengecoh');
});

test('uji terap: bank cukup sesuai komposisi, opsi engine valid & berkunci', () => {
  const T = D.terapkan;
  const total = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, T.banyak);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  Object.keys(T.komposisi).forEach((k) => {
    const n = T.soal.filter((s) => s.minta === k).length;
    assert.ok(n > T.komposisi[k], k + ': bank lebih banyak dari yang diambil');
  });
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    const opsi = E.opsiSoalPythagoras(s);
    assertOptions(opsi, s.id, 4);
    assert.equal(E.nilaiSoalPythagoras(s), 'benar', s.id + ': ada kunci');
    opsi.forEach((o) => assert.ok(o.umpan, s.id + ': umpan ' + o.id));
    if (s.minta === 'jenis') {
      const j = E.jenisSegitigaLuas(s.La, s.Lb, s.Lc).jenis;
      assert.ok(new RegExp(j === 'siku' ? 'siku-siku' : j).test(s.explanation), s.id);
    }
    if (s.minta === 'sisiMiring') {
      const c = Math.sqrt(s.a * s.a + s.b * s.b);
      assert.ok(Number.isInteger(c), s.id + ': tripel Pythagoras');
      assert.equal(opsi.find((o) => o.id === 'benar').label, c + ' ' + s.satuan);
    }
  });
});

test('refleksi & selesai: pertanyaan, opsi diri, capaian', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 3);
});
