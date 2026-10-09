'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-3.3/data.js (Skala pada peta & denah,
 * Problem Based Learning): setiap `jawab` sama dengan jawabSoalSkala
 * (engine seksi 69) dan diterima pemeriksa, data peta/rute/denah saling
 * konsisten, opsi pilihan ganda uji terap yang dibangkitkan opsiSoalSkala
 * cukup banyak & unik, tahap mengikuti sintaks PBL dan sama dengan
 * manifest halaman. app.js juga dicek agar pilihan selalu dirender
 * dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-3.3/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-3.3', 'app.js'), 'utf8');
const JENIS = ['asli', 'peta', 'skala', 'konversi'];

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

function assertSort(items, options, name) {
  assertOptions(options, name + ': opsi');
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(it.teks && it.explanation, name + '.' + it.id + ': teks & penjelasan');
    assert.ok(ids(options).includes(it.correct), name + '.' + it.id + ': kategori benar ada');
  });
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Soal/langkah { cek, jawab }: jawab baku = engine, dan jawab diterima. */
function assertCek(s, name) {
  assert.ok(s.cek && JENIS.includes(s.cek.jenis), name + ': jenis cek dikenal');
  assert.equal(E.jawabSoalSkala(s), s.jawab, name + ': jawab = engine');
  assert.equal(E.periksaSoalSkala(s.jawab, s).benar, true, name + ': jawab diterima');
}

function assertLangkah(list, name, min) {
  assert.ok(list.length >= (min || 3), name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.ok(s.label, n + ': label');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, n + ': petunjuk');
    assertCek(s, n);
    if (E.jenisAngkaSkala(s.cek.jenis)) {
      assert.equal(s.satuan, E.satuanSoalSkala(s), n + ': satuan langkah = satuan jawaban');
    }
  });
}

test('sepuluh tahap PBL: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-3.3'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
    assert.match(APP, new RegExp('\\b' + t.id + ': render'), t.id + ': ada renderer');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  const sintaks = {
    orientasi: 1,
    organisasi: 2,
    selidikAsli: 3,
    selidikPeta: 3,
    selidikDenah: 3,
    karya: 4,
    evaluasi: 5,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Problem Based Learning · Sintaks ' + n, id);
  });
});

test('peta, rute, dan denah saling konsisten', () => {
  const P = D.peta;
  assert.equal(P.penyebut, 25000);
  P.tempat.forEach((t) => {
    assert.ok(t.x >= 0 && t.x <= P.lebar && t.y >= 0 && t.y <= P.tinggi, t.id + ': di dalam peta');
  });
  /* setiap jalan berpanjang cm bulat atau setengah agar mudah diukur */
  P.jalan.forEach((j) => {
    const cm = E.panjangJalanPeta(P, j.id);
    assert.equal((cm * 2) % 1, 0, j.id + ': panjang kelipatan 0,5 cm');
  });
  const km = (r) => E.jarakSebenarnyaSkala(E.panjangRutePeta(P, r.jalan), 'cm', P.penyebut, 'km');
  const sah = D.rute.filter((r) => r.museum && km(r) <= D.batasKm);
  assert.deepEqual(ids(sah), [D.karya.keputusan.correct], 'tepat satu rute memenuhi syarat');
  /* langkah karya memakai panjang rute dari peta */
  D.rute.forEach((r, i) => {
    assert.equal(D.karya.langkah[i].cek.jPeta, E.panjangRutePeta(P, r.jalan), r.id);
  });
  /* rute berawal di Balai Desa dan berakhir di Sentra Gerabah, jalannya bersambung */
  D.rute.forEach((r) => {
    let posisi = 'balai';
    r.jalan.forEach((id) => {
      const j = P.jalan.find((x) => x.id === id);
      assert.ok(j.dari === posisi || j.ke === posisi, r.id + ': jalan ' + id + ' bersambung');
      posisi = j.dari === posisi ? j.ke : j.dari;
    });
    assert.equal(posisi, 'gerabah', r.id + ': berakhir di Sentra Gerabah');
  });
  /* target stand dapat dicapai stepper Lab Denah */
  const N = D.denah;
  const st = { p: N.awal.p, l: N.awal.l };
  E.ensureDenahSkalaState(st, N);
  assert.deepEqual({ p: st.p, l: st.l }, { p: N.awal.p, l: N.awal.l });
  ['p', 'l'].forEach((k) => {
    const cm = E.jarakPetaSkala(N.target[k], 'm', N.penyebut, 'cm');
    assert.equal((cm / N.langkah) % 1, 0, k + ': target kelipatan langkah');
  });
});

