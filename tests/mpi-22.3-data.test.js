'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.3/data.js (masalah kontekstual
 * luas permukaan prisma, Problem Based Learning): setiap tahap punya
 * kepala PBL, setiap daftar pilihan punya id & label unik dan cukup opsi
 * untuk diacak, setiap opsi pertanyaan penuntun punya umpan balik, dan
 * semua kunci (LP kemasan, luas sisi bahan, banyak lembar/kaleng,
 * konversi, anggaran, penghematan, soal uji terap) dihitung ulang dengan
 * engine seksi 47–48.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.3/data.js']);
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

function assertGuided(list, name) {
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
  list.forEach((q) => {
    const nm = name + '.' + q.id;
    assert.ok(q.tanya, nm + '.tanya');
    assertOptions(q.opsi, nm + '.opsi', 4);
    assert.ok(ids(q.opsi).includes(q.correct), nm + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], nm + ': umpan untuk ' + o.id));
  });
}

function assertSort(items, opsi, name) {
  assertOptions(opsi, name + '.opsi', 2);
  assert.equal(new Set(ids(items)).size, items.length, name + ': id unik');
  items.forEach((it) => {
    assert.ok(ids(opsi).includes(it.correct), name + '.' + it.id);
    assert.ok(it.teks && it.explanation, name + '.' + it.id);
  });
  ids(opsi).forEach((o) =>
    assert.ok(
      items.some((it) => it.correct === o),
      name + ': kategori ' + o + ' terpakai'
    )
  );
}

function ukur(p) {
  const u = E.ukuranAlasPrisma(p.alas);
  return {
    u,
    lp: E.luasPermukaanPrisma({ luasAlas: u.luas, kelilingAlas: u.keliling, tinggi: p.t }),
  };
}

function benda(id) {
  const b = D.benda.find((x) => x.id === id);
  assert.ok(b, 'benda ' + id);
  return b;
}

function luasBahan(b) {
  return E.luasSisiDipakai(b.alas, b.t, b.dipakai);
}

test('setiap tahap punya kepala PBL', () => {
  [
    'orientasi',
    'organisasi',
    'selidikKemasan',
    'selidikSisi',
    'selidikBiaya',
    'karya',
    'evaluasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k].kicker, k + '.kicker');
    assert.ok(D[k].goal, k + '.goal');
    assert.match(D[k].syntax, /Problem Based Learning/, k + '.syntax');
    assert.ok(D[k].guru, k + '.guru');
    assert.ok(D[k].nextLabel, k + '.nextLabel');
  });
});

test('tujuan pembelajaran: masalah kontekstual luas permukaan prisma', () => {
  assert.match(D.orientasi.tp, /masalah kontekstual/i);
  assert.match(D.orientasi.tp, /luas permukaan prisma/i);
  assert.ok(D.orientasi.kriteria.length >= 3);
});

test('kemasan: isi & keliling sama, LP berbeda, C paling hemat', () => {
  assert.deepEqual(ids(D.kemasan), ['A', 'B', 'C']);
  const harap = { A: 408, B: 348, C: 312 };
  D.kemasan.forEach((p) => {
    const m = ukur(p);
    assert.equal(m.u.luas * p.t, D.isiKemasan, p.id + ' isi');
    assert.equal(m.u.keliling, 24, p.id + ' keliling');
    assert.equal(m.lp, harap[p.id], p.id + ' LP');
    m.u.sisi.forEach((s) => assert.ok(Number.isInteger(s), p.id + ' sisi bulat'));
    assert.ok(p.infoAlas && p.caraLuasAlas && p.nama && p.bentuk);
  });
  const k1 = D.selidikKemasan.tanya.find((q) => q.id === 'k1');
  const termurah = D.kemasan.reduce((a, b) => (ukur(a).lp <= ukur(b).lp ? a : b));
  assert.equal(k1.correct, termurah.id);
});

