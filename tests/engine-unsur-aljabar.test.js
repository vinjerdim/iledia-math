'use strict';

/*
 * Tes engine seksi 74 — Unsur bentuk aljabar (variabel, konstanta,
 * koefisien, suku): membaca bentuk aljabar, menulis ulang dengan minus
 * tipografis, unsur-unsurnya, model kantong & kelereng ⇄ bentuk aljabar,
 * jenis sebuah bagian, isian berdiagnosa miskonsepsi, opsi pilihan ganda
 * berpengecoh, Lab Kantong, Ketuk Unsur, dan langkah isian.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

function arr(x) {
  return JSON.parse(JSON.stringify(x));
}

test('parseBilAljabar: bilangan bertanda, ribuan, dan isian tak terbaca', () => {
  assert.deepEqual(arr(E.parseBilAljabar('3')), { kode: 'ok', nilai: 3 });
  assert.deepEqual(arr(E.parseBilAljabar(' −5 ')), { kode: 'ok', nilai: -5 });
  assert.deepEqual(arr(E.parseBilAljabar('-1')), { kode: 'ok', nilai: -1 });
  assert.deepEqual(arr(E.parseBilAljabar('+4')), { kode: 'ok', nilai: 4 });
  assert.deepEqual(arr(E.parseBilAljabar('2.000')), { kode: 'ok', nilai: 2000 });
  assert.deepEqual(arr(E.parseBilAljabar('1,5')), { kode: 'ok', nilai: 1.5 });
  assert.equal(E.parseBilAljabar('').kode, 'kosong');
  assert.equal(E.parseBilAljabar('3x').kode, 'format');
  assert.equal(E.parseBilAljabar('x').kode, 'format');
});

test('parseBentukAljabar: suku bertanda, koefisien tersirat 1 / −1, konstanta', () => {
  assert.deepEqual(arr(E.parseBentukAljabar('3x + 2y − 5')), [
    { koef: 3, variabel: 'x', tersirat: false },
    { koef: 2, variabel: 'y', tersirat: false },
    { koef: -5, variabel: '', tersirat: false },
  ]);
  assert.deepEqual(arr(E.parseBentukAljabar('−x + 7')), [
    { koef: -1, variabel: 'x', tersirat: true },
    { koef: 7, variabel: '', tersirat: false },
  ]);
  assert.deepEqual(arr(E.parseBentukAljabar('a-b')), [
    { koef: 1, variabel: 'a', tersirat: true },
    { koef: -1, variabel: 'b', tersirat: true },
  ]);
  assert.deepEqual(arr(E.parseBentukAljabar('3k+2j+2.000')), [
    { koef: 3, variabel: 'k', tersirat: false },
    { koef: 2, variabel: 'j', tersirat: false },
    { koef: 2000, variabel: '', tersirat: false },
  ]);
  /* huruf kapital dibaca sebagai huruf kecil; × dan spasi diabaikan */
  assert.deepEqual(arr(E.parseBentukAljabar('4 × P')), [
    { koef: 4, variabel: 'p', tersirat: false },
  ]);
  ['', '3x +', '+', '2x3', 'x y', '3 + + 2', '5%'].forEach((s) =>
    assert.equal(E.parseBentukAljabar(s), null, JSON.stringify(s))
  );
});

test('formatBentukAljabar & rapikanBentukAljabar: minus tipografis & ribuan', () => {
  assert.equal(E.rapikanBentukAljabar('3x+2y-5'), '3x + 2y − 5');
  assert.equal(E.rapikanBentukAljabar('-x+7'), '−x + 7');
  assert.equal(E.rapikanBentukAljabar('1x - 1y'), 'x − y');
  assert.equal(E.rapikanBentukAljabar('3k+2j+2000'), '3k + 2j + 2.000');
  assert.equal(E.rapikanBentukAljabar('-4'), '−4');
  assert.equal(E.rapikanBentukAljabar('???'), '???');
  assert.equal(E.formatSukuAljabar({ koef: -3, variabel: 'm' }, true), '−3m');
  assert.equal(E.formatSukuAljabar({ koef: -3, variabel: 'm' }, false), '3m');
  assert.equal(E.formatSukuAljabar({ koef: 1, variabel: 'm' }, true), 'm');
});

