'use strict';
/* =========================================================================
   MPI 1.3 — Application Logic
   Sections:
   1. Math core
   2. Input validation & formatting
   3. SVG chart renderer
   4. Application state
   5. Stage navigation & progress
   6. Stage renderers
      6.1 Orientasi
      6.2 Eksplorasi
      6.3 Komparasi
      6.4 Skenario (branching)
      6.5 Simulasi
      6.6 Ringkasan
      6.7 Refleksi
      6.8 Penutup
   7. Event wiring
   8. Init
   ========================================================================= */

/* -------------------------------------------------------------------------
   1. MATH CORE — pure functions
   ------------------------------------------------------------------------- */

function arithmeticTerm(a, d, n) {
  return a + (n - 1) * d;
}

function geometricTerm(a, r, n) {
  return a * Math.pow(r, n - 1);
}

function generateArithmeticSeries(a, d, count) {
  const result = [];
  for (let i = 1; i <= count; i++) {
    result.push({ n: i, value: arithmeticTerm(a, d, i) });
  }
  return result;
}

function generateGeometricSeries(a, r, count) {
  const result = [];
  for (let i = 1; i <= count; i++) {
    result.push({ n: i, value: geometricTerm(a, r, i) });
  }
  return result;
}

/* Find first n where geometric > arithmetic (same a, different d/r).
   Returns null if not found within maxN. */
function findCrossover(aA, dA, aB, rB, maxN) {
  for (let n = 1; n <= maxN; n++) {
    if (geometricTerm(aB, rB, n) > arithmeticTerm(aA, dA, n)) {
      return n;
    }
  }
  return null;
}

/* -------------------------------------------------------------------------
   2. VALIDATION & FORMATTING
   ------------------------------------------------------------------------- */

function parseNumber(raw) {
  if (raw === null || raw === undefined) return NaN;
  const cleaned = String(raw).trim().replace(',', '.').replace(/\s/g, '');
  return Number(cleaned);
}

function validatePositiveInteger(raw, label, min, max) {
  const n = parseNumber(raw);
  if (isNaN(n)) return label + ' harus berupa angka.';
  if (!Number.isInteger(n)) return label + ' harus bilangan bulat.';
  if (min !== undefined && n < min) return label + ' minimal ' + min + '.';
  if (max !== undefined && n > max) return label + ' maksimal ' + max + '.';
  return null; // valid
}

function validatePositiveNumber(raw, label) {
  const n = parseNumber(raw);
  if (isNaN(n)) return label + ' harus berupa angka.';
  if (n <= 0) return label + ' harus lebih dari 0.';
  return null;
}

function isWithinTolerance(actual, expected, relTol) {
  const tol = typeof relTol === 'number' ? relTol : 0.05;
  if (expected === 0) return Math.abs(actual) < 1;
  return Math.abs(actual - expected) / Math.abs(expected) <= tol;
}

function formatRupiah(value, compact) {
  if (!Number.isFinite(value)) return '–';
  const rounded = Math.round(value);
  if (compact && Math.abs(rounded) >= 1000000) {
    return 'Rp' + (rounded / 1000000).toFixed(2).replace('.', ',') + ' jt';
  }
  return 'Rp' + rounded.toLocaleString('id-ID');
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return '–';
  return Math.round(value).toLocaleString('id-ID');
}

/* -------------------------------------------------------------------------
   3. SVG CHART RENDERER
   Hand-rolled SVG — no external dependency. Handles up to ~2 series,
   ~24 data points. Numeric labels on both axes.
   ------------------------------------------------------------------------- */

