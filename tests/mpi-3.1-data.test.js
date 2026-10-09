'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-3.1/data.js (Rasio & rasio ekuivalen,
 * Inquiry Learning): kunci jawaban setiap dugaan/percobaan/soal cocok
 * dengan engine seksi 67 (kunciRasioSituasi, rasioSetara,
 * sederhanakanRasio, bandingRasaRasio, nilaiRasioHilang, periksaSoalRasio),
 * setiap daftar pilihan punya id & label unik dan cukup opsi untuk diacak,
 * tahap mengikuti sintaks Inquiry Learning dan sama dengan manifest
 * halaman. app.js juga dicek agar pilihan selalu dirender dengan urutan
 * acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-3.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-3.1', 'app.js'), 'utf8');

/* id dalam array realm Node (DATA dimuat di konteks vm lain). */
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

function assertHead(T, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(T[k], name + ': ' + k));
}

function assertGuided(list, name) {
  assert.ok(list.length >= 1, name + ': ada pertanyaan');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya, q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

/* "Rasio 2 : 3" → { a: 2, b: 3 } memakai parser engine. */
function rasioDariLabel(label) {
  const m = String(label).match(/\d[\d.]*\s*:\s*\d[\d.]*/);
  assert.ok(m, 'label memuat rasio: ' + label);
  const p = E.parseIsianRasio(m[0]);
  assert.equal(p.kode, 'ok', label);
  return p;
}

test('sebelas tahap Inquiry Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-3.1'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Inquiry Learning/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.equal(D.tahap.length, 11);
  assert.equal(new Set(ids(D.tahap)).size, 11);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  const sintaks = {
    orientasi: 1,
    masalah: 2,
    hipotesis: 3,
    dataRasio: 4,
    dataSetara: 4,
    dataPilah: 4,
    uji: 5,
    simpulan: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Inquiry Learning · Sintaks ' + n, id);
  });
  assert.match(D.orientasi.tp, /rasio ekuivalen/);
});

test('orientasi: gelas & dugaan baku sesuai engine', () => {
  const O = D.orientasi;
  assert.equal(O.gelas.length, 3);
  const gelas = Object.fromEntries(O.gelas.map((g) => [g.id, g]));
  O.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    const c = q.cek;
    if (c.jenis === 'setaraGelas') {
      const acuan = gelas[c.acuan];
      const setara = O.gelas.filter(
        (g) => g.id !== acuan.id && E.rasioSetara(acuan.a, acuan.b, g.a, g.b)
      );
      assert.equal(setara.length, 1, 'tepat satu gelas setara');
      assert.equal(q.baku, setara[0].id, q.id);
    } else if (c.jenis === 'rasa') {
      assert.equal(q.baku, E.bandingRasaRasio(c.a, c.b, c.c, c.d), q.id);
    } else if (c.jenis === 'urutan') {
      assert.equal(E.rasioSetara(c.a, c.b, c.b, c.a), false);
      assert.equal(q.baku, 'beda', q.id);
    } else {
      assert.fail(q.id + ': jenis cek tidak dikenal');
    }
  });
});

test('masalah: rumusan masalah berumpan balik', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah.opsi', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], o.id));
});

test('hipotesis: opsi unik & dugaan baku sesuai engine', () => {
  const H = D.hipotesis;
  assert.ok(H.dugaan.length >= 3);
  H.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    const c = q.cek;
    if (c.jenis === 'operasi') {
      const kali = E.operasiRasio(c.a, c.b, 'kali2');
      const tambah = E.operasiRasio(c.a, c.b, 'tambah1');
      assert.equal(E.rasioSetara(c.a, c.b, kali.a, kali.b), true);
      assert.equal(E.rasioSetara(c.a, c.b, tambah.a, tambah.b), false);
      assert.equal(q.baku, 'kali');
    } else if (c.jenis === 'urutan') {
      assert.equal(q.baku, 'beda');
    } else if (c.jenis === 'situasi') {
      const label = q.opsi.find((o) => o.id === q.baku).label;
      assert.equal(E.jawabSoalRasio(q), label.match(/\d+ : \d+/)[0], q.id);
    } else {
      assert.fail(q.id + ': jenis cek tidak dikenal');
    }
  });
  assert.ok(H.hipotesisLabel && H.hipotesisPlaceholder);
});

