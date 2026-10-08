'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-2.5/data.js (Operasi hitung desimal
 * & konversi pecahan–desimal dalam masalah kontekstual, Discovery
 * Learning): kunci jawaban setiap dugaan/percobaan/soal cocok dengan
 * engine seksi 64 (hasilOperasiDesimal, diagnosaOperasiDesimal,
 * pecahanKeDesimal, desimalKePecahan, diagnosaKonversiPD), alat Lab
 * Desimal diatur ke target yang benar, pernyataan pembuktian sesuai hasil
 * engine, setiap daftar pilihan punya id & label unik dan cukup opsi
 * untuk diacak, serta jumlah tahap sama dengan manifest halaman. app.js
 * juga dicek agar pilihan selalu dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-2.5/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-2.5', 'app.js'), 'utf8');

/* id dalam array realm Node (DATA dimuat di konteks vm lain). */
function ids(list) {
  return Array.from(list, (o) => o.id);
}

function assertOptions(list, name, min) {
  const m = min || 3;
  assert.ok(list && list.length >= m, name + ' minimal ' + m + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  const labels = Array.from(list, (o) => o.label || o.teks);
  labels.forEach((l, i) => assert.ok(l, name + '.' + list[i].id + ': label'));
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus berbeda');
}

function assertHead(T, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(T[k], name + ': ' + k));
}

function assertGuided(list, name) {
  assert.ok(list.length >= 1, name + ': ada pertanyaan');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya, q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

/* Hasil baku operasi harus desimal berhenti (bisa diketik murid). */
function assertHitung(s, name) {
  const h = E.hasilOperasiDesimal(s.a, s.op, s.b);
  assert.ok(!h.includes('…'), name + ': hasil berhenti');
  assert.equal(E.diagnosaOperasiDesimal(h, s.a, s.op, s.b).kode, 'benar', name);
  return h;
}

/* Angka pertama pada label opsi, mis. "2,05 kg" → "2,05". */
function angka(label) {
  return String(label)
    .match(/^[−-]?[\d,/ ]*\d/)[0]
    .trim();
}

test('sebelas tahap Discovery Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-2.5'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 11);
  assert.equal(new Set(ids(D.tahap)).size, 11);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  [
    'stimulasi',
    'masalah',
    'koleksi',
    'olahTambah',
    'olahKaliBagi',
    'olahKonversi',
    'verifikasi',
    'generalisasi',
  ].forEach((id, i, arr) => {
    assert.match(D[id].syntax, /Discovery Learning · Sintaks [1-6]/, id + ': sintaks DL');
    if (i) {
      const n = (s) => Number(s.match(/Sintaks (\d)/)[1]);
      assert.ok(n(D[id].syntax) >= n(D[arr[i - 1]].syntax), id + ': urutan sintaks');
    }
  });
});

test('stimulasi: TP sesuai, dugaan acak & kunci dugaan sesuai engine', () => {
  const T = D.stimulasi;
  assert.match(T.tp, /operasi aritmatika pada bilangan desimal/);
  assert.match(T.tp, /mengonversi pecahan dan desimal/);
  assert.ok(T.kriteria.length >= 3);
  assert.equal(new Set(ids(T.kabar)).size, T.kabar.length);
  T.kabar.forEach((k) => assert.ok(D.konteks[k.konteks], k.id + ': konteks'));
  T.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    const label = (id) => angka(q.opsi.find((o) => o.id === id).label);
    if (q.jenis === 'hitung') {
      assert.equal(label(q.baku), E.hasilOperasiDesimal(q.a, q.op, q.b), q.id);
      q.opsi
        .filter((o) => o.id !== q.baku)
        .forEach((o) =>
          assert.notEqual(E.diagnosaOperasiDesimal(angka(o.label), q.a, q.op, q.b).kode, 'benar')
        );
    } else {
      assert.equal(label(q.baku), E.pecahanKeDesimal(q.soal).teks, q.id);
      q.opsi
        .filter((o) => o.id !== q.baku)
        .forEach((o) =>
          assert.notEqual(E.diagnosaKonversiPD(angka(o.label), q.soal, 'keDesimal').kode, 'benar')
        );
    }
    assert.ok(q.pembahasan, q.id + ': pembahasan');
  });
});

