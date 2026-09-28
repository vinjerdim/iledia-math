'use strict';

/*
 * Tes fungsi murni & komponen volume limas (shared/engine.js seksi 59):
 * V = ⅓ × luas alas × tinggi dan kebalikannya, kandidat & diagnosa
 * miskonsepsi (lupa ⅓, ½, memakai tₛ, lupa ½ pada alas segitiga), opsi
 * berpengecoh, pembelahan kubus menjadi 6 limas, geometri sisi limas
 * yang terlihat, serta Lab Tuang (limas → prisma) & Lab Belah Kubus.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

const PERSEGI = [
  [0, 0],
  [6, 0],
  [6, 6],
  [0, 6],
];
const SEGITIGA = [
  [0, 0],
  [8, 0],
  [0, 6],
];

test('volumeLimas: ⅓ × luas alas × tinggi, juga dari titik alas', () => {
  assert.equal(E.volumeLimas(36, 9), 108);
  assert.equal(E.volumeLimas(24, 6), 48);
  assert.equal(E.volumeLimas(9, 2), 6);
  assert.equal(E.volumeLimasAlas(PERSEGI, 9), 108);
  assert.equal(E.volumeLimasAlas(SEGITIGA, 6), 48);
  /* Sepertiga volume prisma beralas & bertinggi sama. */
  assert.equal(E.volumeLimas(40, 6) * 3, E.volumePrisma(40, 6));
  /* Hasil pecahan dibulatkan rapi (tanpa galat biner). */
  assert.equal(E.volumeLimas(10, 1), 3.333333);
});

test('tinggiLimasDariVolume & luasAlasLimasDariVolume: kebalikan rumus', () => {
  assert.equal(E.tinggiLimasDariVolume(243, 81), 9);
  assert.equal(E.luasAlasLimasDariVolume(384, 8), 144);
  assert.equal(E.tinggiLimasDariVolume(E.volumeLimas(60, 9), 60), 9);
});

test('kandidatVolumeLimas: miskonsepsi umum dihitung dari ukuran', () => {
  const o = { luasAlas: 144, tinggi: 8, tinggiSisi: 10 };
  const k = E.kandidatVolumeLimas(o);
  assert.equal(k.benar, 384);
  assert.equal(k['lupa-sepertiga'], 1152);
  assert.equal(k.setengah, 576);
  assert.equal(k['tinggi-sisi'], 480);
  assert.equal(k['jumlah-ukuran'], 152);
  assert.equal(k['lupa-setengah'], undefined, 'hanya bila alas memakai ½');
  const ks = E.kandidatVolumeLimas({ luasAlas: 24, tinggi: 10, adaSetengah: true });
  assert.equal(ks.benar, 80);
  assert.equal(ks['lupa-setengah'], 160);
  assert.equal(ks['tinggi-sisi'], undefined, 'tanpa tₛ tidak ada kandidat tₛ');
});

test('diagnosaVolumeLimas: kode & pesan untuk setiap miskonsepsi', () => {
  const o = { luasAlas: 144, tinggi: 8, tinggiSisi: 10 };
  assert.equal(E.diagnosaVolumeLimas(o, 384).kode, 'benar');
  assert.equal(E.diagnosaVolumeLimas(o, 1152).kode, 'lupa-sepertiga');
  assert.equal(E.diagnosaVolumeLimas(o, 576).kode, 'setengah');
  assert.equal(E.diagnosaVolumeLimas(o, 480).kode, 'tinggi-sisi');
  assert.equal(E.diagnosaVolumeLimas(o, 152).kode, 'jumlah-ukuran');
  assert.equal(E.diagnosaVolumeLimas(o, 999).kode, 'salah-hitung');
  assert.equal(
    E.diagnosaVolumeLimas({ luasAlas: 24, tinggi: 10, adaSetengah: true }, 160).kode,
    'lupa-setengah'
  );
  Object.keys(E.kandidatVolumeLimas({ ...o, adaSetengah: true }))
    .concat(['salah-hitung'])
    .forEach((kode) => assert.ok(E.VLM_PESAN[kode], 'pesan ' + kode));
  assert.equal(E.diagnosaVolumeLimas(o, 1152).pesan, E.VLM_PESAN['lupa-sepertiga']);
});

test('pengecohVolumeLimas: pengecoh kartu isian tanpa jawaban benar', () => {
  const list = E.pengecohVolumeLimas({ luasAlas: 36, tinggi: 9 });
  assert.ok(list.length >= 3);
  list.forEach((p) => {
    assert.notEqual(p.nilai, 108);
    assert.ok(p.pesan && p.kode);
  });
  assert.ok(
    list.some((p) => p.nilai === 324),
    'lupa ⅓ = volume prisma'
  );
  assert.equal(new Set(list.map((p) => p.nilai)).size, list.length);
});

