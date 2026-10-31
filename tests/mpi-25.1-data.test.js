'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-25.1/data.js (koordinat Kartesius,
 * sifat bangun datar & ide awal transformasi — Inquiry Learning):
 * tahap mengikuti sintaks IL dan sama dengan manifest; setiap daftar
 * pilihan cukup opsi untuk diacak dengan id & label unik serta umpan
 * tiap opsi; titik tugas menyebar di keempat kuadran & sumbu; jenis
 * bangun, titik keempat, dan bayangan dihitung ulang engine seksi 91;
 * bank uji terap cukup untuk diambil acak; app.js selalu merender
 * pilihan dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-25.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-25.1', 'app.js'), 'utf8');
const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
);
const N = 6;

function ids(list) {
  return list.map((o) => o.id);
}

function dalamBidang(p) {
  return p.every((v) => Number.isInteger(v) && Math.abs(v) <= N);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.ok(list.length <= 6, name + ' maksimal 6 opsi (huruf A–F)');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  assert.equal(
    new Set(list.map((o) => o.label || o.teks)).size,
    list.length,
    name + ': label opsi harus unik'
  );
}

function assertGuided(q, name, min) {
  assertOptions(q.opsi, name + '.opsi', min || 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertDugaan(q, name) {
  assertOptions(q.opsi, name + '.opsi', 3);
  assert.ok(ids(q.opsi).includes(q.baku), name + ': baku ada di opsi');
  assert.ok(q.pembahasan && q.pembahasan.length > 20, name + ': pembahasan');
}

function assertOpsiEngine(s, name) {
  const opsi = E.opsiSoalKts(s);
  assertOptions(opsi, name, 4);
  assert.equal(opsi.filter((o) => o.id === 'benar').length, 1, name + ': satu kunci');
  opsi.forEach((o) => assert.ok(o.umpan, name + ': umpan ' + o.id));
  return opsi;
}

test('tahap mengikuti sintaks Inquiry Learning dan sesuai manifest', () => {
  assert.deepEqual(
    [...ids(D.tahap)],
    [
      'orientasi',
      'masalah',
      'hipotesis',
      'dataTitik',
      'dataBangun',
      'dataGerak',
      'uji',
      'simpulan',
      'terapkan',
      'refleksi',
      'selesai',
    ]
  );
  const m = MANIFEST['fase-d/mpi-25.1'];
  assert.ok(m, 'manifest fase-d/mpi-25.1 harus ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Inquiry Learning/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
});

test('setiap tahap IL punya kicker, syntax, goal, catatan guru, dan tombol lanjut', () => {
  const sintaks = {
    orientasi: 1,
    masalah: 2,
    hipotesis: 3,
    dataTitik: 4,
    dataBangun: 4,
    dataGerak: 4,
    uji: 5,
    simpulan: 6,
  };
  Object.keys(sintaks).forEach((k) => {
    const T = D[k];
    assert.ok(T.kicker && T.goal && T.guru, k + ': kicker, goal, guru');
    assert.equal(T.syntax, 'Inquiry Learning · Sintaks ' + sintaks[k], k + ': syntax');
    assert.ok(T.nextLabel, k + ': nextLabel');
  });
  ['terapkan', 'refleksi'].forEach((k) => {
    assert.ok(D[k].kicker && D[k].goal && D[k].guru && D[k].syntax, k);
  });
  assert.match(D.orientasi.tp, /koordinat/);
  assert.match(D.orientasi.tp, /transformasi/);
  assert.ok(D.orientasi.kriteria.length >= 4);
});

test('orientasi & hipotesis: dugaan tidak dinilai tetapi punya baku & pembahasan', () => {
  D.orientasi.dugaan.forEach((q) => assertDugaan(q, q.id));
  D.hipotesis.dugaan.forEach((q) => assertDugaan(q, q.id));
  /* Kunci dugaan letak lampu sesuai koordinat lampu pada gambar orientasi. */
  const letak = D.orientasi.dugaan.find((q) => q.id === 'dLetak');
  assert.equal(
    letak.opsi.find((o) => o.id === letak.baku).label,
    E.formatKoordinat(D.orientasi.gambar.lampu)
  );
  /* Pembahasan dugaan geser memuat bayangan A yang dihitung engine. */
  const g = D.orientasi.gambar;
  const a1 = E.transformasiTitik(g.bendera[0], g.geser);
  const geser = D.orientasi.dugaan.find((q) => q.id === 'dGeser');
  assert.ok(geser.pembahasan.includes(E.formatKoordinat(a1)));
  E.transformasiBangun(g.bendera, g.geser).forEach((p) => assert.ok(dalamBidang(p)));
});

test('masalah: opsi acak berumpan dan kunci ada', () => {
  assertGuided(
    { opsi: D.masalah.opsi, correct: D.masalah.correct, umpan: D.masalah.umpan },
    'masalah'
  );
});

test('Lab Titik: tugas menyebar di keempat kuadran & sumbu, label unik', () => {
  const T = D.dataTitik;
  assert.ok(T.tugas.length >= 5);
  assert.equal(new Set(ids(T.tugas)).size, T.tugas.length);
  assert.equal(new Set(T.tugas.map((t) => t.label)).size, T.tugas.length);
  T.tugas.forEach((t) => assert.ok(dalamBidang(t.p) && t.nama && t.ikon, t.id));
  const letak = new Set(T.tugas.map((t) => E.kuadranTitik(t.p)));
  ['I', 'II', 'III', 'IV'].forEach((k) => assert.ok(letak.has(k), 'ada titik di kuadran ' + k));
  assert.ok(letak.has('sumbuX') || letak.has('sumbuY'), 'ada titik pada sumbu');
  /* Setiap tugas memancing miskonsepsi tertukar: x ≠ y. */
  T.tugas.forEach((t) => assert.notEqual(t.p[0], t.p[1], t.id + ': x ≠ y'));
  assert.ok(T.petunjuk.length >= 2);
  T.baca.forEach((b) => {
    assert.ok(dalamBidang(b.p) && b.nama && b.label, b.id);
    assertOpsiEngine({ minta: 'koordinat', p: b.p }, b.id);
  });
  /* Titik baca tidak menumpuk dengan titik tugas. */
  const semua = T.tugas.concat(T.baca).map((t) => t.p.join(','));
  assert.equal(new Set(semua).size, semua.length);
  T.temuan.forEach((q) => assertGuided(q, q.id));
});

test('Lab Bangun: jenis, titik keempat, dan sisi ukur dihitung ulang engine', () => {
  const B = D.dataBangun.bangun;
  assert.ok(B.length >= 3);
  const jenis = new Set();
  B.forEach((b) => {
    assert.equal(b.pts.length, 4, b.id);
    assert.equal(b.titik.length, 4, b.id);
    b.pts.forEach((p) => assert.ok(dalamBidang(p), b.id + ': titik dalam bidang'));
    assert.equal(E.jenisSegiEmpat(b.pts), b.jenis, b.id + ': jenis bangun');
    jenis.add(b.jenis);
    if (['persegi', 'persegiPanjang', 'jajargenjang', 'belahKetupat'].includes(b.jenis)) {
      assert.deepEqual(
        JSON.stringify(E.titikKeempatJajargenjang(b.pts[0], b.pts[1], b.pts[2])),
        JSON.stringify(b.pts[3]),
        b.id + ': D = A + C − B'
      );
    }
    assert.ok(b.perintah.includes(b.titik[3]), b.id + ': perintah menyebut titik yang dicari');
    assert.ok(b.umpan && b.umpan.length > 20, b.id + ': umpan');
    const len = E.panjangRuasSumbu(b.pts[b.ukur.dari], b.pts[b.ukur.ke]);
    assert.ok(len > 0, b.id + ': sisi ukur sejajar sumbu');
    assertOpsiEngine(
      { minta: 'panjang', p: b.pts[b.ukur.dari], q: b.pts[b.ukur.ke], satuan: b.ukur.satuan },
      b.id + ' panjang'
    );
    assertOpsiEngine({ minta: 'jenisBangun', pts: b.pts }, b.id + ' jenis');
  });
  assert.equal(jenis.size, B.length, 'jenis bangun beragam');
  D.dataBangun.temuan.forEach((q) => assertGuided(q, q.id));
});

test('Lab Gerak: contoh sehari-hari mencakup keempat gerak, bayangan tetap di bidang', () => {
  const G = D.dataGerak;
  const gerakIds = ids(E.KTS_GERAK);
  assert.equal(new Set(ids(G.contoh)).size, G.contoh.length);
  G.contoh.forEach((c) => {
    assert.ok(gerakIds.includes(c.gerak), c.id + ': gerak dikenal');
    assert.ok(c.teks && c.explanation, c.id);
  });
  gerakIds.forEach((g) =>
    assert.ok(G.contoh.filter((c) => c.gerak === g).length >= 2, g + ': minimal dua contoh')
  );
  const jenisPreset = new Set(G.lab.preset.map((p) => p.t.jenis));
  gerakIds.forEach((g) => assert.ok(jenisPreset.has(g), 'preset memuat ' + g));
  G.lab.bangun.forEach((b) => {
    assert.equal(b.titik.length, b.pts.length, b.id);
    G.lab.preset.forEach((p) => {
      E.transformasiBangun(b.pts, p.t).forEach((q) =>
        assert.ok(dalamBidang(q), b.id + ' × ' + p.id + ': bayangan di dalam bidang')
      );
    });
  });
  /* Bangun bendera tidak simetris agar arah hadap pada cermin terlihat terbalik. */
  const bendera = G.lab.bangun[0];
  const cermin = G.lab.preset.find((p) => p.t.jenis === 'cermin');
  assert.equal(
    E.bandingTransformasi(bendera.pts, E.transformasiBangun(bendera.pts, cermin.t)).arahTetap,
    false
  );
  G.temuan.forEach((q) => assertGuided(q, q.id));
  /* Kunci temuan geser = bayangan A oleh preset geser pertama. */
  const geser = G.lab.preset.find((p) => p.t.jenis === 'geser');
  const tGeser = G.temuan.find((q) => q.id === 'tGeser');
  assert.equal(
    tGeser.opsi.find((o) => o.id === tGeser.correct).label,
    'A′' + E.formatKoordinat(E.transformasiTitik(bendera.pts[0], geser.t))
  );
  const tKali = G.temuan.find((q) => q.id === 'tKali');
  const besar = G.lab.preset.find((p) => p.t.jenis === 'perbesar');
  assert.ok(
    tKali.opsi
      .find((o) => o.id === tKali.correct)
      .label.includes(E.formatKoordinat(E.transformasiTitik(bendera.pts[1], besar.t)))
  );
});

test('uji: pernyataan benar/salah berimbang dengan penjelasan', () => {
  const P = D.uji.pernyataan;
  assert.ok(P.length >= 6);
  assert.equal(new Set(ids(P)).size, P.length);
  const benar = P.filter((v) => v.correct === 'benar').length;
  assert.ok(benar >= 2 && P.length - benar >= 2, 'campuran benar & salah');
  P.forEach((v) => assert.ok(v.explanation && v.teks));
  assertOptions(D.uji.opsiPernyataan, 'opsiPernyataan', 2);
});

test('simpulan: setiap kalimat berkunci unik di bank, ada pengecoh', () => {
  const S = D.simpulan;
  const bank = ids(S.bank);
  assert.equal(new Set(bank).size, bank.length);
  const kunci = S.kalimat.map((k) => k.correct);
  assert.equal(new Set(kunci).size, kunci.length);
  kunci.forEach((k) => assert.ok(bank.includes(k)));
  assert.ok(bank.length - kunci.length >= 3, 'minimal tiga pengecoh');
  assert.ok(S.rangkuman.length >= 4);
});

test('uji terap: bank cukup sesuai komposisi, kunci engine sesuai penjelasan', () => {
  const T = D.terapkan;
  const total = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, T.banyak);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  Object.keys(T.komposisi).forEach((k) => {
    const n = T.soal.filter((s) => s.minta === k).length;
    assert.ok(n > T.komposisi[k], k + ': bank lebih banyak dari yang diambil');
  });
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation && s.ikon, s.id);
    assertOpsiEngine(s, s.id);
    const kunci = E.jawabSoalKts(s);
    if (['koordinat', 'titikKeempat', 'bayangan'].includes(s.minta)) {
      assert.ok(s.explanation.includes(kunci), s.id + ': penjelasan memuat ' + kunci);
    }
    if (s.minta === 'panjang') {
      assert.ok(s.explanation.includes(kunci.split(' ')[0]), s.id + ': panjang');
    }
    if (s.minta === 'kuadran') {
      const k = E.kuadranTitik(s.p);
      const pola = k.startsWith('sumbu') ? 'sumbu-' + k.slice(-1).toLowerCase() : 'kuadran ' + k;
      assert.ok(s.explanation.includes(pola), s.id + ': ' + pola);
    }
    if (s.minta === 'jenisBangun') {
      assert.equal(s.titik.length, 4, s.id);
      s.pts.forEach((p) => assert.ok(dalamBidang(p), s.id));
      assert.ok(
        s.explanation
          .toLowerCase()
          .includes(E.KTS_JENIS_LABEL[E.jenisSegiEmpat(s.pts)].toLowerCase()),
        s.id + ': jenis'
      );
    }
    if (s.minta === 'titikKeempat') {
      const d = E.titikKeempatJajargenjang(s.pts[0], s.pts[1], s.pts[2]);
      assert.equal(E.jenisSegiEmpat(s.pts.concat([d])), s.jenis, s.id + ': jenis bangun');
    }
    if (s.minta === 'gerak') {
      const g = E.KTS_GERAK.find((x) => x.id === s.gerak);
      assert.ok(s.explanation.includes(g.istilah), s.id + ': istilah');
    }
    if (s.gambar === 'titik') assert.ok(s.label && dalamBidang(s.p), s.id);
    if (s.minta === 'bayangan') assert.ok(dalamBidang(E.transformasiTitik(s.p, s.t)), s.id);
  });
  /* Soal gerak mencakup keempat jenis gerak. */
  const g = new Set(T.soal.filter((s) => s.minta === 'gerak').map((s) => s.gerak));
  assert.equal(g.size, 4);
});

