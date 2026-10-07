'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-2.3/data.js (Penjumlahan &
 * pengurangan pecahan dalam masalah kontekstual, PBL): kunci jawaban
 * setiap dugaan/langkah/soal harus cocok dengan engine seksi 62
 * (operasiPecahan, teksRasional, fmtOperasiPecahan,
 * diagnosaOperasiPecahan, opsiOperasiPecahan, pilihanPenyebutPita),
 * setiap daftar pilihan punya id unik dan cukup opsi untuk diacak,
 * serta jumlah tahap sama dengan manifest halaman.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-2.3/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function hasil(s) {
  return E.teksRasional(E.operasiPecahan(s.a, s.op, s.b));
}

function nilai(str) {
  return E.rasionalDari(str);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  const labels = list.map((o) => o.label || o.teks);
  labels.forEach((l, i) => assert.ok(l, name + '.' + list[i].id + ': label'));
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus berbeda');
}

function assertGuided(list, name, min) {
  assert.ok(list.length >= (min || 1), name + ': ada pertanyaan');
  list.forEach((q) => {
    assert.ok(q.tanya, name + '.' + q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), name + '.' + q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + '.' + q.id + ': umpan untuk ' + o.id));
  });
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Langkah isian operasi { id, a, op, b, label, hints }. */
function assertLangkah(list, name, min) {
  assert.ok(list.length >= (min || 2), name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    assert.ok(['+', '-'].includes(s.op), s.id + ': op');
    E.operasiPecahan(s.a, s.op, s.b);
    assert.ok(s.label || s.cerita, s.id + ': label/cerita');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, s.id + ': hints');
    assert.equal(
      E.diagnosaOperasiPecahan(hasil(s), s.a, s.op, s.b).kode,
      'benar',
      s.id + ': kunci dikenali benar'
    );
    if (s.temuan) {
      assert.ok(
        s.temuan.replace(/−/g, '-').includes(hasil(s).replace(/−/g, '-')),
        s.id + ': temuan memuat hasil ' + hasil(s)
      );
    }
  });
}

function bentukSuku(x) {
  return /\d\s+\d/.test(x) ? 'campuran' : x.includes('/') ? 'biasa' : 'bulat';
}

test('sepuluh tahap: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-2.3'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  ['orientasi', 'organisasi', 'selidikSama', 'selidikBeda', 'selidikCampuran', 'karya', 'evaluasi']
    .map((id) => D[id].syntax)
    .forEach((s) => assert.match(s, /Problem Based Learning/));
});

test('orientasi: catatan memuat data masalah; dugaan baku cocok engine', () => {
  const O = D.orientasi;
  assert.equal(O.catatan.length, 3);
  O.catatan.forEach((c) => {
    assert.ok(c.ikon && c.judul && c.teks, c.id);
    assert.ok(c.data.length >= 3, c.id + ': data');
  });
  const tepung = O.catatan.find((c) => c.id === 'tepung').data.map((d) => d.nilai);
  assert.deepEqual([...tepung], [D.tepung.persediaan, D.tepung.bolu, D.tepung.donat]);

  const dT = O.dugaan.find((q) => q.id === 'dTepung');
  const butuh = E.teksRasional(E.operasiPecahan(D.tepung.bolu, '+', D.tepung.donat));
  const sisa = E.operasiPecahan(D.tepung.persediaan, '-', butuh);
  assert.equal(dT.baku, sisa.num > 0 ? 'cukup' : sisa.num === 0 ? 'pas' : 'kurang');
  assert.ok(dT.pembahasan.includes(butuh) && dT.pembahasan.includes(E.teksRasional(sisa)));

  const dM = O.dugaan.find((q) => q.id === 'dMeja');
  assert.equal(dM.opsi.find((o) => o.id === dM.baku).label, hasil(dM));
  assert.equal(
    E.diagnosaOperasiPecahan(dM.opsi.find((o) => o.id === 'naif').label, dM.a, dM.op, dM.b).kode,
    'penyebut-dijumlah'
  );
  O.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
  });

  assertOptions(O.masalahOpsi, 'masalah', 4);
  assert.ok(ids(O.masalahOpsi).includes(O.masalahCorrect));
  O.masalahOpsi.forEach((o) => assert.ok(O.masalahUmpan[o.id], 'umpan ' + o.id));
  assert.ok(O.hipotesisLabel && O.alasanLabel);
});

