'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-10.1/data.js (Menyajikan data
 * kategorik dalam tabel frekuensi & diagram batang, Discovery Learning):
 * setiap kunci sama dengan engine seksi 79 (hitungFrekuensi,
 * skalaDisarankan, diagnosaSkala, nilaiSkalaSumbu, nilaiSoalData,
 * periksaSoalData, opsiSoalData), opsi pilihan cukup & unik agar dapat
 * diacak, tahap mengikuti sintaks Discovery Learning dan sama dengan
 * manifest halaman. app.js juga dicek agar pilihan selalu dirender dengan
 * urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-10.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-10.1', 'app.js'), 'utf8');
const OLAH = ['olahTabel', 'olahSkala', 'olahBatang'];

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
  ['kicker', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

function assertDataset(ds, name) {
  assert.ok(ds.kategori.length >= 3, name + ': minimal 3 kategori');
  assert.equal(new Set(ids(ds.kategori)).size, ds.kategori.length, name + ': id kategori unik');
  ds.kategori.forEach((k) => {
    assert.ok(k.label, name + '.' + k.id + ': label');
    assert.ok(Number.isInteger(ds.frek[k.id]) && ds.frek[k.id] > 0, name + '.' + k.id + ': frek');
  });
  assert.equal(Object.keys(ds.frek).length, ds.kategori.length, name + ': frek per kategori');
  assert.equal(
    E.kategoriTerbanyak(ds.frek, ds.kategori).length,
    1,
    name + ': kategori terbanyak tunggal'
  );
}

test('sebelas tahap Discovery Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-10.1'];
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
    olahTabel: 4,
    olahSkala: 4,
    olahBatang: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Discovery Learning · Sintaks ' + n, id);
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-10.1', 'index.html'), 'utf8');
  assert.match(html, /<title>\s*Menyajikan Data Kategorik/);
  assert.match(html, /0 dari 11 tahap selesai/);
});

test('index.html root: card Materi 10.1 di Kelas VII › Topik 10', () => {
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const card = idx.match(/<a\s+href="fase-d\/mpi-10\.1\/index\.html"[\s\S]*?<\/a>/);
  assert.ok(card, 'card ada');
  assert.match(card[0], /data-kelas="VII"/);
  assert.match(card[0], /data-topik="10"/);
  assert.match(card[0], /Materi 10\.1/);
  assert.match(card[0], /Discovery Learning/);
});

test('data kantin: kartu survei konsisten dengan frekuensinya', () => {
  const K = D.kantin;
  assertDataset(K, 'kantin');
  const L = D.koleksi.lab;
  assert.ok(L.data.length >= 30, 'cukup banyak kartu data');
  assert.equal(new Set(ids(L.data)).size, L.data.length, 'id kartu unik');
  L.data.forEach((d) => {
    assert.ok(d.nama, d.id + ': nama');
    assert.ok(ids(K.kategori).includes(d.nilai), d.id + ': nilai kategori dikenal');
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(E.hitungFrekuensi(L.data, K.kategori))),
    JSON.parse(JSON.stringify(K.frek))
  );
  assert.ok(L.percepatSetelah >= 8 && L.percepatSetelah < L.data.length);
  assert.ok(L.judulKategori && L.caption);
});

test('stimulasi: TP, catatan mentah, diagram mading menyesatkan, dugaan sesuai engine', () => {
  const S = D.stimulasi;
  ['data kategorik', 'tabel frekuensi', 'diagram batang', 'skala'].forEach((k) =>
    assert.ok(S.tp.includes(k), 'TP memuat ' + k)
  );
  assert.equal(S.tpJudul, 'Tujuan belajar hari ini');
  assert.ok(S.kriteria.length >= 4);
  assert.ok(
    E.DTK_CACAT.some((c) => c.id === S.mading.cacat),
    'cacat mading dikenal'
  );
  assert.ok(S.dugaan.length >= 4);
  assert.equal(new Set(ids(S.dugaan)).size, S.dugaan.length);
  S.dugaan.forEach((q) => {
    assert.ok(q.tanya && q.pembahasan, q.id);
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
  });
  const K = D.kantin;
  const ter = S.dugaan.find((q) => q.id === 'dTerbanyak');
  assert.equal(ter.baku, E.kategoriTerbanyak(K.frek, K.kategori)[0]);
  const sk = S.dugaan.find((q) => q.id === 'dSkala');
  assert.equal(sk.cek.max, E.frekuensiTerbesar(K.frek));
  assert.equal(sk.baku, 'l' + E.skalaDisarankan(sk.cek.max));
  sk.opsi.forEach((o) => {
    const l = Number(o.id.slice(1));
    assert.equal(E.skalaTepat(sk.cek.max, l), o.id === sk.baku, 'dSkala.' + o.id);
  });
});

