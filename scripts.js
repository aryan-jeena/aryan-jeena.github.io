'use strict';

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

function setDarkMode(isDark) {
    body.classList.toggle('dark-mode', isDark);
    try {
        localStorage.setItem('darkMode', isDark);
    } catch (e) {
        console.error('Failed to save dark mode preference:', e);
    }
    darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

darkModeToggle.addEventListener('click', () => {
    setDarkMode(!body.classList.contains('dark-mode'));
});

// Check user's saved preference
if (localStorage.getItem('darkMode') === 'true') {
    setDarkMode(true);
} else if (localStorage.getItem('darkMode') === null) {
    // If no preference is set, use system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
    }
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
    }
});

// New function to reveal sections
function revealSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('revealed');
    });
}

// Call revealSections when the page loads
window.addEventListener('load', revealSections);

// Set intro text
document.addEventListener('DOMContentLoaded', function() {
    const introText = document.getElementById('intro-text');
    if (introText && !introText.textContent) {
        introText.textContent = "Welcome to my portfolio! I'm passionate about AI, healthcare, and technology.";
    }
});

// Back to Top button functionality
const backToTopButton = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

console.log('Script loaded and running');
