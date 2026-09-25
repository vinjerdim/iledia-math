'use strict';

/*
 * Tes konsistensi konten fase-f/mpi-11.1/data.js (asosiasi dua variabel:
 * tabel kontingensi & diagram pencar, Discovery Learning): tahap cocok
 * dengan manifest & sintaks, kartu turus & frekuensi survei konsisten,
 * kunci persen/arah/asosiasi di data cocok dengan hasil engine seksi 33,
 * titik plot berada pada kelipatan sumbu, setiap daftar pilihan punya id
 * unik, setiap opsi pertanyaan penuntun punya umpan balik, kunci soal uji
 * terap valid, dan app.js mengacak setiap daftar pilihan jawaban murid.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-f/mpi-11.1/data.js']);
const D = E.DATA;
const tanpaSpasi = (s) => s.replace(/\s+/g, '').replace(/,\)/g, ')');
const APP = tanpaSpasi(fs.readFileSync(path.join(ROOT, 'fase-f/mpi-11.1/app.js'), 'utf8'));
const S = D.survei;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 4), name + ' minimal ' + (min || 4) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + ': opsi ' + o.id + ' tanpa label'));
}

function assertGuided(q, name) {
  assertOptions(q.opsi, name + '.opsi', 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': kunci tidak ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan balik untuk ' + o.id));
}

function assertSort(items, options, name) {
  assertOptions(options, name + '.opsi', 2);
  assert.equal(new Set(ids(items)).size, items.length, name + ': id butir unik');
  items.forEach((it) => {
    assert.ok(ids(options).includes(it.correct), name + ': kunci ' + it.id);
    assert.ok(it.explanation, name + ': penjelasan ' + it.id);
  });
}

const KAT2 = [{ id: 'a' }, { id: 'b' }];
const tabelSurvei = () => E.tabelDariSel(S.sel, S.ekskul.kategori, S.sertifikasi.kategori);

test('tahap cocok dengan manifest dan sintaks Discovery Learning', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared/pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-f/mpi-11.1'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Discovery Learning/);
  assert.deepEqual(Array.from(ids(D.tahap)), [
    'stimulasi',
    'masalah',
    'koleksiKategori',
    'koleksiNumerik',
    'olah',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
    'selesai',
  ]);
  const sintaks = {
    stimulasi: 1,
    masalah: 2,
    koleksiKategori: 3,
    koleksiNumerik: 3,
    olah: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.keys(sintaks).forEach((k) =>
    assert.equal(D[k].syntax, 'Discovery Learning · Sintaks ' + sintaks[k], k)
  );
  D.tahap.forEach((t) => {
    if (t.id !== 'selesai') assert.ok(D[t.id].guru, 'catatan guru untuk ' + t.id);
  });
});

test('survei: 20 kartu turus unik & tabel lengkap 80 siswa berasosiasi', () => {
  assert.equal(S.kartu.length, 20);
  assert.equal(new Set(ids(S.kartu)).size, 20);
  const t = E.tabelKontingensi(
    S.kartu,
    'ekskul',
    'sert',
    S.ekskul.kategori,
    S.sertifikasi.kategori
  );
  assert.equal(t.total, 20, 'semua kartu berkategori valid');
  /* Keempat sel terisi agar murid benar-benar menghitung setiap pasangan. */
  t.sel.forEach((r) => r.forEach((n) => assert.ok(n > 0)));
  const full = tabelSurvei();
  assert.equal(full.total, 80);
  assert.equal(E.asosiasiKategori(full), S.asosiasiKategori);
  /* Jebakan frekuensi mentah: lulus 24 vs 20 berdekatan, persen jauh berbeda. */
  assert.ok(Math.abs(full.sel[0][0] - full.sel[1][0]) <= 5);
  assert.ok(Math.abs(E.selisihPoinPersen(full, 0)) >= 30);
});

