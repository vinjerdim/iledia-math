'use strict';

/*
 * Tes konsistensi konten fase-e/mpi-1.1/data.js (sifat perkalian,
 * pembagian, dan pangkat dari pangkat bilangan berpangkat bulat positif,
 * Discovery Learning): seluruh eksponen di konten bulat positif (dan
 * m > n untuk pembagian), kunci jawaban dihitung ulang secara numerik
 * dari metadata `cek` dengan Math.pow (bebas dari rumus sifat), nilai
 * tabel pola dapat dicari di tabel pangkat, setiap daftar pilihan punya
 * id unik dan cukup opsi untuk diacak, setiap opsi pertanyaan penuntun
 * punya umpan balik, lab uji dapat diselesaikan dalam batas stepper,
 * dan app.js mengacak setiap daftar pilihan jawaban.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-e/mpi-1.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-e/mpi-1.1/app.js'), 'utf8');

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + '.' + o.id + ': ada label'));
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertSort(items, options, name) {
  assertOptions(options, name + '.opsi', 2);
  assert.ok(items.length >= 4, name + ': minimal 4 butir');
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(ids(options).includes(it.correct), name + '.' + it.id + ': kategori valid');
    assert.ok(it.explanation, name + '.' + it.id + ': ada penjelasan');
  });
  const kategori = new Set(items.map((it) => it.correct));
  assert.equal(kategori.size, options.length, name + ': setiap kategori terpakai');
}

function relSama(a, b) {
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

/* Unsur kali/bagi: n (aⁿ) atau [m, n] ((aᵐ)ⁿ). */
function eksponenCek(c) {
  const out = [];
  (c.kali || []).concat(c.bagi || []).forEach((t) => {
    if (Array.isArray(t)) out.push(t[0], t[1]);
    else out.push(t);
  });
  if (c.luar) out.push(c.luar);
  if (c.jenis === 'nilai') out.push(c.n);
  return out;
}

/* Nilai bentuk `setara` dihitung langsung dengan Math.pow. */
function nilaiSetara(c) {
  const term = (t) => (Array.isArray(t) ? Math.pow(Math.pow(c.a, t[0]), t[1]) : Math.pow(c.a, t));
  let v = (c.kali || []).reduce((acc, t) => acc * term(t), 1);
  v = (c.bagi || []).reduce((acc, t) => acc / term(t), v);
  return Math.pow(v, c.luar || 1);
}

function cocokCek(c, x) {
  if (c.jenis === 'nilai') return relSama(x, Math.pow(c.a, c.n));
  if (c.jenis === 'setara') return relSama(Math.pow(c.a, x), nilaiSetara(c));
  throw new Error('jenis cek tidak dikenal: ' + c.jenis);
}

function assertCekPositif(c, name) {
  eksponenCek(c).forEach((n) => {
    assert.ok(Number.isInteger(n) && n >= 1, name + ': eksponen ' + n + ' harus bulat positif');
  });
  if (c.jenis === 'setara') {
    assert.ok(nilaiSetara(c) >= c.a, name + ': hasil bukan pangkat nol/negatif');
  }
}

function assertSteps(list, name) {
  assert.ok(list.length >= 1, name + ' tidak kosong');
  list.forEach((s, i) => {
    const nm = name + '[' + i + ']';
    assert.ok(s.label, nm + '.label');
    assert.equal(typeof s.jawab, 'number', nm + '.jawab');
    assert.ok(Number.isInteger(s.jawab) && s.jawab > 0, nm + ': jawaban bulat positif');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    assert.ok(s.temuan || s.bukti, nm + '.temuan/bukti');
    assert.ok(s.cek, nm + '.cek (metadata kunci)');
    assertCekPositif(s.cek, nm);
    assert.ok(cocokCek(s.cek, s.jawab), nm + ': jawab cocok dengan cek');
  });
}

const STAGE_KEYS = [
  'stimulasi',
  'masalah',
  'koleksi',
  'olah',
  'verifikasi',
  'generalisasi',
  'terapkan',
  'refleksi',
];

