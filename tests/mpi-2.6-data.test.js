'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-2.6/data.js (Pembulatan & penaksiran
 * untuk menilai kewajaran jawaban, Inquiry Learning): kunci jawaban
 * setiap dugaan/percobaan/soal cocok dengan engine seksi 65
 * (bulatkanKeTempat, diagnosaPembulatan, taksirOperasi, arahTaksiran,
 * nilaiKewajaran), setiap daftar pilihan punya id & label unik dan cukup
 * opsi untuk diacak, tahap mengikuti sintaks Inquiry Learning dan sama
 * dengan manifest halaman. app.js juga dicek agar pilihan selalu
 * dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-2.6/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-2.6', 'app.js'), 'utf8');

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

/* Angka pertama pada label opsi, mis. "2,5 km" → "2,5", "Rp13.000" → "13000". */
function angka(label) {
  return String(label)
    .replace(/^[^\d−-]*/, '')
    .match(/^[−-]?[\d.,]*\d/)[0]
    .replace(/\./g, '')
    .replace('−', '-');
}

/* Kategori Lab Kewajaran dari kode nilaiKewajaran. */
const KATEGORI = {
  tepat: 'wajar',
  wajar: 'wajar',
  'koma-geser': 'koma',
  'operasi-tertukar': 'tukar',
  tanda: 'tanda',
};

test('sebelas tahap Inquiry Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-2.6'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Inquiry Learning/);
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
    dataBulat: 4,
    dataTaksir: 4,
    dataWajar: 4,
    uji: 5,
    simpulan: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Inquiry Learning · Sintaks ' + n, id);
  });
});

test('orientasi: kartu kalkulator & vonis baku cocok dengan nilaiKewajaran', () => {
  const O = D.orientasi;
  assertOptions(O.opsiVonis, 'opsiVonis');
  assert.equal(O.dugaan.length, O.kartu.length);
  O.dugaan.forEach((q) => {
    const k = O.kartu.find((x) => x.id === q.kartu);
    assert.ok(k, q.id + ': kartu ada');
    assert.ok(ids(O.opsiVonis).includes(q.baku), q.id + ': baku ada di opsi');
    const r = E.nilaiKewajaran(k.klaim, k.a, k.op, k.b);
    assert.equal(r.wajar ? 'wajar' : 'tidak', q.baku, q.id);
    assert.ok(q.pembahasan.includes(E.fmtBilanganBesar(r.taksiran)), q.id + ': taksiran disebut');
  });
});

test('masalah: rumusan masalah berumpan balik', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah.opsi', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], o.id));
});

test('hipotesis: opsi unik & dugaan baku sesuai engine', () => {
  D.hipotesis.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    const label = q.opsi.find((o) => o.id === q.baku).label;
    if (q.cek && q.cek.jenis === 'bulat') {
      assert.equal(angka(label), E.bulatkanKeTempat(q.cek.soal, q.cek.tempat).replace('−', '-'));
    }
    if (q.cek && q.cek.jenis === 'arah') {
      const arah = E.arahTaksiran(q.cek.a, q.cek.op, q.cek.b, q.cek.strategi);
      assert.equal(arah, 'kurang');
      assert.match(label, /lebih kecil/);
    }
  });
});

