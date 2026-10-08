'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-2.4/data.js (Perkalian & pembagian
 * pecahan dalam masalah kontekstual, Cooperative Learning tipe Jigsaw):
 * kunci jawaban setiap dugaan/penuntun/soal cocok dengan engine seksi 63
 * (kaliBagiPecahan, opsiKaliBagiPecahan, jenisOperasiKaliBagi,
 * hitungPitaKelompok), kartu ahli sesuai jenis operasi, setiap soal
 * stasiun milik strategi stasiunnya, kalimat matematika yang benar sama
 * dengan fmtOperasiKaliBagi, pernyataan diskusi sesuai hasil engine,
 * setiap daftar pilihan punya id & label unik dan cukup opsi untuk
 * diacak, serta jumlah tahap sama dengan manifest halaman. app.js juga
 * dicek agar pilihan selalu dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-2.4/data.js']);
const D = E.DATA;
const S = E.STRATEGI_KALI_BAGI;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-2.4', 'app.js'), 'utf8');

/* id dalam array realm Node (DATA dimuat di konteks vm lain). */
function ids(list) {
  return Array.from(list, (o) => o.id);
}

function nilai(x) {
  const v = E.sederhanakanRasional(E.rasionalDari(x));
  return v.num / v.den;
}

function hasil(s) {
  return E.kaliBagiPecahan(s.a, s.op, s.b);
}

/* Teks bertoken "−{1 1/4} × {2 2/5}" → teks biasa "−1 1/4 × 2 2/5". */
function polos(str) {
  return String(str).replace(/[{}]/g, '');
}

function assertOptions(list, name, min) {
  const m = min || 3;
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= m, name + ' minimal ' + m + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  const labels = list.map((o) => o.label || o.teks);
  labels.forEach((l, i) => assert.ok(l, name + '.' + list[i].id + ': label'));
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus berbeda');
}

function assertHead(T, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(T[k], name + ': ' + k));
}

/* Soal operasi { a, op, b }: valid, hasil engine, opsi berpengecoh cukup. */
function assertOperasi(s, name) {
  assert.ok(['×', ':'].includes(s.op), name + ': op × atau :');
  const h = hasil(s);
  assert.ok(Number.isFinite(h.num / h.den), name + ': hasil');
  const opsi = E.opsiKaliBagiPecahan(s.a, s.op, s.b);
  assert.equal(opsi.length, 4, name + ': empat opsi engine');
  assert.equal(new Set(opsi.map((o) => o.label)).size, 4, name + ': label opsi engine unik');
  assert.equal(
    E.diagnosaKaliBagiPecahan(E.teksRasional(h), s.a, s.op, s.b).kode,
    'benar',
    name + ': jawaban kunci lolos diagnosa'
  );
}

function assertGuided(list, name) {
  assert.ok(list.length >= 2, name + ': cukup pertanyaan');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya, q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

test('sebelas tahap Jigsaw: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-2.4'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 11);
  assert.equal(new Set(ids(D.tahap)).size, 11);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  D.tahap
    .filter((t) => t.id !== 'selesai')
    .forEach((t) => assert.match(D[t.id].syntax, /Jigsaw/, t.id + ': sintaks Jigsaw'));
});

test('tujuan: TP, kriteria, dugaan acak & kunci dugaan sesuai engine', () => {
  const T = D.tujuan;
  assert.match(T.tp, /perkalian dan pembagian/);
  assert.ok(T.kriteria.length >= 3);
  T.dugaan.forEach((q) => assertOptions(q.opsi, 'dugaan.' + q.id));
  const kali = nilai('1/2') * nilai('3/4');
  assert.equal(T.kunciDugaan.kali, kali < nilai('3/4') ? 'kecil' : 'besar');
  const bagi = E.kaliBagiPecahan('6', ':', '1/2');
  assert.equal(T.kunciDugaan.bagi, bagi.num / bagi.den > 6 ? 'besar' : 'kecil');
  T.dugaan.forEach((q) => assert.ok(ids(q.opsi).includes(T.kunciDugaan[q.id]), q.id));
});

test('informasi: visual valid & kunci penuntun sesuai engine', () => {
  const I = D.informasi;
  assert.ok(E.buildLuasPecahan(I.kali.a, I.kali.b).includes('luas-pk'));
  const pita = E.hitungPitaKelompok(I.bagi.total, I.bagi.ukuran);
  assertGuided(I.penuntun, 'penuntun');
  const byId = Object.fromEntries(I.penuntun.map((q) => [q.id, q]));
  const kali = E.kaliBagiPecahan(I.kali.a, '×', I.kali.b);
  const p1 = byId.p1.opsi.find((o) => o.id === byId.p1.correct);
  assert.ok(polos(p1.label).startsWith(E.teksRasional(kali)), 'p1 = hasil model luas');
  assert.equal(byId.p3.correct, String(pita.utuh), 'p3 = banyak kelompok pita');
  assert.equal(pita.sisa.num, 0);
  assert.ok(I.aturan.length >= 4);
});

