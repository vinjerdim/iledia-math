'use strict';

/*
 * Tes engine seksi 76 — Pertidaksamaan linear satu variabel (PtLSV):
 * frasa batasan → tanda, jenis kalimat (PLSV vs PtLSV vs bukan
 * keduanya), penyelesaian bulat & bentuk penyelesaian, isian
 * berdiagnosa miskonsepsi (tanda terbalik, batas termasuk/tidak, "="
 * untuk batasan, satu nilai saja), opsi pilihan ganda berpengecoh,
 * garis bilangan SVG, dan Lab Batas.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

function arr(x) {
  return JSON.parse(JSON.stringify(x));
}

test('relasiDariFrasa: frasa batasan sehari-hari → tanda', () => {
  const kasus = {
    'Bagasi paling banyak 20 kg': '≤',
    'Tinggi badan tidak lebih dari 150 cm': '≤',
    'Muatan maksimal 8 orang': '≤',
    'Penumpang tidak melebihi 40 orang': '≤',
    'Usia minimal 12 tahun': '≥',
    'Nilai sekurang-kurangnya 75': '≥',
    'Tabungan paling sedikit Rp50 ribu': '≥',
    'Uang tidak kurang dari Rp10 ribu': '≥',
    'Suhu kurang dari 30 °C': '<',
    'Kecepatan di bawah 40 km/jam': '<',
    'Berat lebih dari 5 kg': '>',
    'Skor di atas 80': '>',
    'Harga tepat Rp15 ribu': '=',
  };
  Object.entries(kasus).forEach(([teks, rel]) =>
    assert.equal(E.relasiDariFrasa(teks), rel, JSON.stringify(teks))
  );
  assert.equal(E.relasiDariFrasa('Kami berangkat pagi'), null);
  assert.equal(E.idRelasiFrasa('paling banyak'), 'kurangSama');
  assert.equal(E.idRelasiFrasa('minimal'), 'lebihSama');
  assert.equal(E.idRelasiFrasa('kurang dari'), 'kurang');
  assert.equal(E.idRelasiFrasa('lebih dari'), 'lebih');
  assert.equal(E.idRelasiFrasa('tepat'), 'sama');
  /* setiap frasa dalam daftar terbaca menjadi tandanya sendiri */
  E.FRASA_BATAS.forEach((f) => assert.equal(E.relasiDariFrasa(f.frasa), f.rel, f.frasa));
  assert.deepEqual(
    Array.from(E.OPSI_TANDA_BATAS, (o) => o.rel).sort(),
    ['<', '=', '>', '≤', '≥'].sort()
  );
});

test('balikRelasi & relasi ketat', () => {
  assert.equal(E.balikRelasi('<'), '>');
  assert.equal(E.balikRelasi('≥'), '≤');
  assert.equal(E.balikRelasi('='), '=');
  assert.equal(E.relasiKetat('<'), true);
  assert.equal(E.relasiKetat('≤'), false);
  assert.equal(E.lawanKetatRelasi('≤'), '<');
  assert.equal(E.lawanKetatRelasi('>'), '≥');
});

