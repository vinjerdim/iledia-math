'use strict';

/*
 * Tes shared/engine.js seksi 90 (perubahan proporsional bangun datar):
 * segitiga dari tiga sisi, perubahan kali/tambah/regang, perbandingan
 * sisi & sudut sebelum–sesudah, kunci / diagnosa / opsi soal
 * berpengecoh, serta state, aksi & markup dasar Lab Ubah Ukuran.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function near(a, b, msg) {
  assert.ok(Math.abs(a - b) < 1e-6, (msg || '') + ' ' + a + ' ≈ ' + b);
}

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

const SEGITIGA = {
  id: 'bendera',
  nama: 'Bendera',
  jenis: 'segitiga',
  titik: ['A', 'B', 'C'],
  pts: [
    [0, 0],
    [0, 3],
    [4, 3],
  ],
};
const PERSEGI_PANJANG = {
  id: 'poster',
  nama: 'Poster',
  jenis: 'jajargenjang',
  titik: ['P', 'Q', 'R', 'S'],
  pts: [
    [0, 0],
    [4, 0],
    [4, 2],
    [0, 2],
  ],
};
const PERSEGI = {
  id: 'stiker',
  nama: 'Stiker',
  jenis: 'jajargenjang',
  titik: ['K', 'L', 'M', 'N'],
  pts: [
    [0, 0],
    [3, 0],
    [3, 3],
    [0, 3],
  ],
};
const JAJARGENJANG = {
  id: 'ubin',
  nama: 'Ubin',
  jenis: 'jajargenjang',
  titik: ['D', 'E', 'F', 'G'],
  pts: [
    [1.8, 0],
    [5.8, 0],
    [4, 2.4],
    [0, 2.4],
  ],
};

/* ---------- Geometri dasar ---------- */

test('aksenTitik: menambah tanda aksen pada nama titik', () => {
  assert.deepEqual(plain(E.aksenTitik(['A', 'B', 'C'])), ['A′', 'B′', 'C′']);
});

test('segitigaDariSisi: sisi AB, BC, CA sesuai urutan sisiPoligon', () => {
  const pts = E.segitigaDariSisi([5, 6, 7]);
  const s = E.sisiPoligon(pts);
  near(s[0], 5);
  near(s[1], 6);
  near(s[2], 7);
  assert.throws(() => E.segitigaDariSisi([1, 2, 5]), /segitiga/);
});

test('segitigaDariSisi: acuan menjaga titik A, arah AB, dan sisi letak C', () => {
  const pts = E.segitigaDariSisi([4, 5, 6], SEGITIGA.pts);
  near(pts[0][0], 0);
  near(pts[0][1], 0);
  /* AB acuan mengarah ke bawah (sumbu y positif) */
  near(pts[1][0], 0);
  near(pts[1][1], 4);
  /* C berada di kanan AB, seperti pada acuan */
  assert.ok(pts[2][0] > 0);
});

/* ---------- Perubahan ---------- */

test('skalakanBangun: setiap sisi dikali k, sudut tetap', () => {
  const q = E.skalakanBangun(SEGITIGA, 2);
  assert.deepEqual(plain(E.sisiPoligon(q.pts)).map(Math.round), [6, 8, 10]);
  const a0 = E.sudutPoligon(SEGITIGA.pts);
  const a1 = E.sudutPoligon(q.pts);
  a0.forEach((v, i) => near(v, a1[i]));
});

test('regangBangun: hanya ukuran mendatar dikali', () => {
  const q = E.regangBangun(PERSEGI_PANJANG, 2);
  assert.deepEqual(plain(E.sisiPoligon(q.pts)), [8, 2, 8, 2]);
});

