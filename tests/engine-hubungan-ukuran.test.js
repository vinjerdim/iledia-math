'use strict';

/*
 * Tes fungsi murni seksi 88 shared/engine.js (hubungan mean, median &
 * modus data tunggal): semua modus, ringkasan ukuran, hubungan rerata
 * vs median & bentuk sebaran, mengubah satu nilai & ukuran yang berubah,
 * misi Lab Geser Data, diagnosa/pesan/opsi berpengecoh median & modus,
 * serta pembungkus per jenis ukuran.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

test('semuaModus: semua nilai berfrekuensi terbesar, terurut naik', () => {
  assert.deepEqual(plain(E.semuaModus([5, 3, 5, 7, 3, 1])), [3, 5]);
  assert.deepEqual(plain(E.semuaModus([4, 5, 5, 5, 6])), [5]);
  /* Setiap nilai muncul sekali → tidak ada modus. */
  assert.deepEqual(plain(E.semuaModus([1, 2, 3])), []);
  assert.deepEqual(plain(E.semuaModus([])), []);
  /* Data asal tidak diurutkan ulang. */
  const d = [3, 1, 3];
  E.semuaModus(d);
  assert.deepEqual(d, [3, 1, 3]);
});

test('ringkasUkuran: rerata, median, dan daftar modus', () => {
  const r = plain(E.ringkasUkuran([4, 5, 5, 5, 6, 7, 8, 8, 42]));
  assert.deepEqual(r, { rerata: 10, median: 6, modus: [5] });
});

test('hubunganRerataMedian & bentukSebaran', () => {
  assert.equal(E.hubunganRerataMedian([3, 4, 5, 5, 5, 6, 7]), 'sama');
  assert.equal(E.bentukSebaran([3, 4, 5, 5, 5, 6, 7]), 'simetris');
  assert.equal(E.hubunganRerataMedian([3, 4, 5, 5, 5, 6, 12]), 'lebih');
  assert.equal(E.bentukSebaran([3, 4, 5, 5, 5, 6, 12]), 'ekorKanan');
  assert.equal(E.hubunganRerataMedian([0, 4, 5, 5, 5, 6, 7]), 'kurang');
  assert.equal(E.bentukSebaran([0, 4, 5, 5, 5, 6, 7]), 'ekorKiri');
  /* Selisih desimal kecil tetap terdeteksi (bukan galat pembulatan). */
  assert.equal(E.hubunganRerataMedian([1, 2, 3, 4, 6]), 'lebih');
});

test('ubahNilai: array baru, indeks tidak sah → null', () => {
  const d = [1, 2, 3];
  assert.deepEqual(plain(E.ubahNilai(d, 2, 9)), [1, 2, 9]);
  assert.deepEqual(d, [1, 2, 3]);
  assert.equal(E.ubahNilai(d, 5, 1), null);
  assert.equal(E.ubahNilai(d, -1, 1), null);
});

test('ukuranBerubah: pencilan mengubah rerata, bukan median & modus', () => {
  const awal = [3, 4, 5, 5, 5, 6, 7];
  assert.deepEqual(plain(E.ukuranBerubah(awal, [3, 4, 5, 5, 5, 6, 12])), {
    rerata: true,
    median: false,
    modus: false,
  });
  assert.deepEqual(plain(E.ukuranBerubah(awal, [3, 4, 5, 5, 6, 6, 7])), {
    rerata: true,
    median: false,
    modus: true,
  });
  assert.deepEqual(plain(E.ukuranBerubah(awal, awal.slice())), {
    rerata: false,
    median: false,
    modus: false,
  });
});

