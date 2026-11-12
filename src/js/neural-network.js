/**
 * FitPredict Deep Neural Network Architecture Visualizer
 * Faithful reconstruction of user reference image:
 * - INPUT LAYER (n = 6) inside radiant, bright neon frame with x₁..x₆ input arrows
 * - Top bracket for HIDDEN LAYERS with HIDDEN LAYER 1 (n = 8) & HIDDEN LAYER 2 (n = 6)
 * - OUTPUT LAYER (n = 3) inside radiant, bright neon frame with y₁..y₃ output arrows
 * - Model Output separate card column completely removed
 * - Balanced synaptic lines: clearly visible, high-contrast, NOT pale/faint, and not overcrowded
 * - Independent asynchronous neuron motion: slightly increased population & refined speed
 * - Brighter glowing borders for Input & Output layers
 * - Theme: FitPredict Liquid Mint (#64C800) & Emerald (#00E575), zero blue
 * - Zero Background Lag: Stops requestAnimationFrame when scrolled out of view or tab blurred
 */

export function initNeuralNetworkVisualizer() {
  const canvas = document.getElementById('live-neural-network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const container = canvas.parentElement;
  if (!container) return;

  let animId = null;
  let isIntersecting = false;
  let isPageVisible = !document.hidden;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let lastTime = performance.now();
  let spawnTimer = 0;
  let nextInputIdx = 0;
  let particleIdCounter = 0;

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // FitPredict Theme Colors
  const THEME = {
    bg: '#002518',
    mint: '#64C800',
    mintGlow: 'rgba(100, 200, 0, 0.75)',
    emerald: '#00E575',
    emeraldGlow: 'rgba(0, 229, 117, 0.60)',
    // Radiant borders for Input & Output layers (significantly brighter)
    brightFrameBorder: '#64C800',
    brightFrameGlow: 'rgba(100, 200, 0, 0.85)',
    brightFrameBg: 'rgba(100, 200, 0, 0.05)',
    bracketBorder: 'rgba(100, 200, 0, 0.50)',
    // Clear, bold, high-contrast lines (not pale, perfectly visible)
    lineMint: 'rgba(100, 200, 0, 0.44)',
    lineEmerald: 'rgba(0, 229, 117, 0.40)',
    nodeBg: '#001a11',
    nodeBorder: 'rgba(100, 200, 0, 0.75)',
    textWhite: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.65)',
    textDim: 'rgba(255, 255, 255, 0.85)'
  };

  // Node Counts per Layer (Matching user image: 6 -> 8 -> 6 -> 3)
  const layerCounts = [6, 8, 6, 3];
  const SUBSCRIPTS = ['₁', '₂', '₃', '₄', '₅', '₆'];

  // Structural Topology
  let layers = [];
  let synapses = [];
  let particles = []; // Independent individual particles traveling asynchronously
  let hoveredNode = null;

  // Helper: Draw Smooth Rounded Rectangle
  function drawRoundedRect(x, y, w, h, r) {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.rect(x, y, w, h);
    }
  }

  // Helper: Draw Arrow
  function drawArrow(fromX, fromY, toX, toY, color, lineWidth = 1.2, headLen = 4.5) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw an Independent Pulse Particle with Calm Trailing Tail
  function drawParticle(p) {
    let curX, curY, fromX, fromY, toX, toY;

    if (p.type === 'inflow') {
      fromX = p.fromX;
      fromY = p.y;
      toX = p.toX;
      toY = p.y;
      curX = fromX + (toX - fromX) * p.progress;
      curY = p.y;
    } else if (p.type === 'synaptic') {
      fromX = p.synapse.from.x;
      fromY = p.synapse.from.y;
      toX = p.synapse.to.x;
      toY = p.synapse.to.y;
      curX = fromX + (toX - fromX) * p.progress;
      curY = fromY + (toY - fromY) * p.progress;
    } else if (p.type === 'outflow') {
      fromX = p.fromX;
      fromY = p.y;
      toX = p.toX;
      toY = p.y;
      curX = fromX + (toX - fromX) * p.progress;
      curY = p.y;
    }

    // Speed Tail behind pulse
    const tailProg = Math.max(0, p.progress - 0.08);
    const tailX = fromX + (toX - fromX) * tailProg;
    const tailY = fromY + (toY - fromY) * tailProg;

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(curX, curY);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.50;
    ctx.stroke();

    // Pulse Core
    ctx.beginPath();
    ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 1.0;
    ctx.fill();

    // Soft outer glow halo
    ctx.beginPath();
    ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.35;
    ctx.fill();
  }

  // Build Topology & Clean Synaptic Connections (Balanced count, not overcrowded)
  function buildTopology() {
    layers = [];
    synapses = [];
    particles = [];

    const isMobile = width < 480;

    // Vertical bounds
    const topMargin = 58;
    const bottomMargin = 25;
    const usableHeight = height - topMargin - bottomMargin;

    // Horizontal Layer Distribution
    const inX = isMobile ? width * 0.16 : width * 0.17;
    const outX = isMobile ? width * 0.85 : width * 0.86;
    const span = outX - inX;
    const h1X = inX + span * 0.35;
    const h2X = inX + span * 0.68;

    const xCoords = [inX, h1X, h2X, outX];
    const nodeRadius = isMobile ? Math.max(8.0, width * 0.022) : Math.max(10.0, width * 0.024);

    // Build Nodes for each Layer
    layerCounts.forEach((count, lIdx) => {
      const layerNodes = [];
      const x = xCoords[lIdx];

      for (let i = 0; i < count; i++) {
        let y;
        if (lIdx === 3) {
          // Output Layer: 3 nodes vertically centered inside their box
          const outH = usableHeight * 0.52;
          const outTop = topMargin + (usableHeight - outH) / 2;
          const step = outH / (count - 1);
          y = outTop + i * step;
        } else {
          const step = count > 1 ? usableHeight / (count - 1) : 0;
          y = topMargin + i * step;
        }

        layerNodes.push({
          layer: lIdx,
          index: i,
          x,
          y,
          radius: nodeRadius,
          activation: 0,
          color: lIdx === 1 ? THEME.emerald : THEME.mint
        });
      }
      layers.push(layerNodes);
    });

    // Build Balanced Synaptic Connections (Clean, distinct lines without overcrowding)
    // 1. Layer 0 (6 nodes) -> Layer 1 (8 nodes): each node connects to 2-3 adjacent nodes
    const l0 = layers[0];
    const l1 = layers[1];
    l0.forEach((fromNode, fromIdx) => {
      const ratio = fromIdx / (l0.length - 1);
      const center = Math.round(ratio * (l1.length - 1));
      const targets = new Set([
        Math.max(0, center - 1),
        center,
        Math.min(l1.length - 1, center + 1)
      ]);
      targets.forEach((tIdx) => {
        synapses.push({
          layer: 0,
          from: fromNode,
          to: l1[tIdx],
          color: THEME.mint,
          baseColor: THEME.lineMint
        });
      });
    });

    // 2. Layer 1 (8 nodes) -> Layer 2 (6 nodes): each node connects to 2-3 adjacent nodes
    const l2 = layers[2];
    l1.forEach((fromNode, fromIdx) => {
      const ratio = fromIdx / (l1.length - 1);
      const center = Math.round(ratio * (l2.length - 1));
      const targets = new Set([
        Math.max(0, center - 1),
        center,
        Math.min(l2.length - 1, center + 1)
      ]);
      targets.forEach((tIdx) => {
        synapses.push({
          layer: 1,
          from: fromNode,
          to: l2[tIdx],
          color: THEME.emerald,
          baseColor: THEME.lineEmerald
        });
      });
    });

    // 3. Layer 2 (6 nodes) -> Layer 3 (3 nodes): each node connects cleanly to 2 output nodes
    const l3 = layers[3];
    l2.forEach((fromNode, fromIdx) => {
      const ratio = fromIdx / (l2.length - 1);
      const center = Math.round(ratio * (l3.length - 1));
      const targets = new Set([
        Math.max(0, center - 1),
        center,
        Math.min(l3.length - 1, center + 1)
      ]);
      targets.forEach((tIdx) => {
        synapses.push({
          layer: 2,
          from: fromNode,
          to: l3[tIdx],
          color: THEME.mint,
          baseColor: THEME.lineMint
        });
      });
    });

    // Pre-populate independent particles at various stages on load so network is immediately active
    seedInitialParticles();
  }

  // Pre-populate slightly more initial particles for a rich, lively startup
  function seedInitialParticles() {
    // 3 Inflow particles
    [0, 2, 4].forEach((idx, i) => {
      if (layers[0] && layers[0][idx]) {
        particles.push({
          id: ++particleIdCounter,
          type: 'inflow',
          inputIndex: idx,
          node: layers[0][idx],
          fromX: width * 0.06,
          toX: layers[0][idx].x - layers[0][idx].radius - 2,
          y: layers[0][idx].y,
          progress: 0.25 + i * 0.30,
          speed: 0.0090 + Math.random() * 0.002,
          color: THEME.mint
        });
      }
    });

    // 4 Synaptic particles in Layer 0 -> Layer 1
    const syns0 = synapses.filter((s) => s.layer === 0);
    if (syns0.length >= 4) {
      [1, 5, 8, syns0.length - 2].forEach((sIdx, i) => {
        const syn = syns0[sIdx % syns0.length];
        particles.push({
          id: ++particleIdCounter,
          type: 'synaptic',
          synapse: syn,
          layer: 0,
          progress: 0.15 + i * 0.22,
          speed: 0.0086 + Math.random() * 0.002,
          color: syn.color
        });
      });
    }

    // 4 Synaptic particles in Layer 1 -> Layer 2
    const syns1 = synapses.filter((s) => s.layer === 1);
    if (syns1.length >= 4) {
      [2, 7, 11, syns1.length - 2].forEach((sIdx, i) => {
        const syn = syns1[sIdx % syns1.length];
        particles.push({
          id: ++particleIdCounter,
          type: 'synaptic',
          synapse: syn,
          layer: 1,
          progress: 0.20 + i * 0.22,
          speed: 0.0084 + Math.random() * 0.002,
          color: syn.color
        });
      });
    }

    // 3 Synaptic particles in Layer 2 -> Layer 3
    const syns2 = synapses.filter((s) => s.layer === 2);
    if (syns2.length >= 3) {
      [0, Math.floor(syns2.length / 2), syns2.length - 1].forEach((sIdx, i) => {
        const syn = syns2[sIdx];
        particles.push({
          id: ++particleIdCounter,
          type: 'synaptic',
          synapse: syn,
          layer: 2,
          progress: 0.25 + i * 0.28,
          speed: 0.0088 + Math.random() * 0.002,
          color: syn.color
        });
      });
    }

    // 2 Outflow particles
    if (layers[3]) {
      [0, 2].forEach((idx, i) => {
        if (layers[3][idx]) {
          particles.push({
            id: ++particleIdCounter,
            type: 'outflow',
            node: layers[3][idx],
            fromX: layers[3][idx].x + layers[3][idx].radius + 2,
            toX: width * 0.93,
            y: layers[3][idx].y,
            progress: 0.35 + i * 0.40,
            speed: 0.0095 + Math.random() * 0.002,
            color: THEME.mint
          });
        }
      });
    }
  }

  // Spawn an independent pulse at a specific or staggered input
  function spawnIndependentInputPulse(specifiedIdx = null) {
    if (!layers[0] || !layers[0].length) return;

    const inputIdx = specifiedIdx !== null ? specifiedIdx : nextInputIdx;
    nextInputIdx = (nextInputIdx + 1) % layers[0].length;
    const targetNode = layers[0][inputIdx];

    particles.push({
      id: ++particleIdCounter,
      type: 'inflow',
      inputIndex: inputIdx,
      node: targetNode,
      fromX: width * 0.06,
      toX: targetNode.x - targetNode.radius - 2,
      y: targetNode.y,
      progress: 0,
      // Slightly more responsive speed (~1.7s per leg)
      speed: 0.0088 + Math.random() * 0.002,
      color: THEME.mint
    });
  }

  // Resize Handler with DPR Scaling
  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height || 490;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    buildTopology();
  }

  // Main 60 FPS Render Loop
  function render(now) {
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // ========================================================
    // 1. ASYNCHRONOUS INDEPENDENT PULSE SPAWNER
    // Spawn interval adjusted to ~460ms for slightly more active neurons
    // ========================================================
    spawnTimer += dt;
    if (spawnTimer >= 460) {
      spawnTimer = 0;
      spawnIndependentInputPulse();
    }

    const topMargin = 58;
    const bottomMargin = 25;
    const usableHeight = height - topMargin - bottomMargin;

    // ========================================================
    // 2. DRAW INPUT & OUTPUT BOUNDING BOXES (Noticeably Brighter & Glowing)
    // ========================================================
    ctx.save();

    // A. INPUT LAYER BOUNDING BOX (Bright Glowing Neon Frame)
    if (layers[0] && layers[0].length) {
      const inBoxW = Math.max(36, width * 0.092);
      const inBoxX = layers[0][0].x - inBoxW / 2;
      const inBoxY = topMargin - 12;
      const inBoxH = usableHeight + 24;

      drawRoundedRect(inBoxX, inBoxY, inBoxW, inBoxH, 14);
      ctx.fillStyle = THEME.brightFrameBg;
      ctx.fill();

      // Significantly brighter and luminous border
      ctx.strokeStyle = THEME.brightFrameBorder;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = THEME.brightFrameGlow;
      ctx.shadowBlur = 14;
      ctx.stroke();
    }

    // B. OUTPUT LAYER BOUNDING BOX (Bright Glowing Neon Frame)
    if (layers[3] && layers[3].length) {
      const outBoxW = Math.max(36, width * 0.092);
      const outBoxX = layers[3][0].x - outBoxW / 2;
      const outH = usableHeight * 0.52;
      const outBoxY = topMargin + (usableHeight - outH) / 2 - 12;
      const outBoxH = outH + 24;

      drawRoundedRect(outBoxX, outBoxY, outBoxW, outBoxH, 14);
      ctx.fillStyle = THEME.brightFrameBg;
      ctx.fill();

      // Significantly brighter and luminous border
      ctx.strokeStyle = THEME.brightFrameBorder;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = THEME.brightFrameGlow;
      ctx.shadowBlur = 14;
      ctx.stroke();
    }

    ctx.restore();

    // ========================================================
    // 3. DRAW TOP TITLES & BRACKET (High-Contrast, Bold & Vivid)
    // ========================================================
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // A. INPUT LAYER (n = 6) - Bold Luminous Mint
    if (layers[0] && layers[0].length) {
      const inX = layers[0][0].x;
      ctx.font = 'bold 11px "Chakra Petch", monospace';
      ctx.fillStyle = '#64C800';
      ctx.shadowColor = 'rgba(100, 200, 0, 0.75)';
      ctx.shadowBlur = 8;
      ctx.fillText('INPUT LAYER', inX, 18);

      ctx.shadowBlur = 0;
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillText('(n = 6)', inX, 31);
    }

    // B. HIDDEN LAYERS Top Bracket spanning across Hidden 1 & Hidden 2
    if (layers[1] && layers[2]) {
      const h1X = layers[1][0].x;
      const h2X = layers[2][0].x;
      const brLeft = h1X - (h2X - h1X) * 0.32;
      const brRight = h2X + (h2X - h1X) * 0.32;
      const brMid = (h1X + h2X) / 2;
      const brY = 15;

      ctx.strokeStyle = 'rgba(0, 229, 117, 0.75)';
      ctx.lineWidth = 1.4;
      ctx.shadowColor = 'rgba(0, 229, 117, 0.50)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(brLeft, brY + 5);
      ctx.lineTo(brLeft, brY);
      ctx.lineTo(brMid - 50, brY);
      ctx.moveTo(brMid + 50, brY);
      ctx.lineTo(brRight, brY);
      ctx.lineTo(brRight, brY + 5);
      ctx.stroke();

      // Bracket Title: HIDDEN LAYERS (Bold & Vivid Emerald)
      ctx.font = 'bold 11px "Chakra Petch", monospace';
      ctx.fillStyle = '#00E575';
      ctx.shadowColor = 'rgba(0, 229, 117, 0.85)';
      ctx.shadowBlur = 8;
      ctx.fillText('HIDDEN LAYERS', brMid, brY);

      // Sub-titles: HIDDEN LAYER 1 (n = 8) & HIDDEN LAYER 2 (n = 6)
      ctx.font = 'bold 10px "Chakra Petch", monospace';
      ctx.fillStyle = '#00E575';
      ctx.shadowColor = 'rgba(0, 229, 117, 0.70)';
      ctx.shadowBlur = 6;
      ctx.fillText('HIDDEN LAYER 1', h1X, 30);
      ctx.fillText('HIDDEN LAYER 2', h2X, 30);

      ctx.shadowBlur = 0;
      ctx.font = 'bold 8.5px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillText('(n = 8)', h1X, 42);
      ctx.fillText('(n = 6)', h2X, 42);
    }

    // C. OUTPUT LAYER (n = 3) - Bold Luminous Mint
    if (layers[3] && layers[3].length) {
      const outX = layers[3][0].x;
      ctx.font = 'bold 11px "Chakra Petch", monospace';
      ctx.fillStyle = '#64C800';
      ctx.shadowColor = 'rgba(100, 200, 0, 0.75)';
      ctx.shadowBlur = 8;
      ctx.fillText('OUTPUT LAYER', outX, 18);

      ctx.shadowBlur = 0;
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillText('(n = 3)', outX, 31);
    }

    ctx.restore();

    // ========================================================
    // 4. DRAW ALL SYNAPSES (High-Contrast, Clear, NOT Pale, Clean Count)
    // ========================================================
    ctx.save();
    synapses.forEach((syn) => {
      const isHovered = hoveredNode && (syn.from === hoveredNode || syn.to === hoveredNode);

      ctx.beginPath();
      ctx.moveTo(syn.from.x, syn.from.y);
      ctx.lineTo(syn.to.x, syn.to.y);

      ctx.strokeStyle = isHovered ? '#64C800' : syn.baseColor;
      ctx.globalAlpha = isHovered ? 1.0 : 1.0; // High solid contrast, not pale
      ctx.lineWidth = isHovered ? 2.0 : 1.15;
      if (isHovered) {
        ctx.shadowColor = '#64C800';
        ctx.shadowBlur = 8;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
    });
    ctx.restore();

    // ========================================================
    // 5. DRAW INPUT SIDE (x₁..x₆ & Steady Arrows)
    // ========================================================
    if (layers[0]) {
      layers[0].forEach((node, idx) => {
        const arrowStartX = width * 0.06;
        const arrowEndX = node.x - node.radius - 2;

        drawArrow(arrowStartX, node.y, arrowEndX, node.y, THEME.lineMint, 1.2, 4);

        ctx.save();
        ctx.font = 'bold 9.5px monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.activation > 0.3 ? '#FFFFFF' : THEME.textDim;
        ctx.fillText(`x${SUBSCRIPTS[idx] || idx + 1}`, arrowStartX - 4, node.y);
        ctx.restore();
      });
    }

    // ========================================================
    // 6. DRAW OUTPUT SIDE (y₁..y₃ & Steady Arrows)
    // ========================================================
    if (layers[3]) {
      layers[3].forEach((node, idx) => {
        const arrowStartX = node.x + node.radius + 2;
        const arrowEndX = width * 0.93;

        drawArrow(arrowStartX, node.y, arrowEndX, node.y, node.activation > 0.3 ? THEME.mint : THEME.lineMint, 1.2, 4);

        ctx.save();
        ctx.font = 'bold 9.5px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.activation > 0.3 ? THEME.mint : THEME.textDim;
        ctx.fillText(`y${SUBSCRIPTS[idx] || idx + 1}`, arrowEndX + 4, node.y);
        ctx.restore();
      });
    }

    // ========================================================
    // 7. DRAW ALL NEURONS (Visible and glowing from Frame 1)
    // ========================================================
    layers.forEach((layerNodes) => {
      layerNodes.forEach((node) => {
        node.activation *= 0.93;
        const act = Math.max(0, Math.min(1, node.activation));
        const isHovered = hoveredNode === node;

        ctx.save();

        // Node Glow Halo (Resting subtle glow + bright on Activation)
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (isHovered ? 2.3 : (1.4 + act * 0.8)), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = isHovered ? 0.6 : (0.15 + act * 0.45);
        ctx.fill();

        // Neuron Body
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = THEME.nodeBg;
        ctx.fill();

        // Neuron Border Ring (Site Theme)
        ctx.lineWidth = isHovered ? 2.2 : (act > 0.2 ? 1.8 : 1.3);
        ctx.strokeStyle = isHovered ? '#FFFFFF' : (act > 0.2 ? node.color : THEME.nodeBorder);
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 8 + act * 10;
        ctx.stroke();

        // Bright Center Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (0.35 + act * 0.35), 0, Math.PI * 2);
        ctx.fillStyle = act > 0.3 ? '#FFFFFF' : node.color;
        ctx.globalAlpha = 0.45 + act * 0.55;
        ctx.fill();

        ctx.restore();
      });
    });

    // ========================================================
    // 8. UPDATE & DRAW INDEPENDENT ASYNCHRONOUS PARTICLES
    // Slightly faster speed and slightly higher active density
    // ========================================================
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.progress += p.speed;

      drawParticle(p);

      // When particle completes its current leg:
      if (p.progress >= 1.0) {
        if (p.type === 'inflow') {
          // Reached input node: activate node, then pick outgoing synapse(s)
          p.node.activation = 1.0;
          const outgoing = synapses.filter((s) => s.from === p.node);
          if (outgoing.length > 0) {
            // 35% chance to bifurcate/branch into 2 independent synapses
            const count = Math.random() < 0.35 && outgoing.length > 1 ? 2 : 1;
            const shuffled = [...outgoing].sort(() => Math.random() - 0.5);
            for (let k = 0; k < count; k++) {
              const chosen = shuffled[k];
              particles.push({
                id: ++particleIdCounter,
                type: 'synaptic',
                synapse: chosen,
                layer: 0,
                progress: 0,
                speed: 0.0084 + Math.random() * 0.002, // Refined speed
                color: chosen.color
              });
            }
          }
          particles.splice(i, 1);
        } else if (p.type === 'synaptic') {
          // Reached next node: activate node
          const reachedNode = p.synapse.to;
          reachedNode.activation = 1.0;

          if (p.layer === 0) {
            // In Hidden Layer 1: pick an outgoing synapse to Hidden Layer 2
            const outgoing = synapses.filter((s) => s.from === reachedNode);
            if (outgoing.length > 0) {
              const chosen = outgoing[Math.floor(Math.random() * outgoing.length)];
              particles.push({
                id: ++particleIdCounter,
                type: 'synaptic',
                synapse: chosen,
                layer: 1,
                progress: 0,
                speed: 0.0082 + Math.random() * 0.002,
                color: chosen.color
              });
            }
          } else if (p.layer === 1) {
            // In Hidden Layer 2: pick an outgoing synapse to Output Layer
            const outgoing = synapses.filter((s) => s.from === reachedNode);
            if (outgoing.length > 0) {
              const chosen = outgoing[Math.floor(Math.random() * outgoing.length)];
              particles.push({
                id: ++particleIdCounter,
                type: 'synaptic',
                synapse: chosen,
                layer: 2,
                progress: 0,
                speed: 0.0085 + Math.random() * 0.002,
                color: chosen.color
              });
            }
          } else if (p.layer === 2) {
            // Reached Output Layer: fire an independent outflow pulse to y₁..y₃
            particles.push({
              id: ++particleIdCounter,
              type: 'outflow',
              node: reachedNode,
              fromX: reachedNode.x + reachedNode.radius + 2,
              toX: width * 0.93,
              y: reachedNode.y,
              progress: 0,
              speed: 0.0094 + Math.random() * 0.002,
              color: THEME.mint
            });
          }
          particles.splice(i, 1);
        } else if (p.type === 'outflow') {
          // Completed flight to y₁..y₃
          particles.splice(i, 1);
        }
      }
    }

    // Schedule next frame only if currently visible
    if (isIntersecting && isPageVisible && !prefersReducedMotion) {
      animId = requestAnimationFrame(render);
    } else {
      animId = null;
    }
  }

  // Lifecycle & Background Execution Control (Zero Lag)
  function startLoop() {
    if (animId !== null) return;
    lastTime = performance.now();
    animId = requestAnimationFrame(render);
  }

  function stopLoop() {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function updateRunningState() {
    if (isIntersecting && isPageVisible && !prefersReducedMotion) {
      startLoop();
    } else {
      stopLoop();
    }
  }

  // Pointer Interaction
  function handlePointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    let found = null;
    let minDist = 20;

    layers.forEach((layerNodes) => {
      layerNodes.forEach((node) => {
        const dist = Math.hypot(node.x - mx, node.y - my);
        if (dist < minDist) {
          minDist = dist;
          found = node;
        }
      });
    });

    hoveredNode = found;
    canvas.style.cursor = found ? 'pointer' : 'default';
  }

  function handlePointerLeave() {
    hoveredNode = null;
    canvas.style.cursor = 'default';
  }

  function handlePointerClick(e) {
    e.preventDefault();
    // Launch an extra independent pulse on click
    spawnIndependentInputPulse();
  }

  // 1. IntersectionObserver: Stop completely when scrolled out of view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isIntersecting = entry.isIntersecting;
        updateRunningState();
      });
    },
    { threshold: 0.05 }
  );
  observer.observe(canvas);

  // 2. Page Visibility API: Stop completely on tab switch or minimize
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    updateRunningState();
  });

  // 3. Window blur/focus: Pause when window loses focus
  window.addEventListener('blur', () => {
    isPageVisible = false;
    updateRunningState();
  });

  window.addEventListener('focus', () => {
    isPageVisible = !document.hidden;
    updateRunningState();
  });

  // DOM Event Listeners
  window.addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('mousemove', handlePointerMove, { passive: true });
  canvas.addEventListener('mouseleave', handlePointerLeave, { passive: true });
  canvas.addEventListener('click', handlePointerClick);
  canvas.addEventListener('touchstart', handlePointerMove, { passive: true });
  canvas.addEventListener('touchend', handlePointerLeave, { passive: true });

  // Initial sizing and start
  resize();
  updateRunningState();

  return () => {
    stopLoop();
    observer.disconnect();
    window.removeEventListener('resize', resize);
  };
}
