'use strict';

/*
 * Tes engine seksi 56 (Limas: unsur & jaring-jaring) beserta opsi
 * generik seksi 31 yang dipakainya: rumus unsur limas segi-n, model 3D
 * limas, diagnosa isian tabel, jaring-jaring "bunga" & "kipas" yang
 * benar-benar menutup saat dilipat, alasan cekJaringLimas, serta
 * penjelajah/tabel/jaring prisma yang dipakai ulang dengan opsi limas.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

function jarak(p, q) {
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

/* Banyak titik berbeda (toleransi 1e-6) dari semua keping terlipat. */
function titikBerbeda(pieces3) {
  const unik = [];
  pieces3.forEach((p) =>
    p.pts3.forEach((q) => {
      if (!unik.some((u) => jarak(u, q) < 1e-6)) unik.push(q);
    })
  );
  return unik;
}

test('nama, notasi, dan label titik limas', () => {
  assert.equal(E.namaLimas(3), 'limas segitiga');
  assert.equal(E.namaLimas(4), 'limas segiempat');
  assert.equal(E.notasiLimas(4), 'T.ABCD');
  assert.equal(E.notasiLimas(6), 'T.ABCDEF');
  const L = E.labelTitikLimas(5);
  assert.deepEqual([...L.alas], ['A', 'B', 'C', 'D', 'E']);
  assert.equal(L.puncak, 'T');
});

test('unsurLimas: n + 1 titik, 2n rusuk, n + 1 sisi, memenuhi Euler', () => {
  for (let n = 3; n <= 10; n++) {
    const u = E.unsurLimas(n);
    assert.equal(u.titik, n + 1);
    assert.equal(u.rusukAlas, n);
    assert.equal(u.rusukTegak, n);
    assert.equal(u.rusuk, 2 * n);
    assert.equal(u.sisiAlas, 1);
    assert.equal(u.sisiTegak, n);
    assert.equal(u.sisi, n + 1);
    assert.equal(u.titik - u.rusuk + u.sisi, 2, 'Euler n=' + n);
  }
});

test('modelLimas: banyak & nama unsur sesuai rumus', () => {
  for (let n = 3; n <= 8; n++) {
    const m = E.modelLimas(n);
    const u = E.unsurLimas(n);
    assert.equal(m.titik.length, u.titik);
    assert.equal(m.rusuk.length, u.rusuk);
    assert.equal(m.sisi.length, u.sisi);
    assert.equal(m.rusuk.filter((r) => r.jenis === 'tegak').length, n);
    assert.equal(m.sisi.filter((s) => s.jenis === 'tegak').length, n);
  }
  const m = E.modelLimas(4, { tinggi: 1.5 });
  const T = m.titik.find((t) => t.jenis === 'puncak');
  assert.equal(T.nama, 'T');
  assert.deepEqual([...T.pos], [0, 0, 1.5]);
  assert.ok(m.rusuk.some((r) => r.nama === 'TA' && r.jenis === 'tegak'));
  assert.ok(m.rusuk.some((r) => r.nama === 'AB' && r.jenis === 'alas'));
  assert.ok(m.sisi.some((s) => s.nama === 'ABCD' && s.jenis === 'alas'));
  assert.ok(m.sisi.some((s) => s.nama === 'TAB' && s.jenis === 'tegak'));
  assert.equal(m.label, 'limas segiempat T.ABCD');
  /* Kaki tinggi: O di pusat alas, P di tengah rusuk AB. */
  assert.deepEqual([...m.kakiTinggi.O], [0, 0, 0]);
  const A = m.titik[0].pos;
  const B = m.titik[1].pos;
  m.kakiTinggi.P.forEach((v, d) => assert.ok(Math.abs(v - (A[d] + B[d]) / 2) < 1e-12));
});

test('modelLimas: alas tersembunyi dari atas, terlihat dari bawah', () => {
  const m = E.modelLimas(4);
  assert.equal(E.sisiTerlihatPrisma(m, { azimut: -25, elevasi: 25 }).alas, false);
  assert.equal(E.sisiTerlihatPrisma(m, { azimut: -25, elevasi: -40 }).alas, true);
  const vt = E.titikTerlihatPrisma(m, { azimut: -25, elevasi: 25 });
  assert.equal(vt['p4'], true, 'puncak terlihat dari atas');
});

