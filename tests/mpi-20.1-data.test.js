'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-20.1/data.js (rerata data tunggal,
 * Discovery Learning): setiap tahap punya kepala DL; setiap daftar
 * pilihan cukup opsi untuk diacak dengan id & label unik serta umpan
 * balik tiap opsi; dugaan baku, data lab, latihan, papan seimbang, data
 * verifikasi, dan soal uji terap dihitung ulang dengan fungsi seksi 87
 * shared/engine.js; bank soal cukup untuk diambil acak sesuai komposisi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-20.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.ok(list.length <= 6, name + ' maksimal 6 opsi (huruf A–F)');
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

/* Rerata ditulis dengan paling banyak 2 angka desimal (tidak berulang). */
function assertRerataRapi(data, name) {
  const r = E.rerataData(data);
  assert.ok(E.hampirSama(r * 100, Math.round(r * 100)), name + ': rerata ≤ 2 desimal');
  return r;
}

test('setiap tahap DL punya kicker, syntax, goal, dan catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'koleksi',
    'olahRumus',
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

test('stimulasi: TP lengkap & dugaan baku sesuai data kelompok', () => {
  const S = D.stimulasi;
  ['rerata', 'mean', 'data tunggal', 'sehari-hari'].forEach((u) =>
    assert.ok(S.tp.includes(u), 'TP memuat ' + u)
  );
  assert.ok(S.kriteria.length >= 4);
  const [melati, kenanga] = S.kelompok;
  S.kelompok.forEach((k) => {
    assertData(k.data, k.id);
    assert.equal(k.anggota.length, k.data.length, k.id + ': anggota sebanyak data');
  });
  /* Total Kenanga lebih besar, tetapi rerata Melati lebih besar. */
  assert.ok(E.jumlahData(kenanga.data) > E.jumlahData(melati.data));
  assert.ok(E.rerataData(melati.data) > E.rerataData(kenanga.data));
  const d = {};
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.temuan.length > 20);
    d[q.id] = q;
  });
  assert.equal(d.dRajin.baku, 'melati');
  /* Rerata Melati bukan nilai data. */
  assert.ok(!melati.data.includes(E.rerataData(melati.data)));
  assert.equal(d.dBukanData.baku, 'bukanData');
  assert.ok(E.rerataData(kenanga.data.concat(S.tambahanKenanga)) > E.rerataData(kenanga.data));
  assert.equal(d.dPencilan.baku, 'naik');
  assert.ok(d.dRajin.temuan.includes(E.formatDesimal(E.rerataData(melati.data), 2)));
});

test('masalah: pertanyaan inti berpengecoh', () => {
  assertGuided(D.masalah, 'masalah');
});

test('koleksi: tiga regu — bulat, ada nol, dan bersisa (desimal)', () => {
  const R = D.koleksi.regu;
  assert.equal(R.length, 3);
  R.forEach((r) => {
    assertData(r.data, r.id);
    assert.equal(r.anggota.length, r.data.length, r.id + ': anggota sebanyak data');
    assert.ok(Math.max(...r.data) <= 8, r.id + ': menara muat di layar');
    assert.ok(!E.menaraRata(r.data), r.id + ': belum rata di awal');
    assert.ok(E.langkahMinRatakan(r.data) >= 1);
    assert.ok(r.hints.length >= 1 && r.tanya && r.temuan);
    assert.ok(r.temuan.includes(E.formatDesimal(E.rerataData(r.data), 2)), r.id + ': temuan');
  });
  assert.equal(E.sisaRatakan(R[0].data).sisa, 0);
  assert.ok(R[1].data.includes(0), 'regu 2 memuat nilai 0');
  assert.equal(E.sisaRatakan(R[1].data).sisa, 0);
  assert.ok(E.sisaRatakan(R[2].data).sisa > 0, 'regu 3 bersisa');
  assertRerataRapi(R[2].data, 'regu3');
  assert.equal(D.koleksi.kolom.length, 5);
});

test('olahRumus: pertanyaan penuntun & latihan berdiagnosa', () => {
  const O = D.olahRumus;
  O.pertanyaan.forEach((q) => assertGuided(q, q.id));
  assert.ok(O.temuan.length >= 2);
  assert.equal(O.latihan.length, 2);
  O.latihan.forEach((l) => {
    assertData(l.data, l.id);
    assert.equal(l.anggota.length, l.data.length);
    assertRerataRapi(l.data, l.id);
    assert.ok(l.hints.length >= 1);
  });
  /* Latihan 1 memuat nilai 0 sehingga miskonsepsi 'tanpaNol' dapat muncul. */
  const l1 = O.latihan[0].data;
  assert.ok(l1.includes(0));
  assert.equal(E.diagnosaRerata(l1, E.jumlahData(l1) / l1.filter((v) => v).length), 'tanpaNol');
  /* Latihan 2 berrerata desimal sehingga miskonsepsi 'bulat'/median dapat muncul. */
  const r2 = E.rerataData(O.latihan[1].data);
  assert.ok(!Number.isInteger(r2));
});