test('masalah: rumusan acak dengan umpan per opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah.opsi', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], o.id + ': umpan'));
});

test('koleksi: alat Lab Desimal diatur ke target yang benar', () => {
  const K = D.koleksi;
  assert.equal(K.percobaan.length, 6);
  assert.equal(new Set(ids(K.percobaan)).size, 6);
  assertOptions(K.opsiSusun, 'opsiSusun', 2);
  K.opsiSusun.forEach((o) => assert.ok(K.umpanSusun[o.id], 'umpanSusun.' + o.id));
  const alat = new Set();
  K.percobaan.forEach((p) => {
    assert.ok(D.alat[p.alat], p.id + ': alat dikenal');
    assert.ok(D.konteks[p.konteks], p.id + ': konteks');
    alat.add(p.alat);
    assert.ok(p.cerita && p.temuan && p.hints.length, p.id + ': teks');
    if (p.alat === 'arsir') {
      const v = E.pecahanKeDesimal(p.soal);
      assert.equal(v.berulang, false, p.id);
      assert.equal(p.arsir, Math.round((v.nilai.num * 100) / v.nilai.den), p.id + ': arsir');
    } else {
      const h = assertHitung(p, p.id);
      if (p.alat === 'susun') assert.ok(['+', '−'].includes(p.op), p.id + ': susun untuk + −');
      if (p.alat === 'luas') {
        assert.equal(p.op, '×');
        assert.equal(p.baris, Math.round(Number(p.a.replace(',', '.')) * 10), p.id + ': baris');
        assert.equal(p.kolom, Math.round(Number(p.b.replace(',', '.')) * 10), p.id + ': kolom');
        assert.equal(E.desimalPerseratus(p.baris * p.kolom), h, p.id + ': luas');
      }
      if (p.alat === 'tuang') {
        assert.equal(p.op, ':');
        assert.ok(/^\d+$/.test(h), p.id + ': banyak gelas bulat');
      }
    }
  });
  ['arsir', 'susun', 'luas', 'tuang'].forEach((a) => assert.ok(alat.has(a), 'alat ' + a));
  assertGuided(K.amati, 'amati');
});

test('olahTambah: pemilahan susunan & hitungan sesuai engine', () => {
  const O = D.olahTambah;
  assertOptions(O.opsiSusunan, 'opsiSusunan', 2);
  O.pilah.forEach((s) => {
    assert.equal(s.teks, E.fmtOperasiDesimal(s.a, s.op, s.b), s.id + ': teks');
    assert.equal(s.correct, s.rataKanan ? 'keliru' : 'benar', s.id + ': kunci');
    assert.ok(ids(O.opsiSusunan).includes(s.correct));
    assert.ok(s.explanation);
    const html = E.buildBersusunDesimal(s.a, s.op, s.b, { rataKanan: s.rataKanan });
    assert.equal(/bersusun-dec--rata-kanan/.test(html), !!s.rataKanan, s.id + ': visual');
  });
  assert.ok(O.pilah.some((s) => s.rataKanan) && O.pilah.some((s) => !s.rataKanan));
  assertGuided(O.pola, 'pola');
  assert.equal(new Set(ids(O.hitung)).size, O.hitung.length);
  O.hitung.forEach((s) => {
    assert.ok(['+', '−'].includes(s.op), s.id);
    assertHitung(s, s.id);
  });
  assert.ok(O.temuan.length >= 2);
});

