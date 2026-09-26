'use strict';

/*
 * Tes konsistensi konten fase-e/mpi-1.3/data.js (masalah kontekstual
 * bilangan berpangkat bulat, Problem Based Learning): fakta masalah
 * pemantik dihitung ulang secara numerik dengan Math.pow (bebas dari
 * sifat yang dipelajari), setiap kartu penyelidikan (rantai sifat)
 * memiliki kunci eksponen & nilai yang cocok, kapasitas & lama muat
 * paket konsisten dengan keputusan kelompok, kunci soal uji terap
 * terverifikasi, setiap daftar pilihan punya id unik dan cukup opsi
 * untuk diacak, dan app.js mengacak setiap daftar pilihan jawaban.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-e/mpi-1.3/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-e/mpi-1.3/app.js'), 'utf8');

const STAGE_KEYS = [
  'orientasi',
  'organisasi',
  'selidikUkuran',
  'selidikKapasitas',
  'selidikWaktu',
  'karya',
  'evaluasi',
  'terapkan',
  'refleksi',
];

const pow = Math.pow;

function dekat(x, y) {
  return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
}

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + '.' + o.id + ': ada label'));
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

/* Evaluasi numerik rantai dengan definisi (Math.pow), tanpa sifat eksponen. */
function nilaiRantaiNumerik(r) {
  let v = pow(r.a, r.awal);
  r.langkah.forEach((l) => {
    if (l.op === 'kali') v = v * pow(r.a, l.n);
    else if (l.op === 'bagi') v = v / pow(r.a, l.n);
    else if (l.op === 'pangkat') v = pow(v, l.n);
    else throw new Error('op ' + l.op);
  });
  return v;
}

test('struktur: semua tahap ada dengan kicker, syntax, goal, dan catatan guru', () => {
  STAGE_KEYS.forEach((k) => {
    assert.ok(D[k], 'tahap ' + k);
    assert.ok(D[k].kicker && D[k].syntax && D[k].goal && D[k].guru, k + ': kepala lengkap');
  });
  assert.ok(D.selesai && D.selesai.judul && D.selesai.capaian.length >= 3);
});

test('sintaks PBL 1–5 terpetakan berurutan', () => {
  const peta = [
    ['orientasi', 1],
    ['organisasi', 2],
    ['selidikUkuran', 3],
    ['selidikKapasitas', 3],
    ['selidikWaktu', 3],
    ['karya', 4],
    ['evaluasi', 5],
  ];
  peta.forEach(([k, n]) => assert.match(D[k].syntax, new RegExp('Sintaks ' + n + '$'), k));
  assert.match(D.orientasi.syntax, /^Problem Based Learning/);
});

