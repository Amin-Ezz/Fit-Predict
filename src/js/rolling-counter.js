/**
 * FitPredict — Telemetry Rolling Counter
 * Based on Bencho Rolling Counter (MIT Licensed — bencho.dev/licence)
 *
 * Implements spring physics, 0-9-0 digit strips, odometer carrying,
 * staggered column ripple, velocity motion blur, and press-and-hold repetition.
 */

/* ── one spring, for everything that settles ───────────────
   Frames, not milliseconds. `dt` is expressed in sixtieths of
   a second and the damping is RAISED to it rather than
   multiplied by it, so a dropped frame decays the same amount
   of energy as the two frames it replaced. */
const springOf = (tune = 45) => ({
  /* stiffness: how hard it is pulled toward the target */
  k: 0.08 + (tune / 100) * 0.16,
  /* decay, per frame: how much of the velocity survives */
  d: 0.62 + (tune / 100) * 0.2,
});

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const stillness = () =>
  typeof window !== 'undefined' &&
  !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const CELL_HEIGHT = 28; // pixels per digit window in the stepper box

export class RollingOdometer {
  constructor(element, options = {}) {
    this.el = element;
    this.isFloat = options.isFloat || false;
    this.bounce = options.bounce ?? 45;
    this.stagger = options.stagger ?? 40;
    this.blur = options.blur ?? 50;
    this.places = options.places ?? (this.isFloat ? 3 : 3);
    this.min = options.min ?? 0;
    this.max = options.max ?? 999;
    this.step = options.step ?? (this.isFloat ? 0.5 : 1);
    this.onChange = options.onChange || null;

    // Numerical state
    this.currentRaw = options.start ?? 0;
    this.raf = null;
    this.cols = [];
    this.strips = [];
    this.colEls = [];

    this._buildDOM();
    this.setValue(this.currentRaw, false);
    this._bindInteractions();
  }

  _buildDOM() {
    this.el.innerHTML = '';
    this.el.classList.add('vb-odometer-wrap');
    this.el.setAttribute('tabindex', '0');
    this.el.setAttribute('role', 'spinbutton');

    // Create columns: from highest power to lowest power
    for (let i = 0; i < this.places; i++) {
      const p = this.places - 1 - i;

      // Col container
      const colEl = document.createElement('span');
      colEl.className = 'vb-odometer-col';
      colEl.setAttribute('data-col', p);

      const stripEl = document.createElement('span');
      stripEl.className = 'vb-odometer-strip';

      DIGITS.forEach(d => {
        const digitSpan = document.createElement('span');
        digitSpan.textContent = d;
        stripEl.appendChild(digitSpan);
      });

      colEl.appendChild(stripEl);
      this.el.appendChild(colEl);

      // If float and this is the ones column (p === 1), insert decimal point separator
      if (this.isFloat && p === 1) {
        const dot = document.createElement('span');
        dot.className = 'vb-odometer-dot';
        dot.textContent = '.';
        this.el.appendChild(dot);
      }

      this.colEls[p] = colEl;
      this.strips[p] = stripEl;
      this.cols[p] = { pos: 0, vel: 0, target: 0, due: [], next: [] };
    }
  }

  _getScaledValue(val) {
    return this.isFloat ? Math.round(val * 10) : Math.round(val);
  }

  getValue() {
    return this.currentRaw;
  }

  setValue(val, animate = true) {
    val = clamp(val, this.min, this.max);
    if (this.isFloat) {
      val = Math.round(val * 10) / 10;
    } else {
      val = Math.round(val);
    }
    this.currentRaw = val;
    this.el.setAttribute('aria-valuenow', val);

    const scaled = this._getScaledValue(val);
    const still = stillness();

    // Check visibility of leading zeros (e.g. 74 has tens and ones visible, hundreds hidden)
    for (let p = 0; p < this.places; p++) {
      const divisor = 10 ** p;
      const colVal = Math.floor(scaled / divisor);
      const isVisible = p === 0 || (this.isFloat && p === 1) || scaled >= divisor;

      if (this.colEls[p]) {
        if (!isVisible) {
          this.colEls[p].setAttribute('data-hidden', 'true');
        } else {
          this.colEls[p].removeAttribute('data-hidden');
        }
      }

      const c = this.cols[p];
      if (!c) continue;

      if (!animate || still) {
        c.target = colVal;
        c.pos = colVal;
        c.vel = 0;
        c.due = [];
        c.next = [];
      } else {
        const now = performance.now();
        // Stagger: ripple from lowest digit (p=0) upward
        const dueTime = now + (p * this.stagger);
        c.due.push(dueTime);
        c.next.push(colVal);
      }
    }

    if (!animate || still) {
      this._paint();
    } else {
      this._runLoop();
    }
  }

