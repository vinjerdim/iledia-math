'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-6.1/data.js (Kalimat terbuka,
 * persamaan & PLSV, Discovery Learning): setiap kunci sama dengan engine
 * seksi 75 (jenisKalimatMtk, kelompokKalimatMtk, kebenaranKalimatMtk,
 * penyelesaianPlsv, periksaSoalKalimat, jawabSoalKalimat,
 * opsiSoalKalimat), opsi pilihan cukup & unik agar dapat diacak, tahap
 * mengikuti sintaks Discovery Learning dan sama dengan manifest halaman.
 * app.js juga dicek agar pilihan selalu dirender dengan urutan acak
 * tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-6.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-6.1', 'app.js'), 'utf8');
const OLAH = ['olahKalimat', 'olahPersamaan', 'olahPlsv'];
const JENIS = ['pernyataan', 'kalimatTerbuka', 'persamaan', 'plsv', 'bentuk'];

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
  assert.ok(E.parseKalimatMtk(c.kalimat), name + ': kalimat terbaca');
  const v = E.nilaiSoalKalimat(c);
  assert.ok(v !== null && v !== undefined, name + ': nilai baku ada');
  if (c.minta === 'penyelesaian') {
    assert.equal(Math.floor(v), v, name + ': penyelesaian bulat');
  }
  if (c.minta === 'kalimat') {
    assert.equal(E.jenisKalimatMtk(c.kalimat), 'plsv', name + ': model berupa PLSV');
  }
}

/* Langkah { cek }: jawaban baku diterima pemeriksa & disebut di temuan. */
function assertLangkah(list, name) {
  assert.ok(list.length >= 2, name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.ok(s.label && s.temuan && s.placeholder, n + ': label, temuan, placeholder');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, n + ': petunjuk');
    assert.ok(['penyelesaian', 'kalimat'].includes(s.cek.minta), n + ': langkah isian');
    assertCek(s.cek, n);
    const jawab = E.jawabSoalKalimat(s);
    assert.equal(E.periksaSoalKalimat(jawab, s).benar, true, n + ': jawaban baku diterima');
    assert.ok(s.temuan.includes(jawab), n + ': temuan memuat ' + jawab);
  });
}

test('sebelas tahap Discovery Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-6.1'];
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
    olahKalimat: 4,
    olahPersamaan: 4,
    olahPlsv: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Discovery Learning · Sintaks ' + n, id);
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-6.1', 'index.html'), 'utf8');
  assert.match(html, /<title>\s*Kalimat Terbuka, Persamaan/);
  assert.match(html, /0 dari 11 tahap selesai/);
});

test('stimulasi: TP, kartu neraca & kalimat, dugaan sesuai engine', () => {
  const S = D.stimulasi;
  assert.match(S.tp, /kalimat terbuka, persamaan, dan persamaan linear satu variabel/);
  assert.ok(S.tpJudul && S.kriteria.length >= 4);
  assert.equal(S.kartu.length, 2);
  const neraca = S.kartu.find((k) => k.neraca);
  assert.ok(neraca, 'kartu neraca');
  /* neraca kartu = neraca pertama Lab Neraca */
  assert.deepEqual(JSON.parse(JSON.stringify(neraca.neraca)), {
    kiri: JSON.parse(JSON.stringify(D.koleksi.lab.situasi[0].kiri)),
    kanan: JSON.parse(JSON.stringify(D.koleksi.lab.situasi[0].kanan)),
  });
  const kal = S.kartu.find((k) => k.kalimat);
  assert.ok(kal && kal.kalimat.length >= 3, 'kartu daftar kalimat');
  assert.ok(S.dugaan.length >= 3);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    if (q.cek) {
      const v = E.nilaiSoalKalimat(q.cek);
      if (q.cek.minta === 'penyelesaian') {
        const label = q.opsi.find((o) => o.id === q.baku).label;
        assert.equal(label, E.jawabSoalKalimat(q), q.id + ': label baku = engine');
      } else {
        assert.equal(q.baku, v, q.id + ': baku = engine');
      }
    }
  });
});

test('masalah: pertanyaan inti dengan umpan untuk setiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], o.id + ': umpan'));
  assert.ok(M.hipotesisLabel && M.hipotesisPlaceholder);
});