test('orientasi: dugaan, rumusan masalah, dan panel tujuan', () => {
  const O = D.orientasi;
  assert.ok(O.catatanKelompok.length >= 3);
  assert.ok(O.kriteria.length >= 3);
  O.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
  });
  const jarak = O.dugaan.find((q) => q.id === 'dJarak');
  assert.equal(
    jarak.opsi.find((o) => o.id === jarak.baku).label,
    E.fmtAngkaRasio(E.jarakSebenarnyaSkala(4, 'cm', D.peta.penyebut, 'km')) + ' km'
  );
  assertOptions(O.masalahOpsi, 'masalahOpsi', 4);
  assert.ok(ids(O.masalahOpsi).includes(O.masalahCorrect));
  O.masalahOpsi.forEach((o) => assert.ok(O.masalahUmpan[o.id], 'umpan ' + o.id));
});

test('organisasi: peran, pemilahan, dan rencana kerja', () => {
  const O = D.organisasi;
  assertOptions(O.peran, 'peran', 4);
  assertSort(O.pilah, O.opsiPilah, 'pilah');
  ['asli', 'peta', 'skala'].forEach((k) =>
    assert.ok(
      O.pilah.some((p) => p.correct === k),
      'ada butir ' + k
    )
  );
  assertOptions(O.rencana, 'rencana', 4);
  assert.ok(O.rencanaSalah);
});

test('selidik A (Lab Peta): misi mengukur jalan nyata, langkah & temuan', () => {
  const S = D.selidikAsli;
  S.misi.forEach((m) =>
    assert.ok(
      D.peta.jalan.some((j) => j.id === m.id),
      m.id + ': jalan ada'
    )
  );
  assertLangkah(S.langkah, 'selidikAsli', 4);
  /* langkah yang menyebut panjang hasil ukur memakai panjang dari peta */
  const ukur = { la3: 'bm', la4: 'bm', la5: 'mg', la6: 'bt' };
  Object.entries(ukur).forEach(([id, jalan]) => {
    const l = S.langkah.find((x) => x.id === id);
    assert.equal(l.cek.jPeta, E.panjangJalanPeta(D.peta, jalan), id);
    assert.equal(l.cek.penyebut, D.peta.penyebut, id);
  });
  assertGuided(S.amati, 'amatiAsli', 2);
});

test('selidik B (jarak peta & skala): pembanding skala, langkah & temuan', () => {
  const S = D.selidikPeta;
  const B = S.banding;
  assert.ok(B.pilihan.length >= 3);
  const muat = B.pilihan.map((n) => E.ukuranGambarSkala(B, n).muat);
  assert.ok(muat.includes(true) && muat.includes(false), 'ada skala yang muat & yang tidak');
  assertLangkah(S.langkah, 'selidikPeta', 4);
  assert.ok(
    S.langkah.some((l) => l.cek.jenis === 'skala'),
    'ada langkah menentukan skala'
  );
  /* jalan Taman Bambu – Kebun Teh di peta = hasil langkah lp2 */
  const lp2 = S.langkah.find((l) => l.id === 'lp2');
  assert.equal(E.jawabSoalSkala(lp2), E.fmtAngkaRasio(E.panjangJalanPeta(D.peta, 'tk')));
  assertGuided(S.amati, 'amatiPeta', 2);
});

test('selidik C (Lab Denah): langkah konsisten dengan denah & temuan', () => {
  const S = D.selidikDenah;
  assertLangkah(S.langkah, 'selidikDenah', 4);
  S.langkah.forEach((l) => assert.equal(l.cek.penyebut, D.denah.penyebut, l.id));
  const p = S.langkah.find((l) => l.id === 'ld1');
  assert.equal(p.cek.jAsli, D.denah.ruang.p);
  const l = S.langkah.find((x) => x.id === 'ld2');
  assert.equal(l.cek.jAsli, D.denah.ruang.l);
  assertGuided(S.amati, 'amatiDenah', 2);
});

