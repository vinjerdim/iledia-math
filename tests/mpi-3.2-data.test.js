'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-3.2/data.js (Masalah kontekstual rasio
 * & konversi satuan, Think-Pair-Share): setiap `jawab` sama dengan
 * jawabSoalRasioSatuan (engine seksi 68), setiap langkah & soal dapat
 * diperiksa engine, opsi pertanyaan TPS yang dibangkitkan opsiRasioSatuan
 * cukup banyak & unik, opsi pilihan ganda cocok dengan kunci engine,
 * tahap mengikuti fase TPS dan sama dengan manifest halaman. app.js juga
 * dicek agar pilihan selalu dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-3.2/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-3.2', 'app.js'), 'utf8');

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

function assertGuided(list, name) {
  assert.ok(list.length >= 1, name + ': ada pertanyaan');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya, q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

/* Langkah { label, cek, jawab }: jawab baku = engine, dan jawab diterima. */
function assertLangkah(step, name) {
  assert.ok(step.label || step.pertanyaan, name + ': label/pertanyaan');
  assert.ok(step.cek && step.cek.jenis, name + ': cek');
  const s = { cek: step.cek };
  assert.equal(E.jawabSoalRasioSatuan(s), step.jawab, name + ': jawab = engine');
  assert.equal(E.periksaSoalRasioSatuan(step.jawab, s).benar, true, name + ': jawab diterima');
  assert.ok(Array.isArray(step.hints) && step.hints.length, name + ': petunjuk');
}

function assertHead(T, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(T[k], name + ': ' + k));
}

test('delapan tahap mengikuti fase Think-Pair-Share & sama dengan manifest', () => {
  assert.deepEqual(ids(D.tahap), [
    'tujuan',
    'pikir',
    'pasang',
    'berbagi',
    'masalah',
    'latihan',
    'refleksi',
    'selesai',
  ]);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-3.2'].stageCount, D.tahap.length);
  ['tujuan', 'pikir', 'pasang', 'berbagi', 'masalah', 'latihan', 'refleksi'].forEach((t) =>
    assertHead(D[t], t)
  );
  assert.match(D.pikir.syntax, /Think/);
  assert.match(D.pasang.syntax, /Pair/);
  assert.match(D.berbagi.syntax, /Share/);
  ids(D.tahap).forEach((t) => assert.match(APP, new RegExp('\\b' + t + ': render')));
});

test('tujuan: TP, kriteria, apersepsi menyederhanakan rasio, aturan TPS', () => {
  const T = D.tujuan;
  assert.match(T.tp, /rasio/);
  assert.match(T.tp, /konversi satuan/);
  assert.ok(T.kriteria.length >= 4);
  assertLangkah(T.apersepsi, 'apersepsi');
  assert.ok(T.aturan.length >= 3);
});

test('pikir: dugaan dari opsiRasioSatuan, lab, langkah, tafsir', () => {
  const P = D.pikir;
  const opsi = E.opsiRasioSatuan(P.cek);
  assertOptions(opsi, 'pikir.dugaan', 4);
  assert.equal(E.jawabSoalRasioSatuan({ cek: Object.assign({ jenis: 'satuan' }, P.cek) }), '4 : 1');
  ['a', 'satA', 'b', 'satB'].forEach((k) => assert.equal(P.lab[k], P.cek[k], 'lab.' + k));
  assert.ok(P.lab.pilihan.includes(E.satuanTerkecil(P.lab.satA, P.lab.satB)));
  P.langkah.forEach((s, i) => assertLangkah(s, 'pikir.langkah' + i));
  assertGuided(P.tafsir, 'pikir.tafsir');
});

test('pasang: empat soal TPS dengan opsi engine ≥ 4, satuan berbeda, besaran beragam', () => {
  const besaran = new Set();
  assert.ok(D.pasang.soal.length >= 4);
  D.pasang.soal.forEach((q) => {
    assert.ok(D.konteks[q.konteks], q.id + ': konteks');
    assert.ok(q.cerita && q.tanya && q.diskusi, q.id + ': teks');
    assert.notEqual(q.cek.satA, q.cek.satB, q.id + ': satuan berbeda');
    const opsi = E.opsiRasioSatuan(q.cek);
    assertOptions(opsi, q.id, 4);
    assert.ok(ids(opsi).includes('benar'), q.id + ': ada kunci');
    besaran.add(E.SATUAN_RASIO[q.cek.satA].besaran);
  });
  assert.equal(besaran.size, 4, 'panjang, massa, volume, waktu');
});

