// ============================================================
// predictor.js — Chitkara Grade Predictor Engine
// ============================================================

// Global State
let state = {
  year: null,
  subject: null
};

// Helper: Generate initials from a subject name
function getInitials(name) {
  const stopWords = ['and', 'of', 'using', 'for', 'the', 'in', 'on', 'at', 'to', 'a', 'an'];
  return name.split(/[\s-/]+/)
    .filter(word => !stopWords.includes(word.toLowerCase()))
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 3);
}

// ===================== View Management =====================
function showView(viewId) {
  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
}

function goBack(viewId) {
  showView(viewId);
}

// ===================== Year Selection =====================
function selectYear(year) {
  state.year = year;

  const gridContainer = document.getElementById('subject-grid-container');
  gridContainer.innerHTML = '';

  const subjects = courseData[year] || [];

  if (subjects.length === 0) {
    gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-light); padding: 2rem;">No subjects added for this year yet. You can add them in courseData.js.</p>`;
  } else {
    subjects.forEach(subject => {
      const card = document.createElement('div');
      card.className = 'subject-card';
      card.onclick = () => selectSubject(subject);

      const initials = getInitials(subject.name);
      card.innerHTML = `
        <div class="subject-card-star">☆</div>
        <div class="subject-initials-badge">${initials}</div>
        <div class="subject-info">
          <h3 class="subject-name">${subject.name}</h3>
          <p class="subject-action">Calculate Target Marks ➔</p>
        </div>
      `;
      gridContainer.appendChild(card);
    });
  }

  showView('view-subject');
}

// ===================== Subject Selection =====================
function selectSubject(subject) {
  state.subject = subject;

  // Update header
  document.getElementById('pred-subject-name').textContent = subject.name;

  // Update ST Weightage badge
  document.getElementById('st-weight-badge').textContent = `${subject.stWeight}%`;

  // ---- Render Extra Components (CE / FA) ----
  const extrasContainer = document.getElementById('extras-container');
  extrasContainer.innerHTML = '';

  if (subject.extras && subject.extras.length > 0) {
    const extrasHeading = document.createElement('label');
    extrasHeading.style.cssText = 'display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--color-text);';
    extrasHeading.textContent = 'Continuous Evaluations / Formative Assessments';
    extrasContainer.appendChild(extrasHeading);

    subject.extras.forEach(extra => {
      const group = document.createElement('div');
      group.className = 'extra-component-group';
      group.innerHTML = `
        <label>${extra.label} <span class="extra-weight-tag">${extra.weight}%</span></label>
        <div class="extra-input-pair">
          <input type="number" class="extra-obt" data-extra-id="${extra.id}" placeholder="Obt" min="0" step="0.5" />
          <span style="color: var(--color-text-light);">/</span>
          <input type="number" class="extra-max" data-extra-id="${extra.id}" placeholder="Max" min="1" value="25" />
        </div>
      `;
      extrasContainer.appendChild(group);

      // Attach live-calc listeners
      group.querySelector('.extra-obt').addEventListener('input', calculateRequiredMarks);
      group.querySelector('.extra-max').addEventListener('input', calculateRequiredMarks);
    });
  }

  // ---- Render first default ST row ----
  const stContainer = document.getElementById('st-list-container');
  stContainer.innerHTML = '';
  addSTRowToContainer(stContainer);

  // ---- Set default End Term Paper Max ----
  const etPaperMaxInput = document.getElementById('input-et-paper-max');
  etPaperMaxInput.value = 100;

  // ---- Clear output ----
  document.getElementById('req-et-score').textContent = '-- / 100';
  document.getElementById('req-et-score').style.color = '#ffffff';
  document.getElementById('calc-status').textContent = 'Enter your marks to calculate.';

  showView('view-predictor');
}

// ===================== Dynamic ST Row Management =====================

function addSTRowToContainer(container) {
  const rowCount = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'st-row';
  row.innerHTML = `
    <span class="st-row-label">ST ${rowCount}</span>
    <input type="number" placeholder="Obtained" class="st-row-input st-obt" min="0" step="0.5" />
    <input type="number" placeholder="Max" class="st-row-input st-max-val" min="1" value="30" />
    <button type="button" class="btn-remove-st" onclick="removeSTRow(this)">✕</button>
  `;
  container.appendChild(row);

  row.querySelector('.st-obt').addEventListener('input', calculateRequiredMarks);
  row.querySelector('.st-max-val').addEventListener('input', calculateRequiredMarks);
}

function addSTRow() {
  const container = document.getElementById('st-list-container');
  addSTRowToContainer(container);
  reIndexSTRows();
  calculateRequiredMarks();
}

function removeSTRow(btn) {
  const container = document.getElementById('st-list-container');
  if (container.children.length <= 1) {
    alert('At least one Sessional Test (ST) is required.');
    return;
  }
  btn.closest('.st-row').remove();
  reIndexSTRows();
  calculateRequiredMarks();
}

