'use strict';

/*
 * Tes engine seksi 80 (Merumuskan pertanyaan statistik): klasifikasi
 * pertanyaan statistik dari ciri-cirinya, simulasi jawaban kelas yang
 * deterministik per seed, ringkasan & ragam jawaban, perakitan pertanyaan
 * berdiagnosa (kata tanya, yang dicatat, kelompok), soal uji terap
 * (kunci & opsi berpengecoh), serta logika Lab Tanya Kelas dan Lab Rakit.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

function plain(o) {
  return JSON.parse(JSON.stringify(o));
}

const STAT = { banyak: true, beragam: true, jelas: true };

const RAKIT = {
  kataTanya: [
    { id: 'apa', label: 'Apa' },
    { id: 'berapa', label: 'Berapa' },
  ],
  variabel: [
    {
      id: 'olahraga',
      frasa: 'olahraga kesukaan',
      tanya: 'apa',
      jenis: 'kategorik',
      cara: 'survei',
    },
    { id: 'tinggi', frasa: 'tinggi badan', tanya: 'berapa', jenis: 'numerik', cara: 'pengukuran' },
    { id: 'hebat', frasa: 'kehebatan', tanya: 'apa', jelas: false },
  ],
  kelompok: [
    { id: 'kelas', frasa: 'murid kelas VII A', banyak: true },
    { id: 'saya', frasa: 'saya', banyak: false },
  ],
};

test('klasifikasiPertanyaan: statistik hanya bila jelas, banyak orang, dan beragam', () => {
  assert.deepEqual(plain(E.klasifikasiPertanyaan(STAT)), { statistik: true, alasan: null });
  assert.equal(E.klasifikasiPertanyaan({ ...STAT, beragam: false }).alasan, 'satuJawaban');
  assert.equal(E.klasifikasiPertanyaan({ ...STAT, banyak: false }).alasan, 'satuOrang');
  assert.equal(E.klasifikasiPertanyaan({ ...STAT, jelas: false }).alasan, 'tidakJelas');
  /* tidak jelas diperiksa lebih dulu, lalu satu orang */
  assert.equal(
    E.klasifikasiPertanyaan({ banyak: false, beragam: false, jelas: false }).alasan,
    'tidakJelas'
  );
  assert.equal(
    E.klasifikasiPertanyaan({ banyak: false, beragam: false, jelas: true }).alasan,
    'satuOrang'
  );
  assert.equal(E.klasifikasiPertanyaan(null).statistik, false);
});

test('PST_ALASAN, PST_JENIS_DATA & PST_CARA lengkap dan unik', () => {
  const ids = (l) => Array.from(l, (o) => o.id);
  assert.deepEqual(ids(E.PST_ALASAN), ['satuJawaban', 'satuOrang', 'tidakJelas']);
  E.PST_ALASAN.forEach((a) => assert.ok(a.label && a.pesan, a.id));
  assert.deepEqual(ids(E.PST_JENIS_DATA), ['kategorik', 'numerik']);
  assert.deepEqual(ids(E.PST_CARA), ['survei', 'pengukuran', 'pengamatan']);
  assert.equal(E.alasanById('satuOrang').id, 'satuOrang');
  assert.equal(E.alasanById('x'), null);
});

test('pstRng deterministik per seed dan bernilai [0, 1)', () => {
  const a = E.pstRng(42);
  const b = E.pstRng(42);
  const c = E.pstRng(7);
  const va = [a(), a(), a()];
  assert.deepEqual(va, [b(), b(), b()]);
  assert.notDeepEqual(va, [c(), c(), c()]);
  const r = E.pstRng(123);
  for (let i = 0; i < 200; i++) {
    const v = r();
    assert.ok(v >= 0 && v < 1);
  }
});

