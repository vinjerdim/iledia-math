'use strict';

/*
 * Tes fungsi murni seksi 87 shared/engine.js (rerata data tunggal):
 * jumlah, rerata, median, modus; lab ratakan menara (pindah balok,
 * cek rata, sisa, langkah minimum); titik seimbang; data hilang dari
 * rerata; diagnosa & pesan miskonsepsi; serta opsi berpengecoh.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

test('jumlahData & rerataData', () => {
  assert.equal(E.jumlahData([6, 2, 5, 3]), 16);
  assert.equal(E.rerataData([6, 2, 5, 3]), 4);
  assert.equal(E.rerataData([5, 0, 4, 3, 3]), 3);
  assert.equal(E.rerataData([4, 1, 3, 2]), 2.5);
  assert.equal(E.rerataData([]), null);
});

test('medianData & modusData', () => {
  assert.equal(E.medianData([7, 0, 4, 5, 0, 8]), 4.5);
  assert.equal(E.medianData([2, 5, 3, 4, 2]), 3);
  assert.equal(E.medianData([]), null);
  assert.equal(E.modusData([7, 0, 4, 5, 0, 8]), 0);
  assert.equal(E.modusData([2, 5, 3, 4, 2]), 2);
  /* Semua nilai muncul sekali → tidak ada modus. */
  assert.equal(E.modusData([1, 2, 3]), null);
  /* Seri → nilai terkecil yang paling sering muncul. */
  assert.equal(E.modusData([3, 1, 3, 1, 5]), 1);
});

test('pindahBalok: memindahkan satu balok tanpa mengubah array asal', () => {
  const awal = [6, 2, 5, 3];
  assert.deepEqual(plain(E.pindahBalok(awal, 0, 1)), [5, 3, 5, 3]);
  assert.deepEqual(awal, [6, 2, 5, 3]);
  assert.equal(E.pindahBalok(awal, 1, 1), null);
  assert.equal(E.pindahBalok([0, 2], 0, 1), null);
  assert.equal(E.pindahBalok(awal, 9, 1), null);
});

test('menaraRata, sisaRatakan, langkahMinRatakan', () => {
  assert.equal(E.menaraRata([4, 4, 4, 4]), true);
  assert.equal(E.menaraRata([3, 2, 3, 2]), true);
  assert.equal(E.menaraRata([4, 2, 3, 1]), false);
  assert.deepEqual(plain(E.sisaRatakan([4, 1, 3, 2])), { dasar: 2, sisa: 2, banyak: 4 });
  assert.deepEqual(plain(E.sisaRatakan([6, 2, 5, 3])), { dasar: 4, sisa: 0, banyak: 4 });
  assert.equal(E.langkahMinRatakan([6, 2, 5, 3]), 3);
  assert.equal(E.langkahMinRatakan([5, 0, 4, 3, 3]), 3);
  assert.equal(E.langkahMinRatakan([4, 1, 3, 2]), 1);
  assert.equal(E.langkahMinRatakan([3, 3, 3]), 0);
});

test('momenSeimbang: jarak total kiri & kanan penyangga', () => {
  const data = [6, 2, 5, 3];
  assert.deepEqual(plain(E.momenSeimbang(data, 4)), {
    kiri: 3,
    kanan: 3,
    selisih: 0,
    arah: 'seimbang',
  });
  const m = E.momenSeimbang(data, 2);
  assert.equal(m.kiri, 0);
  assert.equal(m.kanan, 8);
  assert.equal(m.arah, 'kanan');
  assert.equal(E.momenSeimbang(data, 5).arah, 'kiri');
  /* Seimbang tepat di rerata, juga bila rerata bukan nilai data. */
  assert.equal(E.momenSeimbang([4, 1, 3, 2], 2.5).arah, 'seimbang');
  assert.equal(E.momenSeimbang([6, 2, 5, 3, 14], 6).arah, 'seimbang');
});

test('simpanganRerata berjumlah nol', () => {
  const s = E.simpanganRerata([10, 8, 12, 15, 10]);
  assert.deepEqual(plain(s), [-1, -3, 1, 4, -1]);
  assert.ok(Math.abs(s.reduce((a, b) => a + b, 0)) < 1e-9);
});

test('dataHilangDariRerata & diagnosaDataHilang', () => {
  /* Rerata 5 data = 7; empat data diketahui 6, 8, 5, 9 → data kelima 7. */
  assert.equal(E.dataHilangDariRerata([6, 8, 5, 9], 7), 7);
  assert.equal(E.dataHilangDariRerata([80, 75, 90], 85), 95);
  assert.equal(E.diagnosaDataHilang([80, 75, 90], 85, 95), 'benar');
  assert.equal(E.diagnosaDataHilang([80, 75, 90], 85, 85), 'rerata');
  assert.equal(E.diagnosaDataHilang([80, 75, 90], 85, 340), 'total');
  assert.equal(E.diagnosaDataHilang([80, 75, 90], 85, 10), 'pembagiKurang');
  assert.equal(E.diagnosaDataHilang([80, 75, 90], 85, 1), 'lain');
  ['rerata', 'total', 'pembagiKurang', 'lain'].forEach((k) => {
    const p = E.pesanDataHilang(k, [80, 75, 90], 85);
    assert.ok(typeof p === 'string' && p.length > 20, k);
    assert.ok(!p.includes('95'), 'pesan salah tidak membocorkan kunci: ' + k);
  });
  assert.ok(E.pesanDataHilang('benar', [80, 75, 90], 85).includes('95'));
});