test('jenisKalimatBatas & kelompokKalimatBatas', () => {
  const jenis = {
    'x + 2 = 6': 'plsv',
    '7 = 2a + 1': 'plsv',
    'x + 3 ≤ 7': 'ptlsv',
    '2x + 1 < 9': 'ptlsv',
    '10 > 3p': 'ptlsv',
    '2x ≥ x + 4': 'ptlsv',
    'x + y ≤ 10': 'lainnya',
    'x² < 9': 'lainnya',
    'n ≠ 4': 'lainnya',
    'x + 1 > x': 'lainnya',
    '3 + 4 < 9': 'pernyataan',
    '4x − 1': 'bentuk',
  };
  Object.entries(jenis).forEach(([k, j]) => assert.equal(E.jenisKalimatBatas(k), j, k));
  assert.equal(E.jenisKalimatBatas('x ≤ ≤ 4'), null);
  const v = (k) => E.kelompokKalimatBatas(k, 'persamaanAtau');
  assert.equal(v('x + 2 = 6'), 'plsv');
  assert.equal(v('x + 3 ≤ 7'), 'ptlsv');
  assert.equal(v('x + y ≤ 10'), 'bukanKeduanya');
  assert.equal(v('5 > 2'), 'bukanKeduanya');
  const p = (k) => E.kelompokKalimatBatas(k, 'ptlsv');
  assert.equal(p('2m − 1 > 5'), 'ptlsv');
  assert.equal(p('2m − 1 = 5'), 'plsv');
  assert.equal(p('a + b < 7'), 'duaVariabel');
  assert.equal(p('k² ≥ 4'), 'pangkatDua');
  assert.equal(p('k ≠ 4'), 'bukanKeduanya');
});

test('penyelesaian bulat, bentuk penyelesaian, & himpunan', () => {
  assert.deepEqual(arr(E.penyelesaianBulatKalimat('x + 3 ≤ 7', 1, 8)), [1, 2, 3, 4]);
  assert.deepEqual(arr(E.penyelesaianBulatKalimat('2x + 1 < 9', 1, 8)), [1, 2, 3]);
  assert.deepEqual(arr(E.penyelesaianBulatKalimat('2x ≥ 6', 1, 8)), [3, 4, 5, 6, 7, 8]);
  assert.deepEqual(arr(E.penyelesaianBulatKalimat('x + 2 = 6', 1, 8)), [4]);
  assert.deepEqual(arr(E.penyelesaianBulatKalimat('n − 1 > 20', 1, 8)), []);
  assert.deepEqual(arr(E.bentukPenyelesaianBatas('x + 3 ≤ 7')), { huruf: 'x', rel: '≤', batas: 4 });
  /* koefisien variabel negatif setelah dipindah → tanda dibalik */
  assert.deepEqual(arr(E.bentukPenyelesaianBatas('10 > 2p')), { huruf: 'p', rel: '<', batas: 5 });
  assert.deepEqual(arr(E.bentukPenyelesaianBatas('x + 2 = 6')), { huruf: 'x', rel: '=', batas: 4 });
  assert.equal(E.bentukPenyelesaianBatas('x + y < 3'), null);
  assert.equal(E.teksPenyelesaianBatas('2x + 1 < 9'), 'x < 4');
  assert.equal(E.teksPenyelesaianBatas('x + 2 = 6'), 'x = 4');
  assert.equal(E.formatHimpunanBulat([1, 2, 3]), '{1, 2, 3}');
  assert.equal(E.formatHimpunanBulat([]), '{ }');
  assert.deepEqual(arr(E.bacaDaftarBilangan('{1, 2,3}')), { nilai: [1, 2, 3] });
  assert.deepEqual(arr(E.bacaDaftarBilangan('3 1 2 2')), { nilai: [1, 2, 3] });
  assert.deepEqual(arr(E.bacaDaftarBilangan('{ }')), { nilai: [] });
  assert.equal(E.bacaDaftarBilangan('').hasil.kode, 'kosong');
  assert.equal(E.bacaDaftarBilangan('1, dua').hasil.kode, 'format');
});

