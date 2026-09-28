'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.5/data.js (masalah kontekstual
 * volume prisma, Problem Based Learning): setiap tahap punya kepala
 * PBL, setiap daftar pilihan punya id & label unik dan cukup opsi untuk
 * diacak, setiap opsi pertanyaan penuntun punya umpan balik, dan semua
 * kunci (volume tiga desain kolam, banyak ikan, liter, isi ulang
 * tandon, waktu pompa, biaya, tinggi air bak, soal uji terap) dihitung
 * ulang dengan engine seksi 47, 54, dan 55.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.5/data.js']);
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

function kolam(id) {
  const k = D.kolam.find((x) => x.id === id);
  assert.ok(k, 'kolam ' + id);
  return k;
}

function volumeKolam(k) {
  return E.volumePrismaAlas(k.penampang, k.panjang);
}

test('setiap tahap punya kepala PBL', () => {
  [
    'orientasi',
    'organisasi',
    'selidikKolam',
    'selidikIsi',
    'selidikAir',
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

test('tujuan pembelajaran: masalah kontekstual volume prisma', () => {
  assert.match(D.orientasi.tp, /masalah kontekstual/i);
  assert.match(D.orientasi.tp, /volume prisma/i);
  assert.ok(D.orientasi.kriteria.length >= 3);
});

test('kolam: volume, banyak ikan, dan hanya kolam B yang memenuhi', () => {
  assert.deepEqual(ids(D.kolam), ['A', 'B', 'C']);
  const harapV = { A: 6, B: 8.8, C: 7.2 };
  const harapLa = { A: 3, B: 4.4, C: 1.8 };
  const harapIkan = { A: 150, B: 220, C: 180 };
  D.kolam.forEach((k) => {
    const u = E.ukuranAlasPrisma(k.penampang);
    assert.equal(u.luas, harapLa[k.id], k.id + ' luas alas');
    assert.equal(volumeKolam(k), harapV[k.id], k.id + ' volume');
    assert.equal(
      E.banyakMuatKepadatan(volumeKolam(k), D.kepadatan),
      harapIkan[k.id],
      k.id + ' ikan'
    );
    assert.ok(k.nama && k.bentuk && k.info && k.infoAlas && k.caraLuasAlas, k.id + ' teks');
    assert.equal(typeof k.adaSetengah, 'boolean');
    /* kolam muat di lahan */
    const xs = k.penampang.map((q) => q[0]);
    const lebarX = Math.max(...xs) - Math.min(...xs);
    const tapak = [lebarX, k.panjang].sort((a, b) => a - b);
    const lahan = [D.lahan.panjang, D.lahan.lebar].sort((a, b) => a - b);
    assert.ok(tapak[0] <= lahan[0] && tapak[1] <= lahan[1], k.id + ' muat di lahan');
  });
  const memenuhi = D.kolam.filter(
    (k) => E.banyakMuatKepadatan(volumeKolam(k), D.kepadatan) >= D.kebutuhanIkan
  );
  assert.deepEqual(ids(memenuhi), ['B']);
  const k1 = D.selidikKolam.tanya.find((q) => q.id === 'k1');
  assert.equal(k1.correct, 'B');
  /* lupa ½ membuat kolam C tampak paling besar */
  const c = kolam('C');
  assert.ok(c.adaSetengah);
  assert.equal(2 * volumeKolam(c), 14.4);
});

test('pengisian: liter, isi ulang tandon, waktu pompa, biaya PDAM, anggaran', () => {
  const vB = volumeKolam(kolam('B'));
  const liter = E.konversiVolume(vB, 'm3', 'l');
  assert.equal(liter, 8800);
  const tandonM3 = E.volumePrismaAlas(D.tandon.alas, D.tandon.t);
  assert.equal(tandonM3, 2);
  const tandonL = E.konversiVolume(tandonM3, 'm3', 'l');
  assert.equal(tandonL, 2000);
  assert.equal(E.banyakWadah(liter, tandonL), 5);
  const menit = E.waktuIsi(liter, D.pompa.debit);
  assert.equal(menit, 440);
  assert.equal(E.formatDurasi(menit), '7 jam 20 menit');
  assert.ok(menit > D.pompa.batasMenit, 'pompa melebihi jam sekolah → perlu keputusan');
  const biaya = E.kandidatMasalahVolume({
    jenis: 'biaya',
    kebutuhan: vB,
    tersedia: tandonM3,
    harga: D.pdam.harga,
  }).benar;
  assert.equal(biaya, 34000);
  const r = E.rekapAnggaran([{ biaya: biaya }, { biaya: D.bibit.banyak * D.bibit.harga }], D.dana);
  assert.equal(r.total, 94000);
  assert.ok(r.cukup);
  assert.equal(r.sisa, 6000);
  assert.equal(D.bibit.banyak, D.kebutuhanIkan);
});

test('bak karantina: luas alas, tinggi air untuk target, persen isi', () => {
  const b = D.bak;
  const la = E.ukuranAlasPrisma(b.alas).luas;
  assert.equal(la, 1500);
  const target = E.konversiVolume(D.targetLiter, 'l', 'cm3');
  assert.equal(target, 60000);
  const h = E.tinggiDariVolume(target, la);
  assert.equal(h, 40);
  assert.ok(Number.isInteger(h) && h <= b.t);
  assert.equal(E.volumeAir(b.alas, b.t), 75000);
  assert.equal(E.persenIsi(target, 75000), 80);
  assert.ok(b.nama && b.info);
});

test('orientasi & organisasi: pilihan, pemilahan, rencana', () => {
  const o = D.orientasi;
  assert.ok(o.surat.length >= 4);
  o.surat.forEach((s) => assert.ok(s.judul && s.butir.length));
  o.dugaan.forEach((q) => assertOptions(q.opsi, 'dugaan.' + q.id, 4));
  assertOptions(o.masalahOpsi, 'masalahOpsi', 4);
  assert.ok(ids(o.masalahOpsi).includes(o.masalahCorrect));
  o.masalahOpsi.forEach((x) => assert.ok(o.masalahUmpan[x.id], 'umpan ' + x.id));
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
  assertGuided(D.selidikKolam.tanya, 'selidikKolam.tanya');
  assertGuided(D.selidikIsi.tanya, 'selidikIsi.tanya');
  assertGuided(D.selidikAir.tanya, 'selidikAir.tanya');
  assertGuided(D.karya.tanya, 'karya.tanya');
  assertGuided(D.evaluasi.tanya, 'evaluasi.tanya');
});

test('evaluasi: langkah Kelompok Cupang benar/keliru sesuai hitungan', () => {
  const ev = D.evaluasi;
  assertSort(ev.langkah, ev.opsiNilai, 'evaluasi.langkah');
  assert.ok(ev.langkah.filter((x) => x.correct === 'keliru').length >= 3);
  assert.notEqual(E.konversiVolume(8.8, 'm3', 'l'), 880);
  assert.notEqual(E.banyakWadah(8800, 2000), 4);
  assert.equal(E.volumePrismaAlas(kolam('B').penampang, kolam('B').panjang), 8.8);
});

test('terapkan: kunci & opsi dihitung ulang engine seksi 55', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 8);
  assert.equal(new Set(ids(soal)).size, soal.length);
  soal.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id);
    assert.ok(s.hints && s.hints.length, s.id + ' hints');
    const c = s.cek;
    if (c.alas) {
      const u = E.ukuranAlasPrisma(c.alas);
      assert.equal(u.luas, c.luasAlas, s.id + ' luas alas');
      if (typeof c.kelilingAlas === 'number') {
        assert.equal(u.keliling, c.kelilingAlas, s.id + ' keliling');
      }
    }
    if (c.sumber) {
      let v = E.volumePrismaAlas(c.sumber.alas, c.sumber.t);
      if (c.sumber.dari) v = E.konversiVolume(v, c.sumber.dari, c.sumber.ke);
      assert.equal(v, c[c.sumber.kunci], s.id + ' sumber ' + c.sumber.kunci);
    }
    const kunci = E.kandidatMasalahVolume(c).benar;
    if ((s.type || 'choice') === 'input') {
      assert.equal(s.jawab, kunci, s.id + ' jawab');
      assert.ok(Number.isInteger(s.jawab), s.id + ' jawaban bulat');
      assert.ok(s.satuan, s.id + ' satuan');
      assert.equal(E.diagnosaMasalahVolume(c, s.jawab).kode, 'benar', s.id);
    } else {
      assertOptions(s.options, s.id, 4);
      assert.equal(s.correct, 'benar', s.id);
      const engine = E.opsiMasalahVolume(c, s.satuanOpsi || '', { awalan: s.awalan });
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
