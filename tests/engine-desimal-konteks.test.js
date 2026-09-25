'use strict';

/*
 * Tes engine.js bagian 37 — bilangan desimal dalam konteks sehari-hari:
 * membaca, menuliskan & membandingkan (dipakai fase-d/mpi-1.5).
 * Jalankan: npm test
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function labels(list) {
  return list.map((o) => o.label);
}

test('cekCaraBacaDesimal: cara baca koma & nilai tempat sama-sama diterima', () => {
  const a = E.cekCaraBacaDesimal('tiga koma nol tujuh', '3,07');
  assert.equal(a.benar, true);
  assert.equal(a.kode, 'benar');
  const b = E.cekCaraBacaDesimal('Tiga dan tujuh perseratus', '3,07');
  assert.equal(b.benar, true);
  assert.equal(b.kode, 'nilai-tempat');
  assert.match(b.pesan, /tiga koma nol tujuh/);
  /* "per seratus" dengan spasi dan tanpa "dan" tetap diterima */
  assert.equal(E.cekCaraBacaDesimal('tiga tujuh per seratus', '3,07').benar, true);
  assert.equal(E.cekCaraBacaDesimal('  dua belas KOMA empat lima ', '12,45').kode, 'benar');
  assert.equal(E.cekCaraBacaDesimal('nol koma lima', '0,5').kode, 'benar');
  assert.equal(E.cekCaraBacaDesimal('lima persepuluh', '0,5').kode, 'nilai-tempat');
});

test('cekCaraBacaDesimal: mendiagnosis miskonsepsi membaca', () => {
  const kode = (t, s) => E.cekCaraBacaDesimal(t, s).kode;
  assert.equal(kode('', '3,07'), 'kosong');
  assert.equal(kode('dua belas koma empat puluh lima', '12,45'), 'koma-bulat');
  assert.equal(kode('tiga koma tujuh', '3,07'), 'nol-hilang');
  assert.equal(kode('tiga titik nol tujuh', '3,07'), 'titik');
  assert.equal(kode('koma lima', '0,5'), 'lupa-bulat');
  assert.equal(kode('seribu dua ratus empat puluh lima', '12,45'), 'tanpa-koma');
  assert.equal(kode('tiga dan tujuh persepuluh', '3,07'), 'tempat-salah');
  assert.equal(kode('empat koma dua', '3,07'), 'angka-salah');
  ['koma-bulat', 'nol-hilang', 'titik', 'lupa-bulat', 'tanpa-koma', 'tempat-salah'].forEach((k) =>
    assert.ok(E.PESAN_BACA_DESIMAL[k].length > 20, k)
  );
  const r = E.cekCaraBacaDesimal('tiga koma tujuh', '3,07');
  assert.equal(r.benar, false);
  assert.match(r.pesan, /0/);
});

test('opsiCaraBacaDesimal: satu benar + tiga pengecoh unik', () => {
  ['12,45', '3,07', '0,5', '1,05', '2,005', '0,125', '37,5', '4,3'].forEach((s) => {
    const opsi = E.opsiCaraBacaDesimal(s);
    assert.equal(opsi.length, 4, s);
    assert.equal(new Set(opsi.map((o) => o.id)).size, 4, s + ': id unik');
    assert.equal(new Set(labels(opsi)).size, 4, s + ': label unik');
    const benar = opsi.filter((o) => o.benar);
    assert.equal(benar.length, 1, s);
    assert.equal(benar[0].id, 'baku');
    assert.equal(benar[0].label, E.bacaDesimalKoma(s));
    opsi.forEach((o) => {
      assert.ok(o.umpan, s + '.' + o.id + ': umpan');
      if (!o.benar) {
        assert.equal(E.cekCaraBacaDesimal(o.label, s).benar, false, s + ': ' + o.label);
      }
    });
  });
  const o = E.opsiCaraBacaDesimal('12,45');
  assert.ok(labels(o).includes('dua belas koma empat puluh lima'));
  assert.ok(labels(E.opsiCaraBacaDesimal('3,07')).includes('tiga koma tujuh'));
});

test('diagnosaTulisDesimal: menerima notasi senilai, mendiagnosis kesalahan', () => {
  const kode = (x, s) => E.diagnosaTulisDesimal(x, s).kode;
  assert.equal(kode('3,07', '3,07'), 'benar');
  assert.equal(kode(' 3,070 ', '3,07'), 'benar');
  assert.equal(E.diagnosaTulisDesimal('3,07', '3,07').benar, true);
  assert.match(E.diagnosaTulisDesimal('3,07', '3,07').pesan, /tiga koma nol tujuh/);
  assert.equal(kode('', '3,07'), 'kosong');
  assert.equal(kode('3.07', '3,07'), 'titik');
  assert.equal(kode('3,7', '3,07'), 'nol-hilang');
  assert.equal(kode('2,5', '2,005'), 'nol-hilang');
  assert.equal(kode('3,007', '3,07'), 'nol-lebih');
  assert.equal(kode('30,7', '3,07'), 'tempat-bergeser');
  assert.equal(kode('0,307', '3,07'), 'tempat-bergeser');
  assert.equal(kode('307', '3,07'), 'tanpa-koma');
  assert.equal(kode('4,2', '3,07'), 'salah');
  assert.equal(kode('3,0,7', '3,07'), 'format');
  assert.equal(E.diagnosaTulisDesimal('3,7', '3,07').benar, false);
  Object.keys(E.PESAN_TULIS_DESIMAL).forEach((k) =>
    assert.ok(E.PESAN_TULIS_DESIMAL[k].length > 15, k)
  );
});

