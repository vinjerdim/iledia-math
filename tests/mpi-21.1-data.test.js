'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-21.1/data.js (hubungan mean, median
 * & modus, Discovery Learning): setiap tahap punya kepala DL; setiap
 * daftar pilihan cukup opsi untuk diacak dengan id & label unik serta
 * umpan balik tiap opsi; klaim juru bicara, dugaan baku, misi lab,
 * latihan, data verifikasi, dan soal uji terap dihitung ulang dengan
 * fungsi seksi 87–88 shared/engine.js; bank soal cukup untuk diambil
 * acak sesuai komposisi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-21.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.ok(list.length <= 6, name + ' maksimal 6 opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  assert.equal(
    new Set(list.map((o) => o.label || o.teks)).size,
    list.length,
    name + ': label opsi harus unik'
  );
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertData(data, name) {
  assert.ok(Array.isArray(data) && data.length >= 3, name + ': minimal 3 data');
  data.forEach((v) => assert.ok(typeof v === 'number' && v >= 0, name + ': data tak negatif'));
}

/* Mean & median ditulis dengan paling banyak 2 angka desimal; modus tunggal. */
function assertRapi(data, name) {
  ['rerata', 'median'].forEach((j) => {
    const v = E.kunciUkuran(data, j);
    assert.ok(E.hampirSama(v * 100, Math.round(v * 100)), name + ': ' + j + ' ≤ 2 desimal');
  });
  assert.equal(E.semuaModus(data).length, 1, name + ': modus tunggal');
}

test('setiap tahap DL punya kicker, syntax, goal, dan catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'koleksi',
    'olahPola',
    'olahMakna',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    ['kicker', 'syntax', 'goal', 'guru'].forEach((f) =>
      assert.ok(typeof D[k][f] === 'string' && D[k][f].length > 5, k + '.' + f)
    );
  });
});

test('stimulasi: TP lengkap, klaim juru bicara & dugaan baku sesuai data', () => {
  const S = D.stimulasi;
  ['mean', 'median', 'modus', 'data tunggal', 'kontekstual'].forEach((u) =>
    assert.ok(S.tp.includes(u), 'TP memuat ' + u)
  );
  assert.ok(S.kriteria.length >= 4);
  assertData(S.data, 'stimulasi');
  assert.equal(S.anggota.length, S.data.length);
  assertRapi(S.data, 'stimulasi');
  S.juru.forEach((j) => {
    assert.equal(E.kunciUkuran(S.data, j.jenis), j.nilai, j.id + ': klaim = ukuran');
    assert.ok(j.klaim.includes('Rp' + j.nilai), j.id + ': klaim menyebut nilai');
  });
  assert.equal(new Set(S.juru.map((j) => j.nilai)).size, 3, 'ketiga klaim berbeda');
  assert.equal(E.bentukSebaran(S.data), 'ekorKanan');
  assert.ok(S.data.includes(S.pencilan));
  assert.equal(S.pencilan, Math.max(...S.data));

  const d = {};
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.temuan.length > 20);
    d[q.id] = q;
  });
  assert.equal(d.dSiapa.baku, 'semua');
  /* Kebanyakan murid di bawah mean → median paling mewakili. */
  const r = E.rerataData(S.data);
  assert.ok(S.data.filter((v) => v < r).length > S.data.length / 2);
  assert.equal(d.dWakil.baku, 'median');
  /* Tanpa pencilan: perubahan mean terbesar. */
  const tanpa = S.data.filter((v) => v !== S.pencilan);
  const ubah = (j) => Math.abs(E.kunciUkuran(S.data, j) - E.kunciUkuran(tanpa, j));
  assert.ok(ubah('rerata') > ubah('median') && ubah('median') > ubah('modus'));
  assert.equal(d.dPencilan.baku, 'rerata');
  assert.ok(d.dPencilan.temuan.includes(E.formatDesimal(E.rerataData(tanpa), 2)));
  assert.ok(d.dPencilan.temuan.includes(E.formatDesimal(E.medianData(tanpa), 2)));
});

test('masalah: pertanyaan inti berpengecoh', () => {
  assertGuided(D.masalah, 'masalah');
});

