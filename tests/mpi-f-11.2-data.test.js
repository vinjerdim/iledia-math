'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-11.2/data.js (model linear terbaik
 * dengan bantuan teknologi digital, Problem Based Learning): tahap cocok
 * dengan manifest & sintaks PBL, data & garis usulan menghasilkan kunci
 * yang sama dengan engine seksi 41 (JKR, garis terbaik, regresi, estimasi,
 * interpolasi/ekstrapolasi), setiap daftar pilihan punya id unik dan
 * cukup opsi untuk diacak, setiap opsi pertanyaan penuntun punya umpan
 * balik, kunci soal uji terap diverifikasi lewat metadata `cek`, dan
 * app.js mengacak setiap daftar pilihan jawaban murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-11.2/data.js']);
const D = E.DATA;
const tanpaSpasi = (s) => s.replace(/\s+/g, '').replace(/,\)/g, ')');
const APP = tanpaSpasi(fs.readFileSync(path.join(ROOT, 'fase-f/mpi-11.2/app.js'), 'utf8'));
const P = D.proyek;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + ': opsi ' + o.id + ' tanpa label'));
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': kunci tidak ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan balik untuk ' + o.id));
}

function assertSort(items, options, name) {
  assertOptions(options, name + '.opsi', 2);
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(ids(options).includes(it.correct), name + ': kunci ' + it.id);
    assert.ok(it.explanation, name + ': penjelasan ' + it.id);
  });
  options.forEach((o) =>
    assert.ok(
      items.some((it) => it.correct === o.id),
      name + ': kategori ' + o.id + ' terpakai'
    )
  );
}

const usulan = (id) => D.usulan.find((u) => u.id === id);
const semuaModel = () =>
  D.usulan.concat([{ id: 'regresi', label: 'Regresi', m: D.regresi.m, c: D.regresi.c }]);

