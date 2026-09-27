'use strict';

/*
 * Tes shared/engine.js seksi 52 (membandingkan & mengurutkan bentuk
 * akar): bentuk akar { k, n, r } = k·ⁿ√r, teks & bacaan, perbandingan
 * EKSAK lewat pemangkatan ke KPK indeks, pengurutan & nilai ekstrem,
 * memasukkan koefisien ke dalam akar, menyamakan indeks, patokan
 * bilangan bulat (apit), empat strategi ahli Jigsaw, penjelasan,
 * diagnosa miskonsepsi, makna konteks, lab timbangan akar, serta
 * komponen render (kalimat banding, pilihan lambang, batang nilai).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function A(k, n, r) {
  return { k: k, n: n, r: r };
}

/* Bilangan bulat ditulis { k, n: 1, r: 1 }. */
function B(k) {
  return { k: k, n: 1, r: 1 };
}

/* ---------- teks, bacaan, nilai ---------- */

test('bentukAkar menormalkan bilangan bulat menjadi n = 1, r = 1', () => {
  assert.deepEqual(plain(E.bentukAkar(3, 2, 2)), A(3, 2, 2));
  assert.deepEqual(plain(E.bentukAkar(7, 2, 1)), B(7));
  assert.deepEqual(plain(E.bentukAkar(5)), B(5));
});

test('teksBentukAkar & bacaBentukAkar', () => {
  assert.equal(E.teksBentukAkar(A(3, 2, 2)), '3√2');
  assert.equal(E.teksBentukAkar(A(1, 3, 5)), '∛5');
  assert.equal(E.teksBentukAkar(A(1, 6, 8)), '⁶√8');
  assert.equal(E.teksBentukAkar(B(7)), '7');
  assert.equal(E.bacaBentukAkar(A(3, 2, 2)), '3 akar kuadrat dari 2');
  assert.equal(E.bacaBentukAkar(A(1, 3, 5)), 'akar pangkat tiga dari 5');
  assert.equal(E.bacaBentukAkar(B(7)), '7');
});

test('nilaiAkar memberi hampiran desimal', () => {
  assert.ok(Math.abs(E.nilaiAkar(A(3, 2, 2)) - 4.2426) < 1e-3);
  assert.ok(Math.abs(E.nilaiAkar(A(1, 3, 3)) - 1.4422) < 1e-3);
  assert.equal(E.nilaiAkar(B(7)), 7);
});

test('teksNilaiAkar memakai ≈ untuk nilai tidak bulat dan = untuk bulat', () => {
  assert.equal(E.teksNilaiAkar(A(3, 2, 2)), '≈ 4,24');
  assert.equal(E.teksNilaiAkar(A(1, 2, 49)), '= 7');
  assert.equal(E.teksNilaiAkar(B(7)), '= 7');
});

/* ---------- membandingkan secara eksak ---------- */

test('bandingAkar: indeks sama, radikan berbeda', () => {
  assert.equal(E.bandingAkar(A(1, 2, 7), A(1, 2, 11)), -1);
  assert.equal(E.bandingAkar(A(1, 3, 20), A(1, 3, 9)), 1);
});

test('bandingAkar: koefisien dimasukkan ke dalam akar', () => {
  assert.equal(E.bandingAkar(A(3, 2, 2), A(2, 2, 3)), 1); /* √18 > √12 */
  assert.equal(E.bandingAkar(A(2, 2, 5), A(1, 2, 20)), 0); /* √20 = √20 */
  assert.equal(E.bandingAkar(A(2, 2, 7), A(3, 2, 3)), 1); /* √28 > √27 */
});

test('bandingAkar: indeks berbeda disamakan dengan KPK', () => {
  assert.equal(E.bandingAkar(A(1, 2, 2), A(1, 3, 3)), -1); /* ⁶√8 < ⁶√9 */
  assert.equal(E.bandingAkar(A(1, 3, 5), A(1, 2, 5)), -1); /* radikan sama */
  assert.equal(E.bandingAkar(A(1, 2, 2), A(1, 4, 4)), 0);
});

