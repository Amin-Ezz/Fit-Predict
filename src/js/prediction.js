/**
 * FitPredict Prediction Workflow Controller
 * Manages 4-step wizard: Enter Information -> Review Inputs -> Deep Learning Inference -> Results
 */

import { createIcons, icons } from 'lucide';
import { predictionService } from './services/predictionService.js';
import { toPersianDigits, showToast } from './utils.js';

class PredictionWorkflow {
  constructor() {
    this.currentStep = 1;
    this.formData = {};
    this.lastResult = null;
  }

  init() {
    this._bindEvents();
    this.goToStep(1);
  }

  _bindEvents() {
    // Step 1: Next to Step 2
    const btnGotoStep2 = document.getElementById('btn-goto-step-2');
    if (btnGotoStep2) {
      btnGotoStep2.addEventListener('click', () => this.handleStep1Submit());
    }

    // Step 2: Back to Step 1
    const btnBackToStep1 = document.getElementById('btn-back-to-step-1');
    if (btnBackToStep1) {
      btnBackToStep1.addEventListener('click', () => this.goToStep(1));
    }

    // Step 2: Execute Prediction
    const btnRunPrediction = document.getElementById('btn-run-prediction');
    if (btnRunPrediction) {
      btnRunPrediction.addEventListener('click', () => this.handleRunPrediction());
    }

    // Step 4: Restart new prediction
    const btnRestart = document.getElementById('btn-new-prediction-restart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        this.goToStep(1);
      });
    }

    // Step 4: Save result toast
    const btnSaveResult = document.getElementById('btn-save-result');
    if (btnSaveResult) {
      btnSaveResult.addEventListener('click', () => {
        showToast('نتیجه با موفقیت در تاریخچه محلی ذخیره شد.', 'success');
      });
    }
  }

  /**
   * Validates Step 1 inputs
   */
  validateStep1() {
    let isValid = true;
    const form = document.getElementById('prediction-input-form');
    if (!form) return false;

    // Clear previous error messages
    document.querySelectorAll('.form-error').forEach(el => el.classList.add('hidden'));

    const fields = [
      { id: 'input-age', min: 16, max: 75, name: 'age', label: 'سن' },
      { id: 'input-height', min: 140, max: 220, name: 'height_cm', label: 'قد' },
      { id: 'input-weight', min: 40, max: 160, name: 'weight_kg', label: 'وزن' },
      { id: 'input-experience', min: 0.5, max: 30, name: 'training_experience_years', label: 'سابقه تمرین' },
      { id: 'input-sessions', min: 1, max: 7, name: 'weekly_sessions', label: 'جلسات در هفته' },
      { id: 'input-session-minutes', min: 20, max: 180, name: 'avg_session_minutes', label: 'مدت جلسه' },
      { id: 'input-sleep', min: 4, max: 12, name: 'avg_sleep_hours', label: 'میانگین خواب' },
      { id: 'input-rpe', min: 1, max: 10, name: 'rpe_intensity', label: 'شدت RPE' },
      { id: 'input-rhr', min: 40, max: 100, name: 'resting_heart_rate', label: 'ضربان استراحت' },
    ];

    const data = {
      gender: document.getElementById('input-gender')?.value || 'male'
    };

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const errEl = document.getElementById(`error-${f.name}`);
      const val = parseFloat(input?.value);

      if (isNaN(val) || val < f.min || val > f.max) {
        isValid = false;
        if (errEl) {
          errEl.textContent = `لطفاً ${f.label} را در محدوده ${toPersianDigits(f.min)} تا ${toPersianDigits(f.max)} وارد کنید.`;
          errEl.classList.remove('hidden');
        }
        input?.classList.add('border-rose-400');
      } else {
        input?.classList.remove('border-rose-400');
        data[f.name] = val;
      }
    });

    if (isValid) {
      this.formData = data;
    }

    return isValid;
  }

  handleStep1Submit() {
    if (!this.validateStep1()) {
      showToast('لطفاً مقادیر نامعتبر را بررسی و تصحیح فرمایید.', 'error');
      return;
    }
    this.populateReviewStep();
    this.goToStep(2);
  }

  /**
   * Populates Step 2 review summary cards
   */
  populateReviewStep() {
    const container = document.getElementById('review-cards-container');
    if (!container) return;

    const labels = [
      { key: 'age', title: 'سن', unit: 'سال' },
      { key: 'gender', title: 'جنسیت', formatter: (v) => v === 'male' ? 'مرد' : 'زن' },
      { key: 'height_cm', title: 'قد', unit: 'سانتی‌متر' },
      { key: 'weight_kg', title: 'وزن', unit: 'کیلوگرم' },
      { key: 'training_experience_years', title: 'سابقه تمرین', unit: 'سال' },
      { key: 'weekly_sessions', title: 'جلسات در هفته', unit: 'جلسه' },
      { key: 'avg_session_minutes', title: 'مدت هر جلسه', unit: 'دقیقه' },
      { key: 'avg_sleep_hours', title: 'میانگین خواب', unit: 'ساعت' },
      { key: 'rpe_intensity', title: 'شدت RPE', unit: 'از ۱۰' },
      { key: 'resting_heart_rate', title: 'ضربان استراحت', unit: 'BPM' }
    ];

    container.innerHTML = labels.map(item => {
      const rawVal = this.formData[item.key];
      const displayVal = item.formatter ? item.formatter(rawVal) : `${toPersianDigits(rawVal)} ${item.unit || ''}`;
      return `
        <div class="bg-[#151922] p-3.5 rounded-2xl border border-white/10">
          <div class="text-[11px] text-slate-400 mb-1">${item.title}</div>
          <div class="text-sm font-bold text-white">${displayVal}</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Executes prediction via predictionService
   */
  async handleRunPrediction() {
    this.goToStep(3);

    try {
      const result = await predictionService.predict(this.formData);
      this.lastResult = result;
      this.displayResults(result);
      this.goToStep(4);
      showToast('تحلیل هوشمند با موفقیت تکمیل گردید.', 'success');
      
      // Dispatch custom event to notify overview & history tabs
      window.dispatchEvent(new CustomEvent('fitpredict:new-prediction', { detail: result }));
    } catch (err) {
      console.error('Prediction failed:', err);
      showToast(err.message || 'خطایی در استنتاج مدل رخ داد.', 'error');
      this.goToStep(2);
    }
  }

  /**
   * Renders Step 4 Result View
   * @param {Object} res 
   */
  displayResults(res) {
    const vo2El = document.getElementById('result-vo2max-val');
    const tierBadge = document.getElementById('result-tier-badge');
    const tierDesc = document.getElementById('result-tier-desc');
    const readinessEl = document.getElementById('result-readiness-val');
    const readinessBadge = document.getElementById('result-readiness-badge');
    const acwrEl = document.getElementById('result-acwr-val');
    const acwrBadge = document.getElementById('result-acwr-badge');
    const limitingList = document.getElementById('result-limiting-factors');
    const recsList = document.getElementById('result-recommendations');
    const demoFlag = document.getElementById('result-demo-flag');

    if (vo2El) vo2El.textContent = toPersianDigits(res.target.value);
    if (tierBadge) tierBadge.textContent = res.target.tier;
    if (tierDesc) tierDesc.textContent = res.target.tier_description;

    if (readinessEl) readinessEl.textContent = toPersianDigits(res.readiness_index.score);
    if (readinessBadge) readinessBadge.textContent = res.readiness_index.label;

    if (acwrEl) acwrEl.textContent = toPersianDigits(res.workload.acwr);
    if (acwrBadge) acwrBadge.textContent = res.workload.status;

    if (demoFlag) {
      if (res.is_demo) {
        demoFlag.classList.remove('hidden');
        demoFlag.textContent = 'حالت شبیه‌سازی Demo';
      } else {
        demoFlag.classList.remove('badge-demo');
        demoFlag.classList.add('badge-green');
        demoFlag.textContent = 'استنتاج زنده سرور جنگو';
      }
    }

    if (limitingList && res.limiting_factors) {
      limitingList.innerHTML = res.limiting_factors.map(f => `
        <li class="flex items-start gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
          <span>${f}</span>
        </li>
      `).join('');
    }

    if (recsList && res.recommendations) {
      recsList.innerHTML = res.recommendations.map(r => `
        <li class="flex items-start gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-brand-green mt-1.5 shrink-0"></span>
          <span>${r}</span>
        </li>
      `).join('');
    }

    createIcons({ icons });
  }

  /**
   * Switches wizard step UI
   * @param {number} stepNumber 
   */
  goToStep(stepNumber) {
    this.currentStep = stepNumber;

    // Toggle step containers
    for (let i = 1; i <= 4; i++) {
      const container = document.getElementById(`prediction-step-${i}`);
      const circle = document.getElementById(`step-circle-${i}`);

      if (container) {
        if (i === stepNumber) {
          container.classList.remove('hidden');
        } else {
          container.classList.add('hidden');
        }
      }

      if (circle) {
        circle.classList.remove('active', 'completed', 'pending');
        if (i < stepNumber) {
          circle.classList.add('completed');
          circle.textContent = '✓';
        } else if (i === stepNumber) {
          circle.classList.add('active');
          circle.textContent = toPersianDigits(i);
        } else {
          circle.classList.add('pending');
          circle.textContent = toPersianDigits(i);
        }
      }
    }

    createIcons({ icons });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export const predictionWorkflow = new PredictionWorkflow();
