'use strict';

/*
 * Tes fungsi masalah kontekstual volume prisma (shared/engine.js seksi
 * 55): waktu pengisian & format durasi, persen isi, volume air setinggi
 * h, banyak ikan menurut kepadatan, kandidat & diagnosa miskonsepsi
 * soal kontekstual berjenis (volume, konversi, isi ulang, muat,
 * kepadatan, waktu, tinggi, biaya), pengecoh kartu isian, opsi
 * pilihan ganda, gambar prisma rebah, serta Lab Isi Air.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

/* Penampang kolam (x mendatar, z tegak) — lihat fase-d/mpi-22.5. */
const TRAPESIUM = [
  [0, 0],
  [4, 0.6],
  [4, 1.4],
  [0, 1.4],
];
const SEGITIGA_V = [
  [0, 1.5],
  [1.2, 0],
  [2.4, 1.5],
];
/* Bak sudut: segitiga siku-siku 60 cm × 50 cm (tegak, tinggi 50 cm). */
const BAK = {
  id: 'bak',
  nama: 'Bak sudut',
  alas: [
    [0, 0],
    [60, 0],
    [0, 50],
  ],
  t: 50,
};

test('waktuIsi & formatDurasi', () => {
  assert.equal(E.waktuIsi(8800, 20), 440);
  assert.equal(E.waktuIsi(24000, 100), 240);
  assert.equal(E.formatDurasi(440), '7 jam 20 menit');
  assert.equal(E.formatDurasi(240), '4 jam');
  assert.equal(E.formatDurasi(45), '45 menit');
  assert.equal(E.formatDurasi(0), '0 menit');
});

test('persenIsi, volumeAir, banyakMuatKepadatan', () => {
  assert.equal(E.persenIsi(60, 75), 80);
  assert.equal(E.volumeAir(BAK.alas, 40), 60000);
  assert.equal(E.volumeAir(BAK.alas, 0), 0);
  assert.equal(E.banyakMuatKepadatan(8.8, 25), 220);
  assert.equal(E.banyakMuatKepadatan(7.5, 25), 187);
  assert.equal(E.banyakMuatKepadatan(6, 25), 150);
});

test('kandidat volume: miskonsepsi seksi 54 + konversi satuan', () => {
  const k = plain(
    E.kandidatMasalahVolume({ jenis: 'volume', luasAlas: 1.8, tinggi: 4, adaSetengah: true })
  );
  assert.equal(k.benar, 7.2);
  assert.equal(k['lupa-setengah'], 14.4);
  assert.equal(k.sepertiga, 2.4);
  /* dengan konversi ke liter */
  const kl = plain(
    E.kandidatMasalahVolume({
      jenis: 'volume',
      luasAlas: 1800,
      kelilingAlas: 180,
      tinggi: 40,
      dari: 'cm3',
      ke: 'l',
    })
  );
  assert.equal(kl.benar, 72);
  assert.equal(kl['lupa-konversi'], 72000);
  assert.equal(kl.keliling, 7.2);
});

test('kandidat konversi volume: faktor panjang, faktor luas, arah terbalik', () => {
  const k = plain(E.kandidatMasalahVolume({ jenis: 'konversi', nilai: 8.8, dari: 'm3', ke: 'l' }));
  assert.equal(k.benar, 8800);
  assert.equal(k['faktor-panjang'], 88);
  assert.equal(k['faktor-luas'], 880);
  assert.equal(k['arah-terbalik'], 0.0088);
  const k2 = plain(
    E.kandidatMasalahVolume({ jenis: 'konversi', nilai: 3500, dari: 'cm3', ke: 'l' })
  );
  assert.equal(k2.benar, 3.5);
  assert.equal(k2['faktor-panjang'], 350);
  assert.equal(k2['faktor-luas'], 35);
  assert.equal(k2['arah-terbalik'], 3500000);
});

test('kandidat isi ulang (ke atas), muat (ke bawah), kepadatan', () => {
  assert.deepEqual(
    plain(E.kandidatMasalahVolume({ jenis: 'isiUlang', volume: 8800, isiWadah: 2000 })),
    {
      benar: 5,
      'bulat-bawah': 4,
      'belum-bulat': 4.4,
    }
  );
  /* hasil bagi bulat: tidak ada pengecoh pembulatan */
  assert.deepEqual(
    plain(E.kandidatMasalahVolume({ jenis: 'isiUlang', volume: 240, isiWadah: 15 })),
    {
      benar: 16,
    }
  );
  assert.deepEqual(plain(E.kandidatMasalahVolume({ jenis: 'muat', volume: 1000, isiSatu: 60 })), {
    benar: 16,
    'muat-atas': 17,
    'belum-bulat': 16.666667,
  });
  const kp = plain(E.kandidatMasalahVolume({ jenis: 'kepadatan', volume: 7.5, per: 25 }));
  assert.equal(kp.benar, 187);
  assert.equal(kp['muat-atas'], 188);
  assert.equal(kp['belum-bulat'], 187.5);
  assert.equal(kp['bagi-kepadatan'], 0.3);
});

