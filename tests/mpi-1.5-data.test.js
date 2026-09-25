'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-1.5/data.js (Membaca, menuliskan &
 * membandingkan bilangan desimal dalam kehidupan sehari-hari): kunci
 * jawaban setiap dugaan/situasi/soal harus cocok dengan engine seksi 19,
 * 20, dan 37 (bacaDesimalKoma, bandingkanDesimal, urutkanDesimal,
 * cekCaraBacaDesimal, diagnosaTulisDesimal, opsiCaraBacaDesimal,
 * opsiNotasiDesimal, …), setiap daftar pilihan punya id & label unik dan
 * cukup opsi untuk diacak, serta jumlah tahap sama dengan manifest.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-1.5/data.js']);
const D = E.DATA;

function ids(list) {
  return Array.from(list, (o) => o.id);
}

function assertOptions(list, name, min) {
  assert.ok(Array.isArray(list) || list.length >= 0, name + ' harus array');
  assert.ok(list.length >= (min || 3), name + ' minimal ' + (min || 3) + ' opsi agar bisa diacak');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id opsi harus unik');
  list.forEach((o) => assert.ok(o.label || o.teks, name + '.' + o.id + ': label'));
  const labels = Array.from(list, (o) => o.label || o.teks);
  assert.equal(new Set(labels).size, labels.length, name + ': label opsi harus unik');
}

function assertGuided(q, name) {
  assert.ok(q.tanya, name + ': tanya');
  assertOptions(q.opsi, name, 4);
  assert.ok(ids(q.opsi).includes(q.correct), name + ': correct ada di opsi');
  q.opsi.forEach((o) => assert.ok(q.umpan[o.id], name + ': umpan untuk ' + o.id));
}

function assertGuidedList(list, name) {
  assert.ok(list.length >= 2, name + ': minimal dua pertanyaan');
  list.forEach((q) => assertGuided(q, name + '.' + q.id));
  assert.equal(new Set(ids(list)).size, list.length, name + ': id pertanyaan unik');
}

function assertHead(S, name) {
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

function assertDesimal(s, name) {
  assert.match(s, /^\d+(,\d+)?$/, name + ': desimal berkoma tanpa titik');
  assert.ok(E.desimalDigits(s), name + ': valid bagi engine');
}

test('sepuluh tahap: setiap tahap punya konten & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  assert.equal(manifest['fase-d/mpi-1.5'].stageCount, D.tahap.length);
  assert.equal(D.tahap.length, 10);
  assert.equal(new Set(ids(D.tahap)).size, 10);
  D.tahap.forEach((t) => {
    assert.ok(t.label, t.id + ': label');
    assert.ok(D[t.id], t.id + ': konten tahap ada di DATA');
  });
  D.tahap.filter((t) => t.id !== 'selesai').forEach((t) => assertHead(D[t.id], t.id));
});

test('stimulasi: kabar berdesimal & kunci dugaan cocok dengan engine', () => {
  const S = D.stimulasi;
  assert.ok(S.kabar.length >= 3);
  assert.equal(new Set(ids(S.kabar)).size, S.kabar.length);
  S.kabar.forEach((k) => {
    assert.ok(k.ikon && k.sumber && k.teks && k.satuan, k.id);
    assertDesimal(k.nilai, 'kabar.' + k.id);
  });
  assert.ok(S.dugaan.length >= 3);
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 4);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan untuk tahap Bukti');
  });
  const label = (q) => q.opsi.find((o) => o.id === q.baku).label;
  const [d1, d2, d3, d4] = S.dugaan;
  const kabar = (id) => S.kabar.find((k) => k.id === id).nilai;
  assert.ok(label(d1).includes(E.bacaDesimalKoma(kabar('lari'))));
  assert.equal(E.diagnosaTulisDesimal(label(d2), kabar('timbangan')).benar, true);
  d2.opsi
    .filter((o) => o.id !== d2.baku)
    .forEach((o) => assert.equal(E.diagnosaTulisDesimal(o.label, kabar('timbangan')).benar, false));
  /* Beni (12,45) lebih cepat daripada Andi (12,5); Citra (3,7) lebih jauh daripada Dewi (3,68) */
  assert.equal(E.simbolBandingDesimal(kabar('lari'), '12,5'), 'lt');
  assert.match(label(d3), /^Beni/);
  assert.equal(E.simbolBandingDesimal('3,7', kabar('lompat')), 'gt');
  assert.match(label(d4), /^Citra/);
});

