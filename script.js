// script.js – Handles mobile navigation toggle
// Beginner-friendly: just toggles a CSS class on/off

document.addEventListener('DOMContentLoaded', function () {
  // Grab the hamburger button and the nav menu
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');

  // When user clicks the hamburger, show/hide the mobile menu
  hamburger.addEventListener('click', function () {
    navMenu.classList.toggle('active');
  });

  // When user clicks any nav link, close the mobile menu (better UX)
  const navLinks = navMenu.querySelectorAll('.nav-link');
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navMenu.classList.remove('active');
    });
  });

  console.log('GradePath loaded successfully!');
});
