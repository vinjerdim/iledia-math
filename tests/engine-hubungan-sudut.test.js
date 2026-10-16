'use strict';

/*
 * Tes engine seksi 77 — Hubungan antar sudut pada dua garis berpotongan:
 * besar keempat sudut, sudut siku-siku yang dibagi sinar, jenis pasangan
 * (berpelurus, bertolak belakang, berpenyiku), isian sudut berdiagnosa
 * miskonsepsi (tertukar pelurus/penyiku, mengira sama besar, salah skala
 * busur, salah relasi pada bentuk aljabar), opsi pilihan ganda
 * berpengecoh, gambar SVG dua garis + busur, dan Lab Sudut.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine([]);

function arr(x) {
  return JSON.parse(JSON.stringify(x));
}

const CFG = {
  potong: { min: 15, max: 165, langkah: 5, awal: 50, minPosisi: 3 },
  siku: { min: 10, max: 80, langkah: 5, awal: 30, minPosisi: 2 },
};

test('sudutDuaGaris & sudutSikuSinar: besar sudut dari posisi garis/sinar', () => {
  assert.deepEqual(arr(E.sudutDuaGaris(50)), [50, 130, 50, 130]);
  assert.deepEqual(arr(E.sudutDuaGaris(90)), [90, 90, 90, 90]);
  assert.deepEqual(arr(E.sudutDuaGaris(125)), [125, 55, 125, 55]);
  assert.deepEqual(arr(E.sudutSikuSinar(30)), [30, 60]);
  assert.deepEqual(arr(E.besarSudutLab('potong', 70)), [70, 110, 70, 110]);
  assert.deepEqual(arr(E.besarSudutLab('siku', 25)), [25, 65]);
  [15, 40, 95, 165].forEach((t) => {
    const s = E.sudutDuaGaris(t);
    assert.equal(s[0] + s[1] + s[2] + s[3], 360, 'satu putaran penuh');
  });
});

test('pelurusDari & penyikuDari', () => {
  assert.equal(E.pelurusDari(65), 115);
  assert.equal(E.pelurusDari(90), 90);
  assert.equal(E.penyikuDari(35), 55);
  assert.equal(E.penyikuDari(45), 45);
});

test('jenisPasanganSudut: posisi pada dua garis & sudut siku-siku', () => {
  assert.equal(E.jenisPasanganSudut('potong', 0, 1), 'berpelurus');
  assert.equal(E.jenisPasanganSudut('potong', 1, 2), 'berpelurus');
  assert.equal(E.jenisPasanganSudut('potong', 3, 0), 'berpelurus');
  assert.equal(E.jenisPasanganSudut('potong', 0, 2), 'bertolakBelakang');
  assert.equal(E.jenisPasanganSudut('potong', 3, 1), 'bertolakBelakang');
  assert.equal(E.jenisPasanganSudut('potong', 2, 2), null);
  assert.equal(E.jenisPasanganSudut('siku', 0, 1), 'berpenyiku');
  assert.equal(E.jenisPasanganSudut('siku', 0, 0), null);
});

test('jenisPasanganNilai: dari besar dua sudut', () => {
  assert.equal(E.jenisPasanganNilai(35, 55), 'berpenyiku');
  assert.equal(E.jenisPasanganNilai(45, 45), 'berpenyiku');
  assert.equal(E.jenisPasanganNilai(120, 60), 'berpelurus');
  assert.equal(E.jenisPasanganNilai(90, 90), 'berpelurus');
  assert.equal(E.jenisPasanganNilai(40, 40), 'bukanKeduanya');
  assert.equal(E.jenisPasanganNilai(100, 100), 'bukanKeduanya');
});

test('parseSudutIsian: bilangan dengan/atau tanpa °, "derajat", "x ="', () => {
  assert.deepEqual(arr(E.parseSudutIsian('130')), { kode: 'ok', nilai: 130 });
  assert.deepEqual(arr(E.parseSudutIsian(' 130° ')), { kode: 'ok', nilai: 130 });
  assert.deepEqual(arr(E.parseSudutIsian('130 derajat')), { kode: 'ok', nilai: 130 });
  assert.deepEqual(arr(E.parseSudutIsian('x = 30')), { kode: 'ok', nilai: 30 });
  assert.deepEqual(arr(E.parseSudutIsian('22,5')), { kode: 'ok', nilai: 22.5 });
  assert.deepEqual(arr(E.parseSudutIsian('−20')), { kode: 'ok', nilai: -20 });
  assert.equal(E.parseSudutIsian('').kode, 'kosong');
  assert.equal(E.parseSudutIsian('   ').kode, 'kosong');
  assert.equal(E.parseSudutIsian('seratus').kode, 'format');
  assert.equal(E.parseSudutIsian('1 3 0').kode, 'format');
});

test('nilaiSoalSudut & jawabSoalSudut: setiap jenis cek', () => {
  const v = (cek) => E.nilaiSoalSudut(cek);
  assert.equal(v({ minta: 'jumlah', sudut: [50, 130] }), 180);
  assert.equal(v({ minta: 'pelurus', sudut: 65 }), 115);
  assert.equal(v({ minta: 'penyiku', sudut: 35 }), 55);
  assert.equal(v({ minta: 'tolakBelakang', sudut: 112 }), 112);
  assert.equal(v({ minta: 'bacaBusur', nilai: 55 }), 55);
  assert.equal(v({ minta: 'cari', diketahui: { k: 0, nilai: 70 }, ditanya: 2 }), 70);
  assert.equal(v({ minta: 'cari', diketahui: { k: 0, nilai: 70 }, ditanya: 1 }), 110);
  assert.equal(v({ minta: 'cari', diketahui: { k: 3, nilai: 140 }, ditanya: 2 }), 40);
  assert.equal(v({ minta: 'jenis', mode: 'potong', pasangan: [1, 3] }), 'bertolakBelakang');
  assert.equal(v({ minta: 'jenis', sudut: [25, 65] }), 'berpenyiku');
  const alj = { minta: 'aljabar', relasi: 'bertolakBelakang', a: [2, 10], b: [3, -20] };
  assert.equal(v(Object.assign({ tanya: 'x' }, alj)), 30);
  assert.equal(v(Object.assign({ tanya: 'sudut' }, alj)), 70);
  const pel = { minta: 'aljabar', relasi: 'berpelurus', a: [3, 0], b: [1, 20], tanya: 'x' };
  assert.equal(v(pel), 40);
  const sik = { minta: 'aljabar', relasi: 'berpenyiku', a: [2, 0], b: [1, 0], tanya: 'sudut' };
  assert.equal(v(sik), 60);

  assert.equal(E.jawabSoalSudut({ cek: { minta: 'pelurus', sudut: 65 } }), '115°');
  assert.equal(E.jawabSoalSudut({ cek: Object.assign({ tanya: 'x' }, alj) }), 'x = 30');
  assert.equal(
    E.jawabSoalSudut({ cek: { minta: 'jenis', mode: 'potong', pasangan: [0, 2] } }),
    E.OPSI_JENIS_SUDUT.find((o) => o.id === 'bertolakBelakang').label
  );
});

test('periksaSoalSudut: benar, tidak terbaca, dan diagnosa miskonsepsi', () => {
  const p = (isian, cek) => E.periksaSoalSudut(isian, { cek });
  assert.equal(p('115', { minta: 'pelurus', sudut: 65 }).benar, true);
  assert.equal(p('115°', { minta: 'pelurus', sudut: 65 }).kode, 'benar');
  assert.equal(p('', { minta: 'pelurus', sudut: 65 }).kode, 'kosong');
  assert.equal(p('abc', { minta: 'pelurus', sudut: 65 }).kode, 'format');

  assert.equal(p('25', { minta: 'pelurus', sudut: 65 }).kode, 'tertukarPenyiku');
  assert.equal(p('65', { minta: 'pelurus', sudut: 65 }).kode, 'kiraSamaBesar');
  assert.equal(p('295', { minta: 'pelurus', sudut: 65 }).kode, 'kelilingPenuh');
  assert.equal(p('145', { minta: 'penyiku', sudut: 35 }).kode, 'tertukarPelurus');
  assert.equal(p('35', { minta: 'penyiku', sudut: 35 }).kode, 'kiraSamaBesar');
  assert.equal(p('68', { minta: 'tolakBelakang', sudut: 112 }).kode, 'kiraPelurus');
  assert.equal(p('80', { minta: 'jumlah', sudut: [50, 130] }).kode, 'selisih');
  assert.equal(p('125', { minta: 'bacaBusur', nilai: 55 }).kode, 'skalaTerbalik');
  assert.equal(p('0', { minta: 'pelurus', sudut: 65 }).kode, 'bukanSudut');
  assert.equal(p('-20', { minta: 'tolakBelakang', sudut: 40 }).kode, 'bukanSudut');
  assert.equal(p('100', { minta: 'pelurus', sudut: 65 }).kode, 'salah');

  const cari = { minta: 'cari', diketahui: { k: 0, nilai: 70 }, ditanya: 2 };
  assert.equal(p('110', cari).kode, 'kiraPelurus');
  const cari2 = { minta: 'cari', diketahui: { k: 0, nilai: 70 }, ditanya: 1 };
  assert.equal(p('70', cari2).kode, 'kiraSamaBesar');

  const alj = { minta: 'aljabar', relasi: 'bertolakBelakang', a: [2, 10], b: [3, -20] };
  assert.equal(p('70', Object.assign({ tanya: 'x' }, alj)).kode, 'sudutBukanX');
  assert.equal(p('30', Object.assign({ tanya: 'sudut' }, alj)).kode, 'xBukanSudut');
  const pel = { minta: 'aljabar', relasi: 'berpelurus', a: [3, 0], b: [1, 20], tanya: 'x' };
  assert.equal(p('10', pel).kode, 'relasiSalah', '3x = x + 20 → x = 10 (dikira sama besar)');

  const jenis = { minta: 'jenis', mode: 'potong', pasangan: [0, 2] };
  assert.equal(p('bertolakBelakang', jenis).benar, true);
  const salahJenis = p('berpelurus', jenis);
  assert.equal(salahJenis.benar, false);
  assert.ok(salahJenis.pesan.length > 10);

  /* Setiap kode punya pesan. */
  [
    'benar',
    'kosong',
    'format',
    'tertukarPenyiku',
    'tertukarPelurus',
    'kiraSamaBesar',
    'kiraPelurus',
    'kelilingPenuh',
    'selisih',
    'skalaTerbalik',
    'bukanSudut',
    'sudutBukanX',
    'xBukanSudut',
    'relasiSalah',
    'salah',
  ].forEach((k) => assert.ok(E.PESAN_SUDUT[k], 'pesan ' + k));
});

