'use strict';

/*
 * Tes shared/engine.js seksi 89 (tabung, kerucut & bola): nilai π,
 * unsur & diagnosa tabel unsur, bagian yang dapat diketuk, ukuran
 * jaring-jaring (keliling alas, garis pelukis, sudut juring), pemeriksa
 * jaring-jaring, luas permukaan & volume, kunci / diagnosa / opsi soal
 * berpengecoh, serta state & aksi Lab Unsur, Lab Bentang, Lab Kulit
 * Jeruk, Lab Tuang, dan tabel unsur (termasuk markup dasarnya).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function near(a, b, msg) {
  assert.ok(Math.abs(a - b) < 1e-6, (msg || '') + ' ' + a + ' ≈ ' + b);
}

/* ---------- π & pembulatan ---------- */

test('piTKB & teksPiTKB: 22/7 dan 3,14', () => {
  near(E.piTKB('22/7'), 22 / 7);
  near(E.piTKB('3,14'), 3.14);
  assert.equal(E.teksPiTKB('22/7'), '22/7');
  assert.equal(E.teksPiTKB('3,14'), '3,14');
  assert.throws(() => E.piTKB('pi'));
});

test('rapiTKB: membulatkan ke dua angka di belakang koma tanpa galat biner', () => {
  assert.equal(E.rapiTKB(113.04000000001), 113.04);
  assert.equal(E.rapiTKB(1437.3333333), 1437.33);
  assert.equal(E.rapiTKB(188.4), 188.4);
});

/* ---------- Unsur ---------- */

test('unsurTKB: banyak sisi, rusuk, titik sudut & titik puncak', () => {
  assert.deepEqual(plain(E.unsurTKB('tabung')), {
    sisiDatar: 2,
    sisiLengkung: 1,
    sisi: 3,
    rusuk: 2,
    titikSudut: 0,
    titikPuncak: 0,
  });
  assert.deepEqual(plain(E.unsurTKB('kerucut')), {
    sisiDatar: 1,
    sisiLengkung: 1,
    sisi: 2,
    rusuk: 1,
    titikSudut: 0,
    titikPuncak: 1,
  });
  assert.deepEqual(plain(E.unsurTKB('bola')), {
    sisiDatar: 0,
    sisiLengkung: 1,
    sisi: 1,
    rusuk: 0,
    titikSudut: 0,
    titikPuncak: 0,
  });
  assert.throws(() => E.unsurTKB('kubus'));
});

test('TKB_KOLOM: empat kolom tabel unsur', () => {
  assert.deepEqual(plain(E.TKB_KOLOM.map((k) => k.id)), [
    'sisiDatar',
    'sisiLengkung',
    'rusuk',
    'titikPuncak',
  ]);
});

test('diagnosaUnsurTKB: benar & miskonsepsi khas', () => {
  assert.equal(E.diagnosaUnsurTKB('tabung', 'sisiDatar', 2).benar, true);
  const t1 = E.diagnosaUnsurTKB('tabung', 'sisiDatar', 1);
  assert.equal(t1.benar, false);
  assert.equal(t1.kode, 'lupaTutup');
  assert.equal(E.diagnosaUnsurTKB('tabung', 'sisiLengkung', 0).kode, 'selimutDatar');
  assert.equal(E.diagnosaUnsurTKB('kerucut', 'rusuk', 2).kode, 'pelukisRusuk');
  assert.equal(E.diagnosaUnsurTKB('kerucut', 'titikPuncak', 0).kode, 'lupaPuncak');
  assert.equal(E.diagnosaUnsurTKB('bola', 'rusuk', 1).kode, 'garisBantu');
  assert.equal(E.diagnosaUnsurTKB('bola', 'sisiDatar', 1).kode, 'bolaDatar');
  assert.equal(E.diagnosaUnsurTKB('tabung', 'rusuk', 7).kode, 'lain');
  ['lupaTutup', 'selimutDatar', 'pelukisRusuk', 'lupaPuncak', 'garisBantu', 'bolaDatar'].forEach(
    (k) => assert.ok(E.TKB_PESAN[k], 'pesan ' + k)
  );
});

