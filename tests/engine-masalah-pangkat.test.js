'use strict';

/*
 * Tes fungsi masalah kontekstual bilangan berpangkat bulat (shared/engine.js
 * seksi 49): ukuran data 2ᵏ byte dalam satuan biner (KiB, MiB, GiB, TiB),
 * opsi pilihan eksponen berpengecoh miskonsepsi, diagnosa nilai jawaban
 * soal kontekstual, perbandingan paket kapasitas (lama muat), serta
 * komponen UI kartu surat/tiket dan tabel banding paket.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

test('ukuranBiner: 2ᵏ byte dinyatakan dalam satuan biner terbesar', () => {
  assert.deepEqual(plain(E.ukuranBiner(0)), { nilai: 1, satuan: 'byte', kSatuan: 0 });
  assert.deepEqual(plain(E.ukuranBiner(9)), { nilai: 512, satuan: 'byte', kSatuan: 0 });
  assert.deepEqual(plain(E.ukuranBiner(10)), { nilai: 1, satuan: 'KiB', kSatuan: 10 });
  assert.deepEqual(plain(E.ukuranBiner(22)), { nilai: 4, satuan: 'MiB', kSatuan: 20 });
  assert.deepEqual(plain(E.ukuranBiner(25)), { nilai: 32, satuan: 'MiB', kSatuan: 20 });
  assert.deepEqual(plain(E.ukuranBiner(35)), { nilai: 32, satuan: 'GiB', kSatuan: 30 });
  assert.deepEqual(plain(E.ukuranBiner(38)), { nilai: 256, satuan: 'GiB', kSatuan: 30 });
  assert.deepEqual(plain(E.ukuranBiner(40)), { nilai: 1, satuan: 'TiB', kSatuan: 40 });
  assert.deepEqual(plain(E.ukuranBiner(53)), { nilai: 8, satuan: 'PiB', kSatuan: 50 });
  /* Di atas PiB tetap memakai PiB. */
  assert.deepEqual(plain(E.ukuranBiner(61)), { nilai: 2048, satuan: 'PiB', kSatuan: 50 });
});

test('ukuranBiner: eksponen harus bulat tidak negatif', () => {
  assert.throws(() => E.ukuranBiner(-1));
  assert.throws(() => E.ukuranBiner(2.5));
});

test('formatUkuranBiner: teks siap tampil', () => {
  assert.equal(E.formatUkuranBiner(25), '32 MiB');
  assert.equal(E.formatUkuranBiner(38), '256 GiB');
  assert.equal(E.formatUkuranBiner(13), '8 KiB');
  assert.equal(E.formatUkuranBiner(9), '512 byte');
});

test('opsiEksponenSoal: satu opsi benar + tiga pengecoh berdiagnosa', () => {
  const cases = [
    { a: 2, op: 'kali', m: 12, n: 11 },
    { a: 2, op: 'kali', m: 25, n: -3 },
    { a: 10, op: 'kali', m: -9, n: 12 },
    { a: 2, op: 'bagi', m: 38, n: 35 },
    { a: 2, op: 'bagi', m: 22, n: 23 },
    { a: 2, op: 'bagi', m: 31, n: 31 },
    { a: 10, op: 'bagi', m: 9, n: 3 },
    { a: 2, op: 'pangkat', m: 10, n: 4 },
    { a: 2, op: 'pangkat', m: 6, n: 8 },
    { a: 2, op: 'pangkat', m: 1, n: 1 },
  ];
  cases.forEach((c) => {
    const opsi = E.opsiEksponenSoal(c.a, c.op, c.m, c.n, 'byte');
    const nama = c.op + ' ' + c.m + ',' + c.n;
    assert.equal(opsi.length, 4, nama + ': empat opsi');
    assert.equal(opsi[0].id, 'benar', nama + ': opsi pertama benar');
    const k = E.eksponenSifat(c.op, c.m, c.n);
    assert.equal(opsi[0].label, E.formatPangkat(c.a, k) + ' byte');
    assert.equal(new Set(opsi.map((o) => o.id)).size, 4, nama + ': id unik');
    assert.equal(new Set(opsi.map((o) => o.label)).size, 4, nama + ': label unik');
    opsi.slice(1).forEach((o) => {
      assert.ok(typeof o.k === 'number' && Number.isInteger(o.k), nama + ': k bulat');
      assert.notEqual(o.k, k, nama + ': pengecoh tidak sama dengan kunci');
      if (o.id.indexOf('dekat') !== 0) {
        assert.equal(E.diagnosaEksponenSifat(c.op, c.m, c.n, o.k), o.id, nama + ': id = diagnosa');
      }
    });
  });
});

test('opsiEksponenSoal: pengecoh khas perkalian', () => {
  const opsi = E.opsiEksponenSoal(2, 'kali', 12, 11);
  const byId = Object.fromEntries(opsi.map((o) => [o.id, o]));
  assert.equal(byId.benar.label, '2²³');
  assert.equal(byId.kali.label, '2¹³²');
  assert.ok(byId.selisih);
});

