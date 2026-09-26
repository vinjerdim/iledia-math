'use strict';

/*
 * Tes shared/engine.js seksi 46 (operasi hitung bentuk akar):
 * normalisasi bentuk (a + b√r)/d, format teks, penjumlahan &
 * pengurangan suku sejenis, perkalian, pembagian, merasionalkan
 * penyebut a/√b dan a/(p ± √q), diagnosa miskonsepsi, tabel uji nilai,
 * serta pemeriksa langkah operasi akar (strategi → hasil) dan skornya.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(o) {
  return JSON.parse(JSON.stringify(o));
}

function B(a, b, r, d) {
  return { a: a, b: b, r: r, d: d };
}

test('normalBentukAkar: radikan disederhanakan, FPB dibagi, penyebut positif', () => {
  assert.deepEqual(plain(E.normalBentukAkar({ b: 1, r: 72 })), B(0, 6, 2, 1));
  assert.deepEqual(plain(E.normalBentukAkar({ b: 3, r: 2, d: 6 })), B(0, 1, 2, 2));
  assert.deepEqual(plain(E.normalBentukAkar({ b: 6, r: 36, d: 3 })), B(12, 0, 1, 1));
  assert.deepEqual(plain(E.normalBentukAkar({ a: 2, b: -2, r: 3, d: -2 })), B(-1, 1, 3, 1));
  assert.deepEqual(plain(E.normalBentukAkar({ a: 0, b: 0, r: 5 })), B(0, 0, 1, 1));
});

test('samaBentuk & nilaiBentukAkar', () => {
  assert.equal(E.samaBentuk({ b: 6, r: 12 }, { b: 12, r: 3 }), true);
  assert.equal(E.samaBentuk({ b: 1, r: 68 }, { b: 8, r: 2 }), false);
  assert.ok(Math.abs(E.nilaiBentukAkar(B(3, -1, 5, 1)) - (3 - Math.sqrt(5))) < 1e-12);
});

test('formatBentukAkar: teks baku', () => {
  assert.equal(E.formatBentukAkar(B(0, 8, 2, 1)), '8√2');
  assert.equal(E.formatBentukAkar(B(0, 1, 5, 1)), '√5');
  assert.equal(E.formatBentukAkar(B(0, -3, 3, 1)), '−3√3');
  assert.equal(E.formatBentukAkar(B(4, 0, 1, 1)), '4');
  assert.equal(E.formatBentukAkar(B(0, 7, 2, 2)), '7√2/2');
  assert.equal(E.formatBentukAkar(B(0, 1, 10, 2)), '√10/2');
  assert.equal(E.formatBentukAkar(B(3, 1, 5, 1)), '3 + √5');
  assert.equal(E.formatBentukAkar(B(3, -1, 5, 1)), '3 − √5');
  assert.equal(E.formatBentukAkar(B(-1, 1, 3, 1)), '√3 − 1');
  assert.equal(E.formatBentukAkar(B(3, 1, 5, 2)), '(3 + √5)/2');
});

test('teksSoalAkar: notasi soal tiap operasi', () => {
  assert.equal(
    E.teksSoalAkar({
      op: 'jumlah',
      suku: [
        { k: 2, r: 3 },
        { k: 7, r: 3 },
        { k: -4, r: 3 },
      ],
    }),
    '2√3 + 7√3 − 4√3'
  );
  assert.equal(E.teksSoalAkar({ op: 'kali', a: { k: 3, r: 2 }, b: { k: 4, r: 10 } }), '3√2 × 4√10');
  assert.equal(E.teksSoalAkar({ op: 'kali', a: { k: 3, r: 1 }, b: { k: 8, r: 2 } }), '3 × 8√2');
  assert.equal(E.teksSoalAkar({ op: 'bagi', a: { k: 1, r: 96 }, b: { k: 1, r: 2 } }), '√96 : √2');
  assert.equal(E.teksSoalAkar({ op: 'rasional', p: 15, q: { k: 1, r: 3 } }), '15/√3');
  assert.equal(E.teksSoalAkar({ op: 'rasional', p: 9, q: { k: 2, r: 3 } }), '9/(2√3)');
  assert.equal(E.teksSoalAkar({ op: 'sekawan', p: 4, a: 3, c: -1, r: 5 }), '4/(3 − √5)');
});

test('hasilOperasiAkar: penjumlahan & pengurangan suku sejenis', () => {
  const s1 = {
    op: 'jumlah',
    suku: [
      { k: 1, r: 50 },
      { k: 1, r: 18 },
    ],
  };
  assert.deepEqual(plain(E.hasilOperasiAkar(s1)), B(0, 8, 2, 1));
  const s2 = {
    op: 'jumlah',
    suku: [
      { k: 1, r: 45 },
      { k: -1, r: 20 },
    ],
  };
  assert.deepEqual(plain(E.hasilOperasiAkar(s2)), B(0, 1, 5, 1));
  const s3 = {
    op: 'jumlah',
    suku: [
      { k: 2, r: 3 },
      { k: -5, r: 3 },
    ],
  };
  assert.deepEqual(plain(E.hasilOperasiAkar(s3)), B(0, -3, 3, 1));
});

test('sejenisAkar & tidak sejenis → hasil null, strategi tidakSejenis', () => {
  const sej = {
    op: 'jumlah',
    suku: [
      { k: 1, r: 12 },
      { k: 1, r: 27 },
    ],
  };
  const beda = {
    op: 'jumlah',
    suku: [
      { k: 1, r: 8 },
      { k: 1, r: 12 },
    ],
  };
  assert.equal(E.sejenisAkar(sej.suku), true);
  assert.equal(E.sejenisAkar(beda.suku), false);
  assert.equal(E.hasilOperasiAkar(beda), null);
  assert.equal(E.strategiAkarSoal(sej), 'jumlah');
  assert.equal(E.strategiAkarSoal(beda), 'tidakSejenis');
  assert.equal(E.teksSukuSederhana(beda.suku), '2√2 + 2√3');
});

test('hasilOperasiAkar: perkalian & pembagian', () => {
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'kali', a: { k: 3, r: 2 }, b: { k: 4, r: 10 } })),
    B(0, 24, 5, 1)
  );
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'kali', a: { k: 1, r: 3 }, b: { k: 1, r: 27 } })),
    B(9, 0, 1, 1)
  );
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'bagi', a: { k: 1, r: 96 }, b: { k: 1, r: 2 } })),
    B(0, 4, 3, 1)
  );
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'bagi', a: { k: 18, r: 10 }, b: { k: 3, r: 2 } })),
    B(0, 6, 5, 1)
  );
  /* radikan tidak habis dibagi: √2 : √3 = √6/3 */
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'bagi', a: { k: 1, r: 2 }, b: { k: 1, r: 3 } })),
    B(0, 1, 6, 3)
  );
});