test('opsiVolumeLimas: ≥ 4 opsi bernilai unik, benar di depan (belum diacak)', () => {
  [
    { luasAlas: 144, tinggi: 8, tinggiSisi: 10 },
    { luasAlas: 24, tinggi: 10, adaSetengah: true },
    { luasAlas: 9, tinggi: 2 },
    { luasAlas: 3, tinggi: 1 },
  ].forEach((o) => {
    const opsi = E.opsiVolumeLimas(o, 'cm³');
    assert.ok(opsi.length >= 4, 'minimal 4 opsi');
    assert.equal(opsi[0].id, 'benar');
    assert.equal(opsi[0].nilai, E.volumeLimas(o.luasAlas, o.tinggi));
    assert.equal(new Set(opsi.map((x) => x.nilai)).size, opsi.length, 'nilai unik');
    assert.equal(new Set(opsi.map((x) => x.id)).size, opsi.length, 'id unik');
    opsi.forEach((x) => {
      assert.ok(x.nilai > 0);
      assert.match(x.label, /cm³$/);
    });
  });
});

test('belahKubusLimas: kubus = 6 limas kongruen berpuncak di pusat', () => {
  const b = E.belahKubusLimas(6);
  assert.deepEqual(plain(b), {
    rusuk: 6,
    volumeKubus: 216,
    banyak: 6,
    volumeLimas: 36,
    luasAlas: 36,
    tinggi: 3,
    luasAlasKaliTinggi: 108,
  });
  assert.equal(b.volumeLimas, E.volumeLimas(b.luasAlas, b.tinggi));
  assert.ok(Math.abs(E.belahKubusLimas(4).volumeLimas * 6 - 64) < 1e-4);
});

test('vlmSisiLimas: sisi tegak menghadap pengamat isometrik', () => {
  const alas = PERSEGI.map((q) => [q[0], q[1], 0]);
  const tegak = E.vlmSisiLimas(alas, [3, 3, 9]);
  assert.equal(tegak.length, 5);
  const lihat = tegak.filter((f) => f.terlihat).map((f) => f.id);
  assert.ok(!lihat.includes('alas'), 'alas di bawah tidak terlihat');
  assert.equal(lihat.length, 2, 'limas tinggi: dua sisi tegak depan terlihat');
  /* Limas pendek: dari atas keempat sisi tegak terlihat. */
  const pendek = E.vlmSisiLimas(alas, [3, 3, 1]);
  assert.equal(pendek.filter((f) => f.terlihat && f.jenis === 'tegak').length, 4);
  /* Urutan titik alas searah jarum jam memberi hasil yang sama. */
  const balik = E.vlmSisiLimas(alas.slice().reverse(), [3, 3, 9]);
  assert.equal(balik.filter((f) => f.terlihat).length, 2);
  /* Limas terbalik (puncak di bawah): alasnya di atas dan terlihat. */
  const atasAlas = PERSEGI.map((q) => [q[0], q[1], 6]);
  const terbalik = E.vlmSisiLimas(atasAlas, [3, 3, 3]);
  assert.ok(terbalik.find((f) => f.id === 'alas').terlihat);
});

test('buildVlmLimasSVG: gambar statis limas berlabel aria', () => {
  const svg = E.buildVlmLimasSVG(SEGITIGA, 6, { aria: 'Keju limas', lebar: 200 });
  assert.match(svg, /^<svg/);
  assert.match(svg, /aria-label="Keju limas"/);
  assert.match(svg, /vpr-face--tegak/);
  const garis = E.buildVlmLimasSVG(PERSEGI, 9, { garisTinggi: true });
  assert.match(garis, /vlm-garis-tinggi/);
  assert.match(garis, /9 cm/);
});

const TUANG = {
  pasangan: [
    { id: 'a', nama: 'Cokelat', alas: PERSEGI, t: 9 },
    { id: 'b', nama: 'Keju', alas: SEGITIGA, t: 6 },
  ],
};

test('ensureVlTuangState: pasangan valid, isi/tuang terjaga', () => {
  const s = {};
  const st = E.ensureVlTuangState(s, 'lab', TUANG);
  assert.equal(st.p, 'a');
  assert.deepEqual(plain(st.tuang), { a: 0, b: 0 });
  assert.deepEqual(plain(st.isi), { a: false, b: false });
  assert.deepEqual(plain(st.penuh), {});
  s.lab.p = 'zzz';
  s.lab.tuang.a = 99;
  s.lab.tuang.b = -1;
  s.lab.isi.a = 'ya';
  E.ensureVlTuangState(s, 'lab', TUANG);
  assert.equal(s.lab.p, 'a');
  assert.equal(s.lab.tuang.a, E.VLM_TUANG);
  assert.equal(s.lab.tuang.b, 0);
  assert.equal(s.lab.isi.a, false, 'prisma penuh tidak bisa menampung isi baru');
});

