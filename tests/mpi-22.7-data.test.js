'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.7/data.js (luas permukaan limas,
 * Discovery Learning): setiap tahap punya kepala DL, setiap daftar
 * pilihan punya id & label unik dan cukup opsi untuk diacak, setiap opsi
 * pertanyaan penuntun punya umpan balik, dan semua kunci jawaban
 * dihitung ulang dengan engine seksi 57 (luasPermukaanLimas,
 * rincianSisiLimas, kandidatLuasPermukaanLimas, susunSisiTegakLimas).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.7/data.js']);
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

/* Alas & tₛ sesuai bentuk (persegi panjang atau segi-n beraturan). */
function ukur(b) {
  const pts = b.p
    ? [
        [0, 0],
        [b.p, 0],
        [b.p, b.l],
        [0, b.l],
      ]
    : E.alasLimasBeraturan(b.n, b.s);
  const ts = b.p ? E.tinggiSisiLimasPersegiPanjang(b.p, b.l, b.t) : b.ts;
  const r = E.rincianSisiLimas(pts, ts);
  return { u: E.ukuranAlasPrisma(pts), r, lp: E.luasPermukaanLimasUmum(r) };
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
    'susun',
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

test('tujuan pembelajaran menyebut rumus luas permukaan limas', () => {
  assert.match(D.stimulasi.tp, /rumus luas permukaan limas/i);
});

test('data limas: tₛ konsisten dengan tinggi limas (Pythagoras) & luas permukaan', () => {
  assert.equal(new Set(ids(D.limas)).size, D.limas.length);
  assert.equal(new Set(D.limas.map((b) => b.nama)).size, D.limas.length);
  const harap = { persegi: 360, kecil: 96, tenda: 564 };
  Object.entries(harap).forEach(([id, lp]) => assert.equal(ukur(limas(id)).lp, lp, id));
  D.limas.forEach((b) => {
    if (b.p) return;
    assert.ok(b.n >= 3 && b.s > 0 && b.ts > 0, b.id);
    if (typeof b.t === 'number') {
      assert.equal(E.tinggiSisiTegakLimas(b.t, E.apotemaAlas(b.n, b.s)), b.ts, b.id + ' tₛ');
    }
  });
  const tenda = limas('tenda');
  assert.deepEqual(
    [...E.tinggiSisiLimasPersegiPanjang(tenda.p, tenda.l, tenda.t)],
    [13, 15, 13, 15]
  );
});

test('stimulasi & masalah: opsi unik, masalah punya umpan untuk setiap opsi', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi', 4);
  assertOptions(D.masalah.opsi, 'masalah.opsi', 4);
  assert.ok(ids(D.masalah.opsi).includes(D.masalah.correct));
  D.masalah.opsi.forEach((o) => assert.ok(D.masalah.umpan[o.id], 'umpan ' + o.id));
  D.stimulasi.opsi.forEach((o) =>
    assert.ok(D.generalisasi.tanggapanDugaan[o.id], 'tanggapan dugaan ' + o.id)
  );
});

test('bongkar: lab memakai limas beraturan & kunci jumlah luas sisi', () => {
  D.bongkar.lab.forEach((id) => assert.ok(!limas(id).p, id + ' beraturan'));
  assert.ok(D.bongkar.lab.includes(D.bongkar.limasTabel));
  assert.equal(ukur(limas(D.bongkar.limasTabel)).lp, 360);
  assertGuided(D.bongkar.tanya, 'bongkar.tanya');
  assert.match(D.bongkar.temuan, /360/);
});

test('susun: jumlah sisi sejajar = keliling alas, luas = ½ × K × tₛ', () => {
  const harap = { segitiga: 72, persegi: 260, segienam: 84 };
  D.susun.limasIds.forEach((id) => {
    const b = limas(id);
    const z = E.susunSisiTegakLimas(b.n, b.s, b.ts);
    assert.equal(z.bawah + z.atas, b.n * b.s);
    assert.equal(z.luas, harap[id], id);
  });
  assertGuided(D.susun.tanya, 'susun.tanya');
});

