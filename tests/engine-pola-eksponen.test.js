'use strict';

/*
 * Tes shared/engine.js seksi 27 (lanjutan) — komponen eksplorasi pola
 * numerik bilangan berpangkat bulat positif: tabel pangkat, tabel pola
 * perkalian/pembagian/pangkat dari pangkat beserta diagnosa eksponen
 * keliru, serta perluasan lab uji sifat (dugaan keliru pembagian &
 * pangkat dari pangkat, mode eksponen positif, nama sifat kustom).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

/* ---------------- Tabel pangkat ---------------- */

test('powerTable: sel isian naik dari `dari` ke `sampai`, tanpa sel diketahui', () => {
  const cfg = { a: 2, dari: 1, sampai: 6, diketahui: [1, 2] };
  assert.deepEqual(Array.from(E.powerTableEditable(cfg)), [3, 4, 5, 6]);
  const kunci = { 3: '8', 4: '16', 5: '32', 6: '64' };
  assert.equal(E.powerTableFilled(cfg, kunci), true);
  assert.equal(E.powerTableAllCorrect(cfg, kunci), true);
  assert.equal(E.powerTableAllCorrect(cfg, Object.assign({}, kunci, { 5: '10' })), false);
  assert.equal(E.powerTableFilled(cfg, { 3: '8' }), false);
});

test('powerTable: isian ribuan gaya Indonesia dibaca benar', () => {
  const cfg = { a: 2, dari: 10, sampai: 10, diketahui: [] };
  assert.equal(E.powerTableAllCorrect(cfg, { 10: '1.024' }), true);
  assert.equal(E.powerTableAllCorrect(cfg, { 10: '1024' }), true);
});

test('buildPowerTable: sel diketahui, isian, sorotan, dan tanda periksa', () => {
  const cfg = { a: 3, dari: 1, sampai: 4, diketahui: [1] };
  const html = E.buildPowerTable('pt', cfg, { 2: '9', 3: '20' }, { checked: true, highlight: [2] });
  assert.match(html, /3¹/);
  assert.match(html, /3⁴/);
  assert.equal((html.match(/<input/g) || []).length, 3);
  assert.match(html, /data-ptable="pt"/);
  assert.match(html, /pw-table__cell--hl/);
  assert.match(html, /pw-table__mark--ok/);
  assert.match(html, /pw-table__mark--no/);
  const lengkap = E.buildPowerTable('pt', { a: 2, dari: 1, sampai: 3, diketahui: [1, 2, 3] }, {});
  assert.doesNotMatch(lengkap, /<input/);
  assert.match(lengkap, />8</);
  const tanya = E.buildPowerTable('pt', cfg, {}, { tanya: true });
  assert.doesNotMatch(tanya, /<input/);
  assert.match(tanya, /\?/);
  assert.match(E.buildPowerTable('pt', cfg, {}, { compact: true }), /pw-table--compact/);
  const kunci = E.buildPowerTable('pt', cfg, {}, { locked: true });
  assert.match(kunci, /disabled/);
});

/* ---------------- Tabel pola eksponen ---------------- */

test('polaEksponenKunci: nilai & eksponen hasil dihitung dari definisi', () => {
  const kali = E.polaEksponenKunci('kali', 2, 3, 4);
  assert.equal(kali.nilai, 128);
  assert.equal(kali.k, 7);
  assert.equal(kali.teks, '2³ × 2⁴');
  const bagi = E.polaEksponenKunci('bagi', 3, 5, 2);
  assert.equal(bagi.nilai, 27);
  assert.equal(bagi.k, 3);
  assert.equal(bagi.teks, '3⁵ : 3²');
  const pangkat = E.polaEksponenKunci('pangkat', 2, 3, 2);
  assert.equal(pangkat.nilai, 64);
  assert.equal(pangkat.k, 6);
  assert.equal(pangkat.teks, '(2³)²');
  assert.throws(() => E.polaEksponenKunci('akar', 2, 1, 1));
});

test('polaEksponenKunci: hasil selalu sama dengan Math.pow(a, k)', () => {
  ['kali', 'bagi', 'pangkat'].forEach((op) => {
    for (let a = 2; a <= 5; a++) {
      for (let m = 1; m <= 5; m++) {
        for (let n = 1; n <= 4; n++) {
          if (op === 'bagi' && m <= n) continue;
          const r = E.polaEksponenKunci(op, a, m, n);
          assert.equal(r.nilai, Math.pow(a, r.k), op + ' ' + a + ' ' + m + ' ' + n);
        }
      }
    }
  });
});