test('hasilOperasiAkar: merasionalkan penyebut a/√b dan sekawan', () => {
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'rasional', p: 15, q: { k: 1, r: 3 } })),
    B(0, 5, 3, 1)
  );
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'rasional', p: 7, q: { k: 1, r: 2 } })),
    B(0, 7, 2, 2)
  );
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'rasional', p: 9, q: { k: 2, r: 3 } })),
    B(0, 3, 3, 2)
  );
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'sekawan', p: 4, a: 3, c: -1, r: 5 })),
    B(3, 1, 5, 1)
  );
  assert.deepEqual(
    plain(E.hasilOperasiAkar({ op: 'sekawan', p: 2, a: 1, c: 1, r: 3 })),
    B(-1, 1, 3, 1)
  );
});

test('bentukIsianAkar: kotak isian mengikuti bentuk hasil', () => {
  assert.equal(E.bentukIsianAkar({ op: 'kali', a: { k: 3, r: 2 }, b: { k: 4, r: 10 } }), 'akar');
  assert.equal(E.bentukIsianAkar({ op: 'bagi', a: { k: 1, r: 72 }, b: { k: 1, r: 2 } }), 'bulat');
  assert.equal(E.bentukIsianAkar({ op: 'rasional', p: 7, q: { k: 1, r: 2 } }), 'pecahanAkar');
  assert.equal(E.bentukIsianAkar({ op: 'sekawan', p: 4, a: 3, c: -1, r: 5 }), 'duaSuku');
  assert.equal(
    E.bentukIsianAkar({
      op: 'jumlah',
      suku: [
        { k: 1, r: 8 },
        { k: 1, r: 12 },
      ],
    }),
    null
  );
});

