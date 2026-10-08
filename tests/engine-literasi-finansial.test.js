'use strict';

/*
 * Tes engine.js bagian 66 — literasi finansial: diskon, untung–rugi, dan
 * anggaran sederhana (dipakai fase-d/mpi-2.7, Problem Based Learning).
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function labels(list) {
  return Array.from(list, (o) => o.label);
}

test('persenDari & hargaSetelahDiskon: hitungan persen tanpa galat biner', () => {
  assert.equal(E.persenDari(20, 45000), 9000);
  assert.equal(E.persenDari(12.5, 80000), 10000);
  assert.equal(E.persenDari(10, 0.3), 0.03);
  assert.equal(E.hargaSetelahDiskon(45000, 20), 36000);
  assert.equal(E.hargaSetelahDiskon(120000, 0), 120000);
  assert.equal(E.hargaSetelahDiskon(120000, 100), 0);
});

test('diskonBertingkat: diskon kedua dihitung dari harga setelah diskon pertama', () => {
  const d = E.diskonBertingkat(200000, [20, 10]);
  assert.equal(d.awal, 200000);
  assert.equal(d.akhir, 144000);
  assert.equal(d.potongan, 56000);
  assert.equal(d.langkah.length, 2);
  assert.deepEqual(
    Array.from(d.langkah, (l) => [l.persen, l.dasar, l.potongan, l.sisa]),
    [
      [20, 200000, 40000, 160000],
      [10, 160000, 16000, 144000],
    ]
  );
  /* angka tunggal diperlakukan seperti daftar satu diskon */
  assert.equal(E.diskonBertingkat(50000, 30).akhir, 35000);
});

test('diskonEkuivalen: 20% + 10% setara 28%, bukan 30%', () => {
  assert.equal(E.diskonEkuivalen([20, 10]), 28);
  assert.equal(E.diskonEkuivalen([50, 50]), 75);
  assert.equal(E.diskonEkuivalen([25]), 25);
  assert.equal(E.diskonEkuivalen([10, 10, 10]), 27.1);
});

test('hargaPromo: diskon, bertingkat, beli–gratis, dan potongan minimal belanja', () => {
  assert.equal(E.hargaPromo({ jenis: 'diskon', harga: 5000, persen: 20 }, 10).total, 40000);
  assert.equal(
    E.hargaPromo({ jenis: 'bertingkat', harga: 10000, persen: [20, 10] }, 5).total,
    36000
  );
  const bg = E.hargaPromo({ jenis: 'beliGratis', harga: 6000, beli: 3, gratis: 1 }, 10);
  /* 10 barang = 2 paket (8 barang, bayar 6) + 2 barang lepas → bayar 8 */
  assert.equal(bg.bayarUnit, 8);
  assert.equal(bg.total, 48000);
  assert.equal(bg.normal, 60000);
  assert.equal(bg.potongan, 12000);
  const pot = { jenis: 'potongan', harga: 7000, potongan: 10000, minBelanja: 50000 };
  assert.equal(E.hargaPromo(pot, 8).total, 46000);
  assert.equal(E.hargaPromo(pot, 7).total, 49000, 'belum mencapai minimal belanja');
  assert.equal(E.hargaPromo({ jenis: 'tanpa', harga: 2500 }, 4).total, 10000);
});

test('promoTermurah: memilih total paling kecil', () => {
  const list = [
    { id: 'a', promo: { jenis: 'diskon', harga: 6000, persen: 20 } },
    { id: 'b', promo: { jenis: 'beliGratis', harga: 6000, beli: 3, gratis: 1 } },
    { id: 'c', promo: { jenis: 'potongan', harga: 5500, potongan: 5000, minBelanja: 50000 } },
  ];
  /* 12 barang: a = 57.600, b = 54.000, c = 61.000 */
  const r = E.promoTermurah(list, 12);
  assert.equal(r.id, 'b');
  assert.equal(r.total, 54000);
  assert.deepEqual(
    Array.from(r.semua, (x) => x.total),
    [57600, 54000, 61000]
  );
});

