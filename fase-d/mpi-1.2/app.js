'use strict';

/* =========================================================================
   Belanja Cermat — Bilangan Rasional · MPI 1.2
   Sections:
   1. Math core (rational number utilities)
   2. Content data
   3. Application state
   4. Stage navigation
   5. Stage: Orientasi
   6. Stage: Eksplorasi
   7. Stage: Matching
   8. Stage: Konversi
   9. Stage: Belanja (sort + budget)
   10. Stage: Kuis
   11. Stage: Refleksi
   12. Stage: Hasil
   13. Global reset
   14. Init
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. MATH CORE
   ------------------------------------------------------------------------- */

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b > 0) { var t = b; b = a % b; a = t; }
  return a === 0 ? 1 : a;
}

/** Parse a decimal string (comma or dot) to a float. Returns NaN if invalid. */
function parseDecimalInput(str) {
  if (typeof str !== 'string') return NaN;
  var normalized = str.trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return NaN;
  return parseFloat(normalized);
}

/** Format a float to Indonesian decimal notation, up to 6 significant decimal places. */
function formatDecimalID(val) {
  if (!isFinite(val)) return '—';
  // Avoid floating-point noise by rounding to 10 decimal places first
  var rounded = Math.round(val * 1e10) / 1e10;
  // Convert to string and replace dot with comma
  var s = rounded.toString();
  return s.replace('.', ',');
}

/** Format rupiah */
function formatRupiah(val) {
  return 'Rp ' + val.toLocaleString('id-ID');
}

/** Convert fraction (whole, num, den) to decimal. den must be non-zero. */
function fracToDecimal(whole, num, den) {
  if (den === 0) return NaN;
  return whole + num / den;
}

/**
 * Convert a finite positive decimal to a simplified fraction {whole, num, den, display}.
 * Works for decimals with up to 6 decimal places.
 */
function decimalToFrac(val) {
  if (!isFinite(val) || val < 0) return null;
  var wholePart = Math.floor(val);
  var fracPart = Math.round((val - wholePart) * 1e6) / 1e6;

  if (fracPart === 0) {
    return { whole: wholePart, num: 0, den: 1, display: String(wholePart) };
  }

  // Count decimal places of fracPart string
  var fracStr = fracPart.toFixed(6).replace(/0+$/, '');
  var decPlaces = (fracStr.split('.')[1] || '').length;
  var multiplier = Math.pow(10, decPlaces);
  var rawNum = Math.round(fracPart * multiplier);
  var rawDen = multiplier;
  var g = gcd(rawNum, rawDen);
  var simplNum = rawNum / g;
  var simplDen = rawDen / g;

  var display;
  if (wholePart > 0) {
    display = wholePart + ' ' + simplNum + '/' + simplDen;
  } else {
    display = simplNum + '/' + simplDen;
  }

  return { whole: wholePart, num: simplNum, den: simplDen, display: display };
}

/** Compare two values as rational numbers (avoid float precision issues for known fractions). */
function compareVals(a, b) {
  var diff = a - b;
  if (Math.abs(diff) < 1e-9) return 0;
  return diff < 0 ? -1 : 1;
}

/** Format a fraction for readable display with proper fraction notation. */
function formatFracDisplay(pairObj) {
  return pairObj.fracDisplay;
}

/* -------------------------------------------------------------------------
   2. CONTENT DATA
   ------------------------------------------------------------------------- */

/**
 * Matching pairs — fraction ↔ decimal.
 * fracVal: decimal equivalent used for comparison
 * fracDisplay: display string
 */
var MATCHING_PAIRS = [
  { id: 0, fracDisplay: '1/2', decDisplay: '0,5', fracVal: 0.5 },
  { id: 1, fracDisplay: '3/4', decDisplay: '0,75', fracVal: 0.75 },
  { id: 2, fracDisplay: '1 1/4', decDisplay: '1,25', fracVal: 1.25 },
  { id: 3, fracDisplay: '2/5', decDisplay: '0,4', fracVal: 0.4 },
  { id: 4, fracDisplay: '3/5', decDisplay: '0,6', fracVal: 0.6 },
  { id: 5, fracDisplay: '1 3/4', decDisplay: '1,75', fracVal: 1.75 },
  { id: 6, fracDisplay: '1/5', decDisplay: '0,2', fracVal: 0.2 },
  { id: 7, fracDisplay: '4/5', decDisplay: '0,8', fracVal: 0.8 },
];

/**
 * Receipt items for exploration stage.
 * tertulisIsDecimal: if true, the "tercantum" form is decimal; otherwise fraction
 */
var RECEIPT_ITEMS = [
  { nama: 'Beras', tercantum: '3/4 kg', desimal: '0,75 kg', pecahan: '3/4 kg', tercantumIsDecimal: false },
  { nama: 'Gula Pasir', tercantum: '1 1/4 kg', desimal: '1,25 kg', pecahan: '5/4 kg', tercantumIsDecimal: false },
  { nama: 'Minyak Goreng', tercantum: '0,75 L', desimal: '0,75 L', pecahan: '3/4 L', tercantumIsDecimal: true },
  { nama: 'Tepung Terigu', tercantum: '2/5 kg', desimal: '0,4 kg', pecahan: '2/5 kg', tercantumIsDecimal: false },
  { nama: 'Telur', tercantum: '1 1/2 kg', desimal: '1,5 kg', pecahan: '3/2 kg', tercantumIsDecimal: false },
  { nama: 'Mentega', tercantum: '0,25 kg', desimal: '0,25 kg', pecahan: '1/4 kg', tercantumIsDecimal: true },
];

/**
 * Shopping items for sort + budget activities.
 * qtyVal: numeric value for comparison/sorting
 * qtyDisplay: string shown to user (mixed fractions and decimals)
 * price: total price in rupiah (integer)
 */
var SHOP_ITEMS = [
  { id: 0, name: 'Mentega', qtyDisplay: '1/4 kg', qtyVal: 0.25, price: 6000 },
  { id: 1, name: 'Tepung Terigu', qtyDisplay: '2/5 kg', qtyVal: 0.40, price: 5000 },
  { id: 2, name: 'Wortel', qtyDisplay: '0,5 kg', qtyVal: 0.50, price: 4000 },
  { id: 3, name: 'Tomat', qtyDisplay: '3/5 kg', qtyVal: 0.60, price: 5400 },
  { id: 4, name: 'Beras', qtyDisplay: '0,75 kg', qtyVal: 0.75, price: 8250 },
  { id: 5, name: 'Minyak Goreng', qtyDisplay: '4/5 L', qtyVal: 0.80, price: 14400 },
];

var BUDGET = 30000;

// Event binding flags — prevent duplicate listeners
var _matchEventsBound = false;
var _sortEventsBound = false;
var _belanjaEventsBound = false;
var _kuisEventsBound = false;
var _refleksiEventsBound = false;
var _sortDragSrc = null;

// Correct sort order (ascending by qtyVal): [0,1,2,3,4,5] = Mentega, Tepung, Wortel, Tomat, Beras, Minyak
var CORRECT_SORT_ORDER = [0, 1, 2, 3, 4, 5];

/** Konversi examples shown in stage 4 */
var KONVERSI_EXAMPLES = [
  { frac: '1/4', step: '1 ÷ 4 =', dec: '0,25' },
  { frac: '3/4', step: '3 ÷ 4 =', dec: '0,75' },
  { frac: '2/5', step: '2 ÷ 5 =', dec: '0,4' },
  { frac: '1 1/2', step: '1 + (1÷2) =', dec: '1,5' },
];

