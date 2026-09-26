'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-11.3/data.js (koefisien korelasi &
 * kesesuaian model linear, Problem Based Learning): tahap cocok dengan
 * manifest & sintaks PBL, kunci arah/kekuatan/pola/keputusan tiap
 * pasangan metrik sama dengan engine seksi 50, langkah hitung r data mini
 * dan efek pencilan cocok dengan engine, setiap daftar pilihan punya id
 * unik dan cukup opsi untuk diacak, setiap opsi pertanyaan penuntun punya
 * umpan balik, kunci soal uji terap diverifikasi lewat metadata `cek`, dan
 * app.js mengacak setiap daftar pilihan jawaban murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-11.3/data.js']);
const D = E.DATA;
const tanpaSpasi = (s) => s.replace(/\s+/g, '').replace(/,\)/g, ')');
const APP = tanpaSpasi(fs.readFileSync(path.join(ROOT, 'fase-f/mpi-11.3/app.js'), 'utf8'));

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
}

const pasangan = (id) => D.pasangan.find((p) => p.id === id);
/* Id kelompok arah–kekuatan (sama dengan app.js kelompokPasangan). */
const kelompokId = (k) =>
  k.kekuatan === 'sangatLemah'
    ? 'sangatLemah'
    : k.kekuatan + k.arah.charAt(0).toUpperCase() + k.arah.slice(1);

test('sepuluh tahap cocok dengan manifest & sintaks Problem Based Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-f/mpi-11.3'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.match(m.kicker, /Fase F/);
  assert.deepEqual(Array.from(ids(D.tahap)), [
    'orientasi',
    'organisasi',
    'selidikArah',
    'selidikHitung',
    'selidikKesesuaian',
    'karya',
    'evaluasi',
    'terapkan',
    'refleksi',
    'selesai',
  ]);
  const sintaks = {
    orientasi: 'Sintaks 1',
    organisasi: 'Sintaks 2',
    selidikArah: 'Sintaks 3',
    selidikHitung: 'Sintaks 3',
    selidikKesesuaian: 'Sintaks 3',
    karya: 'Sintaks 4',
    evaluasi: 'Sintaks 5',
  };
  Object.keys(sintaks).forEach((k) => {
    assert.ok(D[k], k + ': konten tahap ada');
    assert.ok(D[k].syntax.includes('Problem Based Learning'), k);
    assert.ok(D[k].syntax.includes(sintaks[k]), k + ' → ' + sintaks[k]);
    assert.ok(D[k].guru && D[k].goal && D[k].kicker && D[k].nextLabel, k + ': kepala lengkap');
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-f/mpi-11.3/index.html'), 'utf8');
  assert.match(html, /0 dari 10 tahap selesai/);
  assert.match(html, /Koefisien Korelasi/);
});

test('pasangan metrik: data di sumbu, kunci sama dengan engine seksi 50', () => {
  assert.deepEqual(Array.from(ids(D.pasangan)), ['A', 'B', 'C', 'D']);
  const semuaId = [];
  D.pasangan.forEach((p) => {
    assert.ok(p.judul && p.xNama && p.yNama && p.ikon, p.id);
    assert.equal(p.titik.length, 10, p.id + ': 10 titik');
    p.titik.forEach((t) => {
      semuaId.push(t.id);
      assert.ok(t.x >= p.plot.x.min && t.x <= p.plot.x.max, t.id + ' x di sumbu');
      assert.ok(t.y >= p.plot.y.min && t.y <= p.plot.y.max, t.id + ' y di sumbu');
    });
    const h = E.keputusanModelLinear(p.titik);
    assert.equal(h.arah, p.kunci.arah, p.id + ' arah');
    assert.equal(h.kekuatan, p.kunci.kekuatan, p.id + ' kekuatan');
    assert.equal(h.pola, p.kunci.pola, p.id + ' pola');
    assert.equal(h.keputusan, p.kunci.keputusan, p.id + ' keputusan');
  });
  assert.equal(new Set(semuaId).size, semuaId.length, 'id titik unik');
  /* Keempat keputusan berbeda → satu pasangan per keputusan. */
  assert.equal(new Set(D.pasangan.map((p) => p.kunci.keputusan)).size, 4);
  /* Konflik kognitif: r C hampir setinggi r A. */
  const rA = E.rincianKorelasi(pasangan('A').titik).r;
  const rC = E.rincianKorelasi(pasangan('C').titik).r;
  assert.ok(rC > 0.95 && rA > 0.95);
  assert.equal(E.fmtAngkaReg(rA), '0,97');
  assert.equal(E.fmtAngkaReg(rC), '0,96');
  assert.equal(E.fmtAngkaReg(E.rincianKorelasi(pasangan('B').titik).r), '−0,59');
  assert.equal(E.fmtAngkaReg(E.rincianKorelasi(pasangan('D').titik).r), '0,04');
});

test('pencilan pasangan A: r turun dari ≈ 0,97 ke ≈ 0,57', () => {
  const A = pasangan('A');
  const pc = D.pencilan;
  assert.ok(pc.pencilan && pc.alasan && pc.nama);
  assert.ok(pc.x >= A.plot.x.min && pc.x <= A.plot.x.max);
  assert.ok(pc.y >= A.plot.y.min && pc.y <= A.plot.y.max);
  const semua = A.titik.concat([pc]);
  assert.equal(E.fmtAngkaReg(E.korelasiTanpa(semua, [])), '0,57');
  assert.equal(E.fmtAngkaReg(E.korelasiTanpa(semua, [pc.id])), '0,97');
  assert.match(D.selidikHitung.tanyaPencilan[0].opsi[0].label, /0,97.*0,57/);
});

test('orientasi: dugaan, rumusan masalah, umpan balik', () => {
  const O = D.orientasi;
  assert.equal(O.dugaan.length, 2);
  O.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan ' + q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan);
  });
  /* Pasangan paling layak = satu-satunya dengan keputusan 'layak'. */
  assert.equal(
    O.dugaan[0].baku,
    D.pasangan.find((p) => E.keputusanModelLinear(p.titik).keputusan === 'layak').id
  );
  assertOptions(O.masalahOpsi, 'masalahOpsi');
  assert.ok(ids(O.masalahOpsi).includes(O.masalahCorrect));
  O.masalahOpsi.forEach((o) => assert.ok(O.masalahUmpan[o.id], 'umpan masalah ' + o.id));
  assert.ok(O.tp && O.kriteria.length >= 3);
});