test('olahMakna: papan seimbang dapat dicapai dengan langkah geser', () => {
  const M = D.olahMakna;
  M.papan.forEach((p) => {
    assertData(p.data, p.id);
    assert.equal(p.anggota.length, p.data.length);
    const r = E.rerataData(p.data);
    assert.ok(r >= p.min && r <= p.max, p.id + ': rerata dalam rentang');
    assert.ok(E.hampirSama((r - p.awal) / M.langkah, Math.round((r - p.awal) / M.langkah)), p.id);
    assert.notEqual(E.momenSeimbang(p.data, p.awal).arah, 'seimbang', p.id + ': awal miring');
    assert.equal(E.momenSeimbang(p.data, r).arah, 'seimbang');
    assert.ok(Math.max(...p.data) <= p.max);
    assert.ok(p.temuan.includes(E.formatDesimal(r, 2)), p.id + ': temuan menyebut rerata');
  });
  /* Papan B = Papan A + satu pencilan yang menaikkan rerata. */
  assert.deepEqual([...M.papan[1].data.slice(0, 4)], [...M.papan[0].data]);
  assert.ok(E.rerataData(M.papan[1].data) > E.rerataData(M.papan[0].data));
  M.pertanyaan.forEach((q) => assertGuided(q, q.id));
  assert.ok(M.pilah.length >= 5);
  assert.equal(new Set(ids(M.pilah)).size, M.pilah.length);
  M.pilah.forEach((p) => {
    assert.ok(['benar', 'salah'].includes(p.correct), p.id);
    assert.ok(p.explanation.length > 10);
  });
  assert.deepEqual([...ids(E.OPSI_BENAR_SALAH)].sort(), ['benar', 'salah']);
});

test('verifikasi: bank data baru, tafsiran, dan cara mengambil', () => {
  const V = D.verifikasi;
  assert.ok(V.bank.length >= V.ambil * 2, 'bank cukup untuk diambil acak');
  assert.equal(new Set(ids(V.bank)).size, V.bank.length);
  V.bank.forEach((b) => {
    assertData(b.data, b.id);
    assert.equal(b.anggota.length, b.data.length, b.id + ': anggota sebanyak data');
    assert.ok(D.konteks[b.konteks], b.id + ': konteks');
    const r = assertRerataRapi(b.data, b.id);
    assert.ok(Math.max(...b.data) <= b.max, b.id + ': data muat di papan');
    assert.ok(E.opsiRerata(b.data, b.satuan).length >= 4);
    assertGuided(b.tafsir, b.id + '.tafsir');
    assert.ok(
      b.tafsir.umpan[b.tafsir.correct].includes(E.formatDesimal(r, 2)) ||
        b.tafsir.opsi.some(
          (o) => o.id === b.tafsir.correct && o.label.includes(E.formatDesimal(r, 2))
        ),
      b.id + ': tafsiran benar menyebut rerata'
    );
  });
  assert.ok(V.kesimpulan && V.judulA && V.judulB && V.judulC && V.instruksiB);
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
    if (s.tipe === 'hitung' || s.tipe === 'pilihRerata') {
      assertData(s.data, s.id);
      const r = assertRerataRapi(s.data, s.id);
      assert.ok(s.pembahasan.includes(E.formatDesimal(r, 2)), s.id + ': pembahasan memuat kunci');
      if (s.tipe === 'pilihRerata') assertOptions(E.opsiRerata(s.data, s.satuan), s.id, 4);
    } else if (s.tipe === 'hilang') {
      assertData(s.diketahui, s.id);
      const x = E.dataHilangDariRerata(s.diketahui, s.rerata);
      assert.ok(x >= 0 && Number.isInteger(x), s.id + ': data hilang bulat tak negatif');
      assert.ok(!E.hampirSama(x, s.rerata * (s.diketahui.length + 1)));
      assert.ok(s.pembahasan.includes(E.formatDesimal(x, 2)), s.id + ': pembahasan memuat kunci');
    } else {
      assert.equal(s.tipe, 'pilih', s.id + ': tipe dikenal');
      assertGuided(s, s.id);
    }
  });
});

test('refleksi & selesai', () => {
  assert.equal(D.refleksi.pertanyaan.length, 3);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 4);
});
