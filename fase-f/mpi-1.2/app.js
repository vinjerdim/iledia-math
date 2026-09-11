'use strict';

/* =========================================================================
   GeoGrowth Lab — application logic
   Sections:
   1. Math core (pure functions, unit-testable in isolation)
   2. Input validation
   3. Formatting helpers
   4. Lightweight SVG chart renderer (no external chart library needed —
      the datasets here are tiny (<=30 points, at most 2 series), so a
      small hand-rolled renderer avoids an extra dependency and its
      loading-failure risk entirely while staying easy to maintain).
   5. Application state
   6. Stage navigation
   7. Per-stage render/update logic
   8. Formative exercises (data + checking logic)
   9. Event wiring / init
   ========================================================================= */

/* ------------------------------------------------------------------------
   1. MATH CORE
   ------------------------------------------------------------------------ */

function calculateGeometricTerm(a, r, n) {
  return a * Math.pow(r, n - 1);
}

function calculateGeometricSum(a, r, n) {
  if (r === 1) return a * n;
  return (a * (Math.pow(r, n) - 1)) / (r - 1);
}

function generateGeometricSequence(a, r, n) {
  const sequence = [];
  for (let i = 1; i <= n; i++) {
    sequence.push({ index: i, term: calculateGeometricTerm(a, r, i) });
  }
  return sequence;
}

function calculateArithmeticTerm(a, d, n) {
  return a + (n - 1) * d;
}

function calculateArithmeticSum(a, d, n) {
  return (n / 2) * (2 * a + (n - 1) * d);
}

function generateArithmeticSequence(a, d, n) {
  const sequence = [];
  for (let i = 1; i <= n; i++) {
    sequence.push({ index: i, term: calculateArithmeticTerm(a, d, i) });
  }
  return sequence;
}

function calculateDepreciationRatio(percent) {
  return 1 - percent / 100;
}

function calculateAssetValue(initialValue, ratio, period) {
  return initialValue * Math.pow(ratio, period);
}

function isCloseEnough(actual, expected, relTol, absTol) {
  const rt = typeof relTol === 'number' ? relTol : 0.01;
  const at = typeof absTol === 'number' ? absTol : 1e-6;
  return Math.abs(actual - expected) <= Math.max(at, rt * Math.max(Math.abs(actual), Math.abs(expected)));
}

/* ------------------------------------------------------------------------
   2. VALIDATION
   ------------------------------------------------------------------------ */

/**
 * Validates a raw string/number input against numeric rules.
 * Returns { valid, value, error }.
 */
function validateNumericInput(rawValue, options) {
  const opts = options || {};
  const fieldLabel = opts.fieldLabel || 'Nilai';

  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
    return { valid: false, value: null, error: fieldLabel + ' tidak boleh kosong.' };
  }

  const normalized = String(rawValue).trim().replace(',', '.');

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    return { valid: false, value: null, error: fieldLabel + ' harus berupa angka. Periksa kembali penulisannya.' };
  }

  const num = Number(normalized);

  if (!Number.isFinite(num)) {
    return { valid: false, value: null, error: fieldLabel + ' terlalu besar untuk diproses.' };
  }

  if (opts.integer && !Number.isInteger(num)) {
    return { valid: false, value: null, error: fieldLabel + ' harus berupa bilangan bulat (tanpa desimal).' };
  }

  if (opts.disallowZero && num === 0) {
    return { valid: false, value: null, error: fieldLabel + ' tidak boleh 0.' };
  }

  if (typeof opts.min === 'number' && num < opts.min) {
    return { valid: false, value: null, error: fieldLabel + ' minimal ' + opts.min + '.' };
  }

  if (typeof opts.max === 'number' && num > opts.max) {
    return { valid: false, value: null, error: fieldLabel + ' maksimal ' + opts.max + '.' };
  }

  return { valid: true, value: num, error: null };
}

/* ------------------------------------------------------------------------
   3. FORMATTING
   ------------------------------------------------------------------------ */

function formatNumber(value) {
  if (!Number.isFinite(value)) return value > 0 ? '∞' : (value < 0 ? '-∞' : 'tidak valid');
  if (Math.abs(value) >= 1e12) return value.toExponential(3).replace('e+', ' × 10^');
  if (Math.abs(value) < 1e12 && Math.abs(value) >= 1) {
    return value.toLocaleString('id-ID', { maximumFractionDigits: 3 });
  }
  // small decimals: keep a bit more precision so patterns stay visible
  return value.toLocaleString('id-ID', { maximumFractionDigits: 5 });
}

function formatRupiah(value) {
  if (!Number.isFinite(value)) return '—';
  return 'Rp' + Math.round(value).toLocaleString('id-ID');
}

/* ------------------------------------------------------------------------
   4. SVG CHART RENDERER
   ------------------------------------------------------------------------
   Renders one or two line series on a shared axis. Kept intentionally
   small: the data here never exceeds ~30 points per series, so a
   general-purpose charting library would add a dependency (and a
   loading-failure risk) with no real benefit over plain SVG.
   ------------------------------------------------------------------------ */

const SVG_NS = 'http://www.w3.org/2000/svg';

