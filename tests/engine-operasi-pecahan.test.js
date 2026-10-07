'use strict';

/*
 * Tes shared/engine.js seksi 62 (penjumlahan & pengurangan pecahan dalam
 * masalah kontekstual): nilai rasional eksak, hasil operasi yang sudah
 * disederhanakan, kalimat operasi, langkah menyamakan penyebut, pengurai
 * isian (bulat/biasa/campuran/negatif), diagnosa miskonsepsi (penyebut
 * ikut dijumlah, pembilang tidak diubah, operasi terbalik, salah tanda,
 * meminjam, lupa bilangan bulat, belum sederhana), opsi berpengecoh,
 * Lab Pita (pilihan potongan, cek pas/tidak pas), dan langkah isian
 * operasi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function R(num, den) {
  return { num, den };
}

/* ---------- nilai rasional ---------- */

test('rasionalDari: teks pecahan, campuran, negatif, bulat, angka, objek', () => {
  assert.deepEqual(plain(E.rasionalDari('3/4')), R(3, 4));
  assert.deepEqual(plain(E.rasionalDari('2 1/2')), R(5, 2));
  assert.deepEqual(plain(E.rasionalDari('-1 1/4')), R(-5, 4));
  assert.deepEqual(plain(E.rasionalDari('−3/4')), R(-3, 4));
  assert.deepEqual(plain(E.rasionalDari('5')), R(5, 1));
  assert.deepEqual(plain(E.rasionalDari('-2')), R(-2, 1));
  assert.deepEqual(plain(E.rasionalDari(3)), R(3, 1));
  assert.deepEqual(plain(E.rasionalDari({ num: 6, den: -8 })), R(-6, 8));
  assert.deepEqual(plain(E.rasionalDari({ num: 1, den: 4, whole: 1, neg: true })), R(-5, 4));
  assert.throws(() => E.rasionalDari('tiga'));
});

test('sederhanakanRasional: tanda di pembilang, FPB dibagi, nol → 0/1', () => {
  assert.deepEqual(plain(E.sederhanakanRasional(R(14, 24))), R(7, 12));
  assert.deepEqual(plain(E.sederhanakanRasional(R(6, -8))), R(-3, 4));
  assert.deepEqual(plain(E.sederhanakanRasional(R(0, 5))), R(0, 1));
  assert.deepEqual(plain(E.sederhanakanRasional(R(12, 4))), R(3, 1));
});

test('operasiPecahan: hasil eksak paling sederhana', () => {
  assert.deepEqual(plain(E.operasiPecahan('1/3', '+', '1/4')), R(7, 12));
  assert.deepEqual(plain(E.operasiPecahan('1/5', '+', '2/5')), R(3, 5));
  assert.deepEqual(plain(E.operasiPecahan('5/6', '-', '1/6')), R(2, 3));
  assert.deepEqual(plain(E.operasiPecahan('3/4', '+', '1 1/3')), R(25, 12));
  assert.deepEqual(plain(E.operasiPecahan('2 1/2', '-', '2 1/12')), R(5, 12));
  assert.deepEqual(plain(E.operasiPecahan('5', '-', '4 1/4')), R(3, 4));
  assert.deepEqual(plain(E.operasiPecahan('-3/4', '+', '1 1/2')), R(3, 4));
  assert.deepEqual(plain(E.operasiPecahan('3/4', '-', '1 1/4')), R(-1, 2));
  assert.deepEqual(plain(E.operasiPecahan('1/2', '+', '1/2')), R(1, 1));
  assert.deepEqual(plain(E.operasiPecahan('-1/2', '-', '-3/4')), R(1, 4));
  assert.throws(() => E.operasiPecahan('1/2', '*', '1/3'));
});

