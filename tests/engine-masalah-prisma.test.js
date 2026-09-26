'use strict';

/*
 * Tes fungsi masalah kontekstual luas permukaan prisma (shared/engine.js
 * seksi 48): luas sisi yang benar-benar memakai bahan, pemeriksaan
 * pilihan sisi, konversi satuan luas, pembulatan banyak bahan yang dibeli
 * (ke atas) dan banyak benda yang dapat dibuat (ke bawah), rekap
 * anggaran, pengecoh berdiagnosa, diagnosa jawaban soal kontekstual, dan
 * komponen UI (pemilih sisi, tabel anggaran, papan proposal) serta
 * isian berformat angka Indonesia pada kartu isian seksi 47.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function nilai(list) {
  return plain(list.map((p) => p.nilai));
}

/* Tenda: segitiga sama kaki alas 4 m, kaki 2,5 m, tinggi 1,5 m; panjang 5 m. */
const TENDA = [
  [0, 0],
  [4, 0],
  [2, 1.5],
];
/* Etalase: alas 60 cm × 30 cm, tinggi 40 cm. */
const ETALASE = [
  [0, 0],
  [60, 0],
  [60, 30],
  [0, 30],
];

test('luasSisiDipakai: jumlah luas sisi terpilih saja', () => {
  assert.equal(E.luasSisiDipakai(TENDA, 5, ['atas', 't1', 't2']), 28);
  assert.equal(E.luasSisiDipakai(TENDA, 5, ['alas', 'atas', 't0', 't1', 't2']), 51);
  assert.equal(E.luasSisiDipakai(ETALASE, 40, ['atas', 't0', 't1', 't3']), 6600);
  assert.equal(E.luasSisiDipakai(ETALASE, 40, []), 0);
  /* id yang tidak dikenal diabaikan */
  assert.equal(E.luasSisiDipakai(ETALASE, 40, ['atas', 'x9']), 1800);
});

test('periksaSisiDipakai: benar, kurang, dan lebih', () => {
  assert.deepEqual(plain(E.periksaSisiDipakai(['t2', 'atas', 't1'], ['atas', 't1', 't2'])), {
    benar: true,
    kurang: [],
    lebih: [],
  });
  assert.deepEqual(plain(E.periksaSisiDipakai(['atas', 't0'], ['atas', 't1', 't2'])), {
    benar: false,
    kurang: ['t1', 't2'],
    lebih: ['t0'],
  });
});

test('konversiLuas: mm², cm², dm², m²', () => {
  assert.equal(E.konversiLuas(34200, 'cm²', 'm²'), 3.42);
  assert.equal(E.konversiLuas(6600, 'cm²', 'm²'), 0.66);
  assert.equal(E.konversiLuas(2, 'm²', 'cm²'), 20000);
  assert.equal(E.konversiLuas(5, 'dm²', 'cm²'), 500);
  assert.equal(E.konversiLuas(250, 'mm²', 'cm²'), 2.5);
  assert.throws(() => E.konversiLuas(1, 'km²', 'm²'));
});

test('banyakWadah (ke atas) & banyakMuat (ke bawah)', () => {
  assert.equal(E.banyakWadah(15600, 3000), 6);
  assert.equal(E.banyakWadah(3.42, 2), 2);
  assert.equal(E.banyakWadah(6000, 3000), 2);
  /* galat biner tidak menambah satu wadah */
  assert.equal(E.banyakWadah(0.1 + 0.2, 0.3), 1);
  assert.equal(E.banyakMuat(15000, 312), 48);
  assert.equal(E.banyakMuat(15600, 312), 50);
  assert.equal(E.banyakMuat(0.3, 0.1), 3);
});

test('rekapAnggaran: total, sisa, dan status cukup', () => {
  const baris = [
    { id: 'a', nama: 'Karton', biaya: 24000 },
    { id: 'b', nama: 'Kain', biaya: 420000 },
    { id: 'c', nama: 'Cat', biaya: 70000 },
    { id: 'd', nama: 'Kaca', biaya: 99000 },
  ];
  assert.deepEqual(plain(E.rekapAnggaran(baris, 600000)), {
    total: 613000,
    sisa: -13000,
    cukup: false,
  });
  assert.deepEqual(plain(E.rekapAnggaran(baris.slice(0, 3), 600000)), {
    total: 514000,
    sisa: 86000,
    cukup: true,
  });
});

test('pengecohSisiDipakai: semua sisi, sisi terlewat, sisi berlebih', () => {
  const p = E.pengecohSisiDipakai(TENDA, 5, ['atas', 't1', 't2']);
  const v = nilai(p);
  assert.ok(v.includes(51), 'LP penuh');
  assert.ok(v.includes(31), 'dinding depan ikut dihitung');
  assert.ok(v.includes(48), 'lantai ikut dihitung');
  assert.ok(v.includes(25), 'dinding belakang terlewat');
  assert.ok(v.includes(15.5), 'satu atap terlewat');
  assert.ok(!v.includes(28), 'tidak memuat jawaban benar');
  assert.equal(new Set(v).size, v.length, 'nilai unik');
  p.forEach((x) => assert.ok(x.kode && x.pesan));
  assert.equal(p.find((x) => x.nilai === 51).kode, 'semua-sisi');
});