test('tambahSisiBangun: segitiga & jajargenjang, bangun lain ditolak', () => {
  const t = E.tambahSisiBangun(SEGITIGA, 1);
  E.sisiPoligon(t.pts).forEach((v, i) => near(v, [4, 5, 6][i]));
  const pp = E.tambahSisiBangun(PERSEGI_PANJANG, 2);
  E.sisiPoligon(pp.pts).forEach((v, i) => near(v, [6, 4, 6, 4][i]));
  E.sudutPoligon(pp.pts).forEach((v) => near(v, 90));
  const jg = E.tambahSisiBangun(JAJARGENJANG, 1);
  E.sisiPoligon(jg.pts).forEach((v, i) => near(v, [5, 4, 5, 4][i]));
  assert.throws(() => E.tambahSisiBangun({ jenis: 'trapesium', pts: [] }, 1));
});

test('ubahBangunPP: titik beraksen, id unik, aksi tak dikenal ditolak', () => {
  const q = E.ubahBangunPP(SEGITIGA, { jenis: 'kali', nilai: 1.5 });
  assert.deepEqual(plain(q.titik), ['A′', 'B′', 'C′']);
  assert.equal(q.jenis, 'segitiga');
  assert.notEqual(q.id, E.ubahBangunPP(SEGITIGA, { jenis: 'tambah', nilai: 1 }).id);
  assert.throws(() => E.ubahBangunPP(SEGITIGA, { jenis: 'putar', nilai: 1 }));
  assert.throws(() => E.ubahBangunPP(SEGITIGA, { jenis: 'kali', nilai: 0 }));
});

test('labelAksiPP: kalimat perubahan yang mudah dibaca murid', () => {
  assert.equal(E.labelAksiPP({ jenis: 'kali', nilai: 2 }), 'Setiap sisi × 2');
  assert.equal(E.labelAksiPP({ jenis: 'kali', nilai: 0.5 }), 'Setiap sisi × 0,5');
  assert.equal(E.labelAksiPP({ jenis: 'tambah', nilai: 2 }), 'Setiap sisi + 2 cm');
  assert.equal(E.labelAksiPP({ jenis: 'regang', nilai: 2 }), 'Hanya ukuran mendatar × 2');
});

/* ---------- Perbandingan sebelum–sesudah ---------- */

test('bandingUbahPP: dikali k → rasio sama = k dan sudut tetap', () => {
  const q = E.ubahBangunPP(SEGITIGA, { jenis: 'kali', nilai: 1.5 });
  const r = E.bandingUbahPP(SEGITIGA, q);
  assert.equal(r.rasioSama, true);
  near(r.faktor, 1.5);
  assert.equal(r.sudutTetap, true);
  assert.equal(r.jenis, 'proporsional');
  assert.equal(r.sisi[0].nama, 'AB');
  assert.equal(r.sisi[0].namaBaru, 'A′B′');
  near(r.sisi[2].selisih, 2.5);
  assert.equal(r.sudut[1].nama, '∠B');
  assert.equal(r.sudut[1].namaBaru, '∠B′');
});

test('bandingUbahPP: ditambah pada segitiga → rasio beda dan sudut berubah', () => {
  const r = E.bandingUbahPP(SEGITIGA, E.ubahBangunPP(SEGITIGA, { jenis: 'tambah', nilai: 1 }));
  assert.equal(r.rasioSama, false);
  assert.equal(r.faktor, null);
  assert.equal(r.sudutTetap, false);
  assert.equal(r.jenis, 'berubah');
});

test('bandingUbahPP: persegi panjang ditambah → sudut tetap tetapi tidak proporsional', () => {
  const r = E.bandingUbahPP(
    PERSEGI_PANJANG,
    E.ubahBangunPP(PERSEGI_PANJANG, { jenis: 'tambah', nilai: 2 })
  );
  assert.equal(r.sudutTetap, true);
  assert.equal(r.rasioSama, false);
  assert.equal(r.jenis, 'sudutTetap');
});

test('bandingUbahPP: persegi ditambah → kasus khusus yang tetap proporsional', () => {
  const r = E.bandingUbahPP(PERSEGI, E.ubahBangunPP(PERSEGI, { jenis: 'tambah', nilai: 1 }));
  assert.equal(r.jenis, 'proporsional');
  near(r.faktor, 4 / 3);
});

