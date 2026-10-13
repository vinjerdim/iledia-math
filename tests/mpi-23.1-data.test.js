'use strict';

/*
 * Tes konsistensi konten fase-d/mpi-23.1/data.js (Keliling & luas bangun
 * datar, Discovery Learning + asesmen diagnostik): setiap kunci sama
 * dengan engine seksi 72–73 (ringkasDiagnostik, kelilingBangun,
 * luasBangun, periksaSoalBangun, jawabSoalBangun, opsiSoalBangun), opsi
 * pilihan cukup & unik agar dapat diacak, tahap mengikuti sintaks
 * Discovery Learning dan sama dengan manifest halaman. app.js juga
 * dicek agar pilihan selalu dirender dengan urutan acak tersimpan.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loadEngine, ROOT } = require('./load-engine');

const E = loadEngine(['fase-d/mpi-23.1/data.js']);
const D = E.DATA;
const APP = fs.readFileSync(path.join(ROOT, 'fase-d', 'mpi-23.1', 'app.js'), 'utf8');
const JENIS = Object.keys(E.BANGUN_DATAR);
const OLAH = ['olahPersegi', 'olahJajar', 'olahTrapesium', 'olahDiagonal'];

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
  ['kicker', 'syntax', 'goal', 'guru'].forEach((k) => assert.ok(S[k], name + ': ' + k));
}

function assertCekValid(c, name) {
  assert.ok(E.BANGUN_DATAR[c.jenis], name + ': jenis dikenal');
  if (c.minta === 'rumus') return;
  assert.ok(['keliling', 'luas', 'ukuran'].includes(c.minta), name + ': minta');
  assert.ok(E.ukuranValidBangun(c.jenis, c.ukuran), name + ': ukuran sah');
  if (c.minta === 'ukuran') {
    assert.ok(E.BANGUN_DATAR[c.jenis].ukuran.includes(c.cari), name + ': cari');
    assert.ok(['luas', 'keliling'].includes(c.dari), name + ': dari');
  }
  /* bilangan kunci rapi (bulat atau satu desimal) agar wajar bagi murid */
  const v = E.nilaiSoalBangun(c);
  assert.ok(v > 0 && Math.abs(v * 10 - Math.round(v * 10)) < 1e-9, name + ': kunci rapi ' + v);
}

/* Langkah { cek }: jawaban baku dari engine diterima pemeriksa & disebut di temuan. */
function assertLangkah(list, name) {
  assert.ok(list.length >= 3, name + ': cukup langkah');
  assert.equal(new Set(ids(list)).size, list.length, name + ': id unik');
  list.forEach((s) => {
    const n = name + '.' + s.id;
    assert.ok(s.label && s.satuan && s.temuan, n + ': label, satuan, temuan');
    assert.ok(Array.isArray(s.hints) && s.hints.length >= 1, n + ': petunjuk');
    assertCekValid(s.cek, n);
    assert.equal(s.satuan, E.satuanJawabBangun(s.cek.minta, 'm'), n + ': satuan');
    const jawab = E.jawabSoalBangun(s);
    assert.equal(E.periksaSoalBangun(jawab, s).benar, true, n + ': jawaban baku diterima');
    assert.ok(s.temuan.includes(jawab + ' ' + s.satuan), n + ': temuan memuat ' + jawab);
  });
}

function assertLab(L, name) {
  assert.ok(['petak', 'potong'].includes(L.mode), name + ': mode');
  assert.ok(L.jenisList.length >= 1 && L.minCatat >= 2, name + ': jenis & minCatat');
  L.jenisList.forEach((j) => {
    const B = E.BANGUN_DATAR[j];
    assert.ok(B, name + ': ' + j + ' dikenal');
    assert.deepEqual(Object.keys(L.ukuran[j]), Array.from(B.ukuran), name + '.' + j + ': ukuran');
    Object.values(L.ukuran[j]).forEach((r) => {
      assert.ok(r.min >= 1 && r.min <= r.awal && r.awal <= r.max, name + '.' + j + ': batas');
      assert.ok(r.max - r.min + 1 >= L.minCatat, name + '.' + j + ': cukup ukuran untuk dicatat');
    });
    if (L.mode === 'potong') {
      const awal = {};
      Object.entries(L.ukuran[j]).forEach(([k, r]) => (awal[k] = r.awal));
      assert.ok(E.buildPotongSusunSVG(j, awal, 2), name + '.' + j + ': gambar potong-susun');
    }
  });
  const st = E.ensureLabBangun({}, L);
  assert.equal(st.jenis, L.jenisList[0], name + ': state lab siap');
}

