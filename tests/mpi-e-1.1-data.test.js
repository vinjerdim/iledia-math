'use strict';

/*
 * Tes konsistensi konten fase-e/mpi-1.1/data.js (sifat-sifat eksponen
 * bulat, Discovery Learning): kunci jawaban dihitung ulang secara
 * numerik dari metadata `cek` dan dicocokkan dengan pangkatBulat() di
 * shared/engine.js, setiap daftar pilihan punya id unik dan cukup opsi
 * untuk diacak, setiap opsi pertanyaan penuntun punya umpan balik, dan
 * lab uji dapat diselesaikan dengan batas stepper yang tersedia.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-e/mpi-1.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertSort(items, options, name) {
  assertOptions(options, name + '.opsi', 2);
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

/* Nilai bentuk `setara` dihitung langsung dengan Math.pow (bebas dari sifat eksponen). */
function nilaiSetara(c) {
  const term = (t) => (Array.isArray(t) ? Math.pow(Math.pow(c.a, t[0]), t[1]) : Math.pow(c.a, t));
  let v = (c.kali || []).reduce((acc, t) => acc * term(t), 1);
  v = (c.bagi || []).reduce((acc, t) => acc / term(t), v);
  return Math.pow(v, c.luar || 1);
}

/* Apakah bilangan `x` cocok dengan metadata cek? */
function cocokCek(c, x) {
  if (c.jenis === 'nilai') {
    const exact = E.pangkatBulat(c.a, c.n);
    return relSama(x, Math.pow(c.a, c.n)) && relSama(x, E.nilaiPecahan(exact));
  }
  if (c.jenis === 'setara') return relSama(Math.pow(c.a, x), nilaiSetara(c));
  if (c.jenis === 'jumlah') {
    return relSama(
      x,
      c.suku.reduce((acc, s) => acc + Math.pow(s[0], s[1]), 0)
    );
  }
  throw new Error('jenis cek tidak dikenal: ' + c.jenis);
}

function assertSteps(list, name) {
  list.forEach((s, i) => {
    const nm = name + '[' + i + ']';
    assert.ok(s.label, nm + '.label');
    assert.equal(typeof s.jawab, 'number', nm + '.jawab');
    assert.ok(Array.isArray(s.hints) && s.hints.length, nm + '.hints');
    assert.ok(s.temuan || s.bukti, nm + '.temuan/bukti');
    assert.ok(s.cek, nm + '.cek (metadata kunci)');
    assert.ok(cocokCek(s.cek, s.jawab), nm + ': jawab cocok dengan cek');
    if (!Number.isInteger(s.jawab)) assert.ok(s.rational, nm + ': jawaban pecahan butuh rational');
  });
}

test('setiap tahap punya kepala tahap & catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'koleksi',
    'olahSifat',
    'olahNolNegatif',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k].kicker, k + '.kicker');
    assert.ok(D[k].goal, k + '.goal');
    assert.ok(D[k].syntax, k + '.syntax');
    assert.ok(D[k].guru, k + '.guru');
    assert.ok(D[k].nextLabel, k + '.nextLabel');
  });
});

test('sintaks Discovery Learning 1–6 terpetakan berurutan', () => {
  const urut = ['stimulasi', 'masalah', 'koleksi', 'olahSifat', 'verifikasi', 'generalisasi'];
  urut.forEach((k, i) => assert.match(D[k].syntax, new RegExp('Sintaks ' + (i + 1) + '$'), k));
  assert.match(D.olahNolNegatif.syntax, /Sintaks 4$/);
});

test('stimulasi: dugaan punya opsi cukup & dugaan benar sesuai pangkatBulat', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  assert.ok(ids(D.stimulasi.opsi).includes(D.verifikasi.dugaanBenar));
  const benar = D.stimulasi.opsi.find((o) => o.id === D.verifikasi.dugaanBenar).label;
  assert.match(benar, /2⁰ = 1/);
  assert.match(benar, /2⁻² = 1\/4/);
  assert.equal(E.formatPecahan(E.pangkatBulat(2, 0)), '1');
  assert.equal(E.formatPecahan(E.pangkatBulat(2, -2)), '1/4');
  const t = D.stimulasi.tangga;
  assert.ok(t.sampai <= -2 && t.diketahui.indexOf(0) === -1, 'nilai 2⁰ tidak dibocorkan');
});

test('masalah: pertanyaan inti', () => {
  const M = D.masalah;
  assertGuided({ opsi: M.opsi, correct: M.correct, umpan: M.umpan }, 'masalah');
});

test('koleksi: tangga pangkat memuat eksponen nol & negatif, ada sel isian', () => {
  D.koleksi.tangga.forEach((t) => {
    assert.ok(t.id, 'tangga.id');
    assert.ok(t.dari > 0 && t.sampai < 0, t.id + ': melewati 0');
    const editable = Array.from(E.powerLadderEditable(t));
    assert.ok(editable.includes(0) && editable.includes(-1), t.id + ': 0 & −1 diisi murid');
    const kunci = {};
    editable.forEach((n) => {
      kunci[n] = E.formatPecahan(E.pangkatBulat(t.a, n));
    });
    assert.equal(E.powerLadderAllCorrect(t, kunci), true, t.id + ': kunci terbaca benar');
  });
  assert.ok(D.koleksi.hintsTangga.length >= 2);
});

