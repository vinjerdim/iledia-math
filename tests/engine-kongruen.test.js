'use strict';

/*
 * Tes fungsi murni kekongruenan bangun datar (shared/engine.js seksi 26):
 * pengukuran sisi & sudut, transformasi jiplakan (putar/balik/geser),
 * deteksi berimpit, korespondensi titik sudut bersesuaian, klasifikasi
 * kongruen/sebangun, logika kertas jiplak dan alat ukur.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(v) {
  return JSON.parse(JSON.stringify(v));
}

function dekat(a, b, tol) {
  return Math.abs(a - b) <= (tol || 1e-6);
}

/* Trapesium siku-siku ABCD (satuan cm, sumbu y ke bawah). */
const P = {
  id: 'p',
  titik: ['A', 'B', 'C', 'D'],
  pts: [
    [0, 4],
    [6, 4],
    [3, 0],
    [0, 0],
  ],
};
/* P diputar 90° searah jarum jam, titik didaftar mulai dari bayangan D. */
const Q = {
  id: 'q',
  titik: ['K', 'L', 'M', 'N'],
  pts: [
    [4, 0],
    [0, 0],
    [0, 6],
    [4, 3],
  ],
};
/* P dicerminkan (dibalik). */
const R = {
  id: 'r',
  titik: ['P', 'Q', 'R', 'S'],
  pts: [
    [0, 0],
    [6, 0],
    [3, 4],
    [0, 4],
  ],
};
/* P diperbesar 1,5 kali. */
const S = {
  id: 's',
  titik: ['E', 'F', 'G', 'H'],
  pts: [
    [0, 6],
    [9, 6],
    [4.5, 0],
    [0, 0],
  ],
};
/* Trapesium lain dengan luas sama. */
const T = {
  id: 't',
  titik: ['T', 'U', 'V', 'W'],
  pts: [
    [0, 4],
    [6, 4],
    [4.5, 0],
    [1.5, 0],
  ],
};

test('jarakTitik, sisiPoligon & kelilingPoligon', () => {
  assert.equal(E.jarakTitik([0, 0], [3, 4]), 5);
  assert.deepEqual(plain(E.sisiPoligon(P.pts)), [6, 5, 3, 4]);
  assert.equal(E.kelilingPoligon(P.pts), 18);
});

test('sudutPoligon: sudut dalam tiap titik sudut, jumlahnya (n − 2) × 180°', () => {
  const a = E.sudutPoligon(P.pts);
  assert.ok(dekat(a[0], 90));
  assert.ok(dekat(a[1], 53.130102, 1e-4));
  assert.ok(dekat(a[2], 126.869898, 1e-4));
  assert.ok(dekat(a[3], 90));
  assert.ok(dekat(a[0] + a[1] + a[2] + a[3], 360));
  /* arah penulisan titik (searah/berlawanan jarum jam) tidak berpengaruh */
  const balik = E.sudutPoligon(P.pts.slice().reverse());
  assert.ok(dekat(balik[0], a[3]) && dekat(balik[3], a[0]));
  const segitiga = E.sudutPoligon([
    [0, 0],
    [4, 0],
    [0, 3],
  ]);
  assert.ok(dekat(segitiga[0] + segitiga[1] + segitiga[2], 180));
});

test('pusatPoligon = rata-rata titik sudut', () => {
  assert.deepEqual(
    plain(
      E.pusatPoligon([
        [0, 0],
        [4, 0],
        [4, 2],
        [0, 2],
      ])
    ),
    [2, 1]
  );
});

test('transformPoligon: putar, balik, dan geser terhadap pusat', () => {
  const persegi = [
    [0, 0],
    [2, 0],
    [2, 1],
    [0, 1],
  ];
  const putar = E.transformPoligon(persegi, { rotasi: 90 });
  /* pusat tetap (1, 0.5); lebar 2 menjadi tinggi 2 */
  assert.ok(dekat(putar[0][0], 1.5) && dekat(putar[0][1], -0.5));
  assert.ok(
    E.poligonBerimpit(putar, [
      [0.5, -0.5],
      [1.5, -0.5],
      [1.5, 1.5],
      [0.5, 1.5],
    ])
  );
  const cermin = E.transformPoligon(
    [
      [0, 0],
      [3, 0],
      [0, 1],
    ],
    { cermin: true }
  );
  assert.ok(
    E.poligonBerimpit(cermin, [
      [2, 0],
      [-1, 0],
      [2, 1],
    ])
  );
  const geser = E.transformPoligon(persegi, { geser: [5, -1] });
  assert.deepEqual(plain(geser[2]), [7, 0]);
});