test('bandingAkar: bilangan bulat dengan bentuk akar', () => {
  assert.equal(E.bandingAkar(B(7), A(1, 2, 50)), -1);
  assert.equal(E.bandingAkar(B(3), A(1, 3, 27)), 0);
  assert.equal(E.bandingAkar(B(4), A(1, 3, 60)), 1);
});

test('simbolBandingAkar & kalimatBandingAkar', () => {
  assert.equal(E.simbolBandingAkar(A(3, 2, 2), A(2, 2, 3)), 'gt');
  assert.equal(E.simbolBandingAkar(A(1, 2, 2), A(1, 3, 3)), 'lt');
  assert.equal(E.simbolBandingAkar(A(2, 2, 5), A(1, 2, 20)), 'eq');
  assert.equal(E.kalimatBandingAkar(A(3, 2, 2), A(2, 2, 3)), '3√2 > 2√3');
});

test('bandingAkar menolak nilai di luar bilangan bulat aman', () => {
  assert.throws(() => E.bandingAkar(A(90, 5, 97), A(1, 7, 99)));
});

/* ---------- mengurutkan ---------- */

const ITEMS = [
  { id: 'a', p: A(3, 2, 2) },
  { id: 'b', p: A(2, 2, 3) },
  { id: 'c', p: A(1, 2, 20) },
  { id: 'd', p: B(4) },
];

test('urutkanAkar & urutanIdAkar naik/turun', () => {
  assert.deepEqual(plain(E.urutanIdAkar(ITEMS, 'naik')), ['b', 'd', 'a', 'c']);
  assert.deepEqual(plain(E.urutanIdAkar(ITEMS, 'turun')), ['c', 'a', 'd', 'b']);
  const list = E.urutkanAkar([A(1, 2, 5), B(2), A(1, 3, 5)], 'naik');
  assert.deepEqual(plain(list), [A(1, 3, 5), B(2), A(1, 2, 5)]);
});

test('ekstremAkar; null bila nilai ekstrem kembar', () => {
  assert.equal(E.ekstremAkar(ITEMS, 'terbesar'), 'c');
  assert.equal(E.ekstremAkar(ITEMS, 'terkecil'), 'b');
  const kembar = [
    { id: 'x', p: A(2, 2, 5) },
    { id: 'y', p: A(1, 2, 20) },
    { id: 'z', p: B(1) },
  ];
  assert.equal(E.ekstremAkar(kembar, 'terbesar'), null);
});

/* ---------- langkah strategi ---------- */

test('masukkanKoefisien: k·ⁿ√r = ⁿ√(kⁿ·r); bilangan bulat memakai indeks tujuan', () => {
  assert.deepEqual(plain(E.masukkanKoefisien(A(3, 2, 2))), A(1, 2, 18));
  assert.deepEqual(plain(E.masukkanKoefisien(A(2, 3, 5))), A(1, 3, 40));
  assert.deepEqual(plain(E.masukkanKoefisien(B(7), 2)), A(1, 2, 49));
  assert.deepEqual(plain(E.masukkanKoefisien(B(3), 3)), A(1, 3, 27));
});

test('samakanIndeksAkar memakai KPK indeks', () => {
  const s = plain(E.samakanIndeksAkar(A(1, 2, 2), A(1, 3, 3)));
  assert.equal(s.L, 6);
  assert.deepEqual(s.p, A(1, 6, 8));
  assert.deepEqual(s.q, A(1, 6, 9));
  const t = plain(E.samakanIndeksAkar(A(2, 2, 3), A(1, 3, 5)));
  assert.deepEqual(t.p, A(1, 6, 1728)); /* (√12)… = ⁶√(12³) */
  assert.deepEqual(t.q, A(1, 6, 25));
});