function reIndexSTRows() {
  const rows = document.querySelectorAll('#st-list-container .st-row');
  rows.forEach((row, i) => {
    row.querySelector('.st-row-label').textContent = `ST ${i + 1}`;
  });
}

// ===================== Calculation Logic =====================

// Chitkara University Grading Thresholds (minimum % to achieve grade)
const GRADE_THRESHOLDS = {
  'O':  80,
  'A+': 70,
  'A':  60,
  'B+': 55,
  'B':  50,
  'C':  45,
  'P':  40
};

function calculateRequiredMarks() {
  if (!state.subject) return;

  const subject = state.subject;
  const targetSelect = document.getElementById('select-target');
  const etPaperMaxInput = document.getElementById('input-et-paper-max');

  // ---- 1. Compute Extra Components (CE/FA) contribution ----
  let extrasWeightedTotal = 0;
  let extrasMaxWeight = 0;

  if (subject.extras && subject.extras.length > 0) {
    subject.extras.forEach(extra => {
      const obtInput = document.querySelector(`.extra-obt[data-extra-id="${extra.id}"]`);
      const maxInput = document.querySelector(`.extra-max[data-extra-id="${extra.id}"]`);

      if (obtInput && maxInput) {
        let obt = parseFloat(obtInput.value) || 0;
        let max = parseFloat(maxInput.value) || 1;

        // Clamp obtained to max
        if (obt > max) {
          obt = max;
          obtInput.value = max;
        }

        extrasWeightedTotal += (obt / max) * extra.weight;
        extrasMaxWeight += extra.weight;
      }
    });
  }

  // ---- 2. Compute Sessional Tests contribution ----
  const stRows = document.querySelectorAll('#st-list-container .st-row');
  let sumObtST = 0;
  let sumMaxST = 0;

  stRows.forEach(row => {
    let obt = parseFloat(row.querySelector('.st-obt').value) || 0;
    let max = parseFloat(row.querySelector('.st-max-val').value) || 30;

    if (obt > max) {
      obt = max;
      row.querySelector('.st-obt').value = max;
    }

    sumObtST += obt;
    sumMaxST += max;
  });

  let weightedST = 0;
  if (sumMaxST > 0) {
    weightedST = (sumObtST / sumMaxST) * subject.stWeight;
  }

  // ---- 3. Total internals (out of stWeight + extrasMaxWeight) ----
  const totalInternals = extrasWeightedTotal + weightedST;
  const totalInternalsMax = extrasMaxWeight + subject.stWeight;

  // ---- 4. Compute required End Term weighted marks ----
  const targetGrade = targetSelect.value;
  const targetMinTotal = GRADE_THRESHOLDS[targetGrade];
  const reqETWeight = targetMinTotal - totalInternals;

  // ---- 5. Scale to actual paper marks ----
  let etPaperMax = parseFloat(etPaperMaxInput.value);
  if (isNaN(etPaperMax) || etPaperMax <= 0) {
    etPaperMax = 100; // Fallback
  }

  const etWeight = subject.etWeight;
  const reqETPaper = (reqETWeight / etWeight) * etPaperMax;

  // ---- 6. Update Result Display ----
  const scoreDisplay = document.getElementById('req-et-score');
  const statusDisplay = document.getElementById('calc-status');

  const intSummary = `Weighted internals: <strong>${totalInternals.toFixed(1)} / ${totalInternalsMax}</strong>`;

  if (reqETWeight <= 0) {
    scoreDisplay.textContent = `0 / ${etPaperMax}`;
    scoreDisplay.style.color = '#ffffff';
    statusDisplay.innerHTML = `${intSummary}.<br>You already have enough marks for a <strong>${targetGrade}</strong>! 🎉`;
  } else if (reqETWeight > etWeight) {
    scoreDisplay.textContent = `Impossible`;
    scoreDisplay.style.color = '#ffccd5';
    statusDisplay.innerHTML = `${intSummary}.<br>Even a perfect End Term score won't reach <strong>${targetGrade}</strong>. Try a lower target grade.`;
  } else {
    const displayReq = Number.isInteger(reqETPaper) ? reqETPaper : reqETPaper.toFixed(1);
    scoreDisplay.textContent = `${displayReq} / ${etPaperMax}`;
    scoreDisplay.style.color = '#ffffff';
    statusDisplay.innerHTML = `${intSummary}.<br>You need at least <strong>${displayReq}</strong> out of ${etPaperMax} in the End Term to get a <strong>${targetGrade}</strong>.`;
  }
}

// ===================== Global Event Listeners =====================
document.addEventListener('DOMContentLoaded', () => {
  const selectTarget = document.getElementById('select-target');
  if (selectTarget) selectTarget.addEventListener('change', calculateRequiredMarks);

  const etPaperMaxInput = document.getElementById('input-et-paper-max');
  if (etPaperMaxInput) etPaperMaxInput.addEventListener('input', calculateRequiredMarks);
});