test('olahKaliBagi: tabel pola punya angka sama & hasil sesuai engine', () => {
  const O = D.olahKaliBagi;
  const tanpaKoma = (s) => String(s).replace(/[,]/g, '').replace(/^0+/, '');
  const kali = Array.from(O.polaKali, (r) => E.hasilOperasiDesimal(r.a, '×', r.b));
  assert.ok(O.polaKali[0].tampil && O.polaKali.slice(1).every((r) => !r.tampil));
  kali.forEach((h, i) => assert.equal(tanpaKoma(h), '12', 'pola kali baris ' + (i + 1)));
  assert.deepEqual(kali, ['12', '1,2', '0,12', '0,012']);
  const bagi = Array.from(O.polaBagi, (r) => E.hasilOperasiDesimal(r.a, ':', r.b));
  assert.ok(O.polaBagi[0].tampil && O.polaBagi.slice(1).every((r) => !r.tampil));
  bagi.forEach((h) => assert.equal(h, '5', 'pola bagi hasil tetap 5'));
  assertGuided(O.pasangKali, 'pasangKali');
  assertGuided(O.pasangBagi, 'pasangBagi');
  O.hitung.forEach((s) => {
    assert.ok(['×', ':'].includes(s.op), s.id);
    assertHitung(s, s.id);
    assert.equal(E.opsiOperasiDesimal(s.a, s.op, s.b).length, 4, s.id + ': opsi engine');
  });
  assert.ok(O.hitung.some((s) => s.op === '×') && O.hitung.some((s) => s.op === ':'));
});

test('olahKonversi: soal konversi berhenti/berulang sesuai engine', () => {
  const O = D.olahKonversi;
  O.keDesimal.forEach((s) => {
    const v = E.pecahanKeDesimal(s.soal);
    assert.equal(v.berulang, false, s.id + ': berhenti');
    assert.ok(v.persepuluhan, s.id + ': bisa berpenyebut 10ⁿ');
    assert.equal(E.diagnosaKonversiPD(v.teks, s.soal, 'keDesimal').kode, 'benar');
  });
  assert.equal(E.pecahanKeDesimal(O.pembagian.soal).berulang, true);
  assertGuided(O.berulang, 'berulang');
  /* b2: hanya opsi kunci yang berulang */
  const b2 = O.berulang.find((q) => q.id === 'b2');
  b2.opsi.forEach((o) =>
    assert.equal(E.pecahanKeDesimal(o.label).berulang, o.id === b2.correct, 'b2.' + o.id)
  );
  /* b1: kunci = teks desimal berulang 1/3 */
  const b1 = O.berulang.find((q) => q.id === 'b1');
  assert.equal(
    angka(b1.opsi.find((o) => o.id === b1.correct).label) + '…',
    E.pecahanKeDesimal('1/3').teks
  );
  O.keDesimalBerulang.forEach((s) => {
    assert.equal(E.pecahanKeDesimal(s.soal).berulang, true, s.id);
    assert.equal(E.diagnosaKonversiPD('0,67', s.soal, 'keDesimal').kode, 'benar');
  });
  O.kePecahan.forEach((s) => {
    const d = E.desimalKePecahan(s.soal);
    assert.ok(d, s.id);
    assert.equal(E.diagnosaKonversiPD(d.sederhana, s.soal, 'kePecahan').kode, 'benar', s.id);
    if (d.fpb > 1) {
      assert.equal(E.diagnosaKonversiPD(d.awal, s.soal, 'kePecahan').kode, 'belum-sederhana');
    }
  });
  assert.ok(O.temuan.length >= 2);
});

test('verifikasi: kunci pernyataan sesuai hasil engine', () => {
  const V = D.verifikasi;
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 2);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  V.pernyataan.forEach((p) => {
    assert.ok(['benar', 'salah'].includes(p.correct), p.id);
    assert.ok(p.explanation, p.id);
    if (p.cek) {
      const r = E.diagnosaOperasiDesimal(p.cek.klaim, p.cek.a, p.cek.op, p.cek.b);
      assert.equal(r.benar ? 'benar' : 'salah', p.correct, p.id);
    }
    if (p.konversi) {
      const sama = E.bandingTerpadu(p.konversi.soal, p.konversi.klaim) === 0;
      assert.equal(sama ? 'benar' : 'salah', p.correct, p.id);
    }
  });
  assert.ok(V.pernyataan.some((p) => p.correct === 'benar'));
  assert.ok(V.pernyataan.some((p) => p.correct === 'salah'));
});