test('organisasi: peran, pilah menurut operasi, rencana', () => {
  const G = D.organisasi;
  assertOptions(G.peran, 'peran', 4);
  assertOptions(G.opsiPilah, 'opsiPilah', 3);
  assert.ok(G.pilah.length >= 5);
  assert.equal(new Set(ids(G.pilah)).size, G.pilah.length);
  G.pilah.forEach((p) => {
    assert.ok(p.teks && p.explanation, p.id);
    if (p.op) {
      E.operasiPecahan(p.a, p.op, p.b);
      assert.equal(p.correct, p.op === '+' ? 'jumlah' : 'kurang', p.id + ': kategori dari op');
    } else {
      assert.equal(p.correct, 'tidak', p.id + ': informasi tidak diperlukan');
    }
  });
  assert.equal(new Set(G.pilah.map((p) => p.correct)).size, 3, 'ketiga kategori muncul');
  assert.ok(G.rencana.length >= 4);
  assertOptions(G.rencana, 'rencana', 4);
});

test('selidikSama: penyebut sama, kunci cocok engine, miskonsepsi penyebut terdiagnosa', () => {
  const S = D.selidikSama;
  assertLangkah(S.hitung, 'selidikSama.hitung', 3);
  S.hitung.forEach((s) => {
    assert.equal(nilai(s.a).den, nilai(s.b).den, s.id + ': penyebut sama');
    const naif = nilai(s.a).num + (s.op === '+' ? 1 : -1) * nilai(s.b).num;
    if (s.op === '+') {
      assert.equal(
        E.diagnosaOperasiPecahan(naif + '/' + 2 * nilai(s.a).den, s.a, s.op, s.b).kode,
        'penyebut-dijumlah'
      );
    }
  });
  assert.ok(
    S.hitung.some((s) => s.op === '-'),
    'ada pengurangan'
  );
  assert.ok(
    S.hitung.some(
      (s) => E.operasiPecahan(s.a, s.op, s.b).num > E.operasiPecahan(s.a, s.op, s.b).den
    ),
    'ada hasil lebih dari 1'
  );
  assertGuided(S.amati, 'selidikSama.amati', 2);
  assert.ok(S.temuan.length >= 2);
});

test('selidikBeda: penyebut berbeda, Lab Pita memuat KPK & potongan tidak pas', () => {
  const S = D.selidikBeda;
  assertLangkah(S.percobaan, 'selidikBeda.percobaan', 3);
  S.percobaan.forEach((p) => {
    assert.notEqual(nilai(p.a).den, nilai(p.b).den, p.id + ': penyebut berbeda');
    assert.equal(bentukSuku(p.a), 'biasa', p.id + ': suku a pecahan biasa');
    assert.equal(bentukSuku(p.b), 'biasa', p.id + ': suku b pecahan biasa');
    assert.ok(E.operasiPecahan(p.a, p.op, p.b).num > 0, p.id + ': hasil positif (pita)');
    const pilihan = E.pilihanPenyebutPita(p.a, p.b);
    assert.ok(pilihan.includes(E.langkahSamakanPenyebut(p.a, p.b).kpk), p.id + ': KPK');
    assert.ok(
      pilihan.some((n) => E.cekPenyebutPita(p.a, p.b, n) === 'tidak-pas'),
      p.id + ': ada potongan tidak pas'
    );
    assert.ok(p.cerita, p.id + ': cerita');
  });
  assert.ok(S.percobaan.some((p) => p.op === '-'));
  assertGuided(S.amati, 'selidikBeda.amati', 2);
  assert.ok(S.temuan.length >= 2);
});