function renderLineChart(containerId, seriesArray, options) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const opts = options || {};
  const W = 560;
  const H = 280;
  const padLeft = opts.padLeft || 80;
  const padRight = opts.padRight || 24;
  const padTop = opts.padTop || 18;
  const padBottom = opts.padBottom || 40;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  // Determine data range
  let allValues = [];
  let allX = [];
  seriesArray.forEach(function (s) {
    s.data.forEach(function (pt) {
      allValues.push(pt.y);
      allX.push(pt.x);
    });
  });

  if (allValues.length === 0) {
    container.innerHTML = '<p class="chart-narrative" style="padding:var(--space-4)">Belum ada data untuk ditampilkan.</p>';
    return;
  }

  const minX = Math.min.apply(null, allX);
  const maxX = Math.max.apply(null, allX);
  const rawMinY = Math.min.apply(null, allValues);
  const rawMaxY = Math.max.apply(null, allValues);

  const minY = Math.min(0, rawMinY);
  let maxY = rawMaxY;

  // Add 10% headroom
  const yRange = maxY - minY || 1;
  maxY = maxY + yRange * 0.12;
  const yFinal = maxY - minY;

  function toSvgX(x) {
    return padLeft + ((x - minX) / (maxX - minX || 1)) * plotW;
  }
  function toSvgY(y) {
    return padTop + plotH - ((y - minY) / yFinal) * plotH;
  }

  // Y axis tick values
  function niceTickStep(range, targetTicks) {
    const rough = range / targetTicks;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const nice = [1, 2, 2.5, 5, 10];
    for (let i = 0; i < nice.length; i++) {
      if (nice[i] * mag >= rough) return nice[i] * mag;
    }
    return mag * 10;
  }

  const tickStep = niceTickStep(yFinal, 5);
  const tickStart = Math.ceil(minY / tickStep) * tickStep;
  const yTicks = [];
  for (let v = tickStart; v <= maxY + tickStep * 0.01; v += tickStep) {
    if (v >= minY && v <= maxY + tickStep * 0.01) yTicks.push(v);
  }

  const xTicks = [];
  for (let xv = minX; xv <= maxX; xv++) xTicks.push(xv);

  let svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-hidden="true" style="display:block;width:100%;height:auto">';

  // Grid lines
  svg += '<g stroke="' + '#eeede4' + '" stroke-width="1">';
  yTicks.forEach(function (v) {
    const y = toSvgY(v);
    svg += '<line x1="' + padLeft + '" y1="' + y + '" x2="' + (W - padRight) + '" y2="' + y + '"/>';
  });
  svg += '</g>';

  // Y axis labels
  svg += '<g font-family="ui-monospace,Consolas,monospace" font-size="10" fill="#565c5f" text-anchor="end">';
  yTicks.forEach(function (v) {
    const y = toSvgY(v);
    let label = v >= 1000000
      ? (v / 1000000).toFixed(1).replace('.0', '') + 'jt'
      : v >= 1000
        ? (v / 1000).toFixed(0) + 'rb'
        : String(Math.round(v));
    svg += '<text x="' + (padLeft - 6) + '" y="' + (y + 3.5) + '">' + label + '</text>';
  });
  svg += '</g>';

  // X axis labels
  svg += '<g font-family="ui-monospace,Consolas,monospace" font-size="10" fill="#565c5f" text-anchor="middle">';
  const xLabelStep = xTicks.length > 12 ? Math.ceil(xTicks.length / 8) : 1;
  xTicks.forEach(function (xv, idx) {
    if (idx % xLabelStep !== 0) return;
    const x = toSvgX(xv);
    svg += '<text x="' + x + '" y="' + (H - padBottom + 16) + '">' + xv + '</text>';
  });
  svg += '</g>';

  // X axis label title
  if (opts.xLabel) {
    svg += '<text x="' + (W / 2) + '" y="' + (H - 4) + '" font-size="10" fill="#565c5f" text-anchor="middle" font-family="ui-monospace,Consolas,monospace">' + opts.xLabel + '</text>';
  }

  // Axes
  svg += '<line x1="' + padLeft + '" y1="' + padTop + '" x2="' + padLeft + '" y2="' + (H - padBottom) + '" stroke="#b9b6aa" stroke-width="1.5"/>';
  svg += '<line x1="' + padLeft + '" y1="' + (H - padBottom) + '" x2="' + (W - padRight) + '" y2="' + (H - padBottom) + '" stroke="#b9b6aa" stroke-width="1.5"/>';

  // Crossover marker
  if (opts.crossoverX !== undefined && opts.crossoverX >= minX && opts.crossoverX <= maxX) {
    const cx = toSvgX(opts.crossoverX);
    svg += '<line x1="' + cx + '" y1="' + padTop + '" x2="' + cx + '" y2="' + (H - padBottom) + '" stroke="#d4a017" stroke-width="1.5" stroke-dasharray="4,3"/>';
    svg += '<text x="' + (cx + 4) + '" y="' + (padTop + 12) + '" font-size="9" fill="#7a5c00" font-family="ui-monospace,Consolas,monospace">n=' + opts.crossoverX + '</text>';
  }

  // Series lines + dots
  seriesArray.forEach(function (series) {
    if (!series.data || series.data.length < 1) return;
    const color = series.color || '#333';
    const dashed = series.dashed ? 'stroke-dasharray="5,3"' : '';

    // Line
    const pts = series.data.map(function (pt) {
      return toSvgX(pt.x) + ',' + toSvgY(pt.y);
    }).join(' ');
    svg += '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" ' + dashed + '/>';

    // Dots
    series.data.forEach(function (pt) {
      svg += '<circle cx="' + toSvgX(pt.x) + '" cy="' + toSvgY(pt.y) + '" r="4" fill="' + color + '" stroke="white" stroke-width="1.5"/>';
    });
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

/* -------------------------------------------------------------------------
   4. APPLICATION STATE
   Single source of truth. Never mutated directly — use setState helpers.
   ------------------------------------------------------------------------- */

const STAGES = ['orientasi', 'eksplorasi', 'komparasi', 'skenario', 'simulasi', 'ringkasan', 'refleksi', 'penutup'];

const appState = {
  currentStage: 'orientasi',
  visited: new Set(['orientasi']),
  completed: new Set(),

  exploration: {
    caseA: { pattern: null, indicator: null },
    caseB: { pattern: null, indicator: null },
    submitted: false,
    attempts: 0,
    correct: false,
  },

  comparison: {
    classifications: {},   // cardId -> 'arithmetic' | 'geometric'
    submitted: false,
    correct: false,
  },

  scenario: {
    step: 0,               // 0=intro 1=patterns 2=formulas 3=calc 4=decide
    patternA: null,
    patternB: null,
    patternSubmitted: false,
    patternCorrect: false,
    formulaA: null,        // formula option id
    formulaB: null,
    formulaACorrect: false,
    formulaBCorrect: false,
    formulaSubmitted: false,
    calcA: null,           // student's numeric answer
    calcB: null,
    calcACorrect: false,
    calcBCorrect: false,
    calcSubmitted: false,
    calcAttempts: 0,
    decision: null,        // 'planA' | 'planB'
    decisionSubmitted: false,
    decisionCorrect: false,
    errors: [],            // list of error type strings for summary
    completed: false,
  },

  simulation: {
    months: 12,
  },

  reflection: {
    checklist: {},   // saId -> level string
    indicator: '',
    submitted: false,
  },
};

/* -------------------------------------------------------------------------
   5. STAGE NAVIGATION & PROGRESS
   ------------------------------------------------------------------------- */

function getStageIndex(stageName) {
  return STAGES.indexOf(stageName);
}

function navigateToStage(stageName) {
  if (!STAGES.includes(stageName)) return;

  const prevStage = appState.currentStage;
  appState.currentStage = stageName;
  appState.visited.add(stageName);

  // Hide all stages, show target
  STAGES.forEach(function (s) {
    const el = document.getElementById('stage-' + s);
    if (el) {
      if (s === stageName) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    }
  });

  // Render target stage content
  renderStage(stageName);

  // Update nav
  updateStageNav();
  updateProgressBar();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStageNav() {
  const items = document.querySelectorAll('.stage-nav__item');
  items.forEach(function (btn) {
    const stageName = btn.dataset.stage;
    btn.removeAttribute('aria-current');
    btn.classList.remove('is-complete');

    if (stageName === appState.currentStage) {
      btn.setAttribute('aria-current', 'step');
    }
    if (appState.completed.has(stageName)) {
      btn.classList.add('is-complete');
    }
  });
}

function updateProgressBar() {
  const idx = getStageIndex(appState.currentStage);
  const pct = ((idx + 1) / STAGES.length) * 100;
  const fill = document.getElementById('progressBarFill');
  const label = document.getElementById('progressBarLabel');
  const wrap = document.getElementById('progressBarWrap');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = 'Tahap ' + (idx + 1) + ' dari ' + STAGES.length;
  if (wrap) wrap.setAttribute('aria-valuenow', idx + 1);
}

function markStageComplete(stageName) {
  appState.completed.add(stageName);
  updateStageNav();
}

/* -------------------------------------------------------------------------
   6. STAGE RENDERERS
   Each function is called when navigating to that stage.
   They are idempotent (safe to call multiple times).
   ------------------------------------------------------------------------- */

// 6.1 — Orientasi
function renderOrientasi() {
  // Static — nothing dynamic to render
}

// 6.2 — Eksplorasi
function renderEksplorasi() {
  renderExplorationCases();
}

function renderExplorationCases() {
  const container = document.getElementById('explorationCasesContainer');
  if (!container) return;

  const casesHtml = [CASES.caseA, CASES.caseB].map(function (c) {
    const state = c.id === 'caseA' ? appState.exploration.caseA : appState.exploration.caseB;
    const tableRows = c.data.map(function (row, idx) {
      // Show period-to-period change column
      let change = '';
      if (idx > 0) {
        const prev = c.data[idx - 1].value;
        const diff = row.value - prev;
        const ratio = (row.value / prev).toFixed(2);
        change = '<span style="color:var(--color-ink-muted);font-size:0.8rem">+' + formatNumber(diff) + ' / ÷' + (row.value / prev).toFixed(2) + '</span>';
      }

      return '<tr' + (idx === c.data.length - 1 ? '' : '') + '>' +
        '<td>' + row.period + '</td>' +
        '<td>' + formatRupiah(row.value) + '</td>' +
        '<td>' + change + '</td>' +
        '</tr>';
    }).join('');

    const variablesHtml = c.variables.map(function (v) {
      return '<dt>' + v.key + ':</dt><dd>' + v.value + '</dd>';
    }).join('');

    const selectedPatternA = state.pattern === 'arithmetic' ? ' is-selected' : '';
    const selectedPatternG = state.pattern === 'geometric' ? ' is-selected' : '';

    const indicatorsHtml = INDICATORS.map(function (ind) {
      const isSelected = state.indicator === ind.id;
      return '<label class="choice-option' + (isSelected ? ' is-selected' : '') + '">' +
        '<input type="radio" name="ind_' + c.id + '" value="' + ind.id + '"' +
        (isSelected ? ' checked' : '') + ' aria-label="' + ind.label + '">' +
        '<span>' + ind.label + '</span>' +
        '</label>';
    }).join('');

    return '<div class="case-card">' +
      '<h3 class="case-card__title">' + c.title + '</h3>' +
      '<p class="case-card__context">' + c.context + '</p>' +

      '<div class="table-scroll" style="margin-bottom:var(--space-3)">' +
      '<table class="data-table">' +
      '<caption class="sr-only">' + c.title + '</caption>' +
      '<thead><tr>' +
      '<th scope="col">' + c.periodLabel + '</th>' +
      '<th scope="col">' + c.valueLabel + '</th>' +
      '<th scope="col">Perubahan</th>' +
      '</tr></thead>' +
      '<tbody>' + tableRows + '</tbody>' +
      '</table></div>' +

      '<dl class="case-card__variables">' + variablesHtml + '</dl>' +

      '<p class="case-card__guide">' + c.guideQuestion + '</p>' +

      '<fieldset style="border:none;padding:0;margin:0 0 var(--space-3) 0">' +
      '<legend class="pattern-question">Pola apakah ini?</legend>' +
      '<div class="pattern-options">' +
      '<button type="button" class="pattern-btn' + selectedPatternA + '" data-case="' + c.id + '" data-pattern="arithmetic">Aritmetika (+d)</button>' +
      '<button type="button" class="pattern-btn' + selectedPatternG + '" data-case="' + c.id + '" data-pattern="geometric">Geometri (×r)</button>' +
      '</div></fieldset>' +

      '<fieldset style="border:none;padding:0;margin:0">' +
      '<legend class="indicator-question">Apa indikator yang mendukung pilihanmu?</legend>' +
      '<div class="choice-group">' + indicatorsHtml + '</div>' +
      '</fieldset>' +

      '</div>';
  }).join('');

  container.innerHTML = casesHtml;
  wireExplorationEvents();
}

function wireExplorationEvents() {
  // Pattern buttons
  document.querySelectorAll('.pattern-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const caseId = btn.dataset.case;
      const pattern = btn.dataset.pattern;
      const stateRef = caseId === 'caseA' ? appState.exploration.caseA : appState.exploration.caseB;
      stateRef.pattern = pattern;

      // Update button appearance within this case card
      const card = btn.closest('.case-card');
      if (card) {
        card.querySelectorAll('.pattern-btn').forEach(function (b) {
          b.classList.remove('is-selected');
        });
      }
      btn.classList.add('is-selected');
    });
  });

  // Indicator radio buttons
  document.querySelectorAll('[name^="ind_"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      const caseId = radio.name.replace('ind_', '');
      const stateRef = caseId === 'caseA' ? appState.exploration.caseA : appState.exploration.caseB;
      stateRef.indicator = radio.value;

      // Update parent label styling
      const card = radio.closest('.case-card');
      if (card) {
        card.querySelectorAll('.choice-option').forEach(function (lbl) {
          lbl.classList.remove('is-selected');
        });
      }
      const label = radio.closest('.choice-option');
      if (label) label.classList.add('is-selected');
    });
  });
}

