/**
 * FitPredict Impressive Hero Canvas
 * Cosmic Dark Space with Twinkling Starfield, Orbital Atmosphere Glow,
 * and Cascading Vertical Light Beams (matching MotionSites Impressive Hero aesthetic).
 * 60fps GPU-accelerated, auto-pausing on scroll.
 */

export function initHeroCanvas() {
  const canvas = document.getElementById('hero-live-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  let animationFrameId = null;
  let isVisible = true;
  let width = 0;
  let height = 0;
  let dpr = 1;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mouse interaction with smooth interpolation (lerp)
  const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };

  // Starfield initialization
  const STAR_COUNT = 180;
  const stars = [];

  function initStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        baseRadius: Math.random() * 1.3 + 0.3,
        twinkleSpeed: Math.random() * 0.003 + 0.001,
        twinklePhase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.65 + 0.25,
        color: Math.random() > 0.85 ? 'rgba(165, 243, 252, ' : (Math.random() > 0.7 ? 'rgba(199, 210, 254, ' : 'rgba(255, 255, 255, ')
      });
    }
  }

  // Cascading Vertical Light Beams (Tracer streaks from the reference)
  const BEAM_COUNT = 6;
  const beams = [];

  function initBeams() {
    beams.length = 0;
    const centerSpread = [0.38, 0.44, 0.50, 0.56, 0.62, 0.48];
    for (let i = 0; i < BEAM_COUNT; i++) {
      beams.push({
        xRel: centerSpread[i % centerSpread.length] + (Math.random() - 0.5) * 0.06,
        y: Math.random() * 1.5 - 0.5, // relative to height
        length: Math.random() * 140 + 90, // px
        speed: Math.random() * 0.00075 + 0.00045, // speed per frame relative
        width: Math.random() * 1.5 + 1.0,
        alpha: Math.random() * 0.4 + 0.35,
        delay: Math.random() * 2000
      });
    }
  }

  // Resize handler (Optimized DPR cap to maximize FPS and eliminate fill-rate stutter)
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.scale(dpr, dpr);

    if (stars.length === 0) {
      initStars();
      initBeams();
    }

    if (prefersReducedMotion) {
      drawFrame(0);
    }
  }

  // Mouse event tracking for subtle cosmic parallax
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = (e.clientX - rect.left) / rect.width;
    mouse.targetY = (e.clientY - rect.top) / rect.height;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Main render loop
  let startTime = performance.now();
  let lastTime = startTime;

  function drawFrame(currentTime) {
    if (!isVisible) return;

    const dt = Math.min(currentTime - lastTime, 64);
    lastTime = currentTime;
    const time = currentTime - startTime;

    // Smooth lerp mouse coordinates
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    const parallaxX = (mouse.x - 0.5) * 20;
    const parallaxY = (mouse.y - 0.5) * 15;

    // 1. Deep Space Cosmic Void Base (#020408 to #040814)
    ctx.globalCompositeOperation = 'source-over';
    const bgGrad = ctx.createRadialGradient(
      width * 0.5, height * 0.4, 40,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.85
    );
    bgGrad.addColorStop(0, '#060B18');
    bgGrad.addColorStop(0.5, '#03060E');
    bgGrad.addColorStop(1, '#010307');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Cosmic Planet / Horizon Arc Curve on Bottom-Left
    // Matches the glowing planetary atmosphere in the reference image
    const planetCenterX = width * -0.15 + parallaxX * 0.4;
    const planetCenterY = height * 1.35 + parallaxY * 0.4;
    const planetRadius = Math.max(width, height) * 0.85;

    // Soft atmospheric aura glow behind the planet rim
    ctx.globalCompositeOperation = 'screen';
    const atmosAura = ctx.createRadialGradient(
      planetCenterX, planetCenterY, planetRadius * 0.88,
      planetCenterX, planetCenterY, planetRadius * 1.15
    );
    atmosAura.addColorStop(0, 'rgba(103, 232, 249, 0.28)'); // Cyan glow
    atmosAura.addColorStop(0.35, 'rgba(99, 102, 241, 0.16)'); // Indigo glow
    atmosAura.addColorStop(0.7, 'rgba(56, 189, 248, 0.05)');
    atmosAura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = atmosAura;
    ctx.beginPath();
    ctx.arc(planetCenterX, planetCenterY, planetRadius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Crisp atmospheric rim light along the edge of the planet
    ctx.save();
    ctx.beginPath();
    ctx.arc(planetCenterX, planetCenterY, planetRadius, 0, Math.PI * 2);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
    ctx.shadowColor = 'rgba(103, 232, 249, 0.9)';
    ctx.shadowBlur = 18;
    ctx.stroke();
    ctx.restore();

    // Soft Ambient Cyan/White Flare on top right / edge
    const flareGrad = ctx.createRadialGradient(
      width * 0.95 + parallaxX * 0.3, height * 0.1 + parallaxY * 0.3, 0,
      width * 0.95, height * 0.1, width * 0.4
    );
    flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    flareGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.04)');
    flareGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flareGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Twinkling Starfield
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const sx = (star.x * width + parallaxX * 0.8) % width;
      const sy = (star.y * height + parallaxY * 0.8) % height;
      
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
      const currentAlpha = Math.max(0.1, star.alpha + twinkle * 0.28);
      
      ctx.beginPath();
      ctx.arc(sx, sy, star.baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = star.color + currentAlpha + ')';
      ctx.fill();
    }

    // 4. Cascading Vertical Light Beams (Shooting down the center)
    for (let i = 0; i < beams.length; i++) {
      const beam = beams[i];
      
      if (!prefersReducedMotion) {
        beam.y += beam.speed * dt;
        if (beam.y > 1.3) {
          beam.y = -0.3;
          beam.xRel = [0.38, 0.44, 0.50, 0.56, 0.62, 0.48][Math.floor(Math.random() * 6)] + (Math.random() - 0.5) * 0.05;
        }
      }

      const bx = beam.xRel * width;
      const by = beam.y * height;
      const bLen = beam.length;

      const beamGrad = ctx.createLinearGradient(bx, by - bLen, bx, by);
      beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      beamGrad.addColorStop(0.7, `rgba(255, 255, 255, ${beam.alpha * 0.6})`);
      beamGrad.addColorStop(1, `rgba(255, 255, 255, ${beam.alpha})`);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(bx, by - bLen);
      ctx.lineTo(bx, by);
      ctx.lineWidth = beam.width;
      ctx.strokeStyle = beamGrad;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowBlur = 6;
      ctx.stroke();

      // Bright head point
      ctx.beginPath();
      ctx.arc(bx, by, beam.width * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${beam.alpha * 1.2})`;
      ctx.shadowColor = 'rgba(165, 243, 252, 1)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
    }

    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(drawFrame);
    }
  }

  // IntersectionObserver to pause rendering when scrolled out of view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
        if (isVisible && !prefersReducedMotion) {
          lastTime = performance.now();
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(drawFrame);
        } else {
          cancelAnimationFrame(animationFrameId);
        }
      });
    },
    { threshold: 0.05 }
  );

  observer.observe(canvas);

  window.addEventListener('resize', resize, { passive: true });
  resize();

  if (!prefersReducedMotion) {
    animationFrameId = requestAnimationFrame(drawFrame);
  } else {
    drawFrame(0);
  }
}
