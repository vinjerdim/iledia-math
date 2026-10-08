'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-2.7/data.js (Literasi finansial:
 * diskon, untung–rugi & anggaran sederhana, PBL): kunci jawaban setiap
 * langkah/soal harus cocok dengan engine seksi 66 (jawabFinansial,
 * diagnosaFinansial, opsiFinansial, hargaPromo, untungRugi,
 * periksaAnggaran), setiap daftar pilihan punya id unik dan cukup opsi
 * untuk diacak, serta jumlah tahap sama dengan manifest halaman.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-2.7/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-2.7', 'app.js'), 'utf8');

const JENIS = [
  'diskonAkhir',
  'diskonPotongan',
  'diskonSetara',
  'promo',
  'untungBesar',
  'untungPersen',
  'hargaJual',
  'sisaAnggaran',
  'persenPos',
  'nilai',
];

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  const labels = list.map((o) => o.label || o.teks);
  labels.forEach((l, i) => assert.ok(l, name + '.' + list[i].id + ': label'));
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus berbeda');
}

function assertGuided(list, name, min) {
  assert.ok(list.length >= (min || 1), name + ': ada pertanyaan');
  list.forEach((q) => {
    assert.ok(q.tanya, name + '.' + q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), name + '.' + q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + '.' + q.id + ': umpan untuk ' + o.id));
  });
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertSort(items, options, name) {
  assertOptions(options, name + '.opsi');
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(it.teks && it.explanation, name + '.' + it.id + ': teks & penjelasan');
    assert.ok(ids(options).includes(it.correct), name + '.' + it.id + ': kategori benar ada');
  });
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Langkah isian { id, jenis, label, hints }: kunci terdefinisi & lolos diagnosa. */
function assertLangkah(list, name, min) {
  assert.ok(list.length >= (min || 2), name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    assert.ok(JENIS.includes(s.jenis), name + '.' + s.id + ': jenis dikenal');
    assert.ok(s.label, name + '.' + s.id + ': label');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, name + '.' + s.id + ': petunjuk');
    const kunci = E.jawabFinansial(s);
    assert.ok(Number.isFinite(kunci), name + '.' + s.id + ': kunci angka');
    assert.equal(E.diagnosaFinansial(String(kunci), s).kode, 'benar', name + '.' + s.id);
    assert.equal(
      E.diagnosaFinansial(E.fmtJawabFinansial(s), s).kode,
      'benar',
      name + '.' + s.id + ': jawaban berformat diterima'
    );
  });
}

test('sepuluh tahap PBL: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-2.7'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  const sintaks = {
    orientasi: 1,
    organisasi: 2,
    selidikDiskon: 3,
    selidikUntung: 3,
    selidikAnggaran: 3,
    karya: 4,
    evaluasi: 5,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Problem Based Learning · Sintaks ' + n, id);
  });
});

test('data masalah: harga promo, modal, dan target untung saling konsisten', () => {
  const B = D.barang;
  const [maju, rejeki] = D.toko;
  const harga = (t, k) => E.hargaPromo({ harga: B[k].harga, ...t.promo[k] }, B[k].qty).total;
  assert.equal(harga(maju, 'bahan'), 180000);
  assert.equal(harga(rejeki, 'bahan'), 175000);
  assert.equal(harga(maju, 'cup'), 60000);
  assert.equal(harga(rejeki, 'cup'), 64000);
  const modal =
    Math.min(harga(maju, 'bahan'), harga(rejeki, 'bahan')) +
    Math.min(harga(maju, 'cup'), harga(rejeki, 'cup')) +
    B.pelengkap.biaya;
  assert.equal(modal, D.usaha.modal);
  const pokok = D.usaha.modal / D.usaha.gelas;
  assert.equal(E.hargaJualDariPersen(pokok, D.usaha.targetPersen, 'untung'), D.usaha.hargaJual);
  const sepi = E.untungRugi(D.usaha.modal, D.usaha.hargaJual * D.usaha.terjualSepi);
  assert.equal(sepi.status, 'rugi');
  /* rincian modal di tahap untung–rugi = modal */
  const rincian = D.selidikUntung.modalRincian.reduce((s, r) => s + r.nilai, 0);
  assert.equal(rincian, D.usaha.modal);
  assert.equal(D.selidikUntung.timbangOpsi.modal, D.usaha.modal);
});

