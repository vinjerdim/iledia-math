'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-1.4/data.js (Membandingkan &
 * mengurutkan pecahan dalam kehidupan sehari-hari, Cooperative Learning
 * tipe Jigsaw): kunci jawaban setiap tahap harus cocok dengan engine
 * seksi 36 (simbolBandingPecahan, urutanIdPecahan, strategiBerlaku,
 * strategiBandingPecahan, opsiMaknaBandingPecahan, idMaknaBandingPecahan);
 * setiap stasiun ahli memuat soal yang memang cocok dengan strateginya;
 * setiap daftar pilihan punya id unik dan cukup opsi untuk diacak; serta
 * jumlah tahap sama dengan manifest halaman.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-1.4/data.js']);
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

/* Pecahan dari label berisi token {a/b} / {w a/b} dengan tanda − opsional. */
function pecahanDariLabel(label) {
  return label.split(',').map((t) => {
    const s = t.trim().replace(/[{}]/g, '');
    return E.pecahanDari(s);
  });
}

function nilaiSama(a, b) {
  return E.bandingPecahan(a, b) === 0;
}

test('tahap: 11 tahap unik & cocok dengan manifest halaman', () => {
  assertUniqueIds(D.tahap, 'tahap');
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-1.4'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 11);
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

test('tujuan: kunci dugaan cocok dengan nilai pecahan tiap tokoh', () => {
  const T = D.tujuan;
  assertUniqueIds(T.tokoh, 'tujuan.tokoh');
  const urut = E.urutanIdPecahan(T.tokoh, 'naik');
  assert.equal(T.kunciDugaan.sedikit, urut[0]);
  assert.equal(T.kunciDugaan.banyak, urut[urut.length - 1]);
  T.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan ' + q.id);
    assert.ok(T.kunciDugaan[q.id], 'kunci dugaan ' + q.id);
    assert.ok(ids(q.opsi).includes(T.kunciDugaan[q.id]));
  });
  assert.ok(T.kriteria.length >= 3);
});

