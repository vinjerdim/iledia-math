'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.2/data.js (sifat-sifat operasi
 * bilangan berpangkat bulat, Cooperative Learning tipe Jigsaw): kunci
 * dihitung ulang dengan engine seksi 30 & 44 (pangkatBulat,
 * cekSifatEksponen, hasilSoalSifat, hasilRantai, teksRantai), setiap
 * daftar pilihan punya id & label unik dan cukup opsi untuk diacak,
 * setiap opsi penuntun punya umpan balik, dan soal dirancang agar
 * diagnosa miskonsepsi eksponen tidak ambigu.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.2/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi');
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

/* m + n, m − n, m × n berbeda → diagnosa jumlah/selisih/kali tidak tertukar. */
function assertDiagnosaJelas(s, name) {
  if (s.op === 'basisBeda') return;
  const alt = [s.m + s.n, s.m - s.n, s.m * s.n];
  assert.equal(new Set(alt).size, 3, name + ': m + n, m − n, m × n harus berbeda');
}

function nilaiRantai(r) {
  /* Dihitung dari DEFINISI dengan pecahan eksak, bukan dari rumus sifat. */
  let v = E.pangkatBulat(r.a, r.awal);
  r.langkah.forEach((l) => {
    if (l.op === 'kali') v = E.kaliPecahan(v, E.pangkatBulat(r.a, l.n));
    else if (l.op === 'bagi') v = E.bagiPecahan(v, E.pangkatBulat(r.a, l.n));
    else v = E.pangkatBulat(v, l.n);
  });
  return v;
}

test('tahap: 11 tahap unik, sesuai stageCount manifest', () => {
  const man = require('../shared/pages-manifest.json')['fase-d/mpi-12.2'];
  assert.equal(D.tahap.length, 11);
  assert.equal(man.stageCount, D.tahap.length);
  assert.equal(new Set(ids(D.tahap)).size, D.tahap.length);
  ['tujuan', 'informasi', 'tim', 'ahli', 'kuis', 'penghargaan', 'refleksi', 'selesai'].forEach(
    (id) => assert.ok(ids(D.tahap).includes(id), id)
  );
});

test('peran misi: empat peran berbentuk { id, ikon, nama, tugas }', () => {
  assert.equal(D.peranMisi.length, 4);
  D.peranMisi.forEach((p) => ['id', 'ikon', 'nama', 'tugas'].forEach((k) => assert.ok(p[k])));
});

test('tujuan: dugaan punya 4 opsi unik dan kunci sesuai sifat', () => {
  const kunci = { dKali: ['kali', 3, 4], dBagi: ['bagi', 10, 6], dPangkat: ['pangkat', 3, 2] };
  D.tujuan.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    const [op, m, n] = kunci[q.id];
    const benar = E.formatPangkat(2, E.eksponenSifat(op, m, n));
    assert.equal(q.opsi.find((o) => o.id === q.kunci).label, benar, q.id);
    assert.ok(q.penjelasan.includes(benar), q.id + ': penjelasan memuat ' + benar);
  });
  assert.equal(D.tujuan.kriteria.length, 4);
});

test('informasi: pertanyaan penuntun lengkap dengan umpan per opsi', () => {
  D.informasi.penuntun.forEach((q) => assertGuided(q, 'penuntun.' + q.id));
  assert.equal(E.formatPecahan(E.pangkatBulat(-3, 4)), '81');
  assert.equal(E.formatPecahan(E.pangkatBulat(2, -3)), '1/8');
});

test('tim: 2–4 anggota, kesepakatan unik', () => {
  assert.ok(D.tim.minAnggota >= 2 && D.tim.maksAnggota >= D.tim.minAnggota);
  assert.equal(new Set(ids(D.tim.kesepakatan)).size, D.tim.kesepakatan.length);
});

