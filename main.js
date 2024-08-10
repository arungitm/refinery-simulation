// Particle effect and other main page specific code here
function initMainPage() {
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
}

// Smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

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

// Floating oil drops
function createOilDrops() {
    const body = document.body;
    for (let i = 0; i < 20; i++) {
        const drop = document.createElement('div');
        drop.classList.add('oil-drop');
        const size = Math.random() * 20 + 10;
        drop.style.width = `${size}px`;
        drop.style.height = `${size}px`;
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `${Math.random() * 100}%`;
        body.appendChild(drop);
    }
}

// Theme toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                themeToggle.textContent = 'Switch to Light Theme';
            } else {
                themeToggle.textContent = 'Switch to Dark Theme';
            }
        });
    }
}

// Parallax effect
function initParallax() {
    window.addEventListener('scroll', () => {
        const parallax = document.querySelector('.parallax-bg');
        if (parallax) {
            let scrollPosition = window.pageYOffset;
            parallax.style.transform = 'translateY(' + scrollPosition * 0.5 + 'px)';
        }
    });
}

// PDF viewer functionality
let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5;

const canvas = document.getElementById('pdf-render'),
      ctx = canvas ? canvas.getContext('2d') : null;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

function renderPage(num) {
  if (!pdfDoc) {
    console.error('PDF document not loaded');
    return;
  }

  pageRendering = true;
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({scale: 1});
    
    // Adjust the scale to fit the container
    const container = document.querySelector('.pdf-container');
    const scaleX = container.clientWidth / viewport.width;
    const scaleY = container.clientHeight / viewport.height;
    const scale = Math.min(scaleX, scaleY);
    
    const scaledViewport = page.getViewport({scale: scale});

    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: scaledViewport
    };
    const renderTask = page.render(renderContext);

    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  }).catch(function(error) {
    console.error('Error rendering PDF page:', error);
    pageRendering = false;
  });

  document.getElementById('page-num').textContent = num;
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}

function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}

function initPDFViewer() {
  const pdfCarousel = document.getElementById('pdf-carousel');
  if (!pdfCarousel) {
    console.log('PDF viewer elements not found. Skipping initialization.');
    return;
  }

  pdfjsLib.getDocument('/assets/EnerBlaze_Mini_Profile.pdf').promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
  }).catch(function(error) {
    console.error('Error loading PDF:', error);
  });
}

document.getElementById('prev-page')?.addEventListener('click', onPrevPage);
document.getElementById('next-page')?.addEventListener('click', onNextPage);

// Mobile menu functionality
function initMobileMenu() {
  const menuIcon = document.querySelector('.menu-icon');
  const menuItems = document.querySelector('.menu-items');

  menuIcon.addEventListener('click', () => {
    menuItems.classList.toggle('show');
  });

  // Close menu when a link is clicked
  menuItems.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuItems.classList.remove('show');
    });
  });
}

// Adjust PDF rendering on window resize
function handleWindowResize() {
  if (pdfDoc) {
    renderPage(pageNum);
  }
}

window.addEventListener('resize', handleWindowResize);

// Initialize everything
function init() {
  initMainPage();
  initSmoothScrolling();
  createOilDrops();
  initThemeToggle();
  initParallax();
  initPDFViewer(); // This will only run if the PDF viewer elements exist
  initMobileMenu();
  window.addEventListener('scroll', highlightActiveSection);
}

// Call init when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