test('orientasi: dugaan baku cocok dengan hasil hitungan & rumusan masalah berumpan balik', () => {
  const O = D.orientasi;
  assert.ok(O.catatanKelompok.length >= 3);
  O.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
  });
  const persen = O.dugaan.find((q) => q.id === 'dUntung');
  const u = E.untungRugi(320000, 400000);
  assert.equal(persen.opsi.find((o) => o.id === persen.baku).label, E.fmtPersenFin(u.persen));
  assertOptions(O.masalahOpsi, 'masalahOpsi', 4);
  assert.ok(ids(O.masalahOpsi).includes(O.masalahCorrect));
  O.masalahOpsi.forEach((o) => assert.ok(O.masalahUmpan[o.id], 'umpan ' + o.id));
});

test('organisasi: peran, pemilahan, dan rencana kerja', () => {
  const O = D.organisasi;
  assertOptions(O.peran, 'peran', 4);
  assertSort(O.pilah, O.opsiPilah, 'pilah');
  ['diskon', 'untung', 'anggaran'].forEach((k) =>
    assert.ok(
      O.pilah.some((p) => p.correct === k),
      'ada butir ' + k
    )
  );
  assertOptions(O.rencana, 'rencana', 4);
});

test('selidik diskon: misi lab, langkah isian & temuan', () => {
  const S = D.selidikDiskon;
  assert.equal(S.labHarga, D.barang.bahan.harga);
  S.labMisi.forEach((m) => {
    assert.ok(m.p1 >= 0 && m.p1 <= 50 && m.p1 % 5 === 0, m.id + ': p1 tercapai stepper');
    assert.ok(m.p2 >= 0 && m.p2 <= 50 && m.p2 % 5 === 0, m.id + ': p2 tercapai stepper');
  });
  assertLangkah(S.langkah, 'selidikDiskon', 3);
  assert.equal(E.jawabFinansial(S.langkah.find((l) => l.jenis === 'diskonSetara')), 28);
  assertGuided(S.amati, 'amatiDiskon', 2);
});

test('selidik untung–rugi: timbangan, langkah isian & temuan', () => {
  const S = D.selidikUntung;
  const T = S.timbangOpsi;
  /* titik impas harus bisa dicapai stepper */
  const impas = D.usaha.modal / D.usaha.hargaJual;
  assert.equal(impas % T.langkahTerjual, 0, 'titik impas kelipatan langkah terjual');
  assert.equal((D.usaha.hargaJual - S.timbangAwal.jual) % T.langkahJual, 0);
  assertLangkah(S.langkah, 'selidikUntung', 3);
  const imp = S.amati.find((q) => q.id === 'aImpas');
  assert.equal(imp.opsi.find((o) => o.id === imp.correct).label, impas + ' gelas');
  assertGuided(S.amati, 'amatiUntung', 2);
});

test('selidik anggaran: draf belum memenuhi syarat, solusi ada, langkah & temuan', () => {
  const A = D.anggaran;
  const pos = (nilai) => A.pos.map((p) => ({ ...p, nilai: nilai[p.id] }));
  assert.equal(E.periksaAnggaran(A.dana, pos(A.draf), A.syarat).ok, false, 'draf harus salah');
  Object.values(A.draf).forEach((v) => assert.equal(v % A.langkah, 0, 'draf kelipatan langkah'));
  const solusi = {
    belanja: 235000,
    pelengkap: 85000,
    dekorasi: 30000,
    hadiah: 20000,
    tabungan: 100000,
  };
  assert.equal(E.periksaAnggaran(A.dana, pos(solusi), A.syarat).ok, true, 'ada solusi');
  const S = D.selidikAnggaran;
  assertSort(S.pilah, S.opsiPilah, 'kategori');
  assertLangkah(S.langkah, 'selidikAnggaran', 2);
  assertGuided(S.amati, 'amatiAnggaran', 2);
});

test('karya: enam langkah, keputusan berumpan balik', () => {
  const K = D.karya;
  assertLangkah(K.langkah, 'karya', 6);
  assert.equal(E.jawabFinansial(K.langkah.find((l) => l.id === 'k4')), D.usaha.modal);
  assert.equal(E.jawabFinansial(K.langkah.find((l) => l.id === 'k5')), D.usaha.hargaJual);
  assertGuided([K.keputusan], 'keputusan');
  assert.ok(K.pesanLabel && K.posterJudul);
});

