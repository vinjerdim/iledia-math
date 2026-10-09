'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-3.4/data.js (Perbandingan senilai &
 * berbalik nilai, Inquiry Learning): setiap kunci sama dengan engine
 * seksi 70 (jawabSoalProporsi, periksaSoalProporsi,
 * jenisPerbandinganTabel, nilaiLabProporsi), opsi pilihan cukup & unik
 * agar dapat diacak, opsi pilihan ganda uji terap yang dibangkitkan
 * opsiSoalProporsi cukup banyak, tahap mengikuti sintaks Inquiry
 * Learning dan sama dengan manifest halaman. app.js juga dicek agar
 * pilihan selalu dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-3.4/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-3.4', 'app.js'), 'utf8');
const JENIS = ['senilai', 'berbalik', 'bagi', 'kali', 'jenis'];

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

function assertDugaan(list, name) {
  list.forEach((q) => {
    assertOptions(q.opsi, name + '.' + q.id, 3);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
  });
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Langkah/soal { cek }: jawaban baku dari engine diterima pemeriksa. */
function assertCek(s, name) {
  assert.ok(s.cek && JENIS.includes(s.cek.jenis), name + ': jenis cek dikenal');
  const jawab = E.jawabSoalProporsi(s);
  assert.ok(jawab, name + ': jawaban baku ada');
  assert.equal(E.periksaSoalProporsi(jawab, s).benar, true, name + ': jawab diterima');
}

function assertLangkah(list, name, min) {
  assert.ok(list.length >= (min || 3), name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.ok(s.label && s.satuan && s.temuan, n + ': label, satuan, temuan');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, n + ': petunjuk');
    assertCek(s, n);
    assert.ok(E.jenisAngkaProporsi(s.cek.jenis), n + ': jawaban berupa bilangan');
    /* temuan menyebut jawaban baku agar umpan balik konsisten */
    assert.ok(s.temuan.includes(E.jawabSoalProporsi(s)), n + ': temuan memuat jawaban');
  });
}

test('sebelas tahap Inquiry Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-3.4'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Inquiry Learning/);
  assert.equal(D.tahap.length, 11);
  assert.equal(new Set(ids(D.tahap)).size, 11);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
    assert.match(APP, new RegExp('\\b' + t.id + ': render'), t.id + ': ada renderer');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  const sintaks = {
    orientasi: 1,
    masalah: 2,
    hipotesis: 3,
    dataSenilai: 4,
    dataBerbalik: 4,
    dataPilah: 4,
    uji: 5,
    simpulan: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Inquiry Learning · Sintaks ' + n, id);
  });
});

test('orientasi: kejadian, dugaan sesuai engine, dan panel tujuan', () => {
  const O = D.orientasi;
  assert.ok(O.tp && O.tpJudul && O.kriteria.length >= 3);
  assert.equal(O.kejadian.length, 2);
  assertDugaan(O.dugaan, 'dugaan');
  O.dugaan
    .filter((q) => q.cek.jenis === 'senilai' || q.cek.jenis === 'berbalik')
    .forEach((q) => {
      assert.equal(E.jawabSoalProporsi(q), String(q.nilaiBaku), q.id + ': nilai baku = engine');
      assert.ok(
        q.opsi.find((o) => o.id === q.baku).label.startsWith(String(q.nilaiBaku) + ' '),
        q.id + ': label baku memuat nilai'
      );
    });
  /* data orientasi sama dengan Lab Senilai & Lab Berbalik Nilai */
  const porsi = O.dugaan.find((q) => q.id === 'dPorsi').cek;
  assert.equal(E.nilaiLabProporsi(D.dataSenilai.lab, porsi.x1), porsi.y1);
  const waktu = O.dugaan.find((q) => q.id === 'dWaktu').cek;
  assert.equal(E.nilaiLabProporsi(D.dataBerbalik.lab, waktu.x1), waktu.y1);
});

