'use strict';

/*
 * Tes engine seksi 79 (Penyajian data kategorik: tabel frekuensi &
 * diagram batang): menghitung frekuensi & turus, skala sumbu tegak yang
 * tepat (langkah rapi, banyak garis bantu, puncak sumbu), diagnosa
 * miskonsepsi isian, opsi berpengecoh, diagnosa tinggi batang, gambar
 * turus & diagram batang SVG (termasuk diagram berskala menyesatkan),
 * serta logika Lab Turus dan Lab Diagram Batang.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

const KAT = [
  { id: 'cilok', label: 'Cilok', ikon: '🍢' },
  { id: 'bakso', label: 'Bakso', ikon: '🍲' },
  { id: 'roti', label: 'Roti', ikon: '🍞' },
];
const FREK = { cilok: 9, bakso: 7, roti: 3 };

function plain(o) {
  return JSON.parse(JSON.stringify(o));
}

test('hitungFrekuensi, totalFrekuensi, terbanyak & tersedikit', () => {
  const data = ['cilok', 'bakso', 'cilok', 'roti', 'cilok', 'lain'];
  assert.deepEqual(plain(E.hitungFrekuensi(data, KAT)), { cilok: 3, bakso: 1, roti: 1 });
  const obj = data.map((v, i) => ({ id: 'd' + i, nilai: v }));
  assert.deepEqual(plain(E.hitungFrekuensi(obj, KAT)), { cilok: 3, bakso: 1, roti: 1 });
  assert.equal(E.totalFrekuensi(FREK), 19);
  assert.equal(E.totalFrekuensi({}), 0);
  assert.deepEqual([...E.kategoriTerbanyak(FREK, KAT)], ['cilok']);
  assert.deepEqual([...E.kategoriTersedikit(FREK, KAT)], ['roti']);
  assert.deepEqual(
    [...E.kategoriTerbanyak({ cilok: 4, bakso: 4, roti: 1 }, KAT)],
    ['cilok', 'bakso']
  );
});

test('turusGrup & buildTurus: kelompok lima (empat tegak + satu miring)', () => {
  assert.deepEqual(plain(E.turusGrup(13)), { lima: 2, sisa: 3 });
  assert.deepEqual(plain(E.turusGrup(0)), { lima: 0, sisa: 0 });
  const svg = E.buildTurus(13);
  assert.match(svg, /<svg/);
  assert.match(svg, /role="img"/);
  assert.match(svg, /aria-label="turus 13"/);
  assert.equal((svg.match(/dtk-turus__miring/g) || []).length, 2);
  assert.equal((svg.match(/dtk-turus__garis/g) || []).length, 2 * 4 + 3);
  assert.match(E.buildTurus(0), /tidak ada turus/);
});

test('langkah rapi, banyak garis bantu & puncak sumbu', () => {
  [1, 2, 5, 10, 20, 25, 50, 100].forEach((l) => assert.equal(E.langkahRapi(l), true, l));
  [0, 3, 4, 6, 7, 15, 2.5, -2].forEach((l) => assert.equal(E.langkahRapi(l), false, l));
  assert.equal(E.banyakGarisSkala(48, 5), 10);
  assert.equal(E.banyakGarisSkala(48, 10), 5);
  assert.equal(E.banyakGarisSkala(9, 2), 5);
  assert.equal(E.banyakGarisSkala(0, 2), 1);
  assert.equal(E.puncakSumbu(48, 5), 50);
  assert.equal(E.puncakSumbu(48, 10), 50);
  assert.equal(E.puncakSumbu(9, 2), 10);
  assert.equal(E.puncakSumbu(14, 2), 14);
});

test('skalaDisarankan & diagnosaSkala', () => {
  assert.equal(E.skalaDisarankan(9), 1);
  assert.equal(E.skalaDisarankan(3), 1);
  assert.equal(E.skalaDisarankan(14), 2);
  assert.equal(E.skalaDisarankan(48), 5);
  assert.equal(E.skalaDisarankan(64), 10);
  assert.equal(E.skalaDisarankan(240), 25);
  for (let max = 1; max <= 500; max++) {
    const l = E.skalaDisarankan(max);
    assert.ok(E.langkahRapi(l));
    assert.ok(E.banyakGarisSkala(max, l) <= E.DTK_GARIS_MAX, 'max ' + max);
    assert.equal(E.diagnosaSkala(max, l).benar, true, 'disarankan selalu tepat ' + max);
  }
  assert.equal(E.diagnosaSkala(48, 5).kode, 'benar');
  assert.equal(E.diagnosaSkala(48, 10).kode, 'benar');
  assert.equal(E.diagnosaSkala(48, 1).kode, 'skala-terlalu-rapat');
  assert.equal(E.diagnosaSkala(48, 2).kode, 'skala-terlalu-rapat');
  assert.equal(E.diagnosaSkala(48, 20).kode, 'skala-terlalu-renggang');
  assert.equal(E.diagnosaSkala(48, 6).kode, 'skala-tidak-rapi');
  assert.equal(E.diagnosaSkala(48, 0).kode, 'skala-tidak-rapi');
  assert.equal(E.diagnosaSkala(9, 1).kode, 'benar');
  assert.equal(E.diagnosaSkala(9, 2).kode, 'benar');
  assert.equal(E.diagnosaSkala(3, 1).kode, 'benar', 'langkah 1 tepat untuk data kecil');
  assert.equal(E.diagnosaSkala(9, 5).kode, 'skala-terlalu-renggang');
  assert.equal(E.skalaTepat(48, 5), true);
  assert.equal(E.skalaTepat(48, 2), false);
  assert.deepEqual([...E.langkahSkalaTepat(48)], [5, 10]);
  assert.deepEqual([...E.langkahSkalaTepat(9)], [1, 2]);
  Object.keys(E.DTK_PESAN).forEach((k) => assert.ok(E.DTK_PESAN[k], k));
  ['skala-tidak-rapi', 'skala-terlalu-rapat', 'skala-terlalu-renggang'].forEach((k) =>
    assert.ok(E.DTK_PESAN[k])
  );
});

test('nilaiSkalaSumbu: tepat hanya bila mulai 0, interval sama & langkah tepat', () => {
  assert.equal(E.nilaiSkalaSumbu({ max: 48, langkah: 5 }), 'tepat');
  assert.equal(E.nilaiSkalaSumbu({ max: 14, langkah: 2 }), 'tepat');
  assert.equal(E.nilaiSkalaSumbu({ max: 48, langkah: 5, mulai: 15 }), 'tidak');
  assert.equal(E.nilaiSkalaSumbu({ max: 48, langkah: 5, intervalSama: false }), 'tidak');
  assert.equal(E.nilaiSkalaSumbu({ max: 48, langkah: 1 }), 'tidak');
  assert.equal(E.nilaiSkalaSumbu({ max: 48, langkah: 7 }), 'tidak');
});

test('nilaiSoalData & periksaSoalData: kunci dan diagnosa miskonsepsi', () => {
  const s = (cek) => ({ cek });
  const data = ['cilok', 'bakso', 'cilok', 'roti', 'cilok'];
  const fq = { minta: 'frekuensi', data, kategori: KAT, kat: 'cilok' };
  assert.equal(E.nilaiSoalData(fq), 3);
  assert.equal(E.periksaSoalData('3', s(fq)).benar, true);
  assert.equal(E.periksaSoalData('5', s(fq)).kode, 'frekuensi-semua-data');
  assert.equal(E.periksaSoalData('', s(fq)).kode, 'kosong');
  assert.equal(E.periksaSoalData('tiga', s(fq)).kode, 'format');
  assert.equal(E.periksaSoalData('-3', s(fq)).kode, 'format');

  const tot = { minta: 'total', frek: FREK, kategori: KAT };
  assert.equal(E.nilaiSoalData(tot), 19);
  assert.equal(E.periksaSoalData('3', s(tot)).kode, 'total-banyak-kategori');
  assert.equal(E.periksaSoalData('9', s(tot)).kode, 'total-terbesar');
  assert.equal(E.periksaSoalData('20', s(tot)).kode, 'salah');

  const tr = { minta: 'turus', n: 13 };
  assert.equal(E.periksaSoalData('13', s(tr)).benar, true);
  assert.equal(E.periksaSoalData('11', s(tr)).kode, 'turus-lupa-miring');
  assert.equal(E.periksaSoalData('5', s(tr)).kode, 'turus-kelompok-satu');

  const pc = { minta: 'puncak', max: 48, langkah: 5 };
  assert.equal(E.nilaiSoalData(pc), 50);
  assert.equal(E.periksaSoalData('48', s(pc)).kode, 'puncak-nilai-maks');
  assert.equal(E.periksaSoalData('10', s(pc)).kode, 'puncak-banyak-garis');

  const gr = { minta: 'garis', max: 48, langkah: 5 };
  assert.equal(E.nilaiSoalData(gr), 10);
  assert.equal(E.periksaSoalData('50', s(gr)).kode, 'garis-puncak');
  assert.equal(E.periksaSoalData('48', s(gr)).kode, 'garis-nilai-maks');

  const bc = { minta: 'baca', frek: { a: 14, b: 7, c: 10 }, kategori: KAT, langkah: 2, kat: 'b' };
  assert.equal(E.nilaiSoalData(bc), 7);
  assert.equal(E.periksaSoalData('6', s(bc)).kode, 'baca-garis-terdekat');
  assert.equal(E.periksaSoalData('8', s(bc)).kode, 'baca-garis-terdekat');
  assert.equal(E.periksaSoalData('14', s(bc)).kode, 'baca-tertukar');
  const bk = Object.assign({}, bc, { kat: 'a' });
  assert.equal(E.periksaSoalData('7', s(bk)).kode, 'baca-kotak');

  const sl = {
    minta: 'selisih',
    frek: { a: 14, b: 6, c: 10 },
    kategori: KAT,
    langkah: 2,
    a: 'a',
    b: 'b',
  };
  assert.equal(E.nilaiSoalData(sl), 8);
  assert.equal(E.periksaSoalData('20', s(sl)).kode, 'selisih-dijumlah');
  assert.equal(E.periksaSoalData('14', s(sl)).kode, 'selisih-satu-nilai');
  assert.equal(E.periksaSoalData('4', s(sl)).kode, 'baca-kotak');

  const sk = { minta: 'skala', max: 48 };
  assert.equal(E.nilaiSoalData(sk), 5);
  assert.equal(E.periksaSoalData('10', s(sk)).benar, true, 'langkah tepat lain diterima');
  assert.equal(E.periksaSoalData('2', s(sk)).kode, 'skala-terlalu-rapat');
  assert.equal(E.periksaSoalData('6', s(sk)).kode, 'skala-tidak-rapi');
});

test('calonKeliruData tidak pernah sama dengan kunci', () => {
  const cases = [
    { minta: 'total', frek: { a: 1, b: 1, c: 1 }, kategori: KAT },
    { minta: 'turus', n: 4 },
    { minta: 'turus', n: 5 },
    { minta: 'puncak', max: 50, langkah: 5 },
    { minta: 'garis', max: 10, langkah: 1 },
    { minta: 'baca', frek: { a: 6, b: 6 }, kategori: KAT, langkah: 1, kat: 'a' },
    { minta: 'selisih', frek: { a: 6, b: 0 }, kategori: KAT, langkah: 1, a: 'a', b: 'b' },
  ];
  cases.forEach((c) => {
    const baku = E.nilaiSoalData(c);
    E.calonKeliruData(c).forEach((g) => assert.notEqual(g.nilai, baku, c.minta + ' ' + g.kode));
    assert.equal(E.diagnosaNilaiData(c, baku).benar, true, c.minta);
  });
});

test('jawabSoalData & opsiSoalData: opsi unik, tepat satu baku, pengecoh berumpan', () => {
  const sk = { cek: { minta: 'skala', max: 48 } };
  assert.equal(E.jawabSoalData(sk), '5');
  [9, 14, 27, 48, 64, 85, 240].forEach((max) => {
    const s = { cek: { minta: 'skala', max } };
    const o = E.opsiSoalData(s);
    assert.ok(o.length >= 4, 'skala ' + max + ': minimal 4 opsi');
    assert.equal(o[0].id, 'baku');
    assert.equal(new Set(o.map((x) => x.id)).size, o.length);
    assert.equal(new Set(o.map((x) => x.label)).size, o.length);
    assert.equal(o[0].nilai, E.skalaDisarankan(max));
    o.slice(1).forEach((x) => {
      assert.equal(E.skalaTepat(max, x.nilai), false, max + ': pengecoh ' + x.nilai);
      assert.ok(x.umpan, 'umpan');
    });
  });

  const tb = { cek: { minta: 'terbanyak', frek: FREK, kategori: KAT } };
  assert.equal(E.nilaiSoalData(tb.cek), 'cilok');
  assert.equal(E.jawabSoalData(tb), 'Cilok');
  const ot = E.opsiSoalData(tb);
  assert.equal(ot.length, 3);
  assert.equal(ot[0].label, 'Cilok');
  assert.match(ot.find((x) => x.label === 'Roti').umpan, /terpendek|terkecil/);

  const cc = { cek: { minta: 'cacat', frek: FREK, kategori: KAT, cacat: 'mulaiBukanNol' } };
  assert.equal(E.nilaiSoalData(cc.cek), 'mulaiBukanNol');
  const oc = E.opsiSoalData(cc);
  assert.equal(oc.length, E.DTK_CACAT.length);
  assert.equal(oc[0].label, E.DTK_CACAT.find((c) => c.id === 'mulaiBukanNol').label);
  oc.forEach((x) => assert.ok(x.umpan));
  assert.equal(E.jawabSoalData(cc), oc[0].label);
});

test('diagnosaBatang: tinggi batang pada diagram buatan murid', () => {
  const f = { a: 14, b: 7, c: 10 };
  assert.equal(E.diagnosaBatang(f, 'b', 7, 2).kode, 'benar');
  assert.equal(E.diagnosaBatang(f, 'b', 0, 2).kode, 'batang-kosong');
  assert.equal(E.diagnosaBatang(f, 'b', 14, 2).kode, 'batang-kotak');
  assert.equal(E.diagnosaBatang(f, 'a', 7, 2).kode, 'batang-kotak');
  assert.equal(E.diagnosaBatang(f, 'b', 10, 2).kode, 'batang-tertukar');
  assert.equal(E.diagnosaBatang(f, 'b', 8, 2).kode, 'batang-dekat');
  assert.equal(E.diagnosaBatang(f, 'b', 3, 2).kode, 'batang-salah');
});

test('buildTabelFrekuensi: kategori, turus, frekuensi & jumlah', () => {
  const html = E.buildTabelFrekuensi(KAT, FREK, {
    turus: true,
    caption: 'Jajanan <kesukaan>',
    judulKategori: 'Jajanan',
  });
  assert.match(html, /<table/);
  assert.match(html, /Jajanan &lt;kesukaan&gt;/);
  assert.match(html, /<th scope="col">Turus<\/th>/);
  assert.match(html, /Jumlah/);
  assert.match(html, />19</);
  assert.equal((html.match(/aria-label="turus/g) || []).length, 3);
  assert.doesNotMatch(E.buildTabelFrekuensi(KAT, FREK), /Turus/);
});

test('buildDiagramBatangSVG: skala, batang, judul, dan diagram menyesatkan', () => {
  const svg = E.buildDiagramBatangSVG(KAT, FREK, {
    langkah: 2,
    judul: 'Jajanan Kesukaan',
    labelX: 'Jenis jajanan',
    labelY: 'Banyak murid',
  });
  assert.match(svg, /role="img"/);
  assert.match(svg, /Jajanan Kesukaan/);
  assert.match(svg, /Banyak murid/);
  assert.equal((svg.match(/class="dtk-bar[ "]/g) || []).length, 3);
  /* sumbu 0, 2, …, 10 → 6 label angka */
  assert.equal((svg.match(/class="dtk-ytick"/g) || []).length, 6);
  assert.match(svg, />0<\/text>/);
  assert.match(svg, />10<\/text>/);

  const nol = E.buildDiagramBatangSVG(KAT, FREK, { langkah: 1, cacat: 'mulaiBukanNol' });
  assert.doesNotMatch(nol, /class="dtk-ytick"[^>]*>0<\/text>/);
  const tj = E.buildDiagramBatangSVG(KAT, FREK, { judul: 'X', cacat: 'tanpaJudul' });
  assert.doesNotMatch(tj, /dtk-judul/);
  const lb = E.buildDiagramBatangSVG(KAT, FREK, { cacat: 'lebarBeda' });
  const lebar = new Set(
    (lb.match(/class="dtk-bar[^"]*"[^>]*width="([\d.]+)"/g) || []).map(
      (m) => m.match(/width="([\d.]+)"/)[1]
    )
  );
  assert.ok(lebar.size > 1, 'lebar batang berbeda-beda');
  const it = E.buildDiagramBatangSVG(KAT, FREK, { langkah: 1, cacat: 'intervalTakSama' });
  assert.match(it, /class="dtk-ytick"/);

  const inter = E.buildDiagramBatangSVG(KAT, FREK, {
    langkah: 2,
    tinggi: { cilok: 4, bakso: 0, roti: 0 },
    interaktif: 'lb',
  });
  assert.equal((inter.match(/data-dtk-kolom=/g) || []).length, 3);
  assert.match(inter, /data-dtk-plot=/);
});

