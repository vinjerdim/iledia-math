'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-1.3/data.js (deret aritmetika & rumus
 * jumlah n suku pertama, Problem Based Learning): tahap cocok dengan
 * manifest & sintaks PBL, kunci masalah pemantik dan setiap langkah
 * dihitung ulang dengan engine seksi 21 & 42, setiap daftar pilihan punya
 * id unik dan cukup opsi untuk diacak, setiap opsi pertanyaan penuntun
 * punya umpan balik, soal uji terap diverifikasi lewat metadata `cek` /
 * `gen`, dan app.js mengacak setiap daftar pilihan jawaban murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-1.3/data.js']);
const D = E.DATA;
const M = D.masalah;
const tanpaSpasi = (s) => s.replace(/\s+/g, '').replace(/,\)/g, ')');
const APP = tanpaSpasi(fs.readFileSync(path.join(ROOT, 'fase-f/mpi-1.3/app.js'), 'utf8'));

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
  assert.deepEqual(
    Array.from(Object.keys(q.umpan)).sort(),
    Array.from(ids(q.opsi)).sort(),
    name + ': umpan hanya untuk opsi yang ada'
  );
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

test('sepuluh tahap cocok dengan manifest & sintaks Problem Based Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-f/mpi-1.3'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.match(m.kicker, /Fase F/);
  assert.deepEqual(Array.from(ids(D.tahap)), [
    'orientasi',
    'organisasi',
    'selidikKonsep',
    'selidikPasangan',
    'selidikRumus',
    'karya',
    'evaluasi',
    'terapkan',
    'refleksi',
    'selesai',
  ]);
  const sintaks = {
    orientasi: 'Sintaks 1',
    organisasi: 'Sintaks 2',
    selidikKonsep: 'Sintaks 3',
    selidikPasangan: 'Sintaks 3',
    selidikRumus: 'Sintaks 3',
    karya: 'Sintaks 4',
    evaluasi: 'Sintaks 5',
  };
  Object.keys(sintaks).forEach((k) => {
    assert.ok(D[k], k + ': konten tahap ada');
    assert.ok(D[k].syntax.includes('Problem Based Learning'), k);
    assert.ok(D[k].syntax.includes(sintaks[k]), k + ' → ' + sintaks[k]);
    assert.ok(D[k].guru && D[k].goal && D[k].kicker && D[k].nextLabel, k + ': kepala lengkap');
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-f/mpi-1.3/index.html'), 'utf8');
  assert.match(html, /0 dari 10 tahap selesai/);
  assert.match(html, /Deret Aritmetika/);
});

test('masalah pemantik: kunci cocok dengan engine seksi 21 & 42', () => {
  assert.equal(E.sukuAritmetika(M.a, M.b, M.hari), M.u30);
  assert.equal(E.jumlahAritmetika(M.a, M.b, M.hari), M.s30);
  assert.equal(E.jumlahAritmetikaUjung(M.a, M.u30, M.hari), M.s30);
  assert.equal(E.nMinimalJumlahMencapai(M.a, M.b, M.target), M.nTarget);
  assert.equal(E.jumlahAritmetika(M.a, M.b, M.hariSetahun), M.s365);
  assert.ok(M.nTarget <= D.karya.labMaks, 'hari target dapat dicapai slider lab');
  /* Usulan Dimas & Raka memang miskonsepsi yang dikenali diagnosa. */
  D.usulan.forEach((u) => {
    if (!u.pola) return;
    const nilai = E.opsiJumlahDeret(M.a, M.b, M.hari).find((o) => o.id === u.pola).nilai;
    assert.equal(E.diagnosaJumlahDeret(M.a, M.b, M.hari, nilai), u.pola, u.id);
  });
  /* Angka yang disebut di teks sesuai perhitungan. */
  assert.match(D.orientasi.dugaan[0].opsi.find((o) => o.id === 'dimas').label, /4\.800/);
  assert.match(D.orientasi.dugaan[0].opsi.find((o) => o.id === 'raka').label, /5\.250/);
  assert.match(D.orientasi.dugaan[0].pembahasan, new RegExp(E.fmtAngkaDeret(M.s30)));
  assert.match(D.karya.tanyaSetahun.umpan.rumus, new RegExp(E.fmtAngkaDeret(M.s365)));
  assert.match(
    D.karya.langkahTarget.temuan,
    new RegExp(E.fmtAngkaDeret(E.jumlahAritmetika(M.a, M.b, M.nTarget - 1)))
  );
  assert.match(
    D.karya.langkahTarget.temuan,
    new RegExp(E.fmtAngkaDeret(E.jumlahAritmetika(M.a, M.b, M.nTarget)))
  );
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
});

test('organisasi: peran, pemilahan tiga kategori, rencana', () => {
  const O = D.organisasi;
  assertOptions(O.peran, 'peran');
  assertSort(O.pilah, O.opsiPilah, 'pilah');
  assert.equal(O.rencana.length, 5);
  assert.equal(new Set(ids(O.rencana)).size, 5);
});

test('selidikKonsep: pertanyaan penuntun & pemilahan barisan/deret cocok dengan jenisDeret', () => {
  const K = D.selidikKonsep;
  K.tanya.forEach((q) => assertGuided(q, q.id));
  /* Angka pada pertanyaan a2 & a3 sesuai jumlah berjalan deret XP. */
  const suku = E.daftarSuku('aritmetika', M.a, M.b, K.hariTabel);
  const s = E.jumlahBerjalan(suku);
  assert.equal(s[4], 125, 'S₅ = 125');
  assert.equal(s[3], 90, 'S₄ = 90');
  assert.equal(suku[5], 40, 'U₆ = 40');
  assert.ok(K.hintsTabel.length >= 2);
  assertSort(K.pilah, K.opsiPilah, 'pilah deret');
  K.pilah.forEach((it) => {
    const aritmetika = E.jenisDeret(it.suku) === 'aritmetika';
    if (it.correct === 'bukan') assert.ok(!aritmetika, it.id + ' bukan aritmetika');
    else assert.ok(aritmetika, it.id + ' aritmetika');
    const pakaiPlus = it.teks.includes('+');
    if (it.correct === 'deret') assert.ok(pakaiPlus, it.id + ': deret ditulis dengan +');
    if (it.correct === 'barisan') assert.ok(!pakaiPlus, it.id + ': barisan ditulis dengan koma');
  });
});

test('selidikPasangan: langkah 2S₆ & S₆ cocok dengan pasangan Gauss', () => {
  const P = D.selidikPasangan;
  const suku = E.daftarSuku('aritmetika', M.a, M.b, P.hari);
  const pas = E.pasanganGauss(suku);
  const nilai = pas[0].jumlah;
  assert.ok(pas.every((p) => p.jumlah === nilai));
  const duaS = P.hari * nilai;
  const S = E.jumlahAritmetika(M.a, M.b, P.hari);
  assert.equal(duaS, 2 * S);
  const kunci = { duaS: duaS, S: S };
  P.langkah.forEach((l) => {
    assert.ok(l.temuan.includes(String(kunci[l.ukuran])), l.id + ' → ' + kunci[l.ukuran]);
    assert.ok(l.label.includes(String(nilai)) || l.ukuran === 'S', l.id);
    assert.ok(l.hints.length >= 2, l.id);
  });
  /* S₆ di tahap ini sama dengan S₆ tabel tahap sebelumnya. */
  assert.equal(S, E.jumlahBerjalan(E.daftarSuku('aritmetika', M.a, M.b, 6))[5]);
  /* Contoh banyak suku ganjil pada b3. */
  const g = P.contohGanjil;
  assert.equal(g.length % 2, 1);
  assert.equal(E.jenisDeret(g), 'aritmetika');
  const sg = g.reduce((x, y) => x + y, 0);
  const tetap = P.tanya.find((q) => q.id === 'b3').opsi.find((o) => o.id === 'tetap').label;
  assert.ok(tetap.includes('= ' + sg), 'S ganjil = ' + sg);
  assert.ok(tetap.includes(String(E.pasanganGauss(g)[0].jumlah)));
  P.tanya.forEach((q) => assertGuided(q, q.id));
});

test('selidikRumus: pertanyaan lengkap, uji cara Dimas & Raka gagal, rumus cocok', () => {
  const R = D.selidikRumus;
  R.tanyaRakit.concat([R.tanyaUji, R.tanyaKode]).forEach((q) => assertGuided(q, q.id));
  assert.equal(R.uji[0].pola, null);
  for (let n = 1; n <= R.ujiN; n++) {
    const manual = E.jumlahBerjalan(E.daftarSuku('aritmetika', M.a, M.b, n))[n - 1];
    assert.equal(E.jumlahAritmetika(M.a, M.b, n), manual);
  }
  /* Dimas cocok hanya pada n = 1, Raka tidak pernah cocok. */
  const dimas = (n) => n * E.sukuAritmetika(M.a, M.b, n);
  const raka = (n) => n * (M.a + E.sukuAritmetika(M.a, M.b, n));
  assert.equal(dimas(1), E.jumlahAritmetika(M.a, M.b, 1));
  for (let n = 2; n <= R.ujiN; n++) assert.notEqual(dimas(n), E.jumlahAritmetika(M.a, M.b, n));
  for (let n = 1; n <= R.ujiN; n++) assert.notEqual(raka(n), E.jumlahAritmetika(M.a, M.b, n));
  R.uji.slice(1).forEach((u) => {
    assert.ok(
      E.opsiJumlahDeret(M.a, M.b, 5).some((o) => o.id === u.pola),
      u.id
    );
  });
  /* Badan fungsi JS yang benar memang menghitung Sₙ. */
  const benar = R.tanyaKode.opsi.find((o) => o.id === R.tanyaKode.correct).label;
  // eslint-disable-next-line no-new-func
  const fn = new Function('a', 'b', 'n', benar);
  R.kodeUji.forEach((k) => assert.equal(fn(M.a, M.b, k.n), E.jumlahAritmetika(M.a, M.b, k.n)));
  R.tanyaKode.opsi
    .filter((o) => o.id !== R.tanyaKode.correct)
    .forEach((o) => {
      // eslint-disable-next-line no-new-func
      const salah = new Function('a', 'b', 'n', o.label);
      assert.notEqual(salah(M.a, M.b, 30), M.s30, o.id);
    });
});

test('karya: langkah, lab, pertanyaan setahun', () => {
  const K = D.karya;
  assert.ok(K.langkahSuku.hints.length >= 2 && K.langkahSuku.temuan.includes(String(M.u30)));
  assert.ok(K.hintsJumlah.length >= 2);
  assert.ok(K.langkahTarget.hints.length >= 2);
  assertGuided(K.tanyaSetahun, 'k1');
  assert.ok(K.pesanLabel && K.posterJudul);
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
  /* Angka pada pendapat Yoga (nb) sesuai diagnosa. */
  const yoga = V.pendapat.find((p) => p.id === 'e7').explanation;
  const nb = E.opsiJumlahDeret(M.a, M.b, M.hari).find((o) => o.id === 'n-bukan-n-kurang-1');
  assert.ok(yoga.includes(nb.label), 'S₃₀ versi nb = ' + nb.label);
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
    if (s.type === 'choice' && s.gen) {
      const g = s.gen;
      const opsi = E.opsiJumlahDeret(g.a, g.b, g.n, { satuan: g.satuan });
      assertOptions(opsi, s.id + ' (gen)');
      assert.ok(!s.options && !s.correct, s.id + ': opsi gen dibangkitkan app.js');
      assert.ok(
        s.explanation.includes(E.fmtAngkaDeret(E.jumlahAritmetika(g.a, g.b, g.n))),
        s.id + ': penjelasan memuat kunci'
      );
      return;
    }
    if (s.type === 'choice') {
      assertOptions(s.options, s.id);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': kunci ada');
    } else {
      assert.equal(typeof s.jawab, 'number', s.id);
      assert.ok(s.hints.length >= 2 && s.reveal, s.id);
    }
    const c = s.cek;
    if (!c) return;
    if (c.tipe === 'jenis') {
      Object.keys(c.suku).forEach((k) => {
        const aritmetika = E.jenisDeret(c.suku[k]) === 'aritmetika';
        assert.equal(aritmetika, k === s.correct, s.id + ' ' + k);
        const label = s.options.find((o) => o.id === k).label;
        assert.equal(label, c.suku[k].join(' + '), s.id + ' label ' + k);
      });
    } else if (c.tipe === 'selisih' && s.type === 'choice') {
      const label = s.options.find((o) => o.id === s.correct).label;
      assert.ok(label.startsWith(String(c.sn - c.snm1) + ' '), s.id);
    } else if (c.tipe === 'selisih') {
      assert.equal(s.jawab, c.sn - c.snm1, s.id);
    } else if (c.tipe === 'jumlah') {
      assert.equal(s.jawab, E.jumlahAritmetika(c.a, c.b, c.n), s.id);
      assert.equal(E.diagnosaJumlahDeret(c.a, c.b, c.n, s.jawab), null, s.id);
    } else if (c.tipe === 'ujung') {
      assert.equal(s.jawab, E.jumlahAritmetikaUjung(c.a, c.un, c.n), s.id);
    } else if (c.tipe === 'nMin') {
      assert.equal(s.jawab, E.nMinimalJumlahMencapai(c.a, c.b, c.target), s.id);
    } else {
      assert.fail('tipe cek tidak dikenal: ' + c.tipe);
    }
  });
});