test('masalah: pertanyaan inti ada di opsi dengan umpan tiap opsi', () => {
  const M = D.masalah;
  assertOptions(M.opsi, 'masalah', 4);
  assert.ok(ids(M.opsi).includes(M.correct));
  M.opsi.forEach((o) => assert.ok(M.umpan[o.id], 'umpan ' + o.id));
});

test('koleksi: nilai bisa dirakit blok, opsi cara baca unik, ada 0 pengisi tempat', () => {
  const K = D.koleksi;
  assert.ok(K.situasi.length >= 5);
  assert.equal(new Set(ids(K.situasi)).size, K.situasi.length);
  K.situasi.forEach((s) => {
    assertDesimal(s.nilai, s.id);
    const p = E.desimalDigits(s.nilai);
    assert.ok(parseInt(p.bulat, 10) <= 9, s.id + ': bagian bulat muat di satu blok satuan');
    assert.ok(p.pecahan.length >= 1 && p.pecahan.length <= 3, s.id + ': 1–3 angka desimal');
    assert.ok(!/0$/.test(p.pecahan), s.id + ': tanpa 0 di akhir (perakit membuangnya)');
    assert.equal(E.desimalDariBagian(E.bagianDariDesimal(s.nilai)), s.nilai, s.id + ': rakit');
    assert.ok(s.ikon && s.tempat && s.alat && s.teks && s.satuan && s.temuan, s.id);
    assert.ok(s.temuan.includes(s.nilai), s.id + ': temuan memuat bilangan');
    assert.ok(s.temuan.includes(E.bacaDesimalKoma(s.nilai)), s.id + ': temuan memuat cara baca');
    const opsi = E.opsiCaraBacaDesimal(s.nilai);
    assertOptions(opsi, s.id + ': opsi cara baca', 4);
    assert.equal(opsi.filter((o) => o.benar).length, 1);
  });
  assert.ok(
    K.situasi.some((s) => /^0/.test(E.desimalDigits(s.nilai).pecahan)),
    'ada angka 0 pengisi tempat'
  );
  [1, 2, 3].forEach((n) =>
    assert.ok(
      K.situasi.some((s) => E.banyakAngkaDesimal(s.nilai) === n),
      'ada desimal dengan ' + n + ' angka di belakang koma'
    )
  );
  assertGuidedList(K.amati, 'koleksi.amati');
});

test('olahBaca: pasangan dibuat engine, dikte & cara baca konsisten', () => {
  const B = D.olahBaca;
  assert.ok(B.pasang.length >= 4);
  assert.equal(new Set(ids(B.pasang)).size, B.pasang.length);
  const arah = new Set();
  B.pasang.forEach((q) => {
    assertDesimal(q.nilai, q.id);
    arah.add(q.arah);
    if (q.arah === 'tulis') assert.ok(['koma', 'nilai'].includes(q.dikte), q.id + ': dikte');
    const opsi = q.arah === 'baca' ? E.opsiCaraBacaDesimal(q.nilai) : E.opsiNotasiDesimal(q.nilai);
    assertOptions(opsi, q.id, 4);
    assert.equal(opsi.filter((o) => o.benar).length, 1, q.id + ': satu jawaban benar');
  });
  assert.deepEqual([...arah].sort(), ['baca', 'tulis']);

  assert.ok(B.tulisNotasi.length >= 3);
  B.tulisNotasi.forEach((s) => {
    assertDesimal(s.jawab, s.id);
    assert.ok(['koma', 'nilai'].includes(s.dikte), s.id + ': dikte');
    assert.ok(s.hints.length >= 1, s.id + ': hints');
    assert.equal(E.diagnosaTulisDesimal(s.jawab, s.jawab).benar, true);
  });
  assert.ok(
    B.tulisNotasi.some((s) => s.dikte === 'nilai' && /^0/.test(E.desimalDigits(s.jawab).pecahan)),
    'ada dikte nilai tempat dengan 0 pengisi tempat'
  );
  assert.ok(B.tulisBacaan.length >= 3);
  B.tulisBacaan.forEach((s) => {
    assertDesimal(s.jawab, s.id);
    assert.ok(s.hints.length >= 1, s.id + ': hints');
    assert.equal(E.cekCaraBacaDesimal(E.bacaDesimalKoma(s.jawab), s.jawab).kode, 'benar');
    assert.equal(
      E.cekCaraBacaDesimal(E.bacaDesimalNilaiTempat(s.jawab), s.jawab).benar,
      true,
      s.id + ': cara baca nilai tempat diterima'
    );
  });
  const semua = ids(B.tulisNotasi).concat(ids(B.tulisBacaan));
  assert.equal(new Set(semua).size, semua.length, 'id langkah unik');
  assert.ok(B.temuan.length >= 3);
});

