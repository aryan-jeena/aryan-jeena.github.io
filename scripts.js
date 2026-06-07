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

// === TYPEWRITER SUBTITLE (clean role rotation) ===
document.addEventListener('DOMContentLoaded', () => {
  const introText = document.getElementById('intro-text');
  if (!introText) return;

  const phrases = [
    "Software Engineer",
    "AI / ML Engineer",
    "Quantitative Researcher",
    "Full-Stack Developer"
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function tick() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      introText.textContent = current.substring(0, charIndex - 1);
      charIndex--;
    } else {
      introText.textContent = current.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 35 : 70;

    if (!isDeleting && charIndex === current.length) {
      delay = 1600;           // pause on the fully-typed phrase
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(tick, delay);
  }

  tick();
});

// === HERO BACKGROUND: animated equity curve (quant-themed) ===
// A subtle, live "market" chart of mean-reverting random walks that scrolls
// left in real time. On-brand for a SWE/quant portfolio, lightweight, and
// fully respectful of prefers-reduced-motion.
document.addEventListener('DOMContentLoaded', () => {
  const host = document.getElementById('hero-bg');
  if (!host) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero-canvas';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = host.clientWidth;
    H = host.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Theme-aware accent colors
  function palette() {
    const dark = document.body.classList.contains('dark-mode');
    return {
      line: dark ? '#67E8F9' : '#38BDF8',
      fillTop: dark ? 'rgba(103, 232, 249, 0.22)' : 'rgba(56, 189, 248, 0.22)',
      fillBot: dark ? 'rgba(103, 232, 249, 0)' : 'rgba(56, 189, 248, 0)',
      ghost: dark ? 'rgba(148, 197, 255, 0.28)' : 'rgba(191, 219, 254, 0.40)',
      grid: 'rgba(255, 255, 255, 0.05)'
    };
  }

  // Mean-reverting random walk generator
  function makeSeries(n, start, vol, mean) {
    const a = new Array(n);
    let v = start;
    for (let i = 0; i < n; i++) {
      v += (mean - v) * 0.015 + (Math.random() - 0.5) * vol;
      a[i] = v;
    }
    return a;
  }

  const N = 200;
  let series = [];
  function rebuild() {
    series = [
      { data: makeSeries(N, 0.5, 0.05, 0.52), w: 2.6, main: true },
      { data: makeSeries(N, 0.6, 0.045, 0.6), w: 1.3, main: false },
      { data: makeSeries(N, 0.4, 0.05, 0.42), w: 1.3, main: false }
    ];
  }
  rebuild();

  function nextVal(arr, mean, vol) {
    const last = arr[arr.length - 1];
    return last + (mean - last) * 0.015 + (Math.random() - 0.5) * vol;
  }

  let phase = 0;
  const speed = 0.18;          // points advanced per frame
  let raf = null;
  let visible = true;

  function render() {
    ctx.clearRect(0, 0, W, H);
    const c = palette();
    const step = W / (N - 2);

    // faint grid
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;
    for (let x = (W % 64); x <= W; x += 64) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 64) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // shared vertical framing across all series
    let lo = Infinity, hi = -Infinity;
    series.forEach(s => s.data.forEach(v => { if (v < lo) lo = v; if (v > hi) hi = v; }));
    const pad = (hi - lo) * 0.18 || 1;
    lo -= pad; hi += pad;
    const yOf = v => H - ((v - lo) / (hi - lo)) * (H * 0.78) - H * 0.11;
    const xOf = i => (i - phase) * step;

    series.forEach(s => {
      const d = s.data;

      if (s.main) {
        // area fill under the main curve
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, c.fillTop);
        grad.addColorStop(1, c.fillBot);
        ctx.beginPath();
        ctx.moveTo(xOf(0), H);
        for (let i = 0; i < N; i++) ctx.lineTo(xOf(i), yOf(d[i]));
        ctx.lineTo(xOf(N - 1), H);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const x = xOf(i), y = yOf(d[i]);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = s.main ? c.line : c.ghost;
      ctx.lineWidth = s.w;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // leading dot on the main line
      if (s.main) {
        const lastX = xOf(N - 1), lastY = yOf(d[N - 1]);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = c.line;
        ctx.fill();
      }
    });
  }

  function step3() {
    phase += speed;
    while (phase >= 1) {
      phase -= 1;
      series.forEach(s => {
        s.data.push(nextVal(s.data, s.main ? 0.52 : (s.data === series[1]?.data ? 0.6 : 0.42), s.main ? 0.05 : 0.045));
        s.data.shift();
      });
    }
    render();
    if (visible) raf = requestAnimationFrame(step3);
  }

  function start() {
    if (raf || reduceMotion) return;
    visible = true;
    raf = requestAnimationFrame(step3);
  }
  function stop() {
    visible = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  // Pause when the hero scrolls out of view or tab is hidden
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.05 }).observe(host);
  }
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  if (reduceMotion) {
    render();                  // static frame, no animation
  } else {
    start();
  }

  // Repaint immediately on theme toggle for correct colors
  if (typeof darkModeToggle !== 'undefined' && darkModeToggle) {
    darkModeToggle.addEventListener('click', () => requestAnimationFrame(render));
  }
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

// === SMOOTH SCROLL NAVIGATION ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    e.preventDefault();
    if (href === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// === MOBILE NAV (hamburger) ===
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('nav-links');
  if (!toggle || !links) return;
  const icon = toggle.querySelector('i');

  function setOpen(open) {
    links.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (icon) icon.className = open ? 'fas fa-xmark' : 'fas fa-bars';
  }

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  // Close the menu after tapping a link
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
});

// === SCROLL-SPY: highlight the active nav link ===
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const map = new Map();
  navLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    if (id) map.set(id, a);
  });
  const sections = Array.from(map.keys())
    .map(id => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = map.get(entry.target.id);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
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

// Start observing elements
document.addEventListener('DOMContentLoaded', () => {
    // Observe all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        sectionObserver.observe(section);
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

// === ANIMATED COUNT-UP FOR GITHUB STAT NUMBERS ===
const statTargets = {};
let statsSectionSeen = false;

function animateCount(el, to) {
    const duration = 1100;
    const start = performance.now();
    function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        el.textContent = Math.round(to * eased);
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = to;
    }
    requestAnimationFrame(frame);
}

function runStatCounters() {
    Object.keys(statTargets).forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.dataset.counted) {
            el.dataset.counted = '1';
            animateCount(el, statTargets[id]);
        }
    });
}

function registerStat(id, value) {
    statTargets[id] = Number(value) || 0;
    if (statsSectionSeen) runStatCounters();
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.stats-container');
    if (!container) return;
    new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) {
            statsSectionSeen = true;
            runStatCounters();
            obs.disconnect();
        }
    }, { threshold: 0.3 }).observe(container);
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

        // Years on GitHub — derived from the account creation date
        const createdYear = new Date(userData.created_at).getFullYear();
        const yearsActive = Math.max(1, new Date().getFullYear() - createdYear);

        // Register real (API-sourced) values; they animate via count-up when scrolled into view
        registerStat('total-repos', userData.public_repos);
        registerStat('total-stars', totalStars);
        registerStat('languages-count', languages.size);
        registerStat('years-active', yearsActive);

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
  <span style="color: #4EC9B0">social</span>    - Open my LinkedIn / GitHub
  <span style="color: #4EC9B0">theme</span>     - Toggle light / dark mode
  <span style="color: #4EC9B0">goto</span>      - Jump to a section (e.g. goto projects)
  <span style="color: #4EC9B0">clear</span>     - Clear the terminal
  <span style="color: #4EC9B0">whoami</span>    - Display current user
  <span style="color: #4EC9B0">date</span>      - Show current date and time

<span style="color: #6A9955">Tip: use ↑ / ↓ for command history.</span>`;
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
  • Python, Java, OCaml, TypeScript, JavaScript, SQL, HTML/CSS

<span style="color: #4EC9B0">Frameworks & Libraries:</span>
  • FastAPI, React, Next.js, Streamlit
  • PyTorch, Hugging Face, CatBoost, Scikit-learn, Pandas, NumPy

<span style="color: #4EC9B0">Infra, Tools & Analytics:</span>
  • Docker, Redis, Kafka, PostgreSQL, SQLModel
  • Git, GitHub Actions, CI/CD, Prometheus, Grafana
  • JWT, WebSockets, OpenAPI, Tableau, Power BI

<span style="color: #4EC9B0">Areas of Expertise:</span>
  • Machine Learning & AI  •  Distributed Systems
  • Quantitative Analysis  •  Full-Stack Development`;
    },
    projects: () => {
        return `<span style="color: #CE9178">Featured Projects:</span>

1. <span style="color: #4EC9B0">FitMax</span>
   Full-stack AI health platform — FastAPI, Next.js, PostgreSQL/pgvector
   Transformer NLP semantic search over PubMed (~30% faster queries)

2. <span style="color: #4EC9B0">Soccer Injury Betting</span>
   Scalable ML pipeline over 9,000+ records via API-Football
   CatBoost + Scikit-learn models achieving 18-20% ROI

3. <span style="color: #4EC9B0">Real-Time Portfolio & Risk Platform</span>
   Event-driven system — FastAPI, Kafka, Redis, WebSockets
   Sub-second latency P/L, volatility, Sharpe & drawdown analytics

Check out more projects on my GitHub: github.com/aryan-jeena`;
    },
    experience: () => {
        return `<span style="color: #CE9178">Work Experience:</span>

<span style="color: #4EC9B0">Amazon - SDE Intern, Project Kuiper</span> (Sept 2026 - Dec 2026) <span style="color: #DCDCAA">[Incoming]</span>
  • Distributed systems for LEO satellite broadband

<span style="color: #4EC9B0">BlackRock - SWE Analyst Intern, Aladdin</span> (Jun 2026 - Aug 2026) <span style="color: #DCDCAA">[Incoming]</span>
  • Engineering on the Aladdin investment & risk platform

<span style="color: #4EC9B0">Timing - Software Development Intern</span> (May 2025 - Aug 2025)
  • Built AI-powered CRM features; OpenAI Assistants chatbot
  • Smart contact autofill (+40% speed), adaptive onboarding (+25%)

<span style="color: #4EC9B0">AI in Business Club - Proscia Project</span> (Aug 2024 - May 2025)
  • ML model evaluation over 100K+ pathology images (-10-15% error)

<span style="color: #4EC9B0">Abacus Aviation - SWE Intern</span> (Apr 2024 - Aug 2024)
  • Full-stack parts/maintenance system for B747/B787 (-50% paperwork)`;
    },
    education: () => {
        return `<span style="color: #CE9178">Education:</span>

<span style="color: #4EC9B0">University of Pennsylvania</span> (Expected May 2028)
  B.S.E in Computer Science and Mathematics
  Minor in Statistics
  Concentration in Artificial Intelligence

<span style="color: #4EC9B0">Key Coursework:</span>
  • Mathematical Foundations of CS  •  Real Analysis
  • Programming Languages and Techniques I & II
  • Numerical Optimization for Data Science & ML
  • Probability  •  Discrete Mathematics II  •  Big Data Analytics`;
    },
    contact: () => {
        return `<span style="color: #CE9178">Contact Information:</span>

<span style="color: #4EC9B0">Email:</span> aryanj@sas.upenn.edu
<span style="color: #4EC9B0">Phone:</span> +1 (908) 636-5723
<span style="color: #4EC9B0">LinkedIn:</span> linkedin.com/in/aryan-jeena
<span style="color: #4EC9B0">GitHub:</span> github.com/aryan-jeena

Feel free to reach out for opportunities or collaborations!`;
    },
    social: () => {
        window.open('https://www.linkedin.com/in/aryan-jeena/', '_blank');
        window.open('https://github.com/aryan-jeena', '_blank');
        return `<span style="color: #CE9178">Opening LinkedIn & GitHub in new tabs...</span>
<span style="color: #4EC9B0">LinkedIn:</span> linkedin.com/in/aryan-jeena
<span style="color: #4EC9B0">GitHub:</span>   github.com/aryan-jeena`;
    },
    theme: () => {
        document.getElementById('darkModeToggle')?.click();
        const mode = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        return `<span style="color: #CE9178">Theme toggled → ${mode} mode.</span>`;
    },
    clear: () => 'CLEAR',
    whoami: () => 'visitor',
    date: () => new Date().toString()
};

// Sections reachable via the terminal "goto" command
const terminalSections = ['about', 'education', 'experience', 'projects', 'github-stats', 'awards', 'skills', 'certifications', 'terminal', 'contact'];

document.addEventListener('DOMContentLoaded', () => {
    const terminalInput = document.getElementById('terminal-input');
    const terminalBody = document.getElementById('terminal-body');

    if (!terminalInput || !terminalBody) return;

    const history = [];
    let historyIndex = 0;

    function printOutput(html) {
        const inputLine = terminalBody.querySelector('.terminal-input-line');
        const div = document.createElement('div');
        div.className = 'terminal-output';
        div.innerHTML = `<p>${html.replace(/\n/g, '</p><p>')}</p>`;
        terminalBody.insertBefore(div, inputLine);
    }

    function runCommand(raw) {
        const inputLine = terminalBody.querySelector('.terminal-input-line');

        // Echo the typed command (escaped)
        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-line';
        commandLine.innerHTML =
            `<span class="terminal-prompt">visitor@aryan-portfolio:~$</span> ` +
            `<span class="terminal-text">${raw.replace(/</g, '&lt;')}</span>`;
        terminalBody.insertBefore(commandLine, inputLine);

        const parts = raw.trim().split(/\s+/);
        const command = (parts[0] || '').toLowerCase();
        const arg = (parts[1] || '').toLowerCase();

        if (!command) {
            // blank line — do nothing
        } else if (command === 'clear') {
            Array.from(terminalBody.children).forEach(child => {
                if (!child.classList.contains('terminal-input-line')) child.remove();
            });
        } else if (command === 'goto') {
            if (terminalSections.includes(arg)) {
                document.getElementById(arg)?.scrollIntoView({ behavior: 'smooth' });
                printOutput(`<span style="color:#CE9178">Navigating to ${arg}…</span>`);
            } else {
                printOutput(`<span style="color:#EF4444">Unknown section: ${arg || '(none)'}</span>\nTry: ${terminalSections.join(', ')}`);
            }
        } else if (terminalCommands[command]) {
            printOutput(terminalCommands[command]());
        } else {
            printOutput(`<span style="color:#EF4444">Command not found: ${command}</span>\nType 'help' for available commands.`);
        }

        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = terminalInput.value;
            if (raw.trim()) history.push(raw);
            historyIndex = history.length;
            runCommand(raw);
            terminalInput.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length && historyIndex > 0) {
                historyIndex--;
                terminalInput.value = history[historyIndex];
                setTimeout(() => terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length), 0);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                historyIndex++;
                terminalInput.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                terminalInput.value = '';
            }
        }
    });

    // Focus input when clicking terminal
    terminalBody.addEventListener('click', () => {
        terminalInput.focus();
    });
});

// === CONTACT FORM (opens the visitor's email client — real, no fake submit) ===
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    let status = document.getElementById('form-status');
    if (!status) {
        status = document.createElement('p');
        status.id = 'form-status';
        status.className = 'form-status';
        status.setAttribute('role', 'status');
        contactForm.appendChild(status);
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !subject || !message) {
            status.textContent = 'Please fill in all fields.';
            status.className = 'form-status error';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            status.textContent = 'Please enter a valid email address.';
            status.className = 'form-status error';
            return;
        }

        const bodyText = `Hi Aryan,\n\n${message}\n\n— ${name} (${email})`;
        const mailto = `mailto:aryanj@sas.upenn.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailto;

        status.innerHTML = 'Opening your email app… if nothing happens, reach me directly at <a href="mailto:aryanj@sas.upenn.edu">aryanj@sas.upenn.edu</a>.';
        status.className = 'form-status success';
        contactForm.reset();
    });
});

// === DYNAMIC FOOTER YEAR ===
document.addEventListener('DOMContentLoaded', () => {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// === AWARDS SHOW MORE / LESS ===
document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('awards-toggle');
    const list = document.getElementById('awards-list');
    if (!toggle || !list) return;

    const label = toggle.querySelector('span');
    const total = list.querySelectorAll('li').length;

    toggle.addEventListener('click', () => {
        const collapsed = list.classList.toggle('collapsed');
        toggle.classList.toggle('expanded', !collapsed);
        toggle.setAttribute('aria-expanded', String(!collapsed));
        label.textContent = collapsed ? `Show all ${total} awards` : 'Show fewer';
    });
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
// Note: Cmd/Ctrl+K is owned by the Command Palette module. The terminal uses
// Ctrl+` (backtick), mirroring VS Code's "toggle terminal" shortcut.
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === '`') {
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
    }
});

