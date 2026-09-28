'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Matematika: Masalah Kontekstual Luas Permukaan Limas
   Fase D — SMP Kelas IX · Topik 22 Prisma dan Limas

   Utilitas & komponen bersama berada di shared/engine.js:
   esc, shuffleArray, showNotice, buildFeedbackBox, formatRupiah,
   createStageMachine, createExerciseStage, createStore,
   ensureExerciseArray, optionIds, komponen umum (ensureShuffledOrder,
   buildDiscoveryHead, buildTeacherNote, buildTpPanel, buildChoiceGroup,
   buildDlPanel, buildDlNextButton, findOptionLabel, ensureSortStates,
   buildSortItems, bindSortItems, sortItemsAllAnswered,
   sortItemsCorrectCount, ensureTapOrderState, buildTapOrder,
   bindTapOrder, buildGuidedQuizList, bindGuidedQuizList,
   guidedQuizAllCorrect, buildGuidedChoiceFeedback), kartu isian bagian
   47 (ensureLpIsianState, buildLpIsian, bindLpIsian, lpKartuBenar,
   lppAngka, lppBulat), komponen masalah kontekstual bagian 48
   (banyakWadah, konversiLuas, rekapAnggaran, lpkSaring,
   pengecohBanyakWadah, pengecohKonversiLuas, ensureLpSisiState,
   buildLpAnggaran, buildLpProposal), kartu surat bagian 49
   (buildSuratCard), luas permukaan limas bagian 57
   (kandidatLuasPermukaanLimas), serta komponen masalah kontekstual
   limas bagian 58 (rincianObjekLimas, luasSisiDipakaiLimas,
   lmkUkuranAtap, pengecohTinggiSisi, kandidatMasalahLimas,
   diagnosaMasalahLimas, lmkPesan, ensureLmkAtapState, buildLmkAtapLab,
   bindLmkAtapLab, buildLmkSisiPicker, bindLmkSisiPicker,
   buildLmkLimasSVG).

   Alur tahap mengikuti sintaks Problem Based Learning; lihat komentar
   kepala pada data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI saat
   state disiapkan (initExerciseArrays), lalu urutannya disimpan di
   State — bukan saat render — sehingga pilihan tidak melompat-lompat
   ketika tahap dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta, hitungan kunci & kartu isian
    2. State & Storage
    3. Navigasi
    4. Utilitas Render
    5. Stage: Orientasi Masalah     (PBL sintaks 1)
    6. Stage: Organisasi            (PBL sintaks 2)
    7. Stage: Penyelidikan Atap     (PBL sintaks 3)
    8. Stage: Penyelidikan Sisi     (PBL sintaks 3)
    9. Stage: Penyelidikan Anggaran (PBL sintaks 3)
   10. Stage: Menyajikan Karya      (PBL sintaks 4)
   11. Stage: Analisis & Evaluasi   (PBL sintaks 5)
   12. Stage: Uji Terap
   13. Stage: Refleksi
   14. Stage: Selesai
   15. Router Render
   16. Helper UI (modal reset)
   17. Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA, HITUNGAN KUNCI & KARTU ISIAN
   ============================================================ */

var STAGES = [
  'orientasi',
  'organisasi',
  'selidikAtap',
  'selidikSisi',
  'selidikBiaya',
  'karya',
  'evaluasi',
  'terapkan',
  'refleksi',
  'selesai',
];
var STAGE_LABELS = [
  'Masalah',
  'Organisasi',
  'Atap',
  'Sisi Bahan',
  'Anggaran',
  'Karya',
  'Evaluasi',
  'Uji Terap',
  'Refleksi',
  'Selesai',
];
var STORAGE_KEY = 'mpi-22-8-masalah-limas-v1';

var ATAP = DATA.atap;
var BENDA_BY_ID = {};
DATA.benda.forEach(function (b) {
  BENDA_BY_ID[b.id] = b;
});
var DESAIN_BY_ID = {};
ATAP.desain.forEach(function (d) {
  DESAIN_BY_ID[d.id] = d;
});

/* Limas atap satu desain (untuk gambar 3D). */
function limasAtap(d) {
  return { nama: d.nama, n: ATAP.n, s: ATAP.sisi, t: d.t };
}

function gambarLimas(o, skala, garis) {
  return (
    '<div class="psm-stage lpp-stage lmk-gambar">' +
    buildLmkLimasSVG(o, { skala: skala || 60, garis: !!garis }) +
    '</div>'
  );
}

/* Pengecoh { nilai, pesan } dikali faktor (mis. harga), tetap berdiagnosa. */
function kaliPengecoh(list, faktor) {
  return list.map(function (p) {
    return { nilai: lppBulat(p.nilai * faktor), pesan: p.pesan };
  });
}

/* Pengecoh kartu isian dari kandidat soal kontekstual limas (engine seksi 58). */
function pengecohKandidat(cek, faktor) {
  var k = kandidatMasalahLimas(cek);
  return lpkSaring(
    Object.keys(k)
      .filter(function (kode) {
        return kode !== 'benar';
      })
      .map(function (kode) {
        return { nilai: lppBulat(k[kode] * (faktor || 1)), pesan: lmkPesan(kode) };
      }),
    lppBulat(k.benar * (faktor || 1))
  );
}

function cekDipakai(b) {
  return { jenis: 'dipakai', limas: b, pakai: b.dipakai };
}

/* Semua hitungan kunci masalah pojok baca, dari DATA + engine seksi 48, 57, 58. */
var HITUNG = (function () {
  var h = { desain: {} };
  ATAP.desain.forEach(function (d) {
    h.desain[d.id] = lmkUkuranAtap(ATAP, d.t);
  });
  h.pilih = h.desain[DATA.atapDipilih];

  var atap = BENDA_BY_ID.atap;
  h.luasAtap = luasSisiDipakaiLimas(atap, atap.dipakai);
  h.bagiGenteng = lppBulat(h.luasAtap / DATA.genteng.luas);
  h.lembarGenteng = banyakWadah(h.luasAtap, DATA.genteng.luas);
  h.biayaGenteng = h.lembarGenteng * DATA.genteng.harga;

  var tenda = BENDA_BY_ID.tenda;
  h.tsTenda = tinggiSisiLimasPersegiPanjang(tenda.p, tenda.l, tenda.t);
  h.kain = luasSisiDipakaiLimas(tenda, tenda.dipakai);
  h.biayaKain = lppBulat(h.kain * DATA.kain.harga);

  var kotak = BENDA_BY_ID.kotak;
  h.tsKotak = tinggiSisiTegakLimas(kotak.t, kotak.s / 2);
  h.lpKotak = luasSisiDipakaiLimas(kotak, kotak.dipakai);
  h.totalKarton = h.lpKotak * DATA.banyakSuvenir;
  h.kartonM = konversiLuas(h.totalKarton, 'cm²', 'm²');
  h.luasLembarKarton = DATA.karton.panjang * DATA.karton.lebar;
  h.lembarKarton = banyakWadah(h.totalKarton, h.luasLembarKarton);
  h.biayaKarton = h.lembarKarton * DATA.karton.harga;

  var L = DATA.karya.lantai;
  var bl = BENDA_BY_ID[L.benda];
  h.kainLantai = luasSisiDipakaiLimas(bl, bl.dipakai.concat([L.tambah]));
  h.biayaKainLantai = lppBulat(h.kainLantai * DATA.kain.harga);
  return h;
})();

