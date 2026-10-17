'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-14.1/data.js (relasi antara dua
 * himpunan dalam kehidupan sehari-hari, Discovery Learning): setiap
 * tahap punya kepala DL; setiap daftar pilihan cukup opsi untuk diacak
 * dengan id & label unik dan umpan balik tiap opsi; pasangan setiap
 * relasi cocok dengan ceritanya dan anggotanya ada di kedua himpunan;
 * relasi bilangan dihitung ulang dari aturannya (fungsi di berkas ini,
 * bebas dari data); kunci pilihan ganda dihitung ulang dengan fungsi
 * seksi 25 shared/engine.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-14.1/data.js']);
const D = E.DATA;

/* Aturan relasi bilangan, ditulis ulang di sini agar kunci teruji mandiri. */
const ATURAN = {
  faktor: (a, b) => b % a === 0,
  setengah: (a, b) => 2 * a === b,
  kuadrat: (a, b) => a * a === b,
  lebih: (a, b) => a > b,
  duaKali: (a, b) => a === 2 * b,
};

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
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

/* 'Nadia' | 'Nadia dan Sinta' | 'a, b dan c' */
function gabung(list) {
  if (list.length <= 1) return list.join('');
  return list.slice(0, -1).join(', ') + ' dan ' + list[list.length - 1];
}

/* Label kunci yang diharapkan untuk pertanyaan bertanda cek pada relasi R. */
function kunciCek(jenis, R) {
  if (jenis === 'pasangan')
    return E.formatRelasiPasangan(E.normalisasiRelasi(R.pasangan, R.A, R.B));
  if (jenis === 'range') return E.formatHimpunan(E.rangeRelasi(R.pasangan, R.B));
  if (jenis === 'tanpaPasangan') return gabung(E.anggotaTanpaPasangan(R.A, R.pasangan));
  if (jenis === 'lebihSatu') {
    return gabung(R.A.filter((a) => E.banyakPanahDari(R.pasangan, a) > 1));
  }
  throw new Error('jenis cek tak dikenal: ' + jenis);
}

function assertKunciCek(q, R, name) {
  if (!q.cek) return;
  const kunci = kunciCek(q.cek.jenis, R);
  assert.ok(kunci, name + ': kunci tidak kosong');
  const benar = q.opsi.find((o) => o.id === q.correct);
  assert.equal(benar.label, kunci, name + ': label kunci');
}

/* Relasi { A, B, pasangan, labelA, labelB, namaRelasi } yang sah. */
function assertRelasi(R, name) {
  ['labelA', 'labelB', 'namaRelasi'].forEach((f) => assert.ok(R[f], name + '.' + f));
  assert.equal(new Set(R.A.map(String)).size, R.A.length, name + ': anggota A unik');
  assert.equal(new Set(R.B.map(String)).size, R.B.length, name + ': anggota B unik');
  assert.ok(R.pasangan.length >= 2, name + ': minimal 2 pasangan');
  assert.equal(
    E.normalisasiRelasi(R.pasangan).length,
    R.pasangan.length,
    name + ': tanpa pasangan ganda'
  );
  R.pasangan.forEach((p) => {
    assert.ok(R.A.includes(p[0]), name + ': ' + p[0] + ' anggota A');
    assert.ok(R.B.includes(p[1]), name + ': ' + p[1] + ' anggota B');
  });
  if (R.aturan) {
    assert.ok(ATURAN[R.aturan], name + ': aturan ' + R.aturan + ' dikenal');
    assert.ok(
      E.relasiSama(R.pasangan, E.relasiDariAturan(R.A, R.B, ATURAN[R.aturan])),
      name + ': pasangan = hasil aturan ' + R.aturan
    );
  }
}

/* Cerita [{ a, b: [...], teks }] → pasangan yang sama, teks menyebut semuanya. */
function assertCerita(R, name) {
  assert.ok(Array.isArray(R.cerita) && R.cerita.length === R.A.length, name + ': cerita per a');
  const dariCerita = [];
  R.cerita.forEach((c) => {
    assert.ok(R.A.includes(c.a), name + ': ' + c.a + ' anggota A');
    assert.ok(c.teks.includes(c.a), name + ': teks menyebut ' + c.a);
    c.b.forEach((b) => {
      assert.ok(c.teks.includes(b), name + ': teks ' + c.a + ' menyebut ' + b);
      dariCerita.push([c.a, b]);
    });
  });
  assert.ok(E.relasiSama(R.pasangan, dariCerita), name + ': pasangan sesuai cerita');
}