test('app.js: urutan tahap sesuai data dan 10 tahap', () => {
  const m = APP.match(/var STAGES = \[([\s\S]*?)\];/);
  assert.ok(m, 'STAGES ada');
  const stages = m[1].match(/'([a-zA-Z]+)'/g).map((s) => s.replace(/'/g, ''));
  assert.deepEqual(stages, STAGE_KEYS.concat(['selesai']));
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-e/mpi-1.3'].stageCount, stages.length);
});

test('fakta masalah pemantik konsisten secara numerik', () => {
  const F = D.fakta;
  const bytesMentah = pow(2, F.kLebar) * pow(2, F.kTinggi) * pow(2, F.kBytePiksel);
  assert.equal(bytesMentah, 4096 * 2048 * 4, 'resolusi 4.096 × 2.048, 4 byte per piksel');
  assert.equal(bytesMentah, pow(2, F.kFotoMentah));
  assert.equal(bytesMentah * pow(2, F.kKompresi), pow(2, F.kFoto));
  assert.equal(bytesMentah / 8, pow(2, F.kFoto), 'kompresi = seperdelapan');
  assert.equal(pow(2, F.kMurid) * pow(2, F.kFotoPerMurid), pow(2, F.kFotoPerTahun));
  assert.equal(pow(2, F.kMurid), 512);
  assert.equal(pow(2, F.kFotoPerMurid), 16);
  assert.equal(pow(2, F.kFoto) * pow(2, F.kFotoPerTahun), pow(2, F.kPerTahun));
  assert.equal(pow(2, F.kUnggah), 8 * pow(2, 20), 'Wi-Fi 8 MiB per detik');
  assert.equal(E.formatUkuranBiner(F.kFotoMentah), '32 MiB');
  assert.equal(E.formatUkuranBiner(F.kFoto), '4 MiB');
  assert.equal(E.formatUkuranBiner(F.kPerTahun), '32 GiB');
});

test('paket: kapasitas rantai = 2ᵏ byte dan label satuan biner cocok', () => {
  assert.ok(D.paket.length >= 3);
  assert.equal(new Set(ids(D.paket)).size, D.paket.length);
  D.paket.forEach((p) => {
    assert.equal(p.kapasitas.a, 2);
    assert.equal(nilaiRantaiNumerik(p.kapasitas), pow(2, p.k), p.id + ': kapasitas numerik');
    assert.equal(E.hasilRantai(p.kapasitas).k, p.k, p.id + ': kapasitas via sifat');
    assert.equal(E.formatUkuranBiner(p.k), p.teks, p.id + ': label kapasitas');
    assert.equal(E.teksRantai(p.kapasitas) + ' byte', p.bentuk, p.id + ': bentuk pangkat');
    assert.ok(p.harga > 0);
  });
});

test('kartu penyelidikan: rantai, kunci eksponen & nilai konsisten', () => {
  ['selidikUkuran', 'selidikKapasitas', 'selidikWaktu'].forEach((stage) => {
    const kartu = D[stage].kartu;
    assert.ok(kartu.length >= 3, stage + ': minimal 3 kartu');
    assert.equal(new Set(ids(kartu)).size, kartu.length, stage + ': id unik');
    kartu.forEach((c) => {
      const nm = stage + '.' + c.id;
      assert.ok(c.judul && c.cerita && c.tanya, nm + ': teks lengkap');
      const r = c.rantai;
      assert.equal(E.hasilRantai(r).k, c.kunci.k, nm + ': eksponen hasil');
      assert.ok(dekat(nilaiRantaiNumerik(r), pow(r.a, c.kunci.k)), nm + ': numerik');
      if (r.nilai) {
        assert.ok(typeof c.kunci.nilai === 'number', nm + ': kunci nilai ada');
        assert.ok(dekat(nilaiRantaiNumerik(r), c.kunci.nilai), nm + ': kunci nilai');
        const h = E.hasilRantai(r).nilai;
        assert.ok(dekat(h.num / h.den, c.kunci.nilai), nm + ': nilai via engine');
      }
      E.langkahRantai(r).forEach((s) => {
        assert.ok(['kali', 'bagi', 'pangkat'].includes(s.op), nm + ': sifat dikenal');
      });
    });
  });
});

test('penyelidikan memakai kelima sifat: kali, bagi, pangkat, eksponen negatif & nol', () => {
  const semua = ['selidikUkuran', 'selidikKapasitas', 'selidikWaktu'].flatMap((s) =>
    D[s].kartu.flatMap((c) => E.langkahRantai(c.rantai))
  );
  ['kali', 'bagi', 'pangkat'].forEach((op) =>
    assert.ok(
      semua.some((s) => s.op === op),
      'ada sifat ' + op
    )
  );
  const hasilK = semua.map((s) => E.eksponenSifat(s.op, s.m, s.n));
  assert.ok(
    hasilK.some((k) => k < 0),
    'ada hasil eksponen negatif'
  );
  assert.ok(hasilK.includes(0), 'ada hasil pangkat nol');
  assert.ok(
    semua.some((s) => s.n < 0),
    'ada eksponen negatif sebagai data'
  );
});

test('kartu lama muat paket merujuk paket & kebutuhan per tahun', () => {
  const lama = D.selidikKapasitas.kartu.filter((c) => c.paket);
  assert.equal(lama.length, D.paket.length, 'satu kartu per paket');
  lama.forEach((c) => {
    const p = D.paket.find((x) => x.id === c.paket);
    assert.ok(p, c.id + ': paket ada');
    assert.equal(c.kunci.k, p.k - D.fakta.kPerTahun, c.id + ': 2ᵏ : 2³⁵');
    assert.equal(c.rantai.satuan, 'tahun');
  });
});

test('keputusan paket: termurah yang memenuhi syarat & skenario tanpa kompresi', () => {
  const F = D.fakta;
  const rows = E.bandingPaketPangkat(D.paket, {
    a: 2,
    kPerPeriode: F.kPerTahun,
    minimal: F.minimalTahun,
  });
  const pilih = E.paketTerhemat(rows);
  const p1 = D.karya.tanya.find((q) => q.id === 'p1');
  assert.equal(p1.correct, pilih.id);
  assert.ok(
    rows.some((r) => !r.cukup),
    'ada paket yang tidak memenuhi'
  );
  assert.ok(
    rows.some((r) => r.cukup && r.harga > pilih.harga),
    'ada paket memenuhi yang lebih mahal'
  );
  /* Tanpa kompresi: kebutuhan 2^(kFotoMentah + kFotoPerTahun) per tahun. */
  const kMentah = F.kFotoMentah + F.kFotoPerTahun;
  const lamaMentah = pow(2, D.paket.find((p) => p.id === pilih.id).k) / pow(2, kMentah);
  assert.equal(lamaMentah, 1, 'paket terpilih hanya 1 tahun (2⁰) tanpa kompresi');
  assert.equal(D.karya.tanya.find((q) => q.id === 'p2').correct, 'satu');
});

test('orientasi: dugaan, rumusan masalah, surat klien', () => {
  const O = D.orientasi;
  assert.ok(O.surat.length >= 4);
  O.surat.forEach((s) => assert.ok(s.ikon && s.judul && s.butir.length >= 1));
  assert.ok(O.dugaan.length >= 2);
  O.dugaan.forEach((q) => assertOptions(q.opsi, 'dugaan.' + q.id, 4));
  assertOptions(O.masalahOpsi, 'masalahOpsi', 4);
  assert.ok(ids(O.masalahOpsi).includes(O.masalahCorrect));
  O.masalahOpsi.forEach((o) => assert.ok(O.masalahUmpan[o.id]));
  /* Setiap dugaan punya tanggapan di tahap evaluasi. */
  O.dugaan.forEach((q) =>
    q.opsi.forEach((o) =>
      assert.ok(D.evaluasi.tanggapanDugaan[q.id][o.id], 'tanggapan ' + q.id + '.' + o.id)
    )
  );
});

test('organisasi: peran, pemilahan, rencana', () => {
  const O = D.organisasi;
  assertOptions(O.peran, 'peran', 4);
  assertOptions(O.opsiPilah, 'opsiPilah', 3);
  assert.ok(O.pilah.length >= 6);
  assert.equal(new Set(ids(O.pilah)).size, O.pilah.length);
  O.pilah.forEach((p) => {
    assert.ok(ids(O.opsiPilah).includes(p.correct), p.id + ': kategori valid');
    assert.ok(p.explanation);
  });
  ids(O.opsiPilah).forEach((k) =>
    assert.ok(
      O.pilah.some((p) => p.correct === k),
      'ada butir ' + k
    )
  );
  assertOptions(O.rencana, 'rencana', 4);
});

test('pertanyaan penuntun: opsi, kunci, dan umpan balik lengkap', () => {
  ['selidikUkuran', 'selidikKapasitas', 'selidikWaktu', 'karya', 'evaluasi'].forEach((k) => {
    assert.ok(D[k].tanya.length >= 1, k + ': ada pertanyaan');
    D[k].tanya.forEach((q) => assertGuided(q, k + '.' + q.id));
  });
});

test('evaluasi: lembar kerja kelompok lain memuat langkah benar & keliru', () => {
  const V = D.evaluasi;
  assertOptions(V.opsiNilai, 'opsiNilai', 2);
  assert.ok(V.langkah.length >= 6);
  V.langkah.forEach((l) => {
    assert.ok(ids(V.opsiNilai).includes(l.correct));
    assert.ok(l.teks && l.explanation);
  });
  assert.ok(V.langkah.filter((l) => l.correct === 'benar').length >= 2);
  assert.ok(V.langkah.filter((l) => l.correct === 'keliru').length >= 3);
});

test('uji terap: kunci diverifikasi numerik & opsi siap diacak', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 8);
  assert.equal(new Set(ids(soal)).size, soal.length);
  let adaNeg = false;
  let adaNol = false;
  soal.forEach((s) => {
    const nm = 'terapkan.' + s.id;
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, nm + ': teks');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, nm + ': petunjuk');
    const c = s.cek;
    let numerik;
    if (c.op === 'kali') numerik = pow(c.a, c.m) * pow(c.a, c.n);
    else if (c.op === 'bagi') numerik = pow(c.a, c.m) / pow(c.a, c.n);
    else numerik = pow(pow(c.a, c.m), c.n);
    const k = E.eksponenSifat(c.op, c.m, c.n);
    assert.ok(dekat(numerik, pow(c.a, k)), nm + ': sifat cocok numerik');
    if (k < 0) adaNeg = true;
    if (k === 0) adaNol = true;
    if (s.rantai) {
      assert.ok(dekat(nilaiRantaiNumerik(s.rantai), numerik), nm + ': rantai = cek');
    }
    if (s.type === 'input') {
      assert.ok(Number.isInteger(s.jawab), nm + ': jawaban bulat');
      assert.ok(dekat(s.jawab, numerik), nm + ': jawab = ' + numerik);
      assert.equal(E.diagnosaNilaiPangkat(c, s.jawab).kode, 'benar');
    } else {
      assertOptions(s.options, nm + '.options', 4);
      assert.ok(ids(s.options).includes(s.correct), nm + ': correct ada');
      const benar = s.options.find((o) => o.id === s.correct);
      assert.ok(
        benar.label.indexOf(E.formatPangkat(c.a, k)) === 0,
        nm + ': label kunci diawali ' + E.formatPangkat(c.a, k)
      );
      assert.equal(new Set(s.options.map((o) => o.label)).size, s.options.length);
    }
  });
  assert.ok(adaNeg, 'ada soal berhasil eksponen negatif');
  assert.ok(adaNol, 'ada soal pangkat nol');
  assert.ok(soal.some((s) => s.type === 'input') && soal.some((s) => s.type === 'choice'));
});

