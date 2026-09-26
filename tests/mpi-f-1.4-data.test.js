'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-1.4/data.js (proyek mini barisan &
 * deret aritmetika, Project Based Learning): tahap cocok dengan manifest &
 * sintaks PjBL, kunci setiap brief proyek dihitung ulang dengan engine
 * seksi 21, 42 & 43, rentang lab perencana memuat kunci, setiap daftar
 * pilihan punya id unik dan cukup opsi untuk diacak, setiap opsi
 * pertanyaan penuntun punya umpan balik, kode opsi diuji dengan menjalankan
 * fungsinya, kasus uji membedakan kode benar & berbug, klaim sejawat dan
 * soal uji terap diverifikasi lewat metadata `cek` / `gen`, dan app.js
 * mengacak setiap daftar pilihan jawaban murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-1.4/data.js']);
const D = E.DATA;
const tanpaSpasi = (s) => s.replace(/\s+/g, '').replace(/,\)/g, ')');
const APP = tanpaSpasi(fs.readFileSync(path.join(ROOT, 'fase-f/mpi-1.4/app.js'), 'utf8'));

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

function fmtBrief(br, v) {
  return br.rupiah ? E.formatRupiah(v) : E.fmtAngkaDeret(v);
}

test('sepuluh tahap cocok dengan manifest & sintaks Project Based Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-f/mpi-1.4'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Project Based Learning/);
  assert.match(m.kicker, /Fase F/);
  assert.deepEqual(Array.from(ids(D.tahap)), [
    'pertanyaan',
    'rencana',
    'jadwal',
    'modelMat',
    'prototipe',
    'ujiKasus',
    'pameran',
    'terapkan',
    'refleksi',
    'selesai',
  ]);
  const sintaks = {
    pertanyaan: 'Sintaks 1',
    rencana: 'Sintaks 2',
    jadwal: 'Sintaks 3',
    modelMat: 'Sintaks 4',
    prototipe: 'Sintaks 4',
    ujiKasus: 'Sintaks 4',
    pameran: 'Sintaks 5',
    refleksi: 'Sintaks 6',
  };
  Object.keys(sintaks).forEach((k) => {
    assert.ok(D[k], k + ': konten tahap ada');
    assert.ok(D[k].syntax.includes('Project Based Learning'), k);
    assert.ok(D[k].syntax.includes(sintaks[k]), k + ' → ' + sintaks[k]);
    assert.ok(D[k].guru && D[k].goal && D[k].kicker && D[k].nextLabel, k + ': kepala lengkap');
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-f/mpi-1.4/index.html'), 'utf8');
  assert.match(html, /0 dari 10 tahap selesai/);
  assert.match(html, /Proyek Mini/);
  /* Card terdaftar di beranda: Fase F → Kelas XI → Topik 1. */
  const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(
    index,
    /href="fase-f\/mpi-1\.4\/index\.html"[\s\S]*?data-kelas="XI"[\s\S]*?data-topik="1"/
  );
});

test('milestone kanban sesuai tahap monitoring', () => {
  assert.deepEqual(Array.from(ids(D.milestone)), ['modelMat', 'prototipe', 'ujiKasus', 'pameran']);
  D.milestone.forEach((m) => assert.ok(m.label && m.ikon, m.id));
});

