// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Typewriter Effect
const introText = "Hello! I'm Aryan Jeena, a Computer Science major at UPenn with a passion for AI, healthcare, and data science.";
let index = 0;

function typeWriter() {
    if (index < introText.length) {
        document.querySelector('.hero p').innerHTML += introText.charAt(index);
        index++;
        setTimeout(typeWriter, 100);
    }
}

window.onload = typeWriter;