test('evaluasi: detektif mencakup miskonsepsi, simpulan & bank berpengecoh', () => {
  const V = D.evaluasi;
  assertSort(V.klaim, V.opsiDetektif, 'detektif');
  ids(V.opsiDetektif).forEach((k) =>
    assert.ok(
      V.klaim.some((c) => c.correct === k),
      'kategori ' + k + ' terpakai'
    )
  );
  assertOptions(V.bank, 'bank', V.kalimat.length + 2);
  V.kalimat.forEach((g) => assert.ok(ids(V.bank).includes(g.correct), g.id));
  assert.equal(new Set(V.kalimat.map((g) => g.correct)).size, V.kalimat.length);
  assert.ok(V.rangkuman.length >= 3);
});

test('uji terap: bank soal valid & kunci cocok dengan engine', () => {
  const T = D.terapkan;
  assert.equal(
    Object.values(T.komposisi).reduce((a, b) => a + b, 0),
    T.banyak,
    'komposisi = banyak soal'
  );
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  Object.entries(T.komposisi).forEach(([type, n]) => {
    assert.ok(
      T.soal.filter((s) => s.type === type).length > n,
      type + ': bank lebih dari komposisi'
    );
  });
  T.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(JENIS.includes(s.jenis), s.id + ': jenis');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    const kunci = E.jawabFinansial(s);
    assert.ok(Number.isFinite(kunci), s.id + ': kunci');
    if (s.type === 'input') {
      assert.ok(s.hints.length >= 1 && s.reveal, s.id + ': petunjuk & reveal');
      assert.match(s.reveal, new RegExp(E.fmtJawabFinansial(s).replace(/[.$]/g, '\\$&')), s.id);
      assert.equal(E.diagnosaFinansial(E.fmtJawabFinansial(s), s).kode, 'benar', s.id);
    } else {
      const opsi = E.opsiFinansial(s);
      assert.ok(opsi.length >= 4 && opsi.length <= 5, s.id + ': 4–5 opsi');
      assert.equal(opsi.filter((o) => o.benar).length, 1, s.id + ': satu kunci');
      assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, s.id + ': label unik');
      assert.ok(s.explanation.includes(E.fmtJawabFinansial(s)), s.id + ': pembahasan memuat kunci');
    }
  });
});

test('refleksi & selesai lengkap', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
  D.selesai.contoh.forEach((c) => assert.ok(D.konteks[c.konteks], c.teks));
  assert.ok(D.selesai.capaian.length >= 3);
});

test('app.js mengacak setiap daftar pilihan sekali dan menyimpannya di State', () => {
  [
    /ensureListOrders\('dugaanOrders', DATA\.orientasi\.dugaan\)/,
    /ensureShuffledOrder\(State, 'masalahOrder', DATA\.orientasi\.masalahOpsi\)/,
    /ensureShuffledOrder\(State, 'peranOrder', DATA\.organisasi\.peran\)/,
    /ensureSortStates\(State, 'pilahStates', 'pilahOrder'/,
    /ensureTapOrderState\(State, 'rencana', RENCANA_ITEMS, RENCANA_JAWAB\)/,
    /ensureListOrders\('amatiDiskonOrders', DATA\.selidikDiskon\.amati\)/,
    /ensureListOrders\('amatiUntungOrders', DATA\.selidikUntung\.amati\)/,
    /ensureSortStates\([\s\S]*?'kategoriStates'/,
    /ensureListOrders\('amatiAnggaranOrders', DATA\.selidikAnggaran\.amati\)/,
    /ensureShuffledOrder\(State, 'keputusanOrder', DATA\.karya\.keputusan\.opsi\)/,
    /ensureSortStates\([\s\S]*?'detektifStates'/,
    /ensureShuffledOrder\(State, 'bankOrder', DATA\.evaluasi\.bank\)/,
    /shuffleArray\(optionIds\(s\.options\)\)/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
    /function pilihSoalTerap\(\)[\s\S]*?shuffleArray/,
  ].forEach((re) => assert.match(APP, re, String(re)));
  assert.match(APP, /mpi-d-2-7-/);
});