test('brief proyek: kunci cocok dengan engine & rentang lab memuat kunci', () => {
  assert.equal(D.brief.length, 3);
  assert.equal(new Set(ids(D.brief)).size, 3);
  const jenisLanjutan = new Set();
  D.brief.forEach((br) => {
    const h = E.hitungBriefDeret(br);
    assert.equal(br.kunci.un, h.un, br.id + ' Uₙ');
    assert.equal(br.kunci.sn, h.sn, br.id + ' Sₙ');
    assert.equal(br.kunci.nTarget, h.nTarget, br.id + ' n target');
    assert.equal(br.kunci.lanjutan, h.lanjutan, br.id + ' lanjutan');
    jenisLanjutan.add(br.lanjutan.jenis);

    /* Rentang slider memuat a, b awal, n target, dan n tenggat. */
    const L = br.lab;
    ['a', 'b', 'n'].forEach((k) => {
      assert.ok(L[k].min < L[k].max && L[k].step > 0, br.id + ' lab ' + k);
    });
    const dalam = (v, r) => v >= r.min && v <= r.max && Math.abs(((v - r.min) / r.step) % 1) < 1e-9;
    assert.ok(dalam(br.a, L.a), br.id + ': a di slider');
    assert.ok(dalam(br.b, L.b), br.id + ': b di slider');
    assert.ok(dalam(h.nTarget, L.n), br.id + ': n target di slider');
    assert.ok(dalam(br.lanjutan.n, L.n), br.id + ': n tenggat di slider');
    const kunciLanjutan = br.lanjutan.jenis === 'sukuMin' ? 'a' : 'b';
    assert.ok(dalam(h.lanjutan, L[kunciLanjutan]), br.id + ': kunci lanjutan di slider');
    assert.equal(br.lanjutan.ubah, kunciLanjutan, br.id + ': slider yang diubah');

    /* Teks brief menyebut angka yang dipakai. */
    [br.a, br.b, br.target].forEach((v) =>
      assert.ok(br.pesan.includes(fmtBrief(br, v)), br.id + ' pesan memuat ' + fmtBrief(br, v))
    );
    assert.ok(br.tanya.suku.includes('ke-' + br.nSuku), br.id + ' tanya suku');
    assert.ok(br.tanya.jumlah.includes(String(br.nJumlah)), br.id + ' tanya jumlah');
    assert.ok(br.tanya.target.includes(fmtBrief(br, br.target)), br.id + ' tanya target');
    assert.ok(br.tanya.lanjutan.includes(String(br.lanjutan.n)), br.id + ' tanya lanjutan');
    ['a', 'b', 'n', 'target'].forEach((k) => assert.ok(br.makna[k], br.id + ' makna ' + k));
    assert.ok(br.satuan && br.periode && br.ikon && br.judul && br.klien, br.id);
  });
  assert.equal(jenisLanjutan.size, 3, 'ketiga jenis fitur lanjutan terwakili');
});

test('pertanyaan mendasar: pemanasan, pertanyaan inti, pemilahan pertanyaan klien', () => {
  const P = D.pertanyaan;
  P.pemanasan.forEach((q) => assertGuided(q, q.id));
  assertGuided(P.inti, 'inti');
  assertSort(P.pilah, P.opsiPilah, 'pilah pertanyaan');
  assert.ok(P.pilah.length >= 6);
  assert.ok(P.pertanyaanMendasar && P.pesan);
});

test('rencana: peran, pemetaan fitur → strategi', () => {
  const R = D.rencana;
  assertOptions(R.peran, 'peran');
  assertSort(R.fitur, R.opsiFitur, 'fitur');
  assert.equal(R.fitur.length, R.opsiFitur.length, 'satu strategi untuk tiap fitur');
  assert.ok(R.briefLabel && R.petaJudul);
});

test('jadwal: milestone berurutan & pertanyaan penuntun', () => {
  const J = D.jadwal;
  assert.equal(J.urutan.length, 5);
  assert.equal(new Set(ids(J.urutan)).size, 5);
  J.tanya.forEach((q) => assertGuided(q, q.id));
});

test('modelMat: pertanyaan cek kewajaran benar untuk setiap brief', () => {
  const M = D.modelMat;
  M.tanya.forEach((q) => assertGuided(q, q.id));
  /* n × a ≤ Sₙ ≤ n × Uₙ untuk setiap brief (barisan naik). */
  D.brief.forEach((br) => {
    const n = br.nJumlah;
    const sn = E.jumlahAritmetika(br.a, br.b, n);
    assert.ok(n * br.a <= sn && sn <= n * E.sukuAritmetika(br.a, br.b, n), br.id);
  });
});

test('prototipe: badan fungsi kapanTercapai diuji dengan menjalankannya', () => {
  const P = D.prototipe;
  assertGuided(P.tanyaKode, 'kode');
  const benar = P.tanyaKode.opsi.find((o) => o.id === P.tanyaKode.correct).label;
  // eslint-disable-next-line no-new-func
  const fn = new Function('a', 'b', 'target', benar);
  D.brief.forEach((br) => assert.equal(fn(br.a, br.b, br.target), br.kunci.nTarget, br.id));
  P.tanyaKode.opsi
    .filter((o) => o.id !== P.tanyaKode.correct)
    .forEach((o) => {
      // eslint-disable-next-line no-new-func
      const salah = new Function('a', 'b', 'target', o.label);
      D.brief.forEach((br) =>
        assert.notEqual(salah(br.a, br.b, br.target), br.kunci.nTarget, o.id + ' ' + br.id)
      );
    });
  assert.ok(P.instruksiLab && P.instruksiLanjutan);
});

