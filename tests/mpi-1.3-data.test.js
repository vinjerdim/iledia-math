'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-1.3/data.js (Membaca & menuliskan
 * pecahan dalam kehidupan sehari-hari): kunci jawaban setiap
 * situasi/pengarsir/soal harus cocok dengan engine seksi 35
 * (bacaPecahanKonteks, diagnosaTulisPecahan, cekCaraBacaPecahan,
 * periksaTeksPecahan, opsiCaraBacaPecahan, opsiNotasiPecahan), setiap
 * daftar pilihan punya id unik dan cukup opsi untuk diacak, serta
 * jumlah tahap sama dengan manifest halaman.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-1.3/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + '.' + o.id + ': label'));
  const labels = list.map((o) => o.label || o.teks);
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus unik');
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

function assertPecahan(p, name) {
  assert.ok(Number.isInteger(p.num) && p.num > 0, name + ': pembilang cacah positif');
  assert.ok(Number.isInteger(p.den) && p.den > 1, name + ': penyebut > 1');
  assert.ok(p.num < p.den, name + ': pecahan murni (bagian bulat di whole)');
  assert.ok(p.whole === null || (Number.isInteger(p.whole) && p.whole > 0), name + ': whole');
  assert.equal(typeof p.neg, 'boolean', name + ': neg');
}

test('sepuluh tahap: setiap tahap punya konten & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-1.3'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => !['selesai'].includes(t.id)).forEach((t) => assertHead(D[t.id], t.id));
});

test('stimulasi: kabar berpecahan, dugaan tidak dinilai tetapi punya id baku', () => {
  const S = D.stimulasi;
  assert.ok(S.kabar.length >= 3);
  S.kabar.forEach((k) => {
    assert.ok(k.ikon && k.sumber && k.teks, k.id);
    assertPecahan(k.pecahan, 'kabar.' + k.id);
  });
  assert.equal(new Set(ids(S.kabar)).size, S.kabar.length);
  assert.ok(
    S.kabar.some((k) => k.pecahan.whole),
    'ada pecahan campuran'
  );
  assert.ok(
    S.kabar.some((k) => k.pecahan.neg),
    'ada pecahan negatif'
  );
  assert.ok(S.dugaan.length >= 3);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan untuk tahap Bukti');
  });
  assert.equal(new Set(ids(S.dugaan)).size, S.dugaan.length);
});

test('stimulasi: kunci dugaan cocok dengan engine', () => {
  const [d1, d2, d3, d4] = D.stimulasi.dugaan;
  const label = (q) => q.opsi.find((o) => o.id === q.baku).label;
  assert.ok(label(d1).includes(E.bacaPecahanKonteks(D.stimulasi.kabar[0].pecahan)));
  assert.equal(E.periksaTeksPecahan(label(d2), D.stimulasi.kabar[1].pecahan).benar, true);
  assert.ok(label(d3).includes(E.bacaPecahanKonteks(D.stimulasi.kabar[2].pecahan)));
  assert.ok(label(d4).includes(E.bacaPecahanKonteks(D.stimulasi.kabar[3].pecahan)));
});

test('masalah: pertanyaan inti ada di opsi dengan umpan tiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
});

test('koleksi: model visual = besaran jawaban, opsi cara baca unik, variasi bentuk', () => {
  const K = D.koleksi;
  assert.ok(K.situasi.length >= 6);
  assert.equal(new Set(ids(K.situasi)).size, K.situasi.length);
  K.situasi.forEach((s) => {
    assertPecahan(s.jawab, s.id);
    assert.equal(s.model.num, s.jawab.num, s.id + ': pembilang model');
    assert.equal(s.model.den, s.jawab.den, s.id + ': penyebut model');
    assert.equal(s.model.whole || null, s.jawab.whole, s.id + ': bulat model');
    assert.ok(['bar', 'circle'].includes(s.model.shape), s.id + ': bentuk model');
    assert.ok(s.label && s.keterangan && s.hints.length >= 1 && s.temuan, s.id);
    assert.ok(s.temuan.includes(E.tulisPecahan(s.jawab)), s.id + ': temuan memuat notasi');
    assert.equal(
      E.diagnosaTulisPecahan(Object.assign({}, s.jawab), s.jawab).benar,
      true,
      s.id + ': kunci diterima engine'
    );
    assertOptions(E.opsiCaraBacaPecahan(s.jawab), s.id + ': opsi cara baca', 4);
  });
  assert.ok(
    K.situasi.some((s) => s.jawab.whole),
    'ada pecahan campuran'
  );
  assert.ok(
    K.situasi.some((s) => s.jawab.neg),
    'ada pecahan negatif'
  );
  assert.ok(
    K.situasi.some((s) => s.model.shape === 'circle'),
    'ada model lingkaran'
  );
  assert.ok(
    K.situasi.some((s) => s.model.shape === 'bar'),
    'ada model pita'
  );
  assertGuided(K.amati, 'koleksi.amati');
});