function cfgTurus() {
  const nilai = ['cilok', 'bakso', 'cilok', 'roti', 'cilok', 'bakso', 'cilok', 'cilok'];
  return {
    data: nilai.map((v, i) => ({ id: 'd' + i, nama: 'Murid ' + i, nilai: v })),
    kategori: KAT,
    percepatSetelah: 3,
    judulKategori: 'Jajanan',
  };
}

test('Lab Turus: kartu acak, menurus, percepat, isian berdiagnosa', () => {
  const cfg = cfgTurus();
  const S = {};
  const st = E.ensureLabTurus(S, 'lt', cfg);
  assert.equal(st.urut.length, 8);
  assert.deepEqual([...st.urut].sort(), cfg.data.map((d) => d.id).sort());
  assert.deepEqual([...st.katOrder].sort(), ['bakso', 'cilok', 'roti']);
  assert.equal(st.idx, 0);
  assert.equal(E.ensureLabTurus(S, 'lt', cfg), st, 'state lama dipakai ulang');

  const kartu = E.labTurusKartu(st, cfg);
  const salah = KAT.map((k) => k.id).find((k) => k !== kartu.nilai);
  assert.equal(E.turuskanKartu(st, cfg, salah).benar, false);
  assert.equal(st.idx, 0);
  assert.equal(st.salahTurus, 1);
  assert.ok(st.umpan);
  assert.equal(E.turuskanKartu(st, cfg, kartu.nilai).benar, true);
  assert.equal(st.idx, 1);
  assert.equal(st.umpan, null);

  assert.equal(E.percepatTurus(st, cfg), false, 'belum boleh dipercepat');
  for (let i = 0; i < 2; i++) E.turuskanKartu(st, cfg, E.labTurusKartu(st, cfg).nilai);
  assert.equal(E.percepatTurus(st, cfg), true);
  assert.equal(E.labTurusTertally(st, cfg), true);
  assert.deepEqual(plain(st.turus), { cilok: 5, bakso: 2, roti: 1 });

  st.isian = { cilok: '4', bakso: '2', roti: '', total: '' };
  assert.equal(E.periksaIsianTurus(st, cfg).kode, 'kosong');
  st.isian = { cilok: '4', bakso: '2', roti: '1', total: '3' };
  const r = E.periksaIsianTurus(st, cfg);
  assert.equal(r.semuaBenar, false);
  assert.equal(st.hasil.cilok, 'turus-lupa-miring');
  assert.equal(st.hasil.bakso, 'benar');
  assert.equal(st.hasil.total, 'total-banyak-kategori');
  assert.equal(E.labTurusLengkap(st, cfg), false);
  st.isian = { cilok: '5', bakso: '2', roti: '1', total: '8' };
  assert.equal(E.periksaIsianTurus(st, cfg).semuaBenar, true);
  assert.equal(E.labTurusLengkap(st, cfg), true);
  assert.deepEqual(plain(E.frekuensiLabTurus(st, cfg)), { cilok: 5, bakso: 2, roti: 1 });
  assert.equal(st.percobaan, 2);
  assert.equal(st.salah, 1);

  const html = E.buildLabTurus('lt', st, cfg);
  assert.match(html, /id="lt"/);
  assert.match(html, /<table/);
});