/** Quiz questions */
var QUIZ_QUESTIONS = [
  {
    id: 1,
    prompt: 'Ubah pecahan <strong>7/20</strong> ke dalam bentuk desimal.',
    options: ['0,35', '0,7', '0,72', '3,5'],
    correctIndex: 0,
    feedbackCorrect: 'Tepat! 7 ÷ 20 = 0,35. Caranya: 7 ÷ 20 = 7 × 5 ÷ (20 × 5) = 35/100 = 0,35.',
    feedbackWrong: [
      null,
      'Belum tepat. 7/20 bukan 7/10. Ingat: 7 dibagi 20, bukan 7 dibagi 10. Coba: 7 ÷ 20 = ?',
      'Belum tepat. Periksa kembali pembagiannya: 7 ÷ 20. Kamu bisa mengalikan agar penyebutnya 100: 7/20 = 35/100 = 0,35.',
      'Belum tepat. Hasil tidak mungkin lebih besar dari pembilangnya ketika penyebut > 1. Coba: 7 ÷ 20 = ?',
    ],
  },
  {
    id: 2,
    prompt: 'Manakah yang nilainya sama dengan <strong>1,6</strong>?',
    options: ['1 3/5', '1 1/6', '2 3/5', '3/2'],
    correctIndex: 0,
    feedbackCorrect: 'Tepat! 1,6 = 1 + 0,6 = 1 + 3/5 = 1 3/5. Atau: 1,6 = 16/10 = 8/5 = 1 3/5.',
    feedbackWrong: [
      null,
      'Belum tepat. 1 1/6 = 7/6 ≈ 1,167, bukan 1,6. Coba ubah 1,6 ke pecahan: 1,6 = 16/10 = ?',
      'Belum tepat. 2 3/5 = 2,6, bukan 1,6. Perhatikan bagian bilangan bulatnya.',
      'Belum tepat. 3/2 = 1,5, bukan 1,6. Coba: 1,6 = 16/10, sederhanakan untuk mendapat jawabannya.',
    ],
  },
  {
    id: 3,
    prompt: 'Manakah urutan yang benar dari <strong>terkecil ke terbesar</strong> untuk: <strong>3/4 , 0,6 , 1 1/5</strong>?',
    options: [
      '0,6  &lt;  3/4  &lt;  1 1/5',
      '3/4  &lt;  0,6  &lt;  1 1/5',
      '0,6  &lt;  1 1/5  &lt;  3/4',
      '3/4  &lt;  1 1/5  &lt;  0,6',
    ],
    correctIndex: 0,
    feedbackCorrect: 'Tepat! Setelah dikonversi: 0,6 &lt; 3/4 (0,75) &lt; 1 1/5 (1,2). Kuncinya adalah mengonversi semua ke desimal terlebih dahulu agar mudah dibandingkan.',
    feedbackWrong: [
      null,
      'Belum tepat. Konversi dulu: 3/4 = 0,75 dan 0,6 = 0,6. Mana yang lebih kecil, 0,75 atau 0,6?',
      'Belum tepat. Konversi: 1 1/5 = 1,2 dan 3/4 = 0,75. Perhatikan: 1,2 > 0,75, jadi 1 1/5 bukan lebih kecil dari 3/4.',
      'Belum tepat. Konversi semua: 3/4 = 0,75; 0,6 = 0,6; 1 1/5 = 1,2. Urutkan: 0,6 &lt; 0,75 &lt; 1,2.',
    ],
  },
];

/* -------------------------------------------------------------------------
   3. APPLICATION STATE
   ------------------------------------------------------------------------- */

var state = {
  currentStage: 'orientasi',
  unlockedStages: ['orientasi', 'eksplorasi'],

  matching: {
    // selectedFrac: index of selected fraction card (null if none)
    selectedFrac: null,
    // selectedDec: index of selected decimal card (null if none)
    selectedDec: null,
    // matched: array of pair ids that have been matched
    matched: [],
    attempts: 0,
    // dragSrcId: id of card being dragged
    dragSrcId: null,
    // shuffledDecOrder: array of pair ids in shuffled order for decimal column
    shuffledDecOrder: [],
  },

  receipt: {
    // revealedRows: indices of receipt rows that have been revealed
    revealed: [],
  },

  sort: {
    // currentOrder: array of shop item ids in current user order
    currentOrder: [],
    submitted: false,
    correct: false,
  },

  budget: {
    // selected: set of shop item ids selected for cart
    selected: [],
    submitted: false,
  },

  kuis: {
    // perQuestion: {selected: optionIndex|null, submitted: bool}
    perQ: [
      { selected: null, submitted: false },
      { selected: null, submitted: false },
      { selected: null, submitted: false },
    ],
  },

  refleksi: {
    convert: 0,
    compare: 0,
  },
};

/* -------------------------------------------------------------------------
   4. STAGE NAVIGATION
   ------------------------------------------------------------------------- */

var STAGE_ORDER = ['orientasi', 'eksplorasi', 'matching', 'konversi', 'belanja', 'kuis', 'refleksi', 'hasil'];

function goToStage(name) {
  if (STAGE_ORDER.indexOf(name) === -1) return;

  // Unlock target stage
  if (state.unlockedStages.indexOf(name) === -1) {
    state.unlockedStages.push(name);
  }

  // Hide current, show new
  var prev = document.getElementById('stage-' + state.currentStage);
  if (prev) prev.hidden = true;
  var next = document.getElementById('stage-' + name);
  if (next) {
    next.hidden = false;
    next.focus();
  }

  state.currentStage = name;
  updateNavUI();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger stage-specific render if needed
  if (name === 'hasil') renderHasil();
  if (name === 'refleksi') renderRefleksiState();
}

function updateNavUI() {
  var navItems = document.querySelectorAll('.stage-nav__item');
  var currentIdx = STAGE_ORDER.indexOf(state.currentStage);

  navItems.forEach(function (btn) {
    var stageName = btn.getAttribute('data-stage');
    var stageIdx = STAGE_ORDER.indexOf(stageName);

    // Current
    if (stageName === state.currentStage) {
      btn.setAttribute('aria-current', 'step');
    } else {
      btn.removeAttribute('aria-current');
    }

    // Completed (before current)
    if (stageIdx < currentIdx) {
      btn.classList.add('is-complete');
    } else {
      btn.classList.remove('is-complete');
    }

    // Enabled/disabled
    if (state.unlockedStages.indexOf(stageName) !== -1) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  });
}

/* -------------------------------------------------------------------------
   5. STAGE: ORIENTASI
   ------------------------------------------------------------------------- */

function initOrientasi() {
  var startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      goToStage('eksplorasi');
    });
  }
}

/* -------------------------------------------------------------------------
   6. STAGE: EKSPLORASI
   ------------------------------------------------------------------------- */

function renderReceipt() {
  var tbody = document.getElementById('receiptBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  RECEIPT_ITEMS.forEach(function (item, idx) {
    var tr = document.createElement('tr');

    // Name cell
    var tdName = document.createElement('td');
    tdName.textContent = item.nama;
    tdName.style.fontWeight = '600';
    tr.appendChild(tdName);

    // Tercantum cell
    var tdTercantum = document.createElement('td');
    tdTercantum.classList.add('receipt__qty');
    tdTercantum.textContent = item.tercantum;
    tr.appendChild(tdTercantum);

    // Desimal cell
    var tdDec = document.createElement('td');
    if (item.tercantumIsDecimal) {
      tdDec.textContent = item.desimal;
      tdDec.style.color = 'var(--color-ink-muted)';
    } else {
      tdDec.appendChild(createRevealBtn(item.desimal, idx, 'dec'));
    }
    tr.appendChild(tdDec);

    // Pecahan cell
    var tdFrac = document.createElement('td');
    if (!item.tercantumIsDecimal) {
      tdFrac.textContent = item.pecahan;
      tdFrac.style.color = 'var(--color-ink-muted)';
    } else {
      tdFrac.appendChild(createRevealBtn(item.pecahan, idx, 'frac'));
    }
    tr.appendChild(tdFrac);

    tbody.appendChild(tr);
  });
}

function createRevealBtn(text, rowIdx, type) {
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.classList.add('receipt__reveal-btn');
  btn.textContent = 'Lihat Setara';
  btn.setAttribute('aria-label', 'Lihat nilai setara untuk baris ' + (rowIdx + 1));

  var revealed = false;
  btn.addEventListener('click', function () {
    if (!revealed) {
      btn.textContent = text;
      btn.classList.add('is-revealed');
      btn.setAttribute('aria-label', 'Nilai setara: ' + text);
      btn.disabled = true;
      revealed = true;
    }
  });

  return btn;
}

/* -------------------------------------------------------------------------
   7. STAGE: MATCHING
   ------------------------------------------------------------------------- */

