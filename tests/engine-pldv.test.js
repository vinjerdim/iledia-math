'use strict';

/*
 * Tes seksi 83 shared/engine.js — PLDV & SPLDV (unsur, pasangan nilai
 * yang memenuhi, diagnosa miskonsepsi, tabel pasangan, bidang pasangan,
 * dan Lab SPLDV). Dipakai fase-d/mpi-16.1.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

const ROTI = { a: 3, b: 4, c: 24 };
const BARANG = { a: 1, b: 1, c: 7 };
const SELISIH = { a: 1, b: -1, c: 2, vx: 'p', vy: 'q' };
const PARKIR = [
  { a: 1, b: 1, c: 10 },
  { a: 2, b: 4, c: 28 },
];

/* ---------- Membaca & menulis ---------- */

test('teksPldv menulis bentuk baku (koefisien 1, negatif, variabel lain)', () => {
  assert.equal(E.teksPldv(ROTI), '3x + 4y = 24');
  assert.equal(E.teksPldv(BARANG), 'x + y = 7');
  assert.equal(E.teksPldv(SELISIH), 'p − q = 2');
  assert.equal(E.teksPldv({ a: -2, b: 5, c: -10, vx: 'm', vy: 'n' }), '−2m + 5n = −10');
  assert.equal(E.teksPldv({ a: 10, b: 6, c: 52, vx: 'd', vy: 'a' }), '10d + 6a = 52');
});

test('unsurPldv mengembalikan variabel, koefisien, dan konstanta', () => {
  const u = E.unsurPldv(SELISIH);
  assert.deepEqual(Array.from(u.variabel), ['p', 'q']);
  assert.equal(u.koefX, 1);
  assert.equal(u.koefY, -1);
  assert.equal(u.konstanta, 2);
});

test('teksSubstitusiPldv menuliskan langkah substitusi', () => {
  assert.equal(E.teksSubstitusiPldv(ROTI, 4, 3), '3 × 4 + 4 × 3 = 12 + 12 = 24');
  assert.equal(E.teksSubstitusiPldv(SELISIH, 1, 5), '1 − 5 = −4');
  assert.equal(E.teksSubstitusiPldv(BARANG, 2, 5), '2 + 5 = 7');
});

/* ---------- Memenuhi & penyelesaian ---------- */

test('memenuhiPldv & ruasKiriPldv', () => {
  assert.equal(E.ruasKiriPldv(ROTI, 4, 3), 24);
  assert.equal(E.memenuhiPldv(ROTI, 4, 3), true);
  assert.equal(E.memenuhiPldv(ROTI, 3, 4), false);
  assert.equal(E.memenuhiPldv(ROTI, 2, 4.5), true);
});

test('memenuhiSpldv membedakan satu, dua, dan keduanya', () => {
  const sis = [ROTI, BARANG];
  assert.deepEqual({ ...E.memenuhiSpldv(sis, 4, 3) }, { satu: true, dua: true, keduanya: true });
  assert.deepEqual({ ...E.memenuhiSpldv(sis, 0, 6) }, { satu: true, dua: false, keduanya: false });
  assert.deepEqual({ ...E.memenuhiSpldv(sis, 2, 5) }, { satu: false, dua: true, keduanya: false });
});

test('yDariXPldv & xDariYPldv', () => {
  assert.equal(E.yDariXPldv(ROTI, 0), 6);
  assert.equal(E.yDariXPldv(ROTI, 2), 4.5);
  assert.equal(E.xDariYPldv(ROTI, 3), 4);
  assert.equal(E.yDariXPldv({ a: 2, b: 0, c: 4 }, 1), null);
});

test('pasanganBulatPldv: pasangan cacah yang memenuhi', () => {
  const p = Array.from(E.pasanganBulatPldv(ROTI, 10), (t) => [t.x, t.y]);
  assert.deepEqual(p, [
    [0, 6],
    [4, 3],
    [8, 0],
  ]);
  assert.equal(E.pasanganBulatPldv(BARANG, 10).length, 8);
  /* y negatif tidak termasuk */
  assert.ok(E.pasanganBulatPldv(SELISIH, 5).every((t) => t.y >= 0));
});