test('opsiSoalSudut: baku di depan, pengecoh dari miskonsepsi, label & id unik', () => {
  const cekList = [
    { minta: 'pelurus', sudut: 65 },
    { minta: 'penyiku', sudut: 35 },
    { minta: 'tolakBelakang', sudut: 112 },
    { minta: 'cari', diketahui: { k: 1, nilai: 125 }, ditanya: 3 },
    { minta: 'jumlah', sudut: [30, 60] },
    { minta: 'aljabar', relasi: 'bertolakBelakang', a: [2, 10], b: [3, -20], tanya: 'x' },
    { minta: 'aljabar', relasi: 'berpenyiku', a: [2, 0], b: [1, 0], tanya: 'sudut' },
    { minta: 'jenis', mode: 'potong', pasangan: [0, 1] },
    { minta: 'jenis', sudut: [40, 50] },
  ];
  cekList.forEach((cek) => {
    const s = { cek };
    const o = E.opsiSoalSudut(s);
    const n = JSON.stringify(cek);
    assert.ok(o.length >= 4, n + ': minimal 4 opsi');
    assert.equal(o[0].id, 'baku', n);
    assert.equal(o[0].label, E.jawabSoalSudut(s), n);
    assert.equal(new Set(o.map((x) => x.id)).size, o.length, n + ': id unik');
    assert.equal(new Set(o.map((x) => x.label)).size, o.length, n + ': label unik');
    o.forEach((x) => assert.ok(x.umpan, n + '.' + x.id + ': umpan'));
    if (cek.minta !== 'jenis') {
      o.slice(1).forEach((x) => {
        const isian = x.label.replace(/^x = /, '');
        assert.equal(E.periksaSoalSudut(isian, s).benar, false, n + ': pengecoh salah');
      });
    }
  });
  const pel = E.opsiSoalSudut({ cek: { minta: 'pelurus', sudut: 65 } });
  assert.ok(pel.some((x) => x.id === 'tertukarPenyiku' && x.label === '25°'));
  assert.ok(pel.some((x) => x.id === 'kiraSamaBesar' && x.label === '65°'));
});

