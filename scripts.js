// === DARK MODE TOGGLE ===
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

function setDarkMode(isDark) {
  body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('darkMode', isDark);
  darkModeToggle.innerHTML = isDark 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
}

darkModeToggle.addEventListener('click', () => {
  setDarkMode(!body.classList.contains('dark-mode'));
});

if (localStorage.getItem('darkMode') === 'true') {
  setDarkMode(true);
} else if (localStorage.getItem('darkMode') === null) {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setDarkMode(true);
  }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (localStorage.getItem('darkMode') === null) {
    setDarkMode(e.matches);
  }
});

// === SECTION REVEAL ON LOAD ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('revealed');
  });
});

// === TYPEWRITER + SCRAMBLE AFTER EACH TITLE ===
document.addEventListener('DOMContentLoaded', () => {
  const introText = document.getElementById('intro-text');
  const normalPhrases = [
    "Computer Science & Mathematics @ UPenn",
    "Software Engineer",
    "AI/ML Enthusiast",
    "Quantitative Analyst"
  ];
  const soccerPhrase = "Soccer Player";
  const scrambleChars = "!<>-_\\/[]{}—=+*^?#________";
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 85;
  let afterNormalGlitch = false; 

  function randomChar() {
    return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
  }

  function typeEffect() {
    const currentPhrase = normalPhrases[phraseIndex];

    if (!afterNormalGlitch) {
      // Typing normal phrase
      if (!introText.classList.contains('glitch-typing')) {
        introText.classList.add('glitch-typing');
      }

      if (isDeleting) {
        introText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 30;
      } else {
        introText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 50;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Fully typed current phrase — now trigger scramble
        afterNormalGlitch = true;
        setTimeout(scrambleToSoccer, 1000);
        return;
      } else if (isDeleting && charIndex === 0) {
        // Finished deleting — move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % normalPhrases.length;
        typingSpeed = 300;
      }
    }

    setTimeout(typeEffect, typingSpeed);
  }

  function scrambleToSoccer() {
    let output = '';
    let queue = [];

    for (let i = 0; i < soccerPhrase.length; i++) {
      queue.push({ from: randomChar(), to: soccerPhrase[i] });
    }

    let frame = 0;

    function updateScramble() {
      output = '';
      let complete = 0;

      for (let i = 0; i < queue.length; i++) {
        if (frame > i * 2) {
          output += queue[i].to;
          complete++;
        } else {
          output += randomChar();
        }
      }

      introText.textContent = output;

      if (complete === queue.length) {
        setTimeout(() => {
          isDeleting = true;
          afterNormalGlitch = false;
          typeEffect(); // continue deleting
        }, 700); // Briefly show Soccer Player before deleting
      } else {
        frame++;
        requestAnimationFrame(updateScramble);
      }
    }

    updateScramble();
  }

  // Start typing
  typeEffect();
});

// === PARTICLES BACKGROUND ===
document.addEventListener('DOMContentLoaded', () => {
  const particleOptions = {
    background: { color: { value: "transparent" } },
    fullScreen: { enable: false },
    particles: {
      number: { value: 80 },
      color: { value: "#ffffff" },
      links: {
        enable: true,
        distance: 150,
        opacity: 0.7,
        width: 1,
        color: "#ffffff"
      },
      move: { enable: true, speed: 1 },
      size: {
        value: { min: 1.5, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 1.5,
          sync: false
        }
      },
      opacity: { value: { min: 0.7, max: 1 } }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse"
        },
        resize: true
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4
        }
      }
    }
  };
  

  function loadParticlesBasedOnTheme() {
    if (body.classList.contains('dark-mode')) {
      particleOptions.particles.color = { value: "#ffffff" };
      particleOptions.particles.links.color = "#ffffff";
    } else {
      particleOptions.particles.color = { value: "#3B82F6" };
      particleOptions.particles.links.color = "#3B82F6";
    }
    tsParticles.load("hero-bg", particleOptions);
  }

  loadParticlesBasedOnTheme();

  // Reload particles when theme changes
  darkModeToggle.addEventListener('click', () => {
    tsParticles.dom().forEach((p) => p.destroy()); // Clear existing
    loadParticlesBasedOnTheme();
  });
});