function barisAnggaran(kain, biayaKain) {
  return [
    {
      id: 'genteng',
      nama: '🏠 Genteng atap ' + DATA.atapDipilih,
      rincian: HITUNG.lembarGenteng + ' lembar × ' + formatRupiah(DATA.genteng.harga),
      biaya: HITUNG.biayaGenteng,
    },
    {
      id: 'kain',
      nama: '⛺ Kain tenda dongeng',
      rincian: lppAngka(kain) + ' m² × ' + formatRupiah(DATA.kain.harga),
      biaya: biayaKain,
    },
    {
      id: 'karton',
      nama: '🎁 Karton ' + DATA.banyakSuvenir + ' kotak suvenir',
      rincian: HITUNG.lembarKarton + ' lembar × ' + formatRupiah(DATA.karton.harga),
      biaya: HITUNG.biayaKarton,
    },
  ];
}

var ANGGARAN_AWAL = barisAnggaran(HITUNG.kain, HITUNG.biayaKain);
var ANGGARAN_LANTAI = barisAnggaran(HITUNG.kainLantai, HITUNG.biayaKainLantai);
var REKAP_AWAL = rekapAnggaran(ANGGARAN_AWAL, DATA.dana);

/* Tahap 3 — kartu data satu desain atap. */
function buatKartuAtap(d, i) {
  var u = HITUNG.desain[d.id];
  var sat = ATAP.satuan;
  var luasAlas = ATAP.sisi * ATAP.sisi;
  return {
    id: 'atap-' + d.id,
    judul: d.nama + ' · ' + d.gaya + ', tinggi ' + lppAngka(d.t) + ' ' + sat,
    visual:
      '<div class="lpp-data-visual">' +
      gambarLimas(limasAtap(d), 55, true) +
      '<p class="dl-caption">Alas persegi ' +
      lppAngka(ATAP.sisi) +
      ' m × ' +
      lppAngka(ATAP.sisi) +
      ' m, tinggi atap (TO) ' +
      lppAngka(d.t) +
      ' m. TP adalah tinggi sisi tegak tₛ.</p></div>',
    hints: [
      'a = setengah rusuk alas = ' + lppAngka(ATAP.sisi) + ' : 2 = ' + lppAngka(u.a) + ' m.',
      'tₛ = √(t² + a²) = √(' + lppAngka(d.t) + '² + ' + lppAngka(u.a) + '²).',
      'Bagian bawah atap terbuka: luas atap = ½ × keliling alas × tₛ = ½ × ' +
        lppAngka(u.keliling) +
        ' × tₛ.',
    ],
    temuan:
      '<strong>' +
      esc(d.nama) +
      ':</strong> tₛ = ' +
      esc(lppAngka(u.ts)) +
      ' m, luas atap ' +
      esc(lppAngka(u.luas)) +
      ' m² → ' +
      u.lembar +
      ' lembar genteng. ' +
      (u.memenuhi ? '✓ Memenuhi' : '✗ Belum memenuhi') +
      ' syarat tinggi ≥ ' +
      esc(lppAngka(ATAP.syaratMin)) +
      ' m.',
    fields: [
      i === 0
        ? {
            id: 'a',
            label: 'Setengah rusuk alas (a)',
            jawab: u.a,
            satuan: sat,
            pengecoh: [
              {
                nilai: ATAP.sisi,
                pesan:
                  'Itu rusuk alas utuh. a adalah SETENGAH rusuk alas, yaitu jarak dari tengah alas ke tengah rusuk.',
              },
            ],
          }
        : { id: 'a', label: 'Setengah rusuk alas (a)', jawab: u.a, satuan: sat, diberikan: true },
      { id: 't', label: 'Tinggi atap (t)', jawab: d.t, satuan: sat, diberikan: true },
      {
        id: 'ts',
        label: 'Tinggi sisi tegak (tₛ)',
        jawab: u.ts,
        satuan: sat,
        pengecoh: pengecohTinggiSisi(d.t, u.a),
      },
      {
        id: 'luas',
        label: '<strong>Luas atap</strong>',
        jawab: u.luas,
        satuan: sat + '²',
        pengecoh: pengecohKandidat({
          jenis: 'lp',
          luasAlas: luasAlas,
          kelilingAlas: u.keliling,
          tinggiSisi: u.ts,
          tinggiLimas: d.t,
          sisiAlas: ATAP.sisi,
          tanpaAlas: true,
        }),
      },
    ],
  };
}

/* Tahap 4 — kartu luas bahan satu benda (muncul setelah sisinya tepat). */
function buatKartuBahan(b) {
  var luas = luasSisiDipakaiLimas(b, b.dipakai);
  var fields = [];
  if (b.id === 'tenda') {
    var ts = HITUNG.tsTenda;
    fields.push(
      {
        id: 'tsP',
        label: 'tₛ dinding pada rusuk ' + lppAngka(b.p) + ' m',
        jawab: ts[0],
        satuan: 'm',
        pengecoh: pengecohTinggiSisi(b.t, b.l / 2),
      },
      {
        id: 'tsL',
        label: 'tₛ dinding pada rusuk ' + lppAngka(b.l) + ' m',
        jawab: ts[1],
        satuan: 'm',
        pengecoh: pengecohTinggiSisi(b.t, b.p / 2),
      }
    );
  }
  if (b.id === 'kotak') {
    fields.push({
      id: 'ts',
      label: 'Tinggi sisi tegak (tₛ)',
      jawab: HITUNG.tsKotak,
      satuan: 'cm',
      pengecoh: pengecohTinggiSisi(b.t, b.s / 2),
    });
  }
  var pengecoh = pengecohKandidat(cekDipakai(b));
  if (b.id === 'tenda') {
    var satuTs = function (tsSatu) {
      return {
        nilai: lppBulat((b.p + b.l) * tsSatu),
        pesan:
          'Kamu memakai satu tₛ untuk keempat dinding. Pada alas persegi panjang, dinding pada rusuk panjang dan rusuk pendek punya tₛ berbeda.',
      };
    };
    pengecoh = lpkSaring(
      pengecoh.concat([
        {
          nilai: lppBulat(4 * 0.5 * b.p * HITUNG.tsTenda[0]),
          pesan:
            'Kamu menghitung empat dinding yang sama. Dinding pada rusuk ' +
            lppAngka(b.l) +
            ' m alasnya ' +
            lppAngka(b.l) +
            ' m dan tₛ-nya ' +
            lppAngka(HITUNG.tsTenda[1]) +
            ' m.',
        },
        satuTs(HITUNG.tsTenda[0]),
        satuTs(HITUNG.tsTenda[1]),
      ]),
      luas
    );
  }
  fields.push({
    id: 'luas',
    label: '<strong>Luas ' + esc(b.bahan) + '</strong>',
    jawab: luas,
    satuan: b.satuanLuas,
    angka: true,
    pengecoh: pengecoh,
  });
  return {
    id: 'bahan-' + b.id,
    judul: 'Luas ' + b.bahan + ' yang dibutuhkan',
    hints: [b.infoLuas],
    temuan:
      '<strong>' +
      esc(lppAngka(luas) + ' ' + b.satuanLuas) +
      '</strong> ' +
      esc(b.bahan) +
      ' untuk ' +
      esc(b.nama.replace(/^\S+\s/, '').toLowerCase()) +
      '.',
    fields: fields,
  };
}

