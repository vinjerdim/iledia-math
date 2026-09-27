'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.6/data.js (Membaca, menuliskan &
 * membandingkan notasi ilmiah, Problem Based Learning): kunci jawaban
 * setiap tahap dihitung ulang dengan engine seksi 53 (bakukanIlmiah,
 * desimalKeIlmiah, isBakuIlmiah, bacaIlmiah, simbolBandingIlmiah,
 * urutanIdIlmiah, ekstremIlmiah, selisihOrdeIlmiah,
 * strategiBandingIlmiah, opsi*Ilmiah); setiap daftar pilihan punya id
 * unik dan cukup opsi untuk diacak; jumlah tahap sama dengan manifest
 * halaman; dan card modul terdaftar di index.html root.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.6/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks || o.urutan, name + '.' + o.id + ': label'));
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': kunci ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function benda(id) {
  const b = D.benda.find((x) => x.id === id);
  assert.ok(b, 'benda ' + id + ' ada');
  return b;
}

test('tahap: 10 tahap unik & cocok dengan manifest halaman', () => {
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-12.6'];
  assert.ok(m, 'manifest memuat fase-d/mpi-12.6');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Problem Based Learning/);
  assert.equal(m.h1, 'Membaca, Menuliskan & Membandingkan Notasi Ilmiah');
  assert.equal(m.extraBody, 'partials/reset-modal.html');
});

test('setiap tahap berkepala: kicker, goal, sintaks PBL, catatan guru', () => {
  D.tahap
    .map((t) => t.id)
    .filter((k) => k !== 'selesai')
    .forEach((k) => {
      const T = D[k];
      assert.ok(T, 'DATA.' + k);
      ['kicker', 'goal', 'guru', 'syntax'].forEach((f) => assert.ok(T[f], k + '.' + f));
      assert.match(T.syntax, /^Problem Based Learning · /, k);
    });
});

test('benda: id unik, mantisa string, satuan ada', () => {
  assert.equal(new Set(ids(D.benda)).size, D.benda.length);
  D.benda.forEach((b) => {
    assert.equal(typeof b.x.m, 'string', b.id);
    assert.ok(Number.isInteger(b.x.e), b.id);
    assert.ok(b.satuan && b.nama && b.ikon, b.id);
    if (b.bentuk === 'panjang')
      assert.ok(E.isBakuIlmiah(b.x), b.id + ': bentuk panjang dari x baku');
  });
});

test('orientasi: TP, catatan, dugaan & pertanyaan inti', () => {
  const T = D.orientasi;
  assert.equal(T.tp, D.meta.goal);
  T.catatan.forEach((c) => c.benda.forEach(benda));
  /* catatan memuat ketiga bentuk: panjang, baku, tidak baku */
  const semua = T.catatan.flatMap((c) => c.benda.map(benda));
  assert.ok(semua.some((b) => b.bentuk === 'panjang'));
  assert.ok(semua.some((b) => !b.bentuk && E.isBakuIlmiah(b.x)));
  assert.ok(semua.some((b) => !E.isBakuIlmiah(b.x)));

  T.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan ' + q.id);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': kunci ada');
    assert.ok(q.pembahasan);
  });
  const [massa, tulis, baku] = T.dugaan;
  assert.equal(E.simbolBandingIlmiah(massa.cek.p, massa.cek.q), 'lt');
  assert.equal(massa.baku, 'proton');
  const bTulis = E.teksIlmiah(E.desimalKeIlmiah(tulis.cek.desimal));
  assert.equal(tulis.opsi.find((o) => o.id === tulis.baku).label, bTulis);
  assert.equal(E.isBakuIlmiah(baku.cek.x), false);
  assert.match(
    baku.opsi.find((o) => o.id === baku.baku).label,
    new RegExp(E.teksIlmiah(E.bakukanIlmiah(baku.cek.x)))
  );

  assertOptions(T.masalahOpsi, 'masalah', 4);
  assert.ok(ids(T.masalahOpsi).includes(T.masalahCorrect));
  T.masalahOpsi.forEach((o) => assert.ok(T.masalahUmpan[o.id], 'umpan masalah ' + o.id));
});

test('organisasi: peran, pemilahan, rencana', () => {
  const T = D.organisasi;
  assertOptions(T.peran, 'peran', 4);
  assertOptions(T.opsiPilah, 'opsiPilah');
  assert.equal(new Set(ids(T.pilah)).size, T.pilah.length);
  T.pilah.forEach((p) => {
    assert.ok(ids(T.opsiPilah).includes(p.correct), p.id);
    assert.ok(p.explanation, p.id);
  });
  ids(T.opsiPilah).forEach((k) =>
    assert.ok(
      T.pilah.some((p) => p.correct === k),
      'kategori ' + k + ' terpakai'
    )
  );
  assertOptions(T.rencana, 'rencana', 4);
});