test('cekMisiUkuran: sama, rerataLebih, rerataKurang, hanyaRerata', () => {
  const awal = [3, 4, 5, 5, 5, 6, 7];
  assert.equal(E.cekMisiUkuran([3, 4, 5, 5, 5, 6, 7], { jenis: 'sama' }), true);
  /* Rerata = median tetapi modusnya bukan satu nilai yang sama → belum. */
  assert.equal(E.cekMisiUkuran([1, 2, 3, 4, 5], { jenis: 'sama' }), false);
  assert.equal(E.cekMisiUkuran([3, 4, 5, 5, 5, 6, 9], { jenis: 'sama' }), false);
  assert.equal(E.cekMisiUkuran([3, 4, 5, 5, 5, 6, 12], { jenis: 'rerataLebih' }), true);
  assert.equal(E.cekMisiUkuran(awal, { jenis: 'rerataLebih' }), false);
  assert.equal(E.cekMisiUkuran([0, 4, 5, 5, 5, 6, 7], { jenis: 'rerataKurang' }), true);
  assert.equal(E.cekMisiUkuran(awal, { jenis: 'rerataKurang' }), false);
  const m = { jenis: 'hanyaRerata', awal: awal };
  assert.equal(E.cekMisiUkuran([3, 4, 5, 5, 5, 6, 11], m), true);
  assert.equal(E.cekMisiUkuran(awal, m), false);
  /* Median ikut berubah → belum memenuhi misi. */
  assert.equal(E.cekMisiUkuran([3, 4, 5, 6, 6, 6, 7], m), false);
  assert.equal(E.cekMisiUkuran(awal, { jenis: 'tidakDikenal' }), false);
});

test('diagnosaMedian: data ganjil & genap, berbagai miskonsepsi', () => {
  /* Ganjil, tak terurut: terurut 2,3,5,8,9 → median 5. */
  const g = [8, 3, 9, 2, 5];
  assert.equal(E.diagnosaMedian(g, 5), 'benar');
  assert.equal(E.diagnosaMedian(g, 9), 'tidakUrut');
  assert.equal(E.diagnosaMedian(g, 3), 'posisi');
  assert.equal(E.diagnosaMedian(g, 5.4), 'rerata');
  assert.equal(E.diagnosaMedian(g, 17), 'lain');
  /* Genap: terurut 1,4,6,7,9,9 → median 6,5; modus 9; tengah tak terurut (9 + 7) ÷ 2 = 8. */
  const e = [4, 1, 9, 7, 9, 6];
  assert.equal(E.diagnosaMedian(e, 6.5), 'benar');
  assert.equal(E.diagnosaMedian(e, 6), 'genapSatu');
  assert.equal(E.diagnosaMedian(e, 7), 'genapSatu');
  assert.equal(E.diagnosaMedian(e, 13), 'genapJumlah');
  assert.equal(E.diagnosaMedian(e, 3.5), 'posisi');
  assert.equal(E.diagnosaMedian(e, 8), 'tidakUrut');
  assert.equal(E.diagnosaMedian(e, 9), 'modus');
});

test('pesanMedian: pesan salah tidak membocorkan kunci', () => {
  const e = [4, 1, 9, 7, 9, 6];
  assert.match(E.pesanMedian('benar', e, 'kg'), /6,5 kg/);
  ['tidakUrut', 'genapSatu', 'genapJumlah', 'posisi', 'rerata', 'modus', 'lain'].forEach((k) => {
    const p = E.pesanMedian(k, e, 'kg');
    assert.ok(p.length > 20, k);
    assert.ok(!p.includes('6,5'), k + ' tidak menyebut kunci');
  });
});

test('diagnosaModus & pesanModus', () => {
  /* 2 muncul 3 kali; median 3; rerata 3,5; terbesar 7. */
  const d = [2, 5, 2, 7, 3, 2, 4, 3];
  assert.equal(E.diagnosaModus(d, 2), 'benar');
  assert.equal(E.diagnosaModus(d, 3), 'frekuensi');
  assert.equal(E.diagnosaModus(d, 3.5), 'rerata');
  assert.equal(E.diagnosaModus(d, 7), 'terbesar');
  assert.equal(E.diagnosaModus(d, 6), 'lain');
  const d2 = [6, 1, 6, 9, 4];
  assert.equal(E.diagnosaModus(d2, 2), 'frekuensi');
  assert.equal(E.diagnosaModus(d2, 5.2), 'rerata');
  assert.equal(E.diagnosaModus(d2, 9), 'terbesar');
  assert.equal(E.diagnosaModus([1, 6, 2, 6, 3], 3), 'median');
  assert.match(E.pesanModus('benar', d, 'buku'), /2 buku/);
  ['frekuensi', 'median', 'rerata', 'terbesar', 'lain'].forEach((k) => {
    assert.ok(E.pesanModus(k, d, 'buku').length > 20, k);
  });
});

