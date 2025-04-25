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

// Initial theme check
if (localStorage.getItem('darkMode') === 'true') {
    setDarkMode(true);
} else if (localStorage.getItem('darkMode') === null) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
    }
}

// System theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches);
    }
});

// Reveal sections on scroll
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('revealed'));
});

// Typewriter effect for intro text
document.addEventListener('DOMContentLoaded', () => {
    const introText = document.getElementById('intro-text');
    const phrases = [
        "Computer Science & Mathematics @ UPenn",
        "Software Engineer",
        "AI/ML Enthusiast",
        "Quantitative Analyst"
    ];
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    
    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            introText.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50;
        } else {
            introText.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100;
        }

        if (!isDeleting && charIndex === currentPhrase.length) {
            isDeleting = true;
            typingSpeed = 1500;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500;
        }

        setTimeout(typeEffect, typingSpeed);
    }

    typeEffect();
});

// Load GitHub Repositories
async function loadGitHubRepos() {
    try {
        const response = await fetch('https://api.github.com/users/aryan-jeena/repos');
        if (!response.ok) throw new Error('Failed to fetch GitHub repositories');
        const repos = await response.json();
        const reposContainer = document.getElementById('github-repos');
        reposContainer.innerHTML = '';

        repos.forEach(repo => {
            const repoItem = document.createElement('div');
            repoItem.className = 'repo-item';
            repoItem.innerHTML = `
                <h3>${repo.name}</h3>
                <p>${repo.description || 'No description available'}</p>
                <a href="${repo.html_url}" target="_blank" class="btn">View on GitHub</a>
            `;
            reposContainer.appendChild(repoItem);
        });
    } catch (error) {
        console.error('Error loading GitHub repositories:', error);
        const reposContainer = document.getElementById('github-repos');
        reposContainer.innerHTML = '<p>Failed to load GitHub repositories. Please try again later.</p>';
    }
}
document.addEventListener('DOMContentLoaded', loadGitHubRepos);

// Radar Chart with dark mode fixes
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('skillsChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Python', 'Java', 'OCaml', 'HTML', 'CSS', 'JavaScript'],
            datasets: [{
                label: 'Proficiency',
                data: [90, 85, 80, 75, 75, 70],
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                borderColor: 'rgba(74, 144, 226, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.1)'
                    },
                    angleLines: {
                        color: 'rgba(255,255,255,0.2)'
                    },
                    pointLabels: {
                        color: 'white'
                    }
                }
            }
        }
    });
});

// Smooth scrolling for navbar links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Back to Top button
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