test('diagnosaOperasiAkar: benar & belum sederhana', () => {
  const s = { op: 'kali', a: { k: 3, r: 2 }, b: { k: 4, r: 10 } };
  assert.equal(E.diagnosaOperasiAkar(s, { b: 24, r: 5 }), 'benar');
  assert.equal(E.diagnosaOperasiAkar(s, { b: 12, r: 20 }), 'belumSederhana');
  const r = { op: 'rasional', p: 9, q: { k: 2, r: 3 } };
  assert.equal(E.diagnosaOperasiAkar(r, { b: 3, r: 3, d: 2 }), 'benar');
  assert.equal(E.diagnosaOperasiAkar(r, { b: 9, r: 3, d: 6 }), 'belumSederhana');
});

test('diagnosaOperasiAkar: miskonsepsi penjumlahan', () => {
  const s = {
    op: 'jumlah',
    suku: [
      { k: 1, r: 50 },
      { k: 1, r: 18 },
    ],
  };
  assert.equal(E.diagnosaOperasiAkar(s, { b: 1, r: 68 }), 'radikanDijumlah');
  const t = {
    op: 'jumlah',
    suku: [
      { k: 2, r: 3 },
      { k: 5, r: 3 },
    ],
  };
  assert.equal(E.diagnosaOperasiAkar(t, { b: 7, r: 6 }), 'radikanDijumlah');
  assert.equal(E.diagnosaOperasiAkar(t, { b: 10, r: 3 }), 'koefisienDikali');
  assert.equal(E.diagnosaOperasiAkar(t, { b: 4, r: 3 }), 'lain');
});

test('diagnosaOperasiAkar: miskonsepsi perkalian & pembagian', () => {
  const k = { op: 'kali', a: { k: 2, r: 6 }, b: { k: 3, r: 2 } };
  assert.equal(E.diagnosaOperasiAkar(k, { b: 6, r: 8 }), 'radikanDitambah');
  assert.equal(E.diagnosaOperasiAkar(k, { b: 5, r: 12 }), 'koefisienDitambah');
  assert.equal(E.diagnosaOperasiAkar(k, { b: 2, r: 3 }), 'koefisienLupa');
  const b = { op: 'bagi', a: { k: 1, r: 150 }, b: { k: 1, r: 6 } };
  assert.equal(E.diagnosaOperasiAkar(b, { a: 12 }), 'radikanDikurang');
  const b2 = { op: 'bagi', a: { k: 18, r: 10 }, b: { k: 3, r: 2 } };
  assert.equal(E.diagnosaOperasiAkar(b2, { b: 1, r: 5 }), 'koefisienLupa');
});

test('diagnosaOperasiAkar: miskonsepsi merasionalkan & sekawan', () => {
  const r = { op: 'rasional', p: 9, q: { k: 2, r: 3 } };
  assert.equal(E.diagnosaOperasiAkar(r, { b: 9, r: 3, d: 2 }), 'hanyaPembilang');
  assert.equal(E.diagnosaOperasiAkar(r, { b: 9, r: 3, d: 18 }), 'akarKaliAkar');
  const s = { op: 'sekawan', p: 4, a: 3, c: -1, r: 5 };
  assert.equal(E.diagnosaOperasiAkar(s, { a: 3, b: -1, r: 5 }), 'sekawanSalahTanda');
  assert.equal(E.diagnosaOperasiAkar(s, { a: 6, b: 2, r: 5, d: 7 }), 'selisihKuadrat');
});