function handleExplorationSubmit() {
  const ea = appState.exploration.caseA;
  const eb = appState.exploration.caseB;

  // Validate all selections made
  if (!ea.pattern || !ea.indicator || !eb.pattern || !eb.indicator) {
    showFeedback('explorationFeedback', 'error',
      'Belum semua pilihan terisi',
      'Pilih jenis pola dan indikator untuk <strong>kedua kasus</strong> sebelum memeriksa.');
    return;
  }

  appState.exploration.attempts++;
  appState.exploration.submitted = true;

  const aPatternOk = ea.pattern === CASES.caseA.correctPattern;
  const bPatternOk = eb.pattern === CASES.caseB.correctPattern;
  const aIndOk = CASES.caseA.correctIndicators.includes(ea.indicator);
  const bIndOk = CASES.caseB.correctIndicators.includes(eb.indicator);

  const patternsOk = aPatternOk && bPatternOk;
  const indicatorsOk = aIndOk && bIndOk;

  if (patternsOk && indicatorsOk) {
    appState.exploration.correct = true;
    markStageComplete('eksplorasi');
    showFeedback('explorationFeedback', 'correct',
      FEEDBACK.exploration.bothCorrect.heading,
      FEEDBACK.exploration.bothCorrect.body);
    // Enable going next (button already wired via data-go-next pattern)
    return;
  }

  if (patternsOk && !indicatorsOk) {
    showFeedback('explorationFeedback', 'hint',
      FEEDBACK.exploration.wrongIndicatorOnly.heading,
      FEEDBACK.exploration.wrongIndicatorOnly.body);
    return;
  }

  if (!aPatternOk && !bPatternOk) {
    showFeedback('explorationFeedback', 'hint',
      FEEDBACK.exploration.wrongBoth.heading,
      FEEDBACK.exploration.wrongBoth.body);
    return;
  }

  if (!aPatternOk) {
    showFeedback('explorationFeedback', 'hint',
      FEEDBACK.exploration.wrongCaseA.heading,
      FEEDBACK.exploration.wrongCaseA.body);
    return;
  }

  if (!bPatternOk) {
    showFeedback('explorationFeedback', 'hint',
      FEEDBACK.exploration.wrongCaseB.heading,
      FEEDBACK.exploration.wrongCaseB.body);
  }
}

// 6.3 — Komparasi
function renderKomparasi() {
  renderComparisonCharts();
  renderClassificationCards();
}

function renderComparisonCharts() {
  // Arithmetic chart: a=100, d=50, n=8
  const arithData = generateArithmeticSeries(100, 50, 8).map(function (pt) {
    return { x: pt.n, y: pt.value };
  });
  renderLineChart('compChartArith', [
    { data: arithData, color: 'var(--color-arith)', label: 'Aritmetika' }
  ], { xLabel: 'Suku ke-n', padLeft: 50 });

  const narA = document.getElementById('compNarrativeArith');
  if (narA) narA.textContent = 'Setiap suku bertambah 50 (beda tetap d=50). Grafik membentuk garis lurus.';

  // Geometric chart: a=100, r=1.5, n=8
  const geomData = generateGeometricSeries(100, 1.5, 8).map(function (pt) {
    return { x: pt.n, y: pt.value };
  });
  renderLineChart('compChartGeom', [
    { data: geomData, color: 'var(--color-geom)', label: 'Geometri' }
  ], { xLabel: 'Suku ke-n', padLeft: 50 });

  const narB = document.getElementById('compNarrativeGeom');
  if (narB) narB.textContent = 'Setiap suku dikali 1,5 (rasio tetap r=1,5). Grafik membentuk kurva melengkung (eksponensial).';
}

function renderClassificationCards() {
  const container = document.getElementById('classificationCards');
  if (!container) return;

  const html = COMPARISON_CARDS.map(function (card) {
    const sel = appState.comparison.classifications[card.id];
    const submitted = appState.comparison.submitted;
    let cardClass = 'class-card';
    if (submitted && sel) {
      cardClass += sel === card.correct ? ' is-correct' : ' is-incorrect';
    }

    const arithSelected = sel === 'arithmetic' ? ' is-selected' : '';
    const geomSelected = sel === 'geometric' ? ' is-selected' : '';

    return '<div class="' + cardClass + '" id="classcard-' + card.id + '" role="group" aria-label="Klasifikasi: ' + card.text + '">' +
      '<p class="class-card__text">' + card.text + '</p>' +
      '<div class="class-card__options">' +
      '<button type="button" class="class-btn' + arithSelected + '" data-card="' + card.id + '" data-assign="arithmetic" aria-pressed="' + (sel === 'arithmetic') + '">Aritmetika</button>' +
      '<button type="button" class="class-btn' + geomSelected + '" data-card="' + card.id + '" data-assign="geometric" aria-pressed="' + (sel === 'geometric') + '">Geometri</button>' +
      '</div>' +
      '</div>';
  }).join('');

  container.innerHTML = html;

  // Wire classification buttons
  container.querySelectorAll('.class-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const cardId = btn.dataset.card;
      const assign = btn.dataset.assign;
      appState.comparison.classifications[cardId] = assign;

      const cardEl = document.getElementById('classcard-' + cardId);
      if (cardEl) {
        cardEl.querySelectorAll('.class-btn').forEach(function (b) {
          b.classList.remove('is-selected');
          b.setAttribute('aria-pressed', 'false');
        });
      }
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
    });
  });
}

function handleClassificationCheck() {
  const allFilled = COMPARISON_CARDS.every(function (card) {
    return appState.comparison.classifications[card.id];
  });

  if (!allFilled) {
    showFeedback('classificationFeedback', 'error',
      'Belum semua terisi',
      'Pilih "Aritmetika" atau "Geometri" untuk setiap pernyataan.');
    return;
  }

  appState.comparison.submitted = true;

  const allCorrect = COMPARISON_CARDS.every(function (card) {
    return appState.comparison.classifications[card.id] === card.correct;
  });

  // Re-render cards with correct/incorrect state
  renderClassificationCards();

  if (allCorrect) {
    appState.comparison.correct = true;
    markStageComplete('komparasi');
    showFeedback('classificationFeedback', 'correct',
      FEEDBACK.comparison.allCorrect.heading,
      FEEDBACK.comparison.allCorrect.body);
    const nextBtn = document.getElementById('komparasiNextBtn');
    if (nextBtn) nextBtn.disabled = false;
  } else {
    showFeedback('classificationFeedback', 'hint',
      FEEDBACK.comparison.hasError.heading,
      FEEDBACK.comparison.hasError.body);
    // Delay reset so student can see which cards were marked wrong
    setTimeout(function () {
      appState.comparison.submitted = false;
      COMPARISON_CARDS.forEach(function (card) {
        if (appState.comparison.classifications[card.id] !== card.correct) {
          delete appState.comparison.classifications[card.id];
        }
      });
      renderClassificationCards();
    }, 1500);
  }
}

// 6.4 — Skenario (branching scenario)
function renderSkenario() {
  renderScenarioStep(appState.scenario.step);
}

function renderScenarioStep(stepNum) {
  const container = document.getElementById('scenarioContainer');
  if (!container) return;

  switch (stepNum) {
    case 0: renderScenarioIntro(container); break;
    case 1: renderScenarioPatternStep(container); break;
    case 2: renderScenarioFormulaStep(container); break;
    case 3: renderScenarioCalcStep(container); break;
    case 4: renderScenarioDecisionStep(container); break;
    default: break;
  }

  updateStepDots(stepNum);
}

function getStepDotsHtml(current) {
  return '<div class="scenario-step-indicator" aria-label="Langkah ' + (current + 1) + ' dari 5" role="navigation">' +
    [0, 1, 2, 3, 4].map(function (i) {
      let cls = 'step-dot';
      if (i === current) cls += ' is-active';
      else if (i < current) cls += ' is-done';
      return '<span class="' + cls + '" aria-hidden="true"></span>';
    }).join('') +
    '</div>';
}

function updateStepDots(current) {
  const indicator = document.querySelector('.scenario-step-indicator');
  if (!indicator) return;
  indicator.outerHTML = getStepDotsHtml(current);
}