test('benda stand: sisi bahan valid & luas bahan sesuai rancangan', () => {
  const harap = { tenda: 28, etalase: 6600, meja: 34200 };
  D.benda.forEach((b) => {
    const rinci = E.rincianSisiPrisma(b.alas, b.t);
    const sisiIds = Array.from(rinci, (f) => f.id);
    assert.deepEqual(Object.keys(b.namaSisi).sort(), sisiIds.slice().sort(), b.id + ' namaSisi');
    assert.equal(new Set(Object.values(b.namaSisi)).size, sisiIds.length, b.id + ' nama unik');
    b.dipakai.forEach((id) => assert.ok(sisiIds.includes(id), b.id + ' dipakai ' + id));
    assert.ok(b.dipakai.length < sisiIds.length, b.id + ': ada sisi yang tidak memakai bahan');
    assert.equal(luasBahan(b), harap[b.id], b.id + ' luas bahan');
    assert.ok(b.cerita && b.alasan && b.infoLuas && b.bentukAlas && b.satuanLuas);
    /* pengecoh berdiagnosa tersedia & memuat LP utuh */
    const lpUtuh = rinci.reduce((s, f) => s + f.luas, 0);
    const p = E.pengecohSisiDipakai(b.alas, b.t, b.dipakai);
    assert.ok(
      p.some((x) => x.nilai === lpUtuh),
      b.id + ' pengecoh LP utuh'
    );
  });
  assert.equal(E.ukuranAlasPrisma(benda('tenda').alas).sisi[1], 2.5);
});

test('anggaran awal kurang Rp13.000 & penghematan tenda membuatnya cukup', () => {
  const lpC = ukur(D.kemasan.find((p) => p.id === 'C')).lp;
  const luasLembar = D.karton.panjang * D.karton.lebar;
  const lembar = E.banyakWadah(lpC * D.banyakKemasan, luasLembar);
  assert.equal(lpC * D.banyakKemasan, 15600);
  assert.equal(lembar, 6);
  const kaca = E.konversiLuas(luasBahan(benda('etalase')), 'cm²', 'm²');
  assert.equal(kaca, 0.66);
  const cat = E.konversiLuas(luasBahan(benda('meja')), 'cm²', 'm²');
  assert.equal(cat, 3.42);
  const kaleng = E.banyakWadah(cat, D.cat.luasPerKaleng);
  assert.equal(kaleng, 2);
  const baris = [
    { biaya: lembar * D.karton.harga },
    { biaya: luasBahan(benda('tenda')) * D.kain.harga },
    { biaya: E.lppBulat(kaca * D.kaca.harga) },
    { biaya: kaleng * D.cat.harga },
  ];
  assert.deepEqual(
    baris.map((b) => b.biaya),
    [24000, 420000, 99000, 70000]
  );
  const r = E.rekapAnggaran(baris, D.dana);
  assert.equal(r.total, 613000);
  assert.equal(r.sisa, -13000);

  /* penghematan: dinding belakang tenda tanpa kain */
  const h = D.karya.hemat;
  const t = benda(h.benda);
  assert.ok(t.dipakai.includes(h.buang));
  const kainBaru = E.luasSisiDipakai(
    t.alas,
    t.t,
    t.dipakai.filter((x) => x !== h.buang)
  );
  assert.equal(kainBaru, 25);
  baris[1].biaya = kainBaru * D.kain.harga;
  const r2 = E.rekapAnggaran(baris, D.dana);
  assert.equal(r2.total, 568000);
  assert.ok(r2.cukup);
  assert.equal(r2.sisa, 32000);
});

test('orientasi & organisasi: pilihan, pemilahan, rencana', () => {
  const o = D.orientasi;
  assert.ok(o.surat.length >= 4);
  o.surat.forEach((s) => assert.ok(s.judul && s.butir.length));
  o.dugaan.forEach((q) => assertOptions(q.opsi, 'dugaan.' + q.id, 4));
  assertOptions(o.masalahOpsi, 'masalahOpsi', 4);
  assert.ok(ids(o.masalahOpsi).includes(o.masalahCorrect));
  o.masalahOpsi.forEach((x) => assert.ok(o.masalahUmpan[x.id], 'umpan ' + x.id));
  /* setiap dugaan punya tanggapan di tahap evaluasi */
  o.dugaan.forEach((q) =>
    q.opsi.forEach((x) =>
      assert.ok(D.evaluasi.tanggapanDugaan[q.id][x.id], 'tanggapan ' + q.id + '.' + x.id)
    )
  );

  const g = D.organisasi;
  assertOptions(g.peran, 'peran', 3);
  assertSort(g.pilah, g.opsiPilah, 'pilah');
  assertOptions(g.rencana, 'rencana', 4);
});

