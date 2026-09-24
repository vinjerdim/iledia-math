'use strict';

/*
 * Tes shared/engine.js seksi 24 (perbandingan bunga tunggal & majemuk):
 * saldo kedua jenis bunga pada periode yang sama, periode ketika bunga
 * majemuk mulai menyalip, pemilihan tawaran terbaik untuk menabung
 * maupun meminjam, serta komponen "duel tawaran".
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

/* Kasus modul MPI 3.3: Rp20.000.000, tunggal 12%/th vs majemuk 10%/th. */
const M0 = 20000000;
const IT = 0.12;
const IM = 0.1;

test('bandingTawaran: saldo tunggal & majemuk, selisih, dan yang unggul', () => {
  const t1 = E.bandingTawaran(M0, IT, IM, 1);
  assert.equal(t1.tunggal, 22400000);
  assert.equal(t1.majemuk, 22000000);
  assert.equal(t1.selisih, 400000);
  assert.equal(t1.unggul, 'tunggal');

  const t3 = E.bandingTawaran(M0, IT, IM, 3);
  assert.equal(t3.tunggal, 27200000);
  assert.equal(t3.majemuk, 26620000);
  assert.equal(t3.selisih, 580000);
  assert.equal(t3.unggul, 'tunggal');

  const t5 = E.bandingTawaran(M0, IT, IM, 5);
  assert.equal(t5.tunggal, 32000000);
  assert.equal(t5.majemuk, 32210200);
  assert.equal(t5.selisih, 210200);
  assert.equal(t5.unggul, 'majemuk');
});

test('bandingTawaran: suku bunga sama → sama pada periode 1, majemuk unggul sesudahnya', () => {
  const t0 = E.bandingTawaran(10000000, 0.1, 0.1, 0);
  assert.equal(t0.unggul, 'sama');
  assert.equal(t0.selisih, 0);
  assert.equal(E.bandingTawaran(10000000, 0.1, 0.1, 1).unggul, 'sama');
  const t2 = E.bandingTawaran(10000000, 0.1, 0.1, 2);
  assert.equal(t2.unggul, 'majemuk');
  assert.equal(t2.selisih, 100000);
});

test('periodeMenyalip: periode pertama saldo majemuk > saldo tunggal', () => {
  assert.equal(E.periodeMenyalip(M0, IT, IM, 10), 5);
  assert.equal(E.periodeMenyalip(10000000, 0.1, 0.1, 10), 2);
  assert.equal(E.periodeMenyalip(10000000, 0.08, 0.1, 10), 1);
  /* Selisih suku bunga jauh → belum menyalip dalam batas periode. */
  assert.equal(E.periodeMenyalip(M0, 0.2, 0.1, 4), null);
});

test('nilaiTawaran: saldo akhir satu tawaran sesuai jenis bunganya', () => {
  assert.equal(E.nilaiTawaran({ jenis: 'tunggal', M0, i: IT }, 4), 29600000);
  assert.equal(E.nilaiTawaran({ jenis: 'majemuk', M0, i: IM }, 4), 29282000);
});

test('tawaranTerbaik: menabung pilih saldo terbesar, meminjam pilih total terkecil', () => {
  const list = [
    { id: 'A', jenis: 'tunggal', M0, i: IT },
    { id: 'B', jenis: 'majemuk', M0, i: IM },
  ];
  assert.equal(E.tawaranTerbaik(list, 3, 'simpan').id, 'A');
  assert.equal(E.tawaranTerbaik(list, 3, 'simpan').nilai, 27200000);
  assert.equal(E.tawaranTerbaik(list, 5, 'simpan').id, 'B');
  assert.equal(E.tawaranTerbaik(list, 3, 'pinjam').id, 'B');
  assert.equal(E.tawaranTerbaik(list, 5, 'pinjam').id, 'A');
  assert.equal(E.tawaranTerbaik(list, 5, 'pinjam').nilai, 32000000);
});

const OPTS = {
  M0,
  tunggal: { nama: 'Koperasi A', i: IT },
  majemuk: { nama: 'Bank B', i: IM },
  maxN: 6,
  periode: 'Tahun',
};

test('ubahInterestDuel: n dibatasi 1..maxN, mencatat perubahan & n terbesar', () => {
  const st = E.makeInterestDuelState();
  assert.equal(st.n, 1);
  assert.equal(E.ubahInterestDuel(st, -1, OPTS), false);
  assert.equal(st.ubah, 0);
  assert.equal(E.ubahInterestDuel(st, 1, OPTS), true);
  assert.equal(st.n, 2);
  assert.equal(st.maks, 2);
  for (let k = 0; k < 10; k++) E.ubahInterestDuel(st, 1, OPTS);
  assert.equal(st.n, 6);
  assert.equal(st.maks, 6);
  E.ubahInterestDuel(st, -1, OPTS);
  assert.equal(st.n, 5);
  assert.equal(st.maks, 6, 'maks tidak turun');
  assert.equal(st.ubah, 6);
});

test('buildInterestDuel: dua kartu saldo, penanda unggul, selisih & tombol', () => {
  const st = E.makeInterestDuelState();
  let html = E.buildInterestDuel('duel', st, OPTS);
  assert.match(html, /id="duel"/);
  assert.match(html, /Koperasi A/);
  assert.match(html, /Bank B/);
  assert.match(html, /Rp22\.400\.000/);
  assert.match(html, /Rp22\.000\.000/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /interest-duel__card--tunggal interest-duel__card--win/);
  assert.doesNotMatch(html, /interest-duel__card--majemuk interest-duel__card--win/);
  assert.match(html, /Rp400\.000/);
  /* Tombol kurangi nonaktif di n = 1, tombol tambah aktif. */
  assert.match(html, /data-duel-step="-1"[^>]*disabled/);
  assert.doesNotMatch(html, /data-duel-step="1"[^>]*disabled/);

  st.n = 5;
  html = E.buildInterestDuel('duel', st, OPTS);
  assert.match(html, /Rp32\.000\.000/);
  assert.match(html, /Rp32\.210\.200/);
  assert.match(html, /interest-duel__card--majemuk interest-duel__card--win/);
  assert.match(html, /Rp210\.200/);
});

test('buildInterestDuel: grafik batang opsional sampai periode n', () => {
  const st = { n: 3, ubah: 0, maks: 3 };
  const html = E.buildInterestDuel('duel', st, Object.assign({ grafik: true }, OPTS));
  assert.match(html, /<svg/);
  const tanpa = E.buildInterestDuel('duel', st, OPTS);
  assert.doesNotMatch(tanpa, /<svg/);
});