function getScenarioPlanTableHtml(plan) {
  const rows = plan.data.map(function (row, idx) {
    let changeHtml = '';
    if (idx > 0) {
      const prev = plan.data[idx - 1].value;
      const diff = row.value - prev;
      const ratio = (row.value / prev).toFixed(3);
      changeHtml = '<span style="font-size:0.78rem;color:var(--color-ink-muted)">+' + formatNumber(diff) + ' / ×' + ratio + '</span>';
    }
    return '<tr><td>' + row.period + '</td><td>' + formatRupiah(row.value) + '</td><td>' + changeHtml + '</td></tr>';
  }).join('');

  return '<div class="table-scroll">' +
    '<table class="data-table"><caption class="sr-only">' + plan.title + '</caption>' +
    '<thead><tr><th scope="col">Bulan</th><th scope="col">Modal (Rp)</th><th scope="col">Perubahan</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>';
}

function renderScenarioIntro(container) {
  container.innerHTML = getStepDotsHtml(0) +
    '<div class="panel">' +
    '<div class="scenario-context">' + SCENARIO.context + '</div>' +

    '<div class="scenario-plans-grid">' +

    '<div class="plan-card plan-card--a">' +
    '<span class="plan-card__label">Rencana A</span>' +
    '<h4 class="plan-card__title">' + SCENARIO.planA.title + '</h4>' +
    '<p class="plan-card__desc">' + SCENARIO.planA.description + '</p>' +
    getScenarioPlanTableHtml(SCENARIO.planA) +
    '</div>' +

    '<div class="plan-card plan-card--b">' +
    '<span class="plan-card__label">Rencana B</span>' +
    '<h4 class="plan-card__title">' + SCENARIO.planB.title + '</h4>' +
    '<p class="plan-card__desc">' + SCENARIO.planB.description + '</p>' +
    getScenarioPlanTableHtml(SCENARIO.planB) +
    '</div>' +

    '</div>' +

    '<p style="font-size:0.9rem;color:var(--color-ink-muted)">Data di atas menunjukkan perkembangan modal selama 5 bulan pertama. Kamu diminta menganalisis, memilih model yang tepat, menghitung modal pada bulan ke-12, lalu menentukan rencana terbaik.</p>' +

    '<div class="stage-nav-buttons">' +
    '<button type="button" class="btn btn--ghost" data-go-prev>← Kembali</button>' +
    '<button type="button" class="btn btn--primary" id="scenarioStep0Next">Mulai Analisis →</button>' +
    '</div></div>';

  document.getElementById('scenarioStep0Next').addEventListener('click', function () {
    appState.scenario.step = 1;
    renderScenarioStep(1);
  });
}

function renderScenarioPatternStep(container) {
  const sc = appState.scenario;

  const selectedAA = sc.patternA === 'arithmetic' ? ' is-selected' : '';
  const selectedAG = sc.patternA === 'geometric' ? ' is-selected' : '';
  const selectedBA = sc.patternB === 'arithmetic' ? ' is-selected' : '';
  const selectedBG = sc.patternB === 'geometric' ? ' is-selected' : '';

  container.innerHTML = getStepDotsHtml(1) +
    '<div class="panel">' +
    '<h3 class="scenario-step__heading">Langkah 1 — Identifikasi Pola</h3>' +
    '<p class="scenario-step__context">Sebelum memilih formula, kamu perlu mengidentifikasi jenis pola masing-masing rencana. Gunakan data pada tabel: hitung selisih dan rasio antar nilai berurutan.</p>' +

    '<div class="scenario-plans-grid">' +
    '<div class="plan-card plan-card--a">' +
    '<span class="plan-card__label">Rencana A</span>' +
    getScenarioPlanTableHtml(SCENARIO.planA) +
    '<fieldset style="border:none;padding:0;margin:var(--space-3) 0 0 0"><legend style="font-weight:600;font-size:0.9rem;margin-bottom:var(--space-2)">Pola Rencana A:</legend>' +
    '<div class="pattern-options">' +
    '<button type="button" class="pattern-btn' + selectedAA + '" id="patA_arith" data-sel-plan="A" data-pattern="arithmetic">Aritmetika (+d)</button>' +
    '<button type="button" class="pattern-btn' + selectedAG + '" id="patA_geom" data-sel-plan="A" data-pattern="geometric">Geometri (×r)</button>' +
    '</div></fieldset>' +
    '</div>' +

    '<div class="plan-card plan-card--b">' +
    '<span class="plan-card__label">Rencana B</span>' +
    getScenarioPlanTableHtml(SCENARIO.planB) +
    '<fieldset style="border:none;padding:0;margin:var(--space-3) 0 0 0"><legend style="font-weight:600;font-size:0.9rem;margin-bottom:var(--space-2)">Pola Rencana B:</legend>' +
    '<div class="pattern-options">' +
    '<button type="button" class="pattern-btn' + selectedBA + '" id="patB_arith" data-sel-plan="B" data-pattern="arithmetic">Aritmetika (+d)</button>' +
    '<button type="button" class="pattern-btn' + selectedBG + '" id="patB_geom" data-sel-plan="B" data-pattern="geometric">Geometri (×r)</button>' +
    '</div></fieldset>' +
    '</div>' +
    '</div>' +

    '<div id="patternStepFeedback" class="feedback-block" aria-live="polite" hidden></div>' +

    '<div class="stage-nav-buttons">' +
    '<button type="button" class="btn btn--ghost" id="patStep_back">← Kembali</button>' +
    '<button type="button" class="btn btn--primary" id="patStep_next">Periksa Identifikasi</button>' +
    '</div></div>';

  // Wire pattern buttons
  ['patA_arith', 'patA_geom'].forEach(function (id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      appState.scenario.patternA = btn.dataset.pattern;
      document.getElementById('patA_arith').classList.toggle('is-selected', btn.dataset.pattern === 'arithmetic');
      document.getElementById('patA_geom').classList.toggle('is-selected', btn.dataset.pattern === 'geometric');
    });
  });

  ['patB_arith', 'patB_geom'].forEach(function (id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', function () {
      appState.scenario.patternB = btn.dataset.pattern;
      document.getElementById('patB_arith').classList.toggle('is-selected', btn.dataset.pattern === 'arithmetic');
      document.getElementById('patB_geom').classList.toggle('is-selected', btn.dataset.pattern === 'geometric');
    });
  });

  document.getElementById('patStep_back').addEventListener('click', function () {
    appState.scenario.step = 0;
    renderScenarioStep(0);
  });

  document.getElementById('patStep_next').addEventListener('click', function () {
    const sc = appState.scenario;
    if (!sc.patternA || !sc.patternB) {
      showFeedback('patternStepFeedback', 'error', 'Belum lengkap', 'Pilih jenis pola untuk kedua rencana.');
      return;
    }

    const aOk = sc.patternA === 'arithmetic';
    const bOk = sc.patternB === 'geometric';

    if (aOk && bOk) {
      sc.patternSubmitted = true;
      sc.patternCorrect = true;
      showFeedback('patternStepFeedback', 'correct', 'Identifikasi tepat!',
        'Rencana A adalah <strong>aritmetika</strong> (selisih tetap Rp250.000) dan Rencana B adalah <strong>geometri</strong> (rasio tetap 1,3). Lanjutkan untuk memilih formula yang sesuai.');
      setTimeout(function () {
        appState.scenario.step = 2;
        renderScenarioStep(2);
      }, 1500);
    } else {
      sc.errors.push('pattern_wrong');
      if (!aOk) {
        showFeedback('patternStepFeedback', 'hint', 'Periksa kembali Rencana A', FEEDBACK.scenario.patternWrongA.body);
      } else {
        showFeedback('patternStepFeedback', 'hint', 'Periksa kembali Rencana B', FEEDBACK.scenario.patternWrongB.body);
      }
      // Reset wrong state and clear button highlights directly (no full re-render needed)
      if (!aOk) {
        sc.patternA = null;
        var btnAA = document.getElementById('patA_arith');
        var btnAG = document.getElementById('patA_geom');
        if (btnAA) btnAA.classList.remove('is-selected');
        if (btnAG) btnAG.classList.remove('is-selected');
      }
      if (!bOk) {
        sc.patternB = null;
        var btnBA = document.getElementById('patB_arith');
        var btnBG = document.getElementById('patB_geom');
        if (btnBA) btnBA.classList.remove('is-selected');
        if (btnBG) btnBG.classList.remove('is-selected');
      }
    }
  });
}

