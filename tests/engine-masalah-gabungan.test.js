'use strict';

/*
 * Tes fungsi masalah kontekstual gabungan prisma & limas (shared/engine.js
 * seksi 60): ukuran alas bersama, rincian sisi luar bangun gabungan (bidang
 * sambung tidak termasuk), volume & luas sisi terpakai, kandidat/diagnosa/
 * opsi soal kontekstual berjenis (termasuk delegasi ke seksi 55 & 58),
 * serta komponen UI (gambar isometrik, Lab Gabungan, pemilih sisi).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function dekat(a, b) {
  return Math.abs(a - b) < 1e-4;
}

/* Tandon B: balok 120 × 120 × 100 cm + corong limas terbalik setinggi 80 cm. */
const TANDON_B = {
  nama: 'Tandon B',
  satuan: 'cm',
  alas: { n: 4, s: 120 },
  prisma: { t: 100 },
  limas: { t: 80, posisi: 'bawah' },
};
/* Tandon C: balok saja. */
const TANDON_C = { nama: 'Tandon C', satuan: 'cm', alas: { n: 4, s: 120 }, prisma: { t: 140 } };
/* Corong saja (limas). */
const CORONG = { nama: 'Corong', satuan: 'cm', alas: { n: 4, s: 120 }, limas: { t: 80 } };
/* Tugu: balok 40 × 40 × 100 cm + puncak limas setinggi 15 cm di atas. */
const TUGU = {
  nama: 'Tugu',
  satuan: 'cm',
  alas: { n: 4, s: 40 },
  prisma: { t: 100 },
  limas: { t: 15, posisi: 'atas' },
};
/* Kotak hadiah: balok 10 × 10 × 12 cm + tutup limas bertₛ 13 cm. */
const KOTAK = {
  nama: 'Kotak hadiah',
  satuan: 'cm',
  alas: { n: 4, s: 10 },
  prisma: { t: 12 },
  limas: { ts: 13, posisi: 'atas' },
};
/* Rumah boneka: alas persegi panjang 30 × 20 cm. */
const RUMAH = {
  nama: 'Rumah boneka',
  satuan: 'cm',
  alas: { p: 30, l: 20 },
  prisma: { t: 25 },
  limas: { t: 12, posisi: 'atas' },
};

const TEGAK_B = ['atas', 'p0', 'p1', 'p2', 'p3', 'l0', 'l1', 'l2', 'l3'];

test('alasGabungan: luas & keliling alas bersama', () => {
  const a = E.alasGabungan(TANDON_B);
  assert.equal(a.luas, 14400);
  assert.equal(a.keliling, 480);
  assert.deepEqual(plain(a.sisi), [120, 120, 120, 120]);
  const r = E.alasGabungan(RUMAH);
  assert.equal(r.luas, 600);
  assert.equal(r.keliling, 100);
});

test('tinggiLimasGabungan: dari t langsung atau dari tₛ (Pythagoras)', () => {
  assert.equal(E.tinggiLimasGabungan(TANDON_B), 80);
  assert.equal(E.tinggiLimasGabungan(KOTAK), 12);
  assert.equal(E.tinggiLimasGabungan(TANDON_C), 0);
});

test('rincianSisiGabungan: sisi luar saja; bidang sambung hanya bila diminta', () => {
  const r = E.rincianSisiGabungan(TANDON_B);
  assert.deepEqual(plain(r.map((f) => f.id)), TEGAK_B);
  const byId = {};
  r.forEach((f) => (byId[f.id] = f));
  assert.equal(byId.atas.luas, 14400);
  assert.equal(byId.atas.bagian, 'prisma');
  assert.equal(byId.p0.luas, 12000);
  assert.equal(byId.p0.jenis, 'tegak');
  assert.equal(byId.l0.luas, 6000);
  assert.equal(byId.l0.tinggi, 100);
  assert.equal(byId.l0.bagian, 'limas');

  const s = E.rincianSisiGabungan(TANDON_B, { sambung: true });
  const sambung = s.filter((f) => f.sambung);
  assert.deepEqual(plain(sambung.map((f) => f.id)), ['sambung-p', 'sambung-l']);
  sambung.forEach((f) => assert.equal(f.luas, 14400));

  /* limas di atas: alas prisma menjadi sisi luar, tutup prisma jadi bidang sambung */
  assert.deepEqual(plain(E.rincianSisiGabungan(TUGU).map((f) => f.id)), [
    'alas',
    'p0',
    'p1',
    'p2',
    'p3',
    'l0',
    'l1',
    'l2',
    'l3',
  ]);
  /* prisma saja & limas saja */
  assert.deepEqual(plain(E.rincianSisiGabungan(TANDON_C).map((f) => f.id)), [
    'alas',
    'atas',
    'p0',
    'p1',
    'p2',
    'p3',
  ]);
  assert.deepEqual(plain(E.rincianSisiGabungan(CORONG).map((f) => f.id)), [
    'alas',
    'l0',
    'l1',
    'l2',
    'l3',
  ]);
  assert.equal(E.rincianSisiGabungan(TANDON_C, { sambung: true }).length, 6);

  /* limas persegi panjang: tₛ berbeda per rusuk */
  const rumahL = E.rincianSisiGabungan(RUMAH).filter((f) => f.bagian === 'limas');
  assert.equal(rumahL.length, 4);
  assert.ok(rumahL[0].tinggi !== rumahL[1].tinggi);
});