test('bandingUbahPP: jajargenjang diregang → sudut berubah', () => {
  const r = E.bandingUbahPP(
    JAJARGENJANG,
    E.ubahBangunPP(JAJARGENJANG, { jenis: 'regang', nilai: 2 })
  );
  assert.equal(r.jenis, 'berubah');
  assert.equal(E.bandingUbahPP(JAJARGENJANG, JAJARGENJANG).faktor, 1);
});

test('pesanBandingPP: berbeda untuk ketiga jenis perubahan', () => {
  const p = ['proporsional', 'sudutTetap', 'berubah'].map((j) =>
    E.pesanBandingPP({ jenis: j, faktor: j === 'proporsional' ? 2 : null })
  );
  assert.equal(new Set(p).size, 3);
  assert.match(p[0], /2/);
});

/* ---------- Soal: kunci, diagnosa, opsi ---------- */

test('nilaiSoalPP: setiap jenis permintaan', () => {
  near(E.nilaiSoalPP({ minta: 'sisiBaru', lama: 6, k: 1.5 }), 9);
  near(E.nilaiSoalPP({ minta: 'sisiLama', baru: 12, k: 3 }), 4);
  near(E.nilaiSoalPP({ minta: 'sisiHilang', a1: 4, a2: 10, b1: 6 }), 15);
  near(E.nilaiSoalPP({ minta: 'faktor', lama: 8, baru: 4 }), 0.5);
  near(E.nilaiSoalPP({ minta: 'sudutBaru', sudut: 65, k: 2 }), 65);
  near(E.nilaiSoalPP({ minta: 'kelilingBaru', sisi: [3, 4, 5], k: 2 }), 24);
  assert.throws(() => E.nilaiSoalPP({ minta: 'luas' }));
});

test('satuanSoalPP: cm (atau satuan soal), derajat, dan tanpa satuan untuk faktor', () => {
  assert.equal(E.satuanSoalPP('sisiBaru'), 'cm');
  assert.equal(E.satuanSoalPP('sisiHilang', 'm'), 'm');
  assert.equal(E.satuanSoalPP('sudutBaru'), '°');
  assert.equal(E.satuanSoalPP('faktor'), '');
  assert.throws(() => E.satuanSoalPP('luas'));
});

test('diagnosaPP: miskonsepsi khas dikenali', () => {
  const sisiHilang = { minta: 'sisiHilang', a1: 4, a2: 10, b1: 6 };
  assert.equal(E.diagnosaPP(sisiHilang, 15), 'benar');
  assert.equal(E.diagnosaPP(sisiHilang, 12), 'tambahSelisih');
  assert.equal(E.diagnosaPP(sisiHilang, 2.4), 'faktorTerbalik');
  assert.equal(E.diagnosaPP(sisiHilang, 10), 'salinSisi');
  assert.equal(E.diagnosaPP(sisiHilang, 99), 'lain');

  const sudut = { minta: 'sudutBaru', sudut: 65, k: 2 };
  assert.equal(E.diagnosaPP(sudut, 130), 'sudutDikali');
  assert.equal(E.diagnosaPP(sudut, 32.5), 'sudutDibagi');
  assert.equal(E.diagnosaPP(sudut, 115), 'pelurus');

  const sisiBaru = { minta: 'sisiBaru', lama: 6, k: 3 };
  assert.equal(E.diagnosaPP(sisiBaru, 9), 'tambahFaktor');
  assert.equal(E.diagnosaPP(sisiBaru, 2), 'bagiBukanKali');

  const sisiLama = { minta: 'sisiLama', baru: 12, k: 3 };
  assert.equal(E.diagnosaPP(sisiLama, 36), 'kaliBukanBagi');
  assert.equal(E.diagnosaPP(sisiLama, 9), 'kurangFaktor');

  const faktor = { minta: 'faktor', lama: 4, baru: 10 };
  assert.equal(E.diagnosaPP(faktor, 0.4), 'faktorTerbalik');
  assert.equal(E.diagnosaPP(faktor, 6), 'selisihBukanFaktor');

  const keliling = { minta: 'kelilingBaru', sisi: [3, 4, 5], k: 2 };
  assert.equal(E.diagnosaPP(keliling, 18), 'tambahFaktor');
  assert.equal(E.diagnosaPP(keliling, 12), 'lupaKali');
  assert.equal(E.diagnosaPP(keliling, 48), 'kuadratFaktor');
});