test('Lab Turus: HTML kartu aktif & tombol baris', () => {
  const cfg = cfgTurus();
  const st = E.ensureLabTurus({}, 'lt', cfg);
  const html = E.buildLabTurus('lt', st, cfg);
  assert.match(html, /Kartu 1 dari 8/);
  assert.equal((html.match(/data-dtk-turus=/g) || []).length, 3);
  assert.doesNotMatch(html, /data-dtk-percepat/);
});

function cfgBatang() {
  return {
    kategori: KAT,
    frek: { cilok: 14, bakso: 7, roti: 10 },
    langkahOpsi: [1, 2, 5, 7],
    kelengkapan: [
      {
        id: 'judul',
        tanya: 'Judul?',
        opsi: [
          { id: 'baku', label: 'Jajanan Kesukaan' },
          { id: 'x', label: 'Diagram' },
          { id: 'y', label: 'Kantin' },
        ],
        correct: 'baku',
      },
      {
        id: 'labelY',
        tanya: 'Sumbu tegak?',
        opsi: [
          { id: 'baku', label: 'Banyak murid' },
          { id: 'x', label: 'Jenis jajanan' },
          { id: 'y', label: 'Harga' },
        ],
        correct: 'baku',
      },
    ],
  };
}

test('Lab Diagram Batang: pilih skala, kelengkapan, atur & periksa batang', () => {
  const cfg = cfgBatang();
  const S = {};
  const st = E.ensureLabBatang(S, 'lb', cfg);
  assert.equal(st.langkahOrder.length, 4);
  assert.equal(st.langkah, null);
  assert.deepEqual(Object.keys(st.kelOrders).sort(), ['judul', 'labelY']);

  assert.equal(E.pilihSkalaLab(st, cfg, 1).kode, 'skala-terlalu-rapat');
  assert.equal(st.langkah, null);
  assert.equal(E.pilihSkalaLab(st, cfg, 7).kode, 'skala-tidak-rapi');
  assert.equal(E.pilihSkalaLab(st, cfg, 2).benar, true);
  assert.equal(st.langkah, 2);
  assert.equal(st.salahSkala, 2);

  assert.equal(E.pilihKelengkapanLab(st, cfg, 'judul', 'x'), false);
  assert.equal(E.pilihKelengkapanLab(st, cfg, 'judul', 'baku'), true);
  assert.equal(E.pilihKelengkapanLab(st, cfg, 'labelY', 'baku'), true);

  E.aturTinggiLab(st, cfg, 'cilok', 7);
  E.aturTinggiLab(st, cfg, 'bakso', 7);
  E.aturTinggiLab(st, cfg, 'roti', 99);
  assert.equal(st.tinggi.roti, 14, 'dibatasi puncak sumbu');
  E.aturTinggiLab(st, cfg, 'roti', -3);
  assert.equal(st.tinggi.roti, 0);
  E.aturTinggiLab(st, cfg, 'roti', 10);
  let r = E.periksaBatangLab(st, cfg);
  assert.equal(r.semuaBenar, false);
  assert.equal(st.hasil.cilok, 'batang-kotak');
  assert.equal(st.hasil.bakso, 'benar');
  assert.equal(E.labBatangSelesai(st, cfg), false);
  E.aturTinggiLab(st, cfg, 'cilok', 14);
  r = E.periksaBatangLab(st, cfg);
  assert.equal(r.semuaBenar, true);
  assert.equal(E.labBatangSelesai(st, cfg), true);
  assert.equal(st.percobaan, 2);
  assert.equal(st.salah, 1);

  const html = E.buildLabBatang('lb', st, cfg);
  assert.match(html, /id="lb"/);
  assert.match(html, /Jajanan Kesukaan/);
});