test('volumeGabungan: V prisma + ⅓ × La × t limas', () => {
  assert.deepEqual(plain(E.volumeGabungan(TANDON_B)), {
    prisma: 1440000,
    limas: 384000,
    total: 1824000,
  });
  assert.equal(E.volumeGabungan(TANDON_C).total, 2016000);
  assert.equal(E.volumeGabungan(CORONG).total, 384000);
  assert.equal(E.volumeGabungan(RUMAH).total, 17400);
  assert.equal(E.volumeGabungan(KOTAK).limas, 400);
});

test('luasSisiGabungan & luasPermukaanGabungan', () => {
  assert.equal(E.luasPermukaanGabungan(TANDON_B), 86400);
  assert.equal(E.luasPermukaanGabungan(TANDON_C), 96000);
  assert.equal(E.luasPermukaanGabungan(KOTAK), 840);
  assert.equal(E.luasPermukaanGabungan(CORONG), 38400);
  const tanpaAlas = ['p0', 'p1', 'p2', 'p3', 'l0', 'l1', 'l2', 'l3'];
  assert.equal(E.luasSisiGabungan(TUGU, tanpaAlas), 18000);
  assert.equal(E.luasSisiGabungan(TANDON_B, ['sambung-p', 'sambung-l']), 28800);
});

test('kandidatMasalahGabungan volume: lupa ⅓, lupa limas, ½, tₛ, konversi', () => {
  const k = E.kandidatMasalahGabungan({ jenis: 'volume', bangun: TANDON_B, dari: 'cm3', ke: 'l' });
  assert.equal(k.benar, 1824);
  assert.equal(k['lupa-sepertiga'], 2592);
  assert.equal(k['lupa-limas'], 1440);
  assert.equal(k.setengah, 2016);
  assert.equal(k['tinggi-sisi'], 1920);
  assert.equal(k['lupa-konversi'], 1824000);
  assert.equal(k['faktor-luas'], 18240);
  assert.equal(k['faktor-panjang'], 182400);
  assert.equal(k['lupa-prisma'], 384);

  const c = E.kandidatMasalahGabungan({ jenis: 'volume', bangun: CORONG });
  assert.equal(c.benar, 384000);
  assert.equal(c['lupa-sepertiga'], 1152000);
  assert.ok(!('lupa-limas' in c));
  const p = E.kandidatMasalahGabungan({ jenis: 'volume', bangun: TANDON_C });
  assert.deepEqual(Object.keys(p), ['benar']);
});

test('kandidatMasalahGabungan luas: bidang sambung, tinggi limas, ½, sisi', () => {
  const k = E.kandidatMasalahGabungan({ jenis: 'luas', bangun: TANDON_B });
  assert.equal(k.benar, 86400);
  assert.equal(k.sambung, 115200);
  assert.equal(k['tinggi-limas'], 81600);
  assert.equal(k['lupa-setengah'], 110400);
  assert.equal(k['lupa-limas'], 62400);
  assert.ok(!('semua-sisi' in k));

  const t = E.kandidatMasalahGabungan({
    jenis: 'luas',
    bangun: TUGU,
    pakai: ['p0', 'p1', 'p2', 'p3', 'l0', 'l1', 'l2', 'l3'],
  });
  assert.equal(t.benar, 18000);
  assert.equal(t.sambung, 21200);
  assert.equal(t['tinggi-limas'], 17200);
  assert.equal(t['lupa-setengah'], 20000);
  assert.equal(t['lupa-limas'], 16000);
  assert.equal(t['semua-sisi'], 19600);

  const h = E.kandidatMasalahGabungan({ jenis: 'luas', bangun: KOTAK });
  assert.equal(h.benar, 840);
  assert.equal(h.sambung, 1040);
  assert.equal(h['tinggi-limas'], 820);
  assert.equal(h['lupa-setengah'], 1100);
  assert.equal(h['lupa-limas'], 580);
});