function renderLineChart(container, config) {
  try {
    container.innerHTML = '';
    const series = config.series.filter(function (s) { return s.points && s.points.length > 0; });
    if (series.length === 0) {
      container.innerHTML = '<p class="chart-fallback">Belum ada data untuk ditampilkan.</p>';
      return;
    }

    const width = 560;
    const height = 300;
    const padLeft = 64;
    const padRight = 20;
    const padTop = 16;
    const padBottom = 40;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    let allX = [];
    let allY = [];
    series.forEach(function (s) {
      s.points.forEach(function (p) { allX.push(p.x); allY.push(p.y); });
    });
    let minX = Math.min.apply(null, allX);
    let maxX = Math.max.apply(null, allX);
    let minY = Math.min.apply(null, allY);
    let maxY = Math.max.apply(null, allY);
    if (minY === maxY) { minY -= 1; maxY += 1; }
    if (minX === maxX) { minX -= 1; maxX += 1; }
    // Always include the zero baseline so growth vs. decay is easy to read.
    if (minY > 0) minY = 0;
    if (maxY < 0) maxY = 0;

    const mapX = function (x) { return padLeft + ((x - minX) / (maxX - minX)) * plotW; };
    const mapY = function (y) { return padTop + plotH - ((y - minY) / (maxY - minY)) * plotH; };

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', config.ariaLabel || 'Grafik data');

    // gridlines (horizontal, 4 divisions)
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const yVal = minY + ((maxY - minY) * i) / gridCount;
      const yPix = mapY(yVal);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', padLeft);
      line.setAttribute('x2', width - padRight);
      line.setAttribute('y1', yPix);
      line.setAttribute('y2', yPix);
      line.setAttribute('stroke', '#e4e1d6');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);

      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', padLeft - 8);
      label.setAttribute('y', yPix + 4);
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-family', 'ui-monospace, monospace');
      label.setAttribute('fill', '#565c5f');
      label.textContent = formatNumber(yVal);
      svg.appendChild(label);
    }

    // x axis line at y=0 baseline (or bottom if 0 not in range, which won't happen since we force it)
    const zeroY = mapY(0);
    const axisLine = document.createElementNS(SVG_NS, 'line');
    axisLine.setAttribute('x1', padLeft);
    axisLine.setAttribute('x2', width - padRight);
    axisLine.setAttribute('y1', zeroY);
    axisLine.setAttribute('y2', zeroY);
    axisLine.setAttribute('stroke', '#b9b6aa');
    axisLine.setAttribute('stroke-width', '1.5');
    svg.appendChild(axisLine);

    // x tick labels: thin them out if there are many points
    const referencePoints = series[0].points;
    const tickStride = Math.max(1, Math.ceil(referencePoints.length / 8));
    referencePoints.forEach(function (p, idx) {
      if (idx % tickStride !== 0 && idx !== referencePoints.length - 1) return;
      const xPix = mapX(p.x);
      const label = document.createElementNS(SVG_NS, 'text');
      label.setAttribute('x', xPix);
      label.setAttribute('y', height - padBottom + 16);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '10');
      label.setAttribute('font-family', 'ui-monospace, monospace');
      label.setAttribute('fill', '#565c5f');
      label.textContent = String(p.x);
      svg.appendChild(label);
    });

    // series lines + points
    series.forEach(function (s) {
      const pointsAttr = s.points.map(function (p) { return mapX(p.x) + ',' + mapY(p.y); }).join(' ');
      const poly = document.createElementNS(SVG_NS, 'polyline');
      poly.setAttribute('points', pointsAttr);
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', s.color);
      poly.setAttribute('stroke-width', '2.5');
      if (s.dash) poly.setAttribute('stroke-dasharray', s.dash);
      svg.appendChild(poly);

      if (s.points.length <= 25) {
        s.points.forEach(function (p) {
          const circle = document.createElementNS(SVG_NS, 'circle');
          circle.setAttribute('cx', mapX(p.x));
          circle.setAttribute('cy', mapY(p.y));
          circle.setAttribute('r', '3.2');
          circle.setAttribute('fill', s.color);
          svg.appendChild(circle);
        });
      }
    });

    container.appendChild(svg);

    // legend (text + color, never color alone)
    if (series.length > 1 || config.forceLegend) {
      const legend = document.createElement('div');
      legend.className = 'chart-legend';
      series.forEach(function (s) {
        const item = document.createElement('span');
        item.className = 'chart-legend__item';
        const swatch = document.createElement('span');
        swatch.className = 'chart-legend__swatch';
        swatch.style.background = s.color;
        if (s.dash) swatch.style.borderTop = '2px dashed ' + s.color;
        item.appendChild(swatch);
        item.appendChild(document.createTextNode(s.name));
        legend.appendChild(item);
      });
      container.appendChild(legend);
    }
  } catch (err) {
    console.error('Gagal merender grafik:', err);
    container.innerHTML = '<p class="chart-fallback">Grafik tidak dapat ditampilkan saat ini. Data tetap dapat dibaca melalui tabel di sampingnya.</p>';
  }
}

/* ------------------------------------------------------------------------
   5. APPLICATION STATE
   ------------------------------------------------------------------------ */

const STAGE_ORDER = ['orientasi', 'eksplorasi', 'perbandingan', 'konstruksi', 'simulasi', 'latihan', 'ringkasan'];

const appState = {
  currentStageIndex: 0,
  furthestUnlockedIndex: 0,
  exploration: { a: 100, r: 2, n: 6 },
  comparison: { a1: 10, d: 5, a2: 10, r: 1.5, n: 8 },
  build: { revealedCount: 1 },
  simulation: { initial: 100000000, percent: 10, periods: 8, queryPeriod: 3 },
  exercises: {} // id -> { attempts, firstAttemptCorrect, solved }
};

function cloneDefaultState() {
  return {
    currentStageIndex: 0,
    furthestUnlockedIndex: 0,
    exploration: { a: 100, r: 2, n: 6 },
    comparison: { a1: 10, d: 5, a2: 10, r: 1.5, n: 8 },
    build: { revealedCount: 1 },
    simulation: { initial: 100000000, percent: 10, periods: 8, queryPeriod: 3 },
    exercises: {}
  };
}

/* ------------------------------------------------------------------------
   TOAST / MESSAGES
   ------------------------------------------------------------------------ */