test('bagianTKB: bagian yang dapat diketuk pada setiap bangun', () => {
  assert.deepEqual(plain(E.bagianTKB('tabung').map((b) => b.id)), [
    'alas',
    'tutup',
    'selimut',
    'jariJari',
    'diameter',
    'tinggi',
  ]);
  assert.deepEqual(plain(E.bagianTKB('kerucut').map((b) => b.id)), [
    'alas',
    'selimut',
    'jariJari',
    'tinggi',
    'garisPelukis',
    'puncak',
  ]);
  assert.deepEqual(plain(E.bagianTKB('bola').map((b) => b.id)), [
    'permukaan',
    'pusat',
    'jariJari',
    'diameter',
  ]);
  E.TKB_JENIS.forEach((j) =>
    E.bagianTKB(j).forEach((b) => {
      assert.ok(b.label && b.info, j + '.' + b.id + ': label & info');
    })
  );
  assert.equal(E.labelBagianTKB('kerucut', 'garisPelukis'), 'Garis pelukis (s)');
});

/* ---------- Ukuran jaring-jaring ---------- */

test('garisPelukis & sudutJuringKerucut', () => {
  assert.equal(E.garisPelukis(6, 8), 10);
  assert.equal(E.garisPelukis(7, 24), 25);
  assert.equal(E.garisPelukis(5, 12), 13);
  assert.equal(E.sudutJuringKerucut(6, 10), 216);
  assert.equal(E.sudutJuringKerucut(7, 25), 100.8);
});

test('jaringTabung: persegi panjang selimut = keliling alas × tinggi', () => {
  const j = E.jaringTabung(7, 12, '22/7');
  assert.equal(j.jenis, 'tabung');
  assert.equal(j.panjang, 44);
  assert.equal(j.lebar, 12);
  assert.equal(j.luasAlas, 154);
  assert.equal(j.luasSelimut, 528);
});

test('jaringKerucut: juring berjari-jari s, busur = keliling alas', () => {
  const j = E.jaringKerucut(6, 8, '3,14');
  assert.equal(j.s, 10);
  assert.equal(j.busur, 37.68);
  assert.equal(j.sudut, 216);
  assert.equal(j.luasAlas, 113.04);
  assert.equal(j.luasSelimut, 188.4);
});

test('cekJaringTKB: tabung', () => {
  const ok = {
    jenis: 'tabung',
    r: 1,
    t: 2,
    panjang: 2 * Math.PI,
    lingkaran: [
      { r: 1, sisi: 'atas' },
      { r: 1, sisi: 'bawah' },
    ],
  };
  assert.equal(E.cekJaringTKB(ok).valid, true);
  assert.equal(E.cekJaringTKB(ok).kode, 'benar');
  assert.equal(
    E.cekJaringTKB(Object.assign({}, ok, { lingkaran: [{ r: 1, sisi: 'atas' }] })).kode,
    'lingkaranKurang'
  );
  assert.equal(
    E.cekJaringTKB(
      Object.assign({}, ok, {
        lingkaran: [
          { r: 1, sisi: 'atas' },
          { r: 1, sisi: 'atas' },
        ],
      })
    ).kode,
    'sepihak'
  );
  assert.equal(E.cekJaringTKB(Object.assign({}, ok, { panjang: 2 })).kode, 'panjangKurang');
  assert.equal(E.cekJaringTKB(Object.assign({}, ok, { panjang: 9 })).kode, 'panjangLebih');
  assert.equal(
    E.cekJaringTKB(
      Object.assign({}, ok, {
        lingkaran: [
          { r: 1, sisi: 'atas' },
          { r: 0.6, sisi: 'bawah' },
        ],
      })
    ).kode,
    'lingkaranBeda'
  );
});

