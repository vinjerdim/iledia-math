'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-18.1/data.js (sisi & sudut
 * bersesuaian, kongruen vs sebangun, Discovery Learning): setiap tahap
 * punya kepala DL; setiap daftar pilihan cukup opsi untuk diacak dengan
 * id & label unik serta umpan balik tiap opsi; kunci dugaan, pemilahan,
 * pasangan verifikasi, dan soal bergambar dihitung ulang dari
 * geometrinya dengan fungsi seksi 26 & 85 shared/engine.js; soal
 * unsur bersesuaian hanya memakai pasangan berpemetaan tunggal; bank
 * soal cukup untuk diambil acak sesuai komposisi.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-18.1/data.js']);
const D = E.DATA;

const JENIS = E.OPSI_KLASIFIKASI.map((o) => o.id);

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

function assertBangun(b, name) {
  assert.ok(b && b.id && b.nama, name + ': id & nama');
  assert.ok(b.pts.length >= 3, name + ': ≥ 3 titik');
  assert.equal(b.titik.length, b.pts.length, name + ': titik sebanyak pts');
  assert.equal(new Set(b.titik).size, b.titik.length, name + ': nama titik unik');
  assert.ok(Math.abs(E.luasBertanda(b.pts)) > 0.5, name + ': bukan bangun gepeng');
  b.pts.forEach((p) => p.forEach((v) => assert.ok(v >= 0 && v <= 10, name + ': koordinat 0–10')));
}

/* Pasangan untuk soal unsur bersesuaian: sebangun/kongruen, pemetaan tunggal. */
function assertTunggal(p, q, name) {
  assert.ok(E.korespondensiBangun(p, q), name + ': harus sebangun/kongruen');
  assert.ok(E.korespondensiTunggal(p, q), name + ': pemetaan titik harus tunggal');
}

test('setiap tahap DL punya kicker, syntax, goal, dan catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'koleksi',
    'olahBersesuaian',
    'olahJenis',
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

test('stimulasi: TP lengkap & dugaan berpilihan acak dengan baku dari geometri', () => {
  const S = D.stimulasi;
  ['bersesuaian', 'kongruen', 'sebangun', 'lingkungan sekitar'].forEach((u) =>
    assert.ok(S.tp.includes(u), 'TP memuat ' + u)
  );
  assert.ok(S.kriteria.length >= 3);
  assert.ok(S.kartu.length >= 5);
  assert.ok(S.dugaan.length >= 3);
  const baku = new Set();
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, q.id);
    assertBangun(q.p, q.id + '.p');
    assertBangun(q.q, q.id + '.q');
    assert.equal(
      q.baku,
      S.bakuDariJenis[E.klasifikasiBangun(q.p.pts, q.q.pts)],
      q.id + ': baku sesuai jenis pasangan'
    );
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.temuan && q.temuan.length > 20, q.id + ': temuan');
    baku.add(q.baku);
  });
  assert.equal(baku.size, 3, 'dugaan memuat kongruen, sebangun, dan tidak keduanya');
});

test('masalah: pertanyaan inti berpengecoh', () => {
  assertGuided(D.masalah, 'masalah');
});

test('koleksi: lab jiplak dapat diselesaikan & memuat keempat kemungkinan', () => {
  const K = D.koleksi;
  assertBangun(K.asal, 'asal');
  assert.equal(360 % K.langkah, 0, 'langkah membagi 360');
  assert.equal(K.calon.length, 4);
  assert.equal(new Set(ids(K.calon)).size, 4);
  const hasil = K.calon.map((b) => {
    assertBangun(b, b.id);
    return {
      jenis: E.klasifikasiBangun(K.asal.pts, b.pts),
      posisi: E.cariPosisiBerimpit(K.asal.pts, b.pts, K.langkah),
    };
  });
  /* diputar saja, perlu dibalik, diperbesar, dan bangun lain */
  assert.ok(
    hasil.some((h) => h.posisi && !h.posisi.cermin),
    'ada yang berimpit tanpa dibalik'
  );
  assert.ok(
    hasil.some((h) => h.posisi && h.posisi.cermin),
    'ada yang perlu dibalik'
  );
  assert.ok(
    hasil.some((h) => h.jenis === 'sebangun'),
    'ada yang sebangun'
  );
  assert.ok(
    hasil.some((h) => h.jenis === 'tidak'),
    'ada yang tidak sebangun'
  );
  hasil.forEach((h) => assert.equal(!!h.posisi, h.jenis === 'kongruen'));
  /* bangun yang diukur: asal & satu bangun sebangun */
  assert.equal(K.ukur[0], K.asal);
  assert.equal(E.klasifikasiBangun(K.asal.pts, K.ukur[1].pts), 'sebangun');
  assert.equal(K.kolom.length, 3);
});

