'use strict';

/* ============================================================
   data.js — Konten pembelajaran
   Matematika: Menyelesaikan Masalah Operasi Aritmatika Campuran
   Bilangan Rasional dan Desimal — Fase D (SMP)

   Pisahkan dari app.js agar mudah dikustomisasi guru.

   Cara menambah/mengubah soal:
   - Tambahkan objek ke array DATA.problems
   - Ikuti struktur yang sama (lihat komentar per properti)
   - Pastikan answer dan calcSteps benar secara matematis
   ============================================================ */

const DATA = {

    meta: {
        title: 'Operasi Aritmatika Campuran',
        subject: 'Matematika — Fase D (SMP)',
        goal: 'Saya dapat menyelesaikan masalah kontekstual yang melibatkan operasi aritmatika campuran bilangan rasional dan desimal.'
    },

    /* ----------------------------------------------------------
       CONTOH TERBIMBING
       Masalah sederhana dengan panduan penuh
       ---------------------------------------------------------- */
    guidedExample: {
        title: 'Contoh Terbimbing',
        context: 'Ayah memiliki dua potongan kawat. Potongan pertama panjangnya <strong>½ m</strong> dan potongan kedua panjangnya <strong>¼ m</strong>.',
        question: 'Berapa meter total panjang kawat yang dimiliki Ayah?',
        /* steps: array langkah-langkah interaktif di contoh */
        steps: [
            {
                id: 'ce0',
                type: 'read',
                title: 'Langkah 1 — Baca dan Pahami Masalah',
                body: 'Sebelum menghitung, pahami dulu:<ul><li>Apa yang <strong>diketahui</strong>? Dua panjang kawat: ½ m dan ¼ m.</li><li>Apa yang <strong>ditanya</strong>? Total panjang kawat.</li><li>Apa artinya "total"? Gabungan semua bagian.</li></ul>',
                cta: 'Lanjut ke Langkah 2'
            },
            {
                id: 'ce1',
                type: 'mc',
                title: 'Langkah 2 — Tentukan Operasi',
                prompt: 'Kita ingin menghitung <strong>total</strong> panjang dua kawat. Operasi matematika apa yang tepat untuk mencari total?',
                options: [
                    { id: 'a', label: 'Penjumlahan (+)', correct: true, feedback: 'Benar! Penjumlahan digunakan untuk menggabungkan nilai menjadi total.' },
                    { id: 'b', label: 'Pengurangan (−)', correct: false, feedback: 'Pengurangan digunakan saat mencari selisih atau sisa, bukan total.' },
                    { id: 'c', label: 'Perkalian (×)', correct: false, feedback: 'Perkalian digunakan untuk kasus "berapa kali lipat". Kita ingin total, bukan hasil kali.' },
                    { id: 'd', label: 'Pembagian (÷)', correct: false, feedback: 'Pembagian digunakan untuk membagi rata. Kita ingin total.' }
                ],
                hint: 'Kata kunci: "total panjang". Operasi apa yang kamu gunakan saat ingin menjumlahkan dua hal?'
            },
            {
                id: 'ce2',
                type: 'input',
                title: 'Langkah 3 — Samakan Penyebut',
                instruction: 'Untuk menjumlahkan pecahan, penyebut harus sama. Kita akan mengubah ½ menjadi pecahan dengan penyebut 4.',
                prompt: '½ = ?/4',
                inputLabel: 'Isi pembilang: ½ = ___/4',
                inputPlaceholder: '2',
                /* answerType: numerator — hanya periksa pembilang (integer) */
                answerType: 'numerator',
                answer: 2,
                correctDisplay: '2/4',
                hints: [
                    'Tanya: 2 × ? = 4 (penyebut baru)? Jawab: 2. Maka pembilang juga dikali 2: 1 × 2 = ?',
                    '1 × 2 = 2. Jadi ½ = 2/4. Pembilang dan penyebut sama-sama dikali 2, nilainya tidak berubah.'
                ],
                feedbackCorrect: 'Tepat! ½ = 2/4. Pembilang dan penyebut sama-sama dikali 2.',
                feedbackWrong: 'Belum tepat. Coba pikirkan: untuk mengubah penyebut dari 2 menjadi 4, kita kalikan dengan 2. Maka pembilang juga harus dikali 2.'
            },
            {
                id: 'ce3',
                type: 'input',
                title: 'Langkah 4 — Hitung Penjumlahan',
                instruction: 'Sekarang penyebut sudah sama (4). Jumlahkan pembilangnya.',
                prompt: '2/4 + 1/4 = ?',
                inputLabel: 'Hasil (boleh desimal atau pecahan, mis. 0,75)',
                inputPlaceholder: '0,75',
                /* answerType: decimal — bandingkan nilai desimal */
                answerType: 'decimal',
                answer: 0.75,
                tolerance: 0.01,
                correctDisplay: '3/4 = 0,75',
                hints: [
                    'Saat penyebut sama, jumlahkan hanya pembilangnya: 2 + 1 = ?. Penyebutnya tetap 4.',
                    '2/4 + 1/4 = (2+1)/4 = 3/4. Ubah ke desimal: 3 ÷ 4 = 0,75.'
                ],
                feedbackCorrect: 'Benar! 2/4 + 1/4 = 3/4 = 0,75.',
                feedbackWrong: 'Belum tepat. Ingat: penyebut sudah sama (4), jadi jumlahkan pembilangnya saja: 2 + 1 = 3. Penyebut tetap 4, hasilnya 3/4 = 0,75.'
            },
            {
                id: 'ce4',
                type: 'summary',
                title: 'Langkah 5 — Rangkuman Penyelesaian',
                steps: [
                    'Diketahui: kawat pertama = ½ m, kawat kedua = ¼ m',
                    'Ditanya: total panjang kawat',
                    'Operasi: penjumlahan (½ + ¼)',
                    'Samakan penyebut: ½ = 2/4',
                    'Hitung: 2/4 + 1/4 = 3/4',
                    'Ubah ke desimal: 3 ÷ 4 = 0,75',
                    'Jawaban: Total kawat = ¾ m = 0,75 m'
                ],
                note: 'Perhatikan bahwa ½ dan ¼ memiliki penyebut berbeda (2 dan 4). Kita harus menyamakan penyebut sebelum menjumlahkan. Penyebut persekutuan terkecil dari 2 dan 4 adalah 4.'
            }
        ]
    },

    /* ----------------------------------------------------------
       SOAL-SOAL LATIHAN
       5 soal dengan tingkat kesulitan bertahap
       ---------------------------------------------------------- */
    problems: [

        /* ---- SOAL 1: Belanja Buah (Mudah, +, pecahan beda penyebut) ---- */
        {
            id: 'p1',
            title: 'Belanja Buah',
            difficulty: 1,
            context: 'Ibu pergi ke pasar dan membeli <strong>½ kg apel</strong> serta <strong>¾ kg jeruk</strong>.',
            question: 'Berapa kilogram buah yang dibeli Ibu seluruhnya?',
            unit: 'kg',

            identify: {
                instruction: 'Centang semua informasi yang diperlukan untuk menjawab pertanyaan.',
                items: [
                    { id: 'i1', text: 'Berat apel: ½ kg', relevant: true },
                    { id: 'i2', text: 'Berat jeruk: ¾ kg', relevant: true },
                    { id: 'i3', text: 'Ibu pergi ke pasar', relevant: false }
                ],
                hints: [
                    'Pertanyaan: total berat buah. Informasi apa yang berhubungan dengan berat?',
                    'Pilih hanya informasi tentang berat masing-masing buah.'
                ],
                feedbackCorrect: 'Tepat! Kita memerlukan berat apel (½ kg) dan berat jeruk (¾ kg) untuk menghitung total.',
                feedbackWrong: 'Belum tepat. Pilih semua informasi yang menyebutkan berat buah, dan jangan pilih yang tidak berhubungan dengan berat.'
            },

            model: {
                instruction: 'Pilih ekspresi matematika yang sesuai dengan masalah ini.',
                options: [
                    {
                        id: 'm1', expr: '½ + ¾',
                        correct: true,
                        feedback: 'Benar! Kita menjumlahkan berat apel dan berat jeruk untuk mendapat total.'
                    },
                    {
                        id: 'm2', expr: '¾ − ½',
                        correct: false,
                        feedback: 'Pengurangan (−) digunakan untuk mencari selisih, bukan total. Di sini kita ingin menggabungkan dua berat.'
                    },
                    {
                        id: 'm3', expr: '½ × ¾',
                        correct: false,
                        feedback: 'Perkalian (×) digunakan untuk kasus seperti "berapa kali lipat dari". Kita tidak ingin mengalikan berat.'
                    },
                    {
                        id: 'm4', expr: '½ ÷ ¾',
                        correct: false,
                        feedback: 'Pembagian (÷) digunakan untuk membagi rata. Kita ingin total, bukan hasil pembagian.'
                    }
                ],
                hints: [
                    'Kita ingin tahu TOTAL berat. Operasi mana yang menggabungkan dua nilai menjadi satu total?',
                    'Penjumlahan (+) digunakan ketika ingin mencari total atau gabungan dari beberapa nilai.'
                ]
            },

            /* null = tidak ada langkah urutan operasi untuk soal ini */
            order: null,

            calc: {
                instruction: 'Selesaikan perhitungan langkah demi langkah.',
                steps: [
                    {
                        id: 'cs1',
                        instruction: 'Agar bisa dijumlahkan, penyebut harus sama. Ubah ½ ke penyebut 4:',
                        prompt: '½ = ___/4',
                        inputLabel: 'Masukkan pembilangnya: ½ = ___/4',
                        inputPlaceholder: '2',
                        answerType: 'numerator',
                        answer: 2,
                        denominator: 4,
                        correctDisplay: '2/4',
                        hints: [
                            'Tanya: penyebut 2 harus jadi 4. 2 × ? = 4? Kalikan pembilang juga dengan angka yang sama.',
                            '2 × 2 = 4. Jadi kalikan juga pembilang: 1 × 2 = 2. Hasilnya: ½ = 2/4.'
                        ],
                        feedbackCorrect: 'Benar! ½ = 2/4 karena 1×2=2 dan 2×2=4.',
                        feedbackWrong: 'Belum tepat. Penyebut baru adalah 4. Untuk mengubah 2 menjadi 4, kalikan 2. Maka pembilang juga dikali 2: 1 × 2 = ?'
                    },
                    {
                        id: 'cs2',
                        instruction: 'Penyebut sudah sama (4). Jumlahkan pembilangnya:',
                        prompt: '2/4 + 3/4 = ?',
                        inputLabel: 'Masukkan hasilnya (desimal atau pecahan)',
                        inputPlaceholder: '1,25',
                        answerType: 'decimal',
                        answer: 1.25,
                        tolerance: 0.01,
                        correctDisplay: '5/4 = 1¼ = 1,25',
                        hints: [
                            'Penyebut sudah sama: jumlahkan hanya pembilang: 2 + 3 = ?. Penyebutnya tetap 4.',
                            '2 + 3 = 5. Hasilnya 5/4. Ubah ke desimal: 5 ÷ 4 = 1,25.'
                        ],
                        feedbackCorrect: 'Benar! 2/4 + 3/4 = 5/4 = 1,25.',
                        feedbackWrong: 'Belum tepat. Saat penyebut sama, jumlah pembilangnya saja: 2 + 3 = 5. Penyebut tetap 4. Hasilnya 5/4 = 1,25.'
                    }
                ]
            },

            answer: {
                prompt: 'Jadi, berapa kilogram buah yang dibeli Ibu seluruhnya?',
                inputLabel: 'Total buah (kg)',
                inputPlaceholder: '1,25',
                answer: 1.25,
                tolerance: 0.01,
                unit: 'kg',
                correctDisplay: '1¼ kg = 1,25 kg',
                hints: [
                    'Gunakan hasil dari langkah perhitungan terakhir.',
                    'Dari langkah sebelumnya: 2/4 + 3/4 = 5/4 = 1,25 kg.'
                ],
                feedbackCorrect: 'Benar! Total buah yang dibeli Ibu adalah 1,25 kg.',
                feedbackWrong: 'Belum tepat. Periksa kembali hasil langkah perhitungan di atas.'
            },

            verify: {
                question: 'Ibu membeli ½ kg (= 0,5 kg) dan ¾ kg (= 0,75 kg) buah. Apakah hasil 1,25 kg masuk akal?',
                options: [
                    { id: 'v1', text: 'Ya, masuk akal. 0,5 + 0,75 = 1,25 kg sesuai.', correct: true },
                    { id: 'v2', text: 'Tidak, seharusnya lebih dari 2 kg.', correct: false },
                    { id: 'v3', text: 'Tidak, seharusnya kurang dari ½ kg.', correct: false }
                ],
                feedbackCorrect: 'Tepat! ½ = 0,5 dan ¾ = 0,75. Dijumlahkan = 1,25 kg. Hasil masuk akal.',
                feedbackWrong: 'Perhatikan: ½ = 0,5 dan ¾ = 0,75. Keduanya kurang dari 1 kg, jadi totalnya antara 1 dan 2 kg. Hasil 1,25 kg sangat masuk akal.'
            },

            solution: {
                steps: [
                    'Diketahui: apel = ½ kg, jeruk = ¾ kg',
                    'Ditanya: total berat buah',
                    'Operasi: penjumlahan (½ + ¾)',
                    'Samakan penyebut: ½ = 2/4',
                    'Hitung: 2/4 + 3/4 = 5/4',
                    'Ubah ke desimal: 5 ÷ 4 = 1,25',
                    'Jawaban: 1¼ kg = 1,25 kg'
                ]
            }
        },

        /* ---- SOAL 2: Tali Pramuka (Mudah-Sedang, −, desimal − pecahan) ---- */
        {
            id: 'p2',
            title: 'Tali Pramuka',
            difficulty: 1,
            context: 'Dani memiliki tali sepanjang <strong>2,5 m</strong>. Untuk kegiatan pramuka, ia memotong <strong>¾ m</strong> dari tali tersebut.',
            question: 'Berapa meter sisa tali Dani?',
            unit: 'm',

            identify: {
                instruction: 'Centang semua informasi yang diperlukan untuk menjawab pertanyaan.',
                items: [
                    { id: 'i1', text: 'Panjang tali awal: 2,5 m', relevant: true },
                    { id: 'i2', text: 'Panjang yang dipotong: ¾ m', relevant: true },
                    { id: 'i3', text: 'Tali digunakan untuk kegiatan pramuka', relevant: false }
                ],
                hints: [
                    'Kita ingin tahu sisa tali. Informasi apa yang dibutuhkan: panjang awal dan panjang yang diambil.',
                    'Pilih informasi tentang panjang tali, bukan tentang kegiatannya.'
                ],
                feedbackCorrect: 'Tepat! Kita perlu panjang awal (2,5 m) dan panjang yang dipotong (¾ m).',
                feedbackWrong: 'Belum tepat. Pilih informasi yang menyebutkan panjang tali (awal dan yang dipotong).'
            },

            model: {
                instruction: 'Pilih ekspresi matematika yang sesuai untuk mencari sisa tali.',
                options: [
                    {
                        id: 'm1', expr: '2,5 − ¾',
                        correct: true,
                        feedback: 'Benar! Kita kurangi panjang yang dipotong (¾) dari panjang awal (2,5) untuk mendapat sisa.'
                    },
                    {
                        id: 'm2', expr: '2,5 + ¾',
                        correct: false,
                        feedback: 'Penjumlahan digunakan untuk total. Tali dipotong (dikurangi), bukan ditambah.'
                    },
                    {
                        id: 'm3', expr: '¾ − 2,5',
                        correct: false,
                        feedback: 'Urutan operan penting! Sisa = panjang awal − yang dipotong, bukan sebaliknya.'
                    },
                    {
                        id: 'm4', expr: '2,5 × ¾',
                        correct: false,
                        feedback: 'Perkalian tidak sesuai di sini. Kita ingin mengetahui sisa setelah pemotongan.'
                    }
                ],
                hints: [
                    'Kata kunci: "sisa" → artinya ada pengurangan. Apa yang dikurangi dari apa?',
                    'Sisa = panjang awal − panjang yang diambil = 2,5 − ¾.'
                ]
            },

            order: null,

            calc: {
                instruction: 'Selesaikan perhitungan langkah demi langkah.',
                steps: [
                    {
                        id: 'cs1',
                        instruction: 'Agar mudah dihitung, ubah ¾ ke bentuk desimal:',
                        prompt: '¾ = ?',
                        inputLabel: 'Nilai desimal dari ¾',
                        inputPlaceholder: '0,75',
                        answerType: 'decimal',
                        answer: 0.75,
                        tolerance: 0.005,
                        correctDisplay: '0,75',
                        hints: [
                            '¾ artinya 3 dibagi 4. Hitung: 3 ÷ 4 = ?',
                            '3 ÷ 4 = 0,75. Cara lain: ¾ = 75/100 (kalikan dengan 25/25).'
                        ],
                        feedbackCorrect: 'Benar! ¾ = 0,75.',
                        feedbackWrong: 'Belum tepat. Ingat: ¾ berarti 3 dibagi 4. Hitung: 3 ÷ 4 = 0,75.'
                    },
                    {
                        id: 'cs2',
                        instruction: 'Sekarang hitung sisanya:',
                        prompt: '2,5 − 0,75 = ?',
                        inputLabel: 'Sisa tali (m)',
                        inputPlaceholder: '1,75',
                        answerType: 'decimal',
                        answer: 1.75,
                        tolerance: 0.01,
                        correctDisplay: '1,75',
                        hints: [
                            '2,5 − 0,75: kurangi bagian persepuluhan dan perseratusannya.',
                            '2,50 − 0,75: 2,50 − 0,75 = 1,75. Hati-hati dengan penempatan koma desimal.'
                        ],
                        feedbackCorrect: 'Benar! 2,5 − 0,75 = 1,75.',
                        feedbackWrong: 'Belum tepat. Hitung: 2,5 − 0,75. Ingat: 2,5 = 2,50. Kurangi: 2,50 − 0,75 = 1,75.'
                    }
                ]
            },

            answer: {
                prompt: 'Jadi, berapa meter sisa tali Dani?',
                inputLabel: 'Sisa tali (m)',
                inputPlaceholder: '1,75',
                answer: 1.75,
                tolerance: 0.01,
                unit: 'm',
                correctDisplay: '1,75 m',
                hints: [
                    'Gunakan hasil dari langkah terakhir.',
                    '2,5 − 0,75 = 1,75 m.'
                ],
                feedbackCorrect: 'Benar! Sisa tali Dani adalah 1,75 m.',
                feedbackWrong: 'Belum tepat. Periksa kembali hasil langkah perhitungan.'
            },

            verify: {
                question: 'Tali awal 2,5 m, dipotong 0,75 m. Apakah sisa 1,75 m masuk akal?',
                options: [
                    { id: 'v1', text: 'Ya. 2,5 − 0,75 = 1,75, lebih kecil dari 2,5 m tapi lebih dari 0.', correct: true },
                    { id: 'v2', text: 'Tidak. Sisanya seharusnya lebih dari 2,5 m.', correct: false },
                    { id: 'v3', text: 'Tidak. Sisanya seharusnya negatif.', correct: false }
                ],
                feedbackCorrect: 'Tepat! Sisa pasti lebih kecil dari panjang awal (2,5 m) dan harus positif. Hasil 1,75 m masuk akal.',
                feedbackWrong: 'Perhatikan: kita memotong dari 2,5 m, jadi sisa harus lebih kecil dari 2,5 m dan harus positif (¾ m < 2,5 m). Hasil 1,75 m sudah benar.'
            },

            solution: {
                steps: [
                    'Diketahui: tali awal = 2,5 m, dipotong = ¾ m',
                    'Ditanya: sisa tali',
                    'Operasi: pengurangan (2,5 − ¾)',
                    'Ubah ¾ ke desimal: 3 ÷ 4 = 0,75',
                    'Hitung: 2,5 − 0,75 = 1,75',
                    'Jawaban: Sisa tali = 1,75 m'
                ]
            }
        },

        /* ---- SOAL 3: Resep Kue (Sedang, ×, pecahan × desimal) ---- */
        {
            id: 'p3',
            title: 'Resep Kue',
            difficulty: 2,
            context: 'Sebuah resep kue membutuhkan <strong>⅔ cangkir gula</strong> untuk satu porsi. Dina ingin membuat <strong>1,5 porsi</strong>.',
            question: 'Berapa cangkir gula yang dibutuhkan Dina?',
            unit: 'cangkir',

            identify: {
                instruction: 'Centang semua informasi yang diperlukan untuk menjawab pertanyaan.',
                items: [
                    { id: 'i1', text: 'Gula per porsi: ⅔ cangkir', relevant: true },
                    { id: 'i2', text: 'Jumlah porsi yang dibuat: 1,5 porsi', relevant: true },
                    { id: 'i3', text: 'Ini adalah resep kue', relevant: false }
                ],
                hints: [
                    'Kita ingin tahu total gula untuk 1,5 porsi. Informasi apa yang berhubungan dengan jumlah gula dan porsi?',
                    'Pilih informasi tentang gula per porsi dan jumlah porsi.'
                ],
                feedbackCorrect: 'Tepat! Kita perlu gula per porsi (⅔ cangkir) dan jumlah porsi (1,5).',
                feedbackWrong: 'Belum tepat. Pilih informasi tentang berapa gula per porsi dan berapa porsi yang dibuat.'
            },

            model: {
                instruction: 'Pilih ekspresi matematika yang sesuai.',
                options: [
                    {
                        id: 'm1', expr: '⅔ × 1,5',
                        correct: true,
                        feedback: 'Benar! Gula per porsi dikali jumlah porsi = total gula.'
                    },
                    {
                        id: 'm2', expr: '⅔ + 1,5',
                        correct: false,
                        feedback: 'Penjumlahan tidak tepat. Kita ingin tahu gula untuk 1,5 porsi, bukan menjumlahkan keduanya.'
                    },
                    {
                        id: 'm3', expr: '⅔ ÷ 1,5',
                        correct: false,
                        feedback: 'Pembagian tidak tepat di sini. Kita ingin mengalikan karena membuat 1,5 porsi berarti butuh 1,5× lebih banyak.'
                    },
                    {
                        id: 'm4', expr: '1,5 − ⅔',
                        correct: false,
                        feedback: 'Pengurangan tidak tepat. Kita tidak sedang mencari selisih, melainkan total kebutuhan gula.'
                    }
                ],
                hints: [
                    'Kita membuat 1,5 porsi. Jika 1 porsi butuh ⅔ cangkir, maka 1,5 porsi butuh 1,5 × ⅔ cangkir.',
                    'Perkalian digunakan untuk menghitung "sekian kali lipat dari sesuatu".'
                ]
            },

            order: null,

            calc: {
                instruction: 'Selesaikan perhitungan langkah demi langkah.',
                steps: [
                    {
                        id: 'cs1',
                        instruction: 'Ubah 1,5 menjadi pecahan biasa:',
                        prompt: '1,5 = ?/2',
                        inputLabel: 'Pembilang: 1,5 = ___/2',
                        inputPlaceholder: '3',
                        answerType: 'numerator',
                        answer: 3,
                        denominator: 2,
                        correctDisplay: '3/2',
                        hints: [
                            '1,5 = 1 + 0,5 = 1 + ½. Ubah ke pecahan tunggal: 1½ = ?/2.',
                            '1½ = 3/2 karena 1 = 2/2, dan 2/2 + 1/2 = 3/2.'
                        ],
                        feedbackCorrect: 'Benar! 1,5 = 3/2.',
                        feedbackWrong: 'Belum tepat. 1,5 = 1,5/1 = 15/10 = 3/2. Cara lain: 1,5 = 1 + ½ = 2/2 + 1/2 = 3/2.'
                    },
                    {
                        id: 'cs2',
                        instruction: 'Sekarang kalikan dua pecahan:',
                        prompt: '⅔ × 3/2 = ?',
                        inputLabel: 'Hasil perkalian',
                        inputPlaceholder: '1',
                        answerType: 'decimal',
                        answer: 1.0,
                        tolerance: 0.01,
                        correctDisplay: '6/6 = 1',
                        hints: [
                            'Kalikan pembilang × pembilang dan penyebut × penyebut: (2×3)/(3×2) = ?',
                            '(2×3)/(3×2) = 6/6 = 1. Pecahan yang pembilang = penyebutnya nilainya 1.'
                        ],
                        feedbackCorrect: 'Benar! 2/3 × 3/2 = 6/6 = 1.',
                        feedbackWrong: 'Belum tepat. Kalikan: (2×3)/(3×2) = 6/6 = 1.'
                    }
                ]
            },

            answer: {
                prompt: 'Jadi, berapa cangkir gula yang dibutuhkan Dina?',
                inputLabel: 'Total gula (cangkir)',
                inputPlaceholder: '1',
                answer: 1.0,
                tolerance: 0.01,
                unit: 'cangkir',
                correctDisplay: '1 cangkir',
                hints: [
                    'Gunakan hasil dari langkah terakhir.',
                    '2/3 × 3/2 = 6/6 = 1 cangkir.'
                ],
                feedbackCorrect: 'Benar! Dina membutuhkan 1 cangkir gula.',
                feedbackWrong: 'Belum tepat. Periksa kembali langkah perhitungan di atas.'
            },

            verify: {
                question: 'Resep butuh ⅔ cangkir untuk 1 porsi. Dina buat 1,5 porsi. Apakah hasil 1 cangkir masuk akal?',
                options: [
                    { id: 'v1', text: 'Ya. 1,5 porsi butuh lebih dari ⅔ (0,67) tapi tidak terlalu banyak.', correct: true },
                    { id: 'v2', text: 'Tidak. Seharusnya lebih dari 3 cangkir.', correct: false },
                    { id: 'v3', text: 'Tidak. Seharusnya kurang dari ⅔ cangkir.', correct: false }
                ],
                feedbackCorrect: 'Tepat! 1 porsi = ⅔ ≈ 0,67 cangkir. 1,5 porsi = 1,5 × 0,67 ≈ 1 cangkir. Masuk akal.',
                feedbackWrong: 'Perhatikan: 1 porsi butuh ⅔ ≈ 0,67 cangkir. Untuk 1,5 porsi (lebih dari 1 porsi), dibutuhkan lebih dari 0,67 tapi tidak jauh berbeda. Hasil 1 cangkir masuk akal.'
            },

            solution: {
                steps: [
                    'Diketahui: gula per porsi = ⅔ cangkir, jumlah porsi = 1,5',
                    'Ditanya: total gula',
                    'Operasi: perkalian (⅔ × 1,5)',
                    'Ubah 1,5 ke pecahan: 1,5 = 3/2',
                    'Hitung: ⅔ × 3/2 = (2×3)/(3×2) = 6/6 = 1',
                    'Jawaban: 1 cangkir gula'
                ]
            }
        },

        /* ---- SOAL 4: Nilai Ujian (Sedang, × dan +, urutan operasi) ---- */
        {
            id: 'p4',
            title: 'Nilai Ujian',
            difficulty: 2,
            context: 'Nilai ujian Budi dihitung dengan rumus: <strong>¾ dari skor pilihan ganda</strong> ditambah <strong>½ dari skor esai</strong>. Skor pilihan ganda Budi adalah <strong>80</strong> dan skor esainya adalah <strong>60</strong>.',
            question: 'Berapa nilai ujian Budi?',
            unit: '',

            identify: {
                instruction: 'Centang semua informasi yang diperlukan untuk menghitung nilai Budi.',
                items: [
                    { id: 'i1', text: 'Bobot pilihan ganda: ¾ dari skor PG', relevant: true },
                    { id: 'i2', text: 'Skor pilihan ganda: 80', relevant: true },
                    { id: 'i3', text: 'Bobot esai: ½ dari skor esai', relevant: true },
                    { id: 'i4', text: 'Skor esai: 60', relevant: true }
                ],
                hints: [
                    'Untuk menghitung nilai, kita perlu semua bobot dan semua skor.',
                    'Gunakan semua empat informasi: dua bobot dan dua skor.'
                ],
                feedbackCorrect: 'Tepat! Semua empat informasi diperlukan: dua bobot (¾ dan ½) dan dua skor (80 dan 60).',
                feedbackWrong: 'Belum tepat. Untuk menghitung nilai dengan rumus bobot×skor, kita perlu SEMUA bobot dan SEMUA skor.'
            },

            model: {
                instruction: 'Pilih ekspresi matematika yang sesuai.',
                options: [
                    {
                        id: 'm1', expr: '¾ × 80 + ½ × 60',
                        correct: true,
                        feedback: 'Benar! Nilai = (¾ × skor PG) + (½ × skor esai) = ¾×80 + ½×60.'
                    },
                    {
                        id: 'm2', expr: '(¾ + ½) × (80 + 60)',
                        correct: false,
                        feedback: 'Tidak tepat. Bobot dan skor masing-masing harus dikalikan terpisah, bukan dijumlahkan dulu.'
                    },
                    {
                        id: 'm3', expr: '¾ × 60 + ½ × 80',
                        correct: false,
                        feedback: 'Perhatikan! Bobot ¾ untuk pilihan ganda (80) dan bobot ½ untuk esai (60), bukan sebaliknya.'
                    },
                    {
                        id: 'm4', expr: '¾ + 80 + ½ + 60',
                        correct: false,
                        feedback: 'Tidak tepat. Bobot harus DIKALI dengan skornya, bukan dijumlahkan.'
                    }
                ],
                hints: [
                    'Rumus: nilai = (bobot PG × skor PG) + (bobot esai × skor esai).',
                    'Nilai = ¾ × 80 + ½ × 60. Isi angka yang sesuai.'
                ]
            },

            /* Soal ini memiliki urutan operasi: × sebelum + */
            order: {
                instruction: 'Dalam ekspresi ¾ × 80 + ½ × 60, operasi mana yang harus dikerjakan TERLEBIH DAHULU?',
                options: [
                    {
                        id: 'o1', label: 'Perkalian (×) dulu, baru penjumlahan (+)',
                        correct: true,
                        feedback: 'Benar! Dalam urutan operasi, perkalian (×) selalu dikerjakan sebelum penjumlahan (+).'
                    },
                    {
                        id: 'o2', label: 'Penjumlahan (+) dulu, baru perkalian (×)',
                        correct: false,
                        feedback: 'Tidak tepat! Jika kita jumlahkan dulu (¾ + ½ = 5/4, lalu 80 + 60 = 140), hasilnya akan berbeda dan salah. Perkalian harus lebih dulu.'
                    },
                    {
                        id: 'o3', label: 'Dari kiri ke kanan saja, tidak ada urutan khusus',
                        correct: false,
                        feedback: 'Tidak tepat. Kiri-ke-kanan hanya berlaku untuk operasi dengan prioritas SAMA. Perkalian dan penjumlahan memiliki prioritas berbeda!'
                    },
                    {
                        id: 'o4', label: 'Tidak ada urutan — hasilnya sama saja',
                        correct: false,
                        feedback: 'Tidak tepat. Coba hitung: jika + dulu: (¾+½)×(80+60) = 175. Jika × dulu: ¾×80 + ½×60 = 90. Hasilnya berbeda!'
                    }
                ],
                hints: [
                    'Ingat aturan BODMAS/PEMDAS: Perkalian dan Pembagian dikerjakan SEBELUM Penjumlahan dan Pengurangan.',
                    'Dalam ¾ × 80 + ½ × 60: kerjakan ¾×80 = 60 dan ½×60 = 30 terlebih dahulu, BARU jumlahkan 60 + 30.'
                ],
                feedbackCorrect: 'Tepat! Perkalian (×) selalu dikerjakan sebelum penjumlahan (+) dalam urutan operasi.'
            },

            calc: {
                instruction: 'Hitung setiap bagian secara berurutan.',
                steps: [
                    {
                        id: 'cs1',
                        instruction: 'Hitung bagian pertama (perkalian pertama):',
                        prompt: '¾ × 80 = ?',
                        inputLabel: 'Hasil ¾ × 80',
                        inputPlaceholder: '60',
                        answerType: 'decimal',
                        answer: 60,
                        tolerance: 0.1,
                        correctDisplay: '60',
                        hints: [
                            '¾ × 80 = 3/4 × 80. Cara: (3 × 80) ÷ 4 = ?',
                            '3 × 80 = 240. Kemudian 240 ÷ 4 = 60.'
                        ],
                        feedbackCorrect: 'Benar! ¾ × 80 = 60.',
                        feedbackWrong: 'Belum tepat. Hitung: 3/4 × 80 = (3×80)/4 = 240/4 = 60.'
                    },
                    {
                        id: 'cs2',
                        instruction: 'Hitung bagian kedua (perkalian kedua):',
                        prompt: '½ × 60 = ?',
                        inputLabel: 'Hasil ½ × 60',
                        inputPlaceholder: '30',
                        answerType: 'decimal',
                        answer: 30,
                        tolerance: 0.1,
                        correctDisplay: '30',
                        hints: [
                            '½ × 60 = 60 ÷ 2 = ?',
                            '60 ÷ 2 = 30.'
                        ],
                        feedbackCorrect: 'Benar! ½ × 60 = 30.',
                        feedbackWrong: 'Belum tepat. ½ × 60 = 60/2 = 30.'
                    },
                    {
                        id: 'cs3',
                        instruction: 'Sekarang jumlahkan kedua hasil:',
                        prompt: '60 + 30 = ?',
                        inputLabel: 'Nilai akhir',
                        inputPlaceholder: '90',
                        answerType: 'decimal',
                        answer: 90,
                        tolerance: 0.1,
                        correctDisplay: '90',
                        hints: [
                            'Jumlahkan hasil perkalian pertama dan kedua: 60 + 30 = ?',
                            '60 + 30 = 90.'
                        ],
                        feedbackCorrect: 'Benar! 60 + 30 = 90.',
                        feedbackWrong: 'Belum tepat. Jumlahkan: 60 + 30 = 90.'
                    }
                ]
            },

            answer: {
                prompt: 'Jadi, berapa nilai ujian Budi?',
                inputLabel: 'Nilai ujian Budi',
                inputPlaceholder: '90',
                answer: 90,
                tolerance: 0.1,
                unit: '',
                correctDisplay: '90',
                hints: [
                    'Gunakan hasil penjumlahan terakhir.',
                    '¾×80 + ½×60 = 60 + 30 = 90.'
                ],
                feedbackCorrect: 'Benar! Nilai ujian Budi adalah 90.',
                feedbackWrong: 'Belum tepat. Periksa kembali langkah perhitungan.'
            },

            verify: {
                question: 'Skor PG Budi 80, skor esai 60. Bobot PG adalah ¾ (=0,75) dan bobot esai ½ (=0,5). Apakah nilai 90 masuk akal?',
                options: [
                    { id: 'v1', text: 'Ya. 0,75×80 + 0,5×60 = 60 + 30 = 90. Masuk akal.', correct: true },
                    { id: 'v2', text: 'Tidak. Nilainya seharusnya lebih dari 140.', correct: false },
                    { id: 'v3', text: 'Tidak. Nilainya seharusnya kurang dari 50.', correct: false }
                ],
                feedbackCorrect: 'Tepat! ¾×80 = 60 dan ½×60 = 30. Total 90. Nilai ini masuk akal: tidak melebihi total skor (80+60=140) dan tidak terlalu kecil.',
                feedbackWrong: 'Perhatikan: Nilai max teoritis = 1×80 + 1×60 = 140. Dengan bobot ¾ dan ½, nilai wajarnya adalah 60+30=90. Masuk akal.'
            },

            solution: {
                steps: [
                    'Diketahui: skor PG=80 (bobot ¾), skor esai=60 (bobot ½)',
                    'Ditanya: nilai ujian',
                    'Operasi: ¾ × 80 + ½ × 60',
                    'Urutan: perkalian dulu (× sebelum +)',
                    'Hitung: ¾ × 80 = 60',
                    'Hitung: ½ × 60 = 30',
                    'Jumlahkan: 60 + 30 = 90',
                    'Jawaban: Nilai Budi = 90'
                ]
            }
        },

        /* ---- SOAL 5: Persediaan Jus (Sulit, − berturut, pecahan + desimal) ---- */
        {
            id: 'p5',
            title: 'Persediaan Jus',
            difficulty: 3,
            context: 'Sebuah termos berisi <strong>1,8 liter</strong> jus. Siswa kelas A meminum <strong>¼ liter</strong> dan siswa kelas B meminum <strong>0,6 liter</strong>.',
            question: 'Berapa liter jus yang tersisa di termos?',
            unit: 'liter',

            identify: {
                instruction: 'Centang semua informasi yang diperlukan untuk menjawab pertanyaan.',
                items: [
                    { id: 'i1', text: 'Volume jus awal: 1,8 liter', relevant: true },
                    { id: 'i2', text: 'Volume diminum kelas A: ¼ liter', relevant: true },
                    { id: 'i3', text: 'Volume diminum kelas B: 0,6 liter', relevant: true },
                    { id: 'i4', text: 'Jus disimpan dalam termos', relevant: false }
                ],
                hints: [
                    'Kita ingin tahu sisa jus. Butuh volume awal dan semua yang diminum.',
                    'Pilih informasi tentang volume jus (awal, kelas A, kelas B).'
                ],
                feedbackCorrect: 'Tepat! Kita perlu volume awal (1,8 L), yang diminum kelas A (¼ L), dan kelas B (0,6 L).',
                feedbackWrong: 'Belum tepat. Pilih ketiga informasi volume jus. Informasi tentang termos tidak diperlukan.'
            },

            model: {
                instruction: 'Pilih ekspresi matematika yang sesuai.',
                options: [
                    {
                        id: 'm1', expr: '1,8 − ¼ − 0,6',
                        correct: true,
                        feedback: 'Benar! Kurangi volume yang diminum kelas A, lalu kurangi lagi yang diminum kelas B.'
                    },
                    {
                        id: 'm2', expr: '1,8 − (¼ + 0,6)',
                        correct: true,
                        feedback: 'Benar juga! Menjumlahkan yang diminum dulu, lalu mengurangi dari awal. Hasilnya sama.'
                    },
                    {
                        id: 'm3', expr: '1,8 + ¼ + 0,6',
                        correct: false,
                        feedback: 'Penjumlahan tidak tepat. Jus diminum (berkurang), bukan ditambah.'
                    },
                    {
                        id: 'm4', expr: '¼ + 0,6 − 1,8',
                        correct: false,
                        feedback: 'Urutan tidak tepat. Kita kurangi dari volume awal (1,8), bukan mengurangi 1,8 dari yang diminum.'
                    }
                ],
                hints: [
                    'Sisa = awal − yang diambil. Dua kelompok minum, jadi ada dua pengurangan.',
                    'Sisa = 1,8 − ¼ − 0,6, atau sama hasilnya: 1,8 − (¼ + 0,6).'
                ]
            },

            order: null,

            calc: {
                instruction: 'Selesaikan perhitungan langkah demi langkah.',
                steps: [
                    {
                        id: 'cs1',
                        instruction: 'Ubah ¼ ke desimal:',
                        prompt: '¼ = ?',
                        inputLabel: 'Nilai desimal dari ¼',
                        inputPlaceholder: '0,25',
                        answerType: 'decimal',
                        answer: 0.25,
                        tolerance: 0.005,
                        correctDisplay: '0,25',
                        hints: [
                            '¼ berarti 1 dibagi 4. Hitung: 1 ÷ 4 = ?',
                            '1 ÷ 4 = 0,25. Atau: ¼ = 25/100 = 0,25.'
                        ],
                        feedbackCorrect: 'Benar! ¼ = 0,25.',
                        feedbackWrong: 'Belum tepat. ¼ = 1 ÷ 4 = 0,25.'
                    },
                    {
                        id: 'cs2',
                        instruction: 'Kurangi yang diminum kelas A:',
                        prompt: '1,8 − 0,25 = ?',
                        inputLabel: 'Sisa setelah kelas A minum (liter)',
                        inputPlaceholder: '1,55',
                        answerType: 'decimal',
                        answer: 1.55,
                        tolerance: 0.01,
                        correctDisplay: '1,55',
                        hints: [
                            '1,8 − 0,25: perhatikan nilai tempat. 1,80 − 0,25 = ?',
                            '1,80 − 0,25 = 1,55. Kurangi: 80 per-seratus minus 25 per-seratus = 55 per-seratus.'
                        ],
                        feedbackCorrect: 'Benar! 1,8 − 0,25 = 1,55.',
                        feedbackWrong: 'Belum tepat. Hitung: 1,80 − 0,25 = 1,55.'
                    },
                    {
                        id: 'cs3',
                        instruction: 'Kurangi yang diminum kelas B:',
                        prompt: '1,55 − 0,6 = ?',
                        inputLabel: 'Sisa akhir (liter)',
                        inputPlaceholder: '0,95',
                        answerType: 'decimal',
                        answer: 0.95,
                        tolerance: 0.01,
                        correctDisplay: '0,95',
                        hints: [
                            '1,55 − 0,6 = 1,55 − 0,60 = ?',
                            '1,55 − 0,60 = 0,95.'
                        ],
                        feedbackCorrect: 'Benar! 1,55 − 0,6 = 0,95.',
                        feedbackWrong: 'Belum tepat. Hitung: 1,55 − 0,60 = 0,95.'
                    }
                ]
            },

            answer: {
                prompt: 'Jadi, berapa liter jus yang tersisa di termos?',
                inputLabel: 'Sisa jus (liter)',
                inputPlaceholder: '0,95',
                answer: 0.95,
                tolerance: 0.01,
                unit: 'liter',
                correctDisplay: '0,95 liter',
                hints: [
                    'Gunakan hasil dari langkah terakhir.',
                    '1,8 − 0,25 − 0,6 = 1,55 − 0,6 = 0,95 liter.'
                ],
                feedbackCorrect: 'Benar! Sisa jus di termos adalah 0,95 liter.',
                feedbackWrong: 'Belum tepat. Periksa kembali langkah perhitungan.'
            },

            verify: {
                question: 'Jus awal 1,8 L. Diminum 0,25 + 0,6 = 0,85 L. Sisa = 1,8 − 0,85 = 0,95 L. Masuk akal?',
                options: [
                    { id: 'v1', text: 'Ya. Sisa harus lebih kecil dari 1,8 L dan positif. 0,95 L sesuai.', correct: true },
                    { id: 'v2', text: 'Tidak. Sisanya seharusnya lebih dari 1,8 L.', correct: false },
                    { id: 'v3', text: 'Tidak. Sisanya seharusnya negatif karena lebih banyak yang diminum.', correct: false }
                ],
                feedbackCorrect: 'Tepat! Total yang diminum: 0,25 + 0,6 = 0,85 L. Karena 0,85 < 1,8, masih ada sisa positif: 1,8 − 0,85 = 0,95 L.',
                feedbackWrong: 'Perhatikan: total yang diminum = ¼ + 0,6 = 0,25 + 0,6 = 0,85 L. Karena 0,85 < 1,8, sisa pasti positif dan lebih kecil dari 1,8. Hasil 0,95 L masuk akal.'
            },

            solution: {
                steps: [
                    'Diketahui: jus awal = 1,8 L, kelas A minum = ¼ L, kelas B minum = 0,6 L',
                    'Ditanya: sisa jus',
                    'Operasi: 1,8 − ¼ − 0,6',
                    'Ubah ¼ ke desimal: ¼ = 0,25',
                    'Kurangi kelas A: 1,8 − 0,25 = 1,55',
                    'Kurangi kelas B: 1,55 − 0,6 = 0,95',
                    'Jawaban: Sisa jus = 0,95 liter'
                ]
            }
        }
    ],

    /* ----------------------------------------------------------
       REFLEKSI
       ---------------------------------------------------------- */
    refleksi: {
        title: 'Refleksi Pembelajaran',
        questions: [
            {
                id: 'r1',
                prompt: 'Pada bagian mana kamu paling sering melakukan kesalahan? (pilih satu)',
                type: 'mc',
                options: [
                    'Menentukan operasi yang tepat (+, −, ×, ÷)',
                    'Menyamakan penyebut pecahan',
                    'Mengubah pecahan ke desimal',
                    'Menentukan urutan operasi (mana yang dikerjakan dulu)',
                    'Menghitung desimal (letak koma)',
                    'Tidak terlalu banyak kesalahan'
                ]
            },
            {
                id: 'r2',
                prompt: 'Apa yang paling penting diperhatikan sebelum menghitung operasi campuran?',
                type: 'text',
                placeholder: 'Tuliskan jawabanmu di sini...'
            }
        ]
    }

};
