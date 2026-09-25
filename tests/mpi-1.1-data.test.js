'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-1.1/data.js (Membaca & menulis
 * bilangan bulat dalam kehidupan sehari-hari): kunci jawaban setiap
 * situasi/frasa/soal harus cocok dengan engine seksi 29
 * (nilaiKonteks, tandaKataKunci, bacaBulat, cekCaraBaca,
 * diagnosaTulisBulat), setiap daftar pilihan punya id unik dan cukup
 * opsi untuk diacak, serta jumlah tahap sama dengan manifest halaman.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-1.1/data.js']);
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

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

test('sepuluh tahap: setiap tahap punya konten & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-1.1'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => !['selesai'].includes(t.id)).forEach((t) => assertHead(D[t.id], t.id));
});

test('stimulasi: kabar, dugaan tidak dinilai tetapi punya id baku', () => {
  const S = D.stimulasi;
  assert.ok(S.kabar.length >= 3);
  S.kabar.forEach((k) => assert.ok(k.ikon && k.sumber && k.teks && k.sorot, k.id));
  assert.equal(new Set(ids(S.kabar)).size, S.kabar.length);
  assert.ok(S.dugaan.length >= 2);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan untuk tahap Bukti');
  });
  assert.equal(new Set(ids(S.dugaan)).size, S.dugaan.length);
});

test('masalah: pertanyaan inti ada di opsi dengan umpan tiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
});

test('koleksi: jawaban setiap situasi = nilaiKonteks(besar, frasa) & pas pada skala', () => {
  const K = D.koleksi;
  assert.ok(K.situasi.length >= 6);
  assert.equal(new Set(ids(K.situasi)).size, K.situasi.length);
  const tanda = new Set();
  const tema = new Set();
  K.situasi.forEach((s) => {
    assert.ok(E.KONTEKS_BULAT[s.tema], s.id + ': tema dikenal');
    assert.equal(E.nilaiKonteks(s.besar, s.frasa), s.jawab, s.id + ': kunci = engine');
    const sk = s.skala;
    const langkah = sk.langkah || 1;
    assert.ok(sk.min < 0 && sk.max > 0, s.id + ': skala memuat nol');
    assert.ok(s.jawab >= sk.min && s.jawab <= sk.max, s.id + ': titik dalam rentang');
    assert.equal(Math.abs(s.jawab % langkah), 0, s.id + ': titik pada garis skala');
    assert.equal(Math.abs(sk.min % langkah), 0, s.id + ': min kelipatan langkah');
    assert.ok((sk.max - sk.min) / langkah <= 20, s.id + ': maksimal 21 garis');
    assert.ok(s.label && s.hints.length >= 1 && s.temuan, s.id + ': label/hints/temuan');
    assert.equal(E.diagnosaTulisBulat(E.tulisBulat(s.jawab), s.jawab).benar, true);
    tanda.add(Math.sign(s.jawab));
    tema.add(s.tema);
  });
  assert.equal(tanda.size, 3, 'ada situasi negatif, nol, dan positif');
  assert.ok(tema.size >= 4, 'minimal empat konteks berbeda');
  assertGuided(K.amati, 'koleksi.amati');
});

test('olahPilah: kategori frasa = tandaKataKunci & bilangan = nilaiKonteks', () => {
  const P = D.olahPilah;
  assertOptions(P.opsiPilah, 'opsiPilah', 3);
  assert.ok(P.pilah.length >= 8);
  assert.equal(new Set(ids(P.pilah)).size, P.pilah.length);
  const kat = new Set();
  P.pilah.forEach((it) => {
    assert.ok(ids(P.opsiPilah).includes(it.correct), it.id + ': kategori valid');
    assert.equal(E.tandaKataKunci(it.teks), it.correct, it.id + ': ' + it.teks);
    assert.equal(E.nilaiKonteks(it.besar, it.teks), it.jawab, it.id + ': bilangan');
    assert.ok(
      it.explanation.includes(E.tulisBulat(it.jawab)),
      it.id + ': pembahasan memuat notasi'
    );
    kat.add(it.correct);
  });
  assert.equal(kat.size, 3);
  assertGuided(P.pola, 'olahPilah.pola');
  assert.ok(P.temuan.length >= 2);
});