test('tiga belas tahap: diagnostik + Discovery Learning, konten lengkap & sama dengan manifest', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'shared', 'pages-manifest.json'), 'utf8')
  );
  const m = manifest['fase-d/mpi-23.1'];
  assert.ok(m, 'entri manifest ada');
  assert.equal(m.stageCount, D.tahap.length);
  assert.match(m.description, /Discovery Learning/);
  assert.match(m.description, /asesmen diagnostik/i);
  assert.equal(m.extraBody, 'partials/reset-modal.html');
  assert.equal(D.tahap.length, 13);
  assert.equal(new Set(ids(D.tahap)).size, 13);
  assert.equal(D.tahap[0].id, 'diagnostik', 'asesmen diagnostik di awal');
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
    olahPersegi: 4,
    olahJajar: 4,
    olahTrapesium: 4,
    olahDiagonal: 4,
    verifikasi: 5,
    generalisasi: 6,
  };
  Object.entries(sintaks).forEach(([id, n]) => {
    assert.equal(D[id].syntax, 'Discovery Learning · Sintaks ' + n, id);
  });
});

test('diagnostik: butir prasyarat lengkap, indikator tercakup, opsi dapat diacak', () => {
  const G = D.diagnostik;
  assert.ok(G.tp && G.tpJudul && G.kriteria.length >= 3);
  assert.match(
    G.tp,
    /segitiga, persegi, persegi panjang, jajargenjang, trapesium, belah ketupat, dan layang-layang/
  );
  assert.ok(G.butir.length >= 8, 'minimal 8 butir');
  assert.equal(new Set(ids(G.butir)).size, G.butir.length);
  assert.equal(new Set(ids(G.indikator)).size, G.indikator.length);
  G.indikator.forEach((ind) => {
    assert.ok(ind.label && ind.saran, ind.id + ': label & saran');
    assert.ok(
      G.butir.some((b) => b.indikator === ind.id),
      ind.id + ': punya butir'
    );
  });
  G.butir.forEach((b) => {
    assert.ok(ids(G.indikator).includes(b.indikator), b.id + ': indikator dikenal');
    assert.ok(b.tanya && b.pembahasan, b.id + ': tanya & pembahasan');
    assertOptions(b.opsi, 'butir.' + b.id, 4);
    assert.ok(ids(b.opsi).includes(b.correct), b.id + ': correct ada di opsi');
    if (b.gambar) {
      assert.ok(E.buildBangunSVG(b.gambar.jenis, b.gambar.ukuran, b.gambar), b.id + ': gambar');
    }
  });
  /* kunci butir bergambar sesuai engine */
  const pita = G.butir.find((b) => b.id === 'dPita');
  assert.ok(
    pita.opsi
      .find((o) => o.id === pita.correct)
      .label.startsWith(E.kelilingBangun(pita.gambar.jenis, pita.gambar.ukuran) + ' ')
  );
  const petak = G.butir.find((b) => b.id === 'dPetak');
  assert.ok(
    petak.opsi
      .find((o) => o.id === petak.correct)
      .label.startsWith(E.luasBangun(petak.gambar.jenis, petak.gambar.ukuran) + ' ')
  );
  ['siap', 'sebagian', 'perlu'].forEach((k) => assert.ok(G.pesan[k], 'pesan ' + k));
  /* ringkasan engine bekerja dengan data ini */
  const state = {};
  E.ensureDiagnostikStates(state, 'd', G.butir);
  G.butir.forEach((b) => E.pilihDiagnostik(state.d[b.id], b, b.correct));
  const r = E.ringkasDiagnostik(G.butir, state.d, G.indikator);
  assert.equal(r.level, 'siap');
  assert.equal(r.benar, G.butir.length);
});

