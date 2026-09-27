'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-12.5/data.js (Membandingkan &
 * mengurutkan bentuk akar, Cooperative Learning tipe Jigsaw): kunci
 * jawaban setiap tahap dihitung ulang dengan engine seksi 52
 * (simbolBandingAkar, urutkanAkar, ekstremAkar, strategiBerlakuAkar,
 * strategiBandingAkar, masukkanKoefisien, idMaknaBandingAkar,
 * opsiMaknaBandingAkar); setiap stasiun ahli memuat soal yang memang
 * cocok dengan strateginya; setiap daftar pilihan punya id unik dan
 * cukup opsi untuk diacak; jumlah tahap sama dengan manifest halaman;
 * dan card modul terdaftar di index.html root.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-12.5/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks || o.nilai, name + '.' + o.id + ': label'));
}

function assertUniqueIds(list, name) {
  assert.equal(new Set(ids(list)).size, list.length, name + ': id harus unik');
}

function sama(p, q) {
  return E.bandingAkar(p, q) === 0;
}

test('tahap: 11 tahap unik & cocok dengan manifest halaman', () => {
  assertUniqueIds(D.tahap, 'tahap');
  assert.equal(D.tahap.length, 11);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-12.5'];
  assert.ok(m, 'manifest memuat fase-d/mpi-12.5');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Cooperative Learning/);
  assert.match(m.description, /Jigsaw/);
  assert.equal(m.h1, 'Membandingkan & Mengurutkan Bentuk Akar');
});

test('setiap tahap berkepala: kicker, goal, sintaks Jigsaw, catatan guru', () => {
  D.tahap
    .map((t) => t.id)
    .filter((k) => k !== 'selesai')
    .forEach((k) => {
      const T = D[k];
      assert.ok(T, 'DATA.' + k);
      ['kicker', 'goal', 'guru', 'syntax'].forEach((f) => assert.ok(T[f], k + '.' + f));
      assert.match(T.syntax, /^Cooperative Learning \(Jigsaw\) · /, k);
    });
});

test('tujuan: dugaan acak-able & kunci dugaan dihitung engine', () => {
  const T = D.tujuan;
  assert.equal(T.tp, 'Membandingkan dan mengurutkan bentuk akar.');
  const tokoh = T.tokoh.map((t) => ({ id: t.id, p: t.p }));
  T.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan ' + q.id);
    assert.ok(ids(q.opsi).includes(T.kunciDugaan[q.id]), q.id + ': kunci ada di opsi');
    if (q.cari) {
      assert.equal(T.kunciDugaan[q.id], E.ekstremAkar(tokoh, q.cari), q.id);
    } else {
      const sym = E.simbolBandingAkar(q.p, q.q);
      assert.equal(T.kunciDugaan[q.id], { gt: 'p', lt: 'q', eq: 'sama' }[sym], q.id);
    }
  });
});

test('informasi: penuntun lengkap & kunci perbandingan = engine', () => {
  const I = D.informasi;
  assert.ok(I.labTarget >= 2 && I.labTarget <= E.STRATEGI_BANDING_AKAR.length);
  assert.ok(I.labSaran.length >= 3);
  assertUniqueIds(I.penuntun, 'penuntun');
  I.penuntun.forEach((q) => {
    assertOptions(q.opsi, 'penuntun ' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + ': umpan untuk ' + o.id));
    if (q.cek) assert.equal(q.correct, E.simbolBandingAkar(q.cek.p, q.cek.q), q.id);
  });
  const p2 = I.penuntun.find((q) => q.id === 'p2');
  assert.equal(E.teksBentukAkar(E.masukkanKoefisien({ k: 3, n: 2, r: 2 })), '√18');
  assert.equal(p2.opsi.find((o) => o.id === p2.correct).label, '√18');
  const p6 = I.penuntun.find((q) => q.id === 'p6');
  assert.deepEqual(JSON.parse(JSON.stringify(E.apitAkar({ k: 1, n: 2, r: 50 }))), {
    bawah: 7,
    atas: 8,
    bulat: false,
  });
  assert.match(p6.opsi.find((o) => o.id === p6.correct).label, /^7 dan 8/);
  assert.ok(I.aturan.length >= 4);
});

test('tim: batas anggota & kesepakatan', () => {
  const T = D.tim;
  assert.ok(T.minAnggota >= 2 && T.maksAnggota === 4);
  assertUniqueIds(T.kesepakatan, 'kesepakatan');
});

