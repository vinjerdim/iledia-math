'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-8.1/data.js (Hubungan antar sudut,
 * Discovery Learning): setiap kunci sama dengan engine seksi 77
 * (nilaiSoalSudut, jawabSoalSudut, periksaSoalSudut, opsiSoalSudut,
 * jenisPasanganSudut, jenisPasanganNilai), opsi pilihan cukup & unik agar
 * dapat diacak, tahap mengikuti sintaks Discovery Learning dan sama
 * dengan manifest halaman. app.js juga dicek agar pilihan selalu
 * dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-8.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-8.1', 'app.js'), 'utf8');
const OLAH = ['olahPelurus', 'olahTolak', 'olahPenyiku'];

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

test('sebelas tahap Discovery Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-8.1'];
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
    olahPelurus: 4,
    olahTolak: 4,
    olahPenyiku: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Discovery Learning · Sintaks ' + n, id);
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-8.1', 'index.html'), 'utf8');
  assert.match(html, /<title>\s*Hubungan Antar Sudut/);
  assert.match(html, /0 dari 11 tahap selesai/);
});

test('stimulasi: TP, gambar kartu, dugaan sesuai engine', () => {
  const S = D.stimulasi;
  ['berpelurus', 'berpenyiku', 'bertolak belakang', 'dua garis yang berpotongan'].forEach((k) =>
    assert.ok(S.tp.includes(k), 'TP memuat ' + k)
  );
  assert.ok(S.kartu.length >= 3);
  const mode = new Set();
  S.kartu.forEach((k) => {
    assert.ok(k.judul && k.teks && k.gambar, k.id);
    mode.add(k.gambar.mode);
    assert.equal(k.gambar.label.length, E.banyakSudutLab(k.gambar.mode), k.id + ': label');
    assert.ok(k.teks.includes(k.gambar.label[0]), k.id + ': teks memuat sudut yang diketahui');
  });
  assert.ok(mode.has('potong') && mode.has('siku'), 'kartu dua garis & siku-siku');
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    if (q.cek) {
      assert.equal(labelOpsi(q.opsi, q.baku), E.jawabSoalSudut({ cek: q.cek }), q.id + ': baku');
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

test('koleksi: Lab Sudut dua mode dengan rentang & minimal posisi', () => {
  const L = D.koleksi.lab;
  ['potong', 'siku'].forEach((m) => {
    const c = L[m];
    assert.ok(c.min > 0 && c.max > c.min && c.langkah > 0, m + ': rentang');
    assert.equal(c.awal % c.langkah, 0, m + ': awal kelipatan langkah');
    assert.ok(c.awal >= c.min && c.awal <= c.max, m + ': awal dalam rentang');
    assert.ok((c.max - c.min) / c.langkah + 1 >= c.minPosisi, m + ': posisi cukup');
  });
  assert.ok(L.potong.max < 180 && L.siku.max < 90);
  assert.ok(L.potong.minPosisi >= 3, 'minimal tiga posisi dua garis berpotongan');
  assert.ok(D.koleksi.tips.length >= 2);
  const st = E.ensureLabSudut({}, L);
  assert.equal(E.labSudutLengkap(st, L), false);
});

test('olah data: temuan, pemilahan & langkah konsisten dengan engine', () => {
  const lab = D.koleksi.lab;
  OLAH.forEach((id) => {
    const S = D[id];
    assertHead(S, id);
    assert.ok(['potong', 'siku'].includes(S.data), id + ': data tabel');
    assertGuided(S.temuan, id + '.temuan', 3);
    assert.ok(S.ringkasan && S.judul && S.pengantar, id + ': teks');
    S.sorot.forEach((k) => assert.ok(k < E.banyakSudutLab(S.data), id + ': sorot'));

    const P = S.pilah;
    assertOptions(P.kategori, id + '.pilah.kategori', 2);
    assert.ok(P.butir.length >= 5, id + ': butir pemilahan cukup');
    assert.equal(new Set(ids(P.butir)).size, P.butir.length, id + ': id butir unik');
    const dipakai = new Set();
    P.butir.forEach((b) => {
      assert.ok(b.explanation, b.id + ': penjelasan');
      const jenis = b.pasangan
        ? E.jenisPasanganSudut('potong', b.pasangan[0], b.pasangan[1])
        : E.jenisPasanganNilai(b.sudut[0], b.sudut[1]);
      assert.ok(jenis, b.id + ': jenis');
      dipakai.add(jenis);
    });
    assert.ok(dipakai.size >= 2, id + ': butir beragam');

    assert.ok(S.langkah.length >= 3, id + ': langkah cukup');
    assert.equal(new Set(ids(S.langkah)).size, S.langkah.length, id + ': id langkah unik');
    S.langkah.forEach((s) => {
      const n = id + '.' + s.id;
      assert.ok(s.label && s.temuan && s.placeholder, n + ': teks');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
      if (s.lab) {
        assert.ok(s.lab.baris < lab[s.lab.mode].minPosisi, n + ': baris pasti tercatat');
        s.lab.pasangan.forEach((k) => assert.ok(k < E.banyakSudutLab(s.lab.mode)));
        assert.ok(/\{va\}/.test(s.label), n + ': label memakai data murid');
        if (s.cek.minta === 'jumlah') assert.equal(s.lab.pasangan.length, 2, n);
        assert.equal(s.cek.sudut, undefined, n + ': sudut diisi app dari tabel');
      } else {
        const benar = E.jawabSoalSudut(s).replace('°', '');
        assert.equal(E.periksaSoalSudut(benar, s).benar, true, n + ': kunci diterima');
        assert.ok(s.temuan.includes(benar), n + ': temuan memuat ' + benar);
      }
    });
  });
  /* Pemilahan sesuai nama kategori. */
  D.olahPelurus.pilah.butir.forEach((b) => {
    const j = E.jenisPasanganSudut('potong', b.pasangan[0], b.pasangan[1]);
    assert.ok(/berpelurus|berhadapan/.test(b.explanation), b.id);
    assert.equal(j === 'berpelurus', /berpelurus\.$/.test(b.explanation), b.id + ': penjelasan');
  });
  const katTolak = ids(D.olahTolak.pilah.kategori);
  D.olahTolak.pilah.butir.forEach((b) =>
    assert.ok(katTolak.includes(E.jenisPasanganSudut('potong', b.pasangan[0], b.pasangan[1])))
  );
  const katSiku = ids(D.olahPenyiku.pilah.kategori);
  D.olahPenyiku.pilah.butir.forEach((b) =>
    assert.ok(katSiku.includes(E.jenisPasanganNilai(b.sudut[0], b.sudut[1])), b.id)
  );
  /* Ketiga hubungan ditemukan berurutan. */
  assert.match(D.olahPelurus.ringkasan, /180°/);
  assert.match(D.olahTolak.ringkasan, /sama/);
  assert.match(D.olahPenyiku.ringkasan, /90°/);
});

test('verifikasi: posisi baru acak, pernyataan lengkap', () => {
  const V = D.verifikasi;
  const P = V.prediksi;
  for (let i = 0; i < 50; i++) {
    const t = E.pilihSudutAcak(P.min, P.max, P.langkah, P.kecuali);
    assert.ok(t >= P.min && t <= P.max && t !== 90);
  }
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
  assert.ok(V.judulA && V.judulB && V.judulC && V.buktiTeks);
});

test('generalisasi: kesimpulan, potongan benar unik & ada pengecoh', () => {
  const G = D.generalisasi;
  assert.ok(G.kalimat.length >= 4);
  assertOptions(G.bank, 'bank', G.kalimat.length + 2);
  const benar = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar berbeda');
  benar.forEach((b) => assert.ok(ids(G.bank).includes(b)));
  const teks = G.rangkuman.join(' ');
  ['180°', '90°', 'Bertolak belakang', 'Berpenyiku', 'Berpelurus'].forEach((k) =>
    assert.ok(teks.includes(k), 'rangkuman memuat ' + k)
  );
  const s = E.sudutDuaGaris(G.contoh.t);
  assert.ok(teks.includes(s[0] + '°') && teks.includes(s[1] + '°'), 'contoh sesuai gambar');
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
    minta.add(s.cek.minta);
    const v = E.nilaiSoalSudut(s.cek);
    if (typeof v === 'number') {
      assert.equal(v, Math.round(v), n + ': jawaban bulat');
      assert.ok(s.explanation.includes(String(v)), n + ': penjelasan memuat ' + v);
    }
    if (s.cek.minta === 'cari') {
      assert.ok(s.cerita.includes(s.cek.diketahui.nilai + '°'), n + ': cerita memuat sudut');
      assert.ok(s.pertanyaan.includes('∠' + (s.cek.ditanya + 1)), n + ': ditanya');
    }
    const jawab = E.jawabSoalSudut(s);
    if (s.type === 'input') {
      assert.notEqual(s.cek.minta, 'jenis', n + ': isian berupa bilangan');
      assert.equal(E.periksaSoalSudut(jawab, s).benar, true, n + ': kunci diterima');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
    } else {
      const opsi = E.opsiSoalSudut(s);
      assert.ok(opsi.length >= 4, n + ': minimal 4 opsi');
      assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, n + ': label unik');
      assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length, n + ': id unik');
      opsi.forEach((o) => assert.ok(o.umpan, n + '.' + o.id + ': umpan'));
    }
  });
  ['cari', 'pelurus', 'penyiku', 'tolakBelakang', 'jenis', 'aljabar'].forEach((m) =>
    assert.ok(minta.has(m), 'ada soal ' + m)
  );
  const rel = new Set(T.soal.filter((s) => s.cek.relasi).map((s) => s.cek.relasi));
  assert.equal(rel.size, 3, 'soal aljabar untuk ketiga hubungan');
});

