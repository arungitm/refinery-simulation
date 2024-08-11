// Particle effect and other main page specific code here
function initMainPage() {
    if (document.getElementById('particles-js')) {
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
}

function initVideoBackgrounds() {
    const videoSections = document.querySelectorAll('.video-section');
    
    videoSections.forEach(section => {
        const video = section.querySelector('.bg-video');
        if (video) {
            video.playbackRate = 0.5; // Slow down the video playback

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        video.play().catch(e => console.error("Error playing video:", e));
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(section);
        }
    });
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

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

// PDF viewer functionality
let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5;

const canvas = document.getElementById('pdf-render'),
      ctx = canvas ? canvas.getContext('2d') : null;

if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';
}

function renderPage(num) {
    if (!pdfDoc) {
        console.error('PDF document not loaded');
        return;
    }

    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({scale: 1});
        
        const container = document.querySelector('.pdf-container');
        if (!container) {
            console.error('PDF container not found');
            return;
        }
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

    const pageNum = document.getElementById('page-num');
    if (pageNum) pageNum.textContent = num;
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

    if (typeof pdfjsLib === 'undefined') {
        console.error('PDF.js library not loaded');
        return;
    }

    pdfjsLib.getDocument('assets/EnerBlaze_Mini_Profile.pdf').promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        const pageCount = document.getElementById('page-count');
        if (pageCount) pageCount.textContent = pdfDoc.numPages;

        renderPage(pageNum);
    }).catch(function(error) {
        console.error('Error loading PDF:', error);
    });
}

function initMobileMenu() {
    const menuIcon = document.querySelector('.menu-icon');
    const menuItems = document.querySelector('.menu-items');

    if (menuIcon && menuItems) {
        menuIcon.addEventListener('click', () => {
            menuItems.classList.toggle('show');
        });

        menuItems.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuItems.classList.remove('show');
            });
        });
    }
}

// Initialize everything
function init() {
    initMainPage();
    initVideoBackgrounds();
    initSmoothScrolling();
    createOilDrops();
    initPDFViewer();
    initMobileMenu();
    
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    if (prevPage) prevPage.addEventListener('click', onPrevPage);
    if (nextPage) nextPage.addEventListener('click', onNextPage);
    
    window.addEventListener('resize', function() {
        if (pdfDoc) {
            renderPage(pageNum);
        }
    });
}

// Call init when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
