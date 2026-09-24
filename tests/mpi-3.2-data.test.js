'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-3.2/data.js: kunci jawaban harus
 * cocok dengan hasil perbandingan engine (bandingkanDesimal/urutkan),
 * setiap daftar pilihan punya id unik dan cukup opsi untuk diacak.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-3.2/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 2), name + ' minimal ' + (min || 2) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
}

function assertGuided(list, name) {
  list.forEach((q) => {
    assertOptions(q.opsi, name + '.' + q.id, 3);
    assert.ok(ids(q.opsi).includes(q.correct), name + '.' + q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + '.' + q.id + ': umpan untuk ' + o.id));
  });
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function isDesimal(s) {
  return E.desimalDigits(s) !== null;
}

test('setiap tahap punya kepala tahap & catatan guru', () => {
  [
    'orientasi',
    'masalah',
    'hipotesis',
    'dataTempat',
    'dataGaris',
    'uji',
    'urutkan',
    'simpulan',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k], 'DATA.' + k);
    ['kicker', 'syntax', 'goal', 'guru', 'nextLabel'].forEach((f) =>
      assert.ok(D[k][f], 'DATA.' + k + '.' + f)
    );
  });
});

test('orientasi: pelari tercepat = catatan waktu terkecil', () => {
  const O = D.orientasi;
  assertOptions(O.pelari, 'orientasi.pelari', 3);
  O.pelari.forEach((p) => assert.ok(isDesimal(p.waktu), p.waktu));
  const tercepat = E.urutkanDesimal(O.pelari.map((p) => p.waktu))[0];
  assert.equal(O.pelari.find((p) => p.id === O.benar).waktu, tercepat);
  assertOptions(O.tekaOpsi, 'orientasi.tekaOpsi', 3);
  const [a, b] = O.tekaPasangan;
  const cmp = E.bandingkanDesimal(a, b);
  const harap = cmp > 0 ? a : cmp < 0 ? b : 'sama';
  assert.equal(O.tekaOpsi.find((o) => o.id === O.tekaBenar).nilai, harap);
});

test('masalah: jawaban benar & umpan balik tiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah.opsi', 3);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
});

test('hipotesis: strategi & pasangan dugaan valid', () => {
  const H = D.hipotesis;
  assertOptions(H.strategi, 'hipotesis.strategi', 3);
  assert.ok(ids(H.strategi).includes(H.strategiBenar));
  H.strategi.forEach((o) => assert.ok(H.tanggapan[o.id], 'tanggapan ' + o.id));
  assert.ok(H.dugaan.length >= 3);
  H.dugaan.forEach((p) => assert.ok(isDesimal(p.a) && isDesimal(p.b), p.id));
  assert.equal(new Set(ids(H.dugaan)).size, H.dugaan.length);
});

test('dataTempat: pasangan valid, termasuk satu pasangan yang sama nilainya', () => {
  const T = D.dataTempat;
  assert.ok(T.pasangan.length >= 3);
  T.pasangan.forEach((p) => assert.ok(isDesimal(p.a) && isDesimal(p.b), p.id));
  assert.ok(T.pasangan.some((p) => E.bandingkanDesimal(p.a, p.b) === 0));
  assertOptions(T.opsiTempat, 'dataTempat.opsiTempat', 3);
  /* setiap tempat beda pertama harus tersedia sebagai opsi */
  T.pasangan.forEach((p) => {
    const pos = E.tempatBedaPertama(p.a, p.b);
    const id = pos === null ? 'none' : String(pos);
    assert.ok(ids(T.opsiTempat).includes(id), p.id + ' → ' + id);
  });
  assertGuided(T.temuan, 'dataTempat.temuan');
});

test('dataGaris: setiap bilangan tepat berada pada titik garis bilangan', () => {
  const G = D.dataGaris;
  assert.ok(G.garis.length >= 2);
  G.garis.forEach((g) => {
    const kMin = E.skalaDesimal(g.min, g.digits);
    const kMax = E.skalaDesimal(g.max, g.digits);
    assert.ok(kMin < kMax, g.id);
    assert.equal(new Set(ids(g.items)).size, g.items.length);
    g.items.forEach((it) => {
      const k = E.skalaDesimal(it.value, g.digits);
      assert.notEqual(k, null, g.id + ' ' + it.value);
      assert.ok(k >= kMin && k <= kMax, g.id + ' ' + it.value);
    });
  });
  assertGuided(G.amati, 'dataGaris.amati');
});