function shuffleArray(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function initMatching() {
  if (state.matching.shuffledDecOrder.length === 0) {
    state.matching.shuffledDecOrder = shuffleArray(MATCHING_PAIRS.map(function (p) { return p.id; }));
  }
  renderMatchingCards();
  if (!_matchEventsBound) {
    bindMatchingEvents();
    _matchEventsBound = true;
  }
}

function renderMatchingCards() {
  var fracCol = document.getElementById('fracCol');
  var decCol = document.getElementById('decCol');
  if (!fracCol || !decCol) return;

  fracCol.innerHTML = '';
  decCol.innerHTML = '';

  // Fraction cards
  MATCHING_PAIRS.forEach(function (pair) {
    var card = createMatchCard(pair.id, 'frac', pair.fracDisplay);
    fracCol.appendChild(card);
  });

  // Decimal cards in shuffled order
  state.matching.shuffledDecOrder.forEach(function (pairId) {
    var pair = MATCHING_PAIRS[pairId];
    var card = createMatchCard(pair.id, 'dec', pair.decDisplay);
    decCol.appendChild(card);
  });

  updateMatchCardStates();
  updateMatchScoreBar();
}

function createMatchCard(pairId, type, label) {
  var card = document.createElement('button');
  card.type = 'button';
  card.classList.add('match-card');
  card.setAttribute('role', 'listitem');
  card.setAttribute('data-pair-id', String(pairId));
  card.setAttribute('data-card-type', type);
  card.setAttribute('aria-label', (type === 'frac' ? 'Pecahan ' : 'Desimal ') + label);

  // Render display
  card.innerHTML = renderCardLabel(label, type);

  if (type === 'frac') {
    card.setAttribute('draggable', 'true');
  }

  return card;
}

function renderCardLabel(label, type) {
  if (type === 'dec') {
    return '<span>' + label + '</span>';
  }
  // fraction: handle mixed numbers and simple fractions
  var mixedMatch = label.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    return '<span class="frac-display frac-display--mixed">' +
      mixedMatch[1] + ' ' +
      '<span class="frac-display">' +
      '<span class="frac-display__num">' + mixedMatch[2] + '</span>' +
      '<span class="frac-display__den">' + mixedMatch[3] + '</span>' +
      '</span>' +
      '</span>';
  }
  var fracMatch = label.match(/^(\d+)\/(\d+)$/);
  if (fracMatch) {
    return '<span class="frac-display">' +
      '<span class="frac-display__num">' + fracMatch[1] + '</span>' +
      '<span class="frac-display__den">' + fracMatch[2] + '</span>' +
      '</span>';
  }
  return label;
}

function updateMatchCardStates() {
  var allCards = document.querySelectorAll('.match-card');
  var m = state.matching;

  allCards.forEach(function (card) {
    var pairId = parseInt(card.getAttribute('data-pair-id'), 10);
    var type = card.getAttribute('data-card-type');

    card.classList.remove('is-selected', 'is-matched', 'is-wrong');
    card.disabled = false;
    card.setAttribute('draggable', type === 'frac' ? 'true' : 'false');

    if (m.matched.indexOf(pairId) !== -1) {
      card.classList.add('is-matched');
      card.disabled = true;
      card.setAttribute('aria-disabled', 'true');
      card.setAttribute('draggable', 'false');
    } else if (m.selectedFrac === pairId && type === 'frac') {
      card.classList.add('is-selected');
      card.setAttribute('aria-pressed', 'true');
    } else if (m.selectedDec === pairId && type === 'dec') {
      card.classList.add('is-selected');
      card.setAttribute('aria-pressed', 'true');
    } else {
      card.setAttribute('aria-pressed', 'false');
    }
  });
}

function updateMatchScoreBar() {
  var el = document.getElementById('matchCorrect');
  var at = document.getElementById('matchAttempts');
  if (el) el.textContent = state.matching.matched.length;
  if (at) at.textContent = state.matching.attempts;
}

function bindMatchingEvents() {
  var fracCol = document.getElementById('fracCol');
  var decCol = document.getElementById('decCol');
  if (!fracCol || !decCol) return;

  // Click events
  fracCol.addEventListener('click', function (e) {
    var card = e.target.closest('.match-card');
    if (!card || card.disabled) return;
    var pairId = parseInt(card.getAttribute('data-pair-id'), 10);
    handleFracCardClick(pairId);
  });

  decCol.addEventListener('click', function (e) {
    var card = e.target.closest('.match-card');
    if (!card || card.disabled) return;
    var pairId = parseInt(card.getAttribute('data-pair-id'), 10);
    handleDecCardClick(pairId);
  });

  // Drag events on fracCol
  fracCol.addEventListener('dragstart', function (e) {
    var card = e.target.closest('.match-card');
    if (!card || card.disabled) return;
    var pairId = parseInt(card.getAttribute('data-pair-id'), 10);
    state.matching.dragSrcId = pairId;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(pairId));
  });

  fracCol.addEventListener('dragend', function (e) {
    var card = e.target.closest('.match-card');
    if (card) card.classList.remove('dragging');
    state.matching.dragSrcId = null;
    // Remove drag-over states
    document.querySelectorAll('.match-card.drag-over').forEach(function (c) {
      c.classList.remove('drag-over');
    });
  });

  // Drop targets on decCol
  decCol.addEventListener('dragover', function (e) {
    var card = e.target.closest('.match-card');
    if (card && !card.disabled) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      // Highlight only this card
      document.querySelectorAll('.match-card.drag-over').forEach(function (c) { c.classList.remove('drag-over'); });
      card.classList.add('drag-over');
    }
  });

  decCol.addEventListener('dragleave', function (e) {
    var card = e.target.closest('.match-card');
    if (card) card.classList.remove('drag-over');
  });

  decCol.addEventListener('drop', function (e) {
    e.preventDefault();
    var card = e.target.closest('.match-card');
    if (!card || card.disabled) return;
    card.classList.remove('drag-over');
    var draggedId = state.matching.dragSrcId;
    if (draggedId === null) return;
    var targetId = parseInt(card.getAttribute('data-pair-id'), 10);
    attemptMatch(draggedId, targetId, true);
  });

  // Reset button
  var resetBtn = document.getElementById('matchResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetMatching);
  }
}

function handleFracCardClick(pairId) {
  var m = state.matching;
  if (m.matched.indexOf(pairId) !== -1) return;

  if (m.selectedFrac === pairId) {
    // Deselect
    m.selectedFrac = null;
  } else {
    m.selectedFrac = pairId;
    // If a dec is already selected, attempt match
    if (m.selectedDec !== null) {
      attemptMatch(pairId, m.selectedDec, false);
      return;
    }
  }
  updateMatchCardStates();
  clearMatchFeedback();
}

function handleDecCardClick(pairId) {
  var m = state.matching;
  if (m.matched.indexOf(pairId) !== -1) return;

  if (m.selectedFrac !== null) {
    // Attempt match
    attemptMatch(m.selectedFrac, pairId, false);
  } else {
    // Just select dec card (to show selection)
    if (m.selectedDec === pairId) {
      m.selectedDec = null;
    } else {
      m.selectedDec = pairId;
    }
    updateMatchCardStates();
    clearMatchFeedback();
  }
}

function attemptMatch(fracPairId, decPairId, isDrag) {
  var m = state.matching;
  m.attempts++;
  m.selectedFrac = null;
  m.selectedDec = null;

  if (fracPairId === decPairId) {
    // Correct match
    m.matched.push(fracPairId);
    updateMatchCardStates();
    updateMatchScoreBar();
    showMatchFeedback('correct', fracPairId);

    if (m.matched.length === MATCHING_PAIRS.length) {
      showMatchDone();
    }
  } else {
    // Wrong match
    showMatchFeedback('wrong', fracPairId, decPairId);
    flashWrongCards(fracPairId, decPairId);
    updateMatchCardStates();
    updateMatchScoreBar();
  }
}

function flashWrongCards(fracId, decId) {
  var cards = document.querySelectorAll('.match-card');
  cards.forEach(function (card) {
    var pid = parseInt(card.getAttribute('data-pair-id'), 10);
    var type = card.getAttribute('data-card-type');
    if ((pid === fracId && type === 'frac') || (pid === decId && type === 'dec')) {
      card.classList.add('is-wrong');
      setTimeout(function () { card.classList.remove('is-wrong'); }, 500);
    }
  });
}

