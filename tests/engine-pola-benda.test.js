'use strict';

/*
 * Tes engine seksi 71 — Pola susunan benda (batang korek api, ubin,
 * kursi): banyak benda tiap tahap, tambahan dari tahap sebelumnya,
 * jenis keteraturan, melanjutkan barisan, isian berdiagnosa
 * miskonsepsi, opsi pilihan ganda berpengecoh, gambar susunan SVG,
 * dan Lab Susun (catatan pengamatan).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

const JENIS = [
  'korekPersegi',
  'korekSegitiga',
  'ubinPersegi',
  'ubinL',
  'ubinTangga',
  'kursiDeret',
  'kursiTerpisah',
];

function arr(x) {
  return Array.from(x);
}

test('POLA_BENDA: setiap jenis punya benda, nama, satuan, dan deskripsi tahap', () => {
  JENIS.forEach((j) => {
    const P = E.POLA_BENDA[j];
    assert.ok(P, j + ' ada');
    assert.ok(['korek', 'ubin', 'kursi'].includes(P.benda), j + ': benda');
    assert.ok(P.nama && P.satuan, j + ': nama & satuan');
    assert.equal(typeof P.deskripsi(3), 'string');
    /* deskripsi untuk pembaca layar tidak membocorkan banyak benda */
    assert.ok(!P.deskripsi(3).includes(String(E.banyakBendaPola(j, 3))), j + ': deskripsi');
  });
});

test('banyakBendaPola & barisanPola: nilai tiap tahap', () => {
  assert.deepEqual(arr(E.barisanPola('korekPersegi', 5)), [4, 7, 10, 13, 16]);
  assert.deepEqual(arr(E.barisanPola('korekSegitiga', 4)), [3, 5, 7, 9]);
  assert.deepEqual(arr(E.barisanPola('ubinPersegi', 5)), [1, 4, 9, 16, 25]);
  assert.deepEqual(arr(E.barisanPola('ubinL', 4)), [1, 3, 5, 7]);
  assert.deepEqual(arr(E.barisanPola('ubinTangga', 5)), [1, 3, 6, 10, 15]);
  assert.deepEqual(arr(E.barisanPola('kursiDeret', 5)), [4, 6, 8, 10, 12]);
  assert.deepEqual(arr(E.barisanPola('kursiTerpisah', 3)), [4, 8, 12]);
  assert.equal(E.banyakBendaPola('korekPersegi', 10), 31);
  assert.ok(Number.isNaN(E.banyakBendaPola('korekPersegi', 0)));
  assert.ok(Number.isNaN(E.banyakBendaPola('korekPersegi', 2.5)));
  assert.ok(Number.isNaN(E.banyakBendaPola('tidakAda', 2)));
});

test('tambahanPola: benda baru dibanding tahap sebelumnya', () => {
  assert.equal(E.tambahanPola('korekPersegi', 1), 4);
  assert.equal(E.tambahanPola('korekPersegi', 4), 3);
  assert.equal(E.tambahanPola('ubinPersegi', 4), 7);
  assert.equal(E.tambahanPola('kursiDeret', 6), 2);
  assert.equal(E.tambahanPola('ubinTangga', 5), 5);
});

test('jenisKeteraturan: tetap, bertingkat, tidak teratur', () => {
  assert.equal(E.jenisKeteraturan([4, 7, 10, 13]), 'tetap');
  assert.equal(E.jenisKeteraturan([1, 4, 9, 16]), 'bertingkat');
  assert.equal(E.jenisKeteraturan([1, 3, 6, 10]), 'bertingkat');
  assert.equal(E.jenisKeteraturan([5, 9, 6, 12]), 'tidakTeratur');
  assert.equal(E.jenisKeteraturan([2, 4, 8, 16]), 'tidakTeratur');
  assert.equal(E.jenisKeteraturan([4, 7]), null);
  JENIS.forEach((j) => {
    const k = E.jenisKeteraturan(E.barisanPola(j, 5));
    assert.ok(k === 'tetap' || k === 'bertingkat', j);
  });
});

test('lanjutkanBarisanPola: melanjutkan pola tetap & bertingkat', () => {
  assert.equal(E.lanjutkanBarisanPola([4, 7, 10], 5), 16);
  assert.equal(E.lanjutkanBarisanPola([4, 7, 10], 2), 7);
  assert.equal(E.lanjutkanBarisanPola([1, 4, 9, 16], 6), 36);
  assert.equal(E.lanjutkanBarisanPola([1, 3, 6, 10], 7), 28);
  assert.ok(Number.isNaN(E.lanjutkanBarisanPola([5, 9, 6, 12], 6)));
});

