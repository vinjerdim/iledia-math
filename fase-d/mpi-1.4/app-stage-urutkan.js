'use strict';

/* ============================================================
   app-stage-urutkan.js — Stage: Urutkan
   Bagian dari app.js (lihat app.js untuk daftar berkas lengkap).
   ============================================================ */

/* ============================================================
   10. STAGE: URUTKAN
   ============================================================ */

var dragSrcId = null;

function getProductById(id) {
  return DATA.urutkan.products.find(function (p) {
    return p.id === id;
  });
}

function buildSortCardHTML(pid, rank, feedbackSet, checkedDone) {
  var p = getProductById(pid);
  if (!p) return '';

  var statusIcon = '';
  var cardCls = 'sort-card';
  if (checkedDone && feedbackSet) {
    if (feedbackSet.has(pid)) {
      cardCls += ' sort-card--correct';
      statusIcon = '<span style="color:var(--color-success-strong);font-size:1rem;">✓</span>';
    } else {
      cardCls += ' sort-card--incorrect';
      statusIcon = '<span style="color:var(--color-error-strong);font-size:1rem;">✗</span>';
    }
  }

  var sugarDisplay = '';
  if (p.sugar.type === 'fraction') {
    sugarDisplay = buildFracBlock(p.sugar.num, p.sugar.den, null, 'small');
  } else {
    sugarDisplay =
      '<span style="font-weight:700;color:var(--color-primary-strong);">' +
      formatDecShort(p.sugar.value) +
      '</span>';
  }

  return (
    '<div class="' +
    cardCls +
    '" draggable="' +
    (!checkedDone ? 'true' : 'false') +
    '" ' +
    'data-id="' +
    pid +
    '" id="sc-' +
    pid +
    '" ' +
    'aria-label="' +
    esc(p.name) +
    ', urutan ' +
    rank +
    '">' +
    '<span class="sort-card__handle" aria-hidden="true">⠿</span>' +
    '<span class="sort-card__rank">' +
    rank +
    '.</span>' +
    '<div class="sort-card__content">' +
    '<div class="sort-card__name">' +
    esc(p.name) +
    '</div>' +
    '<div class="sort-card__sugar">Gula: <strong>' +
    sugarDisplay +
    '</strong> sdm/sajian</div>' +
    '</div>' +
    '<div class="sort-card__move-btns" role="group" aria-label="Pindahkan ' +
    esc(p.name) +
    '">' +
    '<button type="button" class="sort-card__btn" data-move="up" data-id="' +
    pid +
    '" ' +
    'aria-label="Pindah ke atas" ' +
    (rank === 1 || checkedDone ? 'disabled' : '') +
    '>▲</button>' +
    '<button type="button" class="sort-card__btn" data-move="down" data-id="' +
    pid +
    '" ' +
    'aria-label="Pindah ke bawah" ' +
    (rank === State.urutkanOrder.length || checkedDone ? 'disabled' : '') +
    '>▼</button>' +
    '</div>' +
    statusIcon +
    '</div>'
  );
}