test('refleksi & selesai: pertanyaan, penilaian diri, contoh ketiga hubungan', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  R.pertanyaan.forEach((q) => assert.ok(q.teks && q.placeholder, q.id));
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.deepEqual(Array.from(S.contoh, (c) => c.jenis).sort(), [
    'berpelurus',
    'berpenyiku',
    'bertolakBelakang',
  ]);
  S.contoh.forEach((c) => {
    assert.ok(D.namaJenis[c.jenis], c.jenis);
    const v = E.besarSudutLab(c.gambar.mode, c.gambar.t);
    c.gambar.label.forEach((l, k) => {
      if (l) assert.equal(l, v[k] + '°', c.jenis + ': label sesuai besar sudut');
    });
    assert.equal(
      E.jenisPasanganSudut(c.gambar.mode, c.gambar.sorot[0], c.gambar.sorot[1]),
      c.jenis
    );
  });
  assert.ok(S.capaian.length >= 4);
});

test('app.js: pilihan selalu dirender dengan urutan acak tersimpan', () => {
  assert.match(APP, /shuffleArray\(/);
  assert.match(APP, /ensureShuffledOrder\(/);
  assert.match(APP, /ensureSortStates\(/);
  assert.match(APP, /opsiSoalSudut\(/);
  assert.match(APP, /pilihSudutAcak\(/);
  assert.match(APP, /STORAGE_KEY = 'mpi-d-8-1-/);
  /* Setiap buildChoiceGroup memakai urutan dari State, bukan urutan DATA. */
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*[^,)]+/g) || [];
  assert.ok(panggilan.length >= 2);
  panggilan.forEach((p) => assert.match(p, /State\.|orders\[|Order/, p));
});