test('Lab Diagram Batang: sebelum skala dipilih, batang belum bisa diatur', () => {
  const cfg = cfgBatang();
  const st = E.ensureLabBatang({}, 'lb', cfg);
  const html = E.buildLabBatang('lb', st, cfg);
  assert.equal((html.match(/data-dtk-skala=/g) || []).length, 4);
  assert.doesNotMatch(html, /data-dtk-tambah/);
  E.pilihSkalaLab(st, cfg, 2);
  const h2 = E.buildLabBatang('lb', st, cfg);
  assert.equal((h2.match(/data-dtk-tambah=/g) || []).length, 3);
  assert.equal((h2.match(/data-dtk-kurang=/g) || []).length, 3);
});

test('buildTabelFrekuensi: jumlah dapat disembunyikan untuk soal', () => {
  const html = E.buildTabelFrekuensi(KAT, FREK, { jumlah: false });
  assert.doesNotMatch(html, /Jumlah/);
  assert.doesNotMatch(html, />19</);
});

test('buildDiagramBatangSVG: sumbu tak bermula 0 tetap memuat frekuensi terbesar', () => {
  const kat = [
    { id: 'p', label: 'Pramuka' },
    { id: 't', label: 'Tari' },
  ];
  const svg = E.buildDiagramBatangSVG(
    kat,
    { p: 48, t: 18 },
    {
      langkah: 10,
      cacat: 'mulaiBukanNol',
      mulai: 15,
    }
  );
  assert.match(svg, />15<\/text>/);
  assert.match(svg, />55<\/text>/, 'puncak 15 + 4 × 10 ≥ 48');
});