test('uji: pilah benar/salah & pasangan lambang', () => {
  const U = D.uji;
  assertOptions(U.opsiPilah, 'uji.opsiPilah', 2);
  U.pilah.forEach((it) => {
    assert.ok(ids(U.opsiPilah).includes(it.correct), it.id);
    assert.ok(it.explanation, it.id);
  });
  assert.equal(new Set(ids(U.pilah)).size, U.pilah.length);
  assert.ok(U.banding.length >= 4);
  U.banding.forEach((p) => assert.ok(isDesimal(p.a) && isDesimal(p.b), p.id));
  /* ketiga lambang muncul sebagai jawaban agar tidak bisa ditebak */
  const sym = new Set(U.banding.map((p) => E.simbolBandingDesimal(p.a, p.b)));
  ['lt', 'gt', 'eq'].forEach((s) => assert.ok(sym.has(s), 'lambang ' + s));
});

test('urutkan: papan urutan tanpa nilai kembar & pertanyaan alasan', () => {
  const U = D.urutkan;
  assert.ok(U.papan.length >= 2);
  U.papan.forEach((p) => {
    assert.ok(p.arah === 'naik' || p.arah === 'turun', p.id);
    assert.ok(p.bilangan.length >= 4, p.id);
    p.bilangan.forEach((b) => assert.ok(isDesimal(b.value), b.value));
    const vals = p.bilangan.map((b) => b.value);
    for (let i = 0; i < vals.length; i++) {
      for (let j = i + 1; j < vals.length; j++) {
        assert.notEqual(E.bandingkanDesimal(vals[i], vals[j]), 0, vals[i] + ' vs ' + vals[j]);
      }
    }
  });
  assertGuided(U.tanya, 'urutkan.tanya');
});

test('simpulan: setiap kalimat punya lanjutan benar & ada pengecoh', () => {
  const S = D.simpulan;
  assertOptions(S.bank, 'simpulan.bank', 3);
  S.kalimat.forEach((k) => assert.ok(ids(S.bank).includes(k.correct), k.id));
  assert.ok(S.bank.length > S.kalimat.length);
  assert.equal(new Set(S.kalimat.map((k) => k.correct)).size, S.kalimat.length);
});

test('terapkan: kunci jawaban & alasan konsisten dengan perbandingan desimal', () => {
  const T = D.terapkan;
  assert.ok(T.soal.length >= 5);
  T.soal.forEach((s) => {
    assertOptions(s.opsi, s.id + '.opsi', 3);
    assert.ok(ids(s.opsi).includes(s.benar), s.id);
    assertOptions(s.alasanOpsi, s.id + '.alasanOpsi', 3);
    assert.ok(ids(s.alasanOpsi).includes(s.alasanBenar), s.id);
    const c = s.cek;
    assert.ok(c, s.id + ' punya cek');
    if (c.tipe === 'maks' || c.tipe === 'min') {
      const urut = E.urutkanDesimal(s.opsi.map((o) => o.nilai));
      const harap = c.tipe === 'maks' ? urut[urut.length - 1] : urut[0];
      assert.equal(s.opsi.find((o) => o.id === s.benar).nilai, harap, s.id);
      /* jawaban tunggal: tidak ada nilai lain yang sama dengan jawaban */
      assert.equal(s.opsi.filter((o) => E.bandingkanDesimal(o.nilai, harap) === 0).length, 1);
    } else if (c.tipe === 'naik' || c.tipe === 'turun') {
      s.opsi.forEach((o) => {
        const sorted = E.urutkanDesimal(o.urutan, c.tipe === 'turun');
        const tepat = sorted.join('|') === o.urutan.join('|');
        assert.equal(tepat, o.id === s.benar, s.id + '.' + o.id);
      });
    } else if (c.tipe === 'banding') {
      const sym = E.simbolBandingDesimal(c.a, c.b);
      assert.equal(s.opsi.find((o) => o.id === s.benar).sym, sym, s.id);
    } else {
      assert.fail('tipe cek tidak dikenal: ' + c.tipe);
    }
  });
});

test('refleksi: pertanyaan & opsi penilaian diri', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'refleksi.diriOpsi', 3);
});