test('koleksi: misi belum tercapai di awal dan dapat dicapai', () => {
  const K = D.koleksi;
  assert.equal(K.misi.length, 4);
  assert.equal(new Set(ids(K.misi)).size, 4);
  assert.deepEqual([...K.misi.map((m) => m.jenis)].sort(), [
    'hanyaRerata',
    'rerataKurang',
    'rerataLebih',
    'sama',
  ]);
  K.misi.forEach((m) => {
    assertData(m.awal, m.id);
    assert.equal(m.awal.length, K.anggota.length, m.id + ': anggota sebanyak data');
    const cfg = Object.assign({}, m, { awal: m.awal });
    assert.equal(E.cekMisiUkuran(m.awal, cfg), false, m.id + ': belum tercapai di awal');
    assert.equal(E.cekMisiUkuran(m.contoh, cfg), true, m.id + ': contoh memenuhi misi');
    assert.equal(m.contoh.length, m.awal.length);
    m.awal.concat(m.contoh).forEach((v) => assert.ok(v >= K.min && v <= K.max, m.id + ': rentang'));
    if (m.gerak) {
      m.awal.forEach((v, i) => {
        if (!m.gerak.includes(i)) assert.equal(m.contoh[i], v, m.id + ': hanya titik gerak');
      });
    }
    assert.ok(m.hints.length >= 1 && m.tugas && m.temuan, m.id + ': teks');
  });
  /* Misi 2–4 dimulai dari data simetris. */
  K.misi.slice(1).forEach((m) => assert.equal(E.bentukSebaran(m.awal), 'simetris', m.id));
  /* Misi 4: titik yang boleh digeser adalah nilai terbesar. */
  const m4 = K.misi[3];
  assert.equal(m4.awal[m4.gerak[0]], Math.max(...m4.awal));
  assert.equal(K.kolom.length, 6);
});

test('olahPola: pertanyaan penuntun & latihan berdiagnosa', () => {
  const O = D.olahPola;
  O.pertanyaan.forEach((q) => assertGuided(q, q.id));
  assert.ok(O.temuan.length >= 4);
  const L = O.latihan;
  assertData(L.data, 'latihan');
  assert.equal(L.anggota.length, L.data.length);
  assertRapi(L.data, 'latihan');
  assert.equal(L.data.length % 2, 0, 'latihan berbanyak data genap (median dua nilai tengah)');
  assert.deepEqual([...L.urutan].sort(), ['median', 'modus', 'rerata']);
  L.urutan.forEach((j) => assert.ok(L.hints[j].length >= 1, 'hints ' + j));
  assert.ok(Math.max(...L.data) <= L.max);
  /* Miskonsepsi kunci dapat terdiagnosa pada latihan ini. */
  const u = [...L.data].sort((a, b) => a - b);
  assert.notEqual(u[3], u[4], 'dua nilai tengah berbeda');
  assert.equal(E.diagnosaMedian(L.data, u[3]), 'genapSatu');
  assert.equal(E.diagnosaModus(L.data, 3), 'frekuensi');
  /* Umpan hubungan lengkap & kunci benar disebut. */
  const h = E.hubunganRerataMedian(L.data);
  E.OPSI_HUBUNGAN.forEach((o) => assert.ok(L.hubungan.umpan[o.id], 'umpan ' + o.id));
  ['rerata', 'median', 'modus'].forEach((j) =>
    assert.ok(L.hubungan.umpan[h].includes(E.formatDesimal(E.kunciUkuran(L.data, j), 2)), j)
  );
});

test('OPSI_HUBUNGAN: id sesuai hubunganRerataMedian', () => {
  assertOptions(E.OPSI_HUBUNGAN, 'OPSI_HUBUNGAN', 4);
  ['lebih', 'sama', 'kurang'].forEach((id) => assert.ok(ids(E.OPSI_HUBUNGAN).includes(id)));
});

test('olahMakna: pilihan ukuran sesuai ciri data & pemilahan', () => {
  const M = D.olahMakna;
  M.pertanyaan.forEach((q) => {
    assertGuided(q, q.id);
    assertData(q.data, q.id);
  });
  const q = {};
  M.pertanyaan.forEach((x) => (q[x.id] = x));
  /* Sepatu: modus tunggal; kantin: berekor (pencilan); ulangan: tanpa modus, hampir simetris. */
  assert.equal(E.semuaModus(q.qSepatu.data).length, 1);
  assert.equal(E.bentukSebaran(q.qKantin.data), 'ekorKanan');
  assert.ok(q.qKantin.umpan.median.includes(E.formatDesimal(E.medianData(q.qKantin.data), 2)));
  assert.ok(q.qKantin.umpan.median.includes(E.formatDesimal(E.rerataData(q.qKantin.data), 2)));
  assert.deepEqual([...E.semuaModus(q.qUlangan.data)], []);
  assert.ok(q.qUlangan.umpan.mean.includes(E.formatDesimal(E.rerataData(q.qUlangan.data), 2)));
  assert.ok(q.qSepatu.umpan.mean.includes(E.formatDesimal(E.rerataData(q.qSepatu.data), 2)));
  assert.ok(M.temuan.length >= 3);
  assert.ok(M.pilah.length >= 6);
  assert.equal(new Set(ids(M.pilah)).size, M.pilah.length);
  M.pilah.forEach((p) => {
    assert.ok(['benar', 'salah'].includes(p.correct), p.id);
    assert.ok(p.explanation.length > 10);
  });
  assert.ok(
    M.pilah.some((p) => p.correct === 'benar') && M.pilah.some((p) => p.correct === 'salah')
  );
});