test('ahli (Jigsaw): satu stasiun per strategi, soal cocok dengan strateginya', () => {
  const A = D.ahli;
  assert.deepEqual(ids(A.stasiun), ids(E.STRATEGI_BANDING_AKAR), 'urutan stasiun = engine');
  const semuaSoal = [];
  A.stasiun.forEach((st) => {
    assert.ok(st.contoh && st.contoh.cerita && st.contoh.nama.length === 2, st.id + ': contoh');
    assert.ok(
      E.strategiBerlakuAkar(st.contoh.a, st.contoh.b).includes(st.id),
      st.id + ': contoh cocok dengan strategi'
    );
    assert.ok(st.soal.length >= 2, st.id + ': minimal 2 soal latih');
    st.soal.forEach((s) => {
      semuaSoal.push(s);
      assert.ok(s.cerita, s.id + ': cerita');
      assert.ok(s.cerita.includes(E.teksBentukAkar(s.a)), s.id + ': cerita memuat a');
      assert.ok(s.cerita.includes(E.teksBentukAkar(s.b)), s.id + ': cerita memuat b');
      assert.equal(E.strategiBandingAkar(s.a, s.b), st.id, s.id + ': strategi tercepat');
    });
  });
  assertUniqueIds(semuaSoal, 'soal ahli');
  const sim = semuaSoal.map((s) => E.simbolBandingAkar(s.a, s.b));
  assert.ok(sim.includes('lt') && sim.includes('gt'), 'lambang jawaban bervariasi');
});

test('misi bandingkan: tema dikenal, lambang & strategi beragam', () => {
  const M = D.misiBanding;
  assertUniqueIds(M.soal, 'misiBanding.soal');
  assert.ok(M.soal.length >= 6);
  const lambang = new Set();
  const strategi = new Set();
  M.soal.forEach((s) => {
    assert.ok(E.KATA_BANDING_PECAHAN[s.tema], s.id + ': tema dikenal');
    assert.ok(s.a.teks && s.b.teks && s.cerita && s.tanyaMakna, s.id + ': teks lengkap');
    assert.ok(s.cerita.includes(E.teksBentukAkar(s.a.p)), s.id + ': cerita memuat a');
    assert.ok(s.cerita.includes(E.teksBentukAkar(s.b.p)), s.id + ': cerita memuat b');
    assertOptions(E.opsiMaknaBandingAkar(s.tema), s.id + ' makna');
    lambang.add(E.simbolBandingAkar(s.a.p, s.b.p));
    strategi.add(E.strategiBandingAkar(s.a.p, s.b.p));
  });
  assert.equal(lambang.size, 3, 'memuat <, >, dan =');
  assert.equal(strategi.size, 4, 'keempat strategi ahli muncul');
  assertOptions(E.opsiStrategiBandingAkar(), 'opsi strategi', 4);
});

test('misi urutkan: nilai berbeda semua, arah valid, label ujung ada', () => {
  const M = D.misiUrut;
  assertUniqueIds(M.soal, 'misiUrut.soal');
  M.soal.forEach((s) => {
    assert.ok(['naik', 'turun'].includes(s.arah), s.id + ': arah');
    assert.ok(E.KATA_BANDING_PECAHAN[s.tema], s.id + ': tema');
    assert.ok(s.items.length >= 4, s.id + ': minimal 4 kartu');
    assertUniqueIds(s.items, s.id + '.items');
    for (let i = 0; i < s.items.length; i++) {
      for (let j = i + 1; j < s.items.length; j++) {
        assert.ok(!sama(s.items[i].p, s.items[j].p), s.id + ': tidak ada nilai kembar');
      }
    }
    s.items.forEach((it) =>
      assert.ok(s.cerita.includes(E.teksBentukAkar(it.p)), s.id + ': cerita memuat ' + it.id)
    );
    assert.ok(s.fromLabel && s.toLabel && s.cerita);
  });
  const semua = M.soal.flatMap((s) => s.items.map((it) => it.p));
  assert.ok(
    semua.some((p) => p.r === 1),
    'memuat bilangan bulat'
  );
  assert.ok(
    semua.some((p) => p.k > 1 && p.r > 1),
    'memuat bentuk akar berkoefisien'
  );
  assert.ok(new Set(semua.filter((p) => p.r > 1).map((p) => p.n)).size >= 3, 'indeks beragam');
});

