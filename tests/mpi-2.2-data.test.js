'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-2.2/data.js (Perkalian & pembagian
 * bilangan bulat dalam masalah kontekstual, Think-Pair-Share): kunci
 * jawaban setiap isian/tabel/soal harus cocok dengan engine seksi 18
 * (hasilOperasiBulat, tandaBilangan, fmtOperasiBulat), langkah operasi
 * campuran harus bernilai sama di setiap baris, setiap daftar pilihan
 * punya id & label unik dan cukup opsi untuk diacak, pertanyaan TPS
 * lengkap (umpan tiap opsi + pemantik diskusi), serta jumlah tahap sama
 * dengan manifest halaman. app.js juga dicek agar pilihan selalu
 * dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-2.2/data.js']);
const D = E.DATA;
const KONTEKS = ['suhu', 'kedalaman', 'uang', 'skor'];

function ids(list) {
  return list.map((o) => o.id);
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

/* Pertanyaan Think-Pair-Share { id, tanya, opsi, correct, umpan, diskusi }. */
function assertTps(list, name) {
  assert.ok(Array.isArray(list) && list.length >= 1, name + ': minimal satu pertanyaan');
  list.forEach((q) => {
    const n = name + '.' + q.id;
    assert.ok(q.tanya, n + ': tanya');
    assert.ok(q.diskusi, n + ': pemantik diskusi');
    assertOptions(q.opsi, n, 4);
    assert.ok(ids(q.opsi).includes(q.correct), n + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], n + ': umpan untuk ' + o.id));
  });
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Isian hasil operasi { id, a, op, b, jawab, label, hints }. */
function assertHitung(list, name, op) {
  assert.ok(list.length >= 3, name + ': minimal tiga isian');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.equal(s.op, op, n + ': operasi');
    assert.equal(E.hasilOperasiBulat(s.a, s.op, s.b), s.jawab, n + ': kunci');
    assert.ok(Number.isInteger(s.jawab), n + ': hasil bulat');
    assert.ok(s.label.includes(E.fmtOperasiBulat(s.a, s.op, s.b)), n + ': label memuat kalimat');
    assert.ok(s.hints.length >= 1, n + ': hints');
  });
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
}

/* Sel tabel aturan tanda { id, label, a, b, correct } untuk operasi op. */
function assertSel(list, name, op) {
  assert.equal(list.length, 4, name + ': empat pola tanda');
  const pola = Array.from(list, (c) => (c.a < 0 ? '−' : '+') + (c.b < 0 ? '−' : '+'));
  assert.deepEqual(pola.slice().sort(), ['++', '+−', '−+', '−−'].sort(), name + ': semua pola');
  list.forEach((c) => {
    assert.equal(
      c.correct,
      E.tandaBilangan(E.hasilOperasiBulat(c.a, op, c.b)),
      name + '.' + c.id + ': tanda'
    );
    assert.ok(c.label.includes(op === '×' ? '×' : ':'), name + '.' + c.id + ': label');
  });
}

/*
 * Evaluator kecil untuk ekspresi bernotasi baku (−, ×, :, kurung).
 * Penanda [[ ]] dan titik ribuan dibuang lebih dulu.
 */
