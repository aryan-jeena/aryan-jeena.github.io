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
// ===================================================================
// === COMPREHENSIVE MENTAL MATH GAME ===
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize game launcher
    const launcher = document.getElementById('mathGameLauncher');
    const gameOverlay = document.getElementById('math-game');
    const closeBtn = document.getElementById('close-game');
    
    if (!launcher || !gameOverlay) return;
    
    // Launch game
    launcher.addEventListener('click', () => {
        gameOverlay.classList.add('active');
        switchTab('play');
    });
    
    // Close game
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            gameOverlay.classList.remove('active');
        });
    }
    
    // Tab System
    const tabs = document.querySelectorAll('.game-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            switchTab(targetTab);
        });
    });
    
    function switchTab(tabName) {
        // Update tab buttons
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Update panels
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(`${tabName}-panel`)?.classList.add('active');
    }
    
    // Game State
    let gameSettings = {
        mode: 'timed',
        difficulty: 'medium',
        rangeMin: 1,
        rangeMax: 100,
        operations: { add: true, subtract: true, multiply: true, divide: false },
        options: {
            allowNegative: false,
            allowDecimals: false,
            autoNext: false,
            showHints: false
        }
    };
    
    let gameState = {
        active: false,
        score: 0,
        streak: 0,
        bestStreak: 0,
        correct: 0,
        incorrect: 0,
        totalProblems: 0,
        problemHistory: [],
        timer: 60,
        lives: 3,
        currentProblem: null,
        currentAnswer: null,
        startTime: null,
        isPaused: false
    };
    
    // Advanced Settings Toggle
    document.getElementById('show-advanced')?.addEventListener('click', function() {
        const advanced = document.getElementById('advanced-settings');
        if (advanced.style.display === 'none') {
            advanced.style.display = 'block';
            this.innerHTML = '<i class="fas fa-sliders-h"></i> Hide Advanced Settings';
        } else {
            advanced.style.display = 'none';
            this.innerHTML = '<i class="fas fa-sliders-h"></i> Advanced Settings';
        }
    });
    
    // Preset Selection
    document.querySelectorAll('.quick-preset, .preset').forEach(preset => {
        preset.addEventListener('click', function() {
            document.querySelectorAll('.quick-preset, .preset').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            
            const presetName = this.dataset.preset;
            applyPreset(presetName);
        });
    });
    
    function applyPreset(preset) {
        const presets = {
            beginner: {
                difficulty: 'easy',
                rangeMin: 1,
                rangeMax: 20,
                operations: { add: true, subtract: true, multiply: false, divide: false }
            },
            intermediate: {
                difficulty: 'medium',
                rangeMin: 1,
                rangeMax: 50,
                operations: { add: true, subtract: true, multiply: true, divide: false }
            },
            advanced: {
                difficulty: 'hard',
                rangeMin: 1,
                rangeMax: 100,
                operations: { add: true, subtract: true, multiply: true, divide: true }
            }
        };
        
        if (presets[preset]) {
            gameSettings = { ...gameSettings, ...presets[preset] };
            updateUIFromSettings();
        }
    }
    
    function updateUIFromSettings() {
        // Update difficulty buttons
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === gameSettings.difficulty);
        });
        
        // Update operation checkboxes
        document.getElementById('op-add').checked = gameSettings.operations.add;
        document.getElementById('op-subtract').checked = gameSettings.operations.subtract;
        document.getElementById('op-multiply').checked = gameSettings.operations.multiply;
        document.getElementById('op-divide').checked = gameSettings.operations.divide;
    }
    
    // Mode Selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameSettings.mode = this.dataset.mode;
        });
    });
    
    // Difficulty Selection
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameSettings.difficulty = this.dataset.diff;
            const range = this.dataset.range.split('-');
            gameSettings.rangeMin = parseInt(range[0]);
            gameSettings.rangeMax = parseInt(range[1]);
        });
    });
    
    // Operation Checkboxes
    ['add', 'subtract', 'multiply', 'divide'].forEach(op => {
        document.getElementById(`op-${op}`)?.addEventListener('change', (e) => {
            gameSettings.operations[op] = e.target.checked;
        });
    });

    // Additional Options Checkboxes
    document.getElementById('allow-negative')?.addEventListener('change', (e) => {
        gameSettings.options.allowNegative = e.target.checked;
    });

    document.getElementById('allow-decimals')?.addEventListener('change', (e) => {
        gameSettings.options.allowDecimals = e.target.checked;
    });

    document.getElementById('auto-next')?.addEventListener('change', (e) => {
        gameSettings.options.autoNext = e.target.checked;
    });

    document.getElementById('show-hints')?.addEventListener('change', (e) => {
        gameSettings.options.showHints = e.target.checked;
    });

    // Start Game
    document.getElementById('start-game')?.addEventListener('click', startGame);
    document.getElementById('play-again')?.addEventListener('click', startGame);
    
    function startGame() {
        // Reset state
        gameState = {
            active: true,
            score: 0,
            streak: 0,
            bestStreak: 0,
            correct: 0,
            incorrect: 0,
            totalProblems: 0,
            problemHistory: [],
            timer: gameSettings.mode === 'timed' ? 60 : 999999,
            lives: 3,
            currentProblem: null,
            currentAnswer: null,
            startTime: Date.now(),
            isPaused: false
        };
        
        // Show game screen
        document.getElementById('quick-start').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('results-screen').style.display = 'none';
        
        // Setup UI for mode
        document.getElementById('timer-stat').style.display = gameSettings.mode === 'timed' ? 'block' : 'none';
        document.getElementById('progress-stat').style.display = gameSettings.mode === 'sprint' ? 'block' : 'none';
        document.getElementById('lives-stat').style.display = gameSettings.mode === 'survival' ? 'block' : 'none';
        
        // Start timer if timed mode
        if (gameSettings.mode === 'timed') {
            gameState.timerInterval = setInterval(updateTimer, 1000);
        }
        
        updateDisplay();
        generateProblem();
        
        document.getElementById('answer').focus();
    }
    
    function updateTimer() {
        gameState.timer--;
        document.getElementById('timer').textContent = gameState.timer;
        
        if (gameState.timer <= 0) {
            endGame();
        }
    }
    
    function generateProblem() {
        const ops = [];
        if (gameSettings.operations.add) ops.push('+');
        if (gameSettings.operations.subtract) ops.push('-');
        if (gameSettings.operations.multiply) ops.push('*');
        if (gameSettings.operations.divide) ops.push('/');
        
        if (ops.length === 0) {
            alert('Please select at least one operation!');
            return;
        }
        
        const op = ops[Math.floor(Math.random() * ops.length)];
        let num1, num2, answer;
        
        const min = gameSettings.rangeMin;
        const max = gameSettings.rangeMax;
        
        switch (op) {
            case '+':
                num1 = Math.floor(Math.random() * (max - min + 1)) + min;
                num2 = Math.floor(Math.random() * (max - min + 1)) + min;
                answer = num1 + num2;
                gameState.currentProblem = `${num1} + ${num2}`;
                break;
            case '-':
                num1 = Math.floor(Math.random() * (max - min + 1)) + min;
                if (gameSettings.options.allowNegative) {
                    num2 = Math.floor(Math.random() * (max - min + 1)) + min;
                } else {
                    num2 = Math.floor(Math.random() * num1) + 1;
                }
                answer = num1 - num2;
                gameState.currentProblem = `${num1} - ${num2}`;
                break;
            case '*':
                const multMax = Math.min(max, 20);
                num1 = Math.floor(Math.random() * multMax) + 1;
                num2 = Math.floor(Math.random() * multMax) + 1;
                answer = num1 * num2;
                gameState.currentProblem = `${num1} × ${num2}`;
                break;
            case '/':
                num2 = Math.floor(Math.random() * Math.min(max, 20)) + 1;
                answer = Math.floor(Math.random() * Math.min(max, 20)) + 1;
                num1 = num2 * answer;
                gameState.currentProblem = `${num1} ÷ ${num2}`;
                break;
        }
        
        gameState.currentAnswer = answer;
        gameState.problemStartTime = Date.now();

        document.getElementById('problem').textContent = gameState.currentProblem;
        document.getElementById('problem-number').textContent = gameState.totalProblems + 1;
        document.getElementById('answer').value = '';
        document.getElementById('feedback').textContent = '';
        document.getElementById('feedback').className = 'feedback';

        // Show hints if enabled
        const hintElement = document.getElementById('hint');
        if (gameSettings.options.showHints && hintElement) {
            let hint = '';
            const absAnswer = Math.abs(answer);
            if (absAnswer < 10) {
                hint = 'Hint: Single digit answer';
            } else if (absAnswer < 100) {
                hint = 'Hint: Double digit answer';
            } else {
                hint = 'Hint: Large number';
            }
            if (answer < 0) {
                hint += ' (negative)';
            }
            hintElement.textContent = hint;
            hintElement.style.display = 'block';
        } else if (hintElement) {
            hintElement.style.display = 'none';
        }
    }
    
    // Answer Input
    const answerInput = document.getElementById('answer');
    if (answerInput) {
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAnswer();
        });
    }
    
    function checkAnswer() {
        const userAnswer = parseInt(document.getElementById('answer').value);
        if (isNaN(userAnswer)) return;
        
        gameState.totalProblems++;
        const timeTaken = Date.now() - gameState.problemStartTime;
        const feedback = document.getElementById('feedback');
        
        const isCorrect = userAnswer === gameState.currentAnswer;
        
        // Record in history
        gameState.problemHistory.push({
            problem: gameState.currentProblem,
            userAnswer,
            correctAnswer: gameState.currentAnswer,
            correct: isCorrect,
            time: timeTaken
        });
        
        if (isCorrect) {
            gameState.correct++;
            gameState.streak++;
            gameState.bestStreak = Math.max(gameState.bestStreak, gameState.streak);
            
            const points = 10 + Math.max(0, 10 - Math.floor(timeTaken / 1000)) + Math.floor(gameState.streak / 5) * 5;
            gameState.score += points;
            
            feedback.textContent = '✓ Correct!';
            feedback.className = 'feedback correct';
            
            if (gameState.streak >= 5 && gameState.streak % 5 === 0) {
                showCombo();
            }

            if (gameSettings.options.autoNext) {
                setTimeout(() => {
                    if (gameSettings.mode === 'sprint' && gameState.totalProblems >= 20) {
                        endGame();
                    } else {
                        generateProblem();
                    }
                }, 800);
            } else {
                setTimeout(() => {
                    if (gameSettings.mode === 'sprint' && gameState.totalProblems >= 20) {
                        endGame();
                    } else {
                        generateProblem();
                    }
                }, 1500);
            }
        } else {
            gameState.incorrect++;
            gameState.streak = 0;
            
            feedback.textContent = `✗ ${gameState.currentAnswer}`;
            feedback.className = 'feedback incorrect';
            
            if (gameSettings.mode === 'survival') {
                gameState.lives--;
                updateLives();
                if (gameState.lives <= 0) {
                    setTimeout(endGame, 1000);
                    return;
                }
            }
            
            setTimeout(generateProblem, 1000);
        }
        
        updateDisplay();
    }
    
    function showCombo() {
        const combo = document.getElementById('combo');
        combo.textContent = `${gameState.streak}x COMBO!`;
        combo.classList.add('show');
        setTimeout(() => combo.classList.remove('show'), 1200);
    }
    
    function updateDisplay() {
        document.getElementById('score').textContent = gameState.score;
        document.getElementById('streak').textContent = gameState.streak + '🔥';
        document.getElementById('accuracy').textContent = gameState.totalProblems > 0 
            ? Math.round((gameState.correct / gameState.totalProblems) * 100) + '%' 
            : '100%';
        if (gameSettings.mode === 'sprint') {
            document.getElementById('progress').textContent = `${gameState.totalProblems}/20`;
        }
    }
    
    function updateLives() {
        const hearts = '❤️'.repeat(gameState.lives);
        document.getElementById('lives').textContent = hearts || '💀';
    }
    
    function endGame() {
        if (gameState.timerInterval) clearInterval(gameState.timerInterval);
        gameState.active = false;
        
        // Show results
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('results-screen').style.display = 'block';
        
        const totalTime = Date.now() - gameState.startTime;
        const avgSpeed = gameState.totalProblems > 0 ? (totalTime / gameState.totalProblems / 1000).toFixed(2) : 0;
        
        document.getElementById('final-score').textContent = gameState.score;
        document.getElementById('final-correct').textContent = gameState.correct;
        document.getElementById('final-streak').textContent = gameState.bestStreak;
        document.getElementById('final-accuracy').textContent = gameState.totalProblems > 0 
            ? Math.round((gameState.correct / gameState.totalProblems) * 100) + '%' 
            : '100%';
        document.getElementById('final-speed').textContent = avgSpeed + 's';
        
        // Save stats
        saveGameStats();
        
        // Check for achievements
        displayAchievements();
    }
    
    function displayAchievements() {
        const achievements = [];
        if (gameState.bestStreak >= 10) achievements.push('🔥 Hot Streak!');
        if (gameState.bestStreak >= 20) achievements.push('🔥🔥 On Fire!');
        if (gameState.correct >= 50) achievements.push('💯 Century!');
        if (gameState.totalProblems > 0 && gameState.correct / gameState.totalProblems >= 0.95) achievements.push('🎯 Perfect Aim!');
        if (gameState.score >= 500) achievements.push('⭐ High Scorer!');
        
        const achievementEl = document.getElementById('achievements');
        achievementEl.innerHTML = '';
        achievements.forEach(ach => {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge';
            badge.textContent = ach;
            achievementEl.appendChild(badge);
        });
    }
    
    function saveGameStats() {
        const stats = JSON.parse(localStorage.getItem('mathArenaStats') || '{}');
        
        stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
        stats.totalCorrect = (stats.totalCorrect || 0) + gameState.correct;
        stats.totalProblems = (stats.totalProblems || 0) + gameState.totalProblems;
        stats.highScore = Math.max(gameState.score, stats.highScore || 0);
        stats.bestStreak = Math.max(gameState.bestStreak, stats.bestStreak || 0);
        
        localStorage.setItem('mathArenaStats', JSON.stringify(stats));
        
        // Check for new high score
        if (gameState.score > (stats.previousHigh || 0)) {
            document.getElementById('new-record').style.display = 'block';
            stats.previousHigh = gameState.score;
        }
        
        updateStatsDisplay();
    }
    
    function updateStatsDisplay() {
        const stats = JSON.parse(localStorage.getItem('mathArenaStats') || '{}');
        
        document.getElementById('total-games').textContent = stats.gamesPlayed || 0;
        document.getElementById('total-correct').textContent = stats.totalCorrect || 0;
        document.getElementById('high-score').textContent = stats.highScore || 0;
        document.getElementById('best-streak-stat').textContent = stats.bestStreak || 0;
    }
    
    // Initialize stats on load
    updateStatsDisplay();
    
    // Pause and Quit buttons
    const pauseModal = document.getElementById('pause-modal');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtn = document.getElementById('restart-btn');
    const endGameBtn = document.getElementById('end-game-btn');

    pauseBtn?.addEventListener('click', () => {
        pauseModal.classList.add('active');
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.isPaused = true;
        }
    });

    resumeBtn?.addEventListener('click', () => {
        pauseModal.classList.remove('active');
        if (gameSettings.mode === 'timed' && gameState.isPaused) {
            gameState.timerInterval = setInterval(updateTimer, 1000);
            gameState.isPaused = false;
        }
        document.getElementById('answer')?.focus();
    });

    restartBtn?.addEventListener('click', () => {
        pauseModal.classList.remove('active');
        startGame();
    });

    endGameBtn?.addEventListener('click', () => {
        pauseModal.classList.remove('active');
        if (gameState.timerInterval) clearInterval(gameState.timerInterval);
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('quick-start').style.display = 'block';
    });

    document.getElementById('quit-btn')?.addEventListener('click', () => {
        pauseBtn.click(); // Open pause modal instead of confirm
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (pauseModal.classList.contains('active')) {
                resumeBtn.click();
            } else if (gameOverlay.classList.contains('active')) {
                gameOverlay.classList.remove('active');
            }
        }
    });
});
