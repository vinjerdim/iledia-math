'use strict';

/*
 * Tes engine.js bagian 68 — masalah kontekstual rasio dengan konversi
 * satuan (dipakai fase-d/mpi-3.2, Think-Pair-Share): tabel satuan,
 * konversi eksak, rasio dua besaran bersatuan berbeda, pengecoh &
 * diagnosa miskonsepsi (tanpa konversi, salah faktor, tertukar, belum
 * sederhana), membagi menurut rasio, suku hilang bersatuan, pemeriksa
 * soal, isian & langkah rasio bersama, serta Lab Samakan Satuan.
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(o) {
  return JSON.parse(JSON.stringify(o));
}

test('SATUAN_RASIO: empat besaran dengan nilai satuan terkecil', () => {
  ['km', 'm', 'cm', 'mm'].forEach((s) => assert.equal(E.SATUAN_RASIO[s].besaran, 'panjang'));
  ['kg', 'ons', 'g'].forEach((s) => assert.equal(E.SATUAN_RASIO[s].besaran, 'massa'));
  ['jam', 'menit', 'detik'].forEach((s) => assert.equal(E.SATUAN_RASIO[s].besaran, 'waktu'));
  ['L', 'mL'].forEach((s) => assert.equal(E.SATUAN_RASIO[s].besaran, 'volume'));
});

test('faktorSatuanRasio & konversiSatuanRasio: eksak, termasuk desimal', () => {
  assert.equal(E.faktorSatuanRasio('m', 'cm'), 100);
  assert.equal(E.faktorSatuanRasio('jam', 'menit'), 60);
  assert.equal(E.faktorSatuanRasio('cm', 'm'), 0.01);
  assert.equal(E.konversiSatuanRasio(2, 'm', 'cm'), 200);
  assert.equal(E.konversiSatuanRasio(1.5, 'kg', 'g'), 1500);
  assert.equal(E.konversiSatuanRasio(0.3, 'L', 'mL'), 300);
  assert.equal(E.konversiSatuanRasio(90, 'menit', 'jam'), 1.5);
  assert.equal(E.konversiSatuanRasio(2.5, 'km', 'm'), 2500);
  assert.equal(E.konversiSatuanRasio(3, 'ons', 'g'), 300);
  assert.throws(() => E.konversiSatuanRasio(1, 'kg', 'm'), /besaran/);
  assert.throws(() => E.konversiSatuanRasio(1, 'kaki', 'm'), /dikenal/);
});

test('satuanTerkecil & sukuBulatRasio', () => {
  assert.equal(E.satuanTerkecil('m', 'cm'), 'cm');
  assert.equal(E.satuanTerkecil('menit', 'jam'), 'menit');
  assert.equal(E.satuanTerkecil('g', 'g'), 'g');
  assert.deepEqual(plain(E.sukuBulatRasio(1.5, 2)), { a: 15, b: 20, skala: 10 });
  assert.deepEqual(plain(E.sukuBulatRasio(3, 4)), { a: 3, b: 4, skala: 1 });
  assert.deepEqual(plain(E.sukuBulatRasio(0.25, 1)), { a: 25, b: 100, skala: 100 });
});

test('rasioBedaSatuan: samakan satuan, lalu sederhanakan dengan FPB', () => {
  const r = E.rasioBedaSatuan(2, 'm', 50, 'cm');
  assert.equal(r.satuan, 'cm');
  assert.equal(r.a, 200);
  assert.equal(r.b, 50);
  assert.deepEqual(plain(r.sederhana), { a: 4, b: 1, fpb: 50 });

  const w = E.rasioBedaSatuan(1, 'jam', 45, 'menit');
  assert.deepEqual([w.a, w.b, w.satuan], [60, 45, 'menit']);
  assert.deepEqual(plain(w.sederhana), { a: 4, b: 3, fpb: 15 });

  const m = E.rasioBedaSatuan(1.5, 'kg', 300, 'g');
  assert.deepEqual(plain(m.sederhana), { a: 5, b: 1, fpb: 300 });

  const ke = E.rasioBedaSatuan(90, 'menit', 2, 'jam', 'jam');
  assert.deepEqual([ke.a, ke.b, ke.satuan], [15, 20, 'jam'], 'suku desimal dibulatkan skala 10');
  assert.deepEqual(plain(ke.sederhana), { a: 3, b: 4, fpb: 5 });
});

test('pengecohRasioSatuan: tanpa konversi & salah faktor, tanpa duplikat', () => {
  const p = plain(E.pengecohRasioSatuan(2, 'm', 50, 'cm'));
  const kode = p.map((x) => x.kode);
  assert.ok(kode.includes('tanpaKonversi'));
  assert.ok(kode.includes('salahFaktor'));
  const tk = p.find((x) => x.kode === 'tanpaKonversi');
  assert.ok(E.rasioSetara(tk.a, tk.b, 2, 50));
  p.forEach((x) => assert.ok(!E.rasioSetara(x.a, x.b, 4, 1), 'pengecoh tidak setara kunci'));

  /* Satuan sama → tidak ada pengecoh konversi. */
  assert.equal(E.pengecohRasioSatuan(6, 'g', 9, 'g').length, 0);
});

