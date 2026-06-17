// auth.js – Client-side validation for Login & Sign Up forms
// No backend — stores a dummy user in localStorage and redirects to dashboard.

document.addEventListener('DOMContentLoaded', function () {

  // ---------------------------------------------------------------
  // Helper: show error message below a field
  // ---------------------------------------------------------------
  function showError(id, message) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = message;
      el.style.display = 'block';
    }
  }

  // Helper: clear error message
  function clearError(id) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.style.display = 'none';
    }
  }

  // Helper: basic email format check
  function isValidEmail(email) {
    // Simple regex – checks for something@something.something
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ---------------------------------------------------------------
  // Show / Hide Password Toggle
  // ---------------------------------------------------------------
  var toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      // The <input> is the sibling right before the button
      var input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';   // change icon to "hide"
      } else {
        input.type = 'password';
        btn.textContent = '👁️';   // change icon to "show"
      }
    });
  });

  // ---------------------------------------------------------------
  // LOGIN FORM VALIDATION
  // ---------------------------------------------------------------
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();  // stop the page from reloading

      var emailField = document.getElementById('login-email');
      var passField = document.getElementById('login-password');
      var valid = true;

      // Clear previous errors
      clearError('login-email-error');
      clearError('login-password-error');

      // 1. Email / Roll Number must not be empty
      if (emailField.value.trim() === '') {
        showError('login-email-error', 'Please enter your email or roll number.');
        valid = false;
      }

      // 2. Password must not be empty
      if (passField.value.trim() === '') {
        showError('login-password-error', 'Please enter your password.');
        valid = false;
      }

      // If everything is valid → simulate login
      if (valid) {
        var inputVal = emailField.value.trim().toLowerCase();
        var existingUsers = JSON.parse(localStorage.getItem('gradepath_users') || '[]');
        var foundUser = null;
        for (var i = 0; i < existingUsers.length; i++) {
          var u = existingUsers[i];
          if ((u.email && u.email.toLowerCase() === inputVal) || (u.roll && u.roll.toLowerCase() === inputVal)) {
            foundUser = u;
            break;
          }
        }

        if (foundUser) {
          // Store actual user name so dashboard can greet them
          localStorage.setItem('gradepath_user', foundUser.name);
          window.location.href = 'dashboard.html';
        } else {
          showError('login-email-error', 'Account not found. Please check your credentials or sign up.');
        }
      }
    });
  }

  // ---------------------------------------------------------------
  // SIGN UP FORM VALIDATION
  // ---------------------------------------------------------------
  var signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameField = document.getElementById('signup-name');
      var emailField = document.getElementById('signup-email');
      var rollField = document.getElementById('signup-roll');
      var passField = document.getElementById('signup-password');
      var confirmField = document.getElementById('signup-confirm');
      var valid = true;

      // Clear previous errors
      clearError('signup-name-error');
      clearError('signup-email-error');
      clearError('signup-roll-error');
      clearError('signup-password-error');
      clearError('signup-confirm-error');

      // 1. Full Name – required
      if (nameField.value.trim() === '') {
        showError('signup-name-error', 'Full name is required.');
        valid = false;
      }

      // 2. Email – required + valid format
      if (emailField.value.trim() === '') {
        showError('signup-email-error', 'Email address is required.');
        valid = false;
      } else if (!isValidEmail(emailField.value.trim())) {
        showError('signup-email-error', 'Please enter a valid email (e.g. name@college.edu).');
        valid = false;
      } else {
        var existingUsers = JSON.parse(localStorage.getItem('gradepath_users') || '[]');
        var emailInput = emailField.value.trim().toLowerCase();
        var exists = existingUsers.some(function(u) { return u.email.toLowerCase() === emailInput; });
        if (exists) {
          showError('signup-email-error', 'An account with this email already exists.');
          valid = false;
        }
      }

      // 3. Roll Number – required
      if (rollField.value.trim() === '') {
        showError('signup-roll-error', 'Roll number is required.');
        valid = false;
      }

      // 4. Password – required + at least 8 characters
      if (passField.value === '') {
        showError('signup-password-error', 'Password is required.');
        valid = false;
      } else if (passField.value.length < 8) {
        showError('signup-password-error', 'Password must be at least 8 characters.');
        valid = false;
      }

      // 5. Confirm Password – must match
      if (confirmField.value === '') {
        showError('signup-confirm-error', 'Please confirm your password.');
        valid = false;
      } else if (confirmField.value !== passField.value) {
        showError('signup-confirm-error', 'Passwords do not match.');
        valid = false;
      }

      // If everything is valid → simulate account creation
      if (valid) {
        var existingUsers = JSON.parse(localStorage.getItem('gradepath_users') || '[]');
        existingUsers.push({
          name: nameField.value.trim(),
          email: emailField.value.trim(),
          roll: rollField.value.trim()
        });
        localStorage.setItem('gradepath_users', JSON.stringify(existingUsers));

        localStorage.setItem('gradepath_user', nameField.value.trim());
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      }
    });
  }

  console.log('GradePath auth script loaded.');
});