function showToast(message, isError) {
  const region = document.getElementById('toastRegion');
  if (!region) return;
  const toast = document.createElement('div');
  toast.className = 'toast' + (isError ? ' toast--error' : '');
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(function () {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 4200);
}

/* ------------------------------------------------------------------------
   6. STAGE NAVIGATION
   ------------------------------------------------------------------------ */

function goToStage(stageId, opts) {
  const targetIndex = STAGE_ORDER.indexOf(stageId);
  if (targetIndex === -1) return;
  const options = opts || {};

  if (targetIndex > appState.furthestUnlockedIndex && !options.forceUnlock) {
    showToast('Selesaikan tahap sebelumnya terlebih dahulu sebelum melanjutkan.', true);
    return;
  }

  appState.currentStageIndex = targetIndex;
  if (targetIndex > appState.furthestUnlockedIndex) {
    appState.furthestUnlockedIndex = targetIndex;
  }

  STAGE_ORDER.forEach(function (id) {
    const section = document.getElementById('stage-' + id);
    if (section) section.hidden = (id !== stageId);
  });

  updateStageNav();

  // Konstruksi reuses a/r from Eksplorasi, so refresh it in case those
  // parameters changed since the learner last visited this stage.
  if (stageId === 'konstruksi') renderBuildStage();
  if (stageId === 'ringkasan') renderSummaryStage();

  const mainEl = document.getElementById('konten-utama');
  if (mainEl) mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goToNextStage() {
  const nextIndex = appState.currentStageIndex + 1;
  if (nextIndex >= STAGE_ORDER.length) return;
  goToStage(STAGE_ORDER[nextIndex], { forceUnlock: true });
}

function goToPrevStage() {
  const prevIndex = appState.currentStageIndex - 1;
  if (prevIndex < 0) return;
  goToStage(STAGE_ORDER[prevIndex]);
}

function updateStageNav() {
  const buttons = document.querySelectorAll('.stage-nav__item');
  buttons.forEach(function (btn) {
    const stageId = btn.getAttribute('data-stage');
    const idx = STAGE_ORDER.indexOf(stageId);
    const isCurrent = idx === appState.currentStageIndex;
    const isLocked = idx > appState.furthestUnlockedIndex;
    const isComplete = idx < appState.currentStageIndex;

    if (isCurrent) {
      btn.setAttribute('aria-current', 'step');
    } else {
      btn.removeAttribute('aria-current');
    }
    btn.classList.toggle('is-complete', isComplete && !isCurrent);
    btn.setAttribute('aria-disabled', isLocked ? 'true' : 'false');
    btn.title = isLocked ? 'Selesaikan tahap sebelumnya terlebih dahulu' : '';
  });
}

/* ------------------------------------------------------------------------
   7a. STAGE: EKSPLORASI
   ------------------------------------------------------------------------ */

function readExplorationInputs() {
  const aResult = validateNumericInput(document.getElementById('expA').value, {
    fieldLabel: 'Nilai awal (a)', disallowZero: true, min: -1000000, max: 1000000
  });
  const rResult = validateNumericInput(document.getElementById('expR').value, {
    fieldLabel: 'Rasio (r)', min: -10, max: 10
  });
  const nResult = validateNumericInput(document.getElementById('expN').value, {
    fieldLabel: 'Banyak suku (n)', integer: true, min: 1, max: 20
  });

  setFieldError('expA-error', aResult.error);
  setFieldError('expR-error', rResult.error);
  setFieldError('expN-error', nResult.error);
  toggleInputErrorClass('expA', !aResult.valid);
  toggleInputErrorClass('expR', !rResult.valid);
  toggleInputErrorClass('expN', !nResult.valid);

  if (aResult.valid) appState.exploration.a = aResult.value;
  if (rResult.valid) appState.exploration.r = rResult.value;
  if (nResult.valid) appState.exploration.n = nResult.value;

  return aResult.valid && rResult.valid && nResult.valid;
}

function setFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message || '';
}

function toggleInputErrorClass(inputId, hasError) {
  const el = document.getElementById(inputId);
  if (el) el.classList.toggle('has-error', !!hasError);
}

function renderExplorationStage() {
  const ok = readExplorationInputs();
  if (!ok) return;

  const a = appState.exploration.a;
  const r = appState.exploration.r;
  const n = appState.exploration.n;
  const sequence = generateGeometricSequence(a, r, n);

  renderChainStrip(document.getElementById('expChain'), a, r, Math.min(n, 6));
  renderSequenceTable(document.getElementById('expTable'), sequence, r);
  renderLineChart(document.getElementById('expChartHolder'), {
    ariaLabel: 'Grafik barisan geometri',
    series: [{ name: 'Uₙ', color: '#b1500a', points: sequence.map(function (t) { return { x: t.index, y: t.term }; }) }]
  });

  const first = sequence[0].term;
  const last = sequence[sequence.length - 1].term;
  document.getElementById('expChartNarrative').textContent =
    'Grafik menunjukkan suku pertama bernilai ' + formatNumber(first) + ' dan suku ke-' + n + ' bernilai ' + formatNumber(last) + '.';

  const interpretation = document.getElementById('expInterpretation');
  let message;
  if (r === 0) {
    message = 'Rasio 0 adalah kasus khusus: setiap suku setelah suku pertama akan bernilai 0, karena dikalikan 0 secara berulang.';
  } else if (r === 1) {
    message = 'Rasio 1 membuat setiap suku bernilai sama (konstan) — tidak ada pertumbuhan maupun penyusutan.';
  } else if (r > 1) {
    message = 'Karena r = ' + formatNumber(r) + ' > 1, barisan ini tumbuh semakin cepat (pertumbuhan berlipat).';
  } else if (r > 0 && r < 1) {
    message = 'Karena 0 < r = ' + formatNumber(r) + ' < 1, barisan ini menyusut mendekati 0 (penyusutan berlipat).';
  } else {
    message = 'Karena r = ' + formatNumber(r) + ' bernilai negatif, tanda suku berganti-ganti (positif/negatif) setiap langkah.';
  }
  interpretation.textContent = message;
}

function renderChainStrip(container, a, r, count) {
  container.innerHTML = '';
  const visibleCount = Math.max(1, Math.min(count, 6));
  for (let i = 0; i < visibleCount; i++) {
    const term = calculateGeometricTerm(a, r, i + 1);
    const chip = document.createElement('div');
    chip.className = 'chain-strip__term';
    const small = document.createElement('small');
    small.textContent = 'U' + (i + 1);
    chip.appendChild(small);
    chip.appendChild(document.createTextNode(formatNumber(term)));
    container.appendChild(chip);

    if (i < visibleCount - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'chain-strip__arrow';
      arrow.innerHTML = '→<span>×' + formatNumber(r) + '</span>';
      container.appendChild(arrow);
    }
  }
  if (count > visibleCount) {
    const more = document.createElement('div');
    more.className = 'chain-strip__arrow';
    more.textContent = '… hingga suku ke-' + count;
    container.appendChild(more);
  }
}

function renderSequenceTable(tableEl, sequence, r) {
  const tbody = tableEl.querySelector('tbody');
  tbody.innerHTML = '';
  sequence.forEach(function (t, idx) {
    const tr = document.createElement('tr');
    const changeText = idx === 0 ? '—' : '× ' + formatNumber(r) + ' → ' + formatNumber(t.term);
    tr.innerHTML =
      '<td>' + t.index + '</td>' +
      '<td>' + formatNumber(t.term) + '</td>' +
      '<td>' + changeText + '</td>';
    tbody.appendChild(tr);
  });
}

/* ------------------------------------------------------------------------
   7b. STAGE: PERBANDINGAN
   ------------------------------------------------------------------------ */

function readComparisonInputs() {
  const a1 = validateNumericInput(document.getElementById('cmpA1').value, { fieldLabel: 'Nilai awal aritmetika', min: -1000000, max: 1000000 });
  const d = validateNumericInput(document.getElementById('cmpD').value, { fieldLabel: 'Beda (d)', min: -1000000, max: 1000000 });
  const a2 = validateNumericInput(document.getElementById('cmpA2').value, { fieldLabel: 'Nilai awal geometri', disallowZero: true, min: -1000000, max: 1000000 });
  const r = validateNumericInput(document.getElementById('cmpR').value, { fieldLabel: 'Rasio (r)', min: -10, max: 10 });
  const n = validateNumericInput(document.getElementById('cmpN').value, { fieldLabel: 'Banyak suku', integer: true, min: 2, max: 15 });

  setFieldError('cmpA1-error', a1.error);
  setFieldError('cmpD-error', d.error);
  setFieldError('cmpA2-error', a2.error);
  setFieldError('cmpR-error', r.error);
  setFieldError('cmpN-error', n.error);
  toggleInputErrorClass('cmpA1', !a1.valid);
  toggleInputErrorClass('cmpD', !d.valid);
  toggleInputErrorClass('cmpA2', !a2.valid);
  toggleInputErrorClass('cmpR', !r.valid);
  toggleInputErrorClass('cmpN', !n.valid);

  if (a1.valid) appState.comparison.a1 = a1.value;
  if (d.valid) appState.comparison.d = d.value;
  if (a2.valid) appState.comparison.a2 = a2.value;
  if (r.valid) appState.comparison.r = r.value;
  if (n.valid) appState.comparison.n = n.value;

  return a1.valid && d.valid && a2.valid && r.valid && n.valid;
}

function renderComparisonStage() {
  const ok = readComparisonInputs();
  if (!ok) return;

  const c = appState.comparison;
  const arithSeq = generateArithmeticSequence(c.a1, c.d, c.n);
  const geomSeq = generateGeometricSequence(c.a2, c.r, c.n);

  const tbody = document.querySelector('#cmpTable tbody');
  tbody.innerHTML = '';
  for (let i = 0; i < c.n; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + (i + 1) + '</td>' +
      '<td>' + formatNumber(arithSeq[i].term) + '</td>' +
      '<td>' + formatNumber(geomSeq[i].term) + '</td>';
    tbody.appendChild(tr);
  }

  renderLineChart(document.getElementById('cmpChartHolder'), {
    ariaLabel: 'Grafik perbandingan pola aritmetika dan geometri',
    forceLegend: true,
    series: [
      { name: 'Aritmetika (+' + formatNumber(c.d) + ')', color: '#235571', points: arithSeq.map(function (t) { return { x: t.index, y: t.term }; }) },
      { name: 'Geometri (×' + formatNumber(c.r) + ')', color: '#b1500a', dash: '6,4', points: geomSeq.map(function (t) { return { x: t.index, y: t.term }; }) }
    ]
  });

  document.getElementById('cmpChartNarrative').textContent =
    'Garis teal naik dengan jumlah tetap setiap langkah (aritmetika); garis oranye putus-putus berubah dengan faktor kali tetap (geometri).';

  const key = document.getElementById('cmpDiscussionKey');
  key.innerHTML =
    '<p>Pada pola aritmetika, setiap suku bertambah dengan jumlah yang <strong>sama</strong> yaitu beda (d) — pertambahannya tetap sehingga grafiknya berbentuk garis lurus.</p>' +
    '<p>Pada pola geometri, setiap suku diperoleh dengan <strong>mengalikan</strong> suku sebelumnya dengan rasio (r) yang sama — karena perkaliannya berulang, grafiknya melengkung (naik semakin curam jika r &gt; 1, atau melandai mendekati 0 jika 0 &lt; r &lt; 1).</p>';
}

/* ------------------------------------------------------------------------
   7c. STAGE: KONSTRUKSI POLA & FORMULA
   ------------------------------------------------------------------------ */

function renderBuildStage() {
  const a = appState.exploration.a;
  const r = appState.exploration.r;

  document.getElementById('buildAVal').textContent = formatNumber(a);
  document.getElementById('buildRVal').textContent = formatNumber(r);

  const stepsContainer = document.getElementById('buildSteps');
  stepsContainer.innerHTML = '';
  const revealed = appState.build.revealedCount;
  const maxSteps = 5;

  for (let i = 1; i <= Math.min(revealed, maxSteps); i++) {
    const term = calculateGeometricTerm(a, r, i);
    const div = document.createElement('div');
    div.className = 'build-step';
    if (i === 1) {
      div.textContent = 'U1 = a = ' + formatNumber(a);
    } else {
      div.textContent = 'U' + i + ' = U' + (i - 1) + ' × r = ' + formatNumber(calculateGeometricTerm(a, r, i - 1)) + ' × ' + formatNumber(r) + ' = a × r^' + (i - 1) + ' = ' + formatNumber(term);
    }
    stepsContainer.appendChild(div);
  }

  const revealBtn = document.getElementById('buildRevealBtn');
  const formulaBlock = document.getElementById('formulaReveal');
  if (revealed >= maxSteps) {
    revealBtn.disabled = true;
    revealBtn.textContent = 'Semua langkah sudah ditampilkan';
    formulaBlock.hidden = false;
    renderWorkedExample(a, r);
  } else {
    revealBtn.disabled = false;
    revealBtn.textContent = 'Ungkap suku berikutnya';
    formulaBlock.hidden = true;
  }
}

function renderWorkedExample(a, r) {
  const n = 5;
  const term = calculateGeometricTerm(a, r, n);
  const sum = calculateGeometricSum(a, r, n);
  const el = document.getElementById('buildWorkedExample');
  let sumLine;
  if (r === 1) {
    sumLine = 'S5 = a × n = ' + formatNumber(a) + ' × 5 = ' + formatNumber(sum) + ' (karena r = 1)';
  } else {
    sumLine = 'S5 = a(r^5 − 1) / (r − 1) = ' + formatNumber(a) + '(' + formatNumber(Math.pow(r, 5)) + ' − 1) / (' + formatNumber(r) + ' − 1) = ' + formatNumber(sum);
  }
  el.textContent =
    'Contoh numerik dengan a = ' + formatNumber(a) + ' dan r = ' + formatNumber(r) + ':\n' +
    'U5 = a × r^(5−1) = ' + formatNumber(a) + ' × ' + formatNumber(r) + '^4 = ' + formatNumber(term) + '\n' +
    sumLine;
}

/* ------------------------------------------------------------------------
   7d. STAGE: SIMULASI PENYUSUTAN
   ------------------------------------------------------------------------ */

function readSimulationInputs() {
  const initial = validateNumericInput(document.getElementById('simInitial').value, {
    fieldLabel: 'Nilai awal aset', disallowZero: true, min: 0.01, max: 1e15
  });
  const percent = validateNumericInput(document.getElementById('simPercent').value, {
    fieldLabel: 'Persentase penyusutan', min: 0, max: 100
  });
  const periods = validateNumericInput(document.getElementById('simPeriods').value, {
    fieldLabel: 'Jumlah periode', integer: true, min: 1, max: 30
  });

  setFieldError('simInitial-error', initial.error);
  setFieldError('simPercent-error', percent.error);
  setFieldError('simPeriods-error', periods.error);
  toggleInputErrorClass('simInitial', !initial.valid);
  toggleInputErrorClass('simPercent', !percent.valid);
  toggleInputErrorClass('simPeriods', !periods.valid);

  if (initial.valid) appState.simulation.initial = initial.value;
  if (percent.valid) appState.simulation.percent = percent.value;
  if (periods.valid) appState.simulation.periods = periods.value;

  return initial.valid && percent.valid && periods.valid;
}

function readSimulationQuery() {
  const maxPeriod = appState.simulation.periods;
  const query = validateNumericInput(document.getElementById('simQueryPeriod').value, {
    fieldLabel: 'Periode yang dicek', integer: true, min: 0, max: Math.max(maxPeriod, 30)
  });
  setFieldError('simQueryPeriod-error', query.error);
  toggleInputErrorClass('simQueryPeriod', !query.valid);
  if (query.valid) appState.simulation.queryPeriod = query.value;
  return query.valid;
}

function renderSimulationStage() {
  const ok = readSimulationInputs();
  if (!ok) return;

  const s = appState.simulation;
  const ratio = calculateDepreciationRatio(s.percent);

  document.getElementById('simRatioConversion').textContent =
    'Rasio penyusutan: r = 1 − ' + s.percent + '/100 = ' + formatNumber(ratio) +
    ' (bukan ' + formatNumber(s.percent / 100) + ' — persentase penyusutan harus diubah menjadi faktor sisa nilai terlebih dahulu).';

  const rows = [];
  for (let t = 0; t <= s.periods; t++) {
    rows.push({ period: t, value: calculateAssetValue(s.initial, ratio, t) });
  }

  const tbody = document.querySelector('#simTable tbody');
  tbody.innerHTML = '';
  rows.forEach(function (row) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + row.period + '</td><td>' + formatRupiah(row.value) + '</td>';
    tbody.appendChild(tr);
  });

  renderLineChart(document.getElementById('simChartHolder'), {
    ariaLabel: 'Grafik penyusutan nilai aset',
    series: [{ name: 'Nilai aset', color: '#b1500a', points: rows.map(function (row) { return { x: row.period, y: row.value }; }) }]
  });

  const lastRow = rows[rows.length - 1];
  document.getElementById('simChartNarrative').textContent =
    'Nilai aset dimulai dari ' + formatRupiah(s.initial) + ' pada periode 0 dan menyusut menjadi ' + formatRupiah(lastRow.value) + ' pada periode ' + lastRow.period + '.';

  const queryOk = readSimulationQuery();
  const queryResultEl = document.getElementById('simQueryResult');
  if (queryOk) {
    const value = calculateAssetValue(s.initial, ratio, appState.simulation.queryPeriod);
    queryResultEl.textContent = 'Nilai aset pada periode ke-' + appState.simulation.queryPeriod + ' = ' + formatRupiah(s.initial) + ' × ' + formatNumber(ratio) + '^' + appState.simulation.queryPeriod + ' = ' + formatRupiah(value);
  } else {
    queryResultEl.textContent = '';
  }

  const key = document.getElementById('simDiscussionKey');
  key.innerHTML =
    '<p>Persentase penyusutan menyatakan <strong>seberapa besar nilai yang hilang</strong> tiap periode, sedangkan rasio (r) menyatakan <strong>seberapa besar nilai yang tersisa</strong>. Keduanya berbeda: jika langsung memakai persentase sebagai r, hasilnya akan jauh meleset.</p>' +
    '<p>Semakin besar persentase penyusutan, semakin kecil rasio r, sehingga grafik menyusut semakin tajam menuju 0.</p>' +
    '<p>Nilai aset akan semakin mendekati 0 tetapi (secara matematis, jika r &gt; 0) tidak pernah benar-benar mencapai 0 dalam jumlah periode berapa pun, karena setiap perkalian dengan r &gt; 0 tetap menghasilkan bilangan positif.</p>';
}

