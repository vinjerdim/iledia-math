'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-9.1/data.js (Unsur & bidang penyusun
 * bangun ruang, Discovery Learning): setiap kunci sama dengan engine seksi
 * 78 (nilaiSoalRuang, jawabSoalRuang, periksaSoalRuang, opsiSoalRuang,
 * punyaSisiLengkung, kelompokAlas, rumusUnsurBangun), opsi pilihan cukup &
 * unik agar dapat diacak, tahap mengikuti sintaks Discovery Learning dan
 * sama dengan manifest halaman. app.js juga dicek agar pilihan selalu
 * dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-9.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-9.1', 'app.js'), 'utf8');
const OLAH = ['olahSisi', 'olahAlas', 'olahPola'];

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

function labelOpsi(list, id) {
  return list.find((o) => o.id === id).label;
}

function assertBenda(b, name) {
  assert.ok(b.id && b.nama && b.ikon, name + ': identitas benda');
  assert.ok(E.BGR_JENIS.includes(b.jenis), name + ': jenis dikenal');
  if (b.jenis === 'prisma' || b.jenis === 'limas') {
    assert.ok(Number.isInteger(b.n) && b.n >= 3 && b.n <= 10, name + ': n');
  } else {
    assert.equal(b.n, undefined, name + ': tabung/kerucut tanpa n');
  }
}

test('sebelas tahap Discovery Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-9.1'];
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
    olahSisi: 4,
    olahAlas: 4,
    olahPola: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Discovery Learning · Sintaks ' + n, id);
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-9.1', 'index.html'), 'utf8');
  assert.match(html, /<title>\s*Unsur &amp; Bidang Penyusun Bangun Ruang/);
  assert.match(html, /0 dari 11 tahap selesai/);
});

test('index.html root: card Materi 9.1 di Kelas VII › Topik 9', () => {
  const idx = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const card = idx.match(/<a\s+href="fase-d\/mpi-9\.1\/index\.html"[\s\S]*?<\/a>/);
  assert.ok(card, 'card ada');
  assert.match(card[0], /data-kelas="VII"/);
  assert.match(card[0], /data-topik="9"/);
  assert.match(card[0], /Materi 9\.1/);
  assert.match(card[0], /Discovery Learning/);
});

test('stimulasi: TP, kartu benda konkret, dugaan sesuai engine', () => {
  const S = D.stimulasi;
  ['unsur', 'bidang penyusun', 'prisma', 'tabung', 'limas', 'kerucut', 'benda konkret'].forEach(
    (k) => assert.ok(S.tp.includes(k), 'TP memuat ' + k)
  );
  assert.ok(S.kartu.length >= 4);
  const jenis = new Set();
  S.kartu.forEach((k) => {
    assert.ok(k.judul && k.teks, k.id);
    assertBenda({ id: k.id, nama: k.judul, ikon: k.ikon, jenis: k.jenis, n: k.n }, k.id);
    jenis.add(k.jenis);
  });
  assert.equal(jenis.size, 4, 'kartu mewakili keempat bangun');
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    if (q.cek) {
      assert.equal(labelOpsi(q.opsi, q.baku), E.jawabSoalRuang({ cek: q.cek }), q.id + ': baku');
    }
  });
  assert.ok(S.alasanLabel && S.catatan);
});

test('masalah: pertanyaan inti dengan umpan untuk setiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
  assert.ok(M.hipotesisLabel && M.hipotesisPlaceholder);
});

test('koleksi: Lab Amati memuat benda keempat bangun & dapat diselesaikan', () => {
  const L = D.koleksi.lab;
  assert.ok(L.benda.length >= L.minBenda + 2, 'pilihan benda lebih banyak dari minimal');
  assert.ok(L.minBenda >= 4);
  assert.equal(new Set(ids(L.benda)).size, L.benda.length);
  L.benda.forEach((b) => assertBenda(b, b.id));
  E.BGR_JENIS.forEach((j) =>
    assert.ok(
      L.benda.some((b) => b.jenis === j),
      'benda ' + j
    )
  );
  assert.ok(D.koleksi.tips.length >= 3);
  const st = E.ensureLabAmati({}, 'lab', L);
  assert.equal(E.labAmatiLengkap(st, L), false);
  L.benda.forEach((b) => {
    st.benda = b.id;
    const u = E.unsurBangunRuang(b.jenis, b.n);
    E.BGR_KOLOM.forEach((k) => {
      st.isian[b.id][k.id] = String(u[k.id]);
    });
    assert.equal(E.periksaIsianAmati(st, L).semuaBenar, true, b.id);
    assert.equal(E.pilihBidangAmati(st, L, 'baku'), true, b.id);
  });
  assert.equal(E.labAmatiLengkap(st, L), true);
});