test('sepuluh tahap cocok dengan manifest & sintaks Problem Based Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-f/mpi-11.2'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.match(m.kicker, /Fase F/);
  assert.deepEqual(Array.from(ids(D.tahap)), [
    'orientasi',
    'organisasi',
    'selidikResidu',
    'selidikKriteria',
    'selidikTeknologi',
    'karya',
    'evaluasi',
    'terapkan',
    'refleksi',
    'selesai',
  ]);
  const sintaks = {
    orientasi: 'Sintaks 1',
    organisasi: 'Sintaks 2',
    selidikResidu: 'Sintaks 3',
    selidikKriteria: 'Sintaks 3',
    selidikTeknologi: 'Sintaks 3',
    karya: 'Sintaks 4',
    evaluasi: 'Sintaks 5',
  };
  Object.keys(sintaks).forEach((k) => {
    assert.ok(D[k], k + ': konten tahap ada');
    assert.ok(D[k].syntax.includes('Problem Based Learning'), k);
    assert.ok(D[k].syntax.includes(sintaks[k]), k + ' → ' + sintaks[k]);
    assert.ok(D[k].guru && D[k].goal && D[k].kicker && D[k].nextLabel, k + ': kepala lengkap');
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-f/mpi-11.2/index.html'), 'utf8');
  assert.match(html, /0 dari 10 tahap selesai/);
});

test('data proyek & sumbu: id unik, titik di dalam sumbu', () => {
  assert.equal(P.length, 10);
  assert.equal(new Set(ids(P)).size, 10);
  P.forEach((p) => {
    assert.ok(p.nama, p.id);
    assert.ok(p.x >= D.plot.x.min && p.x <= D.plot.x.max, p.id + ' x di sumbu');
    assert.ok(p.y >= D.plot.y.min && p.y <= D.plot.y.max, p.id + ' y di sumbu');
  });
});

test('regresi & garis usulan cocok dengan engine seksi 41', () => {
  const reg = E.regresiLinear(P);
  assert.ok(E.hampirSama(reg.m, D.regresi.m));
  assert.ok(E.hampirSama(reg.c, D.regresi.c));
  assert.ok(E.hampirSama(reg.jkr, D.regresi.jkr));
  assert.equal(E.fmtAngkaReg(reg.r2, 3), E.fmtAngkaReg(D.regresi.r2, 3));

  /* Dimas: melalui proyek pertama & terakhir. */
  const g = E.garisDuaTitik(P[0], P[P.length - 1]);
  assert.deepEqual([g.m, g.c], [usulan('dimas').m, usulan('dimas').c]);
  /* Sari: melewati empat titik. */
  const sari = usulan('sari');
  assert.equal(E.residuTitik(P, sari.m, sari.c).filter((t) => t.e === 0).length, 4);
  /* Raka: garis datar di rata-rata → Σe = 0. */
  const raka = usulan('raka');
  assert.equal(raka.m, 0);
  assert.equal(E.jumlahResidu(P, raka.m, raka.c), 0);

  /* Urutan JKR: regresi < Dimas < Sari < Raka (dipakai teks umpan balik). */
  const b = E.bandingkanModel(P, semuaModel());
  assert.deepEqual(Array.from(ids(b)), ['regresi', 'dimas', 'sari', 'raka']);
  assert.deepEqual(Array.from(b.map((x) => x.jkr)), [51, 79, 111, 1528.5]);
  assert.equal(E.modelTerbaik(P, D.usulan), D.selidikKriteria.tanyaBanding[0].correct);
  assert.equal(E.modelTerbaik(P, D.usulan), D.selidikKriteria.targetDari);
  assert.equal(E.modelTerbaik(P, semuaModel()), D.karya.tanyaModel.correct);

  /* Estimasi klien & jenis prediksi. */
  assert.equal(E.prediksiLinear(reg.m, reg.c, D.klien.sp), D.klien.estimasi);
  assert.equal(E.jenisPrediksi(D.klien.sp, P), D.karya.tanyaJenis.correct);
  assert.equal(E.jenisPrediksi(D.klien.spBesar, P), 'ekstrapolasi');
  assert.match(D.karya.tanyaBesar.tanya, new RegExp(String(E.prediksiLinear(2.5, 4, 60))));
});

test('orientasi: dugaan, rumusan masalah, umpan balik', () => {
  const O = D.orientasi;
  assert.equal(O.dugaan.length, 2);
  O.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan ' + q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan);
  });
  assertOptions(O.masalahOpsi, 'masalahOpsi');
  assert.ok(ids(O.masalahOpsi).includes(O.masalahCorrect));
  O.masalahOpsi.forEach((o) => assert.ok(O.masalahUmpan[o.id], 'umpan masalah ' + o.id));
  /* Estimasi garis usulan pada dugaan 2 sesuai perhitungan. */
  const d2 = O.dugaan[1];
  ['dimas', 'sari', 'raka'].forEach((id) => {
    const u = usulan(id);
    const label = d2.opsi.find((o) => o.id === id).label;
    assert.ok(label.startsWith(E.fmtAngkaReg(E.prediksiLinear(u.m, u.c, D.klien.sp)) + ' jam'), id);
  });
});

test('organisasi: peran, pemilahan tiga kategori, rencana', () => {
  const O = D.organisasi;
  assertOptions(O.peran, 'peran');
  assertSort(O.pilah, O.opsiPilah, 'pilah');
  assert.equal(O.rencana.length, 5);
  assert.equal(new Set(ids(O.rencana)).size, 5);
});

test('selidikResidu: kartu hitung terhadap garis Sari mencakup e positif, negatif, nol', () => {
  const S = D.selidikResidu;
  const g = usulan(S.garisHitung);
  const e = S.hitung.map((h) => {
    const p = P.find((x) => x.id === h.id);
    assert.ok(p, h.id + ' ada di proyek');
    assert.ok(h.hints.length >= 2);
    return E.residuTitik([p], g.m, g.c)[0].e;
  });
  assert.ok(e.some((v) => v > 0));
  assert.ok(e.some((v) => v < 0));
  assert.ok(e.some((v) => v === 0));
  assert.equal(e[0], 7, 'teks pertanyaan a1 menyebut +7');
  S.tanya.forEach((q) => assertGuided(q, q.id));
  assert.ok(S.temuan.length >= 3);
});