test('selidikCampuran: campuran (termasuk meminjam) & negatif di garis bilangan', () => {
  const S = D.selidikCampuran;
  assertLangkah(S.campuran, 'campuran', 3);
  S.campuran.forEach((s) =>
    assert.ok(
      bentukSuku(s.a) === 'campuran' || bentukSuku(s.b) === 'campuran',
      s.id + ': memuat pecahan campuran'
    )
  );
  assert.ok(
    S.campuran.some((s) => E.opsiOperasiPecahan(s.a, s.op, s.b).some((o) => o.id === 'meminjam')),
    'ada soal yang perlu meminjam'
  );
  assertGuided(S.cara, 'cara', 2);

  assertLangkah(S.negatif, 'negatif', 2);
  const g = S.garis;
  S.negatif.forEach((s) => {
    [s.a, s.b, hasil(s)].forEach((x) => {
      const v = nilai(x);
      assert.ok(v.num / v.den >= g.min && v.num / v.den <= g.max, s.id + ': ' + x + ' di garis');
      assert.equal(g.ticks % nilai(x).den, 0, s.id + ': ' + x + ' tepat di garis');
    });
  });
  assert.ok(
    S.negatif.some((s) => nilai(s.a).num < 0),
    'ada suku negatif'
  );
  assert.ok(
    S.negatif.some((s) => E.operasiPecahan(s.a, s.op, s.b).num < 0),
    'ada hasil negatif'
  );
  /* Langkah berantai: hasil sn1 menjadi suku pertama sn2. */
  assert.equal(S.negatif[1].a, hasil(S.negatif[0]));
  assertGuided(S.tanyaNeg, 'tanyaNeg');
  assert.ok(S.temuan.length >= 2);
});

test('karya: enam langkah berantai cocok dengan data masalah', () => {
  const K = D.karya;
  assertLangkah(K.langkah, 'karya.langkah', 6);
  const byId = {};
  K.langkah.forEach((s) => {
    byId[s.id] = s;
    assert.ok(['tepung', 'pita', 'meja'].includes(s.bagian), s.id + ': bagian');
    assert.ok(s.satuan, s.id + ': satuan');
    if (s.dari) assert.equal(s.b, hasil(byId[s.dari]), s.id + ': suku kedua = hasil ' + s.dari);
  });
  assert.equal(byId.k1.a + '|' + byId.k1.b, D.tepung.bolu + '|' + D.tepung.donat);
  assert.equal(byId.k2.a, D.tepung.persediaan);
  assert.equal(byId.k3.a + '|' + byId.k3.b, D.pita.meja + '|' + D.pita.spanduk);
  assert.equal(byId.k4.a, D.pita.gulung);
  assert.equal(byId.k5.a + '|' + byId.k5.b, D.meja.kue + '|' + D.meja.minuman);
  assert.equal(byId.k6.a, D.meja.utuh);

  assertGuided(K.keputusan, 'karya.keputusan', 2);
  const kp = K.keputusan.find((q) => q.id === 'kpTepung');
  assert.ok(
    kp.opsi.find((o) => o.id === kp.correct).label.includes('{' + hasil(byId.k2) + '}'),
    'keputusan tepung memuat sisa'
  );
  const kc = K.keputusan.find((q) => q.id === 'kpCek');
  assert.ok(kc.tanya.includes('{' + hasil(byId.k4) + '}'), 'cek kewajaran memuat sisa pita');
  /* Organisasi memakai angka yang sama. */
  const pilah = {};
  D.organisasi.pilah.forEach((p) => (pilah[p.id] = p));
  assert.equal(pilah.pTepungSisa.b, hasil(byId.k1));
  assert.equal(pilah.pPitaSisa.b, hasil(byId.k3));
  assert.equal(pilah.pMejaKerajinan.b, hasil(byId.k5));
});