test('opsiNotasiDesimal: satu benar + tiga pengecoh unik yang nilainya berbeda', () => {
  ['3,07', '1,05', '12,45', '0,5', '2,005', '0,125', '4,3'].forEach((s) => {
    const opsi = E.opsiNotasiDesimal(s);
    assert.equal(opsi.length, 4, s);
    assert.equal(new Set(opsi.map((o) => o.id)).size, 4, s + ': id unik');
    assert.equal(new Set(labels(opsi)).size, 4, s + ': label unik');
    assert.equal(opsi.filter((o) => o.benar).length, 1, s);
    assert.equal(opsi.find((o) => o.benar).label, s);
    opsi.forEach((o) => {
      assert.ok(o.umpan, s + '.' + o.id);
      if (!o.benar) {
        assert.equal(E.diagnosaTulisDesimal(o.label, s).benar, false, s + ': ' + o.label);
      }
    });
  });
  assert.ok(labels(E.opsiNotasiDesimal('3,07')).includes('3,7'));
  assert.ok(labels(E.opsiNotasiDesimal('3,07')).includes('3,007'));
});

test('langkah isian desimal: periksa, kosong tidak dihitung, selesai bila benar', () => {
  const st = E.makeDesimalStep();
  assert.deepEqual([st.input, st.done, st.attempts, st.hintLevel], ['', false, 0, 0]);
  const tulis = { jenis: 'tulis', jawab: '3,07', label: 'Tulis' };
  let r = E.periksaDesimalStep(st, tulis, '  ');
  assert.equal(r.kode, 'kosong');
  assert.equal(st.attempts, 0);
  r = E.periksaDesimalStep(st, tulis, '3,7');
  assert.equal(r.kode, 'nol-hilang');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  r = E.periksaDesimalStep(st, tulis, '3,07');
  assert.equal(st.done, true);
  assert.equal(st.attempts, 2);

  const st2 = E.makeDesimalStep();
  const baca = { jenis: 'baca', jawab: '12,45', label: 'Baca' };
  E.periksaDesimalStep(st2, baca, 'dua belas koma empat lima');
  assert.equal(st2.done, true);
  assert.equal(st2.kode, 'benar');
});

test('buildDesimalStep: isian, umpan balik diagnosa, dan tampilan selesai', () => {
  const step = { jenis: 'tulis', jawab: '3,07', label: 'Tulis angkanya', hints: ['h1'] };
  const st = E.makeDesimalStep();
  let html = E.buildDesimalStep('ds', st, step, 1);
  assert.match(html, /id="dsInput"/);
  assert.match(html, /inputmode="decimal"/);
  assert.match(html, /id="dsCheck"/);
  E.periksaDesimalStep(st, step, '3,7');
  html = E.buildDesimalStep('ds', st, step, 1);
  assert.match(html, /feedback-box--error/);
  assert.match(html, /3,7/);
  E.periksaDesimalStep(st, step, '3,07');
  html = E.buildDesimalStep('ds', st, step, 1);
  assert.match(html, /dl-step--done/);
  assert.match(html, /3,07/);
  assert.doesNotMatch(html, /dsInput/);

  const baca = { jenis: 'baca', jawab: '3,07', label: 'Baca' };
  const sb = E.makeDesimalStep();
  assert.match(E.buildDesimalStep('db', sb, baca), /inputmode="text"/);
  E.periksaDesimalStep(sb, baca, 'tiga dan tujuh perseratus');
  const done = E.buildDesimalStep('db', sb, baca);
  assert.match(done, /tiga koma nol tujuh/);
  assert.match(done, /feedback-box--info/);
});

test('kata perbandingan konteks desimal', () => {
  assert.equal(E.idMaknaBandingDesimal('12,45', '12,5'), 'kecil');
  assert.equal(E.idMaknaBandingDesimal('3,7', '3,68'), 'besar');
  assert.equal(E.idMaknaBandingDesimal('0,5', '0,50'), 'sama');
  assert.equal(E.maknaBandingDesimal('3,7', '3,68', 'jarak'), 'lebih jauh');
  assert.equal(E.maknaBandingDesimal('36,8', '37,5', 'suhu'), 'lebih dingin');
  assert.equal(E.maknaBandingDesimal('12,45', '12,5', 'lari'), 'lebih cepat');
  assert.equal(E.maknaBandingDesimal('1,05', '1,5', 'berat'), 'lebih ringan');
  ['jarak', 'suhu', 'lari', 'berat', 'panjang', 'banyak', 'tidakada'].forEach((t) => {
    const o = E.opsiMaknaBandingDesimal(t);
    assert.deepEqual(
      Array.from(o, (x) => x.id),
      ['kecil', 'besar', 'sama']
    );
    assert.equal(new Set(labels(o)).size, 3, t);
  });
});

test('buildPilihSimbolDesimal: tombol lambang, diagnosa saat salah, alasan saat benar', () => {
  const order = ['gt', 'eq', 'lt'];
  let html = E.buildPilihSimbolDesimal(
    '0,8',
    '0,75',
    order,
    { chosen: null, wrong: 0 },
    {
      group: 'p1',
    }
  );
  assert.match(html, /data-dec-sym="gt"/);
  assert.match(html, /data-group="p1"/);
  assert.doesNotMatch(html, /feedback-box/);
  html = E.buildPilihSimbolDesimal('0,8', '0,75', order, { chosen: 'lt', wrong: 1 });
  assert.match(html, /feedback-box--warning/);
  assert.match(html, /0,80/);
  html = E.buildPilihSimbolDesimal('0,8', '0,75', order, { chosen: 'gt', wrong: 1 });
  assert.match(html, /feedback-box--success/);
  assert.match(html, /persepuluhan/);
});
