'use strict';

/*
 * Tes fungsi murni & komponen volume prisma (shared/engine.js seksi 54):
 * volume = luas alas × tinggi, kebalikannya (tinggi / luas alas dari
 * volume), konversi satuan volume, kandidat & diagnosa miskonsepsi,
 * opsi berpengecoh, lapisan setebal 1 satuan, geometri tampilan
 * isometrik (sisi yang terlihat), serta lab tumpuk & belah balok.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

const BALOK = [
  [0, 0],
  [4, 0],
  [4, 3],
  [0, 3],
];
const SEGITIGA = [
  [0, 0],
  [6, 0],
  [3, 4],
];
const TRAPESIUM = [
  [0, 0],
  [7, 0],
  [4, 4],
  [0, 4],
];

test('volumePrisma: luas alas × tinggi, juga dari titik alas', () => {
  assert.equal(E.volumePrisma(12, 5), 60);
  assert.equal(E.volumePrisma(22, 5), 110);
  assert.equal(E.volumePrisma(7.5, 2), 15);
  assert.equal(E.volumePrismaAlas(BALOK, 5), 60);
  assert.equal(E.volumePrismaAlas(SEGITIGA, 8), 96);
  assert.equal(E.volumePrismaAlas(TRAPESIUM, 5), 110);
});

test('tinggiDariVolume & luasAlasDariVolume: kebalikan rumus volume', () => {
  assert.equal(E.tinggiDariVolume(1000, 50), 20);
  assert.equal(E.luasAlasDariVolume(360, 18), 20);
  assert.equal(E.tinggiDariVolume(E.volumePrisma(12, 7), 12), 7);
});

test('konversiVolume: cm³, mL, dm³, liter, m³, mm³', () => {
  assert.equal(E.konversiVolume(72000, 'cm3', 'l'), 72);
  assert.equal(E.konversiVolume(2, 'm3', 'l'), 2000);
  assert.equal(E.konversiVolume(1, 'dm3', 'l'), 1);
  assert.equal(E.konversiVolume(250, 'ml', 'cm3'), 250);
  assert.equal(E.konversiVolume(1.5, 'l', 'ml'), 1500);
  assert.equal(E.konversiVolume(3, 'cm3', 'mm3'), 3000);
  assert.equal(E.konversiVolume(1, 'm3', 'cm3'), 1000000);
  assert.ok(E.VPR_SATUAN.l && E.VPR_SATUAN.cm3, 'label satuan tersedia');
});

test('kandidatVolumePrisma: miskonsepsi umum dihitung dari ukuran', () => {
  const o = { luasAlas: 60, kelilingAlas: 36, tinggi: 15, adaSetengah: true };
  const k = E.kandidatVolumePrisma(o);
  assert.equal(k.benar, 900);
  assert.equal(k['lupa-setengah'], 1800);
  assert.equal(k['luas-permukaan'], 660);
  assert.equal(k.keliling, 540);
  assert.equal(k.sepertiga, 300);
  assert.equal(k['jumlah-ukuran'], 75);
  assert.equal(k['satu-lapis'], 60);
  /* Tanpa ½ di rumus luas alas (balok) → tidak ada kandidat lupa ½. */
  const kb = E.kandidatVolumePrisma({ luasAlas: 12, kelilingAlas: 14, tinggi: 5 });
  assert.equal(kb['lupa-setengah'], undefined);
  /* Tanpa keliling → kandidat yang memakai keliling dilewati. */
  const kk = E.kandidatVolumePrisma({ luasAlas: 15, tinggi: 12 });
  assert.equal(kk.keliling, undefined);
  assert.equal(kk['luas-permukaan'], undefined);
});