test('diagnosaRasioSatuan: benar, belum sederhana, tanpa konversi, salah faktor, tertukar', () => {
  const d = (x) => E.diagnosaRasioSatuan(x, { a: 2, satA: 'm', b: 50, satB: 'cm' }).kode;
  assert.equal(d('4 : 1'), 'benar');
  assert.equal(d('4:1'), 'benar');
  assert.equal(d('200 : 50'), 'belumSederhana');
  assert.equal(d('1 : 25'), 'tanpaKonversi');
  assert.equal(d('2 : 50'), 'tanpaKonversi');
  assert.equal(d('2 : 5'), 'salahFaktor', '2 m dianggap 20 cm');
  assert.equal(d('40 : 1'), 'salahFaktor', '2 m dianggap 2.000 cm');
  assert.equal(d('1 : 4'), 'tertukar');
  assert.equal(d(''), 'kosong');
  assert.equal(d('empat'), 'format');
  assert.equal(d('3 : 7'), 'salah');

  /* sederhana: false → rasio ekuivalen apa pun diterima. */
  const longgar = E.diagnosaRasioSatuan('200 : 50', {
    a: 2,
    satA: 'm',
    b: 50,
    satB: 'cm',
    sederhana: false,
  });
  assert.equal(longgar.benar, true);
  assert.ok(E.PESAN_RASIO.tanpaKonversi);
  assert.ok(E.PESAN_RASIO.salahFaktor);
});

test('opsiRasioSatuan: kunci + pengecoh berlabel unik, umpan untuk tiap opsi', () => {
  const o = plain(E.opsiRasioSatuan({ a: 1, satA: 'jam', b: 45, satB: 'menit' }));
  assert.ok(o.length >= 4);
  const benar = o.find((x) => x.id === 'benar');
  assert.equal(benar.label, '4 : 3');
  assert.equal(new Set(o.map((x) => x.label)).size, o.length, 'label unik');
  assert.equal(new Set(o.map((x) => x.id)).size, o.length, 'id unik');
  o.forEach((x) => assert.ok(x.umpan, x.id + ': umpan'));
  o.filter((x) => x.id !== 'benar').forEach((x) => {
    const r = E.parseIsianRasio(x.label);
    assert.equal(
      E.diagnosaRasioSatuan(x.label, { a: 1, satA: 'jam', b: 45, satB: 'menit' }).kode,
      x.kode,
      x.label
    );
    assert.equal(r.kode, 'ok');
  });
});

test('parseAngkaRasio: bulat, ribuan bertitik, desimal berkoma', () => {
  assert.deepEqual(plain(E.parseAngkaRasio('1200')), { nilai: 1200, kode: 'ok' });
  assert.deepEqual(plain(E.parseAngkaRasio('1.200')), { nilai: 1200, kode: 'ok' });
  assert.deepEqual(plain(E.parseAngkaRasio('1,5')), { nilai: 1.5, kode: 'ok' });
  assert.deepEqual(plain(E.parseAngkaRasio(' 12 ')), { nilai: 12, kode: 'ok' });
  assert.equal(E.parseAngkaRasio('').kode, 'kosong');
  assert.equal(E.parseAngkaRasio('1.5').kode, 'format');
  assert.equal(E.parseAngkaRasio('dua').kode, 'format');
  assert.equal(E.fmtAngkaRasio(1200), '1.200');
  assert.equal(E.fmtAngkaRasio(1.5), '1,5');
});