test('stimulasi: tujuh petak (semua bangun) dan dugaan sesuai engine', () => {
  const S = D.stimulasi;
  assert.equal(S.petak.length, 7);
  assert.deepEqual(Array.from(S.petak, (p) => p.jenis).sort(), JENIS.slice().sort());
  S.petak.forEach((p) => {
    assert.ok(p.nama && E.ukuranValidBangun(p.jenis, p.ukuran), p.id);
    assert.ok(E.buildBangunSVG(p.jenis, p.ukuran, { label: p.label }), p.id + ': gambar');
  });
  /* sisi berlabel pada denah bernilai bulat (mudah dibaca murid) */
  S.petak.forEach((p) => {
    if (!p.label.sisi) return;
    const sisi = E.sisiBangun(p.jenis, p.ukuran);
    const indeks = Array.isArray(p.label.sisi) ? p.label.sisi : E.BANGUN_DATAR[p.jenis].labelSisi;
    indeks.forEach((i) => assert.ok(Number.isInteger(sisi[i]), p.id + ': sisi ' + i + ' bulat'));
  });
  assert.ok(S.dugaan.length >= 3);
  const byId = Object.fromEntries(S.petak.map((p) => [p.id, p]));
  S.dugaan.forEach((q) => {
    assertOptions(q.opsi, 'dugaan.' + q.id, 3);
    assert.ok(ids(q.opsi).includes(q.baku), q.id + ': baku ada di opsi');
    assert.ok(q.pembahasan, q.id + ': pembahasan');
    if (q.cek) {
      const jawab = E.jawabSoalBangun(q);
      assert.ok(q.opsi.find((o) => o.id === q.baku).label.startsWith(jawab + ' '), q.id);
      q.opsi
        .filter((o) => o.id !== q.baku)
        .forEach((o) => assert.ok(!o.label.startsWith(jawab + ' '), q.id + '.' + o.id));
    } else {
      const [a, b] = q.banding.petak.map((id) => byId[id]);
      const f = q.banding.minta === 'luas' ? E.luasBangun : E.kelilingBangun;
      const va = f(a.jenis, a.ukuran);
      const vb = f(b.jenis, b.ukuran);
      const harap = va === vb ? 'sama' : va > vb ? 'mawar' : 'melati';
      assert.equal(q.baku, harap, q.id + ': baku = perbandingan engine');
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

test('koleksi: Lab Petak persegi panjang & persegi, mencatat keliling dan luas', () => {
  const K = D.koleksi;
  assertLab(K.lab, 'koleksi');
  assert.equal(K.lab.mode, 'petak');
  assert.deepEqual(Array.from(K.lab.jenisList).sort(), ['persegi', 'persegiPanjang']);
  assert.deepEqual(Array.from(K.lab.minta), ['keliling', 'luas']);
  assert.ok(K.tips.length >= 2 && K.selesaiTeks && K.nextLabel);
});

test('olah data: lab, temuan & langkah konsisten; ketujuh bangun tercakup', () => {
  const tercakup = new Set();
  OLAH.forEach((id) => {
    const O = D[id];
    assert.ok(O.pengantar && O.nextLabel, id + ': teks');
    assertGuided(O.temuan, id + '.temuan', 3);
    assertLangkah(O.langkah, id + '.langkah');
    O.rumus.forEach((j) => {
      assert.ok(E.BANGUN_DATAR[j], id + ': rumus ' + j);
      tercakup.add(j);
    });
    if (O.lab) {
      assertLab(O.lab, id);
      assert.equal(O.lab.mode, 'potong');
      assert.deepEqual(Array.from(O.lab.minta), ['luas']);
      O.lab.jenisList.forEach((j) => assert.ok(O.rumus.includes(j), id + ': lab ' + j));
    }
    /* setiap bangun yang diolah dipakai di langkah keliling & luas atau ukuran */
    O.rumus.forEach((j) =>
      assert.ok(
        O.langkah.some((s) => s.cek.jenis === j && s.cek.minta === 'luas'),
        id + ': langkah luas ' + j
      )
    );
  });
  assert.deepEqual(Array.from(tercakup).sort(), JENIS.slice().sort());
  assert.equal(D.olahPersegi.lab, undefined, 'olah persegi memakai data Lab Petak');
});

test('verifikasi: pilah rumus luas sesuai engine & pernyataan lengkap', () => {
  const V = D.verifikasi;
  assert.deepEqual(Array.from(V.kategori), Array.from(E.URUTAN_RUMUS_LUAS));
  assert.equal(V.bangun.length, 7);
  assert.deepEqual(Array.from(V.bangun, (b) => b.jenis).sort(), JENIS.slice().sort());
  assert.equal(new Set(ids(V.bangun)).size, V.bangun.length);
  const stimulasi = D.stimulasi.petak;
  V.bangun.forEach((b) => {
    assert.ok(b.teks && b.explanation, b.id);
    assert.ok(E.buildBangunSVG(b.jenis, b.ukuran, { simbol: true }), b.id + ': gambar');
    const lama = stimulasi.find((p) => p.jenis === b.jenis);
    assert.notDeepEqual(b.ukuran, lama.ukuran, b.id + ': bangun BARU');
  });
  assertOptions(V.opsiPernyataan, 'opsiPernyataan', 3);
  assert.ok(V.pernyataan.length >= 6);
  assert.equal(new Set(ids(V.pernyataan)).size, V.pernyataan.length);
  V.pernyataan.forEach((p) => {
    assert.ok(ids(V.opsiPernyataan).includes(p.correct), p.id + ': correct ada di opsi');
    assert.ok(p.teks && p.explanation, p.id);
  });
  ['benar', 'salah', 'kadang'].forEach((k) =>
    assert.ok(
      V.pernyataan.some((p) => p.correct === k),
      'ada pernyataan ' + k
    )
  );
  assert.ok(V.judulA && V.judulB && V.judulC);
});

test('generalisasi: setiap kalimat punya potongan benar & ada pengecoh', () => {
  const G = D.generalisasi;
  assert.equal(new Set(ids(G.bank)).size, G.bank.length, 'id bank unik');
  assertOptions(G.bank, 'bank', 5);
  const benar = G.kalimat.map((g) => g.correct);
  assert.equal(new Set(benar).size, benar.length, 'potongan benar tidak dipakai ulang');
  benar.forEach((b) => assert.ok(ids(G.bank).includes(b), b + ': ada di bank'));
  assert.ok(G.bank.length - G.kalimat.length >= 2, 'minimal dua pengecoh');
  assert.ok(G.rangkuman.length >= 5);
});

test('uji terap: bank soal, komposisi, kunci & opsi pilihan ganda dari engine', () => {
  const T = D.terapkan;
  assert.equal(T.soal.length, 16);
  assert.equal(new Set(ids(T.soal)).size, T.soal.length);
  assert.equal(T.komposisi.input + T.komposisi.choice, T.banyak);
  Object.keys(T.komposisi).forEach((k) => {
    assert.ok(T.soal.filter((s) => s.type === k).length >= T.komposisi[k] * 2, k + ': bank cukup');
  });
  const jenisDipakai = new Set();
  T.soal.forEach((s) => {
    const n = 'soal.' + s.id;
    assert.ok(['input', 'choice'].includes(s.type), n + ': type');
    assert.ok(D.konteks[s.konteks], n + ': konteks dikenal');
    assert.ok(s.cerita && s.pertanyaan && s.explanation, n + ': teks');
    assertCekValid(s.cek, n);
    jenisDipakai.add(s.cek.jenis);
    const jawab = E.jawabSoalBangun(s);
    assert.equal(E.periksaSoalBangun(jawab, s).benar, true, n + ': kunci diterima');
    if (s.cek.minta !== 'rumus') {
      assert.ok(s.satuan && s.label, n + ': satuan & label gambar');
      const sat = E.satuanJawabBangun(s.cek.minta, s.satuan);
      assert.ok(s.explanation.includes(jawab + ' ' + sat), n + ': penjelasan memuat ' + jawab);
      assert.ok(E.buildBangunSVG(s.cek.jenis, s.cek.ukuran, { label: s.label }), n + ': gambar');
      /* gambar soal mencari ukuran tidak boleh membocorkan jawabannya */
      if (s.cek.minta === 'ukuran') {
        const svg = E.buildBangunSVG(s.cek.jenis, s.cek.ukuran, {
          label: s.label,
          satuan: s.satuan,
        });
        assert.ok(!svg.includes('>' + jawab + ' ' + s.satuan + '<'), n + ': jawaban tersembunyi');
      }
    } else {
      assert.ok(s.gambar && E.buildBangunSVG(s.cek.jenis, s.gambar.ukuran, s.gambar), n);
    }
    if (s.type === 'input') {
      assert.notEqual(s.cek.minta, 'rumus', n + ': isian berupa bilangan');
      assert.ok(s.hints && s.hints.length >= 1, n + ': petunjuk');
      assert.ok(s.reveal && s.reveal.includes(jawab), n + ': reveal memuat jawaban');
    } else {
      const opsi = E.opsiSoalBangun(s);
      assert.ok(opsi.length >= 4, n + ': minimal 4 opsi');
      assert.equal(new Set(opsi.map((o) => o.label)).size, opsi.length, n + ': label unik');
    }
  });
  assert.deepEqual(Array.from(jenisDipakai).sort(), JENIS.slice().sort(), 'semua bangun diuji');
  ['keliling', 'luas', 'ukuran', 'rumus'].forEach((m) =>
    assert.ok(
      T.soal.some((s) => s.cek.minta === m),
      'ada soal ' + m
    )
  );
});

test('refleksi & selesai', () => {
  const R = D.refleksi;
  assert.ok(R.pertanyaan.length >= 3);
  assertOptions(R.diriOpsi, 'diriOpsi', 4);
  const S = D.selesai;
  assert.ok(S.judul && S.teks && S.capaian.length >= 3);
  assert.deepEqual(Array.from(S.contoh).sort(), JENIS.slice().sort());
});

test('app.js: semua pilihan diacak sekali & disimpan di state', () => {
  [
    'ensureShuffledOrder',
    'ensureSortStates',
    'ensureDiagnostikStates',
    'shuffleArray',
    'opsiSoalBangun',
  ].forEach((f) => assert.match(APP, new RegExp('\\b' + f + '\\('), f + ' dipakai'));
  [
    'diagnostikStates',
    'dugaanOrders',
    'masalahOrder',
    'temuanOrders',
    'rumusOrder',
    'pernyataanOrder',
    'bankOrder',
    'refleksiDiriOrder',
    'optionOrder',
  ].forEach((k) => assert.match(APP, new RegExp('\\b' + k + '\\b'), k + ' tersimpan'));
  assert.match(APP, /STORAGE_KEY = 'mpi-d-23-1-/);
});