function renderScenarioFormulaStep(container) {
  const sc = appState.scenario;

  function formulaOptionsHtml(plan, stateFormulaKey, formulaCorrectKey) {
    return plan.formulaOptions.map(function (opt) {
      const isSelected = sc[stateFormulaKey] === opt.id;
      const isSubmitted = sc.formulaSubmitted;
      let cls = 'formula-option';
      if (isSelected) cls += ' is-selected';
      if (isSubmitted && isSelected) {
        cls = 'formula-option ' + (opt.correct ? 'is-correct' : 'is-incorrect');
      }
      const feedbackHtml = isSubmitted && isSelected && !opt.correct
        ? '<p class="formula-feedback formula-feedback--incorrect">' + opt.explanation + '</p>'
        : isSubmitted && isSelected && opt.correct
          ? '<p class="formula-feedback formula-feedback--correct">' + opt.explanation + '</p>'
          : '';
      return '<label class="' + cls + '" data-plan="' + plan.id + '">' +
        '<input type="radio" name="formula_' + plan.id + '" value="' + opt.id + '"' +
        (isSelected ? ' checked' : '') + ' aria-label="' + opt.label.replace(/[<>]/g, '') + '">' +
        opt.label +
        '</label>' + feedbackHtml;
    }).join('');
  }

  container.innerHTML = getStepDotsHtml(2) +
    '<div class="panel">' +
    '<h3 class="scenario-step__heading">Langkah 2 — Pilih Formula</h3>' +
    '<p class="scenario-step__context">Berdasarkan identifikasi pola, pilih formula yang tepat untuk menghitung nilai modal pada bulan ke-<em>n</em> untuk masing-masing rencana.</p>' +

    '<div class="scenario-plans-grid">' +
    '<div class="plan-card plan-card--a">' +
    '<span class="plan-card__label">Rencana A — Aritmetika</span>' +
    '<h4 class="plan-card__title">' + SCENARIO.planA.title + '</h4>' +
    '<p style="font-size:0.85rem;color:var(--color-ink-muted)">a = Rp500.000 &nbsp;|&nbsp; d = Rp250.000</p>' +
    '<fieldset style="border:none;padding:0;margin:0"><legend class="sr-only">Formula Rencana A</legend>' +
    formulaOptionsHtml(SCENARIO.planA, 'formulaA', 'formulaACorrect') +
    '</fieldset></div>' +

    '<div class="plan-card plan-card--b">' +
    '<span class="plan-card__label">Rencana B — Geometri</span>' +
    '<h4 class="plan-card__title">' + SCENARIO.planB.title + '</h4>' +
    '<p style="font-size:0.85rem;color:var(--color-ink-muted)">a = Rp500.000 &nbsp;|&nbsp; r = 1,3</p>' +
    '<fieldset style="border:none;padding:0;margin:0"><legend class="sr-only">Formula Rencana B</legend>' +
    formulaOptionsHtml(SCENARIO.planB, 'formulaB', 'formulaBCorrect') +
    '</fieldset></div>' +
    '</div>' +

    '<div id="formulaStepFeedback" class="feedback-block" aria-live="polite" hidden></div>' +

    '<div class="stage-nav-buttons">' +
    '<button type="button" class="btn btn--ghost" id="formulaStep_back">← Kembali</button>' +
    '<button type="button" class="btn btn--primary" id="formulaStep_next">Periksa Formula</button>' +
    '</div></div>';

  // Wire formula radio buttons
  document.querySelectorAll('[name="formula_planA"]').forEach(function (r) {
    r.addEventListener('change', function () {
      appState.scenario.formulaA = r.value;
      document.querySelectorAll('label.formula-option[data-plan="planA"]').forEach(function (l) {
        l.classList.remove('is-selected');
      });
      r.closest('label').classList.add('is-selected');
    });
  });

  document.querySelectorAll('[name="formula_planB"]').forEach(function (r) {
    r.addEventListener('change', function () {
      appState.scenario.formulaB = r.value;
      document.querySelectorAll('label.formula-option[data-plan="planB"]').forEach(function (l) {
        l.classList.remove('is-selected');
      });
      r.closest('label').classList.add('is-selected');
    });
  });

  document.getElementById('formulaStep_back').addEventListener('click', function () {
    appState.scenario.step = 1;
    renderScenarioStep(1);
  });

  document.getElementById('formulaStep_next').addEventListener('click', function () {
    const sc = appState.scenario;
    if (!sc.formulaA || !sc.formulaB) {
      showFeedback('formulaStepFeedback', 'error', 'Belum lengkap', 'Pilih formula untuk kedua rencana.');
      return;
    }

    // Check correctness
    const aOpt = SCENARIO.planA.formulaOptions.find(function (o) { return o.id === sc.formulaA; });
    const bOpt = SCENARIO.planB.formulaOptions.find(function (o) { return o.id === sc.formulaB; });

    const aOk = aOpt && aOpt.correct;
    const bOk = bOpt && bOpt.correct;

    sc.formulaSubmitted = true;
    sc.formulaACorrect = !!aOk;
    sc.formulaBCorrect = !!bOk;

    // Show formula explanations inline by re-rendering
    renderScenarioStep(2);

    if (aOk && bOk) {
      setTimeout(function () {
        appState.scenario.step = 3;
        renderScenarioStep(3);
      }, 1800);
    } else {
      if (!aOk) sc.errors.push('formula_A_wrong');
      if (!bOk) sc.errors.push('formula_B_wrong');
      // Reset wrong selections after a moment to allow retry
      setTimeout(function () {
        if (!aOk) sc.formulaA = null;
        if (!bOk) sc.formulaB = null;
        sc.formulaSubmitted = false;
        renderScenarioStep(2);
      }, 2500);
    }
  });
}

function renderScenarioCalcStep(container) {
  const sc = appState.scenario;
  const n = SCENARIO.targetPeriod;

  // Determine formula hint text
  const formulaHintA = 'U' + n + ' = 500.000 + (' + n + ' − 1) × 250.000';
  const formulaHintB = 'U' + n + ' = 500.000 × 1,3 <sup>(' + n + '−1)</sup>';

  const aValStr = sc.calcA !== null ? sc.calcA : '';
  const bValStr = sc.calcB !== null ? sc.calcB : '';

  container.innerHTML = getStepDotsHtml(3) +
    '<div class="panel">' +
    '<h3 class="scenario-step__heading">Langkah 3 — Hitung Modal Bulan ke-' + n + '</h3>' +
    '<p class="scenario-step__context">Gunakan formula yang sudah kamu pilih. Substitusikan n = ' + n + ' dan hitung nilai modal masing-masing rencana.</p>' +

    '<div class="scenario-plans-grid">' +
    '<div class="plan-card plan-card--a">' +
    '<span class="plan-card__label">Rencana A — Aritmetika</span>' +
    '<p class="calc-hint font-mono">Formula: ' + formulaHintA + '</p>' +
    '<div class="field-group">' +
    '<label for="calcInputA" style="font-weight:600;font-size:0.9rem">Nilai U₁₂ Rencana A (Rp):</label>' +
    '<div class="calc-row"><input type="number" id="calcInputA" class="input-number" placeholder="Masukkan hasil" value="' + aValStr + '" inputmode="numeric" min="0"></div>' +
    '<p class="field-error" id="calcErrorA"></p>' +
    '</div></div>' +

    '<div class="plan-card plan-card--b">' +
    '<span class="plan-card__label">Rencana B — Geometri</span>' +
    '<p class="calc-hint font-mono">Formula: ' + formulaHintB + '</p>' +
    '<div class="field-group">' +
    '<label for="calcInputB" style="font-weight:600;font-size:0.9rem">Nilai U₁₂ Rencana B (Rp):</label>' +
    '<div class="calc-row"><input type="number" id="calcInputB" class="input-number" placeholder="Masukkan hasil" value="' + bValStr + '" inputmode="numeric" min="0"></div>' +
    '<p class="field-error" id="calcErrorB"></p>' +
    '</div></div>' +
    '</div>' +

    (sc.calcAttempts >= 2
      ? '<div class="feedback-block feedback-block--hint" style="margin-top:var(--space-3)"><strong class="feedback-block__heading">Petunjuk</strong>Rencana A: U₁₂ = 500.000 + 11 × 250.000 = ? · Rencana B: hitung 1,3¹¹ ≈ 17,92, lalu kalikan 500.000.</div>'
      : '') +

    '<div id="calcStepFeedback" class="feedback-block" aria-live="polite" hidden></div>' +

    '<div class="stage-nav-buttons">' +
    '<button type="button" class="btn btn--ghost" id="calcStep_back">← Kembali</button>' +
    '<button type="button" class="btn btn--primary" id="calcStep_next">Periksa Perhitungan</button>' +
    '</div></div>';

  document.getElementById('calcStep_back').addEventListener('click', function () {
    appState.scenario.step = 2;
    renderScenarioStep(2);
  });

  document.getElementById('calcStep_next').addEventListener('click', function () {
    const sc = appState.scenario;
    const rawA = document.getElementById('calcInputA').value;
    const rawB = document.getElementById('calcInputB').value;
    const errorAEl = document.getElementById('calcErrorA');
    const errorBEl = document.getElementById('calcErrorB');
    errorAEl.textContent = '';
    errorBEl.textContent = '';

    const errA = validatePositiveNumber(rawA, 'Nilai Rencana A');
    const errB = validatePositiveNumber(rawB, 'Nilai Rencana B');

    if (errA) { errorAEl.textContent = errA; document.getElementById('calcInputA').classList.add('has-error'); }
    if (errB) { errorBEl.textContent = errB; document.getElementById('calcInputB').classList.add('has-error'); }
    if (errA || errB) return;

    document.getElementById('calcInputA').classList.remove('has-error');
    document.getElementById('calcInputB').classList.remove('has-error');

    const valA = parseNumber(rawA);
    const valB = parseNumber(rawB);

    sc.calcA = valA;
    sc.calcB = valB;

    const expectedA = arithmeticTerm(SCENARIO.planA.params.a, SCENARIO.planA.params.d, SCENARIO.targetPeriod);
    const expectedB = geometricTerm(SCENARIO.planB.params.a, SCENARIO.planB.params.r, SCENARIO.targetPeriod);

    const aOk = isWithinTolerance(valA, expectedA, 0.02);  // 2% tolerance (A is exact)
    const bOk = isWithinTolerance(valB, expectedB, 0.05);  // 5% tolerance (B involves irrational)

    sc.calcAttempts++;
    sc.calcSubmitted = true;
    sc.calcACorrect = aOk;
    sc.calcBCorrect = bOk;

    if (aOk && bOk) {
      showFeedback('calcStepFeedback', 'correct',
        FEEDBACK.scenario.calcCorrect.heading,
        FEEDBACK.scenario.calcCorrect.body +
        ' Rencana A: ' + formatRupiah(Math.round(valA)) + ' · Rencana B: ' + formatRupiah(Math.round(valB)));
      setTimeout(function () {
        appState.scenario.step = 4;
        renderScenarioStep(4);
      }, 1500);
    } else {
      if (!aOk) sc.errors.push('calc_A_wrong');
      if (!bOk) sc.errors.push('calc_B_wrong');
      if (!aOk && !bOk) {
        showFeedback('calcStepFeedback', 'hint',
          FEEDBACK.scenario.calcWrongModelRight.heading,
          'Kedua perhitungan perlu diperiksa. ' + FEEDBACK.scenario.calcWrongModelRight.body);
      } else if (!aOk) {
        showFeedback('calcStepFeedback', 'hint',
          FEEDBACK.scenario.calcWrongModelRight.heading,
          'Hasil Rencana A perlu diperiksa. ' + FEEDBACK.scenario.calcWrongModelRight.body);
      } else {
        showFeedback('calcStepFeedback', 'hint',
          FEEDBACK.scenario.calcWrongModelRight.heading,
          'Hasil Rencana B perlu diperiksa. ' + FEEDBACK.scenario.calcWrongModelRight.body);
      }
      // Show hint after 2 attempts (re-render inserts it)
      if (sc.calcAttempts >= 2) {
        setTimeout(function () { renderScenarioStep(3); }, 600);
      }
    }
  });
}

