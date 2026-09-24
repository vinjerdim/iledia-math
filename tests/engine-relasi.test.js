'use strict';

/*
 * Tes shared/engine.js seksi 25 (relasi antara dua himpunan): pasangan
 * berurutan dari aturan, normalisasi & kesamaan relasi, tambah/hapus
 * panah, range & anggota tanpa pasangan, format notasi himpunan,
 * diagnosa jawaban (kurang/lebih/terbalik), logika ketuk diagram panah,
 * serta markup diagram panah, tabel silang, tabel daftar, dan chip
 * pasangan berurutan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

/* Array dari konteks vm punya prototipe berbeda → samakan dulu. */
function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function count(str, sub) {
  return str.split(sub).length - 1;
}

const A = [2, 3, 4];
const B = [2, 4, 6, 8];
const faktor = (a, b) => b % a === 0;

test('relasiDariAturan: pasangan (a, b) yang memenuhi aturan, urut A lalu B', () => {
  assert.deepEqual(plain(E.relasiDariAturan(A, B, faktor)), [
    [2, 2],
    [2, 4],
    [2, 6],
    [2, 8],
    [3, 6],
    [4, 4],
    [4, 8],
  ]);
  assert.deepEqual(plain(E.relasiDariAturan([1, 2, 3], [1, 2, 3], (a, b) => a < b)), [
    [1, 2],
    [1, 3],
    [2, 3],
  ]);
  assert.deepEqual(plain(E.relasiDariAturan([5], [1, 2], faktor)), []);
});

test('kunciPasangan & adaPasangan: urutan anggota membedakan pasangan', () => {
  assert.notEqual(E.kunciPasangan('Nadia', 'Futsal'), E.kunciPasangan('Futsal', 'Nadia'));
  assert.notEqual(E.kunciPasangan(1, 23), E.kunciPasangan(12, 3));
  const r = [['Nadia', 'Futsal']];
  assert.equal(E.adaPasangan(r, 'Nadia', 'Futsal'), true);
  assert.equal(E.adaPasangan(r, 'Futsal', 'Nadia'), false);
});

test('normalisasiRelasi: buang duplikat & urutkan menurut posisi di A lalu B', () => {
  const acak = [
    [4, 8],
    [2, 4],
    [2, 2],
    [4, 8],
    [3, 6],
  ];
  assert.deepEqual(plain(E.normalisasiRelasi(acak, A, B)), [
    [2, 2],
    [2, 4],
    [3, 6],
    [4, 8],
  ]);
  /* tanpa A/B: urutan kemunculan pertama dipertahankan */
  assert.deepEqual(plain(E.normalisasiRelasi(acak)), [
    [4, 8],
    [2, 4],
    [2, 2],
    [3, 6],
  ]);
});

test('relasiSama: sama sebagai himpunan pasangan (urutan daftar tak penting)', () => {
  assert.equal(
    E.relasiSama(
      [
        [2, 4],
        [3, 6],
      ],
      [
        [3, 6],
        [2, 4],
        [2, 4],
      ]
    ),
    true
  );
  assert.equal(E.relasiSama([[2, 4]], [[4, 2]]), false);
  assert.equal(E.relasiSama([[2, 4]], []), false);
  assert.equal(E.relasiSama([], []), true);
});

test('togglePasangan: menambah panah baru, menghapus panah yang ada, tidak memutasi', () => {
  const awal = [[2, 4]];
  const tambah = E.togglePasangan(awal, 3, 6);
  assert.deepEqual(plain(tambah), [
    [2, 4],
    [3, 6],
  ]);
  assert.deepEqual(plain(awal), [[2, 4]]);
  assert.deepEqual(plain(E.togglePasangan(tambah, 2, 4)), [[3, 6]]);
});