/* Tahap 5 — kartu banyak bahan & biaya. */
function buatKartuBiaya() {
  var H = HITUNG;
  var tenda = BENDA_BY_ID.tenda;
  var genteng = {
    id: 'biaya-genteng',
    judul: '🏠 Genteng atap ' + DATA.atapDipilih,
    hints: [
      'Banyak lembar = luas atap : luas satu lembar = ' +
        lppAngka(H.luasAtap) +
        ' : ' +
        lppAngka(DATA.genteng.luas) +
        ', lalu bulatkan KE ATAS.',
      'Biaya = banyak lembar × harga satu lembar.',
    ],
    fields: [
      { id: 'luas', label: 'Luas atap', jawab: H.luasAtap, satuan: 'm²', diberikan: true },
      {
        id: 'daya',
        label: 'Satu lembar menutup',
        jawab: DATA.genteng.luas,
        satuan: 'm²',
        diberikan: true,
      },
      {
        id: 'lembar',
        label: 'Banyak lembar yang dibeli',
        jawab: H.lembarGenteng,
        satuan: 'lembar',
        angka: true,
        pengecoh: pengecohBanyakWadah(H.luasAtap, DATA.genteng.luas),
      },
      {
        id: 'biaya',
        label: 'Biaya genteng',
        jawab: H.biayaGenteng,
        awalan: 'Rp',
        angka: true,
        pengecoh: kaliPengecoh(
          pengecohBanyakWadah(H.luasAtap, DATA.genteng.luas),
          DATA.genteng.harga
        ),
      },
    ],
  };
  var kain = {
    id: 'biaya-kain',
    judul: '⛺ Kain tenda dongeng',
    hints: ['Biaya = luas kain × harga per m².'],
    fields: [
      { id: 'luas', label: 'Luas kain', jawab: H.kain, satuan: 'm²', diberikan: true },
      {
        id: 'harga',
        label: 'Harga kain',
        jawab: DATA.kain.harga,
        awalan: 'Rp',
        satuan: 'per m²',
        diberikan: true,
      },
      {
        id: 'biaya',
        label: 'Biaya kain',
        jawab: H.biayaKain,
        awalan: 'Rp',
        angka: true,
        pengecoh: pengecohKandidat(cekDipakai(tenda), DATA.kain.harga),
      },
    ],
  };
  var pesanDijumlah =
    'Luas satu kotak dan banyak kotak dijumlahkan. Luas karton semua kotak = luas satu kotak × banyak kotak.';
  var karton = {
    id: 'biaya-karton',
    judul: '🎁 Karton untuk ' + DATA.banyakSuvenir + ' kotak suvenir',
    hints: [
      'Luas karton semua kotak = ' + H.lpKotak + ' × ' + DATA.banyakSuvenir + '.',
      '1 m² = 10.000 cm², jadi luas dalam m² = luas dalam cm² : 10.000.',
      'Banyak lembar = luas karton semua kotak : luas satu lembar, lalu bulatkan KE ATAS.',
    ],
    fields: [
      { id: 'lp', label: 'Karton satu kotak', jawab: H.lpKotak, satuan: 'cm²', diberikan: true },
      {
        id: 'n',
        label: 'Banyak kotak',
        jawab: DATA.banyakSuvenir,
        satuan: 'kotak',
        diberikan: true,
      },
      {
        id: 'total',
        label: 'Luas karton semua kotak',
        jawab: H.totalKarton,
        satuan: 'cm²',
        angka: true,
        pengecoh: lpkSaring(
          [
            { nilai: H.lpKotak + DATA.banyakSuvenir, pesan: pesanDijumlah },
            { nilai: H.lpKotak, pesan: LPK_PESAN['lupa-banyak'] },
          ],
          H.totalKarton
        ),
      },
      {
        id: 'm',
        label: 'Luas karton dalam m² (untuk laporan)',
        jawab: H.kartonM,
        satuan: 'm²',
        pengecoh: pengecohKonversiLuas(H.totalKarton, 'cm²', 'm²'),
      },
      {
        id: 'lembarLuas',
        label: 'Luas satu lembar (' + DATA.karton.panjang + ' × ' + DATA.karton.lebar + ')',
        jawab: H.luasLembarKarton,
        satuan: 'cm²',
        diberikan: true,
      },
      {
        id: 'lembar',
        label: 'Banyak lembar yang dibeli',
        jawab: H.lembarKarton,
        satuan: 'lembar',
        angka: true,
        pengecoh: pengecohBanyakWadah(H.totalKarton, H.luasLembarKarton),
      },
      {
        id: 'biaya',
        label: 'Biaya karton',
        jawab: H.biayaKarton,
        awalan: 'Rp',
        angka: true,
        pengecoh: kaliPengecoh(
          pengecohBanyakWadah(H.totalKarton, H.luasLembarKarton),
          DATA.karton.harga
        ),
      },
    ],
  };
  return [genteng, kain, karton];
}

var KARTU_ATAP = ATAP.desain.map(buatKartuAtap);
var KARTU_BAHAN = {};
DATA.benda.forEach(function (b) {
  KARTU_BAHAN[b.id] = buatKartuBahan(b);
});
var KARTU_BAHAN_LIST = DATA.benda.map(function (b) {
  return KARTU_BAHAN[b.id];
});
var KARTU_BIAYA = buatKartuBiaya();

function itemPilah(list) {
  return list.map(function (it) {
    return {
      id: it.id,
      correct: it.correct,
      explanation: esc(it.explanation),
      teks: esc(it.teks),
    };
  });
}

var PILAH_ITEMS = itemPilah(DATA.organisasi.pilah);
var LANGKAH_ITEMS = itemPilah(DATA.evaluasi.langkah);
var RENCANA_ITEMS = DATA.organisasi.rencana.map(function (r) {
  return { id: r.id, label: esc(r.label) };
});
var RENCANA_JAWAB = optionIds(DATA.organisasi.rencana);

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Tahap 1 — orientasi */
  dugaanOrders: {},
  dugaanPilih: {},
  orientasiAlasan: '',
  masalahOrder: null,
  masalahPilihan: null,
  masalahHipotesis: '',

  /* Tahap 2 — organisasi */
  peranOrder: null,
  peranPilih: null,
  pilahStates: {},
  pilahOrder: null,
  rencanaState: null,

  /* Tahap 3 — atap */
  labAtap: null,
  isianAtap: null,
  atapOrders: {},
  atapPilih: {},

  /* Tahap 4 — sisi bahan */
  sisi: null,
  isianBahan: null,
  sisiOrders: {},
  sisiPilih: {},

  /* Tahap 5 — anggaran */
  isianBiaya: null,
  biayaOrders: {},
  biayaPilih: {},

  /* Tahap 6 — karya */
  karyaOrders: {},
  karyaPilih: {},
  presentasi: '',

  /* Tahap 7 — evaluasi */
  langkahStates: {},
  langkahOrder: null,
  evalOrders: {},
  evalPilih: {},
  evalRefleksi: '',

  /* Tahap 8 — uji terap */
  terapkanIdx: 0,
  terapkanExercises: [],

  /* Tahap 9 — refleksi */
  refleksiAnswers: {},
  refleksiDiri: null,
  refleksiDiriOrder: null,
};

var Store = createStore({ key: STORAGE_KEY, state: State });
var saveState = Store.save;
var loadState = Store.load;

function clearState() {
  Store.reset();
  initExerciseArrays();
}