test('penyelesaianSpldv: tunggal, banyak, tidak ada', () => {
  const r = E.penyelesaianSpldv([ROTI, BARANG]);
  assert.equal(r.jenis, 'tunggal');
  assert.equal(r.x, 4);
  assert.equal(r.y, 3);
  const r2 = E.penyelesaianSpldv(PARKIR);
  assert.deepEqual([r2.x, r2.y], [6, 4]);
  assert.equal(E.penyelesaianSpldv([BARANG, { a: 2, b: 2, c: 14 }]).jenis, 'banyak');
  assert.equal(E.penyelesaianSpldv([BARANG, { a: 2, b: 2, c: 10 }]).jenis, 'tidakAda');
});

/* ---------- Jenis kalimat dua variabel ---------- */

test('jenisKalimatDuaVar mengenali PLDV dan jebakannya', () => {
  assert.equal(E.jenisKalimatDuaVar('3x + 4y = 24'), 'pldv');
  assert.equal(E.jenisKalimatDuaVar('a + b = 12'), 'pldv');
  assert.equal(E.jenisKalimatDuaVar('m − n = 3'), 'pldv');
  assert.equal(E.jenisKalimatDuaVar('3x + 2 = 11'), 'plsv');
  assert.equal(E.jenisKalimatDuaVar('x² + y = 5'), 'bukanLinear');
  assert.equal(E.jenisKalimatDuaVar('pq = 24'), 'bukanLinear');
  assert.equal(E.jenisKalimatDuaVar('2x + 3y > 12'), 'bukanPersamaan');
  assert.equal(E.jenisKalimatDuaVar('2x + 3y'), 'bukanPersamaan');
  assert.equal(E.jenisKalimatDuaVar('5 + 3 = 8'), 'lainnya');
});

test('jenisSistemDuaVar: SPLDV hanya bila dua PLDV bervariabel sama', () => {
  assert.equal(E.jenisSistemDuaVar(['x + y = 10', '2x + 4y = 28']), 'spldv');
  assert.equal(E.jenisSistemDuaVar(['3x + 4y = 24']), 'pldv');
  assert.equal(E.jenisSistemDuaVar(['x + y = 10', 'a + b = 3']), 'bukan');
  assert.equal(E.jenisSistemDuaVar(['x + y = 10', 'x² = 4']), 'bukan');
  assert.equal(E.jenisSistemDuaVar(['3x + 2 = 11']), 'bukan');
});

/* ---------- Diagnosa unsur ---------- */

test('diagnosaUnsurPldv: benar, tanda, tertukar, konstanta↔koefisien, koefisien 1', () => {
  assert.equal(E.diagnosaUnsurPldv(ROTI, 'koefX', 3), 'benar');
  assert.equal(E.diagnosaUnsurPldv(ROTI, 'koefX', 4), 'tertukar');
  assert.equal(E.diagnosaUnsurPldv(ROTI, 'koefY', 24), 'konstantaDikiraKoef');
  assert.equal(E.diagnosaUnsurPldv(ROTI, 'konstanta', 3), 'koefDikiraKonstanta');
  assert.equal(E.diagnosaUnsurPldv(SELISIH, 'koefY', 1), 'tanda');
  assert.equal(E.diagnosaUnsurPldv(BARANG, 'koefX', 0), 'koefSatu');
  assert.equal(E.diagnosaUnsurPldv(ROTI, 'koefX', 9), 'salah');
  ['tanda', 'tertukar', 'konstantaDikiraKoef', 'koefDikiraKonstanta', 'koefSatu', 'salah'].forEach(
    (k) => assert.ok(E.pesanUnsurPldv(k, ROTI, 'koefX').length > 20, k)
  );
});

test('diagnosaVariabelPldv menerima urutan bebas', () => {
  assert.equal(E.diagnosaVariabelPldv(ROTI, 'y, x'), 'benar');
  assert.equal(E.diagnosaVariabelPldv(SELISIH, 'p dan q'), 'benar');
  assert.equal(E.diagnosaVariabelPldv(ROTI, 'x'), 'kurang');
  assert.equal(E.diagnosaVariabelPldv(ROTI, ''), 'kosong');
  assert.equal(E.diagnosaVariabelPldv(ROTI, 'a, b'), 'salah');
});

test('periksaUnsurPldv memeriksa keempat isian', () => {
  const ok = E.periksaUnsurPldv(SELISIH, {
    variabel: 'p, q',
    koefX: '1',
    koefY: '−1',
    konstanta: '2',
  });
  assert.equal(ok.lengkap, true);
  assert.equal(ok.tepat, true);
  const salah = E.periksaUnsurPldv(SELISIH, {
    variabel: 'p, q',
    koefX: '1',
    koefY: '1',
    konstanta: '2',
  });
  assert.equal(salah.tepat, false);
  assert.equal(salah.kode.koefY, 'tanda');
  assert.equal(E.periksaUnsurPldv(ROTI, { variabel: 'x, y' }).lengkap, false);
});