test('nilaiSoalBatas & jawabSoalBatas untuk setiap jenis cek', () => {
  const s = (cek) => ({ cek });
  assert.equal(E.jawabSoalBatas(s({ kalimat: 'x+3<=7', minta: 'kalimat' })), 'x + 3 ≤ 7');
  assert.equal(E.jawabSoalBatas(s({ kalimat: 'x + 3 ≤ 7', minta: 'jenisBatas' })), 'ptlsv');
  assert.equal(E.jawabSoalBatas(s({ frasa: 'paling banyak', minta: 'tanda' })), 'kurangSama');
  assert.equal(E.jawabSoalBatas(s({ kalimat: 'x + 3 ≤ 7', nilai: 4, minta: 'memenuhi' })), 'ya');
  assert.equal(
    E.jawabSoalBatas(s({ kalimat: '2x + 1 < 9', nilai: 4, minta: 'memenuhi' })),
    'tidak'
  );
  assert.equal(
    E.jawabSoalBatas(s({ kalimat: 'x + 3 ≤ 7', semesta: [1, 8], minta: 'himpunan' })),
    '{1, 2, 3, 4}'
  );
  assert.equal(
    E.jawabSoalBatas(s({ kalimat: 'x + 3 ≤ 7', semesta: [1, 8], minta: 'banyak' })),
    '4'
  );
  assert.equal(
    E.labelJawabBatas(s({ kalimat: 'x + 3 ≤ 7', minta: 'jenisBatas' })),
    E.OPSI_JENIS_BATAS.find((o) => o.id === 'ptlsv').label
  );
});

test('diagnosa menulis kalimat batasan', () => {
  const c = { kalimat: 'x + 3 ≤ 7', minta: 'kalimat' };
  const k = (isian) => E.periksaSoalBatas(isian, { cek: c }).kode;
  assert.equal(k('x + 3 ≤ 7'), 'benar');
  assert.equal(k('x+3<=7'), 'benar');
  assert.equal(k('3 + x ≤ 7'), 'benar');
  assert.equal(k('7 ≥ x + 3'), 'benar', 'ruas ditukar & tanda dibalik');
  assert.equal(k(''), 'kosong');
  assert.equal(k('x +'), 'format');
  assert.equal(k('x + 3'), 'tanpaRelasi');
  assert.equal(k('x + 3 = 7'), 'pakaiSamaDengan');
  assert.equal(k('x + 3 ≥ 7'), 'tandaTerbalik');
  assert.equal(k('x + 3 > 7'), 'tandaTerbalik');
  assert.equal(k('7 ≤ x + 3'), 'tandaTerbalik');
  assert.equal(k('x + 3 < 7'), 'batasTermasuk');
  assert.equal(k('x ≤ 4'), 'langsungJawab');
  assert.equal(k('x − 3 ≤ 7'), 'tandaHilang');
  assert.equal(k('y + 3 ≤ 7'), 'hurufLain');
  assert.equal(k('x + 4 ≤ 7'), 'salah');
  const ketat = (isian) =>
    E.periksaSoalBatas(isian, { cek: { kalimat: '2x + 1 < 9', minta: 'kalimat' } }).kode;
  assert.equal(ketat('2x + 1 ≤ 9'), 'batasTidakTermasuk');
  assert.equal(ketat('2x + 1 > 9'), 'tandaTerbalik');
  const tepat = (isian) =>
    E.periksaSoalBatas(isian, { cek: { kalimat: 'x + 2 = 6', minta: 'kalimat' } }).kode;
  assert.equal(tepat('x + 2 ≤ 6'), 'bukanBatas');
  assert.equal(tepat('x + 2 = 6'), 'benar');
  /* pesan selalu ada */
  ['x + 3', 'x + 3 = 7', 'x + 3 ≥ 7', 'x + 3 < 7', 'x + 4 ≤ 7'].forEach((i) =>
    assert.ok(E.periksaSoalBatas(i, { cek: c }).pesan, i)
  );
});

