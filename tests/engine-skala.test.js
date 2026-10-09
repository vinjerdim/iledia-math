'use strict';

/*
 * Tes engine.js bagian 69 — skala pada peta & denah (dipakai
 * fase-d/mpi-3.3, Problem Based Learning): jarak sebenarnya ↔ jarak pada
 * peta, menentukan skala, format & isian skala, diagnosa miskonsepsi
 * (tanpa konversi, salah faktor, operasi terbalik, satu cm saja, skala
 * terbalik, belum 1 : n), pemeriksa & opsi soal, langkah isian lewat
 * buildLangkahRasio, serta Lab Peta, Pembanding Skala, Lab Denah, dan
 * batang skala.
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(o) {
  return JSON.parse(JSON.stringify(o));
}

test('jarakSebenarnyaSkala: jarak peta × penyebut, lalu ubah satuan', () => {
  assert.equal(E.jarakSebenarnyaSkala(4, 'cm', 25000, 'cm'), 100000);
  assert.equal(E.jarakSebenarnyaSkala(4, 'cm', 25000, 'km'), 1);
  assert.equal(E.jarakSebenarnyaSkala(6, 'cm', 25000, 'm'), 1500);
  assert.equal(E.jarakSebenarnyaSkala(7, 'cm', 50000, 'km'), 3.5);
  assert.equal(E.jarakSebenarnyaSkala(1.5, 'cm', 200, 'm'), 3);
  assert.equal(E.jarakSebenarnyaSkala(6.5, 'cm', 2000000, 'km'), 130);
  /* satuan hasil default = satuan peta */
  assert.equal(E.jarakSebenarnyaSkala(3, 'cm', 100), 300);
});

test('jarakPetaSkala: ubah ke satuan peta, lalu bagi penyebut', () => {
  assert.equal(E.jarakPetaSkala(1.5, 'km', 25000, 'cm'), 6);
  assert.equal(E.jarakPetaSkala(12, 'km', 300000, 'cm'), 4);
  assert.equal(E.jarakPetaSkala(24, 'm', 200, 'cm'), 12);
  assert.equal(E.jarakPetaSkala(3, 'm', 200, 'cm'), 1.5);
  assert.equal(E.jarakPetaSkala(48, 'm', 400, 'cm'), 12);
});

test('penyebutSkala: jarak sebenarnya (satuan peta) : jarak peta', () => {
  assert.equal(E.penyebutSkala(4, 'cm', 1, 'km'), 25000);
  assert.equal(E.penyebutSkala(8, 'cm', 2.4, 'km'), 30000);
  assert.equal(E.penyebutSkala(12, 'cm', 60, 'm'), 500);
  assert.equal(E.penyebutSkala(8, 'cm', 12, 'm'), 150);
});

test('fmtSkalaPeta & parseIsianSkala', () => {
  assert.equal(E.fmtSkalaPeta(25000), '1 : 25.000');
  assert.equal(E.fmtSkalaPeta(200), '1 : 200');
  assert.deepEqual(plain(E.parseIsianSkala('1 : 25.000')), { a: 1, b: 25000, kode: 'ok' });
  assert.deepEqual(plain(E.parseIsianSkala('1:25000')), { a: 1, b: 25000, kode: 'ok' });
  assert.equal(E.parseIsianSkala('').kode, 'kosong');
  assert.equal(E.parseIsianSkala('25000').kode, 'format');
  assert.equal(E.parseIsianSkala('1 : 0').kode, 'nol');
});

test('satuanBacaSkala: satuan paling enak dibaca untuk n cm', () => {
  assert.equal(E.satuanBacaSkala(50), 'cm');
  assert.equal(E.satuanBacaSkala(200), 'm');
  assert.equal(E.satuanBacaSkala(25000), 'm');
  assert.equal(E.satuanBacaSkala(100000), 'km');
  assert.equal(E.satuanBacaSkala(2000000), 'km');
});

const ASLI = { jenis: 'asli', jPeta: 4, satPeta: 'cm', penyebut: 25000, satJawab: 'km' };