test('apitAkar: dua bilangan bulat berurutan yang mengapit', () => {
  assert.deepEqual(plain(E.apitAkar(A(1, 2, 50))), { bawah: 7, atas: 8, bulat: false });
  assert.deepEqual(plain(E.apitAkar(A(3, 2, 2))), { bawah: 4, atas: 5, bulat: false });
  assert.deepEqual(plain(E.apitAkar(A(1, 3, 30))), { bawah: 3, atas: 4, bulat: false });
  assert.deepEqual(plain(E.apitAkar(A(1, 2, 49))), { bawah: 7, atas: 7, bulat: true });
  assert.deepEqual(plain(E.apitAkar(B(4))), { bawah: 4, atas: 4, bulat: true });
});

test('patokanAkar: bilangan bulat pemisah atau null', () => {
  assert.equal(E.patokanAkar(B(7), A(1, 2, 50)), 7);
  assert.equal(E.patokanAkar(A(1, 2, 10), A(1, 3, 20)), 3);
  assert.equal(E.patokanAkar(A(1, 2, 2), A(1, 3, 3)), null); /* keduanya di antara 1 dan 2 */
  assert.equal(E.patokanAkar(A(2, 2, 5), A(1, 2, 20)), null); /* sama nilainya */
});

/* ---------- strategi ahli ---------- */

test('STRATEGI_BANDING_AKAR memuat empat kartu ahli lengkap', () => {
  const ids = E.STRATEGI_BANDING_AKAR.map((s) => s.id);
  assert.deepEqual(plain(ids), ['indeksSama', 'masukkanKoefisien', 'samakanIndeks', 'patokan']);
  E.STRATEGI_BANDING_AKAR.forEach((s) => {
    ['ikon', 'nama', 'ringkas', 'tugas', 'kunci'].forEach((k) => assert.ok(s[k], s.id + '.' + k));
  });
  assert.equal(E.strategiAkarInfo('patokan').id, 'patokan');
  assert.equal(E.strategiAkarInfo('tidakAda'), null);
  const opsi = E.opsiStrategiBandingAkar();
  assert.equal(opsi.length, 4);
  assert.match(opsi[0].label, /Ahli/);
});

test('strategiBerlakuAkar & strategiBandingAkar (tercepat di depan)', () => {
  assert.deepEqual(plain(E.strategiBerlakuAkar(A(1, 2, 7), A(1, 2, 8))), ['indeksSama']);
  assert.deepEqual(plain(E.strategiBerlakuAkar(A(1, 2, 7), A(1, 2, 20))), [
    'indeksSama',
    'patokan',
  ]);
  assert.deepEqual(plain(E.strategiBerlakuAkar(A(2, 2, 7), A(3, 2, 3))), ['masukkanKoefisien']);
  /* 2√3 = √12 < 4 < √18 = 3√2 → patokan juga berlaku. */
  assert.deepEqual(plain(E.strategiBerlakuAkar(A(3, 2, 2), A(2, 2, 3))), [
    'masukkanKoefisien',
    'patokan',
  ]);
  assert.deepEqual(plain(E.strategiBerlakuAkar(A(1, 2, 2), A(1, 3, 3))), ['samakanIndeks']);
  assert.deepEqual(plain(E.strategiBerlakuAkar(A(1, 2, 10), A(1, 3, 20))), [
    'patokan',
    'samakanIndeks',
  ]);
  assert.deepEqual(plain(E.strategiBerlakuAkar(B(7), A(1, 2, 50))), [
    'patokan',
    'masukkanKoefisien',
  ]);
  assert.equal(E.strategiBandingAkar(A(3, 2, 2), A(2, 2, 3)), 'masukkanKoefisien');
  assert.equal(E.strategiBandingAkar(A(1, 2, 2), A(1, 3, 3)), 'samakanIndeks');
  /* ∛5 < 2 < √5 → patokan lebih cepat daripada KPK indeks. */
  assert.equal(E.strategiBandingAkar(A(1, 3, 5), A(1, 2, 5)), 'patokan');
});