test('refleksi: pertanyaan & penilaian diri', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
});

test('app.js: setiap daftar pilihan jawaban diacak', () => {
  [
    /ensureGuidedOrders\('dugaanOrders', 'dugaanPilih', DATA\.orientasi\.dugaan\)/,
    /ensureShuffledOrder\(State, 'masalahOrder', DATA\.orientasi\.masalahOpsi\)/,
    /ensureShuffledOrder\(State, 'peranOrder', DATA\.organisasi\.peran\)/,
    /ensureSortStates\([\s\S]*?DATA\.organisasi\.opsiPilah\)/,
    /ensureTapOrderState\(State, 'rencanaState'/,
    /ensureShuffledOrder\(st, 'sifatOrder', opsiSifatPangkat\(\)\)/,
    /ensureGuidedOrders\('ukuranOrders', 'ukuranPilih', DATA\.selidikUkuran\.tanya\)/,
    /ensureGuidedOrders\('kapasitasOrders', 'kapasitasPilih', DATA\.selidikKapasitas\.tanya\)/,
    /ensureGuidedOrders\('waktuOrders', 'waktuPilih', DATA\.selidikWaktu\.tanya\)/,
    /ensureGuidedOrders\('karyaOrders', 'karyaPilih', DATA\.karya\.tanya\)/,
    /ensureSortStates\([\s\S]*?DATA\.evaluasi\.opsiNilai\)/,
    /ensureGuidedOrders\('evalOrders', 'evalPilih', DATA\.evaluasi\.tanya\)/,
    /optionOrder: q\.options \? shuffleArray\(optionIds\(q\.options\)\) : null/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
  ].forEach((re) => assert.match(APP, re));
});