test('poligonBerimpit: himpunan titik sama tanpa memandang urutan', () => {
  assert.ok(
    E.poligonBerimpit(
      [
        [0, 0],
        [1, 0],
        [0, 1],
      ],
      [
        [1, 0],
        [0, 1],
        [0, 0],
      ]
    )
  );
  assert.ok(
    !E.poligonBerimpit(
      [
        [0, 0],
        [1, 0],
        [0, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
      ]
    )
  );
  assert.ok(
    !E.poligonBerimpit(
      [
        [0, 0],
        [1, 0],
        [0, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [0, 1],
        [1, 1],
      ]
    )
  );
  assert.ok(E.poligonBerimpit([[0, 0]], [[0.001, 0]], 0.01));
});

test('cariKorespondensi: titik sudut bersesuaian & faktor skala', () => {
  const kq = E.cariKorespondensi(P.pts, Q.pts, { kongruen: true });
  assert.ok(kq);
  assert.deepEqual(plain(kq.map), [1, 2, 3, 0], 'A↔L, B↔M, C↔N, D↔K');
  assert.ok(dekat(kq.skala, 1));
  const kr = E.cariKorespondensi(P.pts, R.pts, { kongruen: true });
  assert.deepEqual(plain(kr.map), [0, 1, 2, 3], 'bayangan cermin: P↔A, Q↔B, R↔C, S↔D');
  assert.equal(kr.arah, -1, 'arah keliling titik sudut terbalik');
  const ks = E.cariKorespondensi(P.pts, S.pts);
  assert.deepEqual(plain(ks.map), [0, 1, 2, 3]);
  assert.ok(dekat(ks.skala, 1.5));
  assert.equal(E.cariKorespondensi(P.pts, S.pts, { kongruen: true }), null);
  assert.equal(E.cariKorespondensi(P.pts, T.pts), null);
  assert.equal(
    E.cariKorespondensi(P.pts, [
      [0, 0],
      [1, 0],
      [0, 1],
    ]),
    null,
    'banyak titik beda'
  );
});

test('klasifikasiBangun: kongruen, sebangun, atau tidak', () => {
  assert.equal(E.klasifikasiBangun(P.pts, Q.pts), 'kongruen');
  assert.equal(E.klasifikasiBangun(P.pts, R.pts), 'kongruen');
  assert.equal(E.klasifikasiBangun(P.pts, S.pts), 'sebangun');
  assert.equal(E.klasifikasiBangun(P.pts, T.pts), 'tidak');
  /* persegi & belah ketupat bersisi sama: sisi sama, sudut beda */
  const persegi = [
    [0, 0],
    [4, 0],
    [4, 4],
    [0, 4],
  ];
  const belahKetupat = [
    [0, 0],
    [4, 0],
    [6, 2 * Math.sqrt(3)],
    [2, 2 * Math.sqrt(3)],
  ];
  assert.equal(E.klasifikasiBangun(persegi, belahKetupat), 'tidak');
  /* persegi panjang sama luas, beda ukuran */
  assert.equal(
    E.klasifikasiBangun(
      [
        [0, 0],
        [6, 0],
        [6, 2],
        [0, 2],
      ],
      [
        [0, 0],
        [4, 0],
        [4, 3],
        [0, 3],
      ]
    ),
    'tidak'
  );
});

test('posisiJiplak & jiplakBerimpit: jiplakan ditempel di pusat bangun sasaran', () => {
  const pos = E.posisiJiplak(P.pts, Q.pts, 0, false);
  const c1 = E.pusatPoligon(pos);
  const c2 = E.pusatPoligon(Q.pts);
  assert.ok(dekat(c1[0], c2[0]) && dekat(c1[1], c2[1]));
  assert.ok(!E.jiplakBerimpit(P.pts, Q.pts, 0, false));
  assert.ok(E.jiplakBerimpit(P.pts, Q.pts, 90, false));
  assert.ok(!E.jiplakBerimpit(P.pts, R.pts, 90, false));
  assert.ok(E.jiplakBerimpit(P.pts, P.pts, 0, false));
});

test('cariPosisiBerimpit: putaran berlangkah & balik yang membuat berimpit', () => {
  assert.deepEqual(plain(E.cariPosisiBerimpit(P.pts, Q.pts, 90)), { rotasi: 90, cermin: false });
  const r = E.cariPosisiBerimpit(P.pts, R.pts, 90);
  assert.ok(r && r.cermin === true);
  assert.ok(E.jiplakBerimpit(P.pts, R.pts, r.rotasi, r.cermin));
  assert.equal(E.cariPosisiBerimpit(P.pts, S.pts, 90), null);
  assert.equal(E.cariPosisiBerimpit(P.pts, T.pts, 90), null);
});

test('jiplakAksi: logika tombol kertas jiplak', () => {
  const st = E.makeJiplakState();
  assert.deepEqual(plain(st), {
    dijiplak: false,
    target: null,
    rotasi: 0,
    cermin: false,
    berimpit: {},
  });
  E.jiplakAksi(st, 'jiplak');
  assert.equal(st.dijiplak, true);
  assert.equal(st.target, 'asal');
  E.jiplakAksi(st, 'kiri', 90);
  assert.equal(st.rotasi, 270);
  E.jiplakAksi(st, 'kanan', 90);
  E.jiplakAksi(st, 'kanan', 90);
  assert.equal(st.rotasi, 90);
  E.jiplakAksi(st, 'balik');
  assert.equal(st.cermin, true);
  E.jiplakAksi(st, 'tempel', 90, 'q');
  assert.equal(st.target, 'q');
  assert.equal(st.rotasi, 90, 'menempel tidak mengubah putaran');
  E.jiplakAksi(st, 'kembali');
  assert.deepEqual([st.target, st.rotasi, st.cermin], ['asal', 0, false]);
});

test('perbaruiBerimpit mencatat bangun yang pernah berimpit', () => {
  const st = E.makeJiplakState();
  const cari = { asal: P, q: Q };
  E.jiplakAksi(st, 'jiplak');
  E.jiplakAksi(st, 'tempel', 90, 'q');
  assert.equal(E.perbaruiBerimpit(st, P, cari), false);
  E.jiplakAksi(st, 'kanan', 90);
  assert.equal(E.perbaruiBerimpit(st, P, cari), true);
  assert.equal(st.berimpit.q, true);
  E.jiplakAksi(st, 'kanan', 90);
  assert.equal(E.perbaruiBerimpit(st, P, cari), false);
  assert.equal(st.berimpit.q, true, 'catatan tetap tersimpan');
});

test('format & nama sisi/sudut', () => {
  assert.equal(E.formatPanjang(6), '6 cm');
  assert.equal(E.formatPanjang(4.2426), '4,2 cm');
  assert.equal(E.formatSudut(53.13), '53°');
  assert.equal(E.namaSisi(P.titik, 3), 'DA');
  assert.equal(E.namaSudut(P.titik, 1), '∠B');
});

test('ukurItems & ukurItem: alat ukur sisi dan sudut', () => {
  const items = E.ukurItems(P);
  assert.equal(items.length, 8);
  assert.deepEqual(plain(items[0]), { id: 's0', jenis: 'sisi', idx: 0, nama: 'AB', nilai: 6 });
  assert.equal(items[4].id, 'a0');
  assert.equal(items[4].nama, '∠A');
  const st = E.makeUkurState();
  assert.equal(E.banyakTerukur(P, st), 0);
  E.ukurItem(st, 's1');
  E.ukurItem(st, 's1');
  assert.equal(st.terakhir, 's1');
  assert.equal(E.banyakTerukur(P, st), 1);
  items.forEach((it) => E.ukurItem(st, it.id));
  assert.ok(E.ukurSelesai(P, st));
  E.ukurItem(st, 'x9');
  assert.equal(E.banyakTerukur(P, st), 8, 'id asing diabaikan');
});

test('barisBersesuaian & notasiBersesuaian', () => {
  const k = E.cariKorespondensi(P.pts, Q.pts, { kongruen: true });
  const rows = E.barisBersesuaian(P, Q, k.map);
  assert.equal(rows.length, 8);
  assert.deepEqual(
    plain(rows.filter((r) => r.jenis === 'sisi').map((r) => r.namaP + '=' + r.namaQ)),
    ['AB=LM', 'BC=MN', 'CD=NK', 'DA=KL']
  );
  rows.forEach((r) => assert.ok(dekat(r.nilaiP, r.nilaiQ, 1e-9), r.namaP));
  assert.equal(rows[4].namaQ, '∠L');
  assert.equal(E.notasiBersesuaian(P, Q, k.map, '≅'), 'ABCD ≅ LMNK');
  const ks = E.cariKorespondensi(P.pts, S.pts);
  const rs = E.barisBersesuaian(P, S, ks.map);
  assert.ok(dekat(rs[0].rasio, 1.5));
  assert.ok(dekat(rs[5].rasio, 1), 'sudut bersesuaian sama besar');
});

test('buildShapeSVG & papan: markup dasar tersusun', () => {
  const svg = E.buildShapeSVG(P, { tampilSisi: 'semua', tampilSudut: [0], tanyaSisi: 2 });
  assert.match(svg, /<svg/);
  assert.match(svg, /6 cm/);
  assert.match(svg, /\?/);
  const st = E.makeJiplakState();
  E.jiplakAksi(st, 'jiplak');
  const board = E.buildTracingBoard('tb', P, [Q, S], st, { langkah: 90 });
  assert.match(board, /data-jiplak-aksi="kanan"/);
  assert.match(board, /data-jiplak-tempel="q"/);
  const ukur = E.buildMeasureBoard('ub', P, E.makeUkurState(), {});
  assert.match(ukur, /data-ukur-id="s0"/);
  assert.match(ukur, /data-ukur-id="a3"/);
  const k = E.cariKorespondensi(P.pts, S.pts);
  const tabel = E.buildCompareTable(P, S, k.map, { rasio: true });
  assert.match(tabel, /<table/);
  assert.match(tabel, /1,5/);
});