test('olah data: temuan, pemilahan & langkah konsisten dengan engine', () => {
  OLAH.forEach((id) => {
    const S = D[id];
    assertHead(S, id);
    assertGuided(S.temuan, id + '.temuan', 3);
    assert.ok(S.ringkasan && S.judul && S.pengantar, id + ': teks');

    const P = S.pilah;
    assertOptions(P.kategori, id + '.pilah.kategori', 2);
    assert.ok(P.butir.length >= 5, id + ': butir pemilahan cukup');
    assert.equal(new Set(ids(P.butir)).size, P.butir.length, id + ': id butir unik');
    P.butir.forEach((b) => assert.ok(b.explanation, b.id + ': penjelasan'));

    assert.ok(S.langkah.length >= 3, id + ': langkah cukup');
    assert.equal(new Set(ids(S.langkah)).size, S.langkah.length, id + ': id langkah unik');
    S.langkah.forEach((s) => {
      const n = id + '.' + s.id;
      assert.ok(s.label && s.temuan && s.placeholder, n + ': teks');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
      const benar = E.jawabSoalRuang(s);
      assert.equal(E.periksaSoalRuang(benar, s).benar, true, n + ': kunci diterima');
      assert.ok(s.temuan.includes(benar), n + ': temuan memuat ' + benar);
      assert.notEqual(s.placeholder.replace('mis. ', ''), benar, n + ': contoh bukan kunci');
    });
  });

  /* Kunci pemilahan dihitung engine & setiap kategori terpakai. */
  const sisi = D.olahSisi.pilah;
  const pakaiSisi = new Set();
  sisi.butir.forEach((b) => {
    assert.ok(E.BGR_JENIS.includes(b.jenis), b.id);
    const kat = E.punyaSisiLengkung(b.jenis) ? 'lengkung' : 'datar';
    assert.ok(ids(sisi.kategori).includes(kat));
    pakaiSisi.add(kat);
  });
  assert.equal(pakaiSisi.size, 2);

  const alas = D.olahAlas.pilah;
  const pakaiAlas = new Set();
  alas.butir.forEach((b) => {
    assertBenda({ id: b.id, nama: b.id, ikon: '·', jenis: b.jenis, n: b.n }, b.id);
    const kat = E.kelompokAlas(b.jenis);
    assert.ok(ids(alas.kategori).includes(kat));
    pakaiAlas.add(kat);
  });
  assert.equal(pakaiAlas.size, 2);
  const teksAlas = alas.butir.map((b) => E.teksBidangPenyusun(b.jenis, b.n));
  assert.equal(new Set(teksAlas).size, teksAlas.length, 'teks bidang penyusun berbeda');

  const pola = D.olahPola.pilah;
  const pakaiPola = new Set();
  pola.butir.forEach((b) => {
    const cocok = ['prisma', 'limas'].filter((j) => {
      const r = E.rumusUnsurBangun(j, b.kolom);
      return r && r.a === b.a && r.b === b.b;
    });
    assert.equal(cocok.length, 1, b.id + ': rumus milik tepat satu bangun');
    for (let n = 3; n <= 8; n++) {
      assert.equal(b.a * n + b.b, E.unsurBangunRuang(cocok[0], n)[b.kolom], b.id + ' n=' + n);
    }
    pakaiPola.add(cocok[0]);
  });
  assert.equal(pakaiPola.size, 2);
  assert.ok(D.olahPola.polaN.length >= 3);
});