test('unsurBentuk: variabel, koefisien, konstanta, suku, banyak suku', () => {
  const U = arr(E.unsurBentuk('3x + 2y − 5'));
  assert.deepEqual(U.variabel, ['x', 'y']);
  assert.deepEqual(U.koefisien, [
    { variabel: 'x', koef: 3 },
    { variabel: 'y', koef: 2 },
  ]);
  assert.deepEqual(U.konstanta, [-5]);
  assert.deepEqual(U.suku, ['3x', '2y', '−5']);
  assert.equal(U.banyakSuku, 3);
  const V = arr(E.unsurBentuk('−p + 4q'));
  assert.deepEqual(V.konstanta, []);
  assert.deepEqual(V.suku, ['−p', '4q']);
  assert.equal(E.koefisienDari('−p + 4q', 'p'), -1);
  assert.equal(E.koefisienDari('−p + 4q', 'r'), null);
  assert.equal(E.konstantaDari('3x + 2y − 5'), -5);
  assert.equal(E.konstantaDari('3x'), null);
  assert.equal(E.unsurBentuk('3 +'), null);
});

test('samaBentukAljabar: urutan suku boleh berbeda, tanda harus sama', () => {
  assert.equal(E.samaBentukAljabar('3x + 2', '2 + 3x'), true);
  assert.equal(E.samaBentukAljabar('3x − 2', '−2 + 3x'), true);
  assert.equal(E.samaBentukAljabar('3x − 2', '3x + 2'), false);
  assert.equal(E.samaBentukAljabar('x + y', 'x + y + 0'), false);
  assert.equal(E.samaBentukAljabar('x', '1x'), true);
  assert.equal(E.samaBentukAljabar('x +', 'x'), false);
});

test('model kantong & kelereng ⇄ bentuk aljabar', () => {
  assert.equal(E.bentukDariModel({ x: 3, lepas: 2 }), '3x + 2');
  assert.equal(E.bentukDariModel({ x: 2, y: -1, lepas: -4 }), '2x − y − 4');
  assert.equal(E.bentukDariModel({ x: 0, y: 1, lepas: 0 }), 'y');
  assert.equal(E.bentukDariModel({ x: 0, lepas: 0 }), '0');
  assert.equal(E.bentukDariModel({ y: 1, x: 2 }, ['x', 'y']), '2x + y');
  assert.deepEqual(arr(E.modelDariBentuk('2x − y − 4')), { x: 2, y: -1, lepas: -4 });
  assert.deepEqual(arr(E.modelDariBentuk('5')), { lepas: 5 });
});

test('jenisBagianAljabar: menamai bagian sebuah bentuk aljabar', () => {
  const b = '4m − 7';
  assert.equal(E.jenisBagianAljabar(b, 'm'), 'variabel');
  assert.equal(E.jenisBagianAljabar(b, '4'), 'koefisien');
  assert.equal(E.jenisBagianAljabar(b, '−7'), 'konstanta');
  assert.equal(E.jenisBagianAljabar(b, '7'), 'konstanta');
  assert.equal(E.jenisBagianAljabar(b, '4m'), 'suku');
  assert.equal(E.jenisBagianAljabar(b, 'q'), null);
  /* bilangan yang muncul sebagai koefisien SEKALIGUS konstanta → ambigu */
  assert.equal(E.jenisBagianAljabar('2x + 2', '2'), null);
});

test('nilaiSoalUnsur & jawabSoalUnsur untuk setiap jenis permintaan', () => {
  const b = '5a − b + 8';
  assert.equal(E.nilaiSoalUnsur({ bentuk: b, minta: 'koefisien', variabel: 'b' }), -1);
  assert.equal(E.nilaiSoalUnsur({ bentuk: b, minta: 'konstanta' }), 8);
  assert.equal(E.nilaiSoalUnsur({ bentuk: b, minta: 'banyakSuku' }), 3);
  assert.deepEqual(arr(E.nilaiSoalUnsur({ bentuk: b, minta: 'variabel' })), ['a', 'b']);
  assert.equal(E.nilaiSoalUnsur({ bentuk: b, minta: 'suku', ke: 2 }), '−b');
  assert.equal(E.nilaiSoalUnsur({ model: { x: 2, lepas: -3 }, minta: 'bentuk' }), '2x − 3');
  assert.equal(E.nilaiSoalUnsur({ bentuk: b, minta: 'jenis', bagian: '5' }), 'koefisien');
  assert.equal(E.jawabSoalUnsur({ cek: { bentuk: b, minta: 'koefisien', variabel: 'b' } }), '−1');
  assert.equal(E.jawabSoalUnsur({ cek: { bentuk: b, minta: 'variabel' } }), 'a, b');
  assert.equal(E.jawabSoalUnsur({ cek: { bentuk: '2k + 1.500', minta: 'konstanta' } }), '1.500');
  assert.equal(E.jawabSoalUnsur({ cek: { bentuk: b, minta: 'jenis', bagian: 'a' } }), 'variabel');
});

