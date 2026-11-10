/**
 * FitPredict Animations Module
 * Powers smooth GSAP scroll-triggered text reveals, staggered cards,
 * numerical counters, and hero entrance transitions.
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initLandingAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // 1. Hero Entrance Timeline (Plays immediately on load)
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.85 } });

  // Floating Nav entrance
  if (document.getElementById('main-nav')) {
    heroTl.fromTo('#main-nav',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7 }
    );
  }

  // Live Biometric Telemetry Badge
  if (document.querySelector('.hero-live-badge')) {
    heroTl.fromTo('.hero-live-badge',
      { opacity: 0, y: -16, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6 },
      '-=0.45'
    );
  }

  // Hero Headline lines
  if (document.querySelector('.hero-line')) {
    heroTl.fromTo('.hero-line',
      { opacity: 0, y: 36, rotateX: -10 },
      { opacity: 1, y: 0, rotateX: 0, stagger: 0.16, duration: 0.9, ease: 'power3.out' },
      '-=0.4'
    );
  } else if (document.querySelector('.vb-hero-headline')) {
    heroTl.fromTo('.vb-hero-headline',
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.85 },
      '-=0.4'
    );
  }

  // Hero Subtitle & Divider
  if (document.querySelector('.vb-hero-lede')) {
    heroTl.fromTo('.vb-hero-lede',
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
      '-=0.5'
    );
  }

  // Hero CTA Button
  if (document.querySelector('.hero-cta-btn')) {
    heroTl.fromTo('.hero-cta-btn',
      { opacity: 0, y: 20, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.4)' },
      '-=0.45'
    );
  }

  if (document.querySelector('.vb-hero-divider')) {
    heroTl.fromTo('.vb-hero-divider',
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.45'
    );
  }

  // Hero Center Card (if present inside hero)
  if (document.querySelector('#hero-section #prompt')) {
    heroTl.fromTo('#hero-section #prompt',
      { opacity: 0, y: 32, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' },
      '-=0.4'
    );
  }

  // 2. Generic Section Heading & Text Reveals (CleanMax transitions handle major sections)
  const sectionHeadings = document.querySelectorAll('section:not(#overview):not(#how-it-works):not(#calculator), footer');
  sectionHeadings.forEach((sec) => {
    const titles = sec.querySelectorAll('.vb-serif, .vb-display, h2, h3');
    if (titles.length > 0) {
      gsap.fromTo(titles,
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }
  });

  // 2.0. Calculator Section Left Content Entrance (Personalized Precision Plan - Slide from Left to Right)
  const calcSection = document.getElementById('calculator');
  if (calcSection) {
    const calcHeadline = calcSection.querySelector('.calc-info-headline');
    const calcLede = calcSection.querySelector('.calc-info-lede');
    if (calcHeadline && calcLede) {
      gsap.fromTo([calcHeadline, calcLede],
        { opacity: 0, x: -75 },
        {
          opacity: 1,
          x: 0,
          duration: 0.95,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: calcSection,
            start: 'top 78%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }
  }

  // 2.1 Overview Section Custom Staggered Reveals
  const overviewSec = document.getElementById('overview');
  if (overviewSec) {
    const headerBlock = overviewSec.querySelector('.overview-header-block');
    if (headerBlock) {
      gsap.fromTo(headerBlock.children,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerBlock,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    // Neural Layers Staggered Inward Entrance
    const neuralRows = overviewSec.querySelectorAll('.neural-layer-row');
    if (neuralRows.length > 0) {
      gsap.fromTo(neuralRows,
        { opacity: 0, x: -28, scale: 0.98 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.overview-neural-col',
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }

    // Key Engineering Highlights Staggered Inward Entrance
    const engItems = overviewSec.querySelectorAll('.eng-feature-item');
    if (engItems.length > 0) {
      gsap.fromTo(engItems,
        { opacity: 0, x: 28 },
        {
          opacity: 1,
          x: 0,
          duration: 0.75,
          stagger: 0.14,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.overview-eng-col',
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }
  }

  // 3. Four Steps Grid (Staggered Column Entrance)
  const stepsList = document.querySelector('#four-steps ol');
  if (stepsList) {
    const steps = stepsList.querySelectorAll('li');
    gsap.fromTo(steps,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.14,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: stepsList,
          start: 'top 80%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }

  // Fluted Glass Feature Banner
  const featureBanner = document.querySelector('#four-steps img');
  if (featureBanner) {
    gsap.fromTo(featureBanner.parentElement,
      { opacity: 0, y: 30, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featureBanner.parentElement,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }

  // 4. Live Statistics Numeric Counters
  const counterElements = document.querySelectorAll('[data-counter]');
  counterElements.forEach((counter) => {
    const targetVal = parseFloat(counter.getAttribute('data-counter')) || 0;
    const decimals = parseInt(counter.getAttribute('data-decimals') || '0', 10);
    const suffix = counter.getAttribute('data-suffix') || '';

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetVal,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            const formatted = decimals > 0
              ? obj.val.toFixed(decimals)
              : Math.round(obj.val).toLocaleString('en-US');
            counter.textContent = formatted + suffix;
          }
        });
      }
    });
  });

  // 5. Scientific Rigor 6-Grid Stagger
  const scienceList = document.querySelector('#science ol');
  if (scienceList) {
    const items = scienceList.querySelectorAll('li');
    gsap.fromTo(items,
      { opacity: 0, y: 25 },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: scienceList,
          start: 'top 82%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }

  // 6. Athletic Profile Cards (Staggered Entrance)
  const profileGrid = document.querySelector('#profiles .grid');
  if (profileGrid) {
    const cards = profileGrid.children;
    gsap.fromTo(cards,
      { opacity: 0, y: 30, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: profileGrid,
          start: 'top 82%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }

  // 7. FAQ Accordion Items Stagger
  const faqContainer = document.querySelector('section details')?.parentElement;
  if (faqContainer) {
    const details = faqContainer.querySelectorAll('details');
    gsap.fromTo(details,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: faqContainer,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }

  // 8. CTA Banner Reveal
  const ctaBanner = document.querySelector('.vb-reveal-on-scroll.mb-20');
  if (ctaBanner) {
    gsap.fromTo(ctaBanner,
      { opacity: 0, y: 35 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ctaBanner,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true
        }
      }
    );
  }
}

/**
 * Hero Rotating Headline Word
 * Cycles one word of the hero headline every few seconds with a vertical
 * slide + blur animation (21st.dev "Animated Hero" word-rotator style).
 * Expects the enhanced markup in index.html:
 *   <span class="word-rotator" data-rotator data-words="a, b, c" ...>
 *     <span class="rot-word">initial</span>
 *     <span class="rot-word rot-abs">a</span>...
 */