test('periksaSoalPP: format ditolak, isian benar & keliru diberi pesan', () => {
  const s = { cek: { minta: 'sisiHilang', a1: 4, a2: 10, b1: 6 } };
  assert.equal(E.periksaSoalPP('', s).kode, 'kosong');
  assert.equal(E.periksaSoalPP('abc', s).kode, 'format');
  const ok = E.periksaSoalPP('15', s);
  assert.equal(ok.benar, true);
  const salah = E.periksaSoalPP('12', s);
  assert.equal(salah.benar, false);
  assert.equal(salah.kode, 'tambahSelisih');
  assert.ok(salah.pesan.length > 10);
  assert.equal(
    E.periksaSoalPP('0,4', { cek: { minta: 'faktor', lama: 4, baru: 10 } }).kode,
    'faktorTerbalik'
  );
});

test('PPB_PESAN: setiap kode diagnosa memiliki pesan', () => {
  [
    'benar',
    'lain',
    'kosong',
    'format',
    'tambahSelisih',
    'faktorTerbalik',
    'salinSisi',
    'sudutDikali',
    'sudutDibagi',
    'pelurus',
    'tambahFaktor',
    'bagiBukanKali',
    'kaliBukanBagi',
    'kurangFaktor',
    'selisihBukanFaktor',
    'lupaKali',
    'kuadratFaktor',
  ].forEach((k) => assert.ok(E.PPB_PESAN[k], 'pesan ' + k));
});

test('siapkanLangkahPP & jawabSoalPP: langkah isian satu bilangan bersatuan', () => {
  const step = E.siapkanLangkahPP({
    id: 'x',
    label: 'L',
    cek: { minta: 'sudutBaru', sudut: 53, k: 2 },
  });
  assert.equal(step.angka, true);
  assert.equal(step.satuan, '°');
  assert.equal(step.periksa, E.periksaSoalPP);
  assert.equal(E.jawabSoalPP({ cek: { minta: 'faktor', lama: 4, baru: 6 } }), '1,5');
});

test('opsiSoalPP: empat opsi unik, satu baku, pengecoh berumpan balik', () => {
  [
    { cek: { minta: 'sisiHilang', a1: 4, a2: 10, b1: 6 } },
    { cek: { minta: 'sudutBaru', sudut: 65, k: 2 } },
    { cek: { minta: 'faktor', lama: 4, baru: 10 } },
    { cek: { minta: 'kelilingBaru', sisi: [3, 4, 5], k: 2 } },
    { cek: { minta: 'sisiLama', baru: 12, k: 3 } },
    { cek: { minta: 'sisiBaru', lama: 6, k: 1 } },
  ].forEach((s) => {
    const o = E.opsiSoalPP(s);
    assert.equal(o.length, 4, s.cek.minta);
    assert.equal(new Set(o.map((x) => x.id)).size, 4);
    assert.equal(new Set(o.map((x) => x.label)).size, 4);
    assert.equal(o.filter((x) => x.id === 'baku').length, 1);
    o.forEach((x) => assert.ok(x.umpan, s.cek.minta + ' umpan ' + x.id));
  });
  assert.equal(E.opsiSoalPP({ cek: { minta: 'sudutBaru', sudut: 65, k: 2 } })[0].label, '65°');
});

/* ---------- Lab Ubah Ukuran ---------- */

const CFG = {
  bangun: [SEGITIGA, PERSEGI_PANJANG, PERSEGI, JAJARGENJANG],
  nilai: { kali: [0.5, 1.5, 2], tambah: [1, 2], regang: [2] },
  minCoba: 4,
};

