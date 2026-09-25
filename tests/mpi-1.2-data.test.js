'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-1.2/data.js (Membandingkan &
 * mengurutkan bilangan bulat dalam kehidupan sehari-hari, Cooperative
 * Learning): kunci jawaban setiap misi, pernyataan diskusi, dan soal kuis
 * harus cocok dengan engine (compareSymbolId, idMaknaBanding,
 * opsiMaknaBanding, urutkanBulat, urutanIdBulat); bilangan harus muat
 * pada garis bilangan; setiap daftar pilihan punya id unik dan cukup opsi
 * untuk diacak; serta jumlah tahap sama dengan manifest halaman.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-1.2/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + '.' + o.id + ': label'));
}

function assertUniqueIds(list, name) {
  assert.equal(new Set(ids(list)).size, list.length, name + ': id harus unik');
}

/* Angka dari label urutan, mis. "−7, −2, 0" → [-7, -2, 0]. */
function angkaDariLabel(label) {
  return label.split(',').map((t) => parseInt(t.trim().replace(/−/g, '-'), 10));
}

test('tahap: 10 tahap unik & cocok dengan manifest halaman', () => {
  assertUniqueIds(D.tahap, 'tahap');
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-1.2'].stageCount, D.tahap.length);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], 'DATA.' + t.id + ' ada');
  });
});

test('setiap tahap berkepala: kicker, goal, sintaks, catatan guru', () => {
  D.tahap.forEach((t) => {
    if (t.id === 'selesai') return;
    const S = D[t.id];
    assert.ok(S.kicker && S.goal && S.syntax && S.guru, t.id + ': kepala tahap lengkap');
  });
});

test('tujuan: kota bertermometer & dugaan cocok dengan suhu', () => {
  const T = D.tujuan;
  assert.ok(T.kota.length >= 4);
  assertUniqueIds(T.kota, 'tujuan.kota');
  T.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'tujuan.dugaan.' + q.id);
    /* setiap opsi adalah id kota */
    q.opsi.forEach((o) => assert.ok(ids(T.kota).includes(o.id), q.id + ': ' + o.id));
  });
  const urut = E.urutanIdBulat(T.kota, 'naik');
  assert.equal(T.kunciDugaan.dingin, urut[0]);
  assert.equal(T.kunciDugaan.hangat, urut[urut.length - 1]);
});

