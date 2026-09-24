'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-2.2/data.js (Sₙ deret geometri,
 * PBL): kunci jawaban harus cocok dengan rumus deret di shared/engine.js,
 * setiap daftar pilihan punya id unik dan cukup opsi untuk diacak, dan
 * setiap opsi pertanyaan penuntun punya umpan balik.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-2.2/data.js']);
const D = E.DATA;
const A = D.paket.A;
const B = D.paket.B;

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

function assertSteps(list, name) {
  list.forEach((s, i) => {
    assert.ok(s.label, name + '[' + i + '].label');
    assert.equal(typeof s.jawab, 'number', name + '[' + i + '].jawab');
    assert.ok(Array.isArray(s.hints) && s.hints.length, name + '[' + i + '].hints');
  });
}

function jumlahPaket(p, n) {
  return p.r ? E.jumlahGeometri(p.a, p.r, n) : E.jumlahAritmetika(p.a, p.b, n);
}

test('setiap tahap punya kepala tahap & catatan guru', () => {
  [
    'orientasi',
    'organisasi',
    'selidikPola',
    'selidikBukti',
    'ujiRumus',
    'latih',
    'karya',
    'evaluasi',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k], 'DATA.' + k);
    ['kicker', 'syntax', 'goal', 'guru', 'nextLabel'].forEach((f) =>
      assert.ok(D[k][f], 'DATA.' + k + '.' + f)
    );
  });
});

test('paket: A aritmetika, B geometri; konflik kognitif bergantung n', () => {
  assert.equal(E.jenisDeret(E.daftarSuku('aritmetika', A.a, A.b, 5)), 'aritmetika');
  assert.equal(E.jenisDeret(E.daftarSuku('geometri', B.a, B.r, 5)), 'geometri');
  assert.ok(jumlahPaket(A, 6) > jumlahPaket(B, 6), 'A unggul untuk 6 bulan');
  assert.ok(jumlahPaket(B, 7) > jumlahPaket(A, 7), 'B unggul untuk 7 bulan');
  assert.equal(D.karya.titikBalikN, 7);
  for (let n = 1; n < 7; n++) assert.ok(jumlahPaket(A, n) > jumlahPaket(B, n), 'n=' + n);
});

test('orientasi: dugaan acak dan jawaban pembanding sesuai rumus', () => {
  const O = D.orientasi;
  assertOptions(O.opsi, 'orientasi.opsi', 3);
  assert.ok(ids(O.opsi).includes(O.dugaanBenar));
  const unggul = jumlahPaket(B, O.dugaanN) > jumlahPaket(A, O.dugaanN) ? 'B' : 'A';
  assert.equal(O.dugaanBenar, unggul);
});

test('organisasi: peran, pilah informasi, urutan rencana', () => {
  const G = D.organisasi;
  assert.ok(G.peran.length >= 3);
  assert.equal(new Set(ids(G.peran)).size, G.peran.length);
  assertSort(G.info, G.infoOpsi, 'organisasi.info');
  assert.ok(G.rencana.length >= 4);
  assert.equal(new Set(ids(G.rencana)).size, G.rencana.length);
  assert.deepEqual([...G.rencanaUrut].sort(), [...ids(G.rencana)].sort());
});

test('selidikPola: jenis pola, tabel, pilah pernyataan', () => {
  const P = D.selidikPola;
  assertGuidedList(P.pertanyaan, 'selidikPola.pertanyaan');
  assert.ok(P.tabelN >= 4);
  assertSort(P.pilah, P.pilahOpsi, 'selidikPola.pilah');
});

test('selidikBukti: langkah bukti cocok dengan deret paket B', () => {
  const K = D.selidikBukti;
  const terms = E.daftarSuku('geometri', K.a, K.r, K.n);
  assert.equal(E.jenisDeret(terms), 'geometri');
  assertSteps(K.langkah, 'selidikBukti.langkah');
  /* langkah terakhir: Sₙ dari r·Sₙ − Sₙ */
  const akhir = K.langkah[K.langkah.length - 1];
  assert.equal(akhir.jawab, E.jumlahGeometri(K.a, K.r, K.n));
  assert.equal(K.a * 1000, B.a, 'deret bukti = paket B dalam ribu rupiah');
  assertGuidedList(K.pertanyaan, 'selidikBukti.pertanyaan');
});