export function initHeroWordRotator() {
  document.querySelectorAll('[data-rotator]').forEach((rotator) => {
    const interval = Math.max(
      1800,
      parseInt(rotator.getAttribute('data-interval') || '3000', 10)
    );

    // Only one word lives in the flow at a time (the resident word); the rest
    // are absolute overlays. Keeping the resident word in flow preserves the
    // exact baseline alignment with the rest of the sentence.
    const words = [...rotator.querySelectorAll('.rot-word')];
    const resident = rotator.querySelector('.rot-word:not(.rot-abs)');
    if (!resident || words.length < 2) return;

    let index = words.indexOf(resident);
    let busy = false;
    const swapMs = 620;

    const swap = () => {
      if (busy || document.hidden) return;
      busy = true;

      const current = words[index];
      index = (index + 1) % words.length;
      const next = words[index];

      // Pin the current width so the transition starts from a stable value,
      // then morph toward the next word's width.
      rotator.style.width = `${current.offsetWidth}px`;
      void rotator.offsetWidth; // flush layout before retargeting the width

      next.classList.remove('rot-abs');
      next.classList.add('rot-entering');
      current.classList.add('rot-abs', 'rot-leaving');
      rotator.style.width = `${next.offsetWidth}px`;

      setTimeout(() => {
        current.classList.remove('rot-leaving'); // stays rot-abs (hidden)
        next.classList.remove('rot-entering');  // rests naturally in flow
        busy = false;
      }, swapMs);
    };

    // Explicit widths go stale when responsive typography changes size,
    // so release the pin and let the resident word size it again.
    window.addEventListener('resize', () => {
      rotator.style.width = '';
    }, { passive: true });

    setInterval(swap, interval);
  });
}