test('teksRasional: campuran (default) atau biasa, minus tipografis', () => {
  assert.equal(E.teksRasional(R(25, 12)), '2 1/12');
  assert.equal(E.teksRasional(R(25, 12), 'biasa'), '25/12');
  assert.equal(E.teksRasional(R(-1, 2)), '−1/2');
  assert.equal(E.teksRasional(R(-5, 4)), '−1 1/4');
  assert.equal(E.teksRasional(R(-5, 4), 'biasa'), '−5/4');
  assert.equal(E.teksRasional(R(3, 1)), '3');
  assert.equal(E.teksRasional(R(0, 1)), '0');
});

test('fmtOperasiPecahan: suku kedua negatif diberi kurung', () => {
  assert.equal(E.fmtOperasiPecahan('1/3', '+', '1/4'), '1/3 + 1/4');
  assert.equal(E.fmtOperasiPecahan('2 1/2', '-', '3/4'), '2 1/2 − 3/4');
  assert.equal(E.fmtOperasiPecahan('-3/4', '+', '1 1/2'), '−3/4 + 1 1/2');
  assert.equal(E.fmtOperasiPecahan('-1/2', '-', '-3/4'), '−1/2 − (−3/4)');
  assert.equal(E.fmtOperasiPecahan('5', '-', '4 1/4'), '5 − 4 1/4');
});

test('langkahSamakanPenyebut: KPK & pecahan senilai (campuran → biasa dulu)', () => {
  assert.deepEqual(plain(E.langkahSamakanPenyebut('1/2', '1/3')), {
    kpk: 6,
    a: R(3, 6),
    b: R(2, 6),
    faktorA: 3,
    faktorB: 2,
  });
  assert.deepEqual(plain(E.langkahSamakanPenyebut('3/4', '1 1/3')), {
    kpk: 12,
    a: R(9, 12),
    b: R(16, 12),
    faktorA: 3,
    faktorB: 4,
  });
  const s = E.langkahSamakanPenyebut('2/5', '1/5');
  assert.equal(s.kpk, 5);
  assert.equal(s.faktorA, 1);
});

/* ---------- pengurai isian ---------- */

test('parseIsianRasional: bulat, biasa, campuran, negatif', () => {
  let r = E.parseIsianRasional('7/12');
  assert.equal(r.error, null);
  assert.deepEqual(plain(r.value), R(7, 12));
  assert.equal(r.bentuk, 'biasa');
  r = E.parseIsianRasional(' 2 1/12 ');
  assert.deepEqual(plain(r.value), R(25, 12));
  assert.equal(r.bentuk, 'campuran');
  r = E.parseIsianRasional('−1/2');
  assert.deepEqual(plain(r.value), R(-1, 2));
  r = E.parseIsianRasional('-1 1/4');
  assert.deepEqual(plain(r.value), R(-5, 4));
  r = E.parseIsianRasional('3');
  assert.deepEqual(plain(r.value), R(3, 1));
  assert.equal(r.bentuk, 'bulat');
  r = E.parseIsianRasional('-0');
  assert.deepEqual(plain(r.value), R(0, 1));
});

test('parseIsianRasional: galat kosong, format, penyebut nol', () => {
  assert.equal(E.parseIsianRasional('').error, 'kosong');
  assert.equal(E.parseIsianRasional('   ').error, 'kosong');
  assert.equal(E.parseIsianRasional('tujuh per dua belas').error, 'format');
  assert.equal(E.parseIsianRasional('0,5').error, 'format');
  assert.equal(E.parseIsianRasional('3/0').error, 'nol-penyebut');
});

/* ---------- diagnosa ---------- */

function kode(jawab, a, op, b) {
  return E.diagnosaOperasiPecahan(jawab, a, op, b).kode;
}

