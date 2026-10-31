'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-24.1/data.js (Pengaruh perubahan
 * proporsional terhadap sudut & sisi bangun datar — Discovery Learning):
 * setiap kunci dihitung engine seksi 90 (nilaiSoalPP, periksaSoalPP,
 * opsiSoalPP, bandingUbahPP), opsi pilihan cukup & unik agar dapat
 * diacak, sudut hasil ukur (dibulatkan) tetap berjumlah benar, tahap
 * mengikuti sintaks Discovery Learning dan sama dengan manifest halaman,
 * serta app.js selalu merender pilihan dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-24.1/data.js']);
const D = E.DATA;
const BANGUN = E.BANGUN_PPB;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-24.1', 'app.js'), 'utf8');
const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
);

const STAGES = [
  'stimulasi',
  'masalah',
  'ukur',
  'ubah',
  'olahSisi',
  'olahSudut',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
  'selesai',
];

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function bangun(id) {
  const b = BANGUN.find((x) => x.id === id);
  assert.ok(b, 'bangun ' + id);
  return b;
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

/* Kunci rapi (≤ 2 desimal) dan jawaban baku diterima pemeriksa. */
function assertCek(c, name) {
  const v = E.nilaiSoalPP(c);
  assert.ok(v > 0 && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, name + ': kunci rapi ' + v);
  const s = { cek: c };
  assert.equal(E.periksaSoalPP(E.jawabSoalPP(s), s).benar, true, name + ': jawaban baku');
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

/* Sudut hasil busur (dibulatkan ke derajat) tetap berjumlah 180°(n − 2). */
function assertSudutBulat(b, name) {
  const total = E.sudutPoligon(b.pts).reduce((s, v) => s + Math.round(v), 0);
  assert.equal(total, 180 * (b.pts.length - 2), name + ': jumlah sudut terbaca');
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
    ukur: 3,
    ubah: 3,
    olahSisi: 4,
    olahSudut: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.keys(sintaks).forEach((s) =>
    assert.ok(D[s].syntax.includes('Sintaks ' + sintaks[s]), s + ': sintaks ' + sintaks[s])
  );
  const m = MANIFEST['fase-d/mpi-24.1'];
  assert.ok(m, 'manifest');
  assert.equal(m.stageCount, STAGES.length);
  assert.ok(m.h1.includes('Proporsional'));
  assert.ok(m.description.includes('Discovery Learning'));
  const stagesApp = /var STAGES = \[([^\]]+)\]/.exec(APP)[1].match(/'([^']+)'/g);
  assert.deepEqual(
    stagesApp.map((s) => s.slice(1, -1)),
    STAGES
  );
});

test('bangun: id unik, jenis dikenal, sisi rapi, sudut terbaca berjumlah benar', () => {
  assert.equal(new Set(ids(BANGUN)).size, BANGUN.length);
  BANGUN.forEach((b) => {
    assert.ok(['segitiga', 'jajargenjang', 'trapesium'].includes(b.jenis), b.id + ': jenis');
    assert.equal(b.titik.length, b.pts.length);
    E.sisiPoligon(b.pts).forEach((v) =>
      assert.ok(Math.abs(v * 10 - Math.round(v * 10)) < 1e-6, b.id + ': sisi rapi ' + v)
    );
    assertSudutBulat(b, b.id);
  });
});

