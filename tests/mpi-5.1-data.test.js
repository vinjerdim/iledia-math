'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-5.1/data.js (Unsur-unsur bentuk
 * aljabar, Discovery Learning): setiap kunci sama dengan engine seksi 74
 * (unsurBentuk, jenisBagianAljabar, periksaSoalUnsur, jawabSoalUnsur,
 * opsiSoalUnsur), opsi pilihan cukup & unik agar dapat diacak, tahap
 * mengikuti sintaks Discovery Learning dan sama dengan manifest halaman.
 * app.js juga dicek agar pilihan selalu dirender dengan urutan acak
 * tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-5.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-5.1', 'app.js'), 'utf8');
const OLAH = ['olahVariabel', 'olahKoefisien', 'olahSuku'];
const JENIS = ['variabel', 'koefisien', 'konstanta', 'suku'];

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

function assertGuided(list, name, min) {
  assert.ok(list.length >= (min || 1), name + ': cukup pertanyaan');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya, q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

function assertHead(S, name) {
  ['kicker', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Cek terbaca engine dan menghasilkan nilai baku. */
function assertCek(c, name) {
  if (c.model) {
    assert.equal(c.minta, 'bentuk', name + ': model → bentuk');
  } else {
    assert.ok(E.unsurBentuk(c.bentuk), name + ': bentuk terbaca');
  }
  const v = E.nilaiSoalUnsur(c);
  assert.ok(v !== null && v !== undefined, name + ': nilai baku ada');
}

/* Langkah { cek }: jawaban baku diterima pemeriksa & disebut di temuan. */
function assertLangkah(list, name) {
  assert.ok(list.length >= 2, name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.ok(s.label && s.temuan && s.placeholder, n + ': label, temuan, placeholder');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, n + ': petunjuk');
    assertCek(s.cek, n);
    const jawab = E.jawabSoalUnsur(s);
    assert.equal(E.periksaSoalUnsur(jawab, s).benar, true, n + ': jawaban baku diterima');
    assert.ok(s.temuan.includes(jawab.split(', ')[0]), n + ': temuan memuat ' + jawab);
  });
}

test('sebelas tahap Discovery Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-5.1'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Discovery Learning/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.equal(D.tahap.length, 11);
  assert.equal(new Set(ids(D.tahap)).size, 11);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
    assert.match(APP, new RegExp('\\b' + t.id + ': render'), t.id + ': ada renderer');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  const sintaks = {
    stimulasi: 1,
    masalah: 2,
    koleksi: 3,
    olahVariabel: 4,
    olahKoefisien: 4,
    olahSuku: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Discovery Learning · Sintaks ' + n, id);
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-5.1', 'index.html'), 'utf8');
  assert.match(html, /<title>Unsur-Unsur Bentuk Aljabar/);
  assert.match(html, /0 dari 11 tahap selesai/);
});

test('stimulasi: TP, kartu nota & model, dugaan sesuai engine', () => {
  const S = D.stimulasi;
  assert.match(S.tp, /variabel, konstanta, koefisien, dan suku/);
  assert.ok(S.tpJudul && S.kriteria.length >= 4);
  assert.equal(S.kartu.length, 2);
  assert.ok(
    S.kartu.some((k) => k.bentuk && E.unsurBentuk(k.bentuk)),
    'kartu nota'
  );
  assert.ok(
    S.kartu.some((k) => k.model),
    'kartu model konkret'
  );
  assert.ok(S.dugaan.length >= 3);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    if (q.cek) {
      const baku = q.opsi.find((o) => o.id === q.baku).label;
      if (q.cek.minta === 'variabel') {
        assert.equal(E.periksaSoalUnsur(baku, q).benar, true, q.id + ': label baku = engine');
      } else {
        const jawab = E.jawabSoalUnsur(q);
        assert.ok(baku.startsWith(jawab + ' '), q.id + ': label baku = engine (' + jawab + ')');
      }
    }
  });
  /* model kartu = model situasi pertama Lab Kantong */
  const model = S.kartu.find((k) => k.model).model;
  assert.deepEqual(model, D.koleksi.lab.situasi[0].model);
});

test('masalah: pertanyaan inti dengan umpan untuk setiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], o.id + ': umpan'));
  assert.ok(M.hipotesisLabel && M.hipotesisPlaceholder);
});