test('diagnosaJarakSebenarnya: benar & miskonsepsi', () => {
  assert.equal(E.diagnosaJarakSebenarnya('1', ASLI).kode, 'benar');
  assert.equal(E.diagnosaJarakSebenarnya('1,0', ASLI).benar, true);
  assert.equal(E.diagnosaJarakSebenarnya('100.000', ASLI).kode, 'tanpaKonversi');
  assert.equal(E.diagnosaJarakSebenarnya('100', ASLI).kode, 'salahFaktor');
  assert.equal(E.diagnosaJarakSebenarnya('10', ASLI).kode, 'salahFaktor');
  assert.equal(E.diagnosaJarakSebenarnya('0,25', ASLI).kode, 'satuCm');
  assert.equal(E.diagnosaJarakSebenarnya('6.250', ASLI).kode, 'dibagi');
  assert.equal(E.diagnosaJarakSebenarnya('7', ASLI).kode, 'salah');
  assert.equal(E.diagnosaJarakSebenarnya('', ASLI).kode, 'kosong');
  assert.equal(E.diagnosaJarakSebenarnya('satu', ASLI).kode, 'format');
  /* pesan menyebut fakta konversi */
  assert.match(E.diagnosaJarakSebenarnya('100.000', ASLI).pesan, /km/);
});

test('diagnosaJarakSebenarnya: satuan jawaban = satuan peta tidak memicu tanpaKonversi', () => {
  const c = { jenis: 'asli', jPeta: 4, satPeta: 'cm', penyebut: 25000, satJawab: 'cm' };
  assert.equal(E.diagnosaJarakSebenarnya('100.000', c).kode, 'benar');
  assert.equal(E.diagnosaJarakSebenarnya('25.000', c).kode, 'satuCm');
});

const PETA = { jenis: 'peta', jAsli: 1.5, satAsli: 'km', penyebut: 25000, satJawab: 'cm' };

test('diagnosaJarakPeta: benar & miskonsepsi', () => {
  assert.equal(E.diagnosaJarakPeta('6', PETA).kode, 'benar');
  assert.equal(E.diagnosaJarakPeta('0,00006', PETA).kode, 'tanpaKonversi');
  assert.equal(E.diagnosaJarakPeta('0,06', PETA).kode, 'salahFaktor');
  assert.equal(E.diagnosaJarakPeta('37.500', PETA).kode, 'dikali');
  assert.equal(E.diagnosaJarakPeta('3.750.000.000', PETA).kode, 'dikali');
  assert.equal(E.diagnosaJarakPeta('5', PETA).kode, 'salah');
  assert.equal(E.diagnosaJarakPeta('', PETA).kode, 'kosong');
});

const SKALA = { jenis: 'skala', jPeta: 4, satPeta: 'cm', jAsli: 1, satAsli: 'km' };

test('diagnosaSkalaPeta: harus berbentuk 1 : n', () => {
  assert.equal(E.diagnosaSkalaPeta('1 : 25.000', SKALA).kode, 'benar');
  assert.equal(E.diagnosaSkalaPeta('1:25000', SKALA).benar, true);
  assert.equal(E.diagnosaSkalaPeta('4 : 100.000', SKALA).kode, 'belumSatu');
  assert.equal(E.diagnosaSkalaPeta('25.000 : 1', SKALA).kode, 'terbalik');
  assert.equal(E.diagnosaSkalaPeta('4 : 1', SKALA).kode, 'tanpaKonversi');
  assert.equal(E.diagnosaSkalaPeta('1 : 250', SKALA).kode, 'salahFaktor');
  assert.equal(E.diagnosaSkalaPeta('1 : 7', SKALA).kode, 'salah');
  assert.equal(E.diagnosaSkalaPeta('', SKALA).kode, 'kosong');
  assert.equal(E.diagnosaSkalaPeta('25000', SKALA).kode, 'format');
  /* jarak sebenarnya desimal (2,4 km) */
  const c = { jenis: 'skala', jPeta: 8, satPeta: 'cm', jAsli: 2.4, satAsli: 'km' };
  assert.equal(E.diagnosaSkalaPeta('1 : 30.000', c).kode, 'benar');
  assert.equal(E.diagnosaSkalaPeta('10 : 3', c).kode, 'tanpaKonversi');
});

test('periksaSoalSkala & jawabSoalSkala untuk semua jenis', () => {
  const soal = [
    { cek: ASLI, jawab: '1' },
    { cek: PETA, jawab: '6' },
    { cek: SKALA, jawab: '1 : 25.000' },
    { cek: { jenis: 'konversi', nilai: 25000, dari: 'cm', ke: 'm' }, jawab: '250' },
    {
      cek: { jenis: 'asli', jPeta: 7, satPeta: 'cm', penyebut: 50000, satJawab: 'km' },
      jawab: '3,5',
    },
  ];
  soal.forEach((s) => {
    assert.equal(E.jawabSoalSkala(s), s.jawab, s.cek.jenis);
    assert.equal(E.periksaSoalSkala(s.jawab, s).benar, true, s.cek.jenis);
  });
  assert.equal(E.periksaSoalSkala('25', { cek: soal[3].cek }).kode, 'salahFaktor');
});

