'use strict';

/*
 * Tes fungsi masalah kontekstual luas permukaan limas (shared/engine.js
 * seksi 58): luas sisi limas yang benar-benar memakai bahan, ukuran
 * atap limas dari tinggi atap (Pythagoras → tₛ → luas → lembar),
 * pengecoh tinggi sisi tegak, kandidat/diagnosa/opsi soal kontekstual
 * berjenis, serta komponen UI (Lab Atap, pemilih sisi limas) dan
 * dukungan satuan pada jaring limas seksi 57.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function dekat(a, b) {
  return Math.abs(a - b) < 1e-4;
}

/* Tenda dongeng: limas persegi panjang 1,8 m × 1 m, tinggi 1,2 m. */
const TENDA = { id: 'tenda', nama: 'Tenda dongeng', p: 1.8, l: 1, t: 1.2, satuan: 'm' };
/* Kotak suvenir: limas persegi rusuk 8 cm, tₛ 5 cm. */
const KOTAK = { id: 'kotak', nama: 'Kotak suvenir', n: 4, s: 8, ts: 5, t: 3 };
/* Atap gazebo: alas persegi 4 m, lembar genteng 1,5 m². */
const ATAP = {
  n: 4,
  sisi: 4,
  luasLembar: 1.5,
  acuan: 1.5,
  min: 0.5,
  max: 5,
  langkah: 0.1,
  satuan: 'm',
  desain: [
    { id: 'A', nama: 'Atap A', t: 1.5 },
    { id: 'B', nama: 'Atap B', t: 2.1 },
    { id: 'C', nama: 'Atap C', t: 4.8 },
  ],
};

test('rincianObjekLimas: limas persegi panjang memakai tₛ per rusuk alas', () => {
  const r = E.rincianObjekLimas(TENDA);
  assert.equal(r.length, 5);
  assert.equal(r[0].id, 'alas');
  assert.ok(dekat(r[0].luas, 1.8));
  assert.deepEqual(plain(r.slice(1).map((f) => f.tinggi)), [1.3, 1.5, 1.3, 1.5]);
  assert.ok(dekat(r[1].luas, 1.17));
  assert.ok(dekat(r[2].luas, 0.75));
});

test('rincianObjekLimas: limas beraturan memakai satu tₛ', () => {
  const r = E.rincianObjekLimas(KOTAK);
  assert.equal(r.length, 5);
  assert.ok(dekat(r[0].luas, 64));
  r.slice(1).forEach((f) => assert.ok(dekat(f.luas, 20)));
});

test('luasSisiDipakaiLimas: hanya sisi terpilih yang dijumlahkan', () => {
  const tegak = ['t0', 't1', 't2', 't3'];
  assert.ok(dekat(E.luasSisiDipakaiLimas(TENDA, tegak), 3.84));
  assert.ok(dekat(E.luasSisiDipakaiLimas(TENDA, ['alas'].concat(tegak)), 5.64));
  assert.ok(dekat(E.luasSisiDipakaiLimas(KOTAK, ['alas', 't0', 't1', 't2', 't3']), 144));
});

test('lmkUkuranAtap: Pythagoras → tₛ → luas atap → lembar genteng', () => {
  const a = E.lmkUkuranAtap(ATAP, 1.5);
  assert.ok(dekat(a.a, 2));
  assert.ok(dekat(a.keliling, 16));
  assert.ok(dekat(a.ts, 2.5));
  assert.ok(dekat(a.luas, 20));
  assert.equal(a.lembar, 14);
  const b = E.lmkUkuranAtap(ATAP, 2.1);
  assert.ok(dekat(b.ts, 2.9));
  assert.ok(dekat(b.luas, 23.2));
  assert.equal(b.lembar, 16);
  assert.equal(b.naikTinggi, 40);
  assert.equal(b.naikLuas, 16);
  const c = E.lmkUkuranAtap(ATAP, 4.8);
  assert.ok(dekat(c.ts, 5.2));
  assert.ok(dekat(c.luas, 41.6));
  assert.equal(c.lembar, 28);
});