test('simulasiJawabanKelas: kategori berbobot, rentang bilangan, tetap, dan satu orang', () => {
  const kat = {
    ciri: STAT,
    jawab: {
      kategori: [
        { label: 'Bus', bobot: 3 },
        { label: 'Sepeda', bobot: 2 },
        { label: 'Jalan kaki', bobot: 1 },
      ],
    },
  };
  const j1 = E.simulasiJawabanKelas(kat, 32, 5);
  assert.equal(j1.length, 32);
  assert.deepEqual([...j1], [...E.simulasiJawabanKelas(kat, 32, 5)], 'seed sama → hasil sama');
  j1.forEach((v) => assert.ok(['Bus', 'Sepeda', 'Jalan kaki'].includes(v)));
  assert.ok(E.ragamJawaban(j1) >= 2, 'kategori berbobot menghasilkan jawaban beragam');

  const num = { ciri: STAT, jawab: { rentang: [7, 10] } };
  const j2 = E.simulasiJawabanKelas(num, 32, 9);
  j2.forEach((v) => assert.ok(Number.isInteger(v) && v >= 7 && v <= 10));
  assert.ok(E.ragamJawaban(j2) >= 2);

  const tetap = { ciri: { ...STAT, beragam: false }, jawab: { tetap: '07.00' } };
  const j3 = E.simulasiJawabanKelas(tetap, 32, 1);
  assert.equal(j3.length, 32);
  assert.equal(E.ragamJawaban(j3), 1);

  const satu = { ciri: { ...STAT, banyak: false }, jawab: { rentang: [150, 160] } };
  assert.equal(E.simulasiJawabanKelas(satu, 32, 3).length, 1, 'satu orang → satu jawaban');
});

test('ringkasJawaban & ragamJawaban', () => {
  assert.deepEqual(plain(E.ringkasJawaban(['Bus', 'Sepeda', 'Bus', 'Angkot', 'Bus', 'Sepeda'])), [
    { nilai: 'Bus', banyak: 3 },
    { nilai: 'Sepeda', banyak: 2 },
    { nilai: 'Angkot', banyak: 1 },
  ]);
  /* bilangan dengan banyak sama diurutkan naik */
  assert.deepEqual(plain(E.ringkasJawaban([9, 7, 8, 7, 9])), [
    { nilai: 7, banyak: 2 },
    { nilai: 9, banyak: 2 },
    { nilai: 8, banyak: 1 },
  ]);
  assert.equal(E.ragamJawaban([]), 0);
  assert.equal(E.ragamJawaban(['a', 'a']), 1);
  assert.equal(E.kunciCatatTanya({ ciri: STAT }), 'beragam');
  assert.equal(E.kunciCatatTanya({ ciri: { ...STAT, beragam: false } }), 'seragam');
  assert.equal(E.kunciCatatTanya({ ciri: { ...STAT, banyak: false } }), 'seragam');
});

test('teksRakitPertanyaan & periksaRakitPertanyaan berdiagnosa', () => {
  assert.equal(
    E.teksRakitPertanyaan({ tanya: 'apa', variabel: 'olahraga', kelompok: 'kelas' }, RAKIT),
    'Apa olahraga kesukaan murid kelas VII A?'
  );
  assert.equal(E.teksRakitPertanyaan({ tanya: 'apa' }, RAKIT), 'Apa … …?');

  const ok = E.periksaRakitPertanyaan(
    { tanya: 'apa', variabel: 'olahraga', kelompok: 'kelas' },
    RAKIT
  );
  assert.equal(ok.benar, true);
  assert.equal(ok.kode, 'benar');
  assert.equal(ok.jenisData, 'kategorik');
  assert.equal(ok.cara, 'survei');

  const ok2 = E.periksaRakitPertanyaan(
    { tanya: 'berapa', variabel: 'tinggi', kelompok: 'kelas' },
    RAKIT
  );
  assert.equal(ok2.benar, true);
  assert.equal(ok2.jenisData, 'numerik');

  const kode = (p) => E.periksaRakitPertanyaan(p, RAKIT).kode;
  assert.equal(kode({ tanya: 'apa', variabel: 'olahraga' }), 'belumLengkap');
  assert.equal(kode({ tanya: 'berapa', variabel: 'olahraga', kelompok: 'kelas' }), 'tanyaTakCocok');
  assert.equal(kode({ tanya: 'apa', variabel: 'tinggi', kelompok: 'kelas' }), 'tanyaTakCocok');
  assert.equal(kode({ tanya: 'apa', variabel: 'hebat', kelompok: 'kelas' }), 'tidakJelas');
  assert.equal(kode({ tanya: 'apa', variabel: 'olahraga', kelompok: 'saya' }), 'satuOrang');
  ['belumLengkap', 'tanyaTakCocok', 'tidakJelas', 'satuOrang', 'benar'].forEach((k) =>
    assert.ok(E.pesanRakitPertanyaan(k), k + ': pesan')
  );
});