test('diagnosaKonversiRasio: faktor benar, salah faktor, arah terbalik, tanpa konversi', () => {
  const c = { jenis: 'konversi', nilai: 2, dari: 'm', ke: 'cm' };
  assert.equal(E.diagnosaKonversiRasio('200', c).kode, 'benar');
  assert.equal(E.diagnosaKonversiRasio('20', c).kode, 'salahFaktor');
  assert.equal(E.diagnosaKonversiRasio('2.000', c).kode, 'salahFaktor');
  assert.equal(E.diagnosaKonversiRasio('2', c).kode, 'tanpaKonversi');
  assert.equal(E.diagnosaKonversiRasio('0,02', c).kode, 'arahTerbalik');
  assert.equal(E.diagnosaKonversiRasio('', c).kode, 'kosong');
  const j = { jenis: 'konversi', nilai: 1, dari: 'jam', ke: 'menit' };
  assert.equal(E.diagnosaKonversiRasio('60', j).kode, 'benar');
  assert.equal(E.diagnosaKonversiRasio('100', j).kode, 'salahFaktor', '1 jam ≠ 100 menit');
  const m = { jenis: 'konversi', nilai: 90, dari: 'menit', ke: 'jam' };
  assert.equal(E.diagnosaKonversiRasio('1,5', m).kode, 'benar');
  assert.equal(E.diagnosaKonversiRasio('0,9', m).kode, 'salahFaktor', '90 : 100');
  assert.equal(E.diagnosaKonversiRasio('5.400', m).kode, 'arahTerbalik');
  assert.equal(E.faktaKonversiRasio('menit', 'jam'), '60 menit = 1 jam');
  assert.equal(E.faktaKonversiRasio('m', 'cm'), '1 m = 100 cm');
});

test('nilaiBagiRasio & diagnosaBagiRasio: membagi total menurut rasio', () => {
  assert.equal(E.nilaiBagiRasio(2000, 3, 2, 'a'), 1200);
  assert.equal(E.nilaiBagiRasio(2000, 3, 2, 'b'), 800);
  const c = { jenis: 'bagi', total: 2, satTotal: 'kg', a: 3, b: 2, bagian: 'a', satJawab: 'g' };
  const d = (x) => E.diagnosaBagiRasio(x, c).kode;
  assert.equal(d('1.200'), 'benar');
  assert.equal(d('1200'), 'benar');
  assert.equal(d('800'), 'bagianLain');
  assert.equal(d('3.000'), 'bagiSuku', '2000 × 3 : 2');
  assert.equal(d('1,2'), 'tanpaKonversi');
  assert.equal(d('400'), 'satuBagian', 'baru satu bagian');
  assert.equal(d('500'), 'salah');
  assert.equal(d(''), 'kosong');
  assert.equal(d('x'), 'format');
});

test('diagnosaHilangSatuan: suku hilang dengan satuan jawaban berbeda', () => {
  /* Sirup : air = 1 : 4; sirup 250 mL → air = 1.000 mL = 1 L. */
  const c = {
    jenis: 'hilangSatuan',
    a: 1,
    b: 4,
    x: 250,
    satX: 'mL',
    posisi: 'kanan',
    satJawab: 'L',
  };
  const d = (x) => E.diagnosaHilangSatuan(x, c).kode;
  assert.equal(d('1'), 'benar');
  assert.equal(d('1.000'), 'tanpaKonversi');
  assert.equal(d('0,253'), 'tambahSama');
  assert.equal(d('7'), 'salah');
  const c2 = {
    jenis: 'hilangSatuan',
    a: 2,
    b: 3,
    x: 1,
    satX: 'kg',
    posisi: 'kanan',
    satJawab: 'g',
  };
  assert.equal(E.diagnosaHilangSatuan('1.500', c2).kode, 'benar');
  assert.equal(E.diagnosaHilangSatuan('1,5', c2).kode, 'tanpaKonversi');
});

test('periksaSoalRasioSatuan & jawabSoalRasioSatuan: semua jenis, termasuk jenis seksi 67', () => {
  const S = (cek) => ({ cek });
  const satuan = S({ jenis: 'satuan', a: 2, satA: 'm', b: 50, satB: 'cm' });
  assert.equal(E.jawabSoalRasioSatuan(satuan), '4 : 1');
  assert.equal(E.periksaSoalRasioSatuan('4 : 1', satuan).benar, true);

  const bagi = S({
    jenis: 'bagi',
    total: 2,
    satTotal: 'kg',
    a: 3,
    b: 2,
    bagian: 'b',
    satJawab: 'g',
  });
  assert.equal(E.jawabSoalRasioSatuan(bagi), '800');
  assert.equal(E.periksaSoalRasioSatuan('800', bagi).benar, true);

  const hilang = S({
    jenis: 'hilangSatuan',
    a: 2,
    b: 3,
    x: 1,
    satX: 'kg',
    posisi: 'kanan',
    satJawab: 'g',
  });
  assert.equal(E.jawabSoalRasioSatuan(hilang), '1.500');

  const konv = S({ jenis: 'konversi', nilai: 1.5, dari: 'jam', ke: 'menit' });
  assert.equal(E.jawabSoalRasioSatuan(konv), '90');
  assert.equal(E.periksaSoalRasioSatuan('90', konv).benar, true);

  const lama = S({ jenis: 'sederhana', a: 12, b: 18 });
  assert.equal(E.jawabSoalRasioSatuan(lama), '2 : 3');
  assert.equal(E.periksaSoalRasioSatuan('2 : 3', lama).benar, true);
  assert.throws(() => E.jawabSoalRasioSatuan(S({ jenis: 'aneh' })), /tidak dikenal/);
});