test('setiap tahap punya kepala tahap & catatan guru', () => {
  STAGE_KEYS.forEach((k) => {
    assert.ok(D[k], k + ' ada');
    assert.ok(D[k].kicker, k + '.kicker');
    assert.ok(D[k].goal, k + '.goal');
    assert.ok(D[k].syntax, k + '.syntax');
    assert.ok(D[k].guru, k + '.guru');
    assert.ok(D[k].nextLabel, k + '.nextLabel');
  });
  assert.ok(D.selesai && D.selesai.judul && D.selesai.capaian.length >= 3);
});

test('sintaks Discovery Learning 1–6 terpetakan berurutan', () => {
  const urut = ['stimulasi', 'masalah', 'koleksi', 'olah', 'verifikasi', 'generalisasi'];
  urut.forEach((k, i) => assert.match(D[k].syntax, new RegExp('Sintaks ' + (i + 1) + '$'), k));
});

test('app.js: urutan tahap sesuai data dan 9 tahap', () => {
  const m = APP.match(/var STAGES = \[([\s\S]*?)\];/);
  assert.ok(m, 'STAGES ada');
  const stages = m[1].match(/'([a-zA-Z]+)'/g).map((s) => s.replace(/'/g, ''));
  assert.deepEqual(stages, STAGE_KEYS.concat(['selesai']));
});

test('stimulasi: tabel pangkat 2 lengkap, dugaan acak, dugaan benar = 2⁷', () => {
  const S = D.stimulasi;
  assertOptions(S.opsi, 'stimulasi.opsi', 4);
  const t = S.tabel;
  assert.ok(t.dari >= 1, 'tabel mulai dari pangkat positif');
  assert.equal(E.powerTableEditable(t).length, 0, 'tabel stimulasi hanya ditampilkan');
  const soal = S.soalDugaan;
  const kunci = E.polaEksponenKunci(soal.operasi, soal.a, soal.m, soal.n);
  assert.ok(ids(S.opsi).includes(D.verifikasi.dugaanBenar));
  const benar = S.opsi.find((o) => o.id === D.verifikasi.dugaanBenar).label;
  assert.equal(benar, E.formatPangkat(soal.a, kunci.k));
  assert.ok(kunci.k <= t.sampai, 'hasil dapat dicari di tabel');
});

test('masalah: pertanyaan inti', () => {
  const M = D.masalah;
  assertGuided({ opsi: M.opsi, correct: M.correct, umpan: M.umpan }, 'masalah');
});

test('koleksi: tabel pangkat berisi sel isian dan kuncinya terbaca benar', () => {
  assert.ok(D.koleksi.tabelPangkat.length >= 2);
  D.koleksi.tabelPangkat.forEach((t) => {
    assert.ok(t.id, 'tabel.id');
    assert.ok(t.dari >= 1, t.id + ': eksponen positif');
    const editable = Array.from(E.powerTableEditable(t));
    assert.ok(editable.length >= 3, t.id + ': minimal 3 sel diisi murid');
    const kunci = {};
    editable.forEach((n) => {
      kunci[n] = String(Math.pow(t.a, n));
    });
    assert.equal(E.powerTableAllCorrect(t, kunci), true, t.id);
  });
  assert.ok(D.koleksi.hintsTabel.length >= 2);
});

test('koleksi: tabel pola mencakup tiga operasi, eksponen positif, nilai ada di tabel', () => {
  const P = D.koleksi.pola;
  assert.deepEqual(
    Array.from(P, (p) => p.operasi),
    ['kali', 'bagi', 'pangkat']
  );
  assert.equal(new Set(ids(P)).size, P.length, 'id pola unik');
  P.forEach((p) => {
    assert.ok(p.judul && p.instruksi, p.id + ': judul & instruksi');
    assert.ok(p.hints.length >= 2, p.id + ': petunjuk');
    assert.ok(p.temuan, p.id + ': temuan');
    assert.ok(p.baris.length >= 3, p.id + ': minimal 3 baris data');
    const basis = new Set(p.baris.map((b) => b.a));
    assert.ok(basis.size >= 2, p.id + ': lebih dari satu basis');
    p.baris.forEach((b, i) => {
      const nm = p.id + '[' + i + ']';
      assert.ok(Number.isInteger(b.m) && b.m >= 1, nm + ': m bulat positif');
      assert.ok(Number.isInteger(b.n) && b.n >= 1, nm + ': n bulat positif');
      if (p.operasi === 'bagi') assert.ok(b.m > b.n, nm + ': m > n');
      const kunci = E.polaEksponenKunci(p.operasi, b.a, b.m, b.n);
      assert.equal(kunci.nilai, Math.pow(b.a, kunci.k), nm);
      const tabel = D.koleksi.tabelPangkat.find((t) => t.a === b.a);
      assert.ok(tabel, nm + ': ada tabel pangkat basis ' + b.a);
      assert.ok(kunci.k <= tabel.sampai, nm + ': hasil ' + kunci.teks + ' ada di tabel');
      const inputs = { [i]: { nilai: String(kunci.nilai), k: String(kunci.k) } };
      assert.equal(E.polaBarisStatus(p, i, inputs).benar, true, nm + ': kunci terbaca benar');
    });
  });
});

test('koleksi: pilah pernyataan', () => {
  assertSort(D.koleksi.pilah, D.koleksi.opsiPilah, 'koleksi.pilah');
});

test('olah: pertanyaan penuntun per operasi, langkah basis baru, rumus', () => {
  const O = D.olah;
  assert.ok(O.pertanyaan.length >= 3);
  assert.equal(new Set(ids(O.pertanyaan)).size, O.pertanyaan.length);
  O.pertanyaan.forEach((q) => {
    assert.ok(q.tanya, q.id + '.tanya');
    assertGuided(q, 'olah.' + q.id);
  });
  assertSteps(O.langkah, 'olah.langkah');
  const basisData = new Set(D.koleksi.pola.flatMap((p) => p.baris.map((b) => b.a)));
  O.langkah.forEach((s, i) =>
    assert.ok(!basisData.has(s.cek.a), 'olah.langkah[' + i + ']: basis baru untuk menguji pola')
  );
  assert.equal(O.rumus.length, 3);
  assert.deepEqual(
    Array.from(O.rumus, (r) => r.teks),
    ['aᵐ × aⁿ = aᵐ⁺ⁿ', 'aᵐ : aⁿ = aᵐ⁻ⁿ', '(aᵐ)ⁿ = aᵐˣⁿ']
  );
});

test('verifikasi: lab hanya eksponen positif dan setiap syarat dapat diselesaikan', () => {
  const L = D.verifikasi.lab;
  assert.equal(L.positif, true);
  assert.ok(L.batasE[0] >= 1, 'stepper eksponen mulai dari 1');
  L.sifat.forEach((s) => assert.ok(E.SIFAT_EKSPONEN[s], 'sifat ' + s + ' dikenal'));
  ['kali', 'bagi', 'pangkat'].forEach((s) => assert.ok(L.sifat.includes(s), s));
  ['nolNegatif', 'kaliBasis', 'bagiBasis', 'salahNegatif'].forEach((s) =>
    assert.ok(!L.sifat.includes(s), s + ' di luar TP')
  );
  L.sifat.forEach((s) => {
    if (E.SIFAT_EKSPONEN[s].keliru) assert.ok(L.nama[s], s + ': nama dugaan teman');
  });
  L.syarat.forEach((sy) => {
    assert.ok(L.sifat.includes(sy.sifat), sy.sifat + ' dapat dipilih');
    assert.ok(!sy.nonPositif, sy.sifat + ': tidak menuntut eksponen ≤ 0');
    const st = E.makeExponentLabState(sy.sifat);
    let tercatat = 0;
    let sangkal = false;
    for (let a = L.batasA[0]; a <= L.batasA[1]; a++) {
      for (let m = L.batasE[0]; m <= L.batasE[1]; m++) {
        for (let n = L.batasE[0]; n <= L.batasE[1]; n++) {
          Object.assign(st, { a: a, m: m, n: n });
          if (E.labCatat(st, { positif: true }) === 'ok') {
            tercatat++;
            if (!st.log[st.log.length - 1].sama) sangkal = true;
          }
        }
      }
    }
    assert.ok(tercatat >= sy.min, sy.sifat + ': cukup uji');
    if (sy.sangkal) assert.ok(sangkal, sy.sifat + ': ada contoh penyangkal');
    else assert.ok(!sangkal, sy.sifat + ': sifat benar tidak pernah tersangkal');
  });
  const dugaan = Array.from(
    L.syarat.filter((s) => s.sangkal),
    (s) => s.sifat
  );
  assert.deepEqual(dugaan.sort(), ['salahBagi', 'salahKali', 'salahPangkat']);
});

test('verifikasi: ubin faktor, bukti dugaan awal, dan pilah miskonsepsi', () => {
  const V = D.verifikasi;
  assertSteps(V.ubin, 'verifikasi.ubin');
  assert.deepEqual(
    Array.from(V.ubin, (s) => s.visual.jenis),
    ['kali', 'bagi', 'pangkat']
  );
  V.ubin.forEach((s, i) => {
    assert.ok(E.buildFactorTiles(s.visual).includes('fx-tile'), 'ubin[' + i + '] dirender');
  });
  assertSteps(V.uji, 'verifikasi.uji');
  const soal = D.stimulasi.soalDugaan;
  assert.equal(V.uji[0].jawab, E.polaEksponenKunci(soal.operasi, soal.a, soal.m, soal.n).k);
  assertSort(V.pilah, V.opsiPilah, 'verifikasi.pilah');
});

test('generalisasi: bank kalimat dengan pengecoh', () => {
  const G = D.generalisasi;
  assert.equal(new Set(ids(G.bank)).size, G.bank.length, 'id bank unik');
  assert.equal(new Set(ids(G.kalimat)).size, G.kalimat.length, 'id kalimat unik');
  const correct = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(correct).size, correct.length, 'setiap potongan dipakai sekali');
  correct.forEach((c) => assert.ok(ids(G.bank).includes(c), c + ' ada di bank'));
  assert.ok(G.bank.length >= G.kalimat.length + 3, 'minimal 3 pengecoh');
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: kunci isian & pilihan ganda terverifikasi, eksponen positif', () => {
  const T = D.terapkan.soal;
  assert.ok(T.length >= 6);
  assert.ok(T.some((s) => s.type === 'choice') && T.some((s) => s.type === 'input'));
  T.forEach((s, i) => {
    const nm = 'terapkan[' + i + ']';
    assert.ok(s.cerita && s.pertanyaan, nm + ': cerita & pertanyaan');
    assert.ok(s.hints && s.hints.length, nm + '.hints');
    assertCekPositif(s.cek, nm);
    if (s.type === 'input') {
      assert.ok(Number.isInteger(s.jawab) && s.jawab > 0, nm + ': jawaban bulat positif');
      assert.ok(cocokCek(s.cek, s.jawab), nm + ': jawab cocok dengan cek');
      assert.ok(s.reveal, nm + '.reveal');
    } else {
      assert.equal(s.type, 'choice', nm + '.type');
      assertOptions(s.options, nm + '.options', 4);
      assert.ok(ids(s.options).includes(s.correct), nm + ': correct ada di opsi');
      const cocok = s.options.filter((o) => cocokCek(s.cek, o.nilai));
      assert.equal(cocok.length, 1, nm + ': tepat satu opsi cocok');
      assert.equal(cocok[0].id, s.correct, nm + ': opsi cocok = correct');
      assert.ok(s.explanation, nm + '.explanation');
    }
  });
});

test('refleksi: pertanyaan & penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
});

test('app.js: setiap daftar pilihan jawaban diacak', () => {
  [
    /ensureShuffledOrder\(State, 'stimulasiOrder', DATA\.stimulasi\.opsi\)/,
    /ensureShuffledOrder\(State, 'masalahOrder', DATA\.masalah\.opsi\)/,
    /ensureSortStates\([\s\S]*?DATA\.koleksi\.pilah/,
    /DATA\.olah\.pertanyaan\.forEach[\s\S]*?ensureShuffledOrder/,
    /ensureSortStates\([\s\S]*?DATA\.verifikasi\.pilah/,
    /ensureShuffledOrder\(State, 'bankOrder', DATA\.generalisasi\.bank\)/,
    /optionOrder: s\.options \? shuffleArray\(optionIds\(s\.options\)\)/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
  ].forEach((re) => assert.match(APP, re));
});

test('tidak ada sisa konten pangkat nol/negatif', () => {
  const src = fs.readFileSync(path.join(ROOT, 'fase-e/mpi-1.1/data.js'), 'utf8');
  assert.doesNotMatch(src, /[a-z0-9)][⁰⁻]/, 'tidak memuat a⁰ atau a⁻ⁿ');
});
