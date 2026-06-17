// Global State for the Chitkara Grade Predictor
let state = {
  year: null,
  subject: null
};

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
  
  // Transition to the subject selection view
  showView('view-subject');
  
  // (In the next step, we will load subjects based on the chosen year here)
}
