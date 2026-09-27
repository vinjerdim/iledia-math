'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.4/data.js (volume prisma,
 * Discovery Learning): setiap tahap punya kepala DL, setiap daftar
 * pilihan punya id & label unik dan cukup opsi untuk diacak, setiap opsi
 * pertanyaan penuntun punya umpan balik, dan semua kunci jawaban
 * dihitung ulang dengan engine seksi 47 & 54 (ukuranAlasPrisma,
 * volumePrisma, diagnosaVolumePrisma, konversiVolume).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.4/data.js']);
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
    'kubus',
    'lapisan',
    'olah',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k].kicker, k + '.kicker');
    assert.ok(D[k].goal, k + '.goal');
    assert.match(D[k].syntax, /Discovery Learning/, k + '.syntax');
    assert.ok(D[k].guru, k + '.guru');
    assert.ok(D[k].nextLabel, k + '.nextLabel');
  });
});

test('tujuan pembelajaran menyebut rumus volume prisma', () => {
  assert.match(D.stimulasi.tp, /rumus volume prisma/i);
});

test('data prisma: luas alas & volume sesuai rancangan, ukuran bulat', () => {
  assert.equal(new Set(ids(D.prisma)).size, D.prisma.length);
  const harap = {
    teh: { luas: 12, v: 60 },
    gula: { luas: 20, v: 80 },
    kacang: { luas: 12, v: 96 },
    camilan: { luas: 22, v: 110 },
  };
  Object.entries(harap).forEach(([id, h]) => {
    const p = prisma(id);
    const u = E.ukuranAlasPrisma(p.alas);
    assert.equal(u.luas, h.luas, id + ' luas alas');
    assert.equal(E.volumePrismaAlas(p.alas, p.t), h.v, id + ' volume');
    assert.ok(Number.isInteger(p.t), id + ' tinggi bulat (banyak lapisan)');
    u.sisi.forEach((s) => assert.ok(Number.isInteger(s), id + ' sisi bulat'));
    assert.ok(p.nama && p.bentuk && p.infoAlas && p.caraLuasAlas, id);
    if (p.kubus) assert.ok(u.persegiPanjang, id + ' mode kubus harus balok');
  });
});

test('stimulasi & masalah: opsi lengkap, umpan & tanggapan dugaan', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  D.stimulasi.galeri.forEach((id) => prisma(id));
  assertOptions(D.masalah.opsi, 'masalah.opsi', 4);
  assert.ok(ids(D.masalah.opsi).includes(D.masalah.correct));
  D.masalah.opsi.forEach((o) => assert.ok(D.masalah.umpan[o.id], 'umpan ' + o.id));
  D.stimulasi.opsi.forEach((o) =>
    assert.ok(D.generalisasi.tanggapanDugaan[o.id], 'tanggapan dugaan ' + o.id)
  );
});

test('pertanyaan penuntun semua tahap valid', () => {
  assertGuided(D.kubus.tanya, 'kubus.tanya');
  assertGuided(D.lapisan.tanya, 'lapisan.tanya');
  assertGuided(D.olah.konsep, 'olah.konsep');
});

test('lab kubus & lapisan memakai prisma terdaftar dengan mode yang cocok', () => {
  D.kubus.lab.forEach((id) => assert.ok(prisma(id).kubus, id + ' mode kubus'));
  D.lapisan.lab.forEach((id) => assert.ok(!prisma(id).kubus, id + ' mode lapisan'));
  D.olah.prismaIds.forEach((id) => prisma(id));
});

test('belah balok: satu prisma segitiga = ½ balok = luas alas segitiga × tinggi', () => {
  const b = D.lapisan.belah;
  const vBalok = b.p * b.l * b.t;
  const segitiga = [
    [0, 0],
    [b.p, 0],
    [0, b.l],
  ];
  assert.equal(E.volumePrismaAlas(segitiga, b.t), vBalok / 2);
  assert.ok(D.lapisan.hintsBelah.length >= 2);
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
  const vBungkus = v.prisma.bungkus.p * v.prisma.bungkus.l * v.prisma.t;
  const kunci = {
    vBungkus: vBungkus,
    vSetengah: vBungkus / 2,
    luasAlas: u.luas,
    rumus: E.volumePrisma(u.luas, v.prisma.t),
  };
  assert.equal(kunci.vSetengah, kunci.rumus);
  assert.equal(u.luas * 2, v.prisma.bungkus.p * v.prisma.bungkus.l, 'segitiga = ½ persegi panjang');
  [...v.langkahBalok, ...v.langkahRumus].forEach((s) => {
    assert.ok(s.label && s.hints && s.hints.length, s.id);
    assert.ok(Object.prototype.hasOwnProperty.call(kunci, s.kunci), s.id + ' kunci dikenal');
  });
});

test('verifikasi: soal miskonsepsi dengan opsi acak & nilai keliru terdiagnosa', () => {
  const v = D.verifikasi;
  const u = E.ukuranAlasPrisma(v.prisma.alas);
  const o = { luasAlas: u.luas, kelilingAlas: u.keliling, tinggi: v.prisma.t, adaSetengah: true };
  assert.equal(new Set(ids(v.soal)).size, v.soal.length);
  v.soal.forEach((q) => {
    assertOptions(q.options, q.id, 4);
    assert.ok(ids(q.options).includes(q.correct));
    assert.ok(q.explanation);
    if (typeof q.nilaiTeman === 'number') {
      assert.equal(E.diagnosaVolumePrisma(o, q.nilaiTeman).kode, q.miskonsepsi, q.id);
    }
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
    if (c.alas) {
      assert.equal(E.ukuranAlasPrisma(c.alas).luas, c.luasAlas, s.id + ' luas alas');
    }
    let kunci;
    if (c.cari === 'tinggi') kunci = E.tinggiDariVolume(c.volume, c.luasAlas);
    else if (c.cari === 'luasAlas') kunci = E.luasAlasDariVolume(c.volume, c.tinggi);
    else {
      kunci = E.volumePrisma(c.luasAlas, c.tinggi);
      if (c.ke) kunci = E.konversiVolume(kunci, c.dari, c.ke);
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
        .forEach((x) => {
          assert.notEqual(angka(x.label), kunci, s.id + ' pengecoh ' + x.id);
          /* Pengecoh bernama miskonsepsi harus cocok dengan diagnosa engine. */
          const kand = E.kandidatVolumePrisma(c);
          if (!c.ke && kand[x.id] !== undefined) {
            assert.equal(angka(x.label), kand[x.id], s.id + ' nilai ' + x.id);
          }
        });
    }
  });
});

test('refleksi: pertanyaan & opsi penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 3);
  assert.ok(D.selesai.capaian.length >= 3);
});