test('untungRugi: status, besar, dan persen terhadap harga beli', () => {
  assert.deepEqual(
    { ...E.untungRugi(40000, 50000) },
    { status: 'untung', besar: 10000, persen: 25 }
  );
  assert.deepEqual({ ...E.untungRugi(80000, 68000) }, { status: 'rugi', besar: 12000, persen: 15 });
  assert.deepEqual({ ...E.untungRugi(30000, 30000) }, { status: 'impas', besar: 0, persen: 0 });
  assert.equal(E.untungRugi(60000, 80000).persen, 33.33, 'dibulatkan dua angka desimal');
});

test('hargaJualDariPersen & hargaBeliDariJual saling invers', () => {
  assert.equal(E.hargaJualDariPersen(40000, 25, 'untung'), 50000);
  assert.equal(E.hargaJualDariPersen(80000, 15, 'rugi'), 68000);
  assert.equal(E.hargaJualDariPersen(30000, 0), 30000);
  assert.equal(E.hargaBeliDariJual(50000, 25, 'untung'), 40000);
  assert.equal(E.hargaBeliDariJual(68000, 15, 'rugi'), 80000);
});

test('rincianAnggaran: total, sisa, persen per pos & per jenis', () => {
  const pos = [
    { id: 'bahan', nama: 'Bahan', nilai: 250000, jenis: 'kebutuhan' },
    { id: 'hias', nama: 'Hiasan', nilai: 50000, jenis: 'keinginan' },
    { id: 'kas', nama: 'Tabungan', nilai: 100000, jenis: 'tabungan' },
  ];
  const r = E.rincianAnggaran(500000, pos);
  assert.equal(r.total, 400000);
  assert.equal(r.sisa, 100000);
  assert.equal(r.cukup, true);
  assert.deepEqual({ ...r.persen }, { bahan: 50, hias: 10, kas: 20 });
  assert.deepEqual({ ...r.perJenis }, { kebutuhan: 250000, keinginan: 50000, tabungan: 100000 });
  const defisit = E.rincianAnggaran(300000, pos);
  assert.equal(defisit.sisa, -100000);
  assert.equal(defisit.cukup, false);
});

test('periksaAnggaran: syarat tidak defisit, tabungan minimal, keinginan maksimal, pos wajib', () => {
  const pos = [
    { id: 'bahan', nama: 'Bahan', nilai: 250000, jenis: 'kebutuhan' },
    { id: 'hias', nama: 'Hiasan', nilai: 50000, jenis: 'keinginan' },
    { id: 'kas', nama: 'Tabungan', nilai: 100000, jenis: 'tabungan' },
  ];
  const syarat = { tabunganMinPersen: 20, keinginanMaksPersen: 10, wajib: { bahan: 240000 } };
  const ok = E.periksaAnggaran(500000, pos, syarat);
  assert.equal(ok.ok, true);
  assert.deepEqual(
    Array.from(ok.butir, (b) => b.id),
    ['seimbang', 'tabungan', 'keinginan', 'wajib-bahan']
  );
  ok.butir.forEach((b) => assert.ok(b.teks, b.id + ': teks'));

  const kurang = E.periksaAnggaran(
    500000,
    pos.map((p) => (p.id === 'kas' ? { ...p, nilai: 50000 } : p)),
    syarat
  );
  assert.equal(kurang.ok, false);
  assert.equal(kurang.butir.find((b) => b.id === 'tabungan').ok, false);

  const boros = E.periksaAnggaran(300000, pos, syarat);
  assert.equal(boros.butir.find((b) => b.id === 'seimbang').ok, false);
});

test('jawabFinansial & satuan: kunci setiap jenis langkah', () => {
  const J = (s) => E.jawabFinansial(s);
  assert.equal(J({ jenis: 'diskonAkhir', harga: 200000, persen: [20, 10] }), 144000);
  assert.equal(J({ jenis: 'diskonPotongan', harga: 45000, persen: 20 }), 9000);
  assert.equal(J({ jenis: 'diskonSetara', persen: [20, 10] }), 28);
  assert.equal(
    J({ jenis: 'promo', promo: { jenis: 'beliGratis', harga: 6000, beli: 3, gratis: 1 }, qty: 12 }),
    54000
  );
  assert.equal(J({ jenis: 'untungBesar', beli: 80000, jual: 68000 }), 12000);
  assert.equal(J({ jenis: 'untungPersen', beli: 40000, jual: 50000 }), 25);
  assert.equal(J({ jenis: 'hargaJual', beli: 40000, persen: 25, status: 'untung' }), 50000);
  assert.equal(
    J({ jenis: 'sisaAnggaran', pemasukan: 500000, pengeluaran: [250000, 120000] }),
    130000
  );
  assert.equal(J({ jenis: 'persenPos', pemasukan: 500000, nilai: 100000 }), 20);
  assert.equal(J({ jenis: 'nilai', jawab: 7500 }), 7500);
  assert.equal(E.satuanFinansial({ jenis: 'untungPersen' }), '%');
  assert.equal(E.satuanFinansial({ jenis: 'diskonAkhir' }), 'rupiah');
  assert.equal(
    E.fmtJawabFinansial({ jenis: 'diskonAkhir', harga: 200000, persen: [20, 10] }),
    'Rp144.000'
  );
  assert.equal(E.fmtJawabFinansial({ jenis: 'untungPersen', beli: 60000, jual: 80000 }), '33,33%');
});