function showMatchFeedback(type, fracId, decId) {
  var el = document.getElementById('matchFeedback');
  if (!el) return;

  var fracPair = MATCHING_PAIRS[fracId];

  if (type === 'correct') {
    el.className = 'feedback-box feedback-box--correct';
    el.innerHTML = '<strong>✓ Pasangan benar!</strong> ' +
      fracPair.fracDisplay + ' = ' + fracPair.decDisplay + '. Keduanya memiliki nilai yang sama.';
  } else {
    var fracPairF = MATCHING_PAIRS[fracId];
    var decPairF = MATCHING_PAIRS[decId];
    el.className = 'feedback-box feedback-box--wrong';
    el.innerHTML = '<strong>Belum tepat.</strong> ' +
      fracPairF.fracDisplay + ' tidak sama nilainya dengan ' + decPairF.decDisplay + '. ' +
      'Coba hitung: ' + fracPairF.fracDisplay + ' = ' +
      fracPairF.decDisplay + '. Cari pasangan yang nilainya sama!';
  }
}

function clearMatchFeedback() {
  var el = document.getElementById('matchFeedback');
  if (el) { el.className = 'feedback-box'; el.innerHTML = ''; }
}

function showMatchDone() {
  var doneMsg = document.getElementById('matchDoneMsg');
  var summary = document.getElementById('matchDoneSummary');
  if (doneMsg) doneMsg.hidden = false;
  if (summary) {
    var m = state.matching;
    summary.textContent = 'Percobaan yang diperlukan: ' + m.attempts +
      '. Semakin sedikit percobaan, semakin baik kamu mengenali nilai ekuivalen!';
  }
}

function resetMatching() {
  var m = state.matching;
  m.selectedFrac = null;
  m.selectedDec = null;
  m.matched = [];
  m.attempts = 0;
  m.dragSrcId = null;
  m.shuffledDecOrder = shuffleArray(MATCHING_PAIRS.map(function (p) { return p.id; }));

  var doneMsg = document.getElementById('matchDoneMsg');
  if (doneMsg) doneMsg.hidden = true;
  clearMatchFeedback();
  renderMatchingCards();
  // Events already bound — no re-binding needed
}

/* -------------------------------------------------------------------------
   8. STAGE: KONVERSI
   ------------------------------------------------------------------------- */

function renderKonversiExamples() {
  var container = document.getElementById('konversiExamples');
  if (!container) return;

  container.innerHTML = '';
  KONVERSI_EXAMPLES.forEach(function (ex) {
    var card = document.createElement('div');
    card.classList.add('konversi-example-card');
    card.innerHTML =
      '<span class="konversi-example-card__frac">' + ex.frac + '</span>' +
      '<span class="konversi-arrow">↓</span>' +
      '<span class="konversi-example-card__step">' + ex.step + '</span>' +
      '<span class="konversi-example-card__dec">' + ex.dec + '</span>';
    container.appendChild(card);
  });
}

function initKonversiTool() {
  var fracConvertBtn = document.getElementById('fracConvertBtn');
  var decConvertBtn = document.getElementById('decConvertBtn');

  if (fracConvertBtn) {
    fracConvertBtn.addEventListener('click', doFracToDecConversion);
  }
  if (decConvertBtn) {
    decConvertBtn.addEventListener('click', doDecToFracConversion);
  }

  // Allow Enter key in inputs
  var fracInputs = [document.getElementById('fracWhole'), document.getElementById('fracNum'), document.getElementById('fracDen')];
  fracInputs.forEach(function (inp) {
    if (inp) inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doFracToDecConversion();
    });
  });
  var decInput = document.getElementById('decInput');
  if (decInput) {
    decInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doDecToFracConversion();
    });
  }
}

function doFracToDecConversion() {
  var wholeEl = document.getElementById('fracWhole');
  var numEl = document.getElementById('fracNum');
  var denEl = document.getElementById('fracDen');
  var errorEl = document.getElementById('fracError');
  var resultEl = document.getElementById('fracResult');

  clearError(errorEl);
  resultEl.innerHTML = '';

  var wholeRaw = wholeEl ? wholeEl.value.trim() : '';
  var numRaw = numEl ? numEl.value.trim() : '';
  var denRaw = denEl ? denEl.value.trim() : '';

  if (numRaw === '' || denRaw === '') {
    showError(errorEl, 'Pembilang dan penyebut tidak boleh kosong.');
    return;
  }

  var whole = wholeRaw === '' ? 0 : parseInt(wholeRaw.replace(',', '.'), 10);
  var num = parseInt(numRaw, 10);
  var den = parseInt(denRaw, 10);

  if (isNaN(whole) || isNaN(num) || isNaN(den)) {
    showError(errorEl, 'Masukkan angka bulat untuk pembilang dan penyebut.');
    return;
  }
  if (den === 0) {
    showError(errorEl, 'Penyebut tidak boleh 0.');
    return;
  }
  if (num < 0 || den < 0 || whole < 0) {
    showError(errorEl, 'Masukkan angka positif (konteks: kuantitas belanja).');
    return;
  }
  if (den > 10000 || num > 10000) {
    showError(errorEl, 'Angka terlalu besar. Gunakan angka yang wajar.');
    return;
  }

  var result = fracToDecimal(whole, num, den);
  var decStr = formatDecimalID(result);

  var fracLabel = whole > 0 ? (whole + ' ' + num + '/' + den) : (num + '/' + den);
  var stepStr = whole > 0
    ? whole + ' + (' + num + ' ÷ ' + den + ') = ' + whole + ' + ' + formatDecimalID(num / den) + ' = ' + decStr
    : num + ' ÷ ' + den + ' = ' + decStr;

  resultEl.innerHTML =
    '<span class="konversi-result__value">' + decStr + '</span>' +
    '<span class="konversi-result__step">Langkah: ' + stepStr + '</span>';
}

function doDecToFracConversion() {
  var decEl = document.getElementById('decInput');
  var errorEl = document.getElementById('decError');
  var resultEl = document.getElementById('decResult');

  clearError(errorEl);
  resultEl.innerHTML = '';

  if (!decEl || decEl.value.trim() === '') {
    showError(errorEl, 'Masukkan bilangan desimal terlebih dahulu.');
    return;
  }

  var val = parseDecimalInput(decEl.value);
  if (isNaN(val)) {
    showError(errorEl, 'Format tidak valid. Gunakan angka seperti 0,75 atau 1,25.');
    return;
  }
  if (val < 0) {
    showError(errorEl, 'Masukkan angka positif (konteks: kuantitas belanja).');
    return;
  }
  if (val > 1000) {
    showError(errorEl, 'Angka terlalu besar. Gunakan angka yang wajar.');
    return;
  }

  var frac = decimalToFrac(val);
  if (!frac) {
    showError(errorEl, 'Tidak dapat mengonversi angka ini. Coba angka lain.');
    return;
  }

  if (frac.num === 0) {
    resultEl.innerHTML =
      '<span class="konversi-result__value">' + frac.whole + '</span>' +
      '<span class="konversi-result__step">' + formatDecimalID(val) + ' adalah bilangan bulat.</span>';
    return;
  }

  // Show steps
  var decStr = formatDecimalID(val);
  var fracPartVal = val - frac.whole;
  var decPlaces = (fracPartVal.toFixed(6).replace(/0+$/, '').split('.')[1] || '').length;
  var multiplier = Math.pow(10, decPlaces);
  var rawNum = Math.round(fracPartVal * multiplier);
  var rawDen = multiplier;
  var g = gcd(rawNum, rawDen);
  var simplNum = rawNum / g;
  var simplDen = rawDen / g;

  var stepLines = [];
  stepLines.push(decStr + ' = ' + (frac.whole > 0 ? frac.whole + ' + ' + fracPartVal.toFixed(decPlaces).replace('.', ',') : decStr));
  if (frac.whole > 0) {
    stepLines.push('Bagian desimal: ' + fracPartVal.toFixed(decPlaces).replace('.', ',') + ' = ' + rawNum + '/' + rawDen);
  } else {
    stepLines.push(decStr + ' = ' + rawNum + '/' + rawDen);
  }
  if (g > 1) {
    stepLines.push('Sederhanakan: ÷ ' + g + ' → ' + simplNum + '/' + simplDen);
  }

  resultEl.innerHTML =
    '<span class="konversi-result__value">' + frac.display + '</span>' +
    '<span class="konversi-result__step">' + stepLines.join('<br>') + '</span>';
}

function clearError(el) { if (el) { el.textContent = ''; } }
function showError(el, msg) { if (el) { el.textContent = msg; } }