test('informasi: bilangan muat pada garis & pertanyaan penuntun lengkap', () => {
  const I = D.informasi;
  assert.ok(I.bilangan.length >= 4);
  I.bilangan.forEach((b) => {
    assert.ok(b.value >= I.garis.min && b.value <= I.garis.max, b.value + ' muat di garis');
    assert.ok(b.teks, 'teks konteks');
  });
  assert.equal(new Set(I.bilangan.map((b) => b.value)).size, I.bilangan.length);
  assert.ok(I.penuntun.length >= 3);
  assertUniqueIds(I.penuntun, 'penuntun');
  I.penuntun.forEach((q) => {
    assertOptions(q.opsi, 'penuntun.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + ': umpan untuk ' + o.id));
  });
  assert.ok(I.aturan.length >= 3);
});

test('tim: batas anggota & kesepakatan', () => {
  assert.ok(D.tim.minAnggota >= 2 && D.tim.minAnggota <= D.tim.maksAnggota);
  assert.ok(D.tim.maksAnggota <= 4);
  assertUniqueIds(D.tim.kesepakatan, 'kesepakatan');
});

test('misiBanding: pasangan konteks, makna, dan semua lambang muncul', () => {
  const M = D.misiBanding;
  assert.ok(M.soal.length >= 4);
  assertUniqueIds(M.soal, 'misiBanding.soal');
  const lambang = new Set();
  M.soal.forEach((s) => {
    assert.ok(E.KONTEKS_BULAT[s.tema], s.id + ': tema dikenal');
    assert.ok(s.a.teks && s.b.teks && s.cerita, s.id + ': teks');
    const r = E.rentangGaris([s.a.value, s.b.value]);
    assert.ok(r.max - r.min <= 22, s.id + ': garis tidak terlalu panjang');
    lambang.add(E.compareSymbolId(s.a.value, s.b.value));
    const opsi = E.opsiMaknaBanding(s.tema, s.a.value, s.b.value);
    assertOptions(opsi, s.id + ': opsi makna');
    assert.ok(s.tanyaMakna, s.id + ': tanyaMakna');
  });
  assert.deepEqual([...lambang].sort(), ['eq', 'gt', 'lt'], 'lambang <, >, = semuanya dilatih');
});

test('misiUrut: item unik, arah valid, dan garis memadai', () => {
  const M = D.misiUrut;
  assert.ok(M.soal.length >= 2);
  const arah = new Set();
  M.soal.forEach((s) => {
    assert.ok(['naik', 'turun'].includes(s.arah), s.id + ': arah');
    arah.add(s.arah);
    assert.ok(s.items.length >= 4, s.id + ': minimal 4 kartu');
    assertUniqueIds(s.items, s.id + '.items');
    const nilai = s.items.map((it) => it.value);
    assert.equal(new Set(nilai).size, nilai.length, s.id + ': nilai berbeda');
    const r = E.rentangGaris(nilai);
    assert.ok(r.max - r.min <= 22, s.id + ': garis tidak terlalu panjang');
    s.items.forEach((it) => assert.ok(it.teks, s.id + '.' + it.id + ': teks'));
    assert.ok(s.startLabel && s.endLabel, s.id + ': label ujung');
    /* item tidak ditulis dalam urutan jawaban */
    assert.notDeepEqual(ids(s.items), [...E.urutanIdBulat(s.items, s.arah)]);
  });
  assert.equal(arah.size, 2, 'urutan naik dan turun sama-sama dilatih');
});

test('misiDiskusi: kunci Benar/Salah cocok dengan engine', () => {
  const M = D.misiDiskusi;
  assertOptions(M.opsi, 'misiDiskusi.opsi', 2);
  assertUniqueIds(M.pernyataan, 'pernyataan');
  assert.ok(M.pernyataan.length >= 5);
  M.pernyataan.forEach((p) => {
    assert.ok(ids(M.opsi).includes(p.correct), p.id + ': correct');
    assert.ok(p.explanation, p.id + ': penjelasan');
    const c = p.cek;
    if (!c) return;
    let benar;
    if (c.jenis === 'lambang') benar = E.compareSymbolId(c.a, c.b) === c.sym;
    else if (c.jenis === 'makna') benar = E.idMaknaBanding(c.a, c.b) === c.klaim;
    else if (c.jenis === 'urut') {
      benar = E.urutkanBulat(c.nilai, c.arah).join('|') === c.nilai.join('|');
    } else assert.fail(p.id + ': jenis cek tidak dikenal');
    assert.equal(p.correct, benar ? 'benar' : 'salah', p.id + ': kunci');
  });
  const kunci = new Set(M.pernyataan.map((p) => p.correct));
  assert.equal(kunci.size, 2, 'ada pernyataan benar dan salah');
});

test('kuis: bank cukup untuk komposisi & setiap kunci cocok dengan engine', () => {
  const K = D.kuis;
  assertUniqueIds(K.soal, 'kuis.soal');
  const total = Object.values(K.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, K.banyak);
  Object.keys(K.komposisi).forEach((jenis) => {
    const n = K.soal.filter((s) => s.jenis === jenis).length;
    assert.ok(n > K.komposisi[jenis], jenis + ': bank lebih banyak dari yang diambil');
  });
  K.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.type === 'choice') {
      assertOptions(s.options, s.id);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada di opsi');
    }
    if (s.jenis === 'lambang') {
      assert.equal(s.correct, E.compareSymbolId(s.a, s.b), s.id);
    } else if (s.jenis === 'makna') {
      assert.equal(s.correct, E.idMaknaBanding(s.a, s.b), s.id);
      const engine = E.opsiMaknaBanding(s.tema, s.a, s.b);
      engine.forEach((o) =>
        assert.equal(s.options.find((x) => x.id === o.id).label, o.label, s.id + '.' + o.id)
      );
    } else if (s.jenis === 'ekstrem') {
      assert.equal(s.type, 'input');
      const urut = E.urutkanBulat(s.nilai, 'naik');
      assert.equal(s.jawab, s.cari === 'terkecil' ? urut[0] : urut[urut.length - 1], s.id);
    } else if (s.jenis === 'urut') {
      const benar = E.urutkanBulat(s.nilai, s.arah);
      const labelBenar = s.options.find((o) => o.id === s.correct).label;
      assert.deepEqual(angkaDariLabel(labelBenar), [...benar], s.id + ': urutan benar');
      s.options
        .filter((o) => o.id !== s.correct)
        .forEach((o) =>
          assert.notDeepEqual(angkaDariLabel(o.label), [...benar], s.id + '.' + o.id)
        );
      new Set(s.options.map((o) => o.label)).size === s.options.length ||
        assert.fail(s.id + ': label opsi unik');
    } else {
      assert.fail(s.id + ': jenis tidak dikenal');
    }
  });
});

test('refleksi & penghargaan: opsi penilaian diri teracak', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertUniqueIds(D.refleksi.pertanyaan, 'refleksi.pertanyaan');
  assert.ok(D.penghargaan.bobot);
});