test('fmtPersenFin: koma desimal tanpa nol berlebih', () => {
  assert.equal(E.fmtPersenFin(25), '25%');
  assert.equal(E.fmtPersenFin(12.5), '12,5%');
  assert.equal(E.fmtPersenFin(27.1), '27,1%');
});

test('diagnosaFinansial — diskon: miskonsepsi persen dijumlah, potongan saja, dll.', () => {
  const step = { jenis: 'diskonAkhir', harga: 200000, persen: [20, 10] };
  const D = (x) => E.diagnosaFinansial(x, step).kode;
  assert.equal(D('144.000'), 'benar');
  assert.equal(D('Rp144.000'), 'benar');
  assert.equal(D('144000'), 'benar');
  assert.equal(D(''), 'kosong');
  assert.equal(D('seratus'), 'format');
  assert.equal(D('140.000'), 'dijumlah');
  assert.equal(D('160.000'), 'pertama-saja');
  assert.equal(D('56.000'), 'hanya-potongan');
  assert.equal(D('14.400'), 'koma');
  assert.equal(D('150.000'), 'salah');

  const satu = { jenis: 'diskonAkhir', harga: 45000, persen: 20 };
  assert.equal(E.diagnosaFinansial('44980', satu).kode, 'kurang-angka');
  assert.equal(E.diagnosaFinansial('9000', satu).kode, 'hanya-potongan');
  assert.equal(E.diagnosaFinansial('54000', satu).kode, 'ditambah');

  const pot = { jenis: 'diskonPotongan', harga: 45000, persen: 20 };
  assert.equal(E.diagnosaFinansial('36000', pot).kode, 'harga-akhir');
  assert.equal(E.diagnosaFinansial('9000', pot).kode, 'benar');

  const setara = { jenis: 'diskonSetara', persen: [20, 10] };
  assert.equal(E.diagnosaFinansial('28%', setara).kode, 'benar');
  assert.equal(E.diagnosaFinansial('30', setara).kode, 'dijumlah');
});

test('diagnosaFinansial — promo: lupa promo & gratis hanya sekali', () => {
  const step = {
    jenis: 'promo',
    promo: { jenis: 'beliGratis', harga: 6000, beli: 3, gratis: 1 },
    qty: 12,
  };
  assert.equal(E.diagnosaFinansial('54000', step).kode, 'benar');
  assert.equal(E.diagnosaFinansial('72000', step).kode, 'tanpa-promo');
  assert.equal(E.diagnosaFinansial('66000', step).kode, 'gratis-sekali');
});

test('diagnosaFinansial — untung/rugi: persen dari harga jual, tanda, dan arah', () => {
  const persen = { jenis: 'untungPersen', beli: 40000, jual: 50000 };
  assert.equal(E.diagnosaFinansial('25%', persen).kode, 'benar');
  assert.equal(E.diagnosaFinansial('20', persen).kode, 'dari-jual');
  assert.equal(E.diagnosaFinansial('10000', persen).kode, 'rupiah');
  assert.equal(E.diagnosaFinansial('0,25', persen).kode, 'tanpa-100');

  const besar = { jenis: 'untungBesar', beli: 80000, jual: 68000 };
  assert.equal(E.diagnosaFinansial('12000', besar).kode, 'benar');
  assert.equal(E.diagnosaFinansial('-12000', besar).kode, 'tanda');
  assert.equal(E.diagnosaFinansial('148000', besar).kode, 'dijumlah');

  const jual = { jenis: 'hargaJual', beli: 40000, persen: 25, status: 'untung' };
  assert.equal(E.diagnosaFinansial('50000', jual).kode, 'benar');
  assert.equal(E.diagnosaFinansial('40025', jual).kode, 'kurang-angka');
  assert.equal(E.diagnosaFinansial('10000', jual).kode, 'hanya-untung');
  assert.equal(E.diagnosaFinansial('30000', jual).kode, 'arah-terbalik');
});