test('deskripsiPola: kalimat keteraturan dalam kata-kata', () => {
  const t = E.deskripsiPola([4, 7, 10, 13], 'batang');
  assert.match(t, /4 batang/);
  assert.match(t, /bertambah 3 batang/);
  const b = E.deskripsiPola([1, 4, 9, 16], 'ubin');
  assert.match(b, /3, 5, 7/);
  assert.match(b, /2 lebih banyak/);
  assert.match(E.deskripsiPola([5, 9, 6, 12], 'kursi'), /tidak teratur/i);
});

test('nilaiSoalPola & jawabSoalPola: empat bentuk cek', () => {
  assert.equal(E.nilaiSoalPola({ jenis: 'korekPersegi', n: 6 }), 19);
  assert.equal(E.nilaiSoalPola({ jenis: 'ubinPersegi', n: 6, minta: 'tambahan' }), 11);
  assert.equal(E.nilaiSoalPola({ suku: [10, 14, 18], n: 6 }), 30);
  assert.equal(E.jawabSoalPola({ cek: { jenis: 'kursiDeret', n: 50 } }), '102');
  assert.equal(E.jawabSoalPola({ cek: { suku: [100, 250, 400], n: 9 } }), '1.300');
  assert.equal(
    E.jawabSoalPola({ cek: { jenis: 'ubinTangga', minta: 'keteraturan' } }),
    'bertingkat'
  );
  assert.equal(
    E.jawabSoalPola({ cek: { suku: [3, 8, 4, 9], minta: 'keteraturan' } }),
    'tidakTeratur'
  );
});

test('diagnosaPola: benar & isian tak terbaca', () => {
  const c = { jenis: 'korekPersegi', n: 5 };
  assert.equal(E.diagnosaPola('16', c).benar, true);
  assert.equal(E.diagnosaPola(' 16 ', c).kode, 'benar');
  assert.equal(E.diagnosaPola('', c).kode, 'kosong');
  assert.equal(E.diagnosaPola('enam belas', c).kode, 'format');
  assert.equal(E.diagnosaPola('16,5', c).kode, 'format');
  assert.equal(E.diagnosaPola('1.300', { suku: [100, 250, 400], n: 9 }).benar, true);
});

test('diagnosaPola: miskonsepsi umum dikenali', () => {
  const c = { jenis: 'korekPersegi', n: 5 };
  assert.equal(E.diagnosaPola('13', c).kode, 'tahapSebelumnya');
  assert.equal(E.diagnosaPola('19', c).kode, 'tahapBerikutnya');
  assert.equal(E.diagnosaPola('20', c).kode, 'hitungTerpisah');
  assert.equal(E.diagnosaPola('15', c).kode, 'kaliTambahan');
  assert.equal(E.diagnosaPola('14', { jenis: 'korekPersegi', n: 4 }).kode, 'gandakan');
  assert.equal(E.diagnosaPola('13', { suku: [4, 7, 10], n: 6 }).kode, 'tambahSekali');
  assert.equal(
    E.diagnosaPola('25', { jenis: 'ubinPersegi', n: 5, minta: 'tambahan' }).kode,
    'banyak'
  );
  assert.equal(E.diagnosaPola('99', c).kode, 'salah');
  ['tahapSebelumnya', 'hitungTerpisah', 'kaliTambahan', 'salah'].forEach((kode) => {
    assert.ok(E.PESAN_POLA[kode], kode + ': pesan');
  });
  const d = E.diagnosaPola('13', c);
  assert.equal(d.benar, false);
  assert.ok(d.pesan.length > 10);
});

test('periksaSoalPola: cek keteraturan berupa id opsi', () => {
  const s = { cek: { jenis: 'korekPersegi', minta: 'keteraturan' } };
  assert.equal(E.periksaSoalPola('tetap', s).benar, true);
  assert.equal(E.periksaSoalPola('bertingkat', s).benar, false);
  assert.equal(E.periksaSoalPola('16', { cek: { jenis: 'korekPersegi', n: 5 } }).benar, true);
});

test('opsiSoalPola: kunci + pengecoh unik, minimal 4 opsi, berumpan balik', () => {
  const cases = [
    { cek: { jenis: 'korekPersegi', n: 5 }, satuan: 'batang' },
    { cek: { jenis: 'ubinPersegi', n: 6 }, satuan: 'ubin' },
    { cek: { jenis: 'kursiDeret', n: 20 }, satuan: 'kursi' },
    { cek: { suku: [10, 14, 18], n: 8 }, satuan: 'kursi' },
    { cek: { jenis: 'ubinL', n: 1 }, satuan: 'ubin' },
    { cek: { jenis: 'ubinTangga', minta: 'keteraturan' } },
  ];
  cases.forEach((s) => {
    const opsi = E.opsiSoalPola(s);
    assert.ok(opsi.length >= 4, JSON.stringify(s.cek));
    assert.equal(opsi.filter((o) => o.id === 'baku').length, 1);
    assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length);
    assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length);
    opsi.forEach((o) => assert.ok(o.umpan, o.id + ': umpan'));
  });
  const o = E.opsiSoalPola(cases[0]);
  assert.equal(o.find((x) => x.id === 'baku').label, '16 batang');
  const k = E.opsiSoalPola(cases[5]);
  assert.equal(k.find((x) => x.id === 'baku').label, E.OPSI_KETERATURAN.bertingkat.label);
});