test('generalisasi: kalimat & bank kesimpulan berpengecoh', () => {
  const G = D.generalisasi;
  assertOptions(G.bank, 'bank', G.kalimat.length + 1);
  const bankIds = ids(G.bank);
  const kunci = G.kalimat.map((g) => g.correct);
  kunci.forEach((k) => assert.ok(bankIds.includes(k), k));
  assert.equal(new Set(kunci).size, kunci.length, 'setiap potongan hanya untuk satu kalimat');
  assert.ok(bankIds.length > kunci.length, 'ada pengecoh');
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: bank soal kontekstual, kunci sesuai engine', () => {
  const T = D.terapkan;
  assert.equal(
    T.banyak,
    Object.values(T.komposisi).reduce((a, b) => a + b, 0)
  );
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  Object.keys(T.komposisi).forEach((k) => {
    const n = T.soal.filter((s) => s.type === k).length;
    assert.ok(n > T.komposisi[k], k + ': bank lebih banyak daripada yang diambil');
  });
  T.soal.forEach((s) => {
    assert.ok(D.konteks[s.konteks], s.id + ': konteks');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id + ': teks');
    if (s.type === 'input') {
      assert.ok(['hitung', 'keDesimal', 'kePecahan'].includes(s.jenis), s.id + ': jenis');
      assert.ok(s.hints.length && s.reveal, s.id + ': petunjuk & pembahasan');
      let kunci;
      if (s.jenis === 'hitung') kunci = assertHitung(s, s.id);
      else if (s.jenis === 'keDesimal') kunci = E.pecahanKeDesimal(s.soal).teks;
      else kunci = E.desimalKePecahan(s.soal).sederhana;
      assert.ok(!kunci.includes('…'), s.id + ': jawaban berhenti');
      assert.ok(s.reveal.includes(kunci), s.id + ': pembahasan memuat ' + kunci);
      assert.equal(E.periksaOpDesimalStep(E.makeDesimalStep(), s, kunci).kode, 'benar', s.id);
    } else {
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct');
      const benar = s.options.find((o) => o.id === s.correct).label;
      if (s.jenis === 'hitung') {
        assert.equal(angka(benar), E.hasilOperasiDesimal(s.a, s.op, s.b), s.id);
      }
      if (s.jenis === 'kePecahan') {
        assert.equal(benar, E.desimalKePecahan(s.soal).sederhana, s.id);
        s.options
          .filter((o) => o.id !== s.correct)
          .forEach((o) =>
            assert.notEqual(E.diagnosaKonversiPD(o.label, s.soal, 'kePecahan').kode, 'benar')
          );
      }
    }
  });
  assert.ok(T.soal.some((s) => s.jenis === 'keDesimal'));
  assert.ok(T.soal.some((s) => s.jenis === 'kePecahan'));
  ['+', '−', '×', ':'].forEach((op) =>
    assert.ok(
      T.soal.some((s) => s.jenis === 'hitung' && s.type === 'input' && s.op === op),
      'operasi ' + op
    )
  );
});

test('refleksi & selesai: konten lengkap', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'diriOpsi', 3);
  const S = D.selesai;
  assert.ok(S.judul && S.teks && S.capaian.length >= 3);
  S.contoh.forEach((c) => assert.ok(D.konteks[c.konteks], c.teks));
});

test('app.js: semua pilihan diacak sekali & disimpan', () => {
  assert.match(APP, /ensureShuffledOrder\(/, 'memakai ensureShuffledOrder');
  assert.match(APP, /ensureSortStates\(/, 'pemilahan diacak');
  assert.match(APP, /optionOrder: [^\n]*shuffleArray\(/, 'opsi uji terap diacak');
  assert.match(APP, /shuffleArray\(kelompok\)/, 'soal uji terap diambil acak dari bank');
  const panggilan = APP.match(/buildChoiceGroup\([^,]+,\s*[^,)]+/g) || [];
  assert.ok(panggilan.length >= 4, 'buildChoiceGroup dipakai');
  panggilan.forEach((p) => assert.match(p, /Order|order|orders\[/, 'urutan tersimpan: ' + p));
  assert.doesNotMatch(APP, /Math\.random/, 'pengacakan lewat engine, bukan Math.random langsung');
  assert.match(APP, /mpi-d-2-5-/, 'kunci penyimpanan khas modul');
});