test('olahBaca: pasangan, tulis notasi, dan tulis cara baca konsisten dengan engine', () => {
  const B = D.olahBaca;
  assertGuided(B.pasang, 'olahBaca.pasang');
  assert.ok(B.tulisNotasi.length >= 3);
  B.tulisNotasi.forEach((s) => {
    assert.equal(E.normalisasiBacaan(s.bacaan), E.bacaBulat(s.jawab), s.id + ': bacaan baku');
    assert.ok(s.label.includes(s.bacaan), s.id + ': label memuat bacaan');
    assert.ok(s.hints.length >= 1, s.id + ': hints');
  });
  assert.ok(B.tulisBacaan.length >= 3);
  B.tulisBacaan.forEach((s) => {
    assert.ok(s.label.includes(E.tulisBulat(s.jawab)), s.id + ': label memuat notasi');
    assert.equal(E.cekCaraBaca(E.bacaBulat(s.jawab), s.jawab).benar, true);
    assert.ok(s.hints.length >= 1, s.id + ': hints');
  });
  const semua = ids(B.tulisNotasi).concat(ids(B.tulisBacaan));
  assert.equal(new Set(semua).size, semua.length, 'id langkah unik');
  assert.ok(B.temuan.length >= 2);
});

test('verifikasi: pernyataan benar/salah & banding dugaan', () => {
  const V = D.verifikasi;
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 2);
  assert.ok(V.pernyataan.length >= 5);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  const kunci = new Set();
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id);
    assert.ok(p.teks && p.explanation, p.id);
    kunci.add(p.correct);
  });
  assert.equal(kunci.size, 2, 'ada pernyataan benar dan salah');
});

test('generalisasi: setiap kalimat punya potongan benar yang unik & ada pengecoh', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  const dipakai = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(dipakai).size, dipakai.length, 'potongan benar tidak ganda');
  dipakai.forEach((c) => assert.ok(bank.includes(c), c));
  assert.ok(bank.length - dipakai.length >= 2, 'minimal dua pengecoh');
  G.bank.forEach((b) => assert.ok(b.teks, b.id));
});

test('terapkan: bank soal cukup untuk komposisi acak & kunci cocok engine', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length, 'id soal unik');
  const jenis = (s) => (s.type === 'choice' ? 'choice' : s.mode);
  let total = 0;
  Object.keys(T.komposisi).forEach((k) => {
    const ada = T.soal.filter((s) => jenis(s) === k).length;
    assert.ok(ada > T.komposisi[k], k + ': bank lebih banyak dari yang diambil agar teracak');
    total += T.komposisi[k];
  });
  assert.equal(total, T.banyak);
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    if (s.frasa) assert.equal(E.nilaiKonteks(s.besar, s.frasa), s.jawab, s.id + ': frasa');
    if (s.type === 'choice') {
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada');
    } else {
      assert.ok(['tulis', 'baca'].includes(s.mode), s.id + ': mode');
      assert.ok(Number.isInteger(s.jawab), s.id + ': jawab bulat');
      assert.ok(s.hints.length >= 1, s.id + ': hints');
      if (s.mode === 'tulis') {
        assert.ok(s.reveal.includes(E.tulisBulat(s.jawab)), s.id + ': reveal memuat notasi');
        assert.equal(E.diagnosaTulisBulat(E.tulisBulat(s.jawab), s.jawab).benar, true);
      } else {
        assert.ok(s.reveal.includes(E.bacaBulat(s.jawab)), s.id + ': reveal memuat bacaan');
        assert.ok(
          s.pertanyaan.includes(E.tulisBulat(s.jawab)) || s.cerita.includes(E.tulisBulat(s.jawab)),
          s.id + ': notasi tampil'
        );
      }
    }
  });
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 3);
});