function renderUrutkan(container) {
  var correctOrder = DATA.urutkan.correctOrder;
  var checkedDone = State.urutkanDone;
  var feedbackSet =
    State.urutkanFeedback && State.urutkanFeedback.correctSet
      ? State.urutkanFeedback.correctSet
      : null;

  var correctCount = 0;
  if (checkedDone && feedbackSet) {
    correctCount = feedbackSet.size;
  }

  var sortCardsHTML = State.urutkanOrder
    .map(function (pid, i) {
      return buildSortCardHTML(pid, i + 1, feedbackSet, checkedDone);
    })
    .join('');

  var feedbackHTML = '';
  if (checkedDone && feedbackSet) {
    if (correctCount === correctOrder.length) {
      feedbackHTML = buildFeedbackBox(
        'success',
        '🎉',
        '<strong>Urutan benar!</strong> Kamu berhasil mengurutkan ' +
          correctOrder.length +
          ' produk dari kandungan gula terkecil ke terbesar.' +
          '<br>Kunci: konversikan semua ke desimal, lalu urutkan: <strong>0,25 &lt; 0,3 &lt; 0,35 &lt; 0,375 &lt; 0,45 &lt; 0,6</strong>'
      );
    } else {
      feedbackHTML = buildFeedbackBox(
        'warning',
        '⚠️',
        '<strong>' +
          correctCount +
          ' dari ' +
          correctOrder.length +
          ' posisi sudah tepat.</strong><br>' +
          'Kartu yang disorot merah perlu dipindahkan. ' +
          esc(DATA.urutkan.checkHint) +
          '<br><details style="margin-top:var(--space-2);"><summary style="cursor:pointer;font-size:0.85rem;color:var(--color-warning-strong);font-weight:600;">💡 Lihat nilai desimal semua produk</summary>' +
          '<div style="margin-top:var(--space-2);font-size:0.85rem;">' +
          DATA.urutkan.products
            .map(function (p) {
              var disp =
                p.sugar.type === 'fraction'
                  ? p.sugar.num + '/' + p.sugar.den
                  : formatDecShort(p.sugar.value);
              return (
                '<div>' +
                esc(p.name) +
                ': ' +
                esc(disp) +
                ' = <strong>' +
                formatDecShort(p.decimal) +
                '</strong></div>'
              );
            })
            .join('') +
          '</div></details>'
      );
    }
  }

  container.innerHTML =
    '<section aria-label="Mengurutkan Produk">' +
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">TAHAP 5 — MENGURUTKAN</span>' +
    '<p class="stage-head__goal">Tujuan: Mengurutkan bilangan rasional dalam representasi campuran dari terkecil ke terbesar.</p>' +
    '</div>' +
    '<div class="panel">' +
    '<h3>' +
    esc(DATA.urutkan.title) +
    '</h3>' +
    '<p style="font-size:0.88rem;color:var(--color-ink-muted);">' +
    esc(DATA.urutkan.context) +
    '</p>' +
    '<div class="feedback-box feedback-box--info" style="margin-bottom:var(--space-4);">' +
    '<span class="feedback-box__icon">ℹ️</span>' +
    '<div class="feedback-box__body"><strong>' +
    esc(DATA.urutkan.instruction) +
    '</strong><br>' +
    '<span style="font-size:0.82rem;">Gunakan tombol ▲▼ untuk menggeser kartu, atau seret (drag) pada perangkat desktop.</span>' +
    '</div></div>' +
    (State.urutkanAttempts > 0 && !checkedDone
      ? '<p style="font-size:0.85rem;color:var(--color-ink-muted);">Percobaan ke-' +
        State.urutkanAttempts +
        '</p>'
      : '') +
    '<div class="sort-list" id="sortList">' +
    sortCardsHTML +
    '</div>' +
    feedbackHTML +
    '<div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">' +
    '<button type="button" class="btn btn--ghost" id="resetUrutkanBtn">↩ Reset Urutan</button>' +
    '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">' +
    (!checkedDone
      ? '<button type="button" class="btn btn--primary" id="checkUrutkanBtn">Periksa Urutan</button>'
      : correctCount === correctOrder.length
      ? '<button type="button" class="btn btn--primary" id="nextFromUrutkanBtn">Lanjut ke Tantangan →</button>'
      : '<button type="button" class="btn btn--outline-primary" id="retryUrutkanBtn">↩ Coba Lagi</button>' +
        '<button type="button" class="btn btn--primary" id="nextFromUrutkanBtn">Lanjut ke Tantangan →</button>') +
    '</div></div></div></section>';

  /* Init drag-and-drop */
  if (!checkedDone) {
    initSortDragDrop(container);
  }

  /* Move buttons */
  container.querySelectorAll('.sort-card__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var pid = btn.dataset.id;
      var direction = btn.dataset.move;
      var order = State.urutkanOrder;
      var fromIdx = order.indexOf(pid);
      var toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
      if (toIdx < 0 || toIdx >= order.length) return;
      var tmp = order[fromIdx];
      order[fromIdx] = order[toIdx];
      order[toIdx] = tmp;
      State.urutkanFeedback = null;
      State.urutkanDone = false;
      saveState();
      renderUrutkan(container);
    });
  });

  var checkBtn = document.getElementById('checkUrutkanBtn');
  if (checkBtn)
    checkBtn.addEventListener('click', function () {
      checkUrutkanOrder(container);
    });

  var resetBtn = document.getElementById('resetUrutkanBtn');
  if (resetBtn)
    resetBtn.addEventListener('click', function () {
      State.urutkanOrder = DATA.urutkan.initialOrder.slice();
      State.urutkanAttempts = 0;
      State.urutkanFeedback = null;
      State.urutkanDone = false;
      saveState();
      renderUrutkan(container);
    });

  var retryBtn2 = document.getElementById('retryUrutkanBtn');
  if (retryBtn2)
    retryBtn2.addEventListener('click', function () {
      State.urutkanFeedback = null;
      State.urutkanDone = false;
      saveState();
      renderUrutkan(container);
    });

  var nextBtn3 = document.getElementById('nextFromUrutkanBtn');
  if (nextBtn3)
    nextBtn3.addEventListener('click', function () {
      completeStage('urutkan');
      navigateTo('tantangan');
    });
}

function checkUrutkanOrder(container) {
  var order = State.urutkanOrder;
  var correct = DATA.urutkan.correctOrder;
  State.urutkanAttempts += 1;

  var correctSet = new Set();
  for (var i = 0; i < correct.length; i++) {
    if (order[i] === correct[i]) correctSet.add(order[i]);
  }

  State.urutkanFeedback = { correctSet: correctSet };
  State.urutkanDone = true;

  if (correctSet.size === correct.length) {
    completeStage('urutkan');
  }

  saveState();
  renderUrutkan(container);
}

function initSortDragDrop(container) {
  var listEl = document.getElementById('sortList');
  if (!listEl) return;

  listEl.querySelectorAll('[draggable="true"]').forEach(function (card) {
    card.addEventListener('dragstart', function (e) {
      dragSrcId = card.dataset.id;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', dragSrcId);
      card.classList.add('is-dragging');
    });

    card.addEventListener('dragend', function () {
      card.classList.remove('is-dragging');
      dragSrcId = null;
      listEl.querySelectorAll('.sort-card').forEach(function (c) {
        c.classList.remove('is-drag-over');
      });
    });

    card.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (dragSrcId && dragSrcId !== card.dataset.id) {
        card.classList.add('is-drag-over');
      }
    });

    card.addEventListener('dragleave', function () {
      card.classList.remove('is-drag-over');
    });

    card.addEventListener('drop', function (e) {
      e.preventDefault();
      card.classList.remove('is-drag-over');
      var targetId = card.dataset.id;
      if (!dragSrcId || dragSrcId === targetId) return;

      var order = State.urutkanOrder;
      var fromIdx = order.indexOf(dragSrcId);
      var toIdx = order.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return;

      order.splice(fromIdx, 1);
      order.splice(toIdx, 0, dragSrcId);

      State.urutkanFeedback = null;
      State.urutkanDone = false;
      saveState();
      renderUrutkan(container);
    });
  });

  /* Drop on list itself (between cards) */
  listEl.addEventListener('dragover', function (e) {
    e.preventDefault();
  });
  listEl.addEventListener('drop', function (e) {
    e.preventDefault();
  });
}
