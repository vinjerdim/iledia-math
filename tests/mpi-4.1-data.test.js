'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-4.1/data.js (Pola pada susunan
 * benda, Discovery Learning): setiap kunci sama dengan engine seksi 71
 * (banyakBendaPola, jenisKeteraturan, periksaSoalPola, jawabSoalPola,
 * opsiSoalPola), opsi pilihan cukup & unik agar dapat diacak, tahap
 * mengikuti sintaks Discovery Learning dan sama dengan manifest halaman.
 * app.js juga dicek agar pilihan selalu dirender dengan urutan acak
 * tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-4.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-4.1', 'app.js'), 'utf8');
const KETERATURAN = ['tetap', 'bertingkat', 'tidakTeratur'];

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
    assertOptions(q.opsi, name + '.' + q.id, 3);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

function assertCekValid(c, name) {
  if (c.suku) {
    assert.ok(Array.isArray(c.suku) && c.suku.length >= 3, name + ': suku minimal 3');
  } else {
    assert.ok(E.POLA_BENDA[c.jenis], name + ': jenis dikenal');
  }
  if (c.minta === 'keteraturan') return;
  assert.ok(Number.isInteger(c.n) && c.n >= 1, name + ': n bulat positif');
  assert.ok(E.nilaiSoalPola(c) > 0, name + ': nilai baku positif');
}

/* Langkah { cek }: jawaban baku dari engine diterima pemeriksa & disebut di temuan. */
function assertLangkah(list, name, jenis) {
  assert.ok(list.length >= 2, name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.ok(s.label && s.satuan && s.temuan, n + ': label, satuan, temuan');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, n + ': petunjuk');
    assertCekValid(s.cek, n);
    assert.equal(s.cek.jenis, jenis, n + ': jenis sama dengan tahap');
    assert.equal(s.satuan, E.POLA_BENDA[jenis].satuan, n + ': satuan');
    const jawab = E.jawabSoalPola(s);
    assert.equal(E.periksaSoalPola(jawab, s).benar, true, n + ': jawaban baku diterima');
    assert.ok(s.temuan.includes(jawab), n + ': temuan memuat jawaban ' + jawab);
  });
}

test('sebelas tahap Discovery Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-4.1'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Discovery Learning/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.equal(D.tahap.length, 11);
  assert.equal(new Set(ids(D.tahap)).size, 11);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
    assert.match(APP, new RegExp('\\b' + t.id + ': render'), t.id + ': ada renderer');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  const sintaks = {
    stimulasi: 1,
    masalah: 2,
    koleksi: 3,
    olahKorek: 4,
    olahUbin: 4,
    olahKursi: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Discovery Learning · Sintaks ' + n, id);
  });
});

test('stimulasi: tiga susunan (korek, ubin, kursi) dan dugaan sesuai engine', () => {
  const S = D.stimulasi;
  assert.ok(S.tp && S.tpJudul && S.kriteria.length >= 3);
  assert.equal(S.susunan.length, 3);
  const benda = Array.from(S.susunan, (s) => E.POLA_BENDA[s.jenis].benda).sort();
  assert.deepEqual(benda, ['korek', 'kursi', 'ubin']);
  assert.equal(S.dugaan.length, 3);
  S.dugaan.forEach((q, i) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 3);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    assert.equal(q.cek.jenis, S.susunan[i].jenis, q.id + ': jenis sama urutan susunan');
    const baku = q.opsi.find((o) => o.id === q.baku).label;
    assert.ok(baku.startsWith(E.jawabSoalPola(q) + ' '), q.id + ': label baku = engine');
    /* opsi lain tidak boleh berawal dengan angka yang sama dengan jawaban baku */
    q.opsi
      .filter((o) => o.id !== q.baku)
      .forEach((o) => assert.ok(!o.label.startsWith(E.jawabSoalPola(q) + ' '), o.id));
  });
});

test('masalah: pertanyaan inti dengan umpan untuk setiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], o.id + ': umpan'));
  assert.ok(M.hipotesisLabel && M.hipotesisPlaceholder);
});

test('koleksi: Lab Susun memakai ketiga susunan stimulasi', () => {
  const L = D.koleksi.lab;
  assert.deepEqual(
    Array.from(L.jenisList),
    Array.from(D.stimulasi.susunan, (s) => s.jenis)
  );
  assert.ok(L.tahapCatat >= 3 && L.tahapMaks >= L.tahapCatat);
  assert.ok(D.koleksi.tips.length >= 2);
  /* gambar lab tidak boleh memperlihatkan tahap yang diprediksi di tahap olah */
  ['olahKorek', 'olahUbin', 'olahKursi'].forEach((id) => {
    D[id].langkah.forEach((s) => {
      if (s.cek.minta !== 'tambahan') assert.ok(s.cek.n > L.tahapMaks, s.id + ': prediksi');
    });
  });
});