// ===================================================================
// === FUN FACTS CAROUSEL ===
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    const facts = [
        { category: 'Running', icon: 'fa-running', text: 'Marathon PR: 4:13:16' },
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

    // Reset stats button
    document.getElementById('reset-all-stats')?.addEventListener('click', () => {
        if (confirm('Reset all Math Arena stats? This cannot be undone.')) {
            localStorage.removeItem('mathArenaStats');
            updateStatsDisplay();
        }
    });
    
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


// ===== MODULE: cmdk =====
/* ============================================================
   Command Palette (cmdk) — self-contained IIFE
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent || '');

  function init() {
    if (document.getElementById('cmdk-overlay')) return; // guard double-init

    // ---- Action definitions -------------------------------------------------
    function nav(id) {
      return function () {
        var el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      };
    }

    var actions = [
      // Navigation
      { icon: 'fa-user',          label: 'Go to About',         cat: 'Nav', kw: 'about bio intro me',          run: nav('about') },
      { icon: 'fa-graduation-cap',label: 'Go to Education',     cat: 'Nav', kw: 'education school upenn degree', run: nav('education') },
      { icon: 'fa-briefcase',     label: 'Go to Experience',    cat: 'Nav', kw: 'experience work job intern',   run: nav('experience') },
      { icon: 'fa-folder-open',   label: 'Go to Projects',      cat: 'Nav', kw: 'projects portfolio build',     run: nav('projects') },
      { icon: 'fa-flask',         label: 'Go to Playground',    cat: 'Nav', kw: 'playground quant sandbox demo', run: nav('playground') },
      { icon: 'fa-chart-line',    label: 'Go to GitHub Stats',  cat: 'Nav', kw: 'github stats activity graphs', run: nav('github-stats') },
      { icon: 'fa-trophy',        label: 'Go to Awards',        cat: 'Nav', kw: 'awards honors prizes',         run: nav('awards') },
      { icon: 'fa-code',          label: 'Go to Skills',        cat: 'Nav', kw: 'skills tech stack languages',  run: nav('skills') },
      { icon: 'fa-certificate',   label: 'Go to Certifications',cat: 'Nav', kw: 'certifications certs courses', run: nav('certifications') },
      { icon: 'fa-terminal',      label: 'Go to Terminal',      cat: 'Nav', kw: 'terminal console shell',       run: nav('terminal') },
      { icon: 'fa-envelope',      label: 'Go to Contact',       cat: 'Nav', kw: 'contact reach get in touch',   run: nav('contact') },

      // Actions
      { icon: 'fa-circle-half-stroke', label: 'Toggle theme (light/dark)', cat: 'Action', kw: 'theme dark light mode toggle appearance', run: function () { var b = document.getElementById('darkModeToggle'); if (b) b.click(); } },
      { icon: 'fa-square-root-variable', label: 'Open Math Arena', cat: 'Action', kw: 'math arena game play challenge', run: function () { var b = document.getElementById('mathGameLauncher'); if (b) b.click(); } },
      { icon: 'fa-terminal', label: 'Focus terminal', cat: 'Action', kw: 'terminal focus type command shell', run: function () {
          var t = document.getElementById('terminal');
          if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
          setTimeout(function () { var inp = document.getElementById('terminal-input'); if (inp) inp.focus(); }, reduce ? 60 : 600);
        } },
      { icon: 'fa-copy', label: 'Copy email address', cat: 'Action', kw: 'copy email address clipboard', confirm: true, run: function (item) {
          var addr = 'aryanj@sas.upenn.edu';
          function ok() { showConfirm(item, 'Copied!'); }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(addr).then(ok).catch(function () { fallbackCopy(addr); ok(); });
          } else { fallbackCopy(addr); ok(); }
        } },

      // Links
      { icon: 'fa-envelope', label: 'Email Aryan', cat: 'Link', kw: 'email mail contact write', run: function () { window.location.href = 'mailto:aryanj@sas.upenn.edu'; } },
      { icon: 'fa-linkedin-in', faStyle: 'fab', label: 'Open LinkedIn', cat: 'Link', kw: 'linkedin social profile network', run: function () { window.open('https://www.linkedin.com/in/aryan-jeena/', '_blank', 'noopener'); } },
      { icon: 'fa-github', faStyle: 'fab', label: 'Open GitHub', cat: 'Link', kw: 'github code repos source', run: function () { window.open('https://github.com/aryan-jeena', '_blank', 'noopener'); } }
    ];

    function fallbackCopy(text) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) { /* no-op */ }
    }

    // ---- Build DOM ----------------------------------------------------------
    var pill = document.createElement('button');
    pill.className = 'cmdk-pill';
    pill.id = 'cmdk-pill';
    pill.type = 'button';
    pill.setAttribute('aria-label', 'Open command palette');
    pill.setAttribute('aria-haspopup', 'dialog');
    pill.innerHTML =
      '<i class="fas fa-bolt" aria-hidden="true"></i>' +
      '<span class="cmdk-pill-text">Commands</span>' +
      '<span class="cmdk-pill-keys">' +
        (isMac ? '<kbd>⌘</kbd><kbd>K</kbd>' : '<kbd>Ctrl</kbd><kbd>K</kbd>') +
      '</span>';

    var overlay = document.createElement('div');
    overlay.className = 'cmdk-overlay';
    overlay.id = 'cmdk-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Command palette');
    overlay.innerHTML =
      '<div class="cmdk-modal" id="cmdk-modal">' +
        '<div class="cmdk-search-row">' +
          '<i class="fas fa-magnifying-glass" aria-hidden="true"></i>' +
          '<input type="text" id="cmdk-input" class="cmdk-input" placeholder="Type a command or search…" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Search commands" aria-controls="cmdk-list" />' +
          '<span class="cmdk-esc">ESC</span>' +
        '</div>' +
        '<ul class="cmdk-list" id="cmdk-list" role="listbox" aria-label="Commands"></ul>' +
        '<div class="cmdk-foot">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>' +
          '<span><kbd>↵</kbd> run</span>' +
          '<span><kbd>esc</kbd> close</span>' +
        '</div>' +
      '</div>';

    document.body.appendChild(pill);
    document.body.appendChild(overlay);

    var input = overlay.querySelector('#cmdk-input');
    var list = overlay.querySelector('#cmdk-list');
    var modal = overlay.querySelector('#cmdk-modal');
    if (!input || !list || !modal) return;

    // ---- State --------------------------------------------------------------
    var filtered = actions.slice();
    var activeIndex = 0;
    var isOpen = false;
    var lastFocus = null;

    // ---- Fuzzy / substring matching -----------------------------------------
    // Returns null if no match, else {score, ranges:[[start,end],...]} for label.
    function matchLabel(label, query) {
      if (!query) return { score: 0, ranges: [] };
      var lower = label.toLowerCase();
      var q = query.toLowerCase();
      // Prefer contiguous substring match (highlightable, best score).
      var idx = lower.indexOf(q);
      if (idx !== -1) {
        return { score: 100 - idx, ranges: [[idx, idx + q.length]] };
      }
      return null;
    }

    function scoreAction(act, query) {
      if (!query) return { score: 0, ranges: [] };
      var m = matchLabel(act.label, query);
      if (m) return m;
      // Fall back to keyword/substring (no label highlight) — fuzzy subsequence.
      var hay = (act.label + ' ' + (act.kw || '')).toLowerCase();
      var q = query.toLowerCase().replace(/\s+/g, '');
      var qi = 0;
      for (var i = 0; i < hay.length && qi < q.length; i++) {
        if (hay[i] === q[qi]) qi++;
      }
      if (qi === q.length) return { score: 10, ranges: [] };
      return null;
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }

    function highlight(label, ranges) {
      if (!ranges || !ranges.length) return escapeHtml(label);
      var out = '', last = 0;
      ranges.forEach(function (r) {
        out += escapeHtml(label.slice(last, r[0]));
        out += '<mark>' + escapeHtml(label.slice(r[0], r[1])) + '</mark>';
        last = r[1];
      });
      out += escapeHtml(label.slice(last));
      return out;
    }

    // ---- Render -------------------------------------------------------------
    function render(query) {
      var results = [];
      actions.forEach(function (act) {
        var sc = scoreAction(act, query);
        if (sc) results.push({ act: act, score: sc.score, ranges: sc.ranges });
      });
      if (query) results.sort(function (a, b) { return b.score - a.score; });
      filtered = results;

      list.innerHTML = '';
      if (!results.length) {
        var empty = document.createElement('li');
        empty.className = 'cmdk-empty';
        empty.textContent = 'No matching commands';
        list.appendChild(empty);
        activeIndex = -1;
        return;
      }

      results.forEach(function (res, i) {
        var act = res.act;
        var li = document.createElement('li');
        li.className = 'cmdk-item' + (i === activeIndex ? ' cmdk-active' : '');
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
        li.dataset.cmdkIndex = String(i);
        var faStyle = act.faStyle || 'fas';
        li.innerHTML =
          '<span class="cmdk-item-icon"><i class="' + faStyle + ' ' + act.icon + '" aria-hidden="true"></i></span>' +
          '<span class="cmdk-item-label">' + highlight(act.label, res.ranges) + '</span>' +
          '<span class="cmdk-item-badge" data-cat="' + act.cat + '">' + act.cat + '</span>';
        li.addEventListener('mouseenter', function () { setActive(i); });
        li.addEventListener('click', function () { runIndex(i); });
        list.appendChild(li);
      });
    }

    function setActive(i) {
      if (i < 0 || i >= filtered.length) return;
      activeIndex = i;
      var items = list.querySelectorAll('.cmdk-item');
      items.forEach(function (el, idx) {
        var on = idx === i;
        el.classList.toggle('cmdk-active', on);
        el.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      var act = items[i];
      if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    }

    function move(delta) {
      if (!filtered.length) return;
      var n = filtered.length;
      var next = (activeIndex + delta + n) % n;
      setActive(next);
    }

    function showConfirm(actObj, text) {
      // Find the rendered li for this action and append a transient confirmation.
      var items = list.querySelectorAll('.cmdk-item');
      filtered.forEach(function (res, i) {
        if (res.act === actObj && items[i]) {
          var existing = items[i].querySelector('.cmdk-item-confirm');
          if (existing) existing.remove();
          var span = document.createElement('span');
          span.className = 'cmdk-item-confirm';
          span.textContent = text;
          var badge = items[i].querySelector('.cmdk-item-badge');
          items[i].insertBefore(span, badge);
          setTimeout(function () { if (span && span.parentNode) span.remove(); }, 1600);
        }
      });
    }

    function runIndex(i) {
      if (i < 0 || i >= filtered.length) return;
      var act = filtered[i].act;
      var keepOpen = !!act.confirm;
      try { act.run(act); } catch (e) { /* never throw */ }
      if (!keepOpen) close();
    }

    // ---- Open / Close -------------------------------------------------------
    function open() {
      if (isOpen) return;
      isOpen = true;
      lastFocus = document.activeElement;
      activeIndex = 0;
      input.value = '';
      render('');
      overlay.classList.add('cmdk-open');
      // autofocus
      setTimeout(function () { input.focus(); }, reduce ? 0 : 30);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove('cmdk-open');
      if (lastFocus && lastFocus.focus) {
        try { lastFocus.focus(); } catch (e) { /* no-op */ }
      }
    }

    function toggle() { isOpen ? close() : open(); }

    // ---- Wiring -------------------------------------------------------------
    pill.addEventListener('click', open);

    overlay.addEventListener('mousedown', function (e) {
      if (e.target === overlay) close(); // backdrop click (not inside modal)
    });

    input.addEventListener('input', function () {
      activeIndex = 0;
      render(input.value.trim());
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); runIndex(activeIndex); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
    });

    // Global hotkey + Esc.
    document.addEventListener('keydown', function (e) {
      var key = (e.key || '').toLowerCase();
      var combo = (isMac ? e.metaKey : e.ctrlKey);
      if (combo && key === 'k') {
        e.preventDefault();
        toggle();
        return;
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        close();
      }
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== MODULE: qp =====
/* ===== Quant Playground (qp) ===== */
(function(){
  "use strict";

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(id){ return document.getElementById(id); }
  function isDark(){ return document.body.classList.contains('dark-mode'); }
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }

  // Crisp DPR-aware canvas sizing. Returns {ctx,w,h} in CSS pixels, or null.
  function fitCanvas(canvas){
    if(!canvas) return null;
    var rect = canvas.getBoundingClientRect();
    if(rect.width < 2 || rect.height < 2) return null;
    var dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
    var w = Math.round(rect.width), h = Math.round(rect.height);
    if(canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)){
      canvas.width = Math.round(w*dpr);
      canvas.height = Math.round(h*dpr);
    }
    var ctx = canvas.getContext('2d');
    if(!ctx) return null;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return { ctx:ctx, w:w, h:h };
  }

  // Standard normal via Box-Muller
  function randn(){
    var u=0,v=0;
    while(u===0) u=Math.random();
    while(v===0) v=Math.random();
    return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
  }

  // ---------------------------------------------------------------
  // 1) GEOMETRIC BROWNIAN MOTION
  // ---------------------------------------------------------------
  function initGBM(){
    var canvas = $('qp-gbm-canvas');
    if(!canvas) return;
    var muEl=$('qp-gbm-mu'), sigEl=$('qp-gbm-sigma'), pathsEl=$('qp-gbm-paths'), yearsEl=$('qp-gbm-years');
    var muV=$('qp-gbm-mu-val'), sigV=$('qp-gbm-sigma-val'), pathsV=$('qp-gbm-paths-val'), yearsV=$('qp-gbm-years-val');
    var runBtn=$('qp-gbm-run'), meanEl=$('qp-gbm-mean'), theoryEl=$('qp-gbm-theory');
    if(!muEl||!sigEl||!pathsEl||!yearsEl||!runBtn) return;

    var S0=100, STEPS=240;
    var paths=[];        // array of arrays of prices (length STEPS+1)
    var minP=S0, maxP=S0;
    var highlight=0;
    var animFrame=0, raf=null, running=false;
    var visible=true;

    function labels(){
      if(muV) muV.textContent = (+muEl.value).toFixed(2);
      if(sigV) sigV.textContent = (+sigEl.value).toFixed(2);
      if(pathsV) pathsV.textContent = pathsEl.value;
      if(yearsV) yearsV.textContent = (+yearsEl.value).toFixed(2);
    }

    function simulate(){
      var mu=+muEl.value, sigma=+sigEl.value, n=Math.round(+pathsEl.value), T=+yearsEl.value;
      n=clamp(n,1,50);
      var dt=T/STEPS, drift=(mu-0.5*sigma*sigma)*dt, vol=sigma*Math.sqrt(dt);
      paths=[]; minP=Infinity; maxP=-Infinity;
      var sumEnd=0;
      for(var p=0;p<n;p++){
        var arr=new Float64Array(STEPS+1);
        var S=S0; arr[0]=S;
        for(var i=1;i<=STEPS;i++){
          S=S*Math.exp(drift+vol*randn());
          arr[i]=S;
          if(S<minP)minP=S; if(S>maxP)maxP=S;
        }
        sumEnd+=arr[STEPS];
        paths.push(arr);
      }
      if(minP===Infinity){ minP=S0*0.5; maxP=S0*1.5; }
      // pad range a touch
      var pad=(maxP-minP)*0.08 || S0*0.1;
      minP-=pad; maxP+=pad;
      highlight=Math.floor(Math.random()*paths.length);
      if(meanEl) meanEl.textContent='$'+(sumEnd/n).toFixed(2);
      if(theoryEl) theoryEl.textContent='$'+(S0*Math.exp(mu*T)).toFixed(2);
    }

    function draw(progress){
      var f=fitCanvas(canvas);
      if(!f) return;
      var ctx=f.ctx, w=f.w, h=f.h, dark=isDark();
      var padL=46, padR=12, padT=12, padB=22;
      var plotW=w-padL-padR, plotH=h-padT-padB;
      ctx.clearRect(0,0,w,h);

      var T=+yearsEl.value;
      function X(i){ return padL + (i/STEPS)*plotW; }
      function Y(price){ return padT + plotH - ((price-minP)/(maxP-minP))*plotH; }

      // grid
      ctx.lineWidth=1;
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)';
      ctx.fillStyle = dark ? 'rgba(241,245,249,0.55)' : 'rgba(17,24,39,0.55)';
      ctx.font='10px Inter, sans-serif';
      ctx.textBaseline='middle';
      var gy=5;
      for(var g=0;g<=gy;g++){
        var price=minP+(maxP-minP)*(g/gy);
        var yy=Y(price);
        ctx.beginPath(); ctx.moveTo(padL,yy); ctx.lineTo(w-padR,yy); ctx.stroke();
        ctx.textAlign='right';
        ctx.fillText(price.toFixed(0), padL-6, yy);
      }
      // x ticks
      ctx.textAlign='center'; ctx.textBaseline='bottom';
      var gx=4;
      for(var xg=0;xg<=gx;xg++){
        var ix=Math.round((xg/gx)*STEPS);
        var xx=X(ix);
        ctx.fillText(((T*xg/gx)).toFixed(2)+'y', xx, h-4);
      }

      // baseline at S0
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.18)' : 'rgba(15,23,42,0.18)';
      ctx.setLineDash([4,4]);
      var y0=Y(S0);
      ctx.beginPath(); ctx.moveTo(padL,y0); ctx.lineTo(w-padR,y0); ctx.stroke();
      ctx.setLineDash([]);

      var upTo=Math.max(1, Math.floor(progress*STEPS));
      var faint = dark ? 'rgba(96,165,250,0.22)' : 'rgba(59,130,246,0.22)';
      var accent = dark ? '#67E8F9' : '#0891B2';

      // faint paths first
      ctx.lineWidth=1.1;
      for(var p=0;p<paths.length;p++){
        if(p===highlight) continue;
        var arr=paths[p];
        ctx.strokeStyle=faint;
        ctx.beginPath();
        ctx.moveTo(X(0),Y(arr[0]));
        for(var i=1;i<=upTo;i++){ ctx.lineTo(X(i),Y(arr[i])); }
        ctx.stroke();
      }
      // highlighted path
      if(paths[highlight]){
        var ha=paths[highlight];
        ctx.lineWidth=2.2;
        ctx.strokeStyle=accent;
        ctx.shadowColor=accent; ctx.shadowBlur=8;
        ctx.beginPath();
        ctx.moveTo(X(0),Y(ha[0]));
        for(var j=1;j<=upTo;j++){ ctx.lineTo(X(j),Y(ha[j])); }
        ctx.stroke();
        ctx.shadowBlur=0;
        // leading dot
        ctx.fillStyle=accent;
        ctx.beginPath(); ctx.arc(X(upTo),Y(ha[upTo]),3,0,Math.PI*2); ctx.fill();
      }
    }

    function animate(){
      if(!running) return;
      if(document.hidden || !visible){ raf=requestAnimationFrame(animate); return; }
      animFrame+=0.018;
      var prog=animFrame;
      if(prog>=1){ prog=1; running=false; }
      draw(prog);
      if(running) raf=requestAnimationFrame(animate);
    }

    function run(){
      if(raf) cancelAnimationFrame(raf);
      simulate();
      if(reduce){
        running=false; draw(1);
      } else {
        animFrame=0; running=true;
        raf=requestAnimationFrame(animate);
      }
    }

    // wire
    [muEl,sigEl,pathsEl,yearsEl].forEach(function(el){
      el.addEventListener('input', function(){ labels(); run(); });
    });
    runBtn.addEventListener('click', run);
    labels();

    // resize: redraw final state (or restart if mid-anim short-circuit to static)
    var resizeT=null;
    function onResize(){
      if(resizeT) clearTimeout(resizeT);
      resizeT=setTimeout(function(){
        if(paths.length) draw(running?animFrame:1);
      },120);
    }
    window.addEventListener('resize', onResize);

    // visibility / first paint
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        visible=e.isIntersecting;
        if(visible && !paths.length){ run(); }
        else if(visible && !running){ draw(1); }
      });
    },{threshold:0.12});
    io.observe(canvas);
  }

  // ---------------------------------------------------------------
  // 2) MONTE CARLO PI
  // ---------------------------------------------------------------
  function initMonteCarlo(){
    var canvas=$('qp-mc-canvas');
    if(!canvas) return;
    var piEl=$('qp-mc-pi'), nEl=$('qp-mc-n'), inEl=$('qp-mc-in'), resetBtn=$('qp-mc-reset');

    var total=0, inside=0;
    var raf=null, visible=true, started=false;
    var DOT=2.0;

    function fmt(n){ return n.toLocaleString(); }

    function clearAll(){
      var f=fitCanvas(canvas);
      if(!f) return f;
      var ctx=f.ctx, w=f.w, h=f.h, dark=isDark();
      ctx.clearRect(0,0,w,h);
      // quarter circle guide
      ctx.strokeStyle = dark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.28)';
      ctx.lineWidth=1.4;
      ctx.beginPath();
      ctx.arc(0,h, Math.min(w,h), -Math.PI/2, 0, false);
      ctx.stroke();
      return f;
    }

    function plotPoint(ctx,w,h,x,y,ok){
      var px=x*w, py=(1-y)*h; // y up
      ctx.fillStyle = ok ? '#22C55E' : '#EF4444';
      ctx.beginPath(); ctx.arc(px,py,DOT,0,Math.PI*2); ctx.fill();
    }

    function updateStats(){
      if(piEl) piEl.textContent = total? (4*inside/total).toFixed(4) : '—';
      if(nEl) nEl.textContent = fmt(total);
      if(inEl) inEl.textContent = fmt(inside);
    }

    function batch(ctx,w,h,count){
      for(var i=0;i<count;i++){
        var x=Math.random(), y=Math.random();
        var ok=(x*x+y*y)<=1;
        if(ok) inside++;
        total++;
        plotPoint(ctx,w,h,x,y,ok);
      }
      updateStats();
    }

    var f0=null;
    function ensureCtx(){
      if(!f0){ f0=clearAll(); }
      return f0;
    }

    function loop(){
      if(document.hidden || !visible){ raf=requestAnimationFrame(loop); return; }
      var f=ensureCtx();
      if(f){ batch(f.ctx,f.w,f.h, total<3000?24:60); }
      if(total<60000) raf=requestAnimationFrame(loop);
    }

    function reset(){
      if(raf) cancelAnimationFrame(raf);
      total=0; inside=0;
      f0=clearAll();
      updateStats();
      if(reduce){
        if(f0) batch(f0.ctx,f0.w,f0.h,5000);
      } else {
        if(visible) raf=requestAnimationFrame(loop);
      }
    }

    if(resetBtn) resetBtn.addEventListener('click', reset);

    var resizeT=null;
    window.addEventListener('resize', function(){
      if(resizeT) clearTimeout(resizeT);
      resizeT=setTimeout(function(){
        // re-fit clears the drawing; restart cleanly to keep visuals consistent
        if(started) reset();
      },150);
    });

    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        visible=e.isIntersecting;
        if(visible && !started){ started=true; reset(); }
        else if(visible && !reduce && total<60000){ if(raf) cancelAnimationFrame(raf); raf=requestAnimationFrame(loop); }
        else if(!visible && raf){ cancelAnimationFrame(raf); raf=null; }
      });
    },{threshold:0.15});
    io.observe(canvas);
  }

  // ---------------------------------------------------------------
  // 3) BLACK-SCHOLES
  // ---------------------------------------------------------------
  function initBlackScholes(){
    var Sel=$('qp-bs-S'), Kel=$('qp-bs-K'), Tel=$('qp-bs-T'), rel=$('qp-bs-r'), sigEl=$('qp-bs-sigma');
    var toggle=$('qp-bs-toggle');
    var priceEl=$('qp-bs-price'), dEl=$('qp-bs-delta'), gEl=$('qp-bs-gamma'),
        vEl=$('qp-bs-vega'), tEl=$('qp-bs-theta'), rhoEl=$('qp-bs-rho');
    if(!Sel||!Kel||!Tel||!rel||!sigEl||!priceEl) return;

    var isCall=true;

    // Abramowitz-Stegun erf (max error ~1.5e-7)
    function erf(x){
      var s = x<0 ? -1 : 1; x=Math.abs(x);
      var a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
      var t=1/(1+p*x);
      var y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
      return s*y;
    }
    function normCDF(x){ return 0.5*(1+erf(x/Math.SQRT2)); }
    function normPDF(x){ return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI); }

    function fmt(v,dp){
      if(!isFinite(v)) return '—';
      return v.toFixed(dp===undefined?4:dp);
    }

    function compute(){
      var S=+Sel.value, K=+Kel.value, T=+Tel.value, r=+rel.value, sig=+sigEl.value;
      if(!(S>0)||!(K>0)||!(T>0)||!(sig>0)){
        priceEl.textContent='—';
        [dEl,gEl,vEl,tEl,rhoEl].forEach(function(e){ if(e) e.textContent='—'; });
        return;
      }
      var sqrtT=Math.sqrt(T);
      var d1=(Math.log(S/K)+(r+0.5*sig*sig)*T)/(sig*sqrtT);
      var d2=d1-sig*sqrtT;
      var disc=Math.exp(-r*T);
      var pdf1=normPDF(d1);

      var gamma=pdf1/(S*sig*sqrtT);
      var vega=S*pdf1*sqrtT;          // per 1.0 vol
      var price, delta, rho, theta;

      if(isCall){
        var Nd1=normCDF(d1), Nd2=normCDF(d2);
        price=S*Nd1-K*disc*Nd2;
        delta=Nd1;
        rho=K*T*disc*Nd2;
        theta=-(S*pdf1*sig)/(2*sqrtT)-r*K*disc*Nd2;
      } else {
        var Nnd1=normCDF(-d1), Nnd2=normCDF(-d2);
        price=K*disc*Nnd2-S*Nnd1;
        delta=normCDF(d1)-1;
        rho=-K*T*disc*Nnd2;
        theta=-(S*pdf1*sig)/(2*sqrtT)+r*K*disc*Nnd2;
      }

      priceEl.textContent='$'+fmt(price,2);
      if(dEl) dEl.textContent=fmt(delta,4);
      if(gEl) gEl.textContent=fmt(gamma,4);
      if(vEl) vEl.textContent=fmt(vega/100,4);   // per 1% vol
      if(tEl) tEl.textContent=fmt(theta/365,4);  // per calendar day
      if(rhoEl) rhoEl.textContent=fmt(rho/100,4); // per 1% rate
    }

    [Sel,Kel,Tel,rel,sigEl].forEach(function(el){
      el.addEventListener('input', compute);
    });

    if(toggle){
      toggle.addEventListener('click', function(e){
        var btn=e.target.closest('.qp-toggle-btn');
        if(!btn) return;
        isCall = btn.getAttribute('data-type')==='call';
        var btns=toggle.querySelectorAll('.qp-toggle-btn');
        for(var i=0;i<btns.length;i++) btns[i].classList.remove('qp-active');
        btn.classList.add('qp-active');
        compute();
      });
    }

    compute();
  }

  function init(){
    initGBM();
    initMonteCarlo();
    initBlackScholes();
  }

  if(document.readyState!=='loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== MODULE: tilt =====
(function () {
  var SELECTOR = '.project-card.featured, .skill-group, .repo-item';
  var MAX_DEG = 7;          // max tilt on each axis
  var POP_Z = 14;           // translateZ pop (px)
  var LIFT_Y = -6;          // slight lift to echo existing hover feel

  // Capability + motion guards. Touch / coarse pointers do nothing.
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  function enabled() {
    return fine.matches && !reduceMQ.matches;
  }

  var bound = []; // {el, onMove, onEnter, onLeave} for teardown if disabled

  function ensureGlare(el) {
    var glare = el.querySelector(':scope > .tilt-glare');
    if (!glare) {
      glare = document.createElement('div');
      glare.className = 'tilt-glare';
      glare.setAttribute('aria-hidden', 'true');
      // Insert first so it paints beneath non-positioned content.
      el.insertBefore(glare, el.firstChild);
    }
    return glare;
  }

  function attach(el) {
    if (!el || el.dataset.tiltBound === '1') return;
    el.dataset.tiltBound = '1';

    // Preserve the author's inline transform/transition if any, to restore later.
    var origTransform = el.style.transform || '';
    var rafId = 0;
    var pending = null; // {rx, ry, gx, gy}
    var glare;

    function ensurePositioned() {
      var pos = window.getComputedStyle(el).position;
      if (pos === 'static') el.style.position = 'relative';
    }

    function flush() {
      rafId = 0;
      if (!pending) return;
      el.style.transform =
        'perspective(900px) rotateX(' + pending.rx.toFixed(2) + 'deg) rotateY(' +
        pending.ry.toFixed(2) + 'deg) translateZ(' + POP_Z + 'px) translateY(' +
        LIFT_Y + 'px)';
      if (glare) {
        glare.style.setProperty('--tilt-gx', pending.gx.toFixed(1) + '%');
        glare.style.setProperty('--tilt-gy', pending.gy.toFixed(1) + '%');
      }
    }

    function onEnter() {
      if (!enabled()) return;
      el.classList.add('tilt-active', 'tilt-tracking');
      ensurePositioned();
      glare = ensureGlare(el);
    }

    function onMove(e) {
      if (!enabled()) return;
      if (!el.classList.contains('tilt-active')) onEnter();
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var px = (e.clientX - r.left) / r.width;   // 0..1
      var py = (e.clientY - r.top) / r.height;   // 0..1
      px = px < 0 ? 0 : px > 1 ? 1 : px;
      py = py < 0 ? 0 : py > 1 ? 1 : py;
      // Cursor right -> rotateY positive; cursor down -> rotateX negative.
      var ry = (px - 0.5) * 2 * MAX_DEG;
      var rx = (0.5 - py) * 2 * MAX_DEG;
      pending = { rx: rx, ry: ry, gx: px * 100, gy: py * 100 };
      if (!rafId) rafId = requestAnimationFrame(flush);
    }

    function onLeave() {
      pending = null;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      el.classList.remove('tilt-tracking');
      // Smoothly return: restore the card's own transform (lets CSS :hover/idle
      // transition take back over) then drop the active flag next frame.
      el.style.transform = origTransform;
      window.setTimeout(function () {
        // Only clear if not re-entered in the meantime.
        if (!el.classList.contains('tilt-tracking')) {
          el.classList.remove('tilt-active');
        }
      }, 400);
    }

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    // Reset if the pointer is cancelled (e.g., context menu, drag).
    el.addEventListener('pointercancel', onLeave);

    bound.push({ el: el, onMove: onMove, onEnter: onEnter, onLeave: onLeave });
  }

  function scan(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var list = scope.querySelectorAll(SELECTOR);
    for (var i = 0; i < list.length; i++) attach(list[i]);
    // If root itself matches (e.g., a freshly-added .repo-item), bind it too.
    if (root && root.nodeType === 1 && root.matches && root.matches(SELECTOR)) {
      attach(root);
    }
  }

  function init() {
    if (!enabled()) {
      // Touch / reduced-motion: do nothing, leave cards untouched.
      return;
    }
    scan(document);

    // Watch the async-loaded GitHub repos grid for late additions.
    var repos = document.getElementById('github-repos') ||
                document.getElementById('github-repos-list');
    var watchTargets = [];
    if (repos) watchTargets.push(repos);
    // Some builds use #github-repos as the container id referenced in the brief
    // as '#github-repos'; guard for the alternate hook too.
    var alt = document.getElementById('github-repos');
    if (alt && watchTargets.indexOf(alt) === -1) watchTargets.push(alt);

    if (watchTargets.length && 'MutationObserver' in window) {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var added = muts[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var n = added[j];
            if (n.nodeType === 1) scan(n);
          }
        }
      });
      for (var t = 0; t < watchTargets.length; t++) {
        mo.observe(watchTargets[t], { childList: true, subtree: true });
      }
    }

    // Re-scan once more shortly after load in case other scripts populate cards.
    window.setTimeout(function () { scan(document); }, 1500);

    // If the user switches motion preference mid-session, reset everything.
    var onPrefChange = function () {
      if (!enabled()) {
        for (var i = 0; i < bound.length; i++) {
          var b = bound[i];
          b.el.classList.remove('tilt-active', 'tilt-tracking');
          b.el.style.transform = '';
        }
      }
    };
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onPrefChange);
    else if (reduceMQ.addListener) reduceMQ.addListener(onPrefChange);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== MODULE: egg =====