test('dataRasio: situasi valid, beragam miskonsepsi & pertanyaan temuan', () => {
  const R = D.dataRasio;
  assert.ok(R.situasi.length >= 5);
  assert.equal(new Set(ids(R.situasi)).size, R.situasi.length);
  const tanya = new Set();
  R.situasi.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.cerita && s.tanya, s.id + ': teks');
    assert.equal(s.kelompok.length, 2, s.id + ': dua kelompok');
    assert.equal(s.cek.a, s.kelompok[0].n, s.id + ': a = banyak kelompok 1');
    assert.equal(s.cek.b, s.kelompok[1].n, s.id + ': b = banyak kelompok 2');
    assert.ok(s.hints.length >= 2, s.id + ': petunjuk berjenjang');
    const jawab = E.jawabSoalRasio(s);
    assert.equal(E.periksaSoalRasio(jawab, s).benar, true, s.id);
    tanya.add(s.cek.P + '-' + s.cek.Q);
  });
  assert.ok(tanya.has('a-b'), 'ada bagian terhadap bagian');
  assert.ok(tanya.has('b-a'), 'ada urutan dibalik (jebakan tertukar)');
  assert.ok(
    [...tanya].some((t) => t.includes('total')),
    'ada bagian terhadap keseluruhan'
  );
  assertGuided(R.temuan, 'dataRasio.temuan');
});

test('dataSetara: lab racik, misi, langkah isian & temuan', () => {
  const S = D.dataSetara;
  const L = S.lab;
  assert.ok(L.a > 0 && L.b > 0 && L.namaA && L.namaB);
  assertOptions(L.aksi, 'lab.aksi', 3);
  L.aksi.forEach((a) => assert.ok(E.operasiRasio(L.a, L.b, a.id), a.id));
  const jenisAksi = new Set(L.aksi.map((a) => a.id.replace(/\d+$/, '')));
  ['kali', 'bagi', 'tambah'].forEach((j) => assert.ok(jenisAksi.has(j), 'aksi ' + j));
  assertOptions(L.misi, 'lab.misi', 3);
  L.misi.forEach((m) => assert.ok(jenisAksi.has(m.id), 'misi ' + m.id + ' bisa dicoba'));
  assert.equal(S.pita.a % S.pita.grup, 0);
  assert.equal(S.pita.b % S.pita.grup, 0);
  assert.equal(E.gcd(S.pita.a, S.pita.b), S.pita.grup, 'pita dikelompokkan menurut FPB');

  assert.ok(S.langkah.length >= 4);
  S.langkah.forEach((l) => {
    assert.ok(l.label && l.temuan && l.hints.length >= 2, l.id);
    const c = l.cek;
    if (c.jenis === 'hilang') {
      assert.equal(l.jawab, E.nilaiRasioHilang(c.a, c.b, c.x, c.posisi), l.id);
      assert.ok(Number.isInteger(l.jawab), l.id + ': bulat');
    } else if (c.jenis === 'fpb') {
      assert.equal(l.jawab, E.gcd(c.a, c.b), l.id);
    } else {
      assert.fail(l.id + ': jenis cek tidak dikenal');
    }
  });
  assert.ok(
    S.langkah.some((l) => l.cek.jenis === 'hilang' && l.cek.posisi === 'kiri'),
    'ada suku hilang di kiri'
  );
  assertGuided(S.temuan, 'dataSetara.temuan');
});

test('dataPilah: kategori pasangan rasio cocok dengan rasioSetara', () => {
  const P = D.dataPilah;
  assertOptions(P.kategori, 'kategori', 2);
  assert.ok(P.pasangan.length >= 6);
  const dipakai = new Set();
  P.pasangan.forEach((p) => {
    assert.ok(D.konteks[p.konteks], p.id + ': konteks');
    const setara = E.rasioSetara(p.r1.a, p.r1.b, p.r2.a, p.r2.b);
    assert.equal(p.correct, setara ? 'setara' : 'beda', p.id);
    assert.ok(p.teks.includes(E.fmtRasio(p.r1.a, p.r1.b)), p.id + ': rasio 1 disebut');
    assert.ok(p.teks.includes(E.fmtRasio(p.r2.a, p.r2.b)), p.id + ': rasio 2 disebut');
    assert.ok(p.explanation, p.id + ': penjelasan');
    dipakai.add(p.correct);
  });
  ids(P.kategori).forEach((k) => assert.ok(dipakai.has(k), 'kategori ' + k + ' dipakai'));
  /* jebakan: tambah sama, tertukar, dan setara tanpa kelipatan langsung */
  assert.ok(
    P.pasangan.some((p) => p.r2.a - p.r1.a === p.r2.b - p.r1.b && p.correct === 'beda'),
    'ada pasangan tambah sama'
  );
  assert.ok(
    P.pasangan.some((p) => p.r1.a === p.r2.b && p.r1.b === p.r2.a),
    'ada pasangan tertukar'
  );
  assert.ok(
    P.pasangan.some(
      (p) => p.correct === 'setara' && p.r2.a % p.r1.a !== 0 && p.r1.a % p.r2.a !== 0
    ),
    'ada pasangan setara yang bukan kelipatan langsung'
  );
});

