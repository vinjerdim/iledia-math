'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-2.1/data.js (Penjumlahan &
 * pengurangan bilangan bulat dalam masalah kontekstual): kunci jawaban
 * setiap dugaan/percobaan/soal harus cocok dengan engine seksi 17
 * (hasilOperasiBulat, integerJumps, arahLompatan, kalimatPerubahan,
 * selisihBulat), setiap daftar pilihan punya id unik dan cukup opsi
 * untuk diacak, serta jumlah tahap sama dengan manifest halaman.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-2.1/data.js']);
const D = E.DATA;
const KONTEKS = ['suhu', 'ketinggian', 'saldo'];

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

function assertGuided(list, name) {
  assert.ok(list.length >= 2, name + ': minimal dua pertanyaan');
  list.forEach((q) => {
    assert.ok(q.tanya, name + '.' + q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), name + '.' + q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + '.' + q.id + ': umpan untuk ' + o.id));
  });
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Langkah isian hasil operasi { id, a, op, b, jawab, label, hints }. */
function assertHitung(list, name, op) {
  assert.ok(list.length >= 3, name + ': minimal tiga isian');
  list.forEach((s) => {
    if (op) assert.equal(s.op, op, name + '.' + s.id + ': operasi');
    assert.equal(E.hasilOperasiBulat(s.a, s.op, s.b), s.jawab, name + '.' + s.id + ': kunci');
    assert.ok(
      s.label.includes(E.fmtOperasiBulat(s.a, s.op, s.b)),
      name + '.' + s.id + ': label memuat kalimat'
    );
    assert.ok(s.hints.length >= 1, name + '.' + s.id + ': hints');
  });
}

/* Model cerita { jenis: 'perubahan'|'selisih', ... } sama dengan engine. */
function assertModel(s, name) {
  let m;
  if (s.jenis === 'perubahan') m = E.kalimatPerubahan(s.awal, s.arah, s.besar);
  else if (s.jenis === 'selisih') m = E.selisihBulat(s.p, s.q);
  else assert.fail(name + ': jenis model tidak dikenal');
  assert.equal(s.a, m.a, name + ': a');
  assert.equal(s.op, m.op, name + ': op');
  assert.equal(s.b, m.b, name + ': b');
  assert.equal(s.jawab, m.hasil, name + ': kunci = engine');
  return m;
}

test('sebelas tahap: setiap tahap punya konten & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-2.1'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 11);
  assert.equal(new Set(ids(D.tahap)).size, 11);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  KONTEKS.forEach((k) => assert.ok(D.konteks[k].ikon && D.konteks[k].nama, 'konteks ' + k));
});

test('stimulasi: tiga konteks, dugaan tidak dinilai tetapi kunci baku cocok engine', () => {
  const S = D.stimulasi;
  assert.deepEqual([...S.kabar.map((k) => k.konteks)].sort(), KONTEKS.slice().sort());
  S.kabar.forEach((k) => assert.ok(k.ikon && k.sumber && k.teks && k.sorot, k.id));
  assert.equal(S.dugaan.length, S.kabar.length);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    const baku = q.opsi.find((o) => o.id === q.baku);
    assert.ok(baku, q.id + ': baku ada di opsi');
    assert.equal(baku.nilai, E.hasilOperasiBulat(q.a, q.op, q.b), q.id + ': baku = engine');
    assert.equal(new Set(q.opsi.map((o) => o.nilai)).size, 4, q.id + ': nilai opsi berbeda');
    assert.ok(q.pembahasan.includes(E.fmtOperasiBulat(q.a, q.op, q.b)), q.id + ': pembahasan');
  });
  assert.equal(new Set(ids(S.dugaan)).size, S.dugaan.length);
});

test('masalah: pertanyaan inti ada di opsi dengan umpan tiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
});

