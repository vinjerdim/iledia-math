'use strict';

/*
 * Tes shared/engine.js seksi 84 (unsur-unsur lingkaran): sudut & titik
 * pada lingkaran, jenis ruas (jari-jari, diameter, tali busur), busur,
 * daerah (juring, tembereng), opsi & diagnosa miskonsepsi penamaan
 * unsur, soal isian jari-jari ↔ diameter, gambar SVG, serta Lab
 * Lingkaran (state, aksi, pengamatan, catatan, syarat selesai & markup).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function count(str, sub) {
  return str.split(sub).length - 1;
}

const O = { jarak: 0 };

test('UNSUR_LINGKARAN: tujuh unsur dengan id & label unik', () => {
  const ids = E.UNSUR_LINGKARAN.map((u) => u.id);
  assert.deepEqual(plain(ids), [
    'pusat',
    'jariJari',
    'diameter',
    'taliBusur',
    'busur',
    'juring',
    'tembereng',
  ]);
  assert.equal(new Set(E.UNSUR_LINGKARAN.map((u) => u.label)).size, 7);
  assert.equal(E.labelUnsurLingkaran('jariJari'), 'Jari-jari');
  assert.equal(E.labelUnsurLingkaran('taliBusur'), 'Tali busur');
  assert.equal(E.labelUnsurLingkaran('bukan'), 'Bukan unsur lingkaran');
});

test('normSudutLkr & rentangSudutLkr: sudut dinormalkan, rentang berlawanan jarum jam', () => {
  assert.equal(E.normSudutLkr(370), 10);
  assert.equal(E.normSudutLkr(-30), 330);
  assert.equal(E.normSudutLkr(360), 0);
  assert.equal(E.rentangSudutLkr(30, 150), 120);
  assert.equal(E.rentangSudutLkr(300, 60), 120);
  assert.equal(E.rentangSudutLkr(150, 30), 240);
  assert.equal(E.rentangSudutLkr(45, 45), 0);
});

test('jenisRuasLingkaran: jari-jari, diameter, tali busur, bukan, titik', () => {
  assert.equal(E.jenisRuasLingkaran(O, { sudut: 40 }), 'jariJari');
  assert.equal(E.jenisRuasLingkaran({ sudut: 40 }, O), 'jariJari');
  assert.equal(E.jenisRuasLingkaran({ sudut: 20 }, { sudut: 200 }), 'diameter');
  assert.equal(E.jenisRuasLingkaran({ sudut: 300 }, { sudut: 120 }), 'diameter');
  assert.equal(E.jenisRuasLingkaran({ sudut: 20 }, { sudut: 140 }), 'taliBusur');
  /* titik di dalam (bukan pusat) ke titik pada lingkaran → bukan unsur */
  assert.equal(E.jenisRuasLingkaran({ sudut: 20, jarak: 0.5 }, { sudut: 140 }), 'bukan');
  /* ruas melewati pusat tetapi satu ujung di dalam → bukan diameter */
  assert.equal(E.jenisRuasLingkaran({ sudut: 0, jarak: 0.5 }, { sudut: 180 }), 'bukan');
  assert.equal(E.jenisRuasLingkaran({ sudut: 60 }, { sudut: 420 }), 'titik');
  assert.equal(E.jenisRuasLingkaran(O, O), 'titik');
});

test('lewatPusatRuasLkr: hanya ruas yang memuat titik pusat', () => {
  assert.equal(E.lewatPusatRuasLkr({ sudut: 10 }, { sudut: 190 }), true);
  assert.equal(E.lewatPusatRuasLkr(O, { sudut: 190 }), true);
  assert.equal(E.lewatPusatRuasLkr({ sudut: 10 }, { sudut: 130 }), false);
  assert.equal(E.lewatPusatRuasLkr({ sudut: 0, jarak: 0.5 }, { sudut: 180 }), true);
  assert.equal(E.lewatPusatRuasLkr({ sudut: 0, jarak: 0.5 }, { sudut: 0 }), false);
});

test('panjangRuasLingkaran: jari-jari = r, diameter = 2r, tali busur < 2r (1 desimal)', () => {
  assert.equal(E.panjangRuasLingkaran(O, { sudut: 75 }, 10), 10);
  assert.equal(E.panjangRuasLingkaran({ sudut: 75 }, { sudut: 255 }, 10), 20);
  assert.equal(E.panjangRuasLingkaran({ sudut: 0 }, { sudut: 60 }, 10), 10);
  assert.equal(E.panjangRuasLingkaran({ sudut: 0 }, { sudut: 90 }, 10), 14.1);
  assert.equal(E.panjangRuasLingkaran({ sudut: 0 }, { sudut: 120 }, 10), 17.3);
  assert.equal(E.panjangRuasLingkaran({ sudut: 0, jarak: 0.5 }, { sudut: 180 }, 10), 15);
  for (let s = 15; s < 360; s += 15) {
    if (s === 180) continue;
    assert.ok(E.panjangRuasLingkaran({ sudut: 0 }, { sudut: s }, 10) < 20, 'tali ' + s);
  }
});