/* -------------------------------------------------------------------------
   9. STAGE: BELANJA
   ------------------------------------------------------------------------- */

function initBelanja() {
  if (state.sort.currentOrder.length === 0) {
    state.sort.currentOrder = shuffleArray(SHOP_ITEMS.map(function (item) { return item.id; }));
  }
  renderSortList();
  renderCartItems();
  if (!_belanjaEventsBound) {
    bindSortListDrag();
    bindBelanjaEvents();
    _belanjaEventsBound = true;
  }
}

function renderSortList() {
  var list = document.getElementById('sortList');
  if (!list) return;

  list.innerHTML = '';

  state.sort.currentOrder.forEach(function (itemId, position) {
    var item = SHOP_ITEMS[itemId];
    var li = document.createElement('li');
    li.classList.add('sort-item');
    li.setAttribute('role', 'listitem');
    li.setAttribute('data-item-id', String(itemId));
    li.setAttribute('draggable', 'true');
    li.setAttribute('aria-label', item.name + ', kuantitas ' + item.qtyDisplay + ', posisi ' + (position + 1));

    if (state.sort.submitted) {
      var correctPos = CORRECT_SORT_ORDER.indexOf(itemId);
      if (correctPos === position) {
        li.classList.add('is-correct');
      } else {
        li.classList.add('is-wrong');
      }
    }

    li.innerHTML =
      '<span class="sort-position-label" aria-hidden="true">' + (position + 1) + '</span>' +
      '<span class="sort-item__handle" aria-hidden="true">⠿</span>' +
      '<span class="sort-item__name">' + item.name + '</span>' +
      '<span class="sort-item__qty">' + item.qtyDisplay + '</span>' +
      '<div class="sort-item__move-btns">' +
      '<button type="button" class="sort-item__move-btn" data-move="up" aria-label="Pindahkan ' + item.name + ' ke atas"' + (position === 0 ? ' disabled' : '') + '>▲</button>' +
      '<button type="button" class="sort-item__move-btn" data-move="down" aria-label="Pindahkan ' + item.name + ' ke bawah"' + (position === state.sort.currentOrder.length - 1 ? ' disabled' : '') + '>▼</button>' +
      '</div>';

    list.appendChild(li);
  });
  // Drag events bound separately via bindSortListDrag()
}

function bindSortListDrag() {
  var list = document.getElementById('sortList');
  if (!list || _sortEventsBound) return;
  _sortEventsBound = true;

  list.addEventListener('dragstart', function (e) {
    var item = e.target.closest('.sort-item');
    if (!item) return;
    _sortDragSrc = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.getAttribute('data-item-id'));
  });

  list.addEventListener('dragend', function (e) {
    var item = e.target.closest('.sort-item');
    if (item) item.classList.remove('dragging');
    list.querySelectorAll('.sort-item').forEach(function (li) {
      li.classList.remove('drag-over-top', 'drag-over-bottom');
    });
    _sortDragSrc = null;
  });

  list.addEventListener('dragover', function (e) {
    var item = e.target.closest('.sort-item');
    if (!item || item === _sortDragSrc) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    list.querySelectorAll('.sort-item').forEach(function (li) {
      li.classList.remove('drag-over-top', 'drag-over-bottom');
    });

    var rect = item.getBoundingClientRect();
    var midY = rect.top + rect.height / 2;
    if (e.clientY < midY) {
      item.classList.add('drag-over-top');
    } else {
      item.classList.add('drag-over-bottom');
    }
  });

  list.addEventListener('dragleave', function (e) {
    var item = e.target.closest('.sort-item');
    if (item) {
      item.classList.remove('drag-over-top', 'drag-over-bottom');
    }
  });

  list.addEventListener('drop', function (e) {
    e.preventDefault();
    var target = e.target.closest('.sort-item');
    if (!target || !_sortDragSrc || target === _sortDragSrc) return;

    target.classList.remove('drag-over-top', 'drag-over-bottom');

    var srcId = parseInt(_sortDragSrc.getAttribute('data-item-id'), 10);
    var tgtId = parseInt(target.getAttribute('data-item-id'), 10);

    var order = state.sort.currentOrder;
    var srcIdx = order.indexOf(srcId);
    var tgtIdx = order.indexOf(tgtId);

    // Determine insert position based on drag direction
    var rect = target.getBoundingClientRect();
    var insertAfter = (e.clientY >= rect.top + rect.height / 2);

    order.splice(srcIdx, 1);
    var newTgtIdx = order.indexOf(tgtId);
    if (insertAfter) {
      order.splice(newTgtIdx + 1, 0, srcId);
    } else {
      order.splice(newTgtIdx, 0, srcId);
    }

    state.sort.submitted = false;
    clearFeedback('sortFeedback');
    renderSortList();
  });
}

function bindBelanjaEvents() {
  // Move up/down buttons
  var list = document.getElementById('sortList');
  if (list) {
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('.sort-item__move-btn');
      if (!btn) return;
      var li = btn.closest('.sort-item');
      if (!li) return;
      var itemId = parseInt(li.getAttribute('data-item-id'), 10);
      var dir = btn.getAttribute('data-move');
      moveSortItem(itemId, dir);
    });
  }

  var sortCheckBtn = document.getElementById('sortCheckBtn');
  if (sortCheckBtn) {
    sortCheckBtn.addEventListener('click', checkSortOrder);
  }

  var sortResetBtn = document.getElementById('sortResetBtn');
  if (sortResetBtn) {
    sortResetBtn.addEventListener('click', resetSort);
  }

  // Cart items
  var cartItemsEl = document.getElementById('cartItems');
  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', function (e) {
      var item = e.target.closest('.cart-item');
      if (!item) return;
      var itemId = parseInt(item.getAttribute('data-item-id'), 10);
      toggleCartItem(itemId);
    });
    // Keyboard support
    cartItemsEl.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        var item = e.target.closest('.cart-item');
        if (!item) return;
        e.preventDefault();
        var itemId = parseInt(item.getAttribute('data-item-id'), 10);
        toggleCartItem(itemId);
      }
    });
  }

  var budgetCheckBtn = document.getElementById('budgetCheckBtn');
  if (budgetCheckBtn) {
    budgetCheckBtn.addEventListener('click', checkBudget);
  }

  var budgetResetBtn = document.getElementById('budgetResetBtn');
  if (budgetResetBtn) {
    budgetResetBtn.addEventListener('click', resetBudget);
  }
}

function moveSortItem(itemId, dir) {
  var order = state.sort.currentOrder;
  var idx = order.indexOf(itemId);
  if (dir === 'up' && idx > 0) {
    var tmp = order[idx - 1]; order[idx - 1] = order[idx]; order[idx] = tmp;
  } else if (dir === 'down' && idx < order.length - 1) {
    var tmp2 = order[idx + 1]; order[idx + 1] = order[idx]; order[idx] = tmp2;
  }
  state.sort.submitted = false;
  clearFeedback('sortFeedback');
  renderSortList();
}

function checkSortOrder() {
  state.sort.submitted = true;
  var order = state.sort.currentOrder;
  var correct = CORRECT_SORT_ORDER;
  var feedback = document.getElementById('sortFeedback');

  // Check each position
  var wrongPositions = [];
  for (var i = 0; i < order.length; i++) {
    if (order[i] !== correct[i]) {
      wrongPositions.push(i + 1);
    }
  }

  renderSortList(); // re-render with correct/wrong styling

  if (wrongPositions.length === 0) {
    state.sort.correct = true;
    feedback.className = 'feedback-box feedback-box--correct';
    feedback.innerHTML =
      '<strong>✓ Urutan sudah benar!</strong> ' +
      'Kamu berhasil mengurutkan berdasarkan kuantitas terkecil ke terbesar. ' +
      'Untuk membandingkan, kita perlu mengonversi semua ke bentuk desimal: ' +
      '1/4 = 0,25 &lt; 2/5 = 0,4 &lt; 0,5 &lt; 3/5 = 0,6 &lt; 0,75 &lt; 4/5 = 0,8.';
  } else {
    state.sort.correct = false;
    feedback.className = 'feedback-box feedback-box--wrong';
    var hints = buildSortHints(order, correct);
    feedback.innerHTML =
      '<strong>Belum tepat.</strong> Posisi yang perlu dicek: ' + wrongPositions.join(', ') + '. ' +
      hints +
      ' <em>Tips: Ubah semua ke desimal terlebih dahulu untuk memudahkan perbandingan!</em>';
  }
}