/**
 * CleanMax-Inspired Scroll-Driven Transitions
 * Coordinates hero exit scrub, video depth scaling, stacking card overlays,
 * and seamless inter-section parallax choreography.
 */
export function initCleanMaxScrollTransitions() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const mm = gsap.matchMedia();

  const heroWrapper = document.getElementById('hero-scroll-wrapper');
  const heroContent = document.querySelector('.hero-content-wrap');
  const heroDim = document.querySelector('.hero-scroll-dim-overlay');
  const heroVideoWrap = document.querySelector('.hero-bg-video-wrap');
  const calculator = document.getElementById('calculator');
  const howItWorks = document.getElementById('how-it-works');
  const presets = document.getElementById('presets');
  const impact = document.getElementById('impact');
  const science = document.getElementById('science');
  const openSource = document.getElementById('open-source');

  // Shared Sub-Reveals (Spine line, Telemetry HUD, Science advisory cards)
  const initSubReveals = () => {
    if (howItWorks) {
      const spine = howItWorks.querySelector('.how-it-works-spine');
      if (spine) {
        gsap.fromTo(spine,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: howItWorks,
              start: 'top 65%',
              end: 'bottom 80%',
              scrub: 0.3,
            }
          }
        );
      }

      const hud = howItWorks.querySelector('.how-it-works-hud');
      if (hud) {
        gsap.fromTo(hud,
          { opacity: 0, scale: 0.92, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: howItWorks,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }

      const steps = howItWorks.querySelectorAll('.how-it-works-step');
      steps.forEach((step) => {
        gsap.fromTo(step,
          { opacity: 0, x: 25 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: step,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      });
    }

    if (science) {
      const scienceCards = science.querySelectorAll('.grid > div');
      if (scienceCards.length) {
        gsap.fromTo(scienceCards,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: science,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            }
          }
        );
      }
    }
  };

  initSubReveals();

  // ============================================================
  // DESKTOP & TABLETS (>= 768px)
  // Prominent, Highly Visible CleanMax Stacking Card Depth
  // ============================================================
  mm.add('(min-width: 768px)', () => {
    // 1. Hero Exit Scrub Transition
    if (heroWrapper && heroContent) {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroWrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
        }
      });

      heroTl.to(heroContent, {
        y: -60,
        opacity: 0,
        duration: 0.85,
        ease: 'power1.out',
      }, 0);

      if (heroVideoWrap) {
        heroTl.to(heroVideoWrap, {
          scale: 0.96,
          duration: 0.9,
          ease: 'power1.out',
        }, 0);
      }
    }

    // 2. Calculator Entrance Scrub (Rolls over hero as stacked sheet)
    if (calculator) {
      const calcInfo = calculator.querySelector('.calc-left-container');
      const calcPrompt = calculator.querySelector('#prompt');

      const calcEnterTl = gsap.timeline({
        scrollTrigger: {
          trigger: calculator,
          start: 'top 85%',
          end: 'top 20%',
          scrub: 0.5,
        }
      });

      // Right-side predict card scrubs in smoothly
      if (calcPrompt) {
        calcEnterTl.fromTo(calcPrompt,
          { y: 75, scale: 0.95, opacity: 0.25 },
          { y: 0, scale: 1, opacity: 1, ease: 'power2.out', duration: 1 },
          0
        );
      }
    }

    // 3. Prominent Stacking Transitions (scale: 0.98, top center origin - zero black flicker)
    // 3.1 Calculator -> How It Works
    if (howItWorks && calculator) {
      gsap.timeline({
        scrollTrigger: {
          trigger: howItWorks,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.4,
        }
      }).to(calculator, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    // 3.2 How It Works -> Presets
    if (presets && howItWorks) {
      gsap.timeline({
        scrollTrigger: {
          trigger: presets,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.4,
        }
      }).to(howItWorks, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    // 3.3 Presets -> Impact
    if (impact && presets) {
      gsap.timeline({
        scrollTrigger: {
          trigger: impact,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.4,
        }
      }).to(presets, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    // 3.4 Impact -> Science
    if (science && impact) {
      gsap.timeline({
        scrollTrigger: {
          trigger: science,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.4,
        }
      }).to(impact, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    // 3.5 Science -> Open Source
    if (openSource && science) {
      gsap.timeline({
        scrollTrigger: {
          trigger: openSource,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.4,
        }
      }).to(science, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    // Anchor Open Source
    if (openSource) {
      gsap.set(openSource, { scale: 1, y: 0 });
    }
  });

  // ============================================================
  // MOBILE SCREENS (< 768px)
  // Visible Touch-Optimized Stacking Transitions
  // ============================================================
  mm.add('(max-width: 767px)', () => {
    if (heroWrapper && heroContent) {
      gsap.timeline({
        scrollTrigger: {
          trigger: heroWrapper,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.35,
        }
      })
      .to(heroContent, {
        y: -40,
        opacity: 0,
        duration: 0.85,
        ease: 'power1.out',
      }, 0);
    }

    // Mobile Stacking Transitions (Noticeable & Silky)
    if (howItWorks && calculator) {
      gsap.timeline({
        scrollTrigger: {
          trigger: howItWorks,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.3,
        }
      }).to(calculator, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    if (presets && howItWorks) {
      gsap.timeline({
        scrollTrigger: {
          trigger: presets,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.3,
        }
      }).to(howItWorks, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    if (impact && presets) {
      gsap.timeline({
        scrollTrigger: {
          trigger: impact,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.3,
        }
      }).to(presets, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    if (science && impact) {
      gsap.timeline({
        scrollTrigger: {
          trigger: science,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.3,
        }
      }).to(impact, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    if (openSource && science) {
      gsap.timeline({
        scrollTrigger: {
          trigger: openSource,
          start: 'top bottom',
          end: 'top top',
          scrub: 0.3,
        }
      }).to(science, {
        scale: 0.98,
        transformOrigin: 'top center',
        ease: 'power1.out',
      });
    }

    if (openSource) {
      gsap.set(openSource, { scale: 1, y: 0 });
    }
  });
}

/**
 * Animated Roll-Up Counter for Evaluation & Accuracy Metrics
 * Triggers smoothly as soon as the #impact section scrolls into view.
 */
export function initEvaluationMetricsCountUp() {
  const impactSec = document.getElementById('impact');
  if (!impactSec) return;

  const counterEls = impactSec.querySelectorAll('.counter-val[data-counter-target]');
  if (!counterEls.length) return;

  let hasAnimated = false;

  const startAnimation = () => {
    if (hasAnimated) return;
    hasAnimated = true;

    counterEls.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-counter-target')) || 0;
      const prefix = el.getAttribute('data-counter-prefix') || '';
      const suffix = el.getAttribute('data-counter-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
      const duration = 2.0;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${prefix}${obj.val.toFixed(decimals)}${suffix}`;
        }
      });
    });
  };

  ScrollTrigger.create({
    trigger: impactSec,
    start: 'top 75%',
    once: true,
    onEnter: startAnimation
  });
}