/* === egg: Konami code + "quant" easter eggs === */
(function(){
  function init(){
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var konamiPos = 0;
    var recent = '';
    var rainActive = false;
    var confettiActive = false;

    function isTyping(){
      var el = document.activeElement;
      if(!el) return false;
      var tag = (el.tagName||'').toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable === true;
    }

    function pickColors(){
      var dark = document.body.classList.contains('dark-mode');
      return {
        cyan: dark ? '#67E8F9' : '#38BDF8',
        green: dark ? '#34D399' : '#10B981',
        up: dark ? '#34D399' : '#10B981',
        down: dark ? '#F87171' : '#EF4444'
      };
    }

    /* ---------- toast ---------- */
    var activeToast = null;
    function showToast(){
      removeToast();
      var t = document.createElement('div');
      t.className = 'egg-toast';
      t.setAttribute('role','status');
      t.innerHTML =
        '<span class="egg-toast-icon" aria-hidden="true"><i class="fas fa-terminal"></i></span>' +
        '<div class="egg-toast-body">' +
          '<p class="egg-toast-title">You found the source. Green candles only.</p>' +
          '<p class="egg-toast-hint">Secret unlocked. Press <kbd>Esc</kbd> or click to dismiss &middot; psst, try typing <kbd>quant</kbd>.</p>' +
        '</div>' +
        '<button class="egg-toast-close" type="button" aria-label="Dismiss">&times;</button>';
      document.body.appendChild(t);
      activeToast = t;
      requestAnimationFrame(function(){ t.classList.add('egg-visible'); });
      var btn = t.querySelector('.egg-toast-close');
      if(btn) btn.addEventListener('click', function(e){ e.stopPropagation(); removeToast(); });
      var auto = setTimeout(removeToast, 7000);
      t._eggAuto = auto;
    }
    function removeToast(){
      if(!activeToast) return;
      var t = activeToast;
      activeToast = null;
      if(t._eggAuto) clearTimeout(t._eggAuto);
      t.classList.remove('egg-visible');
      setTimeout(function(){ if(t && t.parentNode) t.parentNode.removeChild(t); }, 400);
    }

    /* ---------- matrix rain ---------- */
    function triggerKonami(){
      showToast();
      if(reduce || rainActive) return;
      rainActive = true;

      var overlay = document.createElement('div');
      overlay.className = 'egg-overlay';
      var canvas = document.createElement('canvas');
      overlay.appendChild(canvas);
      document.body.appendChild(overlay);

      var ctx = canvas.getContext('2d');
      if(!ctx){ rainActive = false; if(overlay.parentNode) overlay.parentNode.removeChild(overlay); return; }

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W, H, cols, drops, fontSize;
      var glyphs = '01<>=+-*%$∑∫√πσΔλ∞≈≤≥01△▽0123456789'.split('');

      function resize(){
        W = window.innerWidth; H = window.innerHeight;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
        fontSize = W < 600 ? 14 : 18;
        cols = Math.ceil(W / fontSize);
        drops = new Array(cols);
        for(var i=0;i<cols;i++){ drops[i] = Math.random() * -40; }
      }
      resize();
      window.addEventListener('resize', resize);

      requestAnimationFrame(function(){ overlay.classList.add('egg-visible'); });

      var started = Date.now();
      var DURATION = 6000;
      var rafId = null;
      var fading = false;
      var lastFrame = 0;

      function cleanup(){
        if(rafId) cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
        document.removeEventListener('keydown', onEsc, true);
        overlay.removeEventListener('click', onClick);
        document.removeEventListener('visibilitychange', onVis);
        overlay.classList.remove('egg-visible');
        setTimeout(function(){ if(overlay.parentNode) overlay.parentNode.removeChild(overlay); rainActive = false; }, 600);
      }
      function endNow(){
        if(fading) return;
        fading = true;
        cleanup();
      }
      function onEsc(e){ if(e.key === 'Escape'){ e.stopPropagation(); endNow(); } }
      function onClick(){ endNow(); }
      function onVis(){ if(document.hidden) endNow(); }
      document.addEventListener('keydown', onEsc, true);
      overlay.addEventListener('click', onClick);
      document.addEventListener('visibilitychange', onVis);

      function frame(now){
        if(fading) return;
        if(document.hidden){ endNow(); return; }
        rafId = requestAnimationFrame(frame);
        if(now - lastFrame < 45){ return; }
        lastFrame = now;

        var c = pickColors();
        ctx.fillStyle = document.body.classList.contains('dark-mode')
          ? 'rgba(2,6,14,0.16)' : 'rgba(8,12,20,0.14)';
        ctx.fillRect(0,0,W,H);
        ctx.font = fontSize + "px 'Space Grotesk', monospace";

        for(var i=0;i<cols;i++){
          var ch = glyphs[(Math.random()*glyphs.length)|0];
          var x = i * fontSize;
          var y = drops[i] * fontSize;
          ctx.fillStyle = Math.random() > 0.92 ? c.green : c.cyan;
          ctx.fillText(ch, x, y);
          if(y > H && Math.random() > 0.975){ drops[i] = 0; }
          drops[i]++;
        }

        if(Date.now() - started > DURATION){ endNow(); }
      }
      rafId = requestAnimationFrame(frame);
    }

    /* ---------- ticker-arrow confetti for "quant" ---------- */
    function triggerQuant(){
      if(confettiActive) return;
      if(reduce){ flashHint('quant'); return; }
      confettiActive = true;

      var wrap = document.createElement('div');
      wrap.className = 'egg-confetti';
      var canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      document.body.appendChild(wrap);

      var ctx = canvas.getContext('2d');
      if(!ctx){ confettiActive = false; if(wrap.parentNode) wrap.parentNode.removeChild(wrap); return; }

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = window.innerWidth, H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);

      var c = pickColors();
      var N = W < 600 ? 28 : 46;
      var parts = [];
      for(var i=0;i<N;i++){
        var up = Math.random() > 0.5;
        parts.push({
          x: W*0.5 + (Math.random()-0.5)*W*0.4,
          y: H*0.55 + (Math.random()-0.5)*60,
          vx: (Math.random()-0.5)*7,
          vy: -6 - Math.random()*7,
          rot: Math.random()*Math.PI,
          vr: (Math.random()-0.5)*0.3,
          size: 10 + Math.random()*8,
          up: up,
          color: up ? c.up : c.down,
          life: 1
        });
      }

      var rafId = null;
      var started = Date.now();
      var DURATION = 2000;
      var G = 0.28;

      function cleanup(){
        if(rafId) cancelAnimationFrame(rafId);
        document.removeEventListener('visibilitychange', onVis);
        if(wrap.parentNode) wrap.parentNode.removeChild(wrap);
        confettiActive = false;
      }
      function onVis(){ if(document.hidden) cleanup(); }
      document.addEventListener('visibilitychange', onVis);

      function drawArrow(p){
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        var s = p.size, d = p.up ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(0, d*s);
        ctx.lineTo(s*0.6, -d*s*0.1);
        ctx.lineTo(s*0.24, -d*s*0.1);
        ctx.lineTo(s*0.24, -d*s);
        ctx.lineTo(-s*0.24, -d*s);
        ctx.lineTo(-s*0.24, -d*s*0.1);
        ctx.lineTo(-s*0.6, -d*s*0.1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      function frame(){
        if(document.hidden){ cleanup(); return; }
        rafId = requestAnimationFrame(frame);
        ctx.clearRect(0,0,W,H);
        var elapsed = Date.now() - started;
        var fade = elapsed > DURATION - 500 ? Math.max(0,(DURATION - elapsed)/500) : 1;
        for(var i=0;i<parts.length;i++){
          var p = parts[i];
          p.vy += G;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vr;
          p.life = fade;
          drawArrow(p);
        }
        if(elapsed > DURATION){ cleanup(); }
      }
      rafId = requestAnimationFrame(frame);
    }

    function flashHint(){ /* reduced-motion fallback: no-op visual, keeps it non-intrusive */ }

    /* ---------- key listener ---------- */
    document.addEventListener('keydown', function(e){
      var key = e.key;

      /* Konami: arrows global, letters/global ignored while typing */
      if(!isTyping()){
        var expected = KONAMI[konamiPos];
        var match = (key === expected) ||
                    (expected === 'b' && key.toLowerCase() === 'b') ||
                    (expected === 'a' && key.toLowerCase() === 'a');
        if(match){
          konamiPos++;
          if(konamiPos === KONAMI.length){
            konamiPos = 0;
            triggerKonami();
          }
        } else {
          konamiPos = (key === KONAMI[0]) ? 1 : 0;
        }

        /* "quant" word tracker — only when NOT typing in a field */
        if(key.length === 1 && /[a-zA-Z]/.test(key)){
          recent = (recent + key.toLowerCase()).slice(-5);
          if(recent === 'quant'){
            recent = '';
            triggerQuant();
          }
        } else if(key !== 'Shift' && key !== 'CapsLock'){
          recent = '';
        }
      }
    }, false);
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== EXPERIENCE MODULE: aura =====
/* === aura: ambient aurora background layer === */
(function () {
  function init() {
    if (document.getElementById('aura-layer')) return;

    var reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { reduce = false; }

    // --- Build the fixed full-viewport layer as the FIRST child of <body> ---
    var layer = document.createElement('div');
    layer.id = 'aura-layer';

    var canvas = document.createElement('canvas');
    canvas.id = 'aura-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    layer.appendChild(canvas);

    if (document.body.firstChild) {
      document.body.insertBefore(layer, document.body.firstChild);
    } else {
      document.body.appendChild(layer);
    }

    // Reduced motion: static CSS gradient only, no canvas work at all.
    if (reduce) {
      layer.classList.add('aura-static');
      return;
    }

    var ctx = canvas.getContext('2d');
    if (!ctx) {
      // Canvas unavailable — fall back to static gradient.
      layer.classList.add('aura-static');
      return;
    }

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;          // CSS pixels
    var raf = null;
    var running = false;
    var lastT = 0;

    // Pointer (target) in normalized 0..1, and smoothed actual position.
    var pTargetX = 0.5, pTargetY = 0.42;
    var pX = 0.5, pY = 0.42;
    var hasPointer = false;

    // Theme palettes. Values are [r,g,b,baseAlpha].
    var PALETTE = {
      light: {
        base: '#F9FAFB',
        blobs: [
          [56, 189, 248, 0.18],   // cyan/blue
          [99, 102, 241, 0.13],   // soft violet
          [34, 211, 238, 0.15]    // accent cyan
        ]
      },
      dark: {
        base: '#0F172A',
        blobs: [
          [96, 165, 250, 0.20],   // primary blue
          [129, 140, 248, 0.16],  // violet
          [103, 232, 249, 0.18]   // accent cyan
        ]
      }
    };

    function isDark() {
      return document.body.classList.contains('dark-mode');
    }

    // Each blob: home position (0..1), drift params, parallax depth, size.
    var blobs = [
      { hx: 0.20, hy: 0.16, r: 0.46, depth: 0.045, sx: 0.018, sy: 0.013, px: 0.0, py: 0.0 },
      { hx: 0.82, hy: 0.26, r: 0.42, depth: 0.030, sx: 0.014, sy: 0.020, px: 1.7, py: 2.4 },
      { hx: 0.58, hy: 0.90, r: 0.52, depth: 0.060, sx: 0.011, sy: 0.016, px: 4.1, py: 5.3 }
    ];

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(W * DPR));
      canvas.height = Math.max(1, Math.round(H * DPR));
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    function draw(t) {
      var time = t * 0.001; // seconds
      var pal = isDark() ? PALETTE.dark : PALETTE.light;

      // Paint the opaque base background color first.
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = pal.base;
      ctx.fillRect(0, 0, W, H);

      // Smooth pointer toward target (very gentle lerp).
      pX += (pTargetX - pX) * 0.04;
      pY += (pTargetY - pY) * 0.04;

      // Pointer offset from center, used for subtle parallax.
      var offX = (pX - 0.5);
      var offY = (pY - 0.5);

      // Additive blending so overlapping glows blend like light.
      ctx.globalCompositeOperation = 'lighter';

      var minDim = Math.min(W, H);
      var maxDim = Math.max(W, H);

      for (var i = 0; i < blobs.length; i++) {
        var b = blobs[i];

        // Slow autonomous drift via sine waves.
        var driftX = Math.sin(time * b.sx * 6.283 + b.px) * 0.06;
        var driftY = Math.cos(time * b.sy * 6.283 + b.py) * 0.06;

        // Parallax: blobs follow the cursor by depth (subtle).
        var cx = (b.hx + driftX + offX * b.depth) * W;
        var cy = (b.hy + driftY + offY * b.depth) * H;

        var radius = b.r * maxDim;

        var col = pal.blobs[i % pal.blobs.length];
        // Gentle alpha breathing.
        var breathe = 0.85 + 0.15 * Math.sin(time * 0.22 + i * 1.7);
        var a = col[3] * breathe;

        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        var rgb = col[0] + ',' + col[1] + ',' + col[2];
        grad.addColorStop(0, 'rgba(' + rgb + ',' + a.toFixed(3) + ')');
        grad.addColorStop(0.45, 'rgba(' + rgb + ',' + (a * 0.4).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(' + rgb + ',0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 6.283185);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(t) {
      if (!running) return;
      if (!lastT) lastT = t;
      lastT = t;
      draw(t);
      raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      if (document.hidden) return;
      running = true;
      lastT = 0;
      raf = window.requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (raf) {
        window.cancelAnimationFrame(raf);
        raf = null;
      }
    }

    // --- Pointer tracking (throttled via rAF target update only) ---
    function onPointerMove(e) {
      if (!W || !H) return;
      pTargetX = Math.max(0, Math.min(1, e.clientX / W));
      pTargetY = Math.max(0, Math.min(1, e.clientY / H));
      if (!hasPointer) {
        hasPointer = true;
        if (!running) start();
      }
    }

    // --- Visibility / lifecycle ---
    function onVisibility() {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    }

    var resizeTimer = null;
    function onResize() {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        resize();
        // Render one frame even if paused so it stays correct after resize.
        if (!running) { draw(performance.now ? performance.now() : Date.now()); }
      }, 120);
    }

    // React to DPR changes (zoom / monitor move) where supported.
    try {
      var dprQuery = window.matchMedia('(resolution: ' + DPR + 'dppx)');
      if (dprQuery && dprQuery.addEventListener) {
        dprQuery.addEventListener('change', onResize);
      }
    } catch (e) {}

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    resize();
    start();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== EXPERIENCE MODULE: tick =====
/* ===== Ticker Tape Band (tick) ===== */
(function () {
  function init() {
    var band = document.getElementById('tickertape');
    if (!band) return;
    var track = document.getElementById('tick-track');
    if (!track) return;
    var viewport = band.querySelector('.tick-viewport');
    if (!viewport) return;

    var reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) {}

    var duplicated = false;
    var originalHTML = track.innerHTML;

    // Pixels-per-second scroll speed (tasteful financial-ticker pace).
    var SPEED = reduce ? 28 : 60;

    function setup() {
      // Reset to a single copy before measuring.
      if (duplicated) {
        track.innerHTML = originalHTML;
        duplicated = false;
      }

      // Measure the width of one full pass of items.
      var singleWidth = track.scrollWidth;
      if (!singleWidth) return;

      // Duplicate the list so the -50% keyframe wraps seamlessly.
      track.innerHTML = originalHTML + originalHTML;
      duplicated = true;

      // Duration derived from content width => constant visual speed
      // regardless of how many items or how wide the screen is.
      var duration = singleWidth / SPEED;
      if (!isFinite(duration) || duration < 8) duration = 8;
      track.style.setProperty('--tick-duration', duration.toFixed(2) + 's');
    }

    setup();

    // Recompute on resize (font reflow / breakpoint changes) — debounced.
    var resizeTimer = null;
    function onResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setup, 200);
    }
    window.addEventListener('resize', onResize);

    // Recompute once webfonts settle (symbol widths can shift).
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
      document.fonts.ready.then(function () { setup(); }).catch(function () {});
    }

    // Pause when off-screen to save cycles.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            band.classList.remove('tick-paused');
          } else {
            band.classList.add('tick-paused');
          }
        }
      }, { threshold: 0 });
      io.observe(band);
    }

    // Pause when the tab is hidden.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        band.classList.add('tick-paused');
      } else {
        band.classList.remove('tick-paused');
      }
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== EXPERIENCE MODULE: boot =====
/* === aryan.os BOOT SEQUENCE (prefix: boot) === */
(function () {
  function init() {
    var loader = document.getElementById('loading-screen');

    // Already booted this session: just hide the old loader, do nothing else.
    var done = false;
    try { done = !!sessionStorage.getItem('boot_done'); } catch (e) { done = false; }
    if (done) {
      if (loader) loader.style.display = 'none';
      return;
    }

    // Immediately hide the old plain loader; our overlay takes over.
    if (loader) loader.style.display = 'none';

    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    function markDone() {
      try { sessionStorage.setItem('boot_done', '1'); } catch (e) {}
    }

    // Reduced motion: skip the show entirely, no flashing.
    if (reduce) {
      markDone();
      return;
    }

    // Build overlay.
    var overlay = document.createElement('div');
    overlay.className = 'boot-overlay';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-label', 'aryan.os boot sequence');

    var skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'boot-skip';
    skip.innerHTML = 'skip <span aria-hidden="true">&#9655;</span>';
    skip.setAttribute('aria-label', 'Skip boot sequence');

    var console_ = document.createElement('div');
    console_.className = 'boot-console';
    console_.innerHTML =
      '<div class="boot-titlebar">' +
        '<span class="boot-dots"><span></span><span></span><span></span></span>' +
        '<span>aryan.os terminal</span>' +
        '<span class="boot-host">/dev/visitor</span>' +
      '</div>' +
      '<div class="boot-log" aria-hidden="true"></div>' +
      '<div class="boot-progress-wrap">' +
        '<div class="boot-progress"><div class="boot-progress-fill"></div></div>' +
        '<div class="boot-progress-pct">0%</div>' +
      '</div>';

    overlay.appendChild(skip);
    overlay.appendChild(console_);
    document.body.appendChild(overlay);

    var logEl = console_.querySelector('.boot-log');
    var fillEl = console_.querySelector('.boot-progress-fill');
    var pctEl = console_.querySelector('.boot-progress-pct');

    // Boot log content. Each line: html string + optional flag.
    var LINES = [
      { html: 'aryan.os v2028.1 &mdash; booting', head: true },
      { html: '<span class="boot-ok">[ ok ]</span> mounting <span class="boot-accent">/experience</span>   ::  <span class="boot-meta">Amazon &middot; BlackRock &middot; Timing</span>' },
      { html: '<span class="boot-ok">[ ok ]</span> compiling <span class="boot-accent">/projects</span>     ::  <span class="boot-meta">FitMax &middot; Soccer-Betting &middot; RT-Risk</span>' },
      { html: '<span class="boot-ok">[ ok ]</span> loading <span class="boot-accent">/playground</span>    ::  <span class="boot-meta">GBM &middot; MonteCarlo &middot; Black-Scholes</span>' },
      { html: '<span class="boot-ok">[ ok ]</span> calibrating <span class="boot-accent">/skills</span>     ::  <span class="boot-meta">Python &middot; PyTorch &middot; OCaml</span>' },
      { html: '<span class="boot-ok">[ ok ]</span> starting terminal daemon' },
      { html: '<span class="boot-ok">[ ok ]</span> uplink <span class="boot-accent">github.com/aryan-jeena</span> established' },
      { html: '<span class="boot-ok">[ ok ]</span> systems nominal &mdash; <span class="boot-accent">welcome, visitor</span>' }
    ];

    var TOTAL_BUDGET = 2350; // ms of typing before flourish; reveal ~2.6s total
    var startTime = Date.now();
    var finished = false;
    var timers = [];

    function clearTimers() {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
    }
    function later(fn, ms) {
      var t = setTimeout(fn, ms);
      timers.push(t);
      return t;
    }

    function setProgress(p) {
      p = Math.max(0, Math.min(1, p));
      if (fillEl) fillEl.style.right = (100 - p * 100) + '%';
      if (pctEl) pctEl.textContent = Math.round(p * 100) + '%';
    }

    // Build all line nodes up front so layout is stable; reveal sequentially.
    var lineNodes = [];
    for (var i = 0; i < LINES.length; i++) {
      var p = document.createElement('p');
      p.className = 'boot-line' + (LINES[i].head ? ' boot-head' : '');
      p.style.visibility = 'hidden';
      logEl.appendChild(p);
      lineNodes.push(p);
    }
    // Trailing cursor line.
    var cursorLine = document.createElement('p');
    cursorLine.className = 'boot-line';
    cursorLine.innerHTML = '<span class="boot-dim">aryan@os</span> <span class="boot-accent">~%</span> <span class="boot-cursor"></span>';
    logEl.appendChild(cursorLine);

    // Distribute time across lines, faster after the header.
    function lineDelay(idx) {
      if (idx === 0) return 0;
      return 180 + Math.random() * 90;
    }

    var idx = 0;
    function showNext() {
      if (finished) return;
      if (idx >= lineNodes.length) {
        flourish();
        return;
      }
      var node = lineNodes[idx];
      node.innerHTML = LINES[idx].html;
      node.style.visibility = 'visible';
      // keep cursor at bottom
      logEl.appendChild(cursorLine);

      setProgress((idx + 1) / lineNodes.length);
      idx++;
      // pace to fit within budget
      var remainingLines = lineNodes.length - idx;
      var elapsed = Date.now() - startTime;
      var remainingTime = Math.max(120, TOTAL_BUDGET - elapsed);
      var nextDelay = remainingLines > 0
        ? Math.min(lineDelay(idx), remainingTime / (remainingLines + 1))
        : 160;
      later(showNext, nextDelay);
    }

    function flourish() {
      if (finished) return;
      setProgress(1);
      cursorLine.innerHTML = '<span class="boot-dim">aryan@os</span> <span class="boot-accent">~%</span> <span class="boot-accent">launch portfolio</span> <span class="boot-cursor"></span>';
      later(reveal, 260);
    }

    function reveal() {
      if (finished) return;
      finished = true;
      clearTimers();
      teardown();
      overlay.classList.add('boot-fade-out');
      markDone();
      var removed = false;
      function removeOverlay() {
        if (removed) return;
        removed = true;
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }
      overlay.addEventListener('transitionend', removeOverlay, { once: true });
      // Fallback removal in case transitionend doesn't fire.
      setTimeout(removeOverlay, 650);
    }

    // Skip on: button, any key, click/tap anywhere.
    function onKey(e) {
      // Ignore pure modifier presses so Cmd+R etc. still feel natural-ish.
      reveal();
    }
    function onPointer() { reveal(); }

    function teardown() {
      document.removeEventListener('keydown', onKey, true);
      overlay.removeEventListener('click', onPointer);
      skip.removeEventListener('click', onSkip);
      document.removeEventListener('visibilitychange', onVis);
    }
    function onSkip(e) {
      e.stopPropagation();
      reveal();
    }
    function onVis() {
      // If tab is hidden during boot, just finish instantly when it returns
      // is jarring; instead, if hidden, fast-forward to reveal silently.
      if (document.hidden) reveal();
    }

    skip.addEventListener('click', onSkip);
    overlay.addEventListener('click', onPointer);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('visibilitychange', onVis);

    // Kick off.
    setProgress(0);
    showNext();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== EXPERIENCE MODULE: snd =====
/* ===== MODULE: snd (Sound Design) ===== */
(function () {
  'use strict';

  function init() {
    if (document.getElementById('snd-toggle')) return; // guard double-init

    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    var STORE_KEY = 'snd_on';
    var soundOn = false;
    try { soundOn = localStorage.getItem(STORE_KEY) === 'true'; } catch (e) {}

    /* ---------- Audio engine (Web Audio, no files) ---------- */
    var AC = window.AudioContext || window.webkitAudioContext;
    var ctx = null;
    var master = null;
    var ready = false;

    function ensureAudio() {
      if (!AC) return false;
      if (!ctx) {
        try {
          ctx = new AC();
          master = ctx.createGain();
          master.gain.value = 0.9;
          master.connect(ctx.destination);
          ready = true;
        } catch (e) { ctx = null; return false; }
      }
      if (ctx && ctx.state === 'suspended') {
        try { ctx.resume(); } catch (e) {}
      }
      return ready;
    }

    // smooth, short voice: type 'sine'|'triangle', freq Hz, dur s, peak gain, optional glide-to freq
    function voice(freq, dur, peak, type, glideTo, delay) {
      if (!soundOn || !ensureAudio() || !ctx) return;
      var t0 = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (typeof glideTo === 'number') {
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, glideTo), t0 + dur * 0.9);
      }
      // gentle attack / release envelope
      var atk = Math.min(0.012, dur * 0.3);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
      osc.onended = function () { try { osc.disconnect(); g.disconnect(); } catch (e) {} };
    }

    /* ---------- Sound presets ---------- */
    function sBlip() {            // nav-link / button click + palette open
      voice(660, 0.085, 0.09, 'sine', 760);
    }
    function sRise() {            // theme toggle / section-enter (two-note)
      voice(523.25, 0.10, 0.085, 'sine', 587.33);     // C5
      if (!reduce) voice(783.99, 0.13, 0.075, 'sine', 880, 0.075); // G5
    }
    function sHover() {           // very quiet hover tick
      voice(1180, 0.05, 0.035, 'sine', 1180);
    }
    function sToggleClick() {     // confirmation when enabling sound
      voice(700, 0.09, 0.10, 'sine', 820);
      if (!reduce) voice(1046.5, 0.12, 0.07, 'sine', 1046.5, 0.07);
    }

    /* ---------- Build the toggle button ---------- */
    var btn = document.createElement('button');
    btn.id = 'snd-toggle';
    btn.className = 'snd-toggle';
    btn.type = 'button';

    function renderBtn() {
      btn.classList.toggle('snd-on', soundOn);
      btn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
      btn.setAttribute('aria-label', soundOn ? 'Sound on' : 'Sound off');
      btn.innerHTML =
        '<i class="fas ' + (soundOn ? 'fa-volume-high' : 'fa-volume-xmark') + '" aria-hidden="true"></i>' +
        '<span class="snd-tip" role="tooltip">Sound ' + (soundOn ? 'on' : 'off') + '</span>';
    }
    renderBtn();

    btn.addEventListener('click', function () {
      soundOn = !soundOn;
      try { localStorage.setItem(STORE_KEY, soundOn ? 'true' : 'false'); } catch (e) {}
      renderBtn();
      if (soundOn) {
        ensureAudio();          // first gesture: init + resume
        sToggleClick();
        if (!reduce) {
          btn.classList.add('snd-pulse');
          setTimeout(function () { btn.classList.remove('snd-pulse'); }, 600);
        }
      }
    });

    document.body.appendChild(btn);

    /* ---------- Hover rate-limiting ---------- */
    var lastHover = 0;
    var HOVER_GAP = reduce ? 600 : 110;
    function hoverInteractive(target) {
      if (!soundOn) return;
      var now = (window.performance && performance.now) ? performance.now() : Date.now();
      if (now - lastHover < HOVER_GAP) return;
      lastHover = now;
      sHover();
    }

    var CLICK_SEL = '.nav-links a, .btn, .hero-btn, .game-tab, #darkModeToggle, .cmdk-item, .cmdk-pill, .project-card a, .social-link, button';
    var HOVER_SEL = '.nav-links a, .btn, .hero-btn, .game-tab, #darkModeToggle, .cmdk-item';

    function matchUp(node, selector) {
      var el = node;
      while (el && el !== document.body && el.nodeType === 1) {
        if (el.matches && el.matches(selector)) return el;
        el = el.parentElement;
      }
      return null;
    }

    /* ---------- Click delegation (capture so dynamic nodes work) ---------- */
    document.addEventListener('click', function (e) {
      if (!soundOn) return;
      var t = e.target;
      if (t && (t === btn || (t.closest && t.closest('#snd-toggle')))) return; // toggle handles itself
      var hit = matchUp(t, CLICK_SEL);
      if (!hit) return;
      if (hit.id === 'darkModeToggle') { sRise(); return; }
      sBlip();
    }, true);

    /* ---------- Hover delegation ---------- */
    document.addEventListener('pointerover', function (e) {
      if (!soundOn || reduce) return;
      var t = e.target;
      if (t && t.closest && t.closest('#snd-toggle')) return;
      var hit = matchUp(t, HOVER_SEL);
      if (!hit) return;
      // ignore moves within the same element
      if (e.relatedTarget && hit.contains && hit.contains(e.relatedTarget)) return;
      hoverInteractive(hit);
    }, true);

    /* ---------- Command palette OPEN detection (no internals) ---------- */
    (function watchPalette() {
      var overlay = document.getElementById('cmdk-overlay');
      if (!overlay || typeof MutationObserver === 'undefined') return;
      var wasOpen = overlay.classList.contains('cmdk-open');
      var mo = new MutationObserver(function () {
        var nowOpen = overlay.classList.contains('cmdk-open');
        if (nowOpen && !wasOpen && soundOn) sBlip();
        wasOpen = nowOpen;
      });
      mo.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    })();

    /* ---------- Section-enter gentle rise ---------- */
    (function watchSections() {
      if (typeof IntersectionObserver === 'undefined') return;
      var ids = ['about', 'projects', 'playground', 'github-stats', 'skills', 'contact'];
      var settled = false;
      // ignore the burst of initial intersections on load
      setTimeout(function () { settled = true; }, 1200);
      var io = new IntersectionObserver(function (entries) {
        if (!settled || !soundOn || document.hidden) return;
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) { sRise(); break; }
        }
      }, { threshold: 0.55 });
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) io.observe(el);
      });
    })();

    /* ---------- Suspend audio context when tab hidden ---------- */
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      try {
        if (document.hidden) { ctx.suspend(); }
        else if (soundOn) { ctx.resume(); }
      } catch (e) {}
    });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== CREATIVE MODULE: card =====