test('selidikKriteria: langkah Σe & JKR data mini cocok dengan engine', () => {
  const K = D.selidikKriteria;
  const M = K.mini;
  K.langkah.forEach((l) => {
    const g = M[l.garis];
    const nilai =
      l.ukuran === 'jkr'
        ? E.jumlahKuadratResidu(M.titik, g.m, g.c)
        : E.jumlahResidu(M.titik, g.m, g.c);
    assert.ok(l.temuan.includes(String(nilai)), l.id + ' → ' + nilai);
    assert.ok(l.hints.length >= 2, l.id);
  });
  assert.equal(E.jumlahResidu(M.titik, M.garisA.m, M.garisA.c), 0, 'garis A: Σe = 0');
  assert.ok(
    E.jumlahKuadratResidu(M.titik, M.garisB.m, M.garisB.c) <
      E.jumlahKuadratResidu(M.titik, M.garisA.m, M.garisA.c)
  );
  assert.equal(
    K.tanyaMini[0].correct,
    E.modelTerbaik(M.titik, [
      Object.assign({ id: 'A' }, M.garisA),
      Object.assign({ id: 'B' }, M.garisB),
    ])
  );
  K.tanyaMini.concat(K.tanyaBanding).forEach((q) => assertGuided(q, q.id));
});

test('selidikTeknologi & karya: pertanyaan penuntun lengkap; target lab dapat dicapai', () => {
  D.selidikTeknologi.tanya.forEach((q) => assertGuided(q, q.id));
  [D.karya.tanyaModel, D.karya.tanyaJenis, D.karya.tanyaBesar].forEach((q) =>
    assertGuided(q, q.id)
  );
  assert.ok(D.karya.estimasi.hints.length >= 2);
  /* Garis regresi bisa dicapai slider Lab Garis dan mengalahkan target. */
  const L = D.lab;
  const st = E.makeLineFitState(L.awal);
  E.lfAtur(st, 'm', D.regresi.m, L.rentangM);
  E.lfAtur(st, 'c', D.regresi.c, L.rentangC);
  assert.equal(st.m, D.regresi.m);
  assert.equal(st.c, D.regresi.c);
  const target = E.jumlahKuadratResidu(P, usulan('dimas').m, usulan('dimas').c);
  assert.ok(E.lfCatatRekor(st, P) < target);
  /* Garis awal lab masih jauh dari target (ada tantangan). */
  assert.ok(E.jumlahKuadratResidu(P, L.awal.m, L.awal.c) > target);
  assert.match(D.selidikTeknologi.rentangX, /^A2:A11$/);
});

test('evaluasi: pendapat tepat/keliru, simpulan unik dengan pengecoh', () => {
  const V = D.evaluasi;
  assertSort(V.pendapat, V.opsiPendapat, 'pendapat');
  assert.ok(V.pendapat.length >= 6);
  const benar = V.kalimat.map((k) => k.correct);
  assert.equal(new Set(benar).size, V.kalimat.length, 'potongan benar tidak dipakai ganda');
  benar.forEach((b) => assert.ok(ids(V.bank).includes(b)));
  assert.ok(V.bank.length > V.kalimat.length, 'ada pengecoh');
  assert.equal(new Set(ids(V.bank)).size, V.bank.length);
});

