// Dark Mode Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
});

// Typewriter Effect for the Intro Section
const introText = "Hello! I'm Aryan Jeena, a Computer Science major at UPenn with a passion for AI, healthcare, and data science.";
let index = 0;
const speed = 100;  // Speed of typing effect

function typeWriter() {
    if (index < introText.length) {
        document.getElementById('intro-typed').innerHTML += introText.charAt(index);
        index++;
        setTimeout(typeWriter, speed);
    }
}

// Initiate the typewriter effect when the page loads
window.onload = function() {
    typeWriter();
};