function renderScenarioDecisionStep(container) {
  const sc = appState.scenario;
  const expectedA = arithmeticTerm(SCENARIO.planA.params.a, SCENARIO.planA.params.d, SCENARIO.targetPeriod);
  const expectedB = geometricTerm(SCENARIO.planB.params.a, SCENARIO.planB.params.r, SCENARIO.targetPeriod);

  // Use student's values if correct, otherwise show correct values
  const displayA = sc.calcACorrect ? sc.calcA : expectedA;
  const displayB = sc.calcBCorrect ? sc.calcB : expectedB;

  const selA = sc.decision === 'planA' ? ' is-selected-a' : '';
  const selB = sc.decision === 'planB' ? ' is-selected-b' : '';

  container.innerHTML = getStepDotsHtml(4) +
    '<div class="panel">' +
    '<h3 class="scenario-step__heading">Langkah 4 — Ambil Keputusan</h3>' +
    '<p class="scenario-step__context">' + SCENARIO.decisionQuestion + '</p>' +

    '<div class="decision-options">' +
    '<button type="button" class="decision-card' + selA + '" id="decisionA" aria-pressed="' + (sc.decision === 'planA') + '">' +
    '<p class="decision-card__plan">Rencana A · Aritmetika</p>' +
    '<p class="decision-card__value arith-col">' + formatRupiah(Math.round(displayA)) + '</p>' +
    '<p class="decision-card__label">Modal pada bulan ke-12</p>' +
    '</button>' +

    '<button type="button" class="decision-card' + selB + '" id="decisionB" aria-pressed="' + (sc.decision === 'planB') + '">' +
    '<p class="decision-card__plan">Rencana B · Geometri</p>' +
    '<p class="decision-card__value geom-col">' + formatRupiah(Math.round(displayB)) + '</p>' +
    '<p class="decision-card__label">Modal pada bulan ke-12</p>' +
    '</button>' +
    '</div>' +

    '<div id="decisionStepFeedback" class="feedback-block" aria-live="polite" hidden></div>' +

    '<div class="stage-nav-buttons">' +
    '<button type="button" class="btn btn--ghost" id="decStep_back">← Kembali</button>' +
    '<button type="button" class="btn btn--primary" id="decStep_next">Konfirmasi Keputusan</button>' +
    '</div></div>';

  document.getElementById('decisionA').addEventListener('click', function () {
    appState.scenario.decision = 'planA';
    document.getElementById('decisionA').classList.add('is-selected-a');
    document.getElementById('decisionA').setAttribute('aria-pressed', 'true');
    document.getElementById('decisionB').className = 'decision-card';
    document.getElementById('decisionB').setAttribute('aria-pressed', 'false');
  });

  document.getElementById('decisionB').addEventListener('click', function () {
    appState.scenario.decision = 'planB';
    document.getElementById('decisionB').classList.add('is-selected-b');
    document.getElementById('decisionB').setAttribute('aria-pressed', 'true');
    document.getElementById('decisionA').className = 'decision-card';
    document.getElementById('decisionA').setAttribute('aria-pressed', 'false');
  });

  document.getElementById('decStep_back').addEventListener('click', function () {
    appState.scenario.step = 3;
    renderScenarioStep(3);
  });

  document.getElementById('decStep_next').addEventListener('click', function () {
    const sc = appState.scenario;
    if (!sc.decision) {
      showFeedback('decisionStepFeedback', 'error', 'Belum memilih', 'Pilih salah satu rencana terlebih dahulu.');
      return;
    }

    sc.decisionSubmitted = true;

    if (sc.decision === 'planB') {
      sc.decisionCorrect = true;
      sc.completed = true;
      markStageComplete('skenario');
      showFeedback('decisionStepFeedback', 'correct',
        FEEDBACK.scenario.decisionCorrect.heading,
        FEEDBACK.scenario.decisionCorrect.body);
      setTimeout(function () {
        navigateToStage('simulasi');
      }, 2000);
    } else {
      sc.errors.push('decision_wrong');
      showFeedback('decisionStepFeedback', 'hint',
        FEEDBACK.scenario.decisionWrong.heading,
        FEEDBACK.scenario.decisionWrong.body);
      sc.decision = null;
      setTimeout(function () { renderScenarioStep(4); }, 600);
    }
  });
}

// 6.5 — Simulasi
function renderSimulasi() {
  updateSimulation();
}