const SOAL_PILIH = {
  id: 's1',
  minta: 'pilihStatistik',
  pilihan: [
    { id: 'a', teks: 'Jam berapa bel masuk sekolah kita?', ciri: { ...STAT, beragam: false } },
    { id: 'b', teks: 'Berapa tinggi badan saya?', ciri: { ...STAT, banyak: false } },
    { id: 'c', teks: 'Apa olahraga kesukaan murid kelas VII?', ciri: STAT },
    { id: 'd', teks: 'Apakah murid kelas VII keren?', ciri: { ...STAT, jelas: false } },
  ],
};

test('nilaiSoalStatistik & opsiSoalStatistik: pilih pertanyaan statistik', () => {
  assert.equal(E.nilaiSoalStatistik(SOAL_PILIH), 'c');
  const opsi = E.opsiSoalStatistik(SOAL_PILIH);
  assert.deepEqual(
    Array.from(opsi, (o) => o.id),
    ['a', 'b', 'c', 'd']
  );
  opsi.forEach((o) => assert.ok(o.label && o.umpan, o.id));
  assert.match(opsi[0].umpan, /satu jawaban|sama/i);
  /* perbaiki memakai logika yang sama */
  assert.equal(E.nilaiSoalStatistik({ ...SOAL_PILIH, minta: 'perbaiki' }), 'c');
});

test('soal alasan, jenisData, dan cara', () => {
  const alasan = { minta: 'alasan', ciri: { ...STAT, banyak: false } };
  assert.equal(E.nilaiSoalStatistik(alasan), 'satuOrang');
  const oa = E.opsiSoalStatistik(alasan);
  assert.equal(oa.length, 4);
  assert.ok(Array.from(oa, (o) => o.id).includes('statistik'));

  const jenis = { minta: 'jenisData', ciri: STAT, jenis: 'numerik' };
  assert.equal(E.nilaiSoalStatistik(jenis), 'numerik');
  const oj = E.opsiSoalStatistik(jenis);
  assert.equal(oj.length, 3);
  assert.equal(new Set(Array.from(oj, (o) => o.id)).size, 3);

  const cara = { minta: 'cara', ciri: STAT, cara: 'pengamatan' };
  assert.equal(E.nilaiSoalStatistik(cara), 'pengamatan');
  const oc = E.opsiSoalStatistik(cara);
  assert.equal(oc.length, 4);
  oc.forEach((o) => assert.ok(o.umpan, o.id));
  assert.equal(E.nilaiSoalStatistik({ minta: 'lain' }), null);
});

test('buildCiriPertanyaan menandai ciri yang terpenuhi', () => {
  const html = E.buildCiriPertanyaan({ ...STAT, banyak: false });
  assert.equal((html.match(/pst-ciri__item--ya/g) || []).length, 2);
  assert.equal((html.match(/pst-ciri__item--tidak/g) || []).length, 1);
});

const TANYA = {
  responden: 32,
  pertanyaan: [
    {
      id: 'q1',
      teks: 'Apa moda transportasi ke sekolah murid kelas VII A?',
      ciri: STAT,
      jawab: {
        kategori: [
          { label: 'Bus', bobot: 2 },
          { label: 'Sepeda', bobot: 1 },
        ],
      },
    },
    {
      id: 'q2',
      teks: 'Jam berapa bel masuk?',
      ciri: { ...STAT, beragam: false },
      jawab: { tetap: '07.00' },
    },
  ],
};

