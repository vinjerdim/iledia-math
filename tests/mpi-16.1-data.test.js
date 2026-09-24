'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-16.1/data.js (Relasi antara dua
 * himpunan): kunci jawaban relasi harus cocok dengan hasil engine
 * (relasiDariAturan, diagnosaRelasi, formatRelasiPasangan), dan setiap
 * daftar pilihan punya id unik serta cukup opsi untuk diacak.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-16.1/data.js']);
const D = E.DATA;

/* Aturan relasi bilangan yang dipakai di konten, diuji terhadap engine. */
const ATURAN = {
  faktor: (a, b) => b % a === 0,
  kurang: (a, b) => a < b,
  setengah: (a, b) => b === 2 * a,
  duaKali: (a, b) => a === 2 * b,
};

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + '.' + o.id + ': label'));
}

function assertGuided(list, name) {
  assert.ok(list.length >= 2, name + ': minimal dua pertanyaan');
  list.forEach((q) => {
    assert.ok(q.tanya, name + '.' + q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), name + '.' + q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + '.' + q.id + ': umpan untuk ' + o.id));
  });
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertRelasiSah(R, name) {
  R.pairs.forEach((p) => {
    assert.ok(R.A.includes(p[0]), name + ': ' + p[0] + ' anggota A');
    assert.ok(R.B.includes(p[1]), name + ': ' + p[1] + ' anggota B');
  });
  assert.equal(E.normalisasiRelasi(R.pairs).length, R.pairs.length, name + ': tanpa duplikat');
}

function survei() {
  return D.stimulasi.survei;
}

function relasiSurvei() {
  const S = D.stimulasi;
  const pairs = [];
  survei().forEach((t) => t.suka.forEach((o) => pairs.push([t.nama, o])));
  return { A: S.A, B: S.B, pairs: pairs };
}

test('setiap tahap punya kepala tahap, sintaks DL & catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'koleksi',
    'olahPasangan',
    'olahRelasi',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k], 'DATA.' + k);
    ['kicker', 'syntax', 'goal', 'guru', 'nextLabel'].forEach((f) =>
      assert.ok(D[k][f], 'DATA.' + k + '.' + f)
    );
  });
  assert.match(D.stimulasi.syntax, /Sintaks 1/);
  assert.match(D.masalah.syntax, /Sintaks 2/);
  assert.match(D.koleksi.syntax, /Sintaks 3/);
  assert.match(D.olahPasangan.syntax, /Sintaks 4/);
  assert.match(D.olahRelasi.syntax, /Sintaks 4/);
  assert.match(D.verifikasi.syntax, /Sintaks 5/);
  assert.match(D.generalisasi.syntax, /Sintaks 6/);
});

test('stimulasi: data survei membentuk relasi yang kaya kasus', () => {
  const S = D.stimulasi;
  assertOptions(S.opsi, 'stimulasi.opsi');
  assert.deepEqual(
    survei().map((t) => t.nama),
    S.A,
    'setiap anggota A punya kartu survei, urut sama'
  );
  const R = relasiSurvei();
  assertRelasiSah(R, 'survei');
  assert.ok(E.anggotaTanpaPasangan(R.A, R.pairs).length >= 1, 'ada teman tanpa panah');
  assert.ok(
    R.A.some((a) => E.banyakPanahDari(R.pairs, a) >= 2),
    'ada teman dengan lebih dari satu panah'
  );
  assert.ok(E.rangeRelasi(R.pairs, R.B).length < R.B.length, 'range ≠ kodomain');
  survei().forEach((t) => assert.ok(t.kutipan, 'kutipan ' + t.nama));
});

test('masalah: satu rumusan masalah benar, umpan untuk setiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah.opsi');
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
  assert.ok(M.hipotesisLabel && M.hipotesisPlaceholder);
});

test('koleksi: label diagram & tabel tersedia', () => {
  const K = D.koleksi;
  ['labelA', 'labelB', 'namaRelasi', 'instruksiPanah', 'instruksiTabel'].forEach((f) =>
    assert.ok(K[f], 'koleksi.' + f)
  );
});

test('olahPasangan: chip memuat semua pasangan benar + pengecoh terbalik', () => {
  const P = D.olahPasangan;
  const R = relasiSurvei();
  assertOptions(
    P.chips.map((c) => ({ id: c.id, label: E.formatPasangan(c.a, c.b) })),
    'olahPasangan.chips',
    R.pairs.length + 3
  );
  const benar = P.chips.filter((c) => E.adaPasangan(R.pairs, c.a, c.b));
  assert.equal(benar.length, R.pairs.length, 'setiap pasangan benar muncul tepat sekali');
  const terbalik = P.chips.filter((c) => E.adaPasangan(R.pairs, c.b, c.a));
  assert.ok(terbalik.length >= 2, 'minimal dua pengecoh urutan terbalik');
  assertGuided(P.tanya, 'olahPasangan.tanya');
  const qBanyak = P.tanya.find((q) => q.id === 'banyak');
  assert.ok(qBanyak, 'pertanyaan banyak pasangan');
  assert.equal(
    qBanyak.opsi.find((o) => o.id === qBanyak.correct).label,
    String(R.pairs.length),
    'kunci banyak pasangan = banyak panah'
  );
});