test('terapkan: bank soal cukup untuk komposisi acak & kunci cocok engine', () => {
  const T = D.terapkan;
  const soal = T.soal;
  assert.equal(new Set(ids(soal)).size, soal.length);
  const jenis = (s) => (s.type === 'choice' ? 'choice' : s.mode);
  let total = 0;
  Object.keys(T.komposisi).forEach((k) => {
    total += T.komposisi[k];
    assert.ok(soal.filter((s) => jenis(s) === k).length > T.komposisi[k], 'bank ' + k + ' cukup');
  });
  assert.equal(total, T.banyak);
  soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    if (s.type === 'choice') {
      assertOptions(s.options, s.id);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': kunci ada');
    } else {
      assert.equal(typeof s.jawab, 'number', s.id);
      assert.ok(s.hints.length >= 2 && s.reveal, s.id);
    }
    const c = s.cek;
    if (!c) return;
    if (c.tipe === 'jkrResidu') {
      const jkr = {};
      Object.keys(c.residu).forEach((k) => {
        jkr[k] = c.residu[k].reduce((a, e) => a + e * e, 0);
      });
      const min = Object.keys(jkr).sort((a, b) => jkr[a] - jkr[b])[0];
      assert.equal(s.correct, min, s.id);
    } else if (c.tipe === 'jkr' && c.jkr) {
      assert.equal(s.correct, Object.keys(c.jkr).sort((a, b) => c.jkr[a] - c.jkr[b])[0], s.id);
    } else if (c.tipe === 'jkr') {
      const pts = c.residu.map((e, i) => ({ x: i, y: e }));
      assert.equal(s.jawab, E.jumlahKuadratResidu(pts, 0, 0), s.id);
    } else if (c.tipe === 'jenis') {
      const pts = c.xs.map((x) => ({ x: x, y: 0 }));
      assert.equal(s.correct, E.jenisPrediksi(c.x, pts), s.id);
    } else if (c.tipe === 'r2') {
      assert.equal(s.correct, Object.keys(c.r2).sort((a, b) => c.r2[b] - c.r2[a])[0], s.id);
    } else if (c.tipe === 'residu' && s.type === 'choice') {
      const e = c.y - c.yTopi;
      const label = s.options.find((o) => o.id === s.correct).label;
      assert.ok(label.includes('e = ' + E.fmtAngkaReg(e)), s.id);
      assert.ok(label.includes(e < 0 ? 'bawah' : 'atas'), s.id);
    } else if (c.tipe === 'residu') {
      const yTopi = E.prediksiLinear(c.m, c.c, c.x);
      assert.equal(E.diagnosaResidu(s.jawab, c.y, yTopi), 'benar', s.id);
    } else if (c.tipe === 'prediksi') {
      assert.ok(E.hampirSama(s.jawab, E.prediksiLinear(c.m, c.c, c.x)), s.id);
    } else if (c.tipe === 'persamaan') {
      const label = s.options.find((o) => o.id === s.correct).label;
      assert.equal(label, E.fmtPersamaanRegresi(c.m, c.c), s.id);
    } else {
      assert.fail('tipe cek tidak dikenal: ' + c.tipe);
    }
  });
});

test('refleksi & selesai', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assert.ok(D.selesai.capaian.length >= 3);
  assert.ok(D.selesai.contoh.some((c) => c.isi === E.fmtPersamaanRegresi(2.5, 4)));
});

test('app.js mengacak setiap daftar pilihan jawaban murid', () => {
  [
    'ensureShuffledOrder(dugaanOrders,q.id,q.opsi)',
    "ensureShuffledOrder(State,'masalahOrder',DATA.orientasi.masalahOpsi)",
    "ensureShuffledOrder(State,'peranOrder',DATA.organisasi.peran)",
    "ensureSortStates(State,'pilahStates','pilahOrder',PILAH_ITEMS,DATA.organisasi.opsiPilah)",
    "ensureTapOrderState(State,'rencanaState',RENCANA_ITEMS,RENCANA_JAWAB)",
    "ensureListOrders('residuOrders',TANYA_RESIDU)",
    "ensureListOrders('kriteriaOrders',TANYA_KRITERIA)",
    "ensureListOrders('teknoOrders',TANYA_TEKNO)",
    "ensureListOrders('karyaOrders',TANYA_KARYA)",
    "ensureSortStates(State,'pendapatStates','pendapatOrder',PENDAPAT_ITEMS,DATA.evaluasi.opsiPendapat)",
    "ensureShuffledOrder(State,'bankOrder',DATA.evaluasi.bank)",
    'shuffleArray(optionIds(s.options))',
    "ensureShuffledOrder(State,'refleksiDiriOrder',DATA.refleksi.diriOpsi)",
  ].forEach((pola) => assert.ok(APP.includes(pola), 'app.js harus memuat: ' + pola));
  /* Pengacakan ulang saat reset. */
  assert.ok(APP.includes('functionclearState(){Store.reset();initExerciseArrays();}'));
});
