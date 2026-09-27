'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.3/data.js (membandingkan &
 * mengurutkan bilangan berpangkat bulat, Cooperative Learning NHT):
 * kunci jawaban dihitung ulang dengan engine seksi 51
 * (simbolBandingPangkat, urutanIdPangkat, ekstremPangkat,
 * strategiBandingPangkat, teksPangkat), setiap daftar pilihan punya
 * id & label unik dan cukup opsi untuk diacak, dan setiap opsi
 * pertanyaan penuntun punya umpan balik.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.3/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  assert.equal(
    new Set(list.map((o) => o.label || o.teks)).size,
    list.length,
    name + ': label opsi harus unik'
  );
}

const MAKNA_DARI_SIMBOL = { gt: 'p', lt: 'q', eq: 'sama' };

test('urutan tahap cocok dengan manifest halaman', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-12.3'];
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Cooperative Learning/);
  assert.match(m.h1, /Membandingkan & Mengurutkan Bilangan Berpangkat/);
});

test('setiap tahap punya kepala sintaks Cooperative Learning (NHT)', () => {
  D.tahap
    .map((t) => t.id)
    .filter((k) => k !== 'selesai')
    .forEach((k) => {
      assert.ok(D[k], 'DATA.' + k);
      assert.ok(D[k].kicker, k + '.kicker');
      assert.ok(D[k].goal, k + '.goal');
      assert.ok(D[k].guru, k + '.guru');
      assert.ok(D[k].syntax, k + '.syntax');
    });
  [
    'tujuan',
    'informasi',
    'tim',
    'misiBanding',
    'misiUrut',
    'misiDiskusi',
    'kuis',
    'penghargaan',
  ].forEach((k) => assert.match(D[k].syntax, /^Cooperative Learning \(NHT\) · Fase \d$/, k));
});

test('tujuan: dugaan acak-able & kunci dugaan dihitung engine', () => {
  const T = D.tujuan;
  T.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan ' + q.id, 3);
    assert.ok(ids(q.opsi).includes(T.kunciDugaan[q.id]), q.id + ': kunci ada di opsi');
    if (q.p) {
      const sym = E.simbolBandingPangkat(q.p, q.q);
      const kunci = { gt: q.opsi[0].id, lt: q.opsi[1].id, eq: 'sama' }[sym];
      assert.equal(T.kunciDugaan[q.id], kunci, q.id + ': kunci = lambang engine');
    }
  });
  T.kartu.forEach((k) => assert.ok(k.p && typeof k.p.a === 'number'));
});

test('informasi: penuntun punya umpan untuk setiap opsi', () => {
  D.informasi.penuntun.forEach((q) => {
    assertOptions(q.opsi, 'penuntun ' + q.id, 3);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + ': umpan untuk ' + o.id));
  });
  const strategi = E.opsiStrategiBandingPangkat().map((s) => s.id);
  strategi.forEach((id) => assert.ok(D.informasi.strategiContoh[id], 'contoh ' + id));
  assert.ok(D.informasi.labTarget >= 2 && D.informasi.labTarget <= strategi.length);
});

test('penuntun kunci perbandingan sesuai engine', () => {
  const P = (a, n) => ({ a: a, n: n });
  const Q = D.informasi.penuntun;
  const byId = Object.fromEntries(Q.map((q) => [q.id, q]));
  assert.equal(E.simbolBandingPangkat(P(3, 4), P(3, 6)), 'lt');
  assert.equal(byId.p1.correct, 'b');
  assert.equal(E.simbolBandingPangkat(P(2, -3), P(2, -5)), 'gt');
  assert.equal(byId.p2.correct, 'a');
  assert.equal(E.simbolBandingPangkat(P(3, 5), P(4, 5)), 'lt');
  assert.equal(byId.p3.correct, 'b');
  assert.equal(byId.p4.correct, E.simbolBandingPangkat(P(4, 5), P(8, 3)));
  assert.equal(E.simbolBandingPangkat(P(5, 0), P(2, -1)), 'gt');
  assert.equal(byId.p5.correct, 'a');
  assert.equal(E.simbolBandingPangkat(P(-2, 3), P(-2, 2)), 'lt');
  assert.equal(byId.p6.correct, 'b');
});

test('tim: batas anggota & kesepakatan', () => {
  assert.ok(D.tim.minAnggota >= 2 && D.tim.minAnggota <= D.tim.maksAnggota);
  assert.ok(D.tim.kesepakatan.length >= 2);
});