test('olahBanding: pasangan, garis bilangan, dan urutan cocok dengan engine', () => {
  const B = D.olahBanding;
  assert.ok(B.pasangan.length >= 4);
  assert.equal(new Set(ids(B.pasangan)).size, B.pasangan.length);
  const simbol = new Set();
  B.pasangan.forEach((p) => {
    assertDesimal(p.a, p.id + '.a');
    assertDesimal(p.b, p.id + '.b');
    assert.ok(p.konteks && p.namaA && p.namaB && p.satuan && p.ikon, p.id);
    assert.ok(p.kalimat.includes('___'), p.id + ': kalimat memuat ___');
    simbol.add(E.simbolBandingDesimal(p.a, p.b));
    const opsi = E.opsiMaknaBandingDesimal(p.tema);
    assertOptions(opsi, p.id + ': makna', 3);
    assert.ok(E.maknaBandingDesimal(p.a, p.b, p.tema), p.id + ': ada kata makna');
  });
  assert.deepEqual([...simbol].sort(), ['eq', 'gt', 'lt'], 'ketiga lambang muncul');
  assert.ok(
    B.pasangan.some(
      (p) =>
        E.diagnosaBandingDesimal(p.a, p.b, 'lt') === 'bagian-desimal-bulat' ||
        E.diagnosaBandingDesimal(p.a, p.b, 'gt') === 'bagian-desimal-bulat'
    ),
    'ada pasangan yang memancing miskonsepsi "lebih banyak angka lebih besar"'
  );
  assert.equal(E.maknaBandingDesimal('12,5', '12,45', 'lari'), 'lebih lambat');

  const L = B.letak;
  assert.ok(L.nilai.length >= 3);
  const skala = L.nilai.map((n) => E.skalaDesimal(n.value, L.digits));
  skala.forEach((k, i) => {
    assert.notEqual(k, null, L.nilai[i].value + ': pas pada ketelitian garis');
    assert.ok(k >= E.skalaDesimal(L.min, L.digits) && k <= E.skalaDesimal(L.max, L.digits));
  });
  assert.equal(new Set(skala).size, skala.length, 'titik tidak bertumpuk');
  assertGuided(B.tanyaLetak, 'tanyaLetak');

  assert.ok(B.urut.length >= 4);
  assert.equal(new Set(ids(B.urut)).size, B.urut.length);
  const naik = E.urutkanDesimal(B.urut.map((u) => u.nilai));
  assert.equal(new Set(naik).size, naik.length, 'tidak ada nilai kembar');
  assert.equal(naik[0], '12,08');
  assert.ok(B.temuan.length >= 3);
});