// === GITHUB PROJECTS LOADER ===
async function loadGitHubRepos() {
  try {
    const response = await fetch('https://api.github.com/users/aryan-jeena/repos');
    if (!response.ok) throw new Error('GitHub fetch failed');
    const repos = await response.json();
    const container = document.getElementById('github-repos');
    container.innerHTML = '';

    repos.forEach(repo => {
      const div = document.createElement('div');
      div.className = 'repo-item';
      div.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || 'No description available'}</p>
        <a href="${repo.html_url}" target="_blank" class="btn">View on GitHub</a>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    document.getElementById('github-repos').innerHTML = '<p>Error loading projects.</p>';
  }
}
document.addEventListener('DOMContentLoaded', loadGitHubRepos);

// === RADAR SKILLS CHART ===
document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('skillsChart')?.getContext('2d');
  if (!ctx) return;

  function updateChart() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const labelColor = isDarkMode ? '#ffffff' : '#3B82F6';

    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Python', 'Java', 'OCaml', 'HTML', 'CSS', 'JavaScript'],
        datasets: [{
          label: 'Proficiency',
          data: [90, 85, 80, 75, 75, 70],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgba(59, 130, 246, 0.8)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: { 
              display: false,
              stepSize: 20
            },
            grid: { 
              color: 'rgba(59, 130, 246, 0.1)',
            },
            angleLines: { 
              color: 'rgba(59, 130, 246, 0.1)',
            },
            pointLabels: { 
              color: labelColor,
              font: {
                size: 14,
                family: "'Space Grotesk', sans-serif",
                weight: '500'
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Initial chart creation
  updateChart();

  // Update chart when theme changes
  darkModeToggle.addEventListener('click', () => {
    // Destroy the old chart
    Chart.getChart(ctx.canvas)?.destroy();
    // Create new chart with updated colors
    updateChart();
  });
});

// === SMOOTH SCROLL NAVIGATION ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// === BACK TO TOP BUTTON ===
const backToTopButton = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTopButton.style.opacity = '1';
    backToTopButton.style.visibility = 'visible';
  } else {
    backToTopButton.style.opacity = '0';
    backToTopButton.style.visibility = 'hidden';
  }
});
backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// === SECTION ANIMATIONS ===
document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS with stricter settings
    AOS.init({
        duration: 1200,
        easing: 'ease-out',
        once: true,
        mirror: false,
        offset: 100, // Reduced offset
        anchorPlacement: 'center-bottom', // Changed to trigger later
        startEvent: 'load',
        disable: false,
        throttleDelay: 50,
        debounceDelay: 50,
        delay: 0 // Remove any default delay
    });
});

// Create a new Intersection Observer for sections
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('section-visible');
            sectionObserver.unobserve(entry.target); // Stop observing after animation
        }
    });
}, {
    threshold: 0.15, // Trigger when 15% of the section is visible
    rootMargin: '-50px 0px' // Small negative margin to delay trigger
});

// === SKILL BARS ANIMATION ===
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const skillBars = entry.target;
            skillBars.classList.add('animate');
            
            // Animate each skill level
            skillBars.querySelectorAll('.skill-level').forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width + '%';
                }, 300);
            });
            
            skillObserver.unobserve(skillBars);
        }
    });
}, {
    threshold: 0.15,
    rootMargin: '-50px 0px'
});

// Start observing elements
document.addEventListener('DOMContentLoaded', () => {
    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        sectionObserver.observe(section);
    });

    // Observe skill bars
    document.querySelectorAll('.skill-bars').forEach(skillBar => {
        skillObserver.observe(skillBar);
    });
});

// === SCROLLBAR VISIBILITY ===
let scrollTimer = null;

function showScrollbar() {
    document.body.classList.remove('hide-scrollbar');
    document.body.classList.add('show-scrollbar', 'scrollbar-transition');
}