test('diagnosaUnsurLimas: kode miskonsepsi', () => {
  const n = 4;
  const kasus = [
    ['titik', 5, 'benar'],
    ['titik', 4, 'titik-lupa-puncak'],
    ['titik', 8, 'titik-seperti-prisma'],
    ['rusuk', 8, 'benar'],
    ['rusuk', 4, 'rusuk-satu-kelompok'],
    ['rusuk', 12, 'rusuk-seperti-prisma'],
    ['sisi', 5, 'benar'],
    ['sisi', 4, 'sisi-lupa-alas'],
    ['sisi', 6, 'sisi-seperti-prisma'],
    ['sisi', 9, 'salah'],
  ];
  kasus.forEach(([jenis, nilai, kode]) => {
    const r = E.diagnosaUnsurLimas(n, jenis, nilai);
    assert.equal(r.kode, kode, jenis + '=' + nilai);
    assert.equal(r.pesan, E.LMS_PESAN_UNSUR[kode]);
  });
});

test('jaringLimas bunga yang lengkap menutup menjadi limas saat dilipat', () => {
  [3, 4, 5, 6].forEach((n) => {
    const spec = { n: n, susun: 'bunga', tepi: [...Array(n).keys()], s: 1, t: 1.4 };
    const j = E.jaringLimas(spec);
    assert.equal(j.pieces.length, n + 1);
    assert.equal(j.pieces.filter((p) => p.jenis === 'alas').length, 1);
    const flat = titikBerbeda(E.lipatJaring(j, 0));
    assert.equal(flat.length, 2 * n, 'datar: n titik alas + n puncak terpisah');
    const lipat = titikBerbeda(E.lipatJaring(j, 1));
    assert.equal(lipat.length, n + 1, 'terlipat: semua puncak bertemu (n=' + n + ')');
  });
});

test('jaringLimas kipas yang lengkap menutup menjadi limas saat dilipat', () => {
  [3, 4, 5, 6].forEach((n) => {
    for (let j = 0; j < n; j++) {
      const spec = { n: n, susun: 'kipas', segitiga: n, alasPada: [j], s: 1, t: 1.3 };
      const jr = E.jaringLimas(spec);
      assert.equal(jr.pieces.length, n + 1);
      const lipat = titikBerbeda(E.lipatJaring(jr, 1));
      assert.equal(lipat.length, n + 1, 'n=' + n + ', alas pada segitiga ke-' + j);
    }
  });
});

test('jaringLimas: tinggi limas hasil lipatan = √(t² − apotema²)', () => {
  const n = 4;
  const s = 1;
  const t = 1.3;
  const j = E.jaringLimas({ n: n, susun: 'bunga', tepi: [0, 1, 2, 3], s: s, t: t });
  const pieces = E.lipatJaring(j, 1);
  const alas = pieces.find((p) => p.jenis === 'alas');
  const puncak = pieces.find((p) => p.jenis === 'tegak').pts3[2];
  const a = s / (2 * Math.tan(Math.PI / n));
  assert.ok(Math.abs(Math.abs(puncak[2] - alas.pts3[0][2]) - Math.sqrt(t * t - a * a)) < 1e-9);
  assert.ok(Math.abs(E.apotemaAlas(n, s) - a) < 1e-12);
});

test('cekJaringLimas: semua alasan', () => {
  const kasus = [
    [{ n: 4, susun: 'bunga', tepi: [0, 1, 2, 3] }, 'valid'],
    [{ n: 4, susun: 'bunga', tepi: [0, 1, 2] }, 'segitiga-kurang'],
    [{ n: 4, susun: 'kipas', segitiga: 4, alasPada: [2] }, 'valid'],
    [{ n: 4, susun: 'kipas', segitiga: 3, alasPada: [1] }, 'segitiga-kurang'],
    [{ n: 4, susun: 'kipas', segitiga: 5, alasPada: [1] }, 'segitiga-lebih'],
    [{ n: 4, susun: 'kipas', segitiga: 4, alasPada: [] }, 'alas-kurang'],
    [{ n: 4, susun: 'kipas', segitiga: 4, alasPada: [0, 3] }, 'alas-lebih'],
  ];
  kasus.forEach(([spec, alasan]) => {
    const r = E.cekJaringLimas(spec);
    assert.equal(r.alasan, alasan, JSON.stringify(spec));
    assert.equal(r.valid, alasan === 'valid');
    assert.equal(r.pesan, E.LMS_PESAN_JARING[alasan]);
  });
});

test('kunciJaringLimas membedakan letak alas & banyak segitiga', () => {
  const a = E.kunciJaringLimas({ n: 4, susun: 'kipas', segitiga: 4, alasPada: [0] });
  const b = E.kunciJaringLimas({ n: 4, susun: 'kipas', segitiga: 4, alasPada: [1] });
  const c = E.kunciJaringLimas({ n: 4, susun: 'kipas', segitiga: 5, alasPada: [0] });
  assert.notEqual(a, b);
  assert.notEqual(a, c);
});