test('masalah: pertanyaan inti dengan umpan untuk setiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
  assert.ok(M.hipotesisLabel && M.hipotesisPlaceholder);
});

test('olah data: temuan, pemilahan & langkah konsisten dengan engine', () => {
  OLAH.forEach((id) => {
    const O = D[id];
    assertGuided(O.temuan, id + '.temuan', 3);
    assertOptions(O.pilah.kategori, id + '.pilah.kategori', 2);
    assert.ok(O.pilah.butir.length >= 6, id + ': cukup butir pemilahan');
    assert.equal(new Set(ids(O.pilah.butir)).size, O.pilah.butir.length);
    const kunci = O.pilah.butir.map((b) =>
      id === 'olahSkala' ? E.nilaiSkalaSumbu(b.cek) : b.correct
    );
    kunci.forEach((k, i) =>
      assert.ok(ids(O.pilah.kategori).includes(k), id + '.' + O.pilah.butir[i].id + ': kunci')
    );
    ids(O.pilah.kategori).forEach((k) =>
      assert.ok(kunci.includes(k), id + ': kategori ' + k + ' punya butir')
    );
    O.pilah.butir.forEach((b) => assert.ok(b.teks && b.explanation, id + '.' + b.id));
    assert.ok(O.langkah.length >= 2, id + ': langkah');
    O.langkah.forEach((s) => {
      assert.ok(s.label && s.placeholder && s.temuan, id + '.' + s.id);
      assert.ok(s.hints && s.hints.length >= 1, id + '.' + s.id + ': petunjuk');
      const baku = E.nilaiSoalData(s.cek);
      assert.ok(Number.isInteger(baku), id + '.' + s.id + ': kunci bilangan');
      assert.equal(E.periksaSoalData(String(baku), s).benar, true, id + '.' + s.id);
    });
    assert.ok(O.ringkasan && O.nextLabel);
  });
  const sk = D.olahSkala;
  assertDataset(sk.lab, 'olahSkala.lab');
  assert.ok(sk.lab.langkahOpsi.length >= 4);
  assert.ok(sk.lab.langkahOpsi.some((l) => E.skalaTepat(E.frekuensiTerbesar(sk.lab.frek), l)));
  assert.ok(sk.lab.mulaiLain > 0 && sk.lab.mulaiLain < E.frekuensiTerbesar(sk.lab.frek));
  sk.pilah.butir.forEach((b) =>
    assert.match(b.teks, new RegExp(String(b.cek.max)), b.id + ': teks memuat frekuensi terbesar')
  );
});