test('dataBulat: percobaan valid, pengecoh berdiagnosa & pertanyaan temuan', () => {
  const B = D.dataBulat;
  assert.ok(B.percobaan.length >= 5);
  assert.equal(new Set(ids(B.percobaan)).size, B.percobaan.length);
  B.percobaan.forEach((p) => {
    const hasil = E.bulatkanKeTempat(p.soal, p.tempat);
    assert.ok(hasil, p.id + ': bisa dibulatkan');
    assert.ok(D.konteks[p.konteks], p.id + ': konteks');
    assert.ok(p.hints.length >= 2, p.id + ': petunjuk berjenjang');
    assert.equal(E.diagnosaPembulatan(hasil, p.soal, p.tempat).kode, 'benar', p.id);
  });
  /* data harus memuat kasus angka 5, berantai, ribuan, dan negatif */
  const kode = (p) => E.opsiPembulatan(p.soal, p.tempat).map((o) => o.kode);
  assert.ok(
    B.percobaan.some((p) => kode(p).includes('lima-ke-bawah')),
    'kasus angka 5'
  );
  assert.ok(
    B.percobaan.some((p) => kode(p).includes('berantai')),
    'kasus berantai'
  );
  assert.ok(
    B.percobaan.some((p) => E.kTempat(p.tempat) < 0),
    'kasus ribuan'
  );
  assert.ok(
    B.percobaan.some((p) => p.soal.startsWith('-')),
    'kasus negatif'
  );
  assertOptions(B.jelajah.tempat, 'jelajah.tempat');
  B.jelajah.tempat.forEach((t) => assert.ok(E.bulatkanKeTempat(B.jelajah.soal, t.id)));
  assertGuided(B.temuan, 'dataBulat.temuan');
});

test('dataTaksir: strategi, taksiran & arah beragam', () => {
  const T = D.dataTaksir;
  assertOptions(T.banding.opsi, 'banding.opsi', 2);
  const hasilBanding = T.banding.opsi.map(
    (o) => E.taksirOperasi(T.banding.a, T.banding.op, T.banding.b, o.id).hasil
  );
  assert.equal(new Set(hasilBanding).size, hasilBanding.length, 'strategi memberi taksiran beda');
  assert.ok(T.percobaan.length >= 6);
  const ops = new Set();
  const arah = new Set();
  T.percobaan.forEach((p) => {
    assert.ok(D.strategi[p.strategi], p.id + ': strategi dikenal');
    assert.ok(D.konteks[p.konteks], p.id + ': konteks');
    const t = E.taksirOperasi(p.a, p.op, p.b, p.strategi);
    assert.ok(!t.hasil.includes('…'), p.id + ': taksiran berhenti');
    assert.equal(E.diagnosaTaksiran(t.hasil, p.a, p.op, p.b, p.strategi).kode, 'benar', p.id);
    assert.ok(
      p.hints.join(' ').includes(E.fmtBilanganBesar(t.hasil)) ||
        p.hints.join(' ').includes(E.fmtBilanganBesar(t.b)),
      p.id + ': petunjuk memuat bilangan bulatan'
    );
    ops.add(E.opDesimal(p.op));
    arah.add(E.arahTaksiran(p.a, p.op, p.b, p.strategi));
  });
  assert.deepEqual([...ops].sort(), ['+', ':', '×', '−'].sort(), 'keempat operasi');
  assert.ok(arah.has('lebih') && arah.has('kurang'), 'arah lebih & kurang muncul');
  assertGuided(T.temuan, 'dataTaksir.temuan');
});

test('dataWajar: kategori jawaban kalkulator cocok dengan nilaiKewajaran', () => {
  const W = D.dataWajar;
  assertOptions(W.kategori, 'kategori', 4);
  const dipakai = new Set();
  W.jawaban.forEach((j) => {
    const r = E.nilaiKewajaran(j.klaim, j.a, j.op, j.b);
    assert.equal(KATEGORI[r.kode], j.correct, j.id + ' (' + r.kode + ')');
    assert.ok(j.explanation.includes(E.fmtBilanganBesar(r.taksiran)), j.id + ': taksiran disebut');
    dipakai.add(j.correct);
  });
  ids(W.kategori).forEach((k) => assert.ok(dipakai.has(k), 'kategori ' + k + ' dipakai'));
});

