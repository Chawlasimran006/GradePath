// Global State for the Chitkara Grade Predictor
let state = {
  year: null,
  subject: null
};

// Helper function to generate premium initials for subjects
function getInitials(name) {
  const stopWords = ['and', 'of', 'using', 'for', 'the', 'in', 'on', 'at', 'to', 'a', 'an'];
  return name.split(/[\s-/]+/)
    .filter(word => !stopWords.includes(word.toLowerCase()))
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 3); // Max 3 letters
}

// --- View Management ---
function showView(viewId) {
  // Hide all views
  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.remove('active');
  });
  // Show target view
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }
}

function goBack(viewId) {
  showView(viewId);
}

// --- Interactions ---

// Called when a user clicks a Year card
function selectYear(year) {
  state.year = year;
  console.log("Selected Year: ", year);
  
  // Render subjects for this year
  const gridContainer = document.getElementById('subject-grid-container');
  gridContainer.innerHTML = ''; // Clear previous

  const subjects = courseData[year] || [];
  
  if (subjects.length === 0) {
    gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--color-text-light);">No subjects found for this year yet.</p>`;
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

  // Transition to the subject selection view
  showView('view-subject');
}

// Called when a user clicks a Subject card
function selectSubject(subject) {
  state.subject = subject;
  console.log("Selected Subject: ", subject);

  // Update UI headers
  document.getElementById('pred-subject-name').textContent = subject.name;
  
  // Set Sessional Test Weightage Badge
  document.getElementById('st-weight-badge').textContent = `${subject.criteria.stMax}%`;

  // Render FA input if it exists in criteria
  const faContainer = document.getElementById('fa-input-container');
  faContainer.innerHTML = '';
  if (subject.criteria.faMax > 0) {
    const faGroup = document.createElement('div');
    faGroup.className = 'form-group';
    faGroup.style.marginBottom = '1.5rem';
    faGroup.innerHTML = `
      <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: var(--color-text);">Formative Assessments (Max ${subject.criteria.faMax})</label>
      <input type="number" id="input-fa" placeholder="0" min="0" max="${subject.criteria.faMax}" step="0.5" class="form-input" style="width: 100%; border: 1px solid var(--color-border); border-radius: 8px; padding: 0.8rem; font-size: 1rem;" />
    `;
    faContainer.appendChild(faGroup);
    
    // Attach listener
    document.getElementById('input-fa').addEventListener('input', calculateRequiredMarks);
  }

  // Render first default Sessional Test Row
  const stContainer = document.getElementById('st-list-container');
  stContainer.innerHTML = '';
  
  // We append one ST row by default
  const defaultRow = document.createElement('div');
  defaultRow.className = 'st-row';
  defaultRow.innerHTML = `
    <span class="st-row-label">ST 1</span>
    <input type="number" placeholder="Obtained" class="st-row-input st-obt" min="0" step="0.5" />
    <input type="number" placeholder="Max" class="st-row-input st-max-val" min="1" value="30" />
    <button type="button" class="btn-remove-st" onclick="removeSTRow(this)">✕</button>
  `;
  stContainer.appendChild(defaultRow);

  // Attach listeners to default ST row inputs
  defaultRow.querySelector('.st-obt').addEventListener('input', calculateRequiredMarks);
  defaultRow.querySelector('.st-max-val').addEventListener('input', calculateRequiredMarks);

  // Set default End Term Paper Max
  const etPaperMaxInput = document.getElementById('input-et-paper-max');
  etPaperMaxInput.value = 100; // Default paper max is 100
  etPaperMaxInput.placeholder = subject.criteria.etMax;

  // Clear previous output display
  document.getElementById('req-et-score').textContent = `-- / 100`;
  document.getElementById('calc-status').textContent = `Enter your marks to calculate.`;

  // Transition to entry view
  showView('view-predictor');
}

// --- Dynamic ST Row Management ---

function addSTRow() {
  const container = document.getElementById('st-list-container');
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

  // Add event listeners to the new inputs for live calculation
  row.querySelector('.st-obt').addEventListener('input', calculateRequiredMarks);
  row.querySelector('.st-max-val').addEventListener('input', calculateRequiredMarks);

  // Re-index all rows to keep labels sequential
  reIndexSTRows();
  
  calculateRequiredMarks();
}

function removeSTRow(btn) {
  const container = document.getElementById('st-list-container');
  // Don't remove if it's the only row
  if (container.children.length <= 1) {
    alert("At least one Sessional Test (ST) field is required.");
    return;
  }

  const row = btn.closest('.st-row');
  row.remove();
  
  reIndexSTRows();
  calculateRequiredMarks();
}