test('informasi: penuntun lengkap (kunci ada di opsi, umpan untuk tiap opsi)', () => {
  const I = D.informasi;
  assertUniqueIds(I.penuntun, 'penuntun');
  I.penuntun.forEach((q) => {
    assertOptions(q.opsi, 'penuntun ' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
    if (q.cek) {
      /* opsi a/b/sama → pecahan yang lebih besar (atau lebih kecil) */
      const cmp = E.bandingPecahan(q.cek.a, q.cek.b);
      const besar = cmp > 0 ? 'a' : cmp < 0 ? 'b' : 'sama';
      const kecil = cmp < 0 ? 'a' : cmp > 0 ? 'b' : 'sama';
      assert.equal(q.correct, q.cek.cari === 'besar' ? besar : kecil, q.id + ': kunci cek');
    }
  });
  const r = E.garisPecahanRentang(I.perluasan.pecahan);
  assert.deepEqual(
    { min: r.min, max: r.max },
    { min: I.perluasan.garis.min, max: I.perluasan.garis.max }
  );
  assert.ok(I.aturan.length >= 4);
});

test('tim: batas anggota & kesepakatan', () => {
  const T = D.tim;
  assert.ok(T.minAnggota >= 2 && T.maksAnggota === 4);
  assertUniqueIds(T.kesepakatan, 'kesepakatan');
});

test('ahli (Jigsaw): satu stasiun per strategi, soal cocok dengan strateginya', () => {
  const A = D.ahli;
  const strategi = ids(E.STRATEGI_BANDING_PECAHAN);
  assert.deepEqual(ids(A.stasiun), strategi, 'urutan stasiun = urutan strategi engine');
  const semuaSoal = [];
  A.stasiun.forEach((st) => {
    assert.ok(st.contoh && st.contoh.cerita, st.id + ': contoh');
    assert.ok(
      E.strategiBerlaku(st.contoh.a, st.contoh.b).includes(st.id),
      st.id + ': contoh cocok dengan strategi'
    );
    assert.ok(st.soal.length >= 2, st.id + ': minimal 2 soal latih');
    st.soal.forEach((s) => {
      semuaSoal.push(s);
      assert.ok(s.cerita, s.id + ': cerita');
      assert.ok(E.strategiBerlaku(s.a, s.b).includes(st.id), s.id + ': cocok dengan ' + st.id);
      assert.equal(E.strategiBandingPecahan(s.a, s.b), st.id, s.id + ': strategi tercepat');
    });
  });
  assertUniqueIds(semuaSoal, 'soal ahli');
  const sim = semuaSoal.map((s) => E.simbolBandingPecahan(s.a, s.b));
  assert.ok(sim.includes('lt') && sim.includes('gt'), 'lambang jawaban bervariasi');
});

test('misi bandingkan: tanda sama, strategi berlaku, makna konteks dari engine', () => {
  const M = D.misiBanding;
  assertUniqueIds(M.soal, 'misiBanding.soal');
  assert.ok(M.soal.length >= 5);
  const lambang = new Set();
  const strategiTercepat = new Set();
  M.soal.forEach((s) => {
    assert.ok(E.KATA_BANDING_PECAHAN[s.tema], s.id + ': tema dikenal');
    const va = E.pecahanBiasaBertanda(s.a.p);
    const vb = E.pecahanBiasaBertanda(s.b.p);
    assert.equal(va.num < 0, vb.num < 0, s.id + ': kedua pecahan bertanda sama');
    assert.ok(s.a.teks && s.b.teks && s.cerita && s.tanyaMakna, s.id + ': teks lengkap');
    assertOptions(E.opsiMaknaBandingPecahan(s.tema, s.a.p, s.b.p), s.id + ' makna');
    lambang.add(E.simbolBandingPecahan(s.a.p, s.b.p));
    strategiTercepat.add(E.strategiBandingPecahan(s.a.p, s.b.p));
  });
  assert.equal(lambang.size, 3, 'memuat <, >, dan =');
  assert.ok(strategiTercepat.size >= 3, 'memakai beragam strategi ahli');
  assertOptions(E.opsiStrategiBanding(), 'opsi strategi', 4);
});

test('misi urutkan: nilai berbeda semua, arah valid, label ujung ada', () => {
  const M = D.misiUrut;
  assertUniqueIds(M.soal, 'misiUrut.soal');
  M.soal.forEach((s) => {
    assert.ok(['naik', 'turun'].includes(s.arah), s.id + ': arah');
    assert.ok(E.KATA_BANDING_PECAHAN[s.tema], s.id + ': tema');
    assert.ok(s.items.length >= 4, s.id + ': minimal 4 kartu');
    assertUniqueIds(s.items, s.id + '.items');
    for (let i = 0; i < s.items.length; i++) {
      for (let j = i + 1; j < s.items.length; j++) {
        assert.ok(!nilaiSama(s.items[i].p, s.items[j].p), s.id + ': tidak ada nilai kembar');
      }
    }
    assert.ok(s.fromLabel && s.toLabel && s.cerita);
  });
  assert.ok(M.soal.some((s) => s.items.some((it) => E.pecahanBiasaBertanda(it.p).num < 0)));
  assert.ok(M.soal.some((s) => s.items.some((it) => E.pecahanDari(it.p).whole)));
});

test('misi diskusi: kunci Benar/Salah cocok dengan pemeriksaan engine', () => {
  const M = D.misiDiskusi;
  assertOptions(M.opsi, 'diskusi.opsi', 2);
  assertUniqueIds(M.pernyataan, 'pernyataan');
  M.pernyataan.forEach((p) => {
    assert.ok(p.explanation, p.id + ': penjelasan');
    const c = p.cek;
    assert.ok(c, p.id + ': cek');
    let benar;
    if (c.jenis === 'lambang') benar = E.simbolBandingPecahan(c.a, c.b) === c.sym;
    else if (c.jenis === 'makna') benar = E.idMaknaBandingPecahan(c.a, c.b) === c.klaim;
    else if (c.jenis === 'urut') {
      const kunci = E.urutkanPecahan(c.nilai, c.arah);
      benar = c.nilai.every((v, i) => nilaiSama(v, kunci[i]));
    }
    assert.equal(p.correct, benar ? 'benar' : 'salah', p.id);
  });
});

test('kuis: bank soal cukup, komposisi valid, kunci cocok dengan engine', () => {
  const K = D.kuis;
  assertUniqueIds(K.soal, 'kuis.soal');
  assert.ok(K.soal.length >= 10, 'bank minimal 10 soal');
  const total = Object.values(K.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, K.banyak);
  Object.keys(K.komposisi).forEach((j) => {
    const n = K.soal.filter((s) => s.jenis === j).length;
    assert.ok(n >= K.komposisi[j], 'jenis ' + j + ' cukup di bank');
  });
  K.soal.forEach((s) => {
    assertOptions(s.options, s.id + '.options');
    assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada di opsi');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.jenis === 'lambang') {
      assert.equal(s.correct, E.simbolBandingPecahan(s.a, s.b), s.id);
    } else if (s.jenis === 'makna') {
      assert.equal(s.correct, E.idMaknaBandingPecahan(s.a, s.b), s.id);
      const eng = E.opsiMaknaBandingPecahan(s.tema, s.a, s.b);
      assert.deepEqual(
        s.options.map((o) => o.id + ':' + o.label),
        eng.map((o) => o.id + ':' + o.label),
        s.id + ': opsi makna = engine'
      );
    } else if (s.jenis === 'ekstrem') {
      const urut = E.urutanIdPecahan(s.options, 'naik');
      assert.equal(s.correct, s.cari === 'terbesar' ? urut[urut.length - 1] : urut[0], s.id);
    } else if (s.jenis === 'urut') {
      const kunci = E.urutkanPecahan(s.nilai, s.arah);
      s.options.forEach((o) => {
        const nilai = pecahanDariLabel(o.label);
        const cocok =
          nilai.length === kunci.length && nilai.every((v, i) => nilaiSama(v, kunci[i]));
        assert.equal(cocok, o.id === s.correct, s.id + '.' + o.id);
      });
    } else if (s.jenis === 'strategi') {
      assert.equal(s.correct, E.strategiBandingPecahan(s.a, s.b), s.id);
    } else {
      assert.fail(s.id + ': jenis tidak dikenal ' + s.jenis);
    }
  });
});

test('refleksi & selesai', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assertUniqueIds(D.refleksi.pertanyaan, 'refleksi.pertanyaan');
  assert.ok(D.selesai.capaian.length >= 4);
});

test('index.html root memuat card MPI 1.4 di Fase D, Kelas VII, Topik 1', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/<a\s+href="fase-d\/mpi-1\.4\/index\.html"[\s\S]*?<\/a>/);
  assert.ok(m, 'card MPI 1.4 ada');
  assert.match(m[0], /data-kelas="VII"/);
  assert.match(m[0], /data-topik="1"/);
  assert.match(m[0], /Materi 1\.4/);
});
