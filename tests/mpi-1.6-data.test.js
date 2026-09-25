'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-1.6/data.js (Membandingkan bilangan
 * bulat, pecahan & desimal secara terpadu — Problem Based Learning):
 * kunci jawaban setiap dugaan/pasangan/keputusan/soal harus cocok dengan
 * engine seksi 38 (bandingTerpadu, simbolBandingTerpadu, urutkanTerpadu,
 * keDesimalTerpadu, opsiBentukSetara, …), setiap daftar pilihan punya id
 * & label unik dan cukup opsi untuk diacak, serta jumlah tahap sama
 * dengan manifest.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-1.6/data.js']);
const D = E.DATA;

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  const labels = Array.from(list, (o) => o.label || o.teks);
  labels.forEach((l, i) => assert.ok(l, name + '.' + list[i].id + ': label'));
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus unik');
}

function assertGuided(q, name) {
  assert.ok(q.tanya, name + ': tanya');
  assertOptions(q.opsi, name, 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertBilangan(s, name) {
  assert.ok(E.jenisBilangan(s), name + ': bilangan valid bagi engine (' + s + ')');
}

function nilaiDari(list, id) {
  return list.find((x) => x.id === id).nilai;
}

test('sepuluh tahap: setiap tahap punya konten & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-1.6'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap
    .filter((t) => t.id !== 'selesai')
    .forEach((t) =>
      ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(D[t.id][k], t.id + ': ' + k))
    );
});

test('data masalah memuat ketiga bentuk bilangan, positif & negatif', () => {
  const semua = D.suhu
    .concat(D.sirup.botol, D.kas)
    .map((x) => x.nilai)
    .concat([D.sirup.butuh]);
  semua.forEach((s) => assertBilangan(s, s));
  const jenis = new Set(semua.map(E.jenisBilangan));
  assert.deepEqual([...jenis].sort(), ['bulat', 'desimal', 'pecahan']);
  assert.ok(semua.some((s) => E.nilaiTerpadu(s).num < 0));
  assert.ok(semua.some((s) => E.nilaiTerpadu(s).num > 0));
  [D.suhu, D.sirup.botol, D.kas].forEach((list) => {
    const v = list.map((x) => x.nilai);
    assert.equal(new Set(ids(list)).size, list.length);
    assert.equal(
      new Set(E.urutkanTerpadu(v).map((s) => E.keDesimalTerpadu(s))).size,
      v.length,
      'tidak ada nilai kembar'
    );
  });
  /* tepat satu botol sama dengan kebutuhan resep */
  assert.equal(
    D.sirup.botol.filter((b) => E.bandingTerpadu(b.nilai, D.sirup.butuh) === 0).length,
    1
  );
});

test('orientasi: kunci dugaan & pertanyaan inti cocok dengan engine', () => {
  const S = D.orientasi;
  assert.ok(S.catatan.length === 3);
  S.catatan.forEach((c) => assert.ok(c.ikon && c.judul && c.teks && c.sumber, c.id));
  assert.ok(S.dugaan.length >= 3);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
  });
  const [d1, d2, d3, d4] = S.dugaan;
  /* d1 & d4: 'a' bila a < b ... sesuai pertanyaan */
  assert.equal(E.simbolBandingTerpadu(d1.a, d1.b), 'lt'); /* cool box lebih dingin */
  assert.equal(d1.baku, 'a');
  assert.equal(E.simbolBandingTerpadu(d4.a, d4.b), 'gt'); /* −1 1/4 lebih besar */
  assert.equal(d4.baku, 'a');
  assert.equal(E.bandingTerpadu(nilaiDari(D.sirup.botol, d2.baku), D.sirup.butuh), 0);
  assert.equal(
    E.urutkanTerpadu(D.kas.map((k) => k.nilai))[0],
    nilaiDari(D.kas, d3.baku),
    'd3: kas terkecil'
  );
  assertOptions(S.masalahOpsi, 'masalahOpsi', 4);
  assert.ok(ids(S.masalahOpsi).includes(S.masalahCorrect));
  S.masalahOpsi.forEach((o) => assert.ok(S.masalahUmpan[o.id], 'umpan ' + o.id));
});

test('organisasi: peran, pemilahan tiga kategori, rencana', () => {
  const O = D.organisasi;
  assertOptions(O.peran, 'peran', 4);
  assertOptions(O.opsiPilah, 'opsiPilah', 3);
  assert.ok(O.pilah.length >= 6);
  assert.equal(new Set(ids(O.pilah)).size, O.pilah.length);
  const kat = new Set();
  O.pilah.forEach((p) => {
    assert.ok(ids(O.opsiPilah).includes(p.correct), p.id);
    assert.ok(p.teks && p.explanation, p.id);
    kat.add(p.correct);
  });
  assert.equal(kat.size, 3, 'setiap kategori terpakai');
  assertOptions(O.rencana, 'rencana', 4);
});