test('pesanDiagnosaOperasiAkar: setiap kode punya pesan, tanpa membocorkan kunci', () => {
  const s = { op: 'kali', a: { k: 3, r: 2 }, b: { k: 4, r: 10 } };
  [
    'benar',
    'belumSederhana',
    'radikanDijumlah',
    'koefisienDikali',
    'radikanDitambah',
    'koefisienDitambah',
    'koefisienLupa',
    'radikanDikurang',
    'hanyaPembilang',
    'akarKaliAkar',
    'sekawanSalahTanda',
    'selisihKuadrat',
    'lain',
  ].forEach((kode) => {
    const p = E.pesanDiagnosaOperasiAkar(kode, s);
    assert.ok(typeof p === 'string' && p.length > 10, kode);
    if (kode !== 'benar') assert.ok(!p.includes('24√5'), kode + ' tidak membocorkan jawaban');
  });
});

test('kartu ahli & opsi strategi', () => {
  assert.deepEqual(
    Array.from(E.OPERASI_AKAR_AHLI, (k) => k.id),
    ['jumlah', 'kali', 'bagi', 'rasional']
  );
  E.OPERASI_AKAR_AHLI.forEach((k) =>
    ['ikon', 'nama', 'ringkas', 'rumus', 'tugas', 'kunci'].forEach((f) => assert.ok(k[f], f))
  );
  const opsi = E.opsiStrategiAkar();
  assert.deepEqual(
    Array.from(opsi, (o) => o.id),
    ['jumlah', 'kali', 'bagi', 'rasional', 'sekawan', 'tidakSejenis']
  );
  assert.equal(E.ahliStrategiAkar('sekawan'), 'rasional');
  assert.equal(E.ahliStrategiAkar('tidakSejenis'), 'jumlah');
  assert.equal(E.ahliStrategiAkar('kali'), 'kali');
  assert.equal(E.operasiAkarInfo('sekawan').id, 'sekawan');
});

test('ujiAkarBaris: nilai kiri & kanan eksak', () => {
  const j1 = E.ujiAkarBaris('jumlah', { k1: 2, k2: 3, r: 9 });
  assert.equal(j1.kiriTeks, '2√9 + 3√9');
  assert.equal(j1.kananTeks, '(2 + 3)√9');
  assert.ok(E.samaPecahan(j1.kiri, E.pecahan(15, 1)) && j1.sama);
  const j2 = E.ujiAkarBaris('jumlah', { a: 9, b: 16 });
  assert.equal(j2.kananTeks, '√(9 + 16)');
  assert.equal(E.formatPecahan(j2.kiri) + '|' + E.formatPecahan(j2.kanan), '7|5');
  assert.equal(j2.sama, false);
  const k = E.ujiAkarBaris('kali', { a: 4, b: 9 });
  assert.equal(k.kiriTeks, '√4 × √9');
  assert.equal(k.kananTeks, '√(4 × 9)');
  assert.ok(k.sama);
  const b = E.ujiAkarBaris('bagi', { k1: 6, a: 16, k2: 2, b: 4 });
  assert.equal(b.kananTeks, '(6 : 2)√(16 : 4)');
  assert.equal(E.formatPecahan(b.kanan), '6');
  const r = E.ujiAkarBaris('rasional', { p: 1, b: 4 });
  assert.equal(r.kiriTeks, '1/√4');
  assert.equal(r.kananTeks, '√4/4');
  assert.equal(E.formatPecahan(r.kiri), '1/2');
  assert.ok(r.sama);
});

test('tabel uji: sel benar hanya setelah diperiksa & nilainya tepat', () => {
  const baris = [
    { a: 4, b: 9 },
    { k1: 2, a: 4, k2: 3, b: 9 },
  ];
  const st = E.makeUjiAkarState();
  st.kiri[0] = '6';
  st.kanan[0] = '6';
  st.kiri[1] = '36';
  st.kanan[1] = '35';
  assert.equal(E.ujiAkarSemuaBenar('kali', baris, st), false);
  st.cek = true;
  assert.equal(E.ujiAkarSelBenar('kali', baris[1], st, 1, 'kanan'), false);
  st.kanan[1] = '36';
  assert.equal(E.ujiAkarSemuaBenar('kali', baris, st), true);
});