test('pengecohBanyakWadah & pengecohKonversiLuas', () => {
  const w = E.pengecohBanyakWadah(15600, 3000);
  assert.deepEqual(nilai(w), [5, 5.2]);
  assert.deepEqual(plain(w.map((x) => x.kode)), ['bulat-bawah', 'belum-bulat']);
  /* hasil bagi bulat: tidak ada pengecoh pembulatan */
  assert.deepEqual(plain(E.pengecohBanyakWadah(6000, 3000)), []);

  const k = E.pengecohKonversiLuas(34200, 'cm²', 'm²');
  assert.deepEqual(nilai(k), [342, 34.2, 342000000]);
  k.forEach((x) => assert.ok(x.pesan && /10\.000/.test(x.pesan), x.kode));
  const k2 = E.pengecohKonversiLuas(2, 'm²', 'cm²');
  assert.ok(nilai(k2).includes(200));
});

test('kandidatMasalahLp & diagnosaMasalahLp untuk tiap jenis soal', () => {
  const lp = { jenis: 'lp', luasAlas: 1500, kelilingAlas: 160, tinggi: 40, tanpaTutup: true };
  assert.equal(E.kandidatMasalahLp(lp).benar, 7900);
  assert.equal(E.diagnosaMasalahLp(lp, 7900).kode, 'benar');
  assert.equal(E.diagnosaMasalahLp(lp, 9400).kode, 'dua-alas');

  const dp = { jenis: 'dipakai', alas: TENDA, t: 5, pakai: ['atas', 't1', 't2'] };
  assert.equal(E.kandidatMasalahLp(dp).benar, 28);
  assert.equal(E.diagnosaMasalahLp(dp, 51).kode, 'semua-sisi');

  const wd = { jenis: 'wadah', luasSatu: 312, banyak: 50, isiWadah: 3000 };
  assert.equal(E.kandidatMasalahLp(wd).benar, 6);
  assert.equal(E.diagnosaMasalahLp(wd, 5).kode, 'bulat-bawah');
  assert.equal(E.diagnosaMasalahLp(wd, 1).kode, 'lupa-banyak');

  const kv = { jenis: 'konversi', nilai: 36400, dari: 'cm²', ke: 'm²' };
  assert.equal(E.kandidatMasalahLp(kv).benar, 3.64);
  assert.equal(E.diagnosaMasalahLp(kv, 364).kode, 'faktor-panjang');

  const tg = { jenis: 'tinggi', luasPermukaan: 592, luasAlas: 80, kelilingAlas: 36 };
  assert.equal(E.kandidatMasalahLp(tg).benar, 12);
  assert.equal(E.diagnosaMasalahLp(tg, 432).kode, 'lupa-bagi');

  const mt = { jenis: 'muat', luasTersedia: 15000, luasSatu: 312 };
  assert.equal(E.kandidatMasalahLp(mt).benar, 48);
  assert.equal(E.diagnosaMasalahLp(mt, 49).kode, 'muat-atas');

  const bi = {
    jenis: 'biaya',
    luasAlas: 160,
    kelilingAlas: 56,
    tinggi: 6,
    harga: 3,
  };
  assert.equal(E.kandidatMasalahLp(bi).benar, 1968);
  assert.equal(E.diagnosaMasalahLp(bi, 1488).kode, 'satu-alas');

  const x = E.diagnosaMasalahLp(lp, 123456);
  assert.equal(x.kode, 'salah-hitung');
  assert.ok(x.pesan);
  Object.keys(E.LPK_PESAN).forEach((k) => assert.ok(E.LPK_PESAN[k], k));
});

test('opsiMasalahLp: benar di depan, pengecoh unik, minimal 4 opsi', () => {
  const o = E.opsiMasalahLp(
    { jenis: 'wadah', luasSatu: 1300, banyak: 3, isiWadah: 2000 },
    'lembar'
  );
  assert.ok(o.length >= 4);
  assert.equal(o[0].id, 'benar');
  assert.equal(o[0].nilai, 2);
  assert.equal(o[0].label, '2 lembar');
  assert.equal(new Set(o.map((x) => x.nilai)).size, o.length);
  assert.equal(new Set(o.map((x) => x.id)).size, o.length);
  o.forEach((x) => assert.ok(x.nilai > 0));
});

test('buildLpNetSVG: satuan & sisi terpilih', () => {
  const j = E.jaringPrismaUmum(TENDA, 5);
  const svg = E.buildLpNetSVG(j, { pilih: true, dipilih: ['t1'], satuan: 'm' });
  assert.match(svg, /2,5 m/);
  assert.doesNotMatch(svg, / cm</);
  assert.match(svg, /data-lpp-sisi="t1"[^>]*aria-pressed="true"/);
  assert.match(svg, /is-dipilih/);
  /* bawaan tetap cm */
  assert.match(E.buildLpNetSVG(j), /2,5 cm/);
});