test('olahBersesuaian: langkah berpemetaan tunggal & jebakan urutan huruf', () => {
  const O = D.olahBersesuaian;
  assert.ok(O.langkah.length >= 6);
  assert.equal(new Set(ids(O.langkah)).size, O.langkah.length);
  const jenis = new Set();
  let jebakan = 0;
  O.langkah.forEach((l) => {
    assertTunggal(l.p, l.q, l.id);
    assert.equal(E.klasifikasiBangun(l.p.pts, l.q.pts), 'kongruen', l.id + ': berimpit');
    assert.ok(O.judulLangkah[l.jenis], l.id + ': judul langkah');
    jenis.add(l.jenis);
    const map = E.korespondensiBangun(l.p, l.q).map;
    if (l.jenis === 'notasi') {
      const o = E.opsiNotasi(l.p, l.q, map, l.simbol);
      assertOptions(o, l.id + '.opsi', 4);
      return;
    }
    assert.ok(l.i >= 0 && l.i < l.p.pts.length, l.id + ': indeks sah');
    const opsi = E.opsiBersesuaian(l.q, l.jenis);
    assertOptions(opsi, l.id + '.opsi', 3);
    assert.ok(ids(opsi).includes(E.kunciBersesuaian(map, l.jenis, l.i)), l.id + ': kunci di opsi');
    /* jawaban baku tidak sama dengan urutan huruf */
    if (E.kunciBersesuaian(map, l.jenis, l.i).slice(1) !== String(l.i)) jebakan += 1;
  });
  ['titik', 'sisi', 'sudut', 'notasi'].forEach((j) => assert.ok(jenis.has(j), 'ada langkah ' + j));
  assert.equal(
    jebakan,
    O.langkah.length - 1,
    'semua langkah (selain notasi) menjebak urutan huruf'
  );
  assert.ok(
    O.langkah.some((l) => {
      const pos = E.cariPosisiBerimpit(l.p.pts, l.q.pts, 90);
      return pos && pos.cermin;
    }),
    'ada pasangan yang dibalik'
  );
  O.pertanyaan.forEach((q) => assertGuided(q, 'olahBersesuaian.' + q.id));
  assert.ok(O.temuan.length >= 2);
});

test('olahJenis: tabel, pertanyaan penuntun, dan pemilahan dari geometri', () => {
  const O = D.olahJenis;
  assert.equal(O.tabel.length, 3);
  const jenisTabel = O.tabel.map((t) => {
    const k = E.korespondensiBangun(t.p, t.q);
    if (!k) assert.equal(t.map.length, t.p.pts.length, t.id + ': map ditulis');
    return E.klasifikasiBangun(t.p.pts, t.q.pts);
  });
  assert.deepEqual(JSON.parse(JSON.stringify(jenisTabel)), ['kongruen', 'sebangun', 'tidak']);
  assert.ok(E.ringkasKlasifikasi(O.tabel[2].p, O.tabel[2].q).luasSama, 'tabel 3: luas sama');
  assert.ok(O.pertanyaan.length >= 4);
  O.pertanyaan.forEach((q) => assertGuided(q, 'olahJenis.' + q.id));
  assert.ok(O.temuan.length >= 2);
  assert.ok(O.pilah.length >= 6);
  assert.equal(new Set(ids(O.pilah)).size, O.pilah.length);
  O.pilah.forEach((it) => {
    assertBangun(it.p, it.id + '.p');
    assertBangun(it.q, it.id + '.q');
    assert.equal(E.klasifikasiBangun(it.p.pts, it.q.pts), it.correct, it.id + ': kunci geometri');
    assert.ok(it.explanation && it.explanation.length > 20, it.id + ': explanation');
  });
  JENIS.forEach((j) =>
    assert.ok(
      O.pilah.some((it) => it.correct === j),
      'ada butir ' + j
    )
  );
  /* jebakan: sudut sama tetapi tidak sebangun */
  assert.ok(
    O.pilah.some(
      (it) => it.correct === 'tidak' && E.ringkasKlasifikasi(it.p, it.q).sudutSama === true
    )
  );
});