test('koleksi: Lab Neraca bervariasi & penyelesaian dalam batas stepper', () => {
  const L = D.koleksi.lab;
  assert.equal(L.huruf, 'x');
  assert.ok(L.situasi.length >= 4);
  assert.equal(new Set(ids(L.situasi)).size, L.situasi.length);
  L.situasi.forEach((s) => {
    assert.ok(s.judul && s.cerita, s.id + ': teks');
    const kal = E.kalimatDariNeraca(s.kiri, s.kanan, L.huruf);
    assert.equal(E.jenisKalimatMtk(kal), 'plsv', s.id + ': ' + kal);
    const sol = E.penyelesaianPlsv(kal);
    assert.ok(Number.isInteger(sol) && sol > 0 && sol <= L.batas, s.id + ': solusi ' + sol);
    /* cerita menyebut banyak kotak & beban */
    [s.kiri, s.kanan].forEach((m) =>
      Object.values(m).forEach((v) =>
        assert.ok(s.cerita.includes(String(v)), s.id + ': cerita memuat ' + v)
      )
    );
    const benda = (m) => (m.x || 0) + (m.lepas || 0);
    assert.ok(benda(s.kiri) <= 15 && benda(s.kanan) <= 15, s.id + ': muat di piring');
  });
  /* variasi: koefisien 1, koefisien > 1, variabel di kedua ruas */
  assert.ok(L.situasi.some((s) => s.kiri.x === 1 && !s.kanan.x));
  assert.ok(L.situasi.some((s) => s.kiri.x > 1 && !s.kanan.x));
  assert.ok(L.situasi.some((s) => s.kiri.x && s.kanan.x));
  assert.ok(D.koleksi.tips.length >= 2);
  assert.ok(D.koleksi.selesaiTeks && D.koleksi.nextLabel);
});

test('olah data: temuan, pemilahan & langkah konsisten dengan engine', () => {
  const skema = { olahKalimat: 'kebenaran', olahPersamaan: 'persamaan', olahPlsv: 'plsv' };
  OLAH.forEach((id) => {
    const O = D[id];
    assert.ok(O.judul && O.pengantar && O.ringkasan && O.nextLabel, id + ': teks');
    assertGuided(O.temuan, id + '.temuan', 3);
    assertLangkah(O.langkah, id + '.langkah');
    const P = O.pilah;
    assert.equal(P.skema, skema[id], id + ': skema');
    assertOptions(P.kategori, id + '.kategori', 3);
    assert.ok(P.butir.length >= 5, id + ': cukup butir pilah');
    assert.equal(new Set(ids(P.butir)).size, P.butir.length);
    P.butir.forEach((b) => {
      assert.ok(b.explanation, b.id + ': penjelasan');
      assert.equal(E.kelompokKalimatMtk(b.kalimat, P.skema), b.correct, b.id + ': kunci = engine');
    });
    ids(P.kategori).forEach((k) =>
      assert.ok(
        P.butir.some((b) => b.correct === k),
        id + ': ada contoh ' + k
      )
    );
  });
  const semua = OLAH.flatMap((id) => ids(D[id].pilah.butir));
  assert.equal(new Set(semua).size, semua.length, 'id butir pilah unik antar tahap');
  /* temuan olahKalimat: pernyataan salah tetap pernyataan */
  assert.ok(D.olahKalimat.pilah.butir.some((b) => b.correct === 'salah'));
  assert.ok(D.olahPersamaan.kartu.length >= 3);
  D.olahPersamaan.kartu.forEach((k) => assert.ok(E.parseKalimatMtk(k.kalimat), k.kalimat));
});

test('verifikasi: jenis kalimat sesuai engine, contoh baru, & pernyataan lengkap', () => {
  const V = D.verifikasi;
  assert.deepEqual(ids(V.kategori), JENIS);
  assert.ok(V.bagian.length >= 8);
  assert.equal(new Set(ids(V.bagian)).size, V.bagian.length);
  V.bagian.forEach((b) => {
    assert.ok(b.explanation, b.id + ': penjelasan');
    assert.equal(E.jenisKalimatMtk(b.kalimat), b.correct, b.id + ': kunci = engine');
  });
  JENIS.forEach((k) =>
    assert.ok(
      V.bagian.some((b) => b.correct === k),
      'ada contoh ' + k
    )
  );
  /* kalimat verifikasi BARU (belum dipakai di tahap olah data) */
  const lama = OLAH.flatMap((id) => D[id].pilah.butir.map((b) => E.rapikanKalimatMtk(b.kalimat)));
  V.bagian.forEach((b) => assert.ok(!lama.includes(E.rapikanKalimatMtk(b.kalimat)), b.id));
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 3);
  assert.ok(V.pernyataan.length >= 5);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id + ': correct ada di opsi');
    assert.ok(p.teks && p.explanation, p.id);
  });
  assert.ok(V.judulA && V.judulB && V.judulC && V.pengantarA);
});