test('cekJaringTKB: kerucut & bola', () => {
  const ok = { jenis: 'kerucut', s: 10, sudut: 216, lingkaran: [{ r: 6 }] };
  assert.equal(E.cekJaringTKB(ok).valid, true);
  assert.equal(E.cekJaringTKB(Object.assign({}, ok, { sudut: 300 })).kode, 'juringBesar');
  assert.equal(E.cekJaringTKB(Object.assign({}, ok, { sudut: 120 })).kode, 'juringKecil');
  assert.equal(E.cekJaringTKB(Object.assign({}, ok, { lingkaran: [] })).kode, 'lingkaranKurang');
  assert.equal(
    E.cekJaringTKB(Object.assign({}, ok, { lingkaran: [{ r: 6 }, { r: 6 }] })).kode,
    'lingkaranLebih'
  );
  const b = E.cekJaringTKB({ jenis: 'bola' });
  assert.equal(b.valid, false);
  assert.equal(b.kode, 'bola');
  ['benar', 'lingkaranKurang', 'lingkaranLebih', 'sepihak', 'juringBesar', 'bola'].forEach((k) =>
    assert.ok(E.TKB_PESAN[k], 'pesan ' + k)
  );
});

/* ---------- Luas permukaan & volume ---------- */

test('luasBagianTKB: rincian luas tiap bagian jaring-jaring', () => {
  assert.deepEqual(
    plain(E.luasBagianTKB('tabung', { r: 7, t: 12 }, '22/7')).map((b) => [b.id, b.luas]),
    [
      ['alas', 154],
      ['tutup', 154],
      ['selimut', 528],
    ]
  );
  assert.deepEqual(
    plain(E.luasBagianTKB('kerucut', { r: 6, t: 8 }, '3,14')).map((b) => [b.id, b.luas]),
    [
      ['alas', 113.04],
      ['selimut', 188.4],
    ]
  );
  assert.deepEqual(
    plain(E.luasBagianTKB('bola', { r: 7 }, '22/7')).map((b) => [b.id, b.luas]),
    [['permukaan', 616]]
  );
  E.luasBagianTKB('tabung', { r: 7, t: 12 }, '22/7').forEach((b) => assert.ok(b.rumus && b.nama));
});

test('luasPermukaanTKB: tertutup, tanpa tutup, kerucut dari s', () => {
  assert.equal(E.luasPermukaanTKB('tabung', { r: 7, t: 12 }, '22/7'), 836);
  assert.equal(E.luasPermukaanTKB('tabung', { r: 7, t: 12 }, '22/7', { tanpa: ['tutup'] }), 682);
  assert.equal(E.luasPermukaanTKB('kerucut', { r: 6, t: 8 }, '3,14'), 301.44);
  assert.equal(E.luasPermukaanTKB('kerucut', { r: 7, s: 25 }, '22/7'), 704);
  assert.equal(E.luasPermukaanTKB('kerucut', { r: 7, s: 25 }, '22/7', { tanpa: ['alas'] }), 550);
  assert.equal(E.luasPermukaanTKB('bola', { r: 7 }, '22/7'), 616);
});

test('volumeTKB: tabung, kerucut (⅓ tabung), bola', () => {
  assert.equal(E.volumeTKB('tabung', { r: 7, t: 12 }, '22/7'), 1848);
  assert.equal(E.volumeTKB('kerucut', { r: 14, t: 15 }, '22/7'), 3080);
  assert.equal(E.volumeTKB('kerucut', { r: 6, s: 10 }, '3,14'), 301.44);
  assert.equal(E.volumeTKB('bola', { r: 3 }, '3,14'), 113.04);
  assert.equal(E.volumeTKB('bola', { r: 21 }, '22/7'), 38808);
  /* kaitan: kerucut = ⅓ tabung, bola = ⅔ tabung bertinggi 2r */
  near(
    E.volumeTKB('kerucut', { r: 7, t: 9 }, '22/7') * 3,
    E.volumeTKB('tabung', { r: 7, t: 9 }, '22/7')
  );
  near(
    E.volumeTKB('bola', { r: 21 }, '22/7') * 1.5,
    E.volumeTKB('tabung', { r: 21, t: 42 }, '22/7')
  );
});