test('jenisAngkaSkala & satuanSoalSkala', () => {
  assert.equal(E.jenisAngkaSkala('asli'), true);
  assert.equal(E.jenisAngkaSkala('peta'), true);
  assert.equal(E.jenisAngkaSkala('konversi'), true);
  assert.equal(E.jenisAngkaSkala('skala'), false);
  assert.equal(E.satuanSoalSkala({ cek: ASLI }), 'km');
  assert.equal(E.satuanSoalSkala({ cek: PETA }), 'cm');
  assert.equal(E.satuanSoalSkala({ cek: SKALA }), '');
  assert.equal(
    E.satuanSoalSkala({ cek: { jenis: 'konversi', nilai: 2, dari: 'm', ke: 'cm' } }),
    'cm'
  );
});

test('opsiSoalSkala: ≥ 4 opsi unik, kunci = baku, pengecoh berdiagnosa', () => {
  const soal = [
    { cek: ASLI },
    { cek: PETA },
    { cek: SKALA },
    { cek: { jenis: 'asli', jPeta: 9, satPeta: 'cm', penyebut: 25000, satJawab: 'km' } },
    { cek: { jenis: 'peta', jAsli: 4.5, satAsli: 'km', penyebut: 150000, satJawab: 'cm' } },
    { cek: { jenis: 'skala', jPeta: 3, satPeta: 'cm', jAsli: 600, satAsli: 'm' } },
    { cek: { jenis: 'asli', jPeta: 15, satPeta: 'cm', penyebut: 200, satJawab: 'm' } },
    { cek: { jenis: 'peta', jAsli: 18, satAsli: 'm', penyebut: 300, satJawab: 'cm' } },
    { cek: { jenis: 'skala', jPeta: 8, satPeta: 'cm', jAsli: 12, satAsli: 'm' } },
  ];
  soal.forEach((s) => {
    const o = E.opsiSoalSkala(s);
    const name = JSON.stringify(s.cek);
    assert.ok(o.length >= 4, name + ': minimal 4 opsi');
    assert.equal(new Set(o.map((x) => x.id)).size, o.length, name + ': id unik');
    assert.equal(new Set(o.map((x) => x.label)).size, o.length, name + ': label unik');
    assert.equal(o[0].id, 'baku');
    o.forEach((x) => assert.ok(x.umpan, name + '.' + x.id + ': umpan'));
    /* label kunci memuat jawaban baku */
    assert.ok(o[0].label.indexOf(E.jawabSoalSkala(s)) === 0, name + ': label kunci');
    /* pengecoh tidak dinilai benar oleh pemeriksa */
    o.slice(1).forEach((x) => {
      const isian = x.label.replace(/\s*(km|m|cm|mm)$/, '');
      assert.equal(E.periksaSoalSkala(isian, s).benar, false, name + ': ' + x.label);
    });
  });
});

test('langkah skala memakai buildLangkahRasio dengan pemeriksa skala', () => {
  const step = E.siapkanLangkahSkala({
    label: 'Jarak 4 cm = … km',
    cek: ASLI,
    hints: ['Kalikan dulu.'],
    satuan: 'km',
  });
  assert.equal(step.angka, true);
  assert.equal(typeof step.periksa, 'function');
  const st = E.makeCekStep();
  const r1 = E.periksaLangkahRasio(st, step, '100.000');
  assert.equal(r1.kode, 'tanpaKonversi');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  const html = E.buildLangkahRasio('ls0', st, step, 1);
  assert.match(html, /inputmode="decimal"/);
  assert.match(html, /km/);
  const r2 = E.periksaLangkahRasio(st, step, '1');
  assert.equal(r2.benar, true);
  assert.equal(st.done, true);
  assert.match(E.buildLangkahRasio('ls0', st, step, 1), /✓ 1 km/);

  const sk = E.siapkanLangkahSkala({ label: 'Skala = …', cek: SKALA, hints: ['x'] });
  assert.equal(sk.angka, false);
  const st2 = E.makeCekStep();
  assert.equal(E.periksaLangkahRasio(st2, sk, '25.000 : 1').kode, 'terbalik');
  assert.match(E.buildLangkahRasio('ls1', st2, sk, 2), /rasio-input/);
  E.periksaLangkahRasio(st2, sk, '1 : 25000');
  assert.match(E.buildLangkahRasio('ls1', st2, sk, 2), /✓ 1 : 25\.000/);
  /* isian tak terbaca tidak dihitung */
  const st3 = E.makeCekStep();
  E.periksaLangkahRasio(st3, sk, '');
  assert.equal(st3.attempts, 0);
});