test('olahBatang: Lab Diagram Batang dapat diselesaikan dengan data kantin', () => {
  const B = D.olahBatang.lab;
  const K = D.kantin;
  const max = E.frekuensiTerbesar(K.frek);
  const tepat = B.langkahOpsi.filter((l) => E.skalaTepat(max, l));
  assert.equal(tepat.length, 1, 'tepat satu langkah skala yang benar');
  assert.ok(B.langkahOpsi.length >= 4);
  B.kelengkapan.forEach((q) => {
    assertOptions(q.opsi, 'kelengkapan.' + q.id, 3);
    assert.ok(['judul', 'labelX', 'labelY'].includes(q.id));
    assert.ok(ids(q.opsi).includes(q.correct));
    q.opsi
      .filter((o) => o.id !== q.correct)
      .forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
  const cfg = {
    kategori: K.kategori,
    frek: K.frek,
    langkahOpsi: B.langkahOpsi,
    kelengkapan: B.kelengkapan,
  };
  const st = E.ensureLabBatang({}, 'lb', cfg);
  assert.equal(E.pilihSkalaLab(st, cfg, tepat[0]).benar, true);
  B.kelengkapan.forEach((q) => E.pilihKelengkapanLab(st, cfg, q.id, q.correct));
  K.kategori.forEach((k) => E.aturTinggiLab(st, cfg, k.id, K.frek[k.id]));
  E.periksaBatangLab(st, cfg);
  assert.equal(E.labBatangSelesai(st, cfg), true);
});

test('verifikasi: bank data baru, skala tepat, pernyataan lengkap', () => {
  const V = D.verifikasi;
  assert.ok(V.bank.length >= 3);
  assert.equal(new Set(ids(V.bank)).size, V.bank.length);
  V.bank.forEach((ds) => {
    assertDataset(ds, ds.id);
    assert.ok(ds.nama && ds.judul && ds.labelX && ds.labelY && ds.ikon, ds.id + ': teks');
    assert.ok(E.frekuensiTerbesar(ds.frek) > 12, ds.id + ': langkah 1 tidak lagi tepat');
    assert.ok(E.skalaDisarankan(E.frekuensiTerbesar(ds.frek)) > 1);
  });
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 3);
  assert.ok(V.pernyataan.length >= 5);
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id);
    assert.ok(p.teks && p.explanation, p.id);
  });
  ids(V.opsiPernyataan).forEach((o) =>
    assert.ok(
      V.pernyataan.some((p) => p.correct === o),
      'ada pernyataan ' + o
    )
  );
});

test('generalisasi: kesimpulan, potongan benar unik & ada pengecoh', () => {
  const G = D.generalisasi;
  assert.ok(G.kalimat.length >= 5);
  const bankIds = ids(G.bank);
  assert.equal(new Set(bankIds).size, bankIds.length);
  const benar = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar unik');
  benar.forEach((b) => assert.ok(bankIds.includes(b)));
  assert.ok(G.bank.length >= G.kalimat.length + 2, 'ada pengecoh');
  assert.ok(G.rangkuman.length >= 4);
});

test('uji terap: bank soal, komposisi, kunci & opsi pilihan ganda dari engine', () => {
  const T = D.terapkan;
  const total = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, T.banyak);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  Object.entries(T.komposisi).forEach(([type, n]) => {
    const ada = T.soal.filter((s) => s.type === type).length;
    assert.ok(ada >= 2 * n, type + ': bank minimal dua kali yang diambil');
  });
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    assert.ok(D.konteks[s.konteks], s.id + ': konteks dikenal');
    if (s.cek.frek) assertDataset({ kategori: s.cek.kategori, frek: s.cek.frek }, s.id);
    if (s.type === 'input') {
      const baku = E.nilaiSoalData(s.cek);
      assert.equal(E.periksaSoalData(String(baku), s).benar, true, s.id + ': kunci');
      assert.ok(s.hints && s.hints.length >= 1, s.id + ': petunjuk');
    } else {
      assert.equal(s.type, 'choice', s.id);
      const o = E.opsiSoalData(s);
      assertOptions(o, s.id, 3);
      assert.equal(o[0].id, 'baku');
      o.forEach((x) => assert.ok(x.umpan, s.id + '.' + x.id + ': umpan'));
    }
  });
  const cacat = new Set(T.soal.filter((s) => s.cek.minta === 'cacat').map((s) => s.cek.cacat));
  E.DTK_CACAT.forEach((c) => assert.ok(cacat.has(c.id), 'soal cacat ' + c.id));
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  R.pertanyaan.forEach((q) => assert.ok(q.id && q.teks && q.placeholder));
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.judul && D.selesai.teks && D.selesai.capaian.length >= 4);
});

test('app.js: pilihan selalu dirender dengan urutan acak tersimpan', () => {
  assert.match(APP, /shuffleArray\(/);
  assert.match(APP, /ensureShuffledOrder\(/);
  assert.match(APP, /ensureSortStates\(/);
  assert.match(APP, /ensureLabTurus\(/);
  assert.match(APP, /ensureLabBatang\(/);
  assert.match(APP, /opsiSoalData\(/);
  assert.match(APP, /STORAGE_KEY = 'mpi-d-10-1-/);
  /* Setiap buildChoiceGroup memakai urutan dari State, bukan urutan DATA. */
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*[^,)]+/g) || [];
  assert.ok(panggilan.length >= 2);
  panggilan.forEach((p) => assert.match(p, /State\.|orders\[|Order/, p));
});