test('diagnosaFinansial — anggaran: total vs sisa, persen terbalik', () => {
  const sisa = { jenis: 'sisaAnggaran', pemasukan: 500000, pengeluaran: [250000, 120000] };
  assert.equal(E.diagnosaFinansial('130.000', sisa).kode, 'benar');
  assert.equal(E.diagnosaFinansial('370.000', sisa).kode, 'total');
  assert.equal(E.diagnosaFinansial('870.000', sisa).kode, 'dijumlah');
  const pos = { jenis: 'persenPos', pemasukan: 500000, nilai: 100000 };
  assert.equal(E.diagnosaFinansial('20%', pos).kode, 'benar');
  assert.equal(E.diagnosaFinansial('500', pos).kode, 'terbalik');
  assert.equal(E.diagnosaFinansial('0,2', pos).kode, 'tanpa-100');
});

test('setiap kode diagnosa punya pesan', () => {
  [
    'kosong',
    'format',
    'dijumlah',
    'pertama-saja',
    'hanya-potongan',
    'harga-akhir',
    'kurang-angka',
    'ditambah',
    'koma',
    'tanpa-promo',
    'gratis-sekali',
    'dari-jual',
    'rupiah',
    'tanpa-100',
    'tanda',
    'hanya-untung',
    'arah-terbalik',
    'total',
    'terbalik',
    'salah',
  ].forEach((k) => assert.ok(E.PESAN_FINANSIAL[k], k));
});

test('langkah isian: kosong tidak dihitung, salah menambah percobaan, benar selesai', () => {
  const st = E.makeFinStep();
  const step = { jenis: 'diskonPotongan', harga: 45000, persen: 20 };
  assert.equal(E.periksaFinStep(st, step, '').kode, 'kosong');
  assert.equal(st.attempts, 0);
  E.periksaFinStep(st, step, '36000');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  assert.equal(st.kode, 'harga-akhir');
  E.periksaFinStep(st, step, 'Rp9.000');
  assert.equal(st.attempts, 2);
  assert.equal(st.done, true);
});

test('opsiFinansial: kunci + pengecoh berdiagnosa, label unik', () => {
  const step = { jenis: 'diskonAkhir', harga: 200000, persen: [20, 10] };
  const opsi = E.opsiFinansial(step);
  assert.ok(opsi.length >= 4);
  assert.equal(opsi.filter((o) => o.benar).length, 1);
  assert.equal(opsi.find((o) => o.benar).label, 'Rp144.000');
  assert.equal(new Set(labels(opsi)).size, opsi.length);
  assert.equal(new Set(Array.from(opsi, (o) => o.id)).size, opsi.length);
  opsi
    .filter((o) => !o.benar)
    .forEach((o) => {
      assert.equal(E.diagnosaFinansial(o.nilai, step).kode, o.kode, o.label);
      assert.ok(o.umpan, o.id + ': umpan');
    });
  const persen = E.opsiFinansial({ jenis: 'untungPersen', beli: 40000, jual: 50000 });
  assert.ok(persen.length >= 4);
  assert.ok(labels(persen).includes('25%'));
  assert.ok(labels(persen).includes('20%'));
});

test('opsiFinansial: paling banyak 5 opsi, pengecoh masuk akal', () => {
  const banyak = E.opsiFinansial({ jenis: 'diskonAkhir', harga: 150000, persen: [20, 10] });
  assert.ok(banyak.length <= 5);
  assert.equal(banyak[0].benar, true);
  const setara = labels(E.opsiFinansial({ jenis: 'diskonSetara', persen: [30, 20] }));
  assert.deepEqual(setara.slice(0, 3), ['44%', '50%', '30%']);
  assert.ok(!setara.includes('440%'));
  const jual = labels(
    E.opsiFinansial({ jenis: 'hargaJual', beli: 60000, persen: 10, status: 'rugi' })
  );
  jual.forEach((l) => assert.doesNotMatch(l, /,/, 'tanpa sen: ' + l));
});