test('pengecohTinggiSisi: lupa akar, dijumlah, dikurang, rusuk utuh', () => {
  const p = E.pengecohTinggiSisi(2.1, 2);
  const nilai = p.map((x) => x.nilai);
  assert.ok(
    nilai.some((v) => dekat(v, 8.41)),
    'lupa akar'
  );
  assert.ok(
    nilai.some((v) => dekat(v, 4.1)),
    'dijumlah'
  );
  assert.ok(
    nilai.some((v) => dekat(v, Math.sqrt(0.41))),
    'dikurang'
  );
  assert.ok(
    nilai.some((v) => dekat(v, Math.sqrt(4.41 + 16))),
    'rusuk utuh'
  );
  assert.ok(!nilai.some((v) => dekat(v, 2.9)), 'tidak memuat jawaban benar');
  p.forEach((x) => assert.ok(x.pesan && x.pesan.length > 20));
  assert.equal(new Set(nilai.map((v) => v.toFixed(4))).size, nilai.length, 'nilai unik');
});

test('kandidatMasalahLimas: jenis ts', () => {
  const k = E.kandidatMasalahLimas({ jenis: 'ts', t: 4, a: 3 });
  assert.equal(k.benar, 5);
  assert.equal(k['lupa-akar'], 25);
  assert.equal(k['jumlah-sisi'], 7);
});

test('kandidatMasalahLimas: jenis lp (tanpa alas, tinggi limas)', () => {
  const k = E.kandidatMasalahLimas({
    jenis: 'lp',
    luasAlas: 36,
    kelilingAlas: 24,
    tinggiSisi: 5,
    tinggiLimas: 4,
    tanpaAlas: true,
  });
  assert.equal(k.benar, 60);
  assert.equal(k['pakai-alas'], 96);
  assert.equal(k['lupa-setengah'], 120);
  assert.equal(k['tinggi-limas'], 48);
});

test('kandidatMasalahLimas: jenis dipakai, wadah, konversi', () => {
  const d = E.kandidatMasalahLimas({
    jenis: 'dipakai',
    limas: TENDA,
    pakai: ['t0', 't1', 't2', 't3'],
  });
  assert.ok(dekat(d.benar, 3.84));
  assert.ok(dekat(d['pakai-alas'], 5.64));
  assert.ok(dekat(d['lupa-setengah'], 7.68));

  const k = E.kandidatMasalahLimas({
    jenis: 'dipakai',
    limas: KOTAK,
    pakai: ['alas', 't0', 't1', 't2', 't3'],
  });
  assert.equal(k.benar, 144);
  assert.equal(k['tanpa-alas'], 80);

  const w = E.kandidatMasalahLimas({ jenis: 'wadah', luasSatu: 360, banyak: 40, isiWadah: 3000 });
  assert.equal(w.benar, 5);
  assert.equal(w['bulat-bawah'], 4);
  assert.equal(w['lupa-banyak'], 1);

  const c = E.kandidatMasalahLimas({ jenis: 'konversi', nilai: 36000, dari: 'cm²', ke: 'm²' });
  assert.equal(c.benar, 3.6);
  assert.ok(Object.keys(c).length >= 3);
});

test('kandidatMasalahLimas: jenis biaya, biayaWadah, tinggiSisi', () => {
  const b = E.kandidatMasalahLimas({
    jenis: 'biaya',
    luasAlas: 16,
    kelilingAlas: 16,
    tinggiSisi: 2.9,
    tinggiLimas: 2.1,
    tanpaAlas: true,
    harga: 10000,
  });
  assert.equal(b.benar, 232000);
  assert.equal(b['lupa-harga'], 23.2);
  assert.equal(b['tinggi-limas'], 168000);

  const w = E.kandidatMasalahLimas({ jenis: 'biayaWadah', luas: 15, isiWadah: 4, harga: 80000 });
  assert.equal(w.benar, 320000);
  assert.equal(w['bulat-bawah'], 240000);
  assert.equal(w['belum-bulat'], 300000);
  assert.equal(w['lupa-harga'], 4);

  const t = E.kandidatMasalahLimas({
    jenis: 'tinggiSisi',
    luasPermukaan: 360,
    luasAlas: 100,
    kelilingAlas: 40,
  });
  assert.equal(t.benar, 13);
  assert.equal(t['lupa-dua'], 6.5);
  assert.equal(t['ts-tanpa-alas'], 18);
  assert.equal(t['lupa-bagi'], 260);
});