/* ------------------------------------------------------------------------
   8. FORMATIVE EXERCISES
   ------------------------------------------------------------------------ */

const EXERCISES = [
  {
    id: 'ex1', category: 'rasio', categoryLabel: 'Menentukan rasio', type: 'numeric',
    prompt: 'Diketahui barisan geometri: 3, 6, 12, 24, ...\nTentukan rasio (r) barisan tersebut.',
    hint: 'Rasio diperoleh dengan membagi sebuah suku dengan suku sebelumnya.',
    correctAnswer: 2, tolerance: { rel: 0.01, abs: 0.001 },
    commonMistakes: [
      { value: 3, feedback: 'Nilai 3 adalah selisih (beda) antar suku, bukan rasio. Rasio diperoleh dari pembagian, misalnya 6 ÷ 3.' },
      { value: 0.5, feedback: 'Sepertinya pembagiannya terbalik. Bagi suku yang lebih belakang dengan suku sebelumnya, misalnya 6 ÷ 3, bukan 3 ÷ 6.' }
    ],
    wrongFeedbackDefault: 'Rasio belum tepat. Coba bagi salah satu suku dengan suku tepat sebelumnya, misalnya 6 ÷ 3 atau 12 ÷ 6.',
    correctFeedback: 'Tepat. Rasio r = 2, karena setiap suku diperoleh dari suku sebelumnya dikalikan 2.'
  },
  {
    id: 'ex2', category: 'suku-ke-n', categoryLabel: 'Menentukan suku ke-n', type: 'numeric',
    prompt: 'Diketahui barisan geometri dengan a = 5 dan r = 3.\nTentukan nilai suku ke-4 (U4).',
    hint: 'Gunakan Uₙ = a · r^(n−1).',
    correctAnswer: 135, tolerance: { rel: 0.01, abs: 0.5 },
    commonMistakes: [
      { value: 405, feedback: 'Sepertinya pangkatnya memakai n = 4, padahal seharusnya (n − 1) = 3. Ingat, U1 belum dikalikan sama sekali.' },
      { value: 27, feedback: 'Nilai 27 adalah r^3 saja tanpa dikalikan dengan a. Jangan lupa mengalikan hasil pangkat dengan nilai awal a.' }
    ],
    wrongFeedbackDefault: 'Belum tepat. Periksa kembali apakah pangkat pada r sudah (n − 1) dan sudah dikalikan dengan a.',
    correctFeedback: 'Benar. U4 = 5 × 3³ = 5 × 27 = 135.'
  },
  {
    id: 'ex3', category: 'identifikasi-geometri', categoryLabel: 'Mengidentifikasi pola geometri', type: 'choice',
    prompt: 'Perhatikan barisan: 2, 4, 8, 16, 32.\nApakah barisan ini merupakan barisan geometri?',
    choices: [
      {
        id: 'ya', text: 'Ya, karena setiap suku diperoleh dengan mengalikan suku sebelumnya dengan faktor tetap.', correct: true,
        feedback: 'Benar. Rasio antar suku selalu 2 (4÷2=2, 8÷4=2, dan seterusnya), sehingga ini barisan geometri.'
      },
      {
        id: 'tidak', text: 'Tidak, karena selisih antar suku tidak sama.', correct: false,
        feedback: 'Perhatikan lagi: pada barisan geometri kita memeriksa hasil BAGI antar suku, bukan selisihnya. Coba bagi 4÷2, 8÷4, dan 16÷8.'
      }
    ]
  },
  {
    id: 'ex3b', category: 'identifikasi-geometri', categoryLabel: 'Mengidentifikasi pola geometri', type: 'choice',
    prompt: 'Perhatikan barisan: 2, 4, 6, 8, 10.\nApakah barisan ini merupakan barisan geometri?',
    choices: [
      {
        id: 'ya', text: 'Ya, karena nilainya terus bertambah.', correct: false,
        feedback: 'Bertambah terus tidak selalu berarti geometri. Coba periksa hasil bagi antar suku: 4÷2=2, tetapi 6÷4=1,5 — hasil baginya tidak sama.'
      },
      {
        id: 'tidak', text: 'Tidak, karena hasil bagi antar suku tidak konstan — barisan ini aritmetika dengan beda 2.', correct: true,
        feedback: 'Tepat. Barisan ini bertambah dengan jumlah tetap (+2) setiap langkah, sehingga ini pola aritmetika, bukan geometri.'
      }
    ]
  },
  {
    id: 'ex4', category: 'jumlah-n-suku', categoryLabel: 'Menghitung jumlah n suku', type: 'numeric',
    prompt: 'Diketahui barisan geometri dengan a = 2 dan r = 3.\nHitung jumlah 5 suku pertama (S5).',
    hint: 'Gunakan Sₙ = a(rⁿ − 1) / (r − 1).',
    correctAnswer: 242, tolerance: { rel: 0.01, abs: 0.5 },
    commonMistakes: [
      { value: 162, feedback: 'Nilai 162 adalah suku ke-5 (U5), bukan jumlah 5 suku pertama (S5). Soal ini meminta hasil penjumlahan seluruh suku dari U1 sampai U5.' }
    ],
    wrongFeedbackDefault: 'Belum tepat. Pastikan menggunakan rumus jumlah Sₙ = a(rⁿ − 1)/(r − 1), bukan rumus suku ke-n.',
    correctFeedback: 'Benar. S5 = 2(3⁵ − 1)/(3 − 1) = 2 × 242/2 = 242.'
  },
  {
    id: 'ex5', category: 'konversi-penyusutan', categoryLabel: 'Konversi persentase penyusutan menjadi rasio', type: 'numeric',
    prompt: 'Sebuah mesin mengalami penyusutan 10% setiap tahun.\nBerapa rasio (r) yang tepat untuk memodelkan penyusutan ini?',
    hint: 'Gunakan r = 1 − persentase/100.',
    correctAnswer: 0.9, tolerance: { rel: 0.01, abs: 0.005 },
    commonMistakes: [
      { value: 0.1, feedback: '0,1 adalah bentuk desimal dari persentase penyusutannya, bukan rasionya. Rasio menyatakan bagian nilai yang TERSISA: r = 1 − 0,1 = 0,9.' },
      { value: 10, feedback: '10 adalah angka persentasenya secara langsung. Persentase penyusutan perlu diubah dulu menjadi faktor pengali: r = 1 − 10/100.' }
    ],
    wrongFeedbackDefault: 'Belum tepat. Ingat, rasio penyusutan dihitung dengan r = 1 − persentase/100.',
    correctFeedback: 'Benar. r = 1 − 10/100 = 0,9 — artinya setiap tahun nilai aset tersisa 90% dari tahun sebelumnya.'
  },
  {
    id: 'ex6', category: 'nilai-aset', categoryLabel: 'Menghitung nilai aset setelah beberapa periode', type: 'numeric',
    prompt: 'Sebuah mesin senilai Rp100.000.000 menyusut 10% per tahun.\nBerapa nilai mesin tersebut setelah 3 tahun (dalam Rupiah)?',
    hint: 'Ubah dulu persentase menjadi rasio, lalu gunakan nilai = nilai awal × r^periode.',
    correctAnswer: 72900000, tolerance: { rel: 0.01, abs: 100000 },
    commonMistakes: [
      { value: 100000, feedback: 'Hasil ini muncul jika rasio dianggap 0,1 (persentase penyusutan langsung, belum dikonversi). Ubah dulu: r = 1 − 10/100 = 0,9.' },
      { value: 81000000, feedback: 'Nilai ini setara dengan menghitung untuk 2 tahun, bukan 3 tahun. Periksa kembali pangkat pada r (harus sama dengan jumlah periode).' }
    ],
    wrongFeedbackDefault: 'Belum tepat. Pastikan rasio sudah dikonversi (r = 0,9) dan dipangkatkan dengan jumlah periode yang benar (3).',
    correctFeedback: 'Benar. Nilai = Rp100.000.000 × 0,9³ = Rp72.900.000.'
  },
  {
    id: 'ex7', category: 'membaca-grafik', categoryLabel: 'Membaca tabel/grafik geometri', type: 'choice',
    prompt: 'Pada grafik pertumbuhan geometri dengan rasio r > 1, bentuk kurva yang akan muncul adalah...',
    choices: [
      {
        id: 'garis-lurus', text: 'Garis lurus naik dengan kemiringan tetap.', correct: false,
        feedback: 'Garis lurus adalah ciri pola ARITMETIKA (bertambah tetap), bukan geometri.'
      },
      {
        id: 'melengkung-naik', text: 'Kurva yang naik semakin curam seiring bertambahnya n.', correct: true,
        feedback: 'Tepat. Karena setiap suku dikalikan r > 1, pertambahannya semakin besar sehingga kurva melengkung semakin curam — inilah ciri khas pertumbuhan berlipat.'
      },
      {
        id: 'mendatar', text: 'Garis mendatar (nilainya tidak berubah).', correct: false,
        feedback: 'Garis mendatar hanya terjadi jika r = 1 (tidak ada pertumbuhan). Di sini r > 1, jadi nilainya terus naik.'
      }
    ]
  },
  {
    id: 'ex8', category: 'soal-cerita', categoryLabel: 'Menyelesaikan soal cerita geometri', type: 'numeric',
    prompt: 'Sejenis bakteri membelah menjadi 2 kali lipat setiap 1 jam. Mula-mula ada 5 bakteri.\nBerapa banyak bakteri setelah 4 kali pembelahan?',
    hint: 'Kondisi awal (5 bakteri) dihitung sebagai U1, sebelum pembelahan mana pun terjadi.',
    correctAnswer: 80, tolerance: { rel: 0.01, abs: 0.5 },
    commonMistakes: [
      { value: 40, feedback: 'Hasil ini didapat jika memakai pangkat 3, bukan 4. Ingat, kondisi awal (5 bakteri, belum ada pembelahan) adalah U1, sehingga setelah 4 kali pembelahan itu adalah U5 = 5 × 2⁴.' }
    ],
    wrongFeedbackDefault: 'Belum tepat. Kondisi awal adalah U1 (belum ada pembelahan). Setelah k kali pembelahan, banyaknya bakteri = 5 × 2^k.',
    correctFeedback: 'Benar. Setelah 4 kali pembelahan: 5 × 2⁴ = 5 × 16 = 80 bakteri.'
  }
];