test('evaluasi: kategori detektif = diagnosa engine, estimasi, simpulan', () => {
  const V = D.evaluasi;
  assertOptions(V.opsiCek, 'opsiCek', 4);
  assert.ok(V.cek.length >= 5);
  assert.equal(new Set(ids(V.cek)).size, V.cek.length);
  const kat = new Set();
  V.cek.forEach((c) => {
    assert.ok(ids(V.opsiCek).includes(c.correct), c.id + ': kategori valid');
    assert.equal(
      E.diagnosaOperasiPecahan(c.jawab, c.a, c.op, c.b).kode,
      V.kodeCek[c.correct],
      c.id + ': kategori = diagnosa engine'
    );
    assert.ok(c.kelompok && c.explanation, c.id);
    assert.ok(
      c.explanation.replace(/−/g, '-').includes(hasil(c)),
      c.id + ': pembahasan memuat hasil benar ' + hasil(c)
    );
    kat.add(c.correct);
  });
  assert.equal(kat.size, V.opsiCek.length, 'semua kategori muncul');

  assertGuided(V.estimasi, 'estimasi', 2);

  const bank = ids(V.bank);
  assert.equal(new Set(bank).size, bank.length);
  const dipakai = V.kalimat.map((k) => k.correct);
  assert.equal(new Set(dipakai).size, dipakai.length, 'potongan benar tidak ganda');
  dipakai.forEach((c) => assert.ok(bank.includes(c), c));
  assert.ok(bank.length - dipakai.length >= 2, 'minimal dua pengecoh');
  assert.ok(V.rangkuman.length >= 3);
});

test('terapkan: bank soal cukup untuk komposisi acak & kunci cocok engine', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length, 'id soal unik');
  let total = 0;
  Object.keys(T.komposisi).forEach((k) => {
    const ada = T.soal.filter((s) => s.type === k).length;
    assert.ok(ada > T.komposisi[k], k + ': bank lebih banyak dari yang diambil agar teracak');
    total += T.komposisi[k];
  });
  assert.equal(total, T.banyak);
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    assert.ok(['+', '-'].includes(s.op), s.id + ': op');
    E.operasiPecahan(s.a, s.op, s.b);
    if (s.type === 'choice') {
      if (s.options) {
        assertOptions(s.options, s.id, 4);
        assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada');
        assert.equal(
          s.options.find((o) => o.id === s.correct).label,
          E.fmtOperasiPecahan(s.a, s.op, s.b),
          s.id + ': kalimat benar = engine'
        );
      } else {
        const opsi = E.opsiOperasiPecahan(s.a, s.op, s.b);
        assert.ok(opsi.length >= 4, s.id + ': opsi engine cukup');
        assert.ok(
          s.explanation.replace(/−/g, '-').includes(hasil(s).replace(/−/g, '-')),
          s.id + ': pembahasan memuat hasil ' + hasil(s)
        );
      }
    } else {
      assert.equal(s.type, 'input', s.id + ': type');
      assert.ok(s.satuan, s.id + ': satuan');
      assert.ok(s.hints.length >= 1, s.id + ': hints');
    }
  });
  assert.ok(
    T.soal.some((s) => E.operasiPecahan(s.a, s.op, s.b).num < 0),
    'ada soal berhasil negatif'
  );
  assert.ok(
    T.soal.some((s) => bentukSuku(s.a) === 'campuran' || bentukSuku(s.b) === 'campuran'),
    'ada soal pecahan campuran'
  );
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  assert.ok(D.selesai.capaian.length >= 3);
  D.selesai.contoh.forEach((c) => {
    E.operasiPecahan(c.a, c.op, c.b);
    assert.ok(c.ikon && c.nama && c.satuan, 'contoh ' + c.nama);
  });
});