test('olah: tiga kartu data, pertanyaan pola, dan kartu pilah', () => {
  assert.equal(D.olah.limasIds.length, 3);
  assert.ok(
    D.olah.limasIds.some((id) => limas(id).p),
    'ada limas persegi panjang'
  );
  assertGuided(D.olah.konsep, 'olah.konsep');
  assertOptions(D.olah.opsiKlas, 'olah.opsiKlas', 2);
  assertOptions(D.olah.pilah, 'olah.pilah', 6);
  D.olah.pilah.forEach((p) => {
    assert.ok(ids(D.olah.opsiKlas).includes(p.correct), p.id);
    assert.ok(p.explanation, p.id + '.explanation');
  });
  const klas = new Set(D.olah.pilah.map((p) => p.correct));
  assert.equal(klas.size, 2, 'kedua kelas terisi');
});

test('verifikasi: kunci langkah dihitung ulang & miskonsepsi sesuai diagnosa', () => {
  const V = D.verifikasi;
  const b = V.limas;
  const a = E.apotemaAlas(b.n, b.s);
  const ts = E.tinggiSisiTegakLimas(b.t, a);
  assert.equal(ts, 17);
  const u = E.ukuranAlasPrisma(E.alasLimasBeraturan(b.n, b.s));
  const kunci = {
    apotema: a,
    tinggiSisi: ts,
    luasAlas: u.luas,
    luasSatuSisi: (b.s * ts) / 2,
    jumlahSemua: u.luas + (b.n * b.s * ts) / 2,
    keliling: u.keliling,
    rumus: E.luasPermukaanLimas({ luasAlas: u.luas, kelilingAlas: u.keliling, tinggiSisi: ts }),
  };
  assert.equal(kunci.rumus, 800);
  assert.equal(kunci.jumlahSemua, kunci.rumus);
  V.langkahTinggi
    .concat(V.langkahJumlah, V.langkahRumus)
    .forEach((s) => assert.ok(s.kunci in kunci, s.id + ': kunci ' + s.kunci));
  const o = {
    luasAlas: u.luas,
    kelilingAlas: u.keliling,
    tinggiSisi: ts,
    tinggiLimas: b.t,
    sisiAlas: b.s,
  };
  V.soal.forEach((q) => {
    assertOptions(q.options, q.id + '.options', 4);
    assert.ok(ids(q.options).includes(q.correct));
    assert.ok(q.explanation);
    assert.equal(E.diagnosaLuasPermukaanLimas(o, q.nilaiTeman).kode, q.miskonsepsi, q.id);
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
  S.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id);
    const c = s.cek;
    if ((s.type || 'choice') === 'input') {
      assert.ok(typeof s.jawab === 'number' && s.satuan, s.id + ' jawab & satuan');
      let harap;
      if (c.rincian) {
        harap = E.luasPermukaanLimasUmum(E.rincianSisiLimas(c.rincian.alas, c.rincian.ts));
      } else if (c.cari === 'tinggiSisi') {
        harap = E.tinggiSisiDariLuasPermukaan(c.luasPermukaan, c.luasAlas, c.kelilingAlas);
      } else {
        harap = E.luasPermukaanLimas(c);
        if (c.hargaPerCm2) harap *= c.hargaPerCm2;
      }
      assert.equal(s.jawab, harap, s.id);
      if (typeof c.tinggiLimas === 'number' && typeof c.sisiAlas === 'number' && !c.rincian) {
        assert.equal(E.tinggiSisiTegakLimas(c.tinggiLimas, c.sisiAlas / 2), c.tinggiSisi, s.id);
      }
    } else {
      assertOptions(s.options, s.id + '.options', 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ' correct');
      if (c.cari !== 'rumus') {
        const k = E.kandidatLuasPermukaanLimas(c);
        s.options.forEach((o) => {
          if (k[o.id] !== undefined) assert.equal(angka(o.label), k[o.id], s.id + '.' + o.id);
        });
        assert.equal(angka(s.options.find((o) => o.id === s.correct).label), k.benar);
      }
    }
  });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
  assert.ok(D.selesai.judul && D.selesai.capaian.length >= 3);
});
