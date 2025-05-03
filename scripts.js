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