/* ===========================================================
   HOLOGRAPHIC PLAYER CARD — prefix: card
   Cursor-reactive 3D tilt + moving holographic foil.
   Gyro on mobile, idle shimmer fallback, reduced-motion safe.
   =========================================================== */
(function () {
  function init() {
    var card = document.getElementById('card-holo');
    if (!card) return;
    var wrap = document.getElementById('card-holo-wrap') || card.parentNode;
    if (!wrap) return;

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { reduceMotion = false; }

    var finePointer = false;
    try {
      finePointer = window.matchMedia &&
        window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    } catch (e) { finePointer = false; }

    // Max tilt (degrees) and helpers
    var MAX_TILT = 12;
    var rafId = null;
    var target = { rx: 0, ry: 0, mx: 50, my: 50, glow: 0, lift: 0 };
    var current = { rx: 0, ry: 0, mx: 50, my: 50, glow: 0, lift: 0 };
    var pointerInside = false;
    var visible = true;
    var gyroActive = false;

    function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

    // Apply current values to CSS custom properties
    function paint() {
      card.style.setProperty('--card-rx', current.rx.toFixed(2) + 'deg');
      card.style.setProperty('--card-ry', current.ry.toFixed(2) + 'deg');
      card.style.setProperty('--card-mx', current.mx.toFixed(2) + '%');
      card.style.setProperty('--card-my', current.my.toFixed(2) + '%');
      card.style.setProperty('--card-glow', current.glow.toFixed(3));
      card.style.setProperty('--card-lift', current.lift.toFixed(2) + 'px');
    }

    // Spring-ish easing toward target each frame
    function loop() {
      rafId = null;
      var ease = pointerInside ? 0.22 : 0.10; // faster while tracking, smooth reset
      var done = true;
      ['rx', 'ry', 'mx', 'my', 'glow', 'lift'].forEach(function (k) {
        var d = target[k] - current[k];
        if (Math.abs(d) > 0.01) {
          current[k] += d * ease;
          done = false;
        } else {
          current[k] = target[k];
        }
      });
      paint();
      if (!done && !document.hidden && visible) {
        rafId = window.requestAnimationFrame(loop);
      }
    }
    function kick() {
      if (rafId == null && !document.hidden && visible) {
        rafId = window.requestAnimationFrame(loop);
      }
    }

    // ---- Pointer (desktop fine pointer) ----
    function onPointerMove(e) {
      if (reduceMotion || !visible || document.hidden) return;
      var rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var px = (e.clientX - rect.left) / rect.width;   // 0..1
      var py = (e.clientY - rect.top) / rect.height;   // 0..1
      px = clamp(px, 0, 1); py = clamp(py, 0, 1);
      target.mx = px * 100;
      target.my = py * 100;
      // tilt: pointer right -> rotateY positive; pointer up -> rotateX positive
      target.ry = (px - 0.5) * 2 * MAX_TILT;
      target.rx = -(py - 0.5) * 2 * MAX_TILT;
      target.glow = 1;
      target.lift = -8;
      kick();
    }
    function onPointerEnter() {
      if (reduceMotion) return;
      pointerInside = true;
      card.classList.add('card-active');
      card.classList.remove('card-idle-shimmer');
      kick();
    }
    function onPointerLeave() {
      pointerInside = false;
      card.classList.remove('card-active');
      target.rx = 0; target.ry = 0;
      target.mx = 50; target.my = 50;
      target.glow = 0; target.lift = 0;
      kick();
    }

    // ---- Device orientation (mobile gyro) ----
    function onDeviceOrientation(e) {
      if (reduceMotion || !visible || document.hidden) return;
      if (e.beta == null && e.gamma == null) return;
      gyroActive = true;
      card.classList.remove('card-idle-shimmer');
      // gamma: left-right [-90,90]; beta: front-back [-180,180]
      var g = clamp(e.gamma || 0, -45, 45) / 45;   // -1..1
      var b = clamp((e.beta || 0) - 45, -45, 45) / 45; // center around natural hold
      target.ry = g * MAX_TILT;
      target.rx = -b * MAX_TILT;
      target.mx = (g * 0.5 + 0.5) * 100;
      target.my = (b * 0.5 + 0.5) * 100;
      target.glow = 0.85;
      kick();
    }

    function enableIdleShimmer() {
      if (reduceMotion || gyroActive) return;
      card.classList.add('card-idle-shimmer');
    }

    // ---- Wire up by capability ----
    var hasGyro = ('DeviceOrientationEvent' in window);
    var listeningOrientation = false;

    if (reduceMotion) {
      // No tilt; static subtle sheen handled entirely by CSS. Nothing to bind.
    } else if (finePointer) {
      card.addEventListener('pointerenter', onPointerEnter);
      card.addEventListener('pointermove', onPointerMove);
      card.addEventListener('pointerleave', onPointerLeave);
    } else if (hasGyro) {
      // iOS 13+ requires a user gesture to request permission.
      var needsPermission =
        typeof window.DeviceOrientationEvent.requestPermission === 'function';
      if (needsPermission) {
        // Fall back to idle shimmer until user taps to enable motion.
        enableIdleShimmer();
        var requestGyro = function () {
          window.DeviceOrientationEvent.requestPermission().then(function (state) {
            if (state === 'granted') {
              window.addEventListener('deviceorientation', onDeviceOrientation, true);
              listeningOrientation = true;
            }
          }).catch(function () {});
          card.removeEventListener('click', requestGyro);
        };
        card.addEventListener('click', requestGyro);
      } else {
        window.addEventListener('deviceorientation', onDeviceOrientation, true);
        listeningOrientation = true;
        // If no orientation events arrive shortly, shimmer instead.
        window.setTimeout(function () {
          if (!gyroActive) enableIdleShimmer();
        }, 1400);
      }
    } else {
      enableIdleShimmer();
    }

    // ---- Visibility / reveal via IntersectionObserver ----
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          if (visible) {
            card.classList.add('card-revealed'); // animate stat bars in
            kick();
          } else {
            // settle to rest off-screen and stop the loop
            if (!pointerInside) {
              target.rx = 0; target.ry = 0; target.glow = 0; target.lift = 0;
            }
          }
        });
      }, { threshold: 0.2 });
      io.observe(card);
    } else {
      visible = true;
      card.classList.add('card-revealed');
    }

    // Pause/resume loop on tab visibility
    function onVisChange() {
      if (document.hidden) {
        if (rafId != null) { window.cancelAnimationFrame(rafId); rafId = null; }
      } else {
        kick();
      }
    }
    document.addEventListener('visibilitychange', onVisChange);

    // Keyboard accessibility: focusing the card gives a gentle tilt pulse
    card.addEventListener('focus', function () {
      if (reduceMotion) return;
      target.glow = 0.7; target.ry = 5; target.rx = -3; target.lift = -6;
      kick();
      window.setTimeout(function () {
        if (!pointerInside) {
          target.glow = 0; target.ry = 0; target.rx = 0; target.lift = 0;
          kick();
        }
      }, 900);
    });
    card.addEventListener('blur', function () {
      if (pointerInside) return;
      target.glow = 0; target.ry = 0; target.rx = 0; target.lift = 0;
      kick();
    });

    // Initial paint
    paint();
    if (!reduceMotion) kick();

    // ---- Cleanup helper (uniquely named global) ----
    window.cardHoloDestroy = function () {
      if (rafId != null) { window.cancelAnimationFrame(rafId); rafId = null; }
      if (io) { try { io.disconnect(); } catch (e) {} }
      document.removeEventListener('visibilitychange', onVisChange);
      if (finePointer) {
        card.removeEventListener('pointerenter', onPointerEnter);
        card.removeEventListener('pointermove', onPointerMove);
        card.removeEventListener('pointerleave', onPointerLeave);
      }
      if (listeningOrientation) {
        window.removeEventListener('deviceorientation', onDeviceOrientation, true);
      }
    };
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== CREATIVE MODULE: con =====
/* ===== Skills Constellation (prefix: con) ===== */
(function () {
  function init() {
    var wrap = document.getElementById('con-wrap');
    if (!wrap) return;
    var canvas = document.getElementById('con-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var resetBtn = document.getElementById('con-reset');

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (e) { reduceMotion = false; }

    // ---- Theme palette (read live) ----
    function isDark() { return document.body.classList.contains('dark-mode'); }
    var CLUSTER_COLORS = {
      lang:  { light: '#38BDF8', dark: '#67E8F9' },
      ml:    { light: '#A78BFA', dark: '#C4B5FD' },
      quant: { light: '#34D399', dark: '#6EE7B7' },
      sys:   { light: '#FB923C', dark: '#FDBA74' }
    };
    function clusterColor(key) {
      var c = CLUSTER_COLORS[key] || CLUSTER_COLORS.lang;
      return isDark() ? c.dark : c.light;
    }
    function centralColor() { return isDark() ? '#F1F5F9' : '#111827'; }
    function textColor() { return isDark() ? '#F1F5F9' : '#111827'; }
    function edgeColor(a) {
      return isDark()
        ? 'rgba(148,163,184,' + a + ')'
        : 'rgba(71,85,105,' + a + ')';
    }
    function nodeStroke() {
      return isDark() ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.92)';
    }
    function labelBg() {
      return isDark() ? 'rgba(15,23,42,0.82)' : 'rgba(255,255,255,0.88)';
    }

    // ---- Graph definition ----
    var clusters = [
      { id: 'lang',  label: 'Languages',     key: 'lang',
        leaves: ['Python', 'Java', 'TypeScript', 'OCaml', 'SQL'] },
      { id: 'ml',    label: 'ML / AI',       key: 'ml',
        leaves: ['PyTorch', 'Hugging Face', 'TensorFlow', 'Scikit-learn', 'CatBoost'] },
      { id: 'quant', label: 'Quant · Math', key: 'quant',
        leaves: ['NumPy', 'pandas', 'Probability', 'Optimization', 'Real Analysis'] },
      { id: 'sys',   label: 'Systems · Infra', key: 'sys',
        leaves: ['FastAPI', 'Docker', 'Kafka', 'Redis', 'PostgreSQL', 'Git'] }
    ];

    var nodes = [];
    var edges = [];
    var byId = {};

    function addNode(n) { nodes.push(n); byId[n.id] = n; return n; }

    // central node
    var central = addNode({
      id: 'center', label: 'Aryan', type: 'center', cluster: null,
      x: 0, y: 0, vx: 0, vy: 0, r: 17, fixed: false, mass: 4
    });

    var clusterIndex = 0;
    var nClusters = clusters.length;
    clusters.forEach(function (cl) {
      var ang = (clusterIndex / nClusters) * Math.PI * 2 - Math.PI / 2;
      clusterIndex++;
      var hub = addNode({
        id: 'hub_' + cl.id, label: cl.label, type: 'hub', cluster: cl.key,
        x: Math.cos(ang) * 90, y: Math.sin(ang) * 90,
        vx: 0, vy: 0, r: 11, fixed: false, mass: 2.2
      });
      edges.push({ a: central.id, b: hub.id, hub: true });
      cl.leaves.forEach(function (leaf, li) {
        var la = ang + (li - (cl.leaves.length - 1) / 2) * 0.34;
        var lf = addNode({
          id: cl.id + '_' + li, label: leaf, type: 'leaf', cluster: cl.key,
          x: Math.cos(la) * 175, y: Math.sin(la) * 175,
          vx: 0, vy: 0, r: 5.5, fixed: false, mass: 1
        });
        edges.push({ a: hub.id, b: lf.id, hub: false });
      });
    });

    // adjacency for highlight
    var neighbors = {};
    nodes.forEach(function (n) { neighbors[n.id] = {}; });
    edges.forEach(function (e) {
      neighbors[e.a][e.b] = true;
      neighbors[e.b][e.a] = true;
    });

    // ---- Sizing / DPR ----
    var W = 0, H = 0, dpr = 1, cx = 0, cy = 0;
    function resize() {
      var rect = canvas.getBoundingClientRect();
      var cssW = Math.max(1, Math.round(rect.width));
      var cssH = Math.max(1, Math.round(rect.height));
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2.5));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      W = cssW; H = cssH;
      cx = W / 2; cy = H / 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ---- Physics ----
    var EDGE_LEN_HUB = 78;
    var EDGE_LEN_LEAF = 56;
    var SPRING = 0.018;
    var REPULSE = 1500;
    var CENTER_PULL = 0.0009;
    var DAMP = 0.86;
    var MAX_V = 14;

    function step(dt) {
      var n = nodes.length, i, j;
      // repulsion (O(n^2), small n)
      for (i = 0; i < n; i++) {
        var a = nodes[i];
        for (j = i + 1; j < n; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 0.01) { d2 = 0.01; dx = (Math.random() - 0.5) * 0.1; dy = (Math.random() - 0.5) * 0.1; }
          var d = Math.sqrt(d2);
          var minD = (a.r + b.r) + 26;
          var f = REPULSE / d2;
          if (d < minD) f += (minD - d) * 0.06; // soft collision
          var fx = (dx / d) * f, fy = (dy / d) * f;
          a.vx += fx / a.mass; a.vy += fy / a.mass;
          b.vx -= fx / b.mass; b.vy -= fy / b.mass;
        }
      }
      // springs (edges)
      for (i = 0; i < edges.length; i++) {
        var e = edges[i];
        var na = byId[e.a], nb = byId[e.b];
        var ex = nb.x - na.x, ey = nb.y - na.y;
        var ed = Math.sqrt(ex * ex + ey * ey) || 0.01;
        var rest = e.hub ? EDGE_LEN_HUB : EDGE_LEN_LEAF;
        var disp = (ed - rest) * SPRING;
        var ux = ex / ed, uy = ey / ed;
        na.vx += ux * disp / na.mass; na.vy += uy * disp / na.mass;
        nb.vx -= ux * disp / nb.mass; nb.vy -= uy * disp / nb.mass;
      }
      // centering toward origin (graph local coords, origin = canvas center)
      for (i = 0; i < n; i++) {
        var p = nodes[i];
        p.vx -= p.x * CENTER_PULL * (p.type === 'center' ? 6 : 1);
        p.vy -= p.y * CENTER_PULL * (p.type === 'center' ? 6 : 1);
      }
      // integrate
      for (i = 0; i < n; i++) {
        var q = nodes[i];
        if (q.fixed) { q.vx = 0; q.vy = 0; continue; }
        q.vx *= DAMP; q.vy *= DAMP;
        if (q.vx > MAX_V) q.vx = MAX_V; else if (q.vx < -MAX_V) q.vx = -MAX_V;
        if (q.vy > MAX_V) q.vy = MAX_V; else if (q.vy < -MAX_V) q.vy = -MAX_V;
        q.x += q.vx * dt; q.y += q.vy * dt;
      }
    }

    function settle(iterations) {
      for (var k = 0; k < iterations; k++) step(1);
    }

    // ---- Persistence ----
    var STORE_KEY = 'con_layout_v1';
    function saveLayout() {
      try {
        var data = {};
        nodes.forEach(function (n) { data[n.id] = [Math.round(n.x * 10) / 10, Math.round(n.y * 10) / 10]; });
        localStorage.setItem(STORE_KEY, JSON.stringify(data));
      } catch (e) {}
    }
    function loadLayout() {
      try {
        var raw = localStorage.getItem(STORE_KEY);
        if (!raw) return false;
        var data = JSON.parse(raw);
        if (!data) return false;
        var ok = false;
        nodes.forEach(function (n) {
          if (data[n.id] && isFinite(data[n.id][0]) && isFinite(data[n.id][1])) {
            n.x = data[n.id][0]; n.y = data[n.id][1]; n.vx = 0; n.vy = 0; ok = true;
          }
        });
        return ok;
      } catch (e) { return false; }
    }
    function clearLayout() {
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    }

    // ---- Hover / drag state ----
    var hoverId = null;
    var dragNode = null;
    var dragOffX = 0, dragOffY = 0;
    var pointerActive = false;
    var lastPointer = { x: 0, y: 0, has: false };

    function toLocal(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      return { x: (clientX - rect.left) - cx, y: (clientY - rect.top) - cy };
    }
    function pickNode(lx, ly) {
      var best = null, bestD = Infinity;
      for (var i = nodes.length - 1; i >= 0; i--) {
        var nd = nodes[i];
        var dx = lx - nd.x, dy = ly - nd.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var hit = nd.r + 9;
        if (d <= hit && d < bestD) { bestD = d; best = nd; }
      }
      return best;
    }

    function onPointerDown(ev) {
      if (ev.button != null && ev.button !== 0 && ev.pointerType === 'mouse') return;
      var loc = toLocal(ev.clientX, ev.clientY);
      var nd = pickNode(loc.x, loc.y);
      if (nd) {
        dragNode = nd;
        nd.fixed = true;
        dragOffX = nd.x - loc.x;
        dragOffY = nd.y - loc.y;
        hoverId = nd.id;
        pointerActive = true;
        canvas.classList.add('con-grabbing');
        wake();
        try { canvas.setPointerCapture(ev.pointerId); } catch (e) {}
        ev.preventDefault();
      }
    }
    function onPointerMove(ev) {
      var loc = toLocal(ev.clientX, ev.clientY);
      lastPointer.x = loc.x; lastPointer.y = loc.y; lastPointer.has = true;
      if (dragNode) {
        dragNode.x = loc.x + dragOffX;
        dragNode.y = loc.y + dragOffY;
        dragNode.vx = 0; dragNode.vy = 0;
        wake();
        ev.preventDefault();
      } else {
        var nd = pickNode(loc.x, loc.y);
        var newHover = nd ? nd.id : null;
        if (newHover !== hoverId) {
          hoverId = newHover;
          if (!running && reduceMotion) renderOnce(); // refresh highlight when static
        }
      }
    }
    function endDrag(ev) {
      if (dragNode) {
        dragNode.fixed = false;
        dragNode = null;
        canvas.classList.remove('con-grabbing');
        pointerActive = false;
        saveLayout();
        wake();
        if (ev && ev.pointerId != null) {
          try { canvas.releasePointerCapture(ev.pointerId); } catch (e) {}
        }
      }
    }
    function onLeave() {
      lastPointer.has = false;
      if (!dragNode) {
        if (hoverId !== null) {
          hoverId = null;
          if (!running && reduceMotion) renderOnce();
        }
      }
    }

    // ---- Idle breathing ----
    var t0 = performance.now ? performance.now() : Date.now();

    // ---- Rendering ----
    function roundRectPath(c, x, y, w, h, r) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    function activeSet() {
      if (!hoverId) return null;
      var set = {};
      set[hoverId] = true;
      var nb = neighbors[hoverId];
      for (var k in nb) if (nb.hasOwnProperty(k)) set[k] = true;
      return set;
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      var active = activeSet();
      var breathe = reduceMotion ? 0 : Math.sin((now - t0) / 1400) * 0.5 + 0.5; // 0..1

      // edges
      for (var i = 0; i < edges.length; i++) {
        var e = edges[i];
        var a = byId[e.a], b = byId[e.b];
        var ax = a.x + cx, ay = a.y + cy, bx = b.x + cx, by = b.y + cy;
        var lit = active && active[e.a] && active[e.b];
        var dim = active && !lit;
        var baseA = e.hub ? 0.30 : 0.16;
        var alpha = lit ? 0.7 : (dim ? baseA * 0.28 : baseA);
        ctx.strokeStyle = lit ? clusterColor(b.cluster || a.cluster) : edgeColor(alpha);
        if (lit) ctx.globalAlpha = 0.85; else ctx.globalAlpha = 1;
        ctx.lineWidth = lit ? 1.8 : (e.hub ? 1.2 : 0.8);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // nodes (leaves, hubs, center order so center on top)
      var order = nodes.slice().sort(function (p, q) {
        var rank = { leaf: 0, hub: 1, center: 2 };
        return rank[p.type] - rank[q.type];
      });
      for (var j = 0; j < order.length; j++) {
        var n = order[j];
        var nx = n.x + cx, ny = n.y + cy;
        var isActive = active && active[n.id];
        var dimmed = active && !isActive;
        var r = n.r;
        var pulse = 0;
        if (!reduceMotion) {
          if (n.type === 'center') pulse = breathe * 1.6;
          else if (n.type === 'hub') pulse = breathe * 0.9;
        }
        if (isActive) pulse += 1.4;
        var rr = r + pulse;

        var col;
        if (n.type === 'center') col = centralColor();
        else col = clusterColor(n.cluster);

        ctx.globalAlpha = dimmed ? 0.30 : 1;

        // glow for center / hub / active
        if ((n.type !== 'leaf' || isActive) && !dimmed) {
          var glowR = rr + (n.type === 'center' ? 12 : (n.type === 'hub' ? 8 : 6));
          var grad = ctx.createRadialGradient(nx, ny, rr * 0.4, nx, ny, glowR);
          grad.addColorStop(0, hexA(col, isActive ? 0.40 : 0.26));
          grad.addColorStop(1, hexA(col, 0));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(nx, ny, glowR, 0, Math.PI * 2);
          ctx.fill();
        }

        // body
        ctx.beginPath();
        ctx.arc(nx, ny, rr, 0, Math.PI * 2);
        if (n.type === 'leaf') {
          ctx.fillStyle = hexA(col, 0.85);
        } else {
          var bg = ctx.createRadialGradient(nx - rr * 0.3, ny - rr * 0.3, 1, nx, ny, rr);
          bg.addColorStop(0, lighten(col));
          bg.addColorStop(1, col);
          ctx.fillStyle = bg;
        }
        ctx.fill();
        ctx.lineWidth = n.type === 'center' ? 2.2 : (n.type === 'hub' ? 1.8 : 1.2);
        ctx.strokeStyle = nodeStroke();
        ctx.stroke();

        ctx.globalAlpha = 1;
      }

      // labels: hubs + center always; leaves only when active/hovered
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var m = 0; m < nodes.length; m++) {
        var nl = nodes[m];
        var showLeaf = active && active[nl.id] && nl.type === 'leaf';
        var prominent = active && active[nl.id];
        if (nl.type === 'leaf' && !showLeaf) continue;
        var dim2 = active && !active[nl.id];
        if (dim2 && nl.type === 'leaf') continue;

        var lx = nl.x + cx;
        var ly = nl.y + cy + nl.r + (nl.type === 'leaf' ? 11 : 14);
        if (nl.type === 'center') ly = nl.y + cy + nl.r + 15;

        var fs = nl.type === 'center' ? 13 : (nl.type === 'hub' ? 11.5 : 10.5);
        var weight = (nl.type === 'leaf') ? '600' : '700';
        if (prominent) { fs += 1; weight = '700'; }
        ctx.font = weight + ' ' + fs + "px 'Inter', system-ui, sans-serif";
        var txt = nl.label;
        var tw = ctx.measureText(txt).width;

        ctx.globalAlpha = dim2 ? 0.4 : 1;
        // pill background for legibility
        var padX = 6, padY = 3;
        roundRectPath(ctx, lx - tw / 2 - padX, ly - fs / 2 - padY, tw + padX * 2, fs + padY * 2, 5);
        ctx.fillStyle = labelBg();
        ctx.fill();
        if (prominent) {
          ctx.lineWidth = 1;
          ctx.strokeStyle = hexA(nl.type === 'center' ? centralColor() : clusterColor(nl.cluster), 0.55);
          ctx.stroke();
        }
        ctx.fillStyle = textColor();
        ctx.fillText(txt, lx, ly + 0.5);
        ctx.globalAlpha = 1;
      }
    }

    function renderOnce() {
      var now = performance.now ? performance.now() : Date.now();
      draw(now);
    }

    // ---- color helpers ----
    function hexA(hex, a) {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var r = parseInt(h.substring(0, 2), 16);
      var g = parseInt(h.substring(2, 4), 16);
      var b = parseInt(h.substring(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }
    function lighten(hex) {
      var h = hex.replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var r = parseInt(h.substring(0, 2), 16);
      var g = parseInt(h.substring(2, 4), 16);
      var b = parseInt(h.substring(4, 6), 16);
      r = Math.min(255, Math.round(r + (255 - r) * 0.35));
      g = Math.min(255, Math.round(g + (255 - g) * 0.35));
      b = Math.min(255, Math.round(b + (255 - b) * 0.35));
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    // ---- Animation loop ----
    var running = false;
    var rafId = null;
    var lastFrame = 0;
    var idleEnergy = 0;
    var visible = true;

    function frame(now) {
      if (!running) return;
      var dt = Math.min(2, (now - lastFrame) / 16.67) || 1;
      lastFrame = now;

      if (!reduceMotion) {
        step(dt);
      } else if (dragNode) {
        step(dt); // allow reaction while dragging in reduced motion
      }

      draw(now);

      // determine if we can sleep (settled & no interaction & no idle motion needed)
      if (reduceMotion && !dragNode && !pointerActive) {
        // static: stop after a render
        running = false;
        rafId = null;
        return;
      }
      rafId = requestAnimationFrame(frame);
    }

    function wake() {
      if (!visible || document.hidden) return;
      if (!running) {
        running = true;
        lastFrame = performance.now ? performance.now() : Date.now();
        rafId = requestAnimationFrame(frame);
      }
    }
    function sleep() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }

    // ---- Visibility ----
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          visible = entries[i].isIntersecting;
        }
        if (visible && !document.hidden) {
          if (reduceMotion) { renderOnce(); }
          else wake();
        } else {
          sleep();
        }
      }, { threshold: 0.04 });
      io.observe(wrap);
    } else {
      visible = true;
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) sleep();
      else if (visible) { if (reduceMotion) renderOnce(); else wake(); }
    });

    // ---- Theme change observer: re-render so colors update live ----
    var themeObs = null;
    try {
      themeObs = new MutationObserver(function () {
        if (visible && !document.hidden) {
          if (reduceMotion) renderOnce(); else wake();
        }
      });
      themeObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    } catch (e) {}

    // ---- Resize ----
    var resizeTimer = null;
    function handleResize() {
      resize();
      if (visible && !document.hidden) {
        if (reduceMotion) renderOnce(); else wake();
      }
    }
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 60);
      });
      ro.observe(wrap);
    } else {
      window.addEventListener('resize', function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleResize, 80);
      });
    }

    // ---- Pointer events ----
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', onLeave);

    // ---- Reset button ----
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        clearLayout();
        // re-seed positions radially and re-settle
        var ci = 0;
        nodes.forEach(function (n) { n.vx = 0; n.vy = 0; });
        central.x = 0; central.y = 0;
        clusters.forEach(function (cl) {
          var ang = (ci / nClusters) * Math.PI * 2 - Math.PI / 2; ci++;
          var hub = byId['hub_' + cl.id];
          hub.x = Math.cos(ang) * 90; hub.y = Math.sin(ang) * 90;
          cl.leaves.forEach(function (leaf, li) {
            var la = ang + (li - (cl.leaves.length - 1) / 2) * 0.34;
            var lf = byId[cl.id + '_' + li];
            lf.x = Math.cos(la) * 175; lf.y = Math.sin(la) * 175;
          });
        });
        if (reduceMotion) { settle(320); renderOnce(); saveLayout(); }
        else { wake(); }
      });
    }

    // ---- Boot ----
    resize();
    var loaded = loadLayout();
    if (reduceMotion) {
      if (!loaded) settle(360);
      renderOnce();
      if (!loaded) saveLayout();
    } else {
      if (!loaded) settle(40); // small pre-settle so first frames aren't chaotic
      if (visible) wake();
      // periodic autosave during interaction handled on dragend; also save once settled
      setTimeout(function () { if (visible) saveLayout(); }, 4000);
    }
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// ===== CREATIVE MODULE: ach =====
/* ============================================================
   ACHIEVEMENTS / SECRETS SYSTEM  (prefix: ach)
   Self-contained IIFE. Exposes window.ajAchieve(id).
   ============================================================ */