test('berbagi: kalimat memakai potongan bank yang unik, ada pengecoh', () => {
  const B = D.berbagi;
  assertOptions(B.bank, 'bank', 5);
  const benar = B.kalimat.map((k) => k.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar unik');
  benar.forEach((c) => assert.ok(ids(B.bank).includes(c), c));
  assert.ok(B.bank.length > B.kalimat.length, 'ada potongan pengecoh');
  assert.ok(B.pemantik.length >= 2 && B.rangkuman.length >= 3);
});

test('masalah: model TPS & langkah tiap masalah konsisten dengan engine', () => {
  const jenis = new Set();
  assert.ok(D.masalah.soal.length >= 4);
  D.masalah.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.cerita && s.pertanyaan, s.id + ': cerita');
    assertGuided([s.model], s.id + '.model');
    assert.ok(s.model.diskusi, s.id + ': diskusi');
    assert.ok(s.langkah.length >= 2, s.id + ': langkah bertahap');
    s.langkah.forEach((l, i) => {
      assertLangkah(l, s.id + '.langkah' + i);
      jenis.add(l.cek.jenis);
    });
    assert.ok(s.langkah[s.langkah.length - 1].temuan, s.id + ': temuan di langkah akhir');
  });
  ['konversi', 'satuan', 'bagi', 'hilangSatuan'].forEach((j) => assert.ok(jenis.has(j), j));
});

test('latihan: bank cukup untuk komposisi, kunci isian & pilihan cocok engine', () => {
  const L = D.latihan;
  assert.equal(
    Object.values(L.komposisi).reduce((a, b) => a + b, 0),
    L.banyak,
    'komposisi = banyak'
  );
  Object.keys(L.komposisi).forEach((t) => {
    const n = L.soal.filter((s) => s.type === t).length;
    assert.ok(n > L.komposisi[t], t + ': bank lebih banyak daripada yang diambil');
  });
  assert.equal(new Set(ids(L.soal)).size, L.soal.length, 'id soal unik');
  const jenis = new Set();
  L.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.type === 'input') {
      assertLangkah(s, s.id);
      jenis.add(s.cek.jenis);
      return;
    }
    assertOptions(s.options, s.id, 4);
    assert.ok(ids(s.options).includes(s.correct), s.id + ': correct');
    if (s.cek) {
      const kunci = E.jawabSoalRasioSatuan({ cek: s.cek });
      s.options.forEach((o) => {
        const sama = o.label.replace(/\s*(g|mL|cm|m|menit)$/, '') === kunci;
        assert.equal(sama, o.id === s.correct, s.id + '.' + o.id + ' vs ' + kunci);
      });
    }
    if (s.cekOpsi) {
      s.options.forEach((o) => {
        const m = o.label.match(/=\s*(\d+\s*:\s*\d+)$/);
        const k = E.rasioBedaSatuan(
          s.cekOpsi[o.id].a,
          s.cekOpsi[o.id].satA,
          s.cekOpsi[o.id].b,
          s.cekOpsi[o.id].satB
        ).sederhana;
        const r = E.parseIsianRasio(m[1]);
        assert.equal(r.a === k.a && r.b === k.b, o.id === s.correct, s.id + '.' + o.id);
      });
    }
  });
  ['satuan', 'bagi', 'hilangSatuan', 'konversi'].forEach((j) => assert.ok(jenis.has(j), j));
});

test('refleksi & selesai lengkap', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi');
  assertOptions(D.refleksi.pasanganOpsi, 'pasanganOpsi');
  assert.ok(D.selesai.aturan.length >= 3);
  assert.ok(D.selesai.capaian.length >= 3);
});

test('app.js mengacak setiap daftar pilihan sekali dan menyimpannya di State', () => {
  [
    /ensureShuffledOrder\(State, 'dugaanOrder', PIKIR_OPSI\)/,
    /ensureListOrders\('tafsirOrders', DATA\.pikir\.tafsir\)/,
    /ensureTpsStates\(State, 'pasangTps', PASANG_SOAL\)/,
    /ensureShuffledOrder\(State, 'bankOrder', DATA\.berbagi\.bank\)/,
    /ensureTpsStates\(State, 'masalahTps', masalahModelList\(\)\)/,
    /shuffleArray\(optionIds\(s\.options\)\)/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
    /ensureShuffledOrder\(State, 'refleksiPasanganOrder', DATA\.refleksi\.pasanganOpsi\)/,
    /function pilihSoalLatihan\(\)[\s\S]*?shuffleArray/,
    /opsiRasioSatuan\(/,
    /buildLabSamakanSatuan\(/,
    /buildLangkahRasio\(/,
  ].forEach((re) => assert.match(APP, re, String(re)));
  assert.match(APP, /mpi-d-3-2-/);
});
