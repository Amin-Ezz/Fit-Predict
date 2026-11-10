/**
 * FitPredict — Liquid Goal Selector
 * Powers the 3 Goal Selection Cards (Muscle Growth, Fat Loss, Endurance)
 * with liquid droplet stretching, velocity give, and elastic settle physics.
 */

import { gsap } from 'gsap';

export class LiquidGoalSelector {
  constructor(container, options = {}) {
    this.container = container;
    this.chips = container.querySelectorAll('.goal-chip');
    this.thumb = container.querySelector('#goal-liquid-thumb');
    this.currentGoal = options.initial || 'muscle';
    this.onChange = options.onChange || null;

    this._init();
  }

  _init() {
    this.chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const goal = chip.getAttribute('data-goal');
        if (goal) {
          this.setGoal(goal, true);
        }
      });
    });

    // Handle responsive resize realignment
    window.addEventListener('resize', () => {
      this._updateVisuals(this.currentGoal, false);
    }, { passive: true });

    // Initial position sync after initial layout paint
    requestAnimationFrame(() => {
      this._updateVisuals(this.currentGoal, false);
    });
    setTimeout(() => {
      this._updateVisuals(this.currentGoal, false);
    }, 100);
  }

  getGoal() {
    return this.currentGoal;
  }

  setGoal(goal, animate = true) {
    if (!goal) return;
    this.currentGoal = goal;
    this._updateVisuals(goal, animate);
    if (this.onChange) {
      this.onChange(goal);
    }
  }

  _updateVisuals(goal, animate = true) {
    const targetChip = this.container.querySelector(`.goal-chip[data-goal="${goal}"]`);
    if (!targetChip || !this.thumb) return;

    this.chips.forEach(c => {
      const isActive = c.getAttribute('data-goal') === goal;
      c.classList.toggle('active', isActive);
      c.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const targetLeft = targetChip.offsetLeft;
    const targetTop = targetChip.offsetTop;
    const targetWidth = targetChip.offsetWidth;
    const targetHeight = targetChip.offsetHeight;

    if (!animate) {
      gsap.set(this.thumb, {
        x: targetLeft,
        y: targetTop,
        width: targetWidth,
        height: targetHeight,
        scaleX: 1,
        scaleY: 1
      });
    } else {
      gsap.killTweensOf(this.thumb);

      // Liquid sliding motion: stretch along X with elastic rebound
      gsap.to(this.thumb, {
        x: targetLeft,
        y: targetTop,
        width: targetWidth,
        height: targetHeight,
        duration: 0.40,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      // Liquid droplet elasticity (stretch then spring back)
      gsap.timeline()
        .to(this.thumb, {
          scaleX: 1.12,
          scaleY: 0.88,
          duration: 0.15,
          ease: 'power1.out'
        })
        .to(this.thumb, {
          scaleX: 0.96,
          scaleY: 1.04,
          duration: 0.12,
          ease: 'power1.inOut'
        })
        .to(this.thumb, {
          scaleX: 1,
          scaleY: 1,
          duration: 0.18,
          ease: 'elastic.out(1.1, 0.45)'
        });

      // Subtle pop on the active card's emoji
      const emojiEl = targetChip.querySelector('.goal-emoji');
      if (emojiEl) {
        gsap.fromTo(emojiEl,
          { scale: 0.85, rotate: -8 },
          { scale: 1, rotate: 0, duration: 0.35, ease: 'back.out(2)' }
        );
      }
    }
  }
}