test('diagnosaVolumePrisma: kode & pesan untuk setiap miskonsepsi', () => {
  const o = { luasAlas: 60, kelilingAlas: 36, tinggi: 15, adaSetengah: true };
  assert.equal(E.diagnosaVolumePrisma(o, 900).kode, 'benar');
  assert.equal(E.diagnosaVolumePrisma(o, 1800).kode, 'lupa-setengah');
  assert.equal(E.diagnosaVolumePrisma(o, 660).kode, 'luas-permukaan');
  assert.equal(E.diagnosaVolumePrisma(o, 540).kode, 'keliling');
  assert.equal(E.diagnosaVolumePrisma(o, 300).kode, 'sepertiga');
  assert.equal(E.diagnosaVolumePrisma(o, 75).kode, 'jumlah-ukuran');
  assert.equal(E.diagnosaVolumePrisma(o, 60).kode, 'satu-lapis');
  assert.equal(E.diagnosaVolumePrisma(o, 123).kode, 'salah-hitung');
  Object.keys(E.kandidatVolumePrisma(o))
    .concat(['salah-hitung'])
    .forEach((kode) => assert.ok(E.VPR_PESAN[kode], 'pesan ' + kode));
  assert.equal(E.diagnosaVolumePrisma(o, 1800).pesan, E.VPR_PESAN['lupa-setengah']);
});

test('opsiVolumePrisma: ≥ 4 opsi bernilai unik, benar di depan (belum diacak)', () => {
  [
    { luasAlas: 60, kelilingAlas: 36, tinggi: 15, adaSetengah: true },
    { luasAlas: 24, kelilingAlas: 20, tinggi: 10 },
    { luasAlas: 15, tinggi: 12, adaSetengah: true },
    { luasAlas: 1, tinggi: 1 },
  ].forEach((o) => {
    const opsi = E.opsiVolumePrisma(o, 'cm³');
    assert.ok(opsi.length >= 4, 'minimal 4 opsi');
    assert.equal(opsi[0].id, 'benar');
    assert.equal(opsi[0].nilai, E.volumePrisma(o.luasAlas, o.tinggi));
    assert.equal(new Set(opsi.map((x) => x.nilai)).size, opsi.length, 'nilai unik');
    assert.equal(new Set(opsi.map((x) => x.id)).size, opsi.length, 'id unik');
    opsi.forEach((x) => {
      assert.ok(x.nilai > 0);
      assert.match(x.label, /cm³$/);
    });
  });
});

test('pengecohVolume: pengecoh kartu isian tanpa jawaban benar', () => {
  const o = { luasAlas: 6, kelilingAlas: 12, tinggi: 5, adaSetengah: true };
  const list = E.pengecohVolume(o);
  assert.ok(list.length >= 3);
  list.forEach((p) => {
    assert.notEqual(p.nilai, 30);
    assert.ok(p.pesan);
  });
  assert.ok(list.some((p) => p.nilai === 60));
  assert.equal(new Set(list.map((p) => p.nilai)).size, list.length);
});

test('lapisanPrisma: lapisan setebal 1, sisa di lapisan teratas', () => {
  assert.deepEqual(plain(E.lapisanPrisma(3)), [
    { z0: 0, z1: 1 },
    { z0: 1, z1: 2 },
    { z0: 2, z1: 3 },
  ]);
  const l = E.lapisanPrisma(2.5);
  assert.equal(l.length, 3);
  assert.deepEqual(plain(l[2]), { z0: 2, z1: 2.5 });
  assert.equal(E.lapisanPrisma(0).length, 0);
});

test('vprSisiTerlihat: dari arah isometrik, atas & sisi depan terlihat', () => {
  const f = E.vprSisiPrisma(BALOK, 0, 2);
  const lihat = f.filter((x) => x.terlihat).map((x) => x.id);
  assert.ok(lihat.includes('atas'));
  assert.ok(!lihat.includes('alas'));
  /* Balok: tepat dua sisi tegak terlihat (menghadap +x dan +y). */
  assert.equal(lihat.filter((id) => id.charAt(0) === 't').length, 2);
  /* Urutan titik searah jarum jam tetap menghasilkan sisi yang sama. */
  const f2 = E.vprSisiPrisma(BALOK.slice().reverse(), 0, 2);
  assert.equal(f2.filter((x) => x.terlihat).length, lihat.length);
});

