'use strict';

/*
 * Tes engine seksi 72 — Asesmen diagnostik (komponen bersama): state
 * per butir dengan urutan opsi acak tersimpan, pilihan sekali-jawab,
 * ringkasan per indikator & tingkat kesiapan, serta markup daftar
 * butir dan ringkasan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

const ITEMS = [
  {
    id: 'q1',
    indikator: 'iA',
    tanya: 'Satu?',
    opsi: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ],
    correct: 'a',
    pembahasan: 'Karena A.',
  },
  {
    id: 'q2',
    indikator: 'iA',
    tanya: 'Dua?',
    opsi: [
      { id: 'x', label: 'X' },
      { id: 'y', label: 'Y' },
      { id: 'z', label: 'Z' },
    ],
    correct: 'y',
    pembahasan: 'Karena Y.',
  },
  {
    id: 'q3',
    indikator: 'iB',
    tanya: 'Tiga?',
    opsi: [
      { id: 'p', label: 'P' },
      { id: 'q', label: 'Q' },
      { id: 'r', label: 'R' },
      { id: 's', label: 'S' },
    ],
    correct: 's',
    pembahasan: 'Karena S.',
  },
];

const INDIKATOR = [
  { id: 'iA', label: 'Indikator A', saran: 'Ulangi A.' },
  { id: 'iB', label: 'Indikator B', saran: 'Ulangi B.' },
];

function siapkan() {
  const state = {};
  E.ensureDiagnostikStates(state, 'diag', ITEMS);
  return state;
}

test('ensureDiagnostikStates: state per butir dengan urutan opsi acak yang lengkap', () => {
  const state = siapkan();
  ITEMS.forEach((it) => {
    const st = state.diag[it.id];
    assert.equal(st.chosen, null);
    assert.equal(st.correct, false);
    assert.deepEqual(
      Array.from(st.optionOrder).sort(),
      it.opsi.map((o) => o.id).sort(),
      it.id + ': urutan memuat semua opsi'
    );
  });
  /* dipanggil ulang: urutan & jawaban yang sudah ada dipertahankan */
  const urutan = Array.from(state.diag.q1.optionOrder);
  state.diag.q1.chosen = 'b';
  E.ensureDiagnostikStates(state, 'diag', ITEMS);
  assert.deepEqual(Array.from(state.diag.q1.optionOrder), urutan);
  assert.equal(state.diag.q1.chosen, 'b');
});

test('ensureDiagnostikStates: opsi benar-benar diacak (tidak selalu urutan DATA)', () => {
  let berbeda = 0;
  for (let i = 0; i < 40; i++) {
    const st = siapkan().diag.q3;
    if (Array.from(st.optionOrder).join() !== 'p,q,r,s') berbeda += 1;
  }
  assert.ok(berbeda > 0, 'urutan opsi teracak');
});

test('pilihDiagnostik: sekali jawab, opsi tak dikenal ditolak', () => {
  const state = siapkan();
  assert.equal(E.pilihDiagnostik(state.diag.q1, ITEMS[0], 'zzz'), false);
  assert.equal(E.pilihDiagnostik(state.diag.q1, ITEMS[0], 'b'), true);
  assert.equal(state.diag.q1.correct, false);
  assert.equal(E.pilihDiagnostik(state.diag.q1, ITEMS[0], 'a'), false, 'terkunci');
  assert.equal(state.diag.q1.chosen, 'b');
  assert.equal(E.diagnostikSelesai(ITEMS, state.diag), false);
  E.pilihDiagnostik(state.diag.q2, ITEMS[1], 'y');
  E.pilihDiagnostik(state.diag.q3, ITEMS[2], 's');
  assert.equal(state.diag.q2.correct, true);
  assert.equal(E.diagnostikSelesai(ITEMS, state.diag), true);
});

test('ringkasDiagnostik: skor, profil indikator, dan tingkat kesiapan', () => {
  const state = siapkan();
  E.pilihDiagnostik(state.diag.q1, ITEMS[0], 'b');
  E.pilihDiagnostik(state.diag.q2, ITEMS[1], 'y');
  E.pilihDiagnostik(state.diag.q3, ITEMS[2], 's');
  const r = E.ringkasDiagnostik(ITEMS, state.diag, INDIKATOR);
  assert.equal(r.benar, 2);
  assert.equal(r.total, 3);
  assert.equal(r.persen, 67);
  assert.equal(r.level, 'sebagian');
  assert.equal(r.indikator.length, 2);
  assert.deepEqual(
    { benar: r.indikator[0].benar, total: r.indikator[0].total, kuat: r.indikator[0].kuat },
    { benar: 1, total: 2, kuat: false }
  );
  assert.equal(r.indikator[1].kuat, true);

  const semua = siapkan();
  ITEMS.forEach((it) => E.pilihDiagnostik(semua.diag[it.id], it, it.correct));
  assert.equal(E.ringkasDiagnostik(ITEMS, semua.diag, INDIKATOR).level, 'siap');

  const kosong = siapkan();
  ITEMS.forEach((it) =>
    E.pilihDiagnostik(kosong.diag[it.id], it, it.opsi.find((o) => o.id !== it.correct).id)
  );
  assert.equal(E.ringkasDiagnostik(ITEMS, kosong.diag, INDIKATOR).level, 'perlu');
});

test('buildAsesmenDiagnostik: butir bernomor, opsi menurut urutan acak, umpan setelah menjawab', () => {
  const state = siapkan();
  state.diag.q3.optionOrder = ['r', 's', 'p', 'q'];
  let html = E.buildAsesmenDiagnostik(ITEMS, state.diag);
  assert.equal((html.match(/class="diag-item"/g) || []).length, 3);
  assert.equal((html.match(/data-diag-opt=/g) || []).length, 10);
  const q3 = html.slice(html.indexOf('Tiga?'));
  assert.ok(q3.indexOf('>R<') < q3.indexOf('>S<') && q3.indexOf('>S<') < q3.indexOf('>P<'));
  assert.ok(!/Karena/.test(html), 'pembahasan belum tampil');

  E.pilihDiagnostik(state.diag.q1, ITEMS[0], 'b');
  html = E.buildAsesmenDiagnostik(ITEMS, state.diag, {
    visual: (it) => (it.id === 'q2' ? '<svg id="gambar-q2"></svg>' : ''),
  });
  assert.match(html, /Karena A\./);
  assert.match(html, /is-incorrect/);
  assert.match(html, /is-correct/);
  assert.match(html, /gambar-q2/);
});

test('buildRingkasDiagnostik: skor, status indikator, dan saran untuk yang belum kuat', () => {
  const state = siapkan();
  E.pilihDiagnostik(state.diag.q1, ITEMS[0], 'b');
  E.pilihDiagnostik(state.diag.q2, ITEMS[1], 'y');
  E.pilihDiagnostik(state.diag.q3, ITEMS[2], 's');
  const html = E.buildRingkasDiagnostik(E.ringkasDiagnostik(ITEMS, state.diag, INDIKATOR), {
    pesan: { siap: 'Siap!', sebagian: 'Hampir siap.', perlu: 'Perlu penguatan.' },
  });
  assert.match(html, /2<\/strong> dari <strong>3/);
  assert.match(html, /Hampir siap\./);
  assert.match(html, /Ulangi A\./);
  assert.ok(!/Ulangi B\./.test(html), 'indikator kuat tanpa saran');
  assert.match(html, /diag-profil__item--kuat/);
  assert.match(html, /diag-profil__item--perlu/);
});