test('ujiKasus: kasus uji membedakan kode benar dan berbug', () => {
  const U = D.ujiKasus;
  assert.ok(U.kasus.length >= 4);
  assert.equal(new Set(ids(U.kasus)).size, U.kasus.length);
  const implIds = ids(E.IMPLEMENTASI_JUMLAH_DERET);
  assert.equal(U.impls.length, 3);
  U.impls.forEach((im) => assert.ok(implIds.includes(im.id) && im.nama, im.id));
  const lulusSemua = U.impls.filter((im) =>
    E.jalankanKasusUji(im.id, U.kasus).every((h) => h.lulus)
  );
  assert.equal(lulusSemua.length, 1, 'tepat satu kode lolos semua kasus');
  U.impls.forEach((im) => {
    const h = E.jalankanKasusUji(im.id, U.kasus);
    const r = E.ringkasHasilUji(h);
    if (im.id !== lulusSemua[0].id) {
      assert.ok(r.lulus >= 1, im.id + ': lolos minimal satu kasus (jebakan)');
      assert.ok(r.lulus < r.total, im.id + ': gagal minimal satu kasus');
    }
  });
  /* Kasus brief (a, b, nJumlah) juga menggagalkan kode berbug. */
  D.brief.forEach((br) => {
    U.impls.forEach((im) => {
      const h = E.jalankanKasusUji(im.id, [{ id: 'x', a: br.a, b: br.b, n: br.nJumlah }]);
      assert.equal(h[0].lulus, im.id === lulusSemua[0].id, br.id + ' ' + im.id);
    });
  });
  U.tanya.forEach((q) => assertGuided(q, q.id));
  assert.equal(U.tanya[0].correct, lulusSemua[0].id, 'kode yang di-merge = yang lolos semua');
  U.kasus.forEach((k) => assert.ok(k.hints && k.hints.length >= 1, k.id));
});

