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

// === TYPEWRITER + SCRAMBLE EFFECT ===
document.addEventListener('DOMContentLoaded', () => {
  const introText = document.getElementById('intro-text');
  const normalPhrases = [
    "Computer Science & Mathematics @ UPenn",
    "Software Engineer",
    "AI/ML Enthusiast",
    "Quantitative Analyst"
  ];
  const finalPhrase = "Soccer Player";
  const scrambleChars = "!<>-_\\/[]{}—=+*^?#________";
  let loopCount = 0;
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;
  let scrambled = false;

  function randomChar() {
    return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
  }

  function typeNormal() {
    const currentPhrase = normalPhrases[phraseIndex];

    if (!introText.classList.contains('glitch-typing')) {
      introText.classList.add('glitch-typing');
    }

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
      typingSpeed = 1200;
      introText.classList.remove('glitch-typing');
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % normalPhrases.length;
      loopCount++;

      // After some loops, switch to final scramble
      if (loopCount >= 2) {
        setTimeout(scrambleToFinal, 1000);
        return;
      }
      typingSpeed = 400;
      introText.classList.add('glitch-typing');
    }

    setTimeout(typeNormal, typingSpeed);
  }

  function scrambleToFinal() {
    scrambled = true;
    let output = '';
    let queue = [];

    for (let i = 0; i < finalPhrase.length; i++) {
      queue.push({ from: randomChar(), to: finalPhrase[i] });
    }

    let frame = 0;

    function update() {
      output = '';
      let complete = 0;

      for (let i = 0; i < queue.length; i++) {
        if (frame > i * 2) { // Slightly smoother than usual
          output += queue[i].to;
          complete++;
        } else {
          output += randomChar();
        }
      }

      introText.textContent = output;

      if (complete === queue.length) {
        introText.classList.remove('glitch-typing');
        return;
      } else {
        frame++;
        requestAnimationFrame(update);
      }
    }

    update();
  }

  // Start typing normally first
  typeNormal();
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
