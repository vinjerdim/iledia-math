'use strict';

/*
 * Tes engine seksi 78 (Bangun ruang: unsur & bidang penyusun prisma,
 * tabung, limas, kerucut): banyak sisi datar/lengkung, rusuk, titik sudut,
 * bidang penyusun, diagnosa miskonsepsi isian unsur, pemeriksa & opsi
 * berpengecoh soal, model 3D tabung & kerucut, gambar SVG yang bisa
 * diketuk, dan logika Lab Amati Benda.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

test('namaBangunRuang & kelompok bangun', () => {
  assert.equal(E.namaBangunRuang('prisma', 3), 'prisma segitiga');
  assert.equal(E.namaBangunRuang('limas', 4), 'limas segiempat');
  assert.equal(E.namaBangunRuang('tabung'), 'tabung');
  assert.equal(E.namaBangunRuang('kerucut'), 'kerucut');
  assert.deepEqual([...E.BGR_JENIS], ['prisma', 'tabung', 'limas', 'kerucut']);
  assert.equal(E.punyaSisiLengkung('tabung'), true);
  assert.equal(E.punyaSisiLengkung('kerucut'), true);
  assert.equal(E.punyaSisiLengkung('prisma'), false);
  assert.equal(E.punyaSisiLengkung('limas'), false);
  assert.equal(E.kelompokAlas('prisma'), 'duaAlas');
  assert.equal(E.kelompokAlas('tabung'), 'duaAlas');
  assert.equal(E.kelompokAlas('limas'), 'satuAlas');
  assert.equal(E.kelompokAlas('kerucut'), 'satuAlas');
});

test('unsurBangunRuang: prisma & limas sama dengan seksi 31/56 dan memenuhi Euler', () => {
  for (let n = 3; n <= 10; n++) {
    const p = E.unsurBangunRuang('prisma', n);
    const up = E.unsurPrisma(n);
    assert.equal(p.sisiDatar, up.sisi);
    assert.equal(p.sisiLengkung, 0);
    assert.equal(p.sisi, up.sisi);
    assert.equal(p.rusuk, up.rusuk);
    assert.equal(p.titikSudut, up.titik);
    assert.equal(p.titikPuncak, 0);
    assert.equal(p.banyakAlas, 2);
    assert.equal(p.titikSudut - p.rusuk + p.sisi, 2);

    const l = E.unsurBangunRuang('limas', n);
    const ul = E.unsurLimas(n);
    assert.equal(l.sisiDatar, ul.sisi);
    assert.equal(l.sisiLengkung, 0);
    assert.equal(l.rusuk, ul.rusuk);
    assert.equal(l.titikSudut, ul.titik);
    assert.equal(l.titikPuncak, 1);
    assert.equal(l.banyakAlas, 1);
    assert.equal(l.titikSudut - l.rusuk + l.sisi, 2);
  }
});

test('unsurBangunRuang: tabung & kerucut (konvensi buku siswa)', () => {
  const t = E.unsurBangunRuang('tabung');
  assert.deepEqual(
    [t.sisiDatar, t.sisiLengkung, t.sisi, t.rusuk, t.titikSudut, t.titikPuncak, t.banyakAlas],
    [2, 1, 3, 2, 0, 0, 2]
  );
  assert.equal(t.bentukAlas, 'lingkaran');
  const k = E.unsurBangunRuang('kerucut');
  assert.deepEqual(
    [k.sisiDatar, k.sisiLengkung, k.sisi, k.rusuk, k.titikSudut, k.titikPuncak, k.banyakAlas],
    [1, 1, 2, 1, 0, 1, 1]
  );
});

test('bidangPenyusun & teksBidangPenyusun', () => {
  assert.equal(E.teksBidangPenyusun('prisma', 3), '2 segitiga + 3 persegi panjang');
  assert.equal(E.teksBidangPenyusun('prisma', 6), '2 segienam + 6 persegi panjang');
  assert.equal(E.teksBidangPenyusun('limas', 4), '1 segiempat + 4 segitiga');
  assert.equal(E.teksBidangPenyusun('tabung'), '2 lingkaran + 1 persegi panjang (selimut)');
  assert.equal(E.teksBidangPenyusun('kerucut'), '1 lingkaran + 1 juring lingkaran (selimut)');
  for (const j of E.BGR_JENIS) {
    const n = 5;
    const b = E.bidangPenyusun(j, n);
    const total = b.reduce((a, x) => a + x.banyak, 0);
    assert.equal(total, E.unsurBangunRuang(j, n).sisi, j + ': banyak bidang = banyak sisi');
    b.forEach((x) => assert.ok(x.bentuk && x.nama && x.peran, j + ': bidang lengkap'));
  }
});

test('diagnosaUnsurBangun: miskonsepsi prisma & limas', () => {
  const d = (j, n, k, v) => E.diagnosaUnsurBangun(j, n, k, v).kode;
  assert.equal(d('prisma', 5, 'titikSudut', 10), 'benar');
  assert.equal(d('prisma', 5, 'titikSudut', 5), 'prisma-titik-satu-alas');
  assert.equal(d('prisma', 5, 'rusuk', 10), 'prisma-rusuk-lupa-tegak');
  assert.equal(d('prisma', 5, 'rusuk', 5), 'prisma-rusuk-satu-alas');
  assert.equal(d('prisma', 5, 'sisiDatar', 5), 'prisma-sisi-lupa-alas');
  assert.equal(d('prisma', 5, 'sisiDatar', 6), 'prisma-sisi-lupa-satu');
  assert.equal(d('prisma', 5, 'sisiLengkung', 1), 'datar-semua');
  assert.equal(d('prisma', 5, 'sisiLengkung', 0), 'benar');
  assert.equal(d('limas', 4, 'titikSudut', 4), 'limas-titik-lupa-puncak');
  assert.equal(d('limas', 4, 'titikSudut', 8), 'limas-seperti-prisma');
  assert.equal(d('limas', 4, 'rusuk', 4), 'limas-rusuk-satu-kelompok');
  assert.equal(d('limas', 4, 'rusuk', 12), 'limas-seperti-prisma');
  assert.equal(d('limas', 4, 'sisiDatar', 4), 'limas-sisi-lupa-alas');
  assert.equal(d('limas', 4, 'sisiDatar', 6), 'limas-seperti-prisma');
  assert.equal(d('limas', 4, 'rusuk', 7), 'salah');
});

test('diagnosaUnsurBangun: miskonsepsi tabung & kerucut', () => {
  const d = (j, k, v) => E.diagnosaUnsurBangun(j, null, k, v).kode;
  assert.equal(d('tabung', 'sisiDatar', 2), 'benar');
  assert.equal(d('tabung', 'sisiDatar', 1), 'tabung-satu-alas');
  assert.equal(d('tabung', 'sisiDatar', 3), 'lengkung-sebagai-datar');
  assert.equal(d('tabung', 'sisiLengkung', 0), 'lupa-lengkung');
  assert.equal(d('tabung', 'sisi', 2), 'lupa-lengkung');
  assert.equal(d('tabung', 'rusuk', 0), 'rusuk-lengkung');
  assert.equal(d('tabung', 'rusuk', 4), 'garis-gambar');
  assert.equal(d('tabung', 'rusuk', 1), 'tabung-satu-rusuk');
  assert.equal(d('tabung', 'titikSudut', 4), 'tanpa-titik-sudut');
  assert.equal(d('tabung', 'titikSudut', 2), 'tanpa-titik-sudut');
  assert.equal(d('kerucut', 'titikSudut', 1), 'kerucut-puncak');
  assert.equal(d('kerucut', 'titikSudut', 0), 'benar');
  assert.equal(d('kerucut', 'sisiDatar', 2), 'lengkung-sebagai-datar');
  assert.equal(d('kerucut', 'sisiDatar', 0), 'kerucut-tanpa-alas');
  assert.equal(d('kerucut', 'rusuk', 0), 'rusuk-lengkung');
  assert.equal(d('kerucut', 'rusuk', 2), 'garis-gambar');
  assert.equal(d('kerucut', 'sisi', 1), 'lupa-lengkung');
  assert.equal(d('kerucut', 'sisi', 3), 'kerucut-seperti-tabung');
  Object.keys(E.BGR_PESAN).forEach((k) => assert.ok(E.BGR_PESAN[k].length > 5, k));
});

test('nilaiSoalRuang untuk setiap jenis cek', () => {
  assert.equal(E.nilaiSoalRuang({ minta: 'unsur', jenis: 'prisma', n: 6, kolom: 'rusuk' }), 18);
  assert.equal(E.nilaiSoalRuang({ minta: 'unsur', jenis: 'tabung', kolom: 'sisi' }), 3);
  assert.equal(
    E.nilaiSoalRuang({ minta: 'banyakBidang', jenis: 'prisma', n: 5, bentuk: 'persegi panjang' }),
    5
  );
  assert.equal(
    E.nilaiSoalRuang({ minta: 'banyakBidang', jenis: 'limas', n: 6, bentuk: 'segitiga' }),
    6
  );
  assert.equal(
    E.nilaiSoalRuang({ minta: 'banyakBidang', jenis: 'limas', n: 3, bentuk: 'segitiga' }),
    4
  );
  assert.equal(
    E.nilaiSoalRuang({ minta: 'banyakBidang', jenis: 'tabung', bentuk: 'lingkaran' }),
    2
  );
  assert.equal(E.nilaiSoalRuang({ minta: 'n', jenis: 'prisma', kolom: 'rusuk', nilai: 24 }), 8);
  assert.equal(E.nilaiSoalRuang({ minta: 'n', jenis: 'limas', kolom: 'titikSudut', nilai: 9 }), 8);
  assert.equal(E.nilaiSoalRuang({ minta: 'bangun', jenis: 'kerucut' }), 'kerucut');
  assert.equal(
    E.nilaiSoalRuang({ minta: 'bidang', jenis: 'limas', n: 5 }),
    '1 segilima + 5 segitiga'
  );
});

test('periksaSoalRuang: isian benar, diagnosa, & tak terbaca', () => {
  const s = { cek: { minta: 'unsur', jenis: 'prisma', n: 4, kolom: 'rusuk' } };
  assert.equal(E.periksaSoalRuang('12', s).benar, true);
  assert.equal(E.periksaSoalRuang('8', s).kode, 'prisma-rusuk-lupa-tegak');
  assert.equal(E.periksaSoalRuang('', s).kode, 'kosong');
  assert.equal(E.periksaSoalRuang('dua belas', s).kode, 'format');
  assert.equal(E.periksaSoalRuang('-3', s).kode, 'format');
  const n = { cek: { minta: 'n', jenis: 'prisma', kolom: 'rusuk', nilai: 18 } };
  assert.equal(E.periksaSoalRuang('6', n).benar, true);
  assert.equal(E.periksaSoalRuang('9', n).kode, 'n-rumus-tertukar');
  assert.equal(E.periksaSoalRuang('18', n).kode, 'n-nilai-langsung');
  const b = { cek: { minta: 'banyakBidang', jenis: 'prisma', n: 5, bentuk: 'persegi panjang' } };
  assert.equal(E.periksaSoalRuang('7', b).kode, 'bidang-semua-sisi');
  const t = { cek: { minta: 'unsur', jenis: 'tabung', kolom: 'titikSudut' } };
  assert.equal(E.periksaSoalRuang('0', t).benar, true);
  assert.match(E.jawabSoalRuang(t), /^0/);
});

test('opsiSoalRuang: opsi unik, memuat kunci "baku", pengecoh berumpan', () => {
  const soal = [
    { cek: { minta: 'unsur', jenis: 'prisma', n: 5, kolom: 'rusuk' } },
    { cek: { minta: 'unsur', jenis: 'kerucut', kolom: 'titikSudut' } },
    { cek: { minta: 'unsur', jenis: 'tabung', kolom: 'rusuk' } },
    { cek: { minta: 'n', jenis: 'limas', kolom: 'rusuk', nilai: 14 } },
    { cek: { minta: 'bangun', jenis: 'tabung' } },
    { cek: { minta: 'bangun', jenis: 'limas', n: 3 } },
    { cek: { minta: 'bidang', jenis: 'prisma', n: 4 } },
    { cek: { minta: 'bidang', jenis: 'kerucut' } },
  ];
  soal.forEach((s) => {
    const o = E.opsiSoalRuang(s);
    assert.ok(o.length >= 4, JSON.stringify(s.cek) + ': minimal 4 opsi');
    assert.equal(o[0].id, 'baku');
    assert.equal(new Set(o.map((x) => x.id)).size, o.length, 'id unik');
    assert.equal(new Set(o.map((x) => x.label)).size, o.length, 'label unik');
    o.slice(1).forEach((x) => assert.ok(x.umpan && x.umpan.length > 5, 'umpan pengecoh'));
    assert.equal(o[0].label, E.jawabSoalRuang(s), 'label kunci = jawaban baku');
  });
  const kerucut = E.opsiSoalRuang(soal[1]);
  assert.ok(
    kerucut.some((x) => x.id === 'kerucut-puncak'),
    'pengecoh titik puncak'
  );
});

test('modelLengkung: unsur tabung & kerucut sesuai unsurBangunRuang', () => {
  ['tabung', 'kerucut'].forEach((j) => {
    const m = E.modelLengkung(j);
    const u = E.unsurBangunRuang(j);
    assert.equal(m.sisi.length, u.sisi);
    assert.equal(m.sisi.filter((s) => s.lengkung).length, u.sisiLengkung);
    assert.equal(m.rusuk.length, u.rusuk);
    assert.equal(m.titik.filter((t) => t.jenis !== 'puncak').length, u.titikSudut);
    assert.equal(m.titik.filter((t) => t.jenis === 'puncak').length, u.titikPuncak);
  });
});

function hitIds(svg, kind) {
  const re = new RegExp('data-psm-kind="' + kind + '" data-psm-id="([^"]+)"', 'g');
  return [...new Set([...svg.matchAll(re)].map((m) => m[1]))].sort();
}

test('buildRuangSVG: tabung & kerucut dapat diketuk sesuai sudut pandang', () => {
  const atas = { azimut: -25, elevasi: 25 };
  const bawah = { azimut: -25, elevasi: -35 };
  assert.deepEqual(hitIds(E.buildRuangSVG('tabung', 0, atas, { mode: 'sisi' }), 'sisi'), [
    'atas',
    'selimut',
  ]);
  assert.deepEqual(hitIds(E.buildRuangSVG('tabung', 0, bawah, { mode: 'sisi' }), 'sisi'), [
    'alas',
    'selimut',
  ]);
  assert.deepEqual(hitIds(E.buildRuangSVG('tabung', 0, atas, { mode: 'rusuk' }), 'rusuk'), [
    'r0',
    'r1',
  ]);
  assert.deepEqual(hitIds(E.buildRuangSVG('tabung', 0, atas, { mode: 'rusuk' }), 'semu'), [
    's0',
    's1',
  ]);
  assert.deepEqual(hitIds(E.buildRuangSVG('kerucut', 0, atas, { mode: 'titik' }), 'titik'), [
    'puncak',
  ]);
  assert.deepEqual(hitIds(E.buildRuangSVG('tabung', 0, atas, { mode: 'titik' }), 'titik'), []);
  const p = E.buildRuangSVG('prisma', 4, atas, { mode: 'titik' });
  assert.equal(hitIds(p, 'titik').length, 8);
  const svg = E.buildRuangSVG('kerucut', 0, atas, {
    mode: 'sisi',
    terpilih: { sisi: { selimut: true } },
  });
  assert.match(svg, /is-sorot/);
  assert.match(svg, /^<svg/);
});

test('buildBidangPenyusunSVG: satu bidang per sisi, berlabel', () => {
  E.BGR_JENIS.forEach((j) => {
    const n = 4;
    const svg = E.buildBidangPenyusunSVG(j, n);
    const banyak = (svg.match(/class="bgr-bidang /g) || []).length;
    assert.equal(banyak, E.unsurBangunRuang(j, n).sisi, j);
    assert.match(svg, /role="img"/);
  });
});

const CFG = {
  minBenda: 4,
  benda: [
    { id: 'kotak', nama: 'Kotak susu', ikon: '🧃', jenis: 'prisma', n: 4 },
    { id: 'kaleng', nama: 'Kaleng susu', ikon: '🥫', jenis: 'tabung' },
    { id: 'piramida', nama: 'Piramida hiasan', ikon: '🔺', jenis: 'limas', n: 4 },
    { id: 'tumpeng', nama: 'Tumpeng', ikon: '🍚', jenis: 'kerucut' },
    { id: 'tenda', nama: 'Tenda', ikon: '⛺', jenis: 'prisma', n: 3 },
  ],
};

function isiBenar(st, b) {
  const u = E.unsurBangunRuang(b.jenis, b.n);
  E.BGR_KOLOM.forEach((k) => {
    st.isian[b.id][k.id] = String(u[k.id]);
  });
}

test('ensureLabAmati: state lengkap & urutan opsi bidang diacak tersimpan', () => {
  const state = {};
  const st = E.ensureLabAmati(state, 'lab', CFG);
  assert.equal(st.benda, 'kotak');
  CFG.benda.forEach((b) => {
    assert.ok(Array.isArray(st.bidangOrder[b.id]));
    assert.equal(
      st.bidangOrder[b.id].length,
      E.opsiSoalRuang({ cek: { minta: 'bidang', jenis: b.jenis, n: b.n } }).length
    );
  });
  const simpan = [...st.bidangOrder.kotak];
  E.ensureLabAmati(state, 'lab', CFG);
  assert.deepEqual([...state.lab.bidangOrder.kotak], simpan, 'urutan tidak diacak ulang');
});

test('Lab Amati: periksa isian, pilih bidang, & syarat lengkap', () => {
  const st = E.ensureLabAmati({}, 'lab', CFG);
  assert.equal(E.periksaIsianAmati(st, CFG).kode, 'kosong');
  st.isian.kotak = { sisiDatar: '6', sisiLengkung: '0', rusuk: '8', titikSudut: 'x' };
  assert.equal(E.periksaIsianAmati(st, CFG).kode, 'format');
  st.isian.kotak.titikSudut = '8';
  const r = E.periksaIsianAmati(st, CFG);
  assert.equal(r.kode, 'ok');
  assert.equal(r.semuaBenar, false);
  assert.equal(st.hasil.kotak.rusuk, 'prisma-rusuk-lupa-tegak');
  assert.equal(st.percobaan, 1);
  assert.equal(st.salah, 1);
  st.isian.kotak.rusuk = '12';
  assert.equal(E.periksaIsianAmati(st, CFG).semuaBenar, true);
  assert.equal(E.bendaAmatiSelesai(st, 'kotak'), false, 'bidang penyusun belum dipilih');
  assert.equal(E.pilihBidangAmati(st, CFG, 'salah-x'), false);
  const salah = E.opsiSoalRuang({ cek: { minta: 'bidang', jenis: 'prisma', n: 4 } })[1].id;
  assert.equal(E.pilihBidangAmati(st, CFG, salah), false);
  assert.equal(E.pilihBidangAmati(st, CFG, 'baku'), true);
  assert.equal(E.bendaAmatiSelesai(st, 'kotak'), true);
  assert.equal(E.labAmatiLengkap(st, CFG), false);
  ['kaleng', 'piramida', 'tumpeng'].forEach((id) => {
    st.benda = id;
    isiBenar(
      st,
      CFG.benda.find((b) => b.id === id)
    );
    E.periksaIsianAmati(st, CFG);
    E.pilihBidangAmati(st, CFG, 'baku');
  });
  assert.equal(E.labAmatiLengkap(st, CFG), true);
  assert.deepEqual(
    [...E.bendaAmatiTercatat(st, CFG)].map((b) => b.id),
    ['kotak', 'kaleng', 'piramida', 'tumpeng']
  );
  const tabel = E.buildTabelAmati(st, CFG);
  assert.equal((tabel.match(/<tr>/g) || []).length, 5);
  assert.match(tabel, /2 lingkaran \+ 1 persegi panjang/);
});

test('Lab Amati: tidak lengkap bila satu jenis bangun belum diamati', () => {
  const st = E.ensureLabAmati({}, 'lab', CFG);
  ['kotak', 'kaleng', 'piramida', 'tenda'].forEach((id) => {
    st.benda = id;
    isiBenar(
      st,
      CFG.benda.find((b) => b.id === id)
    );
    E.periksaIsianAmati(st, CFG);
    E.pilihBidangAmati(st, CFG, 'baku');
  });
  assert.equal(E.labAmatiLengkap(st, CFG), false, 'kerucut belum diamati');
});

test('buildLabAmati merender pilihan benda, alat tandai, & isian', () => {
  const st = E.ensureLabAmati({}, 'lab', CFG);
  const html = E.buildLabAmati('la', st, CFG);
  CFG.benda.forEach((b) => assert.match(html, new RegExp('data-bgr-benda="' + b.id + '"')));
  assert.match(html, /data-bgr-mode="sisi"/);
  assert.match(html, /data-bgr-range="azimut"/);
  E.BGR_KOLOM.forEach((k) => assert.match(html, new RegExp('data-bgr-isian="' + k.id + '"')));
});