test('opsiMedian & opsiModus: benar + pengecoh unik ber-id diagnosa', () => {
  [
    [[8, 3, 9, 2, 5], E.opsiMedian, E.diagnosaMedian, E.medianData],
    [[4, 1, 9, 7, 9, 6], E.opsiMedian, E.diagnosaMedian, E.medianData],
    [[2, 5, 2, 7, 3, 2, 4, 3], E.opsiModus, E.diagnosaModus, E.modusData],
    [[4, 4, 4, 4, 5], E.opsiModus, E.diagnosaModus, E.modusData],
  ].forEach(([data, opsiFn, diagFn, kunciFn]) => {
    const o = plain(opsiFn(data, 'kg'));
    assert.ok(o.length >= 4 && o.length <= 5, 'banyak opsi ' + o.length);
    assert.equal(o[0].id, 'benar');
    assert.equal(o[0].nilai, kunciFn(data));
    assert.equal(new Set(o.map((x) => x.id)).size, o.length, 'id unik');
    assert.equal(new Set(o.map((x) => x.label)).size, o.length, 'label unik');
    o.forEach((x) => {
      assert.ok(x.label.endsWith(' kg'));
      assert.ok(x.nilai >= 0);
      const kode = diagFn(data, x.nilai);
      assert.equal(kode, x.id.indexOf('dekat') === 0 ? 'lain' : x.id, 'id = diagnosa');
    });
  });
});

test('pembungkus per jenis: kunciUkuran, diagnosaUkuran, pesanUkuran, opsiUkuran', () => {
  const d = [2, 5, 2, 7, 3, 2, 4, 3];
  assert.equal(E.kunciUkuran(d, 'rerata'), 3.5);
  assert.equal(E.kunciUkuran(d, 'median'), 3);
  assert.equal(E.kunciUkuran(d, 'modus'), 2);
  assert.equal(E.diagnosaUkuran(d, 'rerata', 28), 'jumlah');
  assert.equal(E.diagnosaUkuran(d, 'median', 3), 'benar');
  assert.equal(E.diagnosaUkuran(d, 'modus', 3), 'frekuensi');
  assert.match(E.pesanUkuran('benar', d, 'modus', ''), /Tepat/);
  assert.equal(E.opsiUkuran(d, 'median', '')[0].id, 'benar');
  assert.equal(E.NAMA_UKURAN.rerata, 'mean (rerata)');
});

test('teksModus: tanpa modus, satu modus, dan lebih dari satu', () => {
  assert.equal(E.teksModus([1, 2, 3]), 'tidak ada');
  assert.equal(E.teksModus([1, 2, 2]), '2');
  assert.equal(E.teksModus([1, 1, 2, 2, 3]), '1 dan 2');
  assert.equal(E.teksModus([1, 1, 2, 2, 3, 3, 4]), '1, 2, dan 3');
});

test('ensureGeserDataState: disiapkan ulang bila tidak cocok', () => {
  const s = {};
  const st = E.ensureGeserDataState(s, 'm1', [1, 2, 3]);
  assert.deepEqual(plain(st), { data: [1, 2, 3], pilih: null, geser: 0 });
  st.data[0] = 4;
  assert.equal(E.ensureGeserDataState(s, 'm1', [1, 2, 3]).data[0], 4);
  s.m1.data = [1, 2];
  assert.deepEqual(plain(E.ensureGeserDataState(s, 'm1', [1, 2, 3]).data), [1, 2, 3]);
  s.m1.data = [1, 'x', 3];
  assert.deepEqual(plain(E.ensureGeserDataState(s, 'm1', [1, 2, 3]).data), [1, 2, 3]);
});
