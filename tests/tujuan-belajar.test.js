'use strict';

/*
 * Tes konsistensi panel "Tujuan belajar hari ini": setiap MPI di fase D,
 * E, dan F memuat tp, tpJudul, dan kriteria pada objek tahap pertamanya,
 * dan buildTpPanel (engine) merender judul, TP, serta kriteria bernomor.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const TAHAP_PERTAMA = {
  'fase-d/mpi-1.1': 'stimulasi',
  'fase-d/mpi-1.2': 'tujuan',
  'fase-d/mpi-1.3': 'stimulasi',
  'fase-d/mpi-1.4': 'tujuan',
  'fase-d/mpi-1.5': 'stimulasi',
  'fase-d/mpi-1.6': 'orientasi',
  'fase-d/mpi-2.1': 'stimulasi',
  'fase-d/mpi-2.2': 'tujuan',
  'fase-d/mpi-2.3': 'orientasi',
  'fase-d/mpi-2.4': 'tujuan',
  'fase-d/mpi-2.5': 'stimulasi',
  'fase-d/mpi-2.6': 'orientasi',
  'fase-d/mpi-2.7': 'orientasi',
  'fase-d/mpi-3.1': 'orientasi',
  'fase-d/mpi-3.2': 'tujuan',
  'fase-d/mpi-3.3': 'orientasi',
  'fase-d/mpi-3.4': 'orientasi',
  'fase-d/mpi-12.1': 'stimulasi',
  'fase-d/mpi-12.2': 'stimulasi',
  'fase-d/mpi-12.3': 'tujuan',
  'fase-d/mpi-12.4': 'stimulasi',
  'fase-d/mpi-12.5': 'tujuan',
  'fase-d/mpi-12.6': 'orientasi',
  'fase-d/mpi-22.1': 'stimulasi',
  'fase-d/mpi-22.2': 'stimulasi',
  'fase-d/mpi-22.3': 'orientasi',
  'fase-d/mpi-22.4': 'stimulasi',
  'fase-d/mpi-22.5': 'orientasi',
  'fase-d/mpi-22.6': 'stimulasi',
  'fase-d/mpi-22.7': 'stimulasi',
  'fase-d/mpi-22.8': 'orientasi',
  'fase-d/mpi-22.9': 'stimulasi',
  'fase-d/mpi-22.10': 'orientasi',
  'fase-e/mpi-1.1': 'stimulasi',
  'fase-e/mpi-1.2': 'stimulasi',
  'fase-e/mpi-1.3': 'orientasi',
  'fase-f/mpi-1.1': 'orientasi',
  'fase-f/mpi-1.2': 'tujuan',
  'fase-f/mpi-1.3': 'orientasi',
  'fase-f/mpi-1.4': 'pertanyaan',
  'fase-f/mpi-11.1': 'stimulasi',
  'fase-f/mpi-11.2': 'orientasi',
  'fase-f/mpi-11.3': 'orientasi',
};

for (const [modul, key] of Object.entries(TAHAP_PERTAMA)) {
  test(modul + ': tahap pertama memuat panel Tujuan belajar hari ini', () => {
    const D = loadEngine([modul + '/data.js']).DATA[key];
    assert.ok(D, 'objek tahap ' + key + ' harus ada');
    assert.equal(D.tpJudul, 'Tujuan belajar hari ini');
    assert.equal(typeof D.tp, 'string');
    assert.ok(D.tp.trim().length > 20, 'tp tidak boleh kosong');
    assert.ok(Array.isArray(D.kriteria) && D.kriteria.length >= 3, 'kriteria minimal 3');
    D.kriteria.forEach((k) => assert.ok(typeof k === 'string' && k.trim().length > 0));
  });
}

test('buildTpPanel merender judul, TP, dan kriteria bernomor', () => {
  const E = loadEngine([]);
  const html = E.buildTpPanel({
    tpJudul: 'Tujuan belajar hari ini',
    tp: 'Membandingkan a < b.',
    kriteria: ['Satu', 'Dua'],
  });
  assert.match(html, /class="panel panel--info"/);
  assert.match(html, /🎯 Tujuan belajar hari ini/);
  assert.match(html, /<p class="tp-teks">Membandingkan a &lt; b\.<\/p>/);
  assert.equal((html.match(/objectives-list__num/g) || []).length, 2);
});