function assertChips(R, name) {
  assert.equal(new Set(ids(R.chips)).size, R.chips.length, name + ': id chip unik');
  assert.equal(
    new Set(R.chips.map((c) => E.kunciPasangan(c.a, c.b))).size,
    R.chips.length,
    name + ': chip tidak kembar'
  );
  R.pasangan.forEach((p) =>
    assert.ok(
      R.chips.some((c) => c.a === p[0] && c.b === p[1]),
      name + ': chip untuk ' + E.formatPasangan(p[0], p[1])
    )
  );
  const pengecoh = R.chips.filter((c) => !E.adaPasangan(R.pasangan, c.a, c.b));
  assert.ok(pengecoh.length >= 3, name + ': minimal 3 pengecoh');
  assert.ok(
    pengecoh.some((c) => E.adaPasangan(R.pasangan, c.b, c.a)),
    name + ': ada pengecoh pasangan terbalik'
  );
}

test('setiap tahap punya kepala Discovery Learning', () => {
  [
    'stimulasi',
    'masalah',
    'kumpul',
    'olah',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    ['kicker', 'goal', 'syntax', 'guru'].forEach((f) => assert.ok(D[k][f], k + '.' + f));
  });
  ['stimulasi', 'masalah', 'kumpul', 'olah', 'verifikasi', 'generalisasi'].forEach((k, i) =>
    assert.match(D[k].syntax, new RegExp('Discovery Learning · Sintaks ' + (i + 1)))
  );
  assert.equal(D.stimulasi.tpJudul, 'Tujuan belajar hari ini');
  assert.match(D.stimulasi.tp, /relasi sebagai hubungan antar-anggota dua himpunan/);
  assert.match(D.stimulasi.tp, /kehidupan sehari-hari/);
});

test('stimulasi: cerita ekskul = relasi kumpul, dugaan tak dinilai tetapi acak-able', () => {
  const S = D.stimulasi;
  assertOptions(S.opsi, 'stimulasi.opsi');
  assert.ok(ids(S.opsi).includes(D.verifikasi.dugaanBenar), 'dugaanBenar ada di opsi');
  assert.ok(S.catatan && S.nextLabel);
});

test('masalah: pertanyaan inti dengan umpan tiap opsi', () => {
  assertGuided(D.masalah, 'masalah');
  assert.ok(D.masalah.hipotesisLabel && D.masalah.hipotesisPlaceholder);
});

test('kumpul A: relasi ekskul dari cerita, memuat anggota tanpa pasangan & bercabang', () => {
  const R = D.kumpul.ekskul;
  assertRelasi(R, 'kumpul.ekskul');
  assertCerita(R, 'kumpul.ekskul');
  assert.ok(E.anggotaTanpaPasangan(R.A, R.pasangan).length >= 1, 'ada murid tanpa ekskul');
  assert.ok(
    R.A.some((a) => E.banyakPanahDari(R.pasangan, a) > 1),
    'ada murid dengan lebih dari satu ekskul'
  );
  assert.ok(E.rangeRelasi(R.pasangan, R.B).length < R.B.length, 'range ≠ kodomain');
  assert.ok(R.hints.length && R.temuan);
});

test('kumpul B: relasi kota & makanan khas dari cerita (tabel silang)', () => {
  const R = D.kumpul.kota;
  assertRelasi(R, 'kumpul.kota');
  assertCerita(R, 'kumpul.kota');
  assert.ok(E.rangeRelasi(R.pasangan, R.B).length < R.B.length, 'ada makanan tanpa kota');
  assert.ok(R.hints.length && R.temuan);
});

test('kumpul C: chip pasangan "faktor dari" sesuai aturan, ada pengecoh terbalik', () => {
  const R = D.kumpul.bilangan;
  assertRelasi(R, 'kumpul.bilangan');
  assert.equal(R.aturan, 'faktor');
  assertChips(R, 'kumpul.bilangan');
  assert.ok(R.hints.length && R.temuan);
});