test('pertanyaan penuntun semua tahap valid', () => {
  assertGuided(D.selidikKemasan.tanya, 'selidikKemasan.tanya');
  assertGuided(D.selidikSisi.tanya, 'selidikSisi.tanya');
  assertGuided(D.selidikBiaya.tanya, 'selidikBiaya.tanya');
  assertGuided(D.karya.tanya, 'karya.tanya');
  assertGuided(D.evaluasi.tanya, 'evaluasi.tanya');
});

test('selidikBiaya: kunci banyak kemasan yang bisa dibuat dari engine', () => {
  const q = D.selidikBiaya.tanya.find((x) => x.id === 'b3');
  assert.equal(String(E.banyakMuat(q.cek.luasTersedia, q.cek.luasSatu)), q.correct);
  assert.equal(q.cek.luasSatu, ukur(D.kemasan.find((p) => p.id === 'C')).lp);
});

test('evaluasi: langkah Kelompok Elang benar/keliru sesuai hitungan', () => {
  const ev = D.evaluasi;
  assertSort(ev.langkah, ev.opsiNilai, 'evaluasi.langkah');
  const lpUtuhTenda = E.rincianSisiPrisma(benda('tenda').alas, benda('tenda').t).reduce(
    (s, f) => s + f.luas,
    0
  );
  assert.equal(lpUtuhTenda, 51);
  assert.equal(E.konversiLuas(6600, 'cm²', 'm²'), 0.66);
  assert.notEqual(E.konversiLuas(34200, 'cm²', 'm²'), 342);
  assert.equal(E.banyakWadah(3.42, 2), 2);
  assert.notEqual(E.banyakWadah(15600, 3000), 5);
});

test('terapkan: kunci & opsi dihitung ulang engine seksi 48', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 8);
  assert.equal(new Set(ids(soal)).size, soal.length);
  soal.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id);
    assert.ok(s.hints && s.hints.length, s.id + ' hints');
    const c = s.cek;
    if (c.alas && c.luasAlas) {
      const u = E.ukuranAlasPrisma(c.alas);
      assert.equal(u.luas, c.luasAlas, s.id + ' luas alas');
      assert.equal(u.keliling, c.kelilingAlas, s.id + ' keliling');
    }
    if (c.jenis === 'wadah' && c.alas) {
      const u = E.ukuranAlasPrisma(c.alas);
      assert.equal(
        E.luasPermukaanPrisma({
          luasAlas: u.luas,
          kelilingAlas: u.keliling,
          tinggi: c.t,
          tanpaTutup: !!c.tanpaTutup,
        }),
        c.luasSatu,
        s.id + ' luas satu benda'
      );
    }
    if (c.sumber) {
      assert.equal(
        E.luasSisiDipakai(c.sumber.alas, c.sumber.t, c.sumber.pakai),
        c.nilai,
        s.id + ' sumber luas'
      );
    }
    const kunci = E.kandidatMasalahLp(c).benar;
    if ((s.type || 'choice') === 'input') {
      assert.equal(s.jawab, kunci, s.id + ' jawab');
      assert.ok(Number.isInteger(s.jawab), s.id + ' jawaban bulat');
      assert.ok(s.satuan, s.id + ' satuan');
      assert.equal(E.diagnosaMasalahLp(c, s.jawab).kode, 'benar', s.id);
    } else {
      assertOptions(s.options, s.id, 4);
      assert.equal(s.correct, 'benar', s.id);
      const satuan = s.options[0].label.split(' ').slice(1).join(' ');
      const engine = E.opsiMasalahLp(c, satuan);
      assert.deepEqual(
        s.options.map((x) => x.id + '|' + x.label),
        engine.map((x) => x.id + '|' + x.label),
        s.id + ' opsi = engine'
      );
    }
  });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 3);
  assert.ok(D.selesai.capaian.length >= 3);
});