function hideScrollbar() {
    document.body.classList.remove('show-scrollbar');
    document.body.classList.add('hide-scrollbar', 'scrollbar-transition');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Start with visible scrollbar
    showScrollbar();
    
    // Handle scroll events
    window.addEventListener('scroll', () => {
        showScrollbar();
        
        // Clear previous timer
        if (scrollTimer) clearTimeout(scrollTimer);
        
        // Set new timer to hide scrollbar
        scrollTimer = setTimeout(() => {
            hideScrollbar();
        }, 1500);
    });
    
    // Show on hover near right edge
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth - e.clientX <= 50) {
            showScrollbar();
        }
    });
});

// Add this to your existing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Subtle hover effect for experience items
    document.querySelectorAll('.experience-item, .education-item, .project-card').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px)';
            item.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.1)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
            item.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
        });
    });
});

// === PROJECT FILTERING ===
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card[data-category]');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter projects
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease-in';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});

// === GITHUB STATS ===
async function loadGitHubStats() {
    try {
        const response = await fetch('https://api.github.com/users/aryan-jeena');
        if (!response.ok) throw new Error('GitHub API fetch failed');
        const userData = await response.json();

        const reposResponse = await fetch('https://api.github.com/users/aryan-jeena/repos?per_page=100');
        const repos = await reposResponse.json();

        // Calculate total stars
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

        // Get unique languages
        const languages = new Set();
        repos.forEach(repo => {
            if (repo.language) languages.add(repo.language);
        });

        // Update stats
        document.getElementById('total-repos').textContent = userData.public_repos;
        document.getElementById('total-stars').textContent = totalStars;
        document.getElementById('languages-count').textContent = languages.size;

        // Estimate commits (this is a rough estimate based on repos)
        document.getElementById('total-commits').textContent = '500+';

        // Create language chart
        createLanguageChart(repos);

    } catch (err) {
        console.error('Error loading GitHub stats:', err);
    }
}

function createLanguageChart(repos) {
    const languageCounts = {};
    repos.forEach(repo => {
        if (repo.language) {
            languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
    });

    const sortedLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const ctx = document.getElementById('languagesChart')?.getContext('2d');
    if (!ctx) return;

    const isDarkMode = document.body.classList.contains('dark-mode');
    const labelColor = isDarkMode ? '#ffffff' : '#111827';

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedLanguages.map(([lang]) => lang),
            datasets: [{
                data: sortedLanguages.map(([, count]) => count),
                backgroundColor: [
                    '#3B82F6',
                    '#22D3EE',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                ],
                borderWidth: 2,
                borderColor: isDarkMode ? '#0F172A' : '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: labelColor,
                        font: {
                            family: "'Space Grotesk', sans-serif",
                            size: 12
                        },
                        padding: 15
                    }
                }
            }
        }
    });
}

// Update GitHub contribution graph for dark mode
function updateGitHubGraph() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const color = isDarkMode ? '60A5FA' : '3B82F6';
    const img = document.getElementById('github-contributions');
    if (img) {
        img.src = `https://ghchart.rshah.org/${color}/aryan-jeena`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadGitHubStats();
    updateGitHubGraph();

    // Update graph when theme changes
    darkModeToggle.addEventListener('click', () => {
        setTimeout(updateGitHubGraph, 100);
    });
});

