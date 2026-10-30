'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-17.1/data.js (unsur-unsur
 * lingkaran pada benda & gambar di sekitar, Discovery Learning): setiap
 * tahap punya kepala DL; setiap daftar pilihan cukup opsi untuk diacak
 * dengan id & label unik serta umpan balik tiap opsi; kunci pemilahan,
 * bagian benda verifikasi, dan soal gambar dihitung ulang dari
 * geometrinya dengan fungsi seksi 84 shared/engine.js; bank soal cukup
 * untuk diambil acak sesuai komposisi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-17.1/data.js']);
const D = E.DATA;

const UNSUR = E.UNSUR_LINGKARAN.map((u) => u.id);

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.ok(list.length <= 6, name + ' maksimal 6 opsi (huruf A–F)');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  assert.equal(
    new Set(list.map((o) => o.label || o.teks)).size,
    list.length,
    name + ': label opsi harus unik'
  );
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function sorotan(elemen) {
  return elemen.filter((e) => e.sorot);
}

test('setiap tahap DL punya kicker, syntax, goal, dan catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'koleksi',
    'olahRuas',
    'olahDaerah',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    ['kicker', 'syntax', 'goal', 'guru'].forEach((f) =>
      assert.ok(typeof D[k][f] === 'string' && D[k][f].length > 5, k + '.' + f)
    );
  });
});

test('stimulasi: TP menyebut ketujuh unsur & dugaan berpilihan acak', () => {
  const S = D.stimulasi;
  ['pusat', 'jari-jari', 'diameter', 'tali busur', 'busur', 'juring', 'tembereng'].forEach((u) =>
    assert.ok(S.tp.includes(u), 'TP memuat ' + u)
  );
  assert.ok(S.kriteria.length >= 3);
  assert.ok(S.kartu.length >= 5);
  assert.ok(S.dugaan.length >= 2);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.temuan && q.temuan.length > 20, q.id + ': temuan');
  });
});

test('masalah: pertanyaan inti berpengecoh', () => {
  assertGuided(D.masalah, 'masalah');
});

test('koleksi: misi lab cocok dengan unsur wajib dan dapat diselesaikan', () => {
  const cfg = D.koleksi.lab;
  assert.ok(cfg.r > 0 && cfg.satuan && cfg.langkah > 0);
  assert.equal(360 % cfg.langkah, 0, 'langkah membagi 360');
  assert.deepEqual(
    JSON.parse(JSON.stringify(ids(cfg.misi))),
    JSON.parse(JSON.stringify(cfg.wajib))
  );
  cfg.wajib.forEach((w) => assert.ok(UNSUR.includes(w), w));
  const st = E.makeLabLingkaranState();
  /* telusuri semua kombinasi kontrol lalu catat */
  ['ruas', 'busur', 'daerah'].forEach((mode) => {
    E.ubahLabLingkaran(st, 'mode', mode);
    ['pusat', 'lingkaran', 'dalam'].forEach((uj) => {
      E.ubahLabLingkaran(st, 'ujung', uj);
      ['jariJari', 'taliBusur'].forEach((bt) => {
        E.ubahLabLingkaran(st, 'batas', bt);
        for (let b = 0; b < 360; b += 30) {
          st.a = 0;
          st.b = b;
          E.catatLabLingkaran(st, cfg);
        }
      });
    });
  });
  assert.equal(E.labLingkaranSelesai(st, cfg), true);
});

test('olahRuas & olahDaerah: pertanyaan penuntun, temuan, dan pemilahan dari geometri', () => {
  ['olahRuas', 'olahDaerah'].forEach((k) => {
    const O = D[k];
    assert.ok(O.pertanyaan.length >= 3, k);
    O.pertanyaan.forEach((q) => assertGuided(q, k + '.' + q.id));
    assert.ok(O.temuan.length >= 2, k + ': temuan');
    assertOptions(O.kategori, k + '.kategori', 3);
    assert.ok(O.pilah.length >= 6, k + ': butir pilah');
    assert.equal(new Set(ids(O.pilah)).size, O.pilah.length);
    O.pilah.forEach((it) => {
      assert.equal(E.jenisUnsurLingkaran(it.el), it.correct, k + '.' + it.id + ': kunci geometri');
      assert.ok(ids(O.kategori).includes(it.correct), it.id + ': kunci ada di kategori');
      assert.ok(it.explanation && it.explanation.length > 20, it.id + ': explanation');
    });
    O.kategori.forEach((c) =>
      assert.ok(
        O.pilah.some((it) => it.correct === c.id),
        k + ': ada butir ' + c.id
      )
    );
  });
  /* jebakan: juring besar (> setengah lingkaran) tetap juring */
  assert.ok(
    D.olahDaerah.pilah.some(
      (it) => it.correct === 'juring' && E.rentangSudutLkr(it.el.a0, it.el.a1) > 180
    )
  );
});