test('selidikBaca: lab geser koma, penuntun, dan kartu baca', () => {
  const T = D.selidikBaca;
  assert.ok(T.lab.length >= 3);
  assert.equal(new Set(ids(T.lab)).size, T.lab.length);
  const tanda = T.lab.map((it) => Math.sign(E.pangkatBakuIlmiah(it.x)));
  assert.ok(tanda.includes(1) && tanda.includes(-1), 'lab memuat pangkat positif & negatif');
  T.lab.forEach((it) => assert.ok(E.isBakuIlmiah(it.x), it.id + ': x baku'));
  T.amati.forEach((q) => assertGuided(q, 'amati ' + q.id));
  T.baca.forEach((b) => {
    const opsi = E.opsiBacaIlmiah(b.x);
    assertOptions(opsi, 'baca ' + b.id);
    assert.equal(opsi[0].id, 'baku');
    assert.equal(opsi[0].label, E.bacaIlmiah(b.x));
  });
  assert.ok(
    T.baca.some((b) => b.x.e < 0),
    'ada kartu baca berpangkat negatif'
  );
  assert.ok(T.temuan.length >= 3);
});

test('selidikTulis: pilah baku, tulis, bakukan, bentuk panjang', () => {
  const T = D.selidikTulis;
  assertOptions(T.opsiBaku, 'opsiBaku', 2);
  T.pilahBaku.forEach((k) => {
    assert.equal(k.correct, E.isBakuIlmiah(k.x) ? 'baku' : 'belum', k.id);
  });
  assert.ok(T.pilahBaku.some((k) => k.correct === 'baku'));
  assert.ok(T.pilahBaku.some((k) => k.correct === 'belum'));
  T.tulis.forEach((t) => assertOptions(E.opsiTulisIlmiah(t.desimal), 'tulis ' + t.id));
  T.bakukan.forEach((u) => {
    assert.equal(E.isBakuIlmiah(u.x), false, u.id + ' belum baku');
    assertOptions(E.opsiBakukanIlmiah(u.x), 'bakukan ' + u.id);
  });
  T.panjang.forEach((q) => {
    assert.ok(E.isBakuIlmiah(q.x), q.id);
    assertOptions(E.opsiPanjangIlmiah(q.x), 'panjang ' + q.id);
  });
});

test('selidikBanding: pasangan, pita orde, strategi', () => {
  const T = D.selidikBanding;
  assert.equal(new Set(ids(T.pasangan)).size, T.pasangan.length);
  const simbol = T.pasangan.map((p) => E.simbolBandingIlmiah(p.a, p.b));
  ['lt', 'gt', 'eq'].forEach((s) => assert.ok(simbol.includes(s), 'ada pasangan ' + s));
  const strat = T.pasangan.map((p) => E.strategiBandingIlmiah(p.a, p.b));
  ['bakukan', 'pangkatBeda', 'pangkatSama'].forEach((s) =>
    assert.ok(strat.includes(s), 'ada pasangan strategi ' + s)
  );
  T.pasangan.forEach((p) => {
    assert.match(p.kalimat, /___/, p.id);
    assertOptions(E.opsiMaknaBandingIlmiah(p.tema), 'makna ' + p.id);
  });
  /* miskonsepsi utama terwakili */
  const diag = T.pasangan.map((p) => {
    const benar = E.simbolBandingIlmiah(p.a, p.b);
    return ['lt', 'gt', 'eq']
      .filter((s) => s !== benar)
      .map((s) => E.diagnosaSimbolIlmiah(p.a, p.b, s));
  });
  const flat = diag.flat();
  ['mantisaSaja', 'pangkatNegatif', 'belumBaku'].forEach((k) =>
    assert.ok(flat.includes(k), 'diagnosa ' + k + ' muncul')
  );

  const pita = T.pita.map(benda);
  pita.forEach((b) => {
    assert.ok(T.pitaRungs.includes(E.pangkatBakuIlmiah(b.x)), b.id + ': anak tangga ada');
  });
  const naik = [...T.pitaRungs].sort((a, b) => a - b);
  assert.deepEqual([...T.pitaRungs], naik);

  T.strategi.forEach((q) => {
    assertGuided(q, 'strategi ' + q.id);
    assert.equal(E.strategiBandingIlmiah(q.cek.p, q.cek.q), q.cek.strategi, q.id);
  });
});

test('karya: urutan dari engine, berapa kali lipat, alasan', () => {
  const T = D.karya;
  const mikro = T.urutMikro.map(benda);
  const raksasa = T.urutRaksasa.map(benda);
  const jMikro = E.urutanIdIlmiah(mikro);
  const jRaksasa = E.urutanIdIlmiah(raksasa, 'turun');
  assert.notDeepEqual([...jMikro], T.urutMikro, 'kartu mikro belum terurut di data');
  assert.equal(jMikro[0], 'atom');
  assert.equal(jRaksasa[0], 'mars');
  /* tidak ada dua nilai sama dalam satu urutan */
  [mikro, raksasa].forEach((list) => {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        assert.notEqual(E.bandingIlmiah(list[i].x, list[j].x), 0, list[i].id + '/' + list[j].id);
      }
    }
  });
  assertGuided(T.tanyaKali, 'tanyaKali');
  assert.equal(E.selisihOrdeIlmiah(T.tanyaKali.cek.p, T.tanyaKali.cek.q), T.tanyaKali.cek.orde);
  assertGuided(T.tanyaAlasan, 'tanyaAlasan');
});