function cek(c, isian) {
  return E.periksaSoalUnsur(isian, { cek: c });
}

test('periksaSoalUnsur: koefisien — tanda hilang, tersirat 1, tertukar konstanta', () => {
  const c = { bentuk: '−3x + y + 4', minta: 'koefisien', variabel: 'x' };
  assert.equal(cek(c, '−3').benar, true);
  assert.equal(cek(c, '-3').benar, true);
  assert.equal(cek(c, '3').kode, 'tandaHilang');
  assert.equal(cek(c, '4').kode, 'tukarKonstanta');
  assert.equal(cek(c, '1').kode, 'variabelLain');
  assert.equal(cek(c, '9').kode, 'salah');
  assert.equal(cek(c, '').kode, 'kosong');
  assert.equal(cek(c, '−3x').kode, 'denganVariabel');
  assert.equal(cek(c, 'abc').kode, 'format');
  const d = { bentuk: '−3x + y + 4', minta: 'koefisien', variabel: 'y' };
  assert.equal(cek(d, '1').benar, true);
  assert.equal(cek(d, '0').kode, 'tersiratNol');
  assert.equal(cek(d, 'y').kode, 'denganVariabel');
  const e = { bentuk: '6 − m', minta: 'koefisien', variabel: 'm' };
  assert.equal(cek(e, '−1').benar, true);
  assert.equal(cek(e, '1').kode, 'tandaHilang');
  assert.equal(cek(e, '0').kode, 'tersiratNol');
  assert.equal(cek(e, '6').kode, 'tukarKonstanta');
  for (const k of ['tandaHilang', 'tukarKonstanta', 'variabelLain', 'tersiratNol', 'salah']) {
    assert.ok(E.PESAN_UNSUR[k], k + ': ada pesan');
  }
});

test('periksaSoalUnsur: konstanta — tanda hilang & tertukar koefisien', () => {
  const c = { bentuk: '2p + 5q − 9', minta: 'konstanta' };
  assert.equal(cek(c, '−9').benar, true);
  assert.equal(cek(c, '9').kode, 'tandaHilang');
  assert.equal(cek(c, '2').kode, 'tukarKoefisien');
  assert.equal(cek(c, '5').kode, 'tukarKoefisien');
  assert.equal(cek(c, '1').kode, 'salah');
});

test('periksaSoalUnsur: banyak suku — konstanta terlewat, angka & huruf dipisah', () => {
  const c = { bentuk: '4x + 3y − 2', minta: 'banyakSuku' };
  assert.equal(cek(c, '3').benar, true);
  assert.equal(cek(c, '2').kode, 'konstantaBukanSuku');
  assert.equal(cek(c, '5').kode, 'pisahAngkaHuruf');
  assert.equal(cek(c, '1,5').kode, 'format');
  const d = { bentuk: 'a + b + c', minta: 'banyakSuku' };
  assert.equal(cek(d, '3').benar, true);
  assert.equal(cek(d, '4').kode, 'salah');
});

test('periksaSoalUnsur: variabel — urutan & pemisah bebas, angka bukan variabel', () => {
  const c = { bentuk: '2m + n − 6', minta: 'variabel' };
  ['m, n', 'n dan m', 'm n', 'M,N', 'm;n'].forEach((s) => assert.equal(cek(c, s).benar, true, s));
  assert.equal(cek(c, 'm').kode, 'kurangVariabel');
  assert.equal(cek(c, 'm, n, x').kode, 'lebihVariabel');
  assert.equal(cek(c, '2, 6').kode, 'angkaBukanVariabel');
  assert.equal(cek(c, '2m, n').kode, 'denganKoefisien');
  assert.equal(cek(c, '').kode, 'kosong');
});

test('periksaSoalUnsur: suku ke-n — tanda ikut suku, koefisien saja bukan suku', () => {
  const c = { bentuk: '7a − 4b + 1', minta: 'suku', ke: 2 };
  assert.equal(cek(c, '−4b').benar, true);
  assert.equal(cek(c, '-4b').benar, true);
  assert.equal(cek(c, '4b').kode, 'tandaHilang');
  assert.equal(cek(c, '−4').kode, 'tanpaVariabel');
  assert.equal(cek(c, '7a').kode, 'sukuLain');
  assert.equal(cek(c, '3c').kode, 'salah');
  assert.equal(cek(c, '4b +').kode, 'format');
});