/* ---------- Soal: kunci, diagnosa, pemeriksa, opsi ---------- */

test('nilaiSoalTKB & satuanSoalTKB', () => {
  assert.equal(E.nilaiSoalTKB({ minta: 'kelilingAlas', jenis: 'tabung', r: 7, pi: '22/7' }), 44);
  assert.equal(E.nilaiSoalTKB({ minta: 'luasAlas', jenis: 'tabung', d: 14, pi: '22/7' }), 154);
  assert.equal(
    E.nilaiSoalTKB({ minta: 'luasSelimut', jenis: 'kerucut', r: 6, t: 8, pi: '3,14' }),
    188.4
  );
  assert.equal(E.nilaiSoalTKB({ minta: 'garisPelukis', jenis: 'kerucut', r: 5, t: 12 }), 13);
  assert.equal(E.nilaiSoalTKB({ minta: 'sudutJuring', jenis: 'kerucut', r: 6, t: 8 }), 216);
  assert.equal(
    E.nilaiSoalTKB({ minta: 'luasPermukaan', jenis: 'tabung', r: 7, t: 12, pi: '22/7' }),
    836
  );
  assert.equal(
    E.nilaiSoalTKB({
      minta: 'luasPermukaan',
      jenis: 'tabung',
      r: 7,
      t: 12,
      pi: '22/7',
      tanpa: ['tutup'],
    }),
    682
  );
  assert.equal(E.nilaiSoalTKB({ minta: 'volume', jenis: 'bola', r: 3, pi: '3,14' }), 113.04);
  assert.equal(E.satuanSoalTKB('kelilingAlas'), 'cm');
  assert.equal(E.satuanSoalTKB('garisPelukis', 'm'), 'm');
  assert.equal(E.satuanSoalTKB('luasSelimut'), 'cm²');
  assert.equal(E.satuanSoalTKB('volume', 'dm'), 'dm³');
  assert.equal(E.satuanSoalTKB('sudutJuring'), '°');
});

test('diagnosaTKB: mengenali miskonsepsi khas', () => {
  const tab = { minta: 'luasPermukaan', jenis: 'tabung', r: 7, t: 12, pi: '22/7' };
  assert.equal(E.diagnosaTKB(tab, 836), 'benar');
  assert.equal(E.diagnosaTKB(tab, 682), 'satuLingkaran');
  assert.equal(E.diagnosaTKB(tab, 528), 'hanyaSelimut');
  const ker = { minta: 'luasSelimut', jenis: 'kerucut', r: 6, t: 8, pi: '3,14' };
  assert.equal(E.diagnosaTKB(ker, 150.72), 'tinggiBukanPelukis');
  const vk = { minta: 'volume', jenis: 'kerucut', r: 14, t: 15, pi: '22/7' };
  assert.equal(E.diagnosaTKB(vk, 9240), 'lupaSepertiga');
  const ka = { minta: 'kelilingAlas', jenis: 'tabung', r: 7, pi: '22/7' };
  assert.equal(E.diagnosaTKB(ka, 154), 'kelilingLuas');
  assert.equal(E.diagnosaTKB(ka, 88), 'diameterJariJari');
  const lb = { minta: 'luasPermukaan', jenis: 'bola', r: 7, pi: '22/7' };
  assert.equal(E.diagnosaTKB(lb, 308), 'setengahBola');
  const sp = { minta: 'garisPelukis', jenis: 'kerucut', r: 5, t: 12 };
  assert.equal(E.diagnosaTKB(sp, 17), 'jumlahSisi');
  assert.equal(E.diagnosaTKB(sp, 99), 'lain');
});