test('kandidat waktu, tinggi, biaya', () => {
  const w = plain(E.kandidatMasalahVolume({ jenis: 'waktu', volume: 8800, debit: 20 }));
  assert.equal(w.benar, 440);
  assert.equal(w['kali-debit'], 176000);
  assert.equal(w['satuan-waktu'], E.lppBulat(440 / 60));
  const wj = plain(
    E.kandidatMasalahVolume({ jenis: 'waktu', volume: 24000, debit: 100, keJam: true })
  );
  assert.equal(wj.benar, 4);
  assert.equal(wj['satuan-waktu'], 240);
  const wk = plain(
    E.kandidatMasalahVolume({ jenis: 'waktu', volume: 8800, debit: 20, volumeAsal: 8.8 })
  );
  assert.equal(wk['lupa-konversi'], 0.44);

  const t = plain(
    E.kandidatMasalahVolume({ jenis: 'tinggi', volume: 60000, luasAlas: 1500, adaSetengah: true })
  );
  assert.equal(t.benar, 40);
  assert.equal(t['kali-alas'], 90000000);
  assert.equal(t['tinggi-lupa-setengah'], 20);
  const tk = plain(
    E.kandidatMasalahVolume({ jenis: 'tinggi', volume: 60000, luasAlas: 2000, kelilingAlas: 180 })
  );
  assert.equal(tk['bagi-keliling'], E.lppBulat(60000 / 180));

  const b = plain(
    E.kandidatMasalahVolume({
      jenis: 'biaya',
      kebutuhan: 8.8,
      tersedia: 2,
      harga: 5000,
      faktorSatuan: 1000,
    })
  );
  assert.equal(b.benar, 34000);
  assert.equal(b['lupa-kurang'], 44000);
  assert.equal(b['lupa-konversi'], 34000000);
  assert.throws(() => E.kandidatMasalahVolume({ jenis: 'entah' }));
});

test('diagnosaMasalahVolume: kode & pesan', () => {
  const cek = { jenis: 'isiUlang', volume: 8800, isiWadah: 2000 };
  assert.equal(E.diagnosaMasalahVolume(cek, 5).kode, 'benar');
  const d = E.diagnosaMasalahVolume(cek, 4);
  assert.equal(d.kode, 'bulat-bawah');
  assert.match(d.pesan, /ke atas/i);
  assert.equal(E.diagnosaMasalahVolume(cek, 99).kode, 'salah-hitung');
  const v = E.diagnosaMasalahVolume(
    { jenis: 'volume', luasAlas: 1.8, tinggi: 4, adaSetengah: true },
    14.4
  );
  assert.equal(v.kode, 'lupa-setengah');
  assert.ok(v.pesan.length > 10);
  const k = E.diagnosaMasalahVolume({ jenis: 'konversi', nilai: 8.8, dari: 'm3', ke: 'l' }, 880);
  assert.equal(k.kode, 'faktor-luas');
  assert.match(k.pesan, /1\.000/);
  /* setiap kode kandidat punya pesan khusus */
  const semua = [
    {
      jenis: 'volume',
      luasAlas: 6,
      tinggi: 4,
      kelilingAlas: 12,
      adaSetengah: true,
      dari: 'm3',
      ke: 'l',
    },
    { jenis: 'konversi', nilai: 3500, dari: 'cm3', ke: 'l' },
    { jenis: 'isiUlang', volume: 8800, isiWadah: 2000 },
    { jenis: 'muat', volume: 1000, isiSatu: 60 },
    { jenis: 'kepadatan', volume: 7.5, per: 25 },
    { jenis: 'waktu', volume: 8800, debit: 20, volumeAsal: 8.8 },
    { jenis: 'tinggi', volume: 60000, luasAlas: 2000, kelilingAlas: 180, adaSetengah: true },
    { jenis: 'biaya', kebutuhan: 8.8, tersedia: 2, harga: 5000, faktorSatuan: 1000 },
  ];
  semua.forEach((c) => {
    Object.keys(E.kandidatMasalahVolume(c)).forEach((kode) => {
      assert.ok(E.VPK_PESAN[kode] || E.VPR_PESAN[kode], c.jenis + ': pesan ' + kode);
    });
  });
});