function isPlainObject(v) {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function ensureObject(key) {
  if (!isPlainObject(State[key])) State[key] = {};
}

/* Urutan acak opsi untuk setiap pertanyaan dalam `list`. */
function ensureGuidedOrders(orderKey, pilihKey, list) {
  ensureObject(orderKey);
  ensureObject(pilihKey);
  list.forEach(function (q) {
    ensureShuffledOrder(State[orderKey], q.id, q.opsi);
  });
}

/*
 * Menyiapkan seluruh state per-soal DAN seluruh urutan acak pilihan
 * jawaban. Dipanggil sekali saat init (setelah loadState) dan setiap
 * kali progress direset.
 */
function initExerciseArrays() {
  /* Tahap 1 */
  ensureGuidedOrders('dugaanOrders', 'dugaanPilih', DATA.orientasi.dugaan);
  ensureShuffledOrder(State, 'masalahOrder', DATA.orientasi.masalahOpsi);

  /* Tahap 2 */
  ensureShuffledOrder(State, 'peranOrder', DATA.organisasi.peran);
  ensureSortStates(State, 'pilahStates', 'pilahOrder', PILAH_ITEMS, DATA.organisasi.opsiPilah);
  ensureTapOrderState(State, 'rencanaState', RENCANA_ITEMS, RENCANA_JAWAB);

  /* Tahap 3 */
  ensureLmkAtapState(State, 'labAtap', ATAP);
  ensureLpIsianState(State, 'isianAtap', KARTU_ATAP);
  ensureGuidedOrders('atapOrders', 'atapPilih', DATA.selidikAtap.tanya);

  /* Tahap 4 */
  ensureLpSisiState(State, 'sisi', DATA.benda);
  ensureLpIsianState(State, 'isianBahan', KARTU_BAHAN_LIST);
  ensureGuidedOrders('sisiOrders', 'sisiPilih', DATA.selidikSisi.tanya);

  /* Tahap 5 */
  ensureLpIsianState(State, 'isianBiaya', KARTU_BIAYA);
  ensureGuidedOrders('biayaOrders', 'biayaPilih', DATA.selidikBiaya.tanya);

  /* Tahap 6 */
  ensureGuidedOrders('karyaOrders', 'karyaPilih', DATA.karya.tanya);

  /* Tahap 7 */
  ensureSortStates(State, 'langkahStates', 'langkahOrder', LANGKAH_ITEMS, DATA.evaluasi.opsiNilai);
  ensureGuidedOrders('evalOrders', 'evalPilih', DATA.evaluasi.tanya);

  /* Tahap 8 — uji terap (dirender createExerciseStage) */
  ensureExerciseArray(State, 'terapkanExercises', DATA.terapkan.soal, function (q) {
    return {
      attempts: 0,
      hintLevel: 0,
      hintShown: false,
      correct: false,
      userInput: '',
      revealed: false,
      chosen: null,
      checked: false,
      optionOrder: q.options ? shuffleArray(optionIds(q.options)) : null,
    };
  });
  if (State.terapkanIdx >= DATA.terapkan.soal.length || State.terapkanIdx < 0) {
    State.terapkanIdx = 0;
  }

  /* Tahap 9 */
  ensureShuffledOrder(State, 'refleksiDiriOrder', DATA.refleksi.diriOpsi);
  ensureObject('refleksiAnswers');
}

/* ============================================================
   3. NAVIGASI
   ============================================================ */

var StageMachine = createStageMachine({
  stages: STAGES,
  stageLabels: STAGE_LABELS,
  state: State,
  save: saveState,
  render: renderCurrentStage,
});

var navigateTo = StageMachine.navigateTo;
var completeStage = StageMachine.completeStage;
var updateStageNav = StageMachine.updateStageNav;
var buildStageNav = StageMachine.buildStageNav;
var updateProgress = StageMachine.updateProgress;

/* ============================================================
   4. UTILITAS RENDER
   ============================================================ */

/* Kepala tahap + catatan peran guru. */
function buildHead(D) {
  return buildDiscoveryHead(D.kicker, D.goal, D.syntax) + buildTeacherNote(D.guru);
}

/* Memasang tombol lanjut yang menyelesaikan tahap ini lalu pindah tahap. */
function bindNext(id, stageId, nextStageId) {
  var btn = document.getElementById(id);
  if (!btn) return;
  btn.addEventListener('click', function () {
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

function panelJudul(judul, inner, cls) {
  return buildDlPanel('<h3 style="margin-top:0;">' + esc(judul) + '</h3>' + inner, cls);
}

function caption(teks) {
  return '<p class="dl-caption">' + esc(teks) + '</p>';
}

function paragrafInfo(teks) {
  return buildDlPanel('<p style="margin:0;">' + esc(teks) + '</p>', 'panel--info');
}

function daftarTemuan(teks) {
  return (
    '<div style="margin-top:var(--space-4);">' + buildFeedbackBox('success', '🔎', teks) + '</div>'
  );
}

function buildTextarea(id, label, placeholder, value) {
  return (
    '<div class="field-group">' +
    '<label for="' +
    id +
    '">' +
    esc(label) +
    '</label>' +
    '<textarea id="' +
    id +
    '" class="input-textarea" placeholder="' +
    esc(placeholder) +
    '">' +
    esc(value || '') +
    '</textarea>' +
    '</div>'
  );
}

/* Memasang textarea yang menyimpan isinya ke State[key]. */
function bindTextarea(id, key) {
  var ta = document.getElementById(id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    saveState();
  });
}

function semuaKartuBenar(list, stMap) {
  return list.every(function (k) {
    return lpKartuBenar(k, stMap[k.id]);
  });
}

function banyakKartuBenar(list, stMap) {
  return list.filter(function (k) {
    return lpKartuBenar(k, stMap[k.id]);
  }).length;
}

/* Umpan pertanyaan penuntun di-escape sekali (teks polos di DATA). */
function tanyaAman(list) {
  return list.map(function (q) {
    var umpan = {};
    Object.keys(q.umpan).forEach(function (k) {
      umpan[k] = esc(q.umpan[k]);
    });
    return {
      id: q.id,
      tanya: esc(q.tanya),
      opsi: q.opsi.map(function (o) {
        return { id: o.id, label: esc(o.label) };
      }),
      correct: q.correct,
      umpan: umpan,
    };
  });
}

var TANYA = {
  atap: tanyaAman(DATA.selidikAtap.tanya),
  sisi: tanyaAman(DATA.selidikSisi.tanya),
  biaya: tanyaAman(DATA.selidikBiaya.tanya),
  karya: tanyaAman(DATA.karya.tanya),
  evaluasi: tanyaAman(DATA.evaluasi.tanya),
};

/* ============================================================
   5. STAGE: ORIENTASI MASALAH  (PBL — sintaks 1)
   Dugaan TIDAK dinilai; rumusan masalah dinilai dengan umpan balik.
   ============================================================ */

function dugaanLengkap() {
  return DATA.orientasi.dugaan.every(function (q) {
    return !!State.dugaanPilih[q.id];
  });
}

function renderOrientasi(container) {
  var D = DATA.orientasi;
  var lengkap = dugaanLengkap();
  var benar = State.masalahPilihan === D.masalahCorrect;
  var umpan = {};
  Object.keys(D.masalahUmpan).forEach(function (k) {
    umpan[k] = esc(D.masalahUmpan[k]);
  });
  var masalahOpsi = D.masalahOpsi.map(function (o) {
    return { id: o.id, label: esc(o.label) };
  });

  var dugaanHTML = D.dugaan
    .map(function (q, i) {
      return (
        '<div class="quiz-item">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        esc(q.tanya) +
        '</p>' +
        buildChoiceGroup(q.opsi, State.dugaanOrders[q.id], {
          chosen: State.dugaanPilih[q.id] || null,
          group: q.id,
          attr: 'data-dugaan',
        }) +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    '<section aria-label="Orientasi Masalah">' +
    buildHead(D) +
    buildDlPanel(
      '<h2 style="margin-top:0;">🏡 ' +
        esc(D.judul) +
        '</h2>' +
        '<p class="orientasi-cerita">' +
        esc(D.pengantar) +
        '</p>' +
        '<div class="lpp-galeri">' +
        ATAP.desain
          .map(function (d) {
            return (
              '<figure class="lpp-galeri__item">' +
              gambarLimas(limasAtap(d), 42) +
              '<figcaption>' +
              esc(d.nama) +
              '<span>' +
              esc('tinggi ' + lppAngka(d.t) + ' m · ' + d.gaya) +
              '</span></figcaption></figure>'
            );
          })
          .join('') +
        '</div>' +
        '<h3 class="surat-head">✉️ Surat dari OSIS</h3>' +
        '<div class="surat-grid">' +
        D.surat.map(buildSuratCard).join('') +
        '</div>',
      'panel--hero'
    ) +
    buildTpPanel(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🤔 Apa dugaan kelompokmu?</h3>' +
        caption(D.catatanDugaan) +
        dugaanHTML +
        '<div style="margin-top:var(--space-5);">' +
        buildTextarea(
          'orientasiAlasan',
          D.alasanLabel,
          D.alasanPlaceholder,
          State.orientasiAlasan
        ) +
        '</div>'
    ) +
    (lengkap
      ? buildDlPanel(
          '<h3 style="margin-top:0;">🎯 Rumuskan masalahnya</h3>' +
            '<p class="exercise-label">' +
            esc(D.pertanyaan) +
            '</p>' +
            buildChoiceGroup(masalahOpsi, State.masalahOrder, {
              chosen: State.masalahPilihan,
              correctId: benar ? D.masalahCorrect : null,
              grade: true,
              locked: benar,
              attr: 'data-masalah',
            }) +
            buildGuidedChoiceFeedback(State.masalahPilihan, benar, umpan) +
            (benar
              ? '<div style="margin-top:var(--space-4);">' +
                buildTextarea(
                  'masalahHipotesis',
                  D.hipotesisLabel,
                  D.hipotesisPlaceholder,
                  State.masalahHipotesis
                ) +
                '</div>'
              : '')
        )
      : '') +
    (lengkap && benar ? buildDlNextButton('orientasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-dugaan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.dugaanPilih[btn.dataset.group] = btn.dataset.dugaan;
      saveState();
      renderOrientasi(container);
      var f = container.querySelector(
        '[data-group="' + btn.dataset.group + '"][data-dugaan="' + btn.dataset.dugaan + '"]'
      );
      if (f) f.focus();
    });
  });

  container.querySelectorAll('[data-masalah]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (State.masalahPilihan === D.masalahCorrect) return;
      State.masalahPilihan = btn.dataset.masalah;
      saveState();
      renderOrientasi(container);
      var f = container.querySelector('[data-masalah="' + btn.dataset.masalah + '"]');
      if (f) f.focus();
    });
  });

  bindTextarea('orientasiAlasan', 'orientasiAlasan');
  bindTextarea('masalahHipotesis', 'masalahHipotesis');

  var nextBtn = document.getElementById('orientasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.masalahHipotesis.trim()) {
        showNotice('Tulis hipotesis kelompokmu lebih dulu, walau hanya satu kalimat.');
        return;
      }
      completeStage('orientasi');
      navigateTo('organisasi');
    });
  }
}