function getExerciseState(id) {
  if (!appState.exercises[id]) {
    appState.exercises[id] = { attempts: 0, firstAttemptCorrect: null, solved: false };
  }
  return appState.exercises[id];
}

function checkNumericExercise(exercise, rawValue) {
  if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
    return { status: 'empty', message: 'Jawaban belum diisi. Silakan masukkan angka terlebih dahulu.' };
  }
  const validation = validateNumericInput(rawValue, { fieldLabel: 'Jawaban' });
  if (!validation.valid) {
    return { status: 'invalid', message: validation.error };
  }
  const value = validation.value;
  const tol = exercise.tolerance || { rel: 0.01, abs: 0.01 };

  if (isCloseEnough(value, exercise.correctAnswer, tol.rel, tol.abs)) {
    const rounded = Math.abs(value - exercise.correctAnswer) > 1e-9;
    const suffix = rounded ? ' (perbedaan kecil karena pembulatan masih dapat diterima.)' : '';
    return { status: 'correct', message: exercise.correctFeedback + suffix };
  }

  if (exercise.commonMistakes) {
    for (let i = 0; i < exercise.commonMistakes.length; i++) {
      const mistake = exercise.commonMistakes[i];
      if (isCloseEnough(value, mistake.value, 0.02, 0.5)) {
        return { status: 'incorrect', message: mistake.feedback };
      }
    }
  }

  return { status: 'incorrect', message: exercise.wrongFeedbackDefault };
}