test('olah: pertanyaan penuntun berkunci hasil hitung relasi ekskul, kartu istilah', () => {
  const O = D.olah;
  assert.ok(O.pertanyaan.length >= 5);
  O.pertanyaan.forEach((q) => {
    assertGuided(q, 'olah.' + q.id);
    assertKunciCek(q, D.kumpul.ekskul, 'olah.' + q.id);
  });
  const cek = O.pertanyaan.filter((q) => q.cek).map((q) => q.cek.jenis);
  ['range', 'tanpaPasangan', 'lebihSatu'].forEach((j) => assert.ok(cek.includes(j), 'cek ' + j));
  assert.ok(O.istilah.length >= 4);
  O.istilah.forEach((t) => assert.ok(t.label && t.teks));
});

test('verifikasi: lab tiga aturan pada himpunan yang sama menghasilkan relasi berbeda', () => {
  const L = D.verifikasi.lab;
  assert.ok(L.aturan.length >= 3);
  assert.equal(new Set(ids(L.aturan)).size, L.aturan.length);
  L.aturan.forEach((r) => {
    const R = Object.assign({ A: L.A, B: L.B, labelA: L.labelA, labelB: L.labelB }, r);
    assertRelasi(R, 'lab.' + r.id);
    assert.ok(r.hints.length && r.temuan, 'lab.' + r.id + ': hints & temuan');
  });
  for (let i = 0; i < L.aturan.length; i++) {
    for (let j = i + 1; j < L.aturan.length; j++) {
      assert.ok(!E.relasiSama(L.aturan[i].pasangan, L.aturan[j].pasangan), 'relasi berbeda');
    }
  }
  assert.ok(
    L.aturan.some((r) => E.anggotaTanpaPasangan(L.A, r.pasangan).length > 0),
    'ada aturan dengan anggota A tanpa pasangan'
  );
});

test('verifikasi: pilah miskonsepsi memakai kedua kategori', () => {
  const V = D.verifikasi;
  assertOptions(V.opsiPilah, 'verifikasi.opsiPilah', 2);
  assert.ok(V.pilah.length >= 5);
  assert.equal(new Set(V.pilah.map((p) => p.correct)).size, 2);
  V.pilah.forEach((p) => assert.ok(ids(V.opsiPilah).includes(p.correct) && p.explanation));
});

test('generalisasi: setiap kalimat berkunci di bank, ada pengecoh', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  assert.equal(new Set(G.bank.map((b) => b.teks)).size, bank.length);
  G.kalimat.forEach((k) => assert.ok(bank.includes(k.correct), k.id));
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  assert.ok(bank.length - G.kalimat.length >= 3, 'minimal 3 pengecoh');
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: soal kontekstual beragam tipe dengan kunci teruji', () => {
  const T = D.terapkan;
  assert.ok(T.soal.length >= 8);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  const tipe = new Set(T.soal.map((s) => s.tipe));
  ['pilih', 'panah', 'tabel', 'chips'].forEach((t) => assert.ok(tipe.has(t), 'tipe ' + t));
  T.soal.forEach((s) => {
    const nm = 'terapkan.' + s.id;
    assertRelasi(s, nm);
    assert.ok(s.cerita && s.hints.length && s.pembahasan, nm + ': cerita, hints, pembahasan');
    if (s.tipe === 'pilih') {
      assert.ok(s.tanya && ['panah', 'tabel', 'daftar', 'cerita'].includes(s.tampil), nm);
      assertGuided(s, nm);
      assert.ok(s.cek, nm + '.cek');
      assertKunciCek(s, s, nm);
    }
    if (s.tipe === 'chips') assertChips(s, nm);
  });
  const konteks = T.soal.filter((s) => !s.aturan).length;
  assert.ok(konteks >= 5, 'minimal 5 soal konteks kehidupan sehari-hari');
});

test('terapkan: pengecoh opsi "pasangan" memuat urutan terbalik', () => {
  D.terapkan.soal
    .filter((s) => s.cek && s.cek.jenis === 'pasangan')
    .forEach((s) => {
      const terbalik = E.formatRelasiPasangan(
        E.normalisasiRelasi(s.pasangan, s.A, s.B).map((p) => [p[1], p[0]])
      );
      assert.ok(
        s.opsi.some((o) => o.label === terbalik),
        s.id + ': ada opsi pasangan terbalik'
      );
    });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.selesai.judul && D.selesai.capaian.length >= 3);
});