  _paint() {
    this.cols.forEach((c, p) => {
      const el = this.strips[p];
      if (!el) return;
      const m = ((c.pos % 10) + 10) % 10;
      const smear = Math.min(3, Math.abs(c.vel) * 2.4) * (this.blur / 50);
      el.style.transform = `translateY(${-m * CELL_HEIGHT}px)`;
      el.style.filter = smear > 0.15 ? `blur(${smear.toFixed(2)}px)` : '';
    });
  }

  _runLoop() {
    if (this.raf) return;
    let prev = 0;

    const tick = (t) => {
      const dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;

      const { k, d } = springOf(this.bounce);
      const now = performance.now();
      let busy = false;

      for (const c of this.cols) {
        while (c.due.length && c.due[0] <= now) {
          c.due.shift();
          c.target = c.next.shift();
        }
        if (c.due.length) busy = true;

        const delta = c.target - c.pos;
        if (Math.abs(delta) < 0.002 && Math.abs(c.vel) < 0.002) {
          c.pos = c.target;
          c.vel = 0;
          continue;
        }

        busy = true;
        c.vel = (c.vel + delta * k * dt) * Math.pow(d, dt);
        c.pos += c.vel * dt;
      }

      this._paint();

      if (busy) {
        this.raf = requestAnimationFrame(tick);
      } else {
        this.raf = null;
      }
    };

    this.raf = requestAnimationFrame(tick);
  }

  _bindInteractions() {
    // 1. Dragging directly on the number strip (Bencho gesture)
    let isDown = false;
    let lastY = 0;
    let travel = 0;
    const PX_STEP = 14;

    const onPointerDown = (e) => {
      isDown = true;
      lastY = e.clientY;
      travel = 0;
      try {
        this.el.setPointerCapture(e.pointerId);
      } catch (err) {}
    };

    const onPointerMove = (e) => {
      if (!isDown) return;
      const dy = e.clientY - lastY;
      lastY = e.clientY;
      travel += -dy;

      while (Math.abs(travel) >= PX_STEP) {
        const stepDir = travel > 0 ? 1 : -1;
        travel -= stepDir * PX_STEP;
        const nextVal = this.currentRaw + (stepDir * this.step);
        this.setValue(nextVal, true);
        if (this.onChange) this.onChange(this.currentRaw);
      }
    };

    const onPointerUp = (e) => {
      if (!isDown) return;
      isDown = false;
      try {
        this.el.releasePointerCapture(e.pointerId);
      } catch (err) {}
    };

    this.el.addEventListener('pointerdown', onPointerDown);
    this.el.addEventListener('pointermove', onPointerMove);
    this.el.addEventListener('pointerup', onPointerUp);
    this.el.addEventListener('pointercancel', onPointerUp);

    // 2. Keyboard Arrow Support (Bencho accessibility)
    this.el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const next = this.currentRaw + this.step;
        this.setValue(next, true);
        if (this.onChange) this.onChange(this.currentRaw);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = this.currentRaw - this.step;
        this.setValue(next, true);
        if (this.onChange) this.onChange(this.currentRaw);
      }
    });
  }
}

/**
 * Controller for holding stepper buttons with progressive speedup
 */
export function bindHoldButton(button, onTick) {
  let timer = null;
  let rep = null;
  let count = 0;

  const stop = () => {
    clearTimeout(timer);
    clearTimeout(rep);
    timer = null;
    rep = null;
    count = 0;
  };

  const start = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    stop();
    onTick(); // First immediate tick

    // Bencho progressive hold logic: pause 240ms then repeat faster
    timer = setTimeout(() => {
      let interval = 110;
      const repeatLoop = () => {
        onTick();
        count++;
        if (count > 5) interval = Math.max(38, interval * 0.88);
        rep = setTimeout(repeatLoop, interval);
      };
      repeatLoop();
    }, 240);
  };

  button.addEventListener('pointerdown', start);
  button.addEventListener('pointerup', stop);
  button.addEventListener('pointerleave', stop);
  button.addEventListener('pointercancel', stop);
}