test('diagnosaPolaEksponen: mengenali operasi eksponen yang keliru', () => {
  assert.equal(E.diagnosaPolaEksponen('kali', 3, 4, 7), 'benar');
  assert.equal(E.diagnosaPolaEksponen('kali', 3, 4, 12), 'kali');
  assert.equal(E.diagnosaPolaEksponen('kali', 3, 4, 1), 'selisih');
  assert.equal(E.diagnosaPolaEksponen('bagi', 6, 2, 4), 'benar');
  assert.equal(E.diagnosaPolaEksponen('bagi', 6, 2, 3), 'bagi');
  assert.equal(E.diagnosaPolaEksponen('bagi', 6, 2, 8), 'jumlah');
  assert.equal(E.diagnosaPolaEksponen('pangkat', 2, 3, 6), 'benar');
  assert.equal(E.diagnosaPolaEksponen('pangkat', 2, 3, 5), 'jumlah');
  assert.equal(E.diagnosaPolaEksponen('pangkat', 2, 3, 8), 'pangkatBertingkat');
  assert.equal(E.diagnosaPolaEksponen('pangkat', 2, 3, 11), 'lain');
  ['jumlah', 'selisih', 'kali', 'bagi', 'pangkatBertingkat', 'lain'].forEach((k) => {
    const p = E.pesanDiagnosaPolaEksponen(k, 'kali', 2, 3, 4, 12);
    assert.ok(p.length > 20, k);
  });
});

test('pesanDiagnosaPolaEksponen: menyebut nilai pembanding dari tabel', () => {
  const p = E.pesanDiagnosaPolaEksponen('kali', 'kali', 2, 3, 2, 6);
  assert.match(p, /2⁶/);
  assert.match(p, /64/);
  assert.match(p, /32/);
});

const CFG_POLA = {
  id: 'pk',
  operasi: 'kali',
  baris: [
    { a: 2, m: 2, n: 3 },
    { a: 2, m: 3, n: 4 },
  ],
};

test('pola: status baris, terisi, dan semua benar', () => {
  const inputs = { 0: { nilai: '32', k: '5' }, 1: { nilai: '128', k: '12' } };
  const s0 = E.polaBarisStatus(CFG_POLA, 0, inputs);
  assert.equal(s0.terisi, true);
  assert.equal(s0.nilaiBenar, true);
  assert.equal(s0.kBenar, true);
  const s1 = E.polaBarisStatus(CFG_POLA, 1, inputs);
  assert.equal(s1.nilaiBenar, true);
  assert.equal(s1.kBenar, false);
  assert.equal(E.polaSemuaTerisi(CFG_POLA, inputs), true);
  assert.equal(E.polaSemuaBenar(CFG_POLA, inputs), false);
  inputs[1].k = '7';
  assert.equal(E.polaSemuaBenar(CFG_POLA, inputs), true);
  assert.equal(E.polaSemuaTerisi(CFG_POLA, { 0: { nilai: '32' } }), false);
  assert.equal(E.polaSemuaTerisi(CFG_POLA, {}), false);
});

test('pola: eksponen harus bilangan bulat positif tertulis', () => {
  const inputs = { 0: { nilai: '32', k: '5,0' }, 1: { nilai: '1.0', k: '7' } };
  assert.equal(E.polaBarisStatus(CFG_POLA, 0, inputs).kBenar, false);
  assert.equal(E.polaBarisStatus(CFG_POLA, 1, inputs).nilaiBenar, false);
});

test('pola: diagnosa baris memberi kode & pesan', () => {
  const inputs = { 0: { nilai: '30', k: '5' }, 1: { nilai: '128', k: '12' } };
  const d0 = E.diagnosaPolaBaris(CFG_POLA, 0, inputs);
  assert.equal(d0.kode, 'nilai');
  assert.ok(d0.pesan.length > 10);
  const d1 = E.diagnosaPolaBaris(CFG_POLA, 1, inputs);
  assert.equal(d1.kode, 'kali');
  assert.equal(E.diagnosaPolaBaris(CFG_POLA, 0, { 0: { nilai: '32', k: '5' } }), null);
});

test('buildPolaEksponen: isian per baris, tanda periksa, dan kolom m-n-k', () => {
  const inputs = { 0: { nilai: '32', k: '5' }, 1: { nilai: '100', k: '' } };
  const html = E.buildPolaEksponen('pk', CFG_POLA, inputs, { checked: true });
  assert.match(html, /2² × 2³/);
  assert.match(html, /2³ × 2⁴/);
  assert.equal((html.match(/<input/g) || []).length, 4);
  assert.match(html, /data-pola="pk"/);
  assert.match(html, /pola-tbl__mark--ok/);
  assert.match(html, /pola-tbl__mark--no/);
  assert.doesNotMatch(html, /pola-tbl__mn/);
  const selesai = E.buildPolaEksponen(
    'pk',
    CFG_POLA,
    { 0: { nilai: '32', k: '5' }, 1: { nilai: '128', k: '7' } },
    { locked: true, tampilMN: true }
  );
  assert.doesNotMatch(selesai, /<input/);
  assert.match(selesai, /pola-tbl__mn/);
  assert.match(selesai, />128</);
  assert.match(selesai, />7</);
});