function updateSimulation() {
  const months = appState.simulation.months;
  const aParams = SCENARIO.planA.params;
  const bParams = SCENARIO.planB.params;

  const aVal = arithmeticTerm(aParams.a, aParams.d, months);
  const bVal = geometricTerm(bParams.a, bParams.r, months);

  // Update value displays
  const simValueA = document.getElementById('simValueA');
  const simValueB = document.getElementById('simValueB');
  const simNLabelA = document.getElementById('simNLabelA');
  const simNLabelB = document.getElementById('simNLabelB');

  if (simValueA) simValueA.textContent = formatRupiah(Math.round(aVal));
  if (simValueB) simValueB.textContent = formatRupiah(Math.round(bVal));
  if (simNLabelA) simNLabelA.textContent = months;
  if (simNLabelB) simNLabelB.textContent = months;

  // Crossover
  const crossover = findCrossover(aParams.a, aParams.d, bParams.a, bParams.r, 60);
  const crossoverInfo = document.getElementById('simCrossoverInfo');
  if (crossoverInfo) {
    if (crossover) {
      crossoverInfo.innerHTML = 'Rencana B melampaui Rencana A pada <strong>bulan ke-' + crossover + '</strong>. ' +
        (months < crossover ? 'Pada bulan ke-' + months + ', Rencana A masih lebih besar.' : 'Pada bulan ke-' + months + ', Rencana B sudah lebih besar.');
    } else {
      crossoverInfo.textContent = 'Tidak ditemukan titik persilangan dalam 60 bulan.';
    }
  }

  // Chart
  const aData = generateArithmeticSeries(aParams.a, aParams.d, months).map(function (pt) {
    return { x: pt.n, y: pt.value };
  });
  const bData = generateGeometricSeries(bParams.a, bParams.r, months).map(function (pt) {
    return { x: pt.n, y: pt.value };
  });

  renderLineChart('simChartHolder', [
    { data: aData, color: 'var(--color-arith)', label: 'Rencana A' },
    { data: bData, color: 'var(--color-geom)', label: 'Rencana B' }
  ], {
    xLabel: 'Bulan ke-n',
    crossoverX: crossover,
    padLeft: 90
  });

  // Table
  const tbody = document.getElementById('simTableBody');
  if (tbody) {
    const rowsHtml = [];
    for (let n = 1; n <= months; n++) {
      const a = arithmeticTerm(aParams.a, aParams.d, n);
      const b = geometricTerm(bParams.a, bParams.r, n);
      const diff = b - a;
      const highlight = (crossover && n === crossover) ? ' class="highlight-row"' : '';
      rowsHtml.push('<tr' + highlight + '>' +
        '<td>' + n + (crossover && n === crossover ? ' ★' : '') + '</td>' +
        '<td class="arith-col">' + formatNumber(Math.round(a)) + '</td>' +
        '<td class="geom-col">' + formatNumber(Math.round(b)) + '</td>' +
        '<td style="color:' + (diff > 0 ? 'var(--color-geom-strong)' : 'var(--color-arith-strong)') + '">' +
        (diff > 0 ? '+' : '') + formatNumber(Math.round(diff)) + '</td>' +
        '</tr>');
    }
    tbody.innerHTML = rowsHtml.join('');
  }
}

// 6.6 — Ringkasan
function renderRingkasan() {
  const container = document.getElementById('summaryContainer');
  if (!container) return;

  const sc = appState.scenario;
  const ex = appState.exploration;
  const expectedA = arithmeticTerm(SCENARIO.planA.params.a, SCENARIO.planA.params.d, SCENARIO.targetPeriod);
  const expectedB = geometricTerm(SCENARIO.planB.params.a, SCENARIO.planB.params.r, SCENARIO.targetPeriod);

  function patternBadge(p) {
    if (!p) return '<span class="badge badge--neutral">Belum diisi</span>';
    return p === 'arithmetic'
      ? '<span class="badge badge--arith">Aritmetika (+d)</span>'
      : '<span class="badge badge--geom">Geometri (×r)</span>';
  }

  function correctBadge(ok) {
    return ok
      ? '<span class="badge badge--correct">Tepat</span>'
      : '<span class="badge badge--error">Perlu perbaikan</span>';
  }

  const explorationSection = '<div class="panel summary-section">' +
    '<h3>Eksplorasi Kasus</h3>' +
    '<div class="summary-item"><span class="summary-item__key">Kasus 1 (Tabungan)</span>' +
    '<span class="summary-item__value">' + patternBadge(ex.caseA.pattern) + ' ' + correctBadge(ex.caseA.pattern === CASES.caseA.correctPattern) + '</span></div>' +
    '<div class="summary-item"><span class="summary-item__key">Kasus 2 (Dana Usaha)</span>' +
    '<span class="summary-item__value">' + patternBadge(ex.caseB.pattern) + ' ' + correctBadge(ex.caseB.pattern === CASES.caseB.correctPattern) + '</span></div>' +
    '</div>';

  const formulaA = sc.formulaA ? SCENARIO.planA.formulaOptions.find(function (o) { return o.id === sc.formulaA; }) : null;
  const formulaB = sc.formulaB ? SCENARIO.planB.formulaOptions.find(function (o) { return o.id === sc.formulaB; }) : null;

  const scenarioSection = '<div class="panel summary-section">' +
    '<h3>Skenario Bisnis</h3>' +
    '<div class="summary-item"><span class="summary-item__key">Pola Rencana A</span>' +
    '<span class="summary-item__value">' + patternBadge(sc.patternA) + ' ' + correctBadge(sc.patternA === 'arithmetic') + '</span></div>' +
    '<div class="summary-item"><span class="summary-item__key">Pola Rencana B</span>' +
    '<span class="summary-item__value">' + patternBadge(sc.patternB) + ' ' + correctBadge(sc.patternB === 'geometric') + '</span></div>' +
    '<div class="summary-item"><span class="summary-item__key">Formula Rencana A</span>' +
    '<span class="summary-item__value">' + (formulaA ? '<span class="font-mono" style="font-size:0.85rem">' + formulaA.label + '</span> ' : '—') + correctBadge(sc.formulaACorrect) + '</span></div>' +
    '<div class="summary-item"><span class="summary-item__key">Formula Rencana B</span>' +
    '<span class="summary-item__value">' + (formulaB ? '<span class="font-mono" style="font-size:0.85rem">' + formulaB.label + '</span> ' : '—') + correctBadge(sc.formulaBCorrect) + '</span></div>' +
    '<div class="summary-item"><span class="summary-item__key">U₁₂ Rencana A</span>' +
    '<span class="summary-item__value">' + (sc.calcA !== null ? formatRupiah(Math.round(sc.calcA)) : '—') +
    ' <span style="font-size:0.8rem;color:var(--color-ink-muted)">(jawaban: ' + formatRupiah(Math.round(expectedA)) + ')</span> ' + correctBadge(sc.calcACorrect) + '</span></div>' +
    '<div class="summary-item"><span class="summary-item__key">U₁₂ Rencana B</span>' +
    '<span class="summary-item__value">' + (sc.calcB !== null ? formatRupiah(Math.round(sc.calcB)) : '—') +
    ' <span style="font-size:0.8rem;color:var(--color-ink-muted)">(jawaban: ~' + formatRupiah(Math.round(expectedB)) + ')</span> ' + correctBadge(sc.calcBCorrect) + '</span></div>' +
    '<div class="summary-item"><span class="summary-item__key">Keputusan</span>' +
    '<span class="summary-item__value">' + (sc.decision === 'planB' ? '<strong>Rencana B dipilih</strong>' : sc.decision === 'planA' ? 'Rencana A dipilih' : '—') +
    ' ' + (sc.decisionCorrect ? correctBadge(true) : sc.decision ? correctBadge(false) : '') + '</span></div>' +
    (sc.errors.length > 0
      ? '<p class="error-note">Kesalahan yang diperbaiki selama latihan: ' + sc.errors.length + '. Ini normal dalam proses belajar — yang penting kamu sudah memperbaikinya.</p>'
      : '<p style="font-size:0.85rem;color:var(--color-success);margin-top:var(--space-2)">✓ Tidak ada kesalahan model dalam latihan ini.</p>') +
    '</div>';

  const disclaimer = '<p class="summary-disclaimer">Ringkasan ini adalah rekap latihan, <strong>bukan nilai akhir</strong>. Penilaian resmi dilakukan guru melalui tes tertulis, observasi presentasi, dan rubrik penilaian.</p>';

  container.innerHTML = explorationSection + scenarioSection + disclaimer;
}

// 6.7 — Refleksi
function renderRefleksi() {
  renderSelfAssessment();
}

function renderSelfAssessment() {
  const container = document.getElementById('selfAssessmentList');
  if (!container) return;

  const html = SELF_ASSESSMENT.map(function (item) {
    const currentLevel = appState.reflection.checklist[item.id];
    return '<div class="sa-item">' +
      '<span class="sa-item__text">' + item.text + '</span>' +
      '<div class="sa-item__options">' +
      SA_LEVELS.map(function (level) {
        const isSelected = currentLevel === level.value;
        return '<button type="button" class="sa-btn' + (isSelected ? ' is-selected' : '') + '" ' +
          'data-sa-id="' + item.id + '" data-level="' + level.value + '" ' +
          'aria-pressed="' + isSelected + '">' + level.label + '</button>';
      }).join('') +
      '</div></div>';
  }).join('');

  container.innerHTML = html;

  // Wire SA buttons
  container.querySelectorAll('.sa-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const saId = btn.dataset.saId;
      const level = btn.dataset.level;
      appState.reflection.checklist[saId] = level;

      // Update button states in same SA item
      const item = btn.closest('.sa-item');
      if (item) {
        item.querySelectorAll('.sa-btn').forEach(function (b) {
          b.classList.remove('is-selected');
          b.setAttribute('aria-pressed', 'false');
        });
      }
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
    });
  });

  // Restore textarea value
  const ta = document.getElementById('keyIndicatorInput');
  if (ta && appState.reflection.indicator) {
    ta.value = appState.reflection.indicator;
  }
}