test('jenisBusurLingkaran: busur kecil, besar, setengah lingkaran', () => {
  assert.equal(E.jenisBusurLingkaran(30, 150), 'kecil');
  assert.equal(E.jenisBusurLingkaran(150, 30), 'besar');
  assert.equal(E.jenisBusurLingkaran(0, 180), 'setengah');
  assert.equal(E.jenisBusurLingkaran(300, 60), 'kecil');
});

test('jenisDaerahLingkaran: juring dibatasi 2 jari-jari, tembereng dibatasi tali busur', () => {
  assert.equal(E.jenisDaerahLingkaran({ batas: 'jariJari', a0: 30, a1: 120 }), 'juring');
  assert.equal(E.jenisDaerahLingkaran({ batas: 'jariJari', a0: 120, a1: 30 }), 'juring');
  assert.equal(E.jenisDaerahLingkaran({ batas: 'taliBusur', a0: 30, a1: 120 }), 'tembereng');
  assert.equal(E.jenisDaerahLingkaran({ batas: 'taliBusur', a0: 0, a1: 180 }), 'setengah');
  assert.equal(E.jenisDaerahLingkaran({ batas: 'jariJari', a0: 0, a1: 180 }), 'setengah');
});

test('jenisUnsurLingkaran: titik, ruas, busur, daerah', () => {
  assert.equal(E.jenisUnsurLingkaran({ tipe: 'titik', jarak: 0 }), 'pusat');
  assert.equal(E.jenisUnsurLingkaran({ tipe: 'titik', sudut: 30 }), 'bukan');
  assert.equal(E.jenisUnsurLingkaran({ tipe: 'ruas', u: O, v: { sudut: 10 } }), 'jariJari');
  assert.equal(
    E.jenisUnsurLingkaran({ tipe: 'ruas', u: { sudut: 10 }, v: { sudut: 100 } }),
    'taliBusur'
  );
  assert.equal(E.jenisUnsurLingkaran({ tipe: 'busur', a0: 10, a1: 100 }), 'busur');
  assert.equal(
    E.jenisUnsurLingkaran({ tipe: 'daerah', batas: 'taliBusur', a0: 10, a1: 100 }),
    'tembereng'
  );
  assert.equal(
    E.jenisUnsurLingkaran({ tipe: 'daerah', batas: 'jariJari', a0: 10, a1: 100 }),
    'juring'
  );
  assert.throws(() => E.jenisUnsurLingkaran({ tipe: 'aneh' }));
});

test('opsiUnsurLingkaran: empat opsi unik memuat kunci dan pengecoh sejenis', () => {
  E.UNSUR_LINGKARAN.forEach((u) => {
    const opsi = plain(E.opsiUnsurLingkaran(u.id));
    assert.equal(opsi.length, 4, u.id);
    assert.equal(new Set(opsi.map((o) => o.id)).size, 4, u.id + ': unik');
    assert.ok(
      opsi.some((o) => o.id === u.id),
      u.id + ': memuat kunci'
    );
    opsi.forEach((o) => assert.equal(o.label, E.labelUnsurLingkaran(o.id)));
  });
  const ids = (k) => E.opsiUnsurLingkaran(k).map((o) => o.id);
  assert.ok(ids('jariJari').includes('diameter'));
  assert.ok(ids('juring').includes('tembereng'));
  assert.ok(ids('busur').includes('taliBusur'));
});

test('diagnosaUnsurLingkaran: kode miskonsepsi', () => {
  const d = E.diagnosaUnsurLingkaran;
  assert.equal(d('jariJari', 'jariJari'), 'benar');
  assert.equal(d('jariJari', 'diameter'), 'jariDiameter');
  assert.equal(d('diameter', 'jariJari'), 'jariDiameter');
  assert.equal(d('diameter', 'taliBusur'), 'kurangKhusus');
  assert.equal(d('taliBusur', 'diameter'), 'taliBukanDiameter');
  assert.equal(d('busur', 'taliBusur'), 'busurTali');
  assert.equal(d('taliBusur', 'busur'), 'busurTali');
  assert.equal(d('juring', 'tembereng'), 'juringTembereng');
  assert.equal(d('tembereng', 'juring'), 'juringTembereng');
  assert.equal(d('juring', 'busur'), 'daerahGaris');
  assert.equal(d('busur', 'tembereng'), 'daerahGaris');
  assert.equal(d('pusat', 'jariJari'), 'lain');
});

