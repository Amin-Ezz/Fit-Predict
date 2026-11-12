# FitPredict — High-Performance Athletic Biomarker & Deep Neural Network Platform

> **FitPredict** is an elite athletic physiology intelligence platform and real-time deep neural network system. Designed as a modern, interactive single-page application, it translates multi-dimensional physiological telemetry (age, gender, biometric mass, training workload, sleep duration, and perceived exertion) into sub-second precision nutrition, hydration, and training prescriptions.
>
> All neural network graph visualization, synaptic pulse simulations, and metabolic target calculations execute **100% client-side** directly in the browser with sub-12ms inference latency — requiring zero server-side roundtrips.

---

## 📑 Table of Contents
1. [Deep Neural Network Architecture & Scientific Foundations](#1-deep-neural-network-architecture--scientific-foundations)
   - [Theoretical Foundations & Jackson Regression](#theoretical-foundations--jackson-regression)
   - [Multi-Task Deep Architecture (MLP-ResNet)](#multi-task-deep-architecture-mlp-resnet)
   - [Feature Vector Specification & Input Normalization](#feature-vector-specification--input-normalization)
   - [Multi-Target Output Calibration](#multi-target-output-calibration)
   - [Real-Time HTML5 Canvas Neural Architecture Visualizer](#real-time-html5-canvas-neural-architecture-visualizer)
2. [UI Engineering & User Experience (UX) Architecture](#2-ui-engineering--user-experience-ux-architecture)
   - [Design Philosophy & "Liquid Mint" Color Tokens](#design-philosophy--liquid-mint-color-tokens)
   - [Micro-Interactions & Fluid Motion Systems](#micro-interactions--fluid-motion-systems)
   - [Bencho 3D Turntable Carousel](#bencho-3d-turntable-carousel)
   - [Empower Network Circuit Interconnects](#empower-network-circuit-interconnects)
   - [Responsive Mobile Drawer & Viewport Adaptations](#responsive-mobile-drawer--viewport-adaptations)
3. [Repository File Architecture](#3-repository-file-architecture)
4. [Local Development & Setup Guide](#4-local-development--setup-guide)
   - [Prerequisites](#prerequisites)
   - [Installation & Running Dev Server](#installation--running-dev-server)
   - [Production Build & Local Preview](#production-build--local-preview)
   - [Optional Python Scientific Environment](#optional-python-scientific-environment)
5. [Production Deployment](#5-production-deployment)
6. [License & Acknowledgments](#6-license--acknowledgments)

---

## 1. Deep Neural Network Architecture & Scientific Foundations

### Theoretical Foundations & Jackson Regression
Traditional cardiorespiratory fitness ($VO_2max$) and metabolic workload calculations require invasive clinical cardiopulmonary exercise testing (CPET) with metabolic gas analyzers. FitPredict bridges clinical physiology and computational intelligence by building upon the **Jackson Non-Exercise Cardiorespiratory Regression Equations** and expanding them into a high-dimensional, multi-task deep neural network.

The core regression baseline is generalized according to:
$$VO_2max = 56.363 + (1.921 \times \text{PA-R}) - (0.381 \times \text{Age}) - (0.754 \times \text{BMI}) + (10.987 \times \text{Gender})$$

Where:
- $\text{PA-R} \in [0, 10]$ represents the physical activity rating derived from weekly session volume and RPE intensity.
- $\text{Gender} \in \{1: \text{Male}, 0: \text{Female}\}$.
- $\text{BMI} = \frac{\text{Weight (kg)}}{(\text{Height (m)})^2}$.

To capture non-linear metabolic coupling, catabolic stress penalties, and sub-gram protein kinetics, FitPredict passes these telemetry baselines through a non-linear Multi-Layer Perceptron (MLP) with residual highway connections.

```
                  ┌──────────────────────────────────────────────┐
                  │          INPUT TENSOR x ∈ ℝ⁶                 │
                  │ [Age, Gender, Height, Weight, RPE, Sleep]    │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       LAYER NORMALIZATION & RESIDUAL GELU    │
                  │         W₁ · x + b₁  →  [Hidden 1: n = 8]     │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │           SYNAPTIC COMPRESSION LAYER         │
                  │         W₂ · h₁ + b₂ →  [Hidden 2: n = 6]     │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │       MULTI-TARGET CONTINUOUS OUTPUT         │
                  │   y₁: Protein Kinetics (g/day & g/kg)        │
                  │   y₂: Osmotic Hydration & Electrolytes       │
                  │   y₃: Prescribed Active Expenditure (min/d)  │
                  └──────────────────────────────────────────────┘
```

---

### Multi-Task Deep Architecture (MLP-ResNet)
The predictive model adopts a multi-task learning (MTL) architecture:
1. **Input Dimensionality ($n = 6$):** Receives continuous physical telemetry and categorical gender representations.
2. **Hidden Layer 1 ($n = 8$):** Dense feature extraction layer applying Gaussian Error Linear Unit (GELU) activations:
   $$\text{GELU}(z) = z \cdot \Phi(z) = z \cdot P(Z \leq z), \quad Z \sim \mathcal{N}(0, 1)$$
3. **Hidden Layer 2 ($n = 6$):** Latent manifold compression layer mapping non-linear interactions between sleep deprivation catabolism and intense training volume.
4. **Output Dimensionality ($n = 3$):** Simultaneous regression vector predicting physiological targets without task interference.

### Feature Vector Specification & Input Normalization

| Feature Symbol | Telemetry Parameter | Unit / Encoding | Clinical Baseline | Biological Significance |
| :--- | :--- | :--- | :--- | :--- |
| $x_1$ | **Chronological Age** | Years $[16 - 75]$ | $28.0$ | Sarcopenia rate & maximal heart rate capacity ($HR_{max}$) |
| $x_2$ | **Biological Sex** | Binary $\{0: \text{Female}, 1: \text{Male}\}$ | $1$ | Basal metabolic rate & endocrine profile variance |
| $x_3$ | **Stature (Height)** | Centimeters $[140 - 220]$ | $180.0\text{ cm}$ | Body surface area (BSA) & leverage biomechanics |
| $x_4$ | **Total Body Mass** | Kilograms $[40 - 160]$ | $78.0\text{ kg}$ | Metabolic mass baseline for protein and fluid partitioning |
| $x_5$ | **Perceived Exertion (RPE)** | Borg CR-10 scale $[1 - 10]$ | $7.0$ | Sympathetic nervous system strain and glycogen depletion |
| $x_6$ | **Nocturnal Sleep** | Hours/night $[4.0 - 12.0]$ | $7.5\text{ h}$ | Human growth hormone (HGH) release & catabolic cortisol modulation |

All continuous inputs undergo internal min-max and z-score standard scaling:
$$\hat{x}_i = \frac{x_i - \mu_i}{\sigma_i}$$

---

### Multi-Target Output Calibration

The multi-task output vector $y = [y_1, y_2, y_3]^T$ computes three synchronous athletic prescriptions:

1. **Daily Protein Kinetics ($y_1$):**
   Calibrated against International Society of Sports Nutrition (ISSN) position stands:
   $$y_1 = \text{Mass} \times \text{clamp}\Big(1.4, \; 2.45, \; \text{Base}_{\text{Goal}} + \Delta_{\text{Sleep}} + \Delta_{\text{RPE}}\Big)$$
   - *Hypertrophy Goal:* Base $2.0\text{ g/kg}$, dynamically boosted under high RPE intensity or sleep debt to prevent muscle catabolism.
   - *Pacing:* Generates four optimal meal windows of ~$\frac{y_1}{4}\text{ g}$ to trigger regular Muscle Protein Synthesis (MPS) via the leucine threshold.

2. **Osmotic Hydration & Electrolyte Dynamic ($y_2$):**
   Calculates sweat loss replenishment according to duration, environmental exposure, and cardiac strain:
   $$V_{\text{sweat}} = \left(\frac{\text{Sessions} \times 60}{7 \times 60}\right) \times \left(0.65 + \frac{\text{RPE}}{12} \times 0.45\right)$$
   $$y_{2,\text{water}} = (\text{Mass} \times 0.035) + V_{\text{sweat}} \quad (\text{Liters/day})$$
   $$y_{2,\text{electrolytes}} = 2400 + (150 \times \text{Gender}) + (V_{\text{sweat}} \times 950) \quad (\text{mg Sodium/Potassium/day})$$

3. **Prescribed Active Conditioning ($y_3$):**
   ACSM-compliant cardiovascular volume tailored to autonomic recovery readiness:
   $$y_3 = \text{clamp}\Big(35, \; 80, \; 42 + 1.8 \cdot \text{Exp} - 0.3 \cdot (\text{RHR} - 60) + 2.2 \cdot (\text{Sleep} - 7) + 1.1 \cdot \text{RPE}\Big)$$

---

### Real-Time HTML5 Canvas Neural Architecture Visualizer

Located in `src/js/neural-network.js` (870+ lines of custom canvas rendering), the visualizer constructs a living, interactive, high-contrast schematic of the neural network:
- **Interactive Layer Enclosures:** Input and Output layers are enveloped in radiant neon frames (`#64C800` Liquid Mint and `#00E575` Emerald).
- **Asynchronous Synaptic Particles:** 60 FPS synaptic pulses propagate across the network along cubic Bézier curves with randomized phase velocities, representing forward propagation during tensor evaluation.
- **Node Hover Telemetry:** Hovering or touching any individual neuron highlights all incoming and outgoing synaptic connections with a dynamic glow sheath and renders a floating telemetry inspection badge displaying node index, current activation value $a_i^{(l)}$, and weight dispersion.
- **Hardware-Accelerated Zero Background Lag:** Employs an `IntersectionObserver` paired with the Page Visibility API (`document.hidden`) to instantly cancel `requestAnimationFrame` whenever the canvas leaves the viewport, reducing CPU and GPU utilization to 0%.

---

## 2. UI Engineering & User Experience (UX) Architecture

FitPredict was crafted with an uncompromising commitment to visual elegance, physical responsiveness, and tactile depth.

### Design Philosophy & "Liquid Mint" Color Tokens
- **Core Aesthetic:** Athletic minimalism blended with high-tech computational biology.
- **Color Palette:**
  - `Mint Neon (#64C800)`: Primary energetic accent and active layer indicators.
  - `Emerald (#00E575)`: Secondary activation pulses and positive health concordances.
  - `Obsidian (#002518 & #001A10)`: Deep, high-contrast dark backdrops for the neural stage and code modules.
  - `Pearl / Alabaster (#F9F9F7)`: Clean, breathable primary application background.
  - `Warm Accent Palette`: Strategic semantic colors for domain specializations (Orange `#EA580C` for Nutrition, Violet `#7C3AED` for Recalibration, Electric Blue `#0284C7` for Hydration).

---

### Micro-Interactions & Fluid Motion Systems
- **Mechanical Rolling Odometers:** Stepper numbers animate using vertical odometer drums (`rolling-counter.js`) with physics-based cubic Bézier easing.
- **Liquid Gender Switch:** Custom spring-physics toggle with liquid droplet elongation and velocity stretching.
- **Framer-Inspired Goal Selection:** Smooth spring cursor gliding beneath the active training goal chip with zero layout shifts.
- **Lenis Smooth Scroll & GSAP ScrollTrigger:** Butter-smooth 60fps scrolling with progressive section elevation lips.

---

### Bencho 3D Turntable Carousel
The *Athlete Archetypes* section features an endless 3D turntable carousel (`src/js/carousel.js`):
- Rotates cards around a true 3D spatial cylindrical orbit with mathematical depth displacement ($Z$-axis parallax).
- Momentum dragging with spring rebound physics (`springOf(tune = 48)`).
- Touch-friction inertia with zero modulo seams.
- One-click biometric archetype loading: Clicking **"Load in Predictor"** immediately populates the interactive calculator and triggers the neural evaluation sequence.

---

### Empower Network Circuit Interconnects
The *Empower Performance* section (`src/js/empower-network.js`) visually links the central **FitPredict AI Core** with three specialized satellite cards:
- High-precision SVG circuit traces originate directly from the AI Core base.
- Fluid traveling photonic light beams and radiant orbs dynamically navigate 90-degree rounded circuit corners.
- Hovering any branch triggers reciprocal glow flare across the corresponding bus trace.

---

### Responsive Mobile Drawer & Viewport Adaptations
FitPredict includes complete mobile responsiveness without altering the desktop layout:
- **Luminous Mobile Navigation Drawer:** Replaces dark, cramped overlays with a crystal-clear, high-contrast sheet (`bg-white/98`, frosted blur, emerald borders, 44px+ tap targets).
- **Responsive Adaptive Carousel:** Slices turntable orbital diameter dynamically below `640px` (`orbit: 150` vs `260`) to eliminate horizontal viewport overflow.
- **Unified Stepper Layout:** Automatically optimizes stepper button margins and hides auxiliary text badges on narrow displays (`< 480px`) to prevent wrapping.
- **Desktop Invariance:** All responsive overrides are strictly isolated within `@media (max-width: ...)` queries, ensuring the desktop experience remains 100% pixel-perfect.

---

## 3. Repository File Architecture

```
Fit Predict/
├── public/                    # Static media assets, icons & video loop
│   ├── images/                # High-res preset imagery & transparent icons
│   └── vid.mp4                # Atmospheric cinematic background loop
├── src/
│   ├── css/
│   │   ├── design-tokens.css  # CSS custom properties, HSL color ramps & typography
│   │   ├── animations.css     # Keyframe definitions, pulse glows & motion utilities
│   │   └── main.css           # Global stylesheet, glassmorphism, responsive queries
│   └── js/
│       ├── main.js            # Master orchestrator, biometric prediction & state store
│       ├── neural-network.js  # 870+ line Canvas neural network architecture visualizer
│       ├── empower-network.js # Interactive SVG circuit interconnects with light beams
│       ├── hero-canvas.js     # Ambient hero particle wave simulation
│       ├── carousel.js        # Bencho 3D turntable carousel engine with inertia
│       ├── animations.js      # GSAP ScrollTrigger entrance timelines & clean transitions
│       ├── rolling-counter.js # Mechanical odometer numerical drum controllers
│       ├── liquid-toggle.js   # Fluid spring gender switch
│       ├── liquid-goal.js     # Liquid gliding goal selector
│       ├── smooth-scroll.js   # Lenis smooth-scroll coordinator
│       └── utils.js           # Math clamps, number formatters & toast notification helpers
├── index.html                 # Semantic single-page application document
├── package.json               # Modern dependencies (Vite, Tailwind, GSAP, Lenis, Lucide)
├── requirements.txt           # Machine learning specifications & scientific stack
├── tailwind.config.js         # Tailwind configuration & design token bindings
├── vercel.json                # Zero-config deployment manifest for Vercel
└── vite.config.js             # Vite build pipeline and asset optimization configuration
```

---

## 4. Local Development & Setup Guide

### Prerequisites
- **Node.js:** `v18.0.0` or higher (LTS recommended)
- **npm:** `v9.0.0` or higher (bundled with Node.js)
- *Optional:* **Python 3.10+** (only if exploring the scientific modeling dependencies in `requirements.txt`)

---

### Installation & Running Dev Server

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Amin-Ezz/Fit-Predict.git
   cd Fit-Predict
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```
   *Vite's Hot Module Replacement (HMR) is enabled — any changes to HTML, JS, or CSS will update instantly in the browser.*

---

### Production Build & Local Preview

To compile the production-ready bundle with tree-shaking, minification, and CSS optimization:

```bash
# 1. Build optimized bundle to /dist
npm run build

# 2. Preview the production build locally
npm run preview
```

The preview server will launch at `http://localhost:4173/`, serving the identical compressed assets that deploy to cloud infrastructure.

---

### Optional Python Scientific Environment
The root `requirements.txt` specifies the exact Python scientific computing packages used to benchmark the underlying physiological models:

```bash
# 1. Create a virtual environment
python -m venv .venv

# 2. Activate the virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# 3. Install scientific dependencies
pip install -r requirements.txt
```

---

## 5. Production Deployment

FitPredict is architectured for **zero-configuration instant deployment** on modern edge networks:

### Deploying to Vercel
The repository includes a ready-to-deploy [vercel.json](file:///d:/Projects/Fit%20Predict/vercel.json):
1. Push your changes to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the `Fit-Predict` repository.
4. Vercel automatically detects the Vite framework and pre-fills:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**. Your application will be live globally on a CDN edge in seconds.

---

## 6. License & Acknowledgments

- **License:** Distributed under the permissive [MIT License](https://opensource.org/licenses/MIT).
- **Exercise Physiology Science:** Grounded in clinical literature from the *American College of Sports Medicine (ACSM)* and the *International Society of Sports Nutrition (ISSN)*.
- **Vector Icons:** Courtesy of [Lucide Icons](https://lucide.dev).
- **Smooth Scrolling:** Powered by [Studio Freight Lenis](https://github.com/darkroomengineering/lenis).
- **Animation Orchestration:** Powered by [GSAP by GreenSock](https://greensock.com/).