test('selidikUbah: kartu ubah bentuk punya opsi setara dari engine', () => {
  const U = D.selidikUbah;
  U.keDesimal.forEach((s) => {
    assert.equal(E.jenisBilangan(s), 'pecahan', s);
    assert.ok(E.keDesimalTerpadu(s), s + ': desimal berhenti');
    const o = E.opsiBentukSetara(s);
    assertOptions(o, s, 4);
    assert.equal(o.filter((x) => x.benar).length, 1);
  });
  U.kePecahan.forEach((s) => {
    assert.equal(E.jenisBilangan(s), 'desimal', s);
    assertOptions(E.opsiBentukSetara(s), s, 4);
  });
  U.keBulat.forEach((s) => {
    assert.equal(E.jenisBilangan(s), 'bulat', s);
    assertOptions(E.opsiBentukSetara(s), s, 4);
  });
  const semua = U.keDesimal.concat(U.kePecahan, U.keBulat);
  assert.equal(new Set(semua).size, semua.length, 'kartu unik');
  assert.ok(
    semua.some((s) => E.nilaiTerpadu(s).num < 0),
    'ada kartu negatif'
  );
  U.amati.forEach((q) => assertGuided(q, 'amati.' + q.id));
  assert.ok(U.temuan.length >= 3);
});

test('selidikGaris: setiap titik pas pada garis & tidak bertumpuk', () => {
  const G = D.selidikGaris;
  const g = G.garis;
  const k = g.nilai.map((n) => E.skalaTerpadu(n.nilai, g.langkah));
  k.forEach((x, i) => {
    assert.notEqual(x, null, g.nilai[i].nilai + ': pas pada langkah');
    assert.ok(x >= g.min * g.langkah && x <= g.max * g.langkah);
  });
  assert.equal(new Set(k).size, k.length);
  const jenis = new Set(g.nilai.map((n) => E.jenisBilangan(n.nilai)));
  assert.equal(jenis.size, 3, 'bulat, pecahan, desimal');
  G.tanya.forEach((q) => assertGuided(q, 'garis.' + q.id));
  const terkecil = E.urutkanTerpadu(g.nilai.map((n) => n.nilai))[0];
  assert.equal(E.tulisTerpadu(terkecil), '−2');
  assert.equal(G.tanya[0].correct, 'min2');
  assert.equal(E.simbolBandingTerpadu('-1,5', '-3/4'), 'lt');
});

test('selidikBanding: lambang, makna, dan miskonsepsi muncul', () => {
  const B = D.selidikBanding;
  assert.ok(B.pasangan.length >= 5);
  assert.equal(new Set(ids(B.pasangan)).size, B.pasangan.length);
  const simbol = new Set();
  const lintas = [];
  B.pasangan.forEach((p) => {
    assertBilangan(p.a, p.id + '.a');
    assertBilangan(p.b, p.id + '.b');
    assert.ok(p.namaA && p.namaB && p.ikon && p.tema, p.id);
    assert.ok(p.kalimat.includes('___'), p.id + ': kalimat memuat ___');
    simbol.add(E.simbolBandingTerpadu(p.a, p.b));
    assert.ok(E.maknaBandingTerpadu(p.a, p.b, p.tema), p.id + ': makna');
    assertOptions(E.opsiMaknaBandingTerpadu(p.tema), p.id + ': makna', 3);
    if (E.jenisBilangan(p.a) !== E.jenisBilangan(p.b)) lintas.push(p.id);
  });
  assert.deepEqual([...simbol].sort(), ['eq', 'gt', 'lt'], 'ketiga lambang muncul');
  assert.ok(lintas.length >= 4, 'sebagian besar pasangan lintas bentuk');
  const diag = new Set();
  B.pasangan.forEach((p) =>
    ['lt', 'gt', 'eq'].forEach((s) => diag.add(E.diagnosaBandingTerpadu(p.a, p.b, s)))
  );
  ['abaikan-negatif', 'angka-lepas', 'beda-bentuk'].forEach((k) =>
    assert.ok(diag.has(k), 'pasangan memancing miskonsepsi ' + k)
  );
  B.strategi.forEach((q) => assertGuided(q, 'strategi.' + q.id));
  assert.equal(E.keDesimalTerpadu('2/3'), null, 's2: 2/3 desimal berulang');
  assert.equal(E.simbolBandingTerpadu('2/3', '0,6'), 'gt');
  assert.ok(B.temuan.length >= 3);
});

