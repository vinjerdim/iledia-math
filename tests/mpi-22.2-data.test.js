'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.2/data.js (luas permukaan prisma,
 * Discovery Learning): setiap tahap punya kepala DL, setiap daftar
 * pilihan punya id & label unik dan cukup opsi untuk diacak, setiap opsi
 * pertanyaan penuntun punya umpan balik, dan semua kunci jawaban
 * dihitung ulang dengan engine seksi 47 (ukuranAlasPrisma,
 * luasPermukaanPrisma, diagnosaLuasPermukaan).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.2/data.js']);
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

function prisma(id) {
  const p = D.prisma.find((x) => x.id === id);
  assert.ok(p, 'prisma ' + id);
  return p;
}

function lp(p) {
  const u = E.ukuranAlasPrisma(p.alas);
  return E.luasPermukaanPrisma({ luasAlas: u.luas, kelilingAlas: u.keliling, tinggi: p.t });
}

function angka(label) {
  return Number(
    String(label)
      .replace(/[^\d,]/g, '')
      .replace(',', '.')
  );
}

test('setiap tahap punya kepala Discovery Learning', () => {
  [
    'stimulasi',
    'masalah',
    'bongkar',
    'sabuk',
    'olah',
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

test('tujuan pembelajaran menyebut rumus luas permukaan prisma', () => {
  assert.match(D.stimulasi.tp, /luas permukaan prisma/i);
});

test('data prisma: ukuran bulat sesuai rancangan & nama unik', () => {
  assert.equal(new Set(ids(D.prisma)).size, D.prisma.length);
  const harap = {
    cokelat: { luas: 24, keliling: 24, lp: 336 },
    kue: { luas: 40, keliling: 26, lp: 184 },
    camilan: { luas: 28, keliling: 24, lp: 296 },
  };
  Object.entries(harap).forEach(([id, h]) => {
    const p = prisma(id);
    const u = E.ukuranAlasPrisma(p.alas);
    assert.equal(u.luas, h.luas, id + ' luas alas');
    assert.equal(u.keliling, h.keliling, id + ' keliling alas');
    assert.equal(lp(p), h.lp, id + ' LP');
    assert.ok(p.infoAlas && p.nama);
    u.sisi.forEach((s) => assert.ok(Number.isInteger(s), id + ' sisi bulat'));
  });
  const v = D.verifikasi.prisma;
  assert.equal(E.ukuranAlasPrisma(v.alas).luas, 60);
  assert.equal(E.ukuranAlasPrisma(v.alas).keliling, 36);
  assert.equal(lp(v), 660);
});

test('stimulasi & masalah: opsi lengkap, umpan & tanggapan dugaan', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  assertOptions(D.masalah.opsi, 'masalah.opsi', 4);
  assert.ok(ids(D.masalah.opsi).includes(D.masalah.correct));
  D.masalah.opsi.forEach((o) => assert.ok(D.masalah.umpan[o.id], 'umpan ' + o.id));
  D.stimulasi.opsi.forEach((o) =>
    assert.ok(D.generalisasi.tanggapanDugaan[o.id], 'tanggapan dugaan ' + o.id)
  );
});

test('pertanyaan penuntun semua tahap valid', () => {
  assertGuided(D.bongkar.tanya, 'bongkar.tanya');
  assertGuided(D.sabuk.tanya, 'sabuk.tanya');
  assertGuided(D.olah.konsep, 'olah.konsep');
});

test('bongkar: prisma yang diisi tabelnya ada di lab', () => {
  prisma(D.bongkar.prismaTabel);
  D.bongkar.lab.forEach((id) => prisma(id));
});

test('sabuk & olah memakai prisma yang terdaftar', () => {
  D.sabuk.prismaIds.forEach((id) => prisma(id));
  D.olah.prismaIds.forEach((id) => prisma(id));
});

test('olah: pilah kartu punya kategori valid & penjelasan', () => {
  assertOptions(D.olah.opsiKlas, 'olah.opsiKlas', 2);
  assert.equal(new Set(ids(D.olah.pilah)).size, D.olah.pilah.length);
  assert.ok(D.olah.pilah.length >= 5);
  D.olah.pilah.forEach((it) => {
    assert.ok(ids(D.olah.opsiKlas).includes(it.correct), it.id);
    assert.ok(it.teks && it.explanation, it.id);
  });
});

test('verifikasi: langkah dihitung ulang & kedua cara sama', () => {
  const v = D.verifikasi;
  const u = E.ukuranAlasPrisma(v.prisma.alas);
  const rinci = E.rincianSisiPrisma(v.prisma.alas, v.prisma.t);
  const selimut = rinci.filter((f) => f.jenis === 'tegak').reduce((s, f) => s + f.luas, 0);
  const kunci = {
    luasAlas: u.luas,
    selimutSatuSatu: selimut,
    jumlahSemua: 2 * u.luas + selimut,
    keliling: u.keliling,
    rumus: E.luasPermukaanPrisma({
      luasAlas: u.luas,
      kelilingAlas: u.keliling,
      tinggi: v.prisma.t,
    }),
  };
  assert.equal(kunci.jumlahSemua, kunci.rumus);
  [...v.langkahJumlah, ...v.langkahRumus].forEach((s) => {
    assert.ok(s.label && s.hints && s.hints.length, s.id);
    assert.ok(Object.prototype.hasOwnProperty.call(kunci, s.kunci), s.id + ' kunci dikenal');
  });
});

test('verifikasi: soal miskonsepsi dengan opsi acak & nilai keliru terdiagnosa', () => {
  const v = D.verifikasi;
  const u = E.ukuranAlasPrisma(v.prisma.alas);
  const o = { luasAlas: u.luas, kelilingAlas: u.keliling, tinggi: v.prisma.t };
  assert.equal(new Set(ids(v.soal)).size, v.soal.length);
  v.soal.forEach((q) => {
    assertOptions(q.options, q.id, 4);
    assert.ok(ids(q.options).includes(q.correct));
    assert.ok(q.explanation);
    assert.notEqual(E.diagnosaLuasPermukaan(o, q.nilaiTeman).kode, 'benar', q.id);
    assert.equal(E.diagnosaLuasPermukaan(o, q.nilaiTeman).kode, q.miskonsepsi, q.id);
  });
});

test('generalisasi: kunci kalimat ada di bank dan tidak dipakai ganda', () => {
  const g = D.generalisasi;
  assertOptions(g.bank, 'generalisasi.bank', g.kalimat.length + 2);
  const kunci = g.kalimat.map((k) => k.correct);
  assert.equal(new Set(kunci).size, kunci.length);
  kunci.forEach((c) => assert.ok(ids(g.bank).includes(c), c));
});

test('terapkan: kunci dihitung ulang engine & opsi pilihan ganda berpengecoh', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 8);
  assert.equal(new Set(ids(soal)).size, soal.length);
  soal.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id);
    assert.ok(s.hints && s.hints.length, s.id + ' hints');
    const c = s.cek;
    const o = {
      luasAlas: c.luasAlas,
      kelilingAlas: c.kelilingAlas,
      tinggi: c.tinggi,
      tanpaTutup: !!c.tanpaTutup,
    };
    if (c.alas) {
      const u = E.ukuranAlasPrisma(c.alas);
      assert.equal(u.luas, c.luasAlas, s.id + ' luas alas');
      assert.equal(u.keliling, c.kelilingAlas, s.id + ' keliling');
    }
    let kunci;
    if (c.cari === 'tinggi') {
      kunci = E.tinggiDariLuasPermukaan(c.luasPermukaan, c.luasAlas, c.kelilingAlas);
    } else {
      kunci = E.luasPermukaanPrisma(o);
      if (c.hargaPerCm2) kunci *= c.hargaPerCm2;
    }
    if ((s.type || 'choice') === 'input') {
      assert.equal(s.jawab, kunci, s.id + ' jawab');
      assert.ok(Number.isInteger(s.jawab), s.id + ' jawaban bulat');
      assert.ok(s.satuan, s.id + ' satuan');
    } else {
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id);
      if (c.cari === 'rumus') return;
      const benar = s.options.find((x) => x.id === s.correct);
      assert.equal(angka(benar.label), kunci, s.id + ' opsi benar');
      s.options
        .filter((x) => x.id !== s.correct)
        .forEach((x) => assert.notEqual(angka(x.label), kunci, s.id + ' pengecoh ' + x.id));
    }
  });
});

test('refleksi: pertanyaan & opsi penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 3);
  assert.ok(D.selesai.capaian.length >= 3);
});