test('survei: titik plot berada di kelipatan sumbu, pencar lengkap berasosiasi positif', () => {
  assert.equal(S.plot.length, 8);
  S.plot.forEach((p) => {
    assert.equal(E.snapKeSumbu(p.x, S.sumbuX), p.x, 'x ' + p.id);
    assert.equal(E.snapKeSumbu(p.y, S.sumbuY), p.y, 'y ' + p.id);
    assert.notEqual(p.x, p.y, 'x ≠ y agar diagnosa sumbu tertukar bermakna');
    assert.ok(p.label);
  });
  const semua = S.plot.concat(S.lainnya);
  assert.equal(semua.length, 24);
  assert.equal(new Set(ids(semua)).size, 24);
  semua.forEach((p) => {
    assert.ok(p.x >= S.sumbuX.min && p.x <= S.sumbuX.max);
    assert.ok(p.y >= S.sumbuY.min && p.y <= S.sumbuY.max);
  });
  const a = E.asosiasiTitik(semua);
  assert.equal(a.arah, S.arahNumerik);
  assert.equal(a.kekuatan, 'kuat');
  /* Lembar mentah stimulasi cocok dengan kartu & titik plot. */
  D.stimulasi.lembar.forEach((row, i) => {
    assert.equal(row[0], S.kartu[i].nama);
    assert.equal(row[0], S.plot[i].label);
    assert.equal(row[3], S.plot[i].x);
    assert.equal(row[4], S.plot[i].y);
    assert.equal(row[1] === 'Ya' ? 'ya' : 'tidak', S.kartu[i].ekskul);
    assert.equal(row[2] === 'Lulus' ? 'lulus' : 'belum', S.kartu[i].sert);
  });
});

test('stimulasi & masalah: opsi lengkap, penuntun berumpan balik, pilah variabel', () => {
  assert.equal(D.stimulasi.klaim.length, 2);
  D.stimulasi.klaim.forEach((k) => {
    assertOptions(k.opsi, 'klaim ' + k.id);
    assert.ok(ids(k.opsi).includes(D.verifikasi.kunciKlaim[k.id]));
    assert.ok(D.verifikasi.dataKlaim[k.id]);
  });
  assertGuided(D.masalah.pertanyaan, 'masalah.pertanyaan');
  assertSort(D.masalah.variabel, D.masalah.opsiJenis, 'masalah.variabel');
  assert.ok(D.masalah.variabel.some((v) => v.correct === 'kategorikal'));
  assert.ok(D.masalah.variabel.some((v) => v.correct === 'numerik'));
});

test('olah: kunci persen baris dari engine & pertanyaan penuntun', () => {
  const pb = E.persenBaris(tabelSurvei());
  D.olah.langkahPersen.forEach((l) => {
    assert.ok(E.hampirSama(l.jawab, pb[l.cek.baris][l.cek.kolom]), l.label);
    assert.ok(l.hints.length && l.temuan);
  });
  D.olah.tanyaKategori.concat(D.olah.tanyaNumerik).forEach((q) => assertGuided(q, q.id));
  const semuaId = ids(D.olah.tanyaKategori.concat(D.olah.tanyaNumerik));
  assert.equal(new Set(semuaId).size, semuaId.length);
});

test('verifikasi: kunci pemilahan pencar & tabel sesuai engine, pernyataan lengkap', () => {
  const V = D.verifikasi;
  assertSort(V.pencar, E.OPSI_ARAH, 'verifikasi.pencar');
  V.pencar.forEach((p) => {
    assert.equal(E.asosiasiTitik(p.titik).arah, p.correct, p.id);
    assert.ok(p.xLabel && p.yLabel && p.judul);
  });
  const arahDipakai = new Set(V.pencar.map((p) => p.correct));
  ['positif', 'negatif', 'tidak'].forEach((a) => assert.ok(arahDipakai.has(a), 'ada contoh ' + a));
  assertSort(V.tabel, V.opsiTabel, 'verifikasi.tabel');
  V.tabel.forEach((t) => {
    assert.equal(E.asosiasiKategori(E.tabelDariSel(t.sel, t.baris, t.kolom)), t.correct, t.id);
  });
  /* Ada jebakan: frekuensi mentah berbeda jauh tetapi tidak berasosiasi. */
  assert.ok(
    V.tabel.some((t) => t.correct === 'tidak' && Math.abs(t.sel[0][0] - t.sel[1][0]) >= 15)
  );
  assertSort(V.pernyataan, V.opsiPernyataan, 'verifikasi.pernyataan');
  assert.ok(V.labNumerik.xLabel && V.labKategori.a.kategori.length >= 2);
});