const OBJ = {
  id: 'tenda',
  nama: 'Tenda stand',
  alas: TENDA,
  t: 5,
  satuan: 'm',
  namaSisi: {
    alas: 'Dinding depan',
    atas: 'Dinding belakang',
    t0: 'Lantai',
    t1: 'Atap kanan',
    t2: 'Atap kiri',
  },
  dipakai: ['atas', 't1', 't2'],
};

test('ensureLpSisiState & pemilih sisi: toggle, periksa, kunci', () => {
  const S = {};
  const map = E.ensureLpSisiState(S, 'sisi', [OBJ]);
  assert.deepEqual(plain(map.tenda), { pilih: [], cek: false, benar: false, coba: 0 });
  const st = map.tenda;
  E.lpSisiToggle(st, 't1');
  E.lpSisiToggle(st, 't0');
  E.lpSisiToggle(st, 't0');
  assert.deepEqual(plain(st.pilih), ['t1']);
  let r = E.lpSisiPeriksa(OBJ, st);
  assert.equal(r.benar, false);
  assert.equal(st.coba, 1);
  assert.equal(st.cek, true);
  let html = E.buildLpSisiPicker('ps', OBJ, st);
  assert.match(html, /belum dipilih/);
  /* nama sisi baru dibuka setelah dua kali mencoba */
  assert.doesNotMatch(html, /Dinding belakang<\/strong>/);
  E.lpSisiPeriksa(OBJ, st);
  html = E.buildLpSisiPicker('ps', OBJ, st);
  assert.match(html, /<strong>Dinding belakang<\/strong>/);
  E.lpSisiToggle(st, 'atas');
  E.lpSisiToggle(st, 't2');
  r = E.lpSisiPeriksa(OBJ, st);
  assert.equal(r.benar, true);
  assert.equal(st.benar, true);
  /* terkunci setelah benar */
  E.lpSisiToggle(st, 't0');
  assert.equal(st.pilih.length, 3);
  html = E.buildLpSisiPicker('ps', OBJ, st);
  assert.doesNotMatch(html, /data-lpk-cek/);
  assert.match(html, /is-benar/);
  /* state rusak dipulihkan */
  S.sisi.tenda = { pilih: 'x' };
  E.ensureLpSisiState(S, 'sisi', [OBJ]);
  assert.deepEqual(plain(S.sisi.tenda.pilih), []);
});

test('buildLpAnggaran & buildLpProposal', () => {
  const baris = [
    { id: 'a', nama: 'Karton', rincian: '6 lembar × Rp4.000', biaya: 24000 },
    { id: 'b', nama: 'Kain', rincian: '28 m² × Rp15.000', biaya: 420000 },
  ];
  const t = E.buildLpAnggaran(baris, 400000);
  assert.match(t, /<table/);
  assert.match(t, /Rp444\.000/);
  assert.match(t, /kurang/i);
  assert.match(t, /Rp44\.000/);
  assert.match(E.buildLpAnggaran(baris, 500000), /Rp56\.000/);
  const p = E.buildLpProposal({
    judul: 'Proposal <Stand>',
    keputusan: [{ ikon: '📦', judul: 'Kemasan', isi: 'Desain C' }],
    anggaran: { baris: baris, dana: 500000 },
    penutup: 'Terima kasih',
  });
  assert.match(p, /Proposal &lt;Stand&gt;/);
  assert.match(p, /Desain C/);
  assert.match(p, /<table/);
});

test('kartu isian: field angka menerima pemisah ribuan & koma desimal', () => {
  const kartu = {
    id: 'k',
    fields: [
      { id: 'biaya', jawab: 24000, angka: true },
      { id: 'm2', jawab: 0.66, angka: true },
      { id: 'lama', jawab: 7.5 },
    ],
  };
  const st = { input: {}, hasil: {} };
  const r = E.periksaLpKartu(kartu, st, { biaya: 'Rp24.000', m2: '0,66', lama: '7.5' });
  assert.equal(r.error, null);
  assert.equal(r.benar, true);
});

test('buildLpNetSVG: tanda nomor di tengah kepingan & pemilih sisi bernomor', () => {
  const j = E.jaringPrismaUmum(TENDA, 5);
  const svg = E.buildLpNetSVG(j, { tanda: { alas: '1', t0: '3' } });
  assert.equal((svg.match(/class="lpk-tanda"/g) || []).length, 2);
  const html = E.buildLpSisiPicker('ps', OBJ, { pilih: [], cek: false, benar: false, coba: 0 });
  assert.equal((html.match(/class="lpk-tanda"/g) || []).length, 5);
  assert.equal((html.match(/data-lpk-sisi=/g) || []).length, 5);
  assert.match(html, /Atap kiri/);
  assert.match(html, /2,5 m × 5 m/);
});
