'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-15.1/data.js (fungsi linear & non-
 * linear dari pola perubahan nilai, Discovery Learning): setiap tahap
 * punya kepala DL; setiap daftar pilihan cukup opsi untuk diacak dengan
 * id & label unik dan umpan balik tiap opsi; setiap tabel { xs, aturan }
 * atau { xs, ys } sah; jenis fungsi, nilai kunci, dan teks yang memuat
 * angka dihitung ulang dengan fungsi seksi 82 shared/engine.js.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-15.1/data.js']);
const D = E.DATA;

function ids(list) {
  return list.map((o) => o.id);
}

/* Nilai y sebuah tabel: dari aturan, atau ys apa adanya. */
function ysDari(t) {
  return t.aturan ? Array.from(E.tabelAturanFungsi(t.aturan, t.xs)) : t.ys;
}

function jenisDari(t) {
  return E.jenisPolaFungsi(t.xs, ysDari(t));
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

/* Tabel { xs, aturan | ys, labelX, labelY } yang sah & menaik pada x. */
function assertTabel(t, name) {
  assert.ok(t.labelX && t.labelY, name + ': label sumbu');
  assert.ok(t.xs.length >= 3, name + ': minimal 3 baris');
  assert.ok(!!t.aturan !== !!t.ys, name + ': tepat salah satu dari aturan / ys');
  for (let i = 1; i < t.xs.length; i++) assert.ok(t.xs[i] > t.xs[i - 1], name + ': x menaik');
  const ys = ysDari(t);
  assert.equal(ys.length, t.xs.length, name + ': banyak y = banyak x');
  ys.forEach((y) => assert.ok(Number.isFinite(y), name + ': y bilangan'));
}

/* 'Parkir' | 'Parkir dan Saldo' | 'a, b dan c' */
function gabung(list) {
  if (list.length <= 1) return list.join('');
  return list.slice(0, -1).join(', ') + ' dan ' + list[list.length - 1];
}

test('setiap tahap punya kepala Discovery Learning', () => {
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
    ['kicker', 'goal', 'syntax', 'guru'].forEach((f) => assert.ok(D[k][f], k + '.' + f));
  });
  ['stimulasi', 'masalah', 'kumpul', 'olah', 'verifikasi', 'generalisasi'].forEach((k, i) =>
    assert.match(D[k].syntax, new RegExp('Discovery Learning · Sintaks ' + (i + 1)))
  );
  assert.equal(D.stimulasi.tpJudul, 'Tujuan belajar hari ini');
  assert.match(D.stimulasi.tp, /ciri fungsi linear dan non linear/);
  assert.match(D.stimulasi.tp, /pola perubahan nilai pada tabel dan situasi kontekstual/);
});

test('stimulasi: kartu parkir & spanduk cocok dengan tabel kumpul, dugaan acak-able', () => {
  const S = D.stimulasi;
  assertOptions(S.opsi, 'stimulasi.opsi');
  assert.ok(ids(S.opsi).includes(D.verifikasi.dugaanBenar), 'dugaanBenar ada di opsi');
  assert.equal(S.kartu.length, 2);
  const [parkir, spanduk] = D.kumpul.situasi;
  ysDari(parkir)
    .slice(0, 4)
    .forEach((y) => assert.ok(S.kartu[0].teks.includes('Rp' + E.formatNumber(y)), 'parkir ' + y));
  ysDari(spanduk)
    .slice(0, 4)
    .forEach((y) => assert.ok(S.kartu[1].teks.includes(y + ' m²'), 'spanduk ' + y));
  assert.ok(S.catatan && S.nextLabel);
});

test('masalah: pertanyaan inti dengan umpan tiap opsi', () => {
  assertGuided(D.masalah, 'masalah');
  assert.ok(D.masalah.hipotesisLabel && D.masalah.hipotesisPlaceholder);
});

