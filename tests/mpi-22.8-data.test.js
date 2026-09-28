'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-22.8/data.js (masalah kontekstual
 * luas permukaan limas, Problem Based Learning): setiap tahap punya
 * kepala PBL, setiap daftar pilihan punya id & label unik dan cukup opsi
 * untuk diacak, setiap opsi pertanyaan penuntun punya umpan balik, dan
 * semua kunci (tₛ & luas atap tiga desain, sisi bahan, luas kain &
 * karton, banyak lembar, konversi, anggaran, keputusan lantai tenda,
 * soal uji terap) dihitung ulang dengan engine seksi 57–58.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-22.8/data.js']);
const D = E.DATA;

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function dekat(a, b) {
  return Math.abs(a - b) < 1e-4;
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list), name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  assert.equal(
    new Set(list.map((o) => o.label || o.teks)).size,
    list.length,
    name + ': label opsi harus unik'
  );
}

function assertGuided(list, name) {
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
  list.forEach((q) => {
    const nm = name + '.' + q.id;
    assert.ok(q.tanya, nm + '.tanya');
    assertOptions(q.opsi, nm + '.opsi', 4);
    assert.ok(ids(q.opsi).includes(q.correct), nm + ': correct ada di opsi');
    q.opsi.forEach((o) => assert.ok(q.umpan[o.id], nm + ': umpan untuk ' + o.id));
  });
}

function assertSort(items, opsi, name) {
  assertOptions(opsi, name + '.opsi', 2);
  assert.equal(new Set(ids(items)).size, items.length, name + ': id unik');
  items.forEach((it) => {
    assert.ok(ids(opsi).includes(it.correct), name + '.' + it.id);
    assert.ok(it.teks && it.explanation, name + '.' + it.id);
  });
  ids(opsi).forEach((o) =>
    assert.ok(
      items.some((it) => it.correct === o),
      name + ': kategori ' + o + ' terpakai'
    )
  );
}

function benda(id) {
  const b = D.benda.find((x) => x.id === id);
  assert.ok(b, 'benda ' + id);
  return b;
}

function luasBahan(b) {
  return E.luasSisiDipakaiLimas(b, b.dipakai);
}

test('setiap tahap punya kepala PBL', () => {
  [
    'orientasi',
    'organisasi',
    'selidikAtap',
    'selidikSisi',
    'selidikBiaya',
    'karya',
    'evaluasi',
    'terapkan',
    'refleksi',
  ].forEach((k) => {
    assert.ok(D[k].kicker, k + '.kicker');
    assert.ok(D[k].goal, k + '.goal');
    assert.match(D[k].syntax, /Problem Based Learning/, k + '.syntax');
    assert.ok(D[k].guru, k + '.guru');
    assert.ok(D[k].nextLabel, k + '.nextLabel');
  });
});

test('tujuan pembelajaran: masalah kontekstual luas permukaan limas', () => {
  assert.match(D.orientasi.tp, /masalah kontekstual/i);
  assert.match(D.orientasi.tp, /luas permukaan limas/i);
  assert.ok(D.orientasi.kriteria.length >= 3);
});

test('atap: tripel Pythagoras, luas & lembar tiga desain, B satu-satunya pilihan', () => {
  const A = D.atap;
  assert.deepEqual(ids(A.desain), ['A', 'B', 'C']);
  const harap = {
    A: { ts: 2.5, luas: 20, lembar: 14 },
    B: { ts: 2.9, luas: 23.2, lembar: 16 },
    C: { ts: 5.2, luas: 41.6, lembar: 28 },
  };
  A.desain.forEach((d) => {
    const u = E.lmkUkuranAtap(A, d.t);
    assert.ok(dekat(u.ts, harap[d.id].ts), d.id + ' tₛ');
    assert.ok(dekat(u.luas, harap[d.id].luas), d.id + ' luas');
    assert.equal(u.lembar, harap[d.id].lembar, d.id + ' lembar');
    assert.ok(d.nama && d.gaya, d.id + ' nama & gaya');
  });
  assert.ok(A.desain[0].t >= A.min && A.desain[2].t <= A.max);
  /* kotak di slider: setiap desain tepat berada pada langkah slider */
  A.desain.forEach((d) => {
    const st = { t: 0, dicoba: [] };
    E.lmkAtapAtur(st, A, d.t);
    assert.ok(dekat(st.t, d.t), d.id + ' pada langkah slider');
  });
  const memenuhi = A.desain.filter((d) => d.t >= A.syaratMin);
  const termurah = memenuhi.reduce((a, b) =>
    E.lmkUkuranAtap(A, a.t).lembar <= E.lmkUkuranAtap(A, b.t).lembar ? a : b
  );
  const k1 = D.selidikAtap.tanya.find((q) => q.id === 'k1');
  assert.equal(k1.correct, termurah.id);
  assert.equal(termurah.id, D.atapDipilih);
  /* dugaan: tinggi naik 40%, luas hanya naik 16% */
  const u = E.lmkUkuranAtap(A, 2.1);
  assert.equal(u.naikTinggi, 40);
  assert.equal(u.naikLuas, 16);
});