test('penjelasanStrategiAkar menuliskan langkah tiap strategi', () => {
  assert.match(E.penjelasanStrategiAkar('indeksSama', A(1, 2, 7), A(1, 2, 11)), /7 < 11/);
  const mk = E.penjelasanStrategiAkar('masukkanKoefisien', A(3, 2, 2), A(2, 2, 3));
  assert.match(mk, /3√2 = √\(3²·2\) = √18/);
  assert.match(mk, /3√2 > 2√3/);
  const si = E.penjelasanStrategiAkar('samakanIndeks', A(1, 2, 2), A(1, 3, 3));
  assert.match(si, /KPK/);
  assert.match(si, /⁶√8/);
  assert.match(si, /⁶√9/);
  assert.match(si, /√2 < ∛3/);
  const pt = E.penjelasanStrategiAkar('patokan', B(7), A(1, 2, 50));
  assert.match(pt, /7² = 49 < 50 < 64 = 8²/);
  assert.match(pt, /7 < √50/);
});

/* ---------- diagnosa miskonsepsi ---------- */

test('diagnosaBandingAkar mengenali miskonsepsi khas', () => {
  const p = A(3, 2, 2);
  const q = A(2, 2, 3);
  assert.equal(E.diagnosaBandingAkar(p, q, 'gt'), 'benar');
  assert.equal(E.diagnosaBandingAkar(p, q, 'eq'), 'kaliKoefisien'); /* √6 = √6 */
  assert.equal(E.diagnosaBandingAkar(p, q, 'lt'), 'radikanSaja');
  assert.equal(E.diagnosaBandingAkar(A(1, 3, 5), A(1, 2, 5), 'gt'), 'indeksBesar');
  assert.equal(E.diagnosaBandingAkar(A(2, 2, 7), A(3, 2, 3), 'lt'), 'koefisienSaja');
  assert.equal(E.diagnosaBandingAkar(A(1, 2, 16), B(5), 'gt'), 'setengah');
  assert.equal(E.diagnosaBandingAkar(A(1, 2, 7), A(1, 2, 11), 'gt'), 'terbalik');
});

test('pesanBandingAkar tidak membocorkan lambang benar', () => {
  ['kaliKoefisien', 'radikanSaja', 'indeksBesar', 'koefisienSaja', 'setengah', 'terbalik'].forEach(
    (kode) => {
      const m = E.pesanBandingAkar(kode, A(3, 2, 2), A(2, 2, 3));
      assert.ok(m.length > 20, kode);
      assert.doesNotMatch(m, /3√2 > 2√3/, kode);
    }
  );
  assert.match(E.pesanBandingAkar('benar', A(3, 2, 2), A(2, 2, 3)), /3√2 > 2√3/);
});

/* ---------- makna konteks ---------- */

test('idMaknaBandingAkar & opsiMaknaBandingAkar', () => {
  assert.equal(E.idMaknaBandingAkar(A(3, 2, 2), A(2, 2, 3)), 'besar');
  assert.equal(E.idMaknaBandingAkar(A(1, 2, 2), A(1, 3, 3)), 'kecil');
  assert.equal(E.idMaknaBandingAkar(A(2, 2, 5), A(1, 2, 20)), 'sama');
  const opsi = plain(E.opsiMaknaBandingAkar('panjang'));
  assert.deepEqual(
    opsi.map((o) => o.id),
    ['kecil', 'besar', 'sama']
  );
  assert.equal(opsi[1].label, 'lebih panjang');
  assert.equal(E.maknaBandingAkar(A(3, 2, 2), A(2, 2, 3), 'panjang'), 'lebih panjang');
});

/* ---------- lab timbangan akar ---------- */