test('verifikasi: bank data baru mencakup ketiga bentuk, tafsiran sah', () => {
  const V = D.verifikasi;
  assert.ok(V.bank.length >= V.ambil * 2, 'bank cukup untuk diambil acak');
  assert.equal(new Set(ids(V.bank)).size, V.bank.length);
  const bentuk = new Set();
  V.bank.forEach((b) => {
    assertData(b.data, b.id);
    assert.equal(b.anggota.length, b.data.length, b.id + ': anggota sebanyak data');
    assert.ok(D.konteks[b.konteks], b.id + ': konteks');
    assertRapi(b.data, b.id);
    assert.ok(Math.max(...b.data) <= b.max, b.id + ': data muat di diagram');
    bentuk.add(E.bentukSebaran(b.data));
    assertGuided(b.tafsir, b.id + '.tafsir');
  });
  assert.deepEqual([...bentuk].sort(), ['ekorKanan', 'ekorKiri', 'simetris']);
  /* Data tanpa pencilan stimulasi & pilihan juru bicara. */
  assertGuided(V.pilihJuru, 'pilihJuru');
  const S = D.stimulasi;
  const tanpa = S.data.filter((v) => v !== S.pencilan);
  assertRapi(tanpa, 'tanpa pencilan');
  const juruMedian = S.juru.find((j) => j.jenis === 'median').id;
  assert.equal(V.pilihJuru.correct, juruMedian);
  assert.ok(V.kesimpulan && V.judulA && V.judulB && V.judulC && V.instruksiB && V.dugaLabel);
});

test('generalisasi: kalimat kesimpulan, bank berpengecoh', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  assert.ok(bank.length >= G.kalimat.length + 2, 'ada pengecoh');
  G.kalimat.forEach((k) => assert.ok(bank.includes(k.correct), k.id));
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: bank soal sah, kunci dihitung ulang, komposisi dapat dipenuhi', () => {
  const T = D.terapkan;
  const total = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, T.banyak);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  Object.keys(T.komposisi).forEach((tipe) => {
    const n = T.soal.filter((s) => s.tipe === tipe).length;
    assert.ok(n > T.komposisi[tipe], tipe + ': bank lebih banyak dari yang diambil');
  });
  T.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.cerita && s.tanya && s.pembahasan, s.id + ': teks lengkap');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, s.id + ': petunjuk');
    if (s.tipe === 'hitung' || s.tipe === 'pilihUkuran') {
      assertData(s.data, s.id);
      assert.ok(['rerata', 'median', 'modus'].includes(s.jenis), s.id + ': jenis');
      const k = E.kunciUkuran(s.data, s.jenis);
      assert.ok(E.hampirSama(k * 100, Math.round(k * 100)), s.id + ': kunci ≤ 2 desimal');
      if (s.jenis === 'modus') assert.equal(E.semuaModus(s.data).length, 1, s.id + ': modus');
      assert.ok(s.pembahasan.includes(E.formatDesimal(k, 2)), s.id + ': pembahasan memuat kunci');
      if (s.tipe === 'pilihUkuran') assertOptions(E.opsiUkuran(s.data, s.jenis, s.satuan), s.id, 4);
    } else if (s.tipe === 'hubungan') {
      assertData(s.data, s.id);
      const h = E.hubunganRerataMedian(s.data);
      assert.ok(ids(E.OPSI_HUBUNGAN).includes(h));
      assert.ok(s.pembahasan.includes(E.formatDesimal(E.rerataData(s.data), 2)), s.id + ': mean');
      assert.ok(s.pembahasan.includes(E.formatDesimal(E.medianData(s.data), 2)), s.id + ': median');
    } else {
      assert.equal(s.tipe, 'pilih', s.id + ': tipe dikenal');
      assertGuided(s, s.id);
    }
  });
  /* Soal hubungan mencakup ketiga kemungkinan. */
  const h = new Set(
    T.soal.filter((s) => s.tipe === 'hubungan').map((s) => E.hubunganRerataMedian(s.data))
  );
  assert.deepEqual([...h].sort(), ['kurang', 'lebih', 'sama']);
});

test('refleksi & selesai', () => {
  assert.equal(D.refleksi.pertanyaan.length, 3);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 4);
});