function cfgSkala() {
  return {
    kategori: [
      { id: 'p', label: 'Pramuka' },
      { id: 'f', label: 'Futsal' },
      { id: 't', label: 'Tari' },
    ],
    frek: { p: 48, f: 36, t: 18 },
    langkahOpsi: [1, 2, 5, 10, 20],
    mulaiLain: 15,
    minCoba: 3,
  };
}

test('Lab Skala: menjelajah langkah & sumbu tak bermula 0', () => {
  const cfg = cfgSkala();
  const S = {};
  const st = E.ensureLabSkala(S, 'ls', cfg);
  assert.equal(st.langkah, 1);
  assert.equal(st.mulaiNol, true);
  assert.equal(E.labSkalaCukup(st, cfg), false);
  let html = E.buildLabSkala('ls', st, cfg);
  assert.equal((html.match(/data-dtk-coba=/g) || []).length, 5);
  assert.match(html, /data-dtk-mulai=/);
  assert.match(html, /48 garis bantu/);
  E.cobaSkalaLab(st, cfg, 5);
  E.cobaSkalaLab(st, cfg, 20);
  E.cobaSkalaLab(st, cfg, 7);
  assert.equal(st.langkah, 20, 'langkah di luar opsi diabaikan');
  assert.equal(E.labSkalaCukup(st, cfg), false, 'belum melihat sumbu tak bermula 0');
  E.aturMulaiLab(st, false);
  assert.equal(E.labSkalaCukup(st, cfg), true);
  html = E.buildLabSkala('ls', st, cfg);
  assert.match(html, />15<\/text>/);
  E.cobaSkalaLab(st, cfg, 5);
  E.aturMulaiLab(st, true);
  html = E.buildLabSkala('ls', st, cfg);
  assert.match(html, /10 garis bantu/);
  assert.match(html, /tepat/i);
});