test('buildPrismSVG menggambar model limas beserta garis tinggi', () => {
  const m = E.modelLimas(4);
  const svg = E.buildPrismSVG(
    m,
    { azimut: -25, elevasi: 25 },
    {
      mode: 'titik',
      garis: E.garisTinggiLimas(m),
    }
  );
  assert.match(svg, /aria-label="limas segiempat T\.ABCD"/);
  assert.match(svg, /Titik sudut T \(titik puncak\)/);
  assert.equal((svg.match(/class="psm-garis /g) || []).length, 2);
  assert.match(svg, />TO</);
  assert.match(svg, />TP</);
});

test('penjelajah dengan opsi limas: nama, notasi, tombol tinggi', () => {
  const opts = E.opsiJelajahLimas([3, 4, 5, 6]);
  const state = {};
  const st = E.ensureJelajahState(state, 'j', opts);
  assert.equal(st.n, 3);
  assert.equal(st.tinggi, false);
  st.n = 4;
  const html = E.buildPrismExplorer('jl', st, opts);
  assert.match(html, /Limas segiempat/);
  assert.match(html, /T\.ABCD/);
  assert.match(html, /data-psm-tinggi/);
  assert.match(html, /aria-label="Pilih limas"/);
  assert.doesNotMatch(html, /Prisma/);
  st.tinggi = true;
  assert.match(E.buildPrismExplorer('jl', st, opts), /psm-garis/);
});

test('penjelajah prisma (default) tidak berubah: tanpa tombol tinggi', () => {
  const st = E.ensureJelajahState({}, 'j', {});
  const html = E.buildPrismExplorer('jl', st, {});
  assert.match(html, /Prisma segitiga/);
  assert.match(html, /ABC\.DEF/);
  assert.doesNotMatch(html, /data-psm-tinggi/);
});

test('tabel unsur dengan opsi limas memakai diagnosa & nama limas', () => {
  const opts = E.opsiTabelLimas();
  const st = E.ensureUnsurTableState({}, 't', [4]);
  st.hasil[4] = { titik: 'titik-lupa-puncak', rusuk: 'benar', sisi: 'benar' };
  const html = E.buildUnsurTable('tb', [4], st, opts);
  assert.match(html, /Limas segiempat/);
  assert.match(html, /<th scope="col">Limas<\/th>/);
  assert.match(html, /Banyak titik sudut limas segiempat/);
  assert.ok(html.includes(E.LMS_PESAN_UNSUR['titik-lupa-puncak']));
  st.hasil[4].titik = 'benar';
  assert.ok(E.tabelUnsurBenar(st, [4]));
});

test('jaring limas digambar datar & terlipat dengan aria limas', () => {
  const j = E.jaringLimas({ n: 4, susun: 'bunga', tepi: [0, 1, 2, 3] });
  assert.match(E.buildNetSVG(j), /Jaring-jaring limas segiempat/);
  assert.match(E.buildFoldSVG(j, 0.5), /Jaring-jaring limas segiempat, terlipat 50%/);
  const folder = E.buildNetFolder('f', E.ensureLipatState({}, 'l', { specs: { 4: j.spec } }), {
    specs: { 4: j.spec },
    buatJaring: E.jaringLimas,
  });
  assert.match(folder, /limas segiempat/);
});

test('perakit jaring limas: state, slot alas, dan uji jaring', () => {
  const opts = { n: 4, s: 1, t: 1.3, minSegitiga: 3, maxSegitiga: 5 };
  const st = E.ensureRakitLimasState({}, 'r', opts);
  assert.equal(st.segitiga, 4);
  assert.equal(st.alasPada.length, 0);
  const html = E.buildLimasNetBuilder('rk', st, opts);
  assert.equal((html.match(/data-lms-slot="/g) || []).length, 4, 'satu slot per segitiga');
  assert.match(html, /data-lms-segitiga="-1"/);
  assert.match(html, /data-lms-segitiga="1"/);
  st.alasPada = [2];
  const html2 = E.buildLimasNetBuilder('rk', st, opts);
  assert.equal((html2.match(/data-lms-slot="/g) || []).length, 4, '3 slot kosong + 1 alas');
  assert.match(html2, /Lepas alas/);
  assert.equal(E.cekJaringLimas(E.specRakitLimas(st, opts)).valid, true);
});
