'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.4/data.js (operasi hitung bentuk
 * akar, Cooperative Learning tipe Jigsaw): kunci dugaan, pernyataan,
 * dan kuis dihitung ulang dengan engine seksi 46 (hasilOperasiAkar,
 * formatBentukAkar), setiap daftar pilihan punya id & label unik dan
 * cukup opsi untuk diacak, setiap opsi penuntun punya umpan balik,
 * stasiun ahli sesuai kartu ahli dengan tabel uji bernilai eksak, soal
 * misi punya strategi & bentuk isian yang jelas, dan langkah soal
 * kontekstual saling bersambung.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.4/data.js']);
const D = E.DATA;

function ids(list) {
  return Array.from(list, (o) => o.id);
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

function teksHasil(soal) {
  return E.formatBentukAkar(E.hasilOperasiAkar(soal)) + (soal.satuan ? ' ' + soal.satuan : '');
}

/* Soal operasi valid: hasil terdefinisi (kecuali jebakan tidak sejenis) & bentuk isian jelas. */
function assertSoalOperasi(s, name) {
  assert.ok(['jumlah', 'kali', 'bagi', 'rasional', 'sekawan'].includes(s.op), name + '.op');
  const strategi = E.strategiAkarSoal(s);
  if (strategi === 'tidakSejenis') return;
  const h = E.hasilOperasiAkar(s);
  assert.ok(h, name + ': punya hasil');
  assert.ok(E.bentukIsianAkar(s), name + ': bentuk isian');
  assert.ok(!(h.a !== 0 && h.b !== 0 && h.d > 1), name + ': hasil dua suku tanpa penyebut');
  if (s.op === 'sekawan') {
    assert.ok(s.a * s.a - s.r !== 0, name + ': penyebut sekawan ≠ 0');
    assert.ok(nilai(s) > 0, name + ': penyebut positif agar masuk akal');
  }
  if (s.op === 'jumlah' || s.op === 'kali' || s.op === 'bagi') {
    assert.ok(Math.abs(E.nilaiBentukAkar(h) - nilai(s)) < 1e-9, name + ': nilai hampiran cocok');
  }
}

/* Nilai soal dihitung langsung dengan Math.sqrt (bukan dengan aturan operasi). */
function nilai(s) {
  const v = (x) => x.k * Math.sqrt(x.r);
  if (s.op === 'jumlah') return s.suku.reduce((acc, x) => acc + v(x), 0);
  if (s.op === 'kali') return v(s.a) * v(s.b);
  if (s.op === 'bagi') return v(s.a) / v(s.b);
  if (s.op === 'rasional') return s.p / v(s.q);
  return s.p / (s.a + (s.c || 1) * Math.sqrt(s.r));
}

test('tahap: 11 tahap unik, sesuai stageCount manifest', () => {
  const man = require('../shared/pages-manifest.json')['fase-d/mpi-12.4'];
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

test('tujuan: dugaan punya 4 opsi unik dan kunci = hasil operasi', () => {
  assert.equal(D.tujuan.kriteria.length, 4);
  D.tujuan.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    const benar = teksHasil(q.cek);
    assert.equal(q.opsi.find((o) => o.id === q.kunci).label, benar, q.id);
    assert.ok(q.penjelasan.includes(benar), q.id + ': penjelasan memuat ' + benar);
    const lain = q.opsi.filter((o) => o.id !== q.kunci).map((o) => o.label);
    assert.ok(!lain.includes(benar), q.id + ': pengecoh ≠ kunci');
  });
});

test('informasi: pertanyaan penuntun lengkap dengan umpan per opsi', () => {
  D.informasi.penuntun.forEach((q) => assertGuided(q, 'penuntun.' + q.id));
  assert.equal(E.formatAkar(5, 2, 2), '5√2');
});

test('tim: 2–5 anggota, kesepakatan unik', () => {
  assert.ok(D.tim.minAnggota >= 2 && D.tim.maksAnggota >= 4);
  assert.equal(new Set(ids(D.tim.kesepakatan)).size, D.tim.kesepakatan.length);
});

test('ahli: empat stasiun sesuai kartu ahli, tabel uji eksak, soal stasiun sesuai operasi', () => {
  assert.deepEqual(ids(D.ahli.stasiun), ids(E.OPERASI_AKAR_AHLI));
  D.ahli.stasiun.forEach((st) => {
    const nm = 'stasiun.' + st.id;
    assert.ok(st.uji.length >= 3, nm + ': minimal 3 baris uji');
    const hasil = st.uji.map((b, i) => {
      const u = E.ujiAkarBaris(st.id, b);
      assert.ok(u.kiri && u.kanan, nm + ' baris ' + i + ' bernilai');
      return u.sama;
    });
    if (st.id === 'jumlah') {
      assert.ok(hasil.includes(true) && hasil.includes(false), nm + ': ada baris sama & beda');
    } else {
      assert.ok(hasil.every(Boolean), nm + ': semua baris menunjukkan sifat');
    }
    assertGuided(st.tanya, nm + '.tanya');
    assert.ok(st.analogi, nm + '.analogi');
    assert.equal(st.soal.length, 2, nm + ': dua soal stasiun');
    st.soal.forEach((s) => {
      assert.equal(E.strategiAkarSoal(s), st.id, nm + '.' + s.id + ': strategi = stasiun');
      assertSoalOperasi(s, nm + '.' + s.id);
    });
  });
});

test('misi 1: delapan soal dengan semua strategi, termasuk jebakan tidak sejenis & sekawan', () => {
  const soal = D.misiOperasi.soal;
  assert.ok(soal.length >= 8);
  assert.equal(new Set(ids(soal)).size, soal.length);
  const strategi = new Set(soal.map((s) => E.strategiAkarSoal(s)));
  ['jumlah', 'kali', 'bagi', 'rasional', 'sekawan', 'tidakSejenis'].forEach((s) =>
    assert.ok(strategi.has(s), 'strategi ' + s)
  );
  soal.forEach((s) => assertSoalOperasi(s, 'misiOperasi.' + s.id));
  /* Jebakan: sebelum disederhanakan radikan berbeda, tetapi ada juga yang ternyata sejenis. */
  assert.ok(
    soal.some(
      (s) => s.op === 'jumlah' && new Set(s.suku.map((x) => x.r)).size > 1 && E.sejenisAkar(s.suku)
    )
  );
});

test('misi 2: langkah kontekstual bersambung dan bersatuan', () => {
  D.misiKonteks.soal.forEach((c) => {
    assert.ok(c.cerita && c.ikon, c.id + ': cerita & ikon');
    c.langkah.forEach((l, i) => {
      const nm = c.id + ' langkah ' + (i + 1);
      assert.ok(l.label, nm + '.label');
      assert.ok(l.soal.satuan, nm + ': satuan');
      assert.notEqual(E.strategiAkarSoal(l.soal), 'tidakSejenis', nm);
      assertSoalOperasi(l.soal, nm);
      if (l.lanjut) {
        assert.ok(i > 0, nm + ': lanjut butuh langkah sebelumnya');
        const prev = E.hasilOperasiAkar(c.langkah[i - 1].soal);
        const operan = [l.soal.a, l.soal.b].map((x) => ({ b: x.k, r: x.r }));
        assert.ok(
          operan.some((o) => E.samaBentuk(o, prev)),
          nm + ': memakai hasil langkah sebelumnya'
        );
      }
    });
  });
});

test('misi 3: pernyataan Benar/Salah sesuai hasil operasi', () => {
  const P = D.misiDiskusi.pernyataan;
  assert.equal(P.length, 8);
  assert.equal(new Set(ids(P)).size, P.length);
  P.forEach((p) => {
    const h = E.hasilOperasiAkar(p.cek.soal);
    const benar = !!h && E.samaBentuk(h, p.cek.klaim);
    assert.equal(p.correct, benar ? 'benar' : 'salah', p.id);
    assert.ok(p.explanation, p.id + '.explanation');
  });
  const jml = P.filter((p) => p.correct === 'benar').length;
  assert.ok(jml >= 3 && jml <= 5, 'benar/salah seimbang');
});

test('kuis: bank cukup untuk komposisi, kunci = hasil operasi, opsi unik', () => {
  const K = D.kuis;
  const total = Object.values(K.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, K.banyak);
  Object.keys(K.komposisi).forEach((jenis) => {
    const n = K.soal.filter((s) => s.jenis === jenis).length;
    assert.ok(n > K.komposisi[jenis], jenis + ': bank lebih banyak dari yang diambil (acak)');
  });
  assert.equal(new Set(ids(K.soal)).size, K.soal.length);
  K.soal.forEach((s) => {
    assertOptions(s.options, 'kuis.' + s.id, 4);
    assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada di opsi');
    const benar = teksHasil(s.cek);
    assert.equal(s.options.find((o) => o.id === s.correct).label, benar, s.id);
    assert.ok(s.pertanyaan && s.cerita && s.explanation, s.id + ': teks lengkap');
  });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 4);
});
