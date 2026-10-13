'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-7.1/data.js (Pertidaksamaan linear
 * satu variabel, Discovery Learning): setiap kunci sama dengan engine
 * seksi 76 (relasiDariFrasa, kelompokKalimatBatas, nilaiSoalBatas,
 * periksaSoalBatas, jawabSoalBatas, opsiSoalBatas, kalimatSituasiBatas),
 * opsi pilihan cukup & unik agar dapat diacak, tahap mengikuti sintaks
 * Discovery Learning dan sama dengan manifest halaman. app.js juga dicek
 * agar pilihan selalu dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-7.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-7.1', 'app.js'), 'utf8');
const OLAH = ['olahTanda', 'olahSolusi', 'olahPtlsv'];

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

function assertGuided(list, name, min) {
  assert.ok(list.length >= (min || 1), name + ': cukup pertanyaan');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((q) => {
    assert.ok(q.tanya, q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.correct), q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], q.id + '.' + o.id + ': umpan'));
  });
}

function assertHead(S, name) {
  ['kicker', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

/* Langkah { cek }: jawaban baku diterima pemeriksa & disebut di temuan. */
function assertLangkah(list, name) {
  assert.ok(list.length >= 2, name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.ok(s.label && s.temuan && s.placeholder, n + ': label, temuan, placeholder');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, n + ': petunjuk');
    assert.ok(['kalimat', 'himpunan', 'banyak'].includes(s.cek.minta), n + ': langkah isian');
    if (s.cek.minta === 'kalimat') {
      assert.ok(
        ['plsv', 'ptlsv'].includes(E.jenisKalimatBatas(s.cek.kalimat)),
        n + ': model PLSV/PtLSV'
      );
    }
    const jawab = E.jawabSoalBatas(s);
    assert.equal(E.periksaSoalBatas(jawab, s).benar, true, n + ': jawaban baku diterima');
    assert.ok(s.temuan.includes(jawab), n + ': temuan memuat ' + jawab);
  });
}

test('sebelas tahap Discovery Learning: konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-7.1'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Discovery Learning/);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.equal(D.tahap.length, 11);
  assert.equal(new Set(ids(D.tahap)).size, 11);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
    assert.match(APP, new RegExp('\\b' + t.id + ': render'), t.id + ': ada renderer');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
  const sintaks = {
    stimulasi: 1,
    masalah: 2,
    koleksi: 3,
    olahTanda: 4,
    olahSolusi: 4,
    olahPtlsv: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Discovery Learning · Sintaks ' + n, id);
  });
  const html = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-7.1', 'index.html'), 'utf8');
  assert.match(html, /<title>\s*Pertidaksamaan Linear Satu Variabel/);
  assert.match(html, /0 dari 11 tahap selesai/);
});

test('stimulasi: TP, kartu situasi = Lab Batas, dugaan sesuai engine', () => {
  const S = D.stimulasi;
  assert.match(S.tp, /pertidaksamaan linear satu variabel/);
  assert.match(S.tp, /persamaan linear satu variabel/);
  assert.match(S.tp, /batasan nilai/);
  assert.ok(S.tpJudul && S.kriteria.length >= 4);
  const lab = D.koleksi.lab.situasi;
  S.kartu
    .filter((k) => k.neraca)
    .forEach((k) => {
      const sama = lab.find(
        (s) =>
          JSON.stringify(s.kiri) === JSON.stringify(k.neraca.kiri) &&
          s.kanan.lepas === k.neraca.kanan.lepas
      );
      assert.ok(sama, k.id + ': neraca kartu = salah satu situasi Lab Batas');
      assert.ok(Number.isInteger(k.x) && k.caption, k.id + ': nilai contoh & keterangan');
    });
  const papan = S.kartu.find((k) => k.kalimat);
  assert.ok(papan && papan.kalimat.length >= 3, 'kartu pengumuman');
  papan.kalimat.forEach((t) => assert.ok(E.relasiDariFrasa(t), t + ': memuat kata batasan'));
  assert.ok(S.dugaan.length >= 3);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    const v = E.nilaiSoalBatas(q.cek);
    if (q.cek.minta === 'tanda') assert.equal(q.baku, v, q.id + ': baku = engine');
    if (q.cek.minta === 'banyak') assert.equal(v, 1, q.id + ': situasi tepat → satu nilai');
    if (q.cek.minta === 'himpunan') {
      const label = q.opsi.find((o) => o.id === q.baku).label;
      v.forEach((n) => assert.ok(label.includes(String(n)), q.id + ': label baku memuat ' + n));
    }
  });
});

