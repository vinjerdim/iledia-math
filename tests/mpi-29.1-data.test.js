'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-29.1/data.js (Bangun kongruen &
 * sifat-sifatnya): kunci jenis/klasifikasi dan jawaban isian harus cocok
 * dengan hasil engine (klasifikasiBangun, cariPosisiBerimpit,
 * cariKorespondensi), dan setiap daftar pilihan punya id unik serta
 * cukup opsi untuk diacak.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-29.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + '.' + o.id + ': label'));
}

function assertGuided(list, name) {
  assert.ok(list.length >= 2, name + ': minimal dua pertanyaan');
  list.forEach((q) => {
    assert.ok(q.tanya, name + '.' + q.id + ': tanya');
    assertOptions(q.opsi, name + '.' + q.id);
    assert.ok(ids(q.opsi).includes(q.correct), name + '.' + q.id + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + '.' + q.id + ': umpan untuk ' + o.id));
  });
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertBangun(b, name) {
  assert.ok(Array.isArray(b.pts) && b.pts.length >= 3, name + ': minimal 3 titik');
  assert.equal(b.titik.length, b.pts.length, name + ': satu nama per titik');
  assert.equal(new Set(b.titik).size, b.titik.length, name + ': nama titik unik');
  E.sudutPoligon(b.pts).forEach((a) => assert.ok(a < 180, name + ': bangun cembung'));
}

/* Papan jiplak: jenis tiap calon cocok dengan engine & dapat dibuktikan. */
function assertPapanJiplak(P, name) {
  assertBangun(P.asal, name + '.asal');
  assert.equal(new Set(ids(P.calon)).size, P.calon.length, name + ': id calon unik');
  P.calon.forEach((c) => {
    const nm = name + '.' + c.id;
    assertBangun(c, nm);
    assert.ok(c.nama && c.temuan, nm + ': nama & temuan');
    assert.equal(E.klasifikasiBangun(P.asal.pts, c.pts), c.jenis, nm + ': jenis = engine');
    const pos = E.cariPosisiBerimpit(P.asal.pts, c.pts, P.langkah || 90);
    if (c.jenis === 'kongruen') assert.ok(pos, nm + ': bisa berimpit dengan putar/balik tersedia');
    else assert.equal(pos, null, nm + ': tidak boleh bisa berimpit');
  });
  const jenis = P.calon.map((c) => c.jenis);
  ['kongruen', 'sebangun', 'tidak'].forEach((j) =>
    assert.ok(jenis.includes(j), name + ': ada calon ' + j)
  );
  ['kongruen', 'sebangun', 'tidak'].forEach((j) =>
    assert.ok(P.umpanSalah[j], name + ': umpanSalah ' + j)
  );
}

test('setiap tahap punya kepala tahap, sintaks DL & catatan guru', () => {
  [
    'stimulasi',
    'masalah',
    'jiplak',
    'ukur',
    'olah',
    'verifikasi',
    'generalisasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k], 'DATA.' + k);
    ['kicker', 'syntax', 'goal', 'guru', 'nextLabel'].forEach((f) =>
      assert.ok(D[k][f], 'DATA.' + k + '.' + f)
    );
  });
  assert.match(D.stimulasi.syntax, /Sintaks 1/);
  assert.match(D.masalah.syntax, /Sintaks 2/);
  assert.match(D.jiplak.syntax, /Sintaks 3/);
  assert.match(D.ukur.syntax, /Sintaks 3/);
  assert.match(D.olah.syntax, /Sintaks 4/);
  assert.match(D.verifikasi.syntax, /Sintaks 5/);
  assert.match(D.generalisasi.syntax, /Sintaks 6/);
});

test('stimulasi & masalah: dugaan dan rumusan masalah', () => {
  const S = D.stimulasi;
  assertOptions(S.opsi, 'stimulasi.opsi');
  assert.equal(S.calon.length, 4);
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah.opsi');
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
  assert.ok(M.hipotesisLabel && M.hipotesisPlaceholder);
});