test('rangeRelasi, anggotaTanpaPasangan, banyakPanahDari', () => {
  const r = E.relasiDariAturan(A, B, faktor);
  assert.deepEqual(plain(E.rangeRelasi(r, B)), [2, 4, 6, 8]);
  assert.deepEqual(plain(E.rangeRelasi([[3, 6]], B)), [6]);
  /* tanpa kodomain: urutan kemunculan */
  assert.deepEqual(
    plain(
      E.rangeRelasi([
        ['a', 'y'],
        ['b', 'x'],
        ['c', 'y'],
      ])
    ),
    ['y', 'x']
  );
  assert.deepEqual(plain(E.anggotaTanpaPasangan([2, 3, 4, 5], r)), [5]);
  assert.equal(E.banyakPanahDari(r, 2), 4);
  assert.equal(E.banyakPanahDari(r, 3), 1);
  assert.equal(E.banyakPanahDari(r, 9), 0);
});

test('format notasi: himpunan, pasangan berurutan, himpunan pasangan', () => {
  assert.equal(E.formatHimpunan([2, 3, 4]), '{2, 3, 4}');
  assert.equal(E.formatHimpunan(['Nadia', 'Raka']), '{Nadia, Raka}');
  assert.equal(E.formatHimpunan([]), '{ }');
  assert.equal(E.formatPasangan('Nadia', 'Futsal'), '(Nadia, Futsal)');
  assert.equal(
    E.formatRelasiPasangan([
      [2, 4],
      [3, 6],
    ]),
    '{(2, 4), (3, 6)}'
  );
  assert.equal(E.formatRelasiPasangan([]), '{ }');
});

test('diagnosaRelasi: memisahkan pasangan kurang, lebih, dan terbalik', () => {
  const target = [
    ['Nadia', 'Futsal'],
    ['Raka', 'Voli'],
    ['Raka', 'Renang'],
  ];
  const d = E.diagnosaRelasi(target, [
    ['Nadia', 'Futsal'],
    ['Voli', 'Raka'],
    ['Sinta', 'Renang'],
  ]);
  assert.equal(d.tepat, false);
  assert.deepEqual(plain(d.kurang), [
    ['Raka', 'Voli'],
    ['Raka', 'Renang'],
  ]);
  assert.deepEqual(plain(d.terbalik), [['Voli', 'Raka']]);
  assert.deepEqual(plain(d.lebih), [['Sinta', 'Renang']]);

  const ok = E.diagnosaRelasi(target, target.slice().reverse());
  assert.equal(ok.tepat, true);
  assert.equal(ok.kurang.length + ok.lebih.length + ok.terbalik.length, 0);
});

test('ketukDiagramPanah: pilih anggota A, lalu ketuk B untuk menambah/menghapus panah', () => {
  const st = { pairs: [], selected: null };
  const P = ['Nadia', 'Raka'];
  const O = ['Futsal', 'Voli'];

  assert.equal(E.ketukDiagramPanah(st, P, O, 'b', 0), 'perluPilih');
  assert.equal(st.pairs.length, 0);

  assert.equal(E.ketukDiagramPanah(st, P, O, 'a', 1), 'pilih');
  assert.equal(st.selected, 1);
  assert.equal(E.ketukDiagramPanah(st, P, O, 'b', 1), 'tambah');
  assert.deepEqual(plain(st.pairs), [['Raka', 'Voli']]);
  /* anggota A tetap terpilih agar bisa menarik panah kedua */
  assert.equal(st.selected, 1);
  assert.equal(E.ketukDiagramPanah(st, P, O, 'b', 0), 'tambah');
  assert.equal(E.ketukDiagramPanah(st, P, O, 'b', 1), 'hapus');
  assert.deepEqual(plain(st.pairs), [['Raka', 'Futsal']]);

  assert.equal(E.ketukDiagramPanah(st, P, O, 'a', 1), 'batal');
  assert.equal(st.selected, null);
  /* indeks di luar jangkauan diabaikan */
  assert.equal(E.ketukDiagramPanah(st, P, O, 'a', 9), null);
});