test('buildStrukBelanja: baris barang, promo, dan total', () => {
  const html = E.buildStrukBelanja({
    toko: 'Toko Grosir Maju',
    baris: [{ nama: 'Gelas plastik', qty: 10, harga: 6000 }],
    promo: [{ label: 'Diskon 20%', potong: 12000 }],
  });
  assert.match(html, /class="struk"/);
  assert.match(html, /Toko Grosir Maju/);
  assert.match(html, /Rp60\.000/);
  assert.match(html, /−Rp12\.000/);
  assert.match(html, /Rp48\.000/);
  assert.match(html, /<table/);
  assert.match(html, /10 × Rp6\.000/);
  const satu = E.buildStrukBelanja({ baris: [{ nama: 'Es batu', qty: 1, harga: 85000 }] });
  assert.doesNotMatch(satu, /struk__qty/, 'jumlah 1 tidak ditulis');
});

test('buildLabDiskon: batang harga, diskon setara, dan stepper', () => {
  const html = E.buildLabDiskon('ld', { p1: 20, p2: 10 }, { harga: 200000, nama: 'Termos' });
  assert.match(html, /Rp144\.000/);
  assert.match(html, /28%/);
  assert.match(html, /30%/);
  assert.match(html, /id="ldP1Inc"/);
  assert.match(html, /id="ldP2Dec"/);
  assert.match(html, /aria-live="polite"/);
});

test('ubahLabDiskon & ubahTimbangan menjaga batas', () => {
  const st = { p1: 0, p2: 50 };
  E.ubahLabDiskon(st, 'p1', -1, {});
  E.ubahLabDiskon(st, 'p2', 1, { maks: 50 });
  assert.deepEqual({ ...st }, { p1: 0, p2: 50 });
  E.ubahLabDiskon(st, 'p1', 1, { langkah: 5 });
  assert.equal(st.p1, 5);
  const t = { jual: 1000, terjual: 0 };
  E.ubahTimbangan(t, 'jual', -1, { langkahJual: 500, minJual: 500 });
  assert.equal(t.jual, 500);
  E.ubahTimbangan(t, 'jual', -1, { langkahJual: 500, minJual: 500 });
  assert.equal(t.jual, 500);
  E.ubahTimbangan(t, 'terjual', 1, { langkahTerjual: 5, maksTerjual: 60 });
  assert.equal(t.terjual, 5);
});

test('buildTimbanganUntung: status untung/rugi/impas dari modal & pendapatan', () => {
  const opts = { modal: 150000, satuan: 'gelas' };
  assert.match(E.buildTimbanganUntung('tu', { jual: 5000, terjual: 40 }, opts), /UNTUNG/);
  assert.match(E.buildTimbanganUntung('tu', { jual: 5000, terjual: 40 }, opts), /33,33%/);
  assert.match(E.buildTimbanganUntung('tu', { jual: 3000, terjual: 40 }, opts), /RUGI/);
  assert.match(E.buildTimbanganUntung('tu', { jual: 5000, terjual: 30 }, opts), /IMPAS/);
});

test('buildPapanAnggaran: stepper per pos, sisa, dan daftar syarat', () => {
  const pos = [
    { id: 'bahan', nama: 'Bahan', ikon: '🧺', jenis: 'kebutuhan' },
    { id: 'kas', nama: 'Tabungan', ikon: '🐷', jenis: 'tabungan' },
  ];
  const st = { nilai: { bahan: 300000, kas: 100000 } };
  const html = E.buildPapanAnggaran('pa', st, {
    pemasukan: 500000,
    pos: pos,
    langkah: 10000,
    syarat: { tabunganMinPersen: 20 },
  });
  assert.match(html, /id="paBahanInc"|id="pa-bahanInc"/);
  assert.match(html, /Rp100\.000/);
  assert.match(html, /Sisa/);
  assert.match(html, /20%/);
  const nilai = E.nilaiPosAnggaran(st, pos);
  assert.deepEqual(
    Array.from(nilai, (p) => p.nilai),
    [300000, 100000]
  );
});