test('periksaSoalTKB: format, toleransi pembulatan, pesan diagnosa', () => {
  const s = { cek: { minta: 'luasSelimut', jenis: 'kerucut', r: 6, t: 8, pi: '3,14' } };
  assert.equal(E.periksaSoalTKB('188,4', s).benar, true);
  assert.equal(E.periksaSoalTKB('188,40', s).benar, true);
  assert.equal(E.periksaSoalTKB('', s).kode, 'kosong');
  assert.equal(E.periksaSoalTKB('188.4', s).kode, 'format');
  const salah = E.periksaSoalTKB('150,72', s);
  assert.equal(salah.benar, false);
  assert.equal(salah.kode, 'tinggiBukanPelukis');
  assert.ok(salah.pesan);
  const b = { cek: { minta: 'volume', jenis: 'bola', r: 7, pi: '22/7' } };
  assert.equal(E.periksaSoalTKB('1.437,33', b).benar, true);
  assert.equal(E.periksaSoalTKB('1437,33', b).benar, true);
});

test('jawabSoalTKB: jawaban baku gaya Indonesia', () => {
  assert.equal(
    E.jawabSoalTKB({ cek: { minta: 'luasPermukaan', jenis: 'tabung', r: 14, t: 10, pi: '22/7' } }),
    '2.112'
  );
  assert.equal(
    E.jawabSoalTKB({ cek: { minta: 'luasSelimut', jenis: 'kerucut', r: 6, t: 8, pi: '3,14' } }),
    '188,4'
  );
});

test('opsiSoalTKB: empat opsi unik, satu baku, pengecoh berdiagnosa', () => {
  const s = { cek: { minta: 'volume', jenis: 'kerucut', r: 14, t: 15, pi: '22/7' } };
  const o = E.opsiSoalTKB(s);
  assert.equal(o.length, 4);
  assert.equal(new Set(o.map((x) => x.id)).size, 4);
  assert.equal(new Set(o.map((x) => x.label)).size, 4);
  const baku = o.filter((x) => x.id === 'baku');
  assert.equal(baku.length, 1);
  assert.equal(baku[0].label, '3.080 cm³');
  assert.ok(o.some((x) => x.kode === 'lupaSepertiga'));
  o.forEach((x) => assert.ok(x.umpan, x.id + ': umpan'));
  /* soal sudut tanpa banyak calon tetap mendapat 4 opsi */
  const sd = E.opsiSoalTKB({ cek: { minta: 'sudutJuring', jenis: 'kerucut', r: 6, t: 8 } });
  assert.equal(sd.length, 4);
  assert.equal(new Set(sd.map((x) => x.label)).size, 4);
});

/* ---------- Gambar ---------- */

test('buildBendaTKBSVG: bagian dapat diketuk & sorot', () => {
  const svg = E.buildBendaTKBSVG('kerucut', { ketuk: true, sorot: ['garisPelukis'] });
  assert.ok(svg.startsWith('<svg'));
  E.bagianTKB('kerucut').forEach((b) =>
    assert.ok(svg.includes('data-tkb-part="' + b.id + '"'), 'bagian ' + b.id)
  );
  assert.ok(svg.includes('is-sorot'));
  const polos = E.buildBendaTKBSVG('bola', { aria: 'Bola voli' });
  assert.ok(!polos.includes('data-tkb-part'));
  assert.ok(polos.includes('aria-label="Bola voli"'));
});

test('buildJaringTKBSVG: tabung & kerucut', () => {
  const t = E.buildJaringTKBSVG(
    {
      jenis: 'tabung',
      r: 1,
      t: 2,
      panjang: 2 * Math.PI,
      lingkaran: [
        { r: 1, sisi: 'atas' },
        { r: 1, sisi: 'bawah' },
      ],
    },
    { aria: 'Jaring tabung' }
  );
  assert.ok(t.includes('<rect'));
  assert.equal(t.split('<circle').length - 1, 2);
  const k = E.buildJaringTKBSVG({ jenis: 'kerucut', s: 10, sudut: 216, lingkaran: [{ r: 6 }] });
  assert.ok(k.includes('<path'));
  assert.equal(k.split('<circle').length - 1, 1);
});

/* ---------- Lab Unsur ---------- */

