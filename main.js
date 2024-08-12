// Particle effect and other main page specific code
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

// Smooth scrolling
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

// Video background playback
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
        const scale = Math.min(scaleX, scaleY) * 0.9; // Reduce scale slightly to fit within container
        
        const scaledViewport = page.getViewport({scale: scale});

        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport,
            background: 'rgba(255, 255, 255, 0.8)' // Add a white background to improve visibility
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

// Mobile menu functionality
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const menuItems = document.querySelector('.menu-items');

    if (hamburger && menuItems) {
        hamburger.addEventListener('click', () => {
            menuItems.classList.toggle('show');
            hamburger.classList.toggle('active');
        });

        menuItems.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuItems.classList.remove('show');
                hamburger.classList.remove('active');
            });
        });
    }
}

// Google Maps initialization
function initMap() {
    const center = { lat: 25.372850, lng: 55.414405 };
    const map = new google.maps.Map(document.getElementById('google-map'), {
        zoom: 11,
        center: center
    });

    const locations = [
        { lat: 25.344307, lng: 55.389111, title: 'Registered Office - Sharjah' },
        { lat: 25.401394, lng: 55.439699, title: 'Operations - Ajman' }
    ];

    locations.forEach(location => {
        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: location.title
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<h3>${location.title}</h3>`
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    });
}

// Initialize everything
function init() {
    initMainPage();
    initVideoBackgrounds();
    initSmoothScrolling();
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

    // Add subtle animations on scroll
    const animatedElements = document.querySelectorAll('.content > *');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => observer.observe(el));
}

// Call init when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// Load Google Maps API
function loadGoogleMapsAPI() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyC03NcYW01Aa8OwScf9bT5vlc0DVtxmZko&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
}

// Call loadGoogleMapsAPI after the DOM is loaded
document.addEventListener('DOMContentLoaded', loadGoogleMapsAPI);