test('diagnosaNilaiPangkat: nilai benar, eksponen saja, pangkat nol, miskonsepsi', () => {
  const cek = { a: 2, op: 'bagi', m: 36, n: 30 };
  assert.equal(E.diagnosaNilaiPangkat(cek, 64).kode, 'benar');
  assert.equal(E.diagnosaNilaiPangkat(cek, 64).pesan, '');
  /* Menjawab eksponennya (6), bukan nilainya (64). */
  const eks = E.diagnosaNilaiPangkat(cek, 6);
  assert.equal(eks.kode, 'eksponen');
  assert.match(eks.pesan, /2⁶/);
  /* 36 : 30 = 1,2 bukan bulat; menjawab 2^(36/30) tidak mungkin. Jawaban 2 = 2^1 → lain. */
  assert.equal(E.diagnosaNilaiPangkat(cek, 2).kode, 'lain');

  const nol = { a: 2, op: 'bagi', m: 31, n: 31 };
  assert.equal(E.diagnosaNilaiPangkat(nol, 1).kode, 'benar');
  const d0 = E.diagnosaNilaiPangkat(nol, 0);
  assert.equal(d0.kode, 'nol');
  assert.match(d0.pesan, /a⁰ = 1/);

  const kali = { a: 2, op: 'kali', m: 12, n: 2 };
  assert.equal(E.diagnosaNilaiPangkat(kali, 16384).kode, 'benar');
  /* 2^(12×2) = 2^24 → mengalikan eksponen. */
  const dk = E.diagnosaNilaiPangkat(kali, Math.pow(2, 24));
  assert.equal(dk.kode, 'kali');
  assert.match(dk.pesan, /dijumlahkan/);
  /* 2^(12−2) = 1024 → mengurangkan eksponen. */
  assert.equal(E.diagnosaNilaiPangkat(kali, 1024).kode, 'selisih');
  /* Nilai lain tanpa pola. */
  const dl = E.diagnosaNilaiPangkat(kali, 777);
  assert.equal(dl.kode, 'lain');
  assert.match(dl.pesan, /12 \+ 2/);
});

test('diagnosaNilaiPangkat: pesan tidak membocorkan nilai kunci', () => {
  const cek = { a: 2, op: 'kali', m: 5, n: 6 };
  const d = E.diagnosaNilaiPangkat(cek, Math.pow(2, 30));
  assert.equal(d.kode, 'kali');
  assert.doesNotMatch(d.pesan, /2048/);
  assert.doesNotMatch(d.pesan, /2¹¹/);
});

const PAKET = [
  { id: 'nimbus', nama: 'Nimbus', k: 40, harga: 300000 },
  { id: 'stratus', nama: 'Stratus', k: 38, harga: 90000 },
  { id: 'cirrus', nama: 'Cirrus', k: 36, harga: 30000 },
];

test('bandingPaketPangkat: lama muat = 2^(k − kPerPeriode) dan syarat minimal', () => {
  const rows = E.bandingPaketPangkat(PAKET, { a: 2, kPerPeriode: 35, minimal: 5 });
  assert.deepEqual(plain(rows.map((r) => [r.id, r.kLama, r.lama, r.cukup])), [
    ['nimbus', 5, 32, true],
    ['stratus', 3, 8, true],
    ['cirrus', 1, 2, false],
  ]);
  assert.equal(rows[0].harga, 300000);
  assert.equal(rows[0].nama, 'Nimbus');
});

test('paketTerhemat: harga termurah di antara paket yang memenuhi syarat', () => {
  const rows = E.bandingPaketPangkat(PAKET, { a: 2, kPerPeriode: 35, minimal: 5 });
  assert.equal(E.paketTerhemat(rows).id, 'stratus');
  const rows2 = E.bandingPaketPangkat(PAKET, { a: 2, kPerPeriode: 38, minimal: 2 });
  /* 2^(40−38) = 4 ✓, 2^0 = 1 ✗, 2^−2 ✗ */
  assert.equal(E.paketTerhemat(rows2).id, 'nimbus');
  assert.equal(
    E.paketTerhemat(E.bandingPaketPangkat(PAKET, { a: 2, kPerPeriode: 41, minimal: 1 })),
    null
  );
});

test('bandingPaketPangkat: lama muat pangkat negatif menjadi pecahan', () => {
  const rows = E.bandingPaketPangkat([{ id: 'x', nama: 'X', k: 33, harga: 1 }], {
    a: 2,
    kPerPeriode: 35,
    minimal: 1,
  });
  assert.equal(rows[0].kLama, -2);
  assert.equal(rows[0].lama, 0.25);
  assert.equal(rows[0].cukup, false);
});

test('buildBandingPaketPangkat: tabel paket dengan tanda syarat & sorotan pilihan', () => {
  const rows = E.bandingPaketPangkat(PAKET, { a: 2, kPerPeriode: 35, minimal: 5 });
  const html = E.buildBandingPaketPangkat(rows, {
    a: 2,
    kPerPeriode: 35,
    minimal: 5,
    satuanPeriode: 'tahun',
    pilih: 'stratus',
  });
  assert.match(html, /<table class="mpk-tabel"/);
  assert.match(html, /<caption/);
  assert.equal((html.match(/<tr class="mpk-tabel__baris/g) || []).length, 3);
  assert.match(html, /2⁴⁰ byte/);
  assert.match(html, /1 TiB/);
  assert.match(html, /2⁴⁰ : 2³⁵ = 2⁵ = 32 tahun/);
  assert.match(html, /Rp300\.000/);
  assert.equal((html.match(/mpk-tabel__baris--ok/g) || []).length, 2);
  assert.equal((html.match(/mpk-tabel__baris--no/g) || []).length, 1);
  assert.equal((html.match(/is-pilih/g) || []).length, 1);
  assert.match(html, /data-paket="stratus"[^>]*is-pilih|is-pilih[^>]*data-paket="stratus"/);
});

test('buildSuratCard: kartu surat/tiket dengan butir teks di-escape', () => {
  const html = E.buildSuratCard({
    ikon: '📷',
    judul: 'Foto <karya>',
    butir: ['Satu', 'Dua & tiga'],
  });
  assert.match(html, /<article class="surat-card">/);
  assert.match(html, /Foto &lt;karya&gt;/);
  assert.equal((html.match(/<li>/g) || []).length, 2);
  assert.match(html, /Dua &amp; tiga/);
});