test('kandidatMasalahLimas: jenis tidak dikenal melempar galat', () => {
  assert.throws(() => E.kandidatMasalahLimas({ jenis: 'xyz' }));
});

test('diagnosaMasalahLimas: kode & pesan berdiagnosa', () => {
  const cek = { jenis: 'ts', t: 4, a: 3 };
  assert.equal(E.diagnosaMasalahLimas(cek, 5).kode, 'benar');
  const d = E.diagnosaMasalahLimas(cek, 25);
  assert.equal(d.kode, 'lupa-akar');
  assert.ok(d.pesan.length > 20);
  const s = E.diagnosaMasalahLimas(cek, 99);
  assert.equal(s.kode, 'salah-hitung');
  assert.ok(s.pesan.length > 20);

  const lp = {
    jenis: 'lp',
    luasAlas: 36,
    kelilingAlas: 24,
    tinggiSisi: 5,
    tinggiLimas: 4,
    tanpaAlas: true,
  };
  assert.equal(E.diagnosaMasalahLimas(lp, 48).kode, 'tinggi-limas');
  assert.ok(E.diagnosaMasalahLimas(lp, 96).pesan.includes('tanpa alas'));
});

test('lmkPesan: semua kode kandidat punya pesan', () => {
  const cekList = [
    { jenis: 'ts', t: 2.1, a: 2 },
    {
      jenis: 'lp',
      luasAlas: 16,
      kelilingAlas: 16,
      tinggiSisi: 2.9,
      tinggiLimas: 2.1,
      tanpaAlas: true,
    },
    { jenis: 'lp', luasAlas: 100, kelilingAlas: 40, tinggiSisi: 13, tinggiLimas: 12, sisiAlas: 10 },
    { jenis: 'dipakai', limas: TENDA, pakai: ['t0', 't1', 't2', 't3'] },
    { jenis: 'dipakai', limas: KOTAK, pakai: ['alas', 't0', 't1', 't2', 't3'] },
    { jenis: 'wadah', luasSatu: 144, banyak: 30, isiWadah: 2000 },
    { jenis: 'konversi', nilai: 4320, dari: 'cm²', ke: 'm²' },
    {
      jenis: 'biaya',
      luasAlas: 16,
      kelilingAlas: 16,
      tinggiSisi: 2.9,
      tanpaAlas: true,
      harga: 5000,
    },
    { jenis: 'biayaWadah', luas: 23.2, isiWadah: 1.5, harga: 45000 },
    { jenis: 'tinggiSisi', luasPermukaan: 360, luasAlas: 100, kelilingAlas: 40 },
  ];
  cekList.forEach((cek) => {
    Object.keys(E.kandidatMasalahLimas(cek)).forEach((kode) => {
      const p = E.lmkPesan(kode);
      assert.ok(typeof p === 'string' && p.length > 10, cek.jenis + ': pesan ' + kode);
    });
  });
});

test('opsiMasalahLimas: ≥ 4 opsi unik, benar di depan, awalan & satuan', () => {
  const o = E.opsiMasalahLimas({ jenis: 'ts', t: 4, a: 3 }, 'm');
  assert.ok(o.length >= 4);
  assert.equal(o[0].id, 'benar');
  assert.equal(o[0].label, '5 m');
  assert.equal(new Set(o.map((x) => x.id)).size, o.length);
  assert.equal(new Set(o.map((x) => x.label)).size, o.length);
  o.forEach((x) => assert.ok(x.nilai > 0));

  const b = E.opsiMasalahLimas({ jenis: 'biayaWadah', luas: 15, isiWadah: 4, harga: 80000 }, '', {
    awalan: 'Rp',
  });
  assert.equal(b[0].label, 'Rp320.000');
  assert.ok(b.length >= 4);
});