/* ---------- Diagnosa pasangan ---------- */

test('diagnosaYPldv: tertukar, lupa membagi, salah', () => {
  assert.equal(E.diagnosaYPldv(ROTI, 4, 3), 'benar');
  assert.equal(E.diagnosaYPldv(ROTI, 2, 4.5), 'benar');
  assert.equal(E.diagnosaYPldv(ROTI, 4, 12), 'lupaBagi');
  assert.equal(E.diagnosaYPldv(ROTI, 0, 8), 'tertukar');
  assert.equal(E.diagnosaYPldv(ROTI, 4, 5), 'salah');
  ['tertukar', 'lupaBagi', 'salah'].forEach((k) =>
    assert.ok(E.pesanYPldv(k, ROTI, 4).length > 20, k)
  );
});

test('diagnosaPasanganPldv: tertukar & tanpa koefisien', () => {
  assert.equal(E.diagnosaPasanganPldv(ROTI, 4, 3), 'benar');
  assert.equal(E.diagnosaPasanganPldv(ROTI, 3, 4), 'tertukar');
  const P = { a: 10, b: 6, c: 52 };
  assert.equal(E.diagnosaPasanganPldv(P, 2, 2), 'salahHitung');
  assert.equal(E.diagnosaPasanganPldv({ a: 2, b: 5, c: 16 }, 2, 3), 'tertukar');
  assert.equal(E.diagnosaPasanganPldv({ a: 2, b: 5, c: 7 }, 3, 4), 'tanpaKoef');
  assert.match(E.pesanPasanganPldv('salahHitung', ROTI, 3, 4), /25/);
});

test('diagnosaPasanganSpldv: hanya satu persamaan & tertukar', () => {
  assert.equal(E.diagnosaPasanganSpldv(PARKIR, 6, 4), 'benar');
  assert.equal(E.diagnosaPasanganSpldv(PARKIR, 4, 6), 'tertukar');
  assert.equal(E.diagnosaPasanganSpldv(PARKIR, 8, 2), 'hanyaSatu');
  assert.equal(E.diagnosaPasanganSpldv(PARKIR, 2, 6), 'hanyaDua');
  assert.equal(E.diagnosaPasanganSpldv(PARKIR, 1, 1), 'tidakKeduanya');
  ['hanyaSatu', 'hanyaDua', 'tertukar', 'tidakKeduanya'].forEach((k) =>
    assert.ok(E.pesanPasanganSpldv(k, PARKIR, 8, 2).length > 20, k)
  );
});

/* ---------- Soal isian ---------- */

test('nilaiSoalPldv & diagnosaSoalPldv', () => {
  assert.equal(E.nilaiSoalPldv({ pers: ROTI, minta: 'koefY' }), 4);
  assert.equal(E.nilaiSoalPldv({ pers: ROTI, minta: 'y', x: 4 }), 3);
  assert.equal(E.nilaiSoalPldv({ sistem: PARKIR, minta: 'x' }), 6);
  assert.equal(E.diagnosaSoalPldv({ sistem: PARKIR, minta: 'x' }, 4), 'tertukar');
  assert.equal(E.diagnosaSoalPldv({ sistem: PARKIR, minta: 'x' }, 6), 'benar');
  assert.equal(E.diagnosaSoalPldv({ pers: ROTI, minta: 'y', x: 4 }, 12), 'lupaBagi');
  assert.equal(E.diagnosaSoalPldv({ pers: ROTI, minta: 'koefX' }, 4), 'tertukar');
  assert.ok(E.pesanSoalPldv({ sistem: PARKIR, minta: 'x' }, 'salah').length > 20);
});

/* ---------- Tabel pasangan isian ---------- */

test('periksaTabelPasangan: lengkap, tepat, dan kode salah per baris', () => {
  const st = E.makeTabelPasanganState();
  const xs = [0, 2, 4];
  assert.equal(E.periksaTabelPasangan(ROTI, xs, st).lengkap, false);
  st.y = { 0: '6', 1: '4,5', 2: '3' };
  const h = E.periksaTabelPasangan(ROTI, xs, st);
  assert.equal(h.lengkap, true);
  assert.equal(h.tepat, true);
  st.y = { 0: '8', 1: '4,5', 2: '12' };
  const h2 = E.periksaTabelPasangan(ROTI, xs, st);
  assert.equal(h2.tepat, false);
  assert.deepEqual(
    Array.from(h2.salah, (s) => [s.i, s.kode]),
    [
      [0, 'tertukar'],
      [2, 'lupaBagi'],
    ]
  );
});

