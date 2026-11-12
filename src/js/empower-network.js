/**
 * FitPredict Empower Network Architecture Visualizer
 * Faithful reconstruction of user reference image:
 * - Central Core card at the top with Brain AI Chip vector icon
 * - 4 Balanced Satellite branches (Adaptive Nutrition, Hydration Dynamics,
 *   Dynamic Recalibration, Fatigue Safeguard)
 * - Orthogonal circuit tracks with smooth rounded 90-degree corners
 * - Liquid-smooth animated glowing light beams and traveling orbs from Center to Branches
 * - Zero Background Lag: Stops requestAnimationFrame when scrolled out of view or tab blurred
 */

export function initEmpowerNetwork() {
  const container = document.getElementById('empower-network-container');
  if (!container) return;

  const svg = document.getElementById('empower-network-svg');
  if (!svg) return;

  const coreCard = document.getElementById('empower-core-node');
  if (!coreCard) return;

  const branchCards = [
    document.getElementById('empower-branch-0'),
    document.getElementById('empower-branch-1'),
    document.getElementById('empower-branch-2')
  ];

  if (branchCards.some((b) => !b)) return;

  let animId = null;
  let isIntersecting = false;
  let isPageVisible = !document.hidden;
  let pathData = [];

  // Recalculate dynamic SVG paths connecting the center core to each of the 3 branch cards
  function updatePaths() {
    const contRect = container.getBoundingClientRect();
    const coreCard = document.getElementById('empower-core-node');
    if (!coreCard) return;
    const coreRect = coreCard.getBoundingClientRect();

    // Center Core Anchor Points relative to container (circuits emerge directly from bottom border of FitPredict AI Core)
    const startX = coreRect.left - contRect.left + coreRect.width / 2;
    const startY = coreRect.bottom - contRect.top - 1;

    pathData = [];

    branchCards.forEach((card, idx) => {
      const bRect = card.getBoundingClientRect();
      const bLeft = bRect.left - contRect.left;
      const bTop = bRect.top - contRect.top;
      const targetX = bLeft + bRect.width / 2;
      const targetY = bTop + 1;

      const basePath = document.getElementById(`empower-base-path-${idx}`);
      const pulsePath = document.getElementById(`empower-pulse-path-${idx}`);
      const orb = document.getElementById(`empower-orb-${idx}`);

      if (!basePath || !pulsePath || !orb) return;

      let d = '';

      if (window.innerWidth < 768) {
        d = '';
      } else {
        const deltaX = targetX - startX;
        if (Math.abs(deltaX) < 25) {
          d = `M ${startX} ${startY} V ${targetY}`;
        } else {
          const midY = startY + Math.max(18, (targetY - startY) * 0.45);
          const r = 16;
          const dir = deltaX > 0 ? 1 : -1;
          d = `M ${startX} ${startY} V ${midY - r} Q ${startX} ${midY} ${startX + dir * r} ${midY} H ${targetX - dir * r} Q ${targetX} ${midY} ${targetX} ${midY + r} V ${targetY}`;
        }
      }

      basePath.setAttribute('d', d);
      pulsePath.setAttribute('d', d);

      const len = basePath.getTotalLength() || 0;
      if (len <= 0) {
        orb.setAttribute('cx', -100);
        orb.setAttribute('cy', -100);
      }

      pathData.push({
        basePath,
        pulsePath,
        orb,
        card,
        len
      });
    });
  }

  // Animation Loop: Smooth flowing light beams and orbs from Center to Branches
  function render(now) {
    if (!pathData.length) {
      updatePaths();
    }

    pathData.forEach((item, idx) => {
      const { basePath, pulsePath, orb, card, len } = item;
      if (len <= 0) return;

      // Smooth progress cycle (approx 2.4s per loop, phased across 3 branches)
      const progress = (now / 2400 + idx * 0.33) % 1.0;
      const beamLen = Math.min(70, len * 0.40);
      const curDist = progress * (len + beamLen);

      // Dasharray sets beam segment + gap
      pulsePath.style.strokeDasharray = `${beamLen} ${len + beamLen * 2}`;
      pulsePath.style.strokeDashoffset = `${-curDist + beamLen}`;

      // Traveling Orb
      const clampedProg = Math.max(0, Math.min(1, progress));
      const pt = basePath.getPointAtLength(clampedProg * len);
      orb.setAttribute('cx', pt.x);
      orb.setAttribute('cy', pt.y);

      // Card Flare when pulse arrives at destination
      if (progress > 0.88 && progress < 0.99) {
        card.classList.add('empower-flare');
      } else {
        card.classList.remove('empower-flare');
      }
    });

    if (isIntersecting && isPageVisible) {
      animId = requestAnimationFrame(render);
    } else {
      animId = null;
    }
  }

  function startLoop() {
    if (animId !== null) return;
    animId = requestAnimationFrame(render);
  }

  function stopLoop() {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function updateRunningState() {
    if (isIntersecting && isPageVisible) {
      startLoop();
    } else {
      stopLoop();
    }
  }

  // 1. IntersectionObserver for Zero Background Lag
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isIntersecting = entry.isIntersecting;
        if (isIntersecting) {
          updatePaths();
        }
        updateRunningState();
      });
    },
    { threshold: 0.05 }
  );
  observer.observe(container);

  // 2. Visibility & Blur listeners
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    updateRunningState();
  });

  window.addEventListener('blur', () => {
    isPageVisible = false;
    updateRunningState();
  });

  window.addEventListener('focus', () => {
    isPageVisible = !document.hidden;
    updateRunningState();
  });

  // 3. Responsive Resize Handler
  let resizeTimeout = null;
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        updatePaths();
      }, 100);
    },
    { passive: true }
  );

  // Initial setup
  setTimeout(() => {
    updatePaths();
    updateRunningState();
  }, 100);

  return () => {
    stopLoop();
    observer.disconnect();
  };
}
