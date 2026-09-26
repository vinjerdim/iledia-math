'use strict';

/*
 * Tes seksi 43 shared/engine.js: proyek mini barisan & deret aritmetika —
 * n minimal agar suku mencapai target, beda/suku pertama minimal & beda
 * maksimal agar jumlah memenuhi batas, ringkasan brief proyek, opsi
 * pilihan ganda berpengecoh untuk Uₙ dan n minimal, implementasi fungsi
 * jumlahDeret teman beserta penjalan kasus uji (tanpa eval), kolom
 * papan kanban milestone, serta komponen lab perencana, papan kanban,
 * dan penjalan tes.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

test('nMinimalSukuMencapai: n terkecil dengan Uₙ ≥ target', () => {
  assert.equal(E.nMinimalSukuMencapai(20, 4, 60), 11);
  assert.equal(E.nMinimalSukuMencapai(20, 4, 61), 12);
  assert.equal(E.nMinimalSukuMencapai(20, 4, 10), 1);
  assert.equal(E.nMinimalSukuMencapai(20, -4, 60), null);
  assert.equal(E.nMinimalSukuMencapai(1, 1, 5000, 100), null);
});

test('bedaMinimalJumlah: b terkecil (kelipatan langkah) agar Sₙ ≥ target', () => {
  assert.equal(E.bedaMinimalJumlah(20000, 30, 4000000, 1000), 8000);
  assert.ok(E.jumlahAritmetika(20000, 8000, 30) >= 4000000);
  assert.ok(E.jumlahAritmetika(20000, 7000, 30) < 4000000);
  /* Pas di batas: S₄ = 2(2 × 1 + 3b) = 16 → b = 2 */
  assert.equal(E.bedaMinimalJumlah(1, 4, 16, 1), 2);
  /* a saja sudah cukup → 0 */
  assert.equal(E.bedaMinimalJumlah(100, 5, 300, 1), 0);
  /* langkah default 1 */
  assert.equal(E.bedaMinimalJumlah(1, 4, 16), 2);
  /* n = 1 tidak bergantung pada b */
  assert.equal(E.bedaMinimalJumlah(5, 1, 10, 1), null);
});

test('bedaMaksimalJumlah: b terbesar (kelipatan langkah) agar Sₙ ≤ batas', () => {
  assert.equal(E.bedaMaksimalJumlah(120, 60, 30000, 1), 12);
  assert.ok(E.jumlahAritmetika(120, 12, 60) <= 30000);
  assert.ok(E.jumlahAritmetika(120, 13, 60) > 30000);
  assert.equal(E.bedaMaksimalJumlah(1, 4, 16, 1), 2);
  assert.equal(E.bedaMaksimalJumlah(120, 60, 30000, 5), 10);
  /* batas terlalu kecil walau b = 0 → null */
  assert.equal(E.bedaMaksimalJumlah(1000, 60, 30000, 1), null);
});

test('sukuPertamaMinimalJumlah: a terkecil (kelipatan langkah) agar Sₙ ≥ target', () => {
  assert.equal(E.sukuPertamaMinimalJumlah(4, 12, 600, 1), 28);
  assert.equal(E.jumlahAritmetika(28, 4, 12), 600);
  assert.ok(E.jumlahAritmetika(27, 4, 12) < 600);
  assert.equal(E.sukuPertamaMinimalJumlah(4, 12, 601, 5), 30);
  assert.equal(E.sukuPertamaMinimalJumlah(4, 12, 600), 28);
});

test('nilaiLanjutanBrief & hitungBriefDeret: kunci brief dihitung engine', () => {
  const br = {
    a: 20000,
    b: 5000,
    nSuku: 24,
    nJumlah: 24,
    target: 4000000,
    lanjutan: { jenis: 'bedaMin', n: 30, target: 4000000, langkah: 1000 },
  };
  const h = E.hitungBriefDeret(br);
  assert.equal(h.un, 135000);
  assert.equal(h.sn, 1860000);
  assert.equal(h.nTarget, 37);
  assert.equal(h.lanjutan, 8000);

  assert.equal(
    E.nilaiLanjutanBrief({ a: 120, b: 30 }, { jenis: 'bedaMaks', n: 60, target: 30000 }),
    12
  );
  assert.equal(
    E.nilaiLanjutanBrief({ a: 20, b: 4 }, { jenis: 'sukuMin', n: 12, target: 600, langkah: 1 }),
    28
  );
  assert.equal(E.nilaiLanjutanBrief({ a: 1, b: 1 }, { jenis: 'aneh', n: 2, target: 3 }), null);
});