test('diagnosaOperasiPecahan: benar (biasa/campuran/negatif/bulat)', () => {
  assert.equal(kode('7/12', '1/3', '+', '1/4'), 'benar');
  assert.equal(kode('4 1/4', '1 3/4', '+', '2 1/2'), 'benar');
  assert.equal(kode('17/4', '1 3/4', '+', '2 1/2'), 'benar');
  assert.equal(kode('-1/2', '3/4', '-', '1 1/4'), 'benar');
  assert.equal(kode('−1/2', '3/4', '-', '1 1/4'), 'benar');
  assert.equal(kode('1', '1/2', '+', '1/2'), 'benar');
  const r = E.diagnosaOperasiPecahan('17/4', '1 3/4', '+', '2 1/2');
  assert.equal(r.benar, true);
  assert.match(r.pesan, /4 1\/4/);
});

test('diagnosaOperasiPecahan: belum sederhana', () => {
  assert.equal(kode('14/24', '1/3', '+', '1/4'), 'belum-sederhana');
  assert.equal(kode('3 2/4', '1 3/4', '+', '1 3/4'), 'belum-sederhana');
  assert.equal(kode('2/2', '1/2', '+', '1/2'), 'belum-sederhana');
});

test('diagnosaOperasiPecahan: penyebut ikut dijumlah/dikurang', () => {
  assert.equal(kode('2/7', '1/3', '+', '1/4'), 'penyebut-dijumlah');
  assert.equal(kode('3/10', '1/5', '+', '2/5'), 'penyebut-dijumlah');
  assert.equal(kode('2/2', '3/4', '-', '1/2'), 'penyebut-dijumlah');
});

test('diagnosaOperasiPecahan: pembilang tidak ikut dikalikan', () => {
  assert.equal(kode('2/12', '1/3', '+', '1/4'), 'pembilang-tidak-diubah');
  assert.equal(kode('2/6', '1/2', '+', '1/3'), 'pembilang-tidak-diubah');
});

test('diagnosaOperasiPecahan: operasi terbalik & salah tanda', () => {
  assert.equal(kode('1/12', '1/3', '+', '1/4'), 'operasi-terbalik');
  assert.equal(kode('2', '3/4', '-', '1 1/4'), 'operasi-terbalik');
  assert.equal(kode('1/2', '3/4', '-', '1 1/4'), 'salah-tanda');
});

test('diagnosaOperasiPecahan: meminjam & lupa bilangan bulat', () => {
  assert.equal(kode('2 2/4', '3 1/4', '-', '1 3/4'), 'meminjam');
  assert.equal(kode('2 1/2', '3 1/4', '-', '1 3/4'), 'meminjam');
  assert.equal(kode('1 1/4', '1 3/4', '+', '2 1/2'), 'lupa-bulat');
});

test('diagnosaOperasiPecahan: galat isian & salah umum, semua kode berpesan', () => {
  assert.equal(kode('', '1/3', '+', '1/4'), 'kosong');
  assert.equal(kode('x', '1/3', '+', '1/4'), 'format');
  assert.equal(kode('1/0', '1/3', '+', '1/4'), 'nol-penyebut');
  assert.equal(kode('5/9', '1/3', '+', '1/4'), 'salah');
  [
    'kosong',
    'format',
    'nol-penyebut',
    'belum-sederhana',
    'penyebut-dijumlah',
    'pembilang-tidak-diubah',
    'operasi-terbalik',
    'salah-tanda',
    'meminjam',
    'lupa-bulat',
    'salah',
  ].forEach((k) => assert.ok(E.PESAN_OPERASI_PECAHAN[k], 'pesan ' + k));
  const r = E.diagnosaOperasiPecahan('2/7', '1/3', '+', '1/4');
  assert.equal(r.benar, false);
  assert.equal(r.pesan, E.PESAN_OPERASI_PECAHAN['penyebut-dijumlah']);
});

/* ---------- opsi berpengecoh ---------- */