test('misi diskusi: kunci Benar/Salah cocok dengan pemeriksaan engine', () => {
  const M = D.misiDiskusi;
  assertOptions(M.opsi, 'diskusi.opsi', 2);
  assertUniqueIds(M.pernyataan, 'pernyataan');
  assert.ok(M.pernyataan.length >= 6);
  M.pernyataan.forEach((p) => {
    assert.ok(p.explanation, p.id + ': penjelasan');
    const c = p.cek;
    assert.ok(c, p.id + ': cek');
    let benar;
    if (c.jenis === 'lambang') benar = E.simbolBandingAkar(c.a, c.b) === c.sym;
    else if (c.jenis === 'makna') benar = E.idMaknaBandingAkar(c.a, c.b) === c.klaim;
    else if (c.jenis === 'urut') {
      const kunci = E.urutkanAkar(c.nilai, c.arah);
      benar = c.nilai.every((v, i) => sama(v, kunci[i]));
    } else assert.fail(p.id + ': jenis cek tidak dikenal');
    assert.equal(p.correct, benar ? 'benar' : 'salah', p.id);
  });
  const kunci = new Set(M.pernyataan.map((p) => p.correct));
  assert.equal(kunci.size, 2, 'ada pernyataan benar dan salah');
});

test('kuis: bank soal cukup, komposisi valid, kunci cocok dengan engine', () => {
  const K = D.kuis;
  assertUniqueIds(K.soal, 'kuis.soal');
  assert.ok(K.soal.length >= 2 * K.banyak, 'bank minimal dua kali banyak soal');
  const total = Object.values(K.komposisi).reduce((a, b) => a + b, 0);
  assert.equal(total, K.banyak);
  Object.keys(K.komposisi).forEach((j) => {
    const n = K.soal.filter((s) => s.jenis === j).length;
    assert.ok(n >= K.komposisi[j] + 1, 'jenis ' + j + ' cukup untuk diacak');
  });
  K.soal.forEach((s) => {
    assertOptions(s.options, s.id + '.options');
    assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada di opsi');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.jenis === 'lambang') {
      assert.equal(s.correct, E.simbolBandingAkar(s.a, s.b), s.id);
    } else if (s.jenis === 'makna') {
      assert.equal(s.correct, E.idMaknaBandingAkar(s.a, s.b), s.id);
      const eng = E.opsiMaknaBandingAkar(s.tema);
      assert.deepEqual(
        s.options.map((o) => o.id + ':' + o.label),
        eng.map((o) => o.id + ':' + o.label),
        s.id + ': opsi makna = engine'
      );
    } else if (s.jenis === 'ekstrem') {
      assert.equal(s.correct, E.ekstremAkar(s.options, s.cari), s.id);
      s.options.forEach((o) =>
        assert.ok(o.label.includes(E.teksBentukAkar(o.p)), s.id + '.' + o.id + ': label')
      );
    } else if (s.jenis === 'urut') {
      const kunci = E.urutkanAkar(s.options[0].nilai, s.arah);
      s.options.forEach((o) => {
        assert.equal(o.nilai.length, kunci.length, s.id + '.' + o.id);
        const cocok = o.nilai.every((v, i) => sama(v, kunci[i]));
        assert.equal(cocok, o.id === s.correct, s.id + '.' + o.id);
      });
      const label = new Set(s.options.map((o) => o.nilai.map(E.teksBentukAkar).join(', ')));
      assert.equal(label.size, s.options.length, s.id + ': urutan opsi berbeda');
    } else if (s.jenis === 'strategi') {
      assert.equal(s.correct, E.strategiBandingAkar(s.a, s.b), s.id);
      /* Selain yang tercepat, hanya strategi "selalu berhasil" yang juga berlaku. */
      E.strategiBerlakuAkar(s.a, s.b)
        .slice(1)
        .forEach((id) =>
          assert.ok(['samakanIndeks', 'masukkanKoefisien'].includes(id), s.id + ': ' + id)
        );
    } else if (s.jenis === 'masukkan') {
      const kunci = E.masukkanKoefisien(s.p);
      s.options.forEach((o) => {
        assert.equal(o.label, E.teksBentukAkar(o.p), s.id + '.' + o.id + ': label');
        assert.equal(
          o.p.n === kunci.n && o.p.r === kunci.r && o.p.k === 1,
          o.id === s.correct,
          s.id + '.' + o.id
        );
      });
    } else {
      assert.fail(s.id + ': jenis tidak dikenal ' + s.jenis);
    }
  });
});

test('refleksi & selesai', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assertUniqueIds(D.refleksi.pertanyaan, 'refleksi.pertanyaan');
  assert.ok(D.selesai.capaian.length >= 4);
});

test('index.html root memuat card MPI 12.5 di Fase D, Kelas VIII, Topik 12', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = html.match(/<a\s+href="fase-d\/mpi-12\.5\/index\.html"[\s\S]*?<\/a>/);
  assert.ok(m, 'card MPI 12.5 ada');
  assert.match(m[0], /data-kelas="VIII"/);
  assert.match(m[0], /data-topik="12"/);
  assert.match(m[0], /Materi 12\.5/);
  assert.match(m[0], /Membandingkan &amp; Mengurutkan Bentuk Akar/);
});
