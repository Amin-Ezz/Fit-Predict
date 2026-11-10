/**
 * FitPredict Main Application Script (Vibeld Aesthetic - English)
 * Powers the Hero Neural Prediction Engine, 3D Glass Options Drawer,
 * Preset Example Chips, Dynamic Navbar Transparency, and Smooth Scroll.
 */

import { createIcons, icons } from 'lucide';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initLandingAnimations, initHeroWordRotator, initCleanMaxScrollTransitions, initEvaluationMetricsCountUp } from './animations.js';
import { initHeroCanvas } from './hero-canvas.js';
import { initSmoothScroll } from './smooth-scroll.js';
import { RollingOdometer, bindHoldButton } from './rolling-counter.js';
import { LiquidGenderToggle } from './liquid-toggle.js';
import { LiquidGoalSelector } from './liquid-goal.js';
import { initPresetCarousel } from './carousel.js';

// Preset Example Profiles for Quick Testing
const ATHLETE_PRESETS = {
  marathon: {
    title: 'Marathon & Endurance',
    age: 28,
    height: 178,
    weight: 65,
    gender: 'male',
    goal: 'endurance',
    sessions: 6,
    expYears: 6,
    sleep: 8.0,
    rhr: 48,
    rpe: 8
  },
  hypertrophy: {
    title: 'Bodybuilding & Lifter',
    age: 25,
    height: 182,
    weight: 84,
    gender: 'male',
    goal: 'muscle',
    sessions: 5,
    expYears: 4,
    sleep: 7.5,
    rhr: 58,
    rpe: 8.5
  },
  crossfit: {
    title: 'CrossFit Athlete',
    age: 27,
    height: 180,
    weight: 79,
    gender: 'male',
    goal: 'muscle',
    sessions: 5,
    expYears: 5,
    sleep: 8.0,
    rhr: 54,
    rpe: 9
  },
  fitness: {
    title: 'Fitness & Fat Loss',
    age: 32,
    height: 174,
    weight: 74,
    gender: 'female',
    goal: 'fatloss',
    sessions: 4,
    expYears: 2,
    sleep: 7.0,
    rhr: 65,
    rpe: 6.5
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Smooth Momentum Scrolling (Lenis)
  const lenis = initSmoothScroll();

  // 2. Initialize Lucide Icons
  createIcons({ icons });

  // 3. Initialize Live Animated Canvas Background (60fps, zero lag)
  initHeroCanvas();

  // 3.1 Auto-pause hero video when scrolled out of viewport to eliminate background GPU decoding lag
  const heroVideo = document.querySelector('.hero-bg-video');
  if (heroVideo && typeof IntersectionObserver !== 'undefined') {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          heroVideo.play().catch(() => {});
        } else {
          heroVideo.pause();
        }
      });
    }, { threshold: 0.05 });
    videoObserver.observe(heroVideo);
  }

  // 4. Initialize GSAP Landing Animations & Scroll Triggers
  initLandingAnimations();

  // 5. Initialize CleanMax-Inspired Scroll-Driven Transitions (Hero to sections & stacked cards)
  initCleanMaxScrollTransitions();

  // 6. Initialize Model Metrics Roll-Up Count Animation
  initEvaluationMetricsCountUp();

  // 7. Initialize GitHub Repo Clone Copy Button
  initGitRepoCopy();

  // 8. Initialize Rotating Headline Word (Hero Word Rotator)
  initHeroWordRotator();

  // 9. Initialize Dynamic Navbar Scroll (Clean glass at top, frosted on scroll)
  initNavbarScroll();

  // 10. Initialize Hero Prediction Engine (Dedicated Section)
  const predictor = initHeroPredictionEngine();

  // 11. Initialize Athlete Presets Bencho Turntable Carousel
  initPresetCarousel((presetKey) => {
    if (predictor && predictor.applyPreset) {
      predictor.applyPreset(presetKey, true);
    }
  });

  // 9. Smooth Anchor Scrolling Fallback (when Lenis is not active e.g. reduced-motion)
  if (!lenis) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // Recalibrate ScrollTrigger positions once external assets (images, fonts) finish loading
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });

  // 5. Mobile Mega Menu Controls (Full directory, backdrop, scroll-lock, auto-close)
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
  const mobileClose = document.getElementById('mobile-menu-close');

  const openMobileMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    if (mobileBackdrop) mobileBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    createIcons({ icons });
  };

  const closeMobileMenu = () => {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    if (mobileBackdrop) mobileBackdrop.classList.add('hidden');
    document.body.style.overflow = '';
  };

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileMenu.classList.contains('hidden')) {
        openMobileMenu();
      } else {
        closeMobileMenu();
      }
    });

    if (mobileClose) {
      mobileClose.addEventListener('click', closeMobileMenu);
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', closeMobileMenu);
    }

    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }
});