test('koleksi: Lab Kantong dengan situasi bervariasi tanda & batas cukup', () => {
  const L = D.koleksi.lab;
  assert.deepEqual(Array.from(L.huruf), ['x', 'y']);
  assert.ok(L.situasi.length >= 4);
  assert.equal(new Set(ids(L.situasi)).size, L.situasi.length);
  L.situasi.forEach((s) => {
    assert.ok(s.judul && s.cerita, s.id + ': teks');
    Object.keys(s.model).forEach((k) => {
      assert.ok(L.huruf.includes(k) || k === 'lepas', s.id + ': kunci model ' + k);
      const maks = k === 'lepas' ? L.batasLepas : L.batas;
      assert.ok(Math.abs(s.model[k]) <= maks, s.id + ': dalam batas stepper');
    });
    /* cerita menyebut setiap banyak kantong & kelereng */
    Object.values(s.model).forEach((v) =>
      assert.ok(s.cerita.includes(String(Math.abs(v))), s.id + ': cerita memuat ' + v)
    );
  });
  /* variasi: koefisien tersirat 1, konstanta negatif, koefisien negatif */
  const semua = L.situasi.map((s) => s.model);
  assert.ok(
    semua.some((m) => m.y === 1),
    'ada kantong tunggal (koefisien 1)'
  );
  assert.ok(
    semua.some((m) => m.lepas < 0),
    'ada konstanta negatif'
  );
  assert.ok(
    semua.some((m) => m.y < 0 || m.x < 0),
    'ada koefisien negatif'
  );
  assert.ok(D.koleksi.tips.length >= 2);
  assert.ok(D.koleksi.selesaiTeks && D.koleksi.nextLabel);
});

test('olah data: temuan, Ketuk Unsur, dan langkah konsisten dengan engine', () => {
  OLAH.forEach((id) => {
    const O = D[id];
    assert.ok(O.judul && O.pengantar && O.ringkasan && O.nextLabel, id + ': teks');
    assertGuided(O.temuan, id + '.temuan', 3);
    assertLangkah(O.langkah, id + '.langkah');
    O.ketuk.forEach((k) => {
      assert.ok(['variabel', 'konstanta', 'suku'].includes(k.mode), k.id + ': mode');
      const tok = E.tokenKetukUnsur(k.bentuk, k.mode);
      assert.ok(
        tok.some((t) => t.target),
        k.id + ': ada yang harus diketuk'
      );
      const benar = tok.filter((t) => t.target).map((t) => t.id);
      assert.equal(E.periksaKetukUnsur(k.bentuk, k.mode, benar).benar, true, k.id);
    });
  });
  const semuaKetuk = OLAH.flatMap((id) => Array.from(D[id].ketuk, (k) => k.id));
  assert.equal(new Set(semuaKetuk).size, semuaKetuk.length, 'id ketuk unik');
  assert.ok(semuaKetuk.length >= 3);
  /* tahap koefisien memuat kasus koefisien 1, −1, dan negatif */
  const koef = Array.from(D.olahKoefisien.langkah, (s) => E.nilaiSoalUnsur(s.cek));
  [1, -1].forEach((k) => assert.ok(koef.includes(k), 'koefisien ' + k));
  assert.ok(
    koef.some((k) => k < -1),
    'koefisien negatif'
  );
});

test('verifikasi: jenis bagian sesuai engine & pernyataan lengkap', () => {
  const V = D.verifikasi;
  assert.deepEqual(ids(V.kategori), JENIS);
  assert.ok(V.bagian.length >= 6);
  assert.equal(new Set(ids(V.bagian)).size, V.bagian.length);
  V.bagian.forEach((b) => {
    assert.ok(b.explanation, b.id + ': penjelasan');
    assert.equal(E.jenisBagianAljabar(b.bentuk, b.bagian), b.correct, b.id + ': kunci = engine');
  });
  JENIS.forEach((k) =>
    assert.ok(
      V.bagian.some((b) => b.correct === k),
      'ada contoh ' + k
    )
  );
  /* bentuk verifikasi BARU (tidak sama dengan Lab Kantong) */
  const lab = D.koleksi.lab.situasi.map((s) => E.bentukDariModel(s.model));
  V.bagian.forEach((b) => assert.ok(!lab.includes(E.rapikanBentukAljabar(b.bentuk)), b.id));
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 3);
  assert.ok(V.pernyataan.length >= 5);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id + ': correct ada di opsi');
    assert.ok(p.teks && p.explanation, p.id);
  });
  assert.ok(V.judulA && V.judulB && V.judulC && V.pengantarA);
});

