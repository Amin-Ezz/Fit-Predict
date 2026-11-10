/**
 * FitPredict — Liquid Toggle (Gender Switcher)
 * Reconstructed from Bencho Liquid Toggle (MIT Licensed — bencho.dev/licence)
 *
 * Implements Framer/GSAP spring elasticity, velocity-dependent stretching,
 * area preservation (scaleY = 1/scaleX), and 100% reliable click/toggle logic.
 */

import { gsap } from 'gsap';

export class LiquidGenderToggle {
  constructor(element, options = {}) {
    this.el = element; // The button element (.liq-gender-sw)
    this.thumbEl = element.querySelector('.liq-thumb');
    this.labelMale = element.querySelector('[data-gender-val="male"]');
    this.labelFemale = element.querySelector('[data-gender-val="female"]');

    this.on = options.initial === 'female'; // false = male, true = female
    this.onChange = options.onChange || null;

    // Geometry
    this.trackWidth = options.trackWidth || 140;
    this.thumbWidth = options.thumbWidth || 66;
    this.pad = options.pad || 4;

    this.shutX = this.pad; // Male (left)
    this.openX = this.trackWidth - this.thumbWidth - this.pad; // Female (right)

    this._setupGeometry();
    this._bindEvents();
    this.setState(this.on ? 'female' : 'male', false);
  }

  _setupGeometry() {
    this.el.style.width = `${this.trackWidth}px`;
    if (this.thumbEl) {
      this.thumbEl.style.width = `${this.thumbWidth}px`;
    }
  }

  getState() {
    return this.on ? 'female' : 'male';
  }

  setState(gender, animate = true) {
    const nextOn = gender === 'female';
    this.on = nextOn;
    const targetX = this.on ? this.openX : this.shutX;

    this.el.setAttribute('data-on', this.on ? 'true' : 'false');
    this.el.setAttribute('aria-checked', this.on ? 'true' : 'false');

    if (this.labelMale && this.labelFemale) {
      this.labelMale.classList.toggle('active', !this.on);
      this.labelFemale.classList.toggle('active', this.on);
    }

    if (!animate) {
      gsap.set(this.thumbEl, { x: targetX, scaleX: 1, scaleY: 1 });
    } else {
      // Liquid droplet elasticity with GSAP: stretch along movement direction, area preserved
      gsap.killTweensOf(this.thumbEl);

      // Travel to target with spring give
      gsap.to(this.thumbEl, {
        x: targetX,
        duration: 0.38,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Liquid droplet stretch and settle: scaleX stretches, scaleY thins, then elastifies back
      gsap.timeline()
        .to(this.thumbEl, {
          scaleX: 1.18,
          scaleY: 0.85,
          duration: 0.15,
          ease: 'power1.out'
        })
        .to(this.thumbEl, {
          scaleX: 0.95,
          scaleY: 1.05,
          duration: 0.12,
          ease: 'power1.inOut'
        })
        .to(this.thumbEl, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.15,
          ease: 'elastic.out(1.1, 0.45)'
        });
    }

    if (this.onChange) {
      this.onChange(this.getState());
    }
  }

  toggle(animate = true) {
    this.setState(this.on ? 'male' : 'female', animate);
  }

  _bindEvents() {
    // 1. Rock-solid click handler: Left half = Male, Right half = Female
    this.el.addEventListener('click', (e) => {
      const rect = this.el.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const isRightHalf = clickX >= rect.width / 2;

      if (isRightHalf) {
        // Clicked right half (Female area)
        if (this.on) {
          // If already female, tapping the button toggles back to male
          this.setState('male', true);
        } else {
          this.setState('female', true);
        }
      } else {
        // Clicked left half (Male area)
        if (!this.on) {
          // If already male, tapping the button toggles to female
          this.setState('female', true);
        } else {
          this.setState('male', true);
        }
      }
    });

    // 2. Keyboard support (Space / Enter toggles, Arrows explicitly choose)
    this.el.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.toggle(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.setState('male', true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.setState('female', true);
      }
    });

    // 3. Touch swipe gesture support
    let touchStartX = 0;
    this.el.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    this.el.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        if (deltaX > 25) {
          // Swiped right -> Female
          this.setState('female', true);
        } else if (deltaX < -25) {
          // Swiped left -> Male
          this.setState('male', true);
        }
      }
    }, { passive: true });
  }
}