test('diagnosaRerata mengenali miskonsepsi umum', () => {
  const d = [7, 0, 4, 5, 0, 8]; /* jumlah 24, n 6, rerata 4 */
  assert.equal(E.diagnosaRerata(d, 4), 'benar');
  assert.equal(E.diagnosaRerata(d, 24), 'jumlah');
  assert.equal(E.diagnosaRerata(d, 6), 'tanpaNol');
  assert.equal(E.diagnosaRerata(d, 4.8), 'pembagiKurang');
  assert.equal(E.diagnosaRerata(d, 4.5), 'median');
  assert.equal(E.diagnosaRerata(d, 0), 'modus');
  assert.equal(E.diagnosaRerata(d, 13), 'lain');
  const e = [2, 5, 3, 4, 2]; /* rerata 3,2; median 3; modus 2; tengah rentang 3,5 */
  assert.equal(E.diagnosaRerata(e, 3.2), 'benar');
  assert.equal(E.diagnosaRerata(e, 3), 'median');
  assert.equal(E.diagnosaRerata(e, 3.5), 'tengahRentang');
  assert.equal(E.diagnosaRerata([4, 1, 3, 2, 3], 2), 'bulat'); /* rerata 2,6 */
  /* Pembulatan yang kebetulan sama dengan median didiagnosa sebagai median. */
  assert.equal(E.diagnosaRerata([4, 1, 3, 2, 3], 3), 'median');
});

test('pesanRerata: pesan salah tidak membocorkan kunci', () => {
  const d = [7, 0, 4, 5, 0, 8];
  [
    'jumlah',
    'tanpaNol',
    'pembagiKurang',
    'median',
    'modus',
    'tengahRentang',
    'bulat',
    'lain',
  ].forEach((k) => {
    const p = E.pesanRerata(k, d);
    assert.ok(typeof p === 'string' && p.length > 20, k);
    assert.ok(!/(^|[^\d,])4([^\d,]|$)/.test(p.replace(/4,5/g, '')), 'tidak memuat rerata: ' + k);
  });
  assert.ok(E.pesanRerata('benar', d).includes('24'));
  assert.ok(E.pesanRerata('benar', d, 'buku').includes('4 buku'));
});

test('opsiRerata: 4–5 opsi unik, satu benar, diagnosa cocok dengan id', () => {
  [
    [7, 0, 4, 5, 0, 8],
    [2, 5, 3, 4, 2],
    [6, 6, 6, 6],
    [10, 8, 12, 15, 10],
    [8, 6, 9, 7, 10, 5, 8, 7],
  ].forEach((d) => {
    const opsi = E.opsiRerata(d, 'kg');
    assert.ok(opsi.length >= 4 && opsi.length <= 5, 'banyak opsi ' + d);
    assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length, 'id unik');
    assert.equal(new Set(opsi.map((o) => o.nilai)).size, opsi.length, 'nilai unik');
    assert.equal(opsi.filter((o) => o.id === 'benar').length, 1);
    opsi.forEach((o) => {
      assert.ok(o.nilai >= 0, 'nilai tidak negatif');
      assert.ok(o.label.endsWith(' kg'), 'label bersatuan');
      const kode = E.diagnosaRerata(d, o.nilai);
      if (o.id.indexOf('dekat') === 0) assert.equal(kode, 'lain');
      else assert.equal(kode, o.id, 'diagnosa ' + o.id + ' pada ' + d);
    });
    assert.ok(E.hampirSama(opsi.find((o) => o.id === 'benar').nilai, E.rerataData(d)));
  });
});

test('ensureMenaraState menyiapkan & memulihkan state lab', () => {
  const t = {};
  const st = E.ensureMenaraState(t, 'a', [6, 2, 5, 3]);
  assert.deepEqual(plain(st), { tinggi: [6, 2, 5, 3], pilih: null, pindah: 0 });
  st.tinggi = [5, 3, 5, 3];
  st.pindah = 1;
  assert.equal(E.ensureMenaraState(t, 'a', [6, 2, 5, 3]).pindah, 1);
  /* Jumlah balok tidak cocok (DATA berubah) → disiapkan ulang. */
  t.a.tinggi = [1, 1, 1, 1];
  assert.deepEqual(plain(E.ensureMenaraState(t, 'a', [6, 2, 5, 3]).tinggi), [6, 2, 5, 3]);
});

test('buildMenaraRata & buildTitikSeimbang menghasilkan markup beraksesibilitas', () => {
  const st = E.ensureMenaraState({}, 'a', [6, 2, 5, 3]);
  const html = E.buildMenaraRata('labA', st, {
    nama: ['Ani', 'Budi', 'Citra', 'Dodi'],
    awal: [6, 2, 5, 3],
    satuan: 'buku',
  });
  assert.equal((html.match(/data-menara-i=/g) || []).length, 4);
  assert.ok(html.includes('aria-label="Ani: 6 buku'));
  assert.ok(html.includes('id="labA-ulang"'));

  const sv = E.ensureSeimbangState({}, 's', 2);
  const svg = E.buildTitikSeimbang('ts', [6, 2, 5, 3], sv, { min: 0, max: 8, langkah: 0.5 });
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('role="img"'));
  assert.ok(svg.includes('id="ts-kanan"'));
  assert.ok(svg.includes('aria-live="polite"'));
  const statis = E.buildTitikSeimbang('ts2', [6, 2, 5, 3], { posisi: 4 }, { statis: true });
  assert.ok(!statis.includes('id="ts2-kanan"'));
  assert.ok(statis.includes('seimbang'));
});