test('pilihSudutAcak: kelipatan langkah, dalam rentang, bukan nilai terlarang', () => {
  for (let i = 0; i < 200; i++) {
    const v = E.pilihSudutAcak(20, 160, 5, [50, 90]);
    assert.equal(v % 5, 0);
    assert.ok(v >= 20 && v <= 160);
    assert.ok(v !== 50 && v !== 90);
  }
});

test('Lab Sudut: state, putar garis, baca busur, catat posisi', () => {
  const st = {};
  E.ensureLabSudut(st, CFG);
  assert.equal(st.mode, 'potong');
  assert.equal(st.t.potong, 50);
  assert.equal(st.t.siku, 30);
  assert.deepEqual(arr(st.baris), { potong: [], siku: [] });
  assert.equal(E.labSudutLengkap(st, CFG), false);

  /* Putar dengan stepper & seret (dibulatkan ke kelipatan 5, dibatasi). */
  assert.equal(E.ubahLabSudut(st, CFG, 1), true);
  assert.equal(st.t.potong, 55);
  E.aturLabSudut(st, CFG, 163);
  assert.equal(st.t.potong, 165);
  E.aturLabSudut(st, CFG, 250); /* sisi D: 250 − 180 = 70 */
  assert.equal(st.t.potong, 70);
  E.aturLabSudut(st, CFG, 3);
  assert.equal(st.t.potong, 15);
  assert.equal(E.ubahLabSudut(st, CFG, -1), false, 'sudah di batas bawah');
  E.aturLabSudut(st, CFG, 61);
  assert.equal(st.t.potong, 60);

  /* Baca busur: salah skala dicatat, benar tersimpan. */
  E.pilihUkurLabSudut(st, CFG, 1);
  assert.equal(st.aktif, 1);
  assert.equal(E.bacaBusurLabSudut(st, CFG, '').kode, 'kosong');
  assert.equal(st.percobaan, 0, 'isian kosong tidak dihitung');
  assert.equal(E.bacaBusurLabSudut(st, CFG, '60').kode, 'skalaTerbalik');
  assert.equal(st.salah, 1);
  assert.equal(E.bacaBusurLabSudut(st, CFG, '120').benar, true);
  assert.equal(st.baca[1], 120);
  assert.equal(st.aktif, 2, 'lanjut ke sudut berikutnya yang belum dibaca');
  assert.equal(E.catatLabSudut(st, CFG).kode, 'belum');
  E.bacaBusurLabSudut(st, CFG, '60');
  E.bacaBusurLabSudut(st, CFG, '120');
  assert.equal(st.aktif, 0);
  E.bacaBusurLabSudut(st, CFG, '60');
  assert.equal(E.posisiLabSudutTerukur(st, CFG), true);
  assert.equal(st.aktif, null);
  assert.equal(E.catatLabSudut(st, CFG).ok, true);
  assert.deepEqual(arr(st.baris.potong), [{ t: 60, sudut: [60, 120, 60, 120] }]);
  assert.deepEqual(arr(st.baca), {}, 'bacaan direset setelah dicatat');

  /* Posisi yang sama tidak dicatat dua kali. */
  [0, 1, 2, 3].forEach((k) => {
    E.pilihUkurLabSudut(st, CFG, k);
    E.bacaBusurLabSudut(st, CFG, String(E.sudutDuaGaris(60)[k]));
  });
  assert.equal(E.catatLabSudut(st, CFG).kode, 'sudahAda');

  /* Memutar garis mengosongkan bacaan posisi sebelumnya. */
  E.ubahLabSudut(st, CFG, 1);
  assert.deepEqual(arr(st.baca), {});
  assert.equal(st.aktif, null);

  /* Mode siku: dua sudut. */
  assert.equal(E.modeLabSudut(st, CFG, 'siku'), true);
  E.aturLabSudut(st, CFG, 100);
  assert.equal(st.t.siku, 80);
  E.aturLabSudut(st, CFG, 33);
  assert.equal(st.t.siku, 35);
  E.pilihUkurLabSudut(st, CFG, 0);
  E.bacaBusurLabSudut(st, CFG, '35');
  E.bacaBusurLabSudut(st, CFG, '55');
  assert.equal(E.catatLabSudut(st, CFG).ok, true);
  assert.deepEqual(arr(st.baris.siku), [{ t: 35, sudut: [35, 55] }]);

  /* Lengkap setelah minPosisi tiap mode. */
  st.baris.potong.push({ t: 40, sudut: [40, 140, 40, 140] }, { t: 110, sudut: [110, 70, 110, 70] });
  st.baris.siku.push({ t: 20, sudut: [20, 70] });
  assert.equal(E.labSudutLengkap(st, CFG), true);

  /* State rusak dipulihkan. */
  const rusak = { mode: 'aneh', t: { potong: 500 }, baris: null };
  E.ensureLabSudut(rusak, CFG);
  assert.equal(rusak.mode, 'potong');
  assert.equal(rusak.t.potong, 50);
  assert.deepEqual(arr(rusak.baris), { potong: [], siku: [] });
});