function checkChoiceExercise(exercise, selectedId) {
  if (!selectedId) {
    return { status: 'empty', message: 'Pilih salah satu jawaban terlebih dahulu.' };
  }
  const choice = exercise.choices.filter(function (c) { return c.id === selectedId; })[0];
  if (!choice) return { status: 'empty', message: 'Pilihan tidak dikenali.' };
  return { status: choice.correct ? 'correct' : 'incorrect', message: choice.feedback };
}

function renderExercisesStage() {
  const list = document.getElementById('exerciseList');
  list.innerHTML = '';

  EXERCISES.forEach(function (exercise) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.id = 'card-' + exercise.id;

    const meta = document.createElement('p');
    meta.className = 'exercise-card__meta';
    meta.textContent = exercise.categoryLabel;
    card.appendChild(meta);

    const prompt = document.createElement('p');
    prompt.className = 'exercise-card__prompt';
    prompt.textContent = exercise.prompt;
    card.appendChild(prompt);

    if (exercise.hint) {
      const hint = document.createElement('p');
      hint.className = 'exercise-card__hint';
      hint.textContent = 'Petunjuk: ' + exercise.hint;
      card.appendChild(hint);
    }

    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'exercise-feedback';
    feedbackEl.setAttribute('role', 'status');
    feedbackEl.id = 'feedback-' + exercise.id;

    if (exercise.type === 'numeric') {
      const row = document.createElement('div');
      row.className = 'exercise-card__answer-row';

      const label = document.createElement('label');
      label.setAttribute('for', 'answer-' + exercise.id);
      label.className = 'sr-only';
      label.textContent = 'Jawaban untuk ' + exercise.categoryLabel;
      card.appendChild(label);

      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'decimal';
      input.className = 'input-number';
      input.id = 'answer-' + exercise.id;

      const submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.className = 'btn btn--primary btn--small';
      submitBtn.textContent = 'Periksa jawaban';

      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.className = 'btn btn--ghost btn--small';
      retryBtn.textContent = 'Coba lagi';
      retryBtn.hidden = true;

      submitBtn.addEventListener('click', function () {
        const state = getExerciseState(exercise.id);
        const result = checkNumericExercise(exercise, input.value);
        if (result.status === 'empty' || result.status === 'invalid') {
          renderExerciseFeedback(feedbackEl, 'incorrect', result.message);
          return;
        }
        state.attempts += 1;
        if (state.firstAttemptCorrect === null) state.firstAttemptCorrect = (result.status === 'correct');
        if (result.status === 'correct') state.solved = true;
        renderExerciseFeedback(feedbackEl, result.status, result.message);
        card.classList.toggle('is-correct', result.status === 'correct');
        retryBtn.hidden = result.status === 'correct';
        updateExerciseProgress();
      });

      retryBtn.addEventListener('click', function () {
        input.value = '';
        feedbackEl.textContent = '';
        feedbackEl.className = 'exercise-feedback';
        input.focus();
      });

      row.appendChild(input);
      row.appendChild(submitBtn);
      row.appendChild(retryBtn);
      card.appendChild(row);
    } else if (exercise.type === 'choice') {
      const group = document.createElement('div');
      group.className = 'choice-group';
      group.setAttribute('role', 'radiogroup');

      exercise.choices.forEach(function (choice, idx) {
        const optionLabel = document.createElement('label');
        optionLabel.className = 'choice-option';
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'choice-' + exercise.id;
        radio.value = choice.id;
        radio.id = 'choice-' + exercise.id + '-' + idx;
        radio.addEventListener('change', function () {
          group.querySelectorAll('.choice-option').forEach(function (opt) { opt.classList.remove('is-selected'); });
          optionLabel.classList.add('is-selected');
        });
        optionLabel.appendChild(radio);
        optionLabel.appendChild(document.createTextNode(choice.text));
        group.appendChild(optionLabel);
      });
      card.appendChild(group);

      const submitBtn = document.createElement('button');
      submitBtn.type = 'button';
      submitBtn.className = 'btn btn--primary btn--small';
      submitBtn.textContent = 'Periksa jawaban';

      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.className = 'btn btn--ghost btn--small';
      retryBtn.textContent = 'Coba lagi';
      retryBtn.hidden = true;
      retryBtn.style.marginLeft = '8px';

      submitBtn.addEventListener('click', function () {
        const selected = group.querySelector('input[type="radio"]:checked');
        const state = getExerciseState(exercise.id);
        const result = checkChoiceExercise(exercise, selected ? selected.value : null);
        if (result.status === 'empty') {
          renderExerciseFeedback(feedbackEl, 'incorrect', result.message);
          return;
        }
        state.attempts += 1;
        if (state.firstAttemptCorrect === null) state.firstAttemptCorrect = (result.status === 'correct');
        if (result.status === 'correct') state.solved = true;
        renderExerciseFeedback(feedbackEl, result.status, result.message);
        card.classList.toggle('is-correct', result.status === 'correct');
        retryBtn.hidden = result.status === 'correct';
        updateExerciseProgress();
      });

      retryBtn.addEventListener('click', function () {
        group.querySelectorAll('input[type="radio"]').forEach(function (r) { r.checked = false; });
        group.querySelectorAll('.choice-option').forEach(function (opt) { opt.classList.remove('is-selected'); });
        feedbackEl.textContent = '';
        feedbackEl.className = 'exercise-feedback';
      });

      card.appendChild(submitBtn);
      card.appendChild(retryBtn);
    }

    card.appendChild(feedbackEl);
    list.appendChild(card);
  });

  updateExerciseProgress();
}