test('olahBagian: pengarsir, pemilahan, dan syarat sama besar', () => {
  const B = D.olahBagian;
  assert.ok(B.arsir.length >= 2);
  assert.equal(new Set(ids(B.arsir)).size, B.arsir.length);
  B.arsir.forEach((a) => {
    assertPecahan(a.jawab, a.id);
    assert.equal(a.jawab.whole, null, a.id + ': pengarsir memakai pecahan biasa');
    assert.equal(a.jawab.neg, false, a.id);
    assert.ok(a.jawab.den <= E.FRAC_SHADER_MAX, a.id + ': muat di pengarsir');
    assert.equal(a.kata, E.bacaPecahanKonteks(a.jawab), a.id + ': kata = cara baca baku');
    assert.ok(a.konteks, a.id);
  });
  assertOptions(B.opsiPilah, 'opsiPilah', 3);
  assert.ok(B.pilah.length >= 6);
  assert.equal(new Set(ids(B.pilah)).size, B.pilah.length);
  const kat = new Set();
  B.pilah.forEach((it) => {
    assert.ok(ids(B.opsiPilah).includes(it.correct), it.id);
    assert.ok(it.teks && it.explanation, it.id);
    kat.add(it.correct);
  });
  assert.equal(kat.size, 3, 'setiap kategori terpakai');
  assertGuided(B.syarat, 'olahBagian.syarat');
  assert.ok(B.temuan.length >= 3);
});

test('olahBaca: pasangan dibuat engine, dikte & cara baca konsisten', () => {
  const B = D.olahBaca;
  assert.ok(B.pasang.length >= 4);
  assert.equal(new Set(ids(B.pasang)).size, B.pasang.length);
  const arah = new Set();
  B.pasang.forEach((q) => {
    assertPecahan(q.pecahan, q.id);
    arah.add(q.arah);
    const opsi =
      q.arah === 'baca' ? E.opsiCaraBacaPecahan(q.pecahan) : E.opsiNotasiPecahan(q.pecahan);
    assertOptions(opsi, q.id, 4);
    assert.equal(opsi.filter((o) => o.benar).length, 1, q.id + ': satu jawaban benar');
  });
  assert.deepEqual([...arah].sort(), ['baca', 'tulis']);
  assert.ok(B.tulisNotasi.length >= 3);
  B.tulisNotasi.forEach((s) => {
    assertPecahan(s.jawab, s.id);
    assert.ok(s.hints.length >= 1, s.id + ': hints');
    assert.equal(E.diagnosaTulisPecahan(Object.assign({}, s.jawab), s.jawab).benar, true);
  });
  assert.ok(B.tulisBacaan.length >= 3);
  B.tulisBacaan.forEach((s) => {
    assertPecahan(s.jawab, s.id);
    assert.ok(s.hints.length >= 1, s.id + ': hints');
    assert.equal(E.cekCaraBacaPecahan(E.bacaPecahanKonteks(s.jawab), s.jawab).kode, 'benar');
  });
  const semua = ids(B.tulisNotasi).concat(ids(B.tulisBacaan));
  assert.equal(new Set(semua).size, semua.length, 'id langkah unik');
  [B.tulisNotasi, B.tulisBacaan].forEach((list) => {
    assert.ok(
      list.some((s) => s.jawab.whole),
      'ada pecahan campuran'
    );
    assert.ok(
      list.some((s) => s.jawab.neg),
      'ada pecahan negatif'
    );
  });
  assert.ok(B.temuan.length >= 3);
});

test('verifikasi: pernyataan benar/salah', () => {
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
  const jenis = (s) => (s.type === 'choice' ? 'choice' : s.mode);
  let total = 0;
  Object.keys(T.komposisi).forEach((k) => {
    const ada = T.soal.filter((s) => jenis(s) === k).length;
    assert.ok(ada > T.komposisi[k], k + ': bank lebih banyak dari yang diambil agar teracak');
    total += T.komposisi[k];
  });
  assert.equal(total, T.banyak);
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    if (s.type === 'choice') {
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada');
      return;
    }
    assert.ok(['tulis', 'baca'].includes(s.mode), s.id + ': mode');
    assertPecahan(s.jawab, s.id);
    assert.ok(s.hints.length >= 1, s.id + ': hints');
    if (s.mode === 'tulis') {
      const teks = E.tulisPecahan(s.jawab);
      assert.equal(E.periksaTeksPecahan(teks, s.jawab).benar, true, s.id);
      assert.equal(
        E.periksaTeksPecahan(teks.replace('−', '-'), s.jawab).benar,
        true,
        s.id + ': tanda - dari keyboard diterima'
      );
      assert.ok(s.reveal.includes(teks), s.id + ': reveal memuat notasi');
    } else {
      assert.deepEqual(s.tampil, s.jawab, s.id + ': pecahan yang ditampilkan = kunci');
      assert.ok(s.reveal.includes(E.bacaPecahanKonteks(s.jawab)), s.id + ': reveal memuat bacaan');
      assert.equal(E.cekCaraBacaPecahan(E.bacaPecahanKonteks(s.jawab), s.jawab).benar, true);
    }
  });
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 3);
  D.selesai.contoh.forEach((c, i) => assertPecahan(c.pecahan, 'contoh ' + i));
});
