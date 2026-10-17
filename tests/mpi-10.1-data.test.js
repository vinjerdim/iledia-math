'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-10.1/data.js (Merumuskan pertanyaan
 * statistik, Inquiry Learning): setiap kunci sama dengan engine seksi 80
 * (klasifikasiPertanyaan, kunciCatatTanya, periksaRakitPertanyaan,
 * nilaiSoalStatistik, opsiSoalStatistik), opsi pilihan cukup & unik agar
 * dapat diacak, tahap mengikuti sintaks Inquiry Learning dan sama dengan
 * manifest halaman. app.js juga dicek agar pilihan selalu dirender dengan
 * urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-10.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-10.1', 'app.js'), 'utf8');

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function assertOptions(list, name, min) {
  const m = min || 3;
  assert.ok(list && list.length >= m, name + ' minimal ' + m + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  const labels = Array.from(list, (o) => o.label || o.teks);
  labels.forEach((l, i) => assert.ok(l, name + '.' + list[i].id + ': label'));
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus berbeda');
}

function assertGuided(list, name, min) {
  assert.ok(list.length >= (min || 1), name + ': cukup pertanyaan');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya, q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

function assertDugaan(list, name) {
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya && q.pembahasan, q.id + ': tanya & pembahasan');
    assertOptions(q.opsi, name + '.' + q.id, 3);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
  });
}

test('sebelas tahap Inquiry Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-10.1'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Inquiry Learning/);
  assert.deepEqual(ids(D.tahap), [
    'orientasi',
    'masalah',
    'hipotesis',
    'dataTanya',
    'dataPilah',
    'dataRakit',
    'uji',
    'simpulan',
    'terapkan',
    'refleksi',
    'selesai',
  ]);
  D.tahap.forEach((t) => {
    assert.ok(D[t.id], t.id + ': konten tahap');
    assert.match(APP, new RegExp('\\b' + t.id + ': render'), t.id + ': ada renderer');
  });
  const SINTAKS = {
    orientasi: 1,
    masalah: 2,
    hipotesis: 3,
    dataTanya: 4,
    dataPilah: 4,
    dataRakit: 4,
    uji: 5,
    simpulan: 6,
  };
  Object.entries(SINTAKS).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Inquiry Learning · Sintaks ' + n, id);
    ['kicker', 'goal', 'guru'].forEach((k) => assert.ok(D[id][k], id + ': ' + k));
  });
  ['terapkan', 'refleksi'].forEach((id) =>
    ['kicker', 'goal', 'guru'].forEach((k) => assert.ok(D[id][k], id + ': ' + k))
  );
});

test('orientasi, masalah & hipotesis: dugaan berbaku, rumusan masalah berumpan', () => {
  const O = D.orientasi;
  assert.match(O.tp, /pertanyaan statistik/);
  assert.ok(O.usul.length >= 5);
  assertDugaan(O.dugaan, 'orientasi.dugaan');
  assertDugaan(D.hipotesis.dugaan, 'hipotesis.dugaan');
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah.opsi', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'masalah.umpan.' + o.id));
});

test('Lab Tanya: kartu seragam & beragam tersedia, simulasi sesuai ciri', () => {
  const L = D.dataTanya.lab;
  assert.equal(L.responden, 32);
  assert.equal(new Set(ids(L.pertanyaan)).size, L.pertanyaan.length);
  const kunci = L.pertanyaan.map((q) => E.kunciCatatTanya(q));
  assert.ok(kunci.includes('beragam') && kunci.includes('seragam'));
  L.pertanyaan.forEach((q) => {
    assert.ok(q.teks && q.ikon, q.id);
    const j = E.simulasiJawabanKelas(q, L.responden, 12345);
    const ragam = E.ragamJawaban(j);
    if (E.kunciCatatTanya(q) === 'beragam') assert.ok(ragam >= 2, q.id + ': beragam');
    else assert.equal(ragam, 1, q.id + ': seragam');
    /* klasifikasi kartu cocok dengan kuncinya */
    assert.equal(
      E.klasifikasiPertanyaan(q.ciri).statistik,
      E.kunciCatatTanya(q) === 'beragam',
      q.id
    );
  });
  /* kartu beragam tetap beragam untuk banyak seed */
  for (let seed = 1; seed <= 50; seed++) {
    L.pertanyaan
      .filter((q) => E.kunciCatatTanya(q) === 'beragam')
      .forEach((q) =>
        assert.ok(E.ragamJawaban(E.simulasiJawabanKelas(q, 32, seed)) >= 2, q.id + '@' + seed)
      );
  }
  assertGuided(D.dataTanya.temuan, 'dataTanya.temuan', 3);
});

test('Lab Pilah: kunci sesuai klasifikasi engine dan mencakup ketiga alasan', () => {
  const P = D.dataPilah;
  assertOptions(P.kategori, 'dataPilah.kategori', 2);
  assert.ok(P.pertanyaan.length >= 8);
  assert.equal(new Set(ids(P.pertanyaan)).size, P.pertanyaan.length);
  const alasan = new Set();
  P.pertanyaan.forEach((p) => {
    const k = E.klasifikasiPertanyaan(p.ciri);
    assert.equal(p.correct, k.statistik ? 'statistik' : 'bukan', p.id);
    assert.ok(p.teks && p.explanation && D.konteks[p.konteks], p.id);
    if (k.alasan) alasan.add(k.alasan);
  });
  assert.deepEqual([...alasan].sort(), ['satuJawaban', 'satuOrang', 'tidakJelas']);
  const banyakStat = P.pertanyaan.filter((p) => p.correct === 'statistik').length;
  assert.ok(banyakStat >= 3 && P.pertanyaan.length - banyakStat >= 3, 'seimbang');
});