test('langkah operasi akar: strategi → hasil, skor percobaan pertama', () => {
  const soal = { op: 'rasional', p: 7, q: { k: 1, r: 2 } };
  const st = E.ensureOpAkarStepState(null);
  assert.equal(st.strategiOrder.length, 6);
  assert.deepEqual(plain(E.periksaHasilAkar(soal, st, { b: '7', r: '2', d: '2' })), {
    ok: false,
    error: 'strategi',
  });
  assert.equal(E.periksaStrategiAkar(soal, st, 'sekawan'), false);
  assert.equal(E.periksaStrategiAkar(soal, st, 'rasional'), true);
  assert.deepEqual(plain(E.periksaHasilAkar(soal, st, { b: '', r: '2', d: '2' })), {
    ok: false,
    error: 'empty',
  });
  assert.deepEqual(plain(E.periksaHasilAkar(soal, st, { b: '7', r: '0', d: '2' })), {
    ok: false,
    error: 'invalid',
  });
  assert.equal(st.attempts, 0);
  assert.equal(E.periksaHasilAkar(soal, st, { b: '7', r: '2', d: '1' }).ok, false);
  assert.equal(st.kode, 'hanyaPembilang');
  assert.equal(E.periksaHasilAkar(soal, st, { b: '7', r: '2', d: '2' }).ok, true);
  assert.ok(E.opAkarStepSelesai(soal, st));
  assert.deepEqual(plain(E.opAkarStepSkor(soal, st)), { benar: 0, maks: 2 });
});

test('langkah operasi akar: tidak sejenis selesai begitu strategi tepat; tanpa pilih strategi', () => {
  const beda = {
    op: 'jumlah',
    suku: [
      { k: 1, r: 8 },
      { k: 1, r: 12 },
    ],
  };
  const st = E.ensureOpAkarStepState(null);
  assert.equal(E.periksaStrategiAkar(beda, st, 'tidakSejenis'), true);
  assert.ok(E.opAkarStepSelesai(beda, st));
  assert.deepEqual(plain(E.opAkarStepSkor(beda, st)), { benar: 1, maks: 1 });

  const soal = { op: 'bagi', a: { k: 1, r: 72 }, b: { k: 1, r: 2 } };
  const s2 = E.ensureOpAkarStepState(null);
  const opts = { pilihStrategi: false };
  assert.equal(E.periksaHasilAkar(soal, s2, { a: '6' }, opts).ok, true);
  assert.ok(E.opAkarStepSelesai(soal, s2, opts));
  assert.deepEqual(plain(E.opAkarStepSkor(soal, s2, opts)), { benar: 1, maks: 1 });
});

test('langkahAkarAktif: indeks langkah pertama yang belum selesai', () => {
  const L = [
    {
      op: 'jumlah',
      suku: [
        { k: 1, r: 50 },
        { k: 1, r: 18 },
      ],
    },
    { op: 'kali', a: { k: 3, r: 1 }, b: { k: 8, r: 2 } },
  ];
  const states = [E.ensureOpAkarStepState(null), E.ensureOpAkarStepState(null)];
  assert.equal(E.langkahAkarAktif(L, states), 0);
  E.periksaStrategiAkar(L[0], states[0], 'jumlah');
  E.periksaHasilAkar(L[0], states[0], { b: '8', r: '2' });
  assert.equal(E.langkahAkarAktif(L, states), 1);
});

test('HTML: soal pecahan & hasil bertingkat aman', () => {
  const h = E.soalAkarHTML({ op: 'sekawan', p: 4, a: 3, c: -1, r: 5 });
  assert.ok(h.includes('opakar-frac'));
  assert.ok(h.includes('akar__isi'));
  const f = E.bentukAkarHTML(B(0, -7, 2, 2));
  assert.ok(f.indexOf('−') < f.indexOf('opakar-frac'));
  assert.ok(!E.bentukAkarHTML(B(0, 8, 2, 1)).includes('opakar-frac'));
});