test('verifikasi: bank pasangan benda, pertanyaan bersesuaian, dan cara mengambil', () => {
  const V = D.verifikasi;
  assert.equal(new Set(ids(V.bank)).size, V.bank.length);
  const dgn = V.bank.filter((b) => b.tanyaSisi !== undefined);
  const tanpa = V.bank.filter((b) => b.tanyaSisi === undefined);
  assert.ok(dgn.length > V.ambil.bersesuaian, 'bank bersesuaian cukup untuk diacak');
  assert.ok(tanpa.length > V.ambil.klasifikasi, 'bank klasifikasi cukup untuk diacak');
  const jenis = new Set();
  V.bank.forEach((b) => {
    assert.ok(b.ikon && b.nama && b.cerita, b.id);
    assertBangun(b.p, b.id + '.p');
    assertBangun(b.q, b.id + '.q');
    jenis.add(E.klasifikasiBangun(b.p.pts, b.q.pts));
    if (b.tanyaSisi !== undefined) {
      assertTunggal(b.p, b.q, b.id);
      assert.ok(b.tanyaSisi >= 0 && b.tanyaSisi < b.p.pts.length);
      assert.ok(b.tanyaSudut >= 0 && b.tanyaSudut < b.p.pts.length);
    }
  });
  JENIS.forEach((j) => assert.ok(jenis.has(j), 'verifikasi memuat ' + j));
  assert.ok(V.kesimpulan.length > 20);
});

test('verifikasi: pernyataan benar/salah', () => {
  const V = D.verifikasi;
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 2);
  assert.ok(V.pernyataan.length >= 6);
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id);
    assert.ok(p.explanation.length > 20, p.id);
  });
  ['benar', 'salah'].forEach((k) =>
    assert.ok(
      V.pernyataan.some((p) => p.correct === k),
      'ada pernyataan ' + k
    )
  );
});

test('generalisasi: kalimat definisi, bank berpengecoh', () => {
  const G = D.generalisasi;
  assert.ok(G.kalimat.length >= 4);
  assert.ok(G.bank.length >= G.kalimat.length + 2, 'bank berpengecoh');
  assert.equal(new Set(ids(G.bank)).size, G.bank.length);
  assert.equal(new Set(G.bank.map((b) => b.teks)).size, G.bank.length);
  G.kalimat.forEach((k) => assert.ok(ids(G.bank).includes(k.correct), k.id));
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: bank soal sah, kunci dihitung ulang, komposisi dapat dipenuhi', () => {
  const T = D.terapkan;
  const soal = T.soal;
  assert.equal(new Set(ids(soal)).size, soal.length);
  let total = 0;
  Object.keys(T.komposisi).forEach((tipe) => {
    const n = T.komposisi[tipe];
    total += n;
    assert.ok(
      soal.filter((s) => s.tipe === tipe).length > n,
      tipe + ': bank lebih banyak daripada yang diambil'
    );
  });
  assert.equal(total, T.banyak);
  const jenis = new Set();
  soal.forEach((s) => {
    assert.ok(s.konteks && D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.cerita && s.tanya && s.pembahasan && s.hints.length >= 1, s.id);
    if (s.tipe === 'sisi' || s.tipe === 'sudut') {
      assertBangun(s.p, s.id + '.p');
      assertBangun(s.q, s.id + '.q');
      assertTunggal(s.p, s.q, s.id);
      assert.ok(s.i >= 0 && s.i < s.p.pts.length, s.id + ': indeks');
      const map = E.korespondensiBangun(s.p, s.q).map;
      const kunci = E.kunciBersesuaian(map, s.tipe, s.i);
      const label = E.opsiBersesuaian(s.q, s.tipe).filter((o) => o.id === kunci)[0].label;
      const sebut = s.tipe === 'sudut' ? 'sudut ' + label.replace('∠', '') : label;
      assert.ok(s.pembahasan.includes(sebut), s.id + ': pembahasan menyebut ' + sebut);
    } else if (s.tipe === 'jenis') {
      assertBangun(s.p, s.id + '.p');
      assertBangun(s.q, s.id + '.q');
      jenis.add(E.klasifikasiBangun(s.p.pts, s.q.pts));
    } else if (s.tipe === 'pilih') {
      assertGuided(s, s.id);
    } else {
      assert.equal(s.tipe, 'isi', s.id);
      const k = E.nilaiSoalSebangun(s.cek);
      assert.ok(Number.isFinite(k) && k > 0, s.id + ': kunci positif');
      assert.equal(E.diagnosaSoalSebangun(s.cek, k), 'benar', s.id);
      assert.ok(s.pembahasan.includes(E.formatDesimal(k, 2)), s.id + ': pembahasan memuat kunci');
      assert.ok(s.satuan, s.id + ': satuan');
    }
  });
  JENIS.forEach((j) => assert.ok(jenis.has(j), 'soal jenis memuat ' + j));
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi');
  assert.ok(D.selesai.capaian.length >= 4);
});