/**
 * Manages Dynamic Navbar: Clean Glass before scroll, Frosted Light on scroll
 */
function initNavbarScroll() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  function handleScroll() {
    if (window.scrollY > 20) {
      nav.classList.add('vb-nav-scrolled');
      nav.classList.remove('vb-nav-liquid');
    } else {
      nav.classList.add('vb-nav-liquid');
      nav.classList.remove('vb-nav-scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Hero Prediction Controller (Steppers, Gender, Goals, and Instant Results)
 */
function initHeroPredictionEngine() {
  const btnRun = document.getElementById('btn-hero-predict');
  const btnReset = document.getElementById('btn-hero-reset');
  const resultCard = document.getElementById('hero-prediction-result');
  const exampleChips = document.querySelectorAll('[data-example-preset]');
  const goalChips = document.querySelectorAll('.goal-chip');
  const genderBtns = document.querySelectorAll('.gender-btn');
  const stepButtons = document.querySelectorAll('.vb-step-btn');

  // Current Working State
  let currentFeatures = {
    age: 28,
    height: 178,
    weight: 74,
    gender: 'male',
    goal: 'muscle',
    sessions: 4,
    expYears: 3,
    sleep: 7.5,
    rhr: 60,
    rpe: 7
  };

  // 1. Bind Stepper Buttons (+ / -) with Bencho Rolling Counter
  const bounds = {
    weight: { min: 40, max: 160, step: 1, float: false },
    height: { min: 140, max: 220, step: 1, float: false },
    age: { min: 16, max: 75, step: 1, float: false },
    sleep: { min: 4.0, max: 12.0, step: 0.5, float: true },
    sessions: { min: 1, max: 7, step: 1, float: false },
    rpe: { min: 1, max: 10, step: 1, float: false }
  };

  // Instantiate Bencho-powered Rolling Odometers for each stepper
  const odometers = {};
  Object.keys(bounds).forEach(key => {
    const el = document.getElementById(`disp-${key}`);
    if (el) {
      odometers[key] = new RollingOdometer(el, {
        start: currentFeatures[key],
        min: bounds[key].min,
        max: bounds[key].max,
        step: bounds[key].step,
        isFloat: bounds[key].float,
        bounce: 45,
        stagger: 40,
        blur: 50,
        onChange: (newVal) => {
          currentFeatures[key] = newVal;
        }
      });
    }
  });

  // Bind Stepper Buttons (+ / -) with progressive repeating hold
  stepButtons.forEach(btn => {
    bindHoldButton(btn, () => {
      const stepType = btn.getAttribute('data-step');
      const delta = parseFloat(btn.getAttribute('data-delta')) || 0;
      const cfg = bounds[stepType];
      if (!cfg) return;

      let currentVal = currentFeatures[stepType] ?? 0;
      let nextVal = currentVal + delta;
      nextVal = Math.max(cfg.min, Math.min(cfg.max, nextVal));
      if (cfg.float) {
        nextVal = Math.round(nextVal * 10) / 10;
      } else {
        nextVal = Math.round(nextVal);
      }

      currentFeatures[stepType] = nextVal;
      if (odometers[stepType]) {
        odometers[stepType].setValue(nextVal, true);
      }
    });
  });

  // 2. Initialize Liquid Gender Toggle (Powered by Bencho Liquid Engine)
  const genderToggleEl = document.getElementById('gender-liquid-toggle');
  let genderToggle = null;
  if (genderToggleEl) {
    genderToggle = new LiquidGenderToggle(genderToggleEl, {
      initial: currentFeatures.gender,
      trackWidth: 140,
      thumbWidth: 66,
      pad: 4,
      stretch: 36,
      speed: 52,
      onChange: (gender) => {
        currentFeatures.gender = gender;
      }
    });
  }

  // Fallback for any standard gender buttons if present
  genderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const gender = btn.getAttribute('data-gender');
      currentFeatures.gender = gender;
      if (genderToggle) genderToggle.setState(gender, true);
      genderBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // 3. Initialize Liquid Goal Selector (droplet stretching, elastic settle)
  const goalContainer = document.getElementById('goal-selection-container');
  let goalSelector = null;
  if (goalContainer) {
    goalSelector = new LiquidGoalSelector(goalContainer, {
      initial: currentFeatures.goal,
      onChange: (goal) => {
        currentFeatures.goal = goal;
      }
    });
  }

  // Fallback for direct click events on chips
  goalChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const goal = chip.getAttribute('data-goal');
      if (goal) {
        currentFeatures.goal = goal;
        if (goalSelector) {
          goalSelector.setGoal(goal, true);
        } else {
          goalChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
      }
    });
  });

  // 4. Function to Apply Any Preset into the Predictor
  function applyPreset(key, shouldScroll = false) {
    const preset = ATHLETE_PRESETS[key];
    if (!preset) return;

    exampleChips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-example-preset') === key);
    });

    currentFeatures = { ...currentFeatures, ...preset };
    updateDisplayValues(currentFeatures);

    // Sync gender toggle and buttons
    if (genderToggle && currentFeatures.gender) {
      genderToggle.setState(currentFeatures.gender, true);
    }
    genderBtns.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-gender') === currentFeatures.gender);
    });

    // Sync goal selector with liquid sliding animation
    if (goalSelector && currentFeatures.goal) {
      goalSelector.setGoal(currentFeatures.goal, true);
    }
    goalChips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-goal') === currentFeatures.goal);
    });

    // If requested, smooth scroll up to the calculator
    if (shouldScroll) {
      const calcTarget = document.getElementById('calculator') || document.getElementById('prompt');
      calcTarget?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 5. Bind Preset Chips
  exampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const key = chip.getAttribute('data-example-preset');
      const shouldScroll = Boolean(chip.closest('#profiles'));
      applyPreset(key, shouldScroll);
    });
  });

  // 6. Run Prediction Button
  if (btnRun) {
    btnRun.addEventListener('click', () => {
      executePrediction(currentFeatures, true);
    });
  }

  // 6. Reset / Adjust Inputs Button (Back to Overview)
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      const defaultInfo = document.getElementById('calc-info-default');
      const resultCard = document.getElementById('hero-prediction-result');
      if (resultCard && defaultInfo && !resultCard.classList.contains('hidden')) {
        gsap.to(resultCard, {
          opacity: 0,
          x: 35,
          duration: 0.28,
          ease: 'power2.in',
          onComplete: () => {
            resultCard.classList.add('hidden');
            defaultInfo.classList.remove('hidden');
            gsap.fromTo(defaultInfo,
              { opacity: 0, x: -30 },
              { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' }
            );
            createIcons({ icons });
          }
        });
      }
    });
  }

  // Sync display with Rolling Counter support
  function updateDisplayValues(features, animate = true) {
    const map = {
      weight: features.weight,
      height: features.height,
      age: features.age,
      sleep: features.sleep,
      sessions: features.sessions,
      rpe: features.rpe
    };

    Object.entries(map).forEach(([key, val]) => {
      if (odometers[key]) {
        odometers[key].setValue(val, animate);
      } else {
        const el = document.getElementById(`disp-${key}`);
        if (el) el.textContent = typeof val === 'number' && key === 'sleep' ? val.toFixed(1) : val;
      }
    });
  }

  // Initial display sync (instant without animation)
  updateDisplayValues(currentFeatures, false);

  if (window.location.search.includes('predict') && btnRun) {
    document.getElementById('prompt')?.scrollIntoView();
    setTimeout(() => {
      btnRun.click();
      document.getElementById('prompt')?.scrollIntoView();
    }, 400);
  }

  return {
    applyPreset,
    updateDisplayValues
  };
}