test('periksaSoalUnsur: menulis bentuk dari model — tanda, konstanta, kantong ↔ kelereng', () => {
  const c = { model: { x: 3, y: -1, lepas: 2 }, minta: 'bentuk' };
  assert.equal(cek(c, '3x − y + 2').benar, true);
  assert.equal(cek(c, '2 + 3x - y').benar, true);
  assert.equal(cek(c, '3x + y + 2').kode, 'tandaHilang');
  assert.equal(cek(c, '3x − y').kode, 'tanpaKonstanta');
  assert.equal(cek(c, '2x − y + 3').kode, 'tukarKantongLepas');
  assert.equal(cek(c, '3x + 2').kode, 'kurangSuku');
  assert.equal(cek(c, '3 + x').kode, 'salah');
  assert.equal(cek(c, '3x −').kode, 'format');
});

test('periksaSoalUnsur: jenis bagian — kode pilihan', () => {
  const c = { bentuk: '4m − 7', minta: 'jenis', bagian: 'm' };
  assert.equal(cek(c, 'variabel').benar, true);
  assert.equal(cek(c, 'namaBenda').kode, 'namaBenda');
  assert.equal(cek(c, 'konstanta').kode, 'salahJenis');
});

test('opsiSoalUnsur: kunci + pengecoh berdiagnosa, label unik, minimal 4', () => {
  const cases = [
    { bentuk: '−3x + y + 4', minta: 'koefisien', variabel: 'x' },
    { bentuk: '6 − m', minta: 'koefisien', variabel: 'm' },
    { bentuk: '2p + 5q − 9', minta: 'konstanta' },
    { bentuk: '4x + 3y − 2', minta: 'banyakSuku' },
    { bentuk: '2m + n − 6', minta: 'variabel' },
    { bentuk: '7a − 4b + 1', minta: 'suku', ke: 2 },
    { model: { x: 3, y: -1, lepas: 2 }, minta: 'bentuk' },
    { bentuk: '4m − 7', minta: 'jenis', bagian: 'm' },
    { bentuk: '4m − 7', minta: 'jenis', bagian: '−7' },
    { bentuk: '4m − 7', minta: 'jenis', bagian: '4m' },
  ];
  cases.forEach((c) => {
    const o = arr(E.opsiSoalUnsur({ cek: c }));
    const n = JSON.stringify(c);
    assert.ok(o.length >= 4, n + ': minimal 4 opsi');
    assert.equal(o[0].id, 'baku', n);
    assert.equal(new Set(o.map((x) => x.label)).size, o.length, n + ': label unik');
    assert.equal(new Set(o.map((x) => x.id)).size, o.length, n + ': id unik');
    o.forEach((x) => assert.ok(x.umpan, n + ': umpan ' + x.id));
    assert.equal(o[0].label, E.jawabSoalUnsur({ cek: c }), n + ': label kunci');
  });
  const koef = arr(E.opsiSoalUnsur({ cek: cases[0] }));
  assert.ok(koef.some((x) => x.id === 'tandaHilang' && x.label === '3'));
  assert.ok(koef.some((x) => x.id === 'tukarKonstanta' && x.label === '4'));
  /* opsi jenis untuk konstanta tidak memuat "suku" (konstanta juga suku) */
  const kon = arr(E.opsiSoalUnsur({ cek: cases[8] }));
  assert.ok(!kon.some((x) => x.id === 'suku'));
  assert.ok(kon.some((x) => x.id === 'namaBenda'));
});

