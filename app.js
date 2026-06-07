document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. CUSTOM CURSOR
    // ----------------------------------------------------
    const cursorDot = document.querySelector('.custom-cursor-dot');
    const cursorCircle = document.querySelector('.custom-cursor-circle');
    
    let mouseX = 0, mouseY = 0;
    let circleX = 0, circleY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });
    
    // Smooth custom cursor lag (linear interpolation)
    function animateCursor() {
        const lerpFactor = 0.15;
        circleX += (mouseX - circleX) * lerpFactor;
        circleY += (mouseY - circleY) * lerpFactor;
        
        cursorCircle.style.left = circleX + 'px';
        cursorCircle.style.top = circleY + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Add hover effect states for links & interactive items
    const interactiveElements = document.querySelectorAll('a, button, .filter-btn, .project-card, .slider-group input, .social-icon, .btn');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering');
        });
    });

    // ----------------------------------------------------
    // 2. MOBILE MENU
    // ----------------------------------------------------
    const menuBtn = document.querySelector('.menu-btn');
    const navMenu = document.querySelector('nav');
    
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking nav link
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Active Navigation Highlighting on Scroll
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // ----------------------------------------------------
    // 3. BACKGROUND CANVAS PARTICLES
    // ----------------------------------------------------
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');
    
    let particlesArray = [];
    const particleCount = 70;
    const maxDistance = 120;
    
    function resizeBgCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeBgCanvas);
    resizeBgCanvas();
    
    class Particle {
        constructor() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.radius = Math.random() * 2 + 1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Boundary collision
            if (this.x < 0 || this.x > bgCanvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > bgCanvas.height) this.vy = -this.vy;
            
            // Mouse Interaction (Push away slightly)
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.hypot(dx, dy);
            if (dist < 100) {
                const force = (100 - dist) / 100;
                this.x += (dx / dist) * force * 2;
                this.y += (dy / dist) * force * 2;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
            ctx.fill();
        }
    }
    
    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < particleCount; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();
    
    function animateParticles() {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });
        
        // Draw connection lines
        for (let i = 0; i < particlesArray.length; i++) {
            for (let j = i + 1; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const dist = Math.hypot(dx, dy);
                
                if (dist < maxDistance) {
                    const alpha = (maxDistance - dist) / maxDistance * 0.15;
                    ctx.strokeStyle = `rgba(191, 90, 242, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // ----------------------------------------------------
    // 4. INTERSECTION OBSERVER FOR REVEALS
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => revealObserver.observe(el));

    // Project Card Mouse Spotlight Tracker
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // ----------------------------------------------------
    // 5. PROJECT GRID FILTERING
    // ----------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Toggle active filter button style
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.style.display = 'flex';
                    // Trigger fade in animation
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    // Delay hiding item to let transition finish
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ----------------------------------------------------
    // 6. INTERACTIVE TIMELINE SCROLL ANIMATIONS
    // ----------------------------------------------------
    const timelineSection = document.getElementById('timeline');
    const timelineProgress = document.querySelector('.timeline-progress');
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    function updateTimelineProgress() {
        if (!timelineSection || !timelineProgress || !timelineContainer) return;
        
        const rect = timelineContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Start animating when the top of the container enters the middle of the screen
        // Finish when the bottom of the container reaches the middle of the screen
        const startOffset = windowHeight / 2;
        const containerHeight = rect.height;
        
        // Calculate distance from middle of screen to top of container
        const scrolledDistance = startOffset - rect.top;
        
        let progress = (scrolledDistance / containerHeight) * 100;
        progress = Math.max(0, Math.min(100, progress)); // Clamp between 0% and 100%
        
        timelineProgress.style.height = `${progress}%`;
    }
    
    window.addEventListener('scroll', updateTimelineProgress);
    window.addEventListener('resize', updateTimelineProgress);
    updateTimelineProgress(); // Initial check
    
    // Intersection Observer to activate individual timeline cards and dots
    const timelineObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, timelineObserverOptions);
    
    timelineItems.forEach(item => timelineObserver.observe(item));
});