test('karya: langkah rute, keputusan berumpan balik', () => {
  const K = D.karya;
  assertLangkah(K.langkah, 'karya', 3);
  assertGuided([K.keputusan], 'keputusan');
  assert.ok(K.posterJudul && K.pesanLabel);
});

test('evaluasi: detektif, simpulan, rangkuman', () => {
  const V = D.evaluasi;
  assertSort(V.klaim, V.opsiDetektif, 'detektif');
  assert.ok(
    V.klaim.some((k) => k.correct === 'tepat'),
    'ada klaim yang sudah tepat'
  );
  assertOptions(V.bank, 'bank simpulan', V.kalimat.length + 1);
  const bank = ids(V.bank);
  V.kalimat.forEach((k) => assert.ok(bank.includes(k.correct), k.id + ': potongan ada di bank'));
  assert.equal(
    new Set(V.kalimat.map((k) => k.correct)).size,
    V.kalimat.length,
    'setiap potongan dipakai sekali'
  );
  assert.ok(V.rangkuman.length >= 3);
});

test('uji terap: bank soal, komposisi, kunci engine, dan opsi berpengecoh', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length, 'id soal unik');
  const komposisi = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(komposisi, T.banyak);
  Object.entries(T.komposisi).forEach(([tipe, n]) => {
    const ada = T.soal.filter((s) => s.type === tipe).length;
    assert.ok(ada >= n * 2, tipe + ': bank cukup untuk diacak (≥ 2× yang dipakai)');
  });
  T.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks dikenal');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks lengkap');
    assertCek(s, s.id);
    if (s.type === 'input') {
      assert.ok(s.hints && s.hints.length && s.reveal, s.id + ': petunjuk & pembahasan');
    } else {
      const opsi = E.opsiSoalSkala(s);
      assertOptions(opsi, s.id, 4);
      assert.equal(opsi[0].id, 'baku');
      opsi.forEach((o) => assert.ok(o.umpan, s.id + '.' + o.id + ': umpan'));
    }
  });
  ['asli', 'peta', 'skala'].forEach((j) =>
    assert.ok(
      T.soal.some((s) => s.cek.jenis === j),
      'bank memuat jenis ' + j
    )
  );
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 2);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.contoh.length >= 3);
  D.selesai.contoh.forEach((c) => assert.ok(D.konteks[c.konteks], 'konteks contoh'));
  assert.ok(D.selesai.capaian.length >= 3);
});

test('app.js mengacak setiap daftar pilihan sekali dan menyimpannya di State', () => {
  [
    /ensureListOrders\('dugaanOrders', DATA\.orientasi\.dugaan\)/,
    /ensureShuffledOrder\(State, 'masalahOrder', DATA\.orientasi\.masalahOpsi\)/,
    /ensureShuffledOrder\(State, 'peranOrder', DATA\.organisasi\.peran\)/,
    /ensureSortStates\(State, 'pilahStates', 'pilahOrder'/,
    /ensureTapOrderState\(State, 'rencana', RENCANA_ITEMS, RENCANA_JAWAB\)/,
    /ensureListOrders\('amatiAsliOrders', DATA\.selidikAsli\.amati\)/,
    /ensureListOrders\('amatiPetaOrders', DATA\.selidikPeta\.amati\)/,
    /ensureListOrders\('amatiDenahOrders', DATA\.selidikDenah\.amati\)/,
    /ensureShuffledOrder\(State, 'keputusanOrder', DATA\.karya\.keputusan\.opsi\)/,
    /ensureSortStates\([\s\S]*?'detektifStates'/,
    /ensureShuffledOrder\(State, 'bankOrder', DATA\.evaluasi\.bank\)/,
    /shuffleArray\(optionIds\(s\.options\)\)/,
    /ensureShuffledOrder\(State, 'refleksiDiriOrder', DATA\.refleksi\.diriOpsi\)/,
    /function pilihSoalTerap\(\)[\s\S]*?shuffleArray/,
    /opsiSoalSkala\(/,
    /buildPetaSkala\(/,
    /buildPembandingSkala\(/,
    /buildDenahSkala\(/,
    /buildLangkahRasio\(/,
    /siapkanLangkahSkala/,
  ].forEach((re) => assert.match(APP, re, String(re)));
  assert.match(APP, /mpi-d-3-3-/);
});