test('Lab Rakit: keping cukup, setiap diagnosa dapat muncul, target tercapai', () => {
  const L = D.dataRakit.lab;
  assertOptions(L.kataTanya, 'kataTanya', 2);
  assertOptions(
    L.variabel.map((v) => ({ id: v.id, label: v.frasa })),
    'variabel',
    5
  );
  assertOptions(
    L.kelompok.map((v) => ({ id: v.id, label: v.frasa })),
    'kelompok',
    4
  );
  const kode = new Set();
  const jenis = new Set();
  L.kataTanya.forEach((t) =>
    L.variabel.forEach((v) =>
      L.kelompok.forEach((k) => {
        const h = E.periksaRakitPertanyaan({ tanya: t.id, variabel: v.id, kelompok: k.id }, L);
        kode.add(h.kode);
        if (h.benar) {
          jenis.add(h.jenisData);
          assert.ok(['survei', 'pengukuran', 'pengamatan'].includes(h.cara), v.id);
          assert.match(h.teks, /\?$/);
        }
      })
    )
  );
  assert.deepEqual([...kode].sort(), ['benar', 'satuOrang', 'tanyaTakCocok', 'tidakJelas']);
  assert.deepEqual([...jenis].sort(), ['kategorik', 'numerik']);
  assert.ok(L.minSimpan >= 2);
  assertGuided(D.dataRakit.perbaiki, 'dataRakit.perbaiki', 2);
});

test('uji, simpulan: pernyataan seimbang & bank kalimat cukup', () => {
  const U = D.uji;
  assertOptions(U.opsiPernyataan, 'opsiPernyataan', 2);
  assert.ok(U.pernyataan.length >= 6);
  assert.equal(new Set(ids(U.pernyataan)).size, U.pernyataan.length);
  U.pernyataan.forEach((v) => {
    assert.ok(['benar', 'salah'].includes(v.correct), v.id);
    assert.ok(v.teks && v.explanation, v.id);
  });
  const S = D.simpulan;
  assertOptions(S.bank, 'simpulan.bank', S.kalimat.length + 2);
  const bankIds = ids(S.bank);
  S.kalimat.forEach((k) => assert.ok(bankIds.includes(k.correct), k.id));
  assert.equal(new Set(S.kalimat.map((k) => k.correct)).size, S.kalimat.length);
  assert.ok(S.rangkuman.length >= 4);
});

test('uji terap: komposisi cukup, kunci engine valid, opsi unik & memuat kunci', () => {
  const T = D.terapkan;
  const total = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, T.banyak);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  assert.ok(T.soal.length >= 2 * T.banyak, 'bank minimal dua kali banyak soal');
  Object.entries(T.komposisi).forEach(([minta, n]) => {
    const ada = T.soal.filter((s) => s.minta === minta).length;
    assert.ok(ada > n || (ada === n && n > 0), minta + ': bank cukup untuk diacak');
  });
  T.soal.forEach((s) => {
    assert.ok(T.komposisi[s.minta], s.id + ': minta dikenal');
    assert.ok(s.cerita && s.pertanyaan && s.explanation && D.konteks[s.konteks], s.id);
    const kunci = E.nilaiSoalStatistik(s);
    assert.ok(kunci, s.id + ': kunci');
    const opsi = E.opsiSoalStatistik(s);
    assertOptions(opsi, s.id, 3);
    assert.ok(ids(opsi).includes(kunci), s.id + ': kunci ada di opsi');
    opsi.forEach((o) => assert.ok(o.umpan, s.id + '.' + o.id + ': umpan'));
    if (s.pilihan) {
      const stat = s.pilihan.filter((p) => E.klasifikasiPertanyaan(p.ciri).statistik);
      assert.equal(stat.length, 1, s.id + ': tepat satu pertanyaan statistik');
    }
    if (s.minta === 'alasan') assert.notEqual(kunci, 'statistik', s.id);
  });
});

test('refleksi & selesai lengkap', () => {
  const R = D.refleksi;
  assert.ok(R.milikkuLabel && R.milikkuPlaceholder && R.cekLabel);
  assertOptions(R.cek, 'refleksi.cek', 3);
  assert.ok(R.pertanyaan.length >= 2);
  R.pertanyaan.forEach((q) => assert.ok(q.id && q.teks && q.placeholder));
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.judul && D.selesai.teks && D.selesai.capaian.length >= 4);
});

test('app.js: pilihan selalu dirender dengan urutan acak tersimpan', () => {
  assert.match(APP, /shuffleArray\(/);
  assert.match(APP, /ensureShuffledOrder\(/);
  assert.match(APP, /ensureSortStates\(/);
  assert.match(APP, /ensureLabTanya\(/);
  assert.match(APP, /ensureLabRakit\(/);
  assert.match(APP, /opsiSoalStatistik\(/);
  assert.match(APP, /STORAGE_KEY = 'mpi-d-10-1-/);
  /* Setiap buildChoiceGroup memakai urutan dari State, bukan urutan DATA. */
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*[^,)]+/g) || [];
  assert.ok(panggilan.length >= 2);
  panggilan.forEach((p) => assert.match(p, /State\.|orders\[|Order/, p));
});