/* ============================================================
   6. STAGE: ORGANISASI  (PBL — sintaks 2)
   Pilih peran → pilah informasi → susun rencana penyelesaian.
   ============================================================ */

function renderOrganisasi(container) {
  var D = DATA.organisasi;
  var rerender = function () {
    renderOrganisasi(container);
  };
  var peranOk = !!State.peranPilih;
  var pilahOk = sortItemsAllAnswered(PILAH_ITEMS, State.pilahStates);
  var rencanaOk = State.rencanaState.correct;

  container.innerHTML =
    '<section aria-label="Mengorganisasi Belajar">' +
    buildHead(D) +
    buildDlPanel(
      '<h3 style="margin-top:0;">👥 ' +
        esc(D.peranLabel) +
        '</h3>' +
        buildChoiceGroup(D.peran, State.peranOrder, {
          chosen: State.peranPilih,
          attr: 'data-peran',
        }) +
        (peranOk
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              'info',
              '🙌',
              'Peranmu: ' +
                findOptionLabel(D.peran, State.peranPilih) +
                ' Tukar peran pada pertemuan berikutnya.'
            ) +
            '</div>'
          : '')
    ) +
    (peranOk
      ? panelJudul(
          '🗂️ ' + D.judulPilah,
          buildSortItems(PILAH_ITEMS, State.pilahOrder, D.opsiPilah, State.pilahStates) +
            (pilahOk
              ? daftarTemuan(
                  '<strong>' +
                    sortItemsCorrectCount(PILAH_ITEMS, State.pilahStates) +
                    ' dari ' +
                    PILAH_ITEMS.length +
                    '</strong> informasi kamu pilah dengan tepat.'
                )
              : '')
        )
      : '') +
    (peranOk && pilahOk
      ? panelJudul(
          '🗺️ ' + D.judulRencana,
          caption(D.instruksiRencana) +
            buildTapOrder('rencana', RENCANA_ITEMS, State.rencanaState, {
              answer: RENCANA_JAWAB,
              startLabel: 'Langkah pertama',
              endLabel: 'Langkah terakhir',
              separator: '→',
              successText: D.rencanaSukses,
            })
        )
      : '') +
    (peranOk && pilahOk && rencanaOk ? buildDlNextButton('organisasiNextBtn', D.nextLabel) : '') +
    '</section>';

  container.querySelectorAll('[data-peran]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.peranPilih = btn.dataset.peran;
      saveState();
      rerender();
      var f = container.querySelector('[data-peran="' + btn.dataset.peran + '"]');
      if (f) f.focus();
    });
  });
  if (peranOk) bindSortItems(container, PILAH_ITEMS, State.pilahStates, saveState, rerender);
  if (peranOk && pilahOk) {
    bindTapOrder(container, 'rencana', State.rencanaState, RENCANA_JAWAB, saveState, rerender);
  }
  bindNext('organisasiNextBtn', 'organisasi', 'selidikAtap');
}

/* ============================================================

/* ============================================================
   7. STAGE: PENYELIDIKAN 1 — DESAIN ATAP  (PBL — sintaks 3)
   Lab Atap (eksplorasi tinggi → tₛ → luas) → kartu data tiga desain
   → keputusan. Pertanyaan keputusan terbuka setelah kartu data tuntas
   dan ketiga desain dicoba di Lab Atap.
   ============================================================ */

function semuaDesainDicoba() {
  return ATAP.desain.every(function (d) {
    return State.labAtap.dicoba.indexOf(d.id) !== -1;
  });
}