test('generalisasi: empat definisi, potongan benar unik & ada pengecoh', () => {
  const G = D.generalisasi;
  assert.equal(G.kalimat.length, 4);
  assertOptions(G.bank, 'bank', 6);
  const benar = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar tidak dipakai ulang');
  benar.forEach((b) => assert.ok(ids(G.bank).includes(b), b + ': ada di bank'));
  assert.ok(G.bank.length - G.kalimat.length >= 2, 'minimal dua pengecoh');
  /* rangkuman sesuai unsur contoh */
  const U = E.unsurBentuk(G.contoh);
  const teks = G.rangkuman.join(' ');
  U.suku.forEach((s) => assert.ok(teks.includes(s), 'rangkuman memuat suku ' + s));
  U.koefisien.forEach((k) =>
    assert.ok(teks.includes(E.formatAngkaAljabar(k.koef)), 'koefisien ' + k.koef)
  );
});

test('uji terap: bank soal, komposisi, kunci & opsi pilihan ganda dari engine', () => {
  const T = D.terapkan;
  assert.equal(T.soal.length, 16);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  assert.equal(T.komposisi.input + T.komposisi.choice, T.banyak);
  Object.keys(T.komposisi).forEach((k) => {
    assert.ok(T.soal.filter((s) => s.type === k).length >= T.komposisi[k] * 2, k + ': bank cukup');
  });
  const minta = new Set();
  T.soal.forEach((s) => {
    const n = 'soal.' + s.id;
    assert.ok(['input', 'choice'].includes(s.type), n + ': type');
    assert.ok(D.konteks[s.konteks], n + ': konteks dikenal');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, n + ': teks');
    assertCek(s.cek, n);
    minta.add(s.cek.minta);
    const jawab = E.jawabSoalUnsur(s);
    if (s.cek.minta !== 'jenis') {
      assert.equal(E.periksaSoalUnsur(jawab, s).benar, true, n + ': kunci diterima');
    }
    assert.ok(s.explanation.includes(jawab), n + ': penjelasan memuat ' + jawab);
    if (s.type === 'input') {
      assert.notEqual(s.cek.minta, 'jenis', n + ': isian bukan nama jenis');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
      assert.ok(s.reveal && s.reveal.includes(jawab), n + ': reveal memuat jawaban');
    } else {
      const opsi = E.opsiSoalUnsur(s);
      assert.ok(opsi.length >= 4, n + ': minimal 4 opsi');
      assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, n + ': label unik');
    }
  });
  ['koefisien', 'konstanta', 'banyakSuku', 'variabel', 'suku', 'bentuk', 'jenis'].forEach((m) =>
    assert.ok(minta.has(m), 'ada soal ' + m)
  );
  ['bazar', 'kantong', 'sekolah', 'simbol'].forEach((k) =>
    assert.ok(
      T.soal.some((s) => s.konteks === k),
      'ada konteks ' + k
    )
  );
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.ok(S.judul && S.teks && S.capaian.length >= 4);
  S.contoh.forEach((c) => assert.ok(E.unsurBentuk(c.bentuk), c.bentuk));
});

test('app.js: semua pilihan diacak sekali & disimpan di state', () => {
  ['ensureShuffledOrder', 'ensureSortStates', 'shuffleArray', 'opsiSoalUnsur'].forEach((f) =>
    assert.match(APP, new RegExp('\\b' + f + '\\('), f + ' dipakai')
  );
  [
    'dugaanOrders',
    'masalahOrder',
    'temuanOrders',
    'bagianOrder',
    'pernyataanOrder',
    'bankOrder',
    'refleksiDiriOrder',
    'optionOrder',
  ].forEach((k) => assert.match(APP, new RegExp('\\b' + k + '\\b'), k + ' tersimpan'));
  assert.match(APP, /STORAGE_KEY = 'mpi-d-5-1-/);
});
