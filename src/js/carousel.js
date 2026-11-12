/**
 * FitPredict — Bencho 3D Turntable Carousel (Vanilla JS Engine)
 * Reconstructed from Bencho Carousel (MIT Licensed — bencho.dev/licence)
 *
 * Cards on a turntable that drift at rest, give under the pointer,
 * and can be swiped/thrown round endlessly without modulo seams.
 */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mix = (a, b, t) => a + (b - a) * t;

/* 0..100 into the two numbers a spring actually has.
   50 is what Humidity and Brightness were tuned at.
   0   → zeta ~0.85, heavy, arrives without a ring
   50  → zeta ~0.41, near where Humidity and Brightness sit
   100 → zeta ~0.20, lively, two visible rebounds */
const springOf = (tune = 50) => ({
  k: 0.08 + (tune / 100) * 0.16,
  d: 0.62 + (tune / 100) * 0.2,
});

const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const rate = (speed) => 1.6 - (speed / 100) * 1.2;
const out = (t) => 1 - Math.pow(1 - t, 4);

/* Carousel Constants */
const ORBIT = 185;
const DEPTH = 90;
const DEPTH_MAX = 150;
const LEAN = 38;
const PULL = 140;
const TOSS = 160;
const MOST = 2;
const BASE = 620;
const ANGLE = [-3.5, 2.8, -1.8, 3.2, 1.5];
const PERIOD = [4.7, 5.9, 6.7, 5.3];

export class BenchoCarousel {
  constructor(container, options = {}) {
    if (!container) return;
    this.container = container;
    this.track = container.querySelector('.car-track');
    this.slots = Array.from(container.querySelectorAll('.car-slot'));
    this.cards = Array.from(container.querySelectorAll('.car-card'));
    this.onSelectPreset = options.onSelectPreset || null;

    if (!this.slots.length) return;

    this.N = this.slots.length;
    this.orbit = options.orbit ?? ORBIT;
    this.depth = options.depth ?? DEPTH;
    this.settle = options.settle ?? 50;
    this.autoplayInterval = options.autoplayInterval ?? 2700;
    this.autoplayTimer = null;
    this.isHovered = false;
    this.turn = 0; // continuous rotation position in card-steps
    this.held = false;
    this.drag = null;
    this.rafId = 0;
    this.still = stillness();

    this._setupFloatingPeriods();
    this._bindDragEvents();
    this._bindCardTilt();
    this._bindCardClicks();
    this._bindHoverAndVisibility();

    this.paint();
    this._updateActiveState();

    if (options.autoplay !== false) {
      this.startAutoplay();
    }
  }