test('kandidatMasalahGabungan: delegasi ke seksi 55 & 58', () => {
  assert.equal(E.kandidatMasalahGabungan({ jenis: 'ts', t: 80, a: 60 }).benar, 100);
  const m = E.kandidatMasalahGabungan({ jenis: 'muat', volume: 1824, isiSatu: 250 });
  assert.equal(m.benar, 7);
  assert.equal(m['muat-atas'], 8);
  const w = E.kandidatMasalahGabungan({
    jenis: 'wadah',
    luasSatu: 86400,
    banyak: 1,
    isiWadah: 18000,
  });
  assert.equal(w.benar, 5);
  assert.equal(w['bulat-bawah'], 4);
  const kv = E.kandidatMasalahGabungan({
    jenis: 'konversiVolume',
    nilai: 1.824,
    dari: 'm3',
    ke: 'l',
  });
  assert.equal(kv.benar, 1824);
  assert.equal(kv['faktor-luas'], 182.4);
  const kl = E.kandidatMasalahGabungan({
    jenis: 'konversiLuas',
    nilai: 86400,
    dari: 'cm²',
    ke: 'm²',
  });
  assert.equal(kl.benar, 8.64);
  assert.equal(E.kandidatMasalahGabungan({ jenis: 'waktu', volume: 1824, debit: 12 }).benar, 152);
  assert.equal(
    E.kandidatMasalahGabungan({ jenis: 'biayaWadah', luas: 8.64, isiWadah: 4, harga: 65000 }).benar,
    195000
  );
  assert.throws(() => E.kandidatMasalahGabungan({ jenis: 'entah' }));
});

test('diagnosaMasalahGabungan: pesan sesuai sumber kekeliruan', () => {
  const luas = { jenis: 'luas', bangun: TANDON_B };
  assert.equal(E.diagnosaMasalahGabungan(luas, 86400).kode, 'benar');
  const d = E.diagnosaMasalahGabungan(luas, 115200);
  assert.equal(d.kode, 'sambung');
  assert.match(d.pesan, /sambung/i);
  assert.match(E.diagnosaMasalahGabungan(luas, 81600).pesan, /tₛ/);
  const vol = { jenis: 'volume', bangun: TANDON_B, dari: 'cm3', ke: 'l' };
  assert.match(E.diagnosaMasalahGabungan(vol, 2592).pesan, /⅓/);
  assert.equal(E.diagnosaMasalahGabungan(vol, 18240).kode, 'faktor-luas');
  assert.match(E.diagnosaMasalahGabungan(vol, 18240).pesan, /1\.000/);
  const ts = E.diagnosaMasalahGabungan({ jenis: 'ts', t: 80, a: 60 }, 140);
  assert.equal(ts.kode, 'jumlah-sisi');
  const salah = E.diagnosaMasalahGabungan(luas, 12345);
  assert.equal(salah.kode, 'salah-hitung');
  assert.ok(salah.pesan.length > 10);
});

test('pengecohMasalahGabungan: tanpa jawaban benar, unik, berpesan', () => {
  const p = E.pengecohMasalahGabungan({ jenis: 'luas', bangun: TANDON_B });
  assert.ok(p.length >= 3);
  p.forEach((x) => {
    assert.ok(!dekat(x.nilai, 86400));
    assert.ok(x.pesan && x.kode);
  });
  assert.equal(new Set(p.map((x) => x.nilai)).size, p.length);
});

test('opsiMasalahGabungan: benar di depan, ≥ 4 opsi unik, label 3 desimal', () => {
  const o = E.opsiMasalahGabungan(
    { jenis: 'volume', bangun: TANDON_B, dari: 'cm3', ke: 'l' },
    'liter'
  );
  assert.equal(o[0].id, 'benar');
  assert.equal(o[0].label, '1.824 liter');
  assert.ok(o.length >= 4);
  assert.equal(new Set(o.map((x) => x.nilai)).size, o.length);
  const kv = E.opsiMasalahGabungan(
    { jenis: 'volume', bangun: TANDON_B, dari: 'cm3', ke: 'm3' },
    'm³'
  );
  assert.equal(kv[0].label, '1,824 m³');
  const rp = E.opsiMasalahGabungan(
    { jenis: 'biayaWadah', luas: 2600, isiWadah: 1500, harga: 18000 },
    '',
    { awalan: 'Rp' }
  );
  assert.equal(rp[0].label, 'Rp36.000');
  /* soal tanpa pengecoh bawaan tetap mendapat 4 opsi dari cadangan */
  assert.ok(E.opsiMasalahGabungan({ jenis: 'volume', bangun: TANDON_C }, 'cm³').length >= 4);
});

test('gbgAngka: bulat bertitik ribuan, desimal sampai 3 angka', () => {
  assert.equal(E.gbgAngka(1824000), '1.824.000');
  assert.equal(E.gbgAngka(1.824), '1,824');
  assert.equal(E.gbgAngka(8.64), '8,64');
  assert.equal(E.gbgAngka(0.1 + 0.2), '0,3');
});