function reIndexSTRows() {
  const container = document.getElementById('st-list-container');
  const rows = container.querySelectorAll('.st-row');
  rows.forEach((row, index) => {
    const label = row.querySelector('.st-row-label');
    if (label) {
      label.textContent = `ST ${index + 1}`;
    }
  });
}

// --- Calculation Logic ---

// Chitkara Grading thresholds (lower bounds)
const GRADE_THRESHOLDS = {
  'O': 80,
  'A+': 70,
  'A': 60,
  'B+': 55,
  'B': 50,
  'C': 45,
  'P': 40
};

function calculateRequiredMarks() {
  if (!state.subject) return;

  const faInput = document.getElementById('input-fa');
  const targetSelect = document.getElementById('select-target');
  const etPaperMaxInput = document.getElementById('input-et-paper-max');
  
  const faMax = state.subject.criteria.faMax;
  const stWeight = state.subject.criteria.stMax; // Sessional overall weight (e.g. 40)
  const etWeight = state.subject.criteria.etMax; // End Term overall weight (e.g. 60 or 50)

  // 1. Read FA obtained
  let faObt = 0;
  if (faInput) {
    faObt = parseFloat(faInput.value) || 0;
    if (faObt > faMax) {
      faObt = faMax;
      faInput.value = faMax;
    }
  }

  // 2. Read all ST rows and compute weighted sessional contribution
  const stRows = document.querySelectorAll('.st-row');
  let sumObtST = 0;
  let sumMaxST = 0;

  stRows.forEach(row => {
    const obtVal = parseFloat(row.querySelector('.st-obt').value) || 0;
    const maxVal = parseFloat(row.querySelector('.st-max-val').value) || 30; // default 30 if blank

    // Validate obtained <= max
    let correctedObt = obtVal;
    if (correctedObt > maxVal) {
      correctedObt = maxVal;
      row.querySelector('.st-obt').value = maxVal;
    }
    
    sumObtST += correctedObt;
    sumMaxST += maxVal;
  });

  // Calculate weighted sessional score
  let weightedST = 0;
  if (sumMaxST > 0) {
    weightedST = (sumObtST / sumMaxST) * stWeight;
  }

  // Total Internals
  const totalInternals = faObt + weightedST;

  // 3. Compute Required End Term Weight
  const targetGrade = targetSelect.value;
  const targetMinTotal = GRADE_THRESHOLDS[targetGrade];
  const reqETWeight = targetMinTotal - totalInternals;

  // Read End Term exam paper max marks
  let etPaperMax = parseFloat(etPaperMaxInput.value);
  if (isNaN(etPaperMax) || etPaperMax <= 0) {
    etPaperMax = etWeight; // Fallback to criteria default weight
  }

  // Scale the required weight to the actual paper size
  const reqETPaper = (reqETWeight / etWeight) * etPaperMax;

  const scoreDisplay = document.getElementById('req-et-score');
  const statusDisplay = document.getElementById('calc-status');

  if (reqETWeight <= 0) {
    scoreDisplay.textContent = `0 / ${etPaperMax}`;
    scoreDisplay.style.color = '#ffffff';
    statusDisplay.innerHTML = `Weighted internals: <strong>${totalInternals.toFixed(1)} / ${faMax + stWeight}</strong>.<br>You need <strong>0</strong> marks in the End Term to get an <strong>${targetGrade}</strong>! 🎉`;
  } else if (reqETWeight > etWeight) {
    scoreDisplay.textContent = `Impossible`;
    scoreDisplay.style.color = '#ffccd5';
    statusDisplay.innerHTML = `Weighted internals: <strong>${totalInternals.toFixed(1)} / ${faMax + stWeight}</strong>.<br>Even scoring a perfect ${etPaperMax}/${etPaperMax} in the End Term won't reach the <strong>${targetGrade}</strong> target. Try aiming for another grade.`;
  } else {
    // Round to 1 decimal place if needed
    const displayReq = Number.isInteger(reqETPaper) ? reqETPaper : reqETPaper.toFixed(1);
    scoreDisplay.textContent = `${displayReq} / ${etPaperMax}`;
    scoreDisplay.style.color = '#ffffff';
    statusDisplay.innerHTML = `Weighted internals: <strong>${totalInternals.toFixed(1)} / ${faMax + stWeight}</strong>.<br>You need to score at least <strong>${displayReq}</strong> out of ${etPaperMax} in your End Term Exam to get a <strong>${targetGrade}</strong>.`;
  }
}

// Attach Event Listeners for Calculation
document.addEventListener('DOMContentLoaded', () => {
  const selectTarget = document.getElementById('select-target');
  if (selectTarget) {
    selectTarget.addEventListener('change', calculateRequiredMarks);
  }

  const etPaperMaxInput = document.getElementById('input-et-paper-max');
  if (etPaperMaxInput) {
    etPaperMaxInput.addEventListener('input', calculateRequiredMarks);
  }
});