test('ujiRumus: deret uji, langkah, dan bank simpulan', () => {
  const U = D.ujiRumus;
  U.deret.forEach((d) =>
    assert.equal(E.jenisDeret(E.daftarSuku('geometri', d.a, d.r, 4)), 'geometri')
  );
  assert.equal(new Set(ids(U.deret)).size, U.deret.length);
  assertSteps(U.uji, 'ujiRumus.uji');
  U.uji.forEach((s) => {
    if (s.cek) assert.equal(s.jawab, E.jumlahGeometri(s.cek.a, s.cek.r, s.cek.n), s.label);
  });
  const bankIds = ids(U.bank);
  assert.equal(new Set(bankIds).size, bankIds.length);
  assert.ok(U.bank.length > U.kalimat.length, 'ada potongan pengecoh');
  U.kalimat.forEach((k) => assert.ok(bankIds.includes(k.correct), k.id));
});

test('latih: kunci jawaban soal isian sesuai rumus, soal pilihan valid', () => {
  const soal = D.latih.soal;
  assert.ok(soal.length >= 6);
  let aritmetika = 0;
  let geometri = 0;
  soal.forEach((s, i) => {
    const nama = 'latih.soal[' + i + ']';
    if (s.deret) {
      if (s.deret.jenis === 'aritmetika') aritmetika += 1;
      else geometri += 1;
    }
    if (s.type === 'choice') {
      assertOptions(s.options, nama, 3);
      assert.ok(ids(s.options).includes(s.correct), nama + ': correct ada di opsi');
      assert.ok(s.explanation, nama + ': penjelasan');
      return;
    }
    assert.equal(typeof s.jawab, 'number', nama);
    assert.ok(s.reveal, nama + ': reveal');
    const d = s.deret;
    assert.ok(d, nama + ': metadata deret');
    if (d.target !== undefined) {
      const f = d.jenis === 'geometri' ? E.jumlahGeometri : E.jumlahAritmetika;
      assert.equal(f(d.a, d.beda, s.jawab), d.target, nama + ': n yang dicari');
    } else if (d.jenis === 'geometri') {
      assert.equal(s.jawab, E.jumlahGeometri(d.a, d.beda, d.n), nama);
    } else {
      assert.equal(s.jawab, E.jumlahAritmetika(d.a, d.beda, d.n), nama);
    }
  });
  assert.ok(aritmetika >= 1 && geometri >= 3, 'campuran deret aritmetika & geometri');
});

test('latih: jawaban benar soal pilihan cocok dengan metadata', () => {
  D.latih.soal
    .filter((s) => s.type === 'choice' && s.deret && s.deret.n)
    .forEach((s) => {
      const d = s.deret;
      const f = d.jenis === 'geometri' ? E.jumlahGeometri : E.jumlahAritmetika;
      assert.equal(s.options.find((o) => o.id === s.correct).nilai, f(d.a, d.beda, d.n));
    });
});

test('karya: perhitungan total paket, titik balik, rekomendasi', () => {
  const K = D.karya;
  assertSteps(K.hitung, 'karya.hitung');
  K.hitung.forEach((h) => assert.equal(h.jawab, jumlahPaket(D.paket[h.paket], h.n), h.label));
  assertGuided(K.titikBalik, 'karya.titikBalik');
  assert.equal(K.titikBalik.opsi.find((o) => o.id === K.titikBalik.correct).nilai, K.titikBalikN);
  assertGuided(K.rekomendasi, 'karya.rekomendasi');
});

test('evaluasi: pendapat teman & masalah transfer', () => {
  const V = D.evaluasi;
  assertSort(V.pendapat, V.pendapatOpsi, 'evaluasi.pendapat');
  assertSteps([V.transfer], 'evaluasi.transfer');
  const c = V.transfer.cek;
  assert.equal(V.transfer.jawab, E.jumlahGeometri(c.a, c.r, c.n));
});

test('refleksi: pertanyaan & penilaian diri', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'refleksi.diriOpsi', 3);
  assert.ok(D.selesai.capaian.length >= 3);
});