test('diagnosa himpunan & banyak penyelesaian', () => {
  const c = { kalimat: 'x + 3 ≤ 7', semesta: [1, 8], minta: 'himpunan' };
  const h = (isian) => E.periksaSoalBatas(isian, { cek: c });
  assert.equal(h('1, 2, 3, 4').kode, 'benar');
  assert.equal(h('{4,3,2,1}').kode, 'benar');
  assert.equal(h('1, 2, 3').kode, 'batasTermasuk');
  assert.equal(h('4').kode, 'satuNilai');
  assert.equal(h('5, 6, 7, 8').kode, 'tandaTerbalik');
  assert.equal(h('4, 5, 6, 7, 8').kode, 'tandaTerbalik');
  const salah = h('1, 2, 3, 4, 5');
  assert.equal(salah.kode, 'salah');
  assert.match(salah.pesan, /x = 5/);
  assert.equal(h('').kode, 'kosong');
  assert.equal(h('satu').kode, 'format');
  const ketat = { kalimat: '2x + 1 < 9', semesta: [1, 8], minta: 'himpunan' };
  assert.equal(E.periksaSoalBatas('1, 2, 3, 4', { cek: ketat }).kode, 'batasTidakTermasuk');
  const b = (isian) =>
    E.periksaSoalBatas(isian, { cek: { kalimat: 'x + 3 ≤ 7', semesta: [1, 8], minta: 'banyak' } })
      .kode;
  assert.equal(b('4'), 'benar');
  assert.equal(b('3'), 'batasTermasuk');
  assert.equal(b('1'), 'satuNilai');
  assert.equal(b('9'), 'salah');
  assert.equal(b('dua'), 'format');
});

test('diagnosa pilihan jenis & tanda', () => {
  const j = (kalimat, isian) =>
    E.periksaSoalBatas(isian, { cek: { kalimat, minta: 'jenisBatas' } }).kode;
  assert.equal(j('x + 3 ≤ 7', 'ptlsv'), 'benar');
  assert.equal(j('x + 3 ≤ 7', 'plsv'), 'bukanSamaDengan');
  assert.equal(j('x + 2 = 6', 'ptlsv'), 'adaSamaDengan');
  assert.equal(j('x + 2 = 6', 'bukanKeduanya'), 'sudahLinear');
  assert.equal(j('a + b < 7', 'ptlsv'), 'duaVariabel');
  assert.equal(j('k² ≥ 4', 'ptlsv'), 'pangkatDua');
  assert.equal(j('k ≠ 4', 'ptlsv'), 'tidakSama');
  assert.equal(j('5 > 2', 'ptlsv'), 'tanpaVariabel');
  assert.equal(j('x + 3 ≤ 7', ''), 'kosong');
  const t = (frasa, isian) => E.periksaSoalBatas(isian, { cek: { frasa, minta: 'tanda' } }).kode;
  assert.equal(t('paling banyak', 'kurangSama'), 'benar');
  assert.equal(t('paling banyak', 'lebihSama'), 'tandaTerbalik');
  assert.equal(t('paling banyak', 'kurang'), 'batasTermasuk');
  assert.equal(t('kurang dari', 'kurangSama'), 'batasTidakTermasuk');
  assert.equal(t('minimal', 'sama'), 'pakaiSamaDengan');
  assert.equal(t('tepat', 'kurangSama'), 'bukanBatas');
  const m = (nilai, isian) =>
    E.periksaSoalBatas(isian, { cek: { kalimat: 'x + 3 ≤ 7', nilai, minta: 'memenuhi' } });
  assert.equal(m(4, 'ya').kode, 'benar');
  assert.equal(m(5, 'ya').kode, 'salah');
  assert.match(m(5, 'ya').pesan, /8 ≤ 7/);
});

