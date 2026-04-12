/* =============================================================
   TITAN GLASS & METAL — script.js
   Handles: preloader, navbar, parallax, scroll animations,
   gallery filter, lightbox, before/after slider,
   testimonial carousel, stat counters, contact form
============================================================= */

'use strict';

/* =============================================================
   UTILITY
============================================================= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* =============================================================
   2. NAVBAR — scroll shrink + active link tracking
============================================================= */
(function initNavbar() {
  const navbar   = $('#navbar');
  const hamburger = $('#hamburger');
  const navMenu  = $('#navMenu');
  const navLinks = $$('.nav-link');

  if (!navbar) return;

  // Scroll behaviour: add .scrolled class
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 60);
    lastScroll = y;
  }, { passive: true });

  // Hamburger toggle
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('no-scroll', isOpen);
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      });
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        navMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  // Active link on scroll — highlight matching section
  const sections = $$('section[id]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => observer.observe(s));
})();

/* =============================================================
   3. SMOOTH SCROLL — handle all anchor links
============================================================= */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = $('#navbar')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* =============================================================
   4. HERO PARALLAX + BACKGROUND SLIDESHOW
============================================================= */
(function initParallax() {
  const heroBg = $('#heroBg');
  if (!heroBg) return;

  // Parallax scroll
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.5) {
        heroBg.style.transform = `translateY(${y * 0.35}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  // Background panels use CSS animation — no JS needed
})();

/* =============================================================
   5. SCROLL FADE-IN ANIMATIONS (Intersection Observer)
============================================================= */
(function initScrollAnimations() {
  const fadeEls = $$('.fade-in');
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // fire once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(el => observer.observe(el));
})();

/* =============================================================
   6. GALLERY FILTER
============================================================= */
(function initGalleryFilter() {
  const filterBtns  = $$('.filter-btn');
  const galleryItems = $$('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        const match = filter === 'all' || item.dataset.category === filter;
        item.classList.toggle('hidden', !match);
      });
    });
  });
})();

/* =============================================================
   7. LIGHTBOX
============================================================= */
(function initLightbox() {
  const lightbox    = $('#lightbox');
  const lbImg       = $('#lbImg');
  const lbCaption   = $('#lbCaption');
  const lbClose     = $('#lbClose');
  const lbOverlay   = $('#lbOverlay');
  const lbPrev      = $('#lbPrev');
  const lbNext      = $('#lbNext');

  if (!lightbox || !lbImg) return;

  const items = $$('.gallery-item');
  let current = 0;

  function getVisibleItems() {
    return items.filter(item => !item.classList.contains('hidden'));
  }

  function openLightbox(index) {
    const visible = getVisibleItems();
    if (!visible[index]) return;

    current = index;
    const item = visible[index];

    lbImg.src = item.dataset.src || item.querySelector('img')?.src || '';
    lbImg.alt = item.querySelector('img')?.alt || '';
    lbCaption.textContent = item.dataset.caption || '';

    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function navigate(dir) {
    const visible = getVisibleItems();
    current = (current + dir + visible.length) % visible.length;
    openLightbox(current);
  }

  // Attach click to each gallery item (or its zoom button)
  items.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const visible = getVisibleItems();
      const visibleIdx = visible.indexOf(item);
      if (visibleIdx >= 0) openLightbox(visibleIdx);
    });
  });

  lbClose.addEventListener('click',   closeLightbox);
  lbOverlay.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => navigate(-1));
  lbNext.addEventListener('click',  () => navigate(1));

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   navigate(-1);
    if (e.key === 'ArrowRight')  navigate(1);
  });
})();

/* =============================================================
   8. BEFORE / AFTER SLIDER
============================================================= */
function initBeforeAfterSlider(sliderId) {
  const slider  = document.getElementById(sliderId);
  if (!slider) return;

  const after  = slider.querySelector('.ba-after');
  const handle = slider.querySelector('.ba-handle');
  if (!after || !handle) return;

  let isDragging = false;

  // Initialize at 50%
  after.style.clipPath  = 'inset(0 50% 0 0)';
  handle.style.left     = '50%';

  function setPosition(clientX) {
    const rect = slider.getBoundingClientRect();
    const pct  = clamp(((clientX - rect.left) / rect.width) * 100, 2, 98);

    // after clips from the right → reveals left pct% of after image
    after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left    = `${pct}%`;
    handle.setAttribute('aria-valuenow', Math.round(pct));
  }

  // Mouse events
  handle.addEventListener('mousedown', e => {
    isDragging = true;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    setPosition(e.clientX);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch events
  handle.addEventListener('touchstart', e => {
    isDragging = true;
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    setPosition(e.touches[0].clientX);
  }, { passive: false });

  document.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Also allow dragging on the whole slider (not just handle)
  slider.addEventListener('mousedown', e => {
    isDragging = true;
    setPosition(e.clientX);
  });
}

initBeforeAfterSlider('baSlider1');
initBeforeAfterSlider('baSlider2');

/* =============================================================
   9. TESTIMONIALS CAROUSEL
============================================================= */
(function initCarousel() {
  const track    = $('#carouselTrack');
  const prevBtn  = $('#prevBtn');
  const nextBtn  = $('#nextBtn');
  const dots     = $$('.dot');

  if (!track) return;

  const slides   = $$('.carousel-slide', track);
  let current    = 0;
  let autoTimer  = null;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;

    dots.forEach((dot, i) => {
      const active = i === current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAutoplay() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  // Controls
  prevBtn?.addEventListener('click', () => { goTo(current - 1); startAutoplay(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); startAutoplay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
      startAutoplay();
    });
  });

  // Pause on hover/focus
  track.parentElement?.addEventListener('mouseenter', stopAutoplay);
  track.parentElement?.addEventListener('mouseleave', startAutoplay);
  track.parentElement?.addEventListener('focusin',    stopAutoplay);
  track.parentElement?.addEventListener('focusout',   startAutoplay);

  // Touch swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      goTo(dx < 0 ? current + 1 : current - 1);
      startAutoplay();
    }
  }, { passive: true });

  // Init
  goTo(0);
  startAutoplay();
})();

/* =============================================================
   10. STAT COUNTERS (Intersection Observer)
============================================================= */
(function initCounters() {
  const counterEls = $$('[data-target]');
  if (!counterEls.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2000; // ms
    const steps    = 60;
    const stepTime = duration / steps;
    let step       = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out curve: slow down near target
      const progress = 1 - Math.pow(1 - step / steps, 3);
      const value    = Math.round(progress * target);
      el.textContent = value;

      if (step >= steps) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, stepTime);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counterEls.forEach(el => observer.observe(el));
})();

/* =============================================================
   11. CONTACT FORM VALIDATION
============================================================= */
(function initContactForm() {
  const form       = $('#contactForm');
  const successBox = $('#formSuccess');
  if (!form) return;

  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(inputId, errId, msg) {
    const input = document.getElementById(inputId);
    const err   = document.getElementById(errId);
    if (!input || !err) return;
    err.textContent = msg;
    input.classList.toggle('invalid', !!msg);
  }

  function clearErrors() {
    $$('.field-err').forEach(el  => el.textContent = '');
    $$('.invalid').forEach(el    => el.classList.remove('invalid'));
  }

  // Live clear on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const errEl = document.getElementById(el.id + 'Err');
      if (errEl) errEl.textContent = '';
      el.classList.remove('invalid');
    });
  });

  function validate() {
    let ok = true;

    // Name
    const name = $('#fname');
    if (!name || name.value.trim().length < 2) {
      setError('fname', 'fnameErr', 'Please enter your full name.');
      ok = false;
    }

    // Phone
    const phone = $('#fphone');
    const raw   = phone ? phone.value.replace(/\s/g, '') : '';
    if (!phone || !phoneRegex.test(raw)) {
      setError('fphone', 'fphoneErr', 'Please enter a valid phone number.');
      ok = false;
    }

    // Email (optional but must be valid if provided)
    const email = $('#femail');
    if (email && email.value.trim() && !emailRegex.test(email.value.trim())) {
      setError('femail', 'femailErr', 'Please enter a valid email address.');
      ok = false;
    }

    // Service
    const service = $('#fservice');
    if (!service || !service.value) {
      setError('fservice', 'fserviceErr', 'Please select a service.');
      ok = false;
    }

    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();

    if (!validate()) {
      // Scroll to first error
      const firstErr = form.querySelector('.invalid');
      if (firstErr) {
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErr.focus();
      }
      return;
    }

    // Success state
    form.style.display = 'none';
    if (successBox) {
      successBox.style.display = 'flex';
      successBox.setAttribute('aria-hidden', 'false');
      successBox.focus();
    }
  });
})();

/* =============================================================
   12. SECTION DIAGONAL PATTERN — dynamic SVG injection
   (adds visual depth to dark sections without extra HTTP calls)
============================================================= */
(function injectPatterns() {
  // The CSS already handles background-image patterns via :root vars.
  // Nothing extra needed here.
})();

/* =============================================================
   13. ABOUT SECTION SLIDESHOW
============================================================= */
(function initAboutSlideshow() {
  const slides = $$('.about-slide');
  if (!slides.length) return;

  let current = 0;

  function next() {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }

  // Change every 3 seconds
  setInterval(next, 3000);
})();

/* =============================================================
   INIT LOG
============================================================= */
console.log(
  '%c TITAN GLASS & METAL %c titanglassandmetal.com ',
  'background:#1A2A4A;color:#7EC8E3;padding:4px 8px;font-weight:bold;',
  'background:#2E7BBA;color:#fff;padding:4px 8px;'
);