test('verifikasi: setiap benda punya ≥ 3 bagian bernomor dengan kunci unsur sah', () => {
  const V = D.verifikasi;
  assert.ok(V.bank.length >= 5);
  assert.equal(new Set(ids(V.bank)).size, V.bank.length);
  const semua = new Set();
  V.bank.forEach((b) => {
    assert.ok(b.nama && b.cerita && b.caption && b.dekor, b.id);
    assert.ok(b.bagian.length >= 3, b.id + ': ≥ 3 bagian');
    assert.equal(new Set(b.bagian.map((g) => g.tag)).size, b.bagian.length, b.id + ': tag unik');
    const jenis = b.bagian.map((g) => E.jenisUnsurLingkaran(g.el));
    jenis.forEach((j) => {
      assert.ok(UNSUR.includes(j), b.id + ': ' + j + ' unsur sah');
      semua.add(j);
    });
    assert.ok(new Set(jenis).size >= 3, b.id + ': ≥ 3 jenis berbeda');
  });
  UNSUR.forEach((u) => assert.ok(semua.has(u), 'verifikasi memuat ' + u));
});

test('verifikasi: pernyataan benar/salah & kesimpulan', () => {
  const V = D.verifikasi;
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 2);
  assert.ok(V.pernyataan.length >= 6);
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id);
    assert.ok(p.explanation.length > 20, p.id);
  });
  ['benar', 'salah'].forEach((k) =>
    assert.ok(
      V.pernyataan.some((p) => p.correct === k),
      'ada pernyataan ' + k
    )
  );
  assert.ok(V.kesimpulan.length > 20);
});

test('generalisasi: tujuh kalimat definisi, bank berpengecoh', () => {
  const G = D.generalisasi;
  assert.equal(G.kalimat.length, 7);
  /* bank dirender di <select>, bukan tombol berhuruf — batas 6 opsi tidak berlaku */
  assert.ok(G.bank.length >= G.kalimat.length + 2, 'bank berpengecoh');
  assert.equal(new Set(ids(G.bank)).size, G.bank.length);
  assert.equal(new Set(G.bank.map((b) => b.teks)).size, G.bank.length);
  G.kalimat.forEach((k) => assert.ok(ids(G.bank).includes(k.correct), k.id));
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: bank soal sah, kunci dihitung ulang, komposisi dapat dipenuhi', () => {
  const T = D.terapkan;
  const soal = T.soal;
  assert.equal(new Set(ids(soal)).size, soal.length);
  let total = 0;
  Object.keys(T.komposisi).forEach((tipe) => {
    const n = T.komposisi[tipe];
    total += n;
    assert.ok(
      soal.filter((s) => s.tipe === tipe).length > n,
      tipe + ': bank lebih banyak daripada yang diambil'
    );
  });
  assert.equal(total, T.banyak);
  soal.forEach((s) => {
    assert.ok(s.konteks && D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.cerita && s.tanya && s.pembahasan && s.hints.length >= 1, s.id);
    if (s.tipe === 'gambar') {
      const sorot = sorotan(s.elemen);
      assert.equal(sorot.length, 1, s.id + ': tepat satu unsur disorot');
      assert.ok(UNSUR.includes(E.jenisUnsurLingkaran(sorot[0])), s.id + ': kunci unsur sah');
      assert.ok(s.caption && s.dekor, s.id);
    } else if (s.tipe === 'nama') {
      assert.ok(UNSUR.includes(s.kunci), s.id + ': kunci unsur');
    } else if (s.tipe === 'pilih') {
      assertGuided(s, s.id);
    } else {
      assert.equal(s.tipe, 'isi', s.id);
      const k = E.nilaiSoalLingkaran(s.cek);
      assert.ok(Number.isFinite(k) && k > 0, s.id + ': kunci positif');
      assert.equal(E.diagnosaSoalLingkaran(s.cek, k), 'benar', s.id);
      assert.ok(s.satuan, s.id + ': satuan');
    }
  });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi');
  assert.ok(D.selesai.capaian.length >= 4);
});