test('pengecohMasalahVolume: tanpa jawaban benar, unik, positif', () => {
  const p = plain(E.pengecohMasalahVolume({ jenis: 'konversi', nilai: 8.8, dari: 'm3', ke: 'l' }));
  assert.deepEqual(
    p.map((x) => x.nilai),
    [88, 880, 0.0088]
  );
  p.forEach((x) => assert.ok(x.pesan && x.kode));
  assert.deepEqual(
    plain(E.pengecohMasalahVolume({ jenis: 'isiUlang', volume: 240, isiWadah: 15 })),
    []
  );
});

test('opsiMasalahVolume: 4 opsi unik, benar di depan, label bersatuan', () => {
  const o = plain(
    E.opsiMasalahVolume(
      { jenis: 'volume', luasAlas: 3, tinggi: 4, kelilingAlas: 8, adaSetengah: true },
      'm³'
    )
  );
  assert.equal(o.length, 4);
  assert.equal(o[0].id, 'benar');
  assert.equal(o[0].label, '12 m³');
  assert.deepEqual(
    o.map((x) => x.id),
    ['benar', 'lupa-setengah', 'luas-permukaan', 'keliling']
  );
  assert.equal(new Set(o.map((x) => x.nilai)).size, 4);
  /* kurang kandidat → cadangan */
  const c = plain(E.opsiMasalahVolume({ jenis: 'isiUlang', volume: 240, isiWadah: 15 }, 'ember'));
  assert.equal(c.length, 4);
  assert.equal(c[0].label, '16 ember');
  /* awalan Rp */
  const r = plain(
    E.opsiMasalahVolume({ jenis: 'biaya', kebutuhan: 3, tersedia: 1, harga: 6000 }, '', {
      awalan: 'Rp',
    })
  );
  assert.equal(r[0].label, 'Rp12.000');
  assert.equal(r.length, 4);
});

test('vpkSisiRebah: dua alas & sisi selimut, terlihat menghadap pengamat', () => {
  const f = plain(E.vpkSisiRebah(TRAPESIUM, 2));
  assert.equal(f.length, 6);
  const alas = f.filter((x) => x.jenis === 'alas');
  assert.equal(alas.length, 2);
  /* alas belakang (y = 0) tersembunyi, alas depan (y = panjang) terlihat */
  assert.equal(alas.filter((x) => x.terlihat).length, 1);
  assert.ok(alas.find((x) => x.terlihat).pts3.every((q) => q[1] === 2));
  /* permukaan air (z = 1,4) terlihat */
  const atas = f.find((x) => x.jenis === 'selimut' && x.pts3.every((q) => q[2] === 1.4));
  assert.ok(atas && atas.terlihat && atas.atas);
  const v = E.vpkSisiRebah(SEGITIGA_V, 4);
  assert.equal(v.length, 5);
});

test('buildVpRebahSVG: svg beraria, alas disorot, label panjang', () => {
  const s = E.buildVpRebahSVG(TRAPESIUM, 2, { aria: 'Kolam B', satuan: 'm' });
  assert.match(s, /<svg class="vpr-svg vpk-svg"/);
  assert.match(s, /aria-label="Kolam B"/);
  assert.match(s, /vpk-face--alas/);
  assert.match(s, />2 m</);
  assert.doesNotMatch(E.buildVpRebahSVG(TRAPESIUM, 2, { sorotAlas: false }), /vpk-face--alas/);
});

test('Lab Isi Air: state, atur tinggi, tercapai target', () => {
  const cfg = { wadah: BAK, target: 60000 };
  const S = {};
  const st = E.ensureVpAirState(S, 'air', cfg);
  assert.equal(st.h, 0);
  assert.equal(st.tercapai, false);
  E.vpAirAtur(st, cfg, 99);
  assert.equal(st.h, 50);
  assert.equal(st.tercapai, false);
  E.vpAirAtur(st, cfg, 40);
  assert.equal(st.tercapai, true);
  /* tercapai tetap tercatat walau digeser lagi */
  E.vpAirAtur(st, cfg, 10);
  assert.equal(st.tercapai, true);
  const info = plain(E.vpAirInfo(cfg, 40));
  assert.deepEqual(info, { volume: 60000, liter: 60, persen: 80, pas: true });
  /* state rusak dipulihkan */
  S.air = { h: 'x' };
  assert.equal(E.ensureVpAirState(S, 'air', cfg).h, 0);

  const html = E.buildVpAirLab('labAir', st, cfg);
  assert.match(html, /id="labAir"/);
  assert.match(html, /type="range"/);
  assert.match(html, /aria-label="Tinggi air/);
  assert.match(html, /60 liter/);
  assert.match(html, /aria-live="polite"/);
});