function assertOpsi(list, a, op, b) {
  assert.ok(list.length >= 4, 'minimal empat opsi');
  assert.equal(list[0].id, 'benar');
  assert.equal(list[0].benar, true);
  assert.equal(list[0].label, E.teksRasional(E.operasiPecahan(a, op, b)));
  assert.equal(list.filter((o) => o.benar).length, 1, 'hanya satu benar');
  assert.equal(new Set(list.map((o) => o.id)).size, list.length, 'id unik');
  assert.equal(new Set(list.map((o) => o.label)).size, list.length, 'label unik');
  const nilai = list.map((o) => {
    const v = E.parseIsianRasional(o.label).value;
    return E.sederhanakanRasional(v);
  });
  assert.equal(
    new Set(nilai.map((v) => v.num + '/' + v.den)).size,
    list.length,
    'nilai opsi berbeda'
  );
  list.forEach((o) => assert.ok(o.umpan, o.id + ': umpan'));
}

test('opsiOperasiPecahan: benar + pengecoh miskonsepsi, unik, belum diacak', () => {
  const o1 = E.opsiOperasiPecahan('1/3', '+', '1/4');
  assertOpsi(o1, '1/3', '+', '1/4');
  const labels = o1.map((o) => o.label);
  assert.ok(labels.includes('2/7'), 'pengecoh penyebut dijumlah');
  assert.ok(labels.includes('2/12'), 'pengecoh pembilang tidak diubah');
  [
    ['1/5', '+', '2/5'],
    ['3 1/4', '-', '1 3/4'],
    ['3/4', '-', '1 1/4'],
    ['-3/4', '+', '1 1/2'],
    ['5', '-', '4 1/4'],
    ['1/2', '+', '1/2'],
  ].forEach(([a, op, b]) => assertOpsi(E.opsiOperasiPecahan(a, op, b), a, op, b));
});

/* ---------- Lab Pita ---------- */

test('cekPenyebutPita: kpk, kelipatan, tidak pas', () => {
  assert.equal(E.cekPenyebutPita('1/2', '1/3', 6), 'kpk');
  assert.equal(E.cekPenyebutPita('1/2', '1/3', 12), 'kelipatan');
  assert.equal(E.cekPenyebutPita('1/2', '1/3', 5), 'tidak-pas');
  assert.equal(E.cekPenyebutPita('1/2', '1/3', 4), 'tidak-pas');
  assert.equal(E.cekPenyebutPita('1 1/3', '3/4', 12), 'kpk');
});

test('pilihanPenyebutPita: empat bilangan berbeda, memuat KPK & pengecoh', () => {
  [
    ['1/2', '1/3'],
    ['3/4', '1/6'],
    ['1/3', '1/4'],
    ['1/5', '2/5'],
    ['1/2', '3/4'],
  ].forEach(([a, b]) => {
    const p = E.pilihanPenyebutPita(a, b);
    assert.equal(p.length, 4, a + ' & ' + b);
    assert.equal(new Set(p).size, 4);
    assert.ok(p.includes(E.langkahSamakanPenyebut(a, b).kpk), 'memuat KPK');
    assert.ok(
      p.filter((n) => E.cekPenyebutPita(a, b, n) === 'tidak-pas').length >= 1,
      'ada yang tidak pas'
    );
    p.forEach((n) => assert.ok(n >= 2 && n <= 36, 'muat di pita'));
  });
  assert.deepEqual(plain(E.pilihanPenyebutPita('1/2', '1/3')), [6, 5, 12, 4]);
});

test('ensurePitaState: urutan pilihan teracak tersimpan, valid ulang', () => {
  const S = {};
  const st = E.ensurePitaState(S, 'lab', '1/2', '1/3');
  assert.equal(st.pilih, null);
  assert.equal(st.coba, 0);
  assert.deepEqual([...st.order].sort(), ['12', '4', '5', '6']);
  const order = st.order.slice();
  E.ensurePitaState(S, 'lab', '1/2', '1/3');
  assert.deepEqual(plain(S.lab.order), plain(order), 'urutan stabil');
  assert.equal(E.pitaPas('1/2', '1/3', { pilih: 5 }), false);
  assert.equal(E.pitaPas('1/2', '1/3', { pilih: 12 }), true);
  assert.equal(E.pitaPas('1/2', '1/3', { pilih: null }), false);
});