test('koleksi: percobaan simulator cocok engine & muat di garis bilangan', () => {
  const K = D.koleksi;
  const P = K.percobaan;
  assert.ok(P.length >= 6);
  assert.equal(new Set(ids(P)).size, P.length);
  const r = K.rentang;
  const g = K.garis;
  P.forEach((p) => {
    assert.ok(KONTEKS.includes(p.konteks), p.id + ': konteks');
    assert.ok(['+', '-'].includes(p.op), p.id + ': op');
    assert.equal(E.hasilOperasiBulat(p.a, p.op, p.b), p.jawab, p.id + ': kunci');
    [p.a, p.b].forEach((v) => assert.ok(v >= r.min && v <= r.max, p.id + ': dalam stepper'));
    assert.ok(p.jawab >= g.min && p.jawab <= g.max, p.id + ': hasil di garis');
    assert.ok(p.cerita && p.temuan && p.hints.length >= 1, p.id + ': cerita/temuan/hints');
  });
  assert.ok(
    P.some((p) => p.op === '+' && p.b > 0),
    'ada tambah positif'
  );
  assert.ok(
    P.some((p) => p.op === '+' && p.b < 0),
    'ada tambah negatif'
  );
  assert.ok(
    P.some((p) => p.op === '-' && p.b < 0),
    'ada kurang negatif'
  );
  assert.ok(
    P.some((p) => p.jawab === 0),
    'ada hasil nol'
  );
  KONTEKS.forEach((k) =>
    assert.ok(
      P.some((p) => p.konteks === k),
      'konteks ' + k
    )
  );
  assert.ok(K.simAwal.a >= r.min && K.simAwal.a <= r.max);
  assertGuided(K.amati, 'koleksi.amati');
});

test('olahJumlah: arah lompatan = arahLompatan & isian penjumlahan', () => {
  const J = D.olahJumlah;
  assertOptions(J.opsiArah, 'opsiArah', 3);
  assert.ok(J.pilah.length >= 6);
  assert.equal(new Set(ids(J.pilah)).size, J.pilah.length);
  const kat = new Set();
  J.pilah.forEach((it) => {
    assert.equal(it.teks, E.fmtOperasiBulat(it.a, '+', it.b), it.id + ': teks');
    assert.equal(it.correct, E.arahLompatan(it.b), it.id + ': arah');
    assert.ok(ids(J.opsiArah).includes(it.correct), it.id + ': kategori valid');
    assert.ok(
      it.explanation.includes(E.fmtBulat(it.a + it.b)),
      it.id + ': pembahasan memuat hasil'
    );
    kat.add(it.correct);
  });
  assert.equal(kat.size, 3, 'ketiga arah muncul');
  assertGuided(J.pola, 'olahJumlah.pola');
  assertHitung(J.hitung, 'olahJumlah.hitung', '+');
  assert.ok(J.temuan.length >= 2);
});

test('olahKurang: tabel pola 5 − b, pasangan bentuk setara, isian pengurangan', () => {
  const K = D.olahKurang;
  const baris = K.polaBaris;
  assert.ok(baris.length >= 7);
  baris.forEach((r, i) => {
    assert.equal(r.a, baris[0].a, r.id + ': bilangan pertama tetap');
    assert.equal(r.op, '-', r.id + ': operasi pengurangan');
    assert.equal(E.hasilOperasiBulat(r.a, r.op, r.b), r.jawab, r.id + ': kunci = engine');
    if (i > 0) assert.equal(r.b, baris[i - 1].b - 1, r.id + ': pengurang turun satu');
    assert.ok(r.label.includes(E.fmtOperasiBulat(r.a, '-', r.b)), r.id + ': label');
    assert.equal(r.jawab, r.a - r.b, r.id + ': kunci');
  });
  const tampil = baris.filter((r) => r.tampil);
  const isi = baris.filter((r) => !r.tampil);
  assert.ok(tampil.length >= 3 && tampil.every((r) => r.b >= 0), 'pola awal dari pengurang ≥ 0');
  assert.ok(isi.length >= 3 && isi.every((r) => r.b < 0), 'murid melengkapi pengurang negatif');
  isi.forEach((r) => assert.ok(r.hints.length >= 1, r.id + ': hints'));

  assertGuided(K.pasang, 'olahKurang.pasang');
  K.pasang.forEach((q) => {
    const benar = q.opsi.find((o) => o.id === q.correct);
    assert.equal(benar.label, E.integerJumps(q.a, '-', q.b).setara, q.id + ': bentuk setara');
    assert.ok(q.tanya.includes(E.fmtOperasiBulat(q.a, '-', q.b)), q.id + ': tanya memuat soal');
  });
  assertHitung(K.hitung, 'olahKurang.hitung', '-');
  assert.ok(K.temuan.length >= 2);
});