test('masalah & hipotesis', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
  assertDugaan(D.hipotesis.dugaan, 'hipotesis');
  assert.ok(D.hipotesis.hipotesisLabel && D.hipotesis.hipotesisPlaceholder);
});

test('Lab Senilai & Lab Berbalik Nilai: konfigurasi lab, langkah, temuan', () => {
  [
    ['dataSenilai', 'senilai'],
    ['dataBerbalik', 'berbalik'],
  ].forEach(([key, jenis]) => {
    const S = D[key];
    const L = S.lab;
    assert.equal(L.jenis, jenis);
    assert.ok(L.pilihan.includes(L.awal), key + ': awal ada di pilihan');
    assert.ok(L.pilihan.length >= L.minCoba + 2, key + ': cukup pilihan');
    const pilihan = Array.from(L.pilihan);
    assert.deepEqual(
      [...pilihan].sort((a, b) => a - b),
      pilihan,
      key + ': pilihan urut naik'
    );
    /* setiap nilai lab bulat agar mudah dibaca */
    L.pilihan.forEach((x) => assert.equal(E.nilaiLabProporsi(L, x) % 1, 0, key + ': x=' + x));
    const baris = L.pilihan.map((x) => ({ x, y: E.nilaiLabProporsi(L, x) }));
    assert.equal(E.jenisPerbandinganTabel(baris), jenis, key + ': tabel lab sesuai jenis');
    assertLangkah(S.langkah, key, 4);
    /* langkah pertama memakai baris dari tabel lab */
    const c = S.langkah[0].cek;
    assert.ok(L.pilihan.includes(c.x), key + ': x langkah 1 dapat dicoba di lab');
    assert.equal(E.nilaiLabProporsi(L, c.x), c.y, key + ': y langkah 1 = lab');
    assert.equal(
      E.jawabSoalProporsi(S.langkah[0]),
      String(L.k),
      key + ': langkah 1 menemukan nilai tetap'
    );
    assert.ok(
      S.langkah.slice(1).every((l) => l.cek.jenis === jenis),
      key + ': langkah nilai hilang sejenis'
    );
    assertGuided(S.temuan, key + '.temuan', 3);
  });
});

test('Lab Pilah: setiap kunci = jenisPerbandinganTabel', () => {
  const P = D.dataPilah;
  assertOptions(P.kategori, 'kategori');
  assert.deepEqual(Array.from(ids(P.kategori)), ['senilai', 'berbalik', 'bukan']);
  assert.equal(new Set(ids(P.tabel)).size, P.tabel.length);
  assert.ok(P.tabel.length >= 8);
  P.tabel.forEach((t) => {
    assert.ok(D.konteks[t.konteks], t.id + ': konteks dikenal');
    assert.ok(t.teks && t.explanation && t.namaX && t.namaY, t.id + ': teks lengkap');
    assert.ok(t.baris.length >= 3, t.id + ': minimal 3 baris');
    assert.equal(E.jenisPerbandinganTabel(t.baris), t.correct, t.id);
  });
  ['senilai', 'berbalik', 'bukan'].forEach((k) =>
    assert.ok(P.tabel.filter((t) => t.correct === k).length >= 2, 'minimal 2 butir ' + k)
  );
});

test('uji hipotesis: pernyataan bercek sesuai engine', () => {
  const U = D.uji;
  assertOptions(U.opsiPernyataan, 'opsiPernyataan', 2);
  assert.equal(new Set(ids(U.pernyataan)).size, U.pernyataan.length);
  U.pernyataan.forEach((v) => {
    assert.ok(v.teks && v.explanation, v.id + ': teks & penjelasan');
    assert.ok(['benar', 'salah'].includes(v.correct), v.id + ': kunci');
    if (v.cek) {
      const benar = E.jawabSoalProporsi(v) === v.klaim;
      assert.equal(v.correct, benar ? 'benar' : 'salah', v.id + ': kunci = engine');
    }
  });
  assert.ok(U.pernyataan.some((v) => v.correct === 'benar'));
  assert.ok(U.pernyataan.some((v) => v.correct === 'salah'));
});