test('jiplak: ubin kongruen (diputar & dibalik), sebangun, dan beda bentuk', () => {
  const J = D.jiplak;
  assertPapanJiplak(J, 'jiplak');
  assertOptions(J.opsiHasil, 'jiplak.opsiHasil');
  assert.deepEqual(Array.from(ids(J.opsiHasil)).sort(), ['kongruen', 'sebangun', 'tidak']);
  const posisi = J.calon
    .filter((c) => c.jenis === 'kongruen')
    .map((c) => E.cariPosisiBerimpit(J.asal.pts, c.pts, J.langkah));
  assert.ok(
    posisi.some((p) => !p.cermin && p.rotasi !== 0),
    'ada ubin yang cukup diputar'
  );
  assert.ok(
    posisi.some((p) => p.cermin),
    'ada ubin yang harus dibalik'
  );
  /* ubin beda bentuk sengaja dibuat berluas sama */
  const tidak = J.calon.find((c) => c.jenis === 'tidak');
  assert.equal(
    Math.abs(E.luasBertanda(tidak.pts)),
    Math.abs(E.luasBertanda(J.asal.pts)),
    'luas TUVW = luas ABCD'
  );
  /* stimulasi memakai ubin yang sama */
  assert.equal(D.stimulasi.asal, J.asal);
  assert.equal(D.stimulasi.calon, J.calon);
});

test('ukur & olah: korespondensi ABCD ↔ KLMN dan faktor skala EFGH', () => {
  const J = D.jiplak;
  const klmn = J.calon.find((c) => c.id === 'klmn');
  const efgh = J.calon.find((c) => c.id === 'efgh');
  const k = E.cariKorespondensi(J.asal.pts, klmn.pts, { kongruen: true });
  assert.ok(k);
  const ks = E.cariKorespondensi(J.asal.pts, efgh.pts);
  assert.deepEqual(Array.from(ks.map), [0, 1, 2, 3], 'E, F, G, H bersesuaian dengan A, B, C, D');
  assert.ok(Math.abs(ks.skala - 1.5) < 1e-9);
  ['instruksiUkurA', 'instruksiPasang', 'temuanA', 'instruksiUkurB', 'temuanB'].forEach((f) =>
    assert.ok(D.ukur[f], 'ukur.' + f)
  );

  const O = D.olah;
  assertGuided(O.konsep, 'olah.konsep');
  const qn = O.konsep.find((q) => q.kunciNotasi);
  assert.ok(qn, 'ada pertanyaan notasi');
  const cal = J.calon.find((c) => c.id === qn.kunciNotasi);
  const kn = E.cariKorespondensi(J.asal.pts, cal.pts, { kongruen: true });
  assert.equal(
    qn.opsi.find((o) => o.id === qn.correct).label,
    E.notasiBersesuaian(J.asal, cal, kn.map, '≅'),
    'kunci notasi mengikuti titik bersesuaian'
  );
});

test('olah: pemilahan pasangan bangun cocok dengan engine', () => {
  const O = D.olah;
  assertOptions(O.opsiKlas, 'olah.opsiKlas');
  assert.ok(O.pasangan.length >= 6);
  assert.equal(new Set(ids(O.pasangan)).size, O.pasangan.length);
  O.pasangan.forEach((it) => {
    assertBangun(it.p, it.id + '.p');
    assertBangun(it.q, it.id + '.q');
    assert.ok(ids(O.opsiKlas).includes(it.correct));
    assert.equal(E.klasifikasiBangun(it.p.pts, it.q.pts), it.correct, it.id + ': kunci = engine');
    assert.ok(it.explanation);
  });
  const hitung = {};
  O.pasangan.forEach((it) => (hitung[it.correct] = (hitung[it.correct] || 0) + 1));
  ids(O.opsiKlas).forEach((id) => assert.ok(hitung[id] >= 2, 'minimal dua pasangan ' + id));
});

