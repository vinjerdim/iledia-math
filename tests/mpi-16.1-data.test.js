'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-16.1/data.js (PLDV & SPLDV pada
 * situasi kontekstual, Discovery Learning): setiap tahap punya kepala
 * DL; setiap daftar pilihan cukup opsi untuk diacak dengan id & label
 * unik dan umpan balik tiap opsi; setiap persamaan sah; kunci jawaban
 * (pasangan yang memenuhi, penyelesaian SPLDV, jenis kalimat) dihitung
 * ulang dengan fungsi seksi 83 shared/engine.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-16.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
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

function assertPers(p, name) {
  ['a', 'b', 'c'].forEach((k) => assert.ok(Number.isFinite(p[k]), name + ': ' + k + ' bilangan'));
  assert.ok(p.a !== 0 && p.b !== 0, name + ': koefisien tidak nol');
  assert.equal(E.jenisKalimatDuaVar(E.teksPldv(p)), 'pldv', name + ': teksnya PLDV');
}

test('setiap tahap DL punya kicker, syntax, goal, dan catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'kumpul',
    'olah',
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

test('stimulasi: opsi dugaan & dugaanBenar konsisten', () => {
  assertOptions(D.stimulasi.opsi, 'stimulasi.opsi');
  assert.ok(ids(D.stimulasi.opsi).includes(D.verifikasi.dugaanBenar));
});

test('stimulasi: cerita Budi memang punya banyak jawaban PLDV dan satu jawaban SPLDV', () => {
  const pers = D.verifikasi.lab.sistem[0].pers;
  assert.ok(E.pasanganBulatPldv(pers[0], 10).length > 1, 'petunjuk 1 punya > 1 pasangan');
  const r = E.penyelesaianSpldv(pers);
  assert.equal(r.jenis, 'tunggal');
  assert.deepEqual([r.x, r.y], [D.olah.sorot.x, D.olah.sorot.y]);
});

test('masalah: pertanyaan inti berpengecoh', () => {
  assertGuided(D.masalah, 'masalah');
});

test('kumpul: kartu unsur sah dan kuncinya terbaca engine', () => {
  assert.ok(D.kumpul.unsur.length >= 3);
  assert.equal(new Set(ids(D.kumpul.unsur)).size, D.kumpul.unsur.length);
  D.kumpul.unsur.forEach((u) => {
    assertPers(u.pers, u.id);
    assert.ok(u.hints.length >= 2 && u.temuan, u.id + ': hints & temuan');
    const k = E.unsurPldv(u.pers);
    const hasil = E.periksaUnsurPldv(u.pers, {
      variabel: k.variabel.join(', '),
      koefX: E.fmtSuku(k.koefX),
      koefY: E.fmtSuku(k.koefY),
      konstanta: E.fmtSuku(k.konstanta),
    });
    assert.equal(hasil.tepat, true, u.id + ': kunci tampilan terbaca tepat');
  });
  /* jebakan yang dirancang: koefisien 1 dan koefisien negatif */
  assert.ok(D.kumpul.unsur.some((u) => u.pers.a === 1 && u.pers.b === 1));
  assert.ok(D.kumpul.unsur.some((u) => u.pers.b < 0));
});

test('kumpul: tabel pasangan memuat titik potong dan pasangan pecahan', () => {
  D.kumpul.tabel.forEach((t) => {
    assertPers(t.pers, t.id);
    assert.ok(t.labelX && t.labelY && t.temuan && t.hints.length >= 2, t.id);
    for (let i = 1; i < t.xs.length; i++) assert.ok(t.xs[i] > t.xs[i - 1], t.id + ': x menaik');
    assert.ok(t.xs.includes(D.olah.sorot.x), t.id + ': memuat x titik potong');
  });
  const ys = D.kumpul.tabel[0].xs.map((x) => E.yDariXPldv(D.kumpul.tabel[0].pers, x));
  assert.ok(
    ys.some((y) => !Number.isInteger(y)),
    'ada y pecahan untuk diskusi konteks'
  );
});

test('olah: pertanyaan penuntun & istilah', () => {
  assert.ok(D.olah.pertanyaan.length >= 3);
  D.olah.pertanyaan.forEach((q) => assertGuided(q, 'olah.' + q.id));
  assert.ok(D.olah.istilah.length >= 5);
  /* pasangan (3, 4) di opsi "tukar" memang tidak memenuhi petunjuk 1 */
  assert.equal(E.memenuhiPldv(D.kumpul.tabel[0].pers, 3, 4), false);
});

test('verifikasi: Lab SPLDV — setiap sistem punya penyelesaian tunggal cacah dalam batas', () => {
  const lab = D.verifikasi.lab;
  assert.equal(new Set(ids(lab.sistem)).size, lab.sistem.length);
  lab.sistem.forEach((S) => {
    S.pers.forEach((p, i) => assertPers(p, S.id + '.' + i));
    const r = E.penyelesaianSpldv(S.pers);
    assert.equal(r.jenis, 'tunggal', S.id);
    assert.ok(Number.isInteger(r.x) && Number.isInteger(r.y), S.id + ': cacah');
    assert.ok(r.x >= 0 && r.y >= 0 && r.x <= lab.maks && r.y <= lab.maks, S.id + ': dalam batas');
  });
  assert.equal(D.verifikasi.misi.length, 4);
});

test('verifikasi: misi lab dapat diselesaikan dengan stepper', () => {
  const lab = D.verifikasi.lab;
  const st = E.makeLabSpldvState();
  lab.sistem.forEach((S) => {
    E.ubahLabSpldv(st, lab, 'sistem', S.id);
    for (let x = 0; x <= lab.maks; x++) {
      for (let y = 0; y <= lab.maks; y++) {
        st.x = x;
        st.y = y;
        E.ubahLabSpldv(st, lab, 'x', 0);
      }
    }
  });
  assert.equal(E.labSpldvSelesai(st, lab), true);
});

test('verifikasi: pilah — kunci sesuai jenisSistemDuaVar dan semua jenis terwakili', () => {
  const V = D.verifikasi;
  assertOptions(V.opsiPilah, 'opsiPilah', 3);
  assert.ok(V.pilah.length >= 7);
  assert.equal(new Set(ids(V.pilah)).size, V.pilah.length);
  V.pilah.forEach((it) => {
    assert.equal(E.jenisSistemDuaVar(it.kalimat), it.correct, it.id);
    assert.ok(it.explanation && it.explanation.length > 20, it.id + ': explanation');
  });
  V.opsiPilah.forEach((o) =>
    assert.ok(
      V.pilah.some((it) => it.correct === o.id),
      'ada butir ' + o.id
    )
  );
});

test('generalisasi: kalimat, bank, dan pengecoh', () => {
  const G = D.generalisasi;
  assertOptions(G.bank, 'bank', G.kalimat.length + 2);
  G.kalimat.forEach((k) => assert.ok(ids(G.bank).includes(k.correct), k.id));
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: setiap soal sah dan kuncinya dihitung ulang', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 8);
  assert.equal(new Set(ids(soal)).size, soal.length);
  const tipe = new Set();
  soal.forEach((s) => {
    tipe.add(s.tipe);
    assert.ok(s.cerita && s.tanya && s.pembahasan && s.hints.length >= 1, s.id);
    if (s.tipe === 'pilih') {
      assertGuided(s, s.id);
      s.opsi
        .filter((o) => o.kalimat)
        .forEach((o) =>
          assert.equal(E.jenisSistemDuaVar(o.kalimat) === 'spldv', o.id === s.correct, o.id)
        );
    } else if (s.tipe === 'pasangan') {
      assertOptions(
        s.opsi.map((o) => ({ id: o.id, label: o.x + ',' + o.y })),
        s.id
      );
      const benar = s.opsi.filter((o) =>
        s.sistem ? E.memenuhiSpldv(s.sistem, o.x, o.y).keduanya : E.memenuhiPldv(s.pers, o.x, o.y)
      );
      assert.equal(benar.length, 1, s.id + ': tepat satu pasangan benar');
      /* setiap pengecoh mewakili miskonsepsi yang terdiagnosa */
      const kode = s.opsi.map((o) =>
        s.sistem
          ? E.diagnosaPasanganSpldv(s.sistem, o.x, o.y)
          : E.diagnosaPasanganPldv(s.pers, o.x, o.y)
      );
      assert.ok(kode.includes('tertukar'), s.id + ': ada pengecoh tertukar');
    } else {
      assert.equal(s.tipe, 'isi', s.id);
      const k = E.nilaiSoalPldv(s.cek);
      assert.ok(Number.isInteger(k), s.id + ': kunci bulat');
      assert.equal(E.diagnosaSoalPldv(s.cek, k), 'benar', s.id);
    }
  });
  ['isi', 'pilih', 'pasangan'].forEach((t) => assert.ok(tipe.has(t), 'ada soal ' + t));
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'diriOpsi');
  assert.ok(D.selesai.capaian.length >= 4);
});