test('simpulan: bank & kalimat', () => {
  const S = D.simpulan;
  assertOptions(S.bank, 'bank simpulan', S.kalimat.length + 2);
  const bank = ids(S.bank);
  S.kalimat.forEach((k) => assert.ok(bank.includes(k.correct), k.id + ': potongan ada di bank'));
  assert.equal(new Set(S.kalimat.map((k) => k.correct)).size, S.kalimat.length);
  assert.ok(S.rangkuman.length >= 3);
});

test('uji terap: bank soal, komposisi, kunci engine, dan opsi berpengecoh', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length, 'id soal unik');
  const komposisi = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(komposisi, T.banyak);
  Object.entries(T.komposisi).forEach(([tipe, n]) => {
    const ada = T.soal.filter((s) => s.type === tipe).length;
    assert.ok(ada >= n * 2, tipe + ': bank cukup untuk diacak (≥ 2× yang dipakai)');
  });
  T.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks dikenal');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks lengkap');
    assertCek(s, s.id);
    if (s.type === 'input') {
      assert.ok(E.jenisAngkaProporsi(s.cek.jenis), s.id + ': isian berupa bilangan');
      assert.ok(s.satuan && s.hints && s.hints.length && s.reveal, s.id + ': petunjuk');
      assert.ok(s.reveal.includes(E.jawabSoalProporsi(s)), s.id + ': reveal memuat jawaban');
    } else {
      const opsi = E.opsiSoalProporsi(s);
      assertOptions(opsi, s.id, 4);
      assert.equal(opsi[0].id, 'baku');
      opsi.forEach((o) => assert.ok(o.umpan, s.id + '.' + o.id + ': umpan'));
    }
  });
  ['senilai', 'berbalik', 'jenis'].forEach((j) =>
    assert.ok(
      T.soal.some((s) => s.cek.jenis === j),
      'bank memuat jenis ' + j
    )
  );
  /* isian memuat senilai & berbalik dalam jumlah seimbang */
  const isian = T.soal.filter((s) => s.type === 'input');
  assert.ok(isian.filter((s) => s.cek.jenis === 'senilai').length >= 3);
  assert.ok(isian.filter((s) => s.cek.jenis === 'berbalik').length >= 3);
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.contoh.length >= 3);
  D.selesai.contoh.forEach((c) => assert.ok(D.konteks[c.konteks], 'konteks contoh'));
  assert.ok(D.selesai.capaian.length >= 3);
});

test('app.js mengacak setiap daftar pilihan sekali dan menyimpannya di State', () => {
  [
    /ensureListOrders\('dugaanOrders', DATA\.orientasi\.dugaan\)/,
    /ensureShuffledOrder\(State, 'masalahOrder', DATA\.masalah\.opsi\)/,
    /ensureListOrders\('hipotesisOrders', DATA\.hipotesis\.dugaan\)/,
    /ensureListOrders\('temuanSenilaiOrders', DATA\.dataSenilai\.temuan\)/,
    /ensureListOrders\('temuanBerbalikOrders', DATA\.dataBerbalik\.temuan\)/,
    /ensureSortStates\(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA\.dataPilah\.kategori\)/,
    /ensureSortStates\(State, 'ujiStates', 'ujiOrder', UJI_ITEMS, DATA\.uji\.opsiPernyataan\)/,
    /ensureShuffledOrder\(State, 'bankOrder', DATA\.simpulan\.bank\)/,
    /shuffleArray\(optionIds\(s\.options\)\)/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
    /function pilihSoalTerap\(\)[\s\S]*?shuffleArray/,
    /opsiSoalProporsi\(/,
    /buildLabProporsi\(/,
    /buildTabelProporsi\(/,
    /buildLangkahRasio\(/,
    /siapkanLangkahProporsi/,
  ].forEach((re) => assert.match(APP, re, String(re)));
  assert.match(APP, /mpi-d-3-4-/);
});