test('periksaLangkahRasio: state langkah, isian tak terbaca tidak dihitung', () => {
  const step = {
    label: 'Sederhanakan',
    cek: { jenis: 'satuan', a: 2, satA: 'm', b: 50, satB: 'cm' },
  };
  const st = E.makeCekStep();
  assert.equal(E.periksaLangkahRasio(st, step, '').kode, 'kosong');
  assert.equal(st.attempts, 0);
  assert.equal(E.periksaLangkahRasio(st, step, 'abc').kode, 'format');
  assert.equal(st.attempts, 0);
  assert.equal(E.periksaLangkahRasio(st, step, '1 : 25').kode, 'tanpaKonversi');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  assert.equal(E.periksaLangkahRasio(st, step, '4 : 1').benar, true);
  assert.equal(st.done, true);
  assert.equal(st.attempts, 2);
});

test('buildIsianRasio & buildLangkahRasio: isian, tombol sisip ":", umpan diagnosa', () => {
  const html = E.buildIsianRasio('x', { input: '', salah: false }, 'mis. 2 : 3', 'Rasio');
  assert.ok(html.includes('id="xInput"'));
  assert.ok(html.includes('id="xColon"'));
  assert.ok(html.includes('id="xCheck"'));

  const step = {
    label: 'Rasio sederhana',
    cek: { jenis: 'satuan', a: 2, satA: 'm', b: 50, satB: 'cm' },
    hints: ['Samakan satuannya.'],
    temuan: 'Mantap.',
  };
  const st = E.makeCekStep();
  E.periksaLangkahRasio(st, step, '1 : 25');
  const salah = E.buildLangkahRasio('ls0', st, step, 1);
  assert.ok(salah.includes('has-error'));
  assert.ok(salah.includes(E.PESAN_RASIO.tanpaKonversi));
  E.periksaLangkahRasio(st, step, '4 : 1');
  const ok = E.buildLangkahRasio('ls0', st, step, 1);
  assert.ok(ok.includes('dl-step--done'));
  assert.ok(ok.includes('4 : 1'));
  assert.ok(ok.includes('Mantap.'));

  const num = {
    label: '2 m = … cm',
    cek: { jenis: 'konversi', nilai: 2, dari: 'm', ke: 'cm' },
    satuan: 'cm',
  };
  const h = E.buildLangkahRasio('k0', E.makeCekStep(), num);
  assert.ok(h.includes('bbk-satuan'));
  assert.ok(!h.includes('id="k0Colon"'), 'isian angka tanpa tombol titik dua');
});

test('Lab Samakan Satuan: pilih satuan, catat percobaan, tampilkan rasio', () => {
  const cfg = {
    a: 2,
    satA: 'm',
    b: 50,
    satB: 'cm',
    namaA: 'Tali tenda',
    namaB: 'Tali jemuran',
    pilihan: ['m', 'cm'],
  };
  const st = E.ensureLabSatuanState({}, cfg);
  assert.equal(st.ke, null);
  const awal = E.buildLabSamakanSatuan('lab', st, cfg);
  assert.ok(awal.includes('data-lab-satuan="lab"'));
  assert.ok(awal.includes('data-ke="cm"'));
  assert.ok(awal.includes('data-ke="m"'));

  assert.equal(E.pilihSatuanLab(st, cfg, 'cm'), true);
  assert.equal(E.pilihSatuanLab(st, cfg, 'kg'), false, 'satuan di luar pilihan ditolak');
  E.pilihSatuanLab(st, cfg, 'm');
  E.pilihSatuanLab(st, cfg, 'cm');
  assert.deepEqual(plain(st.dicoba).sort(), ['cm', 'm']);
  assert.equal(st.ke, 'cm');

  const html = E.buildLabSamakanSatuan('lab', st, cfg);
  assert.ok(html.includes('200 cm'));
  assert.ok(html.includes('50 cm'));
  assert.ok(html.includes('200 : 50'));
  assert.ok(html.includes('4 : 1'));

  E.pilihSatuanLab(st, cfg, 'm');
  const desimal = E.buildLabSamakanSatuan('lab', st, cfg);
  assert.ok(desimal.includes('0,5 m'), 'nilai desimal ditulis berkoma');

  /* State rusak/konfigurasi lain → disetel ulang. */
  const ulang = E.ensureLabSatuanState({ ke: 'kg', dicoba: 'x' }, cfg);
  assert.equal(ulang.ke, null);
  assert.deepEqual(plain(ulang.dicoba), []);
});