test('verifikasi: bank benda baru, pernyataan lengkap', () => {
  const V = D.verifikasi;
  assert.ok(V.bank.length >= 4);
  assert.equal(new Set(ids(V.bank)).size, V.bank.length);
  V.bank.forEach((b) => assertBenda(b, b.id));
  E.BGR_JENIS.forEach((j) =>
    assert.ok(
      V.bank.some((b) => b.jenis === j),
      'bank ' + j
    )
  );
  const lab = ids(D.koleksi.lab.benda);
  V.bank.forEach((b) => assert.ok(!lab.includes(b.id), b.id + ': benda baru'));
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 3);
  assert.ok(V.pernyataan.length >= 5);
  const kat = ids(V.opsiPernyataan);
  const pakai = new Set();
  V.pernyataan.forEach((p) => {
    assert.ok(p.teks && p.explanation, p.id);
    assert.ok(kat.includes(p.correct), p.id + ': kategori');
    pakai.add(p.correct);
  });
  assert.equal(pakai.size, kat.length, 'setiap kategori dipakai');
  assert.ok(V.judulA && V.judulB && V.judulC && V.buktiTeks && V.buktiLabel);
});

test('generalisasi: kesimpulan, potongan benar unik & ada pengecoh', () => {
  const G = D.generalisasi;
  assert.ok(G.kalimat.length >= 4);
  assertOptions(G.bank, 'bank', G.kalimat.length + 2);
  const benar = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar berbeda');
  benar.forEach((b) => assert.ok(ids(G.bank).includes(b)));
  const teks = G.rangkuman.join(' ');
  ['Prisma', 'Tabung', 'Limas', 'Kerucut', 'titik puncak', 'juring'].forEach((k) =>
    assert.ok(teks.includes(k), 'rangkuman memuat ' + k)
  );
  assert.deepEqual(Array.from(G.contoh, (c) => c.jenis).sort(), [...E.BGR_JENIS].sort());
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
  const jenis = new Set();
  T.soal.forEach((s) => {
    const n = 'soal.' + s.id;
    assert.ok(['input', 'choice'].includes(s.type), n + ': type');
    assert.ok(D.konteks[s.konteks], n + ': konteks dikenal');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, n + ': teks');
    minta.add(s.cek.minta);
    jenis.add(s.cek.jenis);
    const v = E.nilaiSoalRuang(s.cek);
    if (typeof v === 'number') {
      assert.ok(Number.isInteger(v) && v >= 0, n + ': jawaban cacah');
      if (s.cek.minta === 'n') assert.ok(v >= 3, n + ': n minimal 3');
      assert.ok(s.explanation.includes(String(v)), n + ': penjelasan memuat ' + v);
    }
    const jawab = E.jawabSoalRuang(s);
    if (s.type === 'input') {
      assert.equal(typeof v, 'number', n + ': isian berupa bilangan');
      assert.equal(E.periksaSoalRuang(jawab, s).benar, true, n + ': kunci diterima');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
    } else {
      const opsi = E.opsiSoalRuang(s);
      assert.ok(opsi.length >= 4, n + ': minimal 4 opsi');
      assert.equal(opsi[0].label, jawab, n + ': opsi baku');
      assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, n + ': label unik');
      assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length, n + ': id unik');
      opsi.forEach((o) => assert.ok(o.umpan, n + '.' + o.id + ': umpan'));
    }
  });
  ['unsur', 'banyakBidang', 'n', 'bangun', 'bidang'].forEach((m) =>
    assert.ok(minta.has(m), 'ada soal ' + m)
  );
  E.BGR_JENIS.forEach((j) => assert.ok(jenis.has(j), 'ada soal ' + j));
});

test('refleksi & selesai: pertanyaan, penilaian diri, contoh keempat bangun', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  R.pertanyaan.forEach((q) => assert.ok(q.teks && q.placeholder, q.id));
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.deepEqual(Array.from(S.contoh, (c) => c.jenis).sort(), [...E.BGR_JENIS].sort());
  S.contoh.forEach((c) => {
    assert.ok(D.namaJenis[c.jenis] && c.benda, c.jenis);
  });
  assert.ok(S.capaian.length >= 4);
});

test('app.js: pilihan selalu dirender dengan urutan acak tersimpan', () => {
  assert.match(APP, /shuffleArray\(/);
  assert.match(APP, /ensureShuffledOrder\(/);
  assert.match(APP, /ensureSortStates\(/);
  assert.match(APP, /ensureLabAmati\(/);
  assert.match(APP, /opsiSoalRuang\(/);
  assert.match(APP, /STORAGE_KEY = 'mpi-d-9-1-/);
  /* Setiap buildChoiceGroup memakai urutan dari State, bukan urutan DATA. */
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*[^,)]+/g) || [];
  assert.ok(panggilan.length >= 2);
  panggilan.forEach((p) => assert.match(p, /State\.|orders\[|Order/, p));
});