test('ensureVpTumpukState: prisma valid, lapisan 0..t, catatan penuh', () => {
  const opts = {
    prisma: [
      { id: 'a', alas: BALOK, t: 5 },
      { id: 'b', alas: SEGITIGA, t: 8 },
    ],
  };
  const s = {};
  const st = E.ensureVpTumpukState(s, 'lab', opts);
  assert.equal(st.p, 'a');
  assert.deepEqual(plain(st.n), { a: 0, b: 0 });
  assert.deepEqual(plain(st.penuh), {});
  s.lab.p = 'zzz';
  s.lab.n.a = 99;
  s.lab.n.b = -2;
  E.ensureVpTumpukState(s, 'lab', opts);
  assert.equal(s.lab.p, 'a');
  assert.equal(s.lab.n.a, 5);
  assert.equal(s.lab.n.b, 0);
  assert.equal(E.vpTumpukSelesai(s.lab, opts), false);
  E.vpTumpukAtur(s.lab, opts.prisma[0], 5);
  assert.equal(s.lab.penuh.a, true);
  E.vpTumpukAtur(s.lab, opts.prisma[0], 2);
  assert.equal(s.lab.penuh.a, true, 'pernah penuh tetap tercatat');
  E.vpTumpukAtur(s.lab, opts.prisma[1], 20);
  assert.equal(s.lab.n.b, 8);
  assert.equal(E.vpTumpukSelesai(s.lab, opts), true);
});

test('buildVpTumpukLab: mode kubus menggambar kisi kubus satuan & kontrol', () => {
  const opts = { prisma: [{ id: 'teh', nama: 'Kotak teh', alas: BALOK, t: 5, kubus: true }] };
  const st = E.ensureVpTumpukState({}, 'lab', opts);
  E.vpTumpukAtur(st, opts.prisma[0], 2);
  const html = E.buildVpTumpukLab('tp', st, opts);
  assert.match(html, /id="tp"/);
  assert.match(html, /<svg[^>]*role="img"/);
  assert.match(html, /data-vpr-n/);
  assert.match(html, /data-vpr-step="1"/);
  assert.match(html, /data-vpr-step="-1"/);
  assert.match(html, /2 dari 5 lapisan/);
  assert.match(html, /vpr-grid/, 'garis kisi kubus satuan');
  /* Dua lapisan terisi + bayangan wadah. */
  assert.equal((html.match(/data-vpr-lapis=/g) || []).length, 2);
  assert.match(html, /vpr-hantu/);
});

test('buildVpTumpukLab: mode lapisan tanpa kisi, alas poligon sembarang', () => {
  const opts = {
    prisma: [
      { id: 'c', nama: 'Wadah', alas: SEGITIGA, t: 8 },
      { id: 'd', nama: 'Wadah 2', alas: TRAPESIUM, t: 5 },
    ],
  };
  const st = E.ensureVpTumpukState({}, 'lab', opts);
  E.vpTumpukAtur(st, opts.prisma[0], 8);
  const html = E.buildVpTumpukLab('lp', st, opts);
  assert.doesNotMatch(html, /vpr-grid/);
  assert.equal((html.match(/data-vpr-lapis=/g) || []).length, 8);
  assert.equal((html.match(/data-vpr-p=/g) || []).length, 2, 'tombol pilih prisma');
  assert.match(html, /✓ Wadah/);
});

test('buildVpBelah: gabung vs pisah dua prisma segitiga', () => {
  const b = { p: 4, l: 3, t: 5, nama: 'Kotak teh' };
  const gabung = E.buildVpBelah('bl', b, { pisah: false });
  const pisah = E.buildVpBelah('bl', b, { pisah: true });
  assert.match(gabung, /data-vpr-belah/);
  assert.match(gabung, /aria-pressed="false"/);
  assert.match(pisah, /aria-pressed="true"/);
  assert.equal((pisah.match(/data-vpr-keping=/g) || []).length, 2);
  assert.notEqual(gabung, pisah);
  const st = E.ensureVpBelahState({}, 'b');
  assert.deepEqual(plain(st), { pisah: false, pernah: false });
});

test('buildVpPrismaSVG: gambar statis prisma utuh berlabel aria', () => {
  const svg = E.buildVpPrismaSVG(TRAPESIUM, 5, { aria: 'Wadah camilan', lebar: 200 });
  assert.match(svg, /^<svg/);
  assert.match(svg, /aria-label="Wadah camilan"/);
  assert.match(svg, /vpr-face--atas/);
});