test('buildArrowDiagram: satu panah per pasangan, label himpunan & nama relasi', () => {
  const r = E.relasiDariAturan(A, B, faktor);
  const html = E.buildArrowDiagram('d1', A, B, r, {
    labelA: 'A',
    labelB: 'B',
    namaRelasi: 'faktor dari',
  });
  assert.equal(count(html, 'class="rel-arrow__line'), r.length);
  assert.equal(count(html, 'data-rel-side="a"'), A.length);
  assert.equal(count(html, 'data-rel-side="b"'), B.length);
  assert.ok(html.includes('faktor dari'));
  assert.ok(html.includes('<svg'));
  assert.ok(html.includes('role="img"'), 'diagram statis → role img');
  assert.ok(!html.includes('tabindex'), 'diagram statis tidak bisa difokus');
});

test('buildArrowDiagram interaktif: node bisa difokus, pilihan & panah salah ditandai', () => {
  const html = E.buildArrowDiagram('d2', ['<Nadia>', 'Raka'], ['Futsal'], [['Raka', 'Futsal']], {
    interactive: true,
    selected: 1,
    salah: [['Raka', 'Futsal']],
  });
  assert.ok(html.includes('&lt;Nadia&gt;'), 'label di-escape');
  assert.ok(!html.includes('<Nadia>'));
  assert.equal(count(html, 'tabindex="0"'), 3);
  assert.equal(count(html, 'rel-node--selected'), 1);
  assert.equal(count(html, 'rel-arrow__line--salah'), 1);
});

test('buildRelationTable: tabel silang A × B dengan tanda ✓ pada pasangan', () => {
  const r = E.relasiDariAturan(A, B, faktor);
  const html = E.buildRelationTable('t1', A, B, r, { labelA: 'A', labelB: 'B' });
  assert.equal(count(html, 'rel-table__cell--on'), r.length);
  assert.equal(count(html, '<th scope="row"'), A.length);
  assert.equal(count(html, '<th scope="col"'), B.length);
  assert.ok(!html.includes('<button'), 'tabel statis tanpa tombol');

  const interaktif = E.buildRelationTable('t2', A, B, [[2, 4]], { interactive: true });
  assert.equal(count(interaktif, '<button'), A.length * B.length);
  assert.equal(count(interaktif, 'aria-pressed="true"'), 1);
});

test('buildRelationListTable: dua kolom, anggota tanpa pasangan ditandai "—"', () => {
  const html = E.buildRelationListTable(['Nadia', 'Putri'], [['Nadia', 'Futsal']], {
    labelA: 'Nama',
    labelB: 'Olahraga',
  });
  assert.ok(html.includes('Nama') && html.includes('Olahraga'));
  assert.ok(html.includes('Futsal'));
  assert.ok(html.includes('—'));
  assert.equal(count(html, '<tr'), 3);
});

test('buildPairChips: chip mengikuti urutan acak & menandai hasil pemeriksaan', () => {
  const chips = [
    { id: 'c1', a: 'Nadia', b: 'Futsal' },
    { id: 'c2', a: 'Futsal', b: 'Nadia' },
    { id: 'c3', a: 'Raka', b: 'Voli' },
  ];
  const html = E.buildPairChips('p1', chips, ['c3', 'c1', 'c2'], ['c2'], {});
  assert.ok(html.indexOf('(Raka, Voli)') < html.indexOf('(Nadia, Futsal)'));
  assert.equal(count(html, 'aria-pressed="true"'), 1);

  const dicek = E.buildPairChips('p1', chips, ['c1', 'c2', 'c3'], ['c1', 'c2'], {
    benar: ['c1', 'c3'],
    periksa: true,
  });
  assert.equal(count(dicek, 'rel-chip--benar'), 1);
  assert.equal(count(dicek, 'rel-chip--salah'), 1);
  assert.equal(count(dicek, 'rel-chip--terlewat'), 1);

  const tanpaTerlewat = E.buildPairChips('p1', chips, ['c1', 'c2', 'c3'], ['c1', 'c2'], {
    benar: ['c1', 'c3'],
    periksa: true,
    terlewat: false,
  });
  assert.equal(count(tanpaTerlewat, 'rel-chip--terlewat'), 0);
  assert.equal(count(tanpaTerlewat, 'rel-chip--benar'), 1);
});