test('masalah: pertanyaan inti dengan umpan untuk setiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], o.id + ': umpan'));
  assert.ok(M.hipotesisLabel && M.hipotesisPlaceholder);
});

test('koleksi: Lab Batas memuat situasi tepat & ketiga jenis batasan', () => {
  const L = D.koleksi.lab;
  assert.equal(L.huruf, 'x');
  assert.ok(L.min >= 1 && L.max > L.min && L.minUji >= 2);
  assert.ok(L.situasi.length >= 4);
  assert.equal(new Set(ids(L.situasi)).size, L.situasi.length);
  L.situasi.forEach((s) => {
    assert.ok(s.judul && s.cerita && s.frasa, s.id + ': teks');
    assert.equal(E.relasiDariFrasa(s.frasa), s.rel, s.id + ': frasa → tanda');
    assert.ok(s.cerita.toLowerCase().includes(s.frasa), s.id + ': cerita memuat frasa');
    const kal = E.kalimatSituasiBatas(L, s);
    const jenis = E.jenisKalimatBatas(kal);
    assert.equal(jenis, s.rel === '=' ? 'plsv' : 'ptlsv', s.id + ': ' + kal);
    const hp = E.penyelesaianBulatKalimat(kal, L.min, L.max);
    if (s.rel === '=') assert.equal(hp.length, 1, s.id + ': tepat satu nilai');
    else {
      assert.ok(hp.length >= 2, s.id + ': banyak nilai');
      assert.ok(hp.length < L.max - L.min + 1, s.id + ': ada nilai yang tidak memenuhi');
    }
    [s.kiri, s.kanan].forEach((m) =>
      Object.values(m).forEach((v) =>
        assert.ok(s.cerita.includes(String(v)), s.id + ': cerita memuat ' + v)
      )
    );
    const benda = (m) => (m.x || 0) + (m.lepas || 0);
    assert.ok(benda(s.kiri) <= 15 && benda(s.kanan) <= 15, s.id + ': muat di piring');
  });
  ['=', '≤', '<', '≥'].forEach((r) =>
    assert.ok(
      L.situasi.some((s) => s.rel === r),
      'ada situasi ' + r
    )
  );
  /* nilai batas diuji: ≤ memuat batasnya, < tidak */
  const batas = (rel) => {
    const s = L.situasi.find((x) => x.rel === rel);
    return E.bentukPenyelesaianBatas(E.kalimatSituasiBatas(L, s)).batas;
  };
  assert.ok(Number.isInteger(batas('≤')) && Number.isInteger(batas('<')));
  assert.ok(D.koleksi.tips.length >= 2);
  assert.ok(D.koleksi.selesaiTeks && D.koleksi.nextLabel);
});

test('olah data: temuan, pemilahan & langkah konsisten dengan engine', () => {
  OLAH.forEach((id) => {
    const O = D[id];
    assert.ok(O.judul && O.pengantar && O.ringkasan && O.nextLabel, id + ': teks');
    assertGuided(O.temuan, id + '.temuan', 3);
    assertLangkah(O.langkah, id + '.langkah');
    const P = O.pilah;
    assertOptions(P.kategori, id + '.kategori', 2);
    assert.ok(P.butir.length >= 5, id + ': cukup butir pilah');
    assert.equal(new Set(ids(P.butir)).size, P.butir.length);
    P.butir.forEach((b) => {
      assert.ok(b.explanation, b.id + ': penjelasan');
      let kunci;
      if (P.skema === 'tanda') kunci = E.idRelasiFrasa(b.frasa);
      else if (P.skema === 'memenuhi') {
        kunci = E.nilaiSoalBatas({ kalimat: b.kalimat, nilai: b.nilai, minta: 'memenuhi' });
      } else kunci = E.kelompokKalimatBatas(b.kalimat, P.skema);
      assert.equal(kunci, b.correct, b.id + ': kunci = engine');
    });
    ids(P.kategori).forEach((k) =>
      assert.ok(
        P.butir.some((b) => b.correct === k),
        id + ': ada contoh ' + k
      )
    );
  });
  assert.equal(D.olahTanda.pilah.skema, 'tanda');
  assert.equal(D.olahSolusi.pilah.skema, 'memenuhi');
  assert.equal(D.olahPtlsv.pilah.skema, 'ptlsv');
  const semua = OLAH.flatMap((id) => ids(D[id].pilah.butir));
  assert.equal(new Set(semua).size, semua.length, 'id butir pilah unik antar tahap');
  /* olahSolusi: kasus batas termasuk & tidak termasuk */
  const ps = D.olahSolusi.pilah.butir.map((b) => ({
    b,
    batas: E.bentukPenyelesaianBatas(b.kalimat),
  }));
  assert.ok(ps.some((x) => x.batas.batas === x.b.nilai && x.b.correct === 'ya'));
  assert.ok(ps.some((x) => x.batas.batas === x.b.nilai && x.b.correct === 'tidak'));
  /* langkah olahSolusi membandingkan persamaan vs pertidaksamaan */
  const jenisLangkah = D.olahSolusi.langkah.map((s) => E.jenisKalimatBatas(s.cek.kalimat));
  assert.ok(jenisLangkah.includes('plsv') && jenisLangkah.includes('ptlsv'));
  D.olahSolusi.kartu.forEach((k) => assert.ok(E.bentukPenyelesaianBatas(k.kalimat), k.kalimat));
  assert.ok(D.olahPtlsv.kartu.length >= 2);
  const jk = Array.from(D.olahPtlsv.kartu, (k) => E.jenisKalimatBatas(k.kalimat));
  assert.deepEqual(jk.sort(), ['plsv', 'ptlsv']);
});