test('pesanUnsurLingkaran: setiap kode punya pesan bermakna', () => {
  const pasangan = [
    ['jariJari', 'diameter'],
    ['diameter', 'taliBusur'],
    ['taliBusur', 'diameter'],
    ['busur', 'taliBusur'],
    ['juring', 'tembereng'],
    ['tembereng', 'busur'],
    ['pusat', 'jariJari'],
  ];
  pasangan.forEach(([k, j]) => {
    const kode = E.diagnosaUnsurLingkaran(k, j);
    const m = E.pesanUnsurLingkaran(kode, k, j);
    assert.ok(typeof m === 'string' && m.length > 30, k + '/' + j);
  });
  assert.match(E.pesanUnsurLingkaran('jariDiameter', 'jariJari', 'diameter'), /pusat/);
  assert.match(E.pesanUnsurLingkaran('juringTembereng', 'tembereng', 'juring'), /tali busur/);
  assert.match(E.pesanUnsurLingkaran('benar', 'busur', 'busur'), /Busur/);
});

test('nilaiSoalLingkaran & diagnosaSoalLingkaran: jari-jari ↔ diameter', () => {
  assert.equal(E.nilaiSoalLingkaran({ minta: 'diameter', r: 7 }), 14);
  assert.equal(E.nilaiSoalLingkaran({ minta: 'jariJari', d: 35 }), 17.5);
  assert.equal(E.nilaiSoalLingkaran({ minta: 'taliTerpanjang', r: 12 }), 24);
  assert.equal(E.nilaiSoalLingkaran({ minta: 'jarakPusat', d: 50 }), 25);
  assert.throws(() => E.nilaiSoalLingkaran({ minta: 'aneh' }));

  const cek = { minta: 'diameter', r: 7 };
  assert.equal(E.diagnosaSoalLingkaran(cek, 14), 'benar');
  assert.equal(E.diagnosaSoalLingkaran(cek, 7), 'sama');
  assert.equal(E.diagnosaSoalLingkaran(cek, 3.5), 'terbalik');
  assert.equal(E.diagnosaSoalLingkaran(cek, 21), 'salah');
  const cek2 = { minta: 'jariJari', d: 30 };
  assert.equal(E.diagnosaSoalLingkaran(cek2, 15), 'benar');
  assert.equal(E.diagnosaSoalLingkaran(cek2, 60), 'terbalik');
  assert.equal(E.diagnosaSoalLingkaran(cek2, 30), 'sama');

  ['sama', 'terbalik', 'salah'].forEach((k) => {
    assert.ok(E.pesanSoalLingkaran(cek, k).length > 20, k);
    assert.ok(E.pesanSoalLingkaran(cek2, k).length > 20, k);
  });
});

test('buildGambarLingkaran: SVG beraksesibel dengan unsur, tag, sorot & dekor', () => {
  const svg = E.buildGambarLingkaran(
    [
      { tipe: 'ruas', u: O, v: { sudut: 30 }, tag: '1', sorot: true },
      { tipe: 'busur', a0: 30, a1: 120, tag: '2' },
      { tipe: 'daerah', batas: 'taliBusur', a0: 200, a1: 300, tag: '3' },
      { tipe: 'daerah', batas: 'jariJari', a0: 120, a1: 200 },
      { tipe: 'titik', jarak: 0, tag: '4' },
    ],
    { caption: 'Pizza dengan bagian bernomor', dekor: 'pizza', titik: [{ nama: 'A', sudut: 30 }] }
  );
  assert.match(svg, /^<svg[^>]+role="img"/);
  assert.match(svg, /<title>Pizza dengan bagian bernomor<\/title>/);
  assert.equal(count(svg, 'class="lkr-tag'), 4);
  assert.equal(count(svg, 'lkr-sorot'), 1);
  assert.ok(svg.includes('lkr-dekor--pizza'));
  assert.ok(svg.includes('>A<'));
  assert.ok(svg.includes('<line'));
  assert.ok(count(svg, '<path') >= 3);
  /* tanpa pusat ditampilkan: tidak ada label O */
  assert.ok(!E.buildGambarLingkaran([], { pusat: false }).includes('>O<'));
  assert.ok(E.buildGambarLingkaran([], {}).includes('>O<'));
  const titikSaja = E.buildGambarLingkaran([], { pusat: 'titik' });
  assert.ok(titikSaja.includes('lkr-pusat') && !titikSaja.includes('>O<'));
});