test('buildPolaEksponen: pembagian & pangkat dari pangkat', () => {
  const bagi = E.buildPolaEksponen('pb', { operasi: 'bagi', baris: [{ a: 2, m: 6, n: 2 }] }, {});
  assert.match(bagi, /2⁶ : 2²/);
  const pangkat = E.buildPolaEksponen(
    'pp',
    { operasi: 'pangkat', baris: [{ a: 3, m: 2, n: 2 }] },
    {}
  );
  assert.match(pangkat, /\(3²\)²/);
});

/* ---------------- Perluasan lab uji sifat ---------------- */

test('SIFAT_EKSPONEN: dugaan keliru pembagian & pangkat dari pangkat', () => {
  ['salahBagi', 'salahPangkat'].forEach((id) => {
    assert.ok(E.SIFAT_EKSPONEN[id], id);
    assert.equal(E.SIFAT_EKSPONEN[id].keliru, true, id);
  });
  const b = E.cekSifatEksponen('salahBagi', 2, 6, 2);
  assert.equal(b.terdefinisi, true);
  assert.equal(b.sama, false, '2⁶ : 2² = 16, 2³ = 8');
  assert.equal(b.teksKanan, '2³');
  assert.equal(b.catatan, '6 : 2 = 3');
  assert.equal(E.cekSifatEksponen('salahBagi', 2, 4, 2).sama, true, '4 : 2 = 4 − 2 kebetulan');
  const tak = E.cekSifatEksponen('salahBagi', 2, 5, 2);
  assert.equal(tak.terdefinisi, false);
  assert.equal(tak.alasan, 'bukanBulat');
  const p = E.cekSifatEksponen('salahPangkat', 2, 3, 2);
  assert.equal(p.sama, false);
  assert.equal(p.teksKiri, '(2³)²');
  assert.equal(p.teksKanan, '2⁵');
  assert.equal(p.catatan, '3 + 2 = 5');
  assert.equal(E.cekSifatEksponen('salahPangkat', 2, 2, 2).sama, true, '2 + 2 = 2 × 2');
});

test('cekSifatEksponen: alasan tak terdefinisi karena pembagian nol', () => {
  const r = E.cekSifatEksponen('bagi', 0, 2, 2);
  assert.equal(r.terdefinisi, false);
  assert.equal(r.alasan, 'nol');
  assert.equal(E.cekSifatEksponen('kali', 2, 3, 1).alasan, null);
});

test('lab eksponen mode positif: pembagian dengan m ≤ n di luar cakupan', () => {
  const opts = { positif: true };
  const st = E.makeExponentLabState('bagi');
  st.a = 2;
  st.m = 2;
  st.n = 3;
  assert.equal(E.labHasil(st, opts).alasan, 'diLuarCakupan');
  assert.equal(E.labCatat(st, opts), 'diLuarCakupan');
  assert.equal(E.labCatat(st), 'ok', 'tanpa mode positif tetap dapat dicatat');
  st.m = 5;
  assert.equal(E.labCatat(st, opts), 'ok');
  st.sifat = 'salahBagi';
  st.m = 5;
  st.n = 2;
  assert.equal(E.labCatat(st, opts), 'bukanBulat');
  st.m = 6;
  assert.equal(E.labCatat(st, opts), 'ok');
});

test('buildExponentLab: nama sifat kustom & vonis sesuai alasan', () => {
  const st = E.makeExponentLabState('salahBagi');
  st.a = 2;
  st.m = 5;
  st.n = 2;
  const opts = {
    sifat: ['kali', 'bagi', 'salahBagi'],
    syarat: [{ sifat: 'salahBagi', min: 1, sangkal: true }],
    nama: { salahBagi: 'Dugaan Nadia' },
    positif: true,
    batasA: [1, 10],
    batasE: [1, 6],
  };
  const html = E.buildExponentLab('lx', st, opts);
  assert.match(html, /Dugaan Nadia/);
  assert.match(html, /kelipatan/);
  st.m = 2;
  st.n = 3;
  st.sifat = 'bagi';
  assert.match(E.buildExponentLab('lx', st, opts), /m &gt; n|m > n/);
  st.n = 1;
  assert.match(E.buildExponentLab('lx', st, opts), /Kedua ruas SAMA/);
});