test('olahModel: kalimat matematika dari cerita cocok engine, mencakup tiga konteks', () => {
  const M = D.olahModel;
  assert.ok(M.soal.length >= 4);
  assert.equal(new Set(ids(M.soal)).size, M.soal.length);
  M.soal.forEach((s) => {
    const m = assertModel(s, s.id);
    assert.ok(KONTEKS.includes(s.konteks), s.id + ': konteks');
    assertOptions(s.opsi, s.id, 4);
    const benar = s.opsi.find((o) => o.id === s.correct);
    assert.equal(benar.label, m.teks, s.id + ': opsi benar = kalimat engine');
    s.opsi.forEach((o) => assert.ok(s.umpan[o.id], s.id + ': umpan ' + o.id));
    assert.ok(s.cerita && s.tanya && s.temuan && s.hints.length >= 1, s.id);
  });
  KONTEKS.forEach((k) =>
    assert.ok(
      M.soal.some((s) => s.konteks === k),
      'konteks ' + k
    )
  );
  assert.ok(
    M.soal.some((s) => s.jenis === 'selisih'),
    'ada soal selisih'
  );
  assert.ok(
    M.soal.some((s) => s.jenis === 'perubahan'),
    'ada soal perubahan'
  );
});

test('verifikasi: pernyataan benar & salah', () => {
  const V = D.verifikasi;
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 2);
  assert.ok(V.pernyataan.length >= 6);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  const kunci = new Set();
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id);
    assert.ok(p.teks && p.explanation, p.id);
    kunci.add(p.correct);
  });
  assert.equal(kunci.size, 2, 'ada pernyataan benar dan salah');
});

test('generalisasi: setiap kalimat punya potongan benar yang unik & ada pengecoh', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  const dipakai = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(dipakai).size, dipakai.length, 'potongan benar tidak ganda');
  dipakai.forEach((c) => assert.ok(bank.includes(c), c));
  assert.ok(bank.length - dipakai.length >= 2, 'minimal dua pengecoh');
  G.bank.forEach((b) => assert.ok(b.teks, b.id));
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: bank soal cukup untuk komposisi acak & kunci cocok engine', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length, 'id soal unik');
  let total = 0;
  Object.keys(T.komposisi).forEach((k) => {
    const ada = T.soal.filter((s) => s.type === k).length;
    assert.ok(ada > T.komposisi[k], k + ': bank lebih banyak dari yang diambil agar teracak');
    total += T.komposisi[k];
  });
  assert.equal(total, T.banyak);
  T.soal.forEach((s) => {
    assert.ok(KONTEKS.includes(s.konteks), s.id + ': konteks');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    if (s.type === 'choice') {
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada');
    } else {
      assert.equal(s.type, 'input', s.id + ': type');
      const m = assertModel(s, s.id);
      assert.ok(s.reveal.includes(m.teks), s.id + ': reveal memuat kalimat');
      assert.ok(s.reveal.includes(E.fmtBulat(s.jawab)), s.id + ': reveal memuat hasil');
      assert.ok(s.hints.length >= 1, s.id + ': hints');
    }
  });
  KONTEKS.forEach((k) =>
    assert.ok(
      T.soal.filter((s) => s.konteks === k && s.type === 'input').length >= 3,
      'minimal tiga isian ' + k
    )
  );
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 3);
  D.selesai.contoh.forEach((c) => assert.ok(KONTEKS.includes(c.konteks), 'contoh ' + c.konteks));
});
