/**
 * FitPredict Charts Module
 * Renders Chart.js interactive visualizations with Vazirmatn Persian typography & Clean Athletic Light Styling
 */

import { Chart, registerables } from 'chart.js';
import { toPersianDigits } from './utils.js';

Chart.register(...registerables);

// Configure Chart.js global defaults for Persian RTL and Clean White theme
Chart.defaults.font.family = "'Vazirmatn', sans-serif";
Chart.defaults.color = '#475569';
Chart.defaults.borderColor = '#E2E8F0';

const activeCharts = new Map();

/**
 * Safely destroys an existing chart instance
 * @param {string} id 
 */
export function destroyChart(id) {
  if (activeCharts.has(id)) {
    activeCharts.get(id).destroy();
    activeCharts.delete(id);
  }
}

/**
 * Renders the weekly activity bar chart
 * @param {HTMLCanvasElement|string} target 
 * @param {Array} data 
 */
export function renderWeeklyActivityChart(target, data) {
  const canvas = typeof target === 'string' ? document.getElementById(target) : target;
  if (!canvas) return null;

  destroyChart('weeklyActivity');

  const labels = data.map(d => d.day);
  const values = data.map(d => d.minutes);
  const backgroundColors = data.map(d => 
    d.minutes >= 60 ? '#EE2737' : d.minutes > 0 ? '#1D4ED8' : '#E2E8F0'
  );

  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'مدت تمرین (دقیقه)',
        data: values,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: '#C81E2B',
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 24,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          rtl: true,
          textDirection: 'rtl',
          titleFont: { family: "'Vazirmatn', sans-serif", weight: 'bold' },
          bodyFont: { family: "'Vazirmatn', sans-serif" },
          padding: 12,
          backgroundColor: '#0F172A',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          cornerRadius: 10,
          callbacks: {
            label: (context) => `مدت: ${toPersianDigits(context.raw)} دقیقه`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          position: 'right',
          grid: { color: '#F1F5F9' },
          ticks: {
            callback: (val) => toPersianDigits(val) + ' د',
            color: '#64748B',
            font: { family: "'Vazirmatn', sans-serif", size: 11 }
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: '#475569',
            font: { family: "'Vazirmatn', sans-serif", size: 12, weight: '600' }
          }
        }
      }
    }
  });

  activeCharts.set('weeklyActivity', chart);
  return chart;
}

/**
 * Renders the longitudinal performance trend chart
 * @param {HTMLCanvasElement|string} target 
 * @param {Object} trendData 
 */
export function renderPerformanceTrendChart(target, trendData) {
  const canvas = typeof target === 'string' ? document.getElementById(target) : target;
  if (!canvas) return null;

  destroyChart('performanceTrend');

  const ctx = canvas.getContext('2d');

  // Gradient fill for VO2max line with athletic red
  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, 'rgba(238, 39, 55, 0.16)');
  gradient.addColorStop(1, 'rgba(238, 39, 55, 0.00)');

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trendData.labels,
      datasets: [
        {
          label: 'برآورد VO₂max (mL/kg/min)',
          data: trendData.vo2max_values,
          borderColor: '#EE2737',
          backgroundColor: gradient,
          fill: true,
          tension: 0.38,
          borderWidth: 3,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#EE2737',
          pointBorderWidth: 2.5,
          pointRadius: 4.5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#EE2737',
          yAxisID: 'y',
        },
        {
          label: 'شاخص آمادگی (۰-۱۰۰)',
          data: trendData.readiness_values,
          borderColor: '#1D4ED8',
          borderDash: [5, 4],
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#1D4ED8',
          pointBorderWidth: 2,
          pointRadius: 3.5,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#1D4ED8',
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          rtl: true,
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            color: '#0F172A',
            font: { family: "'Vazirmatn', sans-serif", size: 12, weight: '700' }
          }
        },
        tooltip: {
          rtl: true,
          textDirection: 'rtl',
          titleFont: { family: "'Vazirmatn', sans-serif", weight: 'bold' },
          bodyFont: { family: "'Vazirmatn', sans-serif" },
          padding: 12,
          backgroundColor: '#0F172A',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => {
              const val = toPersianDigits(ctx.raw);
              return ctx.datasetIndex === 0 
                ? `VO₂max: ${val} mL/kg/min`
                : `شاخص آمادگی: ${val}٪`;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { color: '#F1F5F9' },
          ticks: {
            callback: (v) => toPersianDigits(v),
            color: '#64748B',
            font: { family: "'Vazirmatn', sans-serif", size: 11 }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { drawOnChartArea: false },
          ticks: {
            callback: (v) => toPersianDigits(v) + '٪',
            color: '#1D4ED8',
            font: { family: "'Vazirmatn', sans-serif", size: 11 }
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: '#475569',
            font: { family: "'Vazirmatn', sans-serif", size: 12, weight: '600' }
          }
        }
      }
    }
  });

  activeCharts.set('performanceTrend', chart);
  return chart;
}

/**
 * Renders radar chart for physiological balance
 * @param {HTMLCanvasElement|string} target 
 * @param {Object} metrics 
 */
export function renderPhysiologicalRadarChart(target, metrics = [85, 78, 90, 70, 82]) {
  const canvas = typeof target === 'string' ? document.getElementById(target) : target;
  if (!canvas) return null;

  destroyChart('physioRadar');

  const ctx = canvas.getContext('2d');
  const chart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['ظرفیت هوازی', 'ثبات تمرینی', 'کیفیت ریکاوری', 'حجم هفتگی', 'تغذیه و خواب'],
      datasets: [{
        label: 'امتیاز شاخص',
        data: metrics,
        backgroundColor: 'rgba(29, 78, 216, 0.15)',
        borderColor: '#1D4ED8',
        pointBackgroundColor: '#EE2737',
        pointBorderColor: '#FFFFFF',
        pointHoverRadius: 6,
        borderWidth: 2.5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          rtl: true,
          textDirection: 'rtl',
          backgroundColor: '#0F172A',
          borderColor: '#E2E8F0',
          borderWidth: 1,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => `امتیاز: ${toPersianDigits(ctx.raw)} از ۱۰۰`
          }
        }
      },
      scales: {
        r: {
          angleLines: { color: '#E2E8F0' },
          grid: { color: '#E2E8F0' },
          suggestedMin: 40,
          suggestedMax: 100,
          pointLabels: {
            font: { family: "'Vazirmatn', sans-serif", size: 11, weight: '700' },
            color: '#0F172A'
          },
          ticks: {
            display: false,
            stepSize: 20
          }
        }
      }
    }
  });

  activeCharts.set('physioRadar', chart);
  return chart;
}