test('organisasi: peran, pemilahan tiga kategori, rencana', () => {
  const O = D.organisasi;
  assertOptions(O.peran, 'peran');
  assertSort(O.pilah, O.opsiPilah, 'pilah');
  O.opsiPilah.forEach((o) =>
    assert.ok(
      O.pilah.some((p) => p.correct === o.id),
      o.id
    )
  );
  assert.equal(O.rencana.length, 5);
  assert.equal(new Set(ids(O.rencana)).size, 5);
});

test('selidikArah: tebak r berbeda-beda, pertanyaan penuntun lengkap', () => {
  const S = D.selidikArah;
  assert.equal(S.tebak.length, 4);
  const rs = S.tebak.map((t) => t.r);
  assert.equal(new Set(rs).size, 4, 'nilai r tebakan unik');
  rs.forEach((r) => assert.ok(r >= -1 && r <= 1));
  /* Nilai r tebakan cukup berjauhan agar dapat dibedakan secara visual. */
  rs.forEach((a, i) => rs.forEach((b, j) => i !== j && assert.ok(Math.abs(a - b) >= 0.3)));
  /* Tebakan mencakup arah positif, negatif, dan hampir nol. */
  const arah = rs.map((r) => E.tafsirKorelasi(r).arah);
  ['positif', 'negatif', 'tidak'].forEach((a) => assert.ok(arah.includes(a), a));
  assert.ok(S.geserMinimal >= 3);
  S.tanya.forEach((q) => assertGuided(q, q.id));
  /* a2: kunci = r dengan |r| terbesar di antara nilai tebakan. */
  const terkuat = rs.slice().sort((a, b) => Math.abs(b) - Math.abs(a))[0];
  const a2 = S.tanya.find((q) => q.id === 'a2');
  assert.equal(a2.opsi.find((o) => o.id === a2.correct).label, 'r = ' + E.fmtAngkaReg(terkuat));
  assert.ok(S.temuan.length >= 3);
});