test('langkah rasio lama tetap memakai pemeriksa rasio-satuan', () => {
  const st = E.makeCekStep();
  const step = { label: 'x', cek: { jenis: 'konversi', nilai: 2, dari: 'm', ke: 'cm' } };
  assert.equal(E.periksaLangkahRasio(st, step, '200').benar, true);
});

const PETA_CFG = {
  penyebut: 25000,
  lebar: 13,
  tinggi: 9,
  tempat: [
    { id: 'balai', nama: 'Balai Desa', ikon: '🏛️', x: 2, y: 7 },
    { id: 'museum', nama: 'Museum Batik', ikon: '🖼️', x: 2, y: 3 },
    { id: 'taman', nama: 'Taman Bambu', ikon: '🎋', x: 5, y: 7 },
    { id: 'gerabah', nama: 'Sentra Gerabah', ikon: '🏺', x: 8, y: 3 },
  ],
  jalan: [
    { id: 'bm', dari: 'balai', ke: 'museum' },
    { id: 'bt', dari: 'balai', ke: 'taman' },
    { id: 'mt', dari: 'museum', ke: 'taman' },
    { id: 'mg', dari: 'museum', ke: 'gerabah' },
    { id: 'tg', dari: 'taman', ke: 'gerabah' },
  ],
};

test('panjangJalanPeta & panjangRutePeta (cm, satu desimal)', () => {
  assert.equal(E.panjangJalanPeta(PETA_CFG, 'bm'), 4);
  assert.equal(E.panjangJalanPeta(PETA_CFG, 'bt'), 3);
  assert.equal(E.panjangJalanPeta(PETA_CFG, 'mt'), 5);
  assert.equal(E.panjangJalanPeta(PETA_CFG, 'mg'), 6);
  assert.equal(E.panjangJalanPeta(PETA_CFG, 'tg'), 5);
  assert.equal(E.panjangRutePeta(PETA_CFG, ['bm', 'mg']), 10);
  assert.equal(E.panjangRutePeta(PETA_CFG, ['bt', 'mt', 'mg']), 14);
  assert.throws(() => E.panjangJalanPeta(PETA_CFG, 'xx'), /jalan/i);
});

test('Lab Peta: state, pilih jalan, render, dan sorotan rute', () => {
  const st = {};
  E.ensurePetaSkalaState(st, PETA_CFG);
  assert.equal(st.jalan, null);
  assert.deepEqual(plain(st.diukur), {});
  let html = E.buildPetaSkala('peta', st, PETA_CFG);
  assert.match(html, /<svg[^>]*role="img"/);
  assert.match(html, /1 : 25\.000/);
  assert.match(html, /data-jalan="bm"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /role="status"/);
  assert.equal((html.match(/class="peta-skala__tempat"/g) || []).length, 4);

  assert.equal(E.pilihJalanPeta(st, PETA_CFG, 'mg'), true);
  assert.equal(E.pilihJalanPeta(st, PETA_CFG, 'zz'), false);
  assert.equal(st.jalan, 'mg');
  assert.equal(st.diukur.mg, true);
  html = E.buildPetaSkala('peta', st, PETA_CFG);
  assert.match(html, /6 cm/);
  assert.match(html, /peta-skala__penggaris/);
  assert.match(
    html,
    /data-jalan="mg"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-jalan="mg"/
  );

  /* state rusak disetel ulang */
  const rusak = { jalan: 'tidak-ada', diukur: 'x' };
  E.ensurePetaSkalaState(rusak, PETA_CFG);
  assert.equal(rusak.jalan, null);
  assert.deepEqual(plain(rusak.diukur), {});

  /* mode statis untuk poster: tanpa tombol, rute disorot */
  const statis = E.buildPetaSkala('poster', null, PETA_CFG, { sorot: ['bm', 'mg'] });
  assert.doesNotMatch(statis, /data-jalan=/);
  assert.equal((statis.match(/is-sorot/g) || []).length, 2);
});

