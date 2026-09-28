'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.10/data.js (masalah kontekstual
 * gabungan luas permukaan & volume prisma dan limas, Problem Based
 * Learning): setiap tahap punya kepala PBL, setiap daftar pilihan punya
 * id & label unik dan cukup opsi untuk diacak, setiap opsi pertanyaan
 * penuntun punya umpan balik, dan semua kunci (volume & hari tiga desain,
 * sisi pelat, luas pelat, lembar & kaleng, waktu isi, anggaran, keputusan
 * tandon C, lembar kerja Kelompok Kenari, soal uji terap) dihitung ulang
 * dengan engine seksi 48, 55, 58, dan 60.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.10/data.js']);
const D = E.DATA;

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function dekat(a, b) {
  return Math.abs(a - b) < 1e-4;
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

function desain(id) {
  const d = D.desain.find((x) => x.id === id);
  assert.ok(d, 'desain ' + id);
  return d;
}

function liter(d) {
  return E.konversiVolume(E.volumeGabungan(d.bangun).total, 'cm3', 'l');
}

function benda(id) {
  const b = D.benda.find((x) => x.id === id);
  assert.ok(b, 'benda ' + id);
  return b;
}

test('setiap tahap punya kepala PBL', () => {
  [
    'orientasi',
    'organisasi',
    'selidikIsi',
    'selidikPelat',
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

test('tujuan pembelajaran: masalah kontekstual gabungan prisma & limas', () => {
  assert.match(D.orientasi.tp, /masalah kontekstual gabungan/i);
  assert.match(D.orientasi.tp, /luas permukaan dan volume prisma dan limas/i);
  assert.ok(D.orientasi.kriteria.length >= 3);
});

test('desain: volume, liter, & hari tiga tandon; hanya B dan C cukup', () => {
  assert.deepEqual(ids(D.desain), ['A', 'B', 'C']);
  const harap = {
    A: { v: 1440000, l: 1440, hari: 5 },
    B: { v: 1824000, l: 1824, hari: 7 },
    C: { v: 2016000, l: 2016, hari: 8 },
  };
  D.desain.forEach((d) => {
    assert.equal(E.volumeGabungan(d.bangun).total, harap[d.id].v, d.id + ' volume');
    assert.equal(liter(d), harap[d.id].l, d.id + ' liter');
    assert.equal(E.banyakMuat(liter(d), D.target.perHari), harap[d.id].hari, d.id + ' hari');
    assert.equal(d.bangun.satuan, 'cm');
    assert.deepEqual(Object.assign({}, d.bangun.alas), { n: 4, s: 120 });
    assert.ok(d.nama && d.gaya && d.info, d.id + ' teks');
  });
  assert.ok(desain('B').bangun.limas && desain('B').bangun.limas.posisi === 'bawah');
  /* corong: tripel Pythagoras (60, 80, 100) */
  assert.equal(E.tinggiSisiTegakLimas(desain('B').bangun.limas.t, 60), 100);
  const cukup = D.desain.filter((d) => E.banyakMuat(liter(d), D.target.perHari) >= D.target.hari);
  assert.deepEqual(ids(cukup), ['B', 'C']);
  const k1 = D.selidikIsi.tanya.find((q) => q.id === 'k1');
  assert.equal(k1.correct, 'bc');
});

test('benda: sisi pelat valid, luas pelat B < C, B dipilih', () => {
  assert.deepEqual(ids(D.benda), ['B', 'C']);
  const harap = { B: 86400, C: 96000 };
  D.benda.forEach((b) => {
    assert.equal(b.bangun, desain(b.id).bangun, b.id + ' bangun = desain');
    const rinci = E.rincianSisiGabungan(b.bangun, { sambung: true });
    const sisiIds = Array.from(rinci, (f) => f.id);
    assert.deepEqual(Object.keys(b.namaSisi).sort(), sisiIds.slice().sort(), b.id + ' namaSisi');
    assert.equal(new Set(Object.values(b.namaSisi)).size, sisiIds.length, b.id + ' nama unik');
    b.dipakai.forEach((id) => assert.ok(sisiIds.includes(id), b.id + ' dipakai ' + id));
    assert.equal(E.luasSisiGabungan(b.bangun, b.dipakai), harap[b.id], b.id + ' luas pelat');
    assert.equal(E.luasPermukaanGabungan(b.bangun), harap[b.id], b.id + ' = permukaan luar');
    assert.ok(b.cerita && b.alasan && b.bahan && b.nama, b.id + ' teks');
    assert.ok(!b.dipakai.some((id) => id.indexOf('sambung') === 0), b.id + ' tanpa sambung');
  });
  assert.equal(D.desainDipilih, 'B');
  const s3 = D.selidikPelat.tanya.find((q) => q.id === 's3');
  assert.equal(s3.correct, D.desainDipilih);
});

test('anggaran: B Rp830.000 (sisa Rp70.000); C Rp950.000 (kurang Rp50.000)', () => {
  const luasLembar = D.pelat.panjang * D.pelat.lebar;
  assert.equal(luasLembar, 18000);
  function rekap(id) {
    const luas = E.luasSisiGabungan(benda(id).bangun, benda(id).dipakai);
    const lembar = E.banyakWadah(luas, luasLembar);
    const m2 = E.konversiLuas(luas, 'cm²', 'm²');
    const kaleng = E.banyakWadah(m2, D.cat.luas);
    const baris = [
      { biaya: lembar * D.pelat.harga },
      { biaya: kaleng * D.cat.harga },
      { biaya: D.keran.harga },
    ];
    return { lembar, m2, kaleng, r: E.rekapAnggaran(baris, D.dana) };
  }
  const b = rekap('B');
  assert.equal(b.lembar, 5);
  assert.equal(b.m2, 8.64);
  assert.equal(b.kaleng, 3);
  assert.equal(b.r.total, 830000);
  assert.ok(b.r.cukup);
  assert.equal(b.r.sisa, 70000);
  const c = rekap('C');
  assert.equal(c.lembar, 6);
  assert.equal(c.kaleng, 3);
  assert.equal(c.r.total, 950000);
  assert.ok(!c.r.cukup);
  assert.equal(c.r.sisa, -50000);
  const p1 = D.karya.tanya.find((q) => q.id === 'p1');
  assert.equal(p1.correct, 'kurang');
  /* waktu isi dari talang */
  assert.equal(E.waktuIsi(liter(desain('B')), D.debitTalang), 152);
  assert.equal(E.formatDurasi(152), '2 jam 32 menit');
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
  assertGuided(D.selidikIsi.tanya, 'selidikIsi.tanya');
  assertGuided(D.selidikPelat.tanya, 'selidikPelat.tanya');
  assertGuided(D.selidikBiaya.tanya, 'selidikBiaya.tanya');
  assertGuided(D.karya.tanya, 'karya.tanya');
  assertGuided(D.evaluasi.tanya, 'evaluasi.tanya');
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
});

test('evaluasi: langkah Kelompok Kenari benar/keliru sesuai hitungan', () => {
  const ev = D.evaluasi;
  assertSort(ev.langkah, ev.opsiNilai, 'evaluasi.langkah');
  ev.langkah.forEach((l) => {
    assert.ok(l.cek, l.id + ' cek');
    const benar = E.kandidatMasalahGabungan(l.cek).benar;
    assert.equal(
      dekat(benar, l.nilai),
      l.correct === 'benar',
      l.id + ': nilai ' + l.nilai + ' vs engine ' + benar
    );
    if (l.correct === 'keliru') {
      /* setiap kekeliruan terdiagnosa engine (bukan sekadar salah hitung) */
      assert.notEqual(
        E.diagnosaMasalahGabungan(l.cek, l.nilai).kode,
        'salah-hitung',
        l.id + ' terdiagnosa'
      );
    }
  });
});

test('terapkan: kunci & opsi dihitung ulang engine seksi 60', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 8);
  assert.equal(new Set(ids(soal)).size, soal.length);
  const jenis = new Set();
  let pilihan = 0;
  soal.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id);
    assert.ok(s.hints && s.hints.length, s.id + ' hints');
    const c = s.cek;
    jenis.add(c.jenis);
    const k = E.kandidatMasalahGabungan(c);
    if (c.sumber) {
      /* ukuran di cek konsisten dengan bangun sumbernya */
      const sb = c.sumber;
      if (c.jenis === 'waktu' || c.jenis === 'muat') {
        const l = E.konversiVolume(E.volumeGabungan(sb.bangun).total, 'cm3', 'l');
        assert.equal(l, c.jenis === 'waktu' ? c.volume : c.volume, s.id + ' volume');
      }
      if (c.jenis === 'biayaWadah') {
        assert.equal(E.luasSisiGabungan(sb.bangun, sb.pakai), c.luas, s.id + ' luas');
      }
      if (c.jenis === 'ts') {
        assert.equal(E.tinggiSisiTegakLimas(sb.t, sb.s / 2), k.benar, s.id + ' tₛ');
        assert.equal(c.a, sb.s / 2, s.id + ' a');
      }
    }
    if (s.type === 'input') {
      assert.ok(dekat(k.benar, s.jawab), s.id + ' jawab = engine');
      assert.ok(Number.isInteger(s.jawab), s.id + ' isian bilangan bulat');
      assert.ok(s.satuan, s.id + ' satuan');
    } else {
      pilihan += 1;
      assertOptions(s.options, s.id + '.options', 4);
      assert.equal(s.correct, 'benar');
      const opsi = E.opsiMasalahGabungan(c, s.satuanOpsi, { awalan: s.awalan });
      s.options.forEach((o) => {
        const e = opsi.find((x) => x.id === o.id);
        assert.ok(e, s.id + ': opsi ' + o.id + ' dari engine');
        assert.equal(o.label, e.label, s.id + ': label ' + o.id);
      });
    }
  });
  assert.ok(pilihan >= 3, 'ada soal pilihan ganda');
  ['volume', 'luas', 'ts', 'waktu', 'biayaWadah', 'muat'].forEach((j) =>
    assert.ok(jenis.has(j), 'jenis soal ' + j)
  );
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  D.refleksi.pertanyaan.forEach((q) => assert.ok(q.id && q.teks && q.placeholder));
  assert.ok(D.selesai.judul && D.selesai.capaian.length >= 3);
});