test('lab timbangan: batas stepper & catatan strategi', () => {
  const st = E.makeLabTimbanganAkarState();
  assert.equal(E.strategiBandingAkar(st.p, st.q), 'indeksSama');
  E.catatLabTimbanganAkar(st);
  assert.deepEqual(plain(st.strategi), ['indeksSama']);
  E.ubahLabTimbanganAkar(st, 'p', 'k', 1);
  assert.equal(st.p.k, 2);
  E.catatLabTimbanganAkar(st);
  assert.ok(st.strategi.includes(E.strategiBandingAkar(st.p, st.q)));
  const B_ = E.LAB_TIMBANGAN_AKAR_BATAS;
  st.q.n = B_.nMaks;
  E.ubahLabTimbanganAkar(st, 'q', 'n', 1);
  assert.equal(st.q.n, B_.nMaks);
  st.q.r = B_.rMin;
  E.ubahLabTimbanganAkar(st, 'q', 'r', -1);
  assert.equal(st.q.r, B_.rMin);
  E.catatLabTimbanganAkar(st);
  E.catatLabTimbanganAkar(st);
  assert.equal(new Set(st.strategi).size, st.strategi.length, 'tanpa duplikat');
});

test('buildLabTimbanganAkar menampilkan lambang, strategi, dan chip temuan', () => {
  const st = E.makeLabTimbanganAkarState();
  E.catatLabTimbanganAkar(st);
  const html = E.buildLabTimbanganAkar('lab', st, { target: 3 });
  assert.match(html, /class="akr-lab"/);
  assert.match(html, /data-lab-id="lab"/);
  assert.match(html, /akr-lab__sym/);
  assert.equal((html.match(/akr-lab__chip/g) || []).length, 4);
  assert.equal((html.match(/is-found/g) || []).length, 1);
  assert.match(html, /minimal 3/);
});

/* ---------- komponen render ---------- */

test('akarHTML memakai tanda akar ber-vinculum dan label bacaan', () => {
  const h = E.akarHTML(A(3, 2, 2));
  assert.match(h, /class="akr"/);
  assert.match(h, /aria-label="3 akar kuadrat dari 2"/);
  assert.match(h, /class="akar"/);
  assert.match(E.akarHTML(A(1, 3, 5)), /akar__indeks">3</);
  assert.doesNotMatch(E.akarHTML(B(7)), /class="akar"/);
});

test('buildKalimatBandingAkar: kotak ? sebelum dijawab, lambang sesudahnya', () => {
  const kosong = E.buildKalimatBandingAkar(A(3, 2, 2), A(2, 2, 3), null);
  assert.match(kosong, /cmp-sentence__sym">\?/);
  const isi = E.buildKalimatBandingAkar(A(3, 2, 2), A(2, 2, 3), 'gt');
  assert.match(isi, /is-filled">&gt;/);
  assert.match(isi, /lebih dari/);
});

test('buildPilihSimbolAkar mengikuti urutan acak dari state dan mengunci saat benar', () => {
  const p = A(3, 2, 2);
  const q = A(2, 2, 3);
  const order = ['eq', 'gt', 'lt'];
  const st = { chosen: null, wrong: 0, diag: null };
  const html = E.buildPilihSimbolAkar(p, q, order, st, { group: 's1' });
  const pos = order.map((id) => html.indexOf('data-akr-sym="' + id + '"'));
  assert.ok(pos[0] > -1 && pos[0] < pos[1] && pos[1] < pos[2], 'urutan tombol = order');
  E.catatPilihSimbolAkar(st, p, q, 'eq');
  assert.equal(st.wrong, 1);
  assert.equal(st.diag, 'kaliKoefisien');
  E.catatPilihSimbolAkar(st, p, q, 'gt');
  assert.equal(st.chosen, 'gt');
  assert.equal(st.diag, null);
  E.catatPilihSimbolAkar(st, p, q, 'lt');
  assert.equal(st.chosen, 'gt', 'terkunci setelah benar');
  assert.match(E.buildPilihSimbolAkar(p, q, order, st, { group: 's1' }), /disabled/);
});

test('buildBatangAkar: batang sebanding nilai, terpanjang 100%', () => {
  const html = E.buildBatangAkar([
    { p: A(1, 2, 2), nama: 'A' },
    { p: B(2), nama: 'B' },
  ]);
  assert.equal((html.match(/akr-batang__bar"/g) || []).length, 2);
  assert.match(html, /width:100%/);
  assert.match(html, /≈ 1,41/);
});