test('pameran: klaim sejawat diverifikasi engine & rubrik penilaian diri', () => {
  const P = D.pameran;
  assertSort(P.sejawat, P.opsiSejawat, 'sejawat');
  assert.ok(P.sejawat.length >= 6);
  P.sejawat.forEach((it) => {
    const c = it.cek;
    if (!c) return;
    let nilai;
    if (c.tipe === 'suku') nilai = E.sukuAritmetika(c.a, c.b, c.n);
    else if (c.tipe === 'jumlah') nilai = E.jumlahAritmetika(c.a, c.b, c.n);
    else if (c.tipe === 'nMin') nilai = E.nMinimalJumlahMencapai(c.a, c.b, c.target);
    else assert.fail('tipe cek tidak dikenal: ' + c.tipe);
    assert.equal(it.correct, nilai === c.klaim ? 'benar' : 'keliru', it.id);
    assert.ok(it.explanation.includes(E.fmtAngkaDeret(nilai)), it.id + ': penjelasan memuat kunci');
  });
  P.rubrik.forEach((r) => assertOptions(r.opsi, 'rubrik ' + r.id, 3));
  assert.ok(P.posterJudul && P.pesanLabel);
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
      const opts = { satuan: g.satuan, format: g.rupiah ? E.formatRupiah : undefined };
      let opsi;
      let kunci;
      if (g.tipe === 'jumlah') {
        opsi = E.opsiJumlahDeret(g.a, g.b, g.n, opts);
        kunci = E.jumlahAritmetika(g.a, g.b, g.n);
      } else if (g.tipe === 'suku') {
        opsi = E.opsiSukuDeret(g.a, g.b, g.n, opts);
        kunci = E.sukuAritmetika(g.a, g.b, g.n);
      } else if (g.tipe === 'nMin') {
        opsi = E.opsiNMinimal(g.a, g.b, g.target, opts);
        kunci = E.nMinimalJumlahMencapai(g.a, g.b, g.target);
      } else {
        assert.fail('tipe gen tidak dikenal: ' + g.tipe);
      }
      assertOptions(opsi.slice(0, 4), s.id + ' (gen)');
      assert.ok(!s.options && !s.correct, s.id + ': opsi gen dibangkitkan app.js');
      const teks = g.rupiah ? E.formatRupiah(kunci) : E.fmtAngkaDeret(kunci);
      assert.ok(s.explanation.includes(teks), s.id + ': penjelasan memuat kunci ' + teks);
      return;
    }
    let kunci = s.jawab;
    if (s.type === 'choice') {
      assertOptions(s.options, s.id);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': kunci ada');
    } else {
      assert.equal(typeof s.jawab, 'number', s.id);
      assert.ok(s.hints.length >= 2 && s.reveal, s.id);
    }
    const c = s.cek;
    if (!c) return;
    if (s.type === 'choice') kunci = c.jawab;
    if (c.tipe === 'jumlah') assert.equal(kunci, E.jumlahAritmetika(c.a, c.b, c.n), s.id);
    else if (c.tipe === 'suku') assert.equal(kunci, E.sukuAritmetika(c.a, c.b, c.n), s.id);
    else if (c.tipe === 'nMin')
      assert.equal(kunci, E.nMinimalJumlahMencapai(c.a, c.b, c.target), s.id);
    else if (c.tipe === 'bedaMin')
      assert.equal(kunci, E.bedaMinimalJumlah(c.a, c.n, c.target, c.langkah), s.id);
    else if (c.tipe === 'bedaMaks')
      assert.equal(kunci, E.bedaMaksimalJumlah(c.a, c.n, c.target, c.langkah), s.id);
    else if (c.tipe === 'sukuMin')
      assert.equal(kunci, E.sukuPertamaMinimalJumlah(c.b, c.n, c.target, c.langkah), s.id);
    else if (c.tipe === 'selisih') assert.equal(kunci, c.sn - c.snm1, s.id);
    else assert.fail('tipe cek tidak dikenal: ' + c.tipe);
    if (s.type === 'choice') {
      const label = s.options.find((o) => o.id === s.correct).label;
      const teks = c.rupiah ? E.formatRupiah(kunci) : E.fmtAngkaDeret(kunci);
      assert.ok(label.includes(teks), s.id + ': label kunci memuat ' + teks);
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
    "ensureShuffledOrder(State,'briefOrder',DATA.brief)",
    "ensureListOrders('pemanasanOrders',TANYA_PEMANASAN)",
    "ensureListOrders('intiOrders',[TANYA_INTI])",
    "ensureSortStates(State,'pilahStates','pilahOrder',PILAH_ITEMS,DATA.pertanyaan.opsiPilah)",
    "ensureShuffledOrder(State,'peranOrder',DATA.rencana.peran)",
    "ensureShuffledOrder(State,'briefPilihOrder',DATA.brief)",
    "ensureSortStates(State,'fiturStates','fiturOrder',FITUR_ITEMS,DATA.rencana.opsiFitur)",
    "ensureTapOrderState(State,'jadwalState',JADWAL_ITEMS,JADWAL_JAWAB)",
    "ensureListOrders('jadwalOrders',TANYA_JADWAL)",
    "ensureListOrders('modelOrders',TANYA_MODEL)",
    "ensureListOrders('protoOrders',[TANYA_KODE])",
    "ensureListOrders('ujiOrders',TANYA_UJI)",
    "ensureSortStates(State,'sejawatStates','sejawatOrder',SEJAWAT_ITEMS,DATA.pameran.opsiSejawat)",
    "ensureListOrders('rubrikOrders',RUBRIK)",
    'shuffleArray(optionIds(s.options))',
    "ensureShuffledOrder(State,'refleksiDiriOrder',DATA.refleksi.diriOpsi)",
  ].forEach((pola) => assert.ok(APP.includes(pola), 'app.js harus memuat: ' + pola));
  ['opsiJumlahDeret(', 'opsiSukuDeret(', 'opsiNMinimal('].forEach((f) =>
    assert.ok(APP.includes(f), 'soal gen memakai ' + f)
  );
  assert.ok(APP.includes('functionclearState(){Store.reset();initExerciseArrays();}'));
});