test('ensureLabUbahPP: state default & perbaikan state rusak', () => {
  const S = {};
  const st = E.ensureLabUbahPP(S, 'lab', CFG);
  assert.equal(st.bangun, 'bendera');
  assert.equal(st.aksi, null);
  assert.equal(st.nilai, null);
  assert.deepEqual(plain(st.log), []);
  S.lab = { bangun: 'x', aksi: 'putar', nilai: 9, log: 'rusak' };
  const st2 = E.ensureLabUbahPP(S, 'lab', CFG);
  assert.equal(st2.bangun, 'bendera');
  assert.equal(st2.aksi, null);
  assert.deepEqual(plain(st2.log), []);
});

test('pilihLabUbahPP & terapkanLabUbahPP: mencatat percobaan unik', () => {
  const S = {};
  const st = E.ensureLabUbahPP(S, 'lab', CFG);
  assert.equal(E.terapkanLabUbahPP(st, CFG), null, 'belum memilih aksi');
  assert.equal(E.pilihLabUbahPP(st, CFG, 'aksi', 'putar'), false);
  assert.equal(E.pilihLabUbahPP(st, CFG, 'aksi', 'kali'), true);
  assert.equal(st.nilai, 0.5, 'nilai pertama aksi terpilih');
  assert.equal(E.pilihLabUbahPP(st, CFG, 'nilai', 5), false);
  E.pilihLabUbahPP(st, CFG, 'nilai', 2);
  const r = E.terapkanLabUbahPP(st, CFG);
  assert.equal(r.banding.jenis, 'proporsional');
  E.terapkanLabUbahPP(st, CFG);
  assert.equal(st.log.length, 1, 'percobaan sama tidak dicatat dua kali');
  assert.equal(st.log[0].jenis, 'proporsional');
  /* mengganti bangun menghapus hasil tampilan, bukan log */
  E.pilihLabUbahPP(st, CFG, 'bangun', 'poster');
  assert.equal(E.hasilLabUbahPP(st, CFG), null);
  assert.equal(st.log.length, 1);
});

test('labUbahPPLengkap: ketiga aksi dicoba dan cukup percobaan', () => {
  const st = E.ensureLabUbahPP({}, 'lab', CFG);
  [
    ['bendera', 'kali', 2],
    ['bendera', 'tambah', 1],
    ['poster', 'regang', 2],
  ].forEach(([b, a, n]) => {
    E.pilihLabUbahPP(st, CFG, 'bangun', b);
    E.pilihLabUbahPP(st, CFG, 'aksi', a);
    E.pilihLabUbahPP(st, CFG, 'nilai', n);
    E.terapkanLabUbahPP(st, CFG);
  });
  assert.equal(E.labUbahPPLengkap(st, CFG), false, 'baru 3 percobaan');
  E.pilihLabUbahPP(st, CFG, 'bangun', 'stiker');
  E.pilihLabUbahPP(st, CFG, 'aksi', 'kali');
  E.pilihLabUbahPP(st, CFG, 'nilai', 1.5);
  E.terapkanLabUbahPP(st, CFG);
  assert.equal(E.labUbahPPLengkap(st, CFG), true);
});

test('buildLabUbahPP & buildLogUbahPP: markup dasar', () => {
  const st = E.ensureLabUbahPP({}, 'lab', CFG);
  let html = E.buildLabUbahPP('lu', st, CFG);
  assert.match(html, /data-ppb-bangun="bendera"/);
  assert.match(html, /data-ppb-aksi="kali"/);
  assert.doesNotMatch(html, /kgr-table/);
  E.pilihLabUbahPP(st, CFG, 'aksi', 'kali');
  E.terapkanLabUbahPP(st, CFG);
  html = E.buildLabUbahPP('lu', st, CFG);
  assert.match(html, /A′B′/);
  assert.match(html, /aria-pressed="true"/);
  const log = E.buildLogUbahPP(st, CFG);
  assert.match(log, /<table/);
  assert.match(log, /Bendera/);
  assert.match(E.buildLogUbahPP(E.ensureLabUbahPP({}, 'x', CFG), CFG), /Belum ada/);
});