function renderExerciseFeedback(el, status, message) {
  el.className = 'exercise-feedback exercise-feedback--' + (status === 'correct' ? 'correct' : 'incorrect');
  const strong = document.createElement('strong');
  strong.textContent = status === 'correct' ? 'Tepat.' : 'Belum tepat.';
  el.innerHTML = '';
  el.appendChild(strong);
  el.appendChild(document.createTextNode(message));
}

function updateExerciseProgress() {
  const total = EXERCISES.length;
  let solvedCount = 0;
  let attemptsTotal = 0;
  EXERCISES.forEach(function (ex) {
    const st = appState.exercises[ex.id];
    if (st) {
      if (st.solved) solvedCount += 1;
      attemptsTotal += st.attempts;
    }
  });
  const el = document.getElementById('exerciseProgress');
  if (el) {
    el.textContent = solvedCount + ' dari ' + total + ' soal sudah dijawab benar · total percobaan: ' + attemptsTotal;
  }
}

/* ------------------------------------------------------------------------
   7e. STAGE: RINGKASAN
   ------------------------------------------------------------------------ */

function renderSummaryStage() {
  const total = EXERCISES.length;
  let solvedCount = 0;
  let attemptsTotal = 0;
  const conceptsToReview = [];
  const seenCategories = {};

  EXERCISES.forEach(function (ex) {
    const st = appState.exercises[ex.id];
    const attempted = !!st && st.attempts > 0;
    if (st && st.solved) solvedCount += 1;
    if (st) attemptsTotal += st.attempts;

    const needsReview = !attempted || st.firstAttemptCorrect === false;
    if (needsReview && !seenCategories[ex.category]) {
      seenCategories[ex.category] = true;
      conceptsToReview.push(ex.categoryLabel);
    }
  });

  const statsEl = document.getElementById('summaryStats');
  statsEl.innerHTML =
    '<div class="summary-stats">' +
    '<div class="summary-stat"><span class="summary-stat__value">' + solvedCount + '/' + total + '</span><span class="summary-stat__label">Latihan dijawab benar</span></div>' +
    '<div class="summary-stat"><span class="summary-stat__value">' + attemptsTotal + '</span><span class="summary-stat__label">Total percobaan</span></div>' +
    '</div>';

  const reviewPanel = document.createElement('div');
  if (conceptsToReview.length > 0) {
    reviewPanel.innerHTML =
      '<h3>Konsep yang perlu ditinjau kembali</h3><ul class="review-concepts">' +
      conceptsToReview.map(function (c) { return '<li>' + c + '</li>'; }).join('') +
      '</ul><h3>Saran aktivitas lanjutan</h3><p>Diskusikan konsep di atas bersama pasangan atau gurumu, lalu ulangi eksplorasi pada tahap terkait sebelum melanjutkan ke model spreadsheet.</p>';
  } else if (attemptsTotal > 0) {
    reviewPanel.innerHTML = '<h3>Konsep yang perlu ditinjau kembali</h3><p>Tidak ada — seluruh konsep sudah dijawab dengan benar pada percobaan pertama. Lanjutkan ke aktivitas spreadsheet untuk memperdalam pemahamanmu.</p>';
  } else {
    reviewPanel.innerHTML = '<h3>Konsep yang perlu ditinjau kembali</h3><p>Kamu belum mengerjakan latihan formatif. Kembali ke tahap Latihan untuk memeriksa pemahamanmu terlebih dahulu.</p>';
  }
  statsEl.appendChild(reviewPanel);
}

