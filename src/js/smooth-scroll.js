/**
 * Smooth Momentum Scroll Module (Lenis + GSAP ScrollTrigger Integration)
 * Provides 60fps/120fps fluid inertial scrolling matching CleanMax and high-end sites.
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSmoothScroll() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return null;

  // Never hijack touch scrolling on mobile or tablet — preserve 120Hz native GPU momentum
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 992);
  if (isTouch) {
    // Enable native smooth scrolling on html
    document.documentElement.style.scrollBehavior = 'smooth';
    return null;
  }

  // Initialize Lenis instance (Tuned for calm, gentle, luxurious momentum scrolling with zero lag)
  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 0,
    syncTouch: false,
    infinite: false,
  });

  // Keep ScrollTrigger updated on every Lenis scroll tick
  lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis via GSAP's central RAF ticker for frame-locked synchronization
  const tickerCallback = (time) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tickerCallback);
  // Lenis recommended: disable lag smoothing to prevent time-skips and desync during scroll
  gsap.ticker.lagSmoothing(0);

  // Smooth scroll for all in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: 0, duration: 1.25 });
        }
      }
    });
  });

  // Expose on window for easy access / debugging
  window.lenis = lenis;

  return lenis;
}