function renderSelidikAtap(container) {
  var D = DATA.selidikAtap;
  var dataOk = semuaKartuBenar(KARTU_ATAP, State.isianAtap);
  var labOk = semuaDesainDicoba();
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.atapPilih);

  function rerender() {
    renderSelidikAtap(container);
  }

  var html =
    '<section aria-label="Penyelidikan Desain Atap">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    buildDlPanel(
      '<h3 style="margin-top:0;">🔬 Lab Atap</h3>' +
        caption(D.instruksiLab) +
        buildLmkAtapLab('labAtap', State.labAtap, ATAP)
    ) +
    panelJudul(
      '🧮 Kartu data desain atap',
      caption(D.instruksiData) + buildLpIsian('isAtap', KARTU_ATAP, State.isianAtap)
    );

  if (dataOk && !labOk) {
    html += buildDlPanel(
      buildFeedbackBox(
        'info',
        '🔬',
        'Kartu data tuntas! Coba ketiga desain di Lab Atap (ketuk tombol Atap A, B, dan C) untuk membuka pertanyaan keputusan.'
      )
    );
  }

  if (dataOk && labOk) {
    html += panelJudul(
      '🔎 Ambil keputusan',
      buildGuidedQuizList(TANYA.atap, State.atapOrders, State.atapPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (dataOk && labOk && tanyaOk ? buildDlNextButton('atapNextBtn', D.nextLabel, true) : '') +
    '</section>';

  container.innerHTML = html;

  bindLmkAtapLab(container, 'labAtap', State.labAtap, ATAP, function () {
    var sebelum = labOk;
    saveState();
    if (!sebelum && semuaDesainDicoba() && dataOk) rerender();
  });
  bindLpIsian(container, 'isAtap', KARTU_ATAP, State.isianAtap, saveState, rerender);
  bindGuidedQuizList(container, TANYA.atap, State.atapPilih, saveState, rerender);
  bindNext('atapNextBtn', 'selidikAtap', 'selidikSisi');
}

/* ============================================================
   8. STAGE: PENYELIDIKAN 2 — SISI YANG MEMAKAI BAHAN  (PBL — sintaks 3)
   Tiap benda: cerita → pemilih sisi limas → kartu luas bahan. Benda
   berikutnya dibuka setelah kartu benda sebelumnya tepat.
   ============================================================ */

function bendaSelesai(b) {
  return (
    State.sisi[b.id].benar &&
    lpKartuBenar(KARTU_BAHAN[b.id], State.isianBahan[KARTU_BAHAN[b.id].id])
  );
}

function renderSelidikSisi(container) {
  var D = DATA.selidikSisi;
  var semua = DATA.benda.every(bendaSelesai);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.sisiPilih);

  function rerender() {
    renderSelidikSisi(container);
  }

  var html =
    '<section aria-label="Penyelidikan Sisi yang Memakai Bahan">' +
    buildHead(D) +
    paragrafInfo(D.instruksi);
  var terbuka = [];
  for (var i = 0; i < DATA.benda.length; i++) {
    var b = DATA.benda[i];
    terbuka.push(b);
    var st = State.sisi[b.id];
    html += buildDlPanel(
      '<div class="benda-head">' +
        '<div class="benda-head__gambar" aria-hidden="true">' +
        gambarLimas(b, 42) +
        '</div>' +
        '<div><h3 style="margin:0;">' +
        esc(b.nama) +
        '</h3><p class="benda-head__cerita">' +
        esc(b.cerita) +
        '</p></div>' +
        '</div>' +
        '<p class="exercise-label">Sisi mana saja yang memakai ' +
        esc(b.bahan) +
        '?</p>' +
        buildLmkSisiPicker('ps-' + b.id, b, st) +
        (st.benar
          ? '<div style="margin-top:var(--space-4);">' +
            buildLpIsian('isB-' + b.id, [KARTU_BAHAN[b.id]], State.isianBahan) +
            '</div>'
          : '')
    );
    if (!bendaSelesai(b)) break;
  }

  if (semua) {
    html += panelJudul(
      '🔎 Apa yang kamu temukan?',
      buildGuidedQuizList(TANYA.sisi, State.sisiOrders, State.sisiPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (semua && tanyaOk ? buildDlNextButton('sisiNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  terbuka.forEach(function (b) {
    bindLmkSisiPicker(container, 'ps-' + b.id, b, State.sisi[b.id], saveState, rerender);
    bindLpIsian(
      container,
      'isB-' + b.id,
      [KARTU_BAHAN[b.id]],
      State.isianBahan,
      saveState,
      rerender
    );
  });
  bindGuidedQuizList(container, TANYA.sisi, State.sisiPilih, saveState, rerender);
  bindNext('sisiNextBtn', 'selidikSisi', 'selidikBiaya');
}

/* ============================================================
   9. STAGE: PENYELIDIKAN 3 — BAHAN & ANGGARAN  (PBL — sintaks 3)
   Kartu banyak bahan & biaya → tabel anggaran → pertanyaan penuntun.
   ============================================================ */

function renderSelidikBiaya(container) {
  var D = DATA.selidikBiaya;
  var kartuOk = semuaKartuBenar(KARTU_BIAYA, State.isianBiaya);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.biayaPilih);

  function rerender() {
    renderSelidikBiaya(container);
  }

  var html =
    '<section aria-label="Penyelidikan Bahan dan Anggaran">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul('🧾 Kartu bahan & biaya', buildLpIsian('isA', KARTU_BIAYA, State.isianBiaya));

  if (kartuOk) {
    html += panelJudul(
      '💰 Anggaran sementara',
      buildLpAnggaran(ANGGARAN_AWAL, DATA.dana) +
        '<div style="margin-top:var(--space-3);">' +
        buildFeedbackBox(
          REKAP_AWAL.cukup ? 'success' : 'warning',
          REKAP_AWAL.cukup ? '✓' : '⚠',
          REKAP_AWAL.cukup
            ? '<strong>Dana cukup, sisa ' +
                esc(formatRupiah(REKAP_AWAL.sisa)) +
                '.</strong> Sisanya tipis — setiap tambahan bahan harus dipertimbangkan dengan hitungan.'
            : '<strong>Dana kurang ' + esc(formatRupiah(-REKAP_AWAL.sisa)) + '.</strong>'
        ) +
        '</div>'
    );
    html += panelJudul(
      '🔎 Periksa pemahamanmu',
      buildGuidedQuizList(TANYA.biaya, State.biayaOrders, State.biayaPilih) +
        (tanyaOk ? daftarTemuan(esc(D.temuan)) : '')
    );
  }

  html +=
    (kartuOk && tanyaOk ? buildDlNextButton('biayaNextBtn', D.nextLabel, true) : '') + '</section>';

  container.innerHTML = html;

  bindLpIsian(container, 'isA', KARTU_BIAYA, State.isianBiaya, saveState, rerender);
  bindGuidedQuizList(container, TANYA.biaya, State.biayaPilih, saveState, rerender);
  bindNext('biayaNextBtn', 'selidikBiaya', 'karya');
}

/* ============================================================
   10. STAGE: MENYAJIKAN KARYA  (PBL — sintaks 4)
   Usulan lantai kain → keputusan → Papan Proposal → presentasi.
   ============================================================ */

function buildPapanProposal() {
  var D = DATA.karya;
  var d = DESAIN_BY_ID[DATA.atapDipilih];
  var H = HITUNG;
  return buildLpProposal({
    judul: D.proposalJudul,
    sub: 'Disusun oleh tim perencana kelompokmu',
    keputusan: [
      {
        ikon: '🏠',
        judul: 'Atap gazebo',
        isi:
          d.nama +
          ' setinggi ' +
          lppAngka(d.t) +
          ' m (memenuhi syarat ≥ ' +
          lppAngka(ATAP.syaratMin) +
          ' m). tₛ = √(' +
          lppAngka(d.t) +
          '² + ' +
          lppAngka(H.pilih.a) +
          '²) = ' +
          lppAngka(H.pilih.ts) +
          ' m, luas atap ' +
          lppAngka(H.luasAtap) +
          ' m² → ' +
          H.lembarGenteng +
          ' lembar genteng.',
      },
      {
        ikon: '⛺',
        judul: 'Tenda dongeng',
        isi:
          'Kain hanya untuk empat dinding (tₛ ' +
          lppAngka(H.tsTenda[0]) +
          ' m dan ' +
          lppAngka(H.tsTenda[1]) +
          ' m): ' +
          lppAngka(H.kain) +
          ' m². Lantai tetap memakai tikar yang ada.',
      },
      {
        ikon: '🎁',
        judul: 'Kotak suvenir',
        isi:
          lppAngka(H.lpKotak) +
          ' cm² karton per kotak; ' +
          DATA.banyakSuvenir +
          ' kotak butuh ' +
          lppAngka(H.totalKarton) +
          ' cm² (' +
          lppAngka(H.kartonM) +
          ' m²) → ' +
          H.lembarKarton +
          ' lembar karton.',
      },
      {
        ikon: '💰',
        judul: 'Dana',
        isi:
          'Total ' +
          formatRupiah(REKAP_AWAL.total) +
          ', sisa ' +
          formatRupiah(REKAP_AWAL.sisa) +
          ' sebagai dana cadangan.',
      },
    ],
    anggaran: { baris: ANGGARAN_AWAL, dana: DATA.dana },
    penutup: D.penutup,
  });
}

function renderKarya(container) {
  var D = DATA.karya;
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.karyaPilih);
  var p1Ok = State.karyaPilih.p1 === 'kurang';

  function rerender() {
    renderKarya(container);
  }

  var html =
    '<section aria-label="Menyajikan Karya">' +
    buildHead(D) +
    paragrafInfo(D.instruksi) +
    panelJudul('💰 Anggaran hasil penyelidikan', buildLpAnggaran(ANGGARAN_AWAL, DATA.dana)) +
    panelJudul(
      '🧠 Ambil keputusan kelompok',
      buildGuidedQuizList(TANYA.karya, State.karyaOrders, State.karyaPilih) +
        (p1Ok
          ? '<h4 style="margin:var(--space-4) 0 var(--space-2);">Anggaran bila lantai tenda dilapisi kain</h4>' +
            buildLpAnggaran(ANGGARAN_LANTAI, DATA.dana)
          : '')
    );

  if (tanyaOk) {
    html +=
      panelJudul('🪧 Papan Proposal', buildPapanProposal(), 'panel--hero') +
      buildDlPanel(
        buildTextarea(
          'presentasiTeks',
          D.presentasiLabel,
          D.presentasiPlaceholder,
          State.presentasi
        ) + caption('Presentasikan Papan Proposal ini di depan kelas atau dalam galeri berjalan.')
      ) +
      buildDlNextButton('karyaNextBtn', D.nextLabel, true);
  }

  html += '</section>';
  container.innerHTML = html;

  bindGuidedQuizList(container, TANYA.karya, State.karyaPilih, saveState, rerender);
  bindTextarea('presentasiTeks', 'presentasi');

  var nextBtn = document.getElementById('karyaNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.presentasi.trim()) {
        showNotice('Tulis kalimat presentasi kelompokmu lebih dulu.');
        return;
      }
      completeStage('karya');
      navigateTo('evaluasi');
    });
  }
}