(function () {
  'use strict';

  var STORE_KEY = 'ach_unlocked';
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ACHIEVEMENTS = [
    { id: 'palette',  title: 'Power User', hint: 'Open the command palette.',                      icon: 'fa-terminal' },
    { id: 'quant',    title: 'Quant Desk', hint: 'Experiment with the Quant Playground.',           icon: 'fa-chart-line' },
    { id: 'arena',    title: 'Mathlete',   hint: 'Enter the Math Arena.',                            icon: 'fa-calculator' },
    { id: 'terminal', title: 'Shell Access', hint: 'Type something into the terminal.',             icon: 'fa-keyboard' },
    { id: 'theme',    title: 'Day & Night', hint: 'Toggle between light and dark mode.',            icon: 'fa-circle-half-stroke' },
    { id: 'sound',    title: 'Sound On',    hint: 'Find and toggle the sound control.',             icon: 'fa-volume-high' },
    { id: 'konami',   title: 'Cheat Code',  hint: 'Some classics never get old. (try a code)',      icon: 'fa-gamepad' },
    { id: 'word',     title: 'Insider',     hint: 'Speak the language. Type a five-letter word.',   icon: 'fa-comment-dots' },
    { id: 'explorer', title: 'Full Tour',   hint: 'Scroll through every section of the site.',      icon: 'fa-compass' }
  ];
  var BY_ID = {};
  ACHIEVEMENTS.forEach(function (a) { BY_ID[a.id] = a; });
  var TOTAL = ACHIEVEMENTS.length;

  /* descriptions shown once unlocked */
  var DESC = {
    palette:  'Summoned the command palette like a true power user.',
    quant:    'Got hands-on with the Quant Playground.',
    arena:    'Stepped into the Math Arena.',
    terminal: 'Earned shell access via the terminal.',
    theme:    'Switched between day and night.',
    sound:    'Tuned the soundscape on or off.',
    konami:   'Up, up, down, down... you know the rest.',
    word:     'Spoke the secret word: "quant".',
    explorer: 'Toured every section, start to finish.'
  };

  /* ---- persistence ---- */
  function loadUnlocked() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return {};
      var arr = JSON.parse(raw);
      var out = {};
      if (Array.isArray(arr)) {
        arr.forEach(function (id) { if (BY_ID[id]) out[id] = true; });
      }
      return out;
    } catch (e) { return {}; }
  }
  function saveUnlocked() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(Object.keys(unlocked)));
    } catch (e) { /* ignore */ }
  }

  var unlocked = {};
  var initialized = false;
  var els = {};

  function unlockedCount() {
    var n = 0;
    for (var k in unlocked) { if (unlocked.hasOwnProperty(k)) n++; }
    return n;
  }

  /* ---- core unlock ---- */
  function unlock(id) {
    if (!BY_ID[id] || unlocked[id]) return;
    unlocked[id] = true;
    saveUnlocked();
    updateBadge(true);
    showToast(BY_ID[id]);
    if (els.modal && els.modal.classList.contains('ach-modal-open')) renderModalList();
  }

  /* expose globally (single uniquely-named function) */
  window.ajAchieve = function (id) { unlock(id); };

  /* ---- badge ---- */
  function buildBadge() {
    var actions = document.querySelector('.nav-actions');
    if (!actions) return;
    if (document.getElementById('ach-badge')) return;

    var btn = document.createElement('button');
    btn.id = 'ach-badge';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'View achievements');
    btn.innerHTML =
      '<i class="fas fa-trophy ach-badge-icon" aria-hidden="true"></i>' +
      '<span class="ach-badge-count">0/' + TOTAL + '</span>';

    var anchor = document.getElementById('darkModeToggle');
    if (anchor && anchor.parentNode === actions) {
      actions.insertBefore(btn, anchor);
    } else {
      actions.insertBefore(btn, actions.firstChild);
    }
    btn.addEventListener('click', openModal);
    els.badge = btn;
  }
  function updateBadge(pulse) {
    if (!els.badge) return;
    var c = els.badge.querySelector('.ach-badge-count');
    if (c) c.textContent = unlockedCount() + '/' + TOTAL;
    if (pulse && !REDUCE) {
      els.badge.classList.remove('ach-badge-pulse');
      /* force reflow so animation restarts */
      void els.badge.offsetWidth;
      els.badge.classList.add('ach-badge-pulse');
    }
  }

  /* ---- toasts ---- */
  function ensureToastStack() {
    if (els.toastStack && document.body.contains(els.toastStack)) return els.toastStack;
    var s = document.createElement('div');
    s.id = 'ach-toast-stack';
    s.setAttribute('aria-live', 'polite');
    document.body.appendChild(s);
    els.toastStack = s;
    return s;
  }
  function showToast(ach) {
    var stack = ensureToastStack();
    var t = document.createElement('div');
    t.className = 'ach-toast';
    t.setAttribute('role', 'status');
    t.innerHTML =
      '<div class="ach-toast-icon"><i class="fas ' + ach.icon + '" aria-hidden="true"></i></div>' +
      '<div class="ach-toast-body">' +
        '<span class="ach-toast-label">Achievement unlocked</span>' +
        '<span class="ach-toast-title"></span>' +
      '</div>';
    t.querySelector('.ach-toast-title').textContent = ach.title;
    stack.appendChild(t);

    /* enter */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { t.classList.add('ach-toast-in'); });
    });

    var dismissT, removeT;
    function dismiss() {
      t.classList.remove('ach-toast-in');
      t.classList.add('ach-toast-out');
      removeT = setTimeout(function () {
        if (t.parentNode) t.parentNode.removeChild(t);
        if (els.toastStack && !els.toastStack.children.length) {
          els.toastStack.parentNode && els.toastStack.parentNode.removeChild(els.toastStack);
          els.toastStack = null;
        }
      }, REDUCE ? 180 : 380);
    }
    dismissT = setTimeout(dismiss, 3500);
    /* prevent dangling timers on pagehide */
    t._achCleanup = function () { clearTimeout(dismissT); clearTimeout(removeT); };
  }

  /* ---- modal ---- */
  function buildModal() {
    if (document.getElementById('ach-modal')) return;
    var m = document.createElement('div');
    m.id = 'ach-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-label', 'Achievements');
    m.innerHTML =
      '<div class="ach-modal-card" role="document">' +
        '<div class="ach-modal-header">' +
          '<div class="ach-modal-titlerow">' +
            '<span class="ach-modal-title"><i class="fas fa-trophy" aria-hidden="true"></i> Achievements</span>' +
            '<button class="ach-modal-close" type="button" aria-label="Close">&times;</button>' +
          '</div>' +
          '<div class="ach-progress-wrap">' +
            '<div class="ach-progress-meta"><span>Progress</span><strong class="ach-progress-count">0 / ' + TOTAL + '</strong></div>' +
            '<div class="ach-progress-track"><div class="ach-progress-fill"></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="ach-modal-list"></div>' +
        '<div class="ach-modal-footer">' +
          '<span>Explore the site to unlock more.</span>' +
          '<button class="ach-reset" type="button">Reset progress</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(m);
    els.modal = m;
    els.modalCard = m.querySelector('.ach-modal-card');
    els.modalList = m.querySelector('.ach-modal-list');
    els.progressFill = m.querySelector('.ach-progress-fill');
    els.progressCount = m.querySelector('.ach-progress-count');

    m.addEventListener('click', function (e) {
      if (e.target === m) closeModal();
    });
    m.querySelector('.ach-modal-close').addEventListener('click', closeModal);
    m.querySelector('.ach-reset').addEventListener('click', function () {
      unlocked = {};
      saveUnlocked();
      updateBadge(false);
      renderModalList();
    });
  }

  function renderModalList() {
    if (!els.modalList) return;
    var html = '';
    ACHIEVEMENTS.forEach(function (a) {
      var isUn = !!unlocked[a.id];
      if (isUn) {
        html +=
          '<div class="ach-item ach-unlocked">' +
            '<div class="ach-item-icon"><i class="fas ' + a.icon + '" aria-hidden="true"></i></div>' +
            '<div class="ach-item-body">' +
              '<div class="ach-item-title">' + escapeHtml(a.title) + '</div>' +
              '<div class="ach-item-desc">' + escapeHtml(DESC[a.id] || '') + '</div>' +
            '</div>' +
          '</div>';
      } else {
        html +=
          '<div class="ach-item ach-locked">' +
            '<div class="ach-item-icon"><i class="fas fa-lock" aria-hidden="true"></i></div>' +
            '<div class="ach-item-body">' +
              '<div class="ach-item-title">Locked</div>' +
              '<div class="ach-item-desc">' + escapeHtml(a.hint) + '</div>' +
            '</div>' +
          '</div>';
      }
    });
    els.modalList.innerHTML = html;
    var n = unlockedCount();
    if (els.progressCount) els.progressCount.textContent = n + ' / ' + TOTAL;
    if (els.progressFill) els.progressFill.style.width = Math.round((n / TOTAL) * 100) + '%';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function openModal() {
    if (!els.modal) return;
    renderModalList();
    els.modal.classList.add('ach-modal-open');
    document.addEventListener('keydown', onModalKey);
    var closeBtn = els.modal.querySelector('.ach-modal-close');
    if (closeBtn) { try { closeBtn.focus(); } catch (e) {} }
  }
  function closeModal() {
    if (!els.modal) return;
    els.modal.classList.remove('ach-modal-open');
    document.removeEventListener('keydown', onModalKey);
    if (els.badge) { try { els.badge.focus(); } catch (e) {} }
  }
  function onModalKey(e) {
    if (e.key === 'Escape') { closeModal(); }
  }

  /* ---- detectors ---- */
  function wireDetectors() {
    /* 1 palette: Cmd/Ctrl+K, .cmdk-pill click, or .cmdk-overlay gains cmdk-open */
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) unlock('palette');
    });
    var pill = document.querySelector('.cmdk-pill');
    if (pill) pill.addEventListener('click', function () { unlock('palette'); });
    var overlay = document.querySelector('.cmdk-overlay');
    if (overlay && 'MutationObserver' in window) {
      var mo = new MutationObserver(function () {
        if (overlay.classList.contains('cmdk-open')) unlock('palette');
      });
      mo.observe(overlay, { attributes: true, attributeFilter: ['class'] });
    }

    /* 2 quant: input/click inside #playground */
    var pg = document.getElementById('playground');
    if (pg) {
      var pgHandler = function (e) { if (pg.contains(e.target)) unlock('quant'); };
      pg.addEventListener('input', pgHandler);
      pg.addEventListener('click', pgHandler);
    }

    /* 3 arena: #mathGameLauncher click OR #math-game gains 'active' */
    var launcher = document.getElementById('mathGameLauncher');
    if (launcher) launcher.addEventListener('click', function () { unlock('arena'); });
    var game = document.getElementById('math-game');
    if (game && 'MutationObserver' in window) {
      var gmo = new MutationObserver(function () {
        if (game.classList.contains('active')) unlock('arena');
      });
      gmo.observe(game, { attributes: true, attributeFilter: ['class'] });
    }

    /* 4 terminal: focus #terminal-input */
    var term = document.getElementById('terminal-input');
    if (term) term.addEventListener('focus', function () { unlock('terminal'); });

    /* 5 theme: click #darkModeToggle */
    var dm = document.getElementById('darkModeToggle');
    if (dm) dm.addEventListener('click', function () { unlock('theme'); });

    /* 6 sound: click #snd-toggle */
    var snd = document.getElementById('snd-toggle');
    if (snd) snd.addEventListener('click', function () { unlock('sound'); });

    /* 7 konami */
    var konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    var kPos = 0;
    document.addEventListener('keydown', function (e) {
      var want = konami[kPos];
      var key = e.key;
      var match = (want.length === 1) ? (key.toLowerCase() === want) : (key === want);
      if (match) {
        kPos++;
        if (kPos === konami.length) { kPos = 0; unlock('konami'); }
      } else {
        /* allow restart if the wrong key was actually the first key */
        kPos = (key === konami[0]) ? 1 : 0;
      }
    });

    /* 8 word "quant": track recent letters; ignore in inputs */
    var buf = '';
    document.addEventListener('keydown', function (e) {
      var tgt = e.target;
      if (tgt) {
        var tag = (tgt.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tgt.isContentEditable) return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key && e.key.length === 1 && /[a-z]/i.test(e.key)) {
        buf = (buf + e.key.toLowerCase()).slice(-5);
        if (buf === 'quant') unlock('word');
      }
    });

    /* 9 explorer: see every main section */
    var sectionIds = ['about', 'experience', 'projects', 'playground', 'skills', 'awards', 'terminal', 'contact'];
    if ('IntersectionObserver' in window) {
      var seen = {};
      var need = 0;
      var targets = [];
      sectionIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) { targets.push(el); need++; }
      });
      if (need > 0) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && en.target.id) {
              seen[en.target.id] = true;
              io.unobserve(en.target);
            }
          });
          var count = 0;
          for (var k in seen) { if (seen.hasOwnProperty(k)) count++; }
          if (count >= need) {
            io.disconnect();
            unlock('explorer');
          }
        }, { threshold: 0.25 });
        targets.forEach(function (t) { io.observe(t); });
      }
    } else {
      /* no IO support: don't block; mark explorer when no obstacle */
    }
  }

  /* ---- lifecycle cleanup ---- */
  window.addEventListener('pagehide', function () {
    if (els.toastStack) {
      var kids = els.toastStack.querySelectorAll('.ach-toast');
      for (var i = 0; i < kids.length; i++) {
        if (typeof kids[i]._achCleanup === 'function') kids[i]._achCleanup();
      }
    }
  });

  /* ---- init ---- */
  function init() {
    if (initialized) return;
    initialized = true;
    unlocked = loadUnlocked();
    buildBadge();
    buildModal();
    updateBadge(false);
    wireDetectors();
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();


// =================== ADDED MODULES: context menu / shortcuts / magnetic / tour ===================
// ===== ADDED MODULE: magnetic buttons (mag) =====
(function () {
  function init() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var sel = '.hero-btn, .show-more-btn, .submit-btn, .start-btn';
    function bind(el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var m = 12;
        var dx = Math.max(-m, Math.min(m, (e.clientX - (r.left + r.width / 2)) * 0.3));
        var dy = Math.max(-m, Math.min(m, (e.clientY - (r.top + r.height / 2)) * 0.3));
        el.style.transition = '';
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = 'transform .25s cubic-bezier(.34,1.56,.64,1)';
        el.style.transform = '';
      });
    }
    document.querySelectorAll(sel).forEach(bind);
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();

// ===== ADDED MODULE: custom right-click context menu (ctx) =====
(function () {
  function init() {
    var menu = document.createElement('div');
    menu.className = 'ctx-menu';
    menu.setAttribute('role', 'menu');

    var toastEl = null, toastT = null;
    function toast(msg) {
      if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'tour-welcome';
        toastEl.innerHTML = '<span class="tw-txt"></span>';
        document.body.appendChild(toastEl);
      }
      toastEl.querySelector('.tw-txt').textContent = msg;
      toastEl.classList.add('show');
      clearTimeout(toastT);
      toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 1700);
    }

    var items = [
      { ic: 'fa-terminal', label: 'Command palette', key: '⌘K', run: function () { var p = document.querySelector('.cmdk-pill'); if (p) p.click(); } },
      { ic: 'fa-compass', label: 'Take the tour', run: function () { document.dispatchEvent(new CustomEvent('aj:tour')); } },
      { ic: 'fa-keyboard', label: 'Keyboard shortcuts', key: '?', run: function () { document.dispatchEvent(new CustomEvent('aj:shortcuts')); } },
      { sep: true },
      { ic: 'fa-envelope', label: 'Copy email', run: function () { try { if (navigator.clipboard) navigator.clipboard.writeText('aryanj@sas.upenn.edu'); } catch (e) {} toast('Email copied ✓'); } },
      { ic: 'fa-moon', label: 'Toggle theme', run: function () { var t = document.getElementById('darkModeToggle'); if (t) t.click(); } },
      { ic: 'fa-rotate', label: 'Replay boot sequence', run: function () { try { sessionStorage.removeItem('boot_done'); } catch (e) {} location.reload(); } },
      { sep: true },
      { ic: 'fa-code', label: 'View source', run: function () { window.open('https://github.com/aryan-jeena/aryan-jeena.github.io', '_blank'); } }
    ];

    items.forEach(function (it) {
      if (it.sep) { var s = document.createElement('div'); s.className = 'ctx-sep'; menu.appendChild(s); return; }
      var d = document.createElement('div');
      d.className = 'ctx-item';
      d.setAttribute('role', 'menuitem');
      d.tabIndex = 0;
      d.innerHTML = '<i class="fas ' + it.ic + '"></i><span>' + it.label + '</span>' + (it.key ? '<span class="ctx-key">' + it.key + '</span>' : '');
      d.addEventListener('click', function () { hide(); it.run(); });
      d.addEventListener('keydown', function (e) { if (e.key === 'Enter') { hide(); it.run(); } });
      menu.appendChild(d);
    });
    var foot = document.createElement('div');
    foot.className = 'ctx-foot';
    foot.textContent = 'aryan.os';
    menu.appendChild(foot);
    document.body.appendChild(menu);

    function show(x, y) {
      menu.classList.add('ctx-open');
      var mw = menu.offsetWidth, mh = menu.offsetHeight;
      if (x + mw > window.innerWidth - 8) x = window.innerWidth - mw - 8;
      if (y + mh > window.innerHeight - 8) y = window.innerHeight - mh - 8;
      menu.style.left = Math.max(8, x) + 'px';
      menu.style.top = Math.max(8, y) + 'px';
    }
    function hide() { menu.classList.remove('ctx-open'); }

    document.addEventListener('contextmenu', function (e) {
      if (e.shiftKey) return; // hold Shift for the native menu
      var t = e.target;
      if (t && t.closest && t.closest('input, textarea')) return;
      e.preventDefault();
      show(e.clientX, e.clientY);
    });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) hide(); });
    document.addEventListener('scroll', hide, true);
    window.addEventListener('blur', hide);
    window.addEventListener('resize', hide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();

// ===== ADDED MODULE: keyboard shortcuts overlay (keys) =====
(function () {
  function init() {
    var mac = /Mac|iPhone|iPad/.test(navigator.platform);
    var cmd = mac ? '⌘' : 'Ctrl';
    var overlay = document.createElement('div');
    overlay.className = 'keys-overlay';
    overlay.innerHTML =
      '<div class="keys-card" role="dialog" aria-label="Keyboard shortcuts">' +
        '<h3><i class="fas fa-keyboard"></i> Keyboard Shortcuts</h3>' +
        '<div class="keys-row"><span class="keys-desc">Command palette</span><span class="keys-combo"><kbd>' + cmd + '</kbd><kbd>K</kbd></span></div>' +
        '<div class="keys-row"><span class="keys-desc">Focus terminal</span><span class="keys-combo"><kbd>Ctrl</kbd><kbd>`</kbd></span></div>' +
        '<div class="keys-row"><span class="keys-desc">This help</span><span class="keys-combo"><kbd>?</kbd></span></div>' +
        '<div class="keys-row"><span class="keys-desc">Context menu</span><span class="keys-combo"><kbd>Right-click</kbd></span></div>' +
        '<div class="keys-row"><span class="keys-desc">Close any overlay</span><span class="keys-combo"><kbd>Esc</kbd></span></div>' +
        '<div class="keys-foot">psst — there are 9 achievements and a few secrets hidden around. Try the Konami code ↑↑↓↓←→←→ B A, or type “quant”.</div>' +
      '</div>';
    document.body.appendChild(overlay);
    function open() { overlay.classList.add('keys-open'); }
    function close() { overlay.classList.remove('keys-open'); }
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('aj:shortcuts', open);
    document.addEventListener('keydown', function (e) {
      var t = document.activeElement;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.key === '?') { e.preventDefault(); overlay.classList.contains('keys-open') ? close() : open(); }
      else if (e.key === 'Escape') { close(); }
    });
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();

// ===== ADDED MODULE: guided tour + welcome toast (tour) =====
(function () {
  function init() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var steps = [
      { sel: '.cmdk-pill', title: 'Command palette', icon: 'fa-terminal', text: 'Press ⌘K (or Ctrl K) anytime to jump to any section, switch theme, or launch a feature.' },
      { sel: 'a[href="#playground"]', title: 'Quant Playground', icon: 'fa-flask', text: 'Simulate markets with Geometric Brownian Motion, estimate π by Monte Carlo, and price options live with Black–Scholes.' },
      { sel: '#ach-badge', title: 'Achievements', icon: 'fa-trophy', text: 'There are 9 secrets to discover as you explore — this badge tracks your progress.' },
      { sel: 'a[href="#terminal"]', title: 'Interactive terminal', icon: 'fa-code', text: 'A real shell — try “help”, “goto projects”, or ↑/↓ for history.' }
    ];
    var hole = null, tip = null, idx = 0, active = false;

    function ensure() {
      if (hole) return;
      hole = document.createElement('div'); hole.className = 'tour-hole';
      tip = document.createElement('div'); tip.className = 'tour-tip';
      document.body.appendChild(hole);
      document.body.appendChild(tip);
    }
    function place() {
      var step = steps[idx];
      var el = document.querySelector(step.sel);
      if (!el) { next(); return; }
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      setTimeout(function () {
        if (!active) return;
        var r = el.getBoundingClientRect();
        var pad = 8;
        hole.style.left = (r.left - pad) + 'px';
        hole.style.top = (r.top - pad) + 'px';
        hole.style.width = (r.width + pad * 2) + 'px';
        hole.style.height = (r.height + pad * 2) + 'px';
        tip.innerHTML = '<h4><i class="fas ' + step.icon + '"></i> ' + step.title + '</h4><p>' + step.text + '</p>' +
          '<div class="tour-actions"><span class="tour-progress">' + (idx + 1) + ' / ' + steps.length + '</span>' +
          '<span class="tour-btns"><button class="tour-btn" data-act="skip">Skip</button>' +
          '<button class="tour-btn primary" data-act="next">' + (idx === steps.length - 1 ? 'Done' : 'Next') + '</button></span></div>';
        var th = tip.offsetHeight, tw = tip.offsetWidth;
        var top = r.bottom + 14;
        if (top + th > window.innerHeight - 10) top = Math.max(10, r.top - th - 14);
        var left = Math.min(Math.max(10, r.left), window.innerWidth - tw - 10);
        tip.style.top = top + 'px';
        tip.style.left = left + 'px';
        tip.querySelector('[data-act="next"]').onclick = next;
        tip.querySelector('[data-act="skip"]').onclick = end;
      }, reduce ? 0 : 380);
    }
    function next() { idx++; if (idx >= steps.length) { end(); return; } place(); }
    function start() { if (active) return; active = true; idx = 0; ensure(); hole.style.display = 'block'; tip.style.display = 'block'; place(); }
    function end() { active = false; if (hole) { hole.style.display = 'none'; tip.style.display = 'none'; } try { localStorage.setItem('aj_tour_done', '1'); } catch (e) {} }

    document.addEventListener('aj:tour', start);
    document.addEventListener('keydown', function (e) { if (active && e.key === 'Escape') end(); });
    window.addEventListener('resize', function () { if (active) place(); });

    var welcomed = false;
    try { welcomed = !!localStorage.getItem('aj_welcomed'); } catch (e) {}
    if (!welcomed) {
      setTimeout(function () {
        var w = document.createElement('div');
        w.className = 'tour-welcome';
        w.innerHTML = '<span class="tw-txt">👋 Welcome to <b>aryan.os</b> — press <b>?</b> for shortcuts or ⌘K to explore.</span>' +
          '<button class="tw-go">Take a tour</button><button class="tw-x" aria-label="Dismiss">✕</button>';
        document.body.appendChild(w);
        requestAnimationFrame(function () { w.classList.add('show'); });
        var hideTimer = setTimeout(close, 9000);
        function close() { w.classList.remove('show'); setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 400); }
        w.querySelector('.tw-go').onclick = function () { clearTimeout(hideTimer); close(); start(); };
        w.querySelector('.tw-x').onclick = function () { clearTimeout(hideTimer); close(); };
        try { localStorage.setItem('aj_welcomed', '1'); } catch (e) {}
      }, 4200);
    }
  }
  if (document.readyState !== 'loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