test('ahli: tiga stasiun sesuai kartu ahli, tabel pola bernilai bulat', () => {
  assert.deepEqual(
    Array.from(ids(D.ahli.stasiun)),
    Array.from(E.SIFAT_PANGKAT_AHLI, (s) => s.id)
  );
  D.ahli.stasiun.forEach((st) => {
    const nm = 'stasiun.' + st.id;
    assert.equal(st.ubin.jenis, st.id, nm + '.ubin.jenis');
    assert.equal(st.pola.operasi, st.id, nm + '.pola.operasi');
    assert.ok(st.pola.baris.length >= 3, nm + ': minimal 3 baris pola');
    st.pola.baris.forEach((b, i) => {
      const cek = E.cekSifatEksponen(st.id, b.a, b.m, b.n);
      assert.ok(cek.sama, nm + ' baris ' + i + ' memenuhi sifat');
      assert.equal(cek.kiri.den, 1, nm + ' baris ' + i + ': nilai bulat (isian tabel)');
      assert.ok(b.m > 0 && b.n > 0, nm + ' baris ' + i + ': eksponen positif');
      if (st.id === 'bagi') assert.ok(b.m > b.n, nm + ': m > n agar nilainya bulat');
      assertDiagnosaJelas({ op: st.id, m: b.m, n: b.n }, nm + ' baris ' + i);
    });
    assertGuided(st.tanya, nm + '.tanya');
    assert.equal(st.soal.length, 2, nm + ': dua soal stasiun');
    st.soal.forEach((s) => {
      assert.equal(s.op, st.id, nm + '.' + s.id + '.op');
      assertDiagnosaJelas(s, nm + '.' + s.id);
      if (s.nilai) assert.ok(E.hasilSoalSifat(s).nilai, nm + '.' + s.id + ': punya nilai');
    });
    assert.ok(
      st.soal.some((s) => s.m <= 0 || s.n <= 0 || E.eksponenSifat(s.op, s.m, s.n) <= 0),
      nm + ': ada soal dengan eksponen nol/negatif'
    );
  });
});

test('misi sederhana: tiap sifat & jebakan basis berbeda muncul, diagnosa jelas', () => {
  const S = D.misiSederhana.soal;
  assert.equal(new Set(ids(S)).size, S.length);
  ['kali', 'bagi', 'pangkat', 'basisBeda'].forEach((op) =>
    assert.ok(
      S.some((s) => s.op === op),
      'ada soal ' + op
    )
  );
  S.forEach((s) => {
    assertDiagnosaJelas(s, 'misi1.' + s.id);
    const h = E.hasilSoalSifat(s);
    if (s.nilai) assert.ok(h.nilai, 'misi1.' + s.id + ': nilai terdefinisi');
    if (s.op === 'basisBeda') {
      assert.notEqual(s.a, s.b, 'misi1.' + s.id + ': basis berbeda');
      assert.ok(s.nilai, 'basis berbeda harus meminta nilai');
    } else {
      assert.ok(E.cekSifatEksponen(s.op, typeof s.a === 'string' ? 2 : s.a, s.m, s.n).sama);
    }
  });
  assert.ok(
    S.some((s) => s.op !== 'basisBeda' && E.eksponenSifat(s.op, s.m, s.n) < 0),
    'ada hasil berpangkat negatif'
  );
  assert.ok(
    S.some((s) => s.op !== 'basisBeda' && E.eksponenSifat(s.op, s.m, s.n) === 0),
    'ada hasil berpangkat nol'
  );
});

test('misi rantai: hasil sifat = nilai dari definisi, konteks lengkap', () => {
  const R = D.misiRantai.soal;
  assert.equal(new Set(ids(R)).size, R.length);
  const nilaiKonteks = { r4: '8.192', r5: '256', r6: '1.000' };
  R.forEach((r) => {
    const nm = 'rantai.' + r.id;
    assert.ok(r.langkah.length >= 2, nm + ': minimal dua langkah');
    const L = E.langkahRantai(r);
    L.forEach((s, i) => assertDiagnosaJelas(s, nm + ' langkah ' + i));
    const h = E.hasilRantai(r);
    assert.ok(E.samaPecahan(h.nilai, nilaiRantai(r)), nm + ': sifat = definisi');
    if (r.cerita) {
      assert.ok(r.tanya && r.satuan && r.ikon, nm + ': konteks lengkap');
      assert.ok(r.nilai, nm + ': soal kontekstual meminta nilai');
      assert.equal(E.formatPecahan(h.nilai), nilaiKonteks[r.id], nm + ': nilai konteks');
      r.langkah.forEach((l) => {
        const t = E.formatPangkat(r.a, l.n);
        assert.ok(r.cerita.includes(t), nm + ': cerita memuat ' + t);
      });
    }
  });
  assert.ok(R.some((r) => r.langkah[0].op === 'pangkat'));
  assert.ok(R.some((r) => r.langkah[r.langkah.length - 1].op === 'pangkat'));
});