test('uji: pernyataan benar/salah cocok dengan engine', () => {
  const U = D.uji;
  assertOptions(U.opsiPernyataan, 'opsiPernyataan', 2);
  assert.ok(U.pernyataan.length >= 6);
  U.pernyataan.forEach((v) => {
    assert.ok(['benar', 'salah'].includes(v.correct), v.id);
    assert.ok(v.teks && v.explanation, v.id);
    const c = v.cek;
    if (!c) return;
    let ok;
    if (c.jenis === 'setara') ok = E.rasioSetara(c.a, c.b, c.c, c.d);
    else if (c.jenis === 'sederhana') {
      const s = E.sederhanakanRasio(c.a, c.b);
      ok = s.a === c.c && s.b === c.d;
    } else assert.fail(v.id + ': jenis cek tidak dikenal');
    assert.equal(ok ? 'benar' : 'salah', v.correct, v.id);
  });
  assert.ok(U.pernyataan.filter((v) => v.cek).length >= 4, 'sebagian besar dicek engine');
  assert.ok(U.judulA && U.judulB);
});

test('simpulan: kunci unik, bank berpengecoh', () => {
  const S = D.simpulan;
  assertOptions(S.bank, 'bank', S.kalimat.length + 2);
  const kunci = S.kalimat.map((g) => g.correct);
  assert.equal(new Set(kunci).size, kunci.length, 'kunci tidak dipakai ulang');
  kunci.forEach((k) => assert.ok(ids(S.bank).includes(k), k));
  assert.ok(S.rangkuman.length >= 4);
});

test('uji terap: bank soal valid & kunci cocok dengan engine', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  const banyak = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(banyak, T.banyak);
  Object.entries(T.komposisi).forEach(([type, n]) => {
    assert.ok(T.soal.filter((s) => s.type === type).length > n, type + ': bank > yang diambil');
  });
  const jenisInput = new Set();
  T.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.type === 'input') {
      assert.ok(s.hints.length >= 2 && s.reveal, s.id + ': petunjuk & reveal');
      const jawab = E.jawabSoalRasio(s);
      assert.equal(E.periksaSoalRasio(jawab, s).benar, true, s.id);
      assert.ok(s.reveal.includes(jawab), s.id + ': reveal memuat jawaban');
      jenisInput.add(s.cek.jenis);
      return;
    }
    assertOptions(s.options, s.id, 4);
    assert.ok(ids(s.options).includes(s.correct), s.id + ': correct');
    const c = s.cek;
    s.options.forEach((o) => {
      const r = rasioDariLabel(o.label);
      let benar;
      if (c.jenis === 'pilihSetara') benar = E.rasioSetara(r.a, r.b, c.a, c.b);
      else if (c.jenis === 'pilihTidakSetara') benar = !E.rasioSetara(r.a, r.b, c.a, c.b);
      else if (c.jenis === 'situasi' || c.jenis === 'sederhana') {
        const k = E.parseIsianRasio(E.jawabSoalRasio(s));
        benar = r.a === k.a && r.b === k.b;
      } else assert.fail(s.id + ': jenis cek tidak dikenal');
      assert.equal(benar, o.id === s.correct, s.id + '.' + o.id);
    });
  });
  ['situasi', 'hilang', 'sederhana'].forEach((j) => assert.ok(jenisInput.has(j), 'isian ' + j));
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
    /ensureShuffledOrder\(State, 'masalahOrder', DATA\.masalah\.opsi\)/,
    /ensureListOrders\('hipotesisOrders', DATA\.hipotesis\.dugaan\)/,
    /ensureListOrders\('temuanRasioOrders', DATA\.dataRasio\.temuan\)/,
    /ensureListOrders\('temuanSetaraOrders', DATA\.dataSetara\.temuan\)/,
    /ensureSortStates\([\s\S]*?'pilahStates'/,
    /ensureSortStates\([\s\S]*?'ujiStates'/,
    /ensureShuffledOrder\(State, 'bankOrder', DATA\.simpulan\.bank\)/,
    /shuffleArray\(optionIds\(s\.options\)\)/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
    /function pilihSoalTerap\(\)[\s\S]*?shuffleArray/,
  ].forEach((re) => assert.match(APP, re, String(re)));
  assert.match(APP, /mpi-d-3-1-/);
});