test('kartu ahli: empat strategi = jenis operasi engine, stasiun berurutan sama', () => {
  assert.equal(S.length, 4);
  assert.deepEqual(ids(S), ['kaliBulat', 'kaliPecahan', 'bagi', 'campuranTanda']);
  S.forEach((s) => {
    ['ikon', 'nama', 'ringkas', 'tugas', 'kunci'].forEach((k) => assert.ok(s[k], s.id + '.' + k));
  });
  assert.deepEqual(ids(D.ahli.stasiun), ids(S));
});

test('stasiun ahli: contoh, penjelajah, dan soal milik strategi stasiunnya', () => {
  const semuaId = [];
  D.ahli.stasiun.forEach((st) => {
    assertOperasi(st.contoh, st.id + '.contoh');
    assert.ok(
      E.jenisOperasiKaliBagi(st.contoh.a, st.contoh.op, st.contoh.b).includes(st.id),
      st.id + ': contoh memakai strategi stasiun'
    );
    const X = st.eksplor;
    if (X.jenis === 'kaliBulat') {
      assert.ok(X.min <= X.awal && X.awal <= X.maks, st.id + ': awal penjelajah');
      assert.equal(String(X.awal), st.contoh.a, 'penjelajah mulai dari contoh');
      assert.equal(X.pecahan, st.contoh.b);
      for (let n = X.min; n <= X.maks; n++) {
        const total = E.kaliBagiPecahan(String(n), '×', X.pecahan);
        E.buildPitaKelompok(E.teksRasional(total, 'biasa'), X.pecahan);
      }
    } else if (X.jenis === 'bagi') {
      assert.ok(X.ukuran.includes(X.awal), st.id + ': ukuran awal ada');
      assert.equal(X.total, st.contoh.a);
      assert.equal(X.awal, st.contoh.b);
      assert.equal(new Set(X.ukuran).size, X.ukuran.length);
      X.ukuran.forEach((u) => E.buildPitaKelompok(X.total, u));
    } else if (X.jenis === 'luas') {
      E.buildLuasPecahan(st.contoh.a, st.contoh.b);
    } else {
      assert.equal(X.jenis, 'langkah');
      assert.ok(
        E.langkahKaliBagiPecahan(st.contoh.a, st.contoh.op, st.contoh.b).langkah.length >= 3
      );
    }
    assert.ok(st.soal.length >= 2, st.id + ': dua soal');
    st.soal.forEach((s) => {
      assertOperasi(s, s.id);
      assert.ok(s.cerita && s.satuan, s.id + ': cerita & satuan');
      assert.ok(
        E.jenisOperasiKaliBagi(s.a, s.op, s.b).includes(st.id),
        s.id + ': soal cocok untuk ' + st.id
      );
      semuaId.push(s.id);
    });
  });
  assert.equal(new Set(semuaId).size, semuaId.length, 'id soal ahli unik');
});

test('misi 1: kalimat matematika benar = engine, opsi lengkap, makna berpenanda hasil', () => {
  const M = D.misiAjar;
  assert.ok(M.soal.length >= 4);
  M.soal.forEach((s) => {
    assertOperasi(s, s.id);
    assertOptions(s.kalimat, s.id + '.kalimat', 4);
    assert.equal(s.kalimat.filter((k) => k.id === 'benar').length, 1, s.id + ': satu benar');
    assert.equal(
      polos(s.kalimat.find((k) => k.id === 'benar').label),
      E.fmtOperasiKaliBagi(s.a, s.op, s.b),
      s.id + ': kalimat benar = engine'
    );
    s.kalimat.forEach((k) => assert.ok(k.umpan, s.id + '.' + k.id + ': umpan'));
    assert.match(s.makna, /%HASIL%/, s.id + ': makna');
    assert.ok(s.satuan && s.ikon, s.id + ': satuan & ikon');
  });
  const jenis = new Set(M.soal.flatMap((s) => E.jenisOperasiKaliBagi(s.a, s.op, s.b)));
  ids(S).forEach((id) => assert.ok(jenis.has(id), 'misi 1 memakai strategi ' + id));
});