test('buildDuaGarisSVG: garis, label titik, label sudut, busur & pegangan', () => {
  const svg = E.buildDuaGarisSVG({ mode: 'potong', t: 50, label: ['50°', '?', null, '?'] });
  assert.match(svg, /^<svg[^>]*class="dua-garis"/);
  assert.match(svg, /role="img"/);
  ['A', 'B', 'C', 'D', 'O'].forEach((h) => assert.match(svg, new RegExp('>' + h + '<')));
  assert.match(svg, />50°</);
  assert.equal((svg.match(/>\?</g) || []).length, 2);
  assert.equal((svg.match(/dua-garis__busur-sudut/g) || []).length, 4);
  assert.doesNotMatch(svg, /dua-garis__busur-ukur/);
  assert.doesNotMatch(svg, /dua-garis__pegangan/);

  const ukur = E.buildDuaGarisSVG({ mode: 'potong', t: 50, busur: 1, pegangan: true, ketuk: true });
  assert.match(ukur, /dua-garis__busur-ukur/);
  assert.match(ukur, /dua-garis__pegangan/);
  assert.match(ukur, /role="slider"/);
  assert.match(ukur, /aria-valuenow="50"/);
  assert.equal((ukur.match(/data-ketuk-sudut="/g) || []).length, 4);
  assert.match(ukur, />180</, 'skala busur sampai 180');

  const siku = E.buildDuaGarisSVG({ mode: 'siku', t: 30, sorot: [0, 1] });
  assert.match(siku, />E</);
  assert.match(siku, /dua-garis__siku/);
  assert.equal((siku.match(/dua-garis__busur-sudut/g) || []).length, 2);
  assert.equal((siku.match(/is-sorot/g) || []).length, 2);
});

test('buildLabSudut & buildTabelLabSudut: kontrol, chip sudut, tabel pengamatan', () => {
  const st = {};
  E.ensureLabSudut(st, CFG);
  let html = E.buildLabSudut('ls', st, CFG);
  assert.match(html, /id="ls"/);
  assert.match(html, /data-mode-sudut="potong"/);
  assert.match(html, /data-mode-sudut="siku"/);
  assert.equal((html.match(/data-ukur-sudut="/g) || []).length, 4);
  assert.match(html, /id="lsPutarDec"/);
  assert.match(html, /id="lsPutarInc"/);
  assert.doesNotMatch(html, /id="lsBacaInput"/, 'belum ada sudut aktif');

  E.pilihUkurLabSudut(st, CFG, 0);
  html = E.buildLabSudut('ls', st, CFG);
  assert.match(html, /id="lsBacaInput"/);
  assert.match(html, /dua-garis__busur-ukur/);

  st.baris.potong.push({ t: 40, sudut: [40, 140, 40, 140] });
  const tabel = E.buildTabelLabSudut(st, CFG, 'potong');
  assert.match(tabel, /<table/);
  assert.match(tabel, />140°</);
  assert.match(tabel, /∠1/);
  assert.match(E.buildTabelLabSudut(st, CFG, 'siku'), /Belum ada/);
});