test('generalisasi: lima definisi, potongan benar unik & ada pengecoh', () => {
  const G = D.generalisasi;
  assert.equal(G.kalimat.length, 5);
  assertOptions(G.bank, 'bank', 7);
  const benar = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar tidak dipakai ulang');
  benar.forEach((b) => assert.ok(ids(G.bank).includes(b), b + ': ada di bank'));
  assert.ok(G.bank.length - G.kalimat.length >= 2, 'minimal dua pengecoh');
  /* rangkuman sesuai contoh */
  assert.equal(E.jenisKalimatMtk(G.contoh), 'plsv');
  const sol = E.penyelesaianPlsv(G.contoh);
  const teks = G.rangkuman.join(' ');
  assert.ok(teks.includes('= ' + sol), 'rangkuman memuat penyelesaian ' + sol);
  assert.ok(teks.includes('PLSV'));
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
    if (s.cek.minta !== 'kalimat') assertCek(s.cek, n);
    else assert.equal(E.jenisKalimatMtk(s.cek.kalimat), 'plsv', n);
    minta.add(s.cek.minta);
    const jawab = E.jawabSoalKalimat(s);
    if (s.type === 'input') {
      assert.ok(['penyelesaian', 'kalimat'].includes(s.cek.minta), n + ': isian bukan nama jenis');
      assert.equal(E.periksaSoalKalimat(jawab, s).benar, true, n + ': kunci diterima');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
      assert.ok(s.reveal && s.reveal.includes(jawab), n + ': reveal memuat jawaban');
      assert.ok(s.explanation.includes(jawab), n + ': penjelasan memuat ' + jawab);
    } else {
      const opsi = E.opsiSoalKalimat(s);
      assert.ok(opsi.length >= 3, n + ': minimal 3 opsi');
      assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, n + ': label unik');
      if (!['jenis', 'kebenaran'].includes(s.cek.minta)) {
        assert.ok(s.explanation.includes(jawab), n + ': penjelasan memuat ' + jawab);
      }
    }
    if (s.neraca) {
      assert.equal(
        E.rapikanKalimatMtk(E.kalimatDariNeraca(s.neraca.kiri, s.neraca.kanan)),
        E.rapikanKalimatMtk(s.cek.kalimat),
        n + ': neraca = kalimat'
      );
    }
  });
  ['penyelesaian', 'kalimat', 'jenis', 'kebenaran'].forEach((m) =>
    assert.ok(minta.has(m), 'ada soal ' + m)
  );
  ['neraca', 'warung', 'sekolah', 'simbol'].forEach((k) =>
    assert.ok(
      T.soal.some((s) => s.konteks === k),
      'ada konteks ' + k
    )
  );
  /* jenis pada pilihan ganda mencakup semua kategori kecuali bentuk */
  const jenis = new Set(
    T.soal.filter((s) => s.cek.minta === 'jenis').map((s) => E.jenisKalimatMtk(s.cek.kalimat))
  );
  ['pernyataan', 'kalimatTerbuka', 'persamaan', 'plsv'].forEach((j) =>
    assert.ok(jenis.has(j), 'ada soal jenis ' + j)
  );
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.ok(S.judul && S.teks && S.capaian.length >= 4);
  assert.ok(S.contoh.length >= 3);
  S.contoh.forEach((c) => assert.ok(E.jenisKalimatMtk(c.kalimat), c.kalimat));
});

test('app.js: semua pilihan diacak sekali & disimpan di state', () => {
  ['ensureShuffledOrder', 'ensureSortStates', 'shuffleArray', 'opsiSoalKalimat'].forEach((f) =>
    assert.match(APP, new RegExp('\\b' + f + '\\('), f + ' dipakai')
  );
  [
    'dugaanOrders',
    'masalahOrder',
    'temuanOrders',
    'pilahOlah',
    'bagianOrder',
    'pernyataanOrder',
    'bankOrder',
    'refleksiDiriOrder',
    'optionOrder',
  ].forEach((k) => assert.match(APP, new RegExp('\\b' + k + '\\b'), k + ' tersimpan'));
  assert.match(APP, /STORAGE_KEY = 'mpi-d-6-1-/);
  /* langkah isian memakai pemeriksa seksi 75 */
  assert.match(APP, /periksaSoalKalimat/);
});