test('refleksi & selesai: pertanyaan, opsi diri, capaian', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 3);
  assert.ok(D.selesai.contoh.length >= 3);
});

test('app.js: tahap dari DATA, pilihan selalu diacak & disimpan di state', () => {
  assert.ok(APP.includes('DATA.tahap.map'), 'tahap dari DATA');
  [
    'ensureShuffledOrder',
    'ensureSortStates',
    'shuffleArray',
    'opsiSoalKts',
    'ensureLabTitikKts',
    'ensureTitikKeempatKts',
    'ensureLabGerakKts',
  ].forEach((f) => assert.ok(APP.includes(f + '('), 'app memakai ' + f));
  assert.ok(/optionOrder:\s*\S*shuffleArray\(/.test(APP), 'optionOrder diacak');
  assert.ok(APP.includes("STORAGE_KEY = 'mpi-25-1-kts-v1'"));
  /* buildChoiceGroup selalu diberi urutan tersimpan (argumen kedua bukan null). */
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*([^,)]+)/g) || [];
  assert.ok(panggilan.length >= 3);
  panggilan.forEach((p) => assert.ok(!/,\s*null\s*$/.test(p), 'urutan acak: ' + p));
  /* Pengacakan tidak dilakukan saat render (tidak ada shuffleArray di fungsi render*). */
  const renderBlok = APP.split(/\nfunction /).filter((f) => /^render/.test(f));
  assert.ok(renderBlok.length >= 10);
  renderBlok.forEach((f) =>
    assert.ok(!f.includes('shuffleArray('), 'render tidak mengacak: ' + f.slice(0, 30))
  );
});