test('buildPitaOperasi: tombol potongan, pita tiap suku, hasil setelah pas', () => {
  const st = { order: ['5', '6', '12', '4'], pilih: null, coba: 0 };
  let html = E.buildPitaOperasi('lab', '1/2', '+', '1/3', st);
  assert.equal((html.match(/data-pita-n=/g) || []).length, 4);
  assert.match(html, /data-pita="lab"/);
  assert.doesNotMatch(html, /pita-op__row--hasil/);

  st.pilih = 5;
  html = E.buildPitaOperasi('lab', '1/2', '+', '1/3', st);
  assert.match(html, /is-part/, 'potongan tidak pas terlihat');
  assert.doesNotMatch(html, /pita-op__row--hasil/);

  st.pilih = 6;
  html = E.buildPitaOperasi('lab', '1/2', '+', '1/3', st);
  assert.match(html, /pita-op__row--hasil/);
  assert.equal((html.match(/pita-op__cell is-a/g) || []).length, 3 + 3, 'A di baris A & hasil');
  assert.equal((html.match(/pita-op__cell is-b/g) || []).length, 2 + 2, 'B di baris B & hasil');

  st.pilih = 12;
  html = E.buildPitaOperasi('lab', '3/4', '-', '1/6', st);
  assert.match(html, /is-taken/, 'pengurangan menandai potongan yang diambil');
  assert.match(html, /role="img"/);

  html = E.buildPitaOperasi('tetap', '1/5', '+', '2/5', { pilih: 5 }, { tetap: true });
  assert.doesNotMatch(html, /data-pita-n=/, 'tampilan saja tanpa tombol');
  assert.doesNotMatch(html, /feedback-box/);
  assert.match(html, /pita-op__row--hasil/);
});

/* ---------- langkah isian operasi ---------- */

test('periksaIsianOperasi: kosong tidak dihitung, salah dihitung, benar selesai', () => {
  const soal = { a: '1/3', op: '+', b: '1/4', label: 'x', hints: ['h'] };
  const st = E.makeIsianOperasi();
  E.periksaIsianOperasi(st, soal, '');
  assert.equal(st.attempts, 0);
  assert.equal(st.kode, 'kosong');
  E.periksaIsianOperasi(st, soal, '2/7');
  assert.equal(st.attempts, 1);
  assert.equal(st.kode, 'penyebut-dijumlah');
  assert.equal(st.done, false);
  E.periksaIsianOperasi(st, soal, '7/12');
  assert.equal(st.done, true);
  assert.equal(st.attempts, 2);
});

test('buildIsianOperasi: isian, pesan diagnosa, tampilan selesai', () => {
  const soal = {
    a: '1/3',
    op: '+',
    b: '1/4',
    label: 'Hitung {1/3} + {1/4}',
    hints: ['Samakan penyebut'],
    temuan: 'Penyebut disamakan.',
    satuan: 'meja',
  };
  const st = E.makeIsianOperasi();
  let html = E.buildIsianOperasi('s1', st, soal, 1);
  assert.match(html, /id="s1Input"/);
  assert.match(html, /id="s1Check"/);
  assert.match(html, /id="s1Hint"/);
  E.periksaIsianOperasi(st, soal, '2/7');
  html = E.buildIsianOperasi('s1', st, soal, 1);
  assert.match(html, /feedback-box--error/);
  E.periksaIsianOperasi(st, soal, '7/12');
  html = E.buildIsianOperasi('s1', st, soal, 1);
  assert.match(html, /dl-step--done/);
  assert.match(html, /Penyebut disamakan\./);
  assert.doesNotMatch(html, /s1Input/);
});