/* ============================================================
   11. STAGE: ANALISIS & EVALUASI  (PBL — sintaks 5)
   Nilai lembar kerja Kelompok Merpati → pelajaran → bandingkan dugaan
   awal → evaluasi proses kelompok.
   ============================================================ */

function buildTanggapanDugaan() {
  var D = DATA.evaluasi;
  return DATA.orientasi.dugaan
    .map(function (q) {
      var pilih = State.dugaanPilih[q.id];
      if (!pilih || !D.tanggapanDugaan[q.id][pilih]) return '';
      return (
        '<div class="quiz-item">' +
        '<p class="dl-caption">' +
        esc(q.tanya) +
        ' Dugaanmu: “' +
        esc(findOptionLabel(q.opsi, pilih)) +
        '”</p>' +
        buildFeedbackBox('info', '🔁', esc(D.tanggapanDugaan[q.id][pilih])) +
        '</div>'
      );
    })
    .join('');
}

function renderEvaluasi(container) {
  var D = DATA.evaluasi;
  var lembarOk = sortItemsAllAnswered(LANGKAH_ITEMS, State.langkahStates);
  var tanyaOk = guidedQuizAllCorrect(D.tanya, State.evalPilih);

  function rerender() {
    renderEvaluasi(container);
  }

  var html =
    '<section aria-label="Analisis dan Evaluasi">' +
    buildHead(D) +
    panelJudul(
      D.lembarJudul,
      caption(D.instruksiLembar) +
        buildSortItems(LANGKAH_ITEMS, State.langkahOrder, D.opsiNilai, State.langkahStates, {
          mono: true,
        }) +
        (lembarOk
          ? daftarTemuan(
              '<strong>' +
                sortItemsCorrectCount(LANGKAH_ITEMS, State.langkahStates) +
                ' dari ' +
                LANGKAH_ITEMS.length +
                '</strong> langkah kamu nilai dengan tepat.'
            )
          : '')
    );

  if (lembarOk) {
    html += panelJudul(
      '💡 Tarik pelajaran',
      buildGuidedQuizList(TANYA.evaluasi, State.evalOrders, State.evalPilih)
    );
  }

  if (lembarOk && tanyaOk) {
    html +=
      panelJudul('🔁 ' + D.dugaanJudul, buildTanggapanDugaan()) +
      buildDlPanel(
        buildTextarea('evalRefleksi', D.refleksiLabel, D.refleksiPlaceholder, State.evalRefleksi)
      ) +
      buildDlNextButton('evaluasiNextBtn', D.nextLabel, true);
  }

  html += '</section>';
  container.innerHTML = html;

  bindSortItems(container, LANGKAH_ITEMS, State.langkahStates, saveState, rerender);
  bindGuidedQuizList(container, TANYA.evaluasi, State.evalPilih, saveState, rerender);
  bindTextarea('evalRefleksi', 'evalRefleksi');

  var nextBtn = document.getElementById('evaluasiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!State.evalRefleksi.trim()) {
        showNotice('Tulis evaluasi proses kelompokmu lebih dulu.');
        return;
      }
      completeStage('evaluasi');
      navigateTo('terapkan');
    });
  }
}

/* ============================================================
   12. STAGE: UJI TERAP
   createExerciseStage (shared/engine.js) dengan soal campuran
   'input' (isian bilangan bulat, boleh berpemisah ribuan) dan
   'choice' (opsi diacak lewat ex.optionOrder di initExerciseArrays()).
   ============================================================ */

/* Diagnosa isian soal kontekstual (engine seksi 58). */
function diagnosaTerapkan(s, ex) {
  var parsed = parseInputInt(ex.userInput, true);
  if (parsed.error) return null;
  var d = diagnosaMasalahLimas(s.cek, parsed.value);
  return d.kode === 'benar' ? null : d.pesan;
}

function teksJawaban(s) {
  if (s.satuan === 'rupiah') return formatRupiah(s.jawab);
  return formatNumber(s.jawab) + ' ' + s.satuan;
}

var TerapkanStage = createExerciseStage({
  soal: DATA.terapkan.soal,
  getExercises: function () {
    return State.terapkanExercises;
  },
  getIndex: function () {
    return State.terapkanIdx;
  },
  setIndex: function (i) {
    State.terapkanIdx = i;
  },
  save: saveState,
  idPrefix: 'tr',
  sectionLabel: 'Uji Terap',
  kicker: DATA.terapkan.kicker,
  goal: DATA.terapkan.goal,
  instruction: DATA.terapkan.instruksi,
  buildHead: function () {
    return buildHead(DATA.terapkan);
  },
  nextStageId: 'refleksi',
  completeStageId: 'terapkan',
  nextButtonLabel: DATA.terapkan.nextLabel,
  defaultType: 'choice',
  listClass: 'challenge-options',
  choiceClassStyle: 'state',
  wrapClass: 'dl-exercise',
  stripPunctuation: true,
  checkValue: function (s) {
    return s.jawab;
  },
  inputAriaLabel: 'Jawaban',
  inputPlaceholder: 'Jawaban',
  inputSuffix: function (s) {
    return '<span class="lpp-satuan">' + esc(s.satuan) + '</span>';
  },
  invalidMessage: 'Masukkan sebuah bilangan bulat (contoh: 104 atau 7.900).',
  inputErrorHTML: function (s, ex) {
    var pesan = diagnosaTerapkan(s, ex);
    return buildFeedbackBox(
      'error',
      '✗',
      'Jawaban <strong>' +
        esc(ex.userInput) +
        '</strong> belum tepat. ' +
        esc(pesan || 'Periksa lagi perhitunganmu atau buka petunjuk.')
    );
  },
  revealText: function (s) {
    return 'Jawabannya <strong>' + esc(teksJawaban(s)) + '</strong>. ' + esc(s.explanation);
  },
  renderPrompt: function (s) {
    var pilihan = (s.type || 'choice') === 'choice';
    return (
      '<div class="dl-prompt">' +
      '<span class="konteks-chip">' +
      esc(s.konteks) +
      '</span>' +
      '<p class="dl-prompt__cerita">' +
      esc(s.cerita) +
      '</p>' +
      '<p class="dl-prompt__tanya">' +
      esc(s.pertanyaan) +
      '</p>' +
      (pilihan && s.hints && s.hints.length
        ? '<details class="lpp-hint"><summary>💡 Petunjuk</summary><ul>' +
          s.hints
            .map(function (h) {
              return '<li>' + esc(h) + '</li>';
            })
            .join('') +
          '</ul></details>'
        : '') +
      '</div>'
    );
  },
});