test('benda: sisi bahan valid & luas bahan sesuai rancangan', () => {
  const harap = { atap: 23.2, tenda: 3.84, kotak: 144 };
  assert.deepEqual(ids(D.benda), ['atap', 'tenda', 'kotak']);
  D.benda.forEach((b) => {
    const rinci = E.rincianObjekLimas(b);
    const sisiIds = Array.from(rinci, (f) => f.id);
    assert.deepEqual(Object.keys(b.namaSisi).sort(), sisiIds.slice().sort(), b.id + ' namaSisi');
    assert.equal(new Set(Object.values(b.namaSisi)).size, sisiIds.length, b.id + ' nama unik');
    b.dipakai.forEach((id) => assert.ok(sisiIds.includes(id), b.id + ' dipakai ' + id));
    assert.ok(dekat(luasBahan(b), harap[b.id]), b.id + ' luas bahan');
    assert.ok(b.cerita && b.alasan && b.bahan && b.satuanLuas && b.satuan, b.id + ' teks');
  });
  /* atap & tenda tanpa alas, kotak semua sisi */
  assert.ok(!benda('atap').dipakai.includes('alas'));
  assert.ok(!benda('tenda').dipakai.includes('alas'));
  assert.equal(benda('kotak').dipakai.length, 5);
  /* atap di tahap sisi = desain terpilih */
  const dp = D.atap.desain.find((d) => d.id === D.atapDipilih);
  assert.equal(benda('atap').t, dp.t);
  assert.equal(benda('atap').s, D.atap.sisi);
  /* tₛ tenda berbeda pada rusuk panjang & pendek */
  assert.deepEqual(Array.from(E.tinggiSisiLimasPersegiPanjang(1.8, 1, 1.2)), [1.3, 1.5, 1.3, 1.5]);
  assert.equal(E.tinggiSisiTegakLimas(benda('kotak').t, benda('kotak').s / 2), 5);
});

test('anggaran: total Rp831.000, dana cukup; lantai kain membuat dana kurang', () => {
  const lembar = E.banyakWadah(luasBahan(benda('atap')), D.genteng.luas);
  assert.equal(lembar, 16);
  const kain = luasBahan(benda('tenda'));
  const karton = luasBahan(benda('kotak')) * D.banyakSuvenir;
  assert.equal(karton, 4320);
  assert.equal(E.konversiLuas(karton, 'cm²', 'm²'), 0.432);
  const luasLembar = D.karton.panjang * D.karton.lebar;
  const lembarKarton = E.banyakWadah(karton, luasLembar);
  assert.equal(lembarKarton, 3);
  const baris = [
    { biaya: lembar * D.genteng.harga },
    { biaya: E.lppBulat(kain * D.kain.harga) },
    { biaya: lembarKarton * D.karton.harga },
  ];
  assert.deepEqual(
    baris.map((b) => b.biaya),
    [720000, 96000, 15000]
  );
  const r = E.rekapAnggaran(baris, D.dana);
  assert.equal(r.total, 831000);
  assert.ok(r.cukup);
  assert.equal(r.sisa, 19000);

  /* usulan lantai tenda memakai kain */
  const L = D.karya.lantai;
  const t = benda(L.benda);
  const kainLantai = E.luasSisiDipakaiLimas(t, t.dipakai.concat([L.tambah]));
  assert.ok(dekat(kainLantai, 5.64));
  baris[1].biaya = E.lppBulat(kainLantai * D.kain.harga);
  const r2 = E.rekapAnggaran(baris, D.dana);
  assert.equal(r2.total, 876000);
  assert.ok(!r2.cukup);
  assert.equal(r2.sisa, -26000);
  const p1 = D.karya.tanya.find((q) => q.id === 'p1');
  assert.equal(p1.correct, 'kurang');
});