test('vlTuangAksi: isi → tuang tiga kali sampai prisma penuh', () => {
  const st = E.ensureVlTuangState({}, 'lab', TUANG);
  const p = TUANG.pasangan[0];
  assert.equal(E.VLM_TUANG, 3);
  E.vlTuangAksi(st, p, 'tuang');
  assert.equal(st.tuang.a, 0, 'belum diisi, tidak ada yang dituang');
  for (let i = 1; i <= 3; i++) {
    E.vlTuangAksi(st, p, 'isi');
    assert.equal(st.isi.a, true);
    E.vlTuangAksi(st, p, 'tuang');
    assert.equal(st.isi.a, false);
    assert.equal(st.tuang.a, i);
  }
  assert.equal(st.penuh.a, true);
  E.vlTuangAksi(st, p, 'isi');
  assert.equal(st.isi.a, false, 'prisma penuh: limas tidak diisi lagi');
  assert.equal(E.vlTuangSelesai(st, TUANG), false);
  E.vlTuangAksi(st, p, 'kosong');
  assert.equal(st.tuang.a, 0);
  assert.equal(st.penuh.a, true, 'pernah penuh tetap tercatat');
  const q = TUANG.pasangan[1];
  for (let i = 0; i < 3; i++) {
    E.vlTuangAksi(st, q, 'isi');
    E.vlTuangAksi(st, q, 'tuang');
  }
  assert.equal(E.vlTuangSelesai(st, TUANG), true);
});

test('buildVlTuangLab: limas & prisma, tombol aksi, info tuangan', () => {
  const st = E.ensureVlTuangState({}, 'lab', TUANG);
  const p = TUANG.pasangan[0];
  let html = E.buildVlTuangLab('tg', st, TUANG);
  assert.match(html, /id="tg"/);
  assert.match(html, /<svg[^>]*role="img"/);
  assert.match(html, /data-vlm-aksi="isi"/);
  assert.match(html, /data-vlm-aksi="tuang"[^>]*disabled/, 'tuang nonaktif sebelum diisi');
  assert.equal((html.match(/data-vlm-p=/g) || []).length, 2, 'tombol pilih pasangan');
  assert.match(html, /0 kali/);
  assert.doesNotMatch(html, /data-vlm-pasir-prisma/);
  E.vlTuangAksi(st, p, 'isi');
  html = E.buildVlTuangLab('tg', st, TUANG);
  assert.match(html, /data-vlm-pasir-limas/);
  assert.match(html, /data-vlm-aksi="isi"[^>]*disabled/);
  E.vlTuangAksi(st, p, 'tuang');
  html = E.buildVlTuangLab('tg', st, TUANG);
  assert.match(html, /data-vlm-pasir-prisma/);
  assert.match(html, /1 kali/);
  assert.match(html, /⅓/);
  E.vlTuangAksi(st, p, 'isi');
  E.vlTuangAksi(st, p, 'tuang');
  E.vlTuangAksi(st, p, 'isi');
  E.vlTuangAksi(st, p, 'tuang');
  html = E.buildVlTuangLab('tg', st, TUANG);
  assert.match(html, /penuh/);
  assert.match(html, /✓ Cokelat/);
});

test('ensureVlBelahState & buildVlBelahKubus: gabung vs pisah enam limas', () => {
  const st = E.ensureVlBelahState({}, 'b');
  assert.deepEqual(plain(st), { pisah: false, pernah: false });
  const b = { s: 6, nama: 'Kubus cokelat' };
  const gabung = E.buildVlBelahKubus('bk', b, { pisah: false });
  const pisah = E.buildVlBelahKubus('bk', b, { pisah: true });
  assert.match(gabung, /data-vlm-belah/);
  assert.match(gabung, /aria-pressed="false"/);
  assert.match(pisah, /aria-pressed="true"/);
  assert.equal((pisah.match(/data-vlm-keping=/g) || []).length, 6);
  assert.equal((gabung.match(/data-vlm-keping=/g) || []).length, 6);
  assert.doesNotMatch(gabung, /data-vlm-satu/);
  assert.match(pisah, /data-vlm-satu/, 'satu limas diperlihatkan terpisah');
  assert.match(pisah, /3 cm/, 'tinggi limas = ½ rusuk');
  assert.notEqual(gabung, pisah);
});

test('vlmBelahKepingan: enam limas, alas = sisi kubus, puncak di pusat', () => {
  const k = E.vlmBelahKepingan(6, false);
  assert.equal(k.length, 6);
  assert.equal(new Set(k.map((x) => x.id)).size, 6);
  k.forEach((x) => {
    assert.deepEqual(plain(x.puncak), [3, 3, 3]);
    assert.equal(x.alas3.length, 4);
  });
  /* Saat dipisah, setiap keping bergeser menjauhi pusat kubus. */
  const p = E.vlmBelahKepingan(6, true);
  p.forEach((x) => {
    const d = Math.hypot(x.puncak[0] - 3, x.puncak[1] - 3, x.puncak[2] - 3);
    assert.ok(d > 1, x.id + ' bergeser');
  });
});