test('opsiSukuDeret: kunci Uₙ + pengecoh miskonsepsi, tanpa nilai kembar', () => {
  const o = E.opsiSukuDeret(20, 4, 15, { satuan: 'kursi' });
  assert.equal(o[0].id, 'benar');
  assert.equal(o[0].nilai, 76);
  assert.equal(o[0].label, '76 kursi');
  const nilai = o.map((x) => x.nilai);
  assert.equal(new Set(nilai).size, nilai.length);
  assert.ok(nilai.includes(80), 'a + nb');
  assert.ok(nilai.includes(720), 'Sₙ, bukan Uₙ');
  assert.ok(o.length >= 4);
  assert.equal(E.opsiSukuDeret(20, 4, 15, { maks: 3 }).length, 3);
  const rp = E.opsiSukuDeret(20000, 5000, 24, { format: E.formatRupiah, maks: 4 });
  assert.equal(rp[0].label, 'Rp135.000');
});

test('opsiNMinimal: kunci n + pengecoh (belum capai, pakai Uₙ, lewat satu)', () => {
  const o = E.opsiNMinimal(20, 4, 600, { satuan: 'baris' });
  assert.equal(o[0].id, 'benar');
  assert.equal(o[0].nilai, 14);
  assert.equal(o[0].label, '14 baris');
  const nilai = o.map((x) => x.nilai);
  assert.ok(nilai.includes(13));
  assert.ok(nilai.includes(15));
  assert.equal(new Set(nilai).size, nilai.length);
  nilai.forEach((v) => assert.ok(v >= 1 && Number.isInteger(v)));
  assert.ok(o.length >= 4);
  assert.equal(E.opsiNMinimal(20, 4, 600, { maks: 4 }).length, 4);
  assert.equal(E.opsiNMinimal(20, -4, 6000).length, 0);
});

test('IMPLEMENTASI_JUMLAH_DERET: setiap implementasi berkode & hitungnya sesuai pola', () => {
  const ids = E.IMPLEMENTASI_JUMLAH_DERET.map((i) => i.id);
  ['rumus', 'loop', 'loopKurang', 'lupaBagi', 'pakaiN', 'kaliAkhir'].forEach((id) =>
    assert.ok(ids.includes(id), id)
  );
  E.IMPLEMENTASI_JUMLAH_DERET.forEach((impl) => {
    assert.match(impl.kode, /return/);
    assert.equal(typeof impl.hitung, 'function');
  });
  const byId = {};
  E.IMPLEMENTASI_JUMLAH_DERET.forEach((i) => (byId[i.id] = i));
  assert.equal(byId.rumus.hitung(15, 5, 30), 2625);
  assert.equal(byId.loop.hitung(15, 5, 30), 2625);
  assert.equal(byId.loopKurang.hitung(15, 5, 30), E.jumlahAritmetika(15, 5, 29));
  assert.equal(byId.lupaBagi.hitung(15, 5, 30), 5250);
  assert.equal(byId.pakaiN.hitung(15, 5, 30), (30 * (30 + 150)) / 2);
  assert.equal(byId.kaliAkhir.hitung(15, 5, 30), 4800);
});

test('jalankanKasusUji: harapan dari rumus, lulus bila sama', () => {
  const kasus = [
    { id: 'k1', a: 5, b: 3, n: 4 },
    { id: 'k2', a: 7, b: 0, n: 5 },
    { id: 'k3', a: 10, b: -2, n: 6 },
    { id: 'k4', a: 9, b: 4, n: 1 },
  ];
  assert.deepEqual(Array.from(kasus.map(E.harapanKasus)), [38, 35, 30, 9]);
  const rumus = E.jalankanKasusUji('rumus', kasus);
  assert.ok(rumus.every((h) => h.lulus));
  assert.equal(rumus[0].hasil, 38);
  assert.equal(rumus[0].id, 'k1');

  /* loop i < n lolos hanya bila suku terakhir 0 (U₆ = 0 pada kasus k3) */
  const kurang = E.jalankanKasusUji('loopKurang', kasus);
  assert.deepEqual(Array.from(kurang.map((h) => h.lulus)), [false, false, true, false]);
  /* n/2 (2a + nb) lolos bila b = 0 */
  const pakaiN = E.jalankanKasusUji('pakaiN', kasus);
  assert.deepEqual(Array.from(pakaiN.map((h) => h.lulus)), [false, true, false, false]);
  assert.deepEqual(JSON.parse(JSON.stringify(E.ringkasHasilUji(pakaiN))), { lulus: 1, total: 4 });
  assert.equal(E.jalankanKasusUji('tidak-ada', kasus), null);
});

