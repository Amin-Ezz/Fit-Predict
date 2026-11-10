/**
 * FitPredict — Bencho Image Accordion (Vanilla JS Engine)
 * Reconstructed from Bencho Image Accordion (MIT Licensed — bencho.dev/licence)
 *
 * A row of picture cards cropped to slivers. Point at one and it opens;
 * the others give up exactly what it takes.
 * 
 * Implements Bencho's exact spring mathematics, Gaussian falloff reach,
 * non-linear damping ratio tuning, and flex-basis negotiation.
 */

/* ── inlined from lab/spring ──────────────────────── */
/* ── one spring, for everything that settles ───────────────
   The maths was already on this bench twice, copied by hand:
   Humidity's wheel and Brightness's column both accumulate
   velocity toward a target, damp it, and snap when both the
   delta and the velocity fall under 0.02.
   
   Frames, not milliseconds. `dt` is expressed in sixtieths of
   a second and the damping is RAISED to it rather than
   multiplied by it, so a dropped frame decays the same amount
   of energy as the two frames it replaced.
   
   The loop parks itself the moment the value has settled. */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/* 0..100 into the two numbers a spring actually has.
   50 is what Humidity and Brightness were tuned at.
   0   → zeta ~0.85, heavy, arrives without a ring
   50  → zeta ~0.41, near where Humidity and Brightness sit
   100 → zeta ~0.20, lively, two visible rebounds */
const springOf = (tune = 50) => ({
  /* stiffness: how hard it is pulled toward the target */
  k: 0.08 + (tune / 100) * 0.16,
  /* decay, per frame: how much of the velocity survives */
  d: 0.62 + (tune / 100) * 0.2,
});

/* ── the corner, and it FOLLOWS THE GAP ────────────────────
   A rounded picture next to a rounded picture with no air
   between them leaves a little notch of page showing at every
   join. The radius is the gap, capped at its own maximum. */
const RMAX = 16;

/* ── how much the open one takes ───────────────────────────
   As a share of what an unopened picture has. 50 is the value
   this was drawn at — 1.8, so the open picture is nearly
   three times a resting one. */
const lift = (open = 55) => 0.4 + (clamp(open, 0, 100) / 100) * 2.8;

/* ── and how far the swell carries ─────────────────────────
   A gaussian on the distance in pictures, so it is smooth and
   it never reaches a distant card with anything you could see. */
const fall = (d, reach = 35) => {
  const s = 0.35 + (clamp(reach, 0, 100) / 100) * 0.9;
  return Math.exp(-((d / s) ** 2));
};

const stillness = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export class ImageAccordion {
  constructor(container, options = {}) {
    if (!container) return;
    this.container = container;
    this.open = options.open ?? 60;
    this.reach = options.reach ?? 40;
    this.bounce = options.bounce ?? 14;
    this.gap = clamp(options.gap ?? 12, 0, 24);
    this.k = lift(this.open);
    this.still = stillness();

    this.cells = Array.from(this.container.querySelectorAll('.acc-cell'));
    this.at = options.initialIndex ?? null;
    this.rafId = 0;
    this.prevTime = 0;

    const { k, d } = springOf(this.bounce);
    this.springK = k;
    this.springD = d;

    this.states = this.cells.map(() => ({
      cur: 0,
      target: 0,
      vel: 0
    }));

    this._setupStyles();
    this._bindEvents();

    if (this.at !== null) {
      this.setAt(this.at, true);
    }
  }

  _setupStyles() {
    const radius = Math.min(RMAX, this.gap > 0 ? this.gap + 4 : 0);
    this.container.classList.add('acc');
    this.container.style.gap = `${this.gap}px`;
    this.container.style.borderRadius = `${radius}px`;

    this.cells.forEach((cell, idx) => {
      cell.style.borderRadius = `${radius}px`;
      cell.style.flexBasis = '0';
      cell.style.minWidth = '0';
      cell.style.flexGrow = '1';
      cell.setAttribute('data-index', idx);
    });
  }

  _bindEvents() {
    this.cells.forEach((cell, i) => {
      cell.addEventListener('pointerenter', () => {
        this.setAt(i);
      });
    });

    this.container.addEventListener('pointerout', (e) => {
      const to = e.relatedTarget;
      if (!to || !this.container.contains(to)) {
        this.setAt(null);
      }
    });

    this.container.addEventListener('pointercancel', () => {
      this.setAt(null);
    });
  }

  setAt(index, instant = false) {
    this.at = index;

    this.cells.forEach((cell, i) => {
      const want = this.at === null ? 0 : fall(Math.abs(i - this.at), this.reach) * 100;
      this.states[i].target = want;

      if (this.at === i) {
        cell.setAttribute('data-open', 'true');
      } else {
        cell.removeAttribute('data-open');
      }

      if (instant || this.still) {
        this.states[i].cur = want;
        this.states[i].vel = 0;
        const u = want / 100;
        cell.style.flexGrow = (1 + this.k * u).toFixed(4);
      }
    });

    if (!instant && !this.still && !this.rafId) {
      this.prevTime = 0;
      this.rafId = requestAnimationFrame((t) => this._tick(t));
    }
  }

  _tick(t) {
    const dt = this.prevTime ? clamp((t - this.prevTime) / 16.67, 0, 2.5) : 1;
    this.prevTime = t;

    let allSettled = true;

    this.states.forEach((st, i) => {
      st.vel += (st.target - st.cur) * this.springK * dt;
      st.vel *= Math.pow(this.springD, dt);
      st.cur += st.vel * dt;

      if (Math.abs(st.target - st.cur) < 0.02 && Math.abs(st.vel) < 0.02) {
        st.cur = st.target;
        st.vel = 0;
      } else {
        allSettled = false;
      }

      const u = st.cur / 100;
      this.cells[i].style.flexGrow = (1 + this.k * u).toFixed(4);
    });

    if (allSettled) {
      this.rafId = 0;
    } else {
      this.rafId = requestAnimationFrame((time) => this._tick(time));
    }
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }
}

/**
 * Initializes the Presets Accordion and wires "Load into Predictor" actions
 */
export function initPresetsAccordion(onSelectPreset) {
  const container = document.getElementById('presets-accordion');
  if (!container) return null;

  const accordion = new ImageAccordion(container, {
    open: 65,
    reach: 38,
    bounce: 12,
    gap: 14
  });

  // Bind the "Load into Predictor" buttons and card clicks
  const buttons = container.querySelectorAll('.btn-load-preset');
  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const key = btn.getAttribute('data-preset-key');
      if (onSelectPreset && key) {
        onSelectPreset(key);
      }
    });
  });

  return accordion;
}