test('verifikasi: segitiga uji & tanggapan miskonsepsi', () => {
  const V = D.verifikasi;
  assertPapanJiplak(V, 'verifikasi');
  ids(D.stimulasi.opsi).forEach((id) =>
    assert.ok(V.kesimpulanDugaan[id], 'kesimpulan untuk dugaan ' + id)
  );
  assert.ok(V.soal.length >= 4);
  assert.equal(new Set(ids(V.soal)).size, V.soal.length);
  V.soal.forEach((q) => {
    assertOptions(q.options, 'verifikasi.' + q.id);
    assert.ok(ids(q.options).includes(q.correct));
    assert.ok(q.pernyataan && q.explanation);
  });
});

test('generalisasi: bank kalimat memuat semua kunci + pengecoh', () => {
  const G = D.generalisasi;
  assertOptions(
    G.bank.map((b) => ({ id: b.id, label: b.teks })),
    'generalisasi.bank'
  );
  assert.ok(G.bank.length > G.kalimat.length, 'ada potongan pengecoh');
  G.kalimat.forEach((k) => assert.ok(ids(G.bank).includes(k.correct), k.id));
  const kunci = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(kunci).size, kunci.length, 'kunci tidak dobel');
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: soal kontekstual yang sah & kunci cocok dengan engine', () => {
  const T = D.terapkan;
  assert.ok(T.soal.length >= 8);
  let isian = 0;
  T.soal.forEach((s, i) => {
    const nm = 'terapkan[' + i + ']';
    assert.ok(['input', 'choice'].includes(s.type), nm + ': tipe');
    ['konteks', 'cerita', 'pertanyaan', 'explanation'].forEach((f) => assert.ok(s[f], nm + f));
    assert.ok(s.hints && s.hints.length, nm + ': petunjuk');
    if (s.visual) {
      assertBangun(s.visual.p, nm + '.p');
      assertBangun(s.visual.q, nm + '.q');
    }
    if (s.type === 'input') {
      isian++;
      assert.ok(s.visual && s.cek, nm + ': soal isian bervisual & punya cek');
      const p = s.visual.p;
      const q = s.visual.q;
      /* titik didaftar sesuai urutan bersesuaian: pemetaan identitas */
      const identitas = p.pts.map((_, k) => k);
      E.barisBersesuaian(p, q, identitas).forEach((r) =>
        assert.ok(Math.abs(r.nilaiP - r.nilaiQ) < 0.01, nm + ': ' + r.namaP + ' = ' + r.namaQ)
      );
      let kunci;
      if (s.cek.jenis === 'sisi') kunci = E.sisiPoligon(q.pts)[s.cek.idx];
      else if (s.cek.jenis === 'sudut') kunci = E.sudutPoligon(q.pts)[s.cek.idx];
      else kunci = E.kelilingPoligon(q.pts);
      assert.ok(Math.abs(kunci - s.jawab) < 0.01, nm + ': jawab = ' + kunci);
      assert.ok(s.satuan, nm + ': satuan');
    } else {
      assertOptions(s.options, nm);
      assert.ok(ids(s.options).includes(s.correct), nm + ': correct ada di opsi');
      const label = s.options.map((o) => o.label);
      assert.equal(new Set(label).size, label.length, nm + ': label opsi unik');
      if (s.klasifikasi) {
        assert.equal(E.klasifikasiBangun(s.visual.p.pts, s.visual.q.pts), s.klasifikasi, nm);
      }
    }
  });
  assert.ok(isian >= 2, 'ada soal isian');
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  R.pertanyaan.forEach((q) => assert.ok(q.id && q.teks && q.placeholder));
  assertOptions(R.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.selesai.judul && D.selesai.teks && D.selesai.capaian.length >= 3);
});
