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
  let typingSpeed = 100;
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
        typingSpeed = 80;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Fully typed current phrase — now trigger scramble
        afterNormalGlitch = true;
        setTimeout(scrambleToSoccer, 500);
        return;
      } else if (isDeleting && charIndex === 0) {
        // Finished deleting — move to next phrase
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % normalPhrases.length;
        typingSpeed = 400;
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
  tsParticles.load("hero-bg", {
    background: { color: { value: "transparent" } },
    fullScreen: { enable: false },
    particles: {
      number: { value: 80 },
      color: { value: "#ffffff" },
      links: { enable: true, color: "#ffffff", distance: 150, opacity: 0.4, width: 1 },
      move: { enable: true, speed: 1 },
      size: { value: { min: 1, max: 3 } },
      opacity: { value: { min: 0.3, max: 0.7 } }
    }
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

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Python', 'Java', 'OCaml', 'HTML', 'CSS', 'JavaScript'],
      datasets: [{
        label: 'Proficiency',
        data: [90, 85, 80, 75, 75, 70],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { stepSize: 20, color: 'white' },
          grid: { color: 'rgba(255,255,255,0.1)' },
          angleLines: { color: 'rgba(255,255,255,0.2)' },
          pointLabels: { color: 'white' }
        }
      }
    }
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