test('verifikasi: pernyataan benar/salah', () => {
  const V = D.verifikasi;
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 2);
  assert.ok(V.pernyataan.length >= 6);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  const kunci = new Set();
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id);
    assert.ok(p.teks && p.explanation, p.id);
    kunci.add(p.correct);
  });
  assert.equal(kunci.size, 2, 'ada pernyataan benar dan salah');
  const v = (id) => V.pernyataan.find((p) => p.id === id).correct;
  assert.equal(v('v1'), E.bandingkanDesimal('0,8', '0,75') > 0 ? 'benar' : 'salah');
  assert.equal(v('v3'), E.bandingkanDesimal('0,5', '0,50') === 0 ? 'benar' : 'salah');
  assert.equal(v('v4'), E.cekCaraBacaDesimal('tiga koma tujuh', '3,07').benar ? 'benar' : 'salah');
  assert.equal(v('v8'), E.bandingkanDesimal('2,9', '10,1') > 0 ? 'benar' : 'salah');
});

test('generalisasi: setiap kalimat punya potongan benar yang unik & ada pengecoh', () => {
  const G = D.generalisasi;
  const bank = ids(G.bank);
  assert.equal(new Set(bank).size, bank.length);
  const dipakai = G.kalimat.map((k) => k.correct);
  assert.equal(new Set(dipakai).size, dipakai.length, 'potongan benar tidak ganda');
  dipakai.forEach((c) => assert.ok(bank.includes(c), c));
  assert.ok(bank.length - dipakai.length >= 2, 'minimal dua pengecoh');
  G.bank.forEach((b) => assert.ok(b.teks, b.id));
  assert.ok(G.rangkuman.length >= 3);
});

test('terapkan: bank soal cukup untuk komposisi acak & kunci cocok engine', () => {
  const T = D.terapkan;
  assert.equal(new Set(ids(T.soal)).size, T.soal.length, 'id soal unik');
  const jenis = (s) => (s.type === 'choice' ? 'choice' : s.mode);
  let total = 0;
  Object.keys(T.komposisi).forEach((k) => {
    const ada = T.soal.filter((s) => jenis(s) === k).length;
    assert.ok(ada > T.komposisi[k], k + ': bank lebih banyak dari yang diambil agar teracak');
    total += T.komposisi[k];
  });
  assert.equal(total, T.banyak);
  T.soal.forEach((s) => {
    assert.ok(s.cerita && s.pertanyaan && s.explanation, s.id);
    if (s.type === 'choice') {
      assertOptions(s.options, s.id, 4);
      assert.ok(ids(s.options).includes(s.correct), s.id + ': correct ada');
      return;
    }
    assertDesimal(s.jawab, s.id);
    assert.ok(s.reveal && s.hints.length >= 1, s.id + ': reveal & hints');
    if (s.mode === 'baca') {
      assert.equal(s.tampil, s.jawab, s.id + ': tampil = jawab');
      assert.equal(E.cekCaraBacaDesimal(E.bacaDesimalKoma(s.jawab), s.jawab).benar, true);
      assert.ok(s.reveal.includes(E.bacaDesimalKoma(s.jawab)), s.id + ': reveal = cara baca');
    } else {
      assert.equal(E.diagnosaTulisDesimal(s.jawab, s.jawab).benar, true);
      assert.ok(s.reveal.includes(s.jawab), s.id + ': reveal memuat jawaban');
    }
  });
  const soal = (id) => T.soal.find((s) => s.id === id);
  /* t7: tercepat = waktu terkecil */
  assert.equal(E.urutkanDesimal(['11,9', '11,85', '12,1'])[0], '11,85');
  assert.match(soal('t7').options.find((o) => o.id === soal('t7').correct).label, /11,85/);
  assert.equal(E.simbolBandingDesimal('0,45', '0,5'), 'lt');
  assert.equal(
    soal('t9').options.find((o) => o.id === soal('t9').correct).label,
    E.urutkanDesimal(['2,3', '2,03', '2,33', '2,303']).join('; ')
  );
  assert.equal(E.bandingkanDesimal('0,25', '0,250'), 0);
  assert.equal(
    soal('t11').options.find((o) => o.id === soal('t11').correct).label,
    E.bacaDesimalKoma('5,008')
  );
  assert.equal(E.simbolBandingDesimal('3,5', '3,45'), 'gt');
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 2);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.ok(S.judul && S.teks && S.capaian.length >= 3);
  S.contoh.forEach((c) => assertDesimal(c.nilai, 'contoh.' + c.nama));
});