function buildSortHints(order, correct) {
  // Find the first wrong item and give a specific hint
  for (var i = 0; i < order.length; i++) {
    if (order[i] !== correct[i]) {
      var actualItem = SHOP_ITEMS[order[i]];
      var expectedItem = SHOP_ITEMS[correct[i]];
      return 'Di posisi ' + (i + 1) + ', kamu menaruh <strong>' + actualItem.name + ' (' + actualItem.qtyDisplay + ')</strong>, ' +
        'tetapi seharusnya <strong>' + expectedItem.name + ' (' + expectedItem.qtyDisplay + ')</strong>. ';
    }
  }
  return '';
}

function resetSort() {
  state.sort.currentOrder = shuffleArray(SHOP_ITEMS.map(function (item) { return item.id; }));
  state.sort.submitted = false;
  state.sort.correct = false;
  clearFeedback('sortFeedback');
  renderSortList();
}

function renderCartItems() {
  var container = document.getElementById('cartItems');
  if (!container) return;

  container.innerHTML = '';
  SHOP_ITEMS.forEach(function (item) {
    var isSelected = state.budget.selected.indexOf(item.id) !== -1;

    var div = document.createElement('div');
    div.classList.add('cart-item');
    div.setAttribute('role', 'listitem');
    div.setAttribute('data-item-id', String(item.id));
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    div.setAttribute('aria-label',
      item.name + ', kuantitas ' + item.qtyDisplay + ', harga ' + formatRupiah(item.price) +
      (isSelected ? ', dipilih' : ', belum dipilih'));

    if (isSelected) div.classList.add('is-selected');

    div.innerHTML =
      '<span class="cart-item__check" aria-hidden="true">' + (isSelected ? '✓' : '') + '</span>' +
      '<span class="cart-item__name">' + item.name + '</span>' +
      '<span class="cart-item__qty">' + item.qtyDisplay + '</span>' +
      '<span class="cart-item__price">' + formatRupiah(item.price) + '</span>';

    container.appendChild(div);
  });

  updateCartTotal();
}

function toggleCartItem(itemId) {
  var sel = state.budget.selected;
  var idx = sel.indexOf(itemId);
  if (idx !== -1) {
    sel.splice(idx, 1);
  } else {
    sel.push(itemId);
  }
  state.budget.submitted = false;
  clearFeedback('budgetFeedback');
  renderCartItems();
}

function updateCartTotal() {
  var total = 0;
  state.budget.selected.forEach(function (id) {
    total += SHOP_ITEMS[id].price;
  });
  var sisa = BUDGET - total;
  var isOver = total > BUDGET;

  var countEl = document.getElementById('cartItemCount');
  var totalEl = document.getElementById('cartTotal');
  var sisaEl = document.getElementById('cartSisa');
  var sisaRow = document.getElementById('cartSisaRow');

  if (countEl) countEl.textContent = state.budget.selected.length + ' item';
  if (totalEl) totalEl.textContent = formatRupiah(total);
  if (sisaEl) sisaEl.textContent = formatRupiah(Math.abs(sisa));

  if (sisaRow) {
    sisaRow.classList.remove('is-over', 'is-ok');
    if (isOver) {
      sisaRow.querySelector('.cart-total-row__label').textContent = 'Melebihi anggaran';
      sisaRow.classList.add('is-over');
    } else {
      sisaRow.querySelector('.cart-total-row__label').textContent = 'Sisa anggaran';
      sisaRow.classList.add('is-ok');
    }
  }
}

function checkBudget() {
  if (state.budget.selected.length === 0) {
    showFeedback('budgetFeedback', 'info',
      '<strong>Belum ada item yang dipilih.</strong> Klik item yang ingin dibeli Bu Sari, kemudian klik "Konfirmasi Pilihan".');
    return;
  }

  var total = 0;
  state.budget.selected.forEach(function (id) { total += SHOP_ITEMS[id].price; });

  var isOver = total > BUDGET;
  state.budget.submitted = true;

  // Check if optimal (5 items, total 28650)
  var maxItems = 5; // Wortel, Tepung, Tomat, Mentega, Beras (excluding Minyak)
  var selectedCount = state.budget.selected.length;

  if (isOver) {
    var overBy = total - BUDGET;
    showFeedback('budgetFeedback', 'wrong',
      '<strong>Melebihi anggaran!</strong> Total belanja ' + formatRupiah(total) +
      ' melebihi anggaran ' + formatRupiah(BUDGET) + ' sebesar ' + formatRupiah(overBy) + '. ' +
      'Pertimbangkan untuk menghapus item yang paling mahal. Minyak Goreng (' + formatRupiah(14400) + ') adalah item termahal.');
  } else if (selectedCount >= maxItems) {
    showFeedback('budgetFeedback', 'correct',
      '<strong>Pilihan optimal! ✓</strong> Total: ' + formatRupiah(total) +
      ' dari anggaran ' + formatRupiah(BUDGET) + '. Sisa: ' + formatRupiah(BUDGET - total) + '. ' +
      'Kamu berhasil memilih ' + selectedCount + ' item dengan efisien!');
  } else if (selectedCount > 0 && !isOver) {
    // Check if they could add more items
    var unselected = SHOP_ITEMS.filter(function (item) {
      return state.budget.selected.indexOf(item.id) === -1;
    });
    var canAdd = unselected.filter(function (item) { return total + item.price <= BUDGET; });

    if (canAdd.length > 0) {
      var canAddNames = canAdd.map(function (i) { return i.name + ' (' + formatRupiah(i.price) + ')'; }).join(', ');
      showFeedback('budgetFeedback', 'partial',
        '<strong>Masih dalam anggaran!</strong> Total: ' + formatRupiah(total) + '. ' +
        'Kamu masih bisa menambahkan: ' + canAddNames + '. ' +
        'Tantangan: pilih sebanyak mungkin item dengan anggaran yang ada!');
    } else {
      showFeedback('budgetFeedback', 'correct',
        '<strong>Belanja dalam anggaran! ✓</strong> Total: ' + formatRupiah(total) +
        ' dari anggaran ' + formatRupiah(BUDGET) + '. Sisa: ' + formatRupiah(BUDGET - total) + '.');
    }
  }
}

function resetBudget() {
  state.budget.selected = [];
  state.budget.submitted = false;
  clearFeedback('budgetFeedback');
  renderCartItems();
}

function showFeedback(id, type, html) {
  var el = document.getElementById(id);
  if (!el) return;
  var typeMap = { correct: 'feedback-box--correct', wrong: 'feedback-box--wrong', partial: 'feedback-box--partial', info: 'feedback-box--info' };
  el.className = 'feedback-box ' + (typeMap[type] || '');
  el.innerHTML = html;
}

function clearFeedback(id) {
  var el = document.getElementById(id);
  if (el) { el.className = 'feedback-box'; el.innerHTML = ''; }
}

/* -------------------------------------------------------------------------
   10. STAGE: KUIS
   ------------------------------------------------------------------------- */

function initKuis() {
  renderKuisOptions();
  if (!_kuisEventsBound) {
    bindKuisEvents();
    _kuisEventsBound = true;
  }
}

function renderKuisOptions() {
  QUIZ_QUESTIONS.forEach(function (q, qi) {
    var container = document.getElementById('q' + (qi + 1) + 'options');
    if (!container) return;
    container.innerHTML = '';

    var keys = ['A', 'B', 'C', 'D'];
    q.options.forEach(function (optText, oi) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.classList.add('quiz-option');
      btn.setAttribute('data-qi', String(qi));
      btn.setAttribute('data-oi', String(oi));
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');

      var kq = state.kuis.perQ[qi];
      if (kq.submitted) {
        btn.disabled = true;
        if (oi === q.correctIndex) {
          btn.classList.add('is-correct');
          btn.setAttribute('aria-checked', 'true');
        }
        if (kq.selected === oi && oi !== q.correctIndex) {
          btn.classList.add('is-wrong');
          btn.setAttribute('aria-checked', 'true');
        }
      } else if (kq.selected === oi) {
        btn.classList.add('is-selected');
        btn.setAttribute('aria-checked', 'true');
      }

      btn.innerHTML =
        '<span class="quiz-option__key">' + keys[oi] + '</span>' +
        '<span>' + optText + '</span>';

      container.appendChild(btn);
    });

    // Submit button
    if (!state.kuis.perQ[qi].submitted) {
      var submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.classList.add('btn', 'btn--primary', 'btn--small');
      submitBtn.setAttribute('data-submit-q', String(qi));
      submitBtn.textContent = 'Jawab Soal ' + (qi + 1);
      submitBtn.style.marginTop = 'var(--space-2)';
      container.appendChild(submitBtn);
    }

    updateKuisProgress();
  });
}