function handleReflectionSubmit() {
  const checklist = appState.reflection.checklist;
  const allFilled = SELF_ASSESSMENT.every(function (item) {
    return checklist[item.id];
  });

  if (!allFilled) {
    showFeedback('reflectionFeedback', 'error',
      'Belum semua dinilai',
      'Pilih level ketercapaian untuk setiap pernyataan.');
    return;
  }

  const ta = document.getElementById('keyIndicatorInput');
  const indicator = ta ? ta.value.trim() : '';
  if (!indicator) {
    showFeedback('reflectionFeedback', 'error',
      'Indikator kunci belum diisi',
      'Tuliskan indikator yang paling membantu kamu membedakan kedua pola.');
    if (ta) ta.focus();
    return;
  }

  appState.reflection.indicator = indicator;
  appState.reflection.submitted = true;
  markStageComplete('refleksi');

  // Show personalized summary
  const sudahCount = SELF_ASSESSMENT.filter(function (i) { return checklist[i.id] === 'sudah'; }).length;
  const perlCount = SELF_ASSESSMENT.filter(function (i) { return checklist[i.id] === 'perlu-latihan'; }).length;
  const belumCount = SELF_ASSESSMENT.filter(function (i) { return checklist[i.id] === 'belum'; }).length;

  let msg = '';
  if (sudahCount === SELF_ASSESSMENT.length) {
    msg = 'Kamu telah mencapai semua indikator. Siapkan dirimu untuk presentasi dan diskusi kelas!';
  } else if (belumCount > 0) {
    msg = 'Ada ' + belumCount + ' indikator yang masih perlu dikerjakan. Manfaatkan sesi diskusi kelas untuk memperkuat pemahamanmu.';
  } else {
    msg = 'Kamu masih perlu berlatih ' + perlCount + ' indikator. Coba tinjau kembali bagian yang kurang yakin, lalu diskusikan bersama guru.';
  }

  showFeedback('reflectionFeedback', 'correct', 'Refleksi tersimpan!', msg);

  setTimeout(function () {
    renderPenutup();
    navigateToStage('penutup');
  }, 2000);
}

// 6.8 — Penutup
function renderPenutup() {
  markStageComplete('penutup');

  const closingDiv = document.getElementById('closingSummary');
  if (!closingDiv) return;

  const sc = appState.scenario;
  const checklist = appState.reflection.checklist;
  const sudahCount = SELF_ASSESSMENT.filter(function (i) { return checklist[i.id] === 'sudah'; }).length;

  closingDiv.innerHTML = '<p class="closing-summary__title">Ringkasan aktivitas kamu:</p>' +
    '<ul style="font-size:0.9rem;margin:0">' +
    '<li>Eksplorasi dua kasus: ' + (appState.exploration.correct ? '✓ Selesai' : 'Dijalankan') + '</li>' +
    '<li>Komparasi karakteristik: ' + (appState.comparison.correct ? '✓ Selesai' : 'Dijalankan') + '</li>' +
    '<li>Skenario bisnis: ' + (sc.completed ? '✓ Selesai — Rencana B dipilih' : 'Dijalankan') + '</li>' +
    '<li>Self-assessment: ' + sudahCount + ' dari ' + SELF_ASSESSMENT.length + ' indikator tercapai</li>' +
    '</ul>';
}

/* -------------------------------------------------------------------------
   Dispatch render to correct function per stage
   ------------------------------------------------------------------------- */
function renderStage(stageName) {
  switch (stageName) {
    case 'orientasi': renderOrientasi(); break;
    case 'eksplorasi': renderEksplorasi(); break;
    case 'komparasi': renderKomparasi(); break;
    case 'skenario': renderSkenario(); break;
    case 'simulasi': renderSimulasi(); break;
    case 'ringkasan': renderRingkasan(); break;
    case 'refleksi': renderRefleksi(); break;
    case 'penutup': renderPenutup(); break;
  }
}

/* -------------------------------------------------------------------------
   FEEDBACK HELPER
   Types: 'correct' | 'hint' | 'error'
   ------------------------------------------------------------------------- */
function showFeedback(elementId, type, heading, body) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.className = 'feedback-block feedback-block--' + type;
  el.removeAttribute('hidden');

  const headingHtml = heading ? '<strong class="feedback-block__heading">' + heading + '</strong>' : '';
  el.innerHTML = headingHtml + (body || '');
}

function hideFeedback(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.setAttribute('hidden', '');
}

/* -------------------------------------------------------------------------
   7. EVENT WIRING
   ------------------------------------------------------------------------- */

function wireGlobalEvents() {
  // Stage nav buttons
  document.querySelectorAll('.stage-nav__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigateToStage(btn.dataset.stage);
    });
  });

  // Start button
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.addEventListener('click', function () {
      navigateToStage('eksplorasi');
    });
  }

  // Exploration submit
  const explorationSubmit = document.getElementById('explorationSubmitBtn');
  if (explorationSubmit) {
    explorationSubmit.addEventListener('click', handleExplorationSubmit);
  }

  // Comparison check + next
  const compCheck = document.getElementById('classificationCheckBtn');
  if (compCheck) {
    compCheck.addEventListener('click', handleClassificationCheck);
  }

  const komparasiNext = document.getElementById('komparasiNextBtn');
  if (komparasiNext) {
    komparasiNext.addEventListener('click', function () {
      navigateToStage('skenario');
    });
  }

  // Simulation slider + input sync
  const simSlider = document.getElementById('simMonthsSlider');
  const simInput = document.getElementById('simMonthsInput');
  if (simSlider && simInput) {
    simSlider.addEventListener('input', function () {
      const val = parseInt(simSlider.value, 10);
      simInput.value = val;
      appState.simulation.months = val;
      updateSimulation();
    });
    simInput.addEventListener('change', function () {
      const err = validatePositiveInteger(simInput.value, 'Jumlah bulan', 4, 24);
      if (err) {
        simInput.classList.add('has-error');
        return;
      }
      simInput.classList.remove('has-error');
      const val = parseInt(simInput.value, 10);
      simSlider.value = val;
      appState.simulation.months = val;
      updateSimulation();
    });
  }

  // Reflection submit
  const reflSubmit = document.getElementById('reflectionSubmitBtn');
  if (reflSubmit) {
    reflSubmit.addEventListener('click', handleReflectionSubmit);
  }

  // Restart
  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', handleReset);
  }

  // Reset app
  const resetAppBtn = document.getElementById('resetAppBtn');
  if (resetAppBtn) {
    resetAppBtn.addEventListener('click', handleReset);
  }

  // Generic data-go-next / data-go-prev buttons (delegated)
  document.addEventListener('click', function (e) {
    const target = e.target.closest('[data-go-next]');
    if (target) {
      const current = appState.currentStage;
      const idx = getStageIndex(current);
      if (idx < STAGES.length - 1) {
        navigateToStage(STAGES[idx + 1]);
      }
      return;
    }

    const prev = e.target.closest('[data-go-prev]');
    if (prev) {
      const current = appState.currentStage;
      const idx = getStageIndex(current);
      if (idx > 0) {
        navigateToStage(STAGES[idx - 1]);
      }
    }
  });
}

function handleReset() {
  if (!confirm('Reset akan menghapus semua kemajuan latihan. Lanjutkan?')) return;

  // Reset state
  appState.currentStage = 'orientasi';
  appState.visited = new Set(['orientasi']);
  appState.completed = new Set();

  appState.exploration = {
    caseA: { pattern: null, indicator: null },
    caseB: { pattern: null, indicator: null },
    submitted: false,
    attempts: 0,
    correct: false,
  };

  appState.comparison = {
    classifications: {},
    submitted: false,
    correct: false,
  };

  appState.scenario = {
    step: 0,
    patternA: null,
    patternB: null,
    patternSubmitted: false,
    patternCorrect: false,
    formulaA: null,
    formulaB: null,
    formulaACorrect: false,
    formulaBCorrect: false,
    formulaSubmitted: false,
    calcA: null,
    calcB: null,
    calcACorrect: false,
    calcBCorrect: false,
    calcSubmitted: false,
    calcAttempts: 0,
    decision: null,
    decisionSubmitted: false,
    decisionCorrect: false,
    errors: [],
    completed: false,
  };

  appState.simulation = { months: 12 };

  appState.reflection = {
    checklist: {},
    indicator: '',
    submitted: false,
  };

  navigateToStage('orientasi');
}

/* -------------------------------------------------------------------------
   8. INIT
   ------------------------------------------------------------------------- */

function init() {
  // Komparasi next button starts disabled
  const komparasiNextBtn = document.getElementById('komparasiNextBtn');
  if (komparasiNextBtn) komparasiNextBtn.disabled = true;

  wireGlobalEvents();
  navigateToStage('orientasi');
}

// Run after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