test('Lab Lingkaran: state awal, aksi, elemen, pengamatan', () => {
  const st = E.makeLabLingkaranState();
  assert.equal(st.mode, 'ruas');
  assert.equal(st.ujung, 'pusat');
  const cfg = { r: 10, langkah: 15 };
  assert.equal(E.jenisUnsurLingkaran(E.elemenLabLingkaran(st)), 'jariJari');

  E.ubahLabLingkaran(st, 'ujung', 'lingkaran');
  st.a = 30;
  st.b = 150;
  assert.equal(E.jenisUnsurLingkaran(E.elemenLabLingkaran(st)), 'taliBusur');
  E.ubahLabLingkaran(st, 'b', 60, cfg);
  assert.equal(st.b, 210);
  const p = plain(E.pengamatanLabLingkaran(st, cfg));
  assert.equal(p.jenis, 'diameter');
  assert.equal(p.panjang, 20);
  assert.equal(p.lewatPusat, true);

  E.ubahLabLingkaran(st, 'a', -45, cfg);
  assert.equal(st.a, 345);
  E.ubahLabLingkaran(st, 'mode', 'daerah');
  E.ubahLabLingkaran(st, 'batas', 'taliBusur');
  assert.equal(E.pengamatanLabLingkaran(st, cfg).jenis, 'tembereng');
  E.ubahLabLingkaran(st, 'mode', 'busur');
  const b = plain(E.pengamatanLabLingkaran(st, cfg));
  assert.equal(b.jenis, 'busur');
  assert.equal(b.ukuran, 'besar');
  /* nilai tak dikenal diabaikan */
  E.ubahLabLingkaran(st, 'mode', 'aneh');
  assert.equal(st.mode, 'busur');
});

test('Lab Lingkaran: catatan per jenis & syarat selesai', () => {
  const cfg = {
    r: 10,
    langkah: 15,
    wajib: ['jariJari', 'diameter', 'taliBusur', 'busur', 'juring', 'tembereng'],
  };
  const st = E.makeLabLingkaranState();
  assert.equal(E.catatLabLingkaran(st, cfg), 'jariJari');
  assert.equal(E.labLingkaranSelesai(st, cfg), false);
  E.ubahLabLingkaran(st, 'ujung', 'lingkaran');
  st.a = 0;
  st.b = 180;
  E.catatLabLingkaran(st, cfg);
  st.b = 90;
  E.catatLabLingkaran(st, cfg);
  E.ubahLabLingkaran(st, 'ujung', 'dalam');
  assert.equal(E.catatLabLingkaran(st, cfg), 'bukan');
  E.ubahLabLingkaran(st, 'mode', 'busur');
  E.catatLabLingkaran(st, cfg);
  E.ubahLabLingkaran(st, 'mode', 'daerah');
  E.catatLabLingkaran(st, cfg);
  E.ubahLabLingkaran(st, 'batas', 'taliBusur');
  E.catatLabLingkaran(st, cfg);
  assert.equal(E.labLingkaranSelesai(st, cfg), true);
  assert.deepEqual(Object.keys(st.catatan).sort(), [
    'bukan',
    'busur',
    'diameter',
    'jariJari',
    'juring',
    'taliBusur',
    'tembereng',
  ]);
  /* daerah setengah lingkaran tidak dicatat sebagai juring/tembereng */
  st.b = 180;
  assert.equal(E.catatLabLingkaran(st, cfg), 'setengah');
});

test('buildLabLingkaran & buildTabelPengamatanLkr: kontrol, info, misi & tabel', () => {
  const cfg = {
    r: 10,
    satuan: 'cm',
    langkah: 15,
    wajib: ['jariJari', 'diameter'],
    misi: [
      { id: 'jariJari', teks: 'Buat ruas dari pusat ke lingkaran.' },
      { id: 'diameter', teks: 'Buat ruas yang melewati pusat.' },
    ],
  };
  const st = E.makeLabLingkaranState();
  E.catatLabLingkaran(st, cfg);
  const html = E.buildLabLingkaran('lab', st, cfg);
  assert.ok(html.includes('data-lkr-mode="ruas"'));
  assert.ok(html.includes('data-lkr-ubah="a"'));
  assert.ok(html.includes('data-lkr-ubah="b"'));
  assert.ok(html.includes('data-lkr-ujung="dalam"'));
  assert.ok(html.includes('id="lab-catat"'));
  assert.ok(html.includes('aria-live="polite"'));
  assert.ok(html.includes('Jari-jari'));
  assert.equal(count(html, 'lkr-misi__item--ok'), 1);
  const tabel = E.buildTabelPengamatanLkr(st, cfg);
  assert.ok(tabel.includes('<table'));
  assert.ok(tabel.includes('10 cm'));
  assert.ok(E.buildTabelPengamatanLkr(E.makeLabLingkaranState(), cfg).includes('Belum ada'));
});