function nilaiEkspresi(str) {
  const src = str.replace(/\[\[|\]\]/g, '').replace(/(\d)\.(\d{3})/g, '$1$2');
  const tok = src.match(/\d+|[−+×:()-]/g);
  let i = 0;
  function primary() {
    const t = tok[i++];
    if (t === '(') {
      const v = sum();
      assert.equal(tok[i++], ')', 'kurung tutup: ' + str);
      return v;
    }
    if (t === '−' || t === '-') return -primary();
    assert.match(t, /^\d+$/, 'angka: ' + str);
    return parseInt(t, 10);
  }
  function product() {
    let v = primary();
    while (tok[i] === '×' || tok[i] === ':') {
      const op = tok[i++];
      const r = primary();
      v = op === '×' ? v * r : v / r;
    }
    return v;
  }
  function sum() {
    let v = product();
    while (tok[i] === '+' || tok[i] === '−' || tok[i] === '-') {
      const op = tok[i++];
      const r = product();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  const v = sum();
  assert.equal(i, tok.length, 'ekspresi habis dibaca: ' + str);
  return v;
}

test('evaluator ekspresi uji (sanity)', () => {
  assert.equal(nilaiEkspresi('[[7 × 4]] + 5 × (−2)'), 18);
  assert.equal(nilaiEkspresi('([[−7 + 2]] + (−4)) : 3'), -3);
  assert.equal(nilaiEkspresi('−20 − 4 × (−5)'), 0);
  assert.equal(nilaiEkspresi('(−48.000) : 4'), -12000);
});

test('sepuluh tahap: setiap tahap punya konten & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-2.2'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  KONTEKS.forEach((k) => assert.ok(D.konteks[k].ikon && D.konteks[k].nama, 'konteks ' + k));
});

test('setiap tahap inti memetakan fase Think-Pair-Share yang sah', () => {
  const fase = Array.from(E.TPS_FASE, (f) => f.id);
  ['pikir', 'pasang', 'bagi', 'berbagi', 'masalah', 'campuran'].forEach((k) => {
    const tps = [].concat(D[k].tps);
    assert.ok(tps.length >= 1, k + ': fase TPS');
    tps.forEach((f) => assert.ok(fase.includes(f), k + ': fase ' + f));
    assert.match(D[k].syntax, /Think-Pair-Share/, k + ': syntax');
  });
  /* Ketiga fase muncul di sepanjang pembelajaran. */
  const semua = new Set(
    ['pikir', 'pasang', 'bagi', 'berbagi', 'masalah', 'campuran'].flatMap((k) =>
      [].concat(D[k].tps)
    )
  );
  assert.deepEqual([...semua].sort(), fase.slice().sort());
});

test('tujuan: apersepsi penjumlahan berulang & aturan main TPS', () => {
  const T = D.tujuan;
  assert.equal(T.apersepsi.jawab, 3 * -2);
  assert.ok(T.apersepsi.hints.length >= 1);
  assert.ok(T.aturan.length >= 3);
  assert.equal(D.tanda.length, 2);
  assertOptions(D.tanda, 'tanda', 2);
});

test('pikir: isian perkalian (+)×(±) cocok engine & garis bilangan memuat hasil', () => {
  const P = D.pikir;
  assertHitung(P.hitung, 'pikir.hitung', '×');
  P.hitung.forEach((s) => assert.ok(s.a > 0, s.id + ': pengali positif (bisa berulang)'));
  const g = P.garis;
  assert.equal(g.n * g.b, P.hitung[0].jawab, 'garis = isian pertama');
  assert.ok(g.min <= Math.min(0, g.n * g.b) && g.max >= Math.max(0, g.n * g.b), 'muat');
  assertSel(P.tandaSel, 'pikir.tandaSel', '×');
});

test('pasang: tabel pola menurun dengan pengali berkurang 1 & pertanyaan TPS', () => {
  const P = D.pasang;
  const rows = P.polaBaris;
  assert.ok(rows.filter((r) => r.tampil).length >= 2, 'minimal dua baris contoh');
  assert.ok(rows.filter((r) => !r.tampil).length >= 4, 'minimal empat isian');
  rows.forEach((r, i) => {
    assert.equal(r.jawab, r.a * r.b || 0, r.id + ': kunci');
    assert.equal(r.b, rows[0].b, r.id + ': bilangan kedua tetap');
    if (i > 0) assert.equal(r.a, rows[i - 1].a - 1, r.id + ': pengali turun 1');
  });
  assert.ok(
    rows.some((r) => r.a < 0 && r.b < 0 && !r.tampil),
    'memuat (−) × (−)'
  );
  assert.equal(new Set(ids(rows)).size, rows.length);
  assertTps(P.tpsSoal, 'pasang.tpsSoal');
});

test('bagi: isian pembagian habis dibagi, cocok engine & tabel tanda pembagian', () => {
  const B = D.bagi;
  assertHitung(B.hitung, 'bagi.hitung', ':');
  B.hitung.forEach((s) => {
    assert.equal(Math.abs(s.a % s.b), 0, s.id + ': habis dibagi');
    assert.equal(s.b * s.jawab, s.a, s.id + ': kebalikan perkalian');
  });
  const pola = new Set(B.hitung.map((s) => (s.a < 0 ? '−' : '+') + (s.b < 0 ? '−' : '+')));
  assert.equal(pola.size, 4, 'isian mencakup keempat pola tanda');
  assertSel(B.tandaSel, 'bagi.tandaSel', ':');
  assertTps(B.tpsSoal, 'bagi.tpsSoal');
});

test('berbagi: bank kesimpulan memuat jawaban & pengecoh, pemantik berbagi', () => {
  const S = D.berbagi;
  assertOptions(S.bank, 'berbagi.bank', S.kalimat.length + 3);
  S.kalimat.forEach((k) => assert.ok(ids(S.bank).includes(k.correct), k.id + ': correct'));
  assert.equal(new Set(S.kalimat.map((k) => k.correct)).size, S.kalimat.length);
  assert.ok(S.kalimat.length >= 4);
  assert.ok(S.rangkuman.length >= 4);
  assert.ok(S.pemantik.length >= 3);
});

test('masalah: model kalimat matematika TPS cocok dengan isian hitung', () => {
  const K = D.masalah;
  assert.ok(K.soal.length >= 4);
  const ops = new Set();
  K.soal.forEach((s) => {
    assert.ok(KONTEKS.includes(s.konteks), s.id + ': konteks');
    assert.ok(s.cerita && s.pertanyaan && s.temuan, s.id + ': teks');
    assert.ok(['×', ':'].includes(s.op), s.id + ': op');
    assert.equal(E.hasilOperasiBulat(s.a, s.op, s.b), s.jawab, s.id + ': kunci');
    assert.ok(Number.isInteger(s.jawab), s.id + ': hasil bulat');
    assertTps([s.model], 'masalah.' + s.id + '.model');
    const benar = s.model.opsi.find((o) => o.id === s.model.correct);
    assert.equal(benar.label, E.fmtOperasiBulat(s.a, s.op, s.b), s.id + ': model = isian');
    s.model.opsi
      .filter((o) => o.id !== s.model.correct)
      .forEach((o) =>
        assert.notEqual(nilaiEkspresi(o.label), s.jawab, s.id + '.' + o.id + ': pengecoh beda')
      );
    assert.ok(s.hints.length >= 1);
    ops.add(s.op);
  });
  assert.deepEqual([...ops].sort(), [':', '×']);
  assert.ok(
    K.soal.some((s) => s.a < 0 && s.b < 0),
    'ada masalah (−) × (−) atau (−) : (−)'
  );
  assert.equal(new Set(ids(K.soal)).size, K.soal.length);
  assert.equal(new Set(K.soal.map((s) => s.model.id)).size, K.soal.length);
});

test('campuran: setiap baris langkah bernilai sama & kunci = bagian bertanda', () => {
  const C = D.campuran;
  assert.ok(C.soal.length >= 3);
  C.soal.forEach((s) => {
    const nilai = nilaiEkspresi(s.ekspresi);
    assert.equal(s.nilai, nilai, s.id + ': nilai');
    let sebelum = s.ekspresi;
    s.langkah.forEach((l, i) => {
      const n = s.id + '.langkah' + (i + 1);
      const m = /\[\[(.+?)\]\]/.exec(sebelum);
      assert.ok(m, n + ': baris sebelumnya punya penanda [[…]]');
      assert.equal(nilaiEkspresi(m[1]), l.jawab, n + ': kunci = bagian bertanda');
      assert.equal(nilaiEkspresi(l.sesudah), nilai, n + ': nilai baris tetap');
      assert.ok(l.label && l.hints.length >= 1, n + ': label & hints');
      sebelum = l.sesudah;
    });
    assert.doesNotMatch(sebelum, /\[\[/, s.id + ': baris akhir tanpa penanda');
    assert.equal(sebelum, E.fmtBulat(nilai), s.id + ': baris akhir = hasil');
    assert.ok(s.cerita && s.tafsir, s.id + ': cerita & tafsir');
  });
  assertTps(C.tpsSoal, 'campuran.tpsSoal');
});

test('latihan: bank cukup untuk komposisi acak & kunci cocok engine', () => {
  const L = D.latihan;
  const total = Object.values(L.komposisi).reduce((x, y) => x + y, 0);
  assert.equal(total, L.banyak);
  Object.keys(L.komposisi).forEach((k) => {
    const n = L.soal.filter((s) => s.type === k).length;
    assert.ok(n > L.komposisi[k], k + ': bank lebih banyak dari yang diambil (agar acak)');
  });
  assert.equal(new Set(ids(L.soal)).size, L.soal.length);
  L.soal.forEach((s) => {
    assert.ok(KONTEKS.includes(s.konteks), s.id + ': konteks');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.type === 'input') {
      assert.ok(['×', ':'].includes(s.op), s.id + ': op');
      assert.equal(E.hasilOperasiBulat(s.a, s.op, s.b), s.jawab, s.id + ': kunci');
      assert.ok(Number.isInteger(s.jawab), s.id + ': bulat');
      assert.ok(s.hints.length >= 1 && s.reveal, s.id + ': hints & reveal');
    } else {
      assert.equal(s.type, 'choice');
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct');
      if (typeof s.nilai === 'number') {
        const c = s.options.find((o) => o.id === s.correct);
        assert.equal(nilaiEkspresi(c.label), s.nilai, s.id + ': label benar = nilai');
      }
    }
  });
});

test('refleksi: pertanyaan & opsi penilaian diri/pasangan untuk diacak', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  assert.equal(new Set(ids(R.pertanyaan)).size, R.pertanyaan.length);
  assertOptions(R.diriOpsi, 'diriOpsi');
  assertOptions(R.pasanganOpsi, 'pasanganOpsi');
  assert.ok(D.selesai.capaian.length >= 3);
});

test('app.js: semua pilihan dirender dengan urutan acak tersimpan', () => {
  const src = fs.readFileSync(path.join(ROOT, 'fase-d/mpi-2.2/app.js'), 'utf8');
  const calls = src.match(/buildChoiceGroup\([^,]+,\s*[^,)]+/g) || [];
  assert.ok(calls.length >= 1);
  calls.forEach((c) => assert.doesNotMatch(c, /,\s*null$/, 'urutan tidak boleh null: ' + c));
  assert.match(src, /ensureTpsStates\(/);
  assert.match(src, /ensureShuffledOrder\(/);
  assert.match(src, /ensureSortStates\(/);
  assert.match(src, /shuffleArray\(/);
});