test('orientasi & organisasi: pilihan, pemilahan, rencana', () => {
  const o = D.orientasi;
  assert.ok(o.surat.length >= 4);
  o.surat.forEach((s) => assert.ok(s.judul && s.butir.length));
  o.dugaan.forEach((q) => assertOptions(q.opsi, 'dugaan.' + q.id, 4));
  assertOptions(o.masalahOpsi, 'masalahOpsi', 4);
  assert.ok(ids(o.masalahOpsi).includes(o.masalahCorrect));
  o.masalahOpsi.forEach((x) => assert.ok(o.masalahUmpan[x.id], 'umpan ' + x.id));
  o.dugaan.forEach((q) =>
    q.opsi.forEach((x) =>
      assert.ok(D.evaluasi.tanggapanDugaan[q.id][x.id], 'tanggapan ' + q.id + '.' + x.id)
    )
  );

  const g = D.organisasi;
  assertOptions(g.peran, 'peran', 3);
  assertSort(g.pilah, g.opsiPilah, 'pilah');
  assertOptions(g.rencana, 'rencana', 4);
});

test('pertanyaan penuntun semua tahap valid', () => {
  assertGuided(D.selidikAtap.tanya, 'selidikAtap.tanya');
  assertGuided(D.selidikSisi.tanya, 'selidikSisi.tanya');
  assertGuided(D.selidikBiaya.tanya, 'selidikBiaya.tanya');
  assertGuided(D.karya.tanya, 'karya.tanya');
  assertGuided(D.evaluasi.tanya, 'evaluasi.tanya');
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi', 4);
});

test('evaluasi: langkah Kelompok Merpati benar/keliru sesuai hitungan', () => {
  const ev = D.evaluasi;
  assertSort(ev.langkah, ev.opsiNilai, 'evaluasi.langkah');
  ev.langkah.forEach((l) => {
    assert.ok(l.cek, l.id + ' cek');
    const benar = E.kandidatMasalahLimas(l.cek).benar;
    assert.equal(
      dekat(benar, l.nilai),
      l.correct === 'benar',
      l.id + ': nilai ' + l.nilai + ' vs engine ' + benar
    );
  });
});

test('terapkan: kunci & opsi dihitung ulang engine seksi 58', () => {
  const soal = D.terapkan.soal;
  assert.ok(soal.length >= 8);
  assert.equal(new Set(ids(soal)).size, soal.length);
  const jenis = new Set();
  soal.forEach((s) => {
    assert.ok(s.konteks && s.cerita && s.pertanyaan && s.explanation, s.id);
    assert.ok(s.hints && s.hints.length, s.id + ' hints');
    const c = s.cek;
    jenis.add(c.jenis);
    const k = E.kandidatMasalahLimas(c);
    if (c.sumber) {
      /* ukuran di cek konsisten dengan benda sumbernya */
      const o = c.sumber;
      if (c.jenis === 'lp' || c.jenis === 'biaya') {
        const ts = E.tinggiSisiTegakLimas(o.t, o.s / 2);
        assert.equal(c.tinggiSisi, ts, s.id + ' tₛ');
        assert.equal(c.luasAlas, o.s * o.s, s.id + ' La');
        assert.equal(c.kelilingAlas, 4 * o.s, s.id + ' K');
      }
      if (c.jenis === 'wadah') {
        assert.equal(
          E.luasSisiDipakaiLimas(o, ['alas', 't0', 't1', 't2', 't3']),
          c.luasSatu,
          s.id + ' luas satu'
        );
      }
      if (c.jenis === 'biayaWadah') {
        assert.ok(dekat(E.luasSisiDipakaiLimas(o, o.pakai), c.luas), s.id + ' luas');
      }
    }
    if (s.type === 'input') {
      assert.ok(dekat(k.benar, s.jawab), s.id + ' jawab = engine');
      assert.ok(Number.isInteger(s.jawab), s.id + ' isian bilangan bulat');
      assert.ok(s.satuan, s.id + ' satuan');
    } else {
      assertOptions(s.options, s.id + '.options', 4);
      assert.equal(s.correct, 'benar');
      const opsi = E.opsiMasalahLimas(c, s.satuanOpsi, { awalan: s.awalan });
      s.options.forEach((o) => {
        const e = opsi.find((x) => x.id === o.id);
        assert.ok(e, s.id + ': opsi ' + o.id + ' dari engine');
        assert.equal(o.label, e.label, s.id + ': label ' + o.id);
      });
    }
  });
  ['lp', 'ts', 'wadah', 'konversi', 'biayaWadah', 'tinggiSisi', 'dipakai'].forEach((j) =>
    assert.ok(jenis.has(j), 'jenis soal ' + j)
  );
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  D.refleksi.pertanyaan.forEach((q) => assert.ok(q.id && q.teks && q.placeholder));
  assert.ok(D.selesai.judul && D.selesai.capaian.length >= 3);
});