test('buildGbgSVG: bagian prisma & limas, bidang sambung saat dipisah', () => {
  const gabung = E.buildGbgSVG(TANDON_B, { label: true });
  assert.match(gabung, /^<svg/);
  assert.match(gabung, /gbg-face--prisma/);
  assert.match(gabung, /gbg-face--limas/);
  assert.doesNotMatch(gabung, /gbg-sambung/);
  assert.match(gabung, /120 cm/);
  const pisah = E.buildGbgSVG(TANDON_B, { pisah: true });
  assert.match(pisah, /gbg-sambung/);
  const garis = E.buildGbgSVG(TUGU, { garis: true });
  assert.match(garis, /gbg-garis-t/);
  assert.match(garis, /gbg-garis-ts/);
  assert.match(E.buildGbgSVG(TANDON_C), /gbg-face--prisma/);
  assert.match(E.buildGbgSVG(RUMAH), /aria-label="Rumah boneka/);
});

const LAB = {
  satuan: 'cm',
  target: { liter: 1750, perHari: 250, hari: 7 },
  desain: [
    { id: 'A', nama: 'Tandon A', bangun: { alas: { n: 4, s: 120 }, prisma: { t: 100 } } },
    { id: 'B', nama: 'Tandon B', bangun: TANDON_B },
    { id: 'C', nama: 'Tandon C', bangun: TANDON_C },
  ],
};

test('Lab Gabungan: state, pilih desain, pisah/gabung, selesai', () => {
  const state = {};
  const st = E.ensureGbgLabState(state, 'lab', LAB);
  assert.equal(st.d, 'A');
  assert.equal(st.pisah, false);
  assert.deepEqual(plain(st.dilihat), ['A']);
  assert.equal(E.gbgLabSelesai(st, LAB), false);
  E.gbgLabAtur(st, LAB, { d: 'B' });
  E.gbgLabAtur(st, LAB, { pisah: true });
  assert.equal(st.pernahPisah, true);
  E.gbgLabAtur(st, LAB, { d: 'C' });
  assert.equal(E.gbgLabSelesai(st, LAB), true);
  E.gbgLabAtur(st, LAB, { d: 'X' });
  assert.equal(st.d, 'C');
  /* state rusak dipulihkan */
  const rusak = { lab: { d: 'Z', dilihat: 'x' } };
  const st2 = E.ensureGbgLabState(rusak, 'lab', LAB);
  assert.equal(st2.d, 'A');
  assert.ok(Array.isArray(st2.dilihat));

  const html = E.buildGbgLab('lab', st, LAB);
  assert.match(html, /id="lab"/);
  assert.equal((html.match(/data-gbg-desain=/g) || []).length, 3);
  assert.match(html, /data-gbg-pisah/);
  assert.match(html, /2\.016/);
  const infoB = E.gbgLabInfoHTML(LAB, { d: 'B', pisah: false, dilihat: ['B'] });
  assert.match(infoB, /1\.440\.000/);
  assert.match(infoB, /384\.000/);
  assert.match(infoB, /1\.824 liter/);
  assert.match(infoB, /is-ok/);
  const infoA = E.gbgLabInfoHTML(LAB, { d: 'A', pisah: false, dilihat: ['A'] });
  assert.match(infoA, /is-tidak/);
});

const OBJEK = {
  id: 'tandonB',
  nama: 'Tandon B',
  bangun: TANDON_B,
  bahan: 'pelat',
  dipakai: TEGAK_B,
  alasan: 'Semua sisi luar memakai pelat; bidang sambung ada di dalam tandon.',
};

test('pemilih sisi gabungan: chip sisi luar & bidang sambung, umpan balik', () => {
  const state = {};
  E.ensureLpSisiState(state, 'sisi', [OBJEK]);
  const st = state.sisi.tandonB;
  let html = E.buildGbgSisiPicker('ps', OBJEK, st);
  assert.equal((html.match(/data-gbg-sisi=/g) || []).length, 11);
  assert.match(html, /data-gbg-cek/);
  assert.match(html, /Bagian prisma/);
  assert.match(html, /Bagian limas/);
  assert.match(html, /Bidang sambung/);

  TEGAK_B.concat(['sambung-p']).forEach((id) => E.lpSisiToggle(st, id));
  E.lpSisiPeriksa(OBJEK, st);
  assert.equal(st.benar, false);
  html = E.buildGbgSisiPicker('ps', OBJEK, st);
  assert.match(html, /bidang sambung/i);

  E.lpSisiToggle(st, 'sambung-p');
  E.lpSisiPeriksa(OBJEK, st);
  assert.equal(st.benar, true);
  html = E.buildGbgSisiPicker('ps', OBJEK, st);
  assert.match(html, /is-benar/);
  assert.doesNotMatch(html, /data-gbg-cek/);
  assert.match(E.gbgNamaSisi(OBJEK, { id: 'l2' }), /limas/i);
});