test('Lab Unsur: state, ketuk bagian, syarat lengkap & markup', () => {
  const S = {};
  E.ensureLabUnsurTKB(S, 'lab');
  assert.equal(S.lab.jenis, 'tabung');
  assert.deepEqual(plain(S.lab.ditemukan), { tabung: [], kerucut: [], bola: [] });
  assert.equal(E.ketukBagianTKB(S.lab, 'tabung', 'selimut'), true);
  assert.equal(E.ketukBagianTKB(S.lab, 'tabung', 'selimut'), false, 'tidak dihitung dua kali');
  assert.equal(E.ketukBagianTKB(S.lab, 'tabung', 'puncak'), false, 'bukan bagian tabung');
  assert.equal(S.lab.aktif, 'selimut');
  assert.equal(E.labUnsurTKBLengkap(S.lab), false);
  E.TKB_JENIS.forEach((j) => E.bagianTKB(j).forEach((b) => E.ketukBagianTKB(S.lab, j, b.id)));
  assert.equal(E.labUnsurTKBLengkap(S.lab), true);
  /* state rusak dipulihkan */
  const R = { lab: { jenis: 'kubus', ditemukan: { tabung: ['bukan'] } } };
  E.ensureLabUnsurTKB(R, 'lab');
  assert.equal(R.lab.jenis, 'tabung');
  assert.deepEqual(plain(R.lab.ditemukan.tabung), []);
  const html = E.buildLabUnsurTKB('lu', S.lab);
  assert.ok(html.includes('id="lu-elevasi"'));
  assert.ok(html.includes('data-tkb-jenis="kerucut"'));
});

/* ---------- Lab Bentang ---------- */

test('Lab Bentang: buka selimut sampai penuh pada kedua bangun', () => {
  const S = {};
  const cfg = { tabung: { r: 7, t: 12 }, kerucut: { r: 6, t: 8 } };
  E.ensureLabBentangTKB(S, 'lb', cfg);
  assert.equal(S.lb.jenis, 'tabung');
  assert.deepEqual(plain(S.lb.buka), { tabung: 0, kerucut: 0 });
  E.aturBukaTKB(S.lb, 'tabung', 140);
  assert.equal(S.lb.buka.tabung, 100, 'dibatasi 0–100');
  assert.equal(S.lb.dibuka.tabung, true);
  assert.equal(E.bentangTKBLengkap(S.lb), false);
  E.aturBukaTKB(S.lb, 'kerucut', 100);
  assert.equal(E.bentangTKBLengkap(S.lb), true);
  E.aturBukaTKB(S.lb, 'kerucut', 30);
  assert.equal(E.bentangTKBLengkap(S.lb), true, 'sekali terbuka tetap tercatat');
  const svg0 = E.buildBentangTKBSVG('kerucut', cfg.kerucut, 0);
  const svg1 = E.buildBentangTKBSVG('kerucut', cfg.kerucut, 100);
  assert.notEqual(svg0, svg1);
  const html = E.buildLabBentangTKB('lb', S.lb, cfg);
  assert.ok(html.includes('id="lb-buka"'));
});

/* ---------- Lab Kulit Jeruk ---------- */

test('Lab Kulit Jeruk: kepingan menutupi tepat empat lingkaran', () => {
  const cfg = { kepingan: 16, perLingkaran: 4, slot: 6 };
  const S = {};
  E.ensureLabKulitJeruk(S, 'kj', cfg);
  assert.deepEqual(plain(S.kj.isi), [0, 0, 0, 0, 0, 0]);
  assert.equal(S.kj.sisa, 16);
  for (let i = 0; i < 4; i++) assert.equal(E.tempelKulitJeruk(S.kj, cfg, 0), i < 4);
  assert.equal(E.tempelKulitJeruk(S.kj, cfg, 0), false, 'lingkaran penuh');
  let slot = 1;
  while (S.kj.sisa > 0) {
    if (!E.tempelKulitJeruk(S.kj, cfg, slot)) slot += 1;
  }
  assert.equal(E.kulitJerukSelesai(S.kj), true);
  assert.equal(E.lingkaranPenuhJeruk(S.kj, cfg), 4);
  assert.equal(E.tempelKulitJeruk(S.kj, cfg, 5), false, 'kepingan habis');
  assert.ok(E.buildLabKulitJeruk('kj', S.kj, cfg).includes('data-kj-slot="5"'));
});