  _bindHoverAndVisibility() {
    // Pause auto-rotation when user is hovering over the carousel
    this.container.addEventListener('pointerenter', () => {
      this.isHovered = true;
    });
    this.container.addEventListener('pointerleave', () => {
      this.isHovered = false;
    });

    // Pause auto-rotation when browser tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAutoplay();
      } else {
        this.startAutoplay();
      }
    });

    // Pause auto-rotation when carousel is scrolled out of viewport
    if (typeof IntersectionObserver !== 'undefined') {
      const carouselObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.startAutoplay();
          } else {
            this.stopAutoplay();
          }
        });
      }, { threshold: 0.1 });
      carouselObserver.observe(this.container);
    }
  }

  startAutoplay(interval = this.autoplayInterval) {
    this.autoplayInterval = interval;
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      if (!this.held && !this.isHovered && !document.hidden && !this.still) {
        this.go(1);
      }
    }, this.autoplayInterval);
  }

  stopAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  resetAutoplay() {
    this.startAutoplay();
  }

  _setupFloatingPeriods() {
    this.slots.forEach((slot, i) => {
      const floater = slot.querySelector('.car-float');
      if (floater) {
        floater.style.animationDuration = `${PERIOD[i % PERIOD.length]}s`;
      }
    });
  }

  spotOf(i, turn, orbit, depth) {
    const th = (i - turn) * ((Math.PI * 2) / this.N);
    const f = (Math.cos(th) + 1) / 2;
    return {
      x: Math.sin(th) * orbit,
      y: -(1 - f) * LEAN,
      s: mix(1 - clamp(depth, 0, DEPTH_MAX) / 200, 1, f),
      z: Math.round(f * 100),
      isFront: f > 0.85
    };
  }

  write(el, sp, angle) {
    el.style.transform = `translate(-50%, -50%) translate(${sp.x.toFixed(2)}px, ${sp.y.toFixed(2)}px) rotate(${angle}deg) scale(${sp.s.toFixed(4)})`;
    el.style.zIndex = String(sp.z);
  }

  paint() {
    this.slots.forEach((slot, i) => {
      const sp = this.spotOf(i, this.turn, this.orbit, this.depth);
      this.write(slot, sp, ANGLE[i % ANGLE.length]);
      slot.setAttribute('data-front', sp.isFront ? 'true' : 'false');
    });
  }

  _updateActiveState() {
    // Determine which card is currently closest to the front
    const normalizedTurn = ((Math.round(this.turn) % this.N) + this.N) % this.N;
    this.slots.forEach((slot, i) => {
      const isCurrent = i === normalizedTurn;
      slot.classList.toggle('active-front', isCurrent);
      const card = slot.querySelector('.car-card');
      if (card) {
        card.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      }
    });

    // Update indicator dots if present
    const dots = document.querySelectorAll('[data-carousel-dot]');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === normalizedTurn);
    });
  }

  glide(to) {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    const from = this.turn;
    if (this.still || Math.abs(from - to) < 0.001) {
      this.turn = to;
      this.paint();
      this._updateActiveState();
      return;
    }

    const ms = BASE * rate(clamp(this.settle, 0, 100));
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      this.turn = mix(from, to, out(p));
      this.paint();
      if (p < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.turn = to;
        this.paint();
        this._updateActiveState();
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  go(d) {
    this.glide(Math.round(this.turn) + d);
  }

  _bindDragEvents() {
    if (!this.track) return;

    const onDown = (e) => {
      // Don't drag if clicking directly on the CTA action button
      if (e.target.closest('.btn-load-preset')) return;

      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.drag = {
        x0: e.clientX,
        t0: this.turn,
        last: e.clientX,
        t: e.timeStamp,
        vx: 0,
        moved: false,
      };
      this.held = true;
      this.track.setAttribute('data-held', 'true');
      try {
        this.track.setPointerCapture(e.pointerId);
      } catch {
        /* pointer capture fallback */
      }
    };

    const onMove = (e) => {
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x0;
      if (!this.drag.moved && Math.abs(dx) > 3) this.drag.moved = true;

      const dt = Math.max(1, e.timeStamp - this.drag.t);
      this.drag.vx = (this.drag.vx + (e.clientX - this.drag.last) / dt) / 2;
      this.drag.last = e.clientX;
      this.drag.t = e.timeStamp;

      this.turn = this.drag.t0 - dx / PULL;
      this.paint();
      this._updateActiveState();
    };

    const onUp = () => {
      if (!this.drag) return;
      const g = this.drag;
      this.drag = null;
      this.held = false;
      this.track.setAttribute('data-held', 'false');

      const carry = clamp((-g.vx * TOSS) / PULL, -MOST, MOST);
      const to = Math.round(this.turn + carry);
      this.glide(to);
      this.resetAutoplay();
    };

    this.track.addEventListener('pointerdown', onDown);
    this.track.addEventListener('pointermove', onMove);
    this.track.addEventListener('pointerup', onUp);
    this.track.addEventListener('pointercancel', onUp);

    // Keyboard Arrow navigation
    this.track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.go(1);
        this.resetAutoplay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.go(-1);
        this.resetAutoplay();
      }
    });
  }

  _bindCardTilt() {
    this.cards.forEach((card) => {
      const sheen = card.querySelector('.car-sheen');
      let on = false;
      let targetX = 0;
      let targetY = 0;
      let curX = 0;
      let curY = 0;
      let curLit = 0;
      let tiltRaf = 0;

      const { k, d } = springOf(50);

      const renderTilt = () => {
        if (!on && Math.abs(curX) < 0.01 && Math.abs(curY) < 0.01 && curLit < 0.01) {
          card.style.transform = `translateZ(0px) rotateX(0deg) rotateY(0deg)`;
          if (sheen) sheen.style.backgroundImage = 'none';
          tiltRaf = 0;
          return;
        }

        curX += (targetX - curX) * k;
        curX *= d;
        curY += (targetY - curY) * k;
        curY *= d;

        const wantLit = on ? 1 : 0;
        curLit += (wantLit - curLit) * k;
        curLit *= d;

        const deep = 0.5;
        const maxTilt = deep * 13;
        const rx = -curY * maxTilt;
        const ry = curX * maxTilt;

        card.style.transform = `translateZ(${(-10 * deep * curLit).toFixed(2)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;

        if (sheen) {
          const px = ((curX + 1) / 2) * 100;
          const py = ((curY + 1) / 2) * 100;
          const dark = deep * 0.5 * curLit;
          const rim = deep * 0.16 * curLit;
          sheen.style.backgroundImage = `radial-gradient(44% 36% at ${px.toFixed(1)}% ${py.toFixed(1)}%, rgba(9, 14, 28, ${dark.toFixed(3)}) 0%, rgba(9, 14, 28, 0) 100%), radial-gradient(54% 44% at ${(100 - px).toFixed(1)}% ${(100 - py).toFixed(1)}%, rgba(255, 255, 255, ${rim.toFixed(3)}) 0%, rgba(255, 255, 255, 0) 100%)`;
        }

        tiltRaf = requestAnimationFrame(renderTilt);
      };

      card.addEventListener('pointermove', (e) => {
        if (this.held || this.still) return;
        const b = card.getBoundingClientRect();
        targetX = clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1, 1);
        targetY = clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1, 1);
        on = true;
        if (!tiltRaf) tiltRaf = requestAnimationFrame(renderTilt);
      });

      card.addEventListener('pointerleave', () => {
        on = false;
        targetX = 0;
        targetY = 0;
      });
    });
  }

  _bindCardClicks() {
    this.slots.forEach((slot, i) => {
      const card = slot.querySelector('.car-card');
      const btn = slot.querySelector('.btn-load-preset');

      // Click on "Load into Predictor" button
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const key = btn.getAttribute('data-preset-key');
          if (this.onSelectPreset && key) {
            this.onSelectPreset(key);
          }
        });
      }

      // Clicking a card that is not at the front rotates the turntable to bring it front!
      if (card) {
        card.addEventListener('click', (e) => {
          if (this.drag && this.drag.moved) return;
          if (e.target.closest('.btn-load-preset')) return;

          const currentFront = ((Math.round(this.turn) % this.N) + this.N) % this.N;
          if (i !== currentFront) {
            e.preventDefault();
            // Calculate shortest rotation step
            let diff = i - currentFront;
            if (diff > this.N / 2) diff -= this.N;
            if (diff < -this.N / 2) diff += this.N;
            this.glide(Math.round(this.turn) + diff);
            this.resetAutoplay();
          }
        });
      }
    });
  }
}

/**
 * Initializes the Bencho Turntable Carousel in the Presets section
 */
export function initPresetCarousel(onSelectPreset) {
  const container = document.getElementById('presets-carousel');
  if (!container) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const carousel = new BenchoCarousel(container, {
    orbit: isMobile ? 150 : 260,
    depth: isMobile ? 65 : 105,
    settle: 48,
    autoplay: true,
    autoplayInterval: 2700,
    onSelectPreset
  });

  // Responsive orbit & depth recalibration on resize
  window.addEventListener('resize', () => {
    const mobileNow = window.innerWidth < 640;
    const targetOrbit = mobileNow ? 150 : 260;
    const targetDepth = mobileNow ? 65 : 105;
    if (carousel.orbit !== targetOrbit) {
      carousel.orbit = targetOrbit;
      carousel.depth = targetDepth;
      carousel.paint();
    }
  }, { passive: true });

  // Navigation Arrows (search container and document)
  const btnPrev = container.querySelector('[data-carousel-prev]') || document.querySelector('[data-carousel-prev]');
  const btnNext = container.querySelector('[data-carousel-next]') || document.querySelector('[data-carousel-next]');

  if (btnPrev) {
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      carousel.go(-1);
      carousel.resetAutoplay();
    });
  }
  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      carousel.go(1);
      carousel.resetAutoplay();
    });
  }

  // Dots (search container and document)
  const dots = document.querySelectorAll('[data-carousel-dot]');
  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIdx = parseInt(dot.getAttribute('data-carousel-dot'), 10);
      if (!isNaN(targetIdx)) {
        const currentFront = ((Math.round(carousel.turn) % carousel.N) + carousel.N) % carousel.N;
        let diff = targetIdx - currentFront;
        if (diff > carousel.N / 2) diff -= carousel.N;
        if (diff < -carousel.N / 2) diff += carousel.N;
        carousel.glide(Math.round(carousel.turn) + diff);
        carousel.resetAutoplay();
      }
    });
  });

  return carousel;
}