test('kolomKanban: milestone selesai / dikerjakan / belum', () => {
  const ms = [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }];
  const k = E.kolomKanban(ms, { m1: true }, 'm2');
  assert.deepEqual(JSON.parse(JSON.stringify(k)), { m1: 'selesai', m2: 'dikerjakan', m3: 'belum' });
  const k2 = E.kolomKanban(ms, {}, null);
  assert.equal(k2.m1, 'belum');
  const k3 = E.kolomKanban(ms, { m1: true, m2: true }, 'm2');
  assert.equal(k3.m2, 'selesai');
});

test('buildProjectBoard: tiga kolom berisi kartu sesuai status', () => {
  const ms = [
    { id: 'm1', label: 'Model' },
    { id: 'm2', label: 'Prototipe <b>' },
    { id: 'm3', label: 'Uji' },
  ];
  const html = E.buildProjectBoard(ms, { m1: 'selesai', m2: 'dikerjakan', m3: 'belum' });
  assert.match(html, /kanban/);
  assert.match(html, /Belum/);
  assert.match(html, /Dikerjakan/);
  assert.match(html, /Selesai/);
  assert.match(html, /Prototipe &lt;b&gt;/);
  assert.ok(html.indexOf('Model') > html.indexOf('Selesai'));
  assert.match(html, /kanban__card--aktif/);
});

test('plannerLabInfo & buildPlannerLab: nilai dijepit ke rentang, status target', () => {
  const cfg = {
    a: { min: 10, max: 40, step: 1 },
    b: { min: 0, max: 10, step: 1 },
    n: { min: 1, max: 30, step: 1 },
    target: 600,
    satuan: 'kursi',
  };
  const st = E.makePlannerLabState({ a: 20, b: 4, n: 14 });
  const info = E.plannerLabInfo(st, cfg);
  assert.equal(info.un, 72);
  assert.equal(info.sn, 644);
  assert.equal(info.tercapai, true);
  const st2 = E.makePlannerLabState({ a: 99, b: -3, n: 0 });
  const info2 = E.plannerLabInfo(st2, cfg);
  assert.equal(info2.a, 40);
  assert.equal(info2.b, 0);
  assert.equal(info2.n, 1);
  /* mode batas atas: aman bila Sₙ ≤ target */
  const batas = Object.assign({}, cfg, { batasAtas: true });
  assert.equal(E.plannerLabInfo(st, batas).aman, false);
  assert.equal(E.plannerLabInfo(E.makePlannerLabState({ a: 20, b: 4, n: 13 }), batas).aman, true);

  const html = E.buildPlannerLab('lab', st, cfg);
  assert.match(html, /id="lab-a"/);
  assert.match(html, /id="lab-b"/);
  assert.match(html, /id="lab-n"/);
  assert.match(html, /644/);
  const rp = E.buildPlannerLab(
    'lab',
    E.makePlannerLabState({ a: 20000, b: 5000, n: 2 }),
    Object.assign({}, cfg, {
      a: { min: 5000, max: 50000, step: 5000 },
      b: { min: 0, max: 15000, step: 1000 },
      target: 4000000,
      format: E.formatRupiah,
    })
  );
  assert.match(rp, /Rp45\.000/);
});

test('buildTestRunner: tabel kasus, tombol jalankan, hasil hanya untuk yang dijalankan', () => {
  const kasus = [
    { id: 'k1', a: 5, b: 3, n: 4 },
    { id: 'k2', a: 7, b: 0, n: 5 },
  ];
  const impls = [
    { id: 'pakaiN', nama: 'Kode Dodi' },
    { id: 'rumus', nama: 'Kode Citra' },
  ];
  const html = E.buildTestRunner('tr', kasus, impls, { dijalankan: { pakaiN: true } });
  assert.match(html, /data-run="pakaiN"/);
  assert.match(html, /data-run="rumus"/);
  assert.match(html, /Kode Dodi/);
  assert.match(html, /1\/2 lulus/);
  assert.match(html, /test-runner__cell--gagal/);
  assert.match(html, /test-runner__cell--lulus/);
  assert.doesNotMatch(html, /2\/2 lulus/);
  assert.match(html, /return/);
});