// === INTERACTIVE TERMINAL ===
const terminalCommands = {
    help: () => {
        return `Available commands:
  <span style="color: #4EC9B0">help</span>      - Show this help message
  <span style="color: #4EC9B0">about</span>     - Learn more about me
  <span style="color: #4EC9B0">skills</span>    - Display my technical skills
  <span style="color: #4EC9B0">projects</span>  - View my projects
  <span style="color: #4EC9B0">experience</span>- Show my work experience
  <span style="color: #4EC9B0">education</span> - Display my education
  <span style="color: #4EC9B0">contact</span>   - Get my contact information
  <span style="color: #4EC9B0">resume</span>    - Download my resume
  <span style="color: #4EC9B0">clear</span>     - Clear the terminal
  <span style="color: #4EC9B0">whoami</span>    - Display current user
  <span style="color: #4EC9B0">date</span>      - Show current date and time`;
    },
    about: () => {
        return `<span style="color: #CE9178">Aryan Jeena</span>
Computer Science & Mathematics @ UPenn
Passionate about AI/ML, Quantitative Analysis, and Software Engineering

I thrive at the intersection of artificial intelligence and quantitative finance,
with hands-on experience in machine learning, data science, and full-stack development.`;
    },
    skills: () => {
        return `<span style="color: #4EC9B0">Programming Languages:</span>
  • Python, Java, OCaml, JavaScript, HTML/CSS

<span style="color: #4EC9B0">Technologies & Tools:</span>
  • TensorFlow, Pandas, NumPy
  • SQL, Tableau, Google Analytics
  • Git, VS Code, Jupyter

<span style="color: #4EC9B0">Areas of Expertise:</span>
  • Machine Learning & AI
  • Data Science & Analytics
  • Quantitative Analysis
  • Full-Stack Development`;
    },
    projects: () => {
        return `<span style="color: #CE9178">Featured Projects:</span>

1. <span style="color: #4EC9B0">AI-Powered Pathology Analysis</span>
   Developed ML models analyzing 100K+ pathology images
   Technologies: Python, TensorFlow, SQL

2. <span style="color: #4EC9B0">IvyRise College Consulting</span>
   Co-founded consulting service using AI/ML for college admissions
   Served 50+ students across Tri-State Area

Check out more projects on my GitHub: github.com/aryan-jeena`;
    },
    experience: () => {
        return `<span style="color: #CE9178">Work Experience:</span>

<span style="color: #4EC9B0">AI in Business Club - Proscia Project Lead</span> (Aug 2024 - Present)
  • Machine learning model evaluation for digital pathology
  • Analyzed 100K+ images, improved accuracy by 15%

<span style="color: #4EC9B0">MUSE - Innovation Committee Lead</span> (Aug 2024 - Present)
  • Strategic consulting for student startups
  • Helped secure $50K+ in early-stage funding

<span style="color: #4EC9B0">Yale Center for Clinical Investigation</span> (Jul 2023 - Sep 2023)
  • Research intern in clinical investigation
  • Enhanced patient engagement systems`;
    },
    education: () => {
        return `<span style="color: #CE9178">Education:</span>

<span style="color: #4EC9B0">University of Pennsylvania</span> (Expected May 2027)
  B.S.E in Computer Science and Mathematics
  Minor in Statistics
  Concentrations: AI and Statistics

<span style="color: #4EC9B0">Key Coursework:</span>
  • Mathematical Foundations of CS
  • Programming Languages and Techniques
  • Market and Social Systems on the Internet
  • Honors Multivariable Calculus`;
    },
    contact: () => {
        return `<span style="color: #CE9178">Contact Information:</span>

<span style="color: #4EC9B0">Email:</span> aryanj@sas.upenn.edu
<span style="color: #4EC9B0">Phone:</span> +1 (908) 636-5723
<span style="color: #4EC9B0">LinkedIn:</span> linkedin.com/in/aryan-jeena
<span style="color: #4EC9B0">GitHub:</span> github.com/aryan-jeena

Feel free to reach out for opportunities or collaborations!`;
    },
    resume: () => {
        return `<span style="color: #CE9178">Downloading resume...</span>
Resume will be available soon. Please check the contact section for the download button!`;
    },
    clear: () => 'CLEAR',
    whoami: () => 'visitor',
    date: () => new Date().toString()
};

document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');

    if (!terminalInput || !terminalBody) return;

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim().toLowerCase();

            // Add command to terminal
            const commandLine = document.createElement('div');
            commandLine.className = 'terminal-line';
            commandLine.innerHTML = `
                <span class="terminal-prompt">visitor@aryan-portfolio:~$</span>
                <span class="terminal-text">${terminalInput.value}</span>
            `;

            // Insert before input line
            const inputLine = terminalBody.querySelector('.terminal-input-line');
            terminalBody.insertBefore(commandLine, inputLine);

            // Process command
            if (command === 'clear') {
                // Clear all except welcome and input line
                const children = Array.from(terminalBody.children);
                children.forEach(child => {
                    if (!child.classList.contains('terminal-input-line')) {
                        child.remove();
                    }
                });
            } else if (terminalCommands[command]) {
                const output = terminalCommands[command]();
                const outputDiv = document.createElement('div');
                outputDiv.className = 'terminal-output';
                outputDiv.innerHTML = `<p>${output.replace(/\n/g, '</p><p>')}</p>`;
                terminalBody.insertBefore(outputDiv, inputLine);
            } else if (command) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'terminal-output';
                errorDiv.innerHTML = `<p style="color: #EF4444">Command not found: ${command}</p><p>Type 'help' for available commands.</p>`;
                terminalBody.insertBefore(errorDiv, inputLine);
            }

            // Clear input
            terminalInput.value = '';

            // Scroll to bottom
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });

    // Focus input when clicking terminal
    terminalBody.addEventListener('click', () => {
        terminalInput.focus();
    });
});