test('olah data: jenis cocok, data tercatat teratur, temuan & langkah konsisten', () => {
  const jenisLab = Array.from(D.koleksi.lab.jenisList);
  const harap = { olahKorek: 'tetap', olahUbin: 'bertingkat', olahKursi: 'tetap' };
  Object.keys(harap).forEach((id) => {
    const O = D[id];
    assert.ok(jenisLab.includes(O.jenis), id + ': jenis ada di lab');
    assert.equal(
      E.jenisKeteraturan(E.barisanPola(O.jenis, D.koleksi.lab.tahapCatat)),
      harap[id],
      id + ': keteraturan'
    );
    assert.ok(O.judul && O.pengantar && O.buktiLabel && O.nextLabel, id + ': teks');
    assertGuided(O.temuan, id + '.temuan', 3);
    assertLangkah(O.langkah, id + '.langkah', O.jenis);
  });
  assert.equal(new Set(Object.keys(harap).map((id) => D[id].jenis)).size, 3);
});

test('verifikasi: pemilahan susunan baru sesuai engine & pernyataan lengkap', () => {
  const V = D.verifikasi;
  assert.deepEqual(ids(V.kategori), KETERATURAN);
  assertOptions(V.kategori, 'kategori', 3);
  assert.ok(V.susunan.length >= 5);
  assert.equal(new Set(ids(V.susunan)).size, V.susunan.length);
  const jenisLab = Array.from(D.koleksi.lab.jenisList);
  V.susunan.forEach((s) => {
    assert.ok(s.teks && s.explanation, s.id + ': teks & penjelasan');
    const suku = s.suku || E.barisanPola(s.jenis, 4);
    if (s.jenis) assert.ok(!jenisLab.includes(s.jenis), s.id + ': susunan BARU');
    assert.equal(E.jenisKeteraturan(suku), s.correct, s.id + ': kunci = engine');
  });
  KETERATURAN.forEach((k) =>
    assert.ok(
      V.susunan.some((s) => s.correct === k),
      'ada contoh ' + k
    )
  );
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 3);
  assert.ok(V.pernyataan.length >= 5);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id + ': correct ada di opsi');
    assert.ok(p.teks && p.explanation, p.id);
  });
  assert.ok(V.judulA && V.judulB && V.judulC);
});

test('generalisasi: setiap kalimat punya potongan benar & ada pengecoh', () => {
  const G = D.generalisasi;
  assert.equal(new Set(ids(G.bank)).size, G.bank.length, 'id bank unik');
  assertOptions(G.bank, 'bank', 5);
  const benar = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar tidak dipakai ulang');
  benar.forEach((b) => assert.ok(ids(G.bank).includes(b), b + ': ada di bank'));
  assert.ok(G.bank.length - G.kalimat.length >= 2, 'minimal dua pengecoh');
  assert.ok(G.rangkuman.length >= 3);
});

test('uji terap: bank soal, komposisi, kunci & opsi pilihan ganda dari engine', () => {
  const T = D.terapkan;
  assert.equal(T.soal.length, 16);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  assert.equal(T.komposisi.input + T.komposisi.choice, T.banyak);
  Object.keys(T.komposisi).forEach((k) => {
    assert.ok(T.soal.filter((s) => s.type === k).length >= T.komposisi[k] * 2, k + ': bank cukup');
  });
  T.soal.forEach((s) => {
    const n = 'soal.' + s.id;
    assert.ok(['input', 'choice'].includes(s.type), n + ': type');
    assert.ok(D.konteks[s.konteks], n + ': konteks dikenal');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, n + ': teks');
    assertCekValid(s.cek, n);
    if (s.jenis) assert.equal(s.cek.jenis, s.jenis, n + ': jenis');
    const jawab = E.jawabSoalPola(s);
    assert.equal(E.periksaSoalPola(jawab, s).benar, true, n + ': kunci diterima');
    if (s.cek.minta !== 'keteraturan') {
      assert.ok(s.satuan, n + ': satuan');
      assert.ok(s.explanation.includes(jawab), n + ': penjelasan memuat ' + jawab);
    }
    if (s.type === 'input') {
      assert.notEqual(s.cek.minta, 'keteraturan', n + ': isian berupa bilangan');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
      assert.ok(s.reveal && s.reveal.includes(jawab), n + ': reveal memuat jawaban');
    } else {
      const opsi = E.opsiSoalPola(s);
      assert.ok(opsi.length >= 4, n + ': minimal 4 opsi');
      assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, n + ': label unik');
    }
  });
  ['tetap', 'bertingkat', 'tidakTeratur'].forEach((k) =>
    assert.ok(
      T.soal.some((s) => s.cek.minta === 'keteraturan' && E.jawabSoalPola(s) === k),
      'soal keteraturan ' + k
    )
  );
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.ok(S.judul && S.teks && S.capaian.length >= 3);
  S.contoh.forEach((c) => assert.ok(E.POLA_BENDA[c.jenis], c.jenis));
});

test('app.js: semua pilihan diacak sekali & disimpan di state', () => {
  ['ensureShuffledOrder', 'ensureSortStates', 'shuffleArray', 'opsiSoalPola'].forEach((f) =>
    assert.match(APP, new RegExp('\\b' + f + '\\('), f + ' dipakai')
  );
  [
    'dugaanOrders',
    'masalahOrder',
    'temuanOrders',
    'susunanOrder',
    'pernyataanOrder',
    'bankOrder',
    'refleksiDiriOrder',
    'optionOrder',
  ].forEach((k) => assert.match(APP, new RegExp('\\b' + k + '\\b'), k + ' tersimpan'));
  assert.match(APP, /STORAGE_KEY = 'mpi-d-4-1-/);
});