test('stimulasi: TP, kriteria, galeri perubahan, dugaan berpilihan', () => {
  const S = D.stimulasi;
  assert.ok(S.tp.includes('proporsional'));
  assert.ok(S.kriteria.length >= 3);
  assert.equal(new Set(ids(S.galeri)).size, S.galeri.length);
  const jenis = S.galeri.map(
    (g) => E.bandingUbahPP(bangun(g.bangun), E.ubahBangunPP(bangun(g.bangun), g.aksi)).jenis
  );
  assert.ok(jenis.includes('proporsional') && jenis.some((j) => j !== 'proporsional'));
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

test('ukur: cetakan proporsional & pertanyaan penuntun', () => {
  const U = D.ukur;
  const b = bangun(U.asli);
  assert.ok(U.k > 0 && U.k !== 1);
  const q = E.skalakanBangun(b, U.k);
  assert.equal(E.bandingUbahPP(b, q).jenis, 'proporsional');
  assertSudutBulat(q, 'ukur.cetak');
  assertGuided(U.tanya, 'ukur.tanya', 3);
});

test('ubah: konfigurasi lab dapat diterapkan & hasil terbaca rapi', () => {
  const L = D.ubah.lab;
  assert.ok(L.bangun.length >= 3);
  ['kali', 'tambah', 'regang'].forEach((a) => assert.ok(L.nilai[a].length >= 1, 'nilai ' + a));
  const jenis = new Set();
  L.bangun.forEach((id) => {
    const b = bangun(id);
    Object.keys(L.nilai).forEach((a) =>
      L.nilai[a].forEach((n) => {
        const q = E.ubahBangunPP(b, { jenis: a, nilai: n });
        assertSudutBulat(q, id + ' ' + a + ' ' + n);
        jenis.add(E.bandingUbahPP(b, q).jenis);
      })
    );
  });
  assert.deepEqual([...jenis].sort(), ['berubah', 'proporsional', 'sudutTetap']);
  assert.ok(L.minCoba >= 4);
  assertGuided(D.ubah.tanya, 'ubah.tanya', 3);
});

test('olahSisi: langkah sesuai engine & konsep', () => {
  assertLangkah(D.olahSisi.langkah, 'olahSisi.langkah');
  assertGuided(D.olahSisi.konsep, 'olahSisi.konsep', 2);
});

test('olahSudut: langkah, pemilahan sesuai bandingUbahPP, konsep', () => {
  const O = D.olahSudut;
  assertLangkah(O.langkah, 'olahSudut.langkah');
  O.langkah.forEach((s) => assert.equal(s.cek.minta, 'sudutBaru'));
  assertOptions(O.opsiKlas, 'opsiKlas', 2);
  assert.equal(new Set(ids(O.pilah)).size, O.pilah.length);
  assert.ok(O.pilah.length >= 6);
  O.pilah.forEach((p) => {
    const b = bangun(p.bangun);
    const r = E.bandingUbahPP(b, E.ubahBangunPP(b, p.aksi));
    assert.equal(p.correct, r.jenis === 'proporsional' ? 'ya' : 'tidak', p.id + ': kunci');
  });
  assert.ok(O.pilah.some((p) => p.correct === 'ya'));
  assert.ok(O.pilah.some((p) => p.correct === 'tidak'));
  assertGuided(O.konsep, 'olahSudut.konsep', 2);
});

test('verifikasi: bangun baru, prediksi, langkah, miskonsepsi', () => {
  const V = D.verifikasi;
  const b = bangun(V.bangun);
  assert.ok(!D.ubah.lab.bangun.includes(V.bangun), 'bangun baru, bukan dari lab');
  assertSudutBulat(E.skalakanBangun(b, V.k), 'verifikasi');
  assertOptions(V.opsiPrediksi, 'opsiPrediksi', 4);
  assert.ok(ids(V.opsiPrediksi).includes(V.prediksiBenar));
  assertLangkah(V.langkah, 'verifikasi.langkah');
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
    if (s.gambar) {
      const b = bangun(s.gambar.bangun);
      if (s.gambar.aksi) E.ubahBangunPP(b, s.gambar.aksi);
    }
    if (s.type === 'input') {
      assertCek(s.cek, s.id);
      assert.ok(s.hints && s.hints.length, s.id + ': petunjuk');
      const kunci = E.jawabSoalPP(s);
      assert.ok(s.explanation.includes(kunci), s.id + ': pembahasan memuat ' + kunci);
    } else if (s.cek) {
      assertCek(s.cek, s.id);
      const o = E.opsiSoalPP(s);
      assertOptions(o, s.id, 4);
      assert.equal(o.filter((x) => x.id === 'baku').length, 1);
      assert.ok(s.explanation.includes(E.jawabSoalPP(s)), s.id + ': pembahasan memuat kunci');
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
  ['ensureShuffledOrder', 'ensureSortStates', 'shuffleArray', 'opsiSoalPP'].forEach((f) =>
    assert.ok(APP.includes(f + '('), 'app memakai ' + f)
  );
  assert.ok(/optionOrder:\s*\S*shuffleArray\(/.test(APP), 'optionOrder diacak');
  assert.ok(APP.includes("STORAGE_KEY = 'mpi-24-1-ppb-v1'"));
  /* buildChoiceGroup selalu diberi urutan tersimpan (argumen kedua bukan null) */
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*([^,)]+)/g) || [];
  assert.ok(panggilan.length >= 3);
  panggilan.forEach((p) => assert.ok(!/,\s*null\s*$/.test(p), 'urutan acak: ' + p));
});