test('evaluasi: pendapat teman dihitung engine & simpulan', () => {
  const T = D.evaluasi;
  assertOptions(T.opsiPendapat, 'opsiPendapat', 2);
  T.pendapat.forEach((p) => {
    const c = p.cek;
    let benar;
    if (c.jenis === 'banding') benar = E.simbolBandingIlmiah(c.p, c.q) === c.klaim;
    else if (c.jenis === 'baku') benar = E.isBakuIlmiah(c.x) === c.klaim;
    else if (c.jenis === 'tulis') benar = E.bandingIlmiah(E.desimalKeIlmiah(c.desimal), c.x) === 0;
    else if (c.jenis === 'baca') benar = E.bacaIlmiah(c.x) === c.bacaan;
    assert.equal(p.correct, benar ? 'benar' : 'salah', p.id);
  });
  assert.equal(new Set(ids(T.bank)).size, T.bank.length);
  assert.ok(T.bank.length > T.kalimat.length, 'bank punya pengecoh');
  T.kalimat.forEach((g) => assert.ok(ids(T.bank).includes(g.correct), g.id));
  assert.equal(new Set(T.kalimat.map((g) => g.correct)).size, T.kalimat.length);
});

test('terapkan: bank ≥ 14, komposisi cukup, kunci dari engine', () => {
  const T = D.terapkan;
  assert.ok(T.soal.length >= 14);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  const total = Object.values(T.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, T.banyak);
  Object.keys(T.komposisi).forEach((k) => {
    const n = T.soal.filter((s) => s.jenis === k).length;
    assert.ok(n > T.komposisi[k], 'bank ' + k + ' lebih banyak dari yang diambil');
  });
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan, s.id);
    if (s.type === 'input') {
      assert.ok(Number.isInteger(E.pangkatBakuIlmiah(E.desimalKeIlmiah(s.desimal))), s.id);
      assert.ok(s.hints && s.hints.length >= 1, s.id);
      return;
    }
    if (s.jenis === 'baca') assertOptions(E.opsiBacaIlmiah(s.x), s.id);
    if (s.jenis === 'tulis') assertOptions(E.opsiTulisIlmiah(s.desimal), s.id);
    if (s.jenis === 'bakukan') {
      assert.equal(E.isBakuIlmiah(s.x), false, s.id);
      assertOptions(E.opsiBakukanIlmiah(s.x), s.id);
    }
    if (s.jenis === 'banding') {
      assertOptions(
        s.items.map((it) => ({ id: it.id, label: it.nama })),
        s.id
      );
      const k = E.ekstremIlmiah(s.items, s.cari);
      /* jawaban tidak sama dengan jebakan "mantisa terbesar/terkecil" */
      const mantisa = s.items
        .slice()
        .sort((a, b) => parseFloat(a.x.m.replace(',', '.')) - parseFloat(b.x.m.replace(',', '.')));
      const jebak = s.cari === 'terbesar' ? mantisa[mantisa.length - 1].id : mantisa[0].id;
      assert.notEqual(k, jebak, s.id + ': kunci berbeda dari jebakan mantisa');
    }
    if (s.jenis === 'urut') {
      assertOptions(s.opsi, s.id, 4);
      const jawab = [...E.urutanIdIlmiah(s.items, s.arah)];
      assert.deepEqual([...s.opsi.find((o) => o.id === s.correct).urutan], jawab, s.id);
      s.opsi.forEach((o) => assert.equal(o.urutan.length, s.items.length));
      assert.equal(new Set(s.opsi.map((o) => o.urutan.join())).size, s.opsi.length);
    }
  });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi', 4);
  D.selesai.contoh.forEach((c) => assert.ok(E.simbolBandingIlmiah(c.a, c.b)));
  assert.ok(D.selesai.capaian.length >= 4);
});

test('index.html root memuat card MPI 12.6 di Fase D, Kelas VIII, Topik 12', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/<a\s+href="fase-d\/mpi-12\.6\/index\.html"[\s\S]*?<\/a>/);
  assert.ok(m, 'card MPI 12.6 ada');
  assert.match(m[0], /data-kelas="VIII"/);
  assert.match(m[0], /data-topik="12"/);
  assert.match(m[0], /Materi 12\.6/);
  assert.match(m[0], /Notasi Ilmiah/);
  assert.match(m[0], /Problem Based Learning/);
});
