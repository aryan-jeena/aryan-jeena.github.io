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

// Reveal sections on page load
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.add('revealed'));
});

// Load GitHub Repositories
async function loadGitHubRepos() {
    try {
        const response = await fetch('https://api.github.com/users/aryan-jeena/repos');
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub repositories');
        }
        const repos = await response.json();
        const reposContainer = document.getElementById('github-repos');
        reposContainer.innerHTML = ''; // Clear existing content

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

// Skill Visualization Chart
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('skillsChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Python', 'Java', 'OCaml', 'HTML', 'CSS', 'JavaScript'],
            datasets: [{
                label: 'Proficiency',
                data: [90, 85, 80, 75, 75, 70], // Adjust these values based on your proficiency levels
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                borderColor: 'rgba(74, 144, 226, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            }
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
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
