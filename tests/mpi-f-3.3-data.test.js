'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-3.3/data.js (membandingkan bunga
 * tunggal & bunga majemuk, Problem Based Learning): kunci jawaban harus
 * cocok dengan fungsi bunga di shared/engine.js (seksi 22–24), setiap
 * daftar pilihan punya id unik dan cukup opsi untuk diacak, setiap opsi
 * pertanyaan penuntun punya umpan balik, dan app.js benar-benar
 * mengacak setiap daftar pilihan jawaban murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-3.3/data.js']);
const D = E.DATA;
const K = D.kasus;
/* Tanpa spasi agar pemeriksaan tidak bergantung pada pemenggalan baris Prettier. */
const tanpaSpasi = (s) => s.replace(/\s+/g, '').replace(/,\)/g, ')');
const APP = tanpaSpasi(fs.readFileSync(path.join(ROOT, 'fase-f/mpi-3.3/app.js'), 'utf8'));

const TAWARAN = [
  { id: 'A', jenis: 'tunggal', M0: K.M0, i: K.tunggal.i },
  { id: 'B', jenis: 'majemuk', M0: K.M0, i: K.majemuk.i },
];

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 3);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertGuidedList(list, name) {
  list.forEach((q) => assertGuided(q, name + '.' + q.id));
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertSort(items, options, name) {
  assertOptions(options, name + '.opsi', 2);
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(ids(options).includes(it.correct), name + '.' + it.id + ': kategori valid');
    assert.ok(it.explanation, name + '.' + it.id + ': ada penjelasan');
  });
}

/* Nilai yang diharapkan dari metadata `cek`. */
function nilaiCek(c) {
  if (c.jenis === 'tunggal') return E.nilaiAkhirBungaTunggal(c.M0, c.i, c.n);
  if (c.jenis === 'majemuk') return E.nilaiAkhirBungaMajemuk(c.M0, c.i, c.n);
  if (c.jenis === 'bungaTunggal') return E.bungaTunggal(c.M0, c.i, c.n);
  if (c.jenis === 'bungaMajemuk') return E.bungaMajemuk(c.M0, c.i, c.n);
  if (c.jenis === 'selisih') return E.bandingTawaran(c.M0, c.iT, c.iM, c.n).selisih;
  throw new Error('jenis cek tidak dikenal: ' + c.jenis);
}

function assertSteps(list, name) {
  list.forEach((s, i) => {
    const nm = name + '[' + i + ']';
    assert.ok(s.label, nm + '.label');
    assert.equal(typeof s.jawab, 'number', nm + '.jawab');
    assert.ok(Number.isInteger(s.jawab), nm + ': jawab bulat');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    assert.ok(s.cek, nm + '.cek (metadata kunci)');
    assert.equal(s.jawab, nilaiCek(s.cek), nm + ': jawab = rumus');
  });
}

test('setiap tahap punya kepala tahap, sintaks PBL & catatan guru', () => {
  [
    'orientasi',
    'organisasi',
    'selidikCara',
    'selidikSalip',
    'latih',
    'karya',
    'evaluasi',
    'refleksi',
  ].forEach((k) => {
    const s = D[k];
    assert.ok(s, k);
    assert.ok(s.kicker && s.goal && s.guru && s.syntax, k + ': kicker/goal/guru/syntax');
    if (k !== 'refleksi') assert.match(s.syntax, /Problem Based Learning/, k);
  });
});

test('kasus: bunga tunggal unggul di awal, bunga majemuk menyalip', () => {
  assert.ok(K.tunggal.i > K.majemuk.i, 'suku bunga tunggal lebih tinggi');
  const salip = E.periodeMenyalip(K.M0, K.tunggal.i, K.majemuk.i, 10);
  assert.equal(salip, K.salipN);
  assert.ok(K.jangka.pendek < salip && K.jangka.panjang >= salip, 'jangka mengapit titik salip');
  /* Semua saldo tahun 1..jangka panjang bernilai bulat rupiah. */
  for (let n = 1; n <= K.jangka.panjang; n++) {
    const b = E.bandingTawaran(K.M0, K.tunggal.i, K.majemuk.i, n);
    assert.ok(Number.isInteger(b.tunggal) && Number.isInteger(b.majemuk), 'bulat n=' + n);
  }
});

test('orientasi: dugaan acak dengan kunci sesuai perhitungan', () => {
  const O = D.orientasi;
  assertOptions(O.opsi, 'orientasi.opsi', 3);
  assert.ok(ids(O.opsi).includes(O.dugaanBenar));
  assert.equal(E.tawaranTerbaik(TAWARAN, O.dugaanN, 'simpan').id, O.dugaanBenar);
});

test('organisasi: peran, pilah info, rencana', () => {
  const G = D.organisasi;
  assert.ok(G.peran.length >= 3);
  assertSort(G.info, G.infoOpsi, 'organisasi.info');
  assert.ok(G.rencana.length >= 4);
  assert.equal(new Set(ids(G.rencana)).size, G.rencana.length);
  assert.deepEqual([...G.rencanaUrut].sort(), [...ids(G.rencana)].sort());
});

