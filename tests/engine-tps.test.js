'use strict';

/*
 * Tes shared/engine.js seksi 61 (komponen Cooperative Learning tipe
 * Think-Pair-Share): bilah fase, state pertanyaan TPS (pikir → kunci →
 * jawaban pasangan → kesepakatan), perbandingan jawaban, urutan opsi
 * acak yang tersimpan, pemilihan juru bicara acak, dan kartu berbagi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function count(str, sub) {
  return str.split(sub).length - 1;
}

const Q = {
  id: 'q1',
  tanya: 'Jadi (−4) × (−2) = …',
  opsi: [
    { id: 'a', label: '8' },
    { id: 'b', label: '−8' },
    { id: 'c', label: '−6' },
    { id: 'd', label: '6' },
  ],
  correct: 'a',
  umpan: { a: 'Tepat.', b: 'Lihat polanya.', c: 'Bukan penjumlahan.', d: 'Hitung lagi.' },
  diskusi: 'Bagaimana pola hasil pada tabel?',
};

test('TPS_FASE: tiga fase berurutan pikir, pasang, berbagi', () => {
  assert.deepEqual(
    Array.from(E.TPS_FASE, (f) => f.id),
    ['pikir', 'pasang', 'berbagi']
  );
  E.TPS_FASE.forEach((f) => assert.ok(f.ikon && f.nama && f.tugas, f.id));
});

test('buildTpsBanner: menandai fase aktif (satu atau beberapa) dengan aria-current', () => {
  let html = E.buildTpsBanner('pikir');
  assert.equal(count(html, 'tps-banner__step--aktif'), 1);
  assert.equal(count(html, 'aria-current="step"'), 1);
  html = E.buildTpsBanner(['pikir', 'pasang'], { pesan: 'Kerjakan <sendiri>' });
  assert.equal(count(html, 'tps-banner__step--aktif'), 2);
  assert.match(html, /Kerjakan &lt;sendiri&gt;/);
});

test('makeTpsState & ensureTpsStates: urutan opsi diacak sekali lalu disimpan', () => {
  const st = E.makeTpsState();
  assert.deepEqual(JSON.parse(JSON.stringify(st)), {
    pilih: null,
    kunci: false,
    pasangan: null,
    sepakat: null,
    cobaSepakat: 0,
    optionOrder: null,
  });
  const state = {};
  E.ensureTpsStates(state, 'tps', [Q]);
  const order = state.tps.q1.optionOrder;
  assert.deepEqual(order.slice().sort(), ['a', 'b', 'c', 'd']);
  state.tps.q1.pilih = 'b';
  E.ensureTpsStates(state, 'tps', [Q]);
  assert.deepEqual(state.tps.q1.optionOrder, order, 'urutan stabil');
  assert.equal(state.tps.q1.pilih, 'b', 'jawaban tersimpan');
});

test('ensureTpsStates: setiap state baru mendapat urutan acak (bukan selalu urutan DATA)', () => {
  const urutan = new Set();
  for (let i = 0; i < 40; i++) {
    const state = {};
    E.ensureTpsStates(state, 'tps', [Q]);
    urutan.add(state.tps.q1.optionOrder.join(''));
  }
  assert.ok(urutan.size > 1);
});

test('tpsTahap: pikir → pasang → sepakat → selesai', () => {
  const st = E.makeTpsState();
  assert.equal(E.tpsTahap(Q, st), 'pikir');
  st.pilih = 'b';
  assert.equal(E.tpsTahap(Q, st), 'pikir', 'belum dikunci');
  st.kunci = true;
  assert.equal(E.tpsTahap(Q, st), 'pasang');
  st.pasangan = 'a';
  assert.equal(E.tpsTahap(Q, st), 'sepakat');
  st.sepakat = 'd';
  assert.equal(E.tpsTahap(Q, st), 'sepakat');
  st.sepakat = 'a';
  assert.equal(E.tpsTahap(Q, st), 'selesai');
  assert.equal(E.tpsSemuaSelesai([Q], { q1: st }), true);
  assert.equal(E.tpsSemuaSelesai([Q], {}), false);
});

test('tpsBanding: sama / beda / null', () => {
  assert.equal(E.tpsBanding({ pilih: 'a', pasangan: null }), null);
  assert.equal(E.tpsBanding({ pilih: 'a', pasangan: 'a' }), 'sama');
  assert.equal(E.tpsBanding({ pilih: 'a', pasangan: 'c' }), 'beda');
});

test('pilihJuruBicara: memakai rnd tersuntik dan mengabaikan nama kosong', () => {
  assert.equal(
    E.pilihJuruBicara(['Ani', ' ', 'Budi'], () => 0),
    'Ani'
  );
  assert.equal(
    E.pilihJuruBicara(['Ani', 'Budi'], () => 0.99),
    'Budi'
  );
  assert.equal(
    E.pilihJuruBicara([], () => 0.5),
    ''
  );
});

test('buildTpsQuestion fase pikir: pilihan tidak dinilai & tombol kunci', () => {
  const st = E.makeTpsState();
  st.optionOrder = ['d', 'c', 'b', 'a'];
  let html = E.buildTpsQuestion('t1', Q, st, { namaSaya: 'Ani', namaPasangan: 'Budi' });
  assert.equal(count(html, 'data-tps-pikir='), 4);
  assert.ok(html.indexOf('>6<') < html.indexOf('>8<'), 'urutan opsi mengikuti state');
  assert.match(html, /id="t1Kunci"[^>]*disabled/);
  assert.doesNotMatch(html, /is-correct|is-incorrect/);
  st.pilih = 'b';
  html = E.buildTpsQuestion('t1', Q, st, { namaSaya: 'Ani', namaPasangan: 'Budi' });
  assert.doesNotMatch(html, /id="t1Kunci"[^>]*disabled/);
  assert.match(html, /is-selected/);
});

test('buildTpsQuestion fase pasang: jawaban terkunci, isian jawaban pasangan', () => {
  const st = Object.assign(E.makeTpsState(), { pilih: 'b', kunci: true });
  const html = E.buildTpsQuestion('t1', Q, st, { namaSaya: 'Ani', namaPasangan: '<Budi>' });
  assert.match(html, /🔒/);
  assert.match(html, /&lt;Budi&gt;/);
  assert.equal(count(html, 'data-tps-pasang='), 4);
  assert.equal(count(html, 'data-tps-pikir='), 0);
});

test('buildTpsQuestion fase sepakat: banding beda memunculkan prompt diskusi & dinilai', () => {
  const st = Object.assign(E.makeTpsState(), { pilih: 'b', kunci: true, pasangan: 'a' });
  let html = E.buildTpsQuestion('t1', Q, st, {});
  assert.match(html, /berbeda/);
  assert.match(html, /Bagaimana pola hasil pada tabel\?/);
  assert.equal(count(html, 'data-tps-sepakat='), 4);
  st.sepakat = 'c';
  html = E.buildTpsQuestion('t1', Q, st, {});
  assert.match(html, /is-incorrect/);
  assert.match(html, /Bukan penjumlahan\./);
  st.sepakat = 'a';
  html = E.buildTpsQuestion('t1', Q, st, {});
  assert.match(html, /is-correct/);
  assert.match(html, /tps-q--selesai/);
  assert.match(html, /disabled/);
});

test('buildTpsQuestion: jawaban sama tetap meminta alasan', () => {
  const st = Object.assign(E.makeTpsState(), { pilih: 'a', kunci: true, pasangan: 'a' });
  const html = E.buildTpsQuestion('t1', Q, st, {});
  assert.match(html, /sama/);
  assert.match(html, /alasan/);
});

test('buildTpsShareCard: juru bicara ter-escape, pemantik bernomor, tombol', () => {
  const html = E.buildTpsShareCard('bg', {
    juruBicara: '<Ani>',
    pemantik: ['Kami menemukan …', 'Contohnya …'],
    sudah: false,
  });
  assert.match(html, /&lt;Ani&gt;/);
  assert.equal(count(html, '<li'), 2);
  assert.match(html, /id="bgAcak"/);
  assert.match(html, /id="bgSudah"/);
  const done = E.buildTpsShareCard('bg', { juruBicara: 'Ani', pemantik: ['x'], sudah: true });
  assert.match(done, /tps-share--sudah/);
  assert.doesNotMatch(done, /id="bgSudah"/);
});