function bindKuisEvents() {
  var kuisArea = document.getElementById('konten-utama');
  if (!kuisArea) return;

  // Option selection
  kuisArea.addEventListener('click', function (e) {
    var optBtn = e.target.closest('.quiz-option');
    if (optBtn) {
      var qi = parseInt(optBtn.getAttribute('data-qi'), 10);
      var oi = parseInt(optBtn.getAttribute('data-oi'), 10);
      if (!state.kuis.perQ[qi].submitted) {
        state.kuis.perQ[qi].selected = oi;
        updateQuizOptionStates(qi);
      }
      return;
    }

    var submitBtn = e.target.closest('[data-submit-q]');
    if (submitBtn) {
      var qi2 = parseInt(submitBtn.getAttribute('data-submit-q'), 10);
      submitKuisQuestion(qi2);
    }
  });

  var resetBtn = document.getElementById('kuisResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetKuis);
  }
}

function updateQuizOptionStates(qi) {
  var container = document.getElementById('q' + (qi + 1) + 'options');
  if (!container) return;
  var btns = container.querySelectorAll('.quiz-option');
  var selected = state.kuis.perQ[qi].selected;

  btns.forEach(function (btn) {
    var oi = parseInt(btn.getAttribute('data-oi'), 10);
    btn.classList.remove('is-selected');
    btn.setAttribute('aria-checked', 'false');
    if (oi === selected) {
      btn.classList.add('is-selected');
      btn.setAttribute('aria-checked', 'true');
    }
  });
}

function submitKuisQuestion(qi) {
  var kq = state.kuis.perQ[qi];
  if (kq.selected === null) {
    showFeedback('q' + (qi + 1) + 'feedback', 'info',
      'Pilih salah satu jawaban terlebih dahulu sebelum menekan tombol jawab.');
    return;
  }

  kq.submitted = true;
  var q = QUIZ_QUESTIONS[qi];
  var isCorrect = kq.selected === q.correctIndex;
  var qEl = document.getElementById('quizQ' + (qi + 1));

  if (qEl) {
    qEl.classList.remove('is-correct', 'is-wrong');
    qEl.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
  }

  var feedbackMsg;
  if (isCorrect) {
    feedbackMsg = '<strong>✓ Benar!</strong> ' + q.feedbackCorrect;
    showFeedback('q' + (qi + 1) + 'feedback', 'correct', feedbackMsg);
  } else {
    feedbackMsg = q.feedbackWrong[kq.selected] ||
      ('<strong>Belum tepat.</strong> Jawaban yang benar adalah: ' + q.options[q.correctIndex]);
    showFeedback('q' + (qi + 1) + 'feedback', 'wrong', feedbackMsg);
  }

  // Disable all options for this question
  var container = document.getElementById('q' + (qi + 1) + 'options');
  if (container) {
    container.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.disabled = true;
      var oi = parseInt(btn.getAttribute('data-oi'), 10);
      btn.classList.remove('is-selected');
      if (oi === q.correctIndex) btn.classList.add('is-correct');
      else if (oi === kq.selected) btn.classList.add('is-wrong');
    });
    // Remove submit button
    var sub = container.querySelector('[data-submit-q]');
    if (sub) sub.remove();
  }

  updateKuisProgress();
  checkAllKuisAnswered();
}

function updateKuisProgress() {
  var answered = state.kuis.perQ.filter(function (q) { return q.submitted; }).length;
  var correct = state.kuis.perQ.filter(function (q, qi) {
    return q.submitted && q.selected === QUIZ_QUESTIONS[qi].correctIndex;
  }).length;

  var answeredEl = document.getElementById('kuisAnswered');
  var correctEl = document.getElementById('kuisCorrect');
  if (answeredEl) answeredEl.textContent = answered;
  if (correctEl) correctEl.textContent = correct;
}

function checkAllKuisAnswered() {
  var all = state.kuis.perQ.every(function (q) { return q.submitted; });
  if (!all) return;

  var correct = state.kuis.perQ.filter(function (q, qi) {
    return q.selected === QUIZ_QUESTIONS[qi].correctIndex;
  }).length;

  var panel = document.getElementById('kuisResultPanel');
  var text = document.getElementById('kuisResultText');
  if (panel) panel.hidden = false;
  if (text) {
    var msgs = [
      'Kamu menjawab ' + correct + ' dari 3 soal dengan benar.',
      correct === 3 ? ' Luar biasa! Pemahaman konversi dan perbandinganmu sudah sangat baik.' :
        correct === 2 ? ' Hampir sempurna! Cermati kembali soal yang belum tepat.' :
          correct === 1 ? ' Kamu sudah memahami sebagian. Coba baca kembali penjelasan di setiap soal.' :
            ' Jangan menyerah! Coba ulangi bagian Temukan Pola untuk memperkuat pemahamanmu.',
    ];
    text.textContent = msgs.join('');
  }
}

function resetKuis() {
  state.kuis.perQ = [
    { selected: null, submitted: false },
    { selected: null, submitted: false },
    { selected: null, submitted: false },
  ];

  QUIZ_QUESTIONS.forEach(function (q, qi) {
    var qEl = document.getElementById('quizQ' + (qi + 1));
    if (qEl) qEl.classList.remove('is-correct', 'is-wrong');
    clearFeedback('q' + (qi + 1) + 'feedback');
  });

  var panel = document.getElementById('kuisResultPanel');
  if (panel) panel.hidden = true;

  renderKuisOptions();
}

/* -------------------------------------------------------------------------
   11. STAGE: REFLEKSI
   ------------------------------------------------------------------------- */

function renderRefleksiState() {
  var types = ['convert', 'compare'];
  var scaleIds = { convert: 'saConvertScale', compare: 'saCompareScale' };

  types.forEach(function (type) {
    var scale = document.getElementById(scaleIds[type]);
    if (!scale) return;
    var currentVal = state.refleksi[type];

    scale.querySelectorAll('.self-assess-option').forEach(function (btn) {
      var val = parseInt(btn.getAttribute('data-value'), 10);
      var isSelected = val === currentVal;
      btn.classList.toggle('is-selected', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  });

  updateSaFeedback();
}

function bindRefleksiEvents() {
  if (_refleksiEventsBound) return;
  _refleksiEventsBound = true;
  var types = ['convert', 'compare'];
  var scaleIds = { convert: 'saConvertScale', compare: 'saCompareScale' };

  types.forEach(function (type) {
    var scale = document.getElementById(scaleIds[type]);
    if (!scale) return;

    scale.addEventListener('click', function (e) {
      var btn = e.target.closest('.self-assess-option');
      if (!btn) return;
      var val = parseInt(btn.getAttribute('data-value'), 10);
      state.refleksi[type] = val;
      renderRefleksiState();
    });

    scale.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        var btn = e.target.closest('.self-assess-option');
        if (!btn) return;
        e.preventDefault();
        var val = parseInt(btn.getAttribute('data-value'), 10);
        state.refleksi[type] = val;
        renderRefleksiState();
      }
    });
  });
}

function updateSaFeedback() {
  var el = document.getElementById('saFeedback');
  if (!el) return;

  var c = state.refleksi.convert;
  var cmp = state.refleksi.compare;

  if (c === 0 && cmp === 0) {
    el.innerHTML = '';
    el.className = 'feedback-box';
    return;
  }

  el.className = 'feedback-box feedback-box--info';
  var msgs = [];

  if (c > 0) msgs.push('Konversi: Level ' + c + '.');
  if (cmp > 0) msgs.push('Perbandingan: Level ' + cmp + '.');

  // Provide encouraging message based on lowest set value
  var setVals = [c, cmp].filter(function (v) { return v > 0; });
  var lowest = Math.min.apply(null, setVals);
  if (lowest <= 2) {
    msgs.push('Guru akan memperhatikan perkembanganmu pada pertemuan berikutnya. Jangan ragu bertanya!');
  } else if (lowest === 3) {
    msgs.push('Kamu sudah hampir menguasai materi ini. Latihan mandiri akan membantumu mencapai level 4!');
  } else {
    msgs.push('Pemahaman yang baik! Tetap pertahankan dengan terus berlatih.');
  }

  el.innerHTML = msgs.join(' ');
}