test('kumpul: empat situasi bilangan bulat, dua linear & dua non-linear', () => {
  const K = D.kumpul.situasi;
  assert.equal(K.length, 4);
  assert.equal(new Set(ids(K)).size, 4);
  K.forEach((s) => {
    const nm = 'kumpul.' + s.id;
    assertTabel(s, nm);
    assert.ok(s.nama && s.judul && s.cerita && s.temuan && s.hints.length, nm + ': teks');
    ysDari(s).forEach((y) => assert.ok(Number.isInteger(y), nm + ': y bulat (isian murid)'));
    assert.ok(E.dxSeragam(s.xs), nm + ': Δx seragam pada tahap data');
    assert.ok(s.kosong.length >= 1, nm + ': ada sel kosong');
    s.kosong.forEach((i) => assert.ok(i > 0 && i < s.xs.length, nm + ': indeks kosong sah'));
  });
  const jenis = K.map(jenisDari);
  assert.equal(jenis.filter((j) => j === 'linear').length, 2);
  assert.ok(
    K.some((s) => jenisDari(s) === 'linear' && E.arahPolaFungsi(s.xs, ysDari(s)) === 'turun'),
    'ada linear turun'
  );
  assert.ok(
    K.filter((s) => jenisDari(s) === 'nonlinear').every(
      (s) => E.arahPolaFungsi(s.xs, ysDari(s)) === 'naik'
    ),
    'non-linear pada tahap data selalu naik (memancing miskonsepsi)'
  );
});

test('kumpul: temuan menyebut Δy yang sebenarnya', () => {
  D.kumpul.situasi.forEach((s) => {
    const dy = E.lajuPerubahan(s.xs, ysDari(s)).map((p) => p.dy);
    if (jenisDari(s) === 'linear') {
      assert.ok(s.temuan.includes(E.formatNumber(Math.abs(dy[0]))), s.id + ': Δy di temuan');
    } else {
      assert.ok(s.temuan.includes(dy.join(', ')), s.id + ': daftar Δy di temuan');
    }
  });
});

test('olah: data ojek linear dengan Δx tak seragam dan Δy berbeda-beda', () => {
  const O = D.olah.ojek;
  assertTabel(O, 'olah.ojek');
  assert.equal(jenisDari(O), 'linear');
  assert.ok(!E.dxSeragam(O.xs), 'Δx tak seragam');
  const l = E.lajuPerubahan(O.xs, ysDari(O));
  assert.ok(new Set(l.map((p) => p.dy)).size > 1, 'Δy berbeda-beda');
  const q = D.olah.pertanyaan.find((p) => p.id === 'lompat');
  assert.ok(
    q.tanya.includes(
      l
        .map((p) => E.formatNumber(p.dy))
        .join(', ')
        .replace(/, (?=[^,]*$)/, ', dan ')
    )
  );
  const benar = q.opsi.find((o) => o.id === q.correct).label;
  assert.ok(benar.includes(E.formatNumber(l[0].laju)), 'laju ojek di kunci');
});

test('olah: pertanyaan penuntun berumpan, kunci "linear" dihitung ulang', () => {
  const O = D.olah;
  assert.ok(O.pertanyaan.length >= 5);
  O.pertanyaan.forEach((q) => assertGuided(q, 'olah.' + q.id));
  const q = O.pertanyaan.find((p) => p.cek && p.cek.jenis === 'linear');
  const kunci = gabung(
    D.kumpul.situasi.filter((s) => jenisDari(s) === 'linear').map((s) => s.nama)
  );
  assert.equal(q.opsi.find((o) => o.id === q.correct).label, kunci);
  assert.ok(O.istilah.length >= 3);
  O.istilah.forEach((t) => assert.ok(t.label && t.teks));
});