test('buildBatangSkala: ruas 1 cm berlabel jarak sebenarnya', () => {
  const html = E.buildBatangSkala(25000, { ruas: 4 });
  assert.match(html, /<svg/);
  assert.match(html, />0</);
  assert.match(html, />250</);
  assert.match(html, />1\.000 m</);
  const km = E.buildBatangSkala(100000, { ruas: 2 });
  assert.match(km, />2 km</);
  assert.match(km, /aria-label="[^"]*1 cm mewakili 1 km/);
});

const BANDING_CFG = {
  nama: 'Lapangan desa',
  panjang: 40,
  lebar: 24,
  satuan: 'm',
  kertas: { p: 15, l: 10 },
  pilihan: [100, 200, 500, 1000],
};

test('Pembanding Skala: ukuran gambar dan muat di kertas', () => {
  assert.deepEqual(plain(E.ukuranGambarSkala(BANDING_CFG, 500)), { p: 8, l: 4.8, muat: true });
  assert.deepEqual(plain(E.ukuranGambarSkala(BANDING_CFG, 200)), { p: 20, l: 12, muat: false });
  const st = {};
  E.ensurePembandingState(st, BANDING_CFG);
  assert.equal(st.penyebut, null);
  let html = E.buildPembandingSkala('banding', st, BANDING_CFG);
  assert.match(html, /data-penyebut="500"/);
  assert.match(html, /Pilih salah satu skala/);
  assert.equal(E.pilihSkalaBanding(st, BANDING_CFG, 333), false);
  assert.equal(E.pilihSkalaBanding(st, BANDING_CFG, 200), true);
  html = E.buildPembandingSkala('banding', st, BANDING_CFG);
  assert.match(html, /20 cm × 12 cm/);
  assert.match(html, /tidak muat/i);
  E.pilihSkalaBanding(st, BANDING_CFG, 500);
  html = E.buildPembandingSkala('banding', st, BANDING_CFG);
  assert.match(html, /8 cm × 4,8 cm/);
  assert.match(html, /muat/);
  assert.deepEqual(Object.keys(st.dicoba).sort(), ['200', '500']);
  assert.equal(E.semuaSkalaDicoba(st, BANDING_CFG), false);
  E.pilihSkalaBanding(st, BANDING_CFG, 100);
  E.pilihSkalaBanding(st, BANDING_CFG, 1000);
  assert.equal(E.semuaSkalaDicoba(st, BANDING_CFG), true);
});

const DENAH_CFG = {
  penyebut: 200,
  ruang: { nama: 'Aula', p: 24, l: 14 },
  target: { nama: 'Stand 7D', p: 3, l: 2 },
  langkah: 0.5,
  awal: { p: 0.5, l: 0.5 },
};

test('Lab Denah: stepper ukuran denah → ukuran sebenarnya', () => {
  const st = {};
  E.ensureDenahSkalaState(st, DENAH_CFG);
  assert.deepEqual(plain(st), { p: 0.5, l: 0.5 });
  assert.equal(E.denahSkalaPas(st, DENAH_CFG), false);
  assert.equal(E.ubahDenahSkala(st, DENAH_CFG, 'p', 1), true);
  assert.equal(st.p, 1);
  assert.equal(E.ubahDenahSkala(st, DENAH_CFG, 'l', -1), false, 'tidak boleh di bawah langkah');
  let html = E.buildDenahSkala('denah', st, DENAH_CFG);
  assert.match(html, /id="denahPInc"/);
  assert.match(html, /id="denahLDec"[^>]*disabled/);
  assert.match(html, /2 m × 1 m/);
  assert.match(html, /role="status"/);
  E.ubahDenahSkala(st, DENAH_CFG, 'p', 1);
  E.ubahDenahSkala(st, DENAH_CFG, 'l', 1);
  assert.deepEqual(plain(st), { p: 1.5, l: 1 });
  assert.equal(E.denahSkalaPas(st, DENAH_CFG), true);
  html = E.buildDenahSkala('denah', st, DENAH_CFG);
  assert.match(html, /3 m × 2 m/);
  assert.match(html, /is-pas/);
  /* batas maksimum = ukuran ruang pada denah (12 cm × 7 cm) */
  const besar = { p: 12, l: 7 };
  E.ensureDenahSkalaState(besar, DENAH_CFG);
  assert.equal(E.ubahDenahSkala(besar, DENAH_CFG, 'p', 1), false);
  /* state rusak disetel ulang */
  const rusak = { p: 'x', l: 99 };
  E.ensureDenahSkalaState(rusak, DENAH_CFG);
  assert.deepEqual(plain(rusak), { p: 0.5, l: 0.5 });
});