test('verifikasi: jenis kalimat sesuai engine, contoh baru, & pernyataan lengkap', () => {
  const V = D.verifikasi;
  assert.deepEqual(ids(V.kategori), ['plsv', 'ptlsv', 'bukanKeduanya']);
  assert.ok(V.bagian.length >= 8);
  assert.equal(new Set(ids(V.bagian)).size, V.bagian.length);
  V.bagian.forEach((b) => {
    assert.ok(b.explanation, b.id + ': penjelasan');
    assert.equal(
      E.kelompokKalimatBatas(b.kalimat, 'persamaanAtau'),
      b.correct,
      b.id + ': kunci = engine'
    );
  });
  ids(V.kategori).forEach((k) =>
    assert.ok(
      V.bagian.some((b) => b.correct === k),
      'ada contoh ' + k
    )
  );
  /* bukan keduanya: dua variabel, pangkat dua, pernyataan, dan ≠ */
  const alasan = new Set(
    V.bagian
      .filter((b) => b.correct === 'bukanKeduanya')
      .map((b) => E.jenisKalimatBatas(b.kalimat) + ':' + E.kelompokKalimatBatas(b.kalimat, 'ptlsv'))
  );
  assert.ok(alasan.size >= 3, 'alasan bukan keduanya bervariasi');
  /* kalimat verifikasi BARU */
  const lama = ['olahPtlsv']
    .flatMap((id) => D[id].pilah.butir.map((b) => E.rapikanKalimatMtk(b.kalimat)))
    .concat(D.koleksi.lab.situasi.map((s) => E.kalimatSituasiBatas(D.koleksi.lab, s)));
  V.bagian.forEach((b) => assert.ok(!lama.includes(E.rapikanKalimatMtk(b.kalimat)), b.id));
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 3);
  assert.ok(V.pernyataan.length >= 5);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id + ': correct ada di opsi');
    assert.ok(p.teks && p.explanation, p.id);
  });
  ids(V.opsiPernyataan).forEach((k) =>
    assert.ok(
      V.pernyataan.some((p) => p.correct === k),
      'ada pernyataan ' + k
    )
  );
  assert.ok(V.judulA && V.judulB && V.judulC && V.pengantarA);
});

test('generalisasi: lima kesimpulan, potongan benar unik & ada pengecoh', () => {
  const G = D.generalisasi;
  assert.equal(G.kalimat.length, 5);
  assertOptions(G.bank, 'bank', 7);
  const benar = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar tidak dipakai ulang');
  benar.forEach((b) => assert.ok(ids(G.bank).includes(b), b + ': ada di bank'));
  assert.ok(G.bank.length - G.kalimat.length >= 2, 'minimal dua pengecoh');
  assert.equal(E.jenisKalimatBatas(G.contoh), 'ptlsv');
  const teks = G.rangkuman.join(' ');
  assert.ok(teks.includes(E.teksPenyelesaianBatas(G.contoh)), 'rangkuman memuat penyelesaian');
  assert.ok(
    teks.includes(E.formatHimpunanBulat(E.penyelesaianBulatKalimat(G.contoh, 1, 8))),
    'rangkuman memuat himpunan'
  );
  assert.ok(teks.includes('PtLSV') && teks.includes('PLSV'));
});