test('misi diskusi: kebenaran pernyataan dihitung ulang dari definisi', () => {
  const P = D.misiDiskusi.pernyataan;
  assertOptions(D.misiDiskusi.opsi, 'diskusi.opsi', 2);
  assert.equal(new Set(ids(P)).size, P.length);
  P.forEach((p) => {
    const c = p.cek;
    let benar;
    if (c.jenis === 'sifat') {
      const kiri = E.cekSifatEksponen(c.op, c.a, c.m, c.n).kiri;
      benar = E.samaPecahan(kiri, E.pangkatBulat(c.a, c.k));
      assert.ok(p.teks.includes(E.formatPangkat(c.a, c.k)), p.id + ': teks memuat aᵏ');
    } else if (c.jenis === 'basisBeda') {
      const kiri = E.kaliPecahan(E.pangkatBulat(c.a, c.m), E.pangkatBulat(c.b, c.n));
      benar = E.samaPecahan(kiri, E.pangkatBulat(c.c, c.k));
    } else {
      const kiri = E.pecahan(Math.pow(c.a, c.m) + Math.pow(c.a, c.n), 1);
      benar = E.samaPecahan(kiri, E.pangkatBulat(c.a, c.k));
    }
    assert.equal(p.correct, benar ? 'benar' : 'salah', p.id);
    assert.ok(p.explanation, p.id + '.explanation');
  });
  const nBenar = P.filter((p) => p.correct === 'benar').length;
  assert.ok(nBenar >= 3 && P.length - nBenar >= 3, 'jawaban benar/salah seimbang');
});

test('kuis: bank cukup untuk komposisi, kunci dihitung ulang dengan engine', () => {
  const K = D.kuis;
  const total = Object.values(K.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, K.banyak);
  Object.keys(K.komposisi).forEach((j) =>
    assert.ok(
      K.soal.filter((s) => s.jenis === j).length > K.komposisi[j],
      'bank ' + j + ' lebih banyak daripada yang diambil'
    )
  );
  assert.equal(new Set(ids(K.soal)).size, K.soal.length);
  K.soal.forEach((s) => {
    const nm = 'kuis.' + s.id;
    assert.equal(s.type, 'choice');
    assertOptions(s.options, nm, 4);
    assert.ok(ids(s.options).includes(s.correct), nm + ': correct ada di opsi');
    assert.ok(s.explanation && s.cerita && s.pertanyaan, nm + ': teks lengkap');
    if (s.jenis === 'konteks') {
      const teks = s.cerita + ' ' + s.pertanyaan;
      [E.formatPangkat(s.cek.a, s.cek.awal)]
        .concat(s.cek.langkah.map((l) => (l.op === 'pangkat' ? '' : E.formatPangkat(s.cek.a, l.n))))
        .forEach((t) => assert.ok(teks.includes(t), nm + ': konteks memuat ' + t));
    } else {
      assert.ok(s.pertanyaan.includes(E.teksRantai(s.cek)), nm + ': pertanyaan memuat soal');
    }
    const h = E.hasilRantai(s.cek);
    const kunci = s.cek.bentuk === 'nilai' ? E.formatPecahan(h.nilai) : h.teks;
    const label = (o) => o.label.replace(/ .*$/, '');
    assert.equal(label(s.options.find((o) => o.id === s.correct)), kunci, nm + ': kunci');
    s.options
      .filter((o) => o.id !== s.correct)
      .forEach((o) => assert.notEqual(label(o), kunci, nm + ': pengecoh ' + o.id));
    if (typeof s.cek.a === 'number') {
      assert.ok(E.samaPecahan(h.nilai, nilaiRantai(s.cek)), nm + ': sifat = definisi');
    }
  });
});

test('refleksi & selesai', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.equal(new Set(ids(D.refleksi.pertanyaan)).size, D.refleksi.pertanyaan.length);
  assert.ok(D.selesai.capaian.length >= 4);
});