test('misi Bandingkan: makna lengkap & keempat strategi muncul', () => {
  const S = D.misiBanding.soal;
  assert.equal(new Set(ids(S)).size, S.length);
  const strategi = new Set();
  S.forEach((s) => {
    assertOptions(s.makna, s.id + '.makna', 3);
    assert.deepEqual([...ids(s.makna)].sort(), ['p', 'q', 'sama']);
    const sym = E.simbolBandingPangkat(s.p, s.q);
    assert.ok(MAKNA_DARI_SIMBOL[sym], s.id);
    strategi.add(E.strategiBandingPangkat(s.p, s.q));
    assert.ok(s.cerita.includes(E.teksPangkat(s.p)), s.id + ': cerita memuat p');
    assert.ok(s.cerita.includes(E.teksPangkat(s.q)), s.id + ': cerita memuat q');
  });
  assert.deepEqual([...strategi].sort(), [
    'basisSama',
    'hitungNilai',
    'pangkatSama',
    'samakanBasis',
  ]);
  const syms = new Set(S.map((s) => E.simbolBandingPangkat(s.p, s.q)));
  assert.ok(syms.has('lt') && syms.has('gt'), 'jawaban lambang bervariasi');
});

test('misi Urutkan: nilai tidak kembar & urutan terdefinisi', () => {
  D.misiUrut.soal.forEach((s) => {
    assert.ok(s.items.length >= 4, s.id);
    assert.equal(new Set(ids(s.items)).size, s.items.length);
    assert.ok(['naik', 'turun'].includes(s.arah));
    assert.equal(s.separator, s.arah === 'naik' ? '<' : '>');
    const urut = E.urutkanPangkat(s.items, s.arah);
    for (let i = 1; i < urut.length; i++) {
      assert.notEqual(E.bandingPangkat(urut[i - 1], urut[i]), 0, s.id + ': tidak ada nilai kembar');
    }
    const kunci = E.urutanIdPangkat(s.items, s.arah);
    assert.notDeepEqual([...kunci], ids(s.items), s.id + ': urutan data bukan kunci');
  });
});

test('misi Diskusi: kunci Benar/Salah sesuai engine', () => {
  const M = D.misiDiskusi;
  assertOptions(M.opsi, 'opsi diskusi', 2);
  assert.equal(new Set(ids(M.pernyataan)).size, M.pernyataan.length);
  const benar = M.pernyataan.filter((s) => s.correct === 'benar').length;
  assert.ok(benar >= 2 && benar <= M.pernyataan.length - 2, 'campuran benar & salah');
  M.pernyataan.forEach((s) => {
    assert.ok(ids(M.opsi).includes(s.correct), s.id);
    assert.ok(s.explanation, s.id + '.explanation');
    if (s.cek) {
      const sym = E.simbolBandingPangkat(s.cek.p, s.cek.q);
      assert.equal(s.correct, sym === s.cek.sym ? 'benar' : 'salah', s.id);
    }
  });
});

test('kuis: bank cukup untuk komposisi & kunci dihitung engine', () => {
  const K = D.kuis;
  const total = Object.values(K.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, K.banyak);
  Object.entries(K.komposisi).forEach(([jenis, n]) => {
    const bank = K.soal.filter((s) => s.jenis === jenis).length;
    assert.ok(bank > n, jenis + ': bank harus lebih banyak dari yang diambil');
  });
  assert.equal(new Set(ids(K.soal)).size, K.soal.length);
  K.soal.forEach((s) => {
    assertOptions(s.options, s.id + '.options', 3);
    assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada di opsi');
    assert.ok(s.explanation, s.id + '.explanation');
    const c = s.cek;
    if (c.jenis === 'lambang') {
      assert.deepEqual([...ids(s.options)].sort(), ['eq', 'gt', 'lt'], s.id);
      assert.equal(s.correct, E.simbolBandingPangkat(c.p, c.q), s.id);
      if (s.jenis === 'lambang') {
        s.options.forEach((o) =>
          assert.equal(
            o.label,
            E.teksPangkat(c.p) + ' ' + E.compareSymbolText(o.id) + ' ' + E.teksPangkat(c.q),
            s.id + '.' + o.id
          )
        );
      }
    } else if (c.jenis === 'terbesar' || c.jenis === 'terkecil') {
      s.options.forEach((o) =>
        assert.ok(o.label.includes(E.teksPangkat(o.p)), s.id + '.' + o.id + ': label memuat p')
      );
      assert.equal(
        s.correct,
        E.ekstremPangkat(
          s.options.map((o) => ({ id: o.id, a: o.p.a, n: o.p.n })),
          c.jenis
        ),
        s.id
      );
    } else if (c.jenis === 'urut') {
      const kunci = E.urutkanPangkat(c.items, c.arah).map(E.teksPangkat).join(', ');
      assert.equal(s.options.find((o) => o.id === s.correct).label, kunci, s.id);
      s.options
        .filter((o) => o.id !== s.correct)
        .forEach((o) => assert.notEqual(o.label, kunci, s.id + '.' + o.id));
    } else {
      assert.fail(s.id + ': jenis cek tidak dikenal');
    }
  });
});

test('refleksi: opsi penilaian diri cukup untuk diacak', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 3);
  assert.ok(D.refleksi.pertanyaan.length >= 3);
});