/* -------------------------------------------------------------------------
   12. STAGE: HASIL
   ------------------------------------------------------------------------- */

function renderHasil() {
  var statsEl = document.getElementById('hasilStats');
  var detailEl = document.getElementById('hasilDetail');
  var reflectEl = document.getElementById('hasilReflect');

  if (!statsEl) return;

  // Calculate stats
  var matchCorrect = state.matching.matched.length;
  var matchAttempts = state.matching.attempts;

  var kuisCorrect = state.kuis.perQ.filter(function (q, qi) {
    return q.submitted && q.selected === QUIZ_QUESTIONS[qi].correctIndex;
  }).length;

  var saConvert = state.refleksi.convert;
  var saCompare = state.refleksi.compare;

  // Summary stats
  statsEl.innerHTML =
    '<div class="summary-stat"><span class="summary-stat__value">' + matchCorrect + '/8</span><span class="summary-stat__label">Pasangan Matching</span></div>' +
    '<div class="summary-stat"><span class="summary-stat__value">' + (matchAttempts > 0 ? matchAttempts : '—') + '</span><span class="summary-stat__label">Percobaan Matching</span></div>' +
    '<div class="summary-stat"><span class="summary-stat__value">' + kuisCorrect + '/3</span><span class="summary-stat__label">Soal Kuis Benar</span></div>' +
    '<div class="summary-stat"><span class="summary-stat__value">' + (saConvert || '—') + '</span><span class="summary-stat__label">Self-assess: Konversi</span></div>' +
    '<div class="summary-stat"><span class="summary-stat__value">' + (saCompare || '—') + '</span><span class="summary-stat__label">Self-assess: Perbandingan</span></div>';

  // Detailed summary
  var kuisDetail = QUIZ_QUESTIONS.map(function (q, qi) {
    var kq = state.kuis.perQ[qi];
    if (!kq.submitted) return '<li>Soal ' + (qi + 1) + ': Belum dijawab</li>';
    var isCorrect = kq.selected === q.correctIndex;
    var icon = isCorrect ? '✓' : '✗';
    var cls = isCorrect ? 'color: var(--color-success)' : 'color: var(--color-error)';
    var selectedLabel = kq.selected !== null ? ['A', 'B', 'C', 'D'][kq.selected] : '?';
    return '<li><span style="' + cls + '">' + icon + '</span> Soal ' + (qi + 1) + ': ' +
      (isCorrect ? 'Benar' : 'Pilih ' + selectedLabel + ', jawaban benar ' + ['A', 'B', 'C', 'D'][q.correctIndex]) + '</li>';
  }).join('');

  detailEl.innerHTML =
    '<h3 style="margin-top:0;">Detail Aktivitas</h3>' +
    '<p><strong>Matching:</strong> ' +
    (matchCorrect === 8
      ? 'Semua 8 pasangan dijodohkan dengan ' + matchAttempts + ' percobaan.'
      : matchCorrect + ' dari 8 pasangan dijodohkan.') +
    '</p>' +
    '<p><strong>Pengurutan:</strong> ' +
    (state.sort.correct ? 'Berhasil mengurutkan barang dari terkecil ke terbesar.' : 'Pengurutan belum sempurna atau belum dicoba.') +
    '</p>' +
    '<p><strong>Kuis Formatif:</strong></p>' +
    '<ul>' + kuisDetail + '</ul>' +
    '<p><strong>Self-assessment:</strong> Konversi = ' + (saConvert || 'belum diisi') +
    ', Perbandingan = ' + (saCompare || 'belum diisi') + '.</p>';

  // Reflection message
  var avgSa = (saConvert + saCompare) / 2;
  var kuisPct = kuisCorrect / 3;

  var msg;
  if (kuisCorrect === 3 && avgSa >= 3) {
    msg = 'Kamu telah menunjukkan pemahaman yang kuat tentang bilangan rasional. ' +
      'Teruslah mengembangkan kemampuan ini dengan melihat representasi bilangan di kehidupan sehari-hari!';
  } else if (kuisCorrect >= 2) {
    msg = 'Pemahaman dasarmu sudah baik. Cermati kembali soal yang belum tepat dan diskusikan dengan gurumu. ' +
      'Bilangan rasional ada di mana-mana — struk belanjaan, resep masakan, dan label produk!';
  } else {
    msg = 'Teruslah berlatih! Konversi dan perbandingan bilangan rasional adalah keterampilan yang akan ' +
      'sering kamu gunakan. Ulangi bagian Temukan Pola dan diskusikan dengan teman atau gurumu.';
  }
  if (reflectEl) reflectEl.textContent = msg;
}

/* -------------------------------------------------------------------------
   13. GLOBAL RESET
   ------------------------------------------------------------------------- */

function resetAll() {
  // Matching
  state.matching = {
    selectedFrac: null, selectedDec: null,
    matched: [], attempts: 0, dragSrcId: null,
    shuffledDecOrder: [],
  };

  // Receipt
  state.receipt.revealed = [];

  // Sort
  state.sort = { currentOrder: [], submitted: false, correct: false };

  // Budget
  state.budget = { selected: [], submitted: false };

  // Kuis
  state.kuis.perQ = [
    { selected: null, submitted: false },
    { selected: null, submitted: false },
    { selected: null, submitted: false },
  ];

  // Refleksi
  state.refleksi = { convert: 0, compare: 0 };

  // Unlocked stages — unlock all so students can navigate freely
  state.unlockedStages = ['orientasi', 'eksplorasi', 'matching', 'konversi', 'belanja', 'kuis', 'refleksi', 'hasil'];

  // Navigate to start
  goToStage('orientasi');

  // Re-init stages
  setTimeout(function () {
    renderReceipt();
    resetMatching();
    initBelanja();
    resetKuis();
    renderRefleksiState();
  }, 100);
}

/* -------------------------------------------------------------------------
   14. INIT
   ------------------------------------------------------------------------- */

function init() {
  // Navigation: stage nav buttons
  var navItems = document.querySelectorAll('.stage-nav__item');
  navItems.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var stageName = btn.getAttribute('data-stage');
      if (!btn.disabled) goToStage(stageName);
    });
  });

  // Navigation: inline prev/next buttons
  document.addEventListener('click', function (e) {
    var goBtn = e.target.closest('[data-go-stage]');
    if (goBtn) {
      var stageName = goBtn.getAttribute('data-go-stage');
      if (state.unlockedStages.indexOf(stageName) === -1) {
        state.unlockedStages.push(stageName);
      }
      goToStage(stageName);
    }
  });

  // Global reset
  var resetAppBtn = document.getElementById('resetAppBtn');
  if (resetAppBtn) {
    resetAppBtn.addEventListener('click', function () {
      if (confirm('Reset semua aktivitas dan mulai dari awal?')) {
        resetAll();
      }
    });
  }

  var resetAllBtn = document.getElementById('resetAllBtn');
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', function () {
      if (confirm('Mulai ulang dari awal? Semua progress akan dihapus.')) {
        resetAll();
      }
    });
  }

  // Init each stage
  initOrientasi();
  renderReceipt();
  initMatching();
  renderKonversiExamples();
  initKonversiTool();
  initBelanja();
  initKuis();
  bindRefleksiEvents();

  // Unlock initial stages
  state.unlockedStages = ['orientasi', 'eksplorasi', 'matching', 'konversi', 'belanja', 'kuis', 'refleksi', 'hasil'];
  updateNavUI();

  // Ensure orientasi is shown
  var orientasiEl = document.getElementById('stage-orientasi');
  if (orientasiEl) orientasiEl.hidden = false;

  STAGE_ORDER.forEach(function (s) {
    if (s !== 'orientasi') {
      var el = document.getElementById('stage-' + s);
      if (el) el.hidden = true;
    }
  });

  state.currentStage = 'orientasi';
  updateNavUI();
}

// Catch any uncaught errors to prevent full app crash
window.addEventListener('error', function (e) {
  console.error('App error:', e.message);
});

document.addEventListener('DOMContentLoaded', init);