test('ensureLmkAtapState & Lab Atap: slider, tombol desain, bacaan', () => {
  const state = {};
  const st = E.ensureLmkAtapState(state, 'atap', ATAP);
  assert.equal(st.t, 1.5);
  assert.deepEqual(plain(st.dicoba), []);
  E.lmkAtapAtur(st, ATAP, 2.1);
  assert.equal(st.t, 2.1);
  assert.deepEqual(plain(st.dicoba), ['B']);
  E.lmkAtapAtur(st, ATAP, 9);
  assert.equal(st.t, 5, 'dibatasi max');
  const html = E.buildLmkAtapLab('labAtap', st, ATAP);
  assert.match(html, /type="range"/);
  assert.match(html, /aria-label="[^"]*tinggi atap/i);
  assert.match(html, /data-lmk-desain="A"/);
  assert.match(html, /data-lmk-desain="C"/);
  assert.match(html, /<svg/);
  E.lmkAtapAtur(st, ATAP, 2.1);
  const info = E.lmkAtapInfoHTML(ATAP, st);
  assert.match(info, /2,9 m/);
  assert.match(info, /23,2 m²/);
  assert.match(info, /16 lembar/);
});

test('buildLplNetSVG: satuan m & sisi terpilih', () => {
  const svg = E.buildLplNetSVG(TENDA, { pilih: true, dipilih: ['t0'] });
  assert.match(svg, /1,8 m/);
  assert.match(svg, /tₛ = 1,3 m/);
  assert.doesNotMatch(svg, / cm/);
  assert.match(svg, /is-dipilih/);
  assert.doesNotMatch(svg, /undefined/);
  const kotak = E.buildLplNetSVG(KOTAK, {});
  assert.match(kotak, /8 cm/);
});

test('pemilih sisi limas: chip, periksa, umpan balik bertahap', () => {
  const objek = Object.assign({}, TENDA, {
    bahan: 'kain',
    dipakai: ['t0', 't1', 't2', 't3'],
    alasan: 'Lantai tenda memakai tikar, jadi kain hanya untuk empat sisi tegak.',
  });
  const state = {};
  const map = E.ensureLpSisiState(state, 'sisi', [objek]);
  const st = map.tenda;
  let html = E.buildLmkSisiPicker('ps-tenda', objek, st);
  assert.equal((html.match(/data-lmk-sisi=/g) || []).length, 5);
  assert.match(html, /data-lpl-sisi="t0"/);
  assert.match(html, /data-lmk-cek/);

  E.lpSisiToggle(st, 'alas');
  E.lpSisiToggle(st, 't0');
  E.lpSisiPeriksa(objek, st);
  assert.equal(st.benar, false);
  html = E.buildLmkSisiPicker('ps-tenda', objek, st);
  assert.match(html, /belum dipilih/);
  assert.match(html, /tidak memakai bahan/);
  assert.doesNotMatch(html, /Sisi alas<\/strong>/, 'nama sisi baru dibuka setelah 2 kali coba');

  E.lpSisiPeriksa(objek, st);
  html = E.buildLmkSisiPicker('ps-tenda', objek, st);
  assert.match(html, /<strong>Sisi alas<\/strong>/);

  st.pilih = ['t0', 't1', 't2', 't3'];
  E.lpSisiPeriksa(objek, st);
  assert.equal(st.benar, true);
  html = E.buildLmkSisiPicker('ps-tenda', objek, st);
  assert.match(html, /Tepat!/);
  assert.match(html, /tikar/);
  assert.doesNotMatch(html, /data-lmk-cek/);
});

test('buildLmkLimasSVG: gambar 3D limas beraturan & persegi panjang', () => {
  const a = E.buildLmkLimasSVG({ nama: 'Atap B', n: 4, s: 4, t: 2.1 }, { garis: true });
  assert.match(a, /<svg/);
  assert.doesNotMatch(a, /NaN|undefined/);
  assert.match(a, /aria-label="[^"]*Atap B/);
  const t = E.buildLmkLimasSVG(TENDA, {});
  assert.match(t, /<svg/);
  assert.doesNotMatch(t, /NaN|undefined/);
  /* limas yang hanya diketahui tₛ-nya tetap bisa digambar */
  const k = E.buildLmkLimasSVG({ nama: 'Kotak', n: 4, s: 8, ts: 5 }, {});
  assert.doesNotMatch(k, /NaN|undefined/);
});

test('buildLplNetSVG: tₛ dihitung dari t bila tidak diberikan', () => {
  const svg = E.buildLplNetSVG({ id: 'atap', nama: 'Atap', n: 4, s: 4, t: 2.1, satuan: 'm' }, {});
  assert.match(svg, /tₛ = 2,9 m/);
});
