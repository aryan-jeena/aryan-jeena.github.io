// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

function setDarkMode(isDark) {
    body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

    // Update chart colors if it exists
    if (window.programmingSkillsChart) {
        updateChartColors(window.programmingSkillsChart);
    }
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

        if (repos.length === 0) {
            reposContainer.innerHTML = '<p>No projects available on GitHub.</p>';
            return;
        }

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

// Programming Skills Chart
function createProgrammingSkillsChart() {
    const ctx = document.getElementById('programmingSkillsChart');
    if (!ctx) {
        console.error('Canvas element for programming skills chart not found.');
        return;
    }

    const context = ctx.getContext('2d');
    window.programmingSkillsChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: ['Python', 'Java', 'OCaml', 'HTML', 'CSS', 'JavaScript'],
            datasets: [{
                label: 'Skill Level',
                data: [90, 85, 70, 80, 75, 75],
                backgroundColor: 'rgba(74, 144, 226, 0.7)',
                borderColor: 'rgba(74, 144, 226, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    ticks: {
                        color: body.classList.contains('dark-mode') ? '#f4f4f4' : '#333'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + '%';
                        }
                    }
                }
            }
        }
    });
}

// Update chart colors dynamically for dark mode
function updateChartColors(chart) {
    const isDarkMode = body.classList.contains('dark-mode');
    const backgroundColor = isDarkMode ? 'rgba(243, 156, 18, 0.7)' : 'rgba(74, 144, 226, 0.7)';
    const borderColor = isDarkMode ? 'rgba(243, 156, 18, 1)' : 'rgba(74, 144, 226, 1)';

    chart.data.datasets[0].backgroundColor = backgroundColor;
    chart.data.datasets[0].borderColor = borderColor;
    chart.options.scales.y.ticks.color = isDarkMode ? '#f4f4f4' : '#333';
    chart.options.scales.x.ticks.color = isDarkMode ? '#f4f4f4' : '#333';
    chart.update();
}

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

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadGitHubRepos();
    createProgrammingSkillsChart();

    // Check dark mode on initial load
    if (body.classList.contains('dark-mode') && window.programmingSkillsChart) {
        updateChartColors(window.programmingSkillsChart);
    }
});