test('buildBentukWarna: setiap unsur ditandai & minus tipografis', () => {
  const h = E.buildBentukWarna('3x − y + 2');
  assert.match(h, /aljabar-koef[^>]*>3</);
  assert.match(h, /aljabar-var[^>]*>x</);
  assert.match(h, /aljabar-op[^>]*>−</);
  assert.match(h, /aljabar-konst[^>]*>2</);
  assert.equal((h.match(/class="aljabar-suku/g) || []).length, 3);
  assert.match(E.buildBentukWarna('a <b>'), /a &lt;b&gt;/);
});

test('buildModelKantong: SVG kantong & kelereng beserta label aksesibel', () => {
  const h = E.buildModelKantong({ x: 2, y: -1, lepas: 3 });
  assert.match(h, /^<svg[^>]+role="img"/);
  assert.equal((h.match(/class="kantong-aljabar(?: |")/g) || []).length, 3);
  assert.equal((h.match(/class="kantong-aljabar is-kurang"/g) || []).length, 1);
  assert.equal((h.match(/class="kelereng-aljabar(?: |")/g) || []).length, 3);
  assert.match(h, /aria-label="[^"]*2 kantong x[^"]*"/);
  assert.match(E.buildModelKantong({ x: 0, lepas: 0 }), /kosong/);
});

test('Lab Kantong: ubah model, cocokkan situasi, lalu catat bentuk', () => {
  const cfg = {
    huruf: ['x', 'y'],
    batas: 5,
    batasLepas: 9,
    situasi: [
      { id: 'a', model: { x: 3, lepas: 2 } },
      { id: 'b', model: { x: 1, y: -1, lepas: 0 } },
    ],
  };
  const st = {};
  E.ensureLabKantong(st, cfg);
  assert.equal(st.aktif, 'a');
  assert.deepEqual(arr(st.model), { x: 0, y: 0, lepas: 0 });
  assert.equal(E.labKantongLengkap(st, cfg), false);
  /* model belum cocok */
  assert.equal(E.cocokkanLabKantong(st, cfg).kode, 'kurangKantong');
  E.ubahLabKantong(st, cfg, 'x', 1);
  E.ubahLabKantong(st, cfg, 'x', 1);
  E.ubahLabKantong(st, cfg, 'lepas', 1);
  E.ubahLabKantong(st, cfg, 'lepas', 1);
  E.ubahLabKantong(st, cfg, 'lepas', 1);
  assert.equal(E.cocokkanLabKantong(st, cfg).kode, 'tukarKantongLepas');
  E.ubahLabKantong(st, cfg, 'x', 1);
  E.ubahLabKantong(st, cfg, 'lepas', -1);
  const r = E.cocokkanLabKantong(st, cfg);
  assert.equal(r.kode, 'benar');
  assert.equal(st.catat.a.cocok, true);
  /* setelah cocok, model situasi terkunci */
  assert.equal(E.ubahLabKantong(st, cfg, 'y', -1), false);
  assert.equal(st.model.y, 0);
  assert.equal(st.model.x, 3);
  /* menulis bentuk aljabar berdiagnosa */
  assert.equal(E.catatLabKantong(st, cfg, '3x − 2').kode, 'tandaHilang');
  assert.equal(st.catat.a.attempts, 1);
  assert.equal(E.catatLabKantong(st, cfg, '').kode, 'kosong');
  assert.equal(st.catat.a.attempts, 1);
  assert.equal(E.catatLabKantong(st, cfg, '2 + 3x').benar, true);
  assert.equal(st.catat.a.done, true);
  assert.equal(st.catat.a.bentuk, '3x + 2');
  /* situasi berikutnya */
  E.pilihSituasiLabKantong(st, cfg, 'b');
  assert.equal(st.aktif, 'b');
  assert.deepEqual(arr(st.model), { x: 0, y: 0, lepas: 0 });
  /* batas stepper */
  for (let i = 0; i < 20; i++) E.ubahLabKantong(st, cfg, 'y', -1);
  assert.equal(st.model.y, -5);
  for (let i = 0; i < 20; i++) E.ubahLabKantong(st, cfg, 'lepas', 1);
  assert.equal(st.model.lepas, 9);
  for (let i = 0; i < 20; i++) E.ubahLabKantong(st, cfg, 'lepas', -1);
  assert.equal(E.ubahLabKantong(st, cfg, 'lepas', -1), false);
  assert.equal(st.model.lepas, -9);
  for (let i = 0; i < 9; i++) E.ubahLabKantong(st, cfg, 'lepas', 1);
  for (let i = 0; i < 6; i++) E.ubahLabKantong(st, cfg, 'y', 1);
  E.ubahLabKantong(st, cfg, 'x', 1);
  assert.deepEqual(arr(st.model), { x: 1, y: 1, lepas: 0 });
  assert.equal(E.cocokkanLabKantong(st, cfg).kode, 'tandaKantong');
  E.ubahLabKantong(st, cfg, 'y', -1);
  E.ubahLabKantong(st, cfg, 'y', -1);
  assert.equal(E.cocokkanLabKantong(st, cfg).benar, true);
  assert.equal(E.catatLabKantong(st, cfg, 'x - y').benar, true);
  assert.equal(E.labKantongLengkap(st, cfg), true);
  /* state rusak / konfigurasi berubah → disetel ulang */
  const rusak = { aktif: 'zz', model: 5, catat: null };
  E.ensureLabKantong(rusak, cfg);
  assert.equal(rusak.aktif, 'a');
  assert.deepEqual(Object.keys(rusak.catat).sort(), ['a', 'b']);
});

test('buildLabKantong: stepper, gambar, tombol cocokkan & tabel pengamatan', () => {
  const cfg = {
    huruf: ['x'],
    batas: 5,
    batasLepas: 9,
    situasi: [
      {
        id: 'a',
        judul: 'Kue',
        cerita: 'Tiga kotak kue dan 2 kue lepas.',
        model: { x: 3, lepas: 2 },
      },
    ],
  };
  const st = {};
  E.ensureLabKantong(st, cfg);
  const h = E.buildLabKantong('lk', st, cfg);
  assert.match(h, /id="lkKxDec"/);
  assert.match(h, /id="lkKlepasInc"/);
  assert.match(h, /id="lkCocok"/);
  assert.match(h, /<svg/);
  assert.match(h, /Tiga kotak kue/);
  assert.match(h, /<table/);
  assert.doesNotMatch(h, /id="lkTulisInput"/);
  E.ubahLabKantong(st, cfg, 'x', 3);
  st.model.x = 3;
  st.model.lepas = 2;
  E.cocokkanLabKantong(st, cfg);
  assert.match(E.buildLabKantong('lk', st, cfg), /id="lkTulisInput"/);
});

test('Ketuk Unsur: token, periksa variabel/konstanta/suku beserta diagnosa', () => {
  const b = '3x − y + 5';
  const tok = arr(E.tokenKetukUnsur(b, 'variabel'));
  assert.deepEqual(
    tok.map((t) => t.teks),
    ['3', 'x', '−', 'y', '+', '5']
  );
  assert.deepEqual(
    tok.filter((t) => t.target).map((t) => t.id),
    ['s0v', 's1v']
  );
  const suku = arr(E.tokenKetukUnsur(b, 'suku'));
  assert.deepEqual(
    suku.filter((t) => t.bisa).map((t) => t.teks),
    ['3x', 'y', '5']
  );
  assert.equal(E.periksaKetukUnsur(b, 'variabel', ['s0v', 's1v']).benar, true);
  assert.equal(E.periksaKetukUnsur(b, 'variabel', ['s0v']).kode, 'kurang');
  assert.equal(E.periksaKetukUnsur(b, 'variabel', ['s0v', 's1v', 's0k']).kode, 'koefisienBukan');
  assert.equal(E.periksaKetukUnsur(b, 'konstanta', ['s2k']).benar, true);
  assert.equal(E.periksaKetukUnsur(b, 'konstanta', ['s0k', 's2k']).kode, 'koefisienBukan');
  assert.equal(E.periksaKetukUnsur(b, 'konstanta', []).kode, 'kosong');
  assert.equal(E.periksaKetukUnsur(b, 'suku', ['s0', 's1', 's2']).benar, true);
  assert.equal(E.periksaKetukUnsur(b, 'suku', ['s0', 's1']).kode, 'kurang');
  const st = {};
  E.ensureKetukUnsur(st, 'k1');
  assert.deepEqual(arr(st.k1), { pilih: [], attempts: 0, done: false, kode: null });
  E.toggleKetukUnsur(st.k1, 's0v');
  E.toggleKetukUnsur(st.k1, 's0v');
  assert.deepEqual(arr(st.k1.pilih), []);
  const html = E.buildKetukUnsur('ku', b, 'variabel', st.k1);
  assert.equal((html.match(/data-ketuk="/g) || []).length, 4);
  assert.match(html, /aria-pressed="false"/);
});

test('langkah isian unsur: periksa, simpan, isian tak terbaca tidak dihitung', () => {
  const step = {
    label: 'Koefisien x?',
    cek: { bentuk: '−3x + 4', minta: 'koefisien', variabel: 'x' },
  };
  const st = E.makeCekStep();
  assert.equal(E.periksaLangkahUnsur(st, step, '').kode, 'kosong');
  assert.equal(st.attempts, 0);
  assert.equal(E.periksaLangkahUnsur(st, step, '3').kode, 'tandaHilang');
  assert.equal(st.attempts, 1);
  assert.equal(st.done, false);
  assert.match(E.buildLangkahUnsur('lu', st, step, 1), /tanda/);
  assert.equal(E.periksaLangkahUnsur(st, step, '-3').benar, true);
  assert.equal(st.done, true);
  assert.match(E.buildLangkahUnsur('lu', st, step, 1), /✓ −3/);
});