/* ------------------------------------------------------------------------
   9. EVENT WIRING / INIT
   ------------------------------------------------------------------------ */

function bindNumberSliderPair(numberId, sliderId, onChange) {
  const numberEl = document.getElementById(numberId);
  const sliderEl = document.getElementById(sliderId);
  if (!numberEl || !sliderEl) return;

  numberEl.addEventListener('input', function () {
    const num = Number(String(numberEl.value).replace(',', '.'));
    if (Number.isFinite(num)) {
      const min = Number(sliderEl.min);
      const max = Number(sliderEl.max);
      sliderEl.value = String(Math.min(max, Math.max(min, num)));
    }
    onChange();
  });

  sliderEl.addEventListener('input', function () {
    numberEl.value = sliderEl.value;
    onChange();
  });
}

function bindStageNavButtons() {
  document.querySelectorAll('.stage-nav__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      goToStage(btn.getAttribute('data-stage'));
    });
  });

  document.querySelectorAll('[data-go-next]').forEach(function (btn) {
    btn.addEventListener('click', goToNextStage);
  });
  document.querySelectorAll('[data-go-prev]').forEach(function (btn) {
    btn.addEventListener('click', goToPrevStage);
  });
}

function bindExplorationEvents() {
  ['expA', 'expR', 'expN'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', renderExplorationStage);
  });
  bindNumberSliderPair('expR', 'expRSlider', renderExplorationStage);
  bindNumberSliderPair('expN', 'expNSlider', renderExplorationStage);

  document.getElementById('expResetBtn').addEventListener('click', function () {
    appState.exploration = { a: 100, r: 2, n: 6 };
    document.getElementById('expA').value = 100;
    document.getElementById('expR').value = 2;
    document.getElementById('expN').value = 6;
    document.getElementById('expRSlider').value = 2;
    document.getElementById('expNSlider').value = 6;
    renderExplorationStage();
    showToast('Parameter eksplorasi dikembalikan ke contoh awal.');
  });
}

function bindComparisonEvents() {
  ['cmpA1', 'cmpD', 'cmpA2', 'cmpR', 'cmpN'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', renderComparisonStage);
  });
  bindNumberSliderPair('cmpN', 'cmpNSlider', renderComparisonStage);
}

function bindBuildEvents() {
  document.getElementById('buildRevealBtn').addEventListener('click', function () {
    appState.build.revealedCount = Math.min(5, appState.build.revealedCount + 1);
    renderBuildStage();
  });
  document.getElementById('buildRestartBtn').addEventListener('click', function () {
    appState.build.revealedCount = 1;
    renderBuildStage();
  });
}

function bindSimulationEvents() {
  ['simInitial', 'simPercent', 'simPeriods', 'simQueryPeriod'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', renderSimulationStage);
  });
  bindNumberSliderPair('simPeriods', 'simPeriodsSlider', renderSimulationStage);
}

function bindGlobalEvents() {
  document.getElementById('startBtn').addEventListener('click', goToNextStage);

  document.getElementById('resetAppBtn').addEventListener('click', function () {
    const confirmed = window.confirm('Reset seluruh aplikasi? Semua progres eksplorasi dan latihan pada sesi ini akan hilang.');
    if (!confirmed) return;
    resetEntireApp();
  });

  document.getElementById('restartAllBtn').addEventListener('click', function () {
    const confirmed = window.confirm('Mulai ulang dari awal? Semua progres pada sesi ini akan hilang.');
    if (!confirmed) return;
    resetEntireApp();
  });

  window.addEventListener('error', function (event) {
    console.error('Terjadi kesalahan yang tidak tertangani:', event.error || event.message);
    showToast('Terjadi kendala teknis kecil. Coba ulangi tindakan terakhirmu.', true);
  });
}

function resetEntireApp() {
  const fresh = cloneDefaultState();
  appState.currentStageIndex = fresh.currentStageIndex;
  appState.furthestUnlockedIndex = fresh.furthestUnlockedIndex;
  appState.exploration = fresh.exploration;
  appState.comparison = fresh.comparison;
  appState.build = fresh.build;
  appState.simulation = fresh.simulation;
  appState.exercises = fresh.exercises;

  document.getElementById('expA').value = appState.exploration.a;
  document.getElementById('expR').value = appState.exploration.r;
  document.getElementById('expN').value = appState.exploration.n;
  document.getElementById('expRSlider').value = appState.exploration.r;
  document.getElementById('expNSlider').value = appState.exploration.n;

  document.getElementById('cmpA1').value = appState.comparison.a1;
  document.getElementById('cmpD').value = appState.comparison.d;
  document.getElementById('cmpA2').value = appState.comparison.a2;
  document.getElementById('cmpR').value = appState.comparison.r;
  document.getElementById('cmpN').value = appState.comparison.n;
  document.getElementById('cmpNSlider').value = appState.comparison.n;

  document.getElementById('simInitial').value = appState.simulation.initial;
  document.getElementById('simPercent').value = appState.simulation.percent;
  document.getElementById('simPeriods').value = appState.simulation.periods;
  document.getElementById('simPeriodsSlider').value = appState.simulation.periods;
  document.getElementById('simQueryPeriod').value = appState.simulation.queryPeriod;

  document.getElementById('scratchpad').value = '';

  STAGE_ORDER.forEach(function (id) {
    document.getElementById('stage-' + id).hidden = (id !== 'orientasi');
  });
  updateStageNav();
  renderExplorationStage();
  renderComparisonStage();
  renderBuildStage();
  renderSimulationStage();
  renderExercisesStage();

  showToast('Aplikasi telah direset ke kondisi awal.');
}

function initApp() {
  bindStageNavButtons();
  bindGlobalEvents();
  bindExplorationEvents();
  bindComparisonEvents();
  bindBuildEvents();
  bindSimulationEvents();

  renderExplorationStage();
  renderComparisonStage();
  renderBuildStage();
  renderSimulationStage();
  renderExercisesStage();
  updateStageNav();
}

document.addEventListener('DOMContentLoaded', initApp);