/* ---------- Lab Tuang ---------- */

test('Lab Tuang: kerucut tiga kali, bola dua pertiga', () => {
  const S = {};
  E.ensureLabTuangTKB(S, 'lt');
  assert.deepEqual(plain(S.lt.isi), { kerucut: 0, bola: 0 });
  E.tuangTKB(S.lt, 'kerucut');
  E.tuangTKB(S.lt, 'kerucut');
  assert.equal(S.lt.isi.kerucut, 2);
  assert.equal(E.labTuangLengkap(S.lt), false);
  E.tuangTKB(S.lt, 'kerucut');
  assert.equal(S.lt.isi.kerucut, 3);
  assert.equal(S.lt.tuang.kerucut, 3);
  E.tuangTKB(S.lt, 'kerucut');
  assert.equal(S.lt.isi.kerucut, 3, 'tabung sudah penuh');
  assert.equal(S.lt.tumpah.kerucut, true);
  E.tuangTKB(S.lt, 'bola');
  assert.equal(S.lt.isi.bola, 2);
  assert.equal(E.labTuangLengkap(S.lt), true);
  E.kosongkanTKB(S.lt, 'kerucut');
  assert.equal(S.lt.isi.kerucut, 0);
  assert.equal(S.lt.tumpah.kerucut, false);
  assert.ok(E.buildLabTuangTKB('lt', S.lt).includes('id="lt-tuang"'));
});

/* ---------- Tabel unsur ---------- */

test('Tabel unsur: isian, pemeriksaan berdiagnosa, syarat benar', () => {
  const rows = ['tabung', 'kerucut', 'bola'];
  const S = {};
  E.ensureTabelUnsurTKB(S, 'tb', rows);
  assert.equal(S.tb.isian.tabung.sisiDatar, '');
  assert.equal(E.tabelUnsurTKBBenar(S.tb, rows), false);
  rows.forEach((j) => {
    const u = E.unsurTKB(j);
    E.TKB_KOLOM.forEach((k) => (S.tb.isian[j][k.id] = String(u[k.id])));
  });
  S.tb.isian.kerucut.rusuk = '2';
  E.periksaTabelUnsurTKB(S.tb, rows);
  assert.equal(S.tb.hasil.tabung.sisiDatar, 'benar');
  assert.equal(S.tb.hasil.kerucut.rusuk, 'pelukisRusuk');
  assert.equal(E.tabelUnsurTKBBenar(S.tb, rows), false);
  S.tb.isian.kerucut.rusuk = '1';
  E.periksaTabelUnsurTKB(S.tb, rows);
  assert.equal(E.tabelUnsurTKBBenar(S.tb, rows), true);
  S.tb.isian.bola.rusuk = 'x';
  E.periksaTabelUnsurTKB(S.tb, rows);
  assert.equal(S.tb.hasil.bola.rusuk, 'format');
  const html = E.buildTabelUnsurTKB('tu', S.tb, rows);
  assert.ok(html.includes('id="tu-cek"'));
  assert.ok(html.includes('<table'));
});

test('siapkanLangkahTKB: langkah isian berdiagnosa untuk buildLangkahRasio', () => {
  const step = E.siapkanLangkahTKB({
    id: 'x',
    label: 'Luas selimut = … cm²',
    cek: { minta: 'luasSelimut', jenis: 'kerucut', r: 6, t: 8, pi: '3,14' },
    hints: ['π × r × s'],
  });
  assert.equal(step.angka, true);
  assert.equal(step.satuan, 'cm²');
  const st = E.makeCekStep();
  E.periksaLangkahRasio(st, step, '150,72');
  assert.equal(st.done, false);
  assert.equal(st.kode, 'tinggiBukanPelukis');
  E.periksaLangkahRasio(st, step, '188,4');
  assert.equal(st.done, true);
  assert.ok(E.buildLangkahRasio('x', st, step, 1).includes('188,4'));
});