test('opsiSoalBatas: baku pertama, label unik, umpan diagnosa', () => {
  const cek = (soal) => {
    const o = E.opsiSoalBatas(soal);
    assert.equal(o[0].id, 'baku');
    assert.ok(o.length >= 3, JSON.stringify(soal.cek));
    assert.equal(new Set(o.map((x) => x.label)).size, o.length);
    assert.equal(new Set(o.map((x) => x.id)).size, o.length);
    o.forEach((x) => assert.ok(x.umpan, x.id));
    assert.equal(
      E.periksaSoalBatas(
        soal.cek.minta === 'kalimat' || soal.cek.minta === 'himpunan'
          ? o[0].label
          : E.nilaiSoalBatas(soal.cek),
        soal
      ).benar,
      true
    );
    o.slice(1).forEach((x) => {
      const isian = soal.cek.minta === 'kalimat' || soal.cek.minta === 'himpunan' ? x.label : x.id;
      assert.equal(E.periksaSoalBatas(isian, soal).benar, false, x.label);
    });
    return o;
  };
  const k = cek({ cek: { kalimat: 'x + 3 ≤ 7', minta: 'kalimat' } });
  assert.equal(k[0].label, 'x + 3 ≤ 7');
  assert.ok(k.some((x) => x.label === 'x + 3 ≥ 7'));
  assert.ok(k.some((x) => x.label === 'x + 3 = 7'));
  cek({ cek: { kalimat: '2x + 1 < 9', minta: 'kalimat' } });
  cek({ cek: { kalimat: 'x + 3 ≤ 7', minta: 'jenisBatas' } });
  cek({ cek: { frasa: 'sekurang-kurangnya', minta: 'tanda' } });
  const h = cek({ cek: { kalimat: 'x + 3 ≤ 7', semesta: [1, 8], minta: 'himpunan' } });
  assert.ok(h.some((x) => x.label === '{1, 2, 3}'));
  cek({ cek: { kalimat: '2x ≥ 6', semesta: [1, 8], minta: 'himpunan' } });
});

