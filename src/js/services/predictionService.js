/**
 * FitPredict Prediction Service
 * Connects to Django REST Framework backend or runs explicit Demo Mode fallback
 */

import { apiRequest } from './api.js';
import { storage } from '../utils.js';

const DEMO_MODE_FLAG = import.meta.env.VITE_USE_DEMO_MODE === 'true';

export class PredictionService {
  constructor() {
    this.isDemoMode = DEMO_MODE_FLAG;
  }

  /**
   * Checks if demo mode is currently forced or active
   * @returns {boolean}
   */
  getDemoMode() {
    return this.isDemoMode;
  }

  /**
   * Toggles demo mode
   * @param {boolean} val 
   */
  setDemoMode(val) {
    this.isDemoMode = Boolean(val);
  }

  /**
   * Submits features to prediction backend
   * @param {Object} features 
   * @returns {Promise<Object>}
   */
  async predict(features) {
    // If demo mode is active, return labeled sample data
    if (this.isDemoMode) {
      return this._generateSimulatedDemoResult(features);
    }

    try {
      const response = await apiRequest('predict/', {
        method: 'POST',
        body: JSON.stringify({ features })
      });

      // Genuine backend response
      return {
        ...response,
        is_demo: false
      };
    } catch (err) {
      console.warn('Real API call failed, offering demo fallback:', err);
      throw err;
    }
  }

  /**
   * Generates a realistic, scientific exercise-physiology proxy result
   * Clearly marked as is_demo: true
   * @private
   */
  async _generateSimulatedDemoResult(features) {
    // Artificial latency to simulate neural-net inference
    await new Promise(resolve => setTimeout(resolve, 950));

    const age = Number(features.age) || 28;
    const gender = features.gender || 'male';
    const height = Number(features.height_cm) || 178;
    const weight = Number(features.weight_kg) || 75;
    const expYears = Number(features.training_experience_years) || 3;
    const weeklySessions = Number(features.weekly_sessions) || 4;
    const sessionMins = Number(features.avg_session_minutes) || 60;
    const sleep = Number(features.avg_sleep_hours) || 7.5;
    const rpe = Number(features.rpe_intensity) || 7;
    const rhr = Number(features.resting_heart_rate) || 62;

    // 1. Daily Protein Calculation (ISSN guidelines: 1.4 - 2.4 g/kg)
    const proteinMultiplier = Math.min(2.4, Math.max(1.4, 1.45 + (0.08 * (rpe - 4)) + (0.05 * (weeklySessions - 3)) + (sleep < 7.0 ? 0.08 : 0)));
    const proteinGrams = Math.round(weight * proteinMultiplier * 10) / 10;
    const proteinPerKg = Math.round((proteinGrams / weight) * 100) / 100;
    const perMealGrams = Math.round((proteinGrams / 4) * 10) / 10;

    // 2. Daily Water & Electrolytes Calculation
    const dailyWorkoutFraction = (weeklySessions * sessionMins) / (7 * 60);
    const sweatLossDaily = dailyWorkoutFraction * (0.65 + (rpe / 12) * 0.45);
    const baselineWater = weight * 0.035;
    const waterLiters = Math.round((baselineWater + sweatLossDaily) * 100) / 100;
    const electrolytesMg = Math.round(2400 + (gender === 'male' ? 150 : 0) + (sweatLossDaily * 950));

    // 3. Daily Recommended Physical Activity (Minutes/day)
    const baseActivity = Math.round(42 + (expYears * 1.8) - ((rhr - 60) * 0.3) + ((sleep - 7) * 2.2) + (rpe * 1.1));
    const dailyActivityMins = Math.min(85, Math.max(30, baseActivity));
    const weeklyActivityHours = Math.round((dailyActivityMins * 7 / 60) * 10) / 10;

    const result = {
      is_demo: true,
      prediction_id: 'demo_' + Date.now().toString(36),
      created_at: new Date().toISOString(),
      protein: {
        name: 'نیاز روزانه به پروتئین',
        daily_grams: proteinGrams,
        g_per_kg: proteinPerKg,
        per_meal_recommendation: `${perMealGrams} گرم در هر وعده (۴ وعده)`,
        tier: 'بهینه برای ترمیم و رشد عضلانی',
        description: `توصیه مصرف روزانه ${proteinGrams} گرم پروتئین (${proteinPerKg} گرم به ازای هر کیلوگرم) متناسب با فشار تمرینی و سنتز پروتئین عضلانی (MPS).`
      },
      hydration: {
        name: 'نیاز روزانه به آب و الکترولیت',
        water_liters: waterLiters,
        electrolytes_mg: electrolytesMg,
        tier: 'توازن هیدراتاسیون و اسمولاریته سلولی',
        description: `نوشیدن ${waterLiters} لیتر مایعات خالص روزانه همراه با ${electrolytesMg.toLocaleString('fa-IR')} میلی‌گرم الکترولیت جهت پیشگیری از گرفتگی عضلات.`
      },
      activity: {
        name: 'میزان فعالیت ورزشی روزانه پیشنهادی',
        daily_minutes: dailyActivityMins,
        weekly_hours: weeklyActivityHours,
        workout_focus: 'ترکیب تمرین مقاومتی با وهله‌های هوازی Zone 2',
        description: `اختصاص روزانه ${dailyActivityMins} دقیقه فعالیت بدنی هدفمند (مجموعاً ${weeklyActivityHours} ساعت در هفته) برای دستیابی به سازگاری قلبی و عضلانی بهینه.`
      },
      inputs_summary: {
        age,
        gender: gender === 'male' ? 'مرد' : 'زن',
        height_cm: height,
        weight_kg: weight,
        weekly_sessions: weeklySessions,
        avg_session_minutes: sessionMins,
        avg_sleep_hours: sleep,
        rpe_intensity: rpe,
        resting_heart_rate: rhr,
        training_experience_years: expYears
      },
      model_metadata: {
        model_name: 'FitPredict Multi-Target Neural Net',
        version: 'v2.0.0-multi-target-mlp',
        algorithm: 'Multi-Output MLPRegressor (128-64-32 Dense + Target Scaling)',
        evaluation_metrics: {
          overall_r2: 0.883,
          protein_r2: 0.975,
          water_r2: 0.899,
          electrolytes_r2: 0.941,
          activity_r2: 0.719
        },
        notice: 'توجه: این نتیجه در حالت نمایشی (Demo Mode) از محاسبات بیومتریک شبیه‌سازی شده است.'
      }
    };

    // Save to local storage history
    this.saveToHistory(result);

    return result;
  }