test('siapkanLangkahPola: langkah isian angka dengan pemeriksa pola', () => {
  const st = E.siapkanLangkahPola({ label: 'x', cek: { jenis: 'korekPersegi', n: 5 } });
  assert.equal(st.angka, true);
  assert.equal(st.periksa('16', { cek: st.cek }).benar, true);
});

test('buildSusunanPola: banyak benda di gambar sama dengan perhitungan', () => {
  JENIS.forEach((j) => {
    for (let n = 1; n <= 5; n++) {
      const svg = E.buildSusunanPola(j, n, { sorotBaru: true });
      assert.match(svg, /^<svg/);
      assert.match(svg, /role="img"/);
      const benda = (svg.match(/data-benda="1"/g) || []).length;
      const baru = (svg.match(/data-baru="1"/g) || []).length;
      assert.equal(benda, E.banyakBendaPola(j, n), j + ' tahap ' + n);
      assert.equal(baru, E.tambahanPola(j, n), j + ' tahap ' + n + ' (baru)');
    }
  });
  const polos = E.buildSusunanPola('korekPersegi', 3);
  assert.ok(!/is-baru/.test(polos), 'tanpa sorot tidak ada kelas is-baru');
  assert.match(E.buildSusunanPola('korekPersegi', 3, { sorotBaru: true }), /is-baru/);
});

test('buildDeretSusunan: tahap 1..k berdampingan dengan label', () => {
  const html = E.buildDeretSusunan('kursiDeret', 3);
  assert.equal((html.match(/<svg/g) || []).length, 3);
  assert.match(html, /Tahap 1/);
  assert.match(html, /Tahap 3/);
});

test('Lab Susun: state, catatan berdiagnosa, dan syarat lengkap', () => {
  const cfg = { jenisList: ['korekPersegi', 'ubinPersegi'], tahapCatat: 3, tahapMaks: 4 };
  const st = E.ensureLabSusun({}, cfg);
  assert.equal(st.jenis, 'korekPersegi');
  assert.equal(st.n, 1);
  assert.equal(st.catat.korekPersegi.length, 3);
  assert.equal(E.labSusunLengkap(st, cfg), false);

  assert.equal(E.ubahTahapLabSusun(st, cfg, -1), false);
  assert.equal(E.ubahTahapLabSusun(st, cfg, 1), true);
  assert.equal(st.n, 2);

  st.catat.korekPersegi[0].input = '4';
  st.catat.korekPersegi[1].input = '8';
  const r = E.catatLabSusun(st, cfg, 'korekPersegi');
  assert.equal(r.kosong, 1);
  assert.equal(st.catat.korekPersegi[0].done, true);
  assert.equal(st.catat.korekPersegi[1].done, false);
  assert.equal(st.catat.korekPersegi[1].kode, 'hitungTerpisah');

  ['korekPersegi', 'ubinPersegi'].forEach((j) => {
    st.catat[j].forEach((c, i) => {
      c.input = String(E.banyakBendaPola(j, i + 1));
    });
    E.catatLabSusun(st, cfg, j);
  });
  assert.equal(E.labSusunLengkap(st, cfg), true);
  assert.deepEqual(arr(E.dataLabSusun(st, cfg, 'ubinPersegi')), [1, 4, 9]);

  /* konfigurasi berubah → disetel ulang */
  const st2 = E.ensureLabSusun(st, Object.assign({}, cfg, { tahapCatat: 4 }));
  assert.equal(st2.catat.korekPersegi.length, 4);
  assert.equal(E.labSusunLengkap(st2, Object.assign({}, cfg, { tahapCatat: 4 })), false);
});

test('buildLabSusun: tab susunan, stepper tahap, gambar, dan tabel catatan', () => {
  const cfg = { jenisList: ['korekPersegi', 'kursiDeret'], tahapCatat: 4, tahapMaks: 4 };
  const st = E.ensureLabSusun({}, cfg);
  const html = E.buildLabSusun('ls', st, cfg);
  assert.equal((html.match(/data-susun-jenis=/g) || []).length, 2);
  assert.match(html, /id="lsTahapDec"/);
  assert.match(html, /id="lsTahapInc"/);
  assert.match(html, /id="lsSorot"/);
  assert.match(html, /<svg/);
  assert.equal((html.match(/id="lsIn\d"/g) || []).length, 4);
  assert.match(html, /id="lsCheck"/);
});
