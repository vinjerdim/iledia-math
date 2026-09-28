'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.9/data.js (volume limas,
 * Discovery Learning): setiap tahap punya kepala DL, setiap daftar
 * pilihan punya id & label unik dan cukup opsi untuk diacak, setiap opsi
 * pertanyaan penuntun punya umpan balik, dan semua kunci jawaban
 * dihitung ulang dengan engine seksi 59 (volumeLimas, belahKubusLimas,
 * kandidatVolumeLimas, diagnosaVolumeLimas) serta seksi 54/57.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.9/data.js']);
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

function limas(id) {
  const b = D.limas.find((x) => x.id === id);
  assert.ok(b, 'limas ' + id);
  return b;
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
    'tuang',
    'belah',
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

test('tujuan pembelajaran menyebut rumus volume limas', () => {
  assert.match(D.stimulasi.tp, /rumus volume limas/i);
});

test('data limas: luas alas sesuai cara hitung & volume = ⅓ prisma', () => {
  assert.equal(new Set(ids(D.limas)).size, D.limas.length);
  assert.equal(new Set(D.limas.map((b) => b.nama)).size, D.limas.length);
  const harap = { persegi: 108, segitiga: 48, persegipanjang: 80, besar: 480 };
  Object.entries(harap).forEach(([id, v]) => {
    const b = limas(id);
    assert.equal(E.volumeLimasAlas(b.alas, b.t), v, id);
    assert.equal(E.volumePrismaAlas(b.alas, b.t), 3 * v, id + ' prisma pasangan');
    assert.ok(b.caraLuasAlas && b.infoAlas && b.bentuk, id + ' teks');
    assert.ok(Number.isInteger(b.t) && b.t > 0, id + ' tinggi bulat');
  });
  /* Alas segitiga ditandai agar pengecoh "lupa ½" ikut dibuat. */
  assert.equal(limas('segitiga').adaSetengah, true);
});

test('stimulasi & masalah: opsi unik, umpan & tanggapan dugaan lengkap', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  assertOptions(D.masalah.opsi, 'masalah.opsi', 4);
  assert.ok(ids(D.masalah.opsi).includes(D.masalah.correct));
  D.masalah.opsi.forEach((o) => assert.ok(D.masalah.umpan[o.id], 'umpan ' + o.id));
  D.stimulasi.opsi.forEach((o) =>
    assert.ok(D.generalisasi.tanggapanDugaan[o.id], 'tanggapan dugaan ' + o.id)
  );
  assert.ok(ids(D.stimulasi.opsi).includes(D.stimulasi.dugaanTepat));
});

test('tuang: tiga pasangan berbeda bentuk alas & pertanyaan penuntun', () => {
  assert.equal(D.tuang.lab.length, 3);
  const bentuk = new Set(D.tuang.lab.map((id) => limas(id).alas.length + '-' + limas(id).bentuk));
  assert.equal(bentuk.size, 3, 'bentuk alas berbeda-beda');
  assertGuided(D.tuang.tanya, 'tuang.tanya');
  assert.ok(D.tuang.temuan && D.tuang.syaratLab);
});

test('belah: kubus dibelah menjadi 6 limas, kunci dari engine', () => {
  const k = D.belah.kubus;
  assert.ok(k.s > 0 && k.nama);
  const b = E.belahKubusLimas(k.s);
  assert.equal(b.volumeKubus, 216);
  assert.equal(b.volumeLimas, 36);
  assert.equal(b.tinggi, 3);
  assert.equal(b.luasAlasKaliTinggi / b.volumeLimas, 3);
  assertGuided(D.belah.tanya, 'belah.tanya');
  assert.ok(D.belah.temuan);
});

test('olah: tiga kartu data, pertanyaan pola, dan kartu pilah', () => {
  assert.equal(D.olah.limasIds.length, 3);
  D.olah.limasIds.forEach((id) => limas(id));
  assertGuided(D.olah.konsep, 'olah.konsep');
  assertOptions(D.olah.opsiKlas, 'olah.opsiKlas', 2);
  assertOptions(D.olah.pilah, 'olah.pilah', 6);
  D.olah.pilah.forEach((p) => {
    assert.ok(ids(D.olah.opsiKlas).includes(p.correct), p.id);
    assert.ok(p.explanation, p.id + '.explanation');
  });
  assert.equal(new Set(D.olah.pilah.map((p) => p.correct)).size, 2, 'kedua kelas terisi');
});