test('selidikCara: tabel, pertanyaan penuntun, pilah ciri tunggal/majemuk/keduanya', () => {
  const S = D.selidikCara;
  assert.ok(S.tabelN >= 3);
  assert.ok(S.hintsTabel.length >= 2);
  assertGuidedList(S.pertanyaan, 'selidikCara.pertanyaan');
  assertSort(S.pilah, S.pilahOpsi, 'selidikCara.pilah');
  assert.equal(S.pilahOpsi.length, 3, 'tiga kategori: tunggal, majemuk, keduanya');
  S.pilahOpsi.forEach((o) =>
    assert.ok(
      S.pilah.some((p) => p.correct === o.id),
      'ada butir untuk kategori ' + o.id
    )
  );
});

test('selidikSalip: duel, pertanyaan salip & langkah hitung', () => {
  const S = D.selidikSalip;
  assert.ok(S.maxN > K.salipN && S.syaratMaks >= K.salipN);
  assertGuidedList(S.pertanyaan, 'selidikSalip.pertanyaan');
  const qSalip = S.pertanyaan.find((q) => q.id === 'salip');
  assert.equal(qSalip.opsi.find((o) => o.id === qSalip.correct).nilai, K.salipN);
  assertSteps(S.langkah, 'selidikSalip.langkah');
});

test('latih: kunci soal isian sesuai rumus, soal pilihan valid & sesuai tujuan', () => {
  const soal = D.latih.soal;
  assert.ok(soal.length >= 7);
  let pinjam = 0;
  soal.forEach((s, i) => {
    const nama = 'latih.soal[' + i + ']';
    assert.ok(s.cerita && s.pertanyaan, nama + ': cerita & pertanyaan');
    if (s.type === 'choice') {
      assertOptions(s.options, nama, 3);
      assert.ok(ids(s.options).includes(s.correct), nama + ': correct ada di opsi');
      assert.ok(s.explanation, nama + ': penjelasan');
      if (s.tawaran) {
        const best = E.tawaranTerbaik(s.tawaran.list, s.tawaran.n, s.tawaran.tujuan);
        assert.equal(best.id, s.correct, nama + ': tawaran terbaik');
        if (s.tawaran.tujuan === 'pinjam') pinjam += 1;
      }
      return;
    }
    assert.equal(typeof s.jawab, 'number', nama);
    assert.ok(s.reveal, nama + ': reveal');
    assert.ok(s.hints && s.hints.length, nama + ': hints');
    const c = s.cek;
    assert.ok(c, nama + ': metadata cek');
    if (c.jenis === 'nTunggal') {
      assert.equal(E.nilaiAkhirBungaTunggal(c.M0, c.i, s.jawab), c.target, nama + ': n');
    } else {
      assert.equal(s.jawab, nilaiCek(c), nama);
    }
  });
  assert.ok(pinjam >= 1, 'ada masalah pinjaman');
  const jenis = new Set(soal.filter((s) => s.cek).map((s) => s.cek.jenis));
  assert.ok(jenis.size >= 4, 'variasi jenis perhitungan');
});

test('karya: perhitungan dua jangka, rekomendasi sesuai tawaran terbaik', () => {
  const Y = D.karya;
  assertSteps(Y.hitung, 'karya.hitung');
  const jangka = new Set(Y.hitung.map((h) => h.cek.n));
  assert.ok(jangka.has(K.jangka.pendek) && jangka.has(K.jangka.panjang));
  assertGuided(Y.rekomPendek, 'karya.rekomPendek');
  assertGuided(Y.rekomPanjang, 'karya.rekomPanjang');
  assertGuided(Y.rekomendasi, 'karya.rekomendasi');
  assert.equal(E.tawaranTerbaik(TAWARAN, K.jangka.pendek, 'simpan').id, Y.rekomPendek.correct);
  assert.equal(E.tawaranTerbaik(TAWARAN, K.jangka.panjang, 'simpan').id, Y.rekomPanjang.correct);
});

test('evaluasi: pendapat teman & masalah transfer pinjaman', () => {
  const V = D.evaluasi;
  assertSort(V.pendapat, V.pendapatOpsi, 'evaluasi.pendapat');
  assertSteps([V.transfer], 'evaluasi.transfer');
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'refleksi.diriOpsi', 3);
  assert.ok(D.selesai.capaian.length >= 3);
});

test('app.js mengacak setiap daftar pilihan jawaban murid', () => {
  [
    "ensureShuffledOrder(State, 'orientasiOrder', DATA.orientasi.opsi)",
    "ensureSortStates(State, 'infoStates', 'infoOrder'",
    "ensureTapOrderState(State, 'rencana'",
    'ensureShuffledOrder(State.caraOrders, q.id, q.opsi)',
    "ensureSortStates(State, 'pilahStates', 'pilahOrder'",
    'ensureShuffledOrder(State.salipOrders, q.id, q.opsi)',
    'shuffleArray(optionIds(s.options))',
    'ensureShuffledOrder(State.karyaOrders, q.id, q.opsi)',
    "ensureSortStates(State, 'pendapatStates', 'pendapatOrder'",
    "ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi)",
  ].forEach((frag) => assert.ok(APP.includes(tanpaSpasi(frag)), 'app.js mengacak: ' + frag));
});