test('uji: pernyataan benar/salah cocok dengan engine', () => {
  const U = D.uji;
  assertOptions(U.opsiPernyataan, 'opsiPernyataan', 2);
  assert.ok(U.pernyataan.length >= 6);
  U.pernyataan.forEach((v) => {
    assert.ok(['benar', 'salah'].includes(v.correct), v.id);
    assert.ok(v.explanation, v.id);
    if (v.cek && v.cek.jenis === 'bulat') {
      const ok = E.diagnosaPembulatan(v.cek.klaim, v.cek.soal, v.cek.tempat).benar;
      assert.equal(ok ? 'benar' : 'salah', v.correct, v.id);
    }
  });
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
  T.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.type === 'input') {
      assert.ok(s.hints.length >= 2 && s.reveal, s.id + ': petunjuk & reveal');
      const jawab = E.jawabOpDesimalStep(s);
      const st = E.makeDesimalStep();
      assert.equal(E.periksaOpDesimalStep(st, s, jawab).benar, true, s.id);
      assert.ok(s.reveal.includes(E.fmtBilanganBesar(jawab)), s.id + ': reveal memuat jawaban');
      return;
    }
    assertOptions(s.options, s.id, 4);
    assert.ok(ids(s.options).includes(s.correct), s.id + ': correct');
    const label = s.options.find((o) => o.id === s.correct).label;
    const c = s.cek;
    if (c.jenis === 'taksir') {
      const t = E.taksirOperasi(c.a, c.op, c.b, E.strategiBaku(c.op));
      assert.equal(angka(label), t.hasil, s.id);
    } else if (c.jenis === 'bulat') {
      assert.equal(angka(label), E.bulatkanKeTempat(c.soal, c.tempat), s.id);
    } else if (c.jenis === 'wajar') {
      assert.equal(E.nilaiKewajaran(c.klaim, c.a, c.op, c.b).wajar, false, s.id);
      assert.match(label, /^Tidak wajar/, s.id);
    } else if (c.jenis === 'pilihWajar') {
      Object.entries(c.klaim).forEach(([id, klaim]) => {
        const w = E.nilaiKewajaran(klaim, c.a, c.op, c.b).wajar;
        assert.equal(w, id === s.correct, s.id + '.' + id);
      });
    } else if (c.jenis === 'cukup') {
      const naik = c.harga.reduce((sum, h) => {
        const v = E.nilaiBulatkan(h, 'ribuan', 'naik');
        return sum + v.num / v.den;
      }, 0);
      const total = c.harga.reduce((sum, h) => sum + Number(h), 0);
      assert.ok(naik >= total, s.id + ': taksiran ke atas ≥ total');
      assert.ok(naik <= Number(c.uang), s.id + ': uang cukup');
      assert.ok(label.includes(E.fmtBilanganBesar(String(naik))), s.id + ': taksiran ke atas');
    } else {
      assert.fail(s.id + ': jenis cek tidak dikenal');
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
    /ensureListOrders\('dugaanOrders', DATA\.orientasi\.dugaan|ensureShuffledOrder\(dugaanOrders/,
    /ensureShuffledOrder\(State, 'masalahOrder', DATA\.masalah\.opsi\)/,
    /ensureListOrders\('hipotesisOrders', DATA\.hipotesis\.dugaan\)/,
    /ensureListOrders\('temuanBulatOrders', DATA\.dataBulat\.temuan\)/,
    /ensureListOrders\('temuanTaksirOrders', DATA\.dataTaksir\.temuan\)/,
    /ensureShuffledOrder\(State, 'bandingOrder', DATA\.dataTaksir\.banding\.opsi\)/,
    /ensureSortStates\([\s\S]*?'wajarStates'/,
    /ensureSortStates\([\s\S]*?'ujiStates'/,
    /ensureShuffledOrder\(State, 'bankOrder', DATA\.simpulan\.bank\)/,
    /shuffleArray\(optionIds\(s\.options\)\)/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
    /function pilihSoalTerap\(\)[\s\S]*?shuffleArray/,
  ].forEach((re) => assert.match(APP, re, String(re)));
  assert.match(APP, /mpi-d-2-6-/);
});