test('verifikasi: kunci langkah dihitung ulang & miskonsepsi sesuai diagnosa', () => {
  const V = D.verifikasi;
  const b = V.limas;
  const a = E.apotemaAlas(b.n, b.s);
  const t = E.tinggiLimasDariSisiTegak(b.ts, a);
  assert.equal(t, 8);
  const u = E.ukuranAlasPrisma(E.alasLimasBeraturan(b.n, b.s));
  const kunci = {
    apotema: a,
    tinggi: t,
    luasAlas: u.luas,
    volumePrisma: E.volumePrisma(u.luas, t),
    volume: E.volumeLimas(u.luas, t),
  };
  assert.equal(kunci.volume, 384);
  assert.equal(kunci.volumePrisma / 3, kunci.volume);
  V.langkahTinggi
    .concat(V.langkahPrisma, V.langkahRumus)
    .forEach((s) => assert.ok(s.kunci in kunci, s.id + ': kunci ' + s.kunci));
  const o = { luasAlas: u.luas, tinggi: t, tinggiSisi: b.ts };
  V.soal.forEach((q) => {
    assertOptions(q.options, q.id + '.options', 4);
    assert.ok(ids(q.options).includes(q.correct));
    assert.ok(q.explanation);
    assert.equal(E.diagnosaVolumeLimas(o, q.nilaiTeman).kode, q.miskonsepsi, q.id);
  });
});

test('generalisasi: setiap kalimat punya potongan benar di bank', () => {
  const G = D.generalisasi;
  assertOptions(G.bank, 'generalisasi.bank', G.kalimat.length + 2);
  const bankIds = ids(G.bank);
  G.kalimat.forEach((k) => assert.ok(bankIds.includes(k.correct), k.id));
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  assert.ok(G.rangkuman.length >= 3);
});

test('uji terap: 8 soal, kunci dihitung ulang dengan engine', () => {
  const S = D.terapkan.soal;
  assert.equal(S.length, 8);
  assert.equal(new Set(ids(S)).size, S.length);
  const jenis = new Set(S.map((s) => s.type || 'choice'));
  assert.ok(jenis.has('input') && jenis.has('choice'), 'campuran isian & pilihan');
  S.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id);
    const c = s.cek;
    if (c.alas) assert.equal(E.ukuranAlasPrisma(c.alas).luas, c.luasAlas, s.id + ' luas alas');
    if (typeof c.tinggiSisi === 'number' && typeof c.sisiAlas === 'number') {
      assert.equal(E.tinggiLimasDariSisiTegak(c.tinggiSisi, c.sisiAlas / 2), c.tinggi, s.id);
    }
    let harap;
    if (c.cari === 'tinggi') harap = E.tinggiLimasDariVolume(c.volume, c.luasAlas);
    else if (c.cari === 'dariPrisma') harap = c.volumePrisma / 3;
    else {
      harap = E.volumeLimas(c.luasAlas, c.tinggi);
      if (c.keLiter) harap = E.konversiVolume(harap, 'cm3', 'l');
    }
    if ((s.type || 'choice') === 'input') {
      assert.ok(typeof s.jawab === 'number' && s.satuan, s.id + ' jawab & satuan');
      assert.ok(Number.isInteger(s.jawab), s.id + ' jawaban bulat');
      assert.equal(s.jawab, harap, s.id);
    } else {
      assertOptions(s.options, s.id + '.options', 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ' correct');
      assert.equal(angka(s.options.find((o) => o.id === s.correct).label), harap, s.id);
      if (!c.cari) {
        const k = E.kandidatVolumeLimas(c);
        s.options.forEach((o) => {
          assert.ok(k[o.id] !== undefined, s.id + '.' + o.id + ' kode miskonsepsi');
          assert.equal(angka(o.label), k[o.id], s.id + '.' + o.id);
        });
      }
      assert.equal(new Set(s.options.map((o) => angka(o.label))).size, s.options.length);
    }
  });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.ok(D.selesai.judul && D.selesai.capaian.length >= 3);
});