function renderTerapkan(container) {
  TerapkanStage.render(container);
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  var D = DATA.refleksi;
  var atapBenar = banyakKartuBenar(KARTU_ATAP, State.isianAtap);
  var sisiSekali = DATA.benda.filter(function (b) {
    return State.sisi[b.id].benar && State.sisi[b.id].coba === 1;
  }).length;
  var biayaBenar = banyakKartuBenar(KARTU_BIAYA, State.isianBiaya);
  var langkahBenar = sortItemsCorrectCount(LANGKAH_ITEMS, State.langkahStates);
  var terapBenar = State.terapkanExercises.filter(function (e) {
    return e.correct;
  }).length;

  function kartu(val, label) {
    return (
      '<div class="summary-card"><div class="summary-card__val">' +
      val +
      '</div><div class="summary-card__label">' +
      label +
      '</div></div>'
    );
  }

  container.innerHTML =
    '<section aria-label="Refleksi Pembelajaran">' +
    buildHead(D) +
    buildDlPanel(
      '<div class="summary-grid">' +
        kartu(atapBenar + '/' + KARTU_ATAP.length, 'Kartu desain atap tuntas') +
        kartu(sisiSekali + '/' + DATA.benda.length, 'Sisi bahan tepat sekali coba') +
        kartu(biayaBenar + '/' + KARTU_BIAYA.length, 'Kartu anggaran tuntas') +
        kartu(langkahBenar + '/' + LANGKAH_ITEMS.length, 'Langkah Merpati dinilai tepat') +
        kartu(terapBenar + '/' + DATA.terapkan.soal.length, 'Uji terap benar') +
        '</div>'
    ) +
    '<div class="refleksi-list">' +
    D.pertanyaan
      .map(function (q, i) {
        return (
          '<div class="panel panel--compact">' +
          '<span class="refleksi-item__num">Pertanyaan ' +
          (i + 1) +
          ' dari ' +
          D.pertanyaan.length +
          '</span>' +
          '<label for="ref-' +
          q.id +
          '" class="dl-refleksi-q">' +
          esc(q.teks) +
          '</label>' +
          '<textarea id="ref-' +
          q.id +
          '" class="input-textarea" data-rid="' +
          q.id +
          '" placeholder="' +
          esc(q.placeholder) +
          '">' +
          esc(State.refleksiAnswers[q.id] || '') +
          '</textarea>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    buildDlPanel(
      '<p class="exercise-label">' +
        esc(D.diriLabel) +
        '</p>' +
        buildChoiceGroup(D.diriOpsi, State.refleksiDiriOrder, { chosen: State.refleksiDiri })
    ) +
    '<div class="btn-group btn-group--spread">' +
    '<span class="dl-caption" style="align-self:center;">Jawaban tersimpan di perangkatmu saja, tidak dikirim ke mana pun.</span>' +
    '<button type="button" class="btn btn--primary" id="refleksiSaveBtn">' +
    esc(D.nextLabel) +
    '</button>' +
    '</div>' +
    '</section>';

  container.querySelectorAll('textarea[data-rid]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      State.refleksiAnswers[ta.dataset.rid] = ta.value;
      saveState();
    });
  });

  container.querySelectorAll('[data-opt-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.refleksiDiri = btn.dataset.optId;
      saveState();
      renderRefleksi(container);
      var f = container.querySelector('[data-opt-id="' + btn.dataset.optId + '"]');
      if (f) f.focus();
    });
  });

  document.getElementById('refleksiSaveBtn').addEventListener('click', function () {
    if (!State.refleksiDiri) {
      showNotice('Pilih dulu seberapa yakin kamu sekarang.');
      return;
    }
    completeStage('refleksi');
    navigateTo('selesai');
  });
}

/* ============================================================
   14. STAGE: SELESAI
   ============================================================ */

function renderSelesai(container) {
  var D = DATA.selesai;

  container.innerHTML =
    '<section aria-label="Selesai">' +
    '<div class="done-card">' +
    '<span class="done-card__icon">🏆</span>' +
    '<h2>' +
    esc(D.judul) +
    '</h2>' +
    '<p class="done-card__lead">' +
    esc(D.teks) +
    '</p>' +
    '<div class="sajian-trio">' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">📏</span>tₛ = √(t² + a²), bukan tinggi limas</div>' +
    '<div class="sajian-card"><span class="sajian-card__ikon" aria-hidden="true">🔍</span>Hitung hanya sisi yang memakai bahan</div>' +
    '<div class="sajian-card sajian-card--utama"><span class="sajian-card__ikon" aria-hidden="true">⬆️</span>Bahan dibeli: bulatkan ke atas</div>' +
    '</div>' +
    '<div class="panel panel--hero done-card__list">' +
    '<h3 style="margin-top:0;">Yang sudah kamu capai</h3>' +
    '<ol class="objectives-list">' +
    D.capaian
      .map(function (c, i) {
        return '<li><span class="objectives-list__num">' + (i + 1) + '</span>' + esc(c) + '</li>';
      })
      .join('') +
    '</ol>' +
    '</div>' +
    '<div class="feedback-box feedback-box--info done-card__note">' +
    '<span class="feedback-box__icon">📌</span>' +
    '<div class="feedback-box__body">' +
    '<strong>Catatan untuk Guru:</strong><br>' +
    'Rekap pada tahap Refleksi adalah indikator latihan digital, bukan nilai akhir. ' +
    'Papan Proposal, kalimat presentasi, dan evaluasi proses kelompok menjadi bahan asesmen kinerja penyelesaian masalah.' +
    '</div></div>' +
    '<div class="btn-group btn-group--center">' +
    '<a href="../../index.html" class="btn btn--ghost">← Beranda</a>' +
    '<button type="button" class="btn btn--outline-primary" id="reviewBtn">Tinjau Ulang</button>' +
    '</div>' +
    '</div>' +
    '</section>';

  completeStage('selesai');

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('orientasi');
  });
}

/* ============================================================
   15. ROUTER RENDER
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  organisasi: renderOrganisasi,
  selidikAtap: renderSelidikAtap,
  selidikSisi: renderSelidikSisi,
  selidikBiaya: renderSelidikBiaya,
  karya: renderKarya,
  evaluasi: renderEvaluasi,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var container = document.getElementById('stageContainer');
  if (!container) return;
  var fn = RENDERERS[State.currentStage] || RENDERERS.orientasi;
  fn(container);
}

/* ============================================================
   16. HELPER UI — MODAL RESET
   ============================================================ */

function showResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'flex';
}

function hideResetModal() {
  var modal = document.getElementById('resetModal');
  if (modal) modal.style.display = 'none';
}

/* ============================================================
   17. INIT
   ============================================================ */

function init() {
  buildStageNav();
  loadState();
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = 'orientasi';
  initExerciseArrays();
  saveState();
  updateStageNav();
  updateProgress();
  renderCurrentStage();

  var resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) resetBtn.addEventListener('click', showResetModal);

  var cancelBtn = document.getElementById('resetCancelBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', hideResetModal);

  var confirmBtn = document.getElementById('resetConfirmBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      hideResetModal();
      clearState();
      saveState();
      updateStageNav();
      updateProgress();
      navigateTo('orientasi');
    });
  }

  var modal = document.getElementById('resetModal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) hideResetModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') hideResetModal();
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