/**
 * Executes multi-target prediction and displays results right in the hero panel
 */
function executePrediction(features, animateButton = true) {
  const btnRun = document.getElementById('btn-hero-predict');

  if (animateButton && btnRun) {
    btnRun.disabled = true;
    btnRun.classList.add('opacity-80');
    const originalText = btnRun.innerHTML;
    btnRun.innerHTML = `
      <svg class="animate-spin h-4 w-4 text-[#004020]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span class="text-[#004020]">Predicting...</span>
    `;

    setTimeout(() => {
      btnRun.disabled = false;
      btnRun.classList.remove('opacity-80');
      btnRun.innerHTML = originalText;
      renderResult(features, true);
      createIcons({ icons });
    }, 450);
  } else {
    renderResult(features, false);
    createIcons({ icons });
  }
}

/**
 * Runs animated fill micro-interactions for the 3 target prescription cards
 */
function animateTargetPrescription(animValues) {
  const resultCard = document.getElementById('hero-prediction-result');
  if (!resultCard) return;

  const proteinGauge = document.getElementById('hero-res-protein-gauge');
  const waterGauge = document.getElementById('hero-res-water-gauge');
  const activityGauge = document.getElementById('hero-res-activity-gauge');
  const proteinCircle = document.getElementById('hero-res-protein-circle');

  const proteinValEl = document.getElementById('hero-res-protein-val');
  const waterValEl = document.getElementById('hero-res-water-val');
  const electrolytesValEl = document.getElementById('hero-res-electrolytes-val');
  const activityValEl = document.getElementById('hero-res-activity-val');

  const cards = resultCard.querySelectorAll('.it-result-card');

  // 1. Trigger Card Fill Sheen & Staggered Pop
  cards.forEach((card, idx) => {
    card.classList.remove('animate-fill-sweep');
    // Force DOM reflow to re-trigger CSS keyframe
    void card.offsetWidth;
    setTimeout(() => {
      card.classList.add('animate-fill-sweep');
    }, idx * 80);
  });

  gsap.killTweensOf(cards);
  gsap.fromTo(cards,
    { scale: 0.97, opacity: 0.85 },
    { scale: 1, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out' }
  );

  // 2. Animate 3 Liquid Progress Bars with Bubbles from 0% to Target
  gsap.killTweensOf([proteinGauge, waterGauge, activityGauge]);
  if (proteinGauge) proteinGauge.style.width = '0%';
  if (waterGauge) waterGauge.style.width = '0%';
  if (activityGauge) activityGauge.style.width = '0%';

  if (proteinGauge) {
    gsap.fromTo(proteinGauge,
      { width: '0%' },
      { width: `${animValues.proteinPercent}%`, duration: 1.25, ease: 'power2.out', delay: 0.08 }
    );
  }

  if (waterGauge) {
    gsap.fromTo(waterGauge,
      { width: '0%' },
      { width: `${animValues.waterPercent}%`, duration: 1.25, ease: 'power2.out', delay: 0.18 }
    );
  }

  if (activityGauge) {
    gsap.fromTo(activityGauge,
      { width: '0%' },
      { width: `${animValues.activityPercent}%`, duration: 1.25, ease: 'power2.out', delay: 0.28 }
    );
  }

  // Circular Donut Gauge fallback if present
  if (proteinCircle) {
    const circumference = 201.06;
    const ratio = parseFloat(animValues.proteinRatio) || 2.2;
    const fraction = Math.min(0.92, Math.max(0.3, (ratio - 0.8) / 1.8));
    const targetOffset = circumference * (1 - fraction);
    gsap.killTweensOf(proteinCircle);
    gsap.fromTo(proteinCircle,
      { strokeDashoffset: circumference },
      { strokeDashoffset: targetOffset, duration: 1.1, ease: 'power2.out', delay: 0.08 }
    );
  }

  // 4. Animate Numbers counting up from 0 to targets (GPU-friendly)
  const counterObj = {
    protein: 0,
    water: 0,
    electro: 0,
    activity: 0
  };
  gsap.killTweensOf(counterObj);
  gsap.to(counterObj, {
    protein: animValues.dailyProteinG,
    water: animValues.totalWaterL,
    electro: animValues.electrolytesMg,
    activity: animValues.dailyActivityMins,
    duration: 1.2,
    ease: 'power2.out',
    onUpdate: () => {
      if (proteinValEl) proteinValEl.textContent = Math.round(counterObj.protein);
      if (waterValEl) waterValEl.textContent = counterObj.water.toFixed(1);
      if (electrolytesValEl) electrolytesValEl.textContent = Math.round(counterObj.electro).toLocaleString();
      if (activityValEl) activityValEl.textContent = Math.round(counterObj.activity);
    }
  });
}

/**
 * Renders the 3 requested predictions directly into the hero result panel
 */
function renderResult(features, playFillAnimation = false) {
  const resultCard = document.getElementById('hero-prediction-result');
  if (!resultCard) return;

  const weight = Number(features.weight) || 74;
  const sessions = Number(features.sessions) || 4;
  const sleep = Number(features.sleep) || 7.5;
  const rpe = Number(features.rpe) || 7;
  const gender = features.gender || 'male';
  const goal = features.goal || 'muscle';
  const expYears = Number(features.expYears) || 3;
  const rhr = Number(features.rhr) || 60;

  // 1. TARGET 1: Daily Protein Intake (ISSN & Sports Physiology Model)
  let baseMultiplier = 1.6;
  if (goal === 'muscle') {
    baseMultiplier = 2.05;
  } else if (goal === 'fatloss') {
    baseMultiplier = 2.15; // Higher protein in caloric deficit to preserve lean mass
  } else {
    baseMultiplier = 1.65; // Endurance
  }

  // Stress & Sleep Catabolism adjustment
  const sleepPenalty = sleep < 7.0 ? 0.1 : 0;
  const intensityBoost = (rpe - 5) * 0.04;
  const proteinMultiplier = Math.min(2.45, Math.max(1.4, baseMultiplier + sleepPenalty + intensityBoost));
  const dailyProteinG = Math.round(weight * proteinMultiplier);
  const proteinRatio = (dailyProteinG / weight).toFixed(1);
  const perMealG = Math.round((dailyProteinG / 4) * 10) / 10;

  // 2. TARGET 2: Daily Water & Electrolytes
  // Baseline ~35ml/kg + workout sweat loss
  const sweatFraction = (sessions * 60) / (7 * 60); // approx hours/day
  const sweatLossL = sweatFraction * (0.65 + (rpe / 12) * 0.45);
  const baselineWater = weight * 0.035;
  const totalWaterL = Math.round((baselineWater + sweatLossL) * 10) / 10;
  const electrolytesMg = Math.round(2400 + (gender === 'male' ? 150 : 0) + (sweatLossL * 950));

  // 3. TARGET 3: Daily Recommended Workout Activity (Minutes/day)
  // ACSM / WHO personalized by recovery
  const baseActivity = Math.round(42 + (expYears * 1.8) - ((rhr - 60) * 0.3) + ((sleep - 7) * 2.2) + (rpe * 1.1));
  const dailyActivityMins = Math.min(80, Math.max(35, baseActivity));
  const weeklyHours = ((dailyActivityMins * 7) / 60).toFixed(1);

  // Computed animation targets
  const animValues = {
    dailyProteinG,
    proteinRatio: parseFloat(proteinRatio) || 2.2,
    proteinPercent: Math.min(96, Math.max(35, Math.round((proteinMultiplier / 2.45) * 88))),
    totalWaterL,
    waterPercent: Math.min(96, Math.max(35, Math.round((totalWaterL / 4.6) * 82))),
    electrolytesMg,
    dailyActivityMins,
    activityPercent: Math.min(96, Math.max(35, Math.round((dailyActivityMins / 80) * 85)))
  };

  // Populate static details
  const proteinRatioEl = document.getElementById('hero-res-protein-ratio');
  const proteinDescEl = document.getElementById('hero-res-protein-desc');
  if (proteinRatioEl) proteinRatioEl.textContent = `${proteinRatio} g/kg`;
  if (proteinDescEl) {
    proteinDescEl.textContent = `Targeting 4 balanced meals of ~${perMealG}g to trigger optimal muscle protein synthesis (MPS).`;
  }

  const waterStatusEl = document.getElementById('hero-res-water-status');
  const waterDescEl = document.getElementById('hero-res-water-desc');
  if (waterStatusEl) {
    waterStatusEl.textContent = totalWaterL >= 3.5 ? 'High Sweat Load' : 'Optimal Balance';
  }
  if (waterDescEl) {
    waterDescEl.textContent = `Drink ~250ml every 20-30 mins of activity to balance osmotic pressure and electrolyte retention.`;
  }

  const activityWeeklyEl = document.getElementById('hero-res-activity-weekly');
  const activityDescEl = document.getElementById('hero-res-activity-desc');
  if (activityWeeklyEl) activityWeeklyEl.textContent = `${weeklyHours} hrs/wk`;
  if (activityDescEl) {
    activityDescEl.textContent = goal === 'muscle'
      ? `Focus on progressive resistance hypertrophy with 10 mins post-workout mobility.`
      : goal === 'fatloss'
      ? `Combine aerobic Zone 2 conditioning with circuit training for maximal fat oxidation.`
      : `Sustained Zone 2 cardiorespiratory volume to expand mitochondria density.`;
  }

  // Handle display transitions & fill animations
  const defaultInfo = document.getElementById('calc-info-default');
  if (defaultInfo && !defaultInfo.classList.contains('hidden')) {
    gsap.to(defaultInfo, {
      opacity: 0,
      x: -30,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        defaultInfo.classList.add('hidden');
        resultCard.classList.remove('hidden');
        gsap.fromTo(resultCard,
          { opacity: 0, x: 45, scale: 0.98 },
          { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'power2.out' }
        );
        animateTargetPrescription(animValues);
        createIcons({ icons });
        if (window.innerWidth < 1024) {
          resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  } else if (resultCard.classList.contains('hidden')) {
    resultCard.classList.remove('hidden');
    gsap.fromTo(resultCard,
      { opacity: 0, x: 45, scale: 0.98 },
      { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'power2.out' }
    );
    animateTargetPrescription(animValues);
    createIcons({ icons });
    if (window.innerWidth < 1024) {
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  } else {
    // Result card is already open: re-trigger full fill animation from 0% on predict click
    animateTargetPrescription(animValues);
    gsap.fromTo(resultCard,
      { scale: 0.985 },
      { scale: 1, duration: 0.35, ease: 'power2.out' }
    );
  }
}

/**
 * Copies the GitHub clone command and shows visual feedback
 */
function initGitRepoCopy() {
  const copyBtn = document.getElementById('btn-copy-repo');
  const cloneCmdEl = document.getElementById('git-clone-cmd');
  const copyTextEl = document.getElementById('copy-btn-text');
  if (!copyBtn || !cloneCmdEl) return;

  copyBtn.addEventListener('click', async () => {
    const text = cloneCmdEl.textContent.trim();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    if (copyTextEl) copyTextEl.textContent = 'Copied!';
    copyBtn.classList.add('text-white');
    setTimeout(() => {
      if (copyTextEl) copyTextEl.textContent = 'Copy';
      copyBtn.classList.remove('text-white');
    }, 2000);
  });
}