test('karya: keputusan cocok dengan engine', () => {
  const K = D.karya;
  assertGuided(K.tanyaBotol, 'tanyaBotol');
  assertGuided(K.tanyaAlasan, 'tanyaAlasan');
  const pas = D.sirup.botol.find((b) => E.bandingTerpadu(b.nilai, D.sirup.butuh) === 0);
  assert.equal(K.tanyaBotol.correct, pas.id);
  const urutSuhu = E.urutanIdTerpadu(D.suhu);
  assert.equal(urutSuhu[0], 'freezer');
  assert.deepEqual(Array.from(urutSuhu), ['freezer', 'termos', 'coolbox', 'kulkas']);
  assert.deepEqual(Array.from(E.urutanIdTerpadu(D.kas)), [
    'jeruk',
    'melon',
    'mangga',
    'nanas',
    'semangka',
  ]);
  assert.ok(K.posterJudul && K.pesanLabel);
});

test('evaluasi: pendapat teman dinilai sesuai engine; simpulan unik', () => {
  const V = D.evaluasi;
  assertOptions(V.opsiPendapat, 'opsiPendapat', 2);
  assert.ok(V.pendapat.length >= 6);
  assert.equal(new Set(ids(V.pendapat)).size, V.pendapat.length);
  const kunci = new Set();
  V.pendapat.forEach((p) => {
    const benar = E.simbolBandingTerpadu(p.a, p.b) === p.klaim;
    assert.equal(p.correct, benar ? 'tepat' : 'keliru', p.id);
    assert.ok(p.teks && p.explanation, p.id);
    kunci.add(p.correct);
  });
  assert.equal(kunci.size, 2);
  const bank = ids(V.bank);
  assert.equal(new Set(bank).size, bank.length);
  const dipakai = V.kalimat.map((k) => k.correct);
  assert.equal(new Set(dipakai).size, dipakai.length);
  dipakai.forEach((c) => assert.ok(bank.includes(c), c));
  assert.ok(bank.length - dipakai.length >= 2, 'minimal dua pengecoh');
  assert.ok(V.rangkuman.length >= 3);
});

test('terapkan: bank soal cukup untuk komposisi acak & kunci cocok engine', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  const jenis = (s) => (s.type === 'choice' ? 'choice' : s.mode);
  let total = 0;
  Object.keys(T.komposisi).forEach((k) => {
    const ada = T.soal.filter((s) => jenis(s) === k).length;
    assert.ok(ada > T.komposisi[k], k + ': bank lebih banyak dari yang diambil');
    total += T.komposisi[k];
  });
  assert.equal(total, T.banyak);
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    if (s.type === 'choice') {
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada');
      s.nilai.forEach((n) => assertBilangan(n, s.id));
      return;
    }
    assert.equal(E.periksaIsianTerpadu(s.jawab, s.jawab, s.bentuk).benar, true, s.id);
    assert.ok(s.reveal && s.hints.length >= 1, s.id + ': reveal & hints');
  });
  const soal = (id) => T.soal.find((s) => s.id === id);
  const labelBenar = (id) => soal(id).options.find((o) => o.id === soal(id).correct).label;
  /* t1 paling dingin, t2 paling dalam = terkecil; t3 terpanjang = terbesar */
  assert.equal(E.urutkanTerpadu(soal('t1').nilai)[0], '-2');
  assert.equal(E.urutkanTerpadu(soal('t2').nilai)[0], '-12,5');
  assert.equal(E.urutkanTerpadu(soal('t3').nilai, 'turun')[0], '1,8');
  assert.equal(E.simbolBandingTerpadu('2/5', '0,4'), soal('t4').correct);
  assert.equal(E.simbolBandingTerpadu('-2/3', '-0,75'), 'gt');
  const tampil = (arr) => arr.map((s) => E.tulisTerpadu(s)).join('; ');
  assert.equal(
    labelBenar('t6').replace('¾', '3/4').replace('¼', '1/4'),
    tampil(E.urutkanTerpadu(soal('t6').nilai))
  );
  assert.equal(
    labelBenar('t7').replace('1⅓', '1 1/3').replace('1¼', '1 1/4'),
    tampil(E.urutkanTerpadu(soal('t7').nilai, 'turun'))
  );
  assert.equal(E.bandingTerpadu('-0,3', '-1') > 0 && E.bandingTerpadu('-0,3', '0') < 0, true);
  ['-1,3', '3/10', '-4/3'].forEach((x) =>
    assert.ok(E.bandingTerpadu(x, '-1') <= 0 || E.bandingTerpadu(x, '0') >= 0, x)
  );
  assert.equal(E.bandingTerpadu('0,6', '3/5'), 0);
  assert.equal(E.bandingTerpadu('5/8', '0,6'), 1);
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.ok(S.judul && S.teks && S.capaian.length >= 3);
  S.contoh.forEach((c) => {
    assertBilangan(c.a, c.nama);
    assertBilangan(c.b, c.nama);
  });
});