test('uji terap: bank soal, komposisi, kunci & opsi pilihan ganda dari engine', () => {
  const T = D.terapkan;
  assert.equal(T.soal.length, 16);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  assert.equal(T.komposisi.input + T.komposisi.choice, T.banyak);
  Object.keys(T.komposisi).forEach((k) => {
    assert.ok(T.soal.filter((s) => s.type === k).length >= T.komposisi[k] * 2, k + ': bank cukup');
  });
  const minta = new Set();
  T.soal.forEach((s) => {
    const n = 'soal.' + s.id;
    assert.ok(['input', 'choice'].includes(s.type), n + ': type');
    assert.ok(D.konteks[s.konteks], n + ': konteks dikenal');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, n + ': teks');
    minta.add(s.cek.minta);
    if (s.cek.kalimat) assert.ok(E.parseKalimatMtk(s.cek.kalimat), n + ': kalimat terbaca');
    if (s.cek.frasa) {
      assert.ok(E.relasiDariFrasa(s.cek.frasa), n + ': frasa dikenal');
      assert.ok(s.cerita.includes(s.cek.frasa), n + ': cerita memuat frasa');
    }
    const jawab = E.jawabSoalBatas(s);
    if (s.type === 'input') {
      assert.ok(['kalimat', 'himpunan', 'banyak'].includes(s.cek.minta), n + ': isian');
      assert.equal(E.periksaSoalBatas(jawab, s).benar, true, n + ': kunci diterima');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
      assert.ok(s.reveal && s.reveal.includes(jawab), n + ': reveal memuat jawaban');
      assert.ok(s.explanation.includes(jawab), n + ': penjelasan memuat ' + jawab);
    } else {
      const opsi = E.opsiSoalBatas(s);
      assert.ok(opsi.length >= 3, n + ': minimal 3 opsi');
      assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, n + ': label unik');
      assert.equal(new Set(opsi.map((o) => o.id)).size, opsi.length, n + ': id unik');
      opsi.forEach((o) => assert.ok(o.umpan, n + '.' + o.id + ': umpan'));
      if (['kalimat', 'himpunan'].includes(s.cek.minta)) {
        assert.ok(s.explanation.includes(jawab), n + ': penjelasan memuat ' + jawab);
      }
    }
  });
  ['kalimat', 'himpunan', 'banyak', 'jenisBatas', 'tanda'].forEach((m) =>
    assert.ok(minta.has(m), 'ada soal ' + m)
  );
  Object.keys(D.konteks).forEach((k) =>
    assert.ok(
      T.soal.some((s) => s.konteks === k),
      'ada konteks ' + k
    )
  );
  /* jenis pada pilihan ganda mencakup ketiga kategori */
  const jenis = new Set(
    T.soal.filter((s) => s.cek.minta === 'jenisBatas').map((s) => E.nilaiSoalBatas(s.cek))
  );
  ['plsv', 'ptlsv', 'bukanKeduanya'].forEach((j) => assert.ok(jenis.has(j), 'ada soal ' + j));
  /* soal menulis kalimat mencakup ≤, <, ≥, >, dan = */
  const rel = new Set(
    T.soal.filter((s) => s.cek.minta === 'kalimat').map((s) => E.parseKalimatMtk(s.cek.kalimat).rel)
  );
  ['≤', '<', '≥', '>', '='].forEach((r) => assert.ok(rel.has(r), 'ada kalimat ' + r));
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.ok(S.judul && S.teks && S.capaian.length >= 4);
  assert.ok(S.contoh.length >= 3);
  S.contoh.forEach((c) =>
    assert.ok(D.namaJenis[E.kelompokKalimatBatas(c.kalimat, 'persamaanAtau')], c.kalimat)
  );
  assert.ok(Array.isArray(S.semesta) && S.semesta.length === 2);
});

test('app.js: semua pilihan diacak sekali & disimpan di state', () => {
  ['ensureShuffledOrder', 'ensureSortStates', 'shuffleArray', 'opsiSoalBatas'].forEach((f) =>
    assert.match(APP, new RegExp('\\b' + f + '\\('), f + ' dipakai')
  );
  [
    'dugaanOrders',
    'masalahOrder',
    'temuanOrders',
    'pilahOlah',
    'bagianOrder',
    'pernyataanOrder',
    'bankOrder',
    'refleksiDiriOrder',
    'optionOrder',
  ].forEach((k) => assert.match(APP, new RegExp('\\b' + k + '\\b'), k + ' tersimpan'));
  assert.match(APP, /STORAGE_KEY = 'mpi-d-7-1-/);
  /* langkah isian & uji terap memakai pemeriksa seksi 76; lab memakai Lab Batas */
  assert.match(APP, /periksaSoalBatas/);
  assert.match(APP, /buildLabBatas\(/);
  assert.match(APP, /buildGarisBatas\(/);
});