test('selidikHitung: langkah Sxy, Sxx, Syy, r data mini cocok dengan engine', () => {
  const H = D.selidikHitung;
  const R = E.rincianKorelasi(H.mini.titik);
  assert.match(H.instruksiMini, new RegExp('x̄ = ' + E.fmtAngkaReg(R.xBar)));
  assert.match(H.instruksiMini, new RegExp('ȳ = ' + E.fmtAngkaReg(R.yBar)));
  H.langkah.forEach((l) => {
    assert.ok(['sxy', 'sxx', 'syy'].includes(l.kunci), l.id);
    assert.ok(l.temuan.includes(E.fmtAngkaReg(R[l.kunci])), l.id + ' → ' + R[l.kunci]);
    assert.ok(l.hints.length >= 2, l.id);
  });
  assert.equal(R.r, 0.8);
  assert.match(H.langkahR.label, /16 : √\(10 × 40\)/);
  H.mini.titik.forEach((t) => {
    assert.ok(t.x >= H.mini.plot.x.min && t.x <= H.mini.plot.x.max);
    assert.ok(t.y >= H.mini.plot.y.min && t.y <= H.mini.plot.y.max);
  });
  /* Kelompok arah–kekuatan tiap pasangan tersedia sebagai opsi. */
  assertOptions(H.opsiKelompok, 'opsiKelompok', 4);
  D.pasangan.forEach((p) =>
    assert.ok(ids(H.opsiKelompok).includes(kelompokId(p.kunci)), p.id + ' ' + kelompokId(p.kunci))
  );
  H.tanyaPencilan.forEach((q) => assertGuided(q, q.id));
  assert.ok(H.temuan.length >= 3);
});

test('selidikKesesuaian: pola residu A & C cocok engine; pertanyaan lengkap', () => {
  const K = D.selidikKesesuaian;
  assertGuided(K.tanyaR2, K.tanyaR2.id);
  const A = E.keputusanModelLinear(pasangan('A').titik);
  assert.match(K.tanyaR2.tanya, new RegExp('r² ≈ ' + E.fmtAngkaReg(A.r2)));
  assert.match(
    K.tanyaR2.opsi.find((o) => o.id === K.tanyaR2.correct).label,
    new RegExp(Math.round(A.r2 * 100) + '%')
  );
  assertOptions(K.opsiPola, 'opsiPola', 3);
  K.opsiPola.forEach((o) => assert.ok(K.umpanPola[o.id], 'umpan pola ' + o.id));
  K.residuPasangan.forEach((id) => {
    const p = pasangan(id);
    assert.ok(p, id);
    assert.ok(ids(K.opsiPola).includes(p.kunci.pola));
  });
  assert.notEqual(
    pasangan(K.residuPasangan[0]).kunci.pola,
    pasangan(K.residuPasangan[1]).kunci.pola,
    'dua plot residu yang dibandingkan harus berbeda pola'
  );
  K.tanyaSesuai.forEach((q) => assertGuided(q, q.id));
  assert.ok(K.temuan.length >= 3);
});

test('karya: opsi keputusan = semua keputusan engine, umpan balik lengkap', () => {
  const K = D.karya;
  assertOptions(K.opsiKeputusan, 'opsiKeputusan', 4);
  assert.deepEqual(
    Array.from(ids(K.opsiKeputusan)).sort(),
    Object.keys(E.LABEL_KEPUTUSAN_LINEAR).sort()
  );
  K.opsiKeputusan.forEach((o) => assert.ok(K.umpanKeputusan[o.id], o.id));
  assert.ok(K.posterJudul && K.posterFooter && K.pesanLabel);
});

