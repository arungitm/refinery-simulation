// Particle effect
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: "#ffc857" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } },
        size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.1, sync: false } },
        line_linked: { enable: false },
        move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out", bounce: false }
    },
    interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
        modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    if (document.body.classList.contains('light-mode')) {
        themeToggle.textContent = 'Dark Mode';
    } else {
        themeToggle.textContent = 'Light Mode';
    }
});

// Active section highlighting and animation
function highlightActiveSection() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav a');

    sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const isActive = rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;

        if (isActive) {
            section.classList.add('active');
            navLinks[index].classList.add('active');
            section.querySelector('.content').classList.add('visible');
        } else {
            section.classList.remove('active');
            navLinks[index].classList.remove('active');
            section.querySelector('.content').classList.remove('visible');
        }
    });
}

// Update active section on scroll
window.addEventListener('scroll', highlightActiveSection);

// Floating oil drops
function createOilDrops() {
    const homeSection = document.getElementById('home');
    for (let i = 0; i < 20; i++) {
        const drop = document.createElement('div');
        drop.classList.add('oil-drop');
        const size = Math.random() * 20 + 10;
        drop.style.width = `${size}px`;
        drop.style.height = `${size}px`;
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `${Math.random() * 100}%`;
        homeSection.appendChild(drop);

        animateOilDrop(drop);
    }
}

function animateOilDrop(drop) {
    const duration = Math.random() * 5000 + 5000;
    const keyframes = [
        { transform: 'translate(0, 0)', opacity: 0.7 },
        { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)`, opacity: 0.3 },
        { transform: 'translate(0, 0)', opacity: 0.7 }
    ];
    drop.animate(keyframes, {
        duration: duration,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out'
    });
}

// Initialize
window.addEventListener('load', () => {
    document.getElementById('loading-screen').style.display = 'none';
    document.querySelector('.section').classList.add('active');
    document.querySelector('.content').classList.add('visible');
    highlightActiveSection();
    createOilDrops();
});