// === CONTACT FORM VALIDATION ===
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Basic validation
            if (!name || !email || !subject || !message) {
                alert('Please fill in all fields');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Simulate form submission
            alert(`Thank you for your message, ${name}! I'll get back to you soon.`);
            contactForm.reset();
        });
    }
});

// === RESUME DOWNLOAD ===
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('download-resume');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Resume download feature coming soon! For now, please contact me directly at aryanj@sas.upenn.edu');
            // In the future, this would trigger an actual PDF download
            // window.location.href = 'path/to/resume.pdf';
        });
    }
});

// === LOADING SCREEN ===
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
});

// === SCROLL PROGRESS INDICATOR ===
window.addEventListener('scroll', () => {
    const indicator = document.getElementById('scroll-indicator');
    if (indicator) {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        indicator.style.width = scrolled + '%';
    }
});

// === ANIMATE STAT CARDS ON SCROLL ===
const observeStats = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            setTimeout(() => {
                entry.target.classList.remove('animate');
            }, 500);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat-card').forEach(card => {
        observeStats.observe(card);
    });
});

// === ENHANCED GITHUB REPOS DISPLAY ===
async function loadGitHubRepos() {
    try {
        const response = await fetch('https://api.github.com/users/aryan-jeena/repos?sort=updated&per_page=6');
        if (!response.ok) throw new Error('GitHub fetch failed');
        const repos = await response.json();
        const container = document.getElementById('github-repos');
        container.innerHTML = '';

        repos.forEach(repo => {
            const div = document.createElement('div');
            div.className = 'repo-item';

            // Get primary language color
            const languageColor = repo.language ? getLanguageColor(repo.language) : '#888';

            div.innerHTML = `
                <h3><i class="fab fa-github"></i> ${repo.name}</h3>
                <p>${repo.description || 'No description available'}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <div style="display: flex; gap: 1rem; font-size: 0.9rem; opacity: 0.8;">
                        ${repo.language ? `<span><i class="fas fa-circle" style="color: ${languageColor}; font-size: 0.6rem;"></i> ${repo.language}</span>` : ''}
                        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                    </div>
                </div>
                <a href="${repo.html_url}" target="_blank" class="btn" style="margin-top: 1rem; display: inline-flex;">
                    <i class="fab fa-github"></i> View Repository
                </a>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        document.getElementById('github-repos').innerHTML = '<p>Error loading projects.</p>';
    }
}

function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'Python': '#3572A5',
        'Java': '#b07219',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'TypeScript': '#2b7489',
        'C++': '#f34b7d',
        'C': '#555555',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'Shell': '#89e051',
        'OCaml': '#3be133'
    };
    return colors[language] || '#888';
}

document.addEventListener('DOMContentLoaded', loadGitHubRepos);

// === KEYBOARD SHORTCUTS ===
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus terminal
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const terminal = document.getElementById('terminal');
        if (terminal) {
            terminal.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                document.getElementById('terminal-input')?.focus();
            }, 500);
        }
    }

    // Escape to clear terminal focus
    if (e.key === 'Escape') {
        document.getElementById('terminal-input')?.blur();
        // Also close soccer game if open
        const soccerGame = document.getElementById('soccer-game');
        if (soccerGame && soccerGame.classList.contains('active')) {
            soccerGame.classList.remove('active');
        }
    }
});

// ===================================================================
// === FUN FACTS CAROUSEL ===
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const facts = [
        { category: 'Running', icon: 'fa-running', text: 'Marathon PR: 3:10:67' },
        { category: 'Training', icon: 'fa-shoe-prints', text: 'Average Weekly Mileage: 11 miles' },
        { category: 'Soccer', icon: 'fa-futbol', text: 'Position: Center Attacking Midfielder' },
        { category: 'Soccer', icon: 'fa-trophy', text: '15 Years Playing Soccer' },
        { category: 'Achievement', icon: 'fa-medal', text: 'Won State Championships with Club' },
        { category: 'Fitness', icon: 'fa-dumbbell', text: 'Bench Press PR: 215 lbs' },
        { category: 'Music', icon: 'fa-music', text: 'Favorite Genre: Latin Hip-Hop' },
        { category: 'Coding', icon: 'fa-code', text: 'Favorite Language: Python' },
        { category: 'Projects', icon: 'fa-project-diagram', text: 'Favorite Project: Soccer Injury Betting' },
        { category: 'Study Fuel', icon: 'fa-mug-hot', text: 'Go-To Drink: Chocolate Milk' },
        { category: 'Soccer', icon: 'fa-hashtag', text: 'Jersey Number: 11' },
        { category: 'Food', icon: 'fa-utensils', text: 'Favorite Food: Chicken Over Rice' },
        { category: 'Travel', icon: 'fa-globe', text: 'Countries Visited: 18' }
    ];

    let currentFactIndex = 0;
    let autoRotateInterval;

    const factIcon = document.getElementById('fact-icon');
    const factCategory = document.getElementById('fact-category');
    const factText = document.getElementById('fact-text');
    const factDotsContainer = document.getElementById('fact-dots');
    const prevBtn = document.getElementById('prev-fact');
    const nextBtn = document.getElementById('next-fact');

    // Check if elements exist
    if (!factIcon || !factCategory || !factText || !factDotsContainer) {
        return; // Exit if fun facts section doesn't exist
    }

    // Create dots
    facts.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('fact-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => showFact(index));
        factDotsContainer.appendChild(dot);
    });

    function showFact(index) {
        // Add transition out animation
        factCategory.style.animation = 'none';
        factText.style.animation = 'none';

        setTimeout(() => {
            currentFactIndex = index;
            const fact = facts[currentFactIndex];

            // Update content
            factIcon.innerHTML = `<i class="fas ${fact.icon}"></i>`;
            factCategory.textContent = fact.category;
            factText.textContent = fact.text;

            // Restart animations
            factCategory.style.animation = 'fadeInUp 0.5s ease forwards';
            factText.style.animation = 'fadeInUp 0.5s ease 0.1s forwards';

            // Update dots
            document.querySelectorAll('.fact-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentFactIndex);
            });
        }, 100);

        resetAutoRotate();
    }

    function nextFact() {
        showFact((currentFactIndex + 1) % facts.length);
    }

    function prevFact() {
        showFact((currentFactIndex - 1 + facts.length) % facts.length);
    }

    function resetAutoRotate() {
        clearInterval(autoRotateInterval);
        autoRotateInterval = setInterval(nextFact, 6000); // Rotate every 6 seconds
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', prevFact);
    if (nextBtn) nextBtn.addEventListener('click', nextFact);

    // Start auto-rotate
    resetAutoRotate();

    // Pause on hover
    const factDisplay = document.querySelector('.fact-display');
    if (factDisplay) {
        factDisplay.addEventListener('mouseenter', () => clearInterval(autoRotateInterval));
        factDisplay.addEventListener('mouseleave', resetAutoRotate);
    }
});

// ===================================================================
// === EASTER EGG SOCCER GAME ===
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const soccerGame = document.getElementById('soccer-game');
    const closeBtn = document.getElementById('close-game');
    const soccerBall = document.getElementById('soccer-ball');
    const scoreDisplay = document.getElementById('game-score');

    if (!soccerGame || !soccerBall) return;

    let score = 0;
    let ballVelocityX = 0;
    let ballVelocityY = 0;
    let ballX = 380;
    let ballY = 230;

    // Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    // Alternative activation: Click bottom-right corner 3 times
    let cornerClicks = 0;
    let cornerClickTimer;

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === konamiCode[konamiIndex].toLowerCase()) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateGame();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    // Corner click activation
    document.addEventListener('click', (e) => {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Check if click is in bottom-right corner (last 50px)
        if (e.clientX > windowWidth - 50 && e.clientY > windowHeight - 50) {
            cornerClicks++;
            clearTimeout(cornerClickTimer);

            if (cornerClicks === 3) {
                activateGame();
                cornerClicks = 0;
            }

            cornerClickTimer = setTimeout(() => {
                cornerClicks = 0;
            }, 2000);
        }
    });

    function activateGame() {
        soccerGame.classList.add('active');
        resetBall();
        score = 0;
        updateScore();
    }

    function closeGame() {
        soccerGame.classList.remove('active');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeGame);
    }

    function resetBall() {
        ballX = 380;
        ballY = 230;
        ballVelocityX = 0;
        ballVelocityY = 0;
        updateBallPosition();
    }

    function updateBallPosition() {
        soccerBall.style.left = ballX + 'px';
        soccerBall.style.top = ballY + 'px';
    }

    function updateScore() {
        scoreDisplay.textContent = `Goals: ${score}`;
    }

    // Kick ball on click
    soccerBall.addEventListener('click', (e) => {
        e.stopPropagation();

        const container = document.querySelector('.soccer-game-container');
        const rect = container.getBoundingClientRect();
        const ballRect = soccerBall.getBoundingClientRect();

        const ballCenterX = ballRect.left + ballRect.width / 2;
        const ballCenterY = ballRect.top + ballRect.height / 2;

        const clickX = e.clientX;
        const clickY = e.clientY;

        // Calculate kick direction and power
        const angle = Math.atan2(ballCenterY - clickY, ballCenterX - clickX);
        const power = 15;

        ballVelocityX = Math.cos(angle) * power;
        ballVelocityY = Math.sin(angle) * power;
    });

    // Game physics loop
    function gameLoop() {
        if (!soccerGame.classList.contains('active')) return;

        const container = document.querySelector('.soccer-game-container');
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;

        // Update position
        ballX += ballVelocityX;
        ballY += ballVelocityY;

        // Apply friction
        ballVelocityX *= 0.98;
        ballVelocityY *= 0.98;

        // Stop if velocity is very small
        if (Math.abs(ballVelocityX) < 0.1) ballVelocityX = 0;
        if (Math.abs(ballVelocityY) < 0.1) ballVelocityY = 0;

        // Bounce off walls
        if (ballX < 0) {
            ballX = 0;
            ballVelocityX = -ballVelocityX * 0.7;
        }
        if (ballX > containerWidth - 40) {
            ballX = containerWidth - 40;
            ballVelocityX = -ballVelocityX * 0.7;
        }

        // Check for goals
        const goalLeft = (containerWidth / 2) - 75;
        const goalRight = (containerWidth / 2) + 75;

        // Top goal
        if (ballY < 80 && ballX > goalLeft && ballX < goalRight) {
            score++;
            updateScore();
            resetBall();
            celebrateGoal();
        }

        // Bottom goal
        if (ballY > containerHeight - 120 && ballX > goalLeft && ballX < goalRight) {
            score++;
            updateScore();
            resetBall();
            celebrateGoal();
        }

        // Bounce off top/bottom (if not in goal)
        if (ballY < 0) {
            ballY = 0;
            ballVelocityY = -ballVelocityY * 0.7;
        }
        if (ballY > containerHeight - 40) {
            ballY = containerHeight - 40;
            ballVelocityY = -ballVelocityY * 0.7;
        }

        updateBallPosition();
        requestAnimationFrame(gameLoop);
    }

    function celebrateGoal() {
        // Flash score
        scoreDisplay.style.transform = 'scale(1.5)';
        scoreDisplay.style.color = '#FFD700';
        setTimeout(() => {
            scoreDisplay.style.transform = 'scale(1)';
            scoreDisplay.style.color = 'white';
        }, 500);
    }

    // Start game loop
    setInterval(() => {
        if (soccerGame.classList.contains('active')) {
            gameLoop();
        }
    }, 16); // ~60 FPS
});