test('evaluasi: pendapat tepat/keliru, simpulan unik dengan pengecoh', () => {
  const V = D.evaluasi;
  assertSort(V.pendapat, V.opsiPendapat, 'pendapat');
  assert.ok(V.pendapat.length >= 6);
  assert.ok(V.pendapat.some((p) => p.correct === 'tepat'));
  assert.ok(V.pendapat.some((p) => p.correct === 'keliru'));
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
    const labelKunci = () => s.options.find((o) => o.id === s.correct).label;
    if (c.tipe === 'tafsir') {
      assert.equal(labelKunci().toLowerCase(), E.tafsirKorelasi(c.r).label, s.id);
    } else if (c.tipe === 'terkuat') {
      const k = Object.keys(c.r).sort((a, b) => Math.abs(c.r[b]) - Math.abs(c.r[a]))[0];
      assert.equal(s.correct, k, s.id);
    } else if (c.tipe === 'keputusan') {
      assert.equal(s.correct, E.keputusanModelLinear(c.titik).keputusan, s.id);
    } else if (c.tipe === 'rincian') {
      const r = c.sxy / Math.sqrt(c.sxx * c.syy);
      assert.ok(E.hampirSama(s.jawab, r), s.id);
      assert.equal(E.diagnosaKorelasi(s.jawab, Object.assign({ r: r }, c)), 'benar', s.id);
    } else if (c.tipe === 'r2') {
      assert.ok(E.hampirSama(s.jawab, c.r * c.r), s.id);
    } else if (c.tipe === 'persenR2') {
      assert.ok(E.hampirSama(s.jawab, c.r * c.r * 100), s.id);
    } else {
      assert.fail('tipe cek tidak dikenal: ' + c.tipe);
    }
  });
});

test('refleksi & selesai', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assert.ok(D.selesai.capaian.length >= 3);
  assert.ok(D.selesai.contoh.length >= 3);
});

test('app.js mengacak setiap daftar pilihan jawaban murid', () => {
  [
    'ensureShuffledOrder(dugaanOrders,q.id,q.opsi)',
    "ensureShuffledOrder(State,'masalahOrder',DATA.orientasi.masalahOpsi)",
    "ensureShuffledOrder(State,'peranOrder',DATA.organisasi.peran)",
    "ensureSortStates(State,'pilahStates','pilahOrder',PILAH_ITEMS,DATA.organisasi.opsiPilah)",
    "ensureTapOrderState(State,'rencanaState',RENCANA_ITEMS,RENCANA_JAWAB)",
    'ensureShuffledOrder(tebakOrders,t.id,OPSI_TEBAK)',
    "ensureListOrders('arahOrders',TANYA_ARAH)",
    "ensureSortStates(State,'kelompokStates','kelompokOrder',KELOMPOK_ITEMS,DATA.selidikHitung.opsiKelompok)",
    "ensureListOrders('pencilanOrders',TANYA_PENCILAN)",
    'ensureShuffledOrder(polaOrders,id,DATA.selidikKesesuaian.opsiPola)',
    "ensureListOrders('sesuaiOrders',TANYA_SESUAI)",
    'ensureShuffledOrder(keputusanOrders,p.id,DATA.karya.opsiKeputusan)',
    "ensureSortStates(State,'pendapatStates','pendapatOrder',PENDAPAT_ITEMS,DATA.evaluasi.opsiPendapat)",
    "ensureShuffledOrder(State,'bankOrder',DATA.evaluasi.bank)",
    'shuffleArray(optionIds(s.options))',
    "ensureShuffledOrder(State,'refleksiDiriOrder',DATA.refleksi.diriOpsi)",
  ].forEach((pola) => assert.ok(APP.includes(pola), 'app.js harus memuat: ' + pola));
  /* Pengacakan ulang saat reset. */
  assert.ok(APP.includes('functionclearState(){Store.reset();initExerciseArrays();}'));
});