test('generalisasi: setiap kalimat punya kunci unik di bank, ada pengecoh', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  const kunci = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(kunci).size, kunci.length);
  kunci.forEach((k) => assert.ok(bank.includes(k), 'kunci ' + k));
  assert.ok(bank.length - kunci.length >= 3, 'minimal 3 pengecoh');
});

test('uji terap: kunci isian & pilihan sesuai engine', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 8);
  soal.forEach((s, i) => {
    const nama = 'soal ' + (i + 1);
    assert.ok(s.cerita && s.pertanyaan, nama);
    if (s.type === 'choice') {
      assertOptions(s.options, nama);
      assert.ok(ids(s.options).includes(s.correct), nama + ': kunci');
      assert.ok(s.explanation, nama + ': penjelasan');
    } else {
      assert.equal(typeof s.jawab, 'number', nama);
      assert.ok(s.reveal && s.hints.length, nama);
    }
    if (s.tabel) {
      const t = E.tabelDariSel(s.tabel.sel, s.tabel.baris, s.tabel.kolom);
      if (s.cek.persenBaris) {
        const [b, k] = s.cek.persenBaris;
        assert.ok(E.hampirSama(E.persenBaris(t)[b][k], s.jawab), nama);
      }
      if (typeof s.cek.selisihKolom === 'number') {
        assert.ok(E.hampirSama(E.selisihPoinPersen(t, s.cek.selisihKolom), s.jawab), nama);
      }
    }
    if (s.cek.asosiasi) {
      const t = E.tabelDariSel(s.cek.sel, KAT2, KAT2);
      assert.equal(E.asosiasiKategori(t), s.cek.asosiasi, nama);
    }
    if (s.pencar) {
      assert.equal(E.asosiasiTitik(s.pencar.titik).arah, s.cek.arah, nama);
      assert.equal(s.correct, s.cek.arah, nama);
    }
  });
  assert.ok(soal.some((s) => s.type === 'input'));
  assert.ok(soal.some((s) => s.pencar));
  assert.ok(soal.some((s) => s.tabel));
});

test('refleksi: penilaian diri berisi opsi unik', () => {
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.refleksi.pertanyaan.length >= 3);
});

test('app.js mengacak setiap daftar pilihan jawaban murid', () => {
  [
    'ensureShuffledOrder(State.klaimOrders,k.id,k.opsi)',
    'siapkanUrutan(State.masalahOrders,[DATA.masalah.pertanyaan])',
    "ensureSortStates(State,'variabelStates','variabelOrder',DATA.masalah.variabel,DATA.masalah.opsiJenis)",
    'siapkanUrutan(State.olahOrders,DATA.olah.tanyaKategori.concat(DATA.olah.tanyaNumerik))',
    "ensureSortStates(State,'pencarStates','pencarOrder',DATA.verifikasi.pencar,OPSI_ARAH)",
    "ensureSortStates(State,'tabelStates','tabelOrder',DATA.verifikasi.tabel,DATA.verifikasi.opsiTabel)",
    "ensureSortStates(State,'pernyataanStates','pernyataanOrder',DATA.verifikasi.pernyataan,DATA.verifikasi.opsiPernyataan)",
    "ensureShuffledOrder(State,'bankOrder',DATA.generalisasi.bank)",
    'shuffleArray(optionIds(s.options))',
    "ensureShuffledOrder(State,'refleksiDiriOrder',DATA.refleksi.diriOpsi)",
  ].forEach((pola) => assert.ok(APP.includes(pola), 'app.js harus memuat: ' + pola));
  /* Pengacakan ulang saat reset. */
  assert.ok(APP.includes('functionclearState(){Store.reset();initExerciseArrays();}'));
});
