// Typewriter Effect
const typewriterElement = document.getElementById('intro-text');
const phrases = [
    "Computer Science @ UPenn",
    "AI & Healthcare Enthusiast",
    "Passionate Problem Solver",
    "Data Science Intern @ J&J",
    "Yale YCCI Research Intern"
];
let phraseIndex = 0;
let charIndex = 0;

function typeWriter() {
    if (charIndex < phrases[phraseIndex].length) {
        typewriterElement.innerHTML += phrases[phraseIndex].charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, 100);
    } else {
        setTimeout(eraseText, 2000);
    }
}

function eraseText() {
    if (charIndex > 0) {
        typewriterElement.innerHTML = phrases[phraseIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseText, 50);
    } else {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(typeWriter, 500);
    }
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

function setDarkMode(isDark) {
    body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

darkModeToggle.addEventListener('click', () => {
    setDarkMode(!body.classList.contains('dark-mode'));
});

// Check user's saved preference
if (localStorage.getItem('darkMode') === 'true') {
    setDarkMode(true);
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Back to Top Button
const backToTopButton = document.getElementById('backToTop');

function toggleBackToTopButton() {
    if (window.scrollY > 300) {
        backToTopButton.style.opacity = '1';
        backToTopButton.style.visibility = 'visible';
    } else {
        backToTopButton.style.opacity = '0';
        backToTopButton.style.visibility = 'hidden';
    }
}

window.addEventListener('scroll', toggleBackToTopButton);

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.section');

const revealOnScroll = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(revealOnScroll, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(element => {
    observer.observe(element);
});

// Initialize
window.addEventListener('load', () => {
    typeWriter();
    toggleBackToTopButton();
});

// Expandable sections (for mobile view)
const sectionHeadings = document.querySelectorAll('.section h2');

sectionHeadings.forEach(heading => {
    heading.addEventListener('click', () => {
        const section = heading.parentElement;
        section.classList.toggle('expanded');
    });
});