  /**
   * Retrieves prediction history
   * @returns {Array}
   */
  getHistory() {
    return storage.get('prediction_history', this._getInitialSampleHistory());
  }

  /**
   * Saves a prediction to the history store
   * @param {Object} item 
   */
  saveToHistory(item) {
    const history = this.getHistory();
    history.unshift(item);
    // keep maximum 20 items
    if (history.length > 20) history.pop();
    storage.set('prediction_history', history);
  }

  /**
   * Default sample history for initial view
   * @private
   */
  _getInitialSampleHistory() {
    return [
      {
        prediction_id: 'sample_01',
        is_demo: true,
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        target: {
          name: 'برآورد حداکثر اکسیژن مصرفی (VO₂max)',
          unit: 'mL/kg/min',
          value: 48.2,
          tier: 'بسیار خوب (Above Average)',
          tier_description: 'ظرفیت عملکردی مناسب و آمادگی بالای هوازی'
        },
        readiness_index: { score: 84, label: 'آماده برای جلسه سنگین' },
        workload: { acwr: 1.08, status: 'دامنه ایمن سازگاری' },
        inputs_summary: {
          age: 27,
          gender: 'مرد',
          height_cm: 180,
          weight_kg: 76,
          weekly_sessions: 4,
          avg_session_minutes: 65,
          avg_sleep_hours: 7.8,
          rpe_intensity: 7,
          resting_heart_rate: 58,
          training_experience_years: 4
        },
        model_metadata: {
          version: 'v1.2.4-mlp-cardio',
          notice: 'داده نمونه از پیش‌ذخیره شده جهت بررسی ساختار پنل'
        }
      },
      {
        prediction_id: 'sample_02',
        is_demo: true,
        created_at: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
        target: {
          name: 'برآورد حداکثر اکسیژن مصرفی (VO₂max)',
          unit: 'mL/kg/min',
          value: 46.8,
          tier: 'بسیار خوب (Above Average)',
          tier_description: 'روند صعودی مطلوب پس از دوره بازتوانی'
        },
        readiness_index: { score: 76, label: 'آمادگی مطلوب' },
        workload: { acwr: 0.98, status: 'دامنه ایمن سازگاری' },
        inputs_summary: {
          age: 27,
          gender: 'مرد',
          height_cm: 180,
          weight_kg: 77,
          weekly_sessions: 3,
          avg_session_minutes: 55,
          avg_sleep_hours: 7.2,
          rpe_intensity: 6,
          resting_heart_rate: 61,
          training_experience_years: 4
        },
        model_metadata: {
          version: 'v1.2.3-mlp-cardio',
          notice: 'داده نمونه از پیش‌ذخیره شده'
        }
      }
    ];
  }
}

export const predictionService = new PredictionService();