test('verifikasi: misi lab, dugaan benar, dan pilah berkunci hasil hitung', () => {
  const V = D.verifikasi;
  assert.equal(V.misi.length, 3);
  assert.ok(V.kesimpulan && V.judulA && V.judulB && V.judulC && V.instruksiC);
  assertOptions(V.opsiPilah, 'verifikasi.opsiPilah', 2);
  assert.equal(ids(V.opsiPilah).sort().join(), 'linear,nonlinear');
  assert.ok(V.pilah.length >= 6);
  assert.equal(new Set(ids(V.pilah)).size, V.pilah.length);
  V.pilah.forEach((p) => {
    const nm = 'pilah.' + p.id;
    assertTabel(p, nm);
    assert.ok(p.teks && p.explanation, nm + ': teks & penjelasan');
    assert.equal(p.correct, jenisDari(p), nm + ': kunci = jenis hasil hitung');
  });
  /* Jebakan miskonsepsi yang wajib ada. */
  const kode = V.pilah.map((p) =>
    E.diagnosaJenisFungsi(p.xs, ysDari(p), p.correct === 'linear' ? 'nonlinear' : 'linear')
  );
  ['abaikanDx', 'tetapDikiraNonlinear', 'naikDikiraLinear', 'turunDikiraLinear'].forEach((k) =>
    assert.ok(kode.includes(k), 'pilah memuat jebakan ' + k)
  );
});

test('generalisasi: setiap kalimat berkunci di bank, ada pengecoh', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  assert.equal(new Set(G.bank.map((b) => b.teks)).size, bank.length);
  G.kalimat.forEach((k) => assert.ok(bank.includes(k.correct), k.id));
  assert.equal(new Set(G.kalimat.map((k) => k.correct)).size, G.kalimat.length);
  assert.ok(bank.length - G.kalimat.length >= 3, 'minimal 3 pengecoh');
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: delapan soal kontekstual beragam tipe dengan kunci teruji', () => {
  const T = D.terapkan;
  assert.ok(T.soal.length >= 8);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  assertOptions(T.opsiJenis, 'terapkan.opsiJenis', 2);
  const tipe = new Set(T.soal.map((s) => s.tipe));
  ['jenis', 'pilih', 'isi'].forEach((t) => assert.ok(tipe.has(t), 'tipe ' + t));
  T.soal.forEach((s) => {
    const nm = 'terapkan.' + s.id;
    assert.ok(s.cerita && s.tanya && s.hints.length && s.pembahasan, nm + ': teks');
    if (s.xs) assertTabel(s, nm);
    if (s.tipe === 'pilih') {
      assertGuided(s, nm);
      if (s.xs) {
        const label = s.opsi.find((o) => o.id === s.correct).label;
        const harap = jenisDari(s) === 'linear' ? /^Fungsi linear/ : /^Fungsi non-linear/;
        assert.match(label, harap, nm + ': kunci sesuai jenis hasil hitung');
      }
    }
    if (s.tipe === 'isi') {
      const ys = ysDari(s);
      const kunci = E.nilaiAturanFungsi(s.aturan, s.xTanya);
      assert.ok(s.pembahasan.includes('Rp' + E.formatNumber(kunci)), nm + ': kunci di pembahasan');
      const n = ys.length;
      assert.equal(s.jebakan.nilai, ys[n - 1] + (ys[n - 1] - ys[n - 2]), nm + ': jebakan');
      assert.notEqual(s.jebakan.nilai, kunci);
      assert.ok(!s.xs.includes(s.xTanya), nm + ': x yang ditanya tidak ada di tabel');
    }
  });
  const jenis = T.soal.filter((s) => s.tipe === 'jenis').map(jenisDari);
  assert.ok(jenis.includes('linear') && jenis.includes('nonlinear'), 'kedua jenis muncul');
});

test('terapkan: soal pilih situasi — hanya kunci yang linear', () => {
  D.terapkan.soal
    .filter((s) => s.tipe === 'pilih' && !s.xs)
    .forEach((s) => {
      s.opsi.forEach((o) => {
        const j = E.jenisPolaFungsi(
          [1, 2, 3, 4, 5],
          E.tabelAturanFungsi(o.aturan, [1, 2, 3, 4, 5])
        );
        assert.equal(j === 'linear', o.id === s.correct, s.id + '.' + o.id);
      });
    });
});

test('refleksi & selesai', () => {
  assert.ok(D.refleksi.pertanyaan.length >= 3);
  assertOptions(D.refleksi.diriOpsi, 'refleksi.diriOpsi');
  assert.ok(D.selesai.judul && D.selesai.capaian.length >= 3);
});