test('olahRelasi: konsep & pemilahan nama relasi cocok dengan aturan', () => {
  const O = D.olahRelasi;
  assertGuided(O.konsep, 'olahRelasi.konsep');
  assertOptions(O.opsiNama, 'olahRelasi.opsiNama', 4);
  ids(O.opsiNama).forEach((id) => assert.ok(ATURAN[id], 'aturan uji untuk ' + id));
  assert.ok(O.item.length >= 4);
  assert.equal(new Set(ids(O.item)).size, O.item.length);
  O.item.forEach((it) => {
    assertRelasiSah(it, 'olahRelasi.' + it.id);
    assert.ok(ids(O.opsiNama).includes(it.correct));
    assert.deepEqual(
      plain(it.pairs),
      plain(E.relasiDariAturan(it.A, it.B, ATURAN[it.correct])),
      it.id + ': pasangan = hasil aturan ' + it.correct
    );
    /* nama relasi lain tidak boleh juga cocok (kunci tunggal) */
    ids(O.opsiNama)
      .filter((id) => id !== it.correct)
      .forEach((id) =>
        assert.ok(
          !E.relasiSama(it.pairs, E.relasiDariAturan(it.A, it.B, ATURAN[id])),
          it.id + ': ' + id + ' tidak boleh ikut benar'
        )
      );
    assert.ok(it.explanation);
  });
  const nama = O.item.map((it) => it.correct);
  assert.equal(new Set(nama).size, nama.length, 'setiap nama relasi dipakai sekali');
});

test('verifikasi: relasi "faktor dari" & tanggapan miskonsepsi', () => {
  const V = D.verifikasi;
  assertRelasiSah(V.uji, 'verifikasi.uji');
  assert.deepEqual(plain(V.uji.pairs), plain(E.relasiDariAturan(V.uji.A, V.uji.B, ATURAN.faktor)));
  assert.ok(E.anggotaTanpaPasangan(V.uji.A, V.uji.pairs).length >= 1);
  assert.ok(V.uji.A.some((a) => E.banyakPanahDari(V.uji.pairs, a) >= 2));
  ids(D.stimulasi.opsi).forEach((id) =>
    assert.ok(V.kesimpulanDugaan[id], 'kesimpulan untuk dugaan ' + id)
  );
  assert.ok(V.soal.length >= 4);
  V.soal.forEach((q) => {
    assertOptions(q.options, 'verifikasi.' + q.id);
    assert.ok(ids(q.options).includes(q.correct));
    assert.ok(q.pernyataan && q.explanation);
  });
});

test('generalisasi: bank kalimat memuat semua kunci + pengecoh', () => {
  const G = D.generalisasi;
  assertOptions(
    G.bank.map((b) => ({ id: b.id, label: b.teks })),
    'generalisasi.bank'
  );
  assert.ok(G.bank.length > G.kalimat.length, 'ada potongan pengecoh');
  G.kalimat.forEach((k) => assert.ok(ids(G.bank).includes(k.correct), k.id));
  const kunci = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(kunci).size, kunci.length, 'kunci tidak dobel');
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: soal pilihan ganda kontekstual yang sah', () => {
  const T = D.terapkan;
  assert.ok(T.soal.length >= 8);
  T.soal.forEach((s, i) => {
    const nm = 'terapkan[' + i + ']';
    assert.equal(s.type, 'choice', nm);
    ['konteks', 'cerita', 'pertanyaan', 'explanation'].forEach((f) => assert.ok(s[f], nm + f));
    assertOptions(s.options, nm);
    assert.ok(ids(s.options).includes(s.correct), nm + ': correct ada di opsi');
    const opsiLabel = s.options.map((o) => o.label);
    assert.equal(new Set(opsiLabel).size, opsiLabel.length, nm + ': label opsi unik');
    if (s.visual) {
      assert.ok(['panah', 'tabel', 'daftar'].includes(s.visual), nm + ': jenis visual');
      assert.ok(s.relasi, nm + ': visual butuh data relasi');
    }
    if (s.relasi) {
      assertRelasiSah(s.relasi, nm + '.relasi');
      if (s.relasi.aturan) {
        assert.deepEqual(
          plain(s.relasi.pairs),
          plain(E.relasiDariAturan(s.relasi.A, s.relasi.B, ATURAN[s.relasi.aturan])),
          nm + ': pasangan = hasil aturan'
        );
      }
      if (s.kunciPasangan) {
        assert.equal(
          s.options.find((o) => o.id === s.correct).label,
          E.formatRelasiPasangan(s.relasi.pairs),
          nm + ': kunci = himpunan pasangan berurutan'
        );
      }
      if (s.kunciBanyak) {
        assert.equal(
          s.options.find((o) => o.id === s.correct).label,
          String(s.relasi.pairs.length),
          nm + ': kunci = banyak pasangan'
        );
      }
    }
  });
  const berVisual = T.soal.map((s) => s.visual).filter(Boolean);
  ['panah', 'tabel', 'daftar'].forEach((j) =>
    assert.ok(berVisual.includes(j), 'ada soal dengan penyajian ' + j)
  );
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  R.pertanyaan.forEach((q) => assert.ok(q.id && q.teks && q.placeholder));
  assertOptions(R.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.selesai.judul && D.selesai.teks && D.selesai.capaian.length >= 3);
});