test('Lab Tanya Kelas: tanya, catat berdiagnosa, dan selesai', () => {
  const S = {};
  const st = E.ensureLabTanya(S, 'lab', TANYA);
  assert.equal(S.lab, st);
  assert.equal(E.labTanyaSelesai(st, TANYA), false);
  E.tanyaKelas(st, TANYA, 'q1', 11);
  assert.equal(st.aktif, 'q1');
  assert.equal(st.seeds.q1, 11);
  assert.equal(E.jawabanLabTanya(st, TANYA, 'q1').length, 32);
  assert.equal(E.catatLabTanya(st, TANYA, 'q1', 'seragam'), false);
  assert.equal(E.catatLabTanya(st, TANYA, 'q1', 'beragam'), true);
  /* tidak bisa mencatat sebelum bertanya */
  assert.equal(E.catatLabTanya(st, TANYA, 'q2', 'seragam'), false);
  assert.equal(st.catat.q2, undefined);
  E.tanyaKelas(st, TANYA, 'q2', 3);
  assert.equal(E.catatLabTanya(st, TANYA, 'q2', 'seragam'), true);
  assert.equal(E.labTanyaSelesai(st, TANYA), true);
  /* urutan opsi catat diacak & tersimpan per pertanyaan */
  assert.equal(st.catatOrders.q1.length, 2);
  /* state rusak dipulihkan */
  const S2 = { lab: { seeds: 'x' } };
  const st2 = E.ensureLabTanya(S2, 'lab', TANYA);
  assert.deepEqual(plain(st2.seeds), {});

  const html = E.buildLabTanya('lt', st, TANYA);
  assert.match(html, /id="lt"/);
  assert.match(html, /data-pst-tanya="q1"/);
  assert.match(html, /pst-responden/);
});

test('Lab Rakit: pilih keping, periksa, jawab ciri, simpan, selesai', () => {
  const cfg = Object.assign({ minSimpan: 2 }, RAKIT);
  const S = {};
  const st = E.ensureLabRakit(S, 'rk', cfg);
  assert.equal(st.orders.variabel.length, 3);
  E.pilihKepingRakit(st, 'tanya', 'apa');
  E.pilihKepingRakit(st, 'variabel', 'olahraga');
  E.pilihKepingRakit(st, 'kelompok', 'saya');
  assert.equal(E.periksaLabRakit(st, cfg).kode, 'satuOrang');
  assert.equal(E.simpanRakit(st, cfg), false);
  E.pilihKepingRakit(st, 'kelompok', 'kelas');
  assert.equal(st.hasil, null, 'mengganti keping menghapus hasil periksa');
  assert.equal(E.periksaLabRakit(st, cfg).benar, true);
  assert.equal(E.simpanRakit(st, cfg), false, 'jenis & cara belum dijawab');
  assert.equal(E.jawabCiriRakit(st, cfg, 'jenis', 'numerik'), false);
  assert.equal(E.jawabCiriRakit(st, cfg, 'jenis', 'kategorik'), true);
  assert.equal(E.jawabCiriRakit(st, cfg, 'cara', 'survei'), true);
  assert.equal(E.simpanRakit(st, cfg), true);
  assert.equal(st.simpan.length, 1);
  assert.equal(st.simpan[0].teks, 'Apa olahraga kesukaan murid kelas VII A?');
  assert.deepEqual(plain(st.pilih), {});
  /* pertanyaan yang sama tidak bisa disimpan dua kali */
  ['apa', 'olahraga', 'kelas'].forEach((id, i) =>
    E.pilihKepingRakit(st, ['tanya', 'variabel', 'kelompok'][i], id)
  );
  E.periksaLabRakit(st, cfg);
  E.jawabCiriRakit(st, cfg, 'jenis', 'kategorik');
  E.jawabCiriRakit(st, cfg, 'cara', 'survei');
  assert.equal(E.simpanRakit(st, cfg), false);
  assert.equal(E.labRakitSelesai(st, cfg), false, 'perlu kategorik & numerik');
  E.pilihKepingRakit(st, 'tanya', 'berapa');
  E.pilihKepingRakit(st, 'variabel', 'tinggi');
  E.pilihKepingRakit(st, 'kelompok', 'kelas');
  E.periksaLabRakit(st, cfg);
  E.jawabCiriRakit(st, cfg, 'jenis', 'numerik');
  E.jawabCiriRakit(st, cfg, 'cara', 'pengukuran');
  assert.equal(E.simpanRakit(st, cfg), true);
  assert.equal(E.labRakitSelesai(st, cfg), true);

  const html = E.buildLabRakit('rk', st, cfg);
  assert.match(html, /data-pst-keping="tanya"/);
  assert.match(html, /pst-rakit__kalimat/);
});