test('refleksi & selesai', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assert.ok(D.selesai.capaian.length >= 3);
  assert.ok(D.selesai.contoh.some((c) => c.isi.includes(E.fmtAngkaDeret(M.s30))));
});

test('app.js mengacak setiap daftar pilihan jawaban murid', () => {
  [
    'ensureShuffledOrder(dugaanOrders,q.id,q.opsi)',
    "ensureShuffledOrder(State,'masalahOrder',DATA.orientasi.masalahOpsi)",
    "ensureShuffledOrder(State,'peranOrder',DATA.organisasi.peran)",
    "ensureSortStates(State,'pilahStates','pilahOrder',PILAH_ITEMS,DATA.organisasi.opsiPilah)",
    "ensureTapOrderState(State,'rencanaState',RENCANA_ITEMS,RENCANA_JAWAB)",
    "ensureListOrders('konsepOrders',TANYA_KONSEP)",
    "ensureSortStates(State,'deretStates','deretOrder',DERET_ITEMS,DATA.selidikKonsep.opsiPilah)",
    "ensureListOrders('pasanganOrders',TANYA_PASANGAN)",
    "ensureListOrders('rumusOrders',TANYA_RUMUS)",
    "ensureListOrders('karyaOrders',TANYA_KARYA)",
    "ensureSortStates(State,'pendapatStates','pendapatOrder',PENDAPAT_ITEMS,DATA.evaluasi.opsiPendapat)",
    "ensureShuffledOrder(State,'bankOrder',DATA.evaluasi.bank)",
    'shuffleArray(optionIds(s.options))',
    "ensureShuffledOrder(State,'refleksiDiriOrder',DATA.refleksi.diriOpsi)",
  ].forEach((pola) => assert.ok(APP.includes(pola), 'app.js harus memuat: ' + pola));
  /* Opsi soal gen dibangkitkan dari engine sebelum diacak. */
  assert.ok(APP.includes('opsiJumlahDeret('), 'soal gen memakai opsiJumlahDeret');
  /* Pengacakan ulang saat reset. */
  assert.ok(APP.includes('functionclearState(){Store.reset();initExerciseArrays();}'));
});