test('misi 2: soal isian valid, petunjuk ada, mencakup campuran & negatif', () => {
  const H = D.misiHitung;
  assert.ok(H.soal.length >= 3);
  assert.equal(new Set(ids(H.soal)).size, H.soal.length);
  H.soal.forEach((s) => {
    assertOperasi(s, s.id);
    assert.ok(s.hints.length >= 1, s.id + ': hints');
    assert.ok(s.cerita && s.satuan && s.ikon, s.id + ': cerita, satuan, ikon');
  });
  assert.ok(
    H.soal.some((s) => hasil(s).num < 0),
    'ada hasil negatif'
  );
  assert.ok(
    H.soal.some((s) => s.op === ':'),
    'ada pembagian'
  );
  assert.ok(
    H.soal.some((s) => s.op === '×'),
    'ada perkalian'
  );
});

test('misi 3: pernyataan Benar/Salah sesuai hasil engine', () => {
  const M = D.misiDiskusi;
  assertOptions(M.opsi, 'opsi diskusi', 2);
  assert.ok(M.pernyataan.length >= 5);
  M.pernyataan.forEach((p) => {
    assert.ok(ids(M.opsi).includes(p.correct), p.id + ': correct');
    assert.ok(p.teks && p.explanation, p.id + ': teks & pembahasan');
    const c = p.cek;
    const h = E.kaliBagiPecahan(c.a, c.op, c.b);
    let benar;
    if (c.hasil) benar = E.samaRasional(h, E.rasionalDari(c.hasil));
    else if (c.setara) benar = E.samaRasional(h, E.kaliBagiPecahan(c.a, c.setara.op, c.setara.b));
    else {
      const lebih = h.num / h.den > nilai(c.banding);
      benar = c.klaim === 'besar' ? lebih : !lebih;
    }
    assert.equal(p.correct, benar ? 'benar' : 'salah', p.id + ': kunci = engine');
  });
  assert.ok(M.pernyataan.some((p) => p.correct === 'benar'));
  assert.ok(M.pernyataan.some((p) => p.correct === 'salah'));
});

test('kuis: bank cukup untuk komposisi, soal valid & beragam', () => {
  const K = D.kuis;
  const total = Object.values(K.komposisi).reduce((x, y) => x + y, 0);
  assert.equal(total, K.banyak);
  Object.keys(K.komposisi).forEach((type) => {
    assert.ok(
      K.soal.filter((s) => s.type === type).length > K.komposisi[type],
      type + ': bank lebih banyak dari yang diambil agar teracak'
    );
  });
  assert.equal(new Set(ids(K.soal)).size, K.soal.length);
  K.soal.forEach((s) => {
    assertOperasi(s, s.id);
    assert.ok(['choice', 'input'].includes(s.type), s.id + ': type');
    assert.ok(s.cerita && s.pertanyaan && s.satuan, s.id + ': teks');
    if (s.type === 'input') assert.ok(s.hints.length >= 1, s.id + ': hints');
  });
  assert.ok(
    K.soal.some((s) => hasil(s).num < 0),
    'ada hasil negatif'
  );
  assert.ok(
    K.soal.some((s) => /\d \d/.test(s.a + ' ' + s.b) || /\d \d/.test(s.a)),
    'campuran'
  );
});

test('penghargaan, refleksi & selesai', () => {
  assert.ok(D.penghargaan.bobot);
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi');
  assert.ok(D.selesai.capaian.length >= 3);
  assertOptions(
    D.tim.kesepakatan.map((k) => ({ id: k.id, label: k.teks })),
    'kesepakatan',
    2
  );
  assert.ok(D.tim.minAnggota <= D.tim.maksAnggota && D.tim.maksAnggota <= S.length);
});

test('app.js: pilihan diacak sekali & dirender menurut urutan tersimpan', () => {
  assert.match(APP, /ensureShuffledOrder\(/, 'memakai ensureShuffledOrder');
  assert.match(APP, /optionOrder: [^\n]*shuffleArray\(/, 'opsi kuis diacak');
  assert.match(APP, /assignCoopRoles\(/, 'kartu ahli dibagikan acak');
  assert.match(APP, /ensureSortStates\(/, 'pernyataan diskusi diacak');
  assert.match(APP, /shuffleArray\(kelompok\)/, 'soal kuis diambil acak dari bank');
  /* setiap buildChoiceGroup diberi urutan tersimpan (argumen kedua bukan null) */
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*[^,)]+/g) || [];
  assert.ok(panggilan.length >= 4, 'buildChoiceGroup dipakai');
  panggilan.forEach((p) => assert.match(p, /Order|order|orders\[/, 'urutan tersimpan: ' + p));
  assert.doesNotMatch(APP, /Math\.random/, 'pengacakan lewat engine, bukan Math.random langsung');
});