test('koleksi: ubin faktor & pilah', () => {
  assertSteps(D.koleksi.ubin, 'koleksi.ubin');
  D.koleksi.ubin.forEach((s, i) => {
    assert.ok(s.visual && s.visual.jenis, 'ubin[' + i + '].visual');
    assert.ok(E.buildFactorTiles(s.visual).includes('fx-tile'), 'ubin[' + i + '] dirender');
  });
  assertSort(D.koleksi.pilah, D.koleksi.opsiPilah, 'koleksi.pilah');
});

test('olah sifat: langkah & pertanyaan penuntun', () => {
  const O = D.olahSifat;
  assertSteps(O.langkah, 'olahSifat.langkah');
  O.pertanyaan.forEach((q) => assertGuided(q, 'olahSifat.' + q.id));
  assert.equal(new Set(ids(O.pertanyaan)).size, O.pertanyaan.length);
  assert.equal(O.rumus.length, 5);
});

test('olah nol & negatif: langkah, urutan tangga, pertanyaan', () => {
  const O = D.olahNolNegatif;
  assertSteps(O.langkahA, 'olahNolNegatif.langkahA');
  assertSteps(O.langkahB, 'olahNolNegatif.langkahB');
  const editable = Array.from(E.powerLadderEditable(O.tangga));
  assert.deepEqual(
    Array.from(O.langkahA, (s) => s.n),
    editable,
    'langkahA mengisi tangga dari atas ke bawah'
  );
  O.langkahA.forEach((s) => {
    assert.equal(s.cek.a, O.tangga.a);
    assert.equal(s.cek.n, s.n);
  });
  O.pertanyaan.forEach((q) => assertGuided(q, 'olahNolNegatif.' + q.id));
});

test('verifikasi: lab dapat diselesaikan dalam batas stepper', () => {
  const L = D.verifikasi.lab;
  L.sifat.forEach((s) => assert.ok(E.SIFAT_EKSPONEN[s], 'sifat ' + s + ' dikenal'));
  L.syarat.forEach((s) =>
    assert.ok(L.sifat.includes(s.sifat), 'syarat ' + s.sifat + ' bisa dipilih')
  );

  /* Simulasikan murid: cari kombinasi yang memenuhi setiap syarat. */
  const st = E.makeExponentLabState(L.sifat[0]);
  L.syarat.forEach((s) => {
    st.sifat = s.sifat;
    let tercatat = 0;
    for (let a = L.batasA[0]; a <= L.batasA[1] && tercatat < s.min + 1; a++) {
      for (let m = L.batasE[0]; m <= L.batasE[1] && tercatat < s.min + 1; m++) {
        for (let n = L.batasE[0]; n <= L.batasE[1] && tercatat < s.min + 1; n++) {
          st.a = a;
          st.m = m;
          st.n = n;
          const r = E.cekSifatEksponen(s.sifat, a, m, n, st.b);
          const perlu =
            (s.nonPositif && (m <= 0 || n <= 0)) || (s.sangkal && !r.sama) || tercatat < s.min;
          if (r.terdefinisi && perlu && E.labCatat(st) === 'ok') tercatat++;
        }
      }
    }
  });
  assert.equal(E.labSyaratSelesai(st, L.syarat), true);
});

test('verifikasi: uji dugaan & pilah miskonsepsi', () => {
  assertSteps(D.verifikasi.uji, 'verifikasi.uji');
  assertSort(D.verifikasi.pilah, D.verifikasi.opsiPilah, 'verifikasi.pilah');
});

test('generalisasi: kalimat & bank (dengan pengecoh)', () => {
  const G = D.generalisasi;
  const bankIds = ids(G.bank);
  assert.equal(new Set(bankIds).size, bankIds.length, 'id bank unik');
  const kunci = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(kunci).size, kunci.length, 'setiap potongan dipakai sekali');
  kunci.forEach((k) => assert.ok(bankIds.includes(k), 'kunci ' + k + ' ada di bank'));
  assert.ok(G.bank.length > G.kalimat.length, 'ada pengecoh');
  assert.ok(G.rangkuman.length >= 4);
});

test('uji terap: kunci isian & tepat satu opsi cocok pada pilihan ganda', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 6);
  soal.forEach((s, i) => {
    const nm = 'terapkan[' + i + ']';
    assert.ok(s.cek, nm + '.cek');
    assert.ok(s.hints && s.hints.length, nm + '.hints');
    if (s.type === 'choice') {
      assertOptions(s.options, nm + '.options', 4);
      assert.ok(ids(s.options).includes(s.correct), nm + ': correct ada');
      assert.ok(s.explanation, nm + '.explanation');
      const cocok = s.options.filter((o) => cocokCek(s.cek, o.nilai));
      assert.deepEqual(
        Array.from(cocok, (o) => o.id),
        [s.correct],
        nm + ': hanya kunci yang cocok'
      );
    } else {
      assert.equal(typeof s.jawab, 'number', nm + '.jawab');
      assert.ok(cocokCek(s.cek, s.jawab), nm + ': jawab cocok dengan cek');
      assert.ok(s.reveal, nm + '.reveal');
      /* Jawaban pecahan harus bisa diketik sebagai pecahan biasa. */
      const pecahan = E.formatPecahan(E.parseInputPecahan(String(s.jawab).replace('.', ',')).value);
      assert.ok(E.hampirSama(E.parseInputRational(pecahan).value, s.jawab), nm + ': ' + pecahan);
    }
  });
  const jenis = new Set(soal.map((s) => s.type));
  assert.ok(jenis.has('input') && jenis.has('choice'), 'campuran isian & pilihan ganda');
});

test('refleksi & selesai', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assert.ok(D.selesai.capaian.length >= 3);
});