test('buildGarisBatas: titik uji & penyelesaian dengan bulatan penuh/kosong', () => {
  const uji = E.buildGarisBatas({
    min: 1,
    max: 8,
    uji: [
      { x: 2, benar: true },
      { x: 6, benar: false },
    ],
  });
  assert.match(uji, /<svg[^>]*class="garis-batas"/);
  assert.match(uji, /role="img"/);
  assert.equal((uji.match(/garis-batas__tick"/g) || []).length, 8);
  assert.match(uji, /is-ya/);
  assert.match(uji, /is-tidak/);
  assert.match(uji, /2 memenuhi/);
  const penuh = E.buildGarisBatas({ min: 0, max: 8, kalimat: 'x + 3 ≤ 7' });
  assert.match(penuh, /garis-batas__batas is-penuh/);
  assert.match(penuh, /garis-batas__sinar/);
  assert.match(penuh, /x ≤ 4/);
  const kosong = E.buildGarisBatas({ min: 0, max: 8, kalimat: '2x + 1 < 9' });
  assert.match(kosong, /is-kosong/);
  const satu = E.buildGarisBatas({ min: 0, max: 8, kalimat: 'x + 2 = 6' });
  assert.match(satu, /is-penuh/);
  assert.doesNotMatch(satu, /garis-batas__sinar/);
});

const LAB = {
  huruf: 'x',
  min: 1,
  max: 8,
  minUji: 3,
  situasi: [
    {
      id: 'sOleh',
      judul: 'Paket oleh-oleh',
      cerita: 'tepat 6 kg',
      frasa: 'tepat',
      kiri: { x: 1, lepas: 2 },
      kanan: { lepas: 6 },
      rel: '=',
    },
    {
      id: 'sTas',
      judul: 'Tas ransel',
      cerita: 'paling banyak 7 kg',
      frasa: 'paling banyak',
      kiri: { x: 1, lepas: 3 },
      kanan: { lepas: 7 },
      rel: '≤',
    },
  ],
};

test('Lab Batas: kalimat situasi, tulis, uji, uji semua, lengkap', () => {
  assert.equal(E.kalimatSituasiBatas(LAB, LAB.situasi[1]), 'x + 3 ≤ 7');
  assert.equal(E.kalimatSituasiBatas(LAB, LAB.situasi[0]), 'x + 2 = 6');
  const st = E.ensureLabBatas({}, LAB);
  assert.equal(st.aktif, 'sOleh');
  assert.equal(st.x, 1);
  assert.equal(E.ujiLabBatas(st, LAB).kode, 'belumKalimat');
  assert.equal(E.ubahLabBatas(st, LAB, 1), false, 'stepper terkunci sebelum menulis');
  assert.equal(E.tulisKalimatLabBatas(st, LAB, '').kode, 'kosong');
  assert.equal(E.tulisKalimatLabBatas(st, LAB, 'x + 2 ≤ 6').kode, 'bukanBatas');
  assert.equal(st.catat.sOleh.attempts, 1);
  assert.equal(E.tulisKalimatLabBatas(st, LAB, 'x+2=6').benar, true);
  assert.equal(st.catat.sOleh.kalimat, 'x + 2 = 6');
  const r1 = E.ujiLabBatas(st, LAB);
  assert.equal(r1.benar, false);
  assert.match(r1.pesan, /tidak memenuhi/);
  E.ujiLabBatas(st, LAB);
  assert.equal(st.catat.sOleh.uji.length, 1, 'nilai sama dicatat sekali');
  assert.equal(E.ujiSemuaLabBatas(st, LAB), false, 'uji semua perlu minUji uji manual');
  E.ubahLabBatas(st, LAB, 1);
  E.ujiLabBatas(st, LAB);
  E.ubahLabBatas(st, LAB, 1);
  E.ubahLabBatas(st, LAB, 1);
  assert.equal(E.ujiLabBatas(st, LAB).benar, true);
  assert.equal(E.ujiSemuaLabBatas(st, LAB), true);
  assert.equal(st.catat.sOleh.uji.length, 8);
  assert.deepEqual(
    arr(st.catat.sOleh.uji.filter((u) => u.benar).map((u) => u.x)),
    [4],
    'uji terurut & hanya 4 memenuhi'
  );
  assert.equal(E.situasiBatasLengkap(st, LAB, 'sOleh'), true);
  assert.equal(E.labBatasLengkap(st, LAB), false);
  assert.equal(E.pilihSituasiLabBatas(st, LAB, 'sTas'), true);
  assert.equal(st.x, 1);
  E.tulisKalimatLabBatas(st, LAB, '7 ≥ x + 3');
  assert.equal(st.catat.sTas.kalimat, 'x + 3 ≤ 7', 'kalimat dicatat dalam bentuk baku');
  [1, 5, 4].forEach((v) => {
    st.x = v;
    E.ujiLabBatas(st, LAB);
  });
  E.ujiSemuaLabBatas(st, LAB);
  assert.equal(E.labBatasLengkap(st, LAB), true);
  /* state rusak dipulihkan */
  const rusak = E.ensureLabBatas({ aktif: 'zz', x: 99, catat: { sTas: 5 } }, LAB);
  assert.equal(rusak.aktif, 'sOleh');
  assert.equal(rusak.x, 1);
  assert.ok(Array.isArray(rusak.catat.sTas.uji));
});

test('buildLabBatas & buildTabelLabBatas merender keadaan', () => {
  const st = E.ensureLabBatas({}, LAB);
  let html = E.buildLabBatas('lb', st, LAB);
  assert.match(html, /id="lbKalimatInput"/);
  assert.match(html, /neraca-svg/);
  assert.match(html, /garis-batas/);
  E.tulisKalimatLabBatas(st, LAB, 'x + 2 = 6');
  html = E.buildLabBatas('lb', st, LAB);
  assert.match(html, /id="lbUji"/);
  assert.doesNotMatch(html, /id="lbUjiSemua"/);
  [1, 2, 3].forEach((v) => {
    st.x = v;
    E.ujiLabBatas(st, LAB);
  });
  html = E.buildLabBatas('lb', st, LAB);
  assert.match(html, /id="lbUjiSemua"/);
  E.ujiSemuaLabBatas(st, LAB);
  const tabel = E.buildTabelLabBatas(st, LAB);
  assert.match(tabel, /\{4\}/);
  assert.match(tabel, /Paket oleh-oleh/);
  assert.match(tabel, /tepat/);
});