test('ensureTabelPasanganState memulihkan state rusak', () => {
  const h = { t: { y: [], attempts: 'x' } };
  const st = E.ensureTabelPasanganState(h, 't');
  assert.equal(typeof st.y, 'object');
  assert.ok(!Array.isArray(st.y));
  assert.equal(st.attempts, 0);
});

test('buildTabelPasangan: isian saat dikerjakan, kolom cek saat selesai', () => {
  const st = E.makeTabelPasanganState();
  const html = E.buildTabelPasangan('tp', ROTI, [0, 2, 4], st, { labelX: 'Roti', labelY: 'Susu' });
  assert.equal((html.match(/data-tpp-y=/g) || []).length, 3);
  st.tepat = true;
  const selesai = E.buildTabelPasangan('tp', ROTI, [0, 2, 4], st, {});
  assert.doesNotMatch(selesai, /data-tpp-y=/);
  assert.match(selesai, /3 × 4 \+ 4 × 3/);
  assert.match(selesai, /4,5/);
});

/* ---------- Bidang pasangan & Lab SPLDV ---------- */

test('buildBidangPasangan menggambar titik setiap seri dan titik sorot', () => {
  const svg = E.buildBidangPasangan(
    [
      { pers: ROTI, label: '3x + 4y = 24' },
      { pers: BARANG, label: 'x + y = 7' },
    ],
    { maks: 10, sorot: { x: 4, y: 3 } }
  );
  assert.match(svg, /^<figure/);
  assert.equal((svg.match(/class="pldv-titik pldv-titik--0"/g) || []).length, 3);
  assert.equal((svg.match(/class="pldv-titik pldv-titik--1"/g) || []).length, 8);
  assert.match(svg, /pldv-sorot/);
});

const LAB = {
  maks: 10,
  sistem: [
    { id: 'roti', judul: 'Roti & susu', pers: [ROTI, BARANG] },
    { id: 'parkir', judul: 'Parkir', pers: PARKIR },
  ],
};

test('Lab SPLDV: stepper dibatasi, temuan dicatat per sistem', () => {
  const st = E.makeLabSpldvState();
  E.ubahLabSpldv(st, LAB, 'x', -1);
  assert.equal(st.x, 0);
  E.ubahLabSpldv(st, LAB, 'y', 6); /* (0, 6) → hanya pers. 1 */
  assert.equal(st.temuan['roti:satu'], true);
  E.ubahLabSpldv(st, LAB, 'x', 4);
  E.ubahLabSpldv(st, LAB, 'y', -3); /* (4, 3) → keduanya */
  assert.equal(st.temuan['roti:keduanya'], true);
  E.ubahLabSpldv(st, LAB, 'y', -1); /* (4, 2) → tidak keduanya */
  E.ubahLabSpldv(st, LAB, 'y', 1);
  E.ubahLabSpldv(st, LAB, 'x', 1);
  E.ubahLabSpldv(st, LAB, 'y', -1); /* (5, 2) → hanya pers. 2 */
  assert.equal(st.temuan['roti:dua'], true);
  assert.equal(E.labSpldvSelesai(st, LAB), false);
  E.ubahLabSpldv(st, LAB, 'sistem', 'parkir');
  assert.equal(st.sistem, 'parkir');
  E.ubahLabSpldv(st, LAB, 'x', 20);
  assert.equal(st.x, 10);
  st.x = 6;
  st.y = 3;
  E.ubahLabSpldv(st, LAB, 'y', 1);
  assert.equal(st.temuan['parkir:keduanya'], true);
  assert.equal(E.labSpldvSelesai(st, LAB), true);
});

test('buildLabSpldv merender substitusi kedua persamaan', () => {
  const st = E.makeLabSpldvState();
  st.x = 4;
  st.y = 3;
  const html = E.buildLabSpldv('lab', st, LAB);
  assert.match(html, /3 × 4 \+ 4 × 3 = 12 \+ 12 = 24/);
  assert.match(html, /4 \+ 3 = 7/);
  assert.equal((html.match(/data-spl-ubah=/g) || []).length, 4);
  assert.equal((html.match(/data-spl-sistem=/g) || []).length, 2);
});
