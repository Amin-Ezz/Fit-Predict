/**
 * FitPredict Utility Functions
 * Persian localization, number formatting, notifications, and form validation
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts standard Latin digits to Persian digits
 * @param {string|number} input 
 * @returns {string}
 */
export function toPersianDigits(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[parseInt(digit, 10)]);
}

/**
 * Formats a number with Persian locale and optional decimal places
 * @param {number} num 
 * @param {number} [decimals=0] 
 * @returns {string}
 */
export function formatPersianNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  const fixed = Number(num).toFixed(decimals);
  return toPersianDigits(fixed);
}

/**
 * Formats a Date object or timestamp into Persian Solar Hijri date string
 * @param {Date|string|number} date 
 * @returns {string}
 */
export function formatPersianDate(date) {
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(d);
  } catch (err) {
    return String(date);
  }
}

/**
 * Formats time with Persian numbers
 * @param {Date|string|number} date 
 * @returns {string}
 */
export function formatPersianTime(date) {
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (err) {
    return '';
  }
}

/**
 * Displays a non-intrusive toast notification
 * @param {string} message 
 * @param {'success'|'error'|'info'} [type='info'] 
 * @param {number} [duration=4000] 
 */
export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('fit-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'fit-toast-container';
    container.className = 'fixed bottom-5 start-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const typeStyles = {
    success: 'bg-brand-green text-white border-brand-green-dark shadow-glow-green',
    error: 'bg-rose-600 text-white border-rose-700 shadow-lg',
    info: 'bg-white text-brand-text border-brand-border shadow-card'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 transform translate-y-4 opacity-0 ${typeStyles[type] || typeStyles.info}`;
  toast.innerHTML = `
    <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${type === 'info' ? 'bg-brand-bg-subtle text-brand-green' : 'bg-white/20 text-white'}">
      ${icons[type] || '•'}
    </span>
    <span class="flex-1 leading-snug">${message}</span>
  `;

  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * LocalStorage wrapper with safe JSON serialization
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`fitpredict_${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`fitpredict_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(`fitpredict_${key}`);
    } catch (e) {
      console.warn('LocalStorage remove failed:', e);
    }
  }
};
